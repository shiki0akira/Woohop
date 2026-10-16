/*
 * 遊戲頁與規則頁共用的小工具。導覽列（語言選單、手機選單）已經改用 Woohop 全站的 site.js，
 * 這裡只剩手動送 page_view 的函式。
 */
(function () {
  'use strict';

  // 遊戲頁的 page_view 由 app.js 依畫面送（設定／進行中／爆炸各算一次），
  // 規則頁這種沒有畫面切換的靜態頁也走這一支
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + path,
      page_path: path,
    });
  };
})();
