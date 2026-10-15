/*
 * 導覽列的行為（深淺色切換、語言切換）。遊戲頁與規則頁共用同一份，
 * 兩邊才不會各改各的——header.html 這個 partial 也是同樣的用意。
 *
 * window.BOMB.page 是當前頁面在語言後面的路徑（遊戲頁是 ''、規則頁是 'rules/'），
 * 切語言時用它組出對應語言的同一頁。
 */
(function () {
  'use strict';

  var LANG = window.BOMB.lang;
  var BASE = window.BOMB.base;
  var PAGE = window.BOMB.page || '';

  // 這幾個 key 跟系列其他專案共用，不要各專案自己發明一套
  var THEME_KEY = 'web100-theme';
  var LANG_KEY = 'web100-lang';
  var LANG_COOKIE = 'web100_lang';

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var light = document.documentElement.classList.toggle('light');
      try {
        localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
      } catch (e) {
        /* 無痕模式或封鎖 storage：這次還是會切，只是記不住 */
      }
    });
  }

  var langSwitch = document.getElementById('lang-switch');

  /*
   * 每個語言是一份獨立的靜態頁，下拉的 selected 是 build 時就寫死的。但瀏覽器在
   * 上一頁／下一頁（含 bfcache）時會**還原表單控制項的值**，於是會出現：
   * 在英文頁把下拉切到繁體中文 → 跳到中文頁 → 按上一頁回英文頁，
   * 內容是英文、下拉卻還顯示「繁體中文」。
   *
   * pageshow 在正常載入與 bfcache 還原時都會觸發，一律把下拉拉回這份文件真正的語言。
   */
  window.addEventListener('pageshow', function () {
    if (langSwitch) langSwitch.value = LANG;
  });

  if (langSwitch) {
    langSwitch.addEventListener('change', function () {
      var next = this.value;
      if (next === LANG) return;

      // 手動選過的語言優先權高於瀏覽器語言，寫 cookie 給 /bomb/ 的轉址用
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch (e) {
        /* 同上 */
      }
      document.cookie =
        LANG_COOKIE + '=' + encodeURIComponent(next) + '; path=/; max-age=31536000; samesite=lax';

      location.href = BASE + '/' + next + '/' + PAGE;
    });
  }

  // 遊戲頁的 page_view 由 app.js 依畫面送（設定／進行中／爆炸各算一次），
  // 這裡只負責沒有畫面切換的靜態頁
  window.trackPageView = function (path) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + path,
      page_path: path,
    });
  };
})();
