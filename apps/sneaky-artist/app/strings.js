/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔（照搶答的做法）。
 *
 * 2026-11-04 先做繁體中文，老闆試玩確認後同日補齊 8 種語言。遊戲名用當地的說法（CONCEPT.md 第五節）：
 * Sneaky Doodle、Geheimzeichner、Dessin en douce、こっそり画家、몰래 화가、Dibujo infiltrado、偷渡画家。
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼 + LOCALE_LABELS 加名字，src/worker.js 的 LANGS 也要加。
 * key 少了或多了 build 會直接失敗（scripts/build.js 的 checkStrings）。
 * 祕密題目是全站共用的 apps/homepage/src/word-bank.mjs（伺服器發），主題（themes）要各語言自己寫。
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
export const WORKER_ORIGIN = 'https://woohop-sneaky-artist.shiki0akira.workers.dev';

export const BASE_PATH = '/sneaky-artist';
export const PROJECT_ID = 'sneaky-artist';

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
