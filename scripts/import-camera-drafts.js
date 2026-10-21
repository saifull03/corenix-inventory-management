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

const categorySpecs = [
  { slug: 'camera-accessories', name: 'Camera Accessories', description: 'Camera bags, batteries, filters, mounts, and photography accessories.' },
  { slug: 'camera-lighting', name: 'Camera Lighting & Grip', description: 'Lighting, softboxes, studio flash, and grip equipment for photography and video.' },
  { slug: 'camera-audio', name: 'Camera Audio & Microphones', description: 'Microphones and audio equipment for camera, video, and creator workflows.' },
  { slug: 'camera-storage', name: 'Camera Storage & Power', description: 'Memory cards, storage, batteries, and chargers for camera equipment.' },
  { slug: 'camera-drone', name: 'Camera Drones', description: 'Camera drones and related aerial imaging products.' },
];

const knownBrands = [
  'K&F Concept', '7Artisans', 'SmallRig', 'Insta360', 'Fujifilm', 'Hollyland', 'Manfrotto',
  'Western Digital', 'SanDisk', 'Saramonic', 'Feelworld', 'Zhiyun', 'Yongnuo', 'Yunteng',
  'Digipod', 'Kingjoy', 'Telesin', 'Viltrox', 'Godox', 'Canon', 'Nikon', 'Sony', 'Sigma',
  'Tamron', 'Sirui', 'Samyang', 'DJI', 'GoPro', 'JVC', 'Jmary', 'Ulanzi', 'Boya', 'BOYA',
  'SJCAM', 'Rode', 'RODE', 'Lexar', 'Kingston', 'Samsung', 'Transcend', 'Patriot', 'PNY',
  'Marumi', 'Kenko', 'Neewer', 'Simpex', 'Aputure', 'Nanlite', 'Amaran', 'Baseus', 'Havit',
  'Apple', 'BRDRC', 'TELESIN', 'aMagisn', 'PLOKAMA', 'Fantech', 'Jinbei', 'Qihe', 'JVC',
];
knownBrands.sort((a, b) => b.length - a.length);

function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 220);
}

