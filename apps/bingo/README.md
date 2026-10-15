# web100_04_HappyBingo

Woohop 系列第 4 個小遊戲：**幸福賓果**，找人配對的破冰賓果卡。

每個人拿到一張賓果卡，格子裡不是數字，而是「會彈奏樂器的人」「今年第一次來小組的人」這種描述句。組員在聚會現場走動、找到符合描述的人，對方在自己手機上按下確認，那一格才算打勾；連成主持人指定的條數就獲勝。不用下載 App、不用註冊帳號——主持人建立房間後分享 QR code，其他人掃碼填名字就能玩。

主要情境是幸福小組／團契的破冰與迎新。**兩個人就玩得起來**：規則不限制重複找同一個人。

正式網址：`https://www.vibeweb100.com/bingo/{lang}/`（已上線，8 種語言）

## 技術

- 前端：純 HTML / CSS / JS，無框架、無 bundler
- 後端：Cloudflare Workers + Durable Objects（WebSocket 房間狀態）
- 靜態頁與 API 由**同一個 Worker** 提供（Wrangler assets binding），WebSocket 與網頁同源
- 跟系列前三個專案最大的差別：這裡是**完全非同步**的，沒有「全場同一題」的節奏。每個人一張排列不同的卡，隨時送出配對請求、隨時收到別人的請求，所以廣播分成「大家一樣的」與「只有自己的」兩截（見 `src/room.js` 的 `broadcast()`）

## 開發

```bash
npm install
npm run dev
```

`npm run dev` 會先跑 `scripts/build.js`（依 `app/strings.js` 與 `app/questions.js` 產生靜態頁），再啟動 `wrangler dev`。手機要連進來測的話用 `npm run dev:lan`。

Windows 上第一次跑 `wrangler dev` 會跳防火牆詢問，**監聽的是 `workerd.exe` 不是 node**，要放行的是那一個。

## 測試

```bash
npm test
```

`test/bingo.test.js` 顧的是連線判定的算術。重點不是「程式會不會炸」，而是把 CONCEPT.md 第三節那張門檻表釘死——那些數字決定了各尺寸的獲勝連線數上限，算錯的話會開放出「連 4 條跟連 5 條一樣難」這種無意義的設定，而畫面上完全看不出來。表格用兩條獨立的路徑各算一次（枚舉線的組合求最小聯集 vs 窮舉所有打勾組合）互相對照。

```bash
npm run test:smoke
```

`test/smoke.mjs` 需要先跑起 `npm run dev`，它會開一間真的房間、接四條 WebSocket，走完「建房 → 加入 → 設定 → 發卡 → 配對 → 婉拒／取消／確認 → 連線達標 → 中途加入 → 結束 → 再玩一輪 → 關房」。核心是「甲送出請求、乙在自己的裝置上確認」，至少要兩條獨立連線才驗得出來，用瀏覽器手動開分頁點不完。

預設連 `http://127.0.0.1:8789`（用 `BINGO_URL` 可以改）。**不要改成 `localhost`**：Node 會優先解析成 IPv6 的 `::1`，但 wrangler dev 只綁 IPv4，症狀是整支測試開頭就 `fetch failed`，看不出真正的原因。

## 語言

**目前只出 zh-TW 與 en**，跟系列其他專案的 8 種不一樣。vibeweb100.com 從 2026-08-06 起被 Google 演算法降權，判斷成因是大量機器翻譯頁面命中 scaled content abuse 的樣態；在排名回復之前，新專案一口氣多出十幾頁機翻內容等於在復原期加碼同一個風險訊號。

要補語言時：`app/locales/` 加一個檔 + `app/strings.js` 的 `LANGS` 加代碼 + `LOCALE_LABELS` 加名字 + `src/worker.js` 的 `LANGS` 一起改 + `app/questions.js` 的每一題補上該語言。key 少了或多了、題目漏翻，`npm run build` 都會直接失敗。

## 文件

- 玩法、規則推演與所有設計決策：`CONCEPT.md`
- Woohop 系列整體架構：monorepo 的 `docs/ARCHITECTURE.md`
