const mysql = require('mysql2/promise');

const indexes = [
  ['products', 'idx_products_status', ['status', 'is_featured', 'is_hot', 'created_at']],
  ['products', 'idx_products_category', ['category_id', 'status']],
  ['products', 'idx_products_brand', ['brand_id', 'status']],
  ['product_images', 'idx_product_images_product', ['product_id', 'is_primary', 'id']],
  ['categories', 'idx_categories_active', ['is_active', 'is_featured', 'order_index']],
  ['banners', 'idx_banners_active', ['is_active', 'position', 'order_index']],
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  try {
    for (const [table, indexName, columns] of indexes) {
      const [columnRows] = await connection.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [table]
      );
      const existingColumns = new Set(columnRows.map((row) => row.COLUMN_NAME || row.column_name));
      const missingColumns = columns.filter((column) => !existingColumns.has(column));
      if (missingColumns.length > 0) {
        console.log(`Skipping ${indexName}: missing ${missingColumns.join(', ')} on ${table}.`);
        continue;
      }

      const [indexRows] = await connection.query(
        `SELECT 1
         FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?
         LIMIT 1`,
        [table, indexName]
      );
      if (indexRows.length > 0) {
        console.log(`${indexName} already exists.`);
        continue;
      }

      await connection.query(
        `CREATE INDEX \`${indexName}\` ON \`${table}\` (${columns.map((column) => `\`${column}\``).join(', ')})`
      );
      console.log(`Created ${indexName}.`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Performance index migration failed:', error);
  process.exit(1);
});
