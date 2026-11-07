import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position'); // 'hero' | 'sidebar' | 'middle' | 'all'
    const activeOnly = searchParams.get('active') !== 'false'; // default: active only

    let sql = `SELECT * FROM banners WHERE 1=1`;
    const params: any[] = [];

    if (activeOnly) {
      sql += ` AND is_active = 1`;
    }
    if (position && position !== 'all') {
      sql += ` AND position = ?`;
      params.push(position);
    }

    sql += ` ORDER BY order_index ASC, id ASC`;

    const banners = await query<any[]>(sql, params);
    return NextResponse.json({ success: true, banners: banners || [] });
  } catch (error: any) {
    console.error('Fetch banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle = '',
      description = '',
      imageUrl,
      linkUrl,
      buttonText = '',
      cta2Text = '',
      cta2Link = '',
      badgeText = '',
      textColor = 'white',
      position = 'hero',
      orderIndex = 0,
      isActive = true,
    } = body;

    if (position !== 'marquee' && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Banner Image is required.' },
        { status: 400 }
      );
    }
    if (position === 'marquee' && !title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Marquee announcement text is required.' },
        { status: 400 }
      );
    }

    const isPictureOnly = ['hero_collage', 'before_laptops', 'after_laptops', 'after_accessories', 'popup'].includes(position);
    const safeTitle = title?.trim() || '';
    const safeLinkUrl = linkUrl?.trim() || '/products';

    const result = await query<any>(
      `INSERT INTO banners (
        title, subtitle, description, image_url, link_url,
        button_text, cta2_text, cta2_link, badge_text, text_color,
        position, order_index, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeTitle,
        subtitle?.trim() || null,
        description?.trim() || null,
        imageUrl?.trim() || '',
        safeLinkUrl,
        buttonText?.trim() || '',
        cta2Text?.trim() || null,
        cta2Link?.trim() || null,
        badgeText?.trim() || null,
        textColor || 'white',
        position,
        orderIndex,
        isActive ? 1 : 0,
      ]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'banners',
      action: 'create_banner',
      recordId: newId,
      newData: { title, position, imageUrl },
    });

    return NextResponse.json({ success: true, message: 'Banner created', id: newId });
  } catch (error: any) {
    console.error('Create banner error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create banner' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID required.' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM banners WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Banner not found.' }, { status: 404 });
    }

    // Handle the dedicated active toggle request without swallowing full edits.
    if ('isActive' in fields && Object.keys(fields).length === 1) {
      await query(`UPDATE banners SET is_active = ? WHERE id = ?`, [fields.isActive ? 1 : 0, id]);
      return NextResponse.json({ success: true, message: `Banner ${fields.isActive ? 'activated' : 'deactivated'}` });
    }

    // Handle the dedicated order update request without swallowing full edits.
    if ('orderIndex' in fields && Object.keys(fields).length === 1) {
      await query(`UPDATE banners SET order_index = ? WHERE id = ?`, [fields.orderIndex, id]);
      return NextResponse.json({ success: true, message: 'Order updated' });
    }

    // Full update
    const {
      title = existing.title,
      subtitle = existing.subtitle,
      description = existing.description,
      imageUrl = existing.image_url,
      linkUrl = existing.link_url,
      buttonText = existing.button_text,
      cta2Text = existing.cta2_text,
      cta2Link = existing.cta2_link,
      badgeText = existing.badge_text,
      textColor = existing.text_color,
      position = existing.position,
      orderIndex = existing.order_index,
      isActive = existing.is_active,
    } = fields;

    await query(
      `UPDATE banners SET
        title = ?, subtitle = ?, description = ?, image_url = ?, link_url = ?,
        button_text = ?, cta2_text = ?, cta2_link = ?, badge_text = ?, text_color = ?,
        position = ?, order_index = ?, is_active = ?
      WHERE id = ?`,
      [
        title?.trim(),
        subtitle?.trim() || null,
        description?.trim() || null,
        imageUrl?.trim(),
        linkUrl?.trim(),
        buttonText?.trim() || '',
        cta2Text?.trim() || null,
        cta2Link?.trim() || null,
        badgeText?.trim() || null,
        textColor || 'white',
        position,
        orderIndex,
        isActive ? 1 : 0,
        id,
      ]
    );

    await logAudit({
      module: 'banners',
      action: 'update_banner',
      recordId: id,
      newData: { title, position },
    });

    return NextResponse.json({ success: true, message: 'Banner updated' });
  } catch (error: any) {
    console.error('Update banner error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM banners WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Banner not found.' }, { status: 404 });
    }

    await query(`DELETE FROM banners WHERE id = ?`, [id]);

    await logAudit({
      module: 'banners',
      action: 'delete_banner',
      recordId: Number(id),
      oldData: existing,
    });

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error: any) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete banner' }, { status: 500 });
  }
}
