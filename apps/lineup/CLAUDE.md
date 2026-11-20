# 數字默契排排站（apps/lineup）

房間型合作遊戲：主持人開房（設人數上限），大家掃**同一個** QR code 加入，主持人在大廳選每人 1～3 張牌。每一輪先抽三個主題大家投票，
決定之後伺服器發給每個人（含主持人）不重複的 1～100 祕密數字。大家用主題裡的東西形容自己的數字，在手機上把牌依序排進去，
全部排好之後主持人可以拖曳換順序，接著到翻牌頁一張一張翻（牌的主人翻），比前面任何一張小就是排錯，最後展開整排看排錯幾張。玩法與設計決策在 `CONCEPT.md`。

2026-11-20 照兩真一假（`apps/truths`，那邊照偷渡畫家、搶答）複製出來：單一 Worker 同時服務靜態檔與 Durable Object、網頁走首頁代理但 API／WebSocket 直連 workers.dev、
`scripts/build.js` 產生各語言靜態頁、頭像與暱稱共用 `web100-profile`、返回鍵與離開房間的做法都一樣，**細節與理由看 `apps/buzzer/CLAUDE.md`**。
（同一天先做過不開房間、主持人手機一次出一個 QR 的版本放在 `apps/warmup/games/lineup`，老闆試玩後說主持人要兩支手機不好，改成房間版，那份刪掉了，主題庫搬過來。）

⚠️ **還沒上線、只有繁中**（`app/strings.js` 與 `src/worker.js` 的 `LANGS`），老闆確認後補 7 語、接首頁（`/web100-launch-check`）。
`public/` 還沒有 og 縮圖（上線時 `node scripts/og-image.mjs lineup`）。

## 指令

```bash
npm install
npm run build
npm test          # test/*.test.js（src/game.js：發牌、對錯、投票、拖曳）
npm run dev:lan   # 本機＋區網（手機測試），launch.json 的 lineup-dev，port 8794
npm run deploy
```

本機多人測試：同一個網址的分頁共用 `localStorage` 的 clientId，會被當成同一個人。用不同網址開（`localhost` 與 `127.0.0.1`），
或用 Node 直接連 WebSocket 當機器人玩家（`hello` → `vote` → `place` → 輪到自己 `flip`）。

## 檔案

- `src/worker.js`：路由（`/lineup/api/rooms` 建房帶 `hostId`、`lang`、`maxPlayers`（人數上限 2～15，預設 10）），照兩真一假
- `src/room.js`：`LineupRoom`（Durable Object），狀態機與訊息處理
- `src/game.js`：不碰 DO 的規則——發牌（`dealCards`／中途補發 `dealTo`）、翻牌對錯（`judge`）、投票（`tallyVotes`）、拖曳（`moveTo`）、每人最多幾張（`maxPerPlayerFor`）
- `app/`：`app.js`、`app.css`、`template.html`、`rules.html`、`strings.js`＋`locales/`，`header.js`、`avatars.js`、`partials/` 照兩真一假

## 房間（`src/room.js`）

- **phase**：`lobby` → `voting`（三個主題投票）→ `playing`（排）→ `reveal`（一張一張翻，翻完就是結果）→ `nextRound` 回 `voting`。合作遊戲不計分
- **人數上限**（`room.maxPlayers`）開房時定（老闆 11/20：開房設人數，不然會誤會）。**每人幾張**（`room.perPlayer`）主持人在大廳／投票時用 `setPerPlayer` 改。
  一整排最多 30 張（`MAX_CARDS`）：人數 × 張數放不下就不給選（`maxPerPlayerFor`：每人 3 張最多 10 人），人變多時自動降一級
- **投票**：主持人的手機抽三個主題的「第幾個」送上來（`startGame`／`nextRound` 帶 `topics`）。在線上的人都投了就決定（`decide`），主持人也可以先按「開始」（`decide` 訊息）。**誰投了什麼不廣播**（老闆 11/20），state 只有 `round.voted`（幾個人投了），自己投的在 `you.vote`。
  票最多的，平手隨機（`tallyVotes`）。決定的時候才發牌。⚠️ 每支手機照自己那份 `T.topics` 顯示（`index % T.topics.length`），補外語時長度不用一樣（同一間房語言一樣）
