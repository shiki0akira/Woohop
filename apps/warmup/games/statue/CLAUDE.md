# 木頭人動作版（apps/warmup/games/statue）

不用手機的團康：一二三木頭人，但每個人要先抽一張動作卡、用那個動作前進。手機負責三件事：帶規則、抽動作卡、遊戲結束時讓摸到鬼的人選一個動作給鬼做（沒有拉霸、沒有聲音）。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-10-28 從 `orchard` 複製出來，同一天補齊 8 種語言（名稱見 CONCEPT.md 第五節）並上線。首頁插圖是 `woohop-art.js` 的 `art.statue`（黃色動作卡＋比 YA 的小人）。動作卡 2026-10-28 抽成全站共用（桌遊助手的「動作抽卡」也用），見下面。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經抽過卡就先確認。
- **play 分三段** `setPhase()`：`draw`（一疊卡）→ `drawn`（翻出動作、傳給下一個人，回 draw）⋯⋯ →「大家都抽好了」→ `go`（這一局開始）→「下一局」`newRound()` 回 draw。CSS 看 `#view-play` 的 `data-phase` 決定露哪些區塊（`.phase-card`／`.phase-go`）。
  - 步驟頭只在 `go` 放（locale 的 `lead.go`）：draw／drawn 手機在大家手上傳。
  - 動作卡借用抽卡取名的 `.namer` 樣式（game.css），自己多開 `draw` 一面；`deckArt()` 是抽卡取名那張插圖的複本，最上面換成黃色驚嘆號。
  - `shuffleDeck()`：每一局洗一副，同一局不會抽到一樣的；人比動作多才重洗。
  - **動作卡是全站共用的**：28 個動作 `[插圖代號, 名稱]` 在 `apps/homepage/src/action-cards.mjs`（`build.mjs` 的 `tokens()` 嵌進 `window.STATUE.actions`），一個動作一張插圖在 woohop-art.js 的 `Woohop.actionArt`，`Leader.actionArt(代號)` 每次隨機換小人顏色。改動作或插圖要去首頁那邊改，桌遊助手的動作抽卡會一起變。
  - `build.mjs` 的 `check()` 用 `checkActions()` 擋沒有插圖的代號。
- **結束鍵**：要按住 0.8 秒（`HOLD_MS`）。
- **end**：全站共用的 `Leader.actionCard`（不列出全部動作，只有「隨機抽一個」，使用者要求），不會連續抽到同一個。三連拍只是提醒文字，不碰相機。
- 沒有存任何東西在手機上（沒有聲音開關要記）。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/statue/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `statue_game_started` | 進入抽動作（含再玩一次） | `game_number` |
| `statue_action_drawn` | 抽一張動作卡 | `round_number`、`action`、`count` |
| `statue_round_started` | 大家都抽好了 | `round_number`、`players`（這局抽了幾張） |
| `statue_game_ended` | 按住結束遊戲 | `rounds`、`duration_seconds` |
| `statue_punish_drawn` | 遊戲結束時抽給鬼做的動作 | `action` |
