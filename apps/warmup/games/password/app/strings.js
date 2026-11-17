/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * ⚠️ 2026-11-17 只有繁體中文（老闆確認繁中版之後才補其他 7 語）。外語名照各地的叫法：
 * 韓國是「업다운 게임」（猜數字、說 up／down 的同一個遊戲），英文常見「Higher or Lower」「Guess the Number」，
 * 其他語言補的時候再查。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/password';

export const STRINGS = {
  'zh-TW': zhTW,
};
