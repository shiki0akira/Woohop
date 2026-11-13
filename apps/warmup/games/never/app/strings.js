/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * ⚠️ 2026-11-13 只有繁體中文（老闆確認繁中版之後才補其他 7 語）。外語名照各地的叫法：
 * 英文是現成的 Never Have I Ever，韓國是「손병호 게임」（折手指的玩法一模一樣），其他語言補的時候再查。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/never';

export const STRINGS = {
  'zh-TW': zhTW,
};
