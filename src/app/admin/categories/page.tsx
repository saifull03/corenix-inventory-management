import React from 'react';
import { query } from '@/lib/db';
import CategoriesManager from '@/components/admin/CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await query<any[]>(
    `SELECT c.*, p.name as parent_name,
            (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
     FROM categories c
     LEFT JOIN categories p ON c.parent_id = p.id
     ORDER BY c.order_index ASC, c.name ASC`
  );

  return <CategoriesManager initialCategories={categories} />;
}
