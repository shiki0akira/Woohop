/*
 * 暖場遊戲的共用建置：把 games/{遊戲}/app/ 的樣板組成 dist/{遊戲}/，所有遊戲一次建好、一起部署。
 *
 *   node scripts/build.js            建全部
 *   node scripts/build.js bamboo     只建竹筍（只清掉 dist/bamboo/）
 *
 * 每個遊戲 × 每個語言 × 每個頁面各產生一份完整的靜態 HTML（title / description / canonical /
 * hreflang 都填好，文案直接寫進 HTML）。沒有這道 build 的話，所有語言會共用同一份
 * 中文 title、而且爬蟲看不到任何內容——系列前幾個專案都踩過同樣的坑，做法保持一致。
 *
 * 2026-10-23 從定時炸彈、竹筍、上樓下樓、果園菜園動物園四份幾乎一樣的 build.js 合併而來
 * （docs/roadmap.md 的方案 A）。**各遊戲不一樣的部分放在 games/{遊戲}/build.mjs**：
 * 額外的檢查、樣板 token、頂欄選項、sitemap 日期。這裡只放大家都一樣的流程。
 *
 * 導覽列與頁尾放在 shared/partials/，所有遊戲、兩個頁面共用同一份，不會改了一邊漏另一邊。
 * 樣板裡對不到值的 {{token}} 會直接讓 build 失敗，不會靜靜產出半空的頁面。
 *
 * 沒有 Worker 程式（assets-only Worker），dist/ 直接就是要上傳的靜態站台。
 * `/bamboo/` 這種沒帶語言的網址由 shared/redirect.html 在瀏覽器裡判斷語言後轉走。
 */