- **牌**：`room.cards = { 主人id.第幾張: { owner, n } }`。開始之後才加入的人：`playing` 時 `dealTo` 補發，`voting` 時等決定一起發，`reveal` 時下一輪才有
- **排**：`place` 只能排自己的牌，接在最後面（＝從第一格往後填）。`moveTo`（拖曳換順序）**只有主持人**，其他照順序往後擠
- **翻**：主持人按 `reveal` 開始（還有牌沒排進去，客戶端先問；沒排的這一輪不算）。`flip` 由下一張的主人送，主持人也可以（主人離線時）。
  state 的 `round.line` 只有翻開的那幾張有 `n`、`ok`（比前面翻開的每一張都大；老闆 11/20：10、31、13、19 的 19 也算錯），`round.wrong` 是排錯幾張
- **broadcast 是逐條連線送的**：`{ t: 'state', state, you }`。`you.cards`（自己的牌：`id`、`n`、`at` 排在第幾格）只給那支手機；⚠️ 沒翻開的數字**不能出現在 state**（`round.n` 是第幾輪）
- 有人走掉／被移出：牌收回、從那一排拿掉（翻到一半的話 `flipped` 跟著調），票也拿掉

## 前端（`app/app.js`）

- 四個畫面 `home`／`join`／`room`／`error`。房間只有一個畫面，`render()` 依 phase 開關 `[data-show]`；`#view-room.is-host` 決定 `[data-host]`／`[data-player]`
- **開房**照喜好二選一：設計系統的 `.stepper` 設人數上限。**每人幾張**在大廳，分段選項 `.seg`（照終極密碼的密碼範圍），放不下的選項鎖起來
- **手機和電腦都一頁放得下、不能捲**（老闆 11/20）：房間裡的 gap、panel 內距比全站小，`@media (max-height: 740px / 760px)` 再縮牌。375×667、1280×720 都量過
- **投票卡**：題目＋橫的一排「1 越不想做（例：寫報告）←→ 100 越想做（例：出國玩）」，不顯示誰投了。**主題卡**排的時候只有題目和「1 越小 ←→ 100 越大」，沒有骰子
- **那一排**：`.lu-row` 一排 6 格（grid）、不左右滑，格子照這一輪張數先畫好，空格是虛線框，方塊一律正方形（`--slot`）。自己的牌直接顯示數字。⚠️ class 不能叫 `.chip`、`.slot`（全站 woohop.css／game.css 已經有，會被套到奇怪的樣式），用 `lu-` 開頭
- **我的牌**：數字直接看得到（老闆 11/20，原本要按住），排進去前後一樣大（固定 `--hand-size`）。`handKey` 沒變就不重畫。**全部排上去之後整塊收起來**
- **主持人換順序**：拖曳或點一張、再點要放的位置。拖的時候原本那格換成虛線框（`.is-holder`），牌變成 body 上跟著手指走的 `.lu-ghost`，手指在哪張的左／右半邊，虛線框就插到它前／後面（老闆 11/20：看得出放進哪個位置）。
  ⚠️ move／up 掛在 window（原本那格離開 DOM，事件不會冒泡到 list）。拖到一半不重畫那一排（`dragging`）
- **翻牌頁**（老闆 11/20：「排好了」之後是另一頁）：一次一張大牌（剛翻開的那張，顯示對錯和「前面最大的是幾」），下面一排點是進度。全部翻完停 `EXPAND_DELAY_MS` 再展開整排＋結果
- 新的一輪震一下（`navigator.vibrate`），螢幕保持亮著（`wakeLock`）
- **沒有配樂**（房間型遊戲先不用配樂），頂欄也沒有音符鍵

## GA4

測量 ID 跟全站共用，`send_page_view: false`，`app.js` 依畫面送 page_view（`/lineup/{lang}/{home|join|room|error}`）。事件前綴 `lineup_`，在房間裡的都帶 `room_id`：
`room_created`（`max_players`）、`player_joined`（`host`）、`game_started`（`player_count`、`per_player`）、
`revealed`（全部翻完，主持人送；`round_number`、`cards`、`wrong`、`per_player`、`topic`）、`room_closed`。
