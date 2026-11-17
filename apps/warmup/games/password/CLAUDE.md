# 終極密碼（apps/warmup/games/password）

一支手機傳著玩的猜數字：手機藏密碼，輪流猜、範圍越縮越小，猜中的人爆炸。玩法與設計決策在 `CONCEPT.md`。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。骨架照「我從來沒有」，爆炸畫面與爆炸聲照抄定時炸彈（`games/bomb`）。

- ⚠️ 2026-11-17 **只有繁中**（`app/strings.js` 的 `LANGS`），老闆確認後再補 7 語、接首頁。
- 本機：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/password/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（選範圍）→ `rules` → `play` → `boom`。返回鍵一律回第一頁；play 先確認。play 不放步驟頭（手機在大家手上）。
- **狀態**：`lo`／`hi`（包含兩端）、`secret`、`input`（字串，位數上限＝範圍上限的位數，不能 0 開頭）、`guesses`（超出範圍的不算）。
- `submit()`：超出範圍 → 提示＋震動、不算一次；猜中 → `explode()`；太小 `lo = n + 1`、太大 `hi = n - 1`，縮的那一邊數字跳一下。
- **聲音**：全部當場合成（`tone()`、照抄定時炸彈的 `playBoom()`），頂欄音符鍵管全部＋拉霸，只記這個開關（`woohop-password-settings`），開場藏起來。沒有配樂。
- 鍵盤：自己畫的 `.keypad`；`keydown` 接數字、Backspace、Enter（play 畫面、彈窗沒開時）。

## GA4

`send_page_view: false`，畫面切換時送 page_view，路徑 `/password/{lang}/{setup|rules|play|boom}`。**刻意不送每一次猜**（一局十幾次，次數已經在 `password_exploded` 裡）。

| 事件 | 時機 | 參數 |
|---|---|---|
| `password_game_started` | 進入猜（含再玩一次） | `game_number`、`range` |
| `password_exploded` | 猜中密碼 | `game_number`、`range`、`guesses`、`duration_seconds` |
| `password_slot_pulled` | 爆炸的人拉拉霸 | `game_number`、`kind`、`mode` |
