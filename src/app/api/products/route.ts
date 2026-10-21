import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const isPcBuilder = searchParams.get('pc_builder');
    const q = searchParams.get('q');

    const conditions: string[] = ["p.status = 'published'"];
    const params: any[] = [];

    if (category) {
      conditions.push(`p.category_id IN (
        WITH RECURSIVE cat_tree AS (
          SELECT id FROM categories WHERE slug = ?
          UNION ALL
          SELECT c.id FROM categories c JOIN cat_tree ct ON c.parent_id = ct.id
        )
        SELECT id FROM cat_tree
      )`);
      params.push(category);
    }
    if (brand) {
      conditions.push('b.slug = ?');
      params.push(brand);
    }
    if (isPcBuilder === '1') {
      conditions.push('p.is_pc_builder = 1');
    }
    if (q) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.model LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 500);

    const products = await query<any[]>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
              (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.id DESC LIMIT ${limit}`,
      params
    );

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      status = 'published',
      stock_status = 'In Stock',
      purchase_cost,
      selling_price,
      discount_price,
      is_featured = false,
      is_hot = false,
      is_new = false,
      is_pc_builder = false,
      pc_builder_component = null,
      primary_image,
      images = [],
      overview,
      key_features = [],
      specs = [], // Array of { attribute_id, attribute_value }
      inventory = [], // Array of { branch_id, quantity }
      meta_title,
      meta_desc,
      focus_keyword,
    } = body;

    // 0. Auto-resolve slug uniqueness to prevent duplicate key errors
    let baseSlug = (slug || name || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'product-' + Date.now().toString(36);
    let finalSlug = baseSlug;
    let slugCounter = 1;
    while (true) {
      const existing = await query<any[]>(`SELECT id FROM products WHERE slug = ? LIMIT 1`, [finalSlug]);
      if (!existing || existing.length === 0) break;
      slugCounter++;
      finalSlug = `${baseSlug}-${slugCounter}`;
    }

    // 0b. Auto-resolve SKU uniqueness
    let baseSku = (sku || `SKU-${Date.now().toString(36).toUpperCase()}`).trim();
    let finalSku = baseSku;
    let slugSkuCounter = 1;
    while (true) {
      const existing = await query<any[]>(`SELECT id FROM products WHERE sku = ? LIMIT 1`, [finalSku]);
      if (!existing || existing.length === 0) break;
      slugSkuCounter++;
      finalSku = `${baseSku}-${slugSkuCounter}`;
    }

    const discountAmount = discount_price ? selling_price - discount_price : 0;
    const discountPercent = discount_price ? Math.round((discountAmount / selling_price) * 100) : 0;

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

    // 1. Insert product
    const pRes = await query<any>(
      `INSERT INTO products (
        name, slug, sku, model, barcode, mpn, brand_id, category_id, warranty_period, status, stock_status,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_hot, is_new, is_pc_builder,
        pc_builder_component, seo_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 92)`,
      [
        name,
        finalSlug,
        finalSku,
        model || null,
        barcode || null,
        mpn || null,
        brand_id,
        category_id,
        warranty_period || '1 Year Official Warranty',
        status || 'published',
        stock_status || 'In Stock',
        purchase_cost || 0,
        purchase_cost || 0,
        selling_price,
        discount_price || null,
        purchase_cost ? purchase_cost * 1.05 : 0,
        discountAmount,
        discountPercent,
        is_featured ? 1 : 0,
        is_hot ? 1 : 0,
        is_new ? 1 : 0,
        finalIsPcBuilder ? 1 : 0,
        finalPcComponent || null,
      ]
    );

    const productId = (pRes as any).insertId;

    // 2. Primary and gallery images
    const productImages = [...new Set([primary_image, ...(Array.isArray(images) ? images : [])]
      .map((image: any) => typeof image === 'string' ? image : image?.image_url)
      .filter((url: any) => typeof url === 'string' && url.trim()))];
    for (const [index, imageUrl] of productImages.entries()) {
      await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, name, index === 0 ? 1 : 0]
      );
    }

    // 3. Dynamic Specifications
    if (specs && Array.isArray(specs)) {
      for (const s of specs) {
        const val = s.attribute_value || s.value;
        const label = s.custom_label || s.label || s.name || s.key;
        if (!val || !val.toString().trim()) continue;

        let attrId = s.attribute_id;
        if (!attrId && label) {
          const code = (s.key || label).toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
          try {
            const existing = await query<any[]>(`SELECT id FROM attributes WHERE code = ? LIMIT 1`, [code]);
            if (existing && existing.length > 0) {
              attrId = existing[0].id;
            } else {
              const res = await query<any>(`INSERT INTO attributes (name, code) VALUES (?, ?)`, [label, code]);
              attrId = (res as any).insertId;
            }
          } catch {
            // fallback if attributes insert has edge collision
            const fallback = await query<any[]>(`SELECT id FROM attributes LIMIT 1`);
            if (fallback && fallback.length > 0) attrId = fallback[0].id;
          }
        }

        if (attrId) {
          await query(
            `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, custom_label) VALUES (?, ?, ?, ?)`,
            [productId, attrId, val.toString().trim(), label || null]
          );
        }
      }
    }

    // 4. Structured Product Overview & Description
    await query(
      `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
       VALUES (?, ?, ?, ?, ?)`,
      [
        productId,
        overview || '',
        JSON.stringify(key_features),
        'Product, manual, documentation',
        warranty_period || 'Official Manufacturer Warranty'
      ]
    );

    // 5. Dedicated SEO & Schema
    await query(
      `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        meta_title || `${name} Price in Bangladesh | CORENIX`,
        meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
        focus_keyword || name.toLowerCase(),
        `https://corenix.com.bd/product/${finalSlug}`,
        meta_title || `${name} | CORENIX`,
        meta_desc || `Official ${name} available in Bangladesh.`
      ]
    );

    // 6. Location-Based Multi-Branch Inventory
    const branches = await query<any[]>(`SELECT id FROM branches`);
    for (const b of branches) {
      const branchInventory = Array.isArray(inventory)
        ? inventory.find((inv: any) => Number(inv.branch_id) === Number(b.id))
        : undefined;
      const branchStock = branchInventory
        ? Math.max(0, parseInt(branchInventory.quantity, 10) || 0)
        : 5;
      await query(
        `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level, shelf_location)
         VALUES (?, ?, ?, 0, 2, ?)`,
        [productId, b.id, branchStock, `SHELF-${b.id}-01`]
      );
    }

    // 7. Audit Log
    await logAudit({
      module: 'Catalogue',
      action: 'Create Product',
      recordId: productId,
      newData: { name, sku, finalSlug, selling_price },
    });

    return NextResponse.json({ success: true, productId, slug: finalSlug });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
