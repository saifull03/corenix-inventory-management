const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SITE_URL = 'https://corenix.com.bd';
const records = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/laptop-import.json'), 'utf8'));
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

const brands = [
  'Microsoft Surface', 'Gigabyte', 'Microsoft', 'MacBook', 'Lenovo', 'Walton', 'Chuwi',
  'Fujitsu', 'Tecno', 'Infinix', 'Huawei', 'Xiaomi', 'Razer', 'Apple', 'ASUS', 'Asus',
  'Acer', 'Dell', 'MSI', 'HP', 'Honor', 'Avita', 'Doel', 'Samsung', 'LG', 'Toshiba', 'Haier',
];
brands.sort((a, b) => b.length - a.length);

function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 220);
}

function brandFor(name) {
  if (/^MacBook\b/i.test(name)) return 'Apple';
  const found = brands.find((brand) => String(name).toLowerCase().startsWith(brand.toLowerCase()));
  return found ? (found === 'MacBook' ? 'Apple' : found) : 'Other';
}

function categorySlug(record) {
  const name = record.name.toLowerCase();
  if (/gaming laptop|\brog\b|tuf gaming|predator|nitro|legion|loq|katana|cyborg|victus|omen|\brtx\b|\bgtx\b/.test(name)) return 'gaming-laptop';
  if (/business laptop|ultrabook|thinkpad|latitude|expertbook|surface laptop|\bxps\b|zenbook|yoga pro/.test(name)) return 'ultrabook';
  if (record.price < 80000 || /celeron|pentium|n4020|n5030/.test(name)) return 'budget-laptop';
  return 'laptops';
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function buildCopy(record, brand, slug, sku) {
  const features = [...new Set((record.features || []).map((item) => String(item).trim()).filter(Boolean))].slice(0, 8);
  const featureSentence = features.length
    ? `Source-listed specifications: ${features.join('; ')}.`
    : 'Specifications should be confirmed against the source listing and manufacturer.';
  const priceText = record.price_text || `৳${record.price}`;
  const overview = `${record.name}. ${featureSentence} Reference price from ${record.source}: ${priceText} (BDT), not a confirmed CORENIX offer. No CORENIX stock is recorded. Verify current price, warranty, specifications, and availability before ordering.`;
  const description = `${record.name} laptop listing at CORENIX. Reference price from ${record.source}: ${priceText}; this is not a confirmed CORENIX offer. No local stock is recorded. Confirm specifications, warranty, price, and availability before ordering.`;
  const title = `${record.name} Price in Bangladesh | CORENIX`.slice(0, 250);
  const keywords = `${brand}, ${record.name}, laptop price Bangladesh, laptop specifications, notebook computer`;
  const faq = JSON.stringify([
    { question: `What is the ${record.name} reference price?`, answer: `${priceText} is the price shown by ${record.source}; it is not a confirmed CORENIX offer.` },
    { question: `Is the ${record.name} in stock at CORENIX?`, answer: 'No local stock is recorded for this listing. Confirm availability with CORENIX before ordering.' },
    { question: `Are warranty details confirmed for the ${record.name}?`, answer: 'Warranty terms have not been verified. Confirm the current terms with the retailer and manufacturer before ordering.' },
  ]);
  const specsHtml = features.length
    ? `<ul>${features.map((feature) => `<li>${esc(feature)}</li>`).join('')}</ul>`
    : '<p>Confirm detailed specifications from the retailer or manufacturer.</p>';
  const richContent = `<p>${esc(overview)}</p><h2>Source-listed specifications</h2>${specsHtml}<p><a href="${esc(record.url)}" rel="nofollow noopener noreferrer">View the ${esc(record.source)} source listing</a></p><p>Confirm source pricing, warranty, specifications, and availability before ordering.</p>`;
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: record.name,
    description: overview,
    sku,
    brand: { '@type': 'Brand', name: brand },
    category: 'Laptop',
  });
  return {
    overview,
    features: JSON.stringify(features),
    richContent,
    faq,
    warrantyInfo: 'Warranty terms are unverified. Confirm the current terms with the source retailer and manufacturer before ordering.',
    title,
    description,
    seoDescription: overview,
    focusKeyword: `${record.name} price Bangladesh`.slice(0, 100),
    secondaryKeywords: keywords.slice(0, 255),
    canonical: `${SITE_URL}/product/${slug}`,
    imageAlt: `${record.name} laptop product image`.slice(0, 255),
    schema,
  };
}

