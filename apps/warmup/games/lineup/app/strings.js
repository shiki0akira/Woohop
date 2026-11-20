/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * ⚠️ 2026-11-20 只有繁體中文（老闆確認繁中版之後才補其他 7 語）。名字是老闆 11/13 定的「數字默契排排站」。
 * 玩法跟日本桌遊 ito 一樣，但**不能用 ito（繁中商品名《命懸一線》、韓文「마음의 실타래」）的名字與卡面**；
 * 日本把這類叫「価値観ゲーム」，補日文時可以當名稱的依據。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/lineup';

export const STRINGS = {
  'zh-TW': zhTW,
};
