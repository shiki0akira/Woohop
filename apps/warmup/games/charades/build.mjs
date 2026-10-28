/*
 * 比手畫腳的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-28';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export function check({ LANGS, STRINGS, DEFAULT_LANG }) {
  // 題目類型的代號各語言要一樣（存在手機上的設定是代號），每類至少 25 題
  const ref = STRINGS[DEFAULT_LANG].categories.map(([id]) => id).join();
  for (const lang of LANGS) {
    const cats = STRINGS[lang].categories;
    if (cats.map(([id]) => id).join() !== ref) throw new Error(`${lang} 的題目類型代號跟 ${DEFAULT_LANG} 不一樣`);
    for (const [id, , words] of cats) {
      if (words.length < 25) throw new Error(`${lang} 的 ${id} 只有 ${words.length} 題，至少要 25 題`);
      if (new Set(words).size !== words.length) throw new Error(`${lang} 的 ${id} 有重複的題目`);
    }
  }
}

export function gameBar() {
  // 沒有聲音（不計時了）、沒有設定分頁（開場就能選）
  return { musicLabel: '' };
}
