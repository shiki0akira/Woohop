# 比手畫腳接力（apps/warmup/games/charades-relay）

一支手機的分隊團康：每隊排成一列背對背，排頭看題目後比給下一個人看，一個傳一個，最後一個人猜。手機在主持人手上，負責出題、每一棒倒數、記各隊分數。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-11-02 從 `charades` 複製出來，**目前只有 zh-TW**（新遊戲先做繁中，老闆確認後才補其他語言）。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## 加語言

`app/locales/` 加一個檔（key 跟 zh-TW 一樣，`teamNames` 要 4 個）、`app/strings.js` 的 `LANGS`／`STRINGS` 加上去。題庫各語言已經在 word-bank.mjs 裡，不用另外準備。首頁的 `GAME_LANGS` 也要跟著加。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經抽過題目就先確認（照比手畫腳）。
- **開場設定** `prep`：`teams`（1～4，預設 2）、`per`（每隊幾題 1／2／3，預設 2）、`sec`（每人幾秒 10／20／0＝不計時，預設 20）、`cats`（題目類型，`randomCats` 跟比手畫腳一樣）。**不記上次選的**；只有聲音開關存在 `localStorage['woohop-charades-relay-settings']`（`{ sound }`）。
- **play 分五段** `setPhase()`：`draw` → `word` → `relay` → `guess` → `reveal`。題卡 `#card[data-stage]` 跟 phase 同名（reveal 那面的 class 是 `.stage-reveal-answer`，避開 game.css 的 `.stage-reveal`）。
  - **步驟頭**：手機一直在主持人手上，所以 play 也有步驟頭，但只在 `PLAY_LEAD`（draw／guess／reveal）三段出現，文案是 locale 的 `lead.draw`／`lead.guess`／`lead.reveal`（`{team}` 換成隊名）。word、relay 由 CSS 藏起 `.play-lead`。
  - **隊伍輪流** `teamOf(round)`：第 1 題第 1 隊、第 2 題第 2 隊⋯⋯取餘數。`scores[]` 每隊一格，`renderScores()` 畫上方分數列和結束畫面。
  - **倒數** `startTimer()`／`tickTimer()`：每一棒重新算，最後三秒每秒嗶一聲，到 0 長嗶＋震動＋紅字「時間到！換下一個人」，**不自動換人**。倒數圈是設計系統的 `.timer-ring`。`sec` 是 0 就不顯示倒數圈。離開 relay 一律 `stopTimer()`。
  - **聲音**：自己一個 AudioContext（`ensureAudio()` 在按「開始傳！」時先建好，避開自動播放限制）。頂欄音符鍵由 game.js 呼叫 `window.toggleMusic`。
  - `pass`：第幾棒（第 k 個人比給第 k+1 個人），不設每隊人數，主持人按「最後一個人看完了」進 guess。
- **題庫**：全站共用的 `apps/homepage/src/word-bank.mjs`，`build.mjs` 用 `wordsFor(lang, 'act')`，頁面上是 `window.RELAY.words`。`shuffleDeck()` 照比手畫腳（去重複、整副抽完才重洗）。
- **結束畫面**的照著念是 `winnerLine()`：一隊贏、平手、全部 0 分、只有一隊（說猜中幾題）四種。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/charades-relay/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `charades_relay_game_started` | 進入上場（含再玩一次） | `game_number`、`teams`、`per`、`seconds`、`categories` |
| `charades_relay_skipped` | 換一題 | `round_number`、`category` |
| `charades_relay_passed` | 最後一個人看完了 | `round_number`、`passes`、`seconds` |
| `charades_relay_judged` | 猜對了／沒猜對 | `round_number`、`right`、`passes`、`category`、`skips` |
| `charades_relay_game_ended` | 題數比完 | `rounds`、`teams`、`scores`、`duration_seconds` |
