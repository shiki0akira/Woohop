/*
 * 抽卡取名的名稱庫（全站共用：game.js 的 Leader.namer、桌遊助手的抽卡取名）。
 * 2026-10-21 從竹筍竹筍蹦蹦出搬過來；2026-10-29 名稱併進全站共用題庫 word-bank.mjs（標了 name 的題目），
 * 這裡只負責把題庫轉成取名要的「主題 → 一組一組名稱」，竹筍和小工具都不用改。
 *
 * 每種語言**各自準備當地熟悉的名稱，不是翻譯**：日文放日本人熟的食物（たこやき），
 * 不放「珍珠奶茶」的直譯；卡通角色也挑當地大人小孩都認得的（ja アンパンマン、ko 뽀로로、fr Astérix）。
 * 一組聽起來很像的名稱（word-bank.mjs 的 SIMILAR）同一局只會抽到其中一個。
 * 原則：喊得快；不放政治人物、真實名人。
 */
import { WORDS, SIMILAR, wordsFor } from './word-bank.mjs';

// 20 個人（首頁標的人數上限）要能各抽到一組，還要留一點給「換一個」
const MIN_GROUPS = 30;

// 主題的順序就是設定畫面上的順序。「隨機」和「用本名」不是名稱庫的主題，在 app.js 裡。
// 主題代號沿用原本的（顯示名稱是 locales.mjs 的 themeFood⋯），對到題庫的類型代號
export const THEMES = ['food', 'drink', 'animal', 'fruit', 'dessert', 'cartoon'];
const CATEGORY = { food: 'food', drink: 'drink', animal: 'animals', fruit: 'fruit', dessert: 'dessert', cartoon: 'cartoon' };

// 一個主題的名稱，聽起來很像的併成一組：[[滷肉飯, 魯味], [牛肉麵], ...]
export function groupsFor(theme, lang) {
  const cat = wordsFor(lang, 'name').find(([id]) => id === CATEGORY[theme]);
  const names = cat ? cat[2] : [];
  const inGroup = new Map();
  for (const g of SIMILAR[lang] || []) for (const n of g) inGroup.set(n, g);
  const done = new Set();
  const groups = [];
  for (const n of names) {
    if (done.has(n)) continue;
    const g = (inGroup.get(n) || [n]).filter((x) => names.includes(x));
    g.forEach((x) => done.add(x));
    groups.push(g);
  }
  return groups;
}

// build 時擋下來的東西：少了語言、主題組數太少（20 個人抽不完）。重複、太長由 word-bank.mjs 的 checkWords() 擋
export function checkNames(langs) {
  for (const lang of langs) {
    if (!WORDS[lang]) throw new Error(`word-bank：少了 ${lang}`);
    for (const theme of THEMES) {
      const n = groupsFor(theme, lang).length;
      if (n < MIN_GROUPS) throw new Error(`word-bank：${lang} 能當代號的「${theme}」只有 ${n} 組，至少要 ${MIN_GROUPS} 組`);
    }
  }
}
