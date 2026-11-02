/*
 * 比手畫腳接力的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { wordsFor, checkWords } from '../../../homepage/src/word-bank.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-02';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps', 'teamNames'];

// 題庫跟比手畫腳同一份（全站共用的 apps/homepage/src/word-bank.mjs），只嵌比得出來的（act）
export const RAW_TOKENS = ['wordsJson'];

export function check({ LANGS, STRINGS }) {
  checkWords();
  // 隊名最多 4 隊（app.js 的 TEAM_MAX），少一個就會出現 undefined 隊
  for (const lang of LANGS) {
    if (STRINGS[lang].teamNames.length < 4) throw new Error(`${lang} 的 teamNames 要有 4 個`);
  }
}

export function tokens({ lang, toScriptJson }) {
  return { wordsJson: toScriptJson(wordsFor(lang, 'act')) };
}

export function gameBar({ page, strings }) {
  // 有倒數，所以有聲音開關（頂欄音符鍵）；玩法頁沒有聲音。沒有設定分頁（開場就能選）
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}