async function main() {
  if (records.length !== 100) throw new Error(`Expected exactly 100 laptop records; found ${records.length}`);
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    const [categoryRows] = await connection.query("SELECT id, slug FROM categories WHERE slug IN ('laptops', 'gaming-laptop', 'ultrabook', 'budget-laptop')");
    const categoryIds = new Map(categoryRows.map((item) => [item.slug, item.id]));
    if (!categoryIds.has('laptops')) throw new Error('Laptops category is missing');
    const [branches] = await connection.query('SELECT id FROM branches WHERE is_active = 1');
    const brandIds = new Map();
    const slugCounts = new Map();

    const categoryDescription = 'Laptop listings use reference prices from third-party retailers. The newly added source-priced listings currently have no CORENIX stock recorded. Confirm the current price, specifications, warranty, and availability before ordering.';
    const categoryTitle = 'Laptops Price in Bangladesh | CORENIX';
    await connection.query(
      `UPDATE categories SET short_desc = ?, long_desc = ?, meta_title = ?, meta_desc = ?, focus_keyword = ?, secondary_keywords = ?, canonical_url = ?, og_title = ?, og_desc = ? WHERE slug = 'laptops'`,
      [categoryDescription, categoryDescription, categoryTitle, categoryDescription, 'laptop price Bangladesh', 'laptop, notebook, gaming laptop, laptop specifications, Bangladesh', `${SITE_URL}/category/laptops`, categoryTitle, categoryDescription]
    );

    for (const record of records) {
      const brandName = brandFor(record.name);
      let brandId = brandIds.get(brandName.toLowerCase());
      if (!brandId) {
        const brandSlug = slugify(brandName) || 'other';
        const brandTitle = `${brandName} Laptop Price in Bangladesh | CORENIX`;
        const brandDescription = `Laptop products attributed to ${brandName} by the source retailer. Verify details before ordering.`;
        await connection.query(
          `INSERT INTO brands (name, slug, description, short_desc, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), short_desc = VALUES(short_desc), meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc), focus_keyword = VALUES(focus_keyword), canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), og_desc = VALUES(og_desc)`,
          [brandName, brandSlug, brandDescription, brandDescription, brandTitle, brandDescription, `${brandName} laptop`, `${SITE_URL}/brand/${brandSlug}`, brandTitle, brandDescription]
        );
        const [rows] = await connection.query('SELECT id FROM brands WHERE slug = ? LIMIT 1', [brandSlug]);
        brandId = rows[0].id;
        brandIds.set(brandName.toLowerCase(), brandId);
      }

      const hash = crypto.createHash('sha1').update(`${record.name}|${record.url}`).digest('hex').slice(0, 10);
      const sku = `LAP-${hash.toUpperCase()}`;
      const baseSlug = slugify(record.name) || 'laptop';
      const slugCount = (slugCounts.get(baseSlug) || 0) + 1;
      slugCounts.set(baseSlug, slugCount);
      const slug = slugCount === 1 ? baseSlug : `${baseSlug}-${hash}`;
      const categoryId = categoryIds.get(categorySlug(record)) || categoryIds.get('laptops');
      const copy = buildCopy(record, brandName, slug, sku);

      await connection.query(
        `INSERT INTO products (name, slug, sku, brand_id, category_id, warranty_period, status, stock_status, purchase_cost, avg_cost, selling_price, discount_price, min_selling_price, discount_amount, discount_percent, is_featured, is_new, is_hot, is_sale, sales_count, rating_avg, rating_count, seo_score)
         VALUES (?, ?, ?, ?, ?, 'Unverified; see source listing', 'published', 'Out of Stock', 0, 0, ?, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90)
         ON DUPLICATE KEY UPDATE name = VALUES(name), brand_id = VALUES(brand_id), category_id = VALUES(category_id), status = 'published', stock_status = 'Out of Stock', selling_price = VALUES(selling_price), discount_price = NULL, purchase_cost = 0, avg_cost = 0, min_selling_price = 0, discount_amount = 0, discount_percent = 0, sales_count = 0, rating_avg = 0, rating_count = 0, seo_score = 90`,
        [record.name, slug, sku, brandId, categoryId, Number(record.price)]
      );
      const [productRows] = await connection.query('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
      const productId = productRows[0].id;
      await connection.query(
        `INSERT INTO product_descriptions (product_id, overview, key_features_json, rich_content, what_in_box, warranty_info, faq_json)
         VALUES (?, ?, ?, ?, NULL, ?, ?)
         ON DUPLICATE KEY UPDATE overview = VALUES(overview), key_features_json = VALUES(key_features_json), rich_content = VALUES(rich_content), what_in_box = NULL, warranty_info = VALUES(warranty_info), faq_json = VALUES(faq_json)`,
        [productId, copy.overview, copy.features, copy.richContent, copy.warrantyInfo, copy.faq]
      );
      await connection.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, secondary_keywords, seo_description, canonical_url, og_title, og_desc, og_image, twitter_title, twitter_desc, image_alt, structured_data_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc), focus_keyword = VALUES(focus_keyword), secondary_keywords = VALUES(secondary_keywords), seo_description = VALUES(seo_description), canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), og_desc = VALUES(og_desc), og_image = NULL, twitter_title = VALUES(twitter_title), twitter_desc = VALUES(twitter_desc), image_alt = VALUES(image_alt), structured_data_json = VALUES(structured_data_json)`,
        [productId, copy.title, copy.description, copy.focusKeyword, copy.secondaryKeywords, copy.seoDescription, copy.canonical, copy.title, copy.description, copy.title, copy.description, copy.imageAlt, copy.schema]
      );

      for (const branch of branches) {
        await connection.query(
          `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, incoming_qty, damaged_qty, rma_qty)
           VALUES (?, ?, 0, 0, 0, 0, 0)
           ON DUPLICATE KEY UPDATE quantity = 0, reserved_qty = 0, incoming_qty = 0, damaged_qty = 0, rma_qty = 0`,
          [productId, branch.id]
        );
      }
    }

    const skus = records.map((record) => `LAP-${crypto.createHash('sha1').update(`${record.name}|${record.url}`).digest('hex').slice(0, 10).toUpperCase()}`);
    const [verify] = await connection.query(
      `SELECT COUNT(*) AS total, SUM(status = 'published') AS published, SUM(stock_status = 'Out of Stock') AS out_of_stock
       FROM products WHERE sku IN (${skus.map(() => '?').join(', ')})`, skus
    );
    if (Number(verify[0].total) !== 100 || Number(verify[0].published) !== 100 || Number(verify[0].out_of_stock) !== 100) {
      throw new Error(`Laptop import verification failed: ${JSON.stringify(verify[0])}`);
    }
    await connection.commit();
    console.log('Imported and published 100 unique laptop listings with SEO details, source-price disclosures, and zero stock at active branches.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Laptop import failed: ${error.message}`);
  process.exitCode = 1;
});
