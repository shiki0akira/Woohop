# Web100 首頁

Web100 系列小遊戲/小工具的作品集入口首頁，純 HTML/CSS/JS，不用框架，部署在 Vercel，綁定正式網域 `www.vibeweb100.com`。

## 專案一覽

⚠️ **每次新增或部署子專案，這張表都要一起更新**（詳見下方新增專案的步驟）。

| 專案 | 網址 | 原始碼 | 狀態 |
|---|---|---|---|
| web100_00_Homepage | [www.vibeweb100.com](https://www.vibeweb100.com) | [GitHub](https://github.com/shiki0akira/web100_00_Homepage) | 已上線 |
| web100_01_Avalon-Voice | [www.vibeweb100.com/avalon](https://www.vibeweb100.com/avalon) | [GitHub](https://github.com/shiki0akira/web100_01_Avalon-Voice) | 已上線 |
| web100_02_BuzzerGame | [www.vibeweb100.com/buzzer](https://www.vibeweb100.com/buzzer) | [GitHub](https://github.com/shiki0akira/web100_02_BuzzerGame) | 已上線 |
| web100_03_PreferenceMatch | [www.vibeweb100.com/match](https://www.vibeweb100.com/match) | [GitHub](https://github.com/shiki0akira/web100_03_PreferenceMatch) | 已上線 |
| web100_04_HappyBingo | [www.vibeweb100.com/bingo](https://www.vibeweb100.com/bingo) | [GitHub](https://github.com/shiki0akira/web100_04_HappyBingo) | 已上線 |
| web100_05_TimeBomb | [www.vibeweb100.com/bomb](https://www.vibeweb100.com/bomb) | [GitHub](https://github.com/shiki0akira/web100_05_TimeBomb) | 已上線 |
| web100_06_HappinessSimulator | [www.vibeweb100.com/happiness](https://www.vibeweb100.com/happiness/zh-TW/) | [GitHub](https://github.com/shiki0akira/web100_06_HappinessSimulator) | 已上線 |

## 架構說明

- 這個專案負責網域根目錄 `/` 與各語言首頁 `/{lang}/`
- `/avalon/*` 目前透過 `vercel.json` 的 rewrite **暫時代理**到阿瓦隆語音自己的 Vercel 部署（`web100_01_Avalon-Voice`）
  - 之後 Cloudflare Worker 路由總機做好後，這段代理規則會整段移除，改由 Worker 統一處理所有子專案的路由
- 每加一個新的 Web100 子專案（例如 `web100_02_BuzzerGame`），要做的事：
  1. 在 `index.html` 的 `STRINGS` 裡加上新專案的卡片文案（每個語言都要）
  2. 在 `scripts/prerender.js` 的替換規則加上對應的 `fill(...)`，新卡片的文字才會進到靜態 HTML
  3. 在 `vercel.json` 的 `rewrites` 裡加一條 `/{新專案代號}/*` 代理規則（放在語言萬用規則**之前**）
  4. 更新 `ARCHITECTURE.md` 第 9 節的進度追蹤表
  5. **更新本文件最上面的「專案一覽」表格**，補上新專案的網址與 GitHub 連結

  `sitemap.xml` 不用手動維護，`scripts/prerender.js` 會依 `STRINGS` 的語言清單自動產生。
  這份清單與 `CLAUDE.md` 的同名章節是同一份東西，改了要兩邊一起改。

## 語言判斷邏輯

1. 網址帶語言（`/ja/`）→ 直接用該語言
2. 網址沒帶語言（`/`）→ 依序看 `localStorage['web100-lang']` 與 `web100_lang` cookie，都沒有就用預設語言（`zh-TW`）
3. 使用者手動切換語言時，同時寫入 `localStorage` 與 `web100_lang` cookie（`path=/`，全站共用）
4. `web100_lang` cookie 之後會給 Cloudflare Worker 讀取，用來做「訪客 IP 地區 → 自動判斷語言」，且 cookie 優先權高於 IP 猜測（使用者手動選過就不會再被地區覆蓋）

## 共用設計代幣

視覺樣式沿用 Web100 架構規劃文件裡的 `design-tokens.css` 規則（深色系、紫藍色主色調），之後每個新專案都比照這份風格手動實作。
