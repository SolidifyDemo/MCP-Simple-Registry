/**
 * Registry Fetcher
 * Dynamically fetches package information from npm and Docker Hub
 */

export interface RegistryPackageInfo {
  version: string;
  publishedAt: string;
  description?: string;
  homepage?: string;
  license?: string;
  repository?: string;
  downloads?: number;
  stars?: number;
  logoUrl?: string;
}

export interface RegistryRepoInfo {
  description?: string;
  homepage?: string;
  stars?: number;
  license?: string;
  ownerAvatarUrl?: string;
  updatedAt?: string;
}

export interface NpmPackageInfo extends RegistryPackageInfo {
  name: string;
  versions: string[];
  distTags: Record<string, string>;
}

export interface DockerImageInfo extends RegistryPackageInfo {
  image: string;
  tags: string[];
  pulls: number;
}

/**
 * Fetch package information from npm registry
 */
export async function fetchNpmPackage(packageName: string): Promise<NpmPackageInfo | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`NPM package not found: ${packageName}`);
      } else {
        console.error(`Failed to fetch npm package ${packageName}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    const latestVersion = data['dist-tags']?.latest || Object.keys(data.versions || {}).pop();
    const latestVersionData = data.versions?.[latestVersion];

    return {
      name: data.name,
      version: latestVersion,
      versions: Object.keys(data.versions || {}),
      distTags: data['dist-tags'] || {},
      publishedAt: data.time?.[latestVersion] || data.time?.created,
      description: data.description,
      homepage: data.homepage || latestVersionData?.homepage,
      license: data.license || latestVersionData?.license,
      repository: data.repository?.url || latestVersionData?.repository?.url,
      downloads: 0, // Would need to call npm download stats API separately
      stars: 0 // npm doesn't provide stars directly
    };
  } catch (error) {
    console.error(`Error fetching npm package ${packageName}:`, error);
    return null;
  }
}

/**
 * Fetch npm download stats (separate API)
 */
export async function fetchNpmDownloads(packageName: string, period: string = 'last-month'): Promise<number> {
  try {
    const response = await fetch(`https://api.npmjs.org/downloads/point/${period}/${packageName}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.downloads || 0;
  } catch (error) {
    console.error(`Error fetching npm downloads for ${packageName}:`, error);
    return 0;
  }
}

/**
 * Fetch image information from GitHub Container Registry
 * GHCR requires authentication, so we try GitHub Releases as fallback
 */
export async function fetchGHCRImage(imageName: string, sourceUrl?: string): Promise<DockerImageInfo | null> {
  try {
    // Extract tag from image name if provided (e.g., "ghcr.io/org/image:v1.0.0")
    const [, explicitTag] = imageName.split(':');
    
    // Try to get version info from GitHub releases if we have a source URL
    if (sourceUrl) {
      const repoMatch = sourceUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (repoMatch) {
        const [, owner, repo] = repoMatch;
        const releaseInfo = await fetchGitHubLatestRelease(owner, repo.replace(/\.git$/, ''));
        
        if (releaseInfo) {
          return {
            image: imageName,
            version: releaseInfo.version,
            tags: [releaseInfo.version, 'latest'],
            publishedAt: releaseInfo.publishedAt,
            description: releaseInfo.description,
            pulls: 0,
            stars: 0
          };
        }
      }
    }
    
    // Fallback: only use explicit tag or "latest"
    return {
      image: imageName,
      version: explicitTag || 'latest',
      tags: explicitTag ? [explicitTag, 'latest'] : ['latest'],
      publishedAt: '',
      description: '',
      pulls: 0,
      stars: 0
    };
  } catch (error) {
    console.error(`Error processing GHCR image ${imageName}:`, error);
    return null;
  }
}

/**
 * Fetch latest release information from GitHub
 */
async function fetchGitHubLatestRelease(owner: string, repo: string): Promise<{ version: string; publishedAt: string; description: string } | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'MCP-Registry'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      version: data.tag_name?.replace(/^v/, '') || 'latest',
      publishedAt: data.published_at || '',
      description: data.body || ''
    };
  } catch (error) {
    console.warn(`Could not fetch GitHub release for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch image information from Docker Hub
 */
export async function fetchDockerImage(imageName: string, sourceUrl?: string): Promise<DockerImageInfo | null> {
  try {
    // Check if it's a GHCR image
    if (imageName.startsWith('ghcr.io/')) {
      return fetchGHCRImage(imageName, sourceUrl);
    }

    // Remove tag if present (e.g., "nginx:latest" -> "nginx")
    const imageNameWithoutTag = imageName.split(':')[0];
    
    // Docker Hub API format: namespace/repository
    // If no namespace provided, default to 'library' (official images)
    const [namespace, repository] = imageNameWithoutTag.includes('/') 
      ? imageNameWithoutTag.split('/')
      : ['library', imageNameWithoutTag];

    const response = await fetch(`https://hub.docker.com/v2/repositories/${namespace}/${repository}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Docker image not found: ${imageName} (${namespace}/${repository})`);
      } else {
        console.error(`Failed to fetch Docker image ${imageName}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    // Fetch tags
    const tagsResponse = await fetch(`https://hub.docker.com/v2/repositories/${namespace}/${repository}/tags?page_size=100`, {
      next: { revalidate: 3600 }
    });

    let tags: string[] = [];
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json();
      tags = tagsData.results?.map((tag: { name: string }) => tag.name) || [];
    }

    return {
      image: imageName,
      version: tags.find(t => t === 'latest') || tags[0] || '1.0.0',
      tags,
      publishedAt: data.last_updated,
      description: data.description,
      homepage: data.full_description,
      pulls: data.pull_count || 0,
      stars: data.star_count || 0
    };
  } catch (error) {
    console.error(`Error fetching Docker image ${imageName}:`, error);
    return null;
  }
}

