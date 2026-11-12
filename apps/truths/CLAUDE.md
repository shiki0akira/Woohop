# 兩真一假（apps/truths）

房間型破冰遊戲：大家同時在自己的手機上寫三件關於自己的事（兩真一假，手機給主題和範例），寫完一次拿出一個人的三句，其他人投哪句是假的。最後看「最會猜」「最會騙」。玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

2026-11-11 照偷渡畫家（`apps/sneaky-artist`，那邊照搶答）複製出來：單一 Worker 同時服務靜態檔與 Durable Object、網頁走首頁代理但 API／WebSocket 直連 workers.dev、`scripts/build.js` 產生各語言靜態頁、頭像與暱稱共用 `web100-profile`、返回鍵與離開房間的做法都一樣，**細節與理由看 `apps/buzzer/CLAUDE.md`**。
（11/10 先做過一支手機傳著玩的版本放在 `apps/warmup/games/truths`，老闆試玩後改成房間版，那份刪掉了，主題庫搬過來。）

**已上線（2026-11-12，8 語）**：Worker `woohop-truths`，首頁 `vercel.json` 照偷渡畫家那一組代理 `/truths/*`。各語言名稱在 `CONCEPT.md` 第七節。
首頁插圖是 `woohop-art.js` 的 `art.truths`（一個眨眼的人頭上三個對話框：兩個打勾、中間一個打叉），分享縮圖 `node scripts/og-image.mjs truths`。
首頁清單手機欄標 **each**（老闆 11/12：照網站實際玩法；玩法頁另外寫了不用手機也能玩），目的 know＋sit。

## 指令

```bash
npm install
npm run build
npm test          # test/*.test.js（src/game.js 的規則邏輯）
npm run dev:lan   # 本機＋區網（手機測試），launch.json 的 truths-dev，port 8793
npm run deploy
```

本機多人測試：同一個網址的分頁共用 `localStorage` 的 clientId，會被當成同一個人。用不同網址開，或用 Node 直接連 WebSocket 當機器人玩家（`hello` → `submit` → `vote`）。

## 檔案

- `src/worker.js`：路由（`/truths/api/rooms` 建房帶 `reveal`（show／hide）、`guessSec`（30／45／60）、`lang`），照偷渡畫家
- `src/room.js`：`TruthsRoom`（Durable Object），狀態機與訊息處理
- `src/game.js`：不碰 DO 的規則——收三句（`cleanEntry`）、洗牌、一組的計分（`scoreTurn`）、兩個獎（`awards`）
- `app/`：`app.js`、`app.css`、`template.html`、`rules.html`、`strings.js`＋`locales/`，`header.js`、`avatars.js`、`partials/` 照偷渡畫家

## 房間（`src/room.js`）

- **phase**：`lobby` → `writing`（大家同時寫，寫好可以 `unsubmit` 改）→ `ready`（大家都寫好了，等主持人 `startGuess`；老闆 11/12：不要突然跳進猜題）→ `guessing`（一次一組）→ `reveal`（公布這一組）→ ⋯⋯ → `ended`（兩個獎）→ `playAgain` 分數歸零回 `writing`
- **最少 2 人、最多 15 人**（`MIN_PLAYERS`／`MAX_PLAYERS`），主持人也是玩家
- **寫**：**不限時**（老闆 11/12）。在線上的人都寫好就進 `ready`（`toReady`）；有人一直寫不完，主持人按「提早開始猜」（`endWriting`，只有主持人能送）直接開始，一個人都沒寫好就回 `nobody_wrote`。
  寫的時候走掉的人，他寫的那組也拿掉（`removePlayer`）
- **猜的順序**：從寫好的人裡隨機排（`startGuessing`），「先保密」模式才不會從順序猜出是誰
- **投**：作者不能投；**時間內都可以改**（老闆 11/12，再投一次就蓋掉）。在線上該投的人都投了**不直接公布**，剩下的時間縮成 `ALL_VOTED_MS` 5 秒（`hurryIfAllVoted`，只縮不加長），state 帶 `turn.allVoted` 給畫面說「馬上公布」
- **公布之後不自動換下一組**，主持人按 `nextTurn`（聊天時間，CONCEPT.md 第三節；偷渡畫家是 5 秒自動換，這裡刻意不同）
- **計分**：每個玩家兩個分數 `guess`（猜對幾次）、`fool`（騙到幾個人），分開排名
- **broadcast 是逐條連線送的**：`{ t: 'state', state, you }`。`state` 大家一樣；`you` 只給那支手機——寫好的三句（重整後還能改）、
  這組是不是我寫的（`isAuthor`，作者的手機還會拿到自己選的 `fake`）、我投了哪句。
  ⚠️ **「先保密」模式在 guessing 時，`state` 裡不能有作者**：`turn.authorId` 是 null，也不給「誰投了」的名單（沒投的那個就是作者），只給 `votedCount`
- 時間到不用 alarm（alarm 拿來清閒置房間）：客戶端倒數到 0 送 `endTurn`，伺服器檢查真的到了（`GRACE_MS` 寬限）

## 前端（`app/app.js`）

- 四個畫面 `home`／`join`／`room`／`error`。房間只有一個畫面，`render()` 依 phase 開關 `[data-show]`；`#view-room.is-host` 決定 `[data-host]`／`[data-player]`
- **寫的那三格**：主題由這支手機自己從 `T.topics` 抽（`drawTopic`，不跟畫面上另外兩個重複），每格可以單獨換。草稿 `draft` 存在 sessionStorage（`woohop-truths-draft-{房號}-{第幾場}`），重整不會不見。
  ⚠️ `buildWriteList()` **只在換主題、新的一場、按「修改」時重畫**，不跟著每次 state 重畫——不然別人一寫好、廣播一來，正在打字的框就被洗掉
- 「修改」：送 `unsubmit`，草稿照送出去的內容還原（範例從主題庫用名字找回來）
- 三句（`renderStatements`）一組只建一次（`dataset.key`），之後只改 class：`is-picked`（自己選的，公布後就不標）、`is-my-fake`（作者手機上自己的假話）、`is-fake`／`is-true`（公布）
- **沒有配樂**（老闆 11/11：房間型遊戲先不用配樂），頂欄也沒有音符鍵

## GA4

測量 ID 跟全站共用，`send_page_view: false`，`app.js` 依畫面送 page_view（`/truths/{lang}/{home|join|room|error}`）。事件前綴 `truths_`，在房間裡的都帶 `room_id`：`room_created`（`reveal`、`guess_seconds`）、`player_joined`（`host`）、`game_started`（`player_count`、`reveal`）、`game_ended`（玩完一場看到結果，主持人送；`rounds`、`player_count`、`turns`）、`room_closed`。
