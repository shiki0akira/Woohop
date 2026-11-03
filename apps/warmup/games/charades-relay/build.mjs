/*
 * 比手畫腳接力賽的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { wordsFor, checkWords } from '../../../homepage/src/word-bank.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-02';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

// 題庫跟比手畫腳同一份（全站共用的 apps/homepage/src/word-bank.mjs），只嵌比得出來的（act）
export const RAW_TOKENS = ['wordsJson'];

export function check() {
  checkWords();
}

export function tokens({ lang, toScriptJson }) {
  return { wordsJson: toScriptJson(wordsFor(lang, 'act')) };
}

export function gameBar({ page, strings }) {
  // 有倒數，所以有聲音開關（頂欄音符鍵）；玩法頁沒有聲音。沒有設定分頁（開場就能選）
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}
