import { NextRequest, NextResponse } from 'next/server';
import { searchServers, getServersInMCPFormat, ServerFilter } from '@/lib/data-loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if client wants MCP format (default) or legacy format
    const format = searchParams.get('format') || 'mcp';

    // Build filter from query parameters
    const filter: ServerFilter = {
      query: searchParams.get('q') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      vendorId: searchParams.get('vendor') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: (searchParams.get('sortBy') as 'name' | 'downloads' | 'stars' | 'publishedAt' | 'updatedAt') || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // Return MCP format by default (for compatibility with MCP clients)
    if (format === 'mcp') {
      const result = await getServersInMCPFormat(filter);
      return NextResponse.json(result);
    }

    // Legacy format for backwards compatibility
    const result = await searchServers(filter);
    return NextResponse.json({
      servers: result.servers,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch servers'
      },
      { status: 500 }
    );
  }
}
