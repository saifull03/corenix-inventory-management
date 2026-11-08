import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const categories = await query<any[]>(
      `SELECT c.*, p.name as parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ORDER BY c.order_index ASC, c.name ASC`
    );
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      image,
      link_url,
      parent_id,
      h1,
      short_desc,
      long_desc,
      meta_title,
      meta_desc,
      focus_keyword,
      is_featured,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const finalSlug = (slug?.trim() || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!finalSlug) {
      return NextResponse.json({ error: 'Invalid category slug generated.' }, { status: 400 });
    }

    // Check slug collision
    const existing = await queryOne<any>(`SELECT id, name FROM categories WHERE slug = ?`, [finalSlug]);
    if (existing) {
      return NextResponse.json(
        { error: `A category with slug '${finalSlug}' already exists (${existing.name}).` },
        { status: 409 }
      );
    }

    const res = await query<any>(
      `INSERT INTO categories (
        parent_id, name, slug, image, link_url, h1, short_desc, long_desc, meta_title, meta_desc, focus_keyword, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        parent_id ? parseInt(parent_id) : null,
        cleanName,
        finalSlug,
        image?.trim() || null,
        link_url?.trim() || `/category/${finalSlug}`,
        h1?.trim() || `${cleanName} Price in Bangladesh`,
        short_desc?.trim() || `Browse authentic ${cleanName} products at CORENIX with official manufacturer warranty.`,
        long_desc?.trim() || '',
        meta_title?.trim() || `${cleanName} Price in Bangladesh | Official CORENIX`,
        meta_desc?.trim() || `Buy genuine ${cleanName} in Bangladesh with official manufacturer warranty and fast delivery.`,
        focus_keyword?.trim() || cleanName.toLowerCase(),
        is_featured ? 1 : 0,
      ]
    );

    const categoryId = (res as any).insertId;

    await logAudit({
      module: 'Categories',
      action: 'Create Category',
      recordId: categoryId,
      newData: { name: cleanName, slug: finalSlug, parent_id },
    });

    const newCategory = await queryOne<any>(
      `SELECT c.*, p.name as parent_name, 0 as product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.id = ?`,
      [categoryId]
    );

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Error creating category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      slug,
      image,
      link_url,
      parent_id,
      h1,
      short_desc,
      long_desc,
      meta_title,
      meta_desc,
      is_active,
      is_featured,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required for updating.' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM categories WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const cleanName = (name !== undefined ? name : existing.name).trim();
    const finalSlug = (slug !== undefined ? slug : existing.slug)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (finalSlug !== existing.slug) {
      const slugCollision = await queryOne<any>(`SELECT id FROM categories WHERE slug = ? AND id != ?`, [finalSlug, id]);
      if (slugCollision) {
        return NextResponse.json({ error: `Slug '${finalSlug}' is already used by another category.` }, { status: 409 });
      }
    }

    await query(
      `UPDATE categories SET
        name = ?,
        slug = ?,
        image = ?,
        link_url = ?,
        parent_id = ?,
        h1 = ?,
        short_desc = ?,
        long_desc = ?,
        meta_title = ?,
        meta_desc = ?,
        is_featured = ?,
        is_active = ?
      WHERE id = ?`,
      [
        cleanName,
        finalSlug,
        image !== undefined ? image : existing.image,
        link_url !== undefined ? (link_url.trim() || `/category/${finalSlug}`) : (existing.link_url || `/category/${finalSlug}`),
        parent_id !== undefined ? (parent_id ? parseInt(parent_id) : null) : existing.parent_id,
        h1 !== undefined ? h1 : existing.h1,
        short_desc !== undefined ? short_desc : existing.short_desc,
        long_desc !== undefined ? long_desc : existing.long_desc,
        meta_title !== undefined ? meta_title : existing.meta_title,
        meta_desc !== undefined ? meta_desc : existing.meta_desc,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id,
      ]
    );

    await logAudit({
      module: 'Categories',
      action: 'Update Category',
      recordId: id,
      oldData: existing,
      newData: { id, name: cleanName, slug: finalSlug },
    });

    const updated = await queryOne<any>(
      `SELECT c.*, p.name as parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.id = ?`,
      [id]
    );

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message || 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = idParam ? parseInt(idParam) : null;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM categories WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    // Check if products exist in category
    const [prodCount] = await query<any[]>(
      `SELECT COUNT(*) as count FROM products WHERE category_id = ?`,
      [id]
    );
    if (prodCount && prodCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete '${existing.name}' because ${prodCount.count} product(s) belong to this category.` },
        { status: 400 }
      );
    }

    // Check if subcategories exist under this category
    const [subCount] = await query<any[]>(
      `SELECT COUNT(*) as count FROM categories WHERE parent_id = ?`,
      [id]
    );
    if (subCount && subCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete '${existing.name}' because it contains ${subCount.count} subcategory/subcategories. Please delete or reassign them first.` },
        { status: 400 }
      );
    }

    await query(`DELETE FROM categories WHERE id = ?`, [id]);

    await logAudit({
      module: 'Categories',
      action: 'Delete Category',
      recordId: id,
      oldData: existing,
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Error deleting category' }, { status: 500 });
  }
}
