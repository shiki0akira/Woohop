// 產生 public/sitemap.xml，每個網址都帶上 hreflang alternate 標註，
// 讓 Google 不用等 JS 執行（i18n.js 的 applySeo()）就能知道各語言版本的對應關係。
// 注意：下面的語言清單是獨立維護的，i18n.js 的 supportedLangs 改了要記得手動同步這裡，
// 不然新語言不會進 sitemap。（沒有直接 import i18n.js 是因為它依賴瀏覽器環境，Node 跑不動。）

import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://www.vibeweb100.com';
const GAME_SLUG = 'avalon';
const SUPPORTED_LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'pl', 'ru', 'vi', 'pt', 'it', 'nl', 'cs', 'sv', 'th', 'id', 'es', 'zh-CN'];
const DEFAULT_LANG = 'zh-TW';
const PAGES = ['', 'game', 'rules'];

function pageUrl(lang, page) {
  const suffix = page ? `/${page}` : '';
  return `${SITE}/${GAME_SLUG}/${lang}${suffix}`;
}

function buildUrlEntry(page) {
  const alternates = SUPPORTED_LANGS.map(
    (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang, page)}"/>`,
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(DEFAULT_LANG, page)}"/>`;

  return SUPPORTED_LANGS.map(
    (lang) => `  <url>\n    <loc>${pageUrl(lang, page)}</loc>\n${alternates}\n${xDefault}\n  </url>`,
  ).join('\n');
}

const body = PAGES.map(buildUrlEntry).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;

const outPath = path.resolve('public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`Generated ${outPath} (${SUPPORTED_LANGS.length} langs x ${PAGES.length} pages = ${SUPPORTED_LANGS.length * PAGES.length} URLs)`);
