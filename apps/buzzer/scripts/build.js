/*
 * 把 app/ 的樣板組成 dist/，給 wrangler 的 assets binding 用。
 *
 * 每個語言 × 每個頁面各產生一份完整的靜態 HTML（title / description / canonical /
 * hreflang 都填好，文案直接寫進 HTML）。沒有這道 build 的話，所有語言會共用同一份
 * 中文 title、而且爬蟲看不到任何內容——首頁專案踩過同樣的坑，做法保持一致。
 *
 * 導覽列與頁尾放在 app/partials/，兩個頁面共用同一份，不會改了一邊漏另一邊。
 * 樣板裡對不到值的 {{token}} 會直接讓 build 失敗，不會靜靜產出半空的頁面。
 */

import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LANGS,
  DEFAULT_LANG,
  LOCALE_LABELS,
  STRINGS,
  ORIGIN,
  WORKER_ORIGIN,
  BASE_PATH,
  PROJECT_ID,
} from '../app/strings.js';
import { AVATARS } from '../app/avatars.js';
// Woohop 全站共用的導覽列、頁尾、遊戲內頂欄與樣式：唯一來源在首頁（apps/homepage），build 時直接拿來用，
// 改首頁那份就是全站一起改。樣式與程式複製進 dist/buzzer/woohop/，跟這個遊戲一起部署（不跨網域引用）
import { STRINGS as SITE_STRINGS } from '../../homepage/src/locales.mjs';
import { navbar, footer, gameBar, THEME_HEAD } from '../../homepage/src/chrome.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const outBase = join(dist, BASE_PATH.replace(/^\//, ''));
const siteAssets = join(root, '..', 'homepage', 'assets');
const SITE_ASSET_FILES = ['woohop.css', 'site.css', 'game.css', 'woohop-art.js', 'site.js', 'game.js'];

// 這幾個 token 是直接塞 HTML / JSON，不做跳脫；其餘一律當純文字處理
const RAW_TOKENS = new Set([
  'woohopHeader',
  'woohopFooter',
  'woohopJson',
  'gameBarHtml',
  'heroTitleHtml',
  'rulesFactsList',
  'rulesHowList',
  'rulesLeadList',
  'hreflang',
  'stringsJson',
  'avatarsJson',
  'langOptions',
]);

// dir 是語言後面的路徑：遊戲頁在 /buzzer/{lang}/、規則頁在 /buzzer/{lang}/rules/
const PAGES = [
  { template: 'template.html', dir: '', titleKey: 'seoTitle', descKey: 'seoDesc' },
  { template: 'rules.html', dir: 'rules', titleKey: 'rulesSeoTitle', descKey: 'rulesSeoDesc' },
];

await main();

async function main() {
  checkStrings();

  /*
   * 靜態資源帶上版本號（app.js?v=xxxx）：瀏覽器（尤其行動裝置與內嵌 WebView）常常拿舊的快取，
   * 網址變了就一定是新的請求。版本取自這個遊戲與全站共用檔案的內容雜湊，內容沒變網址就不變。
   */
  const assetVersion = createHash('sha256')
    .update(await readFile(join(root, 'app', 'app.js')))
    .update(await readFile(join(root, 'app', 'app.css')))
    .update(await readFile(join(root, 'app', 'header.js')))
    .update((await Promise.all(SITE_ASSET_FILES.map((f) => readFile(join(siteAssets, f))))).join(''))
    .digest('hex')
    .slice(0, 8);

  await cleanDist();
  await mkdir(outBase, { recursive: true });

  const partials = {
    head: (await readPartial('head.html')).replace(/(<meta name="theme-color"[^>]*>)/, (m) => m + THEME_HEAD),
    header: await readPartial('header.html'),
    footer: await readPartial('footer.html'),
  };

  for (const page of PAGES) {
    const template = await readFile(join(root, 'app', page.template), 'utf8');
    const withPartials = injectPartials(template, partials);

    for (const lang of LANGS) {
      const html = render(withPartials, tokensFor(lang, page, assetVersion));
      const dir = join(outBase, lang, page.dir);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), html, 'utf8');
      console.log(`  ${pagePath(lang, page)}`);
    }
  }

  await cp(join(root, 'app', 'app.js'), join(outBase, 'app.js'));
  await cp(join(root, 'app', 'header.js'), join(outBase, 'header.js'));
  await cp(join(root, 'app', 'app.css'), join(outBase, 'app.css'));
  await mkdir(join(outBase, 'woohop'), { recursive: true });
  for (const f of SITE_ASSET_FILES) await cp(join(siteAssets, f), join(outBase, 'woohop', f));

  // QR 產生器整包放進來，不走 CDN：多一個網路請求、多一個第三方故障點都不值得
  await mkdir(join(outBase, 'vendor'), { recursive: true });
  await cp(
    join(root, 'node_modules', 'qrcode-generator', 'qrcode.js'),
    join(outBase, 'vendor', 'qrcode.js'),
  );

  await cp(join(root, 'public'), outBase, { recursive: true });
  await writeFile(join(outBase, 'sitemap.xml'), sitemap(), 'utf8');

  console.log(`\nbuild ok → dist${BASE_PATH}/`);
}

