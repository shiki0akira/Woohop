/*
 * 木頭人動作版的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

import { readFileSync } from 'node:fs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-28';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function gameBar() {
  // 沒有聲音（拉霸拿掉了）、沒有設定分頁
  return { musicLabel: '' };
}

export function check({ LANGS, STRINGS }) {
  // 插圖代號（public/action-art.js 裡的 `代號: function`）：每個動作都要有自己的插圖
  const art = readFileSync(new URL('./public/action-art.js', import.meta.url), 'utf8');
  const keys = new Set([...art.matchAll(/^    (\w+): function/gm)].map((m) => m[1]));
  for (const lang of LANGS) {
    const actions = STRINGS[lang].actions ?? [];
    // 動作卡太少的話，一輪裡很多人會抽到一樣的（整副抽完才重洗）
    if (actions.length < 20) throw new Error(`${lang} 的 actions 少於 20 個`);
    for (const [key, name] of actions) {
      if (!keys.has(key)) throw new Error(`${lang} 的動作「${name}」沒有插圖（action-art.js 少了 ${key}）`);
    }
  }
}
