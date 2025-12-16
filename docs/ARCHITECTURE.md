# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
│                    (Browser / API Client)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                          │
│                  /api/v0.1/servers/route.ts                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Loader                                │
│                  lib/data-loader.ts                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Check Cache (1 hour TTL)                                │  │
│  │  ├─ Valid? → Return cached data                          │  │
│  │  └─ Expired? → Continue to fetch                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
┌───────────────────────┐   ┌─────────────────────────┐
│  Load Static JSON     │   │  Registry Fetcher       │
│  data/servers/*.json  │   │  lib/registry-fetcher.ts│
└───────────┬───────────┘   └────────┬────────────────┘
            │                        │
            │                ┌───────┴────────┐
            │                ▼                ▼
            │    ┌──────────────────┐  ┌─────────────┐
            │    │  NPM Registry    │  │ Docker Hub  │
            │    │  registry.npmjs  │  │ hub.docker  │
            │    └──────────────────┘  └─────────────┘
            │                ▼
            │    ┌──────────────────┐
            │    │  GitHub API      │
            │    │  api.github.com  │
            │    └──────────────────┘
            │                │
            └────────────────┴──────────────┐
                                            ▼
                             ┌──────────────────────────┐
                             │  Merge Data              │
                             │  Static + Live Registry  │
                             └──────────┬───────────────┘
                                        │
                                        ▼
                             ┌──────────────────────────┐
                             │  Cache Result (1 hour)   │
                             └──────────┬───────────────┘
                                        │
                                        ▼
                             ┌──────────────────────────┐
                             │  Return to Client        │
                             │  JSON Response           │
                             └──────────────────────────┘
```

## Data Flow

### 1. Initial Request
```
Client → API Route → Data Loader
                         │
                         ├─ Cache Miss
                         └─ Load Static JSON
```

### 2. Registry Enrichment (NPM Example)
```
Static JSON:
{
  "runtime": { 
    "type": "node",
    "args": ["@org/server"]
  }
}
         │
         ▼
Registry Fetcher extracts: "@org/server"
         │
         ▼
Fetch from: https://registry.npmjs.org/@org/server
         │
         ▼
Get: version, downloads, description, etc.
         │
         ▼
Merge with static data
         │
         ▼
Enhanced JSON:
{
  "runtime": { ... },
  "version": "1.2.3",
  "stats": { "downloads": 50000 },
  "description": "..."
}
```

### 3. Caching Strategy
```
Request 1 (t=0):
  Cache Miss → Fetch from registries → Cache result → Return

Request 2 (t=30min):
  Cache Hit → Return cached data (fast!)

Request 3 (t=90min):
  Cache Expired → Fetch fresh data → Update cache → Return
```

## Component Breakdown

### 1. Registry Fetcher (`lib/registry-fetcher.ts`)
**Responsibilities:**
- Detect package type from runtime config
- Fetch from NPM, Docker Hub, GitHub
- Handle rate limits and errors
- Return normalized package info

**Functions:**
- `fetchNpmPackage()` - Get npm package details
- `fetchNpmDownloads()` - Get download stats
- `fetchDockerImage()` - Get Docker image info
- `fetchGitHubStars()` - Get repository stars
- `getPackageInfo()` - Main dispatcher

### 2. Data Loader (`lib/data-loader.ts`)
**Responsibilities:**
- Load static JSON files
- Coordinate with registry fetcher
- Merge static + live data
- Manage caching
- Transform to MCP format

**Functions:**
- `loadServers()` - Main entry point
- `getServerById()` - Get single server
- `searchServers()` - Search and filter
- `clearCache()` - Manual cache clear

### 3. API Routes
**Endpoints:**
- `GET /api/v0.1/servers` - List all servers
- `GET /api/v0.1/servers/[id]` - Get specific server
- `POST /api/v0.1/admin/refresh` - Manual refresh

### 4. Admin Dashboard (`app/admin/page.tsx`)
**Features:**
- Visual cache refresh button
- Configuration display
- Success/error feedback
- Link back to main page

## Cache Architecture

```
┌─────────────────────────────────────┐
│         In-Memory Cache             │
├─────────────────────────────────────┤
│  cachedServers: Server[] | null     │
│  lastCacheTime: number              │
│  CACHE_DURATION: 3600000ms (1h)     │
└─────────────────────────────────────┘
         │
         ├─ Expires after 1 hour
         ├─ Cleared on server restart
         ├─ Cleared via /admin/refresh
         └─ Cleared via clearCache()
```

## External API Interactions

### NPM Registry
```
GET https://registry.npmjs.org/{package}
└─ Returns: version, description, license, repository, etc.

GET https://api.npmjs.org/downloads/point/last-month/{package}
└─ Returns: download count
```

### Docker Hub
```
GET https://hub.docker.com/v2/repositories/{namespace}/{repo}
└─ Returns: description, pulls, stars, last_updated

GET https://hub.docker.com/v2/repositories/{namespace}/{repo}/tags
└─ Returns: list of available tags
```

### GitHub API
```
GET https://api.github.com/repos/{owner}/{repo}
Headers: Authorization: token {GITHUB_TOKEN}
└─ Returns: stargazers_count, description, etc.
```

## Configuration Flow

```
.env.local
    │
    ├─ ENABLE_REGISTRY_FETCHING=true
    │    └─ Controls if fetching happens
    │
    ├─ CACHE_DURATION=3600000
    │    └─ Controls cache TTL
    │
    ├─ GITHUB_TOKEN=xxx
    │    └─ Increases GitHub rate limits
    │
    └─ REGISTRY_ADMIN_KEY=xxx
         └─ Protects admin endpoints
```

## Error Handling

```
Registry Fetch Failed
    │
    ├─ Log error to console
    ├─ Use static JSON data as fallback
    └─ Continue processing (non-blocking)

Rate Limit Hit
    │
    ├─ Log warning
    ├─ Use cached data if available
    └─ Suggest adding GITHUB_TOKEN

Network Error
    │
    ├─ Catch and log
    ├─ Return partial data
    └─ Mark as incomplete (optional)
```

## Scalability Considerations

### Current Setup (Development)
- ✅ In-memory cache
- ✅ 1-hour TTL
- ✅ Per-server process

### Production Recommendations
- Consider Redis for distributed cache
- Implement stale-while-revalidate
- Add background refresh jobs
- Use CDN for static assets
- Monitor API quotas

## Performance Metrics

### Without Registry Fetching
- Response time: ~50ms
- Data freshness: Manual updates only
- External API calls: 0

### With Registry Fetching (Cached)
- Response time: ~50ms (cache hit)
- Data freshness: Up to 1 hour old
- External API calls: 0

### With Registry Fetching (Uncached)
- Response time: ~500-1000ms (first request)
- Data freshness: Real-time
- External API calls: 1-3 per server

## Security

### API Keys
- GitHub token: Optional, increases rate limits
- Admin key: Optional, protects refresh endpoint
- Stored in: `.env.local` (gitignored)

### Rate Limiting
- NPM: No strict limits
- Docker Hub: 100-200 requests per 6 hours
- GitHub: 60/hour (5000 with token)

### Protection
- Cache reduces external calls
- Fallback to static data
- No sensitive data exposed
- Admin endpoint can require auth

## Monitoring

### What to Monitor
- Cache hit rate
- External API latency
- Rate limit warnings
- Fetch errors
- Data staleness

### Where to Check
- Console logs
- Network tab (browser)
- Server logs
- Admin dashboard

## Future Enhancements

Potential additions:
- [ ] WebSocket for real-time updates
- [ ] GraphQL API
- [ ] Redis cache
- [ ] Background refresh jobs
- [ ] PyPI support
- [ ] Maven Central support
- [ ] Metrics dashboard
- [ ] Webhook notifications
