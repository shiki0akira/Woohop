/*
 * 終極密碼的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-17';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function gameBar({ page, strings }) {
  // 有按鍵聲、提示音、爆炸聲，所以有聲音開關（頂欄音符鍵，開場藏起來）；玩法頁沒有聲音。
  // 沒有背景配樂（跟定時炸彈一樣：提示音本身就是節奏）；沒有設定分頁，唯一的選項（範圍）在開場
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}
