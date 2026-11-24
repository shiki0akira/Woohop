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
//   /{lang}/tools/truth-or-dare/、metronome/、names/、recorder/、actions/、words/   小工具（全站共用的帶領元件 window.Leader）
//   /{lang}/about/    關於我們＋聯絡表單（舊的 /contact/ 轉過來），/{lang}/terms/  服務條款，/{lang}/privacy/  隱私權政策（2026-10-22）
// 舊網址只有 /{lang}/，維持不變；其他是新增的。

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync, cpSync } from 'node:fs';
import path from 'node:path';
import { STRINGS, LANGS, DEFAULT_LANG, LANG_NAMES, GAME_LANGS, gameInLang } from '../src/locales.mjs';
import { navbar, footer, PAGES, local, esc, THEME_HEAD } from '../src/chrome.mjs';
import { TOOLS, TOOL_KEYS, TOOL_GAMES } from '../src/tools-strings.mjs';
import { SLOT } from '../src/slot-prompts.mjs';
import { THEMES, groupsFor } from '../src/name-pools.mjs';
import { actionsFor, checkActions } from '../src/action-cards.mjs';
import { wordsFor, checkWords } from '../src/word-bank.mjs';

import { ABOUT, FEEDBACK_TYPES } from '../src/about-strings.mjs';
import { TERMS } from '../src/terms-strings.mjs';
import { ARTICLES, articleBySlug, GUIDE_UI } from '../src/guides.mjs';

// 小工具頁、關於／隱私頁的文案併進當頁語言的 STRINGS（s.tools、s.about），head／jsonLd／window.WOOHOP.t 都讀得到
// 動作抽卡：每個動作代號都要有插圖（woohop-art.js 的 actionArt）
checkActions(readFileSync(path.resolve('assets/woohop-art.js'), 'utf8'));
checkWords();
for (const lang of LANGS) Object.assign(STRINGS[lang], { tools: TOOLS[lang], about: { ...ABOUT[lang], terms: TERMS[lang] } });
const isTool = (page) => TOOL_KEYS.includes(page);

const SITE = 'https://www.vibeweb100.com';
const OUT = path.resolve('dist');
// 不給 Google 收錄、不放進 sitemap 的頁面。帶領指南列表 2026-11-24 起開放（老闆：有兩篇文章、列表改成一排一篇，可以做 SEO 了）
const NOINDEX = new Set([]);
// 改了 assets/ 底下的檔案要換這個版本號，瀏覽器才會抓新的（檔名後面的 ?v=）
const ASSET_VERSION = '2026-11-24k';
// 分享縮圖改版時加一：LINE、Facebook 認圖片網址快取，檔名不變的話會一直顯示舊圖（2026-10-23 改成置中版 → 2）
const OG_VERSION = 2;

const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''));
const url = (lang, page) => `${SITE}/${lang}/${PAGES[page]}`;
const gameUrl = (lang, key) => (key === 'avalon' ? `/avalon/${lang}` : `/${key}/${lang}/`);
// JSON 嵌進 <script>：把 < 跳成 <，文案裡萬一有 </script> 才不會提早關掉標籤
const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/* ---------- 共用的頁首、頁尾 ---------- */

