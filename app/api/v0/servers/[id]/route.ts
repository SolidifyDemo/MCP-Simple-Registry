import { NextRequest, NextResponse } from 'next/server';
import { getServerById } from '@/lib/data-loader';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
