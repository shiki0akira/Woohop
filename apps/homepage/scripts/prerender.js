// 為 8 種語言 × 3 種頁面（首頁、找遊戲、破冰組合）各產生一份靜態 HTML，輸出到 dist/。
//
// 為什麼要這支：每個語言、每個頁面都要有自己的 lang、title、description、canonical、hreflang，
// 而且內文要直接寫在 HTML 裡——只靠 JS 填字的話，爬蟲看到的是空頁面，各語言也會互相搶同一組關鍵字。
//
// 文案的唯一來源是 src/locales.mjs；當頁語言的那一份也會嵌進 HTML（window.WOOHOP.t），
// 執行期的 JS（assets/site.js）讀同一份，畫面跟爬蟲看到的內容不會對不上。
//
// 網址：
//   /{lang}/          首頁
//   /{lang}/games/    找遊戲
//   /{lang}/combo/    破冰組合
//   /{lang}/tools/    桌遊助手（阿瓦隆＋小工具總覽，2026-10-22）
//   /{lang}/tools/truth-or-dare/、metronome/、names/   小工具（全站共用的帶領元件 window.Leader）
// 舊網址只有 /{lang}/，維持不變；其他是新增的。

import { writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { STRINGS, LANGS, DEFAULT_LANG, LANG_NAMES, GAME_LANGS, gameInLang } from '../src/locales.mjs';
import { navbar, footer, PAGES, local, esc, THEME_HEAD } from '../src/chrome.mjs';
import { TOOLS, TOOL_KEYS, TOOL_GAMES } from '../src/tools-strings.mjs';
import { SLOT } from '../src/slot-prompts.mjs';
import { THEMES, groupsFor } from '../src/name-pools.mjs';

// 小工具頁的文案併進當頁語言的 STRINGS（s.tools），head／jsonLd／window.WOOHOP.t 都讀得到
for (const lang of LANGS) STRINGS[lang].tools = TOOLS[lang];
const isTool = (page) => TOOL_KEYS.includes(page);

const SITE = 'https://www.vibeweb100.com';
const OUT = path.resolve('dist');
// 帶領指南的文章還沒寫：頁面先不給 Google 收錄、也不放進 sitemap，免得被當成內容太薄的頁面
const NOINDEX = new Set(['guides']);
// 改了 assets/ 底下的檔案要換這個版本號，瀏覽器才會抓新的（檔名後面的 ?v=）
const ASSET_VERSION = '2026-10-22f';

const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''));
const url = (lang, page) => `${SITE}/${lang}/${PAGES[page]}`;
const gameUrl = (lang, key) => (key === 'avalon' ? `/avalon/${lang}` : `/${key}/${lang}/`);
// JSON 嵌進 <script>：把 < 跳成 <，文案裡萬一有 </script> 才不會提早關掉標籤
const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/* ---------- 共用的頁首、頁尾 ---------- */

