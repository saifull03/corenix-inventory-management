import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await queryOne<any>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await query<any[]>(
      `SELECT id, image_url, alt_text, is_primary, order_index FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC`,
      [productId]
    );

    const description = await queryOne<any>(
      `SELECT * FROM product_descriptions WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const seo = await queryOne<any>(
      `SELECT * FROM product_seo WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const specs = await query<any[]>(
      `SELECT ps.id, ps.attribute_id, ps.attribute_value, ps.custom_label, a.name as attr_name, a.code as attr_code
       FROM product_specifications ps
       LEFT JOIN attributes a ON ps.attribute_id = a.id
       WHERE ps.product_id = ?
       ORDER BY ps.id ASC`,
      [productId]
    );

    const inventory = await query<any[]>(
      `SELECT b.id as branch_id, b.name as branch_name, b.code as branch_code, b.type as branch_type,
              COALESCE(inv.quantity, 0) as quantity,
              COALESCE(inv.shelf_location, CONCAT('SHELF-', b.id, '-01')) as shelf_location
       FROM branches b
       LEFT JOIN inventory inv ON inv.branch_id = b.id AND inv.product_id = ?
       ORDER BY b.id ASC`,
      [productId]
    );

    return NextResponse.json({
      product: {
        ...product,
        images,
        description,
        seo,
        specs,
        inventory,
      },
    });
  } catch (error: any) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      sku,
      model,
      barcode,
      mpn,
      brand_id,
      category_id,
      warranty_period,
      status,
      stock_status,
      purchase_cost,
      selling_price,
      discount_price,
      is_featured,
      is_hot,
      is_new,
      is_pc_builder,
      pc_builder_component,
      primary_image,
      images,
      overview,
      key_features,
      what_in_box,
      warranty_info,
      specs,
      inventory,
      meta_title,
      meta_desc,
      focus_keyword,
    } = body;

    const discountAmount = discount_price ? Number(selling_price) - Number(discount_price) : 0;
    const discountPercent = discount_price && Number(selling_price) > 0 ? Math.round((discountAmount / Number(selling_price)) * 100) : 0;

    // Handle PC Builder component assignment
    let finalIsPcBuilder = is_pc_builder ? 1 : 0;
    let finalPcComponent: string | null = null;

    if (finalIsPcBuilder) {
      if (pc_builder_component) {
        finalPcComponent = pc_builder_component;
      } else if (category_id) {
        const cat = await queryOne<any>(`SELECT slug, name FROM categories WHERE id = ?`, [category_id]);
        if (cat) {
          const cSlug = (cat.slug || '').toLowerCase();
          const cName = (cat.name || '').toLowerCase();
          
          // Only auto-resolve for genuine standalone components (never complete systems or laptops)
          const isCompleteSystem = cSlug.includes('desktop-pc') || cSlug.includes('laptop') || cSlug.includes('brand-pc') || cSlug.includes('all-in-one');
          if (!isCompleteSystem) {
            if (cSlug.includes('ram') || cSlug.includes('memory') || cSlug.includes('ddr4') || cSlug.includes('ddr5') || (cName.includes('ram') && !cName.includes('laptop'))) finalPcComponent = 'ram';
            else if (cSlug.includes('processor') || cSlug.includes('cpu') || (cName.includes('processor') && !cName.includes('desktop'))) finalPcComponent = 'cpu';
            else if (cSlug.includes('motherboard') || cSlug.includes('mobo') || cName.includes('motherboard')) finalPcComponent = 'motherboard';
            else if (cSlug.includes('cooler') || cSlug.includes('cooling') || cName.includes('cooler')) finalPcComponent = 'cooler';
            else if (cSlug.includes('storage') || cSlug.includes('ssd') || cSlug.includes('hdd') || cSlug.includes('nvme') || cName.includes('ssd')) finalPcComponent = 'storage';
            else if (cSlug.includes('graphics') || cSlug.includes('gpu') || cName.includes('graphics card')) finalPcComponent = 'gpu';
            else if (cSlug.includes('power-supply') || cSlug.includes('psu') || cName.includes('power supply')) finalPcComponent = 'psu';
            else if (cSlug.includes('casing') || cSlug.includes('case') || cSlug.includes('chassis') || cName.includes('casing')) finalPcComponent = 'case';
            else if (cSlug.includes('monitor') || cSlug.includes('display') || cName.includes('monitor')) finalPcComponent = 'monitor';
            else if (cSlug.includes('keyboard') || cName.includes('keyboard')) finalPcComponent = 'keyboard';
            else if (cSlug.includes('mouse') || cSlug.includes('mice') || cName.includes('mouse')) finalPcComponent = 'mouse';
            else if (cSlug.includes('ups') || cName.includes('ups')) finalPcComponent = 'ups';
          }
        }
      }
    }

    // 1. Update Core Product Table
    await query(
      `UPDATE products SET
        name = ?,
        slug = ?,
        sku = ?,
        model = ?,
        barcode = ?,
        mpn = ?,
        brand_id = ?,
        category_id = ?,
        warranty_period = ?,
        status = ?,
        stock_status = ?,
        purchase_cost = ?,
        selling_price = ?,
        discount_price = ?,
        discount_amount = ?,
        discount_percent = ?,
        is_featured = ?,
        is_hot = ?,
        is_new = ?,
        is_pc_builder = ?,
        pc_builder_component = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        slug,
        sku,
        model || null,
        barcode || null,
        mpn || null,
        brand_id,
        category_id,
        warranty_period || '1 Year Official Warranty',
        status || 'published',
        stock_status || 'In Stock',
        purchase_cost || 0,
        selling_price || 0,
        discount_price || null,
        discountAmount,
        discountPercent,
        is_featured ? 1 : 0,
        is_hot ? 1 : 0,
        is_new ? 1 : 0,
        finalIsPcBuilder ? 1 : 0,
        finalPcComponent || null,
        productId,
      ]
    );

    // 2. Replace product images when the edit form sends the full image list.
    if (Array.isArray(images)) {
      const imageUrls = [...new Set([primary_image, ...images]
        .map((image: any) => typeof image === 'string' ? image : image?.image_url)
        .filter((url: any) => typeof url === 'string' && url.trim()))];
      await query(`DELETE FROM product_images WHERE product_id = ?`, [productId]);
      for (const [index, imageUrl] of imageUrls.entries()) {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, ?)`,
          [productId, imageUrl, name, index === 0 ? 1 : 0]
        );
      }
    } else if (primary_image) {
      const existingPrimary = await query<any[]>(
        `SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1`,
        [productId]
      );
      if (existingPrimary && existingPrimary.length > 0) {
        await query(
          `UPDATE product_images SET image_url = ?, alt_text = ? WHERE id = ?`,
          [primary_image, name, existingPrimary[0].id]
        );
      } else {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)`,
          [productId, primary_image, name]
        );
      }
    }

    // 3. Update Descriptions
    const descExists = await queryOne<any>(
      `SELECT id FROM product_descriptions WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const keyFeaturesJson = Array.isArray(key_features)
      ? JSON.stringify(key_features)
      : typeof key_features === 'string'
      ? key_features
      : '[]';

    if (descExists) {
      await query(
        `UPDATE product_descriptions SET
          overview = ?,
          key_features_json = ?,
          what_in_box = ?,
          warranty_info = ?
         WHERE product_id = ?`,
        [
          overview || '',
          keyFeaturesJson,
          what_in_box || 'Product, manual, documentation',
          warranty_info || warranty_period || 'Official Manufacturer Warranty',
          productId,
        ]
      );
    } else {
      await query(
        `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
         VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          overview || '',
          keyFeaturesJson,
          what_in_box || 'Product, manual, documentation',
          warranty_info || warranty_period || 'Official Manufacturer Warranty',
        ]
      );
    }

    // 4. Update SEO
    const seoExists = await queryOne<any>(
      `SELECT id FROM product_seo WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    if (seoExists) {
      await query(
        `UPDATE product_seo SET
          meta_title = ?,
          meta_desc = ?,
          focus_keyword = ?,
          canonical_url = ?
         WHERE product_id = ?`,
        [
          meta_title || `${name} Price in Bangladesh | CORENIX`,
          meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
          focus_keyword || (name || '').toLowerCase(),
          `https://corenix.com.bd/product/${slug}`,
          productId,
        ]
      );
    } else {
      await query(
        `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          meta_title || `${name} Price in Bangladesh | CORENIX`,
          meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
          focus_keyword || (name || '').toLowerCase(),
          `https://corenix.com.bd/product/${slug}`,
          meta_title || `${name} | CORENIX`,
          meta_desc || `Official ${name} available in Bangladesh.`,
        ]
      );
    }

    // 5. Update Inventory per Branch
    if (inventory && Array.isArray(inventory)) {
      for (const inv of inventory) {
        if (!inv.branch_id) continue;
        const qty = parseInt(inv.quantity, 10) || 0;
        const existingInv = await queryOne<any>(
          `SELECT id FROM inventory WHERE product_id = ? AND branch_id = ? LIMIT 1`,
          [productId, inv.branch_id]
        );

        if (existingInv) {
          await query(
            `UPDATE inventory SET quantity = ?, shelf_location = ? WHERE id = ?`,
            [qty, inv.shelf_location || `SHELF-${inv.branch_id}-01`, existingInv.id]
          );
        } else {
          await query(
            `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level, shelf_location)
             VALUES (?, ?, ?, 0, 2, ?)`,
            [productId, inv.branch_id, qty, inv.shelf_location || `SHELF-${inv.branch_id}-01`]
          );
        }
      }
    }

    // 6. Update Specifications if provided
    if (specs && Array.isArray(specs)) {
      await query(`DELETE FROM product_specifications WHERE product_id = ?`, [productId]);
      for (const s of specs) {
        const val = s.attribute_value || s.value;
        const label = s.custom_label || s.label || s.attr_name || s.name;
        if (!val || !val.toString().trim()) continue;

        let attrId = s.attribute_id;
        if (!attrId && label) {
          const code = label.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
          const existingAttr = await queryOne<any>(`SELECT id FROM attributes WHERE code = ? LIMIT 1`, [code]);
          if (existingAttr) {
            attrId = existingAttr.id;
          } else {
            const res = await query<any>(`INSERT INTO attributes (name, code) VALUES (?, ?)`, [label, code]);
            attrId = (res as any).insertId;
          }
        }

        if (attrId) {
          await query(
            `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, custom_label)
             VALUES (?, ?, ?, ?)`,
            [productId, attrId, val.toString().trim(), label || null]
          );
        }
      }
    }

    // 7. Audit Log
    await logAudit({
      module: 'Catalogue',
      action: 'Edit Product',
      recordId: productId,
      newData: { name, sku, slug, selling_price, status },
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Set to archived / draft rather than hard cascade delete to maintain foreign key integrity with orders
    await query(`UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ?`, [productId]);

    await logAudit({
      module: 'Catalogue',
      action: 'Archive Product',
      recordId: productId,
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const allowedFields = ['is_featured', 'is_hot', 'is_new', 'is_sale', 'is_pc_builder', 'status', 'stock_status', 'selling_price', 'discount_price'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`\`${field}\` = ?`);
        const val = body[field];
        values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    updates.push('`updated_at` = NOW()');
    values.push(productId);

    await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    // Audit log
    await logAudit({
      module: 'Catalogue',
      action: 'Quick Toggle Product Status',
      recordId: productId,
      newData: body,
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Patch product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