// opts.path：不在 PAGES 裡的頁面（帶領指南文章）自己給網址；opts.alt(l) 給各語言的網址（沒有這個語言就回 null）
function head(s, lang, page, title, desc, jsonLd, css = [], opts = {}) {
  const self = opts.path ? SITE + opts.path : url(lang, page);
  const alt = opts.alt || ((l) => url(l, page));
  const langs = LANGS.filter((l) => alt(l));
  const alternates = langs.map((l) => `    <link rel="alternate" hreflang="${l}" href="${alt(l)}" />`).join('\n')
    + (alt(DEFAULT_LANG) ? `\n    <link rel="alternate" hreflang="x-default" href="${alt(DEFAULT_LANG)}" />` : '') + '\n';
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
${NOINDEX.has(page) && !opts.path ? '    <meta name="robots" content="noindex, follow" />\n' : ''}    <link rel="canonical" href="${self}" />
${alternates}    <meta property="og:type" content="${opts.path ? 'article' : 'website'}" />
    <meta property="og:site_name" content="Woohop" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${self}" />
    <meta property="og:locale" content="${lang.replace('-', '_')}" />
    <meta property="og:image" content="${opts.ogImage || `${SITE}/og/${lang}.png?v=${OG_VERSION}`}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(opts.ogImage ? title : s.heroAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${jsonForScript(jsonLd)}</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-S7PE5687BG"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      // 只記正式網域：本機、區網 IP、workers.dev 的測試不送（2026-11-03，本機測試曾灌高開局次數）
      if (!/(^|\\.)vibeweb100\\.com$/.test(location.hostname)) window['ga-disable-G-S7PE5687BG'] = true;
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
  // 關於／隱私的長文只在靜態 HTML 裡；執行期只有聯絡頁的表單要用到文字
  const t = { ...s, about: page === 'about' ? { form: s.about.form } : undefined };
  const data = { lang, page, t, langs: LANGS, langNames: LANG_NAMES, gameLangs: GAME_LANGS, ...more };
  return `
    <script>window.WOOHOP = ${jsonForScript(data)};</script>
    <script src="/assets/woohop-art.js${v}"></script>
    <script src="/assets/site.js${v}"></script>
${extra.map((f) => `    <script src="/assets/${f}${v}"></script>`).join('\n')}`;
}

/* ---------- 遊戲清單（靜態版，給爬蟲與沒開 JS 的人；JS 會換成有插圖、能篩選的版本） ---------- */

const GAME_KEYS = ['match', 'bingo', 'bomb', 'buzzer', 'bamboo', 'stairs', 'orchard', 'reverse', 'statue', 'charades', 'charades-relay', 'drawing-relay', 'sneaky-artist', 'truths', 'cup', 'seconds', 'never', 'password', 'lineup', 'roulette', 'undercover', 'avalon'];
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
    '@type': { about: 'AboutPage', guides: 'CollectionPage' }[page] || 'WebPage',
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
  // 首頁的常見問題；小工具頁有寫 faq 的（目前只有 zh-TW 抽題目）也輸出
  if (page === 'guides') {
    // 指南列表：宣告這頁是這個語言寫好的文章清單（新的在前）
    const list = guideList(s).filter((g) => typeof g === 'string').map((g) => articleBySlug(g));
    graph.push({
      '@type': 'ItemList',
      name: s.guidesH1,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: list.length,
      itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.langs[lang].title, url: SITE + articlePath(a, lang) })),
    });
  }
  const faq = page === 'home' ? faqItems(s.faq) : isTool(page) ? faqItems(s.tools.items[page].faq) : [];
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
      { '@type': 'ListItem', position: 2, name: { games: s.gamesH1, combo: s.comboH1, guides: s.guidesH1, tools: s.tools.h1, about: s.about.h1, terms: s.about.terms.h1, privacy: s.about.privacy.h1 }[second], item: url(lang, second) },
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

/* ---------- 指南卡片：寫好的文章在 locales.mjs 裡只放 slug 字串（標題、說明從 src/guides.mjs 拿），其他是 [類型, 標題, 說明, 分鐘] 標即將推出 ---------- */

