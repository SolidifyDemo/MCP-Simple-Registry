# Minimal Server Configuration Guide

## Quick Start - Minimal Required Fields

To add a new MCP server, you only need **these essential fields**. Everything else will be auto-fetched from registries!

### For NPM Packages

```json
{
  "id": "my-server",
  "vendorId": "my-org",
  "slug": "my-server",
  "metadata": {
    "name": "My MCP Server",
    "tags": ["category1", "category2"]
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

**That's it!** The system will automatically fetch:
- ✅ Current version number
- ✅ Description
- ✅ Homepage URL
- ✅ License
- ✅ Repository URL
- ✅ Download statistics
- ✅ GitHub stars (if repository is on GitHub)

### For Docker Images

```json
{
  "id": "my-docker-server",
  "vendorId": "my-org",
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

**Auto-fetched:**
- ✅ Available tags
- ✅ Description
- ✅ Pull count
- ✅ Star count
- ✅ Last update timestamp

## Required Fields Only

### Absolutely Required
```json
{
  "id": "unique-id",              // Unique identifier
  "vendorId": "vendor-name",      // Organization/vendor
  "slug": "url-friendly-name",    // URL slug
  "metadata": {
    "name": "Display Name",       // Human-readable name
    "tags": ["tag1", "tag2"]      // Categories/tags
  },
  "versions": [{
    "runtime": {
      "type": "node",             // Runtime type
      "command": "npx",           // Command to run
      "args": ["-y", "@org/pkg"]  // Package name here!
    }
  }]
}
```

## Optional Overrides

Only add these if you want to **override** what's fetched from registries:

```json
{
  "metadata": {
    "description": "Custom description",  // Override registry description
    "homepage": "https://custom.com",     // Override registry homepage
    "license": "MIT",                     // Override registry license
    "sourceUrl": "https://github.com/...", // For GitHub stars
    "logoUrl": "https://logo.png",        // Custom logo
    "maintainers": [                      // Additional maintainer info
      { "name": "John Doe", "email": "..." }
    ]
  },
  "featured": true,                       // Mark as featured
  "verified": true,                       // Mark as verified
  "versions": [{
    "changelog": "Version notes...",      // Version-specific notes
    "runtime": { ... }
  }]
}
```

## Field Auto-Population Matrix

| Field | NPM | Docker | Required? |
|-------|-----|--------|-----------|
| `id` | - | - | ✅ YES |
| `vendorId` | - | - | ✅ YES |
| `slug` | - | - | ✅ YES |
| `metadata.name` | - | - | ✅ YES |
| `metadata.tags` | - | - | ✅ YES |
| `metadata.description` | ✅ Auto | ✅ Auto | ❌ Optional |
| `metadata.homepage` | ✅ Auto | ❌ Manual | ❌ Optional |
| `metadata.license` | ✅ Auto | ❌ Manual | ❌ Optional |
| `metadata.sourceUrl` | ✅ Auto | ❌ Manual | ❌ Optional |
| `versions[].version` | ✅ Auto | ✅ Auto | ❌ Optional |
| `versions[].releaseDate` | ✅ Auto | ✅ Auto | ❌ Optional |
| `versions[].runtime` | - | - | ✅ YES |
| `stats.downloads` | ✅ Auto | ✅ Auto | ❌ Optional |
| `stats.stars` | ✅ Auto (GH) | ✅ Auto | ❌ Optional |
| `publishedAt` | ✅ Auto | ✅ Auto | ❌ Optional |
| `updatedAt` | ✅ Auto | ✅ Auto | ❌ Optional |

## Complete Minimal Examples

### Example 1: NPM Package (Absolute Minimum)
```json
{
  "id": "brave-search",
  "vendorId": "modelcontextprotocol",
  "slug": "brave-search",
  "metadata": {
    "name": "Brave Search Server",
    "tags": ["search", "web", "api"]
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

### Example 2: With Environment Variables
```json
{
  "id": "brave-search",
  "vendorId": "modelcontextprotocol",
  "slug": "brave-search",
  "metadata": {
    "name": "Brave Search Server",
    "tags": ["search", "web", "api"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${input:brave_api_key}"
      }
    }
  }]
}
```

### Example 3: Docker with Volumes
```json
{
  "id": "postgres-analyzer",
  "vendorId": "community",
  "slug": "postgres-analyzer",
  "metadata": {
    "name": "PostgreSQL Analyzer",
    "tags": ["database", "postgresql", "analysis"]
  },
  "versions": [{
    "runtime": {
      "type": "docker",
      "image": "mcp/postgres-analyzer",
      "ports": { "5432": 5432 },
      "volumes": ["/data:/var/lib/postgresql/data"]
    }
  }]
}
```

### Example 4: With Featured & Verified Flags
```json
{
  "id": "github",
  "vendorId": "modelcontextprotocol",
  "slug": "github",
  "metadata": {
    "name": "GitHub Server",
    "tags": ["git", "github", "vcs", "official"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }],
  "featured": true,
  "verified": true
}
```

## Tips for Minimal Maintenance

1. **Only specify what you need to override** - Let the registry fetcher do the work
2. **Tags are your responsibility** - These won't be auto-fetched, choose wisely
3. **Featured/Verified flags** - Use these to highlight quality servers
4. **Version field** - Leave it out or use "latest" - it will be auto-updated
5. **Stats** - Don't maintain these manually, they auto-update every hour

## What Happens at Runtime

```
Your Minimal JSON → Registry Fetcher → Enriched Data → API Response
     (5 fields)                           (20+ fields)
```

## Converting Existing Servers

**Before** (100+ lines):
```json
{
  "id": "server",
  "vendorId": "org",
  "slug": "server",
  "metadata": {
    "name": "Server",
    "description": "Long description...",
    "homepage": "https://...",
    "license": "MIT",
    "sourceUrl": "https://github.com/...",
    "tags": ["tag1", "tag2"],
    "maintainers": [...]
  },
  "versions": [{
    "version": "1.2.3",
    "releaseDate": "2024-01-01T00:00:00Z",
    "changelog": "...",
    "runtime": { ... }
  }],
  "stats": {
    "downloads": 50000,
    "stars": 123
  },
  "publishedAt": "...",
  "updatedAt": "..."
}
```

**After** (20 lines):
```json
{
  "id": "server",
  "vendorId": "org",
  "slug": "server",
  "metadata": {
    "name": "Server",
    "tags": ["tag1", "tag2"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@org/package"]
    }
  }]
}
```

**Result:** 80% less maintenance, always up-to-date data! 🎉

## Validation

Your minimal JSON will be validated against the schema. Make sure you have:
- ✅ `id`, `vendorId`, `slug`
- ✅ `metadata.name` and `metadata.tags`
- ✅ At least one entry in `versions[]`
- ✅ `runtime` configuration with correct package/image reference

The system handles the rest automatically!
