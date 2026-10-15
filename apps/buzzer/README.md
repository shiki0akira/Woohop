# web100_02_BuzzerGame

Web100 系列第 2 個小遊戲：**現場搶答工具**。

多人在同一場合（聚會、教學、公司活動）用手機搶答。不用下載 App、不用註冊帳號——主持人建立房間後分享 QR code，其他人掃碼輸入暱稱就能玩。

正式網址：`https://www.vibeweb100.com/buzzer/{lang}/`

## 技術

- 前端：純 HTML / CSS / JS，無框架
- 後端：Cloudflare Workers + Durable Objects（WebSocket 房間狀態）
- 靜態頁與 API 由**同一個 Worker** 提供（Wrangler assets binding），WebSocket 與網頁同源

## 開發

```bash
npm install
npm run dev
```

`npm run dev` 會先跑 `scripts/build.js`（依 `app/strings.js` 產生各語言的靜態頁），再啟動 `wrangler dev`。

## 文件

- 這個 repo 的架構決策與注意事項：`CLAUDE.md`
- Web100 系列整體架構：`web100_00_Homepage` repo 的 `ARCHITECTURE.md`
