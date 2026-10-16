/*
 * 把 app/ 的樣板組成 dist/。
 *
 * 每個語言 × 每個頁面各產生一份完整的靜態 HTML（title / description / canonical /
 * hreflang 都填好，文案直接寫進 HTML）。沒有這道 build 的話，所有語言會共用同一份
 * 中文 title、而且爬蟲看不到任何內容——系列前幾個專案都踩過同樣的坑，做法保持一致。
 *
 * 導覽列與頁尾放在 app/partials/，兩個頁面共用同一份，不會改了一邊漏另一邊。
 * 樣板裡對不到值的 {{token}} 會直接讓 build 失敗，不會靜靜產出半空的頁面。
 *
 * 這個專案沒有 Worker（純前端，見 CONCEPT.md 2.1），所以 dist/ 直接就是要上傳的
 * 靜態站台。`/bomb/` 這個沒帶語言的網址由 redirect.html 在瀏覽器裡判斷語言後轉走。
 */

import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LANGS, DEFAULT_LANG, LOCALE_LABELS, STRINGS, ORIGIN, BASE_PATH, PROJECT_ID } from '../app/strings.js';
import { QUESTIONS, CATEGORY_GROUPS, checkQuestions } from '../app/questions.js';
// Woohop 全站共用的導覽列、頁尾與樣式：唯一來源在首頁（apps/homepage），build 時直接拿來用，
// 改首頁那份就是全站一起改。樣式與程式複製進 dist/bomb/woohop/，跟這個遊戲一起部署（不跨網域引用）
import { STRINGS as SITE_STRINGS } from '../../homepage/src/locales.mjs';
import { navbar, footer } from '../../homepage/src/chrome.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteAssets = join(root, '..', 'homepage', 'assets');
const SITE_ASSET_FILES = ['woohop.css', 'site.css', 'woohop-art.js', 'site.js'];
const dist = join(root, 'dist');
const outBase = join(dist, BASE_PATH.replace(/^\//, ''));

/*
 * 引爆時間的選項。**單一來源在這裡**，build 時內嵌進頁面（window.BOMB.timer），
 * app.js 不自己另外寫一份——兩邊各有一份的話，改了選項卻忘了改預設值，
 * 就會出現「預設值不在選項裡、五顆按鈕一顆都沒亮」。
 *
 * 上限 6 分鐘是題庫文件算題數餘裕時用的極端值；下限 30 秒再短就只夠傳兩個人。
 */
const TIMER = {
  minOptions: [30, 60, 120, 180],
  maxOptions: [60, 120, 180, 300, 360],
  defaultMin: 60,
  defaultMax: 180,
  /*
   * 設定畫面平常**只露出這三顆**，最短／最長那兩排收在「自訂」底下。
   *
   * 兩排攤開來是九顆按鈕加兩個標籤，而且還帶著一條要讀完才懂的規則
   * （最長不能小於最短）——主持人第一次打開就得先解一道題，才走得到「開始遊戲」。
   * 收成三個區間之後，這一頁要做的決定剩下「快一點還是慢一點」。
   *
   * 按鈕上只寫區間本身（「30 秒–2 分」），不另外取名字：區間就是最清楚的說明，
   * 而且不用為了三顆按鈕多翻八種語言。
   *
   * defaultMin / defaultMax 必須剛好等於其中一顆，不然一打開三顆都不亮，
   * 看起來像還沒選（checkTimer 會擋）。
   */
  presets: [
    { id: 'fast', min: 30, max: 120 },
    { id: 'normal', min: 60, max: 180 },
    { id: 'slow', min: 180, max: 360 },
  ],
};

// 這幾個 token 是直接塞 HTML / JSON，不做跳脫；其餘一律當純文字處理
const RAW_TOKENS = new Set([
  'heroTitleHtml',
  'woohopHeader',
  'woohopFooter',
  'woohopJson',
  'hreflang',
  'stringsJson',
  'questionsJson',
  'timerJson',
  'langsJson',
  'langOptions',
  'rulesHostList',
  'rulesPlayerList',
  'rulesFaqList',
  'rulesArticle',
  'jsonLd',
]);

/*
 * 不必每個語言都有的 key。
 *
 * rulesArticle 是規則頁那篇長文，**只寫給有讀者的語言**（目前只有 zh-TW）。
 * 沒有它的語言那一整塊就不出現。刻意不強制八語都要有：把中文丟翻譯 API 生一批
 * 薄長文出來湊字數，正是 2026/8 那次被演算法降權的成因（app/strings.js 開頭）。
 */
const OPTIONAL_KEYS = new Set(['rulesArticle']);

/*
 * sitemap 的 lastmod。**內容真的有變才手動改這個日期**——
 * 用 build 當下的時間會讓每次部署都宣稱「內容更新了」，那是假的新鮮度，
 * 爬蟲被騙幾次之後就不會再認真看這個欄位。
 */
const CONTENT_UPDATED = '2026-08-31';

// dir 是語言後面的路徑：遊戲頁在 /bomb/{lang}/、規則頁在 /bomb/{lang}/rules/
const PAGES = [
  { template: 'template.html', dir: '', titleKey: 'seoTitle', descKey: 'seoDesc' },
  { template: 'rules.html', dir: 'rules', titleKey: 'rulesSeoTitle', descKey: 'rulesSeoDesc' },
];

await main();

async function main() {
  checkTimer();
  checkStrings();
  checkQuestions(LANGS);

  /*
   * 靜態資源帶上版本號（app.js?v=xxxx）。部署完瀏覽器（尤其是行動裝置與內嵌
   * WebView）常常還是拿舊的，得手動強制重整才會更新。網址變了就一定是新的請求。
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
    head: await readPartial('head.html'),
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

  // /bomb/ 沒帶語言時的轉址頁。前面幾個專案是由 Worker 依 cookie 判斷，
  // 這裡沒有後端，所以改在瀏覽器裡判斷（規則同 ARCHITECTURE.md 第 6 節）。
  const redirect = await readFile(join(root, 'app', 'redirect.html'), 'utf8');
  await writeFile(
    join(outBase, 'index.html'),
    render(redirect, {
      base: BASE_PATH,
      defaultLang: DEFAULT_LANG,
      langsJson: toScriptJson(LANGS),
      canonical: ORIGIN + pagePath(DEFAULT_LANG, PAGES[0]),
      pageTitle: STRINGS[DEFAULT_LANG].seoTitle,
    }),
    'utf8',
  );
  console.log(`  ${BASE_PATH}/ （語言轉址）`);

  await cp(join(root, 'app', 'app.js'), join(outBase, 'app.js'));
  await cp(join(root, 'app', 'header.js'), join(outBase, 'header.js'));
  await cp(join(root, 'app', 'app.css'), join(outBase, 'app.css'));
  await mkdir(join(outBase, 'woohop'), { recursive: true });
  for (const f of SITE_ASSET_FILES) await cp(join(siteAssets, f), join(outBase, 'woohop', f));

  await cp(join(root, 'public'), outBase, { recursive: true });
  await writeFile(join(outBase, 'sitemap.xml'), sitemap(), 'utf8');

  console.log(`\nbuild ok → dist${BASE_PATH}/ （${LANGS.length} 種語言 × ${PAGES.length} 頁）`);
}

/*
 * 先清掉舊的產出，免得刪掉語言或資源之後還留著孤兒檔案。
 *
 * `npm run dev` 會在 `wrangler dev` 還開著的時候重跑 build，這時 Windows 會鎖住 dist
 * 而刪不掉（EBUSY）。那種情況下所有檔案本來就會被逐一覆寫，警告一聲繼續就好，
 * 不需要讓整個 build 失敗——02～04 也是這樣處理的。
 */
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

// 預設值不在選項裡的話，五顆按鈕會一顆都沒亮，而且畫面上完全看不出哪裡壞了
function checkTimer() {
  if (!TIMER.minOptions.includes(TIMER.defaultMin)) {
    throw new Error(`defaultMin ${TIMER.defaultMin} 不在 minOptions 裡`);
  }
  if (!TIMER.maxOptions.includes(TIMER.defaultMax)) {
    throw new Error(`defaultMax ${TIMER.defaultMax} 不在 maxOptions 裡`);
  }
  if (TIMER.defaultMax < TIMER.defaultMin) {
    throw new Error('預設的最長時間比最短還短');
  }
  // 最短選了最大值時，最長至少要有一個選項接得住，否則 clampRange 無路可走
  const biggestMin = Math.max(...TIMER.minOptions);
  if (!TIMER.maxOptions.some((value) => value >= biggestMin)) {
    throw new Error(`最短可以選到 ${biggestMin} 秒，但 maxOptions 沒有任何一個接得住`);
  }

  /*
   * 三顆預設的每個值都要真的在選項裡：點了預設之後畫面會把它寫回 settings，
   * 值不在選項裡的話「自訂」展開時那一排會一顆都不亮。
   */
  for (const preset of TIMER.presets) {
    if (!TIMER.minOptions.includes(preset.min)) {
      throw new Error(`預設 ${preset.id} 的最短 ${preset.min} 秒不在 minOptions 裡`);
    }
    if (!TIMER.maxOptions.includes(preset.max)) {
      throw new Error(`預設 ${preset.id} 的最長 ${preset.max} 秒不在 maxOptions 裡`);
    }
    if (preset.max < preset.min) {
      throw new Error(`預設 ${preset.id} 的最長比最短還短`);
    }
  }

  // 一打開沒有任何一顆亮著，看起來就像「還沒選」——那正是這次改版要消掉的東西
  if (!TIMER.presets.some((p) => p.min === TIMER.defaultMin && p.max === TIMER.defaultMax)) {
    throw new Error('預設值不等於任何一顆時間預設，設定畫面一打開會三顆都不亮');
  }
}

// 漏翻的 key 在執行期會變成空字串，很難發現，所以在這裡先擋下來
function checkStrings() {
  const reference = Object.keys(STRINGS[DEFAULT_LANG]).sort();

  for (const lang of LANGS) {
    if (!STRINGS[lang]) throw new Error(`strings.js 少了 ${lang} 這份文案`);

    const keys = Object.keys(STRINGS[lang]).sort();
    const missing = reference.filter((key) => !keys.includes(key) && !OPTIONAL_KEYS.has(key));
    const extra = keys.filter((key) => !reference.includes(key) && !OPTIONAL_KEYS.has(key));

    if (missing.length) throw new Error(`${lang} 少了這些 key：${missing.join(', ')}`);
    if (extra.length) throw new Error(`${lang} 多了 ${DEFAULT_LANG} 沒有的 key：${extra.join(', ')}`);
  }

  /*
   * 分組的顯示名稱是「group + 首字大寫」組出來的，漏一個會讓設定畫面那顆按鈕沒有標題。
   *
   * 只檢查分組、不檢查 CATEGORIES 裡那五個分類：設定畫面上勾選的單位是分組
   * （問答型 / 動作型兩顆按鈕），五個分類只在 questions.js 裡當題庫的整理方式，
   * 對應 QUESTIONS.md 的章節，不會出現在畫面上，所以也不需要八種語言的名字。
   */
  for (const group of CATEGORY_GROUPS) {
    const key = `group${group.id[0].toUpperCase()}${group.id.slice(1)}`;
    for (const lang of LANGS) {
      if (!STRINGS[lang][key]) throw new Error(`${lang} 少了分組名稱 ${key}`);
    }
  }

  // 規則頁的三份清單長度要一致，否則某個語言會少一步驟而沒人發現
  for (const key of ['rulesHostSteps', 'rulesPlayerSteps', 'rulesFaq']) {
    const size = STRINGS[DEFAULT_LANG][key].length;
    for (const lang of LANGS) {
      if (STRINGS[lang][key].length !== size) {
        throw new Error(`${lang} 的 ${key} 有 ${STRINGS[lang][key].length} 項，應該是 ${size} 項`);
      }
    }
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
    // 全站導覽列與頁尾。'bomb' 不是首頁的分頁，所以導覽列不會標任何一項為目前頁面；
    // 語言選單連到「這個遊戲同一頁」的其他語言
    woohopHeader: navbar(SITE_STRINGS[lang], lang, 'bomb', (l) => pagePath(l, page)),
    woohopFooter: footer(SITE_STRINGS[lang], lang, 'bomb', (l) => pagePath(l, page)),
    // 給 site.js（導覽列互動）用的當頁文案；遊戲頁的 page_view 由 app.js 依畫面送
    // 規則頁沒有畫面切換，交給 site.js 載入時送
    woohopJson: toScriptJson({ lang, page: 'bomb', t: SITE_STRINGS[lang], langs: LANGS, ownPageView: !page.dir }),
    // 主標題拆成「遊戲名」＋「一句話」兩行（冒號那裡分開），不然中文會被平衡斷行切在詞中間。
    // 冒號留在 HTML 裡給爬蟲與螢幕閱讀器，畫面上藏起來
    heroTitleHtml: heroTitleHtml(strings.heroTitle),
    menuLabel: SITE_STRINGS[lang].menu,
    crumbHome: SITE_STRINGS[lang].home,
    crumbGames: SITE_STRINGS[lang].navGames,
    siteOrigin: ORIGIN,
    assetVersion,
    // head partial 用的是通用名稱，各頁面把自己的 title/description 餵進去
    pageTitle: strings[page.titleKey],
    pageDesc: strings[page.descKey],
    canonical: ORIGIN + pagePath(lang, page),
    hreflang: hreflangTags(page),
    stringsJson: toScriptJson(strings),
    // 題庫只內嵌「這個語言的文字」，不是每種語言全帶：
    // 一份頁面只有一種語言，帶進全部會讓每頁多背用不到的題庫
    questionsJson: toScriptJson(questionsFor(lang)),
    timerJson: toScriptJson(TIMER),
    rulesArticle: articleHtml(strings.rulesArticle),
    jsonLd: jsonLdFor(lang, page, strings),
    rulesHostList: listHtml(strings.rulesHostSteps),
    rulesPlayerList: listHtml(strings.rulesPlayerSteps),
    rulesFaqList: faqHtml(strings.rulesFaq),
  };
}

/*
 * 送到前端的題庫。
 *
 * 每一題只帶 `group`（ask / dare），**不帶五個分類的 category**：設定畫面上能勾的
 * 就只有兩顆按鈕，前端拿到 category 也沒有用途，還得自己再做一次分類→分組的對應。
 * 五個分類留在 questions.js 裡當題庫的整理方式（對應 QUESTIONS.md 的章節）。
 *
 * `familiar`（※ 記號）也不送：設定畫面已經沒有那個開關，那 2 題一律在牌堆裡。
 */
function questionsFor(lang) {
  const groupOf = new Map();
  for (const group of CATEGORY_GROUPS) {
    for (const category of group.categories) groupOf.set(category, group.id);
  }

  return {
    groups: CATEGORY_GROUPS.map((group) => group.id),
    list: QUESTIONS.map((question) => ({
      id: question.id,
      group: groupOf.get(question.category),
      text: question.text[lang],
    })),
  };
}

/*
 * 規則頁的長文。每一節是 { h, p: [段落…] }，沒填就回空字串，
 * 樣板那一格就整個不見（rules.html 的 {{rulesArticle}}）。
 */
/*
 * 長文段落裡的 **重點** 轉成 <strong>。整頁兩千多字，沒有任何層次的話讀者只會整段跳過。
 *
 * **一定要先跳脫再轉換**：跳脫過的文字裡不可能再出現 < 或 >，所以這裡加進去的
 * <strong> 是唯一的標籤，文案再怎麼寫都插不進別的東西。順序反過來就是一個注入點。
 * 也刻意只支援這一種語法——這是 build 腳本，不是要做一套 Markdown。
 */
function emphasise(text) {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function articleHtml(sections) {
  if (!Array.isArray(sections) || !sections.length) return '';

  return sections
    .map((section) => {
      const paragraphs = section.p.map((text) => `          <p>${emphasise(text)}</p>`).join('\n');
      return `<section class="panel prose">
          <h2>${escapeHtml(section.h)}</h2>
${paragraphs}
        </section>`;
    })
    .join('\n\n        ');
}

/*
 * 結構化資料。遊戲頁宣告自己是一個「免費、打開就能玩的網頁應用」，規則頁把 FAQ 標起來。
 * 這是給機器讀「這一頁是什麼」用的——對這個站特別重要，因為搜尋「破冰遊戲」的人
 * 看到的幾乎都是文章，而這裡是一個可以直接玩的工具，那個差別要講得夠明白。
 *
 * 內容一律取自同一份 STRINGS，不另外寫一套，才不會畫面改了 JSON-LD 還停在舊文案。
 */
function jsonLdFor(lang, page, strings) {
  const url = ORIGIN + pagePath(lang, page);

  const data =
    page.dir === 'rules'
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: lang,
          mainEntity: strings.rulesFaq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
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

function faqHtml(items) {
  return items
    .map(
      (item) =>
        // 跟首頁常見問題同一種：點開才看答案（Woohop 的 .faq）
        `<details>\n            <summary>${escapeHtml(item.q)}</summary>\n            <p>${escapeHtml(item.a)}</p>\n          </details>`,
    )
    .join('\n          ');
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
  tags.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pagePath(DEFAULT_LANG, page)}" />`);
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
        [
          '  <url>',
          `    <loc>${ORIGIN}${pagePath(lang, page)}</loc>`,
          `    <lastmod>${CONTENT_UPDATED}</lastmod>`,
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

function render(template, tokens) {
  const html = template.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in tokens)) throw new Error(`樣板用了 {{${name}}}，但沒有這個 key`);
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
