# 果園菜園動物園（apps/warmup/games/orchard）

不用手機的團康。手機只在主持人手上，負責五件事：帶規則、出主題、放配樂、打節拍、讓輸的人拉真心話大冒險拉霸。玩法與所有設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）：共用的 `scripts/build.js` 為每個語言產生靜態頁，這個遊戲不一樣的部分在 `build.mjs`；全站共用的頂欄／頁尾／樣式從 `apps/homepage` 拿。

返回鍵、`<dialog>`、AudioContext 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

- **8 種語言**（`app/strings.js` 的 `LANGS`，2026-10-22）。外語名用當地類似的遊戲，見 CONCEPT.md 第四節。
  - `chant`（開場口令三格）、`topics`（[主題, 要說什麼]）各語言自己挑當地熟悉的；`topics` 可以不一樣多。
  - 改了 `heroTitle` 要在 apps/homepage 跑 `node scripts/og-image.mjs orchard` 重產縮圖。
- 本機開發用 `.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/orchard/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（開場，不設人數）→ `rules` → `play` → `end`，用 `showScreen()` 切換。
  - 返回鍵一律回第一頁；節拍器在打的時候會先確認。
- **主題**：
  - `setTopic(index, random)` 會換主題卡、改照著念裡的 `{topic}`／`{say}`，並送 `orchard_topic_changed`。
  - 每次進 play 會用 `randomTopic()` 抽一個（不會跟上一個一樣）。
  - 右上角的骰子鍵是隨機換一個；「自己選主題」預設收起來，展開後是主題清單。
- **節拍器與配樂**：用 `Leader.metronome`，參數是 `beats: 3, accents: [2], intro: T.chant, groove: true, auto: true`，預設 80、可調 50～180。
  - `intro`：燈那一排平常顯示口令，打拍子時第一組一拍亮一個詞，喊完才變回燈。
  - 配樂規則跟上樓下樓一樣：沒打拍子時用原速，打拍子才跟著加快。
- **結束鍵**：要按住 0.8 秒（`HOLD_MS`）。
- 偏好存在 `localStorage`（`web100-orchard-settings`），只記配樂開關。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/orchard/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `orchard_game_started` | 進入「開始！」（含再玩一次） | `round_number`、`topic` |
| `orchard_topic_changed` | 換主題（骰子或自己選） | `round_number`、`topic`、`random` |
| `orchard_game_ended` | 按住結束遊戲 | `round_number`、`duration_seconds` |
| `orchard_slot_pulled` | 拉一下拉霸 | `round_number`、`kind`、`mode` |

## SEO

- `sitemap.xml` 由 build 產生在 `/orchard/sitemap.xml`，首頁 `robots.txt` 掛的是 `/orchard-sitemap.xml`。
- 首頁 `vercel.json` 用 `:game(...)` 白名單代理 `/orchard/*`（Worker：`woohop-warmup.shiki0akira.workers.dev`，跟其他暖場遊戲同一個）。多一個頁面或檔名要回去補。
