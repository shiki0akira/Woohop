/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 語言與首頁的 SUPPORTED_LANGS 一致，共 8 種。
 *
 * 上線時先只出 zh-TW 與 en，2026-08-25 補齊其餘 6 種。之所以要謹慎：
 * vibeweb100.com 從 2026-08-06 起被 Google 演算法降權，判斷成因是大量機器翻譯頁面
 * 命中 scaled content abuse 的樣態（首頁當時把語言從 18 縮到 8）。所以**這幾份文案
 * 是逐句照該語言的說法寫的，不是機器直譯**——語言數本身不是問題，薄的機翻內容才是。
 * 之後改文案時請維持這個標準，別為了省事把某一語言丟給翻譯 API 帶過。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼 + LOCALE_LABELS 加名字 +
 * app/questions.js 的每一題補上該語言，其他都自動（hreflang、sitemap、下拉選單）。
 * key 少了或多了、題目漏翻，build 都會直接失敗（scripts/build.js），
 * 不會靜靜產出半空的頁面。
 *
 * 導覽列/頁尾的品牌字（Web100、04_HappyBingo、© 2026 Web100 Series）依
 * ARCHITECTURE.md 第 7 節維持語言中性，不放進 locales。
 */

import zhTW from './locales/zh-TW.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import es from './locales/es.js';
import zhCN from './locales/zh-CN.js';

export const LANGS = ['zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

// 每個語言用自己的名字顯示：使用者要找的是自己看得懂的那一個，
// 翻譯成當前介面語言反而找不到
export const LOCALE_LABELS = {
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  'zh-CN': '简体中文',
};

export const ORIGIN = 'https://www.vibeweb100.com';

// 正式網域上的頁面是首頁的 vercel.json rewrite 代理過來的，而 Vercel 代理外部網址時
// 對 WebSocket 升級的支援不可靠——所以 API 與 WebSocket 一律直連 Worker 自己的網址，
// 只有 HTML/CSS/JS 走代理。本機開發與直接開 workers.dev 時仍然是同源，不受影響。
export const WORKER_ORIGIN = 'https://web100-04-happy-bingo.shiki0akira.workers.dev';

export const BASE_PATH = '/bingo';
export const PROJECT_ID = '04_HappyBingo';

export const STRINGS = {
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  de,
  fr,
  es,
  'zh-CN': zhCN,
};
