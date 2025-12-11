import { NextRequest, NextResponse } from 'next/server';
import { searchServers, ServerFilter } from '@/lib/data-loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter from query parameters
    const filter: ServerFilter = {
      query: searchParams.get('q') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      vendorId: searchParams.get('vendor') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: (searchParams.get('sortBy') as any) || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    };

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
