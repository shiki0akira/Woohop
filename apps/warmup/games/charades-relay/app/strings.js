/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 2026-11-02 先只做繁體中文（老闆 11/02 定的流程：新遊戲先做 zh-TW，確認後才另外交代翻譯）。
 * 加語言 = locales/ 加一個檔、這裡 import 並加進 LANGS 與 STRINGS；key 跟清單長度要跟 zh-TW 一樣（build 會擋）。
 * 題庫（比手畫腳的 act 類）是全站共用的 apps/homepage/src/word-bank.mjs，各語言已經有了，不用另外準備。
 * 共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/charades-relay';

export const STRINGS = {
  'zh-TW': zhTW,
};
