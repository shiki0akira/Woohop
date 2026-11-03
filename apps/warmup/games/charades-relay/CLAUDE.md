# 比手畫腳接力賽（apps/warmup/games/charades-relay）

一支手機的團康：大家排成一列背對背，排頭看題目後比給下一個人看，一個傳一個，最後一個人猜。手機在主持人手上，負責出題、每一棒倒數、記猜中幾題和總共花多久（11/02 老闆試玩後從「分隊比分數」改成「一隊幾人＋總耗時」）。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-11-02 從 `charades` 複製出來，**目前只有 zh-TW**（新遊戲先做繁中，老闆確認後才補其他語言）。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## 加語言

`app/locales/` 加一個檔（key 跟 zh-TW 一樣）、`app/strings.js` 的 `LANGS`／`STRINGS` 加上去。題庫各語言已經在 word-bank.mjs 裡，不用另外準備。首頁的 `GAME_LANGS` 也要跟著加。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經抽過題目就先確認（照比手畫腳）。
- **開場設定** `prep`：`size`（一隊幾人 3～10，預設 5，傳 `size - 1` 棒）、`per`（比幾題 1／2／3，預設 2）、`sec`（每人幾秒 10／20／0＝不計時，預設 20）、`cats`（題目類型，`randomCats` 跟比手畫腳一樣）。**不記上次選的**；只有聲音開關存在 `localStorage['woohop-charades-relay-settings']`（`{ sound }`）。
- **play 分五段** `setPhase()`：`draw` → `word` → `relay` → `guess` → `reveal`。題卡 `#card[data-stage]` 跟 phase 同名（reveal 那面的 class 是 `.stage-reveal-answer`，避開 game.css 的 `.stage-reveal`）。
  - **步驟頭**：手機一直在主持人手上，所以 play 也有步驟頭，但只在 `PLAY_LEAD`（draw／reveal）兩段出現，文案是 locale 的 `lead.draw`／`lead.reveal`（reveal 是「從最後一個人往前問：你以為是什麼？」）。word、relay、guess 由 CSS 藏起 `.play-lead`。
  - **guess 照比手畫腳**（11/02 老闆要求）：`hint` 記這一題給過的提示，`renderMask()` 一個字一個方塊，`giveKind()` 黃色類型標籤、`giveChar()` 隨機露一個字（最後一個字不露），「偷看答案」把方塊全換成字（`peeking`）。卡片下面「猜中了！」／「沒猜到，公布答案」都會 `judge()` 記下來、進 reveal 顯示答案，主持人按「下一題」／「看結果」才往下（`afterReveal()`）。
  - **碼錶** `startClock()`：從規則講完、開始玩算起（`startedAt`），上方每秒更新；`endGame()` 記下 `finishedMs`，結束畫面和照著念（`resultLine()`）都用它。`right` 是猜中幾題。
  - **倒數** `startTimer()`／`tickTimer()`：每一棒重新算，每秒輕滴一聲、最後三秒高音嗶，到 0 長嗶＋震動＋紅字「時間到！換下一個人」，**不自動換人**。倒數圈是設計系統的 `.timer-ring`。`sec` 是 0 就不顯示倒數圈。離開 relay 一律 `stopTimer()`。
  - **聲音** `sfx.*`：抽題、傳棒、進猜答案、猜對、猜錯、結束各一段（Web Audio 合成，不用音檔）。自己一個 AudioContext，`ensureAudio()` 在按「下一步：開始玩」時先建好，避開自動播放限制。頂欄音符鍵由 game.js 呼叫 `window.toggleMusic`。`judge()` 只在 guess 有效，連點不會算兩次。
  - `pass`：第幾棒（第 k 個人比給第 k+1 個人），共 `size - 1` 棒；最後一棒的按鈕文字換成「最後一個人看完了」，按了進 guess。
- **題庫**：全站共用的 `apps/homepage/src/word-bank.mjs`，`build.mjs` 用 `wordsFor(lang, 'act')`，頁面上是 `window.RELAY.words`。`shuffleDeck()` 照比手畫腳（去重複、整副抽完才重洗）。
- **結束畫面**：猜中幾題、總共花了多久兩格大數字；照著念是 `resultLine()`（有猜中／一題都沒中兩種）。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/charades-relay/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `charades_relay_game_started` | 進入上場（含再玩一次） | `game_number`、`size`、`per`、`seconds`、`categories` |
| `charades_relay_skipped` | 換一題 | `round_number`、`category` |
| `charades_relay_passed` | 最後一個人看完了 | `round_number`、`passes`、`seconds` |
| `charades_relay_hint_shown` | 提示類型／提示一個字 | `round_number`、`kind`（category／char）、`shown`、`category` |
| `charades_relay_judged` | 猜中了！／沒猜到，公布答案 | `round_number`、`right`、`passes`、`category`、`skips`、`hint_kind`、`hint_chars` |
| `charades_relay_game_ended` | 題數比完 | `rounds`、`size`、`right`、`duration_seconds` |
