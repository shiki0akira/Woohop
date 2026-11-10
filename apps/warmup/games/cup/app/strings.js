/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 8 種語言（2026-11-09 上線時補齊）。遊戲名各語言不同，都是當地形容「滿到杯緣」的說法、
 * 不直譯（名稱與理由在 CONCEPT.md 第四節）；八種容器也用當地對那個容器的日常說法。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸）在 apps/homepage/src/locales.mjs。
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
export const BASE_PATH = '/cup';

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
