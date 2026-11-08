import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const categoryIds = body?.categoryIds;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ error: 'A non-empty category order is required.' }, { status: 400 });
    }

    const ids = categoryIds.map((id: unknown) => Number(id));
    if (ids.some((id) => !Number.isInteger(id) || id < 1) || new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: 'Category order contains invalid IDs.' }, { status: 400 });
    }

    for (const [index, categoryId] of ids.entries()) {
      await query(
        'UPDATE categories SET order_index = ? WHERE id = ? AND is_featured = 1',
        [index, categoryId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering categories:', error);
    return NextResponse.json({ error: error.message || 'Error saving category order.' }, { status: 500 });
  }
}
