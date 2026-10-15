# web100_05_TimeBomb

Woohop 系列第 5 個小遊戲：**定時炸彈**，一台手機傳著玩的破冰遊戲。

整場只要**一台手機**，它就是那顆炸彈。畫面出一題——可能是「說一件你這禮拜最感謝的事」，也可能是「用最兇的語氣說『我愛你』」——拿到手機的人當場做完，按下「完成！傳給下一個人」，題目換一道、手機傳給旁邊的人。什麼時候爆是隨機的，畫面上一秒都看不到剩多久；爆在誰手上，誰就是這一輪的輸家。

內建 90 題（問答型 45、動作型 45，設定畫面用兩顆大按鈕選要哪一邊），主持人也可以自己加題目。做不出來的題目等 5 秒會冒出「換一題」，按下去就換一張。不用下載、不用註冊、不用房間代碼，打開網頁就開始。

正式網址：<https://www.vibeweb100.com/bomb/zh-TW/>（已上線，8 種語言）

## 跟系列前幾個專案最大的差別

02、03、04 都是「主持人建房、每人一台手機掃 QR code 加入」的連線架構。**這個專案是單機的**：沒有房間、沒有 WebSocket、沒有後端，整個遊戲就在一份 `app/app.js` 裡跑完。

理由寫在 `CONCEPT.md` 2.1，一句話說完是：手機從你手上塞到旁邊的人手上，那半秒的推拒就是這個遊戲最好笑的地方，改成每人一台等於把它拿掉。

部署平台則跟 02～04 一樣是 Cloudflare Workers，但這裡是**完全沒有 `main` 的 assets-only Worker**——沒有 Durable Object、沒有 API，一行 Worker 程式都不用寫，就只是把 `dist/` 丟上去（`ARCHITECTURE.md` 第 4.1 節）。

## 技術

- 前端：純 HTML / CSS / JS，無框架、無 bundler，**執行期零依賴**（唯一的 npm 套件是開發用的 wrangler）
- 後端：沒有。Worker 沒有 `main`，只有 assets binding
- `scripts/build.js` 依 `app/strings.js` 與 `app/questions.js` 產生 8 種語言 × 2 頁的靜態 HTML，外加 `/bomb/` 的語言轉址頁與 `sitemap.xml`
- 音效（滴答、爆炸）用 Web Audio API 當場合成，不載任何音檔
- 進行中用 Wake Lock API 擋住自動鎖屏

## 開發

```bash
npm run dev
```

`npm run dev` 會先跑 `scripts/build.js`（依 `app/strings.js` 與 `app/questions.js` 產生靜態頁），再啟動 `wrangler dev`。手機要連進來測的話用 `npm run dev:lan`。

用 `wrangler dev` 而不是隨便起一個靜態伺服器，是為了讓本機跟線上走同一套資源服務規則——目錄補 `index.html`、找不到就回 404，這兩件事自己寫的伺服器很容易做得不一樣。

Windows 上第一次跑 `wrangler dev` 會跳防火牆詢問，**監聽的是 `workerd.exe` 不是 node**，要放行的是那一個。

## 測試

```bash
npm test
```

`test/questions.test.js` 顧的是題庫的不變式——不是「程式會不會炸」，而是那幾種**在畫面上完全看不出來**的壞法：兩題文字一模一樣（現場會連出兩張看起來相同的牌）、分類題數跟 `QUESTIONS.md` 對不上、※ 記號的題目變多變少、以及那兩題該在地化的被人順手改成直譯。

漏翻、id 重複、分類不存在這幾種，`npm run build` 本身就會擋（`checkQuestions`），不用等測試。

## 語言

8 種：zh-TW / en / ja / ko / de / fr / es / zh-CN，跟首頁的 `SUPPORTED_LANGS` 一致。

要改文案或加語言時：`app/locales/` 加一個檔 + `app/strings.js` 的 `LANGS` 加代碼 + `LOCALE_LABELS` 加名字 + `app/questions.js` 的每一題補上該語言。key 少了或多了、規則頁的清單長度不一致、題目漏翻，`npm run build` 都會直接失敗。

**文案是逐句照該語言的說法寫的，不是機器直譯**，理由見 `app/strings.js` 開頭。題庫裡有兩題不能直譯（台語、台灣縣市），見 `QUESTIONS.md` 最後一節。

## 部署

```bash
npm run deploy
```

會先 build 再 `wrangler deploy`，上到 <https://web100-05-time-bomb.shiki0akira.workers.dev>。正式網址是首頁的 `vercel.json` rewrite 代理過去的。

首頁那邊已經接好了（白名單列出實際路徑，依 `ARCHITECTURE.md` 第 3.1 節），**改到路徑或多一個頁面時要回去補一條**，不然本機測得到、線上 404。

這個專案**不需要**02～04 那套「網頁走代理、API 與 WebSocket 直連」的繞道——沒有 API 也沒有長連線，靜態頁走代理就夠了。

## 文件

- 玩法、規則推演與所有設計決策：`CONCEPT.md`
- 題庫的內容準則與主持人的替換建議：`QUESTIONS.md`
- Woohop 系列整體架構：monorepo 的 `docs/ARCHITECTURE.md`
