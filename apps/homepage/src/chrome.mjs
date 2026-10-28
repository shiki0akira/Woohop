// Woohop 全站共用的導覽列與頁尾（HTML）。首頁的 scripts/prerender.js 與各遊戲的 build 都用這一份，
// 改這裡就是全站一起改。互動（語言選單、「更多」、手機選單）在 assets/site.js 的 Site.nav()。
//
// s 是 src/locales.mjs 裡當頁語言的文案；page 是導覽列要標成目前頁面的那一項
// （home / games / combo / guides，遊戲頁傳別的值就不標）；
// langHref(l) 是語言選單裡每個語言要連去的網址（預設是首頁同一頁的其他語言）。

import { LANGS, LANG_NAMES } from './locales.mjs';

// tools 是「桌遊助手」總覽（阿瓦隆＋小工具，2026-10-22），下面三頁是小工具
export const PAGES = {
  home: '', games: 'games/', combo: 'combo/', tools: 'tools/', guides: 'guides/',
  truthOrDare: 'tools/truth-or-dare/', metronome: 'tools/metronome/', names: 'tools/names/', recorder: 'tools/recorder/', actions: 'tools/actions/', words: 'tools/words/',
  // 關於我們、聯絡我們（意見表單）、服務條款、隱私權政策（2026-10-22）
  about: 'about/', terms: 'terms/', privacy: 'privacy/',
};
export const local = (lang, page) => `/${lang}/${PAGES[page]}`;
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function navbar(s, lang, page, langHref = (l) => local(l, page)) {
  const nav = [
    [s.navGames, local(lang, 'games'), 'games'],
    [s.navCombo, local(lang, 'combo'), 'combo'],
    [s.navBoardgame, local(lang, 'tools'), 'tools'],
    [s.navGuides, local(lang, 'guides'), 'guides'],
  ];
  const langMenu = LANGS.map(
    (l) => `<a href="${langHref(l)}" hreflang="${l}" lang="${l}" data-lang="${l}"${l === lang ? ' aria-current="page"' : ''}>${esc(LANG_NAMES[l])}</a>`,
  ).join('');
  return `
    <div class="page">
      <div class="top nav-host" id="site-nav">
        <header class="navbar">
          <a class="brand wordmark" href="${local(lang, 'home')}" aria-label="Woohop"><svg viewBox="0 0 59 48" aria-hidden="true"><use href="#w" fill="#7489E6"/></svg>Woohop</a>
          <nav class="nav-links" aria-label="${esc(s.menu)}">${nav.map(([t, h, id]) => `<a href="${h}"${id === page ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>
          <div class="nav-actions">
            <div class="nav-more lang-wrap">
              <button class="lang" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${esc(s.langMenu)}"><svg><use href="#i-globe"/></svg>${esc(s.langShort)}</button>
              <div class="nav-menu" hidden>${langMenu}</div>
            </div>
            <button class="btn btn-icon btn-secondary nav-burger" type="button" aria-label="${esc(s.menu)}" style="--h:44px"><svg><use href="#i-menu"/></svg></button>
          </div>
        </header>
      </div>
      <dialog class="sheet" id="sheet" aria-label="${esc(s.menu)}" tabindex="-1">
        <div class="grabber"></div>
        <div class="sheet-list">${nav.map(([t, h, id]) => `<a class="btn btn-secondary btn-block" href="${h}"${id === page ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</div>
      </dialog>`;
}

/*
 * 淺色／深色模式（全站共用，localStorage web100-theme：light / dark，沒有就跟隨裝置）。
 * THEME_HEAD 放在 <head> 最前面，畫面畫出來之前就決定好 <html data-theme>，深色的人不會先閃一下淺色；
 * 之後的切換在 site.js。阿瓦隆（React）的 index.html 有同一段。
 */
export const THEME_HEAD = `<script>(function(){var s=null;try{s=localStorage.getItem('web100-theme')}catch(e){}var d=s==='dark'||(s!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');if(d){var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content','#1c1c24')}})()</script>`;

// 頁尾的模式切換（設計系統的 .theme-switch）：哪一個按下去由 site.js 依記住的選擇標
function themeSwitch(s) {
  const opt = (value, icon, label) =>
    `<button type="button" data-theme-choice="${value}" aria-pressed="false" aria-label="${esc(label)}" title="${esc(label)}"><svg aria-hidden="true"><use href="#${icon}"/></svg></button>`;
  return `<div class="theme-switch" role="group" aria-label="${esc(s.themeLabel)}">${opt('system', 'i-auto', s.themeSystem)}${opt('light', 'i-sun', s.themeLight)}${opt('dark', 'i-moon', s.themeDark)}</div>`;
}

export function footer(s, lang, page, langHref = (l) => local(l, page)) {
  const langMenu = LANGS.map(
    (l) => `<a href="${langHref(l)}" hreflang="${l}" lang="${l}" data-lang="${l}"${l === lang ? ' aria-current="page"' : ''}>${esc(LANG_NAMES[l])}</a>`,
  ).join('');
  return `
      <footer class="site-footer" id="site-footer">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="wordmark" href="${local(lang, 'home')}" style="font-size:22px"><svg viewBox="0 0 59 48" style="width:30px;height:24.4px" aria-hidden="true"><use href="#w" fill="#7489E6"/></svg>Woohop</a>
            <p>${esc(s.footerTag1)}<br>${esc(s.footerTag2)}</p>
            <!-- 聯絡信箱（Cloudflare Email Routing 轉寄）。地址拆成兩半放在 data 屬性，由 site.js 組回來，
                 HTML 裡不出現完整地址，少被爬蟲抓去寄垃圾信 -->
            <a class="link footer-mail" data-u="woohop" data-d="vibeweb100.com" hidden><svg aria-hidden="true"><use href="#i-mail"/></svg><span></span></a>
          </div>
          <div class="footer-col"><h4>${esc(s.footerSite)}</h4><a class="link" href="${local(lang, 'games')}">${esc(s.navGames)}</a><a class="link" href="${local(lang, 'combo')}">${esc(s.navCombo)}</a><a class="link" href="${local(lang, 'tools')}">${esc(s.navBoardgame)}</a><a class="link" href="${local(lang, 'guides')}">${esc(s.navGuides)}</a></div>
          <div class="footer-col"><h4>${esc(s.footerOther)}</h4><a class="link" href="/happiness/zh-TW/">${esc(s.games.happy[0])}</a><span class="t-small">${esc(s.happyShort)}</span></div>
          <div class="footer-col"><h4>${esc(s.footerAbout)}</h4><a class="link" href="${local(lang, 'about')}">${esc(s.aboutUs)}</a><a class="link" href="${local(lang, 'terms')}">${esc(s.terms)}</a><a class="link" href="${local(lang, 'privacy')}">${esc(s.privacy)}</a></div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Woohop</span>
          <div class="footer-controls">
          ${themeSwitch(s)}
          <div class="nav-more lang-wrap up">
            <button class="lang" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${esc(s.langMenu)}"><svg><use href="#i-globe"/></svg>${esc(s.langShort)}</button>
            <div class="nav-menu" hidden>${langMenu}</div>
          </div>
          </div>
        </div>
      </footer>
    </div>`;
}

/*
 * 遊戲內頂欄（設計系統「導覽」那一節的手機頂欄）＋手機用的選單面板。各遊戲的遊戲頁、玩法頁共用，取代網站導覽列。
 *
 *   返回鍵    遊戲自己決定要做什麼（window.gameBack），沒給就連到 backHref
 *   遊戲名    回這個遊戲的主頁
 *   分頁      「玩法」，以及可選的「設定」（window.openSettings；玩法頁沒有設定框，就帶 #settings 回遊戲頁）
 *   選單鍵    電腦上是下拉（site.js 的 .nav-more），手機上開底部面板，裡面是網站的頁面
 *   身分標籤  #game-bar-badge，玩的時候顯示在右邊（例如房間裡的「主持人」「玩家」），沒填字就不出現
 *   音樂開關  可選（opts.musicLabel）。有配樂的遊戲才開，玩的時候也留在頂欄右邊。
 *             按下去呼叫 window.toggleMusic；開或關由遊戲自己寫在 aria-pressed 上（樣式看它換圖示）
 *
 * 樣式在 assets/game.css、行為在 assets/game.js。玩的時候要藏起分頁和選單，
 * 由遊戲在 <body> 掛 data-game-mode="play"（平常是 "browse"）。玩的時候還要能開設定（房間大廳的主持人），
 * 再加掛 data-game-settings，分頁只留「設定」齒輪。
 *
 * opts: { title, gameHref, rulesHref, rulesLabel, isRules, settingsLabel?, musicLabel?, backHref }
 */
const ICON_RULES = '<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 8h8M8 12h5"/></svg>';
// 音樂開關：一顆音符，關掉時多一條斜線（game.css 依 aria-pressed 切換）
const ICON_MUSIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path class="music-off" d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const ICON_GEAR = '<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>';

// 回報問題：Google Material Symbols Rounded 的 feedback（Apache 2.0），粗細選 wght 500，跟旁邊玩法、設定圖示的線條一樣粗（2026-10-23 使用者指定）
const ICON_REPORT = '<svg class="nav-icon" viewBox="0 -960 960 960" aria-hidden="true"><path fill="currentColor" d="M480-359.52q18.52 0 31.06-12.7 12.53-12.69 12.53-31.13 0-18.43-12.53-31.01-12.54-12.57-31.06-12.57t-31.06 12.53q-12.53 12.53-12.53 31.05 0 18.44 12.53 31.13 12.54 12.7 31.06 12.7Zm0-158.57q17.81 0 29.86-12.05T521.91-560v-158.09q0-17.81-12.05-29.86T480-760q-17.81 0-29.86 12.05t-12.05 29.86V-560q0 17.81 12.05 29.86T480-518.09ZM231.87-231.87l-82.44 82.44q-21.63 21.63-49.59 9.77-27.97-11.86-27.97-42.36v-615.11q0-37.78 26.61-64.39t64.39-26.61h634.26q37.78 0 64.39 26.61t26.61 64.39v474.26q0 37.78-26.61 64.39t-64.39 26.61H231.87Zm-34-91h599.26v-474.26H162.87v508.5l35-34.24Zm-35 0v-474.26 474.26Z"/></svg>';

export function gameBar(s, lang, opts) {
  const links = [
    [s.navGames, local(lang, 'games')],
    [s.navCombo, local(lang, 'combo')],
    [s.navBoardgame, local(lang, 'tools')],
    [s.navGuides, local(lang, 'guides')],
  ];
  /*
   * 選單最後一項「回報問題」（2026-10-23）：開關於頁的聯絡表單，預先選好修改建議＋這個遊戲。
   * 遊戲代號就是網址第一段（/bomb/zh-TW/ → bomb），跟 apps/feedback 的 GAMES 對得上；從哪一頁來的由 about.js 看 referrer 記
   */
  const report = `${local(lang, 'about')}?game=${encodeURIComponent(opts.gameHref.split('/')[1] || '')}#contact`;
  const current = opts.isRules ? ' aria-current="page"' : '';
  const settings = opts.settingsLabel
    ? `<button type="button" id="game-settings" data-game-href="${opts.gameHref}" aria-label="${esc(opts.settingsLabel)}">${ICON_GEAR}<span class="tab-text">${esc(opts.settingsLabel)}</span><span class="tab-count" id="game-settings-count"></span></button>`
    : '';
  const music = opts.musicLabel
    ? `<button class="btn btn-icon btn-ghost game-music" id="game-music" type="button" aria-pressed="true" aria-label="${esc(opts.musicLabel)}" title="${esc(opts.musicLabel)}">${ICON_MUSIC}</button>`
    : '';
  return `
    <div class="game-bar-host">
      <div class="appbar game-bar${opts.settingsLabel ? ' has-settings' : ''}${music ? ' has-music' : ''}">
        <button class="btn btn-icon btn-ghost" id="game-back" type="button" data-href="${opts.backHref}" aria-label="${esc(s.back)}"><svg><use href="#i-back"/></svg></button>
        <a class="title" href="${opts.gameHref}">${esc(opts.title)}</a>
        <nav class="game-tabs" aria-label="${esc(opts.title)}">
          <a class="tab-rules" href="${opts.rulesHref}"${current} aria-label="${esc(opts.rulesLabel)}">${ICON_RULES}<span class="tab-text">${esc(opts.rulesLabel)}</span></a>${settings}
        </nav>${music}
        <div class="nav-more game-menu">
          <button class="btn btn-icon btn-ghost" id="game-menu" type="button" aria-label="${esc(s.menu)}" aria-expanded="false" aria-haspopup="true"><svg><use href="#i-menu"/></svg></button>
          <div class="nav-menu" hidden>${links.map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}<a class="nav-report" href="${report}">${ICON_REPORT}${esc(s.reportIssue)}</a></div>
        </div>
        <!-- 玩的時候右邊的身分標籤（房間型遊戲的「主持人」「玩家」），遊戲用 id 填字；空的就不顯示 -->
        <span class="badge b-info game-bar-badge" id="game-bar-badge"></span>
        <span class="game-bar-spacer" aria-hidden="true"></span>
      </div>
    </div>
    <dialog class="sheet" id="game-sheet" aria-label="${esc(s.menu)}" tabindex="-1">
      <div class="grabber"></div>
      <div class="sheet-list">${links.map(([t, h]) => `<a class="btn btn-secondary btn-block" href="${h}">${esc(t)}</a>`).join('')}<a class="btn btn-ghost btn-block nav-report" href="${report}">${ICON_REPORT}${esc(s.reportIssue)}</a></div>
    </dialog>`;
}