/**
 * Fetch comprehensive GitHub repository information
 */
export async function fetchGitHubRepoInfo(repoUrl: string): Promise<RegistryRepoInfo | null> {
  try {
    // Extract owner/repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return null;
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '').split('#')[0].split('?')[0];

    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Add GitHub token if available in environment
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      console.warn(`GitHub repo not found: ${repoUrl}`);
      return null;
    }

    const data = await response.json();
    return {
      description: data.description || undefined,
      homepage: data.homepage || undefined,
      stars: data.stargazers_count || 0,
      license: data.license?.spdx_id || undefined,
      ownerAvatarUrl: data.owner?.avatar_url || undefined,
      updatedAt: data.updated_at || undefined
    };
  } catch (error) {
    console.error(`Error fetching GitHub repo info for ${repoUrl}:`, error);
    return null;
  }
}

/**
 * Fetch GitHub repository stars (for additional metrics)
 */
export async function fetchGitHubStars(repoUrl: string): Promise<number> {
  try {
    const repoInfo = await fetchGitHubRepoInfo(repoUrl);
    return repoInfo?.stars || 0;
  } catch (error) {
    console.error(`Error fetching GitHub stars for ${repoUrl}:`, error);
    return 0;
  }
}

/**
 * Get package info based on runtime type
 */
export async function getPackageInfo(runtime: { type?: string; command?: string; args?: string[]; image?: string }, sourceUrl?: string): Promise<Partial<RegistryPackageInfo>> {
  if (!runtime) {
    return {};
  }

  let packageInfo: Partial<RegistryPackageInfo> = {};

  // NPM packages
  if ((runtime.type === 'node' || runtime.type === 'npx') && runtime.command === 'npx' && runtime.args && runtime.args.length > 0) {
    // Package name is typically at args[0] for npx, or args[1] if there are flags
    const packageName = runtime.args.find(arg => !arg.startsWith('-')) || runtime.args[0];
    const npmInfo = await fetchNpmPackage(packageName);
    if (npmInfo) {
      const downloads = await fetchNpmDownloads(packageName);
      packageInfo = {
        version: npmInfo.version,
        publishedAt: npmInfo.publishedAt,
        description: npmInfo.description,
        homepage: npmInfo.homepage,
        license: npmInfo.license,
        repository: npmInfo.repository,
        downloads
      };
    }
  }

  // Docker images
  if (runtime.type === 'docker' && runtime.image) {
    const dockerInfo = await fetchDockerImage(runtime.image, sourceUrl);
    if (dockerInfo) {
      packageInfo = {
        version: dockerInfo.version,
        publishedAt: dockerInfo.publishedAt,
        description: dockerInfo.description,
        downloads: dockerInfo.pulls,
        stars: dockerInfo.stars
      };
    }
  }

  // If sourceUrl is a GitHub repo, fetch additional info from GitHub
  // This can provide description and owner avatar when package registry doesn't have it
  if (sourceUrl && sourceUrl.includes('github.com')) {
    const githubInfo = await fetchGitHubRepoInfo(sourceUrl);
    if (githubInfo) {
      // Only use GitHub data if not already set by package registry
      if (!packageInfo.description && githubInfo.description) {
        packageInfo.description = githubInfo.description;
      }
      if (!packageInfo.homepage && githubInfo.homepage) {
        packageInfo.homepage = githubInfo.homepage;
      }
      if (!packageInfo.license && githubInfo.license) {
        packageInfo.license = githubInfo.license;
      }
      if (!packageInfo.stars && githubInfo.stars) {
        packageInfo.stars = githubInfo.stars;
      }
      // Add owner avatar as potential logo
      if (githubInfo.ownerAvatarUrl) {
        packageInfo.logoUrl = githubInfo.ownerAvatarUrl;
      }
    }
  }

  return packageInfo;
}
