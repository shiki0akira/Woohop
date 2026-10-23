# Woohop 首頁

Woohop 系列小遊戲/小工具的入口首頁，純 HTML/CSS/JS，不用框架，部署在 Vercel（push 到 main 自動部署，Root Directory `apps/homepage`），綁定正式網域 `www.vibeweb100.com`。2026-10-16 改版成 Woohop 新設計，視覺規則以 `design/brand-exploration.html` 為準。

頁面：`/{lang}/`（首頁）、`/{lang}/games/`（找遊戲）、`/{lang}/combo/`（破冰組合）、`/{lang}/guides/`（帶領指南，文章未寫，先 noindex），共 8 種語言。

## 專案一覽

⚠️ **每次新增或部署子專案，這張表都要一起更新**（詳見下方新增專案的步驟）。

00～05 已併進 monorepo [shiki0akira/Woohop](https://github.com/shiki0akira/Woohop)（`apps/{代號}`），舊 repo 已封存；006 仍是獨立 repo。

| 專案 | 網址 | 原始碼 | 狀態 |
|---|---|---|---|
| web100_00_Homepage | [www.vibeweb100.com](https://www.vibeweb100.com) | `apps/homepage` | 已上線（2026-10-16 改版） |
| web100_01_Avalon-Voice | [www.vibeweb100.com/avalon](https://www.vibeweb100.com/avalon) | `apps/avalon` | 已上線 |
| web100_02_BuzzerGame | [www.vibeweb100.com/buzzer](https://www.vibeweb100.com/buzzer) | `apps/buzzer` | 已上線 |
| web100_03_PreferenceMatch | [www.vibeweb100.com/match](https://www.vibeweb100.com/match) | `apps/match` | 已上線 |
| web100_04_HappyBingo | [www.vibeweb100.com/bingo](https://www.vibeweb100.com/bingo) | `apps/bingo` | 已上線 |
| web100_05_TimeBomb | [www.vibeweb100.com/bomb](https://www.vibeweb100.com/bomb) | `apps/warmup/games/bomb` | 已上線 |
| 竹筍竹筍蹦蹦出 | [www.vibeweb100.com/bamboo](https://www.vibeweb100.com/bamboo/zh-TW/) | `apps/warmup/games/bamboo` | 已上線（2026-10-20） |
| 上樓下樓 | [www.vibeweb100.com/stairs](https://www.vibeweb100.com/stairs/zh-TW/) | `apps/warmup/games/stairs` | 已上線（2026-10-21） |
| 果園菜園動物園 | [www.vibeweb100.com/orchard](https://www.vibeweb100.com/orchard/zh-TW/) | `apps/warmup/games/orchard` | 已上線（2026-10-22） |
| web100_06_HappinessSimulator | [www.vibeweb100.com/happiness](https://www.vibeweb100.com/happiness/zh-TW/) | [GitHub](https://github.com/shiki0akira/web100_06_HappinessSimulator)（獨立） | 已上線 |

## 架構說明

結構、SEO 規則、加新遊戲的步驟都寫在同目錄的 `CLAUDE.md`，以那份為準。這裡只列重點：

- 文案唯一來源是 `src/locales.mjs`；`scripts/prerender.js` 建置出 `dist/` 的所有頁面與 `sitemap.xml`（不用手動維護）
- `/avalon/*` 與各遊戲路徑透過 `vercel.json` 的 rewrite **暫時代理**到各自的部署；Cloudflare Worker 路由總機做好後會整段移除
- 每加一個新子專案，除了 `CLAUDE.md` 列的程式步驟，還要：
  1. 更新 `docs/ARCHITECTURE.md` 第 9 節的進度追蹤表
  2. **更新本文件最上面的「專案一覽」表格**

## 語言判斷邏輯

1. 網址帶語言（`/ja/`）→ 直接用該語言
2. 網址沒帶語言（`/`）→ 依序看 `localStorage['web100-lang']` 與 `web100_lang` cookie，都沒有就用預設語言（`zh-TW`）
3. 使用者手動切換語言時，同時寫入 `localStorage` 與 `web100_lang` cookie（`path=/`，全站共用，名稱沿用舊的不要改）
4. `web100_lang` cookie 之後會給 Cloudflare Worker 讀取，用來做「訪客 IP 地區 → 自動判斷語言」，且 cookie 優先權高於 IP 猜測

## 設計

新設計：淺灰底 `#f4f4f6`、2px 線條＋4px 底、粗描邊插圖，規則全在 `design/brand-exploration.html`。根目錄的 `design-tokens.css` 是舊的深色配色，**四個小遊戲還在用，遊戲頁改版完才能拿掉**。