import { mkdir, readFile, writeFile, cp, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 真心話大冒險拉霸的題目（全站共用，每個暖場遊戲都有拉霸）
import { SLOT, checkSlot } from '../../homepage/src/slot-prompts.mjs';
// Woohop 全站共用的導覽列、頁尾與樣式：唯一來源在首頁（apps/homepage），build 時直接拿來用，
// 改首頁那份就是全站一起改。樣式與程式複製進 dist/{遊戲}/woohop/，跟遊戲一起部署（不跨網域引用）
import { STRINGS as SITE_STRINGS } from '../../homepage/src/locales.mjs';
import { navbar, footer, gameBar, THEME_HEAD } from '../../homepage/src/chrome.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shared = join(root, 'shared');
const siteAssets = join(root, '..', 'homepage', 'assets');
const SITE_ASSET_FILES = ['woohop.css', 'site.css', 'game.css', 'woohop-art.js', 'site.js', 'game.js'];
const dist = join(root, 'dist');

// 這幾個 token 是直接塞 HTML / JSON，不做跳脫；其餘一律當純文字處理。各遊戲可以在 build.mjs 的 RAW_TOKENS 加自己的
const RAW_TOKENS = new Set([
  'heroTitleHtml',
  'gameBarHtml',
  'woohopHeader',
  'woohopFooter',
  'woohopJson',
  'hreflang',
  'stringsJson',
  'slotJson',
  'langsJson',
  'rulesFactsList',
  'rulesHowList',
  'rulesLeadList',
  'jsonLd',
]);

/*
 * 不必每個語言都有的 key。
 *
 * 目前沒有（規則頁的長文 rulesArticle 在 2026-10-17 拿掉了，玩法頁改成精簡版）。
 * 之後若有「只寫給部分語言」的內容，放進這裡，不要把中文丟翻譯 API 湊字數。
 */
const OPTIONAL_KEYS = new Set([]);

// dir 是語言後面的路徑：遊戲頁在 /{遊戲}/{lang}/、玩法頁在 /{遊戲}/{lang}/rules/
const PAGES = [
  { template: 'template.html', dir: '', titleKey: 'seoTitle', descKey: 'seoDesc' },
  { template: 'rules.html', dir: 'rules', titleKey: 'rulesSeoTitle', descKey: 'rulesSeoDesc' },
];

await main();

async function main() {
  const all = await listGames();
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((id) => !all.includes(id));
  if (unknown.length) throw new Error(`沒有這些遊戲：${unknown.join(', ')}（有：${all.join(', ')}）`);
  const ids = wanted.length ? wanted : all;

  const partials = {
    head: (await readShared('partials/head.html')).replace(/(<meta name="theme-color"[^>]*>)/, (m) => m + THEME_HEAD),
    header: await readShared('partials/header.html'),
    footer: await readShared('partials/footer.html'),
  };

  if (!wanted.length) await clean(dist);
  for (const id of ids) await buildGame(id, partials, Boolean(wanted.length));

  console.log(`\nbuild ok → dist/ （${ids.join('、')}）`);
}

// games/ 底下有 build.mjs 的資料夾就是一個遊戲
async function listGames() {
  const entries = await readdir(join(root, 'games'), { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && existsSync(join(root, 'games', e.name, 'build.mjs')))
    .map((e) => e.name)
    .sort();
}

async function buildGame(id, partials, cleanOwn) {
  const gameDir = join(root, 'games', id);
  const app = join(gameDir, 'app');
  const { LANGS, DEFAULT_LANG, STRINGS, ORIGIN, BASE_PATH } = await import(pathToFileURL(join(app, 'strings.js')).href);
  const game = await import(pathToFileURL(join(gameDir, 'build.mjs')).href);
  const outBase = join(dist, BASE_PATH.replace(/^\//, ''));
  const rawTokens = new Set([...RAW_TOKENS, ...(game.RAW_TOKENS || [])]);
  const ctx = { id, LANGS, DEFAULT_LANG, STRINGS, ORIGIN, BASE_PATH, SITE_STRINGS, toScriptJson, escapeHtml };
  const pagePath = (lang, page) => `${BASE_PATH}/${lang}/` + (page.dir ? `${page.dir}/` : '');

  console.log(`\n${id}`);
  checkStrings(ctx, game.LIST_KEYS || []);
  game.check?.(ctx);
  checkSlot(LANGS);

  /*
   * 靜態資源帶上版本號（app.js?v=xxxx）。部署完瀏覽器（尤其是行動裝置與內嵌
   * WebView）常常還是拿舊的，得手動強制重整才會更新。網址變了就一定是新的請求。
   */
  const assetVersion = createHash('sha256')
    .update(await readFile(join(app, 'app.js')))
    .update(await readFile(join(app, 'app.css')))
    .update(await readFile(join(shared, 'header.js')))
    .update((await Promise.all(SITE_ASSET_FILES.map((f) => readFile(join(siteAssets, f))))).join(''))
    .digest('hex')
    .slice(0, 8);

  if (cleanOwn) await clean(outBase);
  await mkdir(outBase, { recursive: true });

  for (const page of PAGES) {
    const template = await readFile(join(app, page.template), 'utf8');
    const withPartials = injectPartials(template, partials);

    for (const lang of LANGS) {
      const html = render(withPartials, tokensFor(ctx, game, lang, page, pagePath, assetVersion), rawTokens);
      const dir = join(outBase, lang, page.dir);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), html, 'utf8');
      console.log(`  ${pagePath(lang, page)}`);
    }
  }

  // /{遊戲}/ 沒帶語言時的轉址頁：沒有後端，所以在瀏覽器裡判斷（規則同 ARCHITECTURE.md 第 6 節）
  const redirect = await readShared('redirect.html');
  await writeFile(
    join(outBase, 'index.html'),
    render(
      redirect,
      {
        base: BASE_PATH,
        defaultLang: DEFAULT_LANG,
        langsJson: toScriptJson(LANGS),
        canonical: ORIGIN + pagePath(DEFAULT_LANG, PAGES[0]),
        pageTitle: STRINGS[DEFAULT_LANG].seoTitle,
      },
      rawTokens,
    ),
    'utf8',
  );
  console.log(`  ${BASE_PATH}/ （語言轉址）`);

  await cp(join(app, 'app.js'), join(outBase, 'app.js'));
  await cp(join(shared, 'header.js'), join(outBase, 'header.js'));
  await cp(join(app, 'app.css'), join(outBase, 'app.css'));
  await mkdir(join(outBase, 'woohop'), { recursive: true });
  for (const f of SITE_ASSET_FILES) await cp(join(siteAssets, f), join(outBase, 'woohop', f));

  await cp(join(gameDir, 'public'), outBase, { recursive: true });
  await writeFile(join(outBase, 'sitemap.xml'), sitemap(ctx, game.CONTENT_UPDATED, pagePath), 'utf8');

  console.log(`  ${LANGS.length} 種語言 × ${PAGES.length} 頁`);
}

/*
 * 先清掉舊的產出，免得刪掉語言或資源之後還留著孤兒檔案。
 *
 * `npm run dev` 會在 `wrangler dev` 還開著的時候重跑 build，這時 Windows 會鎖住 dist
 * 而刪不掉（EBUSY）。那種情況下所有檔案本來就會被逐一覆寫，警告一聲繼續就好，
 * 不需要讓整個 build 失敗——02～04 也是這樣處理的。
 */
async function clean(dir) {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
    console.warn('  (dist 正在被使用，改成直接覆寫，沒有清掉舊檔)');
  }
}

function readShared(name) {
  return readFile(join(shared, name), 'utf8');
}

// partial 自己也含 {{token}}，所以要先貼進來、再一起做替換
function injectPartials(template, partials) {
  return template.replace(/\{\{(head|header|footer)\}\}/g, (whole, name) => partials[name].trimEnd());
}

// 漏翻的 key 在執行期會變成空字串，很難發現，所以在這裡先擋下來
function checkStrings({ LANGS, DEFAULT_LANG, STRINGS }, listKeys) {
  const reference = Object.keys(STRINGS[DEFAULT_LANG]).sort();

  for (const lang of LANGS) {
    if (!STRINGS[lang]) throw new Error(`strings.js 少了 ${lang} 這份文案`);

    const keys = Object.keys(STRINGS[lang]).sort();
    const missing = reference.filter((key) => !keys.includes(key) && !OPTIONAL_KEYS.has(key));
    const extra = keys.filter((key) => !reference.includes(key) && !OPTIONAL_KEYS.has(key));

    if (missing.length) throw new Error(`${lang} 少了這些 key：${missing.join(', ')}`);
    if (extra.length) throw new Error(`${lang} 多了 ${DEFAULT_LANG} 沒有的 key：${extra.join(', ')}`);
  }

  // 清單長度要一致，否則某個語言會少一步驟而沒人發現（要檢查哪些清單由各遊戲的 LIST_KEYS 決定）
  for (const key of listKeys) {
    const size = STRINGS[DEFAULT_LANG][key].length;
    for (const lang of LANGS) {
      if (STRINGS[lang][key].length !== size) {
        throw new Error(`${lang} 的 ${key} 有 ${STRINGS[lang][key].length} 項，應該是 ${size} 項`);
      }
    }
  }
}

function tokensFor(ctx, game, lang, page, pagePath, assetVersion) {
  const { id, LANGS, STRINGS, ORIGIN, BASE_PATH } = ctx;
  const strings = STRINGS[lang];
  const pageCtx = { ...ctx, lang, page, strings, pagePath };
  // 語言選單連到「這個遊戲同一頁」的其他語言；這個遊戲還沒做的語言連到那個語言的「找遊戲」，不連到 404
  const langHref = (l) => (LANGS.includes(l) ? pagePath(l, page) : `/${l}/games/`);

  return {
    ...strings,
    lang,
    base: BASE_PATH,
    // 全站導覽列與頁尾。遊戲代號不是首頁的分頁，所以導覽列不會標任何一項為目前頁面
    woohopHeader: navbar(SITE_STRINGS[lang], lang, id, langHref),
    woohopFooter: footer(SITE_STRINGS[lang], lang, id, langHref),
    // 給 site.js（導覽列互動）用的當頁文案；遊戲頁的 page_view 由 app.js 依畫面送
    // 規則頁沒有畫面切換，交給 site.js 載入時送
    woohopJson: toScriptJson({ lang, page: id, t: SITE_STRINGS[lang], langs: LANGS, ownPageView: !page.dir }),
    // 主標題拆成「遊戲名」＋「一句話」兩行（冒號那裡分開），不然中文會被平衡斷行切在詞中間。
    // 冒號留在 HTML 裡給爬蟲與螢幕閱讀器，畫面上藏起來
    heroTitleHtml: heroTitleHtml(strings.heroTitle),
    // 遊戲內頂欄（全站共用，見 apps/homepage/src/chrome.mjs 的 gameBar）。
    // 音樂／聲音開關、設定分頁這些各遊戲不同的選項在 build.mjs 的 gameBar()
    gameBarHtml: gameBar(SITE_STRINGS[lang], lang, {
      title: strings.navTitle,
      gameHref: pagePath(lang, PAGES[0]),
      rulesHref: pagePath(lang, PAGES[1]),
      rulesLabel: strings.navRules,
      isRules: page.dir === 'rules',
      // 設定畫面的返回鍵回「找遊戲」；玩法頁回遊戲頁（遊戲頁的返回鍵依畫面而定，見 app.js 的 window.gameBack）
      backHref: page.dir === 'rules' ? pagePath(lang, PAGES[0]) : `/${lang}/games/`,
      ...game.gameBar?.(pageCtx),
    }),
    crumbHome: SITE_STRINGS[lang].home,
    crumbGames: SITE_STRINGS[lang].navGames,
    siteOrigin: ORIGIN,
    assetVersion,
    // head partial 用的是通用名稱，各頁面把自己的 title/description 餵進去
    pageTitle: strings[page.titleKey],
    pageDesc: strings[page.descKey],
    ogImageAlt: strings.navTitle,
    canonical: ORIGIN + pagePath(lang, page),
    hreflang: hreflangTags(ctx, page, pagePath),
    stringsJson: toScriptJson(strings),
    // 真心話大冒險拉霸的題目（全站共用，只嵌這個語言的）
    slotJson: toScriptJson(SLOT[lang]),

    jsonLd: jsonLdFor(ORIGIN + pagePath(lang, page), lang, page, strings),
    // 玩法頁刻意精簡（2026-10-17）：人數／時間／準備、4 步流程、主持人怎麼帶。長文與常見問題拿掉了
    rulesFactsList: strings.rulesFacts
      .map(([k, v]) => `<li><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></li>`)
      .join('\n        '),
    sayLabel: SITE_STRINGS[lang].sayLabel,
    rulesHowList: listHtml(strings.rulesHowSteps),
    rulesLeadList: listHtml(strings.rulesLeadSteps),
    // 各遊戲自己的 token（題庫、名稱庫⋯），也可以蓋掉上面的預設值
    ...game.tokens?.(pageCtx),
  };
}

/*
 * 結構化資料。遊戲頁宣告自己是一個「免費、打開就能玩的網頁應用」，規則頁標成步驟（HowTo）。
 * 這是給機器讀「這一頁是什麼」用的——對這個站特別重要，因為搜尋「破冰遊戲」的人
 * 看到的幾乎都是文章，而這裡是一個可以直接玩的工具，那個差別要講得夠明白。
 *
 * 內容一律取自同一份 STRINGS，不另外寫一套，才不會畫面改了 JSON-LD 還停在舊文案。
 */
function jsonLdFor(url, lang, page, strings) {
  const data =
    page.dir === 'rules'
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: strings.rulesTitle,
          description: strings.rulesIntro,
          inLanguage: lang,
          step: strings.rulesHowSteps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: strings.navTitle,
          url,
          description: strings.seoDesc,
          inLanguage: lang,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
        };

  return `<script type="application/ld+json">${toScriptJson(data)}</script>`;
}

