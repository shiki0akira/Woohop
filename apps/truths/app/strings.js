/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔（照搶答、偷渡畫家的做法）。
 *
 * 2026-11-11 先做繁中，老闆 11/12 試玩確認後補齊 8 語。遊戲名用當地的說法（CONCEPT.md 第七節）：
 * Two Truths and a Lie、Zwei Wahrheiten, eine Lüge、Deux vérités, un mensonge、2つの真実と1つの嘘、진진가、Dos verdades y una mentira、两真一假。
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼，src/worker.js 的 LANGS 也要加。
 * key 少了或多了 build 會直接失敗（scripts/build.js 的 checkStrings）。主題庫 topics 各語言自己寫、不用一樣多。
 */

import zhTW from './locales/zh-TW.js';
import en from './locales/en.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import es from './locales/es.js';
import zhCN from './locales/zh-CN.js';

export const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

export const LOCALE_LABELS = {
  'zh-TW': '繁體中文',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  'zh-CN': '简体中文',
};

export const ORIGIN = 'https://www.vibeweb100.com';

// 跟搶答一樣：正式網域的頁面由 Vercel 代理，API 與 WebSocket 直連 Worker 自己的網址
export const WORKER_ORIGIN = 'https://woohop-truths.shiki0akira.workers.dev';

export const BASE_PATH = '/truths';
export const PROJECT_ID = 'truths';

export const STRINGS = {
  'zh-TW': zhTW,
  en,
  de,
  fr,
  ja,
  ko,
  es,
  'zh-CN': zhCN,
};
