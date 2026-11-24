// 帶領指南的文章（8 語）。網址 /{lang}/guides/{slug}/，scripts/prerender.js 的 articlePage 依這裡產生靜態 HTML、放進 sitemap（互相帶 hreflang）。
//
// 每篇文章一個 slug（8 語共用），每個語言一個內容檔 src/guides/{slug}.{lang}.mjs。
// 外語版不是逐句翻譯：遊戲名稱、口令、例子都照該語言遊戲頁的說法（例如英文的竹筍是 Pop-Up Count、喊「Green light!」），
// 寫之前先讀 apps/warmup/dist/{遊戲}/{lang}/rules/ 的玩法頁（守的是翻譯品質，2026-08 降權的教訓）。
//
// 新增一篇：ARTICLES 加一筆、寫各語言內容檔 → vercel.json 三條 /:lang/guides/:slug(...) 白名單加上 slug →
// locales.mjs 各語言的 guides／moreGuides 放這個 slug 字串（卡片的標題、說明、幾分鐘讀完從內容檔拿）。建置時會檢查三邊對得上。
//
// 內容檔欄位：min（幾分鐘讀完）、title／desc（列表卡片）、h1、seoTitle、seoDesc、lead（開頭段落）、blocks。
// blocks 一個區塊一種型別：
//   { h2 }                     小標（右側章節列表會列出來）
//   { p: '…' }                 段落；**粗體**、[文字](game:代號)、[文字](page:combo)、[文字](guide:另一篇的slug) 會轉成連結（網址自動帶當頁語言）
//   { ul: ['…', …] }           條列
//   { table: { head, rows } }  表格：每列第一格放遊戲代號，自動換成該語言的遊戲名＋連結
//   { game, need, p: [], tip } 一個遊戲：標題（該語言遊戲名）連到遊戲頁，人數／時間／準備、說明、帶的時候的小撇步，最後一塊連結
//   { faq: [[問, 答], …] }     常見問題（也輸出 FAQPage 結構化資料）

import { LANGS } from './locales.mjs';

// 還沒寫的語言就沒有內容檔：那個語言不產生頁面、不進 sitemap／hreflang（新文章先寫繁中，老闆確認後再補其他語言）
import { existsSync } from 'node:fs';
const load = async (slug) => Object.fromEntries(await Promise.all(LANGS
  .filter((l) => existsSync(new URL(`./guides/${slug}.${l}.mjs`, import.meta.url)))
  .map(async (l) => [l, (await import(`./guides/${slug}.${l}.mjs`)).default])));

// 情境主圖：依文章主題畫在 woohop-art.js 的 guideScene（鍵是 slug，新文章要畫一張）；color：主圖底色（淡淡一層）
// 分享縮圖：node scripts/og-image.mjs guide:{slug} → og/guides/{slug}/{lang}.png（有這個檔案，文章頁的 og:image 才會用它）
export const ARTICLES = [
  { slug: 'no-props-indoor-icebreakers', type: 'scene', published: '2026-11-23', updated: '2026-11-23', color: '#4FB59A', langs: await load('no-props-indoor-icebreakers') },
  { slug: 'big-group-icebreakers', type: 'scene', published: '2026-11-23', updated: '2026-11-23', color: '#FF9419', langs: await load('big-group-icebreakers') },
];

export const articleBySlug = (slug) => ARTICLES.find((a) => a.slug === slug);

// 文章頁的介面文字：tip＝遊戲小撇步的開頭、updated＝「更新於」、toc／count＝章節列表標題與段數、tocLabel＝章節列表的無障礙名稱
export const GUIDE_UI = {
  'zh-TW': { tip: '帶的時候：', updated: '更新於', toc: '這篇有什麼', count: '{n} 段', tocLabel: '目錄' },
  'zh-CN': { tip: '带的时候：', updated: '更新于', toc: '这篇有什么', count: '{n} 段', tocLabel: '目录' },
  en: { tip: 'Leading it: ', updated: 'Updated', toc: 'In this guide', count: '{n} sections', tocLabel: 'Contents' },
  de: { tip: 'Beim Anleiten: ', updated: 'Aktualisiert am', toc: 'In dieser Anleitung', count: '{n} Abschnitte', tocLabel: 'Inhalt' },
  fr: { tip: 'Pour animer : ', updated: 'Mis à jour le', toc: 'Dans ce guide', count: '{n} parties', tocLabel: 'Sommaire' },
  es: { tip: 'Al dirigirlo: ', updated: 'Actualizado el', toc: 'En esta guía', count: '{n} secciones', tocLabel: 'Índice' },
  ja: { tip: '進行のコツ：', updated: '更新日', toc: 'この記事の内容', count: '{n} 項目', tocLabel: '目次' },
  ko: { tip: '진행 팁: ', updated: '업데이트', toc: '이 글의 내용', count: '{n}개 항목', tocLabel: '목차' },
};
