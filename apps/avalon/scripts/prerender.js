// 為 8 種語言 x 3 個頁面產生帶內容的靜態 HTML。
//
// 為什麼需要這支：這是純 CSR 的 SPA，build 出來的 index.html 裡 <div id="root"> 是空的，
// 爬蟲第一次抓頁面時看不到任何內文，只能靠 <title> 判斷這頁在講什麼。而且 index.html
// 只有一份，所有語言共用同一份中文 title 與 lang="zh-TW"，非中文語言等於沒有 SEO。
//
// 這裡在 build 後為每個語言/頁面各產生一份 HTML：head 的 title/description/canonical/
// hreflang 由下面的 render() 依 locales JSON 換掉，#root 的內容則透過 Vite 的 ssrLoadModule
// 載入 src/entry-server.jsx，用 renderToStaticMarkup 渲染「真正的元件」。
//
// 用真元件而不是手抄 HTML 字串，是因為手抄的版本會漂移：元件改了 class 但這裡忘了同步，
// 預渲染就會畫出舊樣式，React 掛載時整個畫面跳一下（已經發生過兩次）。現在樣式只有一個
// 來源，結構上不可能對不上，順帶也不用再擔心 Tailwind 把只寫在這支腳本裡的 class purge 掉。
//
// main.jsx 用的是 createRoot（不是 hydrateRoot），React 掛載時會清空 #root 重畫，
// 所以這裡用 renderToStaticMarkup（不帶 hydration 標記）就夠了。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const SITE = 'https://www.vibeweb100.com';
const GAME_SLUG = 'avalon';
const DEFAULT_LANG = 'zh-TW';
// 跟 src/i18n.js 的 supportedLangs 以及 scripts/generate-sitemap.js 同一份清單，改了要一起改。
const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
const PAGES = ['', 'game', 'rules'];

const distAvalon = path.resolve('dist', GAME_SLUG);
const template = readFileSync(path.join(distAvalon, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pageUrl = (lang, page) => `${SITE}/${GAME_SLUG}/${lang}${page ? `/${page}` : ''}`;
const routePath = (lang, page) => `/${GAME_SLUG}/${lang}${page ? `/${page}` : ''}`;

function render(lang, page, d, appHtml) {
  const url = pageUrl(lang, page);
  const title = d.seo.title;
  const description = d.seo.description;

  const alternates = LANGS.map(
    (l) => `    <link rel="alternate" hreflang="${l}" href="${pageUrl(l, page)}" />`,
  ).join('\n');
  const xDefault = `    <link rel="alternate" hreflang="x-default" href="${pageUrl(DEFAULT_LANG, page)}" />`;

  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(d.seo.ogTitle || title)}$2`)
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${esc(d.seo.ogDescription || description)}$2`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${SITE}/${GAME_SLUG}/og/${lang}.png?v=2$2`)
    // hreflang 接在 canonical 後面，讓 head 裡的網址相關標籤集中在一起
    .replace(/(<link rel="canonical"[^>]*>)/, `$1\n${alternates}\n${xDefault}`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

// middlewareMode 的 Vite server 只是拿來當 JSX/ESM 的載入器，不會真的監聽埠。
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
});

try {
  const { renderPage } = await vite.ssrLoadModule('/src/entry-server.jsx');

  let count = 0;
  for (const lang of LANGS) {
    const d = JSON.parse(readFileSync(path.resolve('src/locales', `${lang}.json`), 'utf8'));
    for (const page of PAGES) {
      const appHtml = await renderPage(lang, routePath(lang, page));
      // 渲染結果是空的代表路由沒對上（例如 StaticRouter 走到了 Navigate），
      // 靜靜產出空頁面比直接失敗更難查，所以這裡直接擋下來。
      if (!appHtml.trim()) {
        throw new Error(`[${lang}${page ? `/${page}` : ''}] 預渲染結果是空的，檢查路由設定`);
      }
      const outDir = path.join(distAvalon, lang, page);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(path.join(outDir, 'index.html'), render(lang, page, d, appHtml));
      count += 1;
    }
  }

  console.log(`Prerendered ${count} pages (${LANGS.length} langs x ${PAGES.length} pages).`);
} finally {
  await vite.close();
}
