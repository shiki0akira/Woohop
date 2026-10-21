/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 先做 zh-TW 試玩，確認後補其他 7 種語言（跟竹筍竹筍蹦蹦出一樣的流程）。補的時候：
 *   - 遊戲名用「電梯」（CONCEPT.md 第四節：國外最接近的是 Big Booty，日韓沒有對應的遊戲）
 *   - 逐句照該語言的說法寫，不要丟翻譯 API
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸、節拍器）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/stairs';

export const STRINGS = {
  'zh-TW': zhTW,
};
