/*
 * 秒數挑戰的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-12';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function gameBar({ page, strings }) {
  // 有配樂和開始／停的提示音，所以頂欄有聲音開關（開場用 CSS 藏起來，開始玩才配音樂）；玩法頁沒有聲音
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}
