// 預渲染用的進入點，只給 scripts/prerender.js 在 Node 裡呼叫，不會進到瀏覽器的 bundle。
//
// 這支存在的理由：以前 prerender.js 是用字串手抄一份 HTML，把 src/pages/ 裡的 className
// 逐字複製過去。只要有人改了元件的 class 而忘了同步這裡，預渲染畫的就是舊樣式，
// React 一掛載畫面就會「閃一下」跳成新樣式——這個漂移已經發生過兩次。
// 改成直接渲染真正的元件之後，樣式來源只剩一個，結構上就不可能再對不上。
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import i18n from './i18n';
import { AppProviders, AppRoutes } from './App';

// 瀏覽器端是 LangLayout 的 useEffect 在切語言，但 effect 在 renderToStaticMarkup 不會執行，
// 所以這裡要在 render 之前先把語言切好。
export async function renderPage(lang, url) {
  await i18n.changeLanguage(lang);

  return renderToStaticMarkup(
    <AppProviders>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </AppProviders>,
  );
}
