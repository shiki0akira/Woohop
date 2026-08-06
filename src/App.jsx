import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { applySeo, defaultLang, gameSlug, getPathSuffix, normalizeLang, supportedLangs } from './i18n';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

  return (
    // 這層刻意不上底色：底色和文字色由 body 決定，這裡若填色會蓋掉背景光暈（光暈是 body 的 ::before，z-index -1）。
    // flex-col + flex-1 是為了讓內容不夠長時頁尾仍然貼在視窗底部。
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="game" element={<Game />} />
          <Route path="rules" element={<Rules />} />
          <Route path="*" element={<Navigate to={`/${gameSlug}/${safeLang}`} replace />} />
        </Routes>
      </div>
      <Footer />
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
