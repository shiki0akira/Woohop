/*
 * 遊戲頁與玩法頁共用的小工具：手動送 page_view。
 * 遊戲內頂欄（返回、設定、選單）的行為在 Woohop 全站共用的 game.js。
 */
(function () {
  'use strict';

  // 遊戲頁的 page_view 由 app.js 依畫面送（設定／進行中／爆炸各算一次）
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    // 網址的參數（utm、?room=）要留著，GA4 才算得出流量來源。
    // 先 set 再送：之後的 user_engagement 和自訂事件才會記到這個畫面，
    // 不然停留時間全算在進站的那一頁、其他畫面都是 0 秒
    var page = {
      page_title: document.title,
      page_location: location.origin + path + location.search,
    };
    gtag('set', page);
    gtag('event', 'page_view', page);
  };
})();
