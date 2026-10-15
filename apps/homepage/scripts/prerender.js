// 為 8 種語言各產生一份靜態 HTML，輸出到 dist/。
//
// 為什麼需要這支：原本 /zh-TW/、/ja/、/en/ 等所有語言都 rewrite 到同一份 index.html，
// 那份 HTML 的 <title> 與 lang 屬性寫死中文，body 裡 hero 與卡片文字則是空標籤、
// 等 JS 用 textContent 填。結果是爬蟲不論抓哪個語言，看到的都是「中文標題 + 空內文」，
// 而且整站一條 hreflang 都沒有，各語言版本等於在互相競爭同一組關鍵字。
//
// 這支從 index.html 裡的 STRINGS 直接取文案（跟執行期 JS 用的是同一份來源，不會對不上），
// 為每個語言產生帶正確 lang/title/description/canonical/hreflang 且內文已填好的 HTML。
// JS 照常載入並用同樣的字串覆寫，所以畫面行為完全不變。
//
// ⚠️ index.html 的 STRINGS 或 body 結構改了，這裡的 replace 規則要跟著確認。
// 下面每條 replace 都對應 index.html 裡一個具體的元素，對不到會在 build 時報錯。

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://www.vibeweb100.com';
const DEFAULT_LANG = 'zh-TW';
const OUT = path.resolve('dist');

const src = readFileSync(path.resolve('index.html'), 'utf8');

const match = src.match(/var STRINGS = (\{[\s\S]*?\n {6}\});/);
if (!match) throw new Error('在 index.html 找不到 STRINGS 物件，prerender 無法取得文案');
const STRINGS = new Function(`return ${match[1]}`)();
const LANGS = Object.keys(STRINGS);

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const langUrl = (lang) => `${SITE}/${lang}/`;

// 逐條套用替換規則，對不到就直接失敗——沉默略過會產出看起來正常但內容是空的頁面。
function applyAll(html, rules, lang) {
  return rules.reduce((acc, [pattern, replacement]) => {
    if (!pattern.test(acc)) {
      throw new Error(`[${lang}] 找不到要替換的位置: ${pattern}`);
    }
    return acc.replace(pattern, replacement);
  }, html);
}

/*
 * 長文的段落。**重點** 轉成 <strong>，跟執行期 renderArticle() 畫出來的結構一致，
 * 不然爬蟲看到的跟使用者看到的會是兩種東西。
 *
 * **先跳脫再轉換**：跳脫過的文字裡不可能再出現 < 或 >，所以加進去的 <strong>
 * 是唯一的標籤。順序反過來就是一個注入點。
 */
function articleHtml(sections) {
  if (!Array.isArray(sections) || !sections.length) return '';

  return sections
    .map((section) => {
      const paragraphs = section.p
        .map((text) => `          <p>${esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`)
        .join('\n');
      return `\n        <section>\n          <h2>${esc(section.h)}</h2>\n${paragraphs}\n        </section>`;
    })
    .join('') + '\n      ';
}

/*
 * 結構化資料。
 *
 * 重點是 ItemList：搜尋「破冰遊戲」的人看到的整頁都是文章，這裡要讓機器讀懂
 * 這一頁是**一份可以直接開來玩的工具清單**，而不是第十六篇推薦文。
 * 每一項都指到實際的遊戲頁，順序跟畫面上的卡片一致。
 */
