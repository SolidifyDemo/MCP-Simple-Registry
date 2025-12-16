# Contributing to MCP Registry

Thank you for your interest in contributing to the MCP Registry! This guide will help you add new MCP servers to the registry using our automated IssueOps workflow.

## 🚀 Quick Start: Add a Server via GitHub Issue

The easiest way to contribute a new server is through our GitHub issue form:

1. **[Create a new issue](https://github.com/SolidifyDemo/MCP-Simple-Registry/issues/new?template=add-server.yml)** using the "Add New MCP Server" template
2. Fill out the form with your server details
3. Submit the issue
4. Our automation will create a Pull Request for you! 🎉

## 📝 What Information Do You Need?

### Required Fields

- **Server ID**: Unique identifier (lowercase, alphanumeric, hyphens only)
  - Example: `brave-search`, `postgres-analyzer`
- **Vendor/Organization ID**: Your organization or username
  - Example: `modelcontextprotocol`, `my-company`
- **Display Name**: Human-readable name
  - Example: `Brave Search Server`
- **Tags**: Categories and features (comma-separated)
  - Example: `search, web, api`
- **Runtime Type**: Choose `Node.js (npm)`, `Docker`, or `HTTP (Remote Server)`
- **Package/Image/URL**: 
  - For npm: `@modelcontextprotocol/server-brave-search`
  - For Docker: `mcp/my-server`
  - For HTTP: `https://api.example.com/mcp`

### Optional Fields

- **NPM Arguments**: Additional arguments for npm packages
- **Environment Variables**: Required env vars (KEY=value format)
- **HTTP Headers**: Custom headers for HTTP servers
- **Custom Description**: Override auto-fetched description
- **Custom Homepage**: Override auto-fetched homepage
- **Source Repository**: GitHub URL (for star counts)
- **Flags**: Mark as Featured or Verified

## 🔐 Dynamic Values: Input vs Secrets

All optional fields (NPM arguments, environment variables, HTTP headers) support structured metadata:

### Format: `VALUE|description|isSecret`

Each line has three parts separated by pipes (`|`):
1. **VALUE**: The actual value/name
2. **description**: Human-readable description
3. **isSecret**: `true` for sensitive data, `false` for non-sensitive

### Environment Variables

**Format:** `NAME|description|secret`

**Examples:**
```
API_KEY|Your API key for authentication|true
GITHUB_TOKEN|GitHub personal access token|true
DATABASE_NAME|Name of the database to connect to|false
REGION|AWS region for deployment|false
```

This creates:
```json
"environmentVariables": [
  {
    "name": "API_KEY",
    "description": "Your API key for authentication",
    "isSecret": true,
    "format": "string"
  },
  {
    "name": "DATABASE_NAME",
    "description": "Name of the database to connect to",
    "isSecret": false,
    "format": "string"
  }
]
```

### HTTP Headers

**Format:** `NAME|description|secret`

**Examples:**
```
Authorization|Bearer token for authentication|true
X-API-Version|API version to use|false
X-Client-ID|Client identifier|false
```

### NPM Arguments

**Format:** `VALUE|description|secret`

**Examples:**
```
myorg|Organization name|false
myproject|Project identifier|false
--token=TOKEN|Authentication token placeholder|true
```

## 🤖 How the Automation Works

When you submit your issue:

1. ✅ **Validation**: The workflow validates your input
2. 📝 **JSON Creation**: Creates a minimal JSON file in `data/servers/`
3. 🔀 **Pull Request**: Opens a PR with your server
4. 💬 **Comment**: Posts a comment on your issue with the PR link
5. 🎯 **Review**: Maintainers review and merge the PR

## 📦 What Gets Auto-Fetched?

You only provide minimal information. The registry automatically fetches:

### For NPM Packages
- ✅ Current version number
- ✅ Description
- ✅ Homepage URL
- ✅ License
- ✅ Repository URL
- ✅ Monthly download count
- ✅ GitHub stars (if on GitHub)

### For Docker Images
- ✅ Available tags
- ✅ Description
- ✅ Pull count
- ✅ Star count
- ✅ Last update timestamp

### For HTTP Servers
- ℹ️ No auto-fetching (static metadata only)
- ℹ️ You should provide description and homepage manually
- ✅ GitHub stars (if source repository URL is provided)

## 📋 Examples

### Example 1: NPM Package (Minimal)

```
Server ID: brave-search
Vendor ID: modelcontextprotocol
Display Name: Brave Search Server
Tags: search, web, api
Runtime Type: Node.js (npm)
NPM Package Name: @modelcontextprotocol/server-brave-search
```

**Result**: Creates this JSON file:
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

### Example 2: With Secure Environment Variables

```
Server ID: github
Vendor ID: modelcontextprotocol
Display Name: GitHub Server
Tags: git, github, vcs
Runtime Type: Node.js (npm)
NPM Package Name: @modelcontextprotocol/server-github
Environment Variables:
GITHUB_TOKEN|GitHub personal access token|true
GITHUB_ORG|GitHub organization name|false
```

**Result**: Creates environment variables array with proper `isSecret` flags.

### Example 2b: With Additional Arguments (Input + Secret)

```
Server ID: azure-devops
Vendor ID: azure-devops
Display Name: Azure DevOps MCP Server
Tags: azure, devops, git
Runtime Type: Node.js (npm)
NPM Package Name: @azure-devops/mcp
Additional NPM Arguments:
myorg|Organization name|false
myproject|Project identifier|false
Environment Variables:
ADO_TOKEN|Azure DevOps personal access token|true
ADO_URL|Azure DevOps URL|false
```

**Result**: Creates structured arguments and environment variables with proper secret flags.

**Result**: Creates this JSON file:
```json
{
  "id": "azure-devops",
  "vendorId": "azure-devops",
  "slug": "azure-devops",
  "metadata": {
    "name": "Azure DevOps MCP Server",
    "tags": ["azure", "devops", "git"]
  },
  "versions": [{
    "runtime": {
      "type": "node",
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "${input:ado_org}", "${input:ado_project}"]
    }
  }]
}
```

### Example 3: Docker Container

```
Server ID: postgres-analyzer
Vendor ID: community
Display Name: PostgreSQL Analyzer
Tags: database, postgresql, analysis
Runtime Type: Docker
Docker Image: postgres:latest
Environment Variables:
POSTGRES_PASSWORD=${secret:db_password}
POSTGRES_DB=${input:database_name}
```

### Example 4: HTTP Remote Server

```
Server ID: github-http
Vendor ID: github
Display Name: GitHub MCP Server (HTTP)
Tags: git, github, version-control, http
Runtime Type: HTTP (Remote Server)
HTTP Endpoint URL: https://api.github.com/mcp
Source Repository: https://github.com/github/github-mcp-server
```

### Example 5: HTTP Server with Headers (Secure + Non-Secure)

```
Server ID: custom-api
Vendor ID: my-company
Display Name: Custom API MCP Server
Tags: api, http, custom
Runtime Type: HTTP (Remote Server)
HTTP Endpoint URL: https://api.mycompany.com/mcp
HTTP Headers:
Authorization|Bearer token for API authentication|true
X-API-Version|API version (v2)|false
X-Client-ID|Client identifier|false
X-Tenant-ID|Tenant identifier|false
```

**Result**: Creates HTTP headers array with proper `isSecret` flags for authentication headers.

**Result**: Creates this JSON file:
```json
{
  "id": "custom-api",
  "vendorId": "my-company",
  "slug": "custom-api",
  "metadata": {
    "name": "Custom API MCP Server",
    "tags": ["api", "http", "custom"]
  },
  "versions": [{
    "runtime": {
      "type": "http",
      "url": "https://api.mycompany.com/mcp",
      "headers": {
        "Authorization": "Bearer ${secret:api_token}",
        "X-API-Version": "v2",
        "X-Client-ID": "${input:client_id}"
      }
    }
  }]
}
```

## 🔧 Advanced: Manual PR Submission

If you prefer to create the JSON file manually:

1. Fork this repository
2. Create a new JSON file in `data/servers/` (see [MINIMAL_CONFIG.md](docs/MINIMAL_CONFIG.md))
3. Run validation: `node scripts/validate-server.js data/servers/your-server.json`
4. Commit and create a Pull Request

## ✅ Validation

The automation validates:

- ✅ All required fields are present
- ✅ Server ID format (lowercase, alphanumeric, hyphens)
- ✅ Vendor ID format (lowercase, alphanumeric, hyphens)
- ✅ Runtime configuration matches package type
- ✅ Environment variables are properly formatted
- ✅ JSON syntax is valid

## 🔒 Security Best Practices

### When to Use `${secret:var_name}`

**Always use secrets for:**
- ✅ API tokens and keys
- ✅ Authentication credentials
- ✅ Passwords
- ✅ OAuth tokens
- ✅ Private keys
- ✅ Any data that could compromise security if exposed

**Example:**
```
GITHUB_TOKEN=${secret:github_token}
API_KEY=${secret:api_key}
DATABASE_PASSWORD=${secret:db_password}
Authorization=Bearer ${secret:oauth_token}
```

### When to Use `${input:var_name}`

**Use inputs for:**
- ✅ Organization/account names
- ✅ Project IDs
- ✅ Database names
- ✅ Region/zone selections
- ✅ File paths
- ✅ Client IDs (if non-sensitive)
- ✅ Any non-sensitive configuration

**Example:**
```
ORGANIZATION=${input:org_name}
PROJECT_ID=${input:project}
REGION=${input:region}
X-Client-ID=${input:client_id}
```

### When to Use Plain Text

**Use plain text for:**
- ✅ Static configuration values
- ✅ API versions
- ✅ Non-sensitive constants
- ✅ Feature flags

**Example:**
```
API_VERSION=v2
REGION=us-west-2
X-API-Version=2024-01-01
--verbose
```

### ⚠️ Security Warning

**Never include actual secrets or tokens in your submission!**
- ❌ DON'T: `API_KEY=abc123token456`
- ✅ DO: `API_KEY=${secret:api_key}`

The `${secret:}` and `${input:}` placeholders ensure values are provided securely at runtime, not hardcoded in the registry.

## 🏷️ Server Tags

Choose appropriate tags from these categories:

### By Function
- `search`, `database`, `api`, `web`, `file-system`, `cloud`
- `analysis`, `monitoring`, `security`, `testing`

### By Platform
- `github`, `gitlab`, `aws`, `azure`, `gcp`
- `docker`, `kubernetes`, `postgresql`, `mysql`

### By Type
- `official` (for official MCP servers)
- `community` (community-contributed)
- `enterprise`, `open-source`

## 🎯 Best Practices

1. **Use descriptive tags** - Help users find your server
2. **Provide source URL** - Enables automatic star counting
3. **Document environment variables** - Use clear variable names
4. **Keep it minimal** - Let the registry auto-fetch metadata
5. **Test your package** - Ensure it's published and accessible

## 🐛 Troubleshooting

### Issue: "Validation Failed"
- Check that Server ID and Vendor ID are lowercase with hyphens only
- Ensure you've filled out all required fields
- Verify package name is correct (for npm) or image exists (for Docker)

### Issue: "Missing NPM Package"
- Make sure the package is published to npm
- Use the exact package name including scope (e.g., `@org/package`)

### Issue: "Missing Docker Image"
- Verify the image exists on Docker Hub or specified registry
- Don't include the tag in the image name (we fetch all tags automatically)

## 📞 Need Help?

- 📚 Check [MINIMAL_CONFIG.md](docs/MINIMAL_CONFIG.md) for JSON examples
- 🏗️ See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it works
- 💬 Comment on your issue if you have questions
- 🐛 Report bugs by creating a regular issue

## 📜 Code of Conduct

By contributing, you agree to follow our Code of Conduct and ensure:

- ✅ Your server is functional and tested
- ✅ You have rights to publish this server
- ✅ The server doesn't contain malicious code
- ✅ Information provided is accurate

## 🎉 After Your Server is Merged

Once your PR is merged:

- 🌐 View it on the web: `https://mcp-registry.vercel.app/servers/{your-server-id}`
- 🔌 Access via API: `https://mcp-registry.vercel.app/api/v0/servers/{your-server-id}`
- 📊 Stats update automatically every hour
- ⭐ GitHub stars are tracked (if you provided source URL)

Thank you for contributing to the MCP ecosystem! 🚀