const GUIDE_BADGE = { beginner: 'b-new', scene: 'b-info', tip: 'b-live' };
const articlePath = (a, lang) => `/${lang}/guides/${a.slug}/`;
// NEW 標籤：發布 14 天內。先藏在 HTML 裡，由 site.js 依瀏覽器當下的日期打開——頁面只在部署時產生，寫死的話兩週後沒部署就會一直掛著
const NEW_DAYS = 14;
const newUntil = (a) => new Date(Date.parse(a.published) + NEW_DAYS * 864e5).toISOString().slice(0, 10);
// 列表順序：寫好的文章照發布日期由新到舊（同一天就後加進 ARTICLES 的在前），即將推出的排在後面、維持 locales.mjs 的順序
function guideList(s) {
  const all = [...s.guides, ...s.moreGuides];
  const rank = (g) => { const a = articleBySlug(g); return [a.published, ARTICLES.indexOf(a)]; };
  const done = all.filter((g) => typeof g === 'string').sort((x, y) => {
    const [dx, ix] = rank(x), [dy, iy] = rank(y);
    return dx === dy ? iy - ix : dy.localeCompare(dx);
  });
  return [...done, ...all.filter((g) => typeof g !== 'string')];
}
function guideCard(s, lang, g) {
  if (typeof g === 'string') {
    const a = articleBySlug(g), t = a && a.langs[lang];
    if (!t) throw new Error(`[${lang}] 指南卡片連到 ${g}，但 src/guides.mjs 沒有這篇的 ${lang} 版`);
    return `<a class="guide" href="${articlePath(a, lang)}" data-type="${a.type}">${newTab(a)}<span class="badge ${GUIDE_BADGE[a.type]}">${esc(s.guideTypes[a.type])}</span><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p><span class="meta">${guideDate(a, lang)} · ${esc(fmt(s.readMin, { n: t.min }))}</span></a>`;
  }
  const [type, title, desc, min] = g;
  const inner = `<span class="badge ${GUIDE_BADGE[type]}">${esc(s.guideTypes[type])}</span><h3>${esc(title)}</h3><p>${esc(desc)}</p><span class="meta">${esc(fmt(s.readMin, { n: min }))}</span>`;
  // 即將推出：跟 NEW 一樣騎在右上角框線上（灰色）
  return `<div class="guide is-disabled" aria-disabled="true" data-type="${type}"><span class="new-tab soon-tab">${esc(s.soon)}</span>${inner}</div>`;
}
// NEW：騎在卡片右上角框線上的黃色小標（跟「照著念」同款）
const newTab = (a) => `<span class="new-tab" data-new-until="${newUntil(a)}" hidden>NEW</span>`;
// 情境主圖：guides.js 依 data-scene（文章 slug）用 Woohop.guideScene 畫上；--hero 是淡淡的底色
const heroBox = (a, cls = '') => `<div class="guide-hero${cls}" data-scene="${a.slug}" style="--hero:${a.color}" aria-hidden="true"></div>`;
// 文章日期（列表與卡片上）：依語言的日期格式
const guideDate = (a, lang) => `<time datetime="${a.published}">${esc(new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(a.published)))}</time>`;
// 指南列表頁：寫好的文章一排一篇（左邊主圖、右邊文字，手機上主圖在上），即將推出的縮成下面一小塊清單
function guideRows(s, lang) {
  const list = guideList(s);
  const rows = list.filter((g) => typeof g === 'string').map((g) => {
    const a = articleBySlug(g), t = a.langs[lang];
    return `<a class="guide-row" href="${articlePath(a, lang)}" data-type="${a.type}">${newTab(a)}${heroBox(a)}<div class="guide-row-text"><h2>${esc(t.title)}</h2><p>${esc(t.desc)}</p><span class="meta"><span class="badge ${GUIDE_BADGE[a.type]}">${esc(s.guideTypes[a.type])}</span><span>${guideDate(a, lang)} · ${esc(fmt(s.readMin, { n: t.min }))}</span></span></div></a>`;
  });
  const soon = list.filter((g) => typeof g !== 'string').map(([type, title]) => `<li data-type="${type}"><span class="badge ${GUIDE_BADGE[type]}">${esc(s.guideTypes[type])}</span><span>${esc(title)}</span></li>`);
  return `<div class="guide-rows">${rows.join('')}</div>${soon.length ? `
        <section class="guide-soon" id="guide-soon"><h2>${esc(s.soon)}</h2><ul>${soon.join('')}</ul></section>` : ''}`;
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
          <div class="guides">${guideList(s).slice(0, 4).map((g) => guideCard(s, lang, g)).join('')}</div>
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
  <body class="guides-page">${navbar(s, lang, 'guides')}
      <main id="main">
        <div class="page-head">
          <h1>${esc(s.guidesH1)}</h1>
          <p>${esc(s.guidesLead)}</p>
        </div>
        <div class="row guide-filter" role="group" aria-label="${esc(s.guidesH1)}" id="guide-filter">${types.map(([k, label], i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-type="${k}">${i === 0 ? '<svg><use href="#i-check"/></svg>' : ''}${esc(label)}</button>`).join('')}</div>
        <div id="guides-root">${guideRows(s, lang)}</div>
      </main>
${footer(s, lang, 'guides')}
${scripts(s, lang, 'guides', ['guides.js'])}
  </body>
</html>
`;
}

/* ---------- 帶領指南文章（8 語，內容在 src/guides/，介面文字在 src/guides.mjs 的 GUIDE_UI） ----------
 * 遊戲區塊：標題連到遊戲頁（後面一個 >），介紹完放一塊橫式連結（左邊插圖由 guides.js 依 data-art 畫上，右邊名稱＋兩行說明）。
 * 寬螢幕章節列表放右邊、跟著捲動；窄螢幕收合在內文上面。
 */
// 段落：**粗體**、[文字](game:代號)／[文字](page:頁面)／[文字](/網址)；chev：連結文字後面加一個 >（遊戲名稱用）
const CHEV = '<svg class="chev" aria-hidden="true"><use href="#i-back"/></svg>';
const resolveHref = (href, lang) => {
  if (href.startsWith('game:')) return gameUrl(lang, href.slice(5));
  if (href.startsWith('page:')) return local(lang, href.slice(5));
  if (href.startsWith('guide:')) return `/${lang}/guides/${href.slice(6)}/`;
  return href;
};
const inline = (p, lang, chev = false) => rich(p).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a class="link" href="${resolveHref(href, lang)}">${t}${chev ? CHEV : ''}</a>`);
const anchor = (i) => `s${i + 1}`;

function articleBlock(s, lang, ui, b, i) {
  if (b.h2) return `<h2 id="${anchor(i)}">${esc(b.h2)}</h2>`;
  if (typeof b.p === 'string' && !b.game) return `<p>${inline(b.p, lang)}</p>`;
  if (b.ul) return `<ul>${b.ul.map((x) => `<li>${inline(x, lang)}</li>`).join('')}</ul>`;
  if (b.table) {
    // 每一列第一格是遊戲代號：名稱用該語言的遊戲名，連到遊戲頁
    const { head: th, rows } = b.table;
    return `<div class="table-wrap"><table><thead><tr>${th.map((x) => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows
      .map(([key, ...cells]) => `<tr><th scope="row"><a class="link" href="${gameUrl(lang, key)}">${esc(s.games[key][0])}${CHEV}</a></th>${cells.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  }
  if (b.game) {
    const [name, desc] = s.games[b.game];
    const href = gameUrl(lang, b.game);
    return `<div class="guide-game" id="${b.game}">
            <h3><a class="link" href="${href}">${esc(name)}${CHEV}</a></h3>
            <p class="need">${esc(b.need)}</p>
            ${b.p.map((x) => `<p>${inline(x, lang)}</p>`).join('')}
            <p class="tip"><strong>${esc(ui.tip)}</strong>${inline(b.tip, lang)}</p>
            <a class="guide-link" href="${href}"><span class="art" data-art="${b.game}" aria-hidden="true"></span><span class="txt"><b>${esc(name)}${CHEV}</b><span>${esc(desc)}</span></span></a>
          </div>`;
  }
  if (b.faq) return `<div class="faq">${faqHtml(faqItems(b.faq))}</div>`;
  throw new Error(`指南區塊看不懂：${JSON.stringify(b)}`);
}

function articlePage(a, lang) {
  const s = STRINGS[lang];
  const t = a.langs[lang];
  const ui = GUIDE_UI[lang];
  const path_ = articlePath(a, lang);
  const self = SITE + path_;
  const faq = t.blocks.filter((b) => b.faq).flatMap((b) => faqItems(b.faq));
  const games = t.blocks.filter((b) => b.game).map((b) => b.game);
  const toc = t.blocks.map((b, i) => [b, i]).filter(([b]) => b.h2);
  // 文章自己的分享縮圖（scripts/og-image.mjs guide:{slug} 產生）；還沒產生就用全站的
  const ogFile = `og/guides/${a.slug}/${lang}.png`;
  const ogImage = existsSync(ogFile) ? `${SITE}/${ogFile}?v=${OG_VERSION}` : null;
  const date = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(a.updated));
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Woohop', alternateName: ['Web100', 'vibeweb100'] },
      {
        '@type': 'Article',
        '@id': `${self}#article`,
        headline: t.h1,
        description: t.seoDesc,
        inLanguage: lang,
        datePublished: a.published,
        dateModified: a.updated,
        mainEntityOfPage: self,
        image: ogImage || `${SITE}/og/${lang}.png?v=${OG_VERSION}`,
        author: { '@type': 'Organization', name: 'Woohop', url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: 'Woohop', url: `${SITE}/` },
        isPartOf: { '@id': `${SITE}/#website` },
      },
      {
        '@type': 'ItemList',
        name: t.h1,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: games.length,
        itemListElement: games.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: s.games[k][0], url: SITE + gameUrl(lang, k) })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: s.home, item: url(lang, 'home') },
          { '@type': 'ListItem', position: 2, name: s.guidesH1, item: url(lang, 'guides') },
          { '@type': 'ListItem', position: 3, name: t.title, item: self },
        ],
      },
      ...(faq.length ? [{
        '@type': 'FAQPage',
        '@id': `${self}#faq`,
        mainEntity: faq.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a.map(plain).join('\n') } })),
      }] : []),
    ],
  };
  // 語言選單：有這個語言的版本就連到同一篇，沒有就連到那個語言的指南列表
  const langHref = (l) => (a.langs[l] ? articlePath(a, l) : local(l, 'guides'));
  const alt = (l) => (a.langs[l] ? SITE + articlePath(a, l) : null);
  return `${head(s, lang, 'guides', t.seoTitle, t.seoDesc, ld, ['game.css'], { path: path_, alt, ogImage })}
  <body class="article-page">${navbar(s, lang, 'guides', langHref)}
      <main id="main">
        <div class="page-head">
          <nav class="crumbs" aria-label="breadcrumb"><a href="${local(lang, 'home')}">${esc(s.home)}</a><span>›</span><a href="${local(lang, 'guides')}">${esc(s.guidesH1)}</a><span>›</span><span>${esc(t.title)}</span></nav>
          <h1>${esc(t.h1)}</h1>
          <p class="t-small">${esc(fmt(s.readMin, { n: t.min }))} · ${esc(ui.updated)} <time datetime="${a.updated}">${esc(date)}</time></p>
        </div>
        <article class="guide-article">
          <nav class="article-toc" aria-label="${esc(ui.tocLabel)}"><details><summary>${esc(ui.toc)}<span class="toc-count">${esc(fmt(ui.count, { n: toc.length }))}</span></summary><ol>${toc.map(([b, i]) => `<li><a href="#${anchor(i)}">${esc(b.h2)}</a></li>`).join('')}</ol></details></nav>
          <div class="panel prose">
            ${heroBox(a, ' article-hero')}
            ${t.lead.map((p) => `<p class="lead">${inline(p, lang)}</p>`).join('')}
            ${t.blocks.map((b, i) => articleBlock(s, lang, ui, b, i)).join('\n            ')}
          </div>
        </article>
      </main>
${footer(s, lang, 'guides', langHref)}
${scripts(s, lang, 'guides', ['guides.js'], { navPage: 'guides' })}
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
          <h1>${esc(T.h1)}</h1>
          <p>${esc(T.lead)}</p>
        </div>
        <!-- 桌遊和小工具放同一個格子（一進來全部看得到）；數量多了再考慮分類或篩選 -->
        <section>
          <div class="game-grid tool-grid" id="tool-grid"><a class="game tool-card" href="/avalon/${lang}" data-board="avalon"><h3>${esc(s.games.avalon[0])}</h3><p>${esc(s.games.avalon[1])}</p></a>${toolLinks(s, lang)}</div>
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
  if (key === 'actions') tool.actions = actionsFor(lang);
  // 抽題目：跟比手畫腳同一份題庫，只拿比得出來的
  if (key === 'words') tool.words = wordsFor(lang, 'act');
  if (key === 'names') tool.names = { themes: THEMES, groups: Object.fromEntries(THEMES.map((th) => [th, groupsFor(th, lang)])) };
  const games = TOOL_GAMES[key].filter((k) => gameInLang(k, lang));
  return `${head(s, lang, key, it.seoTitle, it.seoDesc, jsonLd(s, lang, key, it.seoTitle, it.seoDesc), ['game.css'])}
  <body class="tool-page" data-tool="${key}">${navbar(s, lang, 'tools', (l) => local(l, key))}
      <main id="main">
        <div class="page-head">
          ${toolCrumbs(s, lang, key)}
          <h1>${esc(it.h1 || it.name)}</h1>
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
${it.examplesHeading && tool.words ? `        <section class="tool-how tool-examples">
          <div class="panel prose">
            <h2>${esc(it.examplesHeading)}</h2>
            <p>${esc(it.examplesNote)}</p>
            ${tool.words.map(([, cat, list]) => `<p><strong>${esc(cat)}</strong>：${list.slice(0, 8).map(esc).join('、')}</p>`).join('')}
          </div>
        </section>
` : ''}        <section class="tool-used">
          <div class="section-head"><div><h2>${esc(T.usedIn)}</h2></div></div>
          <div class="game-grid" data-games="${games.join(',')}">${staticGames(s, lang, games)}</div>
        </section>
