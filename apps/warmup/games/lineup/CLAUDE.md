# 數字默契排排站（apps/warmup/games/lineup）

每人一支手機、不開房間的合作遊戲：主持人出 QR code 發不重複的祕密數字，抽主題，大家形容、排隊，主持人手機公布。
玩法與設計決策在 `CONCEPT.md`。

## 架構

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。QR code 照秒數挑戰「一起按」（`public/vendor/qrcode.js` 同一份，
首頁 vercel.json 要多一條 `/lineup/vendor/:file(qrcode.js)` 的代理）。

- ⚠️ 2026-11-20 **只有繁中**（`app/strings.js` 的 `LANGS`），老闆確認後再補 7 語、接首頁。
- 本機：`.claude/launch.json` 的 `warmup-dev`（port 8790），開 `/lineup/zh-TW/`；玩家連結是 `/lineup/zh-TW/#j=ABC0`。

## `app/app.js` 的結構

- **主持人**：`setup`（幾個人 2～10）→ `rules` → `deal`（一次一個 QR）→ `play`（主題＋刻度）→ `reveal`（一張一張翻）→ 下一輪回 `play`。
- **玩家**：網址 `#j=種子(3 字母)＋第幾位(0～9)` → `you`。進來就把 # 拿掉；第幾位、第幾輪存在 `sessionStorage`（`woohop-lineup-me`），重新整理回到同一輪。
- **數字**：`numbersFor(seed, round, count)`＝FNV-1a(seed:round) 餵 mulberry32，抽到不重複的 1～100 為止。主持人公布用 `numbersFor(seed, round, players)` 排序；玩家用 `numbersFor(seed, round, seat+1)[seat]`。**改這個函式＝主持人和玩家對不上**，兩邊一定要同一份。
- **主題** `T.topics`＝`[主題, 1 是什麼, 100 是什麼]`，只在主持人手機，洗牌抽、骰子換。
- 返回鍵：開場直接退、說明直接回開場，其他畫面（含玩家）先確認。
- 沒有聲音（`gameBar` 的 musicLabel 是空的）。

## GA4

`send_page_view: false`，畫面切換時送 page_view，路徑 `/lineup/{lang}/{setup|rules|deal|play|reveal|you}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `lineup_game_started` | 主持人開始發數字 | `game_number`、`players` |
| `lineup_joined` | 玩家掃 QR 進來 | `seat` |
| `lineup_topic_changed` | 骰子換主題 | `round_number`、`topic` |
| `lineup_revealed` | 全部翻完 | `round_number`、`players`、`topic` |
| `lineup_player_next` | 玩家按下一輪 | `round_number` |
