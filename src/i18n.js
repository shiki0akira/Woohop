import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import vi from './locales/vi.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import cs from './locales/cs.json';
import sv from './locales/sv.json';
import th from './locales/th.json';
import id from './locales/id.json';
import es from './locales/es.json';
import zhCN from './locales/zh-CN.json';

export const supportedLangs = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'pl', 'ru', 'vi', 'pt', 'it', 'nl', 'cs', 'sv', 'th', 'id', 'es', 'zh-CN'];
export const defaultLang = 'zh-TW';

// 這個專案在網域底下的固定路徑前綴。網址結構固定為 /avalon/{lang}/...
// （遊戲名稱在前、語言在後），這樣未來 Cloudflare Worker 的路由總機
// 只要看路徑第一段是不是已知的遊戲代碼就能決定轉發去哪，不用管語言有幾種。
export const gameSlug = 'avalon';

export const localeLabels = {
  'zh-TW': '繁體中文',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  pl: 'Polski',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  cs: 'Čeština',
  sv: 'Svenska',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  es: 'Español',
  'zh-CN': '简体中文',
};

export const localeData = {
  'zh-TW': zhTW,
  en,
  de,
  fr,
  ja,
  ko,
  pl,
  ru,
  vi,
  pt,
  it,
  nl,
  cs,
  sv,
  th,
  id,
  es,
  'zh-CN': zhCN,
};

const resources = Object.fromEntries(
  Object.entries(localeData).map(([lang, data]) => [lang, { translation: data }]),
);

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: defaultLang,
  interpolation: { escapeValue: false },
  returnObjects: true,
});

export function normalizeLang(lang) {
  return supportedLangs.includes(lang) ? lang : defaultLang;
}

// 網域共用的語言 cookie：使用者手動切換語言時寫入，
// 之後 Cloudflare Worker 判斷語言時，這個 cookie 的優先權 > IP 地區猜測。
// path=/ 讓網域下所有專案（包含首頁、其他遊戲）都能讀到同一個 cookie。
const LANG_COOKIE_NAME = 'web100_lang';

export function persistLangPreference(lang) {
  if (typeof document === 'undefined') return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LANG_COOKIE_NAME}=${lang}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

export function getPathSuffix(pathname) {
  // 從 /avalon/{lang}/xxx 中移除 /avalon/{lang} 前綴，回傳 /xxx（沒有子路徑時回傳空字串）
  const langPattern = supportedLangs.join('|');
  const re = new RegExp(`^/${gameSlug}/(?:${langPattern})(?=/|$)`);
  return pathname.replace(re, '');
}

export function buildCanonical(lang, pathname) {
  return `${window.location.origin}/${gameSlug}/${lang}${getPathSuffix(pathname)}`.replace(/\/$/, '');
}

export function applySeo(lang, pathname) {
  const { title, description, ogTitle, ogDescription } = localeData[lang].seo;
  const canonical = buildCanonical(lang, pathname);
  document.title = title;

  const ensureTag = (selector, create) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = create();
      document.head.appendChild(el);
    }
    return el;
  };

  ensureTag('meta[name="description"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'description';
    return meta;
  }).content = description;

  ensureTag('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    return link;
  }).href = canonical;

  const setMeta = (property, content) => {
    ensureTag(`meta[property="${property}"]`, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      return meta;
    }).content = content;
  };

  setMeta('og:title', ogTitle || title);
  setMeta('og:description', ogDescription || description);
  setMeta('og:type', 'website');
  setMeta('og:url', canonical);

  supportedLangs.forEach((code) => {
    ensureTag(`link[rel="alternate"][hreflang="${code}"]`, () => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      return link;
    }).href = `${window.location.origin}/${gameSlug}/${code}${getPathSuffix(pathname)}`.replace(/\/$/, '');
  });
}

export default i18n;
