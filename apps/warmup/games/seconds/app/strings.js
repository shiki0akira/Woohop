/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * ⚠️ 2026-11-12 只有繁體中文（老闆確認繁中版之後才補其他 7 語）。外語名照各地的叫法：
 * 這類遊戲在日本叫「10秒チャレンジ」「ピッタリ10秒」，英文常見「10 Second Challenge」「Stop the Clock」，
 * 但它們都固定 10 秒、我們的目標秒數是隨機的，取名時要記得（CONCEPT.md 各語言名稱）。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/seconds';

export const STRINGS = {
  'zh-TW': zhTW,
};
