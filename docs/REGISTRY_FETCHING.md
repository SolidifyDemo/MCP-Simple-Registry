# Dynamic Registry Fetching

This MCP Registry now supports **automatic fetching** of package information from external registries like npm and Docker Hub. This eliminates the need to manually update version numbers, download counts, and other metadata.

## How It Works

When a server is loaded, the system:

1. **Reads the static JSON file** from `data/servers/` 
2. **Detects the runtime type** (npm, Docker, etc.)
3. **Fetches live data** from the appropriate registry
4. **Enriches the server metadata** with current information
5. **Caches the result** for 1 hour (configurable)

## Supported Registries

### NPM Registry
- **Package versions** - Automatically fetches the latest version
- **Download statistics** - Gets monthly download counts
- **Metadata** - Description, homepage, license, repository URL

### Docker Hub
- **Image tags** - Fetches all available tags
- **Pull counts** - Gets total number of pulls
- **Stars** - Gets Docker Hub star count
- **Metadata** - Description and other image information

### GitHub
- **Star counts** - Fetches repository stars for any GitHub-hosted project

## Configuration

### Environment Variables

Create a `.env.local` file (use `.env.example` as a template):

```bash
# Optional: GitHub token for higher API rate limits
GITHUB_TOKEN=your_github_token_here

# Optional: Admin API key for cache refresh endpoint
REGISTRY_ADMIN_KEY=your_secret_key_here

# Enable/disable registry fetching (default: true)
ENABLE_REGISTRY_FETCHING=true

# Cache duration in milliseconds (default: 3600000 = 1 hour)
CACHE_DURATION=3600000
```

### Disabling Registry Fetching

To use only static JSON files without external API calls:

```bash
ENABLE_REGISTRY_FETCHING=false
```

## Cache Management

### Automatic Caching
- Data is cached for 1 hour by default
- Subsequent requests within the cache window use cached data
- No external API calls during cache window

### Manual Cache Refresh

Force a cache refresh via the admin endpoint:

```bash
# Without authentication
curl -X POST http://localhost:3000/api/v0.1/admin/refresh

# With authentication (if REGISTRY_ADMIN_KEY is set)
curl -X POST http://localhost:3000/api/v0.1/admin/refresh \
  -H "Authorization: Bearer your_secret_key_here"
```

## Server Configuration

### NPM Packages

For npm-based MCP servers, ensure the runtime is configured correctly:

```json
{
  "runtime": {
    "type": "node",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"]
  }
}
```

The system will:
- Extract the package name: `@modelcontextprotocol/server-brave-search`
- Fetch from: `https://registry.npmjs.org/@modelcontextprotocol/server-brave-search`
- Get download stats from: `https://api.npmjs.org/downloads/point/last-month/...`

### Docker Images

For Docker-based MCP servers:

```json
{
  "runtime": {
    "type": "docker",
    "image": "mcp/docker-analyzer:1.2.0"
  }
}
```

The system will:
- Extract the image name: `mcp/docker-analyzer`
- Fetch from: `https://hub.docker.com/v2/repositories/mcp/docker-analyzer`
- Get tags from: `https://hub.docker.com/v2/repositories/mcp/docker-analyzer/tags`

## API Rate Limits

### GitHub API
- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

### NPM Registry
- No strict limits for package metadata
- Download stats API: Generous limits

### Docker Hub
- **Unauthenticated**: 100 pulls per 6 hours
- **Free account**: 200 pulls per 6 hours

## Benefits

✅ **No manual updates** - Version numbers, download counts, and stars update automatically
✅ **Always current** - Data is refreshed every hour (configurable)
✅ **Fallback support** - If registry fetch fails, uses data from JSON files
✅ **Performance** - Aggressive caching minimizes API calls
✅ **Flexibility** - Can be disabled to use only static files

## Data Enrichment Details

The following fields are automatically updated from registries:

| Field | NPM | Docker | GitHub |
|-------|-----|--------|--------|
| `version` | ✅ | ✅ | - |
| `description` | ✅ | ✅ | - |
| `homepage` | ✅ | ✅ | - |
| `license` | ✅ | - | - |
| `repository` | ✅ | - | - |
| `stats.downloads` | ✅ | ✅ (pulls) | - |
| `stats.stars` | - | ✅ | ✅ |
| `updatedAt` | ✅ | ✅ | - |

## Example Response

Before (static):
```json
{
  "version": "0.3.0",
  "stats": {
    "downloads": 6340,
    "stars": 89
  }
}
```

After (enriched):
```json
{
  "version": "0.5.2",
  "stats": {
    "downloads": 12847,
    "stars": 142
  },
  "updatedAt": "2025-12-16T10:30:00Z"
}
```

## Troubleshooting

### Rate Limit Errors
- Add a `GITHUB_TOKEN` to your `.env.local` file
- Increase `CACHE_DURATION` to reduce API calls

### Stale Data
- Call the refresh endpoint: `POST /api/v0.1/admin/refresh`
- Restart the Next.js development server

### Missing Data
- Check that the runtime configuration matches the registry format
- Verify package/image names are correct
- Check console logs for error messages

## Future Enhancements

Potential improvements:
- Support for PyPI (Python packages)
- Support for Maven Central (Java packages)
- Webhook support for real-time updates
- Background job for pre-warming cache
- Registry-specific configuration per server
