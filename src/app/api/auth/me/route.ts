import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();
    return NextResponse.json(session, {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=15',
      },
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, userType: null, user: null });
  }
}
