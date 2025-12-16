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

- **Environment Variables**: Required env vars (KEY=value format)
- **Custom Description**: Override auto-fetched description
- **Custom Homepage**: Override auto-fetched homepage
- **Source Repository**: GitHub URL (for star counts)
- **Flags**: Mark as Featured or Verified

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

### Example 2: With Environment Variables

```
Server ID: github
Vendor ID: modelcontextprotocol
Display Name: GitHub Server
Tags: git, github, vcs
Runtime Type: Node.js (npm)
NPM Package Name: @modelcontextprotocol/server-github
Environment Variables:
GITHUB_TOKEN=${secret:github_token}
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
