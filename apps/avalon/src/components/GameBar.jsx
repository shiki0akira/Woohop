import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gameSlug } from '../i18n';
import { siteStrings, sitePath } from '../woohop';

/*
 * 遊戲內頂欄：跟其他 Woohop 遊戲同一個結構與樣式（apps/homepage/src/chrome.mjs 的 gameBar()、game.css），
 * 這裡是 React 版，行為照 game.js：
 *   返回鍵    阿瓦隆首頁 → 網站的「找遊戲」；語音導場、規則頁 → 回阿瓦隆首頁
 *   遊戲名    回阿瓦隆首頁
 *   分頁      「規則」（目前在規則頁時標成目前頁面）
 *   選單鍵    電腦上是下拉、手機上開底部面板，裡面是網站的頁面
 * 遊戲名被擠到截字時，「規則」換成書本圖示（is-tight），跟 game.js 一樣看的是有沒有被截、不是固定寬度。
 */
const ICON_RULES = (
  <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 8h8M8 12h5"
    />
  </svg>
);

export default function GameBar({ page }) {
  const { lang } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const s = siteStrings(lang);
  const home = `/${gameSlug}/${lang}`;
  const links = [
    [s.navGames, sitePath(lang, 'games')],
    [s.navCombo, sitePath(lang, 'combo')],
    [s.navBoardgame, home],
    [s.navGuides, sitePath(lang, 'guides')],
  ];
  // 選單最後一項「回報問題」：開聯絡表單、預先選好阿瓦隆（跟 chrome.mjs 的 gameBar 一樣）
  const report = `${sitePath(lang, 'about')}?game=avalon#contact`;
  const reportIcon = (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z" />
      <path d="M12 6.8v4.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="13.4" r="1.3" fill="currentColor" />
    </svg>
  );

  const barRef = useRef(null);
  const titleRef = useRef(null);
  const sheetRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 遊戲名被截字時，「規則」換成圖示
  useEffect(() => {
    const bar = barRef.current;
    const title = titleRef.current;
    if (!bar || !title || !window.ResizeObserver) return undefined;
    const fit = () => {
      bar.classList.remove('is-tight');
      if (title.scrollWidth > title.clientWidth + 1) bar.classList.add('is-tight');
    };
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    if (document.fonts) document.fonts.ready.then(fit);
    return () => ro.disconnect();
  }, [lang]);

  // 下拉選單：點外面就收起來
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (!e.target.closest('.game-menu')) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const onBack = () => {
    if (page === 'home') window.location.href = sitePath(lang, 'games');
    else navigate(home);
  };

  const onMenu = () => {
    // 手機上開底部面板，電腦上是下拉
    const sheet = sheetRef.current;
    if (window.matchMedia('(max-width: 640px)').matches && sheet && typeof sheet.showModal === 'function') {
      sheet.showModal();
      sheet.focus();
      return;
    }
    setMenuOpen((open) => !open);
  };

  // 面板往下拉就關（沒有「關閉」鍵了，點旁邊或往下拉）：跟 game.js 的 swipeToClose 一樣，超過 80px 才關
  useEffect(() => {
    const panel = sheetRef.current;
    if (!panel) return undefined;
    let y0 = null;
    let dy = 0;
    const start = (e) => {
      if (panel.scrollTop > 0) return;
      y0 = e.touches[0].clientY;
      dy = 0;
      panel.style.transition = 'none';
    };
    const move = (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      panel.style.transform = dy ? `translateY(${dy}px)` : '';
    };
    const end = () => {
      if (y0 === null) return;
      y0 = null;
      panel.style.transition = '';
      panel.style.transform = '';
      if (dy > 80) panel.close();
    };
    panel.addEventListener('touchstart', start, { passive: true });
    panel.addEventListener('touchmove', move, { passive: true });
    panel.addEventListener('touchend', end);
    panel.addEventListener('touchcancel', end);
    return () => {
      panel.removeEventListener('touchstart', start);
      panel.removeEventListener('touchmove', move);
      panel.removeEventListener('touchend', end);
      panel.removeEventListener('touchcancel', end);
    };
  }, []);

  // 面板的每條關閉路徑自己關（不靠 dialog 的 close 事件，部分 WebView 不會發）
  const onSheetClick = (e) => {
    const sheet = sheetRef.current;
    if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close();
  };

  return (
    <>
      <div className="game-bar-host">
        <div className="appbar game-bar" ref={barRef}>
          <button className="btn btn-icon btn-ghost" id="game-back" type="button" aria-label={s.back} onClick={onBack}>
            <svg aria-hidden="true">
              <use href="#i-back" />
            </svg>
          </button>
          <Link className="title" to={home} ref={titleRef}>
            {t('nav.title')}
          </Link>
          <nav className="game-tabs" aria-label={t('nav.title')}>
            <Link
              className="tab-rules"
              to={`${home}/rules`}
              aria-current={page === 'rules' ? 'page' : undefined}
              aria-label={t('nav.rules')}
            >
              {ICON_RULES}
              <span className="tab-text">{t('nav.rules')}</span>
            </Link>
          </nav>
          <div className="nav-more game-menu">
            <button
              className="btn btn-icon btn-ghost"
              id="game-menu"
              type="button"
              aria-label={s.menu}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={onMenu}
            >
              <svg aria-hidden="true">
                <use href="#i-menu" />
              </svg>
            </button>
            <div className="nav-menu" hidden={!menuOpen}>
              {links.map(([label, href]) => (
                <a key={label} href={href}>
                  {label}
                </a>
              ))}
              <a className="nav-report" href={report}>
                {reportIcon}
                {s.reportIssue}
              </a>
            </div>
          </div>
          <span className="badge b-info game-bar-badge" id="game-bar-badge" />
          <span className="game-bar-spacer" aria-hidden="true" />
        </div>
      </div>
      <dialog className="sheet" id="game-sheet" aria-label={s.menu} tabIndex={-1} ref={sheetRef} onClick={onSheetClick}>
        <div className="grabber" />
        <div className="sheet-list">
          {links.map(([label, href]) => (
            <a key={label} className="btn btn-secondary btn-block" href={href}>
              {label}
            </a>
          ))}
          <a className="btn btn-ghost btn-block nav-report" href={report}>
            {reportIcon}
            {s.reportIssue}
          </a>
        </div>
      </dialog>
    </>
  );
}
