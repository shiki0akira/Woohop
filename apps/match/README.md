# web100_03_PreferenceMatch

Woohop 系列第 3 個小遊戲：**喜好二選一**，O/X 偏好配對破冰工具。

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

## 介面（2026-10 改版成 Woohop 新設計）

照定時炸彈的做法（細節見 `apps/bomb/CLAUDE.md` 的「配色 / UI」），只有淺色：

- 導覽列、頁尾、遊戲內頂欄、按鈕、彈窗、輸入框、頭像、房號都用 Woohop 全站共用的東西：`scripts/build.js` 從 `apps/homepage` 拿 `src/chrome.mjs`（navbar／footer／gameBar）和 assets（woohop.css、site.css、game.css、woohop-art.js、site.js、game.js），複製進 `dist/match/woohop/`。**首頁改了這些檔，這裡要重新 build、部署**
- 線上 `/match/woohop/*`、`/match/og/*` 靠首頁 `vercel.json` 的白名單
- `app.css` 只排這個遊戲自己的版面；跟 woohop.css 撞名的（`.chip`、`.avatar`、`.note`、`.room-code`）都有加限定
- 頂欄模式：進了房間是 `play`（藏玩法分頁、選單、頁尾，遊戲名不能點），其他畫面是 `browse`。返回鍵 `window.gameBack`：首頁回「找遊戲」、出題／填暱稱退一格、房間裡跳離開／關閉確認。房間裡沒有另外的「關閉／離開房間」按鈕（就是返回鍵），主持人／玩家標籤顯示在頂欄右邊（`#game-bar-badge`）
- 配色：代表色粉紫；同意＝薄荷、不同意＝珊瑚（跟插圖 O、X 兩張卡同色）
- 玩法頁刻意精簡：三格一眼資訊、4 步怎麼玩、主持人怎麼帶（照著念＋提醒），不放長文
- 分享縮圖 `public/og/{lang}.png` 用首頁的 `node scripts/og-image.mjs match` 產生

## 文件

- 玩法、演算法與所有設計決策：`CONCEPT.md`
- Woohop 系列整體架構：monorepo 的 `docs/ARCHITECTURE.md`
