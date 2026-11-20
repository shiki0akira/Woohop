/*
 * 數字默契排排站的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 * QR code 用 public/vendor/qrcode.js（跟秒數挑戰同一份），首頁 vercel.json 要多一條 /lineup/vendor/ 的代理。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-20';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function gameBar() {
  // 沒有聲音（講話的遊戲；大家各自看手機，主持人那支出聲也沒意義），也沒有設定分頁
  return { musicLabel: '' };
}
