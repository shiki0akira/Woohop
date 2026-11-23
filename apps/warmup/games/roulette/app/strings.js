/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 2026-11-23 上線 8 語。外語名照各地「俄羅斯輪盤」
 * 的通稱（Russian Roulette、ロシアンルーレット⋯⋯），派對遊戲本來就這樣叫，見 CONCEPT.md 各語言名稱。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import es from './locales/es.js';
import zhCN from './locales/zh-CN.js';

export const LANGS = ['zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/roulette';

export const STRINGS = {
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  de,
  fr,
  es,
  'zh-CN': zhCN,
};