${it.faq ? `        <section class="tool-how" id="faq">
          <div class="section-head"><div><h2>${esc(it.faqHeading)}</h2></div></div>
          <div class="faq">${faqHtml(faqItems(it.faq))}</div>
        </section>
` : ''}      </main>
${footer(s, lang, key, (l) => local(l, key))}
${scripts(s, lang, key, ['game.js', 'tools.js'], { navPage: 'tools', tool })}
  </body>
</html>
`;
};

/* ---------- 關於我們（含聯絡表單）、隱私權政策、服務條款 ----------
 * 表單送到 /api/feedback（vercel.json 代理到 apps/feedback 的 Worker，寄到 woohop.app@gmail.com），行為在 assets/about.js。
 * 之後要加「小額贊助（買杯咖啡）」：在關於頁加一個 id="support" 的區塊（外部贊助連結就好，不用後端），
 * 頁尾「關於」欄加一條連到 about/#support，隱私權政策補一段金流服務的說明。
 */

// 信箱：跟頁尾一樣拆成兩半放在 data 屬性，site.js 組回來（HTML 裡不出現完整地址）
const mailLink = '<a class="link footer-mail" data-u="woohop" data-d="vibeweb100.com" hidden><span></span></a>';
// 隱私權政策、服務條款的段落：**粗體**、[文字](網址)；{mail}、{contact}、{privacy}、{rooms} 換成實際內容
const legal = (s, lang, p) => {
  const rooms = new Intl.ListFormat(lang, { type: 'conjunction' }).format(['buzzer', 'match', 'bingo', 'sneaky-artist', 'truths', 'lineup'].map((k) => s.games[k][0]));
  return rich(p.replace('{rooms}', rooms))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
      const h = { '{contact}': `${local(lang, 'about')}#contact`, '{privacy}': local(lang, 'privacy') }[href] || href;
      const ext = /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
      return `<a class="link" href="${h}"${ext}>${t}</a>`;
    })
    .replace('{mail}', mailLink);
};

