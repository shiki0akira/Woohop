# 偷渡畫家（apps/sneaky-artist）

房間型畫畫遊戲：大家用自己的手機同時畫同一張圖，每人偷渡一個祕密題目，畫完一次亮一位畫家的筆畫、其他人猜。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

2026-11-04 照搶答（`apps/buzzer`）的架構開的：單一 Worker 同時服務靜態檔與 Durable Object、網頁走首頁代理但 API／WebSocket 直連 workers.dev、`scripts/build.js` 產生各語言靜態頁、頭像與暱稱共用 `web100-profile`、返回鍵與離開房間的做法都一樣，**細節與理由看 `apps/buzzer/CLAUDE.md`**。2026-11-04 老闆試玩確認後同日補齊 8 語、接上首頁、部署（Worker `woohop-sneaky-artist`）。首頁插圖是 `woohop-art.js` 的 `art['sneaky-artist']`（兩枝鉛筆畫同一張紙，跟你畫我猜接力的一枝筆兩張紙分開）。

## 指令

```bash
npm install
npm run build
npm test          # test/*.test.js（src/game.js 的規則邏輯）
npm run dev:lan   # 本機＋區網（手機測試），launch.json 的 sneaky-dev，port 8792
npm run deploy
```

本機多人測試：同一個網址的分頁共用 `localStorage` 的 clientId，會被當成同一個人。用不同網址（`localhost`／`127.0.0.1`／區網 IP）開，或用 Node 直接連 WebSocket 當機器人玩家。

## 檔案

- `src/worker.js`：路由（`/sneaky-artist/api/rooms` 建房帶 `mode`、`drawSec`、`lang`），照搶答
- `src/room.js`：`SneakyRoom`（Durable Object），狀態機與訊息處理
- `src/game.js`：不碰 DO 的規則——發祕密題目（`dealSecret`，含簡單版的同類型 4 選 1）、進階版比對（`normalize`／`isCorrect`）、字數格（`maskOf`）、計分（`scoreTurn`）。Worker 會把 `apps/homepage/src/word-bank.mjs` 一起打包
- `app/`：`app.js`、`app.css`、`template.html`、`rules.html`、`strings.js`＋`locales/`，`header.js`、`avatars.js`、`partials/` 照搶答

## 房間（`src/room.js`）

- **phase**：`lobby` → `theme`（主題＋每人私下的祕密題目）→ `drawing` → `guessing`（一次一位）→ `reveal`（公布這一位）→ ⋯⋯ → `scores`（這張圖）→ `theme`（再畫一張）｜`ended`（最後排名，`nextRound` 再玩一次會把分數和張數歸零）
- **主持人也是玩家**：hello 一樣要暱稱（沒有就回 `nickname_required`），在 `players` 裡；主持人專用的訊息在 `webSocketMessage` 下半段檢查 `isHost`
- **祕密題目只送本人**（`sendSecret`，`t: 'secret'`），廣播的 state 裡沒有；公布那一位之後才放進 `round.result`，`scores` 時放進 `round.results`
- **筆畫**：客戶端每 50ms 送 `seg`（只轉給其他人、不存）、手指放開送 `stroke`（存成一個 key `stroke:000123`，值 `{ id, by, c, p }`，座標 0～1000 的整數，再轉給其他人蓋掉 seg 拼的那筆）、`undo` 只能拿掉自己的。**`by` 在畫的時候不給任何人**（轉送與 `strokes` 快照都拿掉），`guessing` 以後的快照才帶，客戶端靠它只亮目前那一位。新的一張圖 `clearStrokes()`
- **時間到不用 alarm**（alarm 拿來清閒置房間）：`state` 帶剩餘毫秒，客戶端倒數到 0 送 `endDrawing`／`endTurn`／`nextTurn`（公布後 `NEXT_MS`＝5 秒，`round.nextLeftMs`），伺服器檢查真的到了（`GRACE_MS` 寬限）；主持人可以隨時送（提早結束要先過確認框；畫面上沒有提早公布的鍵）
- **自動公布**：`answer` 之後，在線上、該猜的人都答了就直接 `revealTurn`；有人離開／被移出也會檢查一次
- 主題由主持人的手機從 `T.themes` 抽，跟 `startGame`／`nextRound`／`theme` 一起送過來（伺服器不存各語言的主題）

## 前端（`app/app.js`）

- 四個畫面 `home`／`join`／`room`／`error`。房間只有一個畫面，`render()` 依 phase 開關 `[data-show="..."]` 的區塊；`#view-room.is-host` 決定 `[data-host]`（主持人按鈕）和 `[data-player]`（只給玩家的提示）
- **畫布** `#canvas`（正方形）：`strokes` 陣列，`redraw()` 整張重畫，有 `highlightId` 時先畫淡掉的其他人（alpha 0.14）再畫亮的那位。自己畫的先畫在本機，`myStrokeIds` 給復原用。重畫用 `requestAnimationFrame` 節流（Claude 的預覽窗格在背景時 rAF 不會跑，量畫布像素前要先觸發 resize）
- `init()` 放在檔案最後：上面的 `var`（畫布、筆色、倒數）要先賦值
- `myAnswers` 記自己這一位猜了什麼（重連後還顯示得出來）
- 結束遊戲是紅色 `.end-btn`、按住 0.8 秒（照你畫我猜接力），跟「再玩一次」都放在分數卡片外面（設計系統頁 13 的擺放規則）
- 畫布區 `.board` 不給選取（`user-select: none`），不然手機畫到一半長按會反白

## GA4

測量 ID 跟全站共用，`send_page_view: false`，`app.js` 依畫面送 page_view（`/sneaky-artist/{lang}/{home|join|room|error}`）。事件前綴 `sneaky_artist_`，在房間裡的都帶 `room_id`：`room_created`（`mode`、`draw_seconds`）、`player_joined`（`host`）、`game_started`（`player_count`、`mode`）、`round_started`（`round_number`、`player_count`）、`round_finished`（畫完一張看到分數，主持人送；`round_number`、`player_count`）、`game_ended`（`rounds`、`player_count`）、`room_closed`。
