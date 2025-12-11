# MCP Registry API Test Script

Write-Host "Testing MCP Registry API Endpoints..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v0"

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health Check: $($response.status)" -ForegroundColor Green
    Write-Host "  Total Servers: $($response.stats.totalServers)"
    Write-Host "  Featured: $($response.stats.featuredServers)"
    Write-Host "  Verified: $($response.stats.verifiedServers)"
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: List All Servers
Write-Host "2. Testing List All Servers..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers" -Method Get
    Write-Host "✓ Listed $($response.servers.Count) servers" -ForegroundColor Green
    Write-Host "  Pagination: Page $($response.pagination.page) of $($response.pagination.totalPages)"
} catch {
    Write-Host "✗ List Servers Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Search Servers
Write-Host "3. Testing Search (query: 'github')..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers?q=github" -Method Get
    Write-Host "✓ Found $($response.servers.Count) servers matching 'github'" -ForegroundColor Green
    if ($response.servers.Count -gt 0) {
        Write-Host "  First result: $($response.servers[0].metadata.name)"
    }
} catch {
    Write-Host "✗ Search Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Filter by Tag
Write-Host "4. Testing Filter by Tag (tags: 'database')..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers?tags=database" -Method Get
    Write-Host "✓ Found $($response.servers.Count) servers with tag 'database'" -ForegroundColor Green
    foreach ($server in $response.servers) {
        Write-Host "  - $($server.metadata.name)"
    }
} catch {
    Write-Host "✗ Filter Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Featured Servers
Write-Host "5. Testing Featured Servers..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers?featured=true" -Method Get
    Write-Host "✓ Found $($response.servers.Count) featured servers" -ForegroundColor Green
} catch {
    Write-Host "✗ Featured Filter Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Specific Server
Write-Host "6. Testing Get Server by ID (id: 'filesystem')..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers/filesystem" -Method Get
    Write-Host "✓ Retrieved server: $($response.server.metadata.name)" -ForegroundColor Green
    Write-Host "  Description: $($response.server.metadata.description)"
    Write-Host "  Latest Version: $($response.server.versions[0].version)"
    Write-Host "  Tags: $($response.server.metadata.tags -join ', ')"
} catch {
    Write-Host "✗ Get Server Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Pagination
Write-Host "7. Testing Pagination (pageSize=3)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers?pageSize=3&page=1" -Method Get
    Write-Host "✓ Page 1: $($response.servers.Count) servers" -ForegroundColor Green
    Write-Host "  Has Next: $($response.pagination.hasNext)"
} catch {
    Write-Host "✗ Pagination Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Sort by Downloads
Write-Host "8. Testing Sort by Downloads..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers?sortBy=downloads&sortOrder=desc&pageSize=3" -Method Get
    Write-Host "✓ Top 3 by downloads:" -ForegroundColor Green
    foreach ($server in $response.servers) {
        $downloads = if ($server.stats.downloads) { $server.stats.downloads } else { 0 }
        Write-Host "  - $($server.metadata.name): $downloads downloads"
    }
} catch {
    Write-Host "✗ Sort Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Not Found Error
Write-Host "9. Testing 404 Error (id: 'nonexistent')..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/servers/nonexistent" -Method Get
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Correctly returned 404 Not Found" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "Tests Complete!" -ForegroundColor Cyan
