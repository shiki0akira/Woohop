# 竹筍竹筍蹦蹦出（apps/bamboo）

不用手機的破冰遊戲，手機在主持人手上，只負責帶領：取名、說明規則、口令配樂、輸的人拉真心話大冒險拉霸。玩法與所有設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

## 架構

照抄定時炸彈（`apps/bomb`）：assets-only Worker（`wrangler.jsonc` 沒有 `main`）、`scripts/build.js` 為每個語言產生靜態頁、全站共用的頂欄／頁尾／樣式從 `apps/homepage` 拿。返回鍵、`<dialog>`、AudioContext 的坑跟定時炸彈一樣，`apps/bomb/CLAUDE.md` 有寫為什麼。

- **8 種語言**（`app/strings.js` 的 `LANGS`；2026-10-20 先上 zh-TW，同一天補齊）。遊戲名用當地類似遊戲的名稱（CONCEPT.md 第五節），名稱庫在 `app/names/{lang}.js`、各語言自己準備；拉霸題目在全站共用的 `apps/homepage/src/slot-prompts.mjs`（各語言自己寫，至少 30 題真心話、15 個大冒險）
- 拉丁文字的語言（en/de/fr/es）用拉丁字型：2026-10-20 已改在全站共用的 `woohop.css`（原本微軟正黑體排前面，撇號會變全形 `C’ est`）
- 口令的格子：中文一格一個字（正方形），其他語言一格一個音節（寬度跟著字走），七格在 375px 要放得下
- 本機：`.claude/launch.json` 的 `bamboo-dev`（port 8791）。⚠️ `wrangler dev` 開著時 build 出新的資料夾（例如新語言）它不會看到、回 404，要重開 dev server

## `app/app.js` 的結構

- **一步一步帶**：`setup → name → rules → play → end`，每一步一個畫面，`showScreen()` 切換。步驟頭、規則卡、拉霸是全站共用的 `window.Leader`（apps/homepage/assets/game.js，2026-10-21 從這裡抽出去，定時炸彈也用）；`renderLead()` 只負責餵這一步的內容
- **返回鍵一律回第一頁**（有名單先確認），不是回上一步
- **取名**：名稱庫一項可以是一組聽起來很像的名稱（`['炒飯', '炒麵']`），同一局只會抽到其中一個（`freeGroups()`）。自己取不打字，記成「自己取 N」
- **配樂**全部 Web Audio 合成，用「音訊時鐘＋往前看」排程（`tick()`），不靠 setTimeout 打拍子。音樂開關在共用頂欄（`chrome.mjs` gameBar 的 `musicLabel` → `window.toggleMusic`）
- **結束鍵要按住 0.8 秒**（`HOLD_MS`）：開始和結束是同一顆鍵，防連點、手滑
- **拉霸**：`Leader.slot()`（game.js），這裡只在 `resetSlot()` 第一次建立、之後每輪 `reset()` 回到「隨機」
- 這一局存 `sessionStorage`（`web100-bamboo-game`，重新整理接著玩、關分頁就沒了）；偏好存 `localStorage`（`web100-bamboo-settings`）

## GA4

測量 ID 跟全站共用。`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑 `/bamboo/{lang}/{setup|name|rules|play|end}`；玩法頁 `/bamboo/{lang}/rules/` 由 site.js 送。

| 事件 | 時機 | 參數 |
|---|---|---|
| `bamboo_game_started` | 按「開始遊戲」 | `theme`、`random` |
| `bamboo_names_done` | 按「大家都取好了」 | `players`、`theme`、`random`、`own_names` |
| `bamboo_round_started` | 按「開始這一輪」 | `round_number`、`players`（用本名是 0）、`theme`、`music` |
| `bamboo_round_ended` | 按住結束這一輪 | `round_number`、`duration_seconds`、`music` |
| `bamboo_slot_pulled` | 拉一下拉霸 | `round_number`、`kind`（ask／do）、`mode`（ask／mix／do） |

## SEO

- `sitemap.xml` 由 build 產生在 `/bamboo/sitemap.xml`，首頁 `robots.txt` 掛 `/bamboo-sitemap.xml`
- 首頁 `vercel.json` 用白名單代理 `/bamboo/*`（Worker：`web100-bamboo.shiki0akira.workers.dev`）。多一個頁面或檔名要回去補
- 分享縮圖 `public/og/{lang}.png`，用首頁的 `node scripts/og-image.mjs bamboo` 產生