function aboutPage(lang) {
  const s = STRINGS[lang];
  const A = s.about, F = A.form;
  // 「跟哪個遊戲有關」：這個語言玩得到的遊戲＋小工具（幸福模擬器不是遊戲，2026-10-23 使用者要求拿掉）
  const games = [...gameKeysFor(lang).map((k) => [k, s.games[k][0]]), ...TOOL_KEYS.map((k) => [k, s.tools.items[k].name])];
  const privacyLink = `<a class="link" href="${local(lang, 'privacy')}">${esc(A.privacy.h1)}</a>`;
  return `${head(s, lang, 'about', A.seoTitle, A.seoDesc, jsonLd(s, lang, 'about', A.seoTitle, A.seoDesc), ['game.css'])}
  <body class="about-page">${navbar(s, lang, 'about')}
      <main id="main">
        <div class="page-head">
          <h1>${esc(A.h1)}</h1>
          <p>${esc(A.lead)}</p>
        </div>
        <section class="about-story"><div class="panel prose"><p>${esc(A.story)}</p></div></section>
        <section class="about-contact" id="contact">
          <div class="section-head"><div><h2>${esc(A.contactHeading)}</h2><p>${esc(A.contactLead)}</p></div></div>
          <div class="panel">
            <form class="feedback" id="feedback" novalidate>
              <div class="field field-wide">
                <span class="label" id="fb-type-label">${esc(F.type)}</span>
                <div class="row fb-types" role="radiogroup" aria-labelledby="fb-type-label">${FEEDBACK_TYPES.map((k, i) => `<label class="chip"><input type="radio" name="type" value="${k}"${i === 0 ? ' checked' : ''}>${esc(F.types[k])}</label>`).join('')}</div>
              </div>
              <!-- 只有回報問題、修改建議才問是哪個遊戲（about.js 切換；預設類型是推薦遊戲，先藏起來） -->
              <div class="field field-wide" id="fb-game-field" hidden>
                <label for="fb-game">${esc(F.game)}</label>
                <select class="select" id="fb-game" name="game">
                  <option value="">${esc(F.gameNone)}</option>
                  <option value="site">${esc(F.gameSite)}</option>
                  ${games.map(([k, name]) => `<option value="${k}">${esc(name)}</option>`).join('')}
                </select>
              </div>
              <div class="field field-wide">
                <label for="fb-message">${esc(F.message)}</label>
                <textarea class="textarea" id="fb-message" name="message" rows="6" maxlength="3000" required placeholder="${esc(F.placeholders[FEEDBACK_TYPES[0]])}" aria-describedby="fb-message-err"></textarea>
                <span class="error-msg" id="fb-message-err" hidden><svg width="16" height="16" aria-hidden="true"><use href="#i-error"/></svg>${esc(F.errMessage)}</span>
              </div>
              <div class="field field-wide">
                <label for="fb-email">${esc(F.email)}</label>
                <input class="input" id="fb-email" name="email" type="email" autocomplete="email" maxlength="200" aria-describedby="fb-email-help fb-email-err">
                <span class="help" id="fb-email-help">${esc(F.emailHelp)}</span>
                <span class="error-msg" id="fb-email-err" hidden><svg width="16" height="16" aria-hidden="true"><use href="#i-error"/></svg>${esc(F.errEmail)}</span>
              </div>
              <!-- 蜜罐：畫面外的欄位，人看不到也不會填，機器人會 -->
              <div class="fb-hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
              <div class="alert error" id="fb-error" role="alert" hidden><svg aria-hidden="true"><use href="#i-error"/></svg><span></span></div>
              <div class="fb-submit">
                <button class="btn btn-lg btn-solid" type="submit" id="fb-send">${esc(F.send)}</button>
                <p class="t-small">${esc(F.privacyNote).replace('{link}', privacyLink)}</p>
              </div>
            </form>
            <div class="fb-done" id="fb-done" hidden>
              <div class="alert success" role="status"><svg aria-hidden="true"><use href="#i-ok"/></svg><div><b>${esc(F.sentTitle)}</b>${esc(F.sentDesc)}</div></div>
              <button class="btn btn-secondary" type="button" id="fb-again">${esc(F.again)}</button>
            </div>
          </div>
          <p class="about-mail">${esc(A.mailLead)} ${mailLink}</p>
          <p class="about-mail">${esc(A.threadsLead)} <a class="link footer-social" href="https://www.threads.com/@woohop.app" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-threads"/></svg><span>@woohop.app</span></a></p>
        </section>
      </main>
${footer(s, lang, 'about')}
${scripts(s, lang, 'about', ['about.js'])}
  </body>
</html>
`;
}

