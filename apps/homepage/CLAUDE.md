# web100_00_Homepage

Web100 系列的作品集入口首頁。純 HTML/CSS/JS、沒有框架，部署在 Vercel，綁定正式網域 `www.vibeweb100.com`。

原始碼只有一份 `index.html`，但**部署前會經過一道 build**：`scripts/prerender.js` 讀取 `index.html` 裡的 `STRINGS`，為 8 種語言各產生一份 `dist/{lang}/index.html`，補上該語言的 `lang`、`title`、`description`、`canonical`、`hreflang`，並把 hero 與卡片文字直接填進 HTML。沒有這道 build 的話，所有語言會共用同一份中文 title 且內文全空，爬蟲看不到任何內容。`dist/` 不進版控，由 Vercel 建置時產生。

## 先讀這個

完整架構規劃在同一個 repo 的 `ARCHITECTURE.md`，包含子路徑策略、Cloudflare Worker 路由總機規劃、repo 命名慣例、共用 design tokens、網址結構規則。改動任何跟路由/新專案接入有關的東西之前，先看那份文件。

## 這個 repo 的職責

- 網域根目錄 `/` 與各語言首頁 `/{lang}/`
- **暫時**透過 `vercel.json` 的 rewrite 把 `/avalon/*` 代理到阿瓦隆自己的 Vercel 部署（`web100_01_Avalon-Voice`），等 Cloudflare Worker 路由總機做好後這段代理規則要整段移除

## 加新專案時要改的地方（例如加 `web100_02_BuzzerGame`）

1. `index.html` 的 `STRINGS` 物件裡，每個語言都加上新專案的卡片文案（`xxxTitle`、`xxxDesc`、`xxxTag`）
2. `scripts/prerender.js` 的替換規則加上對應的 `fill(...)`，新卡片的文字才會進到靜態 HTML。漏掉的話那張卡片對爬蟲來說是空的——replace 對不到位置時會直接讓 build 失敗，不會靜靜產出空頁面
3. `vercel.json` 的 `rewrites` 加上該專案的代理規則（放在同類規則旁邊即可，語言判斷用的萬用規則在最後，不受影響）。**代理規則要列白名單，不要用 `/xxx/:path*` 全收**：全收的話子專案沒有的網址會回它自己的 404（Vercel 預設那頁或純文字），永遠走不到這個 repo 的 `404.html`。照 `/avalon/*` 的寫法，把語言、實際頁面、靜態資源目錄各列一條，沒列到的自然落回 `dist/404.html`
4. 更新 `ARCHITECTURE.md` 第 9 節的進度追蹤表
5. 更新 `README.md` 最上面的「專案一覽」表格，補上新專案的**正式網址**與 **GitHub 連結**。這張表是對外的入口，專案上線後網址欄要從「未部署」換成實際網址

`sitemap.xml` 不用手動維護，`prerender.js` 會依 `STRINGS` 的語言清單自動產生（含 hreflang）。

## 語言判斷邏輯

- 網址帶語言（`/ja/`）→ 直接用
- 網址沒帶語言（`/`）→ 依序看 `localStorage['web100-lang']`、`web100_lang` cookie，都沒有用預設語言 `zh-TW`
- 使用者手動切換時，`persistLangPreference()` 會同時寫 `localStorage` 跟 `web100_lang` cookie（`path=/`，全站共用）——這個 cookie 名稱跟寫法要跟其他 Web100 專案保持一致，不要各專案各自發明一套

## vercel.json 的規則順序很重要

`/avalon/:path*` 這條代理規則必須排在語言萬用規則（`/:lang(zh-TW|en|...)`）**之前**，不然 Vercel 會先比對到語言規則。以後每加一個新專案的代理規則，都要放在語言萬用規則之前。
