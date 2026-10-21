const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SITE_URL = 'https://corenix.com.bd';
const records = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/camera-draft-import.json'), 'utf8'));
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function main() {
  if (records.length !== 1000) throw new Error(`Expected 1,000 camera records; found ${records.length}`);
  const skus = records.map((record) => {
    const hash = crypto.createHash('sha1').update(`${record.name}|${record.source_url}`).digest('hex').slice(0, 10);
    return `CAM-${hash.toUpperCase()}`;
  });
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    let updated = 0;
    for (let offset = 0; offset < skus.length; offset += 200) {
      const batch = skus.slice(offset, offset + 200);
      const marks = batch.map(() => '?').join(', ');
      const [result] = await connection.query(
        `UPDATE products SET status = 'published', stock_status = 'Out of Stock'
         WHERE sku IN (${marks}) AND status IN ('draft', 'published')`,
        batch
      );
      updated += result.affectedRows;

      const rewriteText = (table, fields) => {
        const setters = fields.map((field) => `${field} = REPLACE(REPLACE(REPLACE(${field}, ?, ?), ?, ?), ?, ?)`);
        const values = fields.flatMap(() => [
          'This is an unpublished CORENIX draft with zero local stock. Verify the current price, compatibility, warranty, specifications, and availability before publication.',
          'No CORENIX stock is recorded for this product. Its listed price is a third-party retailer reference, not a confirmed CORENIX offer. Verify current pricing, warranty, compatibility, specifications, and availability before ordering.',
          'before publication', 'before ordering',
          'Unpublished catalog draft.', 'Published listing using third-party reference data.',
        ]);
        return connection.query(
          `UPDATE ${table} t JOIN products p ON p.id = t.product_id SET ${setters.join(', ')} WHERE p.sku IN (${marks})`,
          [...values, ...batch]
        );
      };

      await rewriteText('product_descriptions', ['overview', 'rich_content', 'warranty_info']);
      await rewriteText('product_seo', ['meta_desc', 'seo_description', 'og_desc', 'twitter_desc']);
    }

    const categoryDescription = 'Camera and gear listings use reference prices from third-party retailers. These products currently have no CORENIX stock recorded. Confirm price, warranty, compatibility, and availability before ordering.';
    const categoryTitle = 'Camera & Photography Gear | CORENIX';
    await connection.query(
      `UPDATE categories SET short_desc = ?, long_desc = ?, meta_title = ?, meta_desc = ?, focus_keyword = ?, secondary_keywords = ?, canonical_url = ?, og_title = ?, og_desc = ? WHERE slug = 'camera'`,
      [categoryDescription, categoryDescription, categoryTitle, categoryDescription, 'camera and photography gear', 'camera, lenses, camera accessories, photography gear, Bangladesh', `${SITE_URL}/category/camera`, categoryTitle, categoryDescription]
    );

    const [counts] = await connection.query(
      `SELECT COUNT(*) AS total, SUM(status = 'published') AS published, SUM(stock_status = 'Out of Stock') AS out_of_stock
       FROM products WHERE sku IN (${skus.map(() => '?').join(', ')})`, skus
    );
    if (Number(counts[0].total) !== 1000 || Number(counts[0].published) !== 1000 || Number(counts[0].out_of_stock) !== 1000) {
      throw new Error(`Publish verification failed: ${JSON.stringify(counts[0])}`);
    }
    await connection.commit();
    console.log(`Published ${updated} camera and gear products. All 1,000 remain marked Out of Stock; third-party reference price disclosures are visible in product and camera category copy.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Camera publish failed: ${error.message}`);
  process.exitCode = 1;
});