// 隱私權政策、服務條款：同一個版型（日期＋前言＋一節一節的段落）
const legalPage = (page) => (lang) => {
  const s = STRINGS[lang];
  const P = s.about[page];
  return `${head(s, lang, page, P.seoTitle, P.seoDesc, jsonLd(s, lang, page, P.seoTitle, P.seoDesc), ['game.css'])}
  <body class="legal-page">${navbar(s, lang, page)}
      <main id="main">
        <div class="page-head">
          <h1>${esc(P.h1)}</h1>
          <p class="t-small">${esc(P.updated)}</p>
        </div>
        <section class="legal">
          <div class="panel prose">
            <p>${legal(s, lang, P.lead)}</p>
            ${P.sections.map(([h, ps]) => `<h2>${esc(h)}</h2>${ps.map((p) => `<p>${legal(s, lang, p)}</p>`).join('')}`).join('\n            ')}
          </div>
        </section>
      </main>
${footer(s, lang, page)}
${scripts(s, lang, page, ['about.js'])}
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
  // 帶領指南文章：每個語言版本一筆，互相帶 hreflang
  for (const a of ARTICLES) {
    const ls = LANGS.filter((l) => a.langs[l]);
    const alternates = ls.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${articlePath(a, l)}"/>`).join('\n')
      + (a.langs[DEFAULT_LANG] ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${articlePath(a, DEFAULT_LANG)}"/>` : '');
    for (const l of ls) entries.push(`  <url>\n    <loc>${SITE}${articlePath(a, l)}</loc>\n    <lastmod>${a.updated}</lastmod>\n${alternates}\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

/* ---------- 輸出 ---------- */

// 每次從乾淨的 dist 開始，舊版留下的檔案不會混進來
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const render = {
  home: homePage, games: gamesPage, combo: comboPage, tools: toolsPage, guides: guidesPage,
  about: aboutPage, terms: legalPage('terms'), privacy: legalPage('privacy'),
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

// 帶領指南文章：每個語言版本都要在該語言的指南列表有一張卡片（locales.mjs 的 guides／moreGuides 放 slug 字串）
for (const a of ARTICLES) {
  for (const lang of LANGS.filter((l) => a.langs[l])) {
    const cards = [...STRINGS[lang].guides, ...STRINGS[lang].moreGuides];
    if (!cards.includes(a.slug)) throw new Error(`指南文章 ${a.slug} 在 locales.mjs 的 ${lang} guides／moreGuides 沒有卡片`);
    const html = articlePage(a, lang);
    if (/\{\{|undefined|\[object Object\]/.test(html.replace(/<script>window\.WOOHOP[\s\S]*?<\/script>/, ''))) {
      throw new Error(`[${lang}/guides/${a.slug}] 產出的 HTML 有沒填到的值（undefined 或 [object Object]）`);
    }
    const dir = path.join(OUT, lang, 'guides', a.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), html);
    count++;
  }
}
// vercel.json 的 /:lang(...)/guides/:slug(...) 白名單要列到每一篇，不然正式站會 404
const guideRule = readFileSync('vercel.json', 'utf8').match(/\/guides\/:slug\(([^)]+)\)\/"/);
for (const a of ARTICLES) if (!guideRule || !guideRule[1].split('|').includes(a.slug)) throw new Error(`vercel.json 的指南白名單沒有 ${a.slug}（三條 /:lang/guides/:slug(...) 規則都要加）`);

// 根目錄留一份預設語言的首頁（vercel.json 會先把 / 轉到 /zh-TW/，這是保險）
writeFileSync(path.join(OUT, 'index.html'), homePage(DEFAULT_LANG));
writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap());

// 靜態檔。design-tokens.css 是舊配色檔：monorepo 裡已沒人用，但外部舊頁面可能用絕對網址連它，先照樣輸出
for (const file of ['robots.txt', 'design-tokens.css', 'favicon.svg', 'apple-touch-icon.png', '404.html']) {
  if (existsSync(file)) copyFileSync(file, path.join(OUT, file));
}
// 分享縮圖：og/{lang}.png 是用 scripts/og-image.mjs 在本機產生後 commit 進來的（建置環境沒有瀏覽器）
mkdirSync(path.join(OUT, 'og'), { recursive: true });
// og/guides/{slug}/ 是子資料夾（指南文章的縮圖），整個資料夾照搬
cpSync('og', path.join(OUT, 'og'), { recursive: true });
mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const file of readdirSync('assets')) copyFileSync(path.join('assets', file), path.join(OUT, 'assets', file));

console.log(`Prerendered ${count} pages (${LANGS.length} languages × ${Object.keys(PAGES).length}) + sitemap into dist/.`);
