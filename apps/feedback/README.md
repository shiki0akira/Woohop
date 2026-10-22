# apps/feedback（Woohop 意見表單）

首頁「關於我們」頁（`/{lang}/about/#contact`）的表單送到這裡：檢查內容後寄一封信到 `woohop.app@gmail.com`。

- 網址：`https://www.vibeweb100.com/api/feedback`（首頁 `vercel.json` 代理到 `woohop-feedback.shiki0akira.workers.dev`）
- 寄信：Email Routing 的 `send_email` binding，只能寄給已驗證的地址（不用 API 金鑰）；寄件人 `feedback@vibeweb100.com`。有留信箱的話放在 Reply-To，Gmail 直接回覆就是回給對方
- 擋垃圾：只收本站 Origin、蜜罐欄位、開頁不到 3 秒就送出的當機器人（假裝成功不寄）、每個來源每分鐘 5 封
- 不存資料庫：信箱本身就是紀錄

```bash
npm test                 # node --test，檢查與信件格式
npx wrangler deploy      # 部署
```

類型的鍵（`recommend` / `bug` / `idea` / `collab` / `other`）跟 `apps/homepage/src/about-strings.mjs` 的 `FEEDBACK_TYPES` 要一致；加新遊戲時 `src/feedback.js` 的 `GAMES` 也要加，不然那個選項會被當成「沒選」。
