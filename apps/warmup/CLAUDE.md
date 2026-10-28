# 暖場遊戲（apps/warmup）

一支手機或不用手機的暖場遊戲，全部放在這個專案：一次建置、部署成同一個 assets-only Worker（`woohop-warmup`）。2026-10-23 由原本各自獨立的 `apps/bomb`、`bamboo`、`stairs`、`orchard` 合併而來（`docs/roadmap.md` 的方案 A），網址不變。

| 遊戲 | 資料夾 | 網址 |
|---|---|---|
| 定時炸彈 | `games/bomb` | `/bomb/{lang}/` |
| 竹筍竹筍蹦蹦出 | `games/bamboo` | `/bamboo/{lang}/` |
| 上樓下樓 | `games/stairs` | `/stairs/{lang}/` |
| 果園菜園動物園 | `games/orchard` | `/orchard/{lang}/` |
| 倒放猜猜看 | `games/reverse` | `/reverse/{lang}/` |
| 木頭人動作版 | `games/statue` | `/statue/{lang}/` |
| 比手畫腳 | `games/charades` | `/charades/{lang}/` |

房間型的搶答、喜好二選一、幸福賓果（有 Durable Object）不在這裡，各自獨立。

## 結構

- `scripts/build.js`：**所有遊戲共用的建置流程**。每個遊戲 × 8 語言 × 遊戲頁／玩法頁產生靜態 HTML，加上語言轉址頁、sitemap，輸出到 `dist/{遊戲}/`
- `shared/`：所有遊戲共用的 `redirect.html`（沒帶語言的轉址頁）、`header.js`（手動送 page_view）、`partials/`（head／導覽列／頁尾）
- `games/{遊戲}/`：
  - `build.mjs`：**這個遊戲跟別人不一樣的建置設定**——`CONTENT_UPDATED`（sitemap 日期，內容真的有變才改）、`LIST_KEYS`（各語言長度要一樣的清單）、`RAW_TOKENS`、`check()`（額外檢查）、`gameBar()`（頂欄選項：音樂／聲音開關、設定分頁）、`tokens()`（題庫、名稱庫等額外樣板值）
  - `app/`：`app.js`、`app.css`、`template.html`（遊戲頁）、`rules.html`（玩法頁）、`strings.js`＋`locales/`（文案）
  - `public/`：favicon、og 縮圖，原樣複製到 `dist/{遊戲}/`
  - `CLAUDE.md`、`CONCEPT.md`：這個遊戲的程式重點與設計決策
- 全站共用的導覽列、頁尾、樣式、`window.Leader` 帶領元件都在 `apps/homepage`，build 時複製進 `dist/{遊戲}/woohop/`

## 指令

```bash
npm install
npm run build          # 建全部；node scripts/build.js bamboo 只建一個
npm test               # games/*/test/*.test.js
npm run deploy         # build + wrangler deploy（一次部署全部暖場遊戲）
```

本機預覽：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/bamboo/zh-TW/` 這種網址。⚠️ `wrangler dev` 開著時 build 出新的資料夾（新遊戲、新語言）它不會看到、回 404，要重開。

**首頁改了 `chrome.mjs` 或 `assets/` 的共用檔，這裡 `npm run deploy` 一次就全部跟上**（以前要四個專案各部署一次）。

## 加一個新的暖場遊戲

1. 複製最像的那個遊戲資料夾成 `games/{新代號}/`（不用道具、照著帶的照抄 `orchard` 或 `stairs`），改 `app/strings.js` 的 `BASE_PATH`、文案、`app.js`、`build.mjs`
   - **步驟頭（`Leader.lead`）什麼時候放**：手機在主持人手上、主持人對大家說話的那一步才放；手機在大家手上傳、或各自操作的那一步不放（locale 的 `lead` 不寫那一步、畫面不放 `.lead-slot`，例：`bomb`、`reverse` 的 play）。規則寫在設計系統頁「13. 帶領元件」
2. `node scripts/build.js {新代號}` 會自動找到它（`games/` 底下有 `build.mjs` 的資料夾就是一個遊戲）
3. 首頁 `apps/homepage/vercel.json`：在 `:game(bomb|bamboo|stairs|orchard)` 白名單加上新代號，再加一條 `/{新代號}-sitemap.xml`；`robots.txt` 加 sitemap
4. 首頁的遊戲清單照 `apps/homepage/CLAUDE.md` 的「加新遊戲時要改的地方」
5. 分享縮圖：`apps/homepage/scripts/og-image.mjs` 的 `TARGETS` 加一筆，跑 `node scripts/og-image.mjs {新代號}`
6. `npm run deploy`，再 push 首頁

## 部署與線上網址

- Worker：`woohop-warmup.shiki0akira.workers.dev`，首頁 `vercel.json` 用一組 `:game(...)` 白名單規則代理 `/{遊戲}/*`。多一個頁面或檔名要回去補
- 合併前的 `web100-05-time-bomb`、`web100-bamboo`、`web100-stairs`、`web100-orchard` 四個 Worker 已在 2026-10-23 刪除
