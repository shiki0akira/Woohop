/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 2026-11-12 先做繁中，老闆試玩確認後同日補齊 8 語。遊戲名照各地的叫法（CONCEPT.md 第四節）：
 * Stop the Clock、Sekunden-Challenge、Défi chrono、ピタ止めチャレンジ、초시계 챌린지、Para el cronómetro、秒数挑战。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼；共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';
import zhCN from './locales/zh-CN.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import es from './locales/es.js';

export const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/seconds';

export const STRINGS = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  de,
  fr,
  es,
};
