import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gameSlug, getPathSuffix, persistLangPreference } from '../i18n';
import { LANGS, LANG_NAMES, siteStrings, sitePath } from '../woohop';
import ThemeSwitch from './ThemeSwitch';

/*
 * Woohop 全站頁尾：跟首頁、其他遊戲同一個結構與樣式（apps/homepage/src/chrome.mjs 的 footer()、site.css）。
 * 阿瓦隆多一個模式切換（ThemeSwitch），放在語言選單左邊。
 * 語言選單連到「阿瓦隆同一頁」的其他語言，選了會記住（web100_lang cookie）。
 */
export default function SiteFooter() {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const s = siteStrings(lang);
  const [langOpen, setLangOpen] = useState(false);
  // 信箱掛載後才放上去：預渲染的 HTML 裡不出現完整地址，少被爬蟲抓去寄垃圾信（同 site.js）
  const [mail, setMail] = useState('');

  useEffect(() => {
    setMail(['woohop', 'vibeweb100.com'].join('@'));
  }, []);

  useEffect(() => {
    if (!langOpen) return undefined;
    const close = (e) => {
      if (!e.target.closest('.lang-wrap')) setLangOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langOpen]);

  const suffix = getPathSuffix(location.pathname);
  const langHref = (l) => `/${gameSlug}/${l}${suffix}`;

  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="wordmark" href={sitePath(lang, 'home')} style={{ fontSize: 22 }}>
            <svg viewBox="0 0 59 48" style={{ width: 30, height: 24.4 }} aria-hidden="true">
              <use href="#w" fill="#7489E6" />
            </svg>
            Woohop
          </a>
          <p>
            {s.footerTag1}
            <br />
            {s.footerTag2}
          </p>
          {mail && (
            <a className="link footer-mail" href={`mailto:${mail}`}>
              <svg aria-hidden="true">
                <use href="#i-mail" />
              </svg>
              <span>{mail}</span>
            </a>
          )}
        </div>
        <div className="footer-col">
          <h4>{s.footerSite}</h4>
          <a className="link" href={sitePath(lang, 'games')}>{s.navGames}</a>
          <a className="link" href={sitePath(lang, 'combo')}>{s.navCombo}</a>
          <a className="link" href={`/${gameSlug}/${lang}`}>{s.navBoardgame}</a>
          <a className="link" href={sitePath(lang, 'guides')}>{s.navGuides}</a>
        </div>
        <div className="footer-col">
          <h4>{s.footerOther}</h4>
          <a className="link" href="/happiness/zh-TW/">{s.games.happy[0]}</a>
          <span className="t-small">{s.happyShort}</span>
        </div>
        <div className="footer-col">
          <h4>{s.footerAbout}</h4>
          <span className="link is-disabled" aria-disabled="true">{s.aboutUs}</span>
          <span className="link is-disabled" aria-disabled="true">{s.privacy}</span>
          <span className="link is-disabled" aria-disabled="true">{s.contact}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Woohop</span>
        <div className="footer-controls">
          <ThemeSwitch />
          <div className="nav-more lang-wrap up">
            <button
              className="lang"
              type="button"
              aria-expanded={langOpen}
              aria-haspopup="true"
              aria-label={s.langMenu}
              onClick={() => setLangOpen((open) => !open)}
            >
              <svg aria-hidden="true">
                <use href="#i-globe" />
              </svg>
              {s.langShort}
            </button>
            <div className="nav-menu" hidden={!langOpen}>
              {LANGS.map((l) => (
                <a
                  key={l}
                  href={langHref(l)}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === lang ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setLangOpen(false);
                    persistLangPreference(l); // 手動選的語言優先權高於瀏覽器語言
                    navigate(langHref(l), { replace: true });
                  }}
                >
                  {LANG_NAMES[l]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
