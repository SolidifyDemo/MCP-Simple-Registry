# Dynamic Registry Fetching - Implementation Summary

## What Was Implemented

Your MCP Registry now **automatically fetches** package information from npm, Docker Hub, and GitHub registries, eliminating the need for manual updates.

## Files Created

### Core Implementation
1. **`lib/registry-fetcher.ts`** - Registry fetching logic
   - NPM package information fetcher
   - NPM download statistics fetcher
   - Docker Hub image fetcher
   - GitHub stars fetcher
   - Smart integration with server runtime configurations

2. **`lib/data-loader.ts`** - Updated with enrichment logic
   - Automatic cache with configurable duration (default: 1 hour)
   - Merges static JSON with live registry data
   - Fallback to static data if registry fetch fails

### API Endpoints
3. **`app/api/v0.1/admin/refresh/route.ts`** - Manual cache refresh endpoint
   - POST `/api/v0.1/admin/refresh`
   - Optional authentication via `REGISTRY_ADMIN_KEY`

### Admin Interface
4. **`app/admin/page.tsx`** - Admin dashboard
   - Visual cache refresh button
   - Configuration status display
   - Access at: `http://localhost:3000/admin`

### Configuration
5. **`.env.example`** - Environment configuration template
   - `ENABLE_REGISTRY_FETCHING` - Enable/disable feature
   - `CACHE_DURATION` - Cache duration in milliseconds
   - `GITHUB_TOKEN` - Optional token for higher rate limits
   - `REGISTRY_ADMIN_KEY` - Optional auth for admin endpoint

### Documentation
6. **`docs/REGISTRY_FETCHING.md`** - Complete feature documentation
7. **`docs/MIGRATION_GUIDE.md`** - Guide for simplifying existing JSON files
8. **`README.md`** - Updated with new features

### Testing
9. **`test-registry-fetcher.mjs`** - Test script for registry fetching
   - Run with: `npm run test:registry`

## How It Works

### 1. Static Base + Live Enrichment
```
Static JSON File (data/servers/brave-search.json)
    ↓
Registry Fetcher (lib/registry-fetcher.ts)
    ↓
NPM / Docker Hub / GitHub APIs
    ↓
Merged Result (cached for 1 hour)
    ↓
API Response
```

### 2. Automatic Detection
The system detects the package type from the runtime configuration:

**NPM Packages:**
```json
"runtime": {
  "type": "node",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"]
}
```
→ Fetches from `registry.npmjs.org`

**Docker Images:**
```json
"runtime": {
  "type": "docker",
  "image": "mcp/docker-analyzer:1.2.0"
}
```
→ Fetches from `hub.docker.com`

### 3. Smart Caching
- Data cached for 1 hour (configurable)
- Reduces external API calls
- Manual refresh available
- Automatic invalidation on server restart

## What Gets Updated Automatically

| Data | NPM | Docker | GitHub |
|------|-----|--------|--------|
| Version | ✅ | ✅ | - |
| Description | ✅ | ✅ | - |
| Homepage | ✅ | - | - |
| License | ✅ | - | - |
| Repository URL | ✅ | - | - |
| Downloads/Pulls | ✅ | ✅ | - |
| Stars | - | ✅ | ✅ |

## Usage Examples

### Enable Registry Fetching (Default)
```bash
# .env.local
ENABLE_REGISTRY_FETCHING=true
```

### Disable for Static-Only Mode
```bash
# .env.local
ENABLE_REGISTRY_FETCHING=false
```

### Configure Cache Duration
```bash
# .env.local
CACHE_DURATION=1800000  # 30 minutes
```

### Add GitHub Token (Recommended)
```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

### Manual Cache Refresh
```bash
curl -X POST http://localhost:3000/api/v0.1/admin/refresh
```

Or visit: `http://localhost:3000/admin`

## API Response Example

**Before** (static only):
```json
{
  "id": "brave-search",
  "metadata": {
    "name": "Brave Search Server"
  },
  "versions": [{ "version": "0.3.0" }],
  "stats": {
    "downloads": 6340,
    "stars": 89
  }
}
```

**After** (enriched):
```json
{
  "id": "brave-search",
  "metadata": {
    "name": "Brave Search Server",
    "description": "Perform web searches using Brave Search API",
    "homepage": "https://github.com/modelcontextprotocol/servers",
    "license": "MIT"
  },
  "versions": [{ "version": "0.5.2" }],
  "stats": {
    "downloads": 12847,
    "stars": 142
  },
  "updatedAt": "2025-12-16T10:30:00Z"
}
```

## Benefits

✅ **No Manual Updates** - Versions, downloads, and stars update automatically
✅ **Always Current** - Data refreshes hourly
✅ **Fallback Support** - Uses static data if registry fetch fails
✅ **Performance** - Aggressive caching minimizes API calls
✅ **Flexible** - Can be disabled to use only static files
✅ **Rate Limit Friendly** - Configurable cache prevents hitting limits

## Testing

### Test Registry Fetching
```bash
npm run test:registry
```

### Test API with Live Data
```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/v0.1/servers

# Check specific server
curl http://localhost:3000/api/v0.1/servers/brave-search
```

### Test Cache Refresh
```bash
# Visit admin page
open http://localhost:3000/admin

# Or use curl
curl -X POST http://localhost:3000/api/v0.1/admin/refresh
```

## Migration Path

For existing static JSON files, you can now **remove** fields that are auto-fetched:

**Before** (125 lines):
```json
{
  "metadata": {
    "description": "...",
    "homepage": "...",
    "license": "MIT",
    // ... lots of fields
  },
  "versions": [{ "version": "0.3.0", ... }],
  "stats": { "downloads": 6340, "stars": 89 }
}
```

**After** (35 lines):
```json
{
  "metadata": {
    "name": "Brave Search Server",
    "tags": ["search", "web"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
    }
  }]
}
```

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## Rate Limits

### NPM Registry
- **Metadata**: No strict limits
- **Downloads**: Very generous

### Docker Hub
- **Unauthenticated**: 100 pulls per 6 hours
- **Free account**: 200 pulls per 6 hours
- **Cached**: Only fetches once per hour

### GitHub API
- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour
- **Recommendation**: Add `GITHUB_TOKEN` to `.env.local`

## Next Steps

1. **Test the implementation**
   ```bash
   npm run dev
   npm run test:registry
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Try the admin page**
   - Visit: `http://localhost:3000/admin`
   - Click "Refresh Cache"

4. **Optional: Simplify JSON files**
   - See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
   - Start with one server
   - Test thoroughly

5. **Monitor performance**
   - Check console logs for fetch errors
   - Verify cache is working
   - Adjust `CACHE_DURATION` if needed

## Troubleshooting

**"Rate limit exceeded"**
→ Add `GITHUB_TOKEN` to `.env.local`

**"Stale data showing"**
→ Visit `/admin` and click "Refresh Cache"

**"Registry fetch failed"**
→ Check console logs, verify package/image names

**"Too many API calls"**
→ Increase `CACHE_DURATION` in `.env.local`

## Documentation

- [REGISTRY_FETCHING.md](./REGISTRY_FETCHING.md) - Complete feature documentation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - JSON file migration guide
- [API.md](../API.md) - API documentation

## Questions?

Open an issue or check the documentation files listed above.
