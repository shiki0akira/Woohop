/*
 * Woohop 全站共用的文案與網址（唯一來源在 apps/homepage/src/locales.mjs，跟首頁、其他遊戲同一份）。
 * 頂欄（GameBar）、頁尾（SiteFooter）、模式切換（ThemeSwitch）用這裡的字，阿瓦隆自己的字在 src/locales/。
 */
import { STRINGS, LANGS, LANG_NAMES } from '../../homepage/src/locales.mjs';

export { LANGS, LANG_NAMES };

export function siteStrings(lang) {
  return STRINGS[lang] || STRINGS['zh-TW'];
}

// 首頁各頁的網址（跟 chrome.mjs 的 local() 一樣）
const PAGES = { home: '', games: 'games/', combo: 'combo/', guides: 'guides/' };
export function sitePath(lang, page) {
  return `/${lang}/${PAGES[page]}`;
}
