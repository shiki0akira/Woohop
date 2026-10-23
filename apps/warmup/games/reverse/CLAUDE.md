# 倒放猜猜看（apps/warmup/games/reverse）

一支手機（或搶答時每人一支）錄音、倒放、學著唸再倒回來猜。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-10-23 上線，同一天補齊 8 種語言（名稱見 CONCEPT.md 第四節）。首頁插圖是 `woohop-art.js` 的 `art.reverse`（錄音機）。`vendor/qrcode.js` 在首頁 `vercel.json` 另外列了一條白名單。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（幾個人、玩幾題、怎麼猜；`RACE_MIN` 人以上才給選搶答）→ `rules` → `play` → `end`，用 `showScreen()` 切換。`play` 裡一題分四段 `setPhase()`：draw → reveal → record → guess，CSS 看 `data-phase` 決定露哪些區塊（`.phase-*`）。另有 `rec`「只有錄音機」，網址帶 `#rec` 時直接進來（QR code 連這裡）。
- **題卡**借用抽卡取名的 `.namer` 樣式（game.css），自己多開 `draw`／`covered` 兩面；`deckArt()` 是抽卡取名那張插圖的複本（game.js 沒匯出）。
- **錄音機** `recorder(root, opts)`：錄音鍵＋設計系統的 `.progress`＋狀態列；播放鍵用 `.button(which, ...)` 另外做（`forward` 原聲／`backward` 倒放）。全頁只播一段、只錄一段（`playing`、`recording`）。
  - `getUserMedia` 關掉降噪／回音消除；`MediaRecorder` 格式讓瀏覽器挑（iOS 是 mp4）；`trimSilence()` 剪頭尾。
  - 麥克風只在 https 或 localhost 能用：手機測試用 launch.json 的 `warmup-https`（`--local-protocol https`，自簽憑證，手機要先略過警告）。
- **抽題** `drawCard(exclude)`：`WEIGHTS` 75／15／10，換一題傳現在的題型進去排除。題庫在 locale 的 `prompts`（`sentence`／`hum`／`free`），`build.mjs` 的 `check()` 擋空的題型。
- QR code 用 `public/vendor/qrcode.js`（跟搶答同一份 qrcode-generator），畫成 `Woohop.qrSvg`。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/reverse/{lang}/{setup|rules|play|end|rec}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `reverse_game_started` | 進入「開始！」（含再玩一次） | `players`、`rounds_mode`（each／free）、`mode`（one 輪流猜／each 搶答） |
| `reverse_game_ended` | 一人一題玩完，或不限題數按「結束遊戲」 | `rounds`、`rounds_mode`、`mode` |
| `reverse_recorded` | 錄完一段 | `round_number`、`stage`（ask／copy）、`seconds` |
| `reverse_card_shuffled` | 換一題 | `round_number`、`kind` |
| `reverse_hint_shown` | 看提示 | `round_number`、`kind` |
| `reverse_answer_revealed` | 公布答案（放原聲） | `round_number`、`kind` |
