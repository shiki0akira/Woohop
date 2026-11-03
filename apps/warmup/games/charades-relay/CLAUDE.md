# 比手畫腳接力賽（apps/warmup/games/charades-relay）

一支手機的團康：大家排成一列背對背，排頭看題目後比給下一個人看，一個傳一個，最後一個人猜。手機在主持人手上，負責出題、整隊的總倒數、每一棒倒數（時間到自動換人）、記猜中幾題。11/03 老闆定的玩法：**每隊固定時間，比誰猜中最多題**；不設幾隊（換隊按「再玩一次」），兩隊也可以同題同時比（主持人自己記分）。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-11-02 從 `charades` 複製出來，先做 zh-TW，11/03 老闆確認後補齊 8 語（各語言名稱見 CONCEPT.md 第五節）。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## 加語言

`app/locales/` 加一個檔（key 跟 zh-TW 一樣）、`app/strings.js` 的 `LANGS`／`STRINGS` 加上去。題庫各語言已經在 word-bank.mjs 裡，不用另外準備。首頁的 `GAME_LANGS` 也要跟著加。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經抽過題目就先確認（照比手畫腳）。
- **開場設定** `prep`：`size`（一隊幾人 3～10，預設 5，傳 `size - 1` 棒）、`min`（每隊幾分鐘，單選 `MIN_STEPS` 3／5／8／12／15，`renderMinSeg()` 產生，預設 5）、`sec`（每人幾秒 10／15／20，預設 15；沒有「不計時」，自動換人要靠它）、`cats`（題目類型，`randomCats` 跟比手畫腳一樣）。**不記上次選的**；只有聲音開關存在 `localStorage['woohop-charades-relay-settings']`（`{ sound }`）。
- **play 分五段** `setPhase()`：`draw` → `word` → `relay` → `guess` → `reveal`。題卡 `#card[data-stage]` 跟 phase 同名（reveal 那面的 class 是 `.stage-reveal-answer`，避開 game.css 的 `.stage-reveal`）。
  - **步驟頭**：手機一直在主持人手上，所以 play 也有步驟頭，但只在 `PLAY_LEAD`（draw／reveal）兩段出現，文案是 locale 的 `lead.draw`／`lead.reveal`（reveal 只有標題「答案揭曉」，照著念是空的；draw 的照著念只在第 1 題出現。都由 `renderLead()` 用 `Leader.hideSay()` 收起來）。word、relay、guess 由 CSS 藏起 `.play-lead`。
  - **guess 照比手畫腳**（11/02 老闆要求）：`hint` 記這一題給過的提示，`renderMask()` 一個字一個方塊，**提示自動給**（11/03，沒有提示鍵）：`startGuessTimer()`／`tickGuess()` 猜 `HINT_KIND_AT`（10）秒 `giveKind()` 亮黃色類型標籤、`HINT_CHAR_AT`（20）秒 `giveChar()` 隨機露一個字（最後一個字不露），卡片下 `#hint-next` 寫還有幾秒；離開 guess 一律 `stopGuessTimer()`。「沒猜到，公布答案」隨時能按。沒有偷看答案（11/03 老闆拿掉）。卡片下面「猜中了！」／「沒猜到，公布答案」都會 `judge()` 記下來、進 reveal 顯示答案，主持人按「下一題」／「看結果」才往下（`afterReveal()`）。
  - **整隊總倒數** `startClock()`／`tickClock()`（每 200ms）：`usedMs` 累計、`runningSince` 記這段開始；**只在 `RUNNING`（word／relay／guess）跑**，draw、reveal 停住（`setPhase()` 呼叫 `setRunning()`），上方 `#clock` 停住時變淡、最後 10 秒變紅，進度條是用掉的比例。到 0 `timeUp()`：正在傳／猜的那題不算，直接 `endGame()`。`right` 猜中幾題、`judged` 比完幾題。
  - **每一棒前準備 3 秒** `startReady()`／`tickReady()`（11/03 老闆要求）：拍肩、轉過來要時間。倒數圈 `.is-ready` 顯示 3、2、1，下面 `#ready-hint` 寫誰要轉過來，倒數完響一聲才 `startTimer()`。整隊總倒數照常跑。
  - **每一棒倒數** `startTimer()`／`tickTimer()`：每一棒重新算，每秒輕滴一聲、最後三秒高音嗶，到 0 震動＋`nextPass(true)` **自動換下一棒**（`sfx.swap`，跟自己按的 `sfx.pass` 不同聲）；最後一棒到 0 直接進 guess。**沒有手動換人鍵**（11/03 老闆拿掉），全部靠倒數。倒數圈是設計系統的 `.timer-ring`。離開 relay 一律 `stopTimer()`。
  - **聲音** `sfx.*`：抽題、傳棒、進猜答案、猜對、猜錯、結束各一段（Web Audio 合成，不用音檔）。自己一個 AudioContext，`ensureAudio()` 在按「下一步：開始玩」時先建好，避開自動播放限制。頂欄音符鍵由 game.js 呼叫 `window.toggleMusic`。`judge()` 只在 guess 有效，連點不會算兩次。
  - `pass`：第幾棒（第 k 個人比給第 k+1 個人），共 `size - 1` 棒；最後一棒寫「比給最後一個人看」，時間到進 guess。
- **題庫**：全站共用的 `apps/homepage/src/word-bank.mjs`，`build.mjs` 用 `wordsFor(lang, 'act')`，頁面上是 `window.RELAY.words`。`shuffleDeck()` 照比手畫腳（去重複、整副抽完才重洗）。
- **結束畫面**（時間到）：猜中幾題、比了幾題兩格大數字，下面 `renderHistory()` 列出這次的題目＋猜中／沒猜到（`playedWords`，11/03 老闆要求；**變數不要叫 history**，會蓋掉 window.history、返回鍵壞掉）；照著念是 `resultLine()`（有猜中／一題都沒中兩種）。「再玩一次（下一隊）」重新開始，下一隊就是這樣接。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/charades-relay/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `charades_relay_game_started` | 進入上場（含再玩一次） | `game_number`、`size`、`minutes`、`seconds`、`categories` |
| `charades_relay_skipped` | 換一題 | `round_number`、`category` |
| `charades_relay_passed` | 最後一棒時間到、進猜答案 | `round_number`、`passes`、`seconds` |
| `charades_relay_hint_shown` | 提示類型／提示一個字 | `round_number`、`kind`（category／char）、`shown`、`category` |
| `charades_relay_judged` | 猜中了！／沒猜到，公布答案 | `round_number`、`right`、`passes`、`category`、`skips`、`hint_kind`、`hint_chars` |
| `charades_relay_game_ended` | 整隊時間到 | `rounds`（比完幾題）、`size`、`right`、`minutes`、`seconds` |
