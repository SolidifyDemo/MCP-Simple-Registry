import { NextResponse } from 'next/server';
import { getRegistryStats } from '@/lib/data-loader';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const stats = await getRegistryStats();
    
    return addCorsHeaders(NextResponse.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks: {
        dataSource: 'ok'
      },
      stats
    }));
  } catch (error) {
    console.error('Health check failed:', error);
    return addCorsHeaders(NextResponse.json(
      {
        status: 'error',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        checks: {
          dataSource: 'error'
        },
        error: 'Failed to load server data'
      },
      { status: 500 }
    ));
  }
}
