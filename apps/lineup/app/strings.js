/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔（照搶答、偷渡畫家的做法）。
 *
 * 2026-11-20 先做繁中，老闆同日試玩確認後補齊 8 語。名字是老闆 11/13 定的「數字默契排排站」，外語名見 CONCEPT.md 第四節：
 * Secret Number Line-Up、Geheime Zahlenreihe、L'échelle secrète、価値観ならべ、이심전심 숫자 줄서기、Fila de números secretos、数字默契排排站。
 * 玩法跟日本桌遊 ito 一樣，但**不能用 ito（繁中商品名《命懸一線》、韓文「마음의 실타래」）的名字與卡面**；
 * 日本把這類叫「価値観ゲーム」，補日文時可以當名稱的依據。
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
export const WORKER_ORIGIN = 'https://woohop-lineup.shiki0akira.workers.dev';

export const BASE_PATH = '/lineup';
export const PROJECT_ID = 'lineup';

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
