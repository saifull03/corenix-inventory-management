const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const mysql = require('mysql2/promise');

const root = process.cwd();
const uploadsRoot = path.join(root, 'public', 'uploads');
const backupRoot = path.join(root, 'public', 'uploads-backup');
const dryRun = process.argv.includes('--dry-run');
const minimumBytes = 300 * 1024;
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
const tableReferences = [
  ['banners', 'image_url'],
  ['categories', 'image'],
  ['brands', 'logo'],
  ['product_images', 'image_url'],
];

function rulesFor(folder) {
  return {
    width: folder === 'banners' ? 1600 : folder === 'brands' ? 400 : 800,
    prefix: folder === 'brands' ? 'brand' : folder === 'products' ? 'prod' : folder === 'categories' ? 'category' : 'banner',
  };
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function publicUrl(filePath) {
  return `/${path.relative(path.join(root, 'public'), filePath).replace(/\\/g, '/')}`;
}

async function optimizeFile(filePath) {
  const relative = path.relative(uploadsRoot, filePath);
  const folder = relative.split(path.sep)[0];
  const ext = path.extname(filePath).toLowerCase();
  const original = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256').update(original).digest('hex');
  if (!imageExtensions.has(ext) || ext === '.svg' || original.length <= minimumBytes || /\.optimized\.webp$/i.test(filePath)) {
    return { filePath, hash, changed: false };
  }

  const { width } = rulesFor(folder);
  const optimized = await sharp(original, { animated: false })
    .resize({ width, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();
  const targetPath = `${filePath}.optimized.webp`;
  const backupPath = path.join(backupRoot, relative);

  console.log(`${dryRun ? '[dry-run] would optimize' : 'optimizing'} ${relative} (${original.length} -> ${optimized.length} bytes)`);
  if (!dryRun) {
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filePath, backupPath);
    await fs.writeFile(targetPath, optimized);
  }
  return {
    filePath,
    hash,
    changed: true,
    oldUrl: publicUrl(filePath),
    newUrl: publicUrl(targetPath),
    oldRelativeUrl: publicUrl(filePath).slice(1),
    newRelativeUrl: publicUrl(targetPath).slice(1),
  };
}

async function updateReferences(connection, result) {
  for (const [table, column] of tableReferences) {
    const [response] = await connection.query(
      `UPDATE \`${table}\` SET \`${column}\` = ?
       WHERE \`${column}\` IN (?, ?)`,
      [result.newUrl, result.oldUrl, result.oldRelativeUrl]
    );
    if (response.affectedRows > 0) {
      console.log(`  updated ${response.affectedRows} ${table}.${column} reference(s)`);
    }
  }
}

async function main() {
  const files = await walk(uploadsRoot);
  const hashes = new Map();
  const results = [];

  for (const filePath of files) {
    const result = await optimizeFile(filePath);
    results.push(result);
    const duplicate = hashes.get(result.hash);
    if (duplicate) {
      console.log(`duplicate content: ${path.relative(uploadsRoot, filePath)} == ${path.relative(uploadsRoot, duplicate)}`);
    } else {
      hashes.set(result.hash, filePath);
    }
  }

  const changed = results.filter((result) => result.changed);
  if (dryRun) {
    console.log(`Dry run complete: ${changed.length} image(s) would be optimized; no files or database rows changed.`);
    return;
  }

  if (changed.length === 0) {
    console.log('No images exceeded 300 KB and required optimization.');
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });
  try {
    for (const result of changed) await updateReferences(connection, result);
  } finally {
    await connection.end();
  }
  console.log(`Optimization complete: ${changed.length} image(s) written; originals backed up in public/uploads-backup/.`);
}

main().catch((error) => {
  console.error('Upload optimization failed:', error);
  process.exit(1);
});
