// 為 18 種語言 x 3 個頁面產生帶內容的靜態 HTML。
//
// 為什麼需要這支：這是純 CSR 的 SPA，build 出來的 index.html 裡 <div id="root"> 是空的，
// 爬蟲第一次抓頁面時看不到任何內文，只能靠 <title> 判斷這頁在講什麼。而且 index.html
// 只有一份，18 種語言共用同一份中文 title 與 lang="zh-TW"，非中文語言等於沒有 SEO。
//
// 這裡在 build 後為每個語言/頁面各產生一份 HTML，補上該語言的 head（title、description、
// canonical、hreflang）並把首屏內容直接寫進 #root。main.jsx 用的是 createRoot（不是
// hydrateRoot），React 掛載時會清空 #root 重畫，所以靜態內容不需要跟 React 的輸出
// 逐字節對齊，只要語意一致即可。
//
// ⚠️ 靜態內容必須忠實反映使用者實際看得到的畫面。寫入畫面上不存在的文字會被 Google
// 判定為 cloaking，罰則比沒做 SEO 更重。下面每個區塊都對應 src/pages/ 裡真實渲染的
// 元素，改頁面時這裡要跟著改。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROLE_CONFIGS, ROLE_ORDER, DEFAULT_PLAYER_COUNT } from '../src/constants/roles.js';

// 只複製 header 靜態佔位需要的顯示名稱，不整包 import src/i18n.js——那支檔案一載入就會
// 呼叫 i18next 的 init()，是寫給瀏覽器環境用的，不適合在這支 Node 腳本裡執行。
// src/i18n.js 的 localeLabels 改了，這裡也要同步更新。
const LOCALE_LABELS = {
  'zh-TW': '繁體中文', en: 'English', de: 'Deutsch', fr: 'Français', ja: '日本語', ko: '한국어',
  pl: 'Polski', ru: 'Русский', vi: 'Tiếng Việt', pt: 'Português', it: 'Italiano', nl: 'Nederlands',
  cs: 'Čeština', sv: 'Svenska', th: 'ไทย', id: 'Bahasa Indonesia', es: 'Español', 'zh-CN': '简体中文',
};

const SITE = 'https://www.vibeweb100.com';
const GAME_SLUG = 'avalon';
const DEFAULT_LANG = 'zh-TW';
// 跟 src/i18n.js 的 supportedLangs 以及 scripts/generate-sitemap.js 同一份清單，改了要一起改。
const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'pl', 'ru', 'vi', 'pt', 'it', 'nl', 'cs', 'sv', 'th', 'id', 'es', 'zh-CN'];
const PAGES = ['', 'game', 'rules'];

