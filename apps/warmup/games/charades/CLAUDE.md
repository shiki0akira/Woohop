# 比手畫腳（apps/warmup/games/charades）

一支手機的團康：大家圍一圈輪流上台，拿著手機抽題目、只能比不能說，其他人搶著猜。手機負責出題、提示，不計時、不記分。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-10-28 從 `statue` 複製出來，同一天補齊 8 種語言（名稱見 CONCEPT.md 第五節）並上線。首頁插圖是 `woohop-art.js` 的 `art.charades`（比動作的小人、問號泡泡、三個方塊的對話框；使用者要求不放題卡）。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（幾個人、每人比幾題，再選題目類型）→ `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經比過題目就先確認。
- **開場設定** `prep`：`cats`（題目類型代號，可複選、至少一類，預設全選）、`count`（2～30 人，預設 6）、`per`（1／2／free）。題數＝人數 × 每人題數。**跟倒放猜猜看一樣**（2026-10-28 使用者要求）：`defaultPer()` 讓每人幾題跟著人數換（3 人以下不限、4～5 人 2 題、6 人以上 1 題），人數一改就套回預設；**不記上次選的**（產品決定），沒有 localStorage。
  - 題目類型是設計系統的 `.choice` 勾選卡，九類太長所以 app.css 改成三欄小卡（打勾移到角落外側，四個字的名稱才不會被擋）。
- **play 分四段** `setPhase()`：`draw`（一疊卡）→ `ready`（翻出題目，開始比／跳過這題）→ `acting`（題目蓋起來只畫方塊；猜中了／提示類型／提示一個字／回上一步看題目；不能跳過）→ `result`（猜中了，下一個人；最後一題變「看結果」直接結束）。`renderRound()` 顯示第幾題、輪到第幾個人（人數取餘數輪下去）。CSS 看 `#view-play` 的 `data-phase`（`.phase-draw`／`.phase-ready`／`.phase-acting`），題卡自己的三面看 `data-stage`（draw／reveal／result）。
  - 不放步驟頭：手機在比的人手上（apps/warmup/CLAUDE.md）。
  - `shuffleDeck()`：把選了的類型洗成一副，同一個詞出現在兩類只留一個；整副比完才重洗。
  - **題卡** `syncCard()`：`#drawn[data-view]` 是 `word`（ready）或 `covered`（acting）；蓋起來時一律畫方塊（`renderMask`，沒露出的字是 `.mask-box`），給了類型就多一個黃色標籤 `#hint-kind` 直接寫類型。`started` 記這題按過「開始比！」沒：回上一步時藏起「跳過這題」、主要鍵變「繼續比！」。
  - **提示**：`giveKind()` 給類型、`giveChar()` 每按一次隨機多露一個字（`Array.from` 切字，只有字母數字算要猜的字；剩最後一個就停）。`hint` 每換一題重來。`renderMask()` 把每個單字包成 `.mask-word`（不換行）、空白是 `.mask-space`，字母語言才不會把一個字拆到兩行。
  - **再偷看一次**（`#peek`，跟倒放猜猜看一樣的小按鈕）：回到 ready，提示保留（2026-10-28 原本是按住偷看，使用者說沒反應，改成回上一步）。
- **題庫**是全站共用的 `apps/homepage/src/word-bank.mjs`（2026-10-28 從 locale 搬過去，桌遊助手的「抽題目」也用），`build.mjs` 的 `tokens()` 用 `wordsFor(lang, 'act')` 只嵌比得出來的，頁面上是 `window.CHARADES.words`（app.js 的 `CATS`）。`check()` 呼叫 `checkWords()`：代號各語言一樣、每類少於 25 題、類內重複都會擋。
- **結束鍵**：要按住 0.8 秒（`HOLD_MS`），只在 draw 那段出現。題數比完會自動結束。
- 沒有聲音、沒有計時（2026-10-28 改成比到猜中為止，見 CONCEPT.md 第二節）。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/charades/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `charades_game_started` | 進入上台（含再玩一次） | `game_number`、`players`、`per`、`categories` |
| `charades_skipped` | 跳過這題 | `round_number`、`category` |
| `charades_hint_shown` | 給提示 | `round_number`、`kind`（category／char）、`shown`、`category` |
| `charades_peeked` | 再偷看一次（回上一步看題目） | `round_number` |
| `charades_guessed` | 猜中了 | `round_number`、`category`、`hint_kind`、`hint_chars` |
| `charades_game_ended` | 題數比完或按住結束 | `rounds`、`finished`、`duration_seconds` |
