import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position'); // 'hero' | 'hero_collage' | 'sidebar' | 'middle' | 'all'

    let sql = `SELECT * FROM banners WHERE is_active = 1`;
    const params: any[] = [];

    if (position && position !== 'all') {
      sql += ` AND position = ?`;
      params.push(position);
    }

    sql += ` ORDER BY order_index ASC, id ASC`;

    const banners = await query<any[]>(sql, params);
    return NextResponse.json({ success: true, banners: banners || [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('Fetch public banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
  }
}