function brandFor(name) {
  const value = String(name).trim();
  const found = knownBrands.find((brand) => new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\b|\\s|[-/#])`, 'i').test(value));
  return found ? found.replace(/^\w/, (letter) => letter.toUpperCase()) : 'Other';
}

function categorySlug(record) {
  const sourceCategory = String(record.category || '').toLowerCase();
  const name = String(record.name || '').toLowerCase();
  if (sourceCategory.includes('mirrorless')) return 'mirrorless-camera';
  if (sourceCategory.includes('action camera')) return 'action-camera';
  if (sourceCategory === 'camera' && /\bmirrorless\b/.test(name)) return 'mirrorless-camera';
  if (sourceCategory === 'camera' && /\bds?lr\b/.test(name)) return 'dslr-camera';
  if (sourceCategory === 'camera' && /\baction camera\b/.test(name)) return 'action-camera';
  if (/\bdrone\b/.test(sourceCategory) || /\bdrone\b/.test(name)) return 'camera-drone';
  if (/\blens\b|filter/.test(sourceCategory) || /\blens\b/.test(name)) return 'camera-lens';
  if (/tripod|monopod|ball head|gimbal|stabilizer/.test(sourceCategory) || /tripod|monopod|gimbal|stabilizer/.test(name)) return 'tripod-gimbal';
  if (/lighting|softbox|reflector/.test(sourceCategory) || /softbox|reflector|studio light|video light|flash light|ring light/.test(name)) return 'camera-lighting';
  if (/microphone|podcast|audio/.test(sourceCategory) || /microphone|\bmic\b|audio recorder/.test(name)) return 'camera-audio';
  if (/memory|storage|card reader/.test(sourceCategory) || /memory card|sd card|card reader/.test(name)) return 'camera-storage';
  if (sourceCategory === 'camera') return 'camera';
  return 'camera-accessories';
}

function truncate(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function productCopy(record, brand, slug, sku) {
  const featureList = [...new Set((record.features || []).map((item) => String(item).trim()).filter(Boolean))].slice(0, 10);
  const featureSentence = featureList.length ? `Source-listed details include ${featureList.join('; ')}.` : 'Detailed specifications require confirmation from the source listing or manufacturer.';
  const rangeNote = `Source-listed reference price: ${record.price_text || `৳${record.price}`} (BDT).`;
  const overview = `${record.name}. ${featureSentence} ${rangeNote} This is an unpublished CORENIX draft with zero local stock. Verify the current price, compatibility, warranty, specifications, and availability before publication.`;
  const description = truncate(`${record.name} camera product listing at CORENIX. ${featureSentence} Source-listed reference price ${record.price_text || `৳${record.price}`} BDT. Confirm current price, compatibility, warranty, and availability before publication.`, 320);
  const seoDescription = `${overview} Source: ${record.source}.`;
  const secondary = [brand, record.category, 'camera gear', 'photography accessories', 'Bangladesh price']
    .filter(Boolean).join(', ');
  const title = truncate(`${record.name} Price in Bangladesh | CORENIX`, 250);
  const faq = [
    { question: `What is the ${record.name} source price?`, answer: `${rangeNote} This is a reference from ${record.source}, not a confirmed CORENIX selling offer.` },
    { question: `Is the ${record.name} in stock at CORENIX?`, answer: 'No local stock is recorded for this unpublished draft. Check with CORENIX before ordering.' },
    { question: `Are compatibility and warranty details confirmed for the ${record.name}?`, answer: 'Not yet. Confirm compatibility and warranty terms against the manufacturer and current source listing before publishing.' },
  ];
  const sourceLink = `<a href="${escapeHtml(record.source_url)}" rel="nofollow noopener noreferrer">${escapeHtml(record.source)} source listing</a>`;
  const featuresHtml = featureList.length
    ? `<ul>${featureList.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>`
    : '<p>Confirm detailed specifications from the source listing or manufacturer before publication.</p>';
  const richContent = `<p>${escapeHtml(overview)}</p><h2>Source-listed details</h2>${featuresHtml}<p>${escapeHtml(rangeNote)} Source: ${sourceLink}. Listing availability: ${escapeHtml(record.availability || 'verify at source')}.</p><p>Unpublished catalog draft. Confirm pricing, warranty, compatibility, specifications, and availability before publication.</p>`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: record.name,
    description: truncate(overview, 1000),
    sku,
    brand: { '@type': 'Brand', name: brand },
    category: record.category || 'Camera',
  };
  return {
    overview,
    featureList,
    richContent,
    faq: JSON.stringify(faq),
    title,
    description,
    seoDescription,
    focusKeyword: truncate(`${record.name} price Bangladesh`, 100),
    secondaryKeywords: truncate(secondary, 255),
    canonical: `${SITE_URL}/product/${slug}`,
    imageAlt: truncate(`${record.name} camera product image`, 255),
    structuredData: JSON.stringify(structuredData),
  };
}

async function main() {
  if (records.length !== 1000) throw new Error(`Expected exactly 1,000 source records; found ${records.length}`);
  const connection = await mysql.createConnection(dbConfig);
  let inserted = 0;
  try {
    await connection.beginTransaction();
    const [cameraRows] = await connection.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', ['camera']);
    if (!cameraRows.length) throw new Error('Camera parent category is missing');
    const cameraId = cameraRows[0].id;

    for (const category of categorySpecs) {
      const title = `${category.name} Price in Bangladesh | CORENIX`;
      const description = `${category.description} Browse camera products in the CORENIX catalog.`;
      await connection.query(
        `INSERT INTO categories (parent_id, name, slug, h1, short_desc, long_desc, meta_title, meta_desc, focus_keyword, secondary_keywords, canonical_url, og_title, og_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), h1 = VALUES(h1), short_desc = VALUES(short_desc), long_desc = VALUES(long_desc), meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc), focus_keyword = VALUES(focus_keyword), secondary_keywords = VALUES(secondary_keywords), canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), og_desc = VALUES(og_desc)`,
        [cameraId, category.name, category.slug, category.name, description, description, title, description, category.name.toLowerCase(), 'camera, photography, camera gear, Bangladesh', `${SITE_URL}/category/${category.slug}`, title, description]
      );
    }

    const [branches] = await connection.query('SELECT id FROM branches WHERE is_active = 1');
    const [allCategories] = await connection.query('SELECT id, slug FROM categories WHERE slug IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      'camera', 'mirrorless-camera', 'dslr-camera', 'action-camera', 'camera-lens', 'tripod-gimbal',
      ...categorySpecs.map((item) => item.slug),
    ]);
    const categoryIds = new Map(allCategories.map((item) => [item.slug, item.id]));
    const brandIds = new Map();
    const slugCounts = new Map();

    for (const record of records) {
      const brandName = brandFor(record.name);
      let brandId = brandIds.get(brandName.toLowerCase());
      if (!brandId) {
        const brandSlug = slugify(brandName) || 'other';
        const brandTitle = `${brandName} Camera Products | CORENIX`;
        const brandDescription = `Camera products attributed to ${brandName} by the source retailer. Verify brand and product details before publication.`;
        await connection.query(
          `INSERT INTO brands (name, slug, description, short_desc, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), short_desc = VALUES(short_desc), meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc), focus_keyword = VALUES(focus_keyword), canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), og_desc = VALUES(og_desc)`,
          [brandName, brandSlug, brandDescription, brandDescription, brandTitle, brandDescription, `${brandName} camera`, `${SITE_URL}/brand/${brandSlug}`, brandTitle, brandDescription]
        );
        const [brandRows] = await connection.query('SELECT id FROM brands WHERE slug = ? LIMIT 1', [brandSlug]);
        brandId = brandRows[0].id;
        brandIds.set(brandName.toLowerCase(), brandId);
      }

      const baseSlug = slugify(record.name) || 'camera-product';
      const seenSlugCount = (slugCounts.get(baseSlug) || 0) + 1;
      slugCounts.set(baseSlug, seenSlugCount);
      const hash = crypto.createHash('sha1').update(`${record.name}|${record.source_url}`).digest('hex').slice(0, 10);
      const slug = seenSlugCount === 1 ? baseSlug : `${baseSlug}-${hash}`;
      const sku = `CAM-${hash.toUpperCase()}`;
      const categoryId = categoryIds.get(categorySlug(record)) || categoryIds.get('camera');
      const copy = productCopy(record, brandName, slug, sku);
      const sourcePrice = Number(record.price);

      await connection.query(
        `INSERT INTO products (name, slug, sku, brand_id, category_id, warranty_period, status, stock_status, purchase_cost, avg_cost, selling_price, discount_price, min_selling_price, discount_amount, discount_percent, is_featured, is_new, is_hot, is_sale, sales_count, rating_avg, rating_count, seo_score)
         VALUES (?, ?, ?, ?, ?, ?, 'draft', 'Out of Stock', 0, 0, ?, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90)
         ON DUPLICATE KEY UPDATE name = VALUES(name), brand_id = VALUES(brand_id), category_id = VALUES(category_id), warranty_period = VALUES(warranty_period), status = 'draft', stock_status = 'Out of Stock', selling_price = VALUES(selling_price), discount_price = NULL, purchase_cost = 0, avg_cost = 0, min_selling_price = 0, discount_amount = 0, discount_percent = 0, sales_count = 0, rating_avg = 0, rating_count = 0, seo_score = 90`,
        [record.name, slug, sku, brandId, categoryId, 'Unverified; see source listing', sourcePrice]
      );
      const [productRows] = await connection.query('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
      const productId = productRows[0].id;
      const keyFeatures = JSON.stringify(copy.featureList);
      const warrantyInfo = 'Warranty terms are unverified. Confirm the current terms with the source retailer and manufacturer before publication.';

      await connection.query(
        `INSERT INTO product_descriptions (product_id, overview, key_features_json, rich_content, what_in_box, warranty_info, faq_json)
         VALUES (?, ?, ?, ?, NULL, ?, ?)
         ON DUPLICATE KEY UPDATE overview = VALUES(overview), key_features_json = VALUES(key_features_json), rich_content = VALUES(rich_content), what_in_box = NULL, warranty_info = VALUES(warranty_info), faq_json = VALUES(faq_json)`,
        [productId, copy.overview, keyFeatures, copy.richContent, warrantyInfo, copy.faq]
      );
      await connection.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, secondary_keywords, seo_description, canonical_url, og_title, og_desc, og_image, twitter_title, twitter_desc, image_alt, structured_data_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc), focus_keyword = VALUES(focus_keyword), secondary_keywords = VALUES(secondary_keywords), seo_description = VALUES(seo_description), canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), og_desc = VALUES(og_desc), og_image = NULL, twitter_title = VALUES(twitter_title), twitter_desc = VALUES(twitter_desc), image_alt = VALUES(image_alt), structured_data_json = VALUES(structured_data_json)`,
        [productId, copy.title, copy.description, copy.focusKeyword, copy.secondaryKeywords, copy.seoDescription, copy.canonical, copy.title, copy.description, copy.title, copy.description, copy.imageAlt, copy.structuredData]
      );

      for (const branch of branches) {
        await connection.query(
          `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, incoming_qty, damaged_qty, rma_qty)
           VALUES (?, ?, 0, 0, 0, 0, 0)
           ON DUPLICATE KEY UPDATE quantity = 0, reserved_qty = 0, incoming_qty = 0, damaged_qty = 0, rma_qty = 0`,
          [productId, branch.id]
        );
      }
      inserted++;
    }

    await connection.commit();
    console.log(`Imported ${inserted} camera and gear products as unpublished drafts with source-listed reference prices and zero branch stock.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Camera draft import failed: ${error.message}`);
  process.exitCode = 1;
});
