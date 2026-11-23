# 誰是臥底（apps/warmup/games/undercover）

第 22 個遊戲。一支手機傳下去，看到自己的暱稱才按住看詞；大部分人同一個詞、臥底拿到相近但不一樣的詞，沒有人知道自己是不是臥底。每人一句話描述、投票，主持人點被投出去的暱稱揭曉身分。玩法與設計決策在 `CONCEPT.md`。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。骨架照抄俄羅斯輪盤（`games/roulette`）。

- **8 語，2026-11-23 上線**。外語名在 CONCEPT.md 第五節；題目在 `app/pairs.js`（8 語一張表，`strings.js` 用 `pairCatsFor()` 放進各語言的 `pairCats`）。首頁插圖是 `woohop-art.js` 的 `art.undercover`，分享縮圖在 `public/og/`（`node scripts/og-image.mjs undercover`）。
- 本機：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/undercover/zh-TW/`。

## `app/app.js` 的結構

- **一步一步帶**：`setup` → `rules` → `deal`（傳手機看詞，不放步驟頭）→ `play`（描述和投票＋揭曉）→ `end`（哪一方獲勝的大字＋圖示、兩個詞、每個人的身分）。**不拉拉霸**（老闆 11/23）。
- **設定**：人數 4～20（預設 6）、暱稱（沒填用「{n} 號」，欄位跟著人數增減、打過的字留著，不存 localStorage）；收在「自己調」：題目類型（`setup.cats`，預設全勾、至少留一類）、臥底幾個（`spiesFor()`：4～6 人 1、7～10 人 2、11 人以上 3；上限 `maxSpies()` 讓臥底＋白板比平民少）、白板（5 人以上才能開）。
- **發詞**：`drawPair()` 從勾選類型的 `T.pairCats` 洗牌抽，全部輪完才重複（類型改了就重洗），哪一個是臥底的詞隨機。
- **角色圖示** `figure()`／`roleIcon()`：平民藍色笑臉、臥底珊瑚色戴墨鏡和偵探帽、白板白色問號。結果頁和投票格出局的人圖示變灰加叉叉（CSS `.is-out .role-icon`）。
- **看詞卡**：pointerdown 翻開、pointerup／leave／cancel 蓋起來；鍵盤按一下翻開 2 秒；切到背景一定蓋起來。沒看過不能按下一步。
- **忘了詞**：play 的「有人忘了自己的詞？」打開後點名字 → 回 deal 再看一次（`forgotIndex`），看完回 play，不算投票。
- **輸贏** `winner()`：臥底＋白板全出局平民贏；場上臥底數 ≥ 平民數（白板不算），或只剩 2 人時臥底／白板還在，臥底贏。
- **聲音**：揭曉音效，沒有背景配樂。頂欄音符鍵開場藏起來，存在 `woohop-undercover-settings`。
- **詞庫**：10 類 × 20 組＝200 組（`pairCats`）。`build.mjs` 的 `check()` 擋兩個詞一樣、同一組出現兩次、某類少於 10 組、總數少於 150；同一個詞出現在兩組可以（佐助／鳴人、魯夫／鳴人）。**玩法頁每類只列前兩組當範例**（老闆 11/23：整份公開大家就看過了）。

## GA4

`send_page_view: false`，畫面切換時送 page_view，路徑 `/undercover/{lang}/{setup|rules|deal|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `undercover_game_started` | 開始（含同一批人再玩一次） | `game_number`、`players`、`spies`、`blank`、`categories` |
| `undercover_voted_out` | 每投出一個人 | `game_number`、`round_number`、`role` |
| `undercover_game_ended` | 分出勝負 | `game_number`、`winner`、`rounds`、`players`、`duration_seconds` |
