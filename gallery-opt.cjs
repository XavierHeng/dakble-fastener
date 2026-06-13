#!/usr/bin/env node
'use strict';
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const __dirname = 'C:/Users/Administrator/WorkBuddy/2026-06-02-00-07-42/factory-website';
  const dirs = ['assets/images/gallery_production','assets/images/gallery_exhibition','assets/images/gallery_warehouse','assets/images/gallery_testing'];
  let totalBefore = 0, totalAfter = 0, converted = 0;

  for (const dir of dirs) {
    const full = path.join(__dirname, dir);
    if (!fs.existsSync(full)) continue;
    const files = fs.readdirSync(full).filter(f => /\.(jpg|png)$/i.test(f));
    for (const f of files) {
      const src = path.join(full, f);
      const dst = src.replace(/\.(jpg|png)$/i, '.webp');
      const sz = fs.statSync(src).size;
      totalBefore += sz;
      await sharp(src).resize({width:1200,withoutEnlargement:true}).webp({quality:80}).toFile(dst);
      const sz2 = fs.statSync(dst).size;
      totalAfter += sz2;
      console.log('  ' + (sz/1024).toFixed(0) + 'KB -> ' + (sz2/1024).toFixed(0) + 'KB (' + ((1-sz2/sz)*100).toFixed(1) + '%)  ' + f);
      converted++;
    }
  }
  console.log('\nGallery: ' + (totalBefore/1024/1024).toFixed(1) + 'MB -> ' + (totalAfter/1024/1024).toFixed(1) + 'MB (' + ((1-totalAfter/totalBefore)*100).toFixed(1) + '%)  ' + converted + ' files');
}
main().catch(e=>{console.error(e);process.exit(1);});
