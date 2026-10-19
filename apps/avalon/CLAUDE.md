# web100_01_Avalon-Voice

阿瓦隆桌遊的語音主持工具，Woohop 系列第一個專案。這個 repo **只負責阿瓦隆語音本身**，不含首頁（首頁在同一個 monorepo 的 `apps/homepage`）。

## 整體架構

完整架構規劃見 monorepo 的 `docs/ARCHITECTURE.md`（子路徑策略、Cloudflare Worker 路由總機、repo 命名慣例、共用 design tokens）。這裡只記錄跟這個專案直接相關的事。

## 配色 / UI

2026-10 改版成 Woohop 新設計（跟其他四個遊戲同一套），**UI 一律先用設計系統的元件**（`design/brand-exploration.html`）。不再用 Tailwind。

- 樣式：`src/main.jsx` 直接匯入 `apps/homepage/assets` 的 `woohop.css`（元件與色票）、`site.css`（頁尾、選單）、`game.css`（遊戲內頂欄、單欄 720px 版型）、`woohop-art.js`（圖示 sprite）。唯一來源在首頁，**改了那幾個檔，阿瓦隆也要重新 build、部署**。`src/index.css` 只排阿瓦隆自己的東西
- 全站文案（頂欄選單、頁尾、模式切換）來自 `apps/homepage/src/locales.mjs`（`src/woohop.js` 包一層）；阿瓦隆自己的字還是在 `src/locales/`
- 頂欄 `GameBar.jsx`、頁尾 `SiteFooter.jsx` 是 `chrome.mjs` 的 gameBar()／footer() 的 React 版，結構與 class 要跟它一樣（行為照 game.js：返回、規則分頁、手機選單面板）
- **淺色／深色模式**：頁尾的 `ThemeSwitch`（跟隨系統／淺色／深色），預設跟隨裝置、選過記在 `web100-theme`。生效的是 `<html data-theme>`，設計系統的深色色票掛在 `[data-theme="dark"]`。`index.html` 的 `<head>` 先決定一次（不會閃一下淺色），之後由 `ThemeContext` 切換。**顏色一律用設計系統的變數，不要寫死**，深色才會跟著換
- 元件：人數 `.stepper`、角色 `.chip`（梅林、刺客、莫甘娜鎖住）、好人／壞人 `.badge`、開始 `.btn-lg.btn-solid`、語速 `.seg`、旁白台詞 `.prompt-card`（照著念）
- 開發伺服器（`npm run dev`）直接開 `/avalon/de` 這類非中文網址時，頁面文字可能停在中文（React 開發模式的 StrictMode 會讓 effect 跑兩次）；正式 build（`npm run build` 後的 dist）是對的，判斷前先用 build 版確認

## 網址結構

`/avalon/{lang}/...`，遊戲代號在前、語言在後（例如 `/avalon/zh-TW/game`）。這個順序是全系列的規則，不要改回語言在前。

- 8 種語言，代碼定義在 `src/i18n.js` 的 `supportedLangs`
- 語言驗證/normalize、canonical、hreflang 都靠 `src/i18n.js` 裡的工具函式，改路由前先看這支檔案

## 部署

- Vercel 專案，綁 `web100-01-avalon-voice.vercel.app`
- `vercel.json` 用正規表示式 `:lang(zh-TW|en|...)` 限定語言代碼，不要改回一條條列舉語言（維護成本太高）
- 目前透過 `web100_00_Homepage` 的 `vercel.json` rewrite 暫時代理接到正式網域 `www.vibeweb100.com/avalon/*`，之後會改由 Cloudflare Worker 接管

## SEO / GA4 現況

- GA4 測量 ID：`G-S7PE5687BG`，裝在 `index.html`，`send_page_view: false`，改由 `src/App.jsx` 的 `LangLayout` 在路由/語言切換時手動送出 `page_view`（SPA 路由變化不會自動觸發，這是特別處理過的部分，不要移除）
- 語言切換時會寫入 `web100_lang` cookie（`persistLangPreference`，在 `src/i18n.js`），這是給未來 Cloudflare Worker 判斷語言優先權用的，全站共用，不要改 cookie 名稱
- 各語言的 SEO title/description 在 `src/locales/{lang}.json` 的 `seo` 欄位，zh-TW/en/ja/ko/zh-CN 已經有做關鍵字優化，其餘語言是基本翻譯
- **預渲染是必要的，不能拿掉**：`scripts/prerender.js` 透過 Vite 的 `ssrLoadModule` 載入 `src/entry-server.jsx`，用 `renderToStaticMarkup` 把**真正的元件**渲染成靜態 HTML。沒有這道流程的話，8 種語言會共用同一份中文 title 且 `#root` 是空的
- 預渲染用的是真元件而不是手抄 HTML 字串。以前是手抄，元件改了 class 但腳本沒同步，畫面就會在 React 掛載時閃一下（發生過兩次）。要動預渲染時**不要退回手抄字串**
- 元件裡任何在 **render 當下**（不是 effect/callback 裡）碰到瀏覽器 API 的地方都要加 `typeof window/Audio !== 'undefined'` 守衛，否則預渲染會在 Node 裡爆掉。目前有兩處：`src/hooks/useSpeech.js` 的 `supported`、`src/pages/Game.jsx` 的 `audioRef` 初始化
- `src/pages/Game.jsx` 沒有 `location.state` 時要退回預設人數的建議配置。直接開 `/avalon/{lang}/game` 會走這條路，退回空陣列的話畫面台詞是空的、但預渲染的 HTML 有台詞，兩邊對不上就是 cloaking

## 常見任務起手式

- 改 UI/文案：看 `src/pages/`、`src/components/`
- 改語言相關邏輯：先看 `src/i18n.js`
- 改路由結構：`src/App.jsx`，記得网址順序是 avalon 在前
- 改建置流程：`scripts/postbuild.js`（把 build 結果搬進 `dist/avalon/`）、`vite.config.js`（`base: '/avalon/'`）
