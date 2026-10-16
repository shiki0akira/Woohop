# apps/homepage（Woohop 首頁）

Woohop 的網站首頁。純 HTML/CSS/JS、沒有框架，部署在 Vercel（push 到 main 自動部署），綁定正式網域 `www.vibeweb100.com`。2026-10 改版成 Woohop 的新設計，視覺規則以 `design/brand-exploration.html`（設計系統頁）為準。

## 結構

| 位置 | 內容 |
|---|---|
| `src/locales.mjs` | **8 種語言的全部文案**（唯一來源）。遊戲名稱與短介紹跟各遊戲頁的用語一致；`homeArticle` 長文只有 zh-TW |
| `scripts/prerender.js` | 建置：為 8 語言 × 3 頁產生 `dist/{lang}/`、`dist/{lang}/games/`、`dist/{lang}/combo/`，含 title、description、canonical、hreflang、og、結構化資料、sitemap |
| `assets/woohop.css`、`assets/woohop-art.js`、`assets/hero-art.js` | 從 `design/` 複製的設計系統樣式與插圖（**兩邊要同步改**） |
| `assets/site.css`、`assets/site.js` | 三頁共用的頁面樣式與程式（導覽、語言選單、遊戲卡、推薦器、破冰組合、GA） |
| `assets/home.js`、`games.js`、`combo.js` | 各頁專用 |
| `design-tokens.css` | **舊的配色檔，四個小遊戲還直接連 `/design-tokens.css`，不能刪**；遊戲頁改版完才能拿掉 |

文案在建置時寫進靜態 HTML（給爬蟲），當頁語言的那一份也嵌進 `window.WOOHOP.t` 給執行期 JS 用，兩邊同一個來源。改了 `assets/` 的檔案要換 `prerender.js` 的 `ASSET_VERSION`，瀏覽器才會抓新版。

本機預覽：`node scripts/prerender.js` 之後用 launch.json 的 `homepage-preview`（伺服器開在 `dist/`）。

## SEO 要守的

- 網址不變：`/{lang}/` 是舊網址；`/games/`、`/combo/` 是改版新增的
- 網站名稱 `Woohop`，結構化資料的 `alternateName` 保留 `Web100`
- 幸福模擬器不是遊戲（獨立專案），只出現在首頁專區與頁尾，不進遊戲清單與結構化資料的 ItemList
- 中文長文不硬翻成其他語言（2026/8 降權的成因）

## 加新遊戲時要改的地方

1. `src/locales.mjs` 每個語言的 `games` 加上名稱與短介紹
2. `assets/site.js` 的 `GAMES` 加一筆（人數、時間、手機、目的、代表色）；`prerender.js` 的 `GAME_KEYS` 加上它，才會進靜態清單與結構化資料
3. 插圖加在 `design/brand-exploration.html` 的 `art`，再同步到 `assets/woohop-art.js`
4. `vercel.json` 的 `rewrites` 加該遊戲的代理規則：**列白名單、不要 `/xxx/:path*` 全收**，並排在語言萬用規則之前（理由見 `docs/ARCHITECTURE.md` 3.1）

## 語言判斷

- 網址帶語言 → 直接用，並寫進 `localStorage['web100-lang']` 和 `web100_lang` cookie（`path=/`，全站共用，名稱不要改）
- `/` 沒帶語言 → `vercel.json` 先轉到 `/zh-TW/`；JS 那邊也會依上次選的語言轉（保險）
- 語言選單是一般連結，換語言就是換到另一個語言的同一頁
