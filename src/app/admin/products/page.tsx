import React from 'react';
import { query } from '@/lib/db';
import ProductsManager, { ProductItem } from '@/components/admin/ProductsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await query<ProductItem[]>(
    `SELECT p.*,
            b.name as brand_name,
            c.name as category_name,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
            (SELECT SUM(quantity) FROM inventory WHERE product_id = p.id) as total_stock,
            (SELECT pd.overview FROM product_descriptions pd WHERE pd.product_id = p.id LIMIT 1) as overview,
            (SELECT pd.key_features_json FROM product_descriptions pd WHERE pd.product_id = p.id LIMIT 1) as key_features_json,
            (SELECT COUNT(*) FROM product_specifications ps WHERE ps.product_id = p.id) as specification_count,
            (SELECT seo.meta_title FROM product_seo seo WHERE seo.product_id = p.id LIMIT 1) as meta_title,
            (SELECT seo.meta_desc FROM product_seo seo WHERE seo.product_id = p.id LIMIT 1) as meta_desc,
            (SELECT seo.focus_keyword FROM product_seo seo WHERE seo.product_id = p.id LIMIT 1) as focus_keyword
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     GROUP BY p.id
     ORDER BY p.id DESC`
  );

  return <ProductsManager initialProducts={products} />;
}
