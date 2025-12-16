# Handling Example and Demo Data

## Issue

Some server JSON files contain **example/demo data** with non-existent packages or Docker images. For example:

- `docker-analyzer.json` references `mcp/docker-analyzer:1.2.0` which doesn't exist on Docker Hub
- Example GitHub repositories that don't exist

## Solution

The registry fetcher now **gracefully handles** missing packages:

### 1. Non-Fatal Errors
When a registry fetch fails (404, network error, etc.), the system:
- ✅ Logs a warning to the console
- ✅ Returns `null` for that registry info
- ✅ Falls back to static JSON data
- ✅ Continues processing other servers

### 2. Error Handling

```typescript
try {
  const registryInfo = await getPackageInfo(runtime);
  // Use registry data...
} catch (error) {
  // Log but don't fail - use static data as fallback
  console.warn(`Failed to enrich server ${id} from registry`);
}
```

### 3. What You'll See

**Console warnings** (not errors):
```
⚠ Docker image not found: mcp/docker-analyzer:1.2.0 (mcp/docker-analyzer)
⚠ Failed to enrich server docker-analyzer from registry
```

**API still works** - returns static data:
```json
{
  "id": "docker-analyzer",
  "metadata": {
    "name": "Docker Container Analyzer",
    "description": "MCP server running in Docker..."
  },
  "stats": {
    "downloads": 3420,
    "stars": 67
  }
}
```

## Recommendations

### For Demo/Example Data

If you have servers with non-existent packages, you have two options:

**Option 1: Disable registry fetching for that server**
- The system already falls back to static data
- No changes needed!

**Option 2: Use real packages**
Replace example data with real packages:

```json
{
  "runtime": {
    "type": "docker",
    "image": "nginx"  // Real Docker Hub image
  }
}
```

### For Production Data

Ensure your packages exist:

**NPM packages:**
```bash
# Verify package exists
curl https://registry.npmjs.org/@modelcontextprotocol/server-brave-search
```

**Docker images:**
```bash
# Verify image exists
curl https://hub.docker.com/v2/repositories/library/nginx
```

**GitHub repos:**
```bash
# Verify repo exists
curl https://api.github.com/repos/modelcontextprotocol/servers
```

## Testing

The test script will show which packages succeed/fail:

```bash
npm run test:registry
```

Output:
```
✅ NPM fetch successful
✅ Docker Hub fetch successful
✅ GitHub fetch successful
```

Or:
```
❌ Docker Hub fetch failed
⚠️  No stars found
```

## Debugging

### Check Console Logs

Development server logs will show:
```
⚠ Docker image not found: mcp/example:1.0.0 (mcp/example)
⚠ Failed to enrich server example from registry
```

### Verify Package Names

Common issues:
- ❌ `mcp/docker-analyzer` - Doesn't exist
- ✅ `nginx` - Official Docker image
- ❌ `@example/server` - Doesn't exist on npm
- ✅ `@modelcontextprotocol/server-brave-search` - Real npm package

## Impact

**With non-existent packages:**
- ⚠️ Console warnings (expected)
- ✅ API still works
- ✅ Returns static JSON data
- ✅ No crashes or errors

**With real packages:**
- ✅ No warnings
- ✅ Live data from registries
- ✅ Auto-updating stats
- ✅ Current versions

## Summary

The system is **resilient by design**:
- Missing packages → Warning + fallback to static data
- Network errors → Warning + fallback to static data
- Rate limits → Warning + use cache
- Invalid JSON → Error (expected)

Your demo data will work fine with warnings in the console, which is the correct behavior!