function jsonLd(s, lang, url) {
  const games = [
    { name: s.avalonTitle, desc: s.avalonDesc, path: `/avalon/${lang}` },
    { name: s.buzzerTitle, desc: s.buzzerDesc, path: `/buzzer/${lang}/` },
    { name: s.matchTitle, desc: s.matchDesc, path: `/match/${lang}/` },
    { name: s.bingoTitle, desc: s.bingoDesc, path: `/bingo/${lang}/` },
    { name: s.bombTitle, desc: s.bombDesc, path: `/bomb/${lang}/` },
    // 只有繁體中文，每個語言都指到同一頁
    { name: s.happyTitle.replace(/­/g, ''), desc: s.happyDesc, path: '/happiness/zh-TW/' },
  ];

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'Web100',
        description: s.seoDesc,
        inLanguage: lang,
      },
      {
        '@type': 'ItemList',
        name: s.heroTitle,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        numberOfItems: games.length,
        itemListElement: games.map((game, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebApplication',
            name: game.name,
            description: game.desc,
            url: SITE + game.path,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
          },
        })),
      },
    ],
  };

  // 把 < 跳成 \u003c：文案裡萬一出現 </script> 才不會提早關掉標籤
  return `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function render(lang) {
  const s = STRINGS[lang];
  const url = langUrl(lang);

  const alternates = LANGS.map(
    (l) => `    <link rel="alternate" hreflang="${l}" href="${langUrl(l)}" />`,
  ).join('\n');
  const xDefault = `    <link rel="alternate" hreflang="x-default" href="${langUrl(DEFAULT_LANG)}" />`;

  // 填入首屏文字。這些元素在原始 index.html 裡是空的，執行期由 JS 以同一份 STRINGS 填入，
  // 所以靜態內容跟使用者實際看到的畫面一致。
  const fill = (tag, id, value) => [
    new RegExp(`(<${tag} id="${id}">)(</${tag}>)`),
    `$1${esc(value)}$2`,
  ];

  return applyAll(
    src,
    [
      [/<html lang="[^"]*"/, `<html lang="${lang}"`],
      [/<title>[\s\S]*?<\/title>/, `<title>${esc(s.seoTitle)}</title>`],
      [/(<meta name="description" content=")[^"]*(")/, `$1${esc(s.seoDesc)}$2`],
      [/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(s.seoTitle)}$2`],
      [/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(s.seoDesc)}$2`],
      [/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`],
      [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
      // hreflang 接在 canonical 之後，讓網址相關的標籤集中在一起
      [/(<link rel="canonical"[^>]*>)/, `$1\n${alternates}\n${xDefault}`],
      fill('h1', 'hero-title', s.heroTitle),
      fill('p', 'hero-tagline', s.heroTagline),
      fill('h3', 'avalon-title', s.avalonTitle),
      fill('p', 'avalon-desc', s.avalonDesc),
      fill('h3', 'buzzer-title', s.buzzerTitle),
      fill('p', 'buzzer-desc', s.buzzerDesc),
      fill('h3', 'match-title', s.matchTitle),
      fill('p', 'match-desc', s.matchDesc),
      fill('h3', 'bingo-title', s.bingoTitle),
      fill('p', 'bingo-desc', s.bingoDesc),
      fill('h3', 'bomb-title', s.bombTitle),
      fill('p', 'bomb-desc', s.bombDesc),
      [/(<span class="tag" id="avalon-tag">)(<\/span>)/, `$1${esc(s.avalonTag)}$2`],
      [/(<span class="tag" id="buzzer-tag">)(<\/span>)/, `$1${esc(s.buzzerTag)}$2`],
      [/(<span class="tag" id="match-tag">)(<\/span>)/, `$1${esc(s.matchTag)}$2`],
      [/(<span class="tag" id="bingo-tag">)(<\/span>)/, `$1${esc(s.bingoTag)}$2`],
      [/(<span class="tag" id="bomb-tag">)(<\/span>)/, `$1${esc(s.bombTag)}$2`],
      // 卡片連結先給對的語言網址，爬蟲不必等 JS 執行就能順著爬到阿瓦隆。
      // 不帶尾斜線，與阿瓦隆站的 canonical 一致。
      [/(<a class="card" id="avalon-card" href=")[^"]*(")/, `$1/avalon/${lang}$2`],
      // 搶答帶尾斜線，跟它自己的 canonical 一致
      [/(<a class="card" id="buzzer-card" href=")[^"]*(")/, `$1/buzzer/${lang}/$2`],
      // 喜好二選一同樣帶尾斜線，跟它自己的 canonical 一致
      [/(<a class="card" id="match-card" href=")[^"]*(")/, `$1/match/${lang}/$2`],
      // 幸福賓果也是 8 種語言了，帶尾斜線跟它自己的 canonical 一致
      [/(<a class="card" id="bingo-card" href=")[^"]*(")/, `$1/bingo/${lang}/$2`],
      // 定時炸彈同樣帶尾斜線
      [/(<a class="card" id="bomb-card" href=")[^"]*(")/, `$1/bomb/${lang}/$2`],
      // 幸福模擬器只有繁體中文，連結固定是 /happiness/zh-TW/，index.html 裡已經寫死，不用換
      fill('h3', 'happy-title', s.happyTitle),
      fill('p', 'happy-desc', s.happyDesc),
      [/(<span class="tag" id="happy-tag">)(<\/span>)/, `$1${esc(s.happyTag)}$2`],
      // 說明長文。只有部分語言有（目前 zh-TW），沒有的語言這個容器維持空的
      [/(<div class="article" id="home-article">)(<\/div>)/, `$1${articleHtml(s.homeArticle)}$2`],
      // 結構化資料：宣告這是一個「工具集合」而不是一篇文章
      [/(<link rel="canonical"[^>]*>)/, `$1
${jsonLd(s, lang, url)}`],
    ],
    lang,
  );
}

// sitemap 也一併帶上 hreflang，讓 Google 不必逐頁抓完才知道語言對應關係。
function buildSitemap() {
  const alternates = LANGS.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(l)}"/>`,
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${langUrl(DEFAULT_LANG)}"/>`;
  const urls = LANGS.map(
    (l) => `  <url>\n    <loc>${langUrl(l)}</loc>\n${alternates}\n${xDefault}\n  </url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

mkdirSync(OUT, { recursive: true });

for (const lang of LANGS) {
  const dir = path.join(OUT, lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), render(lang));
}

// 根目錄留一份（vercel.json 的 / -> /zh-TW/ 轉址之外的保險），內容用預設語言。
writeFileSync(path.join(OUT, 'index.html'), render(DEFAULT_LANG));

writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap());

// 404.html 不進多語言產生流程：找不到的網址沒有語言可以判斷（/it/ 和 /xyz 都會落到這裡），
// 語言在執行期挑，所以原樣複製就好。Vercel 對靜態輸出會自動拿 dist/404.html 當找不到頁面的回應。
for (const file of ['robots.txt', 'design-tokens.css', 'favicon.svg', 'apple-touch-icon.png', '404.html']) {
  if (existsSync(file)) copyFileSync(file, path.join(OUT, file));
}

console.log(`Prerendered ${LANGS.length} language pages + sitemap into dist/.`);
