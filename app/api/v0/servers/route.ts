import { NextRequest, NextResponse } from 'next/server';
import { searchServers, getServersInMCPFormat, ServerFilter } from '@/lib/data-loader';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if client wants MCP format (default) or legacy format
    const format = searchParams.get('format') || 'mcp';
    
    // GitHub Copilot parameters
    const limit = searchParams.get('limit');
    const versionFilter = searchParams.get('version');
    const cursor = searchParams.get('cursor');

    // Build filter from query parameters
    const filter: ServerFilter = {
      query: searchParams.get('q') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      vendorId: searchParams.get('vendor') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: limit ? parseInt(limit) : parseInt(searchParams.get('pageSize') || '20'),
      sortBy: (searchParams.get('sortBy') as 'name' | 'downloads' | 'stars' | 'publishedAt' | 'updatedAt') || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // Return MCP format by default (for compatibility with MCP clients)
    if (format === 'mcp') {
      // For MCP format, we need to get ALL servers first (not paginated)
      // because pagination happens AFTER filtering by version and transforming
      const allServersFilter = { ...filter, page: 1, pageSize: 1000 }; // Get all servers
      const result = await getServersInMCPFormat(allServersFilter);
      
      // Apply version filter if requested (GitHub Copilot uses version=latest)
      let filteredServers = result.servers;
      if (versionFilter === 'latest') {
        filteredServers = result.servers.filter(s => 
          s._meta['io.modelcontextprotocol.registry/official']?.isLatest === true
        );
      }
      
      // Apply cursor-based pagination if provided
      if (cursor) {
        const cursorIndex = filteredServers.findIndex(s => 
          `${s.server.name}:${s.server.version}` === cursor
        );
        if (cursorIndex >= 0) {
          // Return servers after the cursor
          filteredServers = filteredServers.slice(cursorIndex + 1);
        }
      }
      
      // Apply limit
      const limitNum = limit ? parseInt(limit) : filteredServers.length;
      const hasMore = filteredServers.length > limitNum;
      const limitedServers = filteredServers.slice(0, limitNum);
      
      // Calculate next cursor if there are more results
      let nextCursor: string | undefined;
      if (hasMore && limitedServers.length > 0) {
        const lastEntry = limitedServers[limitedServers.length - 1];
        nextCursor = `${lastEntry.server.name}:${lastEntry.server.version}`;
      }
      
      const metadata: { nextCursor?: string; count: number } = {
        count: limitedServers.length
      };
      if (nextCursor) {
        metadata.nextCursor = nextCursor;
      }
      
      return addCorsHeaders(NextResponse.json({
        servers: limitedServers,
        metadata
      }));
    }

    // Legacy format for backwards compatibility
    const result = await searchServers(filter);
    return addCorsHeaders(NextResponse.json({
      servers: result.servers,
      pagination: result.pagination
    }));
  } catch (error) {
    console.error('Error fetching servers:', error);
    return addCorsHeaders(NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch servers'
      },
      { status: 500 }
    ));
  }
}
