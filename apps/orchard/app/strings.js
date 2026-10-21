/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 先做 zh-TW 試玩，確認後補其他 7 種語言（跟竹筍、上樓下樓一樣的流程）。補的時候：
 *   - 遊戲名用當地類似的遊戲（CONCEPT.md 第四節：英文 Concentration、日文古今東西ゲーム）
 *   - 主題清單各語言自己挑當地熟悉的（topics 可以不一樣多），逐句照該語言的說法寫，不要丟翻譯 API
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭、拉霸、節拍器）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/orchard';

export const STRINGS = {
  'zh-TW': zhTW,
};