function head(s, lang, page, title, desc, jsonLd, css = []) {
  const alternates = LANGS.map((l) => `    <link rel="alternate" hreflang="${l}" href="${url(l, page)}" />`).join('\n');
  const asset = (f) => `/assets/${f}?v=${ASSET_VERSION}`;
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f4f4f6" />
    ${THEME_HEAD}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
${NOINDEX.has(page) ? '    <meta name="robots" content="noindex, follow" />\n' : ''}    <link rel="canonical" href="${url(lang, page)}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LANG, page)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Woohop" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${url(lang, page)}" />
    <meta property="og:locale" content="${lang.replace('-', '_')}" />
    <meta property="og:image" content="${SITE}/og/${lang}.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(s.heroAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${jsonForScript(jsonLd)}</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-S7PE5687BG"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      // 自動 page_view 關掉，由 assets/site.js 在載入時手動送（帶正確的 page_path）
      gtag('config', 'G-S7PE5687BG', { send_page_view: false });
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${asset('woohop.css')}" />
    <link rel="stylesheet" href="${asset('site.css')}" />
${css.map((c) => `    <link rel="stylesheet" href="${asset(c)}" />`).join('\n')}
  </head>`;
}

// 每頁都嵌一份當頁語言的文案，執行期 JS 直接讀，不用再發請求
function scripts(s, lang, page, extra = [], more = {}) {
  const v = `?v=${ASSET_VERSION}`;
  // gameLangs：只開放部分語言的遊戲，site.js 在其他語言把它標成「即將推出」
  const data = { lang, page, t: s, langs: LANGS, langNames: LANG_NAMES, gameLangs: GAME_LANGS, ...more };
  return `
    <script>window.WOOHOP = ${jsonForScript(data)};</script>
    <script src="/assets/woohop-art.js${v}"></script>
    <script src="/assets/site.js${v}"></script>
${extra.map((f) => `    <script src="/assets/${f}${v}"></script>`).join('\n')}`;
}

/* ---------- 遊戲清單（靜態版，給爬蟲與沒開 JS 的人；JS 會換成有插圖、能篩選的版本） ---------- */

const GAME_KEYS = ['match', 'bingo', 'bomb', 'buzzer', 'bamboo', 'stairs', 'orchard', 'avalon'];
// 這個語言真的玩得到的遊戲（竹筍目前只有 zh-TW，見 locales.mjs 的 GAME_LANGS）
const gameKeysFor = (lang) => GAME_KEYS.filter((k) => gameInLang(k, lang));
function staticGames(s, lang, keys = gameKeysFor(lang)) {
  return keys
    .map((k) => `<a class="game" href="${gameUrl(lang, k)}"><h3>${esc(s.games[k][0])}</h3><p>${esc(s.games[k][1])}</p></a>`)
    .join('');
}

/* ---------- 結構化資料 ---------- */

function jsonLd(s, lang, page, title, desc) {
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: `${SITE}/`,
    name: 'Woohop',
    // 改名前叫 Web100，留著舊名字，搜尋舊名字的人也找得到
    alternateName: ['Web100', 'vibeweb100'],
    inLanguage: LANGS,
  };
  const pageNode = {
    '@type': 'WebPage',
    '@id': `${url(lang, page)}#webpage`,
    url: url(lang, page),
    name: title,
    description: desc,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE}/#website` },
  };
  const graph = [website, pageNode];
  if (page === 'home' || page === 'games') {
    // 首頁與找遊戲頁：宣告這是「可以直接開來玩的工具清單」，不是一篇推薦文
    graph.push({
      '@type': 'ItemList',
      name: page === 'home' ? s.heroTitle1 + s.heroTitle2 : s.gamesH1,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      numberOfItems: gameKeysFor(lang).length,
      itemListElement: gameKeysFor(lang).map((k, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'WebApplication',
          name: s.games[k][0],
          description: s.games[k][1],
          url: SITE + gameUrl(lang, k),
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
        },
      })),
    });
  }
  const faq = page === 'home' ? faqItems(s.faq) : [];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url(lang, page)}#faq`,
      mainEntity: faq.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a.map(plain).join('\n') },
      })),
    });
  }
  if (page !== 'home') {
    const second = isTool(page) ? 'tools' : page;
    const items = [
      { '@type': 'ListItem', position: 1, name: s.home, item: url(lang, 'home') },
      { '@type': 'ListItem', position: 2, name: { games: s.gamesH1, combo: s.comboH1, guides: s.guidesH1, tools: s.tools.h1 }[second], item: url(lang, second) },
    ];
    if (isTool(page)) items.push({ '@type': 'ListItem', position: 3, name: s.tools.items[page].name, item: url(lang, page) });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }
  if (isTool(page)) {
    // 小工具本身：免費的網頁工具
    graph.push({
      '@type': 'WebApplication',
      name: s.tools.items[page].name,
      description: desc,
      url: url(lang, page),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/* ---------- 常見問題（只有 zh-TW） ----------
 * 內容寫在 HTML 裡（<details> 收合也看得到），SEO 不受影響；另外輸出 FAQPage 結構化資料。
 */
const faqItems = (faq) => (Array.isArray(faq) ? faq.map(([q, a]) => ({ q, a: [a] })) : []);
// **重點** 轉成 <strong>。先跳脫再轉換：跳脫過的文字不可能再有 < >，加進去的 <strong> 是唯一的標籤
const rich = (p) => esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const plain = (p) => p.replace(/\*\*/g, '');
function faqHtml(items) {
  return items
    .map((it, i) => `<details name="faq"${i === 0 ? ' open' : ''}><summary>${esc(it.q)}</summary>${it.a.map((p) => `<p>${rich(p)}</p>`).join('')}</details>`)
    .join('');
}

/* ---------- 指南卡片（文章還沒寫：不是連結，標即將推出） ---------- */

const GUIDE_BADGE = { beginner: 'b-new', scene: 'b-info', tip: 'b-live' };
function guideCard(s, [type, title, desc, min]) {
  return `<div class="guide is-disabled" aria-disabled="true" data-type="${type}"><span class="badge ${GUIDE_BADGE[type]}">${esc(s.guideTypes[type])}</span><h3>${esc(title)}</h3><p>${esc(desc)}</p><span class="meta">${esc(fmt(s.readMin, { n: min }))}</span><span class="badge b-soon">${esc(s.soon)}</span></div>`;
}

/* ---------- 頁面 ---------- */

function homePage(lang) {
  const s = STRINGS[lang];
  const title = s.seoTitle, desc = s.seoDesc;
  const badges = (list, cls) => list.map((b) => `<span class="badge ${cls}">${esc(b)}</span>`).join('');
  return `${head(s, lang, 'home', title, desc, jsonLd(s, lang, 'home', title, desc))}
  <body>${navbar(s, lang, 'home')}
      <main id="main">
        <section class="hero">
          <div class="hero-bg" aria-hidden="true"><svg id="hero-tiles"></svg></div>
          <div>
            <span class="kicker">${esc(s.heroKicker)}</span>
            <h1><span>${esc(s.heroTitle1)}</span> <span>${esc(s.heroTitle2)}</span></h1>
            <p class="lead">${esc(s.heroLead)}</p>
            <div class="cta">
              <a class="btn btn-lg btn-solid" href="${local(lang, 'games')}">${esc(s.heroCta)}</a>
              <button class="btn btn-lg btn-secondary" type="button" id="hero-random"><svg><use href="#i-dice"/></svg>${esc(s.heroRandom)}</button>
            </div>
            <div class="trust">${s.trust.map((x) => `<span><svg><use href="#i-check"/></svg>${esc(x)}</span>`).join('')}</div>
          </div>
          <div class="hero-art">
            <svg id="hero-illo" viewBox="0 0 530 380" role="img" aria-label="${esc(s.heroAlt)}"></svg>
          </div>
        </section>

        <section id="finder">
          <div class="section-head"><div><span class="kicker">${esc(s.finderKicker)}</span><h2>${esc(s.finderTitle)}</h2><p>${esc(s.finderLead)}</p></div></div>
          <div id="finder-root"><div class="game-grid">${staticGames(s, lang)}</div></div>
        </section>

        <section id="combo">
          <div class="section-head">
            <div><span class="kicker">${esc(s.comboKicker)}</span><h2>${esc(s.comboTitle)}</h2><p>${esc(s.comboLead)}</p></div>
            <a class="link" href="${local(lang, 'combo')}">${esc(s.comboMore)}</a>
          </div>
          <div class="plan" id="combo-root"></div>
        </section>

        <section id="boardgame">
          <div class="section-head"><div><span class="kicker">${esc(s.boardKicker)}</span><h2>${esc(s.boardTitle)}</h2></div></div>
          <div class="feature">
            <div class="art-box" data-art="avalon"></div>
            <div>
              <h3>${esc(s.games.avalon[0])}</h3>
              <p>${esc(s.avalonLong)}</p>
              <div class="row" style="margin-top:12px">${badges(s.avalonBadges, 'b-info')}</div>
            </div>
            <a class="btn btn-lg btn-solid" href="/avalon/${lang}">${esc(s.avalonCta)}</a>
            <svg class="w-row" viewBox="0 0 354 48" aria-hidden="true" data-w-row="#3D54B6"></svg>
          </div>
        </section>

        <section id="happiness">
          <div class="section-head"><div><span class="kicker">${esc(s.happyKicker)}</span><h2>${esc(s.happyTitle)}</h2></div></div>
          <div class="feature mint">
            <div class="art-box" data-art="happiness"></div>
            <div>
              <h3>${esc(s.games.happy[0])}</h3>
              <p>${esc(s.happyLong)}</p>
              <div class="row" style="margin-top:12px">${badges(s.happyBadges, 'b-live')}</div>
              ${s.happyNote ? `<p class="note">${esc(s.happyNote)}</p>` : ''}
            </div>
            <a class="btn btn-lg g-mint" href="/happiness/zh-TW/">${esc(s.happyCta)}</a>
            <svg class="w-row" viewBox="0 0 354 48" aria-hidden="true" data-w-row="#4FB59A"></svg>
          </div>
        </section>
        <section id="party">
          <div class="section-head"><div><span class="kicker">${esc(s.partyKicker)}</span><h2>${esc(s.partyTitle)}</h2><p>${esc(s.partyLead)}</p></div></div>
          <div class="party">
            <div class="party-steps">${s.partySteps.map(([b, d]) => `<div class="party-step"><b>${esc(b)}</b><span>${esc(d)}</span></div>`).join('')}</div>
            <div class="row"><button class="btn btn-secondary" type="button" disabled>${esc(s.partyCta)}</button><span class="badge b-soon">${esc(s.soon)}</span></div>
          </div>
        </section>

        <section id="guides">
          <div class="section-head"><div><span class="kicker">${esc(s.guidesKicker)}</span><h2>${esc(s.guidesTitle)}</h2></div><a class="link" href="${local(lang, 'guides')}">${esc(s.seeAllGuides)}</a></div>
          <div class="guides">${[...s.guides, ...s.moreGuides].slice(0, 4).map((g) => guideCard(s, g)).join('')}</div>
        </section>
${s.faq ? `
        <section id="faq">
          <div class="section-head"><div><h2>${esc(s.faqKicker)}</h2></div></div>
          <div class="faq-wrap">
            <div class="faq">${faqHtml(faqItems(s.faq))}</div>
            <div class="faq-art"><svg id="faq-illo" viewBox="0 0 320 300" role="img" aria-label="${esc(s.faqKicker)}"></svg></div>
          </div>
        </section>` : ''}
      </main>
${footer(s, lang, 'home')}
${scripts(s, lang, 'home', ['hero-art.js', 'home.js'])}
  </body>
</html>
`;
}

function gamesPage(lang) {
  const s = STRINGS[lang];
  const title = s.gamesSeoTitle, desc = s.gamesSeoDesc;
  return `${head(s, lang, 'games', title, desc, jsonLd(s, lang, 'games', title, desc))}
  <body>${navbar(s, lang, 'games')}
      <main id="main">
        <div class="page-head">
          <nav class="crumbs" aria-label="breadcrumb"><a href="${local(lang, 'home')}">${esc(s.home)}</a><span>›</span><span>${esc(s.navGames)}</span></nav>
          <h1>${esc(s.gamesH1)}</h1>
          <p>${esc(s.gamesLead)}</p>
        </div>
        <section style="padding-top:20px">
          <div id="finder-root"><div class="game-grid">${staticGames(s, lang)}</div></div>
        </section>
      </main>
${footer(s, lang, 'games')}
${scripts(s, lang, 'games', ['games.js'])}
  </body>
</html>
`;
}

function comboPage(lang) {
  const s = STRINGS[lang];
  const title = s.comboSeoTitle, desc = s.comboSeoDesc;
  return `${head(s, lang, 'combo', title, desc, jsonLd(s, lang, 'combo', title, desc))}
  <body>${navbar(s, lang, 'combo')}
      <main id="main">
        <div class="page-head">
          <nav class="crumbs" aria-label="breadcrumb"><a href="${local(lang, 'home')}">${esc(s.home)}</a><span>›</span><span>${esc(s.navCombo)}</span></nav>
          <h1>${esc(s.comboH1)}</h1>
          <p>${esc(s.comboPageLead)}</p>
        </div>
        <section style="padding-top:20px">
          <div class="plan" id="combo-root"></div>
        </section>
        <section>
          <div class="section-head"><div><span class="kicker">${esc(s.flowKicker)}</span><h2>${esc(s.flowTitle)}</h2><p>${esc(s.flowLead)}</p></div></div>
          <div class="card" style="background:var(--surface)">
            <ol class="flow" id="flow">
              <li><span class="when">${esc(s.flowOpen)}</span><div><h3>${esc(s.flowOpenTitle)}</h3><p>${esc(s.flowOpenDesc)}</p></div></li>
              <li><span class="when">${esc(s.flowTrans)}</span><div><h3>${esc(s.flowTransTitle)}</h3><p>${esc(s.flowTransDesc)}</p></div></li>
              <li><span class="when">${esc(s.flowClose)}</span><div><h3>${esc(s.flowCloseTitle)}</h3><p>${esc(s.flowCloseDesc)}</p></div></li>
            </ol>
          </div>
        </section>
      </main>
${footer(s, lang, 'combo')}
${scripts(s, lang, 'combo', ['combo.js'])}
  </body>
</html>
`;
}

function guidesPage(lang) {
  const s = STRINGS[lang];
  const title = s.guidesSeoTitle, desc = s.guidesSeoDesc;
  const types = [['all', s.guidesAll], ...Object.entries(s.guideTypes)];
  return `${head(s, lang, 'guides', title, desc, jsonLd(s, lang, 'guides', title, desc))}
  <body>${navbar(s, lang, 'guides')}
      <main id="main">
        <div class="page-head">
          <nav class="crumbs" aria-label="breadcrumb"><a href="${local(lang, 'home')}">${esc(s.home)}</a><span>›</span><span>${esc(s.navGuides)}</span></nav>
          <h1>${esc(s.guidesH1)}</h1>
          <p>${esc(s.guidesLead)}</p>
        </div>
        <div class="row guide-filter" role="group" aria-label="${esc(s.guidesH1)}" id="guide-filter">${types.map(([k, label], i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-type="${k}">${i === 0 ? '<svg><use href="#i-check"/></svg>' : ''}${esc(label)}</button>`).join('')}</div>
        <div class="guides" id="guides-root">${[...s.guides, ...s.moreGuides].map((g) => guideCard(s, g)).join('')}</div>
      </main>
${footer(s, lang, 'guides')}
${scripts(s, lang, 'guides', ['guides.js'])}
  </body>
</html>
`;
}

/* ---------- 桌遊助手總覽與小工具 ----------
 * 總覽：上面是桌遊（阿瓦隆），下面是小工具。靜態 HTML 先放純文字連結給爬蟲，tools.js 再換成有插圖的卡片。
 * 小工具頁：工具本體（tools.js 用 window.Leader 建）＋怎麼用＋也用在哪些遊戲。
 */
const toolCrumbs = (s, lang, page) => `<nav class="crumbs" aria-label="breadcrumb"><a href="${local(lang, 'home')}">${esc(s.home)}</a><span>›</span>${
  isTool(page) ? `<a href="${local(lang, 'tools')}">${esc(s.tools.h1)}</a><span>›</span><span>${esc(s.tools.items[page].name)}</span>` : `<span>${esc(s.tools.h1)}</span>`
}</nav>`;
const toolLinks = (s, lang) => TOOL_KEYS
  .map((k) => `<a class="game tool-card" href="${local(lang, k)}" data-tool="${k}"><h3>${esc(s.tools.items[k].name)}</h3><p>${esc(s.tools.items[k].short)}</p></a>`)
  .join('');

function toolsPage(lang) {
  const s = STRINGS[lang];
  const T = s.tools;
  return `${head(s, lang, 'tools', T.seoTitle, T.seoDesc, jsonLd(s, lang, 'tools', T.seoTitle, T.seoDesc))}
  <body class="tools-page">${navbar(s, lang, 'tools')}
      <main id="main">
        <div class="page-head">
          ${toolCrumbs(s, lang, 'tools')}
          <h1>${esc(T.h1)}</h1>
          <p>${esc(T.lead)}</p>
        </div>
        <section>
          <div class="section-head"><div><h2>${esc(T.boardHeading)}</h2></div></div>
          <div class="game-grid" data-games="avalon">${staticGames(s, lang, ['avalon'])}</div>
        </section>
        <section>
          <div class="section-head"><div><h2>${esc(T.toolsHeading)}</h2></div></div>
          <div class="game-grid" id="tool-grid">${toolLinks(s, lang)}</div>
        </section>
      </main>
${footer(s, lang, 'tools')}
${scripts(s, lang, 'tools', ['tools.js'], { navPage: 'tools' })}
  </body>
</html>
`;
}

const toolPage = (key) => (lang) => {
  const s = STRINGS[lang];
  const T = s.tools, it = T.items[key];
  // 工具要用的資料，只嵌這個語言的
  const tool = { key };
  if (key === 'truthOrDare') tool.slot = SLOT[lang];
  if (key === 'names') tool.names = { themes: THEMES, groups: Object.fromEntries(THEMES.map((th) => [th, groupsFor(th, lang)])) };
  const games = TOOL_GAMES[key].filter((k) => gameInLang(k, lang));
  return `${head(s, lang, key, it.seoTitle, it.seoDesc, jsonLd(s, lang, key, it.seoTitle, it.seoDesc), ['game.css'])}
  <body class="tool-page" data-tool="${key}">${navbar(s, lang, 'tools', (l) => local(l, key))}
      <main id="main">
        <div class="page-head">
          ${toolCrumbs(s, lang, key)}
          <h1>${esc(it.name)}</h1>
          <p>${esc(it.lead)}</p>
        </div>
        <section class="tool-section">
          <div class="panel tool-panel" id="tool-root"></div>
        </section>
        <section class="tool-how">
          <div class="panel prose">
            <h2>${esc(T.howHeading)}</h2>
            <ol>${it.how.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
          </div>
        </section>
        <section class="tool-used">
          <div class="section-head"><div><h2>${esc(T.usedIn)}</h2></div></div>
          <div class="game-grid" data-games="${games.join(',')}">${staticGames(s, lang, games)}</div>
        </section>
      </main>
${footer(s, lang, key, (l) => local(l, key))}
${scripts(s, lang, key, ['game.js', 'tools.js'], { navPage: 'tools', tool })}
  </body>
</html>
`;
};

/* ---------- sitemap：每一頁都帶 hreflang（noindex 的頁面不放） ---------- */

function buildSitemap() {
  const entries = [];
  for (const page of Object.keys(PAGES).filter((p) => !NOINDEX.has(p))) {
    const alternates = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, page)}"/>`).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LANG, page)}"/>`;
    for (const l of LANGS) entries.push(`  <url>\n    <loc>${url(l, page)}</loc>\n${alternates}\n${xDefault}\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

/* ---------- 輸出 ---------- */

// 每次從乾淨的 dist 開始，舊版留下的檔案不會混進來
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const render = {
  home: homePage, games: gamesPage, combo: comboPage, tools: toolsPage, guides: guidesPage,
  ...Object.fromEntries(TOOL_KEYS.map((k) => [k, toolPage(k)])),
};
let count = 0;
for (const lang of LANGS) {
  for (const page of Object.keys(PAGES)) {
    const html = render[page](lang);
    if (/\{\{|undefined|\[object Object\]/.test(html.replace(/<script>window\.WOOHOP[\s\S]*?<\/script>/, ''))) {
      throw new Error(`[${lang}/${page}] 產出的 HTML 有沒填到的值（undefined 或 [object Object]）`);
    }
    const dir = path.join(OUT, lang, PAGES[page]);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), html);
    count++;
  }
}

// 根目錄留一份預設語言的首頁（vercel.json 會先把 / 轉到 /zh-TW/，這是保險）
writeFileSync(path.join(OUT, 'index.html'), homePage(DEFAULT_LANG));
writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap());

// 靜態檔。design-tokens.css 是舊配色檔：monorepo 裡已沒人用，但外部舊頁面可能用絕對網址連它，先照樣輸出
for (const file of ['robots.txt', 'design-tokens.css', 'favicon.svg', 'apple-touch-icon.png', '404.html']) {
  if (existsSync(file)) copyFileSync(file, path.join(OUT, file));
}
// 分享縮圖：og/{lang}.png 是用 scripts/og-image.mjs 在本機產生後 commit 進來的（建置環境沒有瀏覽器）
mkdirSync(path.join(OUT, 'og'), { recursive: true });
for (const file of readdirSync('og')) copyFileSync(path.join('og', file), path.join(OUT, 'og', file));
mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const file of readdirSync('assets')) copyFileSync(path.join('assets', file), path.join(OUT, 'assets', file));

console.log(`Prerendered ${count} pages (${LANGS.length} languages × ${Object.keys(PAGES).length}) + sitemap into dist/.`);
