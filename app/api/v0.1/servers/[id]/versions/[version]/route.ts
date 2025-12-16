import { NextRequest, NextResponse } from 'next/server';
import { getServerByIdInMCPFormat } from '@/lib/data-loader';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  try {
    const { id, version } = await params;
    
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

    // Find the specific version
    const serverVersion = result.servers.find(s => s.server.version === version);
    
    if (!serverVersion) {
      return addCorsHeaders(NextResponse.json(
        {
          error: 'Not Found',
          message: `Version '${version}' not found for server '${id}'`
        },
        { status: 404 }
      ));
    }

    return addCorsHeaders(NextResponse.json({
      servers: [serverVersion],
      metadata: {
        count: 1
      }
    }));
  } catch (error) {
    console.error('Error fetching server version:', error);
    return addCorsHeaders(NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch server version'
      },
      { status: 500 }
    ));
  }
}
