/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔。
 *
 * 2026-11-03 先做繁體中文，老闆試玩確認後同日補齊 8 種語言。遊戲名用當地的叫法（CONCEPT.md 第四節）：
 * Picture Telephone、お絵かき伝言ゲーム、그림 릴레이、Bilder-Stille-Post、Téléphone dessiné、Dibujos en cadena、你画我猜接力。
 * 加語言 = locales/ 加一個檔、這裡 import 並加進 LANGS 與 STRINGS；key 跟清單長度要跟 zh-TW 一樣（build 會擋）。
 * 題庫（draw 用途）是全站共用的 apps/homepage/src/word-bank.mjs，各語言已經有了，不用另外準備。
 * 共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
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
export const BASE_PATH = '/drawing-relay';

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
