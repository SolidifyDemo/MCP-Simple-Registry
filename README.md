This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# MCP Registry

A Model Context Protocol (MCP) server registry that provides both a web interface and an API compatible with the [official MCP registry specification](https://registry.modelcontextprotocol.io/docs).

## Registering on GitHub

When registering this MCP registry on GitHub use `BASE_URL/api` as the registry URL (e.g. `https://mcp-registry.example.com/api`). If you don't keep the `/api` suffix, GitHub will not be able to find the registry endpoints.

## Features

- 🔍 **Web Interface** - Browse and search MCP servers through a user-friendly UI
- 🔌 **API Endpoints** - RESTful API compatible with official MCP registry clients
- 📦 **Dual Format Support** - Returns data in both MCP format (default) and legacy format
- 🏷️ **Filtering & Search** - Filter by tags, vendors, search queries, and more
- ⭐ **Featured & Verified** - Highlight trusted and popular servers
- 🚀 **Dynamic Registry Fetching** - Automatically fetches latest versions and stats from npm, Docker Hub, and GitHub
- ⚡ **Smart Caching** - Intelligent caching reduces external API calls while keeping data fresh
- 🤖 **IssueOps** - Add new servers via GitHub issues with automated PR creation

## API Documentation

See [API.md](./API.md) for complete API documentation.

### Quick API Examples

```bash
# List all servers (MCP format)
curl http://localhost:3000/api/v0/servers

# Search for servers
curl http://localhost:3000/api/v0/servers?q=github

# Get specific server
curl http://localhost:3000/api/v0/servers/github

# Health check
curl http://localhost:3000/api/v0/health
```

## Getting Started

### Installation

```bash
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. (Optional) Add your GitHub token for higher API rate limits:
```bash
GITHUB_TOKEN=your_github_token_here
```

See [Dynamic Registry Fetching](./docs/REGISTRY_FETCHING.md) for more configuration options.

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Documentation

- **[Contributing Guide](./CONTRIBUTING.md)** - Add servers via GitHub issues (IssueOps)
- **[Minimal Server Configuration](./docs/MINIMAL_CONFIG.md)** - Quick guide to adding servers (minimal JSON)
- [API Documentation](./API.md) - Complete API reference
- [Dynamic Registry Fetching](./docs/REGISTRY_FETCHING.md) - Auto-updating from npm, Docker Hub, and GitHub

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
