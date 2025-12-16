import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '@/lib/data-loader';
import { addCorsHeaders } from '@/lib/cors';

/**
 * Manual cache refresh endpoint
 * Clears the cache so the next request will fetch fresh data from registries
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication here to prevent abuse
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.REGISTRY_ADMIN_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    clearCache();
    
    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'Cache cleared successfully. Next request will fetch fresh data from registries.'
    }));
  } catch (error) {
    console.error('Error clearing cache:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    ));
  }
}