// 先清掉舊的產出，免得刪掉語言或資源之後還留著孤兒檔案。
// npm run dev 會在 wrangler dev 還開著的時候重跑 build，這時 Windows 會鎖住 dist 而刪不掉——
// 那種情況下所有檔案本來就會被逐一覆寫，警告一聲繼續就好，不需要讓整個 build 失敗。
async function cleanDist() {
  try {
    await rm(dist, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
    console.warn('  (dist 正在被使用，改成直接覆寫，沒有清掉舊檔)');
  }
}

function readPartial(name) {
  return readFile(join(root, 'app', 'partials', name), 'utf8');
}

// partial 自己也含 {{token}}，所以要先貼進來、再一起做替換
function injectPartials(template, partials) {
  return template.replace(/\{\{(head|header|footer)\}\}/g, (whole, name) => partials[name].trimEnd());
}

// 漏翻的 key 在執行期會變成空字串，很難發現，所以在這裡先擋下來
function checkStrings() {
  const reference = Object.keys(STRINGS[DEFAULT_LANG]).sort();

  for (const lang of LANGS) {
    if (!STRINGS[lang]) throw new Error(`strings.js 少了 ${lang} 這份文案`);

    const keys = Object.keys(STRINGS[lang]).sort();
    const missing = reference.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !reference.includes(key));

    if (missing.length) throw new Error(`${lang} 少了這些 key：${missing.join(', ')}`);
    if (extra.length) throw new Error(`${lang} 多了 ${DEFAULT_LANG} 沒有的 key：${extra.join(', ')}`);
  }
}

function pagePath(lang, page) {
  return `${BASE_PATH}/${lang}/` + (page.dir ? `${page.dir}/` : '');
}

