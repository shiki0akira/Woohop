/*
 * 語言設定與文案的匯總點。實際文案在 app/locales/{lang}.js，一個語言一個檔；題目在 app/pairs.js（8 語一張表）。
 *
 * 2026-11-23 上線 8 語。外語名照各地同樣玩法的叫法（CONCEPT.md 各語言名稱）：
 * 日文ワードウルフ、韓文스파이 게임（라이어 게임是騙子不知道詞，規則不同）、英文 Who’s the Undercover?、
 * 德文 Wer ist der Spion?、法文 Qui est l’infiltré ?、西文 ¿Quién es el infiltrado?（Impostor 是不知道詞，規則不同）。
 *
 * 加語言 = locales/ 加一個檔 + LANGS 加代碼 + pairs.js 每一行加一格；共用文字（步驟頭）在 apps/homepage/src/locales.mjs。
 */

import zhTW from './locales/zh-TW.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import es from './locales/es.js';
import zhCN from './locales/zh-CN.js';
import { pairCatsFor } from './pairs.js';

export const LANGS = ['zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'zh-CN'];
export const DEFAULT_LANG = 'zh-TW';

export const ORIGIN = 'https://www.vibeweb100.com';
export const BASE_PATH = '/undercover';

const LOCALES = { 'zh-TW': zhTW, en, ja, ko, de, fr, es, 'zh-CN': zhCN };

// 每個語言的文案＋這個語言的題目（pairCats）
export const STRINGS = Object.fromEntries(
  LANGS.map((lang) => [lang, { ...LOCALES[lang], pairCats: pairCatsFor(lang) }]),
);
