const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  try {
    try {
      await connection.query(
        'ALTER TABLE `categories` ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT FALSE AFTER `order_index`'
      );
      console.log('Added categories.is_featured.');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      console.log('categories.is_featured already exists.');
    }

    await connection.query(`
      UPDATE categories
      SET is_featured = 1
      WHERE is_active = 1 AND parent_id IS NOT NULL
        AND id IN (
          SELECT id FROM (
            SELECT id FROM categories
            WHERE is_active = 1 AND parent_id IS NOT NULL
            ORDER BY order_index ASC, name ASC
            LIMIT 16
          ) AS initial_featured
        )
    `);
    console.log('Featured category migration complete.');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Featured category migration failed:', error);
  process.exit(1);
});
