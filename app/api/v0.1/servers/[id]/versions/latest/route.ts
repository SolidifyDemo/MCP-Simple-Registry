import { NextRequest, NextResponse } from 'next/server';
import { getServerByIdInMCPFormat } from '@/lib/data-loader';
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

    // Return only the latest version (first in the array)
    const latestServer = result.servers[0];
    
    return addCorsHeaders(NextResponse.json({
      servers: [latestServer],
      metadata: {
        count: 1
      }
    }));
  } catch (error) {
    console.error('Error fetching latest server version:', error);
    return addCorsHeaders(NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch server'
      },
      { status: 500 }
    ));
  }
}
