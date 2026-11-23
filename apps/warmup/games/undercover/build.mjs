/*
 * 誰是臥底的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-23';

// 每個語言長度要一樣的清單（題目 pairCats 各語言可以不一樣多，在地挑）
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

// 玩法頁的題目範例直接塞 HTML
export const RAW_TOKENS = ['rulesPairsList'];

/*
 * 題目（老闆 11/23）：要相近、但不能是同一種東西（珍奶／奶茶不行，西瓜／哈密瓜可以）。
 * 擋：格式不對、兩個詞一樣、同一組出現兩次（不管順序）、某一類少於 10 組、總數少於 150。
 * 同一個詞出現在兩組是允許的（佐助／鳴人、魯夫／鳴人）
 */
export function check({ LANGS, STRINGS }) {
  for (const lang of LANGS) {
    const seen = new Set();
    let total = 0;
    for (const [cat, pairs] of STRINGS[lang].pairCats) {
      if (!cat || !Array.isArray(pairs)) throw new Error(`${lang} 的題目類型格式不對：${cat}`);
      if (pairs.length < 10) throw new Error(`${lang} 的「${cat}」只有 ${pairs.length} 組`);
      for (const pair of pairs) {
        if (!Array.isArray(pair) || pair.length !== 2 || !pair[0] || !pair[1]) throw new Error(`${lang} 的詞對格式不對：${pair}`);
        if (pair[0] === pair[1]) throw new Error(`${lang} 的詞對兩個詞一樣：${pair[0]}`);
        const key = [...pair].sort().join('|');
        if (seen.has(key)) throw new Error(`${lang} 的「${pair.join('／')}」出現兩次`);
        seen.add(key);
        total += 1;
      }
    }
    if (total < 150) throw new Error(`${lang} 的題目太少（${total}）`);
  }
}

export function gameBar({ page, strings }) {
  // 有揭曉的聲音，頂欄有聲音開關（開場用 CSS 藏起來）；沒有背景配樂。玩法頁沒有聲音
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}

export function tokens({ strings, page, escapeHtml }) {
  if (page.dir !== 'rules') return {};
  // 玩法頁每類只列前兩組當範例：給搜「誰是臥底 題目」的人看，但不把整份題庫公開（老闆 11/23：大家看過就不好玩了）
  return {
    rulesPairsList: strings.pairCats
      .map(([cat, pairs]) => `<li><b>${escapeHtml(cat)}</b>：${pairs.slice(0, 2).map(([a, b]) => `${escapeHtml(a)}／${escapeHtml(b)}`).join('、')}</li>`)
      .join('\n          '),
  };
}
