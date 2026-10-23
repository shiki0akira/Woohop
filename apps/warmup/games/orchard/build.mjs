/*
 * 果園菜園動物園的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-21';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function gameBar({ page, strings }) {
  return {
    // 沒有「設定」分頁；聲音開關（節拍器、拉霸）在遊戲頁的頂欄
    // 玩法頁沒有聲音，不放開關
    musicLabel: page.dir === 'rules' ? '' : strings.soundLabel,
  };
}
