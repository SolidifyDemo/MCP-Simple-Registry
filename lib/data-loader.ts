import { promises as fs } from 'fs';
import path from 'path';
import { Server, MCPServerEntry, MCPServerSchema, MCPServersResponse, Package } from './types';
import { getPackageInfo } from './registry-fetcher';

let cachedServers: Server[] | null = null;
let lastCacheTime: number = 0;

/**
 * Load servers from individual JSON files in data/servers/ directory
 * Results are cached for performance
 * Optionally enriches data from registries
 */
export async function loadServers(enrichFromRegistry: boolean = process.env.ENABLE_REGISTRY_FETCHING !== 'false'): Promise<Server[]> {
  const now = Date.now();
  const cacheDuration = parseInt(process.env.CACHE_DURATION || '3600000');
  
  // Return cached servers if cache is still valid
  if (cachedServers !== null && (now - lastCacheTime) < cacheDuration) {
    return cachedServers;
  }

  try {
    const serversDir = path.join(process.cwd(), 'data', 'servers');
    
    // Read all JSON files from the servers directory (excluding .schema.json)
    const files = await fs.readdir(serversDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !file.endsWith('.schema.json'));
    
    // Load each server file
    const servers: Server[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(serversDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const server = JSON.parse(fileContent);
      
      // Ensure versions array exists, if not create a default entry
      if (!server.versions || server.versions.length === 0) {
        server.versions = [{
          version: 'latest',
          releaseDate: server.publishedAt || new Date().toISOString(),
          runtime: server.runtime || { type: 'unknown' }
        }];
      }
      
      // Enrich with live registry data if enabled
      if (enrichFromRegistry && server.versions?.length > 0) {
        try {
          const latestVersion = server.versions[0];
          const registryInfo = await getPackageInfo(latestVersion.runtime, server.metadata?.sourceUrl);
          
          // Update version info if available from registry
          if (registryInfo.version) {
            latestVersion.version = registryInfo.version;
          }
          if (registryInfo.publishedAt) {
            latestVersion.releaseDate = registryInfo.publishedAt;
          }
          
          // Update server metadata if available
          if (registryInfo.description && !server.metadata.description) {
            server.metadata.description = registryInfo.description;
          }
          if (registryInfo.homepage && !server.metadata.homepage) {
            server.metadata.homepage = registryInfo.homepage;
          }
          if (registryInfo.license && !server.metadata.license) {
            server.metadata.license = registryInfo.license;
          }
          if (registryInfo.repository && !server.metadata.sourceUrl) {
            server.metadata.sourceUrl = registryInfo.repository;
          }
          // Use GitHub owner avatar as logoUrl if not manually set
          if (registryInfo.logoUrl && !server.metadata.logoUrl) {
            server.metadata.logoUrl = registryInfo.logoUrl;
          }
          
          // Update stats
          if (!server.stats) {
            server.stats = {};
          }
          if (registryInfo.downloads !== undefined) {
            server.stats.downloads = registryInfo.downloads;
          }
          if (registryInfo.stars !== undefined) {
            server.stats.stars = registryInfo.stars;
          }
          
          // Update the updatedAt timestamp
          server.updatedAt = new Date().toISOString();
        } catch (error) {
          // Log but don't fail - use static data as fallback
          console.warn(`Failed to enrich server ${server.id} from registry:`, error instanceof Error ? error.message : error);
        }
      }
      
      servers.push(server);
    }
    
    cachedServers = servers;
    lastCacheTime = now;
    return servers;
  } catch (error) {
    console.error('Error loading servers:', error);
    throw new Error('Failed to load server data');
  }
}

/**
 * Clear the cache (useful for testing or hot reloading)
 */
export function clearCache(): void {
  cachedServers = null;
  lastCacheTime = 0;
}

/**
 * Get a single server by ID
 */
export async function getServerById(id: string): Promise<Server | null> {
  const servers = await loadServers();
  return servers.find(server => server.id === id) || null;
}

/**
 * Search and filter servers
 */
export interface ServerFilter {
  query?: string;
  tags?: string[];
  vendorId?: string;
  featured?: boolean;
  verified?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'downloads' | 'stars' | 'publishedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedServers {
  servers: Server[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function searchServers(filter: ServerFilter = {}): Promise<PaginatedServers> {
  let servers = await loadServers();

  // Apply filters
  if (filter.query) {
    const query = filter.query.toLowerCase();
    servers = servers.filter(server => 
      server.metadata?.name?.toLowerCase().includes(query) ||
      server.metadata?.description?.toLowerCase().includes(query) ||
      server.slug.toLowerCase().includes(query) ||
      server.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (filter.tags && filter.tags.length > 0) {
    servers = servers.filter(server =>
      filter.tags!.some(tag => 
        server.metadata?.tags?.includes(tag)
      )
    );
  }

  if (filter.vendorId) {
    servers = servers.filter(server => server.vendorId === filter.vendorId);
  }

  if (filter.featured !== undefined) {
    servers = servers.filter(server => server.featured === filter.featured);
  }

  if (filter.verified !== undefined) {
    servers = servers.filter(server => server.verified === filter.verified);
  }

  // Sorting
  const sortBy = filter.sortBy || 'updatedAt';
  const sortOrder = filter.sortOrder || 'desc';
  
  servers.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case 'name':
        aVal = a.metadata.name.toLowerCase();
        bVal = b.metadata.name.toLowerCase();
        break;
      case 'downloads':
        aVal = a.stats?.downloads || 0;
        bVal = b.stats?.downloads || 0;
        break;
      case 'stars':
        aVal = a.stats?.stars || 0;
        bVal = b.stats?.stars || 0;
        break;
      case 'publishedAt':
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
        break;
      case 'updatedAt':
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
      default:
        aVal = a.updatedAt;
        bVal = b.updatedAt;
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Pagination
  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize || 20));
  const totalItems = servers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedServers = servers.slice(startIndex, endIndex);

  return {
    servers: paginatedServers,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
}

/**
 * Get all unique tags from servers
 */
export async function getAllTags(): Promise<string[]> {
  const servers = await loadServers();
  const tagsSet = new Set<string>();
  
  servers.forEach(server => {
    server.metadata?.tags?.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
}

/**
 * Get all unique vendor IDs
 */
export async function getAllVendors(): Promise<string[]> {
  const servers = await loadServers();
  const vendorsSet = new Set<string>();
  
  servers.forEach(server => {
    vendorsSet.add(server.vendorId);
  });
  
  return Array.from(vendorsSet).sort();
}

/**
 * Get server statistics
 */
export async function getRegistryStats() {
  const servers = await loadServers();
  
  const totalDownloads = servers.reduce((sum, server) => 
    sum + (server.stats?.downloads || 0), 0
  );
  
  const totalStars = servers.reduce((sum, server) => 
    sum + (server.stats?.stars || 0), 0
  );

  return {
    totalServers: servers.length,
    totalDownloads,
    totalStars,
    featuredServers: servers.filter(s => s.featured).length,
    verifiedServers: servers.filter(s => s.verified).length,
    vendors: (await getAllVendors()).length,
    tags: (await getAllTags()).length
  };
}

/**
 * Transform internal Server format to MCP registry format
 * Each version of a server becomes a separate MCPServerEntry
 */
export function transformToMCPFormat(server: Server): MCPServerEntry[] {
  const entries: MCPServerEntry[] = [];
  
  // If no versions exist, create a default version entry
  if (!server.versions || server.versions.length === 0) {
    console.warn(`Server ${server.id} has no versions, skipping transformation`);
    return entries;
  }
  
  // Sort versions to determine the latest
  const sortedVersions = [...server.versions].sort((a, b) => {
    const dateA = new Date(a.releaseDate || '1970-01-01').getTime();
    const dateB = new Date(b.releaseDate || '1970-01-01').getTime();
    return dateB - dateA;
  });

  sortedVersions.forEach((version, index) => {
    const isLatest = index === 0;

    // Build the MCP server schema
    const mcpSchema: MCPServerSchema = {
      $schema: 'https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json',
      name: `${server.vendorId}/${server.slug}`,
      description: server.metadata?.description || '',
      version: version.version || 'latest',
      repository: server.metadata?.sourceUrl ? {
        url: server.metadata.sourceUrl,
        source: 'github' // Default to github, can be inferred from URL
      } : {}
    };

    // Add optional fields
    if (server.metadata?.name && server.metadata.name !== `${server.vendorId}/${server.slug}`) {
      mcpSchema.title = server.metadata.name;
    }

    if (server.metadata?.homepage) {
      mcpSchema.websiteUrl = server.metadata.homepage;
    }

    if (server.metadata?.logoUrl) {
      mcpSchema.icons = [{
        src: server.metadata.logoUrl
      }];
    }

    // Transform runtime info to remotes or packages based on type
    if (version.runtime.type === 'http') {
      mcpSchema.remotes = [{
        type: 'streamable-http',
        url: version.runtime.url
      }];
    } else if (version.runtime.type === 'docker' && 'image' in version.runtime) {
      // Docker with explicit type and image field
      const pkg: Package = {
        registryType: 'oci',
        identifier: version.runtime.image,
        transport: {
          type: 'stdio'
        }
      };
      
      // Add environment variables from new structure or legacy env object
      if (version.runtime.environmentVariables) {
        pkg.environmentVariables = version.runtime.environmentVariables;
      } else if (version.runtime.env) {
        pkg.environmentVariables = Object.entries(version.runtime.env).map(([name]) => ({
          name,
          description: `Environment variable ${name}`,
          format: 'string',
          isSecret: name.toLowerCase().includes('token') || name.toLowerCase().includes('key') || name.toLowerCase().includes('password')
        }));
      }
      
      mcpSchema.packages = [pkg];
    } else if ('command' in version.runtime && version.runtime.command === 'docker' && version.runtime.args) {
      // Docker using command format (e.g., docker run -i --rm ghcr.io/...)
      // Extract the image name from args
      const imageArg = version.runtime.args.find(arg => 
        arg.includes('/') || arg.startsWith('ghcr.io') || arg.startsWith('docker.io')
      );
      
      if (imageArg) {
        const pkg: Package = {
          registryType: 'oci',
          identifier: imageArg.startsWith('docker.io/') ? imageArg : `docker.io/${imageArg}`,
          transport: {
            type: 'stdio'
          }
        };
        
        // Add environment variables from new structure or legacy env object
        if (version.runtime.environmentVariables) {
          pkg.environmentVariables = version.runtime.environmentVariables;
        } else if (version.runtime.env) {
          pkg.environmentVariables = Object.entries(version.runtime.env).map(([name]) => ({
            name,
            description: `Environment variable ${name}`,
            format: 'string',
            isSecret: name.toLowerCase().includes('token') || name.toLowerCase().includes('key') || name.toLowerCase().includes('password')
          }));
        }
        
        mcpSchema.packages = [pkg];
      }
    } else if (version.runtime.type === 'pip' && 'package' in version.runtime) {
      mcpSchema.packages = [{
        registryType: 'pypi',
        registryBaseUrl: 'https://pypi.org',
        identifier: version.runtime.package,
        version: version.version,
        transport: {
          type: 'stdio'
        }
      }];
    } else if ((version.runtime.type === 'node' || version.runtime.command === 'npx') && version.runtime.args) {
      // NPM packages
      const packageName = version.runtime.args.find(arg => !arg.startsWith('-')) || version.runtime.args[0];
      if (packageName && packageName.includes('/')) {
        const pkg: Package = {
          registryType: 'npm',
          registryBaseUrl: 'https://registry.npmjs.org',
          identifier: packageName,
          version: version.version,
          transport: {
            type: 'stdio'
          }
        };
        
        // Add command-line arguments from additionalArgs structure
        if (version.runtime.additionalArgs && version.runtime.additionalArgs.length > 0) {
          pkg.arguments = version.runtime.additionalArgs.map(arg => ({
            name: arg.value,
            description: arg.description || arg.value,
            isSecret: arg.isSecret || false,
            format: 'string'
          }));
        }
        
        // Add environment variables from new structure or legacy env object
        if (version.runtime.environmentVariables) {
          pkg.environmentVariables = version.runtime.environmentVariables;
        } else if (version.runtime.env) {
          pkg.environmentVariables = Object.entries(version.runtime.env).map(([name]) => ({
            name,
            description: `Environment variable ${name}`,
            format: 'string',
            isSecret: name.toLowerCase().includes('token') || name.toLowerCase().includes('key') || name.toLowerCase().includes('password')
          }));
        }
        
        mcpSchema.packages = [pkg];
      }
    }

    // Create the entry with metadata
    const entry: MCPServerEntry = {
      server: mcpSchema,
      _meta: {
        'io.modelcontextprotocol.registry/official': {
          status: version.deprecated ? 'deprecated' : 'active',
          publishedAt: version.releaseDate,
          updatedAt: server.updatedAt,
          isLatest
        }
      }
    };

    entries.push(entry);
  });

  return entries;
}

/**
 * Get servers in MCP registry format
 */
export async function getServersInMCPFormat(filter: ServerFilter = {}): Promise<MCPServersResponse> {
  const { servers } = await searchServers(filter);
  
  // Transform each server to MCP format (creates multiple entries for versions)
  const allEntries: MCPServerEntry[] = [];
  servers.forEach(server => {
    const entries = transformToMCPFormat(server);
    allEntries.push(...entries);
  });

  // Calculate cursor for pagination (using last entry's name:version)
  let nextCursor: string | undefined;
  if (allEntries.length > 0) {
    const lastEntry = allEntries[allEntries.length - 1];
    nextCursor = `${lastEntry.server.name}:${lastEntry.server.version}`;
  }

  return {
    servers: allEntries,
    metadata: {
      nextCursor,
      count: allEntries.length
    }
  };
}

/**
 * Get a single server by ID in MCP registry format
 * Returns all versions of the server
 */
export async function getServerByIdInMCPFormat(id: string): Promise<MCPServersResponse | null> {
  const server = await getServerById(id);
  if (!server) {
    return null;
  }

  const entries = transformToMCPFormat(server);

  return {
    servers: entries,
    metadata: {
      count: entries.length
    }
  };
}

