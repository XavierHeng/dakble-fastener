#!/usr/bin/env node
// Image optimization: JPG/PNG → WebP + resize to max 1200px
'use strict';

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const IMAGES_DIR = path.join(__dirname, 'assets', 'images');
  const MAX_WIDTH = 1200;
  const WEBP_QUALITY = 80;

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  const pattern = /src="(assets\/images\/[^"]+\.(jpg|png))"/gi;
  const refs = [];
  let m;
  while ((m = pattern.exec(html)) !== null) {
    refs.push(m[1]);
  }
  const uniqueRefs = [...new Set(refs)];
  console.log('Found ' + uniqueRefs.length + ' unique image references in HTML');

  let totalBefore = 0, totalAfter = 0, converted = 0, skipped = 0;

  for (const relPath of uniqueRefs) {
    const srcPath = path.join(__dirname, relPath);
    const srcDir = path.dirname(srcPath);
    const baseName = path.parse(srcPath).name;
    const webpPath = path.join(srcDir, baseName + '.webp');

    if (!fs.existsSync(srcPath)) {
      console.warn('  SKIP (missing): ' + relPath);
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
      console.log('  ' + (srcSize / 1024).toFixed(0) + 'KB -> ' + (webpSize / 1024).toFixed(0) + 'KB (' + reduction + '%)  ' + relPath);
      converted++;
    } catch (err) {
      console.error('  ERROR: ' + relPath + ' — ' + err.message);
      skipped++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Converted: ' + converted + ' | Skipped: ' + skipped);
  console.log('Before: ' + (totalBefore / 1024 / 1024).toFixed(1) + ' MB');
  console.log('After:  ' + (totalAfter / 1024 / 1024).toFixed(1) + ' MB');
  if (totalBefore > 0) {
    console.log('Saved:  ' + ((1 - totalAfter / totalBefore) * 100).toFixed(1) + '%');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
