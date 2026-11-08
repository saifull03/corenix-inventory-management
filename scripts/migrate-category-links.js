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
        'ALTER TABLE `categories` ADD COLUMN `link_url` VARCHAR(500) NULL AFTER `image`'
      );
      console.log('Added categories.link_url.');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      console.log('categories.link_url already exists.');
    }

    await connection.query(`
      UPDATE categories
      SET link_url = CONCAT('/category/', slug)
      WHERE link_url IS NULL OR link_url = ''
    `);
    console.log('Category links migration complete.');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Category links migration failed:', error);
  process.exit(1);
});
