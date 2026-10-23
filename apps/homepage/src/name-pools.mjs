/*
 * 抽卡取名的名稱庫（全站共用：game.js 的 Leader.namer）。每個語言一個檔：src/name-pools/{lang}.mjs。
 * 2026-10-21 從竹筍竹筍蹦蹦出（apps/warmup/games/bamboo）搬過來，之後的暖場遊戲都可以用。
 *
 * 每種語言**各自準備當地熟悉的名稱，不是翻譯**：日文放日本人熟的食物（たこやき），
 * 不放「珍珠奶茶」的直譯；卡通角色也挑當地大人小孩都認得的（ja アンパンマン、ko 뽀로로、fr Astérix）。
 *
 * 清單裡的一項可以是：
 *   '滷肉飯'            一個名稱
 *   ['炒飯', '炒麵']    一組聽起來很像的名稱：同一局只會抽到其中一個。
 *                       撞到的時候要喊對方的名字，兩個人叫「炒飯」「炒麵」的話根本喊不清楚
 *
 * 原則：喊得快（中日韓 2～4 個字、拉丁文字 1～3 個音節）；不放政治人物、真實名人。
 * 規則由 checkNames()（build 時）守著：沒有重複、長度不超過上限、每個主題至少 MIN_GROUPS 組。
 */
import zhTW from './name-pools/zh-TW.mjs';
import en from './name-pools/en.mjs';
import ja from './name-pools/ja.mjs';
import ko from './name-pools/ko.mjs';
import de from './name-pools/de.mjs';
import fr from './name-pools/fr.mjs';
import es from './name-pools/es.mjs';
import zhCN from './name-pools/zh-CN.mjs';

const BY_LANG = { 'zh-TW': zhTW, en, ja, ko, de, fr, es, 'zh-CN': zhCN };

// 名稱的長度上限：太長喊不快。中日韓一個字就是一個音節，拉丁文字的字母多得多，上限分開算
const nameMax = (lang) => (/^(zh|ja|ko)/.test(lang) ? 8 : 18);

// 20 個人（首頁標的人數上限）要能各抽到一組，還要留一點給「換一個」
const MIN_GROUPS = 30;

// 主題的順序就是設定畫面上的順序。「隨機」和「用本名」不是名稱庫的主題，在 app.js 裡
export const THEMES = ['food', 'drink', 'animal', 'fruit', 'dessert', 'cartoon'];

// 一項攤平成組：字串也當成只有一個名稱的組，前端不用分兩種情況
export function groupsFor(theme, lang) {
  return BY_LANG[lang][theme].map((item) => (Array.isArray(item) ? item : [item]));
}

/*
 * build 時擋下來的東西：
 * - 少了某個語言、或某個語言少了某個主題（那個語言的取名畫面會是空的）
 * - 同一個主題裡名稱重複（同一局可能抽到兩個一樣的）
 * - 太長（喊不快）
 * - 組數太少（20 個人抽不完）
 */
export function checkNames(langs) {
  for (const lang of langs) {
    if (!BY_LANG[lang]) throw new Error(`name-pools/：少了 ${lang}.js`);
    for (const theme of THEMES) {
      if (!BY_LANG[lang][theme]) throw new Error(`name-pools/${lang}.js 少了主題 ${theme}`);

      const groups = groupsFor(theme, lang);
      if (groups.length < MIN_GROUPS) {
        throw new Error(`name-pools/${lang}.js：${theme} 只有 ${groups.length} 組，至少要 ${MIN_GROUPS} 組`);
      }

      const seen = new Set();
      for (const name of groups.flat()) {
        const key = name.toLowerCase();
        if (seen.has(key)) throw new Error(`name-pools/${lang}.js：${theme} 的「${name}」重複了`);
        seen.add(key);
        if ([...name].length > nameMax(lang)) {
          throw new Error(`name-pools/${lang}.js：${theme} 的「${name}」超過 ${nameMax(lang)} 個字`);
        }
      }
    }
  }
}
