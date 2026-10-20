# 竹筍竹筍蹦蹦出（apps/bamboo）

不用手機的破冰遊戲，手機在主持人手上，只負責帶領：取名、說明規則、口令配樂、輸的人拉真心話大冒險拉霸。玩法與所有設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

## 架構

照抄定時炸彈（`apps/bomb`）：assets-only Worker（`wrangler.jsonc` 沒有 `main`）、`scripts/build.js` 為每個語言產生靜態頁、全站共用的頂欄／頁尾／樣式從 `apps/homepage` 拿。返回鍵、`<dialog>`、AudioContext 的坑跟定時炸彈一樣，`apps/bomb/CLAUDE.md` 有寫為什麼。

- **目前只有 zh-TW**（`app/strings.js` 的 `LANGS`）。加語言時：遊戲名用當地類似遊戲的名稱（CONCEPT.md 第五節）、`app/names.js` 每個主題補該語言的名稱庫、首頁 `src/locales.mjs` 的 `GAME_LANGS.bamboo` 補上、`vercel.json` 的 `/bamboo/:lang(...)` 補代碼、`node scripts/og-image.mjs bamboo` 重產縮圖
- 首頁在還沒開放的語言把這個遊戲標成「即將推出」、不連過來（`GAME_LANGS`）
- 本機：`.claude/launch.json` 的 `bamboo-dev`（port 8791）

## `app/app.js` 的結構

- **一步一步帶**：`setup → name → rules → play → end`，每一步一個畫面，`showScreen()` 切換。步驟頭（步驟點、標題、照著念）只有一份 `#lead-head`，`renderLead()` 搬進目前畫面的 `.lead-slot`
- **返回鍵一律回第一頁**（有名單先確認），不是回上一步
- **取名**：名稱庫一項可以是一組聽起來很像的名稱（`['炒飯', '炒麵']`），同一局只會抽到其中一個（`freeGroups()`）。自己取不打字，記成「自己取 N」
- **配樂**全部 Web Audio 合成，用「音訊時鐘＋往前看」排程（`tick()`），不靠 setTimeout 打拍子。音樂開關在共用頂欄（`chrome.mjs` gameBar 的 `musicLabel` → `window.toggleMusic`）
- **結束鍵要按住 0.8 秒**（`HOLD_MS`）：開始和結束是同一顆鍵，防連點、手滑
- **拉霸**：捲軸是題目清單重複幾遍，只動 transform；收尾用計時器、不用 transitionend（內嵌瀏覽器可能把 transition 凍住）。真心話／隨機／大冒險每輪重設回隨機
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
