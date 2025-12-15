# MCP Registry API Documentation

This registry is compatible with the official Model Context Protocol (MCP) registry specification at https://registry.modelcontextprotocol.io/docs

## Base URL

```
http://localhost:3000/api/v0
```

## Endpoints

### List Servers

**GET** `/servers`

Returns a list of MCP servers in the official registry format.

#### Query Parameters

- `q` - Search query to filter servers by name, description, or tags
- `tags` - Comma-separated list of tags to filter by
- `vendor` - Filter by vendor ID
- `featured` - Filter featured servers (`true`/`false`)
- `verified` - Filter verified servers (`true`/`false`)
- `page` - Page number for pagination (default: 1)
- `pageSize` - Number of items per page (default: 20, max: 100)
- `sortBy` - Sort field: `name`, `downloads`, `stars`, `publishedAt`, `updatedAt` (default: `updatedAt`)
- `sortOrder` - Sort order: `asc` or `desc` (default: `desc`)
- `format` - Response format: `mcp` (default) or `legacy`

#### MCP Format Response (Default)

```json
{
  "servers": [
    {
      "server": {
        "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
        "name": "modelcontextprotocol/github",
        "description": "Interact with GitHub repositories, issues, pull requests, and more through MCP",
        "title": "GitHub Server",
        "version": "0.4.0",
        "websiteUrl": "https://github.com/modelcontextprotocol/servers",
        "repository": {
          "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
          "source": "github"
        },
        "icons": [
          {
            "src": "https://example.com/icon.png"
          }
        ],
        "remotes": [
          {
            "type": "streamable-http",
            "url": "https://example.com/mcp"
          }
        ],
        "_meta": {}
      },
      "_meta": {
        "io.modelcontextprotocol.registry/official": {
          "status": "active",
          "publishedAt": "2024-11-28T00:00:00Z",
          "updatedAt": "2024-11-28T16:45:00Z",
          "isLatest": true
        }
      }
    }
  ],
  "metadata": {
    "nextCursor": "modelcontextprotocol/github:0.4.0",
    "count": 1
  }
}
```

#### Legacy Format Response

Add `?format=legacy` to get the original internal format:

```json
{
  "servers": [
    {
      "id": "github",
      "vendorId": "modelcontextprotocol",
      "slug": "github",
      "metadata": {
        "name": "GitHub Server",
        "description": "Interact with GitHub repositories...",
        "homepage": "https://github.com/modelcontextprotocol/servers",
        "tags": ["github", "git", "version-control"]
      },
      "versions": [...],
      "publishedAt": "2024-01-20T09:15:00Z",
      "updatedAt": "2024-11-28T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 11,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

#### Examples

```bash
# Get all servers (MCP format)
curl http://localhost:3000/api/v0/servers

# Search for GitHub-related servers
curl http://localhost:3000/api/v0/servers?q=github

# Filter by tags
curl http://localhost:3000/api/v0/servers?tags=database,sql

# Get featured servers only
curl http://localhost:3000/api/v0/servers?featured=true

# Get legacy format
curl http://localhost:3000/api/v0/servers?format=legacy
```

### Get Server by ID

**GET** `/servers/{id}`

Returns all versions of a specific server in MCP format.

#### Parameters

- `id` - The server ID (e.g., "github", "postgres")
- `format` - Response format: `mcp` (default) or `legacy`

#### MCP Format Response (Default)

```json
{
  "servers": [
    {
      "server": {
        "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
        "name": "modelcontextprotocol/github",
        "description": "Interact with GitHub repositories, issues, pull requests, and more through MCP",
        "version": "0.4.0",
        "repository": {
          "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
          "source": "github"
        },
        "_meta": {}
      },
      "_meta": {
        "io.modelcontextprotocol.registry/official": {
          "status": "active",
          "publishedAt": "2024-11-28T00:00:00Z",
          "updatedAt": "2024-11-28T16:45:00Z",
          "isLatest": true
        }
      }
    }
  ],
  "metadata": {
    "count": 1
  }
}
```

#### Examples

```bash
# Get GitHub server (MCP format)
curl http://localhost:3000/api/v0/servers/github

# Get server in legacy format
curl http://localhost:3000/api/v0/servers/github?format=legacy
```

### Health Check

**GET** `/health`

Returns the health status of the registry.

#### Response

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-12-15T10:30:00Z",
  "checks": {
    "dataSource": "ok"
  },
  "stats": {
    "totalServers": 11,
    "totalDownloads": 125000,
    "totalStars": 2500,
    "featuredServers": 5,
    "verifiedServers": 8
  }
}
```

## MCP Server Schema

The MCP server schema follows the official specification:

### Server Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | Yes | Schema URL for validation |
| `name` | string | Yes | Unique server name (vendor/slug format) |
| `description` | string | Yes | Server description |
| `version` | string | Yes | Server version |
| `title` | string | No | Display title (if different from name) |
| `websiteUrl` | string | No | Server website URL |
| `repository` | object | No | Repository information |
| `icons` | array | No | Server icons |
| `remotes` | array | No | Remote server endpoints |
| `packages` | array | No | Package registry information |
| `_meta` | object | No | Additional metadata |

### Repository Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | No | Repository URL |
| `source` | string | No | Source platform (e.g., "github", "gitlab") |

### Icon Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `src` | string | Yes | Icon URL |
| `mimeType` | string | No | MIME type of the icon |
| `theme` | string | No | Theme variant ("light" or "dark") |

### Remote Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Transport type ("streamable-http", "sse", "stdio") |
| `url` | string | No | Remote endpoint URL |

### Package Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registryType` | string | Yes | Package registry type ("npm", "pypi", etc.) |
| `registryBaseUrl` | string | Yes | Registry base URL |
| `identifier` | string | Yes | Package identifier |
| `version` | string | Yes | Package version |
| `transport` | object | No | Transport configuration |

### Metadata Object

The `_meta` field contains registry-specific metadata:

```json
{
  "io.modelcontextprotocol.registry/official": {
    "status": "active",
    "publishedAt": "2024-11-28T00:00:00Z",
    "updatedAt": "2024-11-28T16:45:00Z",
    "isLatest": true
  }
}
```

## Compatibility

This registry API is fully compatible with the official MCP registry specification at https://registry.modelcontextprotocol.io/docs. MCP clients can consume this registry just like the official one.

For backwards compatibility with existing applications, the legacy format is still available by adding `?format=legacy` to any request.

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Server not found
- `500` - Internal server error
