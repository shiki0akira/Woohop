/*
 * 竹筍竹筍蹦蹦出的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// 抽卡取名的名稱庫（全站共用，game.js 的 Leader.namer 用）
import { THEMES, groupsFor, checkNames } from '../../../homepage/src/name-pools.mjs';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-10-20';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'chant', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps'];

export const RAW_TOKENS = ['namesJson'];

export function check({ LANGS, SITE_STRINGS }) {
  checkNames(LANGS);

  // 主題名稱是「theme + 首字大寫」組出來的（themeFood⋯），放在全站共用文字（src/locales.mjs）；漏一個設定畫面那顆按鈕就沒有標題
  for (const theme of THEMES) {
    const key = `theme${theme[0].toUpperCase()}${theme.slice(1)}`;
    for (const lang of LANGS) {
      if (!SITE_STRINGS[lang][key]) throw new Error(`apps/homepage/src/locales.mjs 的 ${lang} 少了主題名稱 ${key}`);
    }
  }
}

export function gameBar({ page, strings }) {
  return {
    // 沒有「設定」分頁；音樂開關在遊戲頁的頂欄（玩的時候也在），見 CONCEPT.md 3.3
    // 玩法頁沒有配樂，不放音樂開關（使用者要求）
    musicLabel: page.dir === 'rules' ? '' : strings.musicLabel,
  };
}

export function tokens({ lang, SITE_STRINGS, toScriptJson }) {
  return {
    // 選主題的標題是全站共用文字（src/locales.mjs，Leader.themes 也用）
    themeHeading: SITE_STRINGS[lang].themeHeading,
    // 名稱庫只內嵌這個語言的：一份頁面只有一種語言
    namesJson: toScriptJson({
      themes: THEMES,
      groups: Object.fromEntries(THEMES.map((theme) => [theme, groupsFor(theme, lang)])),
    }),
  };
}
