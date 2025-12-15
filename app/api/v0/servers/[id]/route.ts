import { NextRequest, NextResponse } from 'next/server';
import { getServerById, getServerByIdInMCPFormat } from '@/lib/data-loader';

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
        return NextResponse.json(
          {
            error: 'Not Found',
            message: `Server with id '${id}' not found`
          },
          { status: 404 }
        );
      }

      return NextResponse.json(result);
    }

    // Legacy format
    const server = await getServerById(id);

    if (!server) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: `Server with id '${id}' not found`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      server
    });
  } catch (error) {
    console.error('Error fetching server:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch server'
      },
      { status: 500 }
    );
  }
}
