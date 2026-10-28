/*
 * 木頭人動作版的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { readFileSync } from 'node:fs';
// 動作卡（全站共用，game.js 的 Leader.actionCard、woohop-art.js 的 Woohop.actionArt；桌遊助手的動作抽卡也用）
import { actionsFor, checkActions } from '../../../homepage/src/action-cards.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-28';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export const RAW_TOKENS = ['actionsJson'];

export function check() {
  // 每個動作代號都要有插圖
  checkActions(readFileSync(new URL('../../../homepage/assets/woohop-art.js', import.meta.url), 'utf8'));
}

export function gameBar() {
  // 沒有聲音（拉霸拿掉了）、沒有設定分頁
  return { musicLabel: '' };
}

export function tokens({ lang, toScriptJson }) {
  // 動作卡只內嵌這個語言的：一份頁面只有一種語言
  return { actionsJson: toScriptJson(actionsFor(lang)) };
}
