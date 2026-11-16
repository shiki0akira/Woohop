# 我從來沒有（apps/warmup/games/never）

不用道具的聚會遊戲。手指是大家自己折的、手機不記分，手機只在主持人手上，負責：帶規則、每一輪抽主題＋給例句、下一輪、贏家抽動作卡讓大家模仿（五根折完出局，最後留著手指的人贏，11/16 老闆改）。玩法與設計決策在 `CONCEPT.md`。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。骨架照抄果園菜園動物園（`games/orchard`）。

- ⚠️ 2026-11-13 **只有繁中**（`app/strings.js` 的 `LANGS`），老闆確認後再補 7 語、接首頁。
- 本機：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/never/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup`（選玩法）→ `rules` → `play` → `end`，用 `showScreen()` 切換。返回鍵一律回第一頁；在 play 先確認。
- **玩法** `mode`：`never`（預設）／`did`（畫面上叫「我曾經做過」，11/16）。步驟頭讀 `T.lead`／`T.leadDid`，規則卡讀 `T.ruleCards`／`T.ruleCardsDid`（進 rules 時才畫），例句開頭 `T.exNever`（我從來沒有）／`T.exDid`（我曾經）。不記上次選的。
- **主題** `T.topics`＝`[主題, [例句⋯]]`：一局用洗好的牌抽（`drawTopic()`），所有主題輪完才會重複；第三格是 'free' 的是「自由發揮」，照著念換成 `playFree`（不限主題）；自己選的也從牌裡拿掉。例句點一下換下一句。例句要能同時接「我從來沒有」與「我曾經」。
- **沒有配樂、沒有聲音開關**（講話的遊戲，跟兩真一假一樣）。
- **結尾是動作卡**（`Leader.actionCard`，照木頭人動作版）：動作清單由 build.mjs 嵌進 `window.NEVER.actions`（全站共用的 action-cards.mjs）。play 畫面要 Wake Lock。
- **結束鍵**：按住 0.8 秒（`HOLD_MS`）。
- 規則卡第 3 張的手是 `hand(folded, color, face)`，接首頁時 `woohop-art.js` 的 `art.never` 照這個樣子畫。

## GA4

`send_page_view: false`，畫面切換時送 page_view，路徑 `/never/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `never_game_started` | 進入「開始！」（含再玩一次） | `game_number`、`mode`、`topic` |
| `never_round_started` | 按「下一輪」 | `round_number`、`topic`、`mode` |
| `never_topic_changed` | 骰子換主題或自己選 | `round_number`、`topic`、`mode`、`random` |
| `never_game_ended` | 按住結束 | `game_number`、`mode`、`rounds`、`duration_seconds` |
| `never_action_drawn` | 贏家抽一個動作 | `action`、`mode` |
