// Image optimization script: JPG/PNG → WebP + resize to max 1200px
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'assets', 'images');
const MAX_WIDTH = 1200; // max width in pixels
const WEBP_QUALITY = 80; // 0-100

// Get all image references from index.html
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const refs = [...html.matchAll(/src="(assets\/images\/[^"]+\.(jpg|png))"/gi)]
  .map(m => m[1]);

// Deduplicate
const uniqueRefs = [...new Set(refs)];
console.log(`Found ${uniqueRefs.length} unique image references in HTML`);

let totalBefore = 0, totalAfter = 0, converted = 0, skipped = 0;

for (const relPath of uniqueRefs) {
  const srcPath = path.join(__dirname, relPath);
  const srcDir = path.dirname(srcPath);
  const baseName = path.parse(srcPath).name;
  const webpPath = path.join(srcDir, baseName + '.webp');

  // Skip if already webp
  if (srcPath.endsWith('.webp')) { skipped++; continue; }

  if (!fs.existsSync(srcPath)) {
    console.warn(`  SKIP (missing): ${relPath}`);
    skipped++;
    continue;
  }

  const srcSize = fs.statSync(srcPath).size;
  totalBefore += srcSize;

  try {
    await sharp(srcPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    totalAfter += webpSize;
    const reduction = ((1 - webpSize / srcSize) * 100).toFixed(1);
    console.log(`  ${(srcSize / 1024).toFixed(0)}KB → ${(webpSize / 1024).toFixed(0)}KB (${reduction}%)  ${relPath}`);
    converted++;
  } catch (err) {
    console.error(`  ERROR: ${relPath} — ${err.message}`);
    skipped++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Converted: ${converted} | Skipped: ${skipped}`);
console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
console.log(`After:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
console.log(`Saved:  ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
