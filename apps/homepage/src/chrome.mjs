// Woohop 全站共用的導覽列與頁尾（HTML）。首頁的 scripts/prerender.js 與各遊戲的 build 都用這一份，
// 改這裡就是全站一起改。互動（語言選單、「更多」、手機選單）在 assets/site.js 的 Site.nav()。
//
// s 是 src/locales.mjs 裡當頁語言的文案；page 是導覽列要標成目前頁面的那一項
// （home / games / combo / guides，遊戲頁傳別的值就不標）；
// langHref(l) 是語言選單裡每個語言要連去的網址（預設是首頁同一頁的其他語言）。

import { LANGS, LANG_NAMES } from './locales.mjs';

export const PAGES = { home: '', games: 'games/', combo: 'combo/', guides: 'guides/' };
export const local = (lang, page) => `/${lang}/${PAGES[page]}`;
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function navbar(s, lang, page, langHref = (l) => local(l, page)) {
  const nav = [
    [s.navGames, local(lang, 'games'), 'games'],
    [s.navCombo, local(lang, 'combo'), 'combo'],
    [s.navBoardgame, `/avalon/${lang}`, 'boardgame'],
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
        <div class="sheet-foot"><button class="btn btn-ghost" type="button" data-close>${esc(s.close)}</button></div>
      </dialog>`;
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
          <div class="footer-col"><h4>${esc(s.footerSite)}</h4><a class="link" href="${local(lang, 'games')}">${esc(s.navGames)}</a><a class="link" href="${local(lang, 'combo')}">${esc(s.navCombo)}</a><a class="link" href="/avalon/${lang}">${esc(s.navBoardgame)}</a><a class="link" href="${local(lang, 'guides')}">${esc(s.navGuides)}</a></div>
          <div class="footer-col"><h4>${esc(s.footerOther)}</h4><a class="link" href="/happiness/zh-TW/">${esc(s.games.happy[0])}</a><span class="t-small">${esc(s.happyShort)}</span></div>
          <div class="footer-col"><h4>${esc(s.footerAbout)}</h4><span class="link is-disabled" aria-disabled="true">${esc(s.aboutUs)}</span><span class="link is-disabled" aria-disabled="true">${esc(s.privacy)}</span><span class="link is-disabled" aria-disabled="true">${esc(s.contact)}</span></div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Woohop</span>
          <div class="nav-more lang-wrap up">
            <button class="lang" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${esc(s.langMenu)}"><svg><use href="#i-globe"/></svg>${esc(s.langShort)}</button>
            <div class="nav-menu" hidden>${langMenu}</div>
          </div>
        </div>
      </footer>
    </div>`;
}
