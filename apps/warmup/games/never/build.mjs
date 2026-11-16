/*
 * 我從來沒有的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-16';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'ruleCardsDid', 'rulesFacts', 'rulesHowSteps', 'rulesDidSteps', 'rulesLeadSteps'];

// 玩法頁的「反過來玩」與「主題和例句」直接塞 HTML
export const RAW_TOKENS = ['rulesDidList', 'rulesTopicsList'];

export function gameBar({ page, strings }) {
  // 有配樂（11/16 老闆要的），頂欄音符鍵管配樂和拉霸的聲音；玩法頁沒有聲音。沒有設定分頁：唯一的選項（玩法）固定顯示在開場
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}

export function tokens({ strings, page, escapeHtml }) {
  if (page.dir !== 'rules') return {};
  return {
    rulesDidList: strings.rulesDidSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n          '),
    // 每個主題放第一句例句（玩法頁給搜尋的人看「可以說什麼」）
    rulesTopicsList: strings.topics
      .map(([topic, examples]) => `<li><b>${escapeHtml(topic)}</b>：${escapeHtml(strings.exNever.replace('{ex}', examples[0]).replace(/^例：/, ''))}</li>`)
      .join('\n          '),
  };
}
