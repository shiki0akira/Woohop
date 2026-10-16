/* 找遊戲頁：完整推薦器（四個條件、全部遊戲）。條件會寫進網址，首頁的「看全部遊戲」會帶著條件過來。 */
(() => {
  const { finder, nav } = window.Site;
  nav();
  finder(document.getElementById('finder-root'));
})();
