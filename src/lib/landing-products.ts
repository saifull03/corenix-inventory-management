import { query } from '@/lib/db';
import { LANDING_PRODUCT_POSITIONS } from '@/lib/landing-product-config';

export { LANDING_PRODUCT_POSITIONS };

let tableReady: Promise<void> | null = null;

export function ensureLandingProductTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS landing_product_placements (
        id INT NOT NULL AUTO_INCREMENT,
        position VARCHAR(40) NOT NULL,
        product_id INT NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_landing_position_product (position, product_id),
        KEY idx_landing_position (position, is_active, order_index),
        CONSTRAINT fk_landing_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `).then(() => undefined).catch((error) => {
      tableReady = null;
      throw error;
    });
  }
  return tableReady;
}

export async function getLandingProducts(position: string, limit: number) {
  try {
    await ensureLandingProductTable();
    return query<any[]>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
              (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
       FROM landing_product_placements lp
       JOIN products p ON p.id = lp.product_id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE lp.position = ? AND lp.is_active = 1 AND p.status = 'published'
       ORDER BY lp.order_index ASC, lp.id ASC
       LIMIT ${Math.max(1, Math.min(limit, 24))}`,
      [position]
    );
  } catch (error) {
    console.error('Fetch landing product placement error:', error);
    return [];
  }
}
