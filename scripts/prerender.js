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

function bodyFor(page, d) {
  const section = (inner) => `<section>${inner}</section>`;

  if (page === 'game') {
    // 對應 Game.jsx：h1 標題 + 說明，下方 h2 game.summary 與 <pre> 台詞內容。
    return section(`<h1>${esc(d.game.title)}</h1><p>${esc(d.game.description)}</p>`) +
      section(`<h2>${esc(d.game.summary)}</h2><pre>${esc(buildScript(d, defaultRoles))}</pre>`);
  }

  if (page === 'rules') {
    // 對應 Rules.jsx：目前整頁只有 h1 與一段說明。
    return section(`<h1>${esc(d.rules.title)}</h1><p>${esc(d.rules.description)}</p>`);
  }

  // 對應 Home.jsx：h1 標題 + 說明，下方 h2 home.roleConfig 與角色清單。
  const roleNames = ROLE_ORDER.map((r) => d.roles?.[r]).filter(Boolean).join('、');
  const recommended = defaultRoles.map((r) => d.roles?.[r]).filter(Boolean).join('、');
  return section(`<h1>${esc(d.home.title)}</h1><p>${esc(d.home.description)}</p>`) +
    section(
      `<h2>${esc(d.home.roleConfig)}</h2><p>${esc(roleNames)}</p>` +
      `<p>${esc(d.home.playerCount)}: ${DEFAULT_PLAYER_COUNT} — ${esc(d.home.recommendation)}: ${esc(recommended)}</p>`,
    );
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
    .replace('<div id="root"></div>', `<div id="root"><main>${bodyFor(page, d)}</main></div>`);
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
