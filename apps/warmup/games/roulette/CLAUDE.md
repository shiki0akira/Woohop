# 俄羅斯輪盤（apps/warmup/games/roulette）

派對版的俄羅斯輪盤，第 21 個遊戲。一支手機當拉炮傳下去，每人拉一下，拉過的格子不重轉；砰的人噴彩帶、拉真心話大冒險拉霸，會爆的發數全部砰完才結束。玩法與設計決策在 `CONCEPT.md`。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。骨架照抄我從來沒有（`games/never`），拿掉主題與配樂。

- **2026-11-23 只有繁中**（`strings.js` 的 `LANGS`），老闆確認後才補其他 7 語。還沒接首頁、沒有分享縮圖（`/roulette/og/zh-TW.png` 目前 404）。`public/apple-touch-icon.png` 是從 never 複製的暫用檔。
- 本機：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/roulette/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `play`（手機在大家手上傳，不放步驟頭）→ 全部砰完才到 `pop`（拉霸＋再玩一次）。還沒砰完的砰只在 play 顯示「第幾位中了，記住是誰」、繼續傳（老闆 11/23）。
- **第幾位**：`game.hits` 記座位 `((pulls−1) % players) + 1`（從第一個拉的人數，傳超過一圈從 1 重來），`seatText()` 照座位排序、中兩次以上標次數，pop 的照著念念出來（一個人 `lead.pop`、好幾個人 `lead.popMany`）。
- **設定** `setup`：人數 2～20（預設 4）；格數沒自己調過就照人數分級 `chambersFor()`（4 人以下 6、5～8 人 12，每多 4 人多 6，最多 30；`chambersTouched`）；會爆的 1～10、也不超過格數−1（預設 1）。格數和發數收在「自己調」底下。每次進來都是預設值。
- **彈夾** `game.chambers`：開局洗好的 true／false 陣列，`index` 往後走、不重轉。剩下的格子全是會砰的時候提示文字換成 `lastSafe`。
- **拉一下**：`pull()` 抖 `SUSPENSE_MS`（900ms）＋越來越快的喀喀喀，`reveal()` 揭曉。砰的話噴彩帶（`confetti()`，Web Animations、`prefers-reduced-motion` 不噴）、震動，`POP_TO_SLOT_MS` 後換到 pop。
- **聲音**：喀、砰、拉霸，沒有背景配樂（跟定時炸彈一樣，避免跟效果音混在一起）。頂欄音符鍵開關，開場藏起來，存在 `woohop-roulette-settings`。
- **插圖**：`popperArt(state)`（idle／shake／safe／pop），玩的畫面和三張規則卡共用。接首頁時 `woohop-art.js` 的 `art.popper` 照這個畫。
- **返回鍵**：開場直接離開；說明規則回開場；play／pop 還沒砰完先確認，砰完直接回開場。

## GA4

`send_page_view: false`，畫面切換時送 page_view，路徑 `/roulette/{lang}/{setup|rules|play|pop}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `roulette_game_started` | 開始（含再玩一次） | `game_number`、`players`、`chambers`、`bangs` |
| `roulette_popped` | 每一次砰 | `game_number`、`pop_number`、`pull_number` |
| `roulette_game_ended` | 最後一發砰 | `game_number`、`pulls`、`chambers`、`bangs`、`duration_seconds` |
| `roulette_slot_pulled` | 中的人拉拉霸 | `game_number`、`kind`、`mode` |

刻意不送每一次「喀」（一局最多 20 次）。
