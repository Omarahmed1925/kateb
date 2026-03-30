// This route is a legacy placeholder from the NextAuth migration.
// Authentication is now handled by Firebase Auth.
// This file is kept to prevent 404s on any remaining NextAuth callback URLs.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Auth is handled by Firebase. Use /login instead.' });
}

export async function POST() {
  return NextResponse.json({ message: 'Auth is handled by Firebase. Use /login instead.' });
}
