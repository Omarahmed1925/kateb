import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    // During build time, just return OK without DB check
    if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: 'skipped',
      });
    }

    const { db } = await import('@/lib/db/client');

    // Test database connection
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        db: 'error',
        error: error?.message || 'Unknown error',
      },
      { status: 503 }
    );
  }
}

