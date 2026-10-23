/*
 * 遊戲頁與玩法頁共用的小工具：手動送 page_view。
 * 遊戲內頂欄（返回、設定、選單）的行為在 Woohop 全站共用的 game.js。
 */
(function () {
  'use strict';

  // 遊戲頁的 page_view 由 app.js 依畫面送（設定／進行中／爆炸各算一次）
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + path,
      page_path: path,
    });
  };
})();
