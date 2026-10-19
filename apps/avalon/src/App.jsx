import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { applySeo, defaultLang, gameSlug, getPathSuffix, normalizeLang, supportedLangs } from './i18n';
import GameBar from './components/GameBar';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Game from './pages/Game';
import Rules from './pages/Rules';

function LangLayout() {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const safeLang = normalizeLang(lang);

  useEffect(() => {
    if (safeLang !== lang) {
      navigate(`/${gameSlug}/${defaultLang}${getPathSuffix(location.pathname)}`, { replace: true });
      return;
    }
    if (i18n.language !== safeLang) {
      i18n.changeLanguage(safeLang);
    }
    document.documentElement.lang = safeLang;
    applySeo(safeLang, location.pathname);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [i18n, lang, location.pathname, navigate, safeLang]);

  // 目前是哪一頁：頂欄的返回鍵與「規則」分頁要用
  const suffix = getPathSuffix(location.pathname);
  const page = suffix.startsWith('/rules') ? 'rules' : suffix.startsWith('/game') ? 'game' : 'home';

  return (
    // Woohop 遊戲頁的版型（跟其他遊戲一樣）：.page 置中，裡面是遊戲內頂欄、單欄 720px 的內容、全站頁尾
    <div className="page">
      <GameBar page={page} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="rules" element={<Rules />} />
        <Route path="*" element={<Navigate to={`/${gameSlug}/${safeLang}`} replace />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

// 路由表與 Provider 拆出來單獨匯出，是為了讓 scripts/prerender.js 能用同一棵元件樹搭配
// StaticRouter 在 Node 裡渲染成靜態 HTML。瀏覽器走 BrowserRouter、預渲染走 StaticRouter，
// 中間的東西完全共用——預渲染的畫面因此不可能跟實際畫面長得不一樣。
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${gameSlug}/${defaultLang}`} replace />} />
      <Route path={`${gameSlug}/:lang/*`} element={<LangLayout />} />
      <Route path="*" element={<Navigate to={`/${gameSlug}/${defaultLang}`} replace />} />
    </Routes>
  );
}

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <GameProvider>{children}</GameProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
