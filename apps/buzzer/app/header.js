/*
 * 遊戲頁與玩法頁共用的小工具：手動送 page_view。
 * 導覽（語言選單）用 Woohop 全站的 site.js，遊戲內頂欄用 game.js。
 */
(function () {
  'use strict';

  // 遊戲頁的 page_view 由 app.js 依畫面送（首頁、出題、加入、房間各算一次）
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + path,
      page_path: path,
    });
  };
})();
