# Migration Guide: Static to Dynamic Registry

This guide helps you migrate existing server JSON files to take advantage of dynamic registry fetching.

## Overview

With dynamic registry fetching enabled, you can **simplify your server JSON files** by removing information that can be automatically fetched from registries.

## What Can Be Removed

### For NPM-based servers

You can remove or simplify:
- ✂️ Version numbers (auto-fetched from npm)
- ✂️ Download counts (auto-fetched from npm)
- ✂️ Descriptions (if available in npm)
- ✂️ Repository URLs (if available in npm)
- ✂️ GitHub stars (auto-fetched from GitHub)

### For Docker-based servers

You can remove or simplify:
- ✂️ Version/tag information (auto-fetched from Docker Hub)
- ✂️ Pull counts (auto-fetched from Docker Hub)
- ✂️ Star counts (auto-fetched from Docker Hub)

## Before & After Examples

### NPM Package Server (Before)

```json
{
  "id": "brave-search",
  "vendorId": "modelcontextprotocol",
  "slug": "brave-search",
  "metadata": {
    "name": "Brave Search Server",
    "description": "Perform web searches using the Brave Search API",
    "homepage": "https://github.com/modelcontextprotocol/servers",
    "license": "MIT",
    "sourceUrl": "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    "tags": ["search", "web", "brave", "official"]
  },
  "versions": [
    {
      "version": "0.3.0",
      "releaseDate": "2024-11-20T00:00:00Z",
      "changelog": "Added image and news search capabilities",
      "runtime": {
        "type": "node",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {
          "BRAVE_API_KEY": "${input:brave_api_key}"
        }
      }
    }
  ],
  "stats": {
    "downloads": 6340,
    "stars": 89
  },
  "publishedAt": "2024-02-10T14:20:00Z",
  "updatedAt": "2024-11-20T10:30:00Z"
}
```

### NPM Package Server (After - Minimal)

```json
{
  "id": "brave-search",
  "vendorId": "modelcontextprotocol",
  "slug": "brave-search",
  "metadata": {
    "name": "Brave Search Server",
    "sourceUrl": "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    "tags": ["search", "web", "brave", "official"]
  },
  "versions": [
    {
      "version": "latest",
      "releaseDate": "auto",
      "runtime": {
        "type": "node",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {
          "BRAVE_API_KEY": "${input:brave_api_key}"
        }
      }
    }
  ]
}
```

The system will automatically fetch:
- ✅ Current version number from npm
- ✅ Description from npm package.json
- ✅ License from npm
- ✅ Download statistics
- ✅ GitHub stars from the repository

### Docker Server (Before)

```json
{
  "id": "docker-analyzer",
  "vendorId": "community",
  "slug": "docker-analyzer",
  "metadata": {
    "name": "Docker Container Analyzer",
    "description": "MCP server running in Docker for analyzing containers",
    "homepage": "https://github.com/example/mcp-docker-analyzer"
  },
  "versions": [
    {
      "version": "1.2.0",
      "releaseDate": "2024-11-20T00:00:00Z",
      "runtime": {
        "type": "docker",
        "image": "mcp/docker-analyzer:1.2.0"
      }
    }
  ],
  "stats": {
    "downloads": 3420,
    "stars": 67
  }
}
```

### Docker Server (After - Minimal)

```json
{
  "id": "docker-analyzer",
  "vendorId": "community",
  "slug": "docker-analyzer",
  "metadata": {
    "name": "Docker Container Analyzer",
    "tags": ["docker", "containers", "analysis"]
  },
  "versions": [
    {
      "version": "auto",
      "releaseDate": "auto",
      "runtime": {
        "type": "docker",
        "image": "mcp/docker-analyzer"
      }
    }
  ]
}
```

Note: For Docker, you can omit the tag (`:1.2.0`) and it will fetch the latest tag.

The system will automatically fetch:
- ✅ Available tags from Docker Hub
- ✅ Description from Docker Hub
- ✅ Pull count
- ✅ Star count
- ✅ Last updated timestamp

## Required Fields

You **must keep** these fields:
- ✅ `id` - Unique identifier
- ✅ `vendorId` - Vendor/organization identifier
- ✅ `slug` - URL-friendly identifier
- ✅ `metadata.name` - Display name
- ✅ `metadata.tags` - Categorization tags
- ✅ `versions[].runtime` - Runtime configuration

## Optional Fields to Keep

Consider keeping these for better control:
- ⚙️ `metadata.description` - Custom description (overrides registry)
- ⚙️ `featured` - Feature this server
- ⚙️ `verified` - Mark as verified
- ⚙️ `metadata.maintainers` - Maintainer information
- ⚙️ `versions[].changelog` - Version-specific notes

## Migration Steps

### Step 1: Backup Current Data
```bash
cp -r data/servers data/servers.backup
```

### Step 2: Update One Server
1. Choose a server JSON file
2. Remove auto-fetchable fields
3. Test with: `npm run dev`
4. Verify at: `http://localhost:3000/api/v0.1/servers/[server-id]`

### Step 3: Verify Enrichment
Check that the API response includes:
- Current version from registry
- Updated download/pull counts
- Updated star counts
- Fresh timestamps

### Step 4: Migrate Remaining Servers
Once confirmed working:
1. Apply similar changes to other server files
2. Keep changelog and custom descriptions
3. Test thoroughly

## Rollback Plan

If you need to rollback:

```bash
# Option 1: Disable registry fetching
echo "ENABLE_REGISTRY_FETCHING=false" >> .env.local

# Option 2: Restore backup
rm -rf data/servers
mv data/servers.backup data/servers
```

## Testing Checklist

- [ ] Server appears in listing
- [ ] Version number is current
- [ ] Download/pull counts are updated
- [ ] Star counts are accurate
- [ ] Description is present
- [ ] Tags are correct
- [ ] Runtime configuration works

## Common Issues

### Version shows "latest" or "auto"
**Solution**: The literal string is in your JSON. The system will replace it, but you should verify the API response.

### Missing description
**Solution**: Add a description to your server JSON or ensure the package/image has one.

### Stats showing as 0
**Solution**: 
- Check package/image name is correct
- Verify registry is accessible
- Check console logs for errors
- May need GITHUB_TOKEN for GitHub stats

### Old data still showing
**Solution**: Clear the cache:
```bash
curl -X POST http://localhost:3000/api/v0.1/admin/refresh
```

## Best Practices

1. **Keep semantic information** - Tags, categories, custom descriptions
2. **Remove volatile data** - Download counts, stars, versions
3. **Preserve runtime config** - This is essential and not auto-fetched
4. **Add changelogs** - Version-specific changes not in registry
5. **Test incrementally** - Migrate one server at a time

## Future-Proofing

With dynamic fetching:
- ✅ No more manual version updates
- ✅ Stats always current
- ✅ Less maintenance overhead
- ✅ Automatic new version detection
- ✅ Real-time popularity metrics

## Questions?

See [REGISTRY_FETCHING.md](./REGISTRY_FETCHING.md) for more details on how dynamic fetching works.
