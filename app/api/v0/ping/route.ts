import { NextResponse } from 'next/server';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return addCorsHeaders(NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
}
