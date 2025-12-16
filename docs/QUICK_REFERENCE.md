# Quick Reference - Dynamic Registry Fetching

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Start dev server
npm run dev

# 4. Test registry fetching
npm run test:registry
```

## 📋 Common Commands

| Task | Command |
|------|---------|
| Start server | `npm run dev` |
| Test registry fetch | `npm run test:registry` |
| Build for production | `npm run build` |
| Start production | `npm start` |

## 🔧 Environment Variables

```bash
# .env.local

# Enable/disable registry fetching (default: true)
ENABLE_REGISTRY_FETCHING=true

# Cache duration in milliseconds (default: 1 hour)
CACHE_DURATION=3600000

# GitHub token for higher rate limits (optional but recommended)
GITHUB_TOKEN=ghp_your_token_here

# Admin API key for cache refresh endpoint (optional)
REGISTRY_ADMIN_KEY=your_secret_key
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v0.1/servers` | GET | List all servers (enriched) |
| `/api/v0.1/servers/[id]` | GET | Get specific server |
| `/api/v0.1/admin/refresh` | POST | Refresh cache manually |
| `/admin` | GET | Admin dashboard (UI) |

## 📦 Supported Registries

| Registry | Auto-Fetched Data |
|----------|-------------------|
| **NPM** | Version, downloads, description, license, homepage |
| **Docker Hub** | Tags, pulls, stars, description |
| **GitHub** | Star count |

## 💡 Quick Examples

### Get all servers with fresh data
```bash
curl http://localhost:3000/api/v0.1/servers
```

### Manually refresh cache
```bash
curl -X POST http://localhost:3000/api/v0.1/admin/refresh
```

### With authentication
```bash
curl -X POST http://localhost:3000/api/v0.1/admin/refresh \
  -H "Authorization: Bearer your_secret_key"
```

## 📝 Server JSON Structure

### Minimal NPM Server (RECOMMENDED)
```json
{
  "id": "my-server",
  "vendorId": "my-vendor",
  "slug": "my-server",
  "metadata": {
    "name": "My MCP Server",
    "tags": ["search", "tools"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"]
    }
  }]
}
```
**Everything else auto-fetched:** version, description, license, stats, etc.

### Minimal Docker Server (RECOMMENDED)
```json
{
  "id": "my-docker-server",
  "vendorId": "my-vendor",
  "slug": "my-docker-server",
  "metadata": {
    "name": "My Docker MCP Server",
    "tags": ["docker", "containers"]
  },
  "versions": [{
    "runtime": {
      "type": "docker",
      "image": "my-org/mcp-server"
    }
  }]
}
```
**Auto-fetched:** tags, pulls, stars, description, etc.

### Full Example (if you need to override)
```json
{
  "id": "my-server",
  "vendorId": "my-vendor",
  "slug": "my-server",
  "metadata": {
    "name": "My MCP Server",
    "description": "Custom description (overrides npm)",
    "homepage": "https://custom.com",
    "tags": ["search", "tools"]
  },
  "versions": [{
    "changelog": "Custom version notes",
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"]
    }
  }],
  "featured": true,
  "verified": true
}
```

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Rate limit errors | Add `GITHUB_TOKEN` to `.env.local` |
| Stale data | Visit `/admin` and refresh cache |
| No stats showing | Check console logs, verify package names |
| Cache not clearing | Restart dev server |

## 📚 Documentation

- Full docs: [REGISTRY_FETCHING.md](./REGISTRY_FETCHING.md)
- Migration: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Implementation: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## ⚙️ Cache Behavior

- **Duration**: 1 hour (configurable)
- **Auto-refresh**: On cache expiry
- **Manual refresh**: `/admin` page or API endpoint
- **Startup**: Clears on server restart

## 🎯 What to Keep in JSON

**Always keep:**
- `id`, `vendorId`, `slug`
- `metadata.name`, `metadata.tags`
- `versions[].runtime` configuration

**Can remove (auto-fetched):**
- Version numbers
- Download/pull counts
- Star counts
- Descriptions (if in registry)
- License info (if in registry)

## 🔐 Security

- Admin endpoint can be protected with `REGISTRY_ADMIN_KEY`
- GitHub token should be kept secret (use `.env.local`, not `.env`)
- Add `.env.local` to `.gitignore` (already done)

## ⚡ Performance Tips

1. Increase `CACHE_DURATION` for fewer API calls
2. Add `GITHUB_TOKEN` to avoid rate limits
3. Use `/admin/refresh` only when needed
4. Monitor console for fetch errors

## 🎉 Success Indicators

- ✅ Server lists show current versions
- ✅ Download/pull counts are recent
- ✅ Star counts match GitHub/Docker Hub
- ✅ No rate limit errors in console
- ✅ Admin page refresh works
