/*
 * 遊戲內頂欄的行為（各遊戲共用，HTML 是 src/chrome.mjs 的 gameBar()、樣式在 game.css）。
 *
 * 遊戲可以提供兩個掛勾：
 *   window.gameBack()      按返回鍵時做什麼（例如進行中先跳確認）；沒給就連到返回鍵的 data-href
 *   window.openSettings()  按「設定」時打開設定框；沒給（例如在玩法頁）就帶 #settings 回遊戲頁
 * 玩的時候遊戲把 <body data-game-mode> 設成 "play"，分頁和選單就會藏起來、遊戲名不能點（game.css）。
 */
(function () {
  'use strict';

  var bar = document.querySelector('.game-bar');
  if (!bar) return;

  // 返回鍵
  var back = document.getElementById('game-back');
  if (back) {
    back.addEventListener('click', function () {
      if (typeof window.gameBack === 'function') window.gameBack();
      else location.href = back.getAttribute('data-href');
    });
  }

  // 「設定」
  var settings = document.getElementById('game-settings');
  if (settings) {
    settings.addEventListener('click', function () {
      if (typeof window.openSettings === 'function') window.openSettings();
      else location.href = settings.getAttribute('data-game-href') + '#settings';
    });
  }

  // 頂欄放不下時分兩段讓位，讓遊戲名不被截掉：先把「設定」換成齒輪（is-compact），還是放不下再把「玩法」換成書本（is-tight）。
  // 看的是遊戲名有沒有被截，不是固定寬度：中文等短的語言放得下，就維持文字
  var title = bar.querySelector('.title');
  if (title && window.ResizeObserver) {
    var cut = function () { return title.scrollWidth > title.clientWidth + 1; };
    var fit = function () {
      bar.classList.remove('is-compact', 'is-tight');
      if (cut() && settings) bar.classList.add('is-compact');
      if (cut()) bar.classList.add('is-tight');
    };
    new ResizeObserver(fit).observe(bar);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // 選單鍵：電腦上不攔，讓 site.js 當成一般下拉開關；手機上攔下來改開底部面板
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
      if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close();
    });
  }
})();
