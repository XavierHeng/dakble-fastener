'use strict';
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const base = 'C:/Users/Administrator/WorkBuddy/2026-06-02-00-07-42/factory-website/assets/images';
  const files = ['2_111_trimmed.png', 'ig_qr.png', 'wa_qr_trimmed.png'];
  for (const f of files) {
    const src = path.join(base, f);
    const dst = src.replace('.png', '.webp');
    if (!fs.existsSync(src)) { console.log('Missing: ' + f); continue; }
    const sz = fs.statSync(src).size;
    await sharp(src).webp({quality:85}).toFile(dst);
    const sz2 = fs.statSync(dst).size;
    console.log(f + ': ' + sz + ' -> ' + sz2 + ' (' + ((1-sz2/sz)*100).toFixed(1) + '%)');
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
