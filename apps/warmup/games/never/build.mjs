/*
 * 我從來沒有的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { readFileSync } from 'node:fs';
// 動作卡（全站共用，game.js 的 Leader.actionCard；木頭人動作版、桌遊助手的動作抽卡也用）。
// 贏家抽一個動作讓大家模仿（老闆 11/16：獎勵跟木頭人動作版一樣）
import { actionsFor, checkActions } from '../../../homepage/src/action-cards.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-16';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'ruleCardsDid', 'rulesFacts', 'rulesHowSteps', 'rulesDidSteps', 'rulesLeadSteps'];

// 玩法頁的「反過來玩」與「主題和例句」直接塞 HTML；動作卡是 JSON
export const RAW_TOKENS = ['rulesDidList', 'rulesTopicsList', 'actionsJson'];

export function check() {
  // 每個動作代號都要有插圖
  checkActions(readFileSync(new URL('../../../homepage/assets/woohop-art.js', import.meta.url), 'utf8'));
}

export function gameBar() {
  // 沒有配樂、沒有聲音（講話的遊戲，結尾是動作卡不是拉霸），也沒有設定分頁：唯一的選項（玩法）固定顯示在開場
  return { musicLabel: '' };
}

export function tokens({ lang, strings, page, escapeHtml, toScriptJson }) {
  if (page.dir !== 'rules') return { actionsJson: toScriptJson(actionsFor(lang)) };
  return {
    rulesDidList: strings.rulesDidSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n          '),
    // 每個主題放第一句例句（玩法頁給搜尋的人看「可以說什麼」）
    rulesTopicsList: strings.topics
      .map(([topic, examples]) => `<li><b>${escapeHtml(topic)}</b>：${escapeHtml(strings.exNever.replace('{ex}', examples[0]).replace(/^例：/, ''))}</li>`)
      .join('\n          '),
  };
}
