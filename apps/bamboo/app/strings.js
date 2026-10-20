/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * **目前只有 zh-TW。** 2026-10-20 使用者說「一個一個來」，先做繁中版試玩、把玩法定下來，
 * 其他 7 種語言之後再加。加的時候：
 *   - 遊戲名用**當地類似遊戲的名稱，不直譯**（CONCEPT.md 第五節：ja たけのこニョッキ、ko 눈치게임⋯）
 *   - 名稱庫（app/names.js）每種語言各自準備當地熟悉的名稱，不是翻譯
 *   - 逐句照該語言的說法寫，不要丟翻譯 API（2026-08 被演算法降權的教訓，見 apps/bomb/app/strings.js）
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼 + names.js 每個主題補上該語言，
 * 其他都自動（hreflang、sitemap、語言選單）。漏了 key 或名稱庫，build 會直接失敗。
 */

import zhTW from './locales/zh-TW.js';

export const LANGS = ['zh-TW'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/bamboo';

export const STRINGS = {
  'zh-TW': zhTW,
};
