# 數字默契排排站（apps/lineup）

房間型合作遊戲：主持人開房，大家掃**同一個** QR code 加入，伺服器發給每個人（含主持人）一個不重複的 1～100 祕密數字，每支手機都看到同一個主題。
大家用主題裡的東西形容自己的數字、合力從小排到大，主持人按公布，照數字從小到大一張一張翻，每支手機同步看到誰是幾號。玩法與設計決策在 `CONCEPT.md`。

2026-11-20 照兩真一假（`apps/truths`，那邊照偷渡畫家、搶答）複製出來：單一 Worker 同時服務靜態檔與 Durable Object、網頁走首頁代理但 API／WebSocket 直連 workers.dev、
`scripts/build.js` 產生各語言靜態頁、頭像與暱稱共用 `web100-profile`、返回鍵與離開房間的做法都一樣，**細節與理由看 `apps/buzzer/CLAUDE.md`**。
（同一天先做過不開房間、主持人手機一次出一個 QR 的版本放在 `apps/warmup/games/lineup`，老闆試玩後說主持人要兩支手機不好，改成房間版，那份刪掉了，主題庫搬過來。）

⚠️ **還沒上線、只有繁中**（`app/strings.js` 與 `src/worker.js` 的 `LANGS`），老闆確認後補 7 語、接首頁（`/web100-launch-check`）。
`public/` 還沒有 og 縮圖（上線時 `node scripts/og-image.mjs lineup`）。

## 指令

```bash
npm install
npm run build
npm test          # test/*.test.js（src/game.js 的發數字邏輯）
npm run dev:lan   # 本機＋區網（手機測試），launch.json 的 lineup-dev，port 8794
npm run deploy
```

本機多人測試：同一個網址的分頁共用 `localStorage` 的 clientId，會被當成同一個人。用不同網址開（`localhost` 與 `127.0.0.1`），
或用 Node 直接連 WebSocket 當機器人玩家（`hello` → 等主持人 `startGame`）。

## 檔案

- `src/worker.js`：路由（`/lineup/api/rooms` 建房只帶 `hostId`、`lang`，沒有開房選項），照兩真一假
- `src/room.js`：`LineupRoom`（Durable Object），狀態機與訊息處理
- `src/game.js`：不碰 DO 的規則——一輪發不重複的數字（`dealNumbers`）、中途補發（`pickNumber`）、公布順序（`lineupOrder`）
- `app/`：`app.js`、`app.css`、`template.html`、`rules.html`、`strings.js`＋`locales/`，`header.js`、`avatars.js`、`partials/` 照兩真一假

## 房間（`src/room.js`）

- **phase**：`lobby` → `playing`（主題＋自己的數字）→ `reveal`（一張一張翻）→ `nextRound` 回 `playing`（新數字、新主題）。沒有結束畫面，合作遊戲不計分
- **最少 2 人、最多 15 人**（`MIN_PLAYERS`／`MAX_PLAYERS`），主持人也拿數字
- **數字**：`newRound` 用 `dealNumbers` 一次發給當下所有人。**開始之後才加入的人**：`playing` 時 `pickNumber` 從沒用過的補一個，`reveal` 時不發（下一輪才有）
- **主題是「第幾個」**（`room.topic`，0～999 的整數）：主持人的手機從自己的 `T.topics` 洗牌抽、送上來（`startGame`／`setTopic`／`nextRound` 帶 `topic`），
  每支手機照自己那份 `T.topics` 顯示（`topic % T.topics.length`）。⚠️ 補外語時每個語言的主題庫**長度不用一樣**，但同一間房的人語言一樣（房間帶 `lang`），不會對不上
- **公布**：`reveal` 時排好 `order`（`lineupOrder`），`flip` 一次多翻一張。state 只放翻開的那幾張（`round.flipped`：`{ id, n }`），還沒翻的不能出現在 state
- **broadcast 是逐條連線送的**：`{ t: 'state', state, you }`。`you.number` 只給那支手機；⚠️ `playing` 時 `state` 裡**不能有任何人的數字**（`round.n` 是第幾輪，不是數字）
- 有人走掉／被移出：數字收回、`order` 裡拿掉（翻到一半的話 `flipped` 跟著調）

## 前端（`app/app.js`）

- 四個畫面 `home`／`join`／`room`／`error`。房間只有一個畫面，`render()` 依 phase 開關 `[data-show]`；`#view-room.is-host` 決定 `[data-host]`／`[data-player]`
- **自己的數字按住才看得到**（`pointerdown` 開、`pointerup`／`pointerleave`／`pointercancel` 關；鍵盤按一下切換）。蓋著時數字 `font-size: 0`、只露 `::before` 的「?」
- 主題卡在頁面上、外面**不包 panel**：手機上刻度兩端「越不想收到（例：一包衛生紙）」才放得下一行。例子最好 ≤ 6 個字
- 新的一輪震一下（`navigator.vibrate`），螢幕保持亮著（`wakeLock`）
- **沒有配樂**（房間型遊戲先不用配樂），頂欄也沒有音符鍵

## GA4

測量 ID 跟全站共用，`send_page_view: false`，`app.js` 依畫面送 page_view（`/lineup/{lang}/{home|join|room|error}`）。事件前綴 `lineup_`，在房間裡的都帶 `room_id`：
`room_created`、`player_joined`（`host`）、`game_started`（`player_count`）、`topic_changed`（`round_number`、`topic`）、`revealed`（全部翻完，主持人送；`round_number`、`player_count`、`topic`）、`room_closed`。
