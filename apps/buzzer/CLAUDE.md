# web100_02_BuzzerGame

現場搶答工具，Web100 系列第二個專案。主持人建房、其他人掃 QR code 加入、按鈕搶答即時排名。

系列整體架構（子路徑策略、網址結構規則、共用 design tokens、repo 命名）在 `web100_00_Homepage` repo 的 `ARCHITECTURE.md`。這裡只記跟這個專案直接相關的事。

## 跟規格文件的差異

原始規格是 Google Doc「現場搶答遊戲 Web App - 開發規格文件」。以下三處刻意沒有照做：

- **§4.1 說前端放 Cloudflare Pages、後端另開一個 Worker**，這裡改成**單一 Worker 同時服務靜態檔與 Durable Object**（`wrangler.jsonc` 的 assets binding）。Pages 現在等同 Workers，多切一層只是多一個部署目標，而且靜態頁與 WebSocket 同源、不用處理 CORS
- **§6 說搶答要「帶上 Firebase server timestamp」**，那是舊版架構的殘留。Durable Object 是單執行緒，排名直接用**收到訊息的先後順序**，不比對任何 timestamp。`buzzOrder` 裡的 `timestamp` / `ms` 只拿來顯示「第 2 名慢了 0.3 秒」，不參與排序
- **§8 列為待確認的「主持人重整會不會掉身份」**，已經做掉：`clientId` 存在 localStorage，重新連線送 `hello` 時由 DO 比對 `hostId`，重整後仍是主持人

## 部署

- Cloudflare Workers（不是 Vercel）。需要 WebSocket 長連線，Vercel 的 serverless function 撐不住，這是 `ARCHITECTURE.md` 第 4 節就定好的分流
- `npm run dev` = 先 build 再 `wrangler dev`；`npm run deploy` 同理
- `dist/` 是建置產物，不進版控。**Windows 上 `wrangler dev` 開著時會鎖住 `dist/`**，所以 `scripts/build.js` 的清空步驟遇到 EBUSY/EPERM 會警告後繼續覆寫，不讓 build 失敗
### 正式網域的接法：網頁走代理、API 與 WebSocket 直連

跟阿瓦隆**不一樣**，這點最容易踩雷：

- 網頁（HTML/CSS/JS）由 `web100_00_Homepage` 的 `vercel.json` rewrite 代理過來
- **API 與 WebSocket 不走代理**，客戶端直接連 `web100-02-buzzer-game.shiki0akira.workers.dev`

因為 `www.vibeweb100.com` 是 CNAME 指向 Vercel、沒有走 Cloudflare 代理，而 Vercel 代理外部網址時對 WebSocket 升級的支援不可靠——靜態頁過得去，長連線不一定。

- 判斷在 `app/app.js` 的 `API_ORIGIN`：**只有**頁面從正式網域載入時才跨過去，本機開發、區網測試、直接開 workers.dev 都維持同源
- 因為變成跨來源，`src/worker.js` 對正式網域開了 CORS（`ALLOWED_ORIGINS`）並處理 OPTIONS preflight。加新的 API 路徑時記得一起帶上 `withCors`
- WebSocket 的 101 回應**不要**加 CORS 標頭也不要包裝，要原樣傳回去，否則 `webSocket` 屬性會掉
- 等 Cloudflare Worker 路由總機做好、網域改由 Cloudflare 代理，這整段繞道就可以拿掉

## 這個 Worker 只擁有 `/buzzer/*`

正式網域上其他路徑根本不會進到這個 Worker，所以**所有東西都要待在 `/buzzer/` 底下**——API、favicon、vendor script 都是。要加新路徑時記得帶上這個前綴，不然本機測得到、上線就 404。

- `/buzzer/api/rooms`（POST）建房、`/buzzer/api/rooms/:code`（GET）查存在、`/buzzer/api/rooms/:code/ws` 升級 WebSocket
- `/buzzer/` 沒帶語言時由 Worker 依 `web100_lang` cookie → `Accept-Language` → `zh-TW` 轉址

## 房間狀態（`src/room.js`）

一個房間 = 一個 Durable Object（`idFromName(code)`）。狀態機 `waiting → question_shown → buzzing → buzzed`，重置回 `waiting`。

- **WebSocket 用 Hibernation API**（`ctx.acceptWebSocket`），沒訊息時 DO 可以被卸載。代價是喚醒後記憶體會清空，所以**每次改動都要寫回 storage**，連線身分要放進 `serializeAttachment`，不能只存在 instance 欄位裡
- `saveRoom({ touch: true })` 才會把閒置清除的鬧鐘往後推。**搶答本身刻意不 touch**：一輪搶答前面一定有主持人的動作推過鬧鐘，替最需要低延遲的路徑多寫一次 alarm 不划算
- 玩家斷線**不從名單移除**，只標記離線。手機鎖屏、切 App 都會觸發 close，踢掉會讓主持人的名單一直跳
- 同一個 `clientId` 開多個分頁不特別處理：online 是 Set 會收斂，搶答用 playerId 去重。刻意不去關「舊的」那條連線——在重整與背景喚醒的情境下很容易誤殺還在用的

