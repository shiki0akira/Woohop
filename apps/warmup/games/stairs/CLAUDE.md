# 上樓下樓（apps/warmup/games/stairs）

不用手機的團康，手機在主持人手上，負責四件事：帶規則、放配樂、打節拍、讓輸的人拉真心話大冒險拉霸。玩法與所有設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）：共用的 `scripts/build.js` 為每個語言產生靜態頁，這個遊戲不一樣的部分在 `build.mjs`；全站共用的頂欄／頁尾／樣式從 `apps/homepage` 拿。

返回鍵、`<dialog>`、AudioContext 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

- **8 種語言**（`app/strings.js` 的 `LANGS`；2026-10-21 先上 zh-TW，同一天補齊）。外語遊戲名用「電梯」（CONCEPT.md 第四節）。四拍口令各語言用自己順口的說法，一拍一個詞：en「One, up, to, four」、de「Eins, hoch, auf, vier」、fr「Un, monte, au, quatre」、es「Uno, sube, al, cuatro」、ja「1・階・上・4階」、ko「1·층·위로·4층」。改了 heroTitle 要在 apps/homepage 跑 `node scripts/og-image.mjs stairs` 重產縮圖。
- 本機開發用 `.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/stairs/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup → rules → play → end`，每一步一個畫面，用 `showScreen()` 切換。
  - 步驟頭、規則卡、拉霸、節拍器都是全站共用的 `window.Leader`（apps/homepage/assets/game.js）。
  - 返回鍵一律回第一頁；節拍器在打的時候會先確認。
- **節拍器與配樂**用 `Leader.metronome`，設定是 `beats: 4, accents: [3], groove: true, auto: true`。
  - 拍子與配樂分開開關，但走同一個時鐘，永遠對拍。
  - 配樂的開關：進 play 就開；頂欄音符鍵只管配樂和拉霸的聲音（`settings.sound`）。
  - 配樂音量由元件依狀態決定：

    | 時候 | 音量 |
    |---|---|
    | play，沒在打拍子 | 0.8 |
    | play，打拍子中 | 0.3 |
    | 剛進 end | 0.8 |
    | 拉霸在轉 | 0.3 |
    | 拉霸停下之後 | 0.5 |

  - 拍子聲固定 1.4。
- **結束鍵要按住 0.8 秒**（`HOLD_MS`）。
- 偏好存在 `localStorage`（`web100-stairs-settings`），只讀回配樂開關；人數、「加頂樓和地下室」每次打開都是預設（2026-10-29 使用者要求）。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/stairs/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `stairs_game_started` | 進入「開始！」（含再玩一次） | `round_number`、`floors`、`expansion` |
| `stairs_game_ended` | 按住結束遊戲 | `round_number`、`duration_seconds`（從開始打拍子算） |
| `stairs_slot_pulled` | 拉一下拉霸 | `round_number`、`kind`、`mode` |

## SEO

- `sitemap.xml` 由 build 產生在 `/stairs/sitemap.xml`，首頁 `robots.txt` 掛的是 `/stairs-sitemap.xml`。
- 首頁 `vercel.json` 用 `:game(...)` 白名單代理 `/stairs/*`（Worker：`woohop-warmup.shiki0akira.workers.dev`，跟其他暖場遊戲同一個）。多一個頁面或檔名要回去補。
