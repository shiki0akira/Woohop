# 畫畫接力（apps/warmup/games/drawing-relay）

一支手機在大家手上傳的畫畫遊戲：第 1 個人看題目畫，下一個人只看上一張圖 5 秒，再在空白畫布上畫出他以為的東西，一路傳下去，最後一個人看最後一張圖猜。揭曉時把每個人的畫依序攤開。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-11-03 從 `charades-relay` 複製出來（開場、題目類型、步驟頭、聲音、返回鍵都照抄），**目前只有 zh-TW**（新遊戲先做繁中，老闆確認後才補其他語言）。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## 加語言

`app/locales/` 加一個檔（key 跟 zh-TW 一樣）、`app/strings.js` 的 `LANGS`／`STRINGS` 加上去。題庫各語言已經在 word-bank.mjs 裡（用途 draw），不用另外準備。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經抽過題目就先確認。
- **開場設定** `prep`：`size`（一隊幾人 3～10，預設 5；畫的人 `size - 1`，最後一個人只猜）、`sec`（每人畫幾秒 20／30／45／60，預設 30）、`cats`（題目類型，`randomCats` 跟比手畫腳一樣）。**不記上次選的**；只有聲音開關存在 `localStorage['woohop-drawing-relay-settings']`（`{ sound }`）。
- **play 分七段** `setPhase()`：`draw`（抽題目）→ `word`（給第 1 個人看，開始畫／換一題）→ `paint`（畫）→ `handoff`（交給下一個人）→ `view`（看上一張圖 `VIEW_SEC`＝5 秒，倒數完自動進 paint）→ ⋯⋯ → `guess`（最後一個人看最後一張圖）→ `reveal`（答案＋每個人的畫）。題卡 `#card[data-stage]` 跟 phase 同名（reveal 那面的 class 是 `.stage-reveal-answer`）。
  - **步驟頭**只在 `PLAY_LEAD`（draw／reveal），其他時候手機在畫的人手上。reveal 只有標題，draw 的照著念只在第 1 題出現（`Leader.hideSay()`，跟比手畫腳接力賽一樣）。
  - **畫布** `#canvas`：筆畫存成 0～1 的座標（`strokes`），`redraw()` 每次整張重畫（白底黑線，線寬跟著畫布寬），`fitCanvas()` 依顯示大小×devicePixelRatio（最多 2）設解析度；`locked` 時不收指標。筆有五種顏色（`INKS`：黑、藍、紅、黃、綠，11/03 老闆要求；名稱在 locale 的 `colorNames`，順序一樣），一筆存成 `{ c, p }`，每個人開始畫時回到黑色；工具是復原一筆、清掉重畫、畫好了。
  - **收畫** `finishPainting(auto)`：時間到（`tickTimer()` 到 0）或按「畫好了」，把畫布 `toDataURL('image/png')` 存進 `drawings`，交給下一個人。`painter` 是現在輪到第幾個人。
  - **倒數**：畫的時候最後 10 秒每秒輕滴、最後三秒高音嗶，到 0 震動＋`sfx.swap`。倒數圈是設計系統的 `.timer-ring`（小號 `.timer-sm`）。離開 paint 一律 `stopTimer()`，離開 view 一律 `stopView()`。
  - **揭曉** `revealAnswer()`：猜的時候只有一顆「公布答案」，**不記猜中沒**（11/03 老闆要求），`judged` 數比了幾題、`drawn` 數這場畫了幾張；進 reveal 後`renderGallery()` 兩張一排列出每個人的畫（`.paint-img`，欄寬用 `minmax(0, 1fr)` 鎖住，圖片原始尺寸很大）。主持人按「下一題」（卡片裡）或「結束遊戲」（卡片外面下面的 `.reveal-actions`，11/03 老闆要求）。
- **題庫**：全站共用的 `apps/homepage/src/word-bank.mjs`，`build.mjs` 用 `wordsFor(lang, 'draw')`，頁面上是 `window.DRAWRELAY.words`。`shuffleDeck()` 照比手畫腳（去重複、整副抽完才重洗）。
- **結束畫面**：比了幾題、畫了幾張兩格大數字；照著念是 `resultLine()`。
- **聲音** `sfx.*`：Web Audio 合成，`ensureAudio()` 在按「下一步：開始玩」時先建好。頂欄音符鍵由 game.js 呼叫 `window.toggleMusic`，開場時藏起來。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/drawing-relay/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `drawing_relay_game_started` | 進入上場（含再玩一次） | `game_number`、`size`、`seconds`、`categories` |
| `drawing_relay_skipped` | 換一題 | `round_number`、`category` |
| `drawing_relay_revealed` | 公布答案 | `round_number`、`painters`、`category`、`skips` |
| `drawing_relay_game_ended` | 結束遊戲 | `rounds`、`drawings`、`size`、`seconds`、`duration_seconds` |
