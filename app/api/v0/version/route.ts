import { NextResponse } from 'next/server';
import { addCorsHeaders, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return addCorsHeaders(NextResponse.json({
    version: '0.1.0',
    apiVersion: 'v0',
    specification: 'https://registry.modelcontextprotocol.io/docs',
    timestamp: new Date().toISOString()
  }));
}
