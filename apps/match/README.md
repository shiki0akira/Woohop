# web100_03_PreferenceMatch

Web100 系列第 3 個小遊戲：**喜好二選一**，O/X 偏好配對破冰工具。

大家用手機對一系列「同意／不同意」的題目限時作答，結束後自動把全場分成答案最像的小組，並列出每組可以聊的共同話題。不用下載 App、不用註冊帳號——主持人建立房間後分享 QR code，其他人掃碼挑個頭像、填暱稱就能玩。

主要情境是幸福小組／團契聚會的破冰：答完十來題之後，系統直接告訴大家該去找誰聊、有什麼話題可以開口。

正式網址：`https://www.vibeweb100.com/match/{lang}/`

## 技術

- 前端：純 HTML / CSS / JS，無框架、無 bundler
- 後端：Cloudflare Workers + Durable Objects（WebSocket 房間狀態）
- 靜態頁與 API 由**同一個 Worker** 提供（Wrangler assets binding），WebSocket 與網頁同源
- 每題 10 秒的截止判定一律在 Durable Object，前端倒數只是視覺效果

## 開發

```bash
npm install
npm run dev
```

`npm run dev` 會先跑 `scripts/build.js`（依 `app/strings.js` 與 `app/questions.js` 產生 8 種語言的靜態頁），再啟動 `wrangler dev`。手機要連進來測的話用 `npm run dev:lan`。

## 測試

```bash
npm test
```

`test/grouping.test.js` 顧的是配對與分組演算法本身——這段算錯不會報錯，只會結果很怪。

```bash
npm run test:smoke
```

`test/smoke.mjs` 需要先跑起 `npm run dev`，它會開一間真的房間、接 10 個 WebSocket 當玩家，走完「建房 → 加入 → 逐題限時作答 → 分組結果」。分組要 10 個人才看得出來，用瀏覽器手動開十個分頁測不現實。

## 文件

- 玩法、演算法與所有設計決策：`CONCEPT.md`
- Web100 系列整體架構：`web100_00_Homepage` repo 的 `ARCHITECTURE.md`
