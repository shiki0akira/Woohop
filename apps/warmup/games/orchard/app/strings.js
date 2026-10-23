/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 8 種語言（2026-10-22）。遊戲名用當地類似的遊戲（CONCEPT.md 第四節），開局口令（chant）與主題清單（topics）
 * 各語言自己挑當地熟悉的（topics 可以不一樣多），逐句照該語言的說法寫，不要丟翻譯 API。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸、節拍器）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';
import zhCN from './locales/zh-CN.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import es from './locales/es.js';

export const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/orchard';

export const STRINGS = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  de,
  fr,
  es,
};
