# 各項檢查的實際做法

SKILL.md 講的是「要查什麼、為什麼」；這裡是「怎麼查」，包含幾個踩過的坑。

## 目錄

- [部署完看到舊版怎麼辦](#部署完看到舊版怎麼辦)
- [WebSocket 專案怎麼在正式網域驗](#websocket-專案怎麼在正式網域驗)
- [怎麼確認 GA4 真的收到](#怎麼確認-ga4-真的收到)
- [og:image 要補的話怎麼補](#ogimage-要補的話怎麼補)
- [這個系列的架構前提](#這個系列的架構前提)

---

## 部署完看到舊版怎麼辦

**先分辨是「沒部署成功」還是「你的瀏覽器在騙你」。** 這兩件事的處理方式完全相反，搞錯會白改一輪程式碼。

判斷方法只有一個：`curl` 直接抓線上檔案，看內容裡有沒有這次的新東西。

```bash
curl -s https://www.vibeweb100.com/match/app.js | grep -c "你這次新增的函式名"
```

- 抓到了 → 伺服器是新版，是瀏覽器快取。
- 沒抓到 → 真的沒部署上去，回頭看部署有沒有失敗。

瀏覽器這邊即使伺服器回 `Cache-Control: max-age=0, must-revalidate`，行動裝置與內嵌 WebView 還是常常拿舊的。**根治方式是讓資源網址帶內容雜湊**（`app.js?v=<hash>`）：內容變了網址就變，一定是新請求；內容沒變網址不變，快取照樣有效。003 已經這樣做（見 `scripts/build.js` 的 `assetVersion`），新專案照抄。

驗證時如果只是想繞過快取，開一個全新分頁通常比重新整理有效——同一個分頁的記憶體快取很頑固。

## WebSocket 專案怎麼在正式網域驗

**背景**：`www.vibeweb100.com` 是 CNAME 指向 Vercel，沒有走 Cloudflare 代理，而 Vercel 代理外部網址時對 WebSocket 升級的支援不可靠。所以這個系列的 WebSocket 專案採取：

- 網頁（HTML/CSS/JS）由首頁的 `vercel.json` rewrite 代理過來
- **API 與 WebSocket 由客戶端直連 Worker 自己的網址**

客戶端的判斷在 `app/app.js` 的 `API_ORIGIN`：只有頁面從正式網域載入時才跨過去，本機與 workers.dev 都維持同源。

**所以**：拿煙霧測試對著正式網域跑會失敗，因為腳本從網址推導 WS 位址。那是預期行為，不是 bug。要驗真正的流程，在正式網域上用瀏覽器跑：

```js
// 在 https://www.vibeweb100.com/<slug>/<lang>/ 的 console 執行
(async () => {
  document.getElementById('create-room').click();
  await new Promise(r => setTimeout(r, 2500));
  // …依該專案的流程走到進房…
  return {
    API來源: window.MATCH?.workerOrigin,      // 應該是 workers.dev
    房號: document.getElementById('room-code')?.textContent,
    QR: !!document.querySelector('#qr-box svg'),
    成員: document.getElementById('player-list')?.textContent.trim(),
  };
})()
```

要通過的條件：房號出來、QR 畫得出來、名單有人、**console 沒有任何錯誤**。WebSocket 沒連上時通常會在 console 看到一整排 `WebSocket connection to 'wss://…' failed`。

同時確認 Worker 那邊對正式網域開了 CORS（`src/worker.js` 的 `ALLOWED_ORIGINS`），否則建房那支 POST 會被擋。

## 怎麼確認 GA4 真的收到

程式碼裡有 `gtag('event', …)` 不代表資料進得去。三個常見的無聲失敗：測量 ID 打錯、`gtag` 因為擋廣告的擴充套件沒載入、事件寫在永遠不會執行的分支裡。

**能自動查的部分**：在正式網址上實際觸發動作，同時看有沒有真的發出請求。

```js
// 攔截 GA4 的收集請求，然後去跑一輪遊戲
window.__hits = [];
const orig = navigator.sendBeacon?.bind(navigator);
if (orig) navigator.sendBeacon = (url, data) => { window.__hits.push(String(url)); return orig(url, data); };
const of = window.fetch;
window.fetch = (...a) => { const u = String(a[0]); if (u.includes('google-analytics') || u.includes('/g/collect')) window.__hits.push(u); return of(...a); };
'攔截器已裝好，現在去跑一輪，再看 window.__hits'
```

跑完之後 `window.__hits.filter(u => u.includes('en='))` 裡應該看得到事件名（GA4 把事件名放在 `en=` 參數）。

也可以直接確認 `gtag` 存在、測量 ID 對不對：

```js
JSON.stringify({
  gtag有載入: typeof gtag === 'function',
  dataLayer筆數: (window.dataLayer || []).length,
  測量ID: [...document.querySelectorAll('script')].map(s => s.src).find(s => s.includes('gtag/js')),
})
```

**只能請使用者做的部分**：GA4 即時報表。程式端驗過之後，把事件名稱清單交給他，請他開 GA4 →「即時」→ 看事件名稱有沒有出現。這一步無法代勞，所以要明講。

## og:image 要補的話怎麼補

截至目前整個系列（首頁、001、002、003）都沒有 `og:image`。影響最大的是 LINE：分享連結時沒有縮圖，看起來像可疑訊息，點擊率差很多。

補的方式：在 `app/partials/head.html` 加上絕對網址的圖（相對路徑在多數爬蟲不管用），並確保圖片本身是可公開存取的：

```html
<meta property="og:image" content="{{siteOrigin}}{{base}}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

1200×630 是 OG 的通用尺寸。圖放進 `public/`，build 時會一起複製到 `dist/`。

這件事會動到整個系列（每個專案要一張自己的圖），所以**不要自作主張直接做**——先回報，讓使用者決定要不要一次處理，以及圖怎麼生。

## 這個系列的架構前提

驗收時會用到的既有決定，先知道才不會給錯建議：

| 項目 | 現況 |
|---|---|
| 網址結構 | `/{game}/{lang}/...`，遊戲代號在前、語言在後 |
| 語言 | 8 種（zh-TW / en / de / fr / ja / ko / es / zh-CN），2026/8 從 18 種縮下來 |
| 首頁部署 | Vercel |
| 遊戲部署 | 純前端走 Vercel；需要長連線的走 Cloudflare Workers + Durable Objects |
| GA4 | 整個系列共用一個資源，事件靠專案前綴區分 |
| GSC | 用**網域資源**，驗證 TXT 在 Cloudflare |
| Cloudflare Worker 路由總機 | 還沒做，目前由首頁的 `vercel.json` rewrite 代打 |

`web100_00_Homepage/ARCHITECTURE.md` 是這些決定的唯一來源，有疑問以它為準。
