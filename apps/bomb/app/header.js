/*
 * 遊戲頁與玩法頁共用的小工具：手動送 page_view，以及遊戲內頂欄的選單與「設定」分頁。
 * 網站層的導覽（語言選單、下拉的開關）用的是 Woohop 全站的 site.js。
 */
(function () {
  'use strict';

  var LANG = window.BOMB.lang;
  var BASE = window.BOMB.base;
  var GAME_URL = BASE + '/' + LANG + '/';

  // 遊戲頁的 page_view 由 app.js 依畫面送（設定／進行中／爆炸各算一次）
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + path,
      page_path: path,
    });
  };

  // 「設定」：遊戲頁直接開設定框（app.js 給的 openSettings）；玩法頁沒有設定框，帶 #settings 回遊戲頁再開
  function openSettings() {
    if (typeof window.openSettings === 'function') window.openSettings();
    else location.href = GAME_URL + '#settings';
  }

  var tab = document.getElementById('open-custom');
  if (tab) tab.addEventListener('click', openSettings);

  // 頂欄放不下時（德文這類長字）分兩段讓位，讓遊戲名不被截掉：
  // 先把「設定」換成齒輪（is-compact），還是放不下再把「玩法」換成書本（is-tight）。
  // 中文等短的語言放得下，就維持文字。看的是遊戲名有沒有被截，不是固定寬度
  var bar = document.querySelector('.game-bar');
  var title = bar && bar.querySelector('.title');
  if (bar && title && window.ResizeObserver) {
    var cut = function () { return title.scrollWidth > title.clientWidth + 1; };
    var fit = function () {
      bar.classList.remove('is-compact', 'is-tight');
      if (cut()) bar.classList.add('is-compact');
      if (cut()) bar.classList.add('is-tight');
    };
    new ResizeObserver(fit).observe(bar);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // 玩法頁的返回鍵回遊戲頁（遊戲頁的返回鍵依畫面而定，在 app.js）
  var back = document.getElementById('game-back');
  if (back && window.BOMB.page) {
    back.addEventListener('click', function () { location.href = GAME_URL; });
  }

  // 選單鍵：電腦上不攔，讓 site.js 當成一般下拉開關；
  // 手機上攔下來改開遊戲選單面板（玩法、設定在最上面，下面是網站的頁面）
  var sheet = document.getElementById('game-sheet');
  var menu = document.getElementById('game-menu');
  if (sheet && menu) {
    menu.addEventListener('click', function (e) {
      if (!window.matchMedia('(max-width: 640px)').matches) return;
      if (typeof sheet.showModal !== 'function') return;
      e.stopPropagation();
      sheet.showModal();
      sheet.focus();
    });
    // 每條關閉路徑自己關（不靠 dialog 的 close 事件，那個在部分 WebView 不會發）
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-settings]')) {
        sheet.close();
        openSettings();
      } else if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) {
        sheet.close();
      }
    });
  }
})();