function tokensFor(lang, page, assetVersion) {
  const strings = STRINGS[lang];

  return {
    ...strings,
    lang,
    langOptions: langOptions(lang),
    base: BASE_PATH,
    projectId: PROJECT_ID,
    // 全站導覽列（遊戲頁藏起來，只留給語言選單等互動用）與頁尾。'buzzer' 不是首頁的分頁，所以不標目前頁面；
    // 語言選單連到「這個遊戲同一頁」的其他語言
    woohopHeader: navbar(SITE_STRINGS[lang], lang, 'buzzer', (l) => pagePath(l, page)),
    woohopFooter: footer(SITE_STRINGS[lang], lang, 'buzzer', (l) => pagePath(l, page)),
    // 給 site.js（導覽互動）用的當頁文案；遊戲頁的 page_view 由 app.js 依畫面送，玩法頁交給 site.js
    woohopJson: toScriptJson({ lang, page: 'buzzer', t: SITE_STRINGS[lang], langs: LANGS, ownPageView: !page.dir }),
    // 遊戲內頂欄（全站共用，見 apps/homepage/src/chrome.mjs 的 gameBar）
    gameBarHtml: gameBar(SITE_STRINGS[lang], lang, {
      title: strings.navTitle,
      gameHref: pagePath(lang, PAGES[0]),
      rulesHref: pagePath(lang, PAGES[1]),
      rulesLabel: strings.navRules,
      isRules: page.dir === 'rules',
      backHref: page.dir === 'rules' ? pagePath(lang, PAGES[0]) : `/${lang}/games/`,
    }),
    // 玩法頁（精簡版）的三塊
    rulesFactsList: strings.rulesFacts
      .map(([k, v]) => `<li><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></li>`)
      .join('\n        '),
    rulesHowList: strings.rulesHowSteps.map((x) => `<li>${escapeHtml(x)}</li>`).join('\n          '),
    rulesLeadList: strings.rulesLeadSteps.map((x) => `<li>${escapeHtml(x)}</li>`).join('\n          '),
    sayLabel: SITE_STRINGS[lang].sayLabel,
    crumbHome: SITE_STRINGS[lang].home,
    crumbGames: SITE_STRINGS[lang].navGames,
    // 主標題拆成「遊戲名」＋「一句話」兩行（冒號那裡分開），冒號留在 HTML 給爬蟲，畫面上藏起來
    heroTitleHtml: heroTitleHtml(strings.heroTitle),
    assetVersion,
    siteOrigin: ORIGIN,
    workerOrigin: WORKER_ORIGIN,
    // head partial 用的是通用名稱，各頁面把自己的 title/description 餵進去
    pageTitle: strings[page.titleKey],
    pageDesc: strings[page.descKey],
    canonical: ORIGIN + pagePath(lang, page),
    hreflang: hreflangTags(page),
    stringsJson: toScriptJson(strings),
    // 頭像跟語言無關，各語言的頁面內嵌同一份。整包約 6KB，
    // 比讓 10 個圖示各發一次請求划算，而且名單與排名榜會重複用上幾十次
    avatarsJson: toScriptJson(AVATARS),
  };
}

// selected 直接寫進 HTML：JS 還沒跑的時候下拉就已經指著當前語言，不會先閃成第一個選項
function langOptions(current) {
  return LANGS.map(
    (lang) =>
      `<option value="${lang}"${lang === current ? ' selected' : ''}>${escapeHtml(LOCALE_LABELS[lang])}</option>`,
  ).join('\n            ');
}

// hreflang 要指到「同一個頁面的其他語言」，不是一律指回遊戲頁
function hreflangTags(page) {
  const tags = LANGS.map(
    (lang) => `<link rel="alternate" hreflang="${lang}" href="${ORIGIN}${pagePath(lang, page)}" />`,
  );
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pagePath(DEFAULT_LANG, page)}" />`,
  );
  return tags.join('\n    ');
}

function sitemap() {
  const entries = [];

  for (const page of PAGES) {
    for (const lang of LANGS) {
      const alternates = LANGS.map(
        (other) =>
          `    <xhtml:link rel="alternate" hreflang="${other}" href="${ORIGIN}${pagePath(other, page)}" />`,
      ).join('\n');
      entries.push(
        ['  <url>', `    <loc>${ORIGIN}${pagePath(lang, page)}</loc>`, alternates, '  </url>'].join('\n'),
      );
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

function render(template, tokens) {
  const html = template.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in tokens)) throw new Error(`樣板用了 {{${name}}}，但 strings.js 沒有這個 key`);
    return RAW_TOKENS.has(name) ? tokens[name] : escapeHtml(tokens[name]);
  });

  const leftover = html.match(/\{\{\w+\}\}/g);
  if (leftover) throw new Error(`還有沒替換掉的 token：${[...new Set(leftover)].join(', ')}`);

  return html;
}

function heroTitleHtml(title) {
  const m = title.match(/^(.+?)(\s*[:：]\s*)(.+)$/);
  if (!m) return escapeHtml(title);
  return `<span class="h1-name">${escapeHtml(m[1])}<span class="sr-colon">${escapeHtml(m[2])}</span></span><span class="h1-line">${escapeHtml(m[3])}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 內嵌進 <script> 的 JSON，把 < 跳掉才不會被文案裡的 </script> 提早關掉標籤
function toScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
