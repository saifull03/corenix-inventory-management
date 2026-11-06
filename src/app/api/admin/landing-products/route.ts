import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { ensureLandingProductTable } from '@/lib/landing-products';
import { LANDING_PRODUCT_POSITIONS } from '@/lib/landing-product-config';

const validPosition = (value: string) =>
  LANDING_PRODUCT_POSITIONS.some((position) => position.value === value);

export async function GET(req: NextRequest) {
  try {
    await ensureLandingProductTable();
    const position = new URL(req.url).searchParams.get('position');
    const where = position && validPosition(position) ? 'WHERE lp.position = ?' : '';
    const params = where ? [position] : [];
    const placements = await query<any[]>(
      `SELECT lp.id, lp.position, lp.product_id, lp.order_index, lp.is_active,
              p.name, p.sku, p.selling_price, p.discount_price,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image
       FROM landing_product_placements lp
       JOIN products p ON p.id = lp.product_id
       ${where}
       ORDER BY lp.position, lp.order_index, lp.id`,
      params
    );
    return NextResponse.json({ success: true, placements });
  } catch (error: any) {
    console.error('Fetch landing product placements error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load landing product placements.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureLandingProductTable();
    const body = await req.json();
    const position = String(body.position || '');
    const productIds = Array.isArray(body.productIds)
      ? body.productIds.map(Number).filter((id: number) => Number.isInteger(id) && id > 0)
      : [];
    const config = LANDING_PRODUCT_POSITIONS.find((item) => item.value === position);

    if (!config) {
      return NextResponse.json({ success: false, error: 'Invalid landing page position.' }, { status: 400 });
    }
    if (productIds.length > config.limit) {
      return NextResponse.json(
        { success: false, error: `${config.label} supports up to ${config.limit} products.` },
        { status: 400 }
      );
    }

    const uniqueIds = [...new Set(productIds)];
    await query(`DELETE FROM landing_product_placements WHERE position = ?`, [position]);
    for (const [orderIndex, productId] of uniqueIds.entries()) {
      await query(
        `INSERT INTO landing_product_placements (position, product_id, order_index, is_active)
         SELECT ?, id, ?, 1 FROM products WHERE id = ? AND status = 'published'`,
        [position, productId, orderIndex]
      );
    }

    await logAudit({
      module: 'landing_page',
      action: 'update_product_placements',
      newData: { position, productIds: uniqueIds },
    });

    return NextResponse.json({ success: true, message: 'Landing page products updated.' });
  } catch (error: any) {
    console.error('Update landing product placements error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update landing page products.' }, { status: 500 });
  }
}
