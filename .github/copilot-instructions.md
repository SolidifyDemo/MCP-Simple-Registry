# MCP Registry Next - AI Agent Instructions

## Project Overview

This is a **Next.js 16 (App Router)** MCP (Model Context Protocol) server registry that provides both a web UI and API endpoints compatible with the [official MCP registry specification](https://registry.modelcontextprotocol.io/docs). The system serves server metadata from static JSON files while dynamically enriching data from npm, Docker Hub, and GitHub.

## Architecture: Static + Dynamic Hybrid

### Core Data Flow (Read [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) first)

```
API Request → Data Loader (1hr cache) → Load Static JSON → Registry Fetcher (enrich) → Response
                                         ↓
                                    data/servers/*.json
                                         ↓
                           [registry-fetcher.ts fetches live data]
                           npm registry / Docker Hub / GitHub API
```

**Critical:** The system uses **graceful degradation**. Registry fetch failures (404s, network errors) are logged as warnings but don't break the API. Static JSON is always the fallback.

## Key Components

### 1. Static Server Definitions (`data/servers/*.json`)
- **Minimal config required**: Only `id`, `vendorId`, `slug`, `metadata.name`, `metadata.tags`, and `versions[].runtime`
- All other fields (version, description, homepage, license, downloads, stars) are auto-fetched from registries
- See [docs/MINIMAL_CONFIG.md](../docs/MINIMAL_CONFIG.md) for examples

### 2. Data Loader (`lib/data-loader.ts`)
- **Caching**: 1-hour in-memory cache (configurable via `CACHE_DURATION` env var)
- Loads all JSON files from `data/servers/`
- Enriches with registry data if `ENABLE_REGISTRY_FETCHING !== 'false'`
- Provides search, filtering, pagination, and dual-format output

### 3. Registry Fetcher (`lib/registry-fetcher.ts`)
- Extracts package identifiers from `runtime` configs (npm args, Docker images)
- Fetches from: npm registry (`registry.npmjs.org`), Docker Hub (via GitHub releases as fallback), GitHub API (stars)
- **Error handling**: All fetch failures return `null` and log warnings (not errors)

### 4. API Routes
- **v0.1 forwards to v0** (see [app/api/v0.1/servers/route.ts](../app/api/v0.1/servers/route.ts))
- **Dual format support**: `?format=mcp` (default, cursor-based pagination) or `?format=legacy` (page-based)
- **MCP format**: Compatible with GitHub Copilot, supports `?version=latest`, `?limit=N`, `?cursor=name:version`
- All routes use CORS headers from `lib/cors.ts`

## Development Workflows

### Running Locally
```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test:registry # Test registry fetcher
```

### Testing Registry Fetcher
```bash
npm run test:registry  # Runs test-registry-fetcher.mjs
# Or use PowerShell: .\test-api.ps1
```

### Adding a New Server
1. Create JSON file in `data/servers/` (use minimal config from [docs/MINIMAL_CONFIG.md](../docs/MINIMAL_CONFIG.md))
2. Only specify: `id`, `vendorId`, `slug`, `metadata.name`, `metadata.tags`, `versions[].runtime`
3. System auto-fetches: version, description, homepage, license, sourceUrl, downloads, stars
4. Test: `curl http://localhost:3000/api/v0/servers/<id>`

### Environment Variables
```bash
GITHUB_TOKEN=<token>              # Optional: Higher GitHub API rate limits
ENABLE_REGISTRY_FETCHING=true     # Default: true (set false to skip enrichment)
CACHE_DURATION=3600000            # Default: 1 hour (milliseconds)
```

## Project-Specific Patterns

### Type Definitions (`lib/types.ts`)
- **MCPServerSchema**: Official MCP spec format (what API returns)
- **Server**: Internal format (what JSON files use)
- **Dual exports**: `searchServers()` returns internal format, `getServersInMCPFormat()` transforms to MCP spec

### Runtime Type Detection Pattern
The registry fetcher automatically detects package types:
```typescript
// Node/npm: Extract from args like ["npx", "-y", "@org/package"]
if (runtime.type === 'node' && runtime.args?.includes('npx')) {
  const pkgName = runtime.args[runtime.args.indexOf('npx') + 2];
  return fetchNpmPackage(pkgName);
}

// Docker: Extract from command like "docker run ghcr.io/org/image:tag"
if (runtime.type === 'docker') {
  const imageName = extractDockerImage(runtime.command);
  return fetchDockerImage(imageName);
}
```

### CORS Configuration (`lib/cors.ts`)
All API routes **must** use `addCorsHeaders()` wrapper. Pre-flight OPTIONS requests handled by individual routes.

### Error Handling Convention
- **Registry fetch failures**: Log warning, return null, use static data
- **API errors**: Return 500 with `{ error, message }` JSON
- **Never throw errors** that break the API response

## API Examples

```bash
# List all servers (MCP format)
curl http://localhost:3000/api/v0/servers

# Latest versions only (GitHub Copilot style)
curl "http://localhost:3000/api/v0/servers?version=latest&limit=10"

# Search with tags
curl "http://localhost:3000/api/v0/servers?q=github&tags=git,version-control"

# Get specific server
curl http://localhost:3000/api/v0/servers/github-http

# Legacy format with pagination
curl "http://localhost:3000/api/v0/servers?format=legacy&page=2&pageSize=20"

# Health check
curl http://localhost:3000/api/v0/health
```

## Common Tasks

### Updating Cache Duration
Change `CACHE_DURATION` in `.env.local` (milliseconds). Default: 1 hour (3600000).

### Disabling Registry Fetching
Set `ENABLE_REGISTRY_FETCHING=false` in `.env.local` to use only static JSON data.

### Clearing Cache Programmatically
```typescript
import { clearCache } from '@/lib/data-loader';
clearCache(); // Forces reload from disk + registries
```

### Adding New Runtime Type Support
1. Add new type union to `RuntimeInfo` in `lib/types.ts`
2. Add detection logic in `registry-fetcher.ts:getPackageInfo()`
3. Implement new fetcher function (e.g., `fetchPyPiPackage()`)

## Documentation References
- [API.md](../API.md) - Complete API specification
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Detailed architecture diagrams
- [docs/MINIMAL_CONFIG.md](../docs/MINIMAL_CONFIG.md) - Server JSON examples
- [docs/REGISTRY_FETCHING.md](../docs/REGISTRY_FETCHING.md) - Registry fetcher details
- [docs/HANDLING_DEMO_DATA.md](../docs/HANDLING_DEMO_DATA.md) - Error handling approach