## 前端（`app/`）

沒有 bundler。四個畫面都在同一份 HTML 裡靠 `showView()` 切換，房間代碼放查詢字串 `?room=XXXX`（QR code 掃進來就是這個網址）。

- **文案唯一來源是 `app/strings.js`**。`scripts/build.js` 用它替換 `template.html` 的 `{{token}}`，每個語言各產生一份靜態頁，同時把該語言內嵌成 `window.T`。對不到值的 token 會**直接讓 build 失敗**，不會靜靜產出半空的頁面；語言之間 key 少了或多了也會擋下來
- 加語言＝`LANGS` 加代碼 + `STRINGS` 加一份 + `LOCALE_LABELS` 加名字，其他都自動（hreflang、sitemap、下拉選單）
- 「我是主持人還是玩家」**不由前端決定**，一律等 DO 在 `welcome` 裡回答
- 主持人的題目輸入框只在連上線後同步**一次**（`questionSynced`）。每次廣播都覆寫的話，會把他正在打的字和游標位置洗掉
- 搶答鍵綁 `pointerdown` 而不是 `click`：click 要等 pointerup，搶答差的就是這幾十毫秒。鍵盤操作另外用 `click` 且 `event.detail === 0` 補上
- QR code 只在網址變的時候重畫，否則每次廣播主持人畫面都會閃

## 頭像

10 個固定的食物頭像，資料在 `app/avatars.js`，build 時整份內嵌成 `window.AVATARS`（約 6KB），
不走圖檔：名單與排名榜會重複用上幾十次，每個都發一次請求不划算。
**不開放上傳**——上傳要處理儲存、審核、版權與兒少風險，對一個現場小工具不划算。

- 每個圖形的最長邊都對齊到 40（viewBox 是 64），並以各自的邊界框中心對齊到 (32,32)，
  十個看起來才一樣大、一樣置中。邊界框 `box` 寫在資料裡，**改動路徑時要重新量**，不然會偏掉
- `src/room.js` 只把頭像當字串存，不驗證是不是那 10 個之一：驗證要把整包 SVG 拉進
  Worker bundle，只為比對一個字串不划算。客戶端對不到就退回預設值
- 暱稱與頭像存在 `web100-profile`，**跟系列其他專案共用同一個 key**，
  玩過喜好二選一的人回來這裡不用重挑。刻意不做帳號系統：現場遊戲的人就在同一個房間裡，
  帳號只會在「免下載免註冊」這個賣點上加摩擦
- 30 個人共用 10 個頭像一定會撞，刻意不處理——旁邊一定有暱稱

## 配色 / UI

色票、圓角、間距全部來自 `https://www.vibeweb100.com/design-tokens.css`（外部引用，**不要把變數複製進這個 repo**）。`app.css` 裡不寫死 hex，唯一例外是 QR code 的白底——掃描率優先，深色模式反白會有相機讀不到。

- 深淺色用 `<html class="light">` 表示淺色，深色是預設值。class 掛在 `<html>` 而不是 `<body>`：決定主題那段 script 在 `<head>` 就要跑完，那時 `<body>` 還不存在
- 導覽列刻意做成跟阿瓦隆一樣：品牌圓鈕 + 標題 + 語言下拉（`<select>`，顯示語言自己的名字）+ 主題圓鈕，寬 600、高 40 的控制項
- 按鈕的立體／壓扁語言、disabled 的配色都照 `ARCHITECTURE.md` 第 7 節，不要改成疊 `opacity`

## GA4

測量 ID `G-S7PE5687BG`，跟首頁、阿瓦隆共用同一個資源。

- `send_page_view: false`，改由 `app.js` 在**畫面切換**時手動送。四個畫面共用同一個網址，靠自動送只會記到一筆，分不出多少人真的開了房間。路徑是 `/buzzer/{lang}/{home|join|host|play|error}`，規則頁是 `/buzzer/{lang}/rules/`
- 自訂事件一律加 **`buzzer_` 前綴**（阿瓦隆是 `avalon_`）——整個系列共用一個 GA4 資源，沒有前綴就分不出是哪個遊戲的
- **事件只在「做那個動作的那台裝置」上送**。狀態是廣播給全場的，照著狀態送的話，一場 10 個人的遊戲會把同一個事件記 10 次
- `buzzer_player_joined` 只算第一次（`joinReported`），`welcome` 每次重連都會來
- `buzzer_buzzed` 等伺服器把名次算回來才送，按了但被判 `too_early` 的不算；一輪一次，回合重置時解鎖（`buzzReported`）

事件清單：`buzzer_room_created`（`max_players`）、`buzzer_player_joined`、`buzzer_game_started`（`player_count`）、`buzzer_round_started`、`buzzer_buzzed`（`place`）、`buzzer_room_closed`。

## SEO

- `sitemap.xml` 由 build 自動產生在 `/buzzer/sitemap.xml`，不用手動維護
- **還沒做**：把這支 sitemap 掛進首頁的 `robots.txt`／sitemap 索引，以及 GA4。等接上正式網域再一起處理
