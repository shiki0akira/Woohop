/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 先只有繁中（2026-10-23）：玩法還在試，確定好玩再照其他遊戲補齊 8 種語言。
 * 題庫（prompts）各語言自己挑當地熟悉的詞，不要丟翻譯 API。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/reverse';

export const STRINGS = {
  'zh-TW': zhTW,
};
