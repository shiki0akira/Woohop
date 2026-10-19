// 建置後處理：把 Vite 打包產出（index.html、assets、audio）搬進 dist/avalon/，
// 讓實際的檔案結構跟 URL 路徑 /avalon/... 對得起來。
// 首頁（web100_00_Homepage）已經拆成獨立 repo，這裡不再處理首頁相關檔案。

import { copyFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const avalonDir = path.join(distDir, 'avalon');

mkdirSync(avalonDir, { recursive: true });

// og/ 是分享縮圖（apps/homepage 的 node scripts/og-image.mjs avalon 產生到 public/og/）
const itemsToMove = ['index.html', 'assets', 'audio', 'og'];

for (const item of itemsToMove) {
  const src = path.join(distDir, item);
  const dest = path.join(avalonDir, item);
  if (existsSync(src)) {
    renameSync(src, dest);
    console.log(`Moved ${item} -> dist/avalon/${item}`);
  } else {
    console.warn(`⚠️  Expected build output "${item}" not found, skipping.`);
  }
}

// 圖示要兩份：public/ 的檔案會留在 dist 根目錄，但 Vite 會把 index.html 裡的
// /favicon.svg 改寫成 /avalon/favicon.svg（因為 base 是 /avalon/），所以再複製一份進去。
// 根目錄那份留著，vercel.app 網域下有些工具會直接去抓 /favicon.svg。
for (const icon of ['favicon.svg', 'apple-touch-icon.png']) {
  const src = path.join(distDir, icon);
  if (existsSync(src)) {
    copyFileSync(src, path.join(avalonDir, icon));
    console.log(`Copied ${icon} -> dist/avalon/${icon}`);
  } else {
    console.warn(`⚠️  public/${icon} not found in build output, skipping.`);
  }
}

console.log('Postbuild restructure complete.');
