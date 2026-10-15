/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔
 * （跟阿瓦隆的 src/locales/ 一樣，塞在同一個檔案裡 8 種語言會難改到不行）。
 *
 * 語言清單跟 web100_00_Homepage 的 SUPPORTED_LANGS 一致。首頁在 2026/8 把
 * 語言從 18 種縮到 8 種，補語言時對照首頁現在的清單，不要照舊的 18 種。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼 + LOCALE_LABELS 加名字。
 * key 少了或多了 build 會直接失敗（scripts/build.js 的 checkStrings），
 * 不會靜靜產出半空的頁面。
 *
 * 導覽列/頁尾的品牌字（Web100、02_BuzzerGame、© 2026 Web100 Series）依
 * ARCHITECTURE.md 第 7 節維持語言中性，不放進 locales。
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

// 每個語言用自己的名字顯示（跟阿瓦隆的 localeLabels 一樣）：
// 使用者要找的是自己看得懂的那一個，翻譯成當前介面語言反而找不到
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

// 正式網域上的頁面是首頁的 vercel.json rewrite 代理過來的，而 Vercel 代理外部網址時
// 對 WebSocket 升級的支援不可靠——所以 API 與 WebSocket 一律直連 Worker 自己的網址，
// 只有 HTML/CSS/JS 走代理。本機開發與直接開 workers.dev 時仍然是同源，不受影響。
// 之後改由 Cloudflare Worker 路由總機接管正式網域時，這一條就可以拿掉。
export const WORKER_ORIGIN = 'https://web100-02-buzzer-game.shiki0akira.workers.dev';

export const BASE_PATH = '/buzzer';
export const PROJECT_ID = '02_BuzzerGame';

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
