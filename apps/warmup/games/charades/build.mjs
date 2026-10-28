/*
 * 比手畫腳的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { wordsFor, checkWords } from '../../../homepage/src/word-bank.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-28';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

// 題庫是全站共用的（apps/homepage/src/word-bank.mjs，桌遊助手的抽題目也用），只嵌比得出來的（act）
export const RAW_TOKENS = ['wordsJson'];

export function check() {
  // 代號各語言一樣、每類至少 25 題、類內不重複
  checkWords();
}

export function tokens({ lang, toScriptJson }) {
  return { wordsJson: toScriptJson(wordsFor(lang, 'act')) };
}

export function gameBar() {
  // 沒有聲音（不計時了）、沒有設定分頁（開場就能選）
  return { musicLabel: '' };
}
