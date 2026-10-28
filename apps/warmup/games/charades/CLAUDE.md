# 比手畫腳（apps/warmup/games/charades）

一支手機的團康：大家圍一圈輪流上台，拿著手機抽題目、只能比不能說，其他人搶著猜。手機負責出題、倒數，不記分。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-10-28 從 `statue` 複製出來，**先只有繁中、還沒接到首頁**。返回鍵、`<dialog>` 的坑跟定時炸彈一樣，原因寫在 `games/bomb/CLAUDE.md`。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（題目類型、每題時間）→ `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；已經比過題目就先確認。
- **開場設定**存在 `localStorage`（`web100-charades-prep`）：`cats`（題目類型代號，可複選、至少一類）、`seconds`（60／90／120）、`sound`。
  - 題目類型是設計系統的 `.choice` 勾選卡，九類太長所以 app.css 改成三欄小卡（打勾移到角落外側，四個字的名稱才不會被擋）。
- **play 分四段** `setPhase()`：`draw`（一疊卡）→ `ready`（翻出題目，開始比／換一題）→ `acting`（倒數，猜中了／換一題）→ `result`（猜中或時間到，下一個人回 draw）。CSS 看 `#view-play` 的 `data-phase`（`.phase-draw`／`.phase-ready`／`.phase-acting`），題卡自己的三面看 `data-stage`（draw／reveal／result）。
  - 不放步驟頭：手機在比的人手上（apps/warmup/CLAUDE.md）。
  - `shuffleDeck()`：把選了的類型洗成一副，同一個詞出現在兩類只留一個；整副比完才重洗。
  - 換一題不重算時間。倒數用 `Date.now()` 算（切到背景回來也準），剩 5 秒每秒嗶、時間到長嗶（Web Audio，頂欄聲音鍵關得掉）。
- **題庫**在 locale 的 `categories: [[代號, 名稱, [題目...]], ...]`，代號各語言一樣。`build.mjs` 的 `check()` 擋代號不一致、每類少於 25 題、類內重複。
- **結束鍵**：要按住 0.8 秒（`HOLD_MS`），只在 draw 那段出現。

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/charades/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `charades_game_started` | 進入上台（含再玩一次） | `game_number`、`categories`、`seconds` |
| `charades_skipped` | 換一題 | `turn_number`、`category` |
| `charades_turn_ended` | 猜中或時間到 | `turn_number`、`result`（guessed／timeout）、`category` |
| `charades_game_ended` | 按住結束遊戲 | `turns`、`duration_seconds` |
