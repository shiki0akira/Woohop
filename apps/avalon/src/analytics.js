// GA4 事件都加 avalon_ 前綴，跟其他 Web100 子專案的事件分開，
// 之後在同一個 GA4 屬性裡看報表才知道是哪個遊戲的資料。
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