function listHtml(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n            ');
}

// hreflang 要指到「同一個頁面的其他語言」，不是一律指回遊戲頁
function hreflangTags({ LANGS, DEFAULT_LANG, ORIGIN }, page, pagePath) {
  const tags = LANGS.map(
    (lang) => `<link rel="alternate" hreflang="${lang}" href="${ORIGIN}${pagePath(lang, page)}" />`,
  );
  tags.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pagePath(DEFAULT_LANG, page)}" />`);
  return tags.join('\n    ');
}

/*
 * sitemap 的 lastmod 用各遊戲 build.mjs 的 CONTENT_UPDATED。**內容真的有變才手動改那個日期**——
 * 用 build 當下的時間會讓每次部署都宣稱「內容更新了」，那是假的新鮮度，
 * 爬蟲被騙幾次之後就不會再認真看這個欄位。
 */
function sitemap({ LANGS, ORIGIN }, contentUpdated, pagePath) {
  if (!contentUpdated) throw new Error('build.mjs 少了 CONTENT_UPDATED');
  const entries = [];

  for (const page of PAGES) {
    for (const lang of LANGS) {
      const alternates = LANGS.map(
        (other) =>
          `    <xhtml:link rel="alternate" hreflang="${other}" href="${ORIGIN}${pagePath(other, page)}" />`,
      ).join('\n');
      entries.push(
        [
          '  <url>',
          `    <loc>${ORIGIN}${pagePath(lang, page)}</loc>`,
          `    <lastmod>${contentUpdated}</lastmod>`,
          alternates,
          '  </url>',
        ].join('\n'),
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

function render(template, tokens, rawTokens) {
  const html = template.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in tokens)) throw new Error(`樣板用了 {{${name}}}，但沒有這個 key`);
    return rawTokens.has(name) ? tokens[name] : escapeHtml(tokens[name]);
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
