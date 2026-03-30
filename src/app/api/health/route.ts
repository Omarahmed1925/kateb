import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
