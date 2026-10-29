/*
 * 倒放猜猜看的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { wordsFor, checkWords } from '../../../homepage/src/word-bank.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-23';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function check({ LANGS, STRINGS }) {
  // 抽題三種題型都要有題目，不然「換一題」換不到別的題型
  for (const lang of LANGS) {
    for (const kind of ['connectors', 'hum', 'free']) {
      if (!STRINGS[lang].prompts[kind]?.length) throw new Error(`${lang} 的 prompts.${kind} 是空的`);
    }
  }
  checkWords();
}

// 造句用的詞是全站共用題庫裡能造句的（say），攤平成一串、去掉重複，嵌進頁面
export const RAW_TOKENS = ['wordsJson'];

export function tokens({ lang, toScriptJson }) {
  return { wordsJson: toScriptJson([...new Set(wordsFor(lang, 'say').flatMap(([, , words]) => words))]) };
}

export function gameBar() {
  // 沒有配樂、沒有設定分頁：聲音都是玩家自己錄的
  return { musicLabel: '' };
}
