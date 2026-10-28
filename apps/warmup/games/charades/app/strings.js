/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 先只有繁中（2026-10-28）。補語言時遊戲名用當地類似的遊戲（CONCEPT.md 第五節），題庫（words）
 * 各語言自己挑當地熟悉、比得出來的詞，不是翻譯；逐句照該語言的說法寫，不要丟翻譯 API。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/charades';

export const STRINGS = {
  'zh-TW': zhTW,
};