const distAvalon = path.resolve('dist', GAME_SLUG);
const template = readFileSync(path.join(distAvalon, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pageUrl = (lang, page) => `${SITE}/${GAME_SLUG}/${lang}${page ? `/${page}` : ''}`;

// 跟 Game.jsx 裡 script 那個 useMemo 的分支邏輯保持一致：
// 有 voice.narration 就用角色感知的分段稿，沒有的語言退回 voice.script 平稿。
function buildScript(d, roles) {
  const n = d.voice?.narration;
  if (!n) {
    const raw = d.voice?.script;
    return Array.isArray(raw) ? raw.join('\n') : '';
  }
  const has = (r) => roles.includes(r);
  const lines = [n.closeEyes];
  lines.push(has('oberon') ? n.evilRecognizeOberon : n.evilRecognize);
  lines.push(n.evilClose);
  lines.push(has('mordred') ? n.merlinSeeMordred : n.merlinSee);
  lines.push(n.merlinClose);
  if (has('percival')) {
    lines.push(n.percivalSee);
    lines.push(n.percivalClose);
  }
  lines.push(n.openEyes);
  return lines.join('\n');
}

// 首屏預設是 DEFAULT_PLAYER_COUNT 人的建議配置，跟 Home.jsx 初始 state 一致。
const defaultRoles = ROLE_CONFIGS[String(DEFAULT_PLAYER_COUNT)].roles;

// class 字串照抄 src/pages/*.jsx 裡 JSX 元素的 className。這些 class 已經寫在原始碼裡，
// Tailwind build 時一定會編進 CSS，所以直接照抄不需要另外處理 purge/safelist。
//
// 為什麼一定要對到一模一樣：main.jsx 用 createRoot 掛載，JS 一載完就會把 #root 內容整個換成
// React 畫出來的版本。如果預渲染的標籤沒有 class，使用者會先看到無樣式的純黑字白底文字，
// 下一瞬間才跳成卡片+深色模式的正式畫面——這就是网站「閃一下」的原因。這裡的 class 只要跟
// 對應元件的第一層結構對上，兩次畫面就會疊在一起看不出切換痕跡。
const CARD_SECTION = 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900';
const CARD_SECTION_SHADOW = `${CARD_SECTION.replace(' p-6 ', ' p-6 shadow-sm ')}`;
const H1 = 'text-3xl font-bold';
const DESC_P = 'mt-2 text-slate-600 dark:text-slate-300';
const H2 = 'text-xl font-semibold';

// 對應 App.jsx 的 LangLayout（40 行）與 Navbar.jsx。React 掛載時會把 header 跟 main
// 一起换成這個結構，缺了 header 的話 React 接管那一刻整條導覽列會突然「跳出來」，
// 把下面內容往下推——版面位移跟文字沒套樣式是同一件事的兩面，都得對齊。
// LangSwitcher / ThemeToggle 只放靜態佔位，不需要真的能互動：React 幾乎立刻就會
// 把它們換成有作用的版本，使用者感知不到這短暫的靜態版本不能點。
function headerFor(lang, d) {
  return (
    `<header class="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">` +
    `<div class="mx-auto flex max-w-4xl items-center justify-between gap-3 p-4">` +
    `<div class="flex items-center gap-3">` +
    `<a href="/${lang}/" class="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">← Web100</a>` +
    `<span class="font-bold">${esc(d.nav.title)}</span>` +
    `</div>` +
    `<div class="flex items-center gap-2">` +
    `<span class="rounded-xl border border-slate-300 px-3 py-2 text-sm">${esc(d.nav.rules)}</span>` +
    `<span class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">${esc(LOCALE_LABELS[lang] || lang)}</span>` +
    `<span class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">${esc(d.nav.dark)}</span>` +
    `</div>` +
    `</div>` +
    `</header>`
  );
}

function bodyFor(lang, page, d) {
  return (
    `<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">` +
    headerFor(lang, d) +
    mainFor(page, d) +
    `</div>`
  );
}

function mainFor(page, d) {
  const section = (cls, inner) => `<section class="${cls}">${inner}</section>`;

  if (page === 'game') {
    // 對應 Game.jsx 382-402 行
    return `<main class="mx-auto max-w-3xl p-4 space-y-6">` +
      section(CARD_SECTION, `<h1 class="${H1}">${esc(d.game.title)}</h1><p class="${DESC_P}">${esc(d.game.description)}</p>`) +
      section(
        CARD_SECTION,
        `<h2 class="${H2}">${esc(d.game.summary)}</h2>` +
        `<pre class="mt-3 whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">${esc(buildScript(d, defaultRoles))}</pre>`,
      ) +
      `</main>`;
  }

  if (page === 'rules') {
    // 對應 Rules.jsx：目前整頁只有 h1 與一段說明。
    return `<main class="mx-auto max-w-3xl p-4 space-y-6">` +
      section(CARD_SECTION, `<h1 class="${H1}">${esc(d.rules.title)}</h1><p class="${DESC_P}">${esc(d.rules.description)}</p>`) +
      `</main>`;
  }

  // 對應 Home.jsx 33-73 行：h1 標題卡 + 角色配置卡（用預設人數的建議角色代表初始畫面）
  const roleNames = ROLE_ORDER.map((r) => d.roles?.[r]).filter(Boolean).join('、');
  const recommended = defaultRoles.map((r) => d.roles?.[r]).filter(Boolean).join('、');
  return `<main class="mx-auto max-w-4xl p-4 space-y-6">` +
    section(CARD_SECTION_SHADOW, `<h1 class="${H1}">${esc(d.home.title)}</h1><p class="${DESC_P}">${esc(d.home.description)}</p>`) +
    section(
      CARD_SECTION_SHADOW,
      `<h2 class="${H2}">${esc(d.home.roleConfig)}</h2>` +
      `<div class="mt-4 flex flex-wrap gap-2">${defaultRoles.map((r) => `<span class="rounded-full px-4 py-2 border border-slate-300">${esc(d.roles?.[r])}</span>`).join('')}</div>` +
      `<p class="mt-3 text-sm text-slate-500">${esc(d.home.recommendation)}: ${esc(recommended)}（${esc(roleNames)}）</p>`,
    ) +
    `</main>`;
}

function render(lang, page, d) {
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
    // hreflang 接在 canonical 後面，讓 head 裡的網址相關標籤集中在一起
    .replace(/(<link rel="canonical"[^>]*>)/, `$1\n${alternates}\n${xDefault}`)
    .replace('<div id="root"></div>', `<div id="root">${bodyFor(lang, page, d)}</div>`);
}

let count = 0;
for (const lang of LANGS) {
  const d = JSON.parse(readFileSync(path.resolve('src/locales', `${lang}.json`), 'utf8'));
  for (const page of PAGES) {
    const outDir = path.join(distAvalon, lang, page);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, 'index.html'), render(lang, page, d));
    count += 1;
  }
}

console.log(`Prerendered ${count} pages (${LANGS.length} langs x ${PAGES.length} pages).`);
