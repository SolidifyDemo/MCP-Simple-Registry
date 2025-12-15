import { NextRequest, NextResponse } from 'next/server';
import { getServerById, getServerByIdInMCPFormat } from '@/lib/data-loader';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Check if client wants MCP format (default) or legacy format
    const format = searchParams.get('format') || 'mcp';

    if (format === 'mcp') {
      const result = await getServerByIdInMCPFormat(id);

      if (!result) {
        return addCorsHeaders(NextResponse.json(
          {
            error: 'Not Found',
            message: `Server with id '${id}' not found`
          },
          { status: 404 }
        ));
      }

      return addCorsHeaders(NextResponse.json(result));
    }

    // Legacy format
    const server = await getServerById(id);

    if (!server) {
      return addCorsHeaders(NextResponse.json(
        {
          error: 'Not Found',
          message: `Server with id '${id}' not found`
        },
        { status: 404 }
      ));
    }

    return addCorsHeaders(NextResponse.json({
      server
    }));
  } catch (error) {
    console.error('Error fetching server:', error);
    return addCorsHeaders(NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch server'
      },
      { status: 500 }
    ));
  }
}
