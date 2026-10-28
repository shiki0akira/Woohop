# apps/homepage（Woohop 首頁）

Woohop 的網站首頁。純 HTML/CSS/JS、沒有框架，部署在 Vercel（push 到 main 自動部署），綁定正式網域 `www.vibeweb100.com`。2026-10 改版成 Woohop 的新設計，視覺規則以 `design/brand-exploration.html`（設計系統頁）為準。

## 結構

| 位置 | 內容 |
|---|---|
| `src/locales.mjs` | **8 種語言的全部文案**（唯一來源）。遊戲名稱與短介紹跟各遊戲頁的用語一致；`faq` 常見問題只有 zh-TW |
| `scripts/prerender.js` | 建置：為 8 語言 × 4 頁產生 `dist/{lang}/`、`games/`、`combo/`、`guides/`，含 title、description、canonical、hreflang、og、結構化資料、sitemap |
| `assets/woohop.css`、`assets/woohop-art.js`、`assets/hero-art.js` | 從 `design/` 複製的設計系統樣式與插圖（**兩邊要同步改**） |
| `src/chrome.mjs` | **全站共用的導覽列與頁尾（HTML）**。首頁 prerender 與各遊戲的 build（`apps/warmup` 的暖場遊戲、`match`、`buzzer`、`bingo`）都 import 這一份；遊戲 build 也會把 `woohop.css`、`site.css`、`game.css`、`woohop-art.js`、`site.js`、`game.js` 複製進自己的 dist，所以**改這幾個檔案後，已改版的遊戲也要重新 build、部署**才會跟上 |
| `assets/game.js`、`game.css` 的「帶領元件」 | **`window.Leader`：步驟頭、說明規則插圖卡、真心話大冒險拉霸、選主題、抽卡取名、節拍器（含可分開開關的配樂）、倒放錄音機 `Leader.recorder`（2026-10-23 從倒放猜猜看抽出，含播放速度，文字是 locales.mjs 的 `rec*`）、動作抽卡 `Leader.actionCard`／`Leader.actionArt`（2026-10-28 從木頭人動作版抽出：28 個動作的 8 語名稱在 `src/action-cards.mjs`、一個動作一張插圖在 woohop-art.js 的 `Woohop.actionArt`，按鈕文字是 locales.mjs 的 `actionDraw`；`checkActions()` 在建置時擋沒有插圖的代號）**，竹筍、定時炸彈、上樓下樓共用（2026-10-21 抽出）。共用文字在 `src/locales.mjs`（`leadStep`、`slot*`、`theme*`、取名那批），拉霸題目在 `src/slot-prompts.mjs`、名稱庫在 `src/name-pools.mjs`（各遊戲 build 時嵌進當頁語言的那份）。抽卡取名的樣式都掛在 `.namer` 底下，不會跟定時炸彈的 `.pass-row` 打架。之後也打算做成桌遊助手類的獨立小工具 |
| **桌遊助手** `/{lang}/tools/` ＋ 小工具 `tools/truth-or-dare/`、`metronome/`、`names/`、`recorder/`（倒放錄音機，2026-10-23，可調 0.5～2 倍速，GA 事件 `tool_recorder_recorded`、`tool_recorder_played`）、`actions/`（動作抽卡，2026-10-28，輸的人模仿、三連拍，插圖是 `toolActions`（一疊卡、最上面一個問號＋相機，跟木頭人的 `art.statue` 分開），GA 事件 `tool_action_drawn`）、`words/`（抽題目，2026-10-28，勾選類型抽一題，題庫是全站共用的 `src/word-bank.mjs`（比手畫腳同一份，`wordsFor(語言, 用途)` 依 act／draw／say／name 篩題目，`checkWords()` 在建置時檢查），插圖 `toolWords`，GA 事件 `tool_word_drawn`） | 2026-10-22 新增。導覽列的「桌遊助手」改連總覽頁（原本直連阿瓦隆）：阿瓦隆和小工具放同一個格子（橫式卡、寬螢幕一排三個，阿瓦隆排第一），不加分類標籤；數量多了再考慮分類或篩選。小工具本體就是遊戲裡的 `window.Leader`（game.js），頁面程式在 `assets/tools.js`，文案在 `src/tools-strings.mjs`（併進 `s.tools`），`TOOL_GAMES` 決定「也用在這些遊戲」。插圖在 woohop-art.js 的 `toolSlot`／`toolMetronome`／`toolNames`。GA 事件：`tool_slot_pulled`、`tool_metronome_started`、`tool_name_drawn`。抽卡取名 2026-10-28 改成跟抽題目一樣：一進來就能抽、主題收合（預設隨機＝所有主題混著抽）、抽過的列在下面不重複，不用遊戲的 `Leader.namer`（只用 `Leader.themes` 選主題）。加新工具：`PAGES`（chrome.mjs）、`TOOL_KEYS`＋文案、tools.js、vercel.json 的 `:tool(...)` 白名單、`apps/feedback` 的 `GAMES`（聯絡表單「跟哪個遊戲有關」，不在裡面會被當成沒選） |
| **關於我們** `/{lang}/about/`（上面一段介紹、下面是聯絡表單 `#contact`）、**服務條款** `/{lang}/terms/`、**隱私權政策** `/{lang}/privacy/` | 2026-10-22 新增。聯絡我們原本是獨立的 `/{lang}/contact/`，同日併回關於頁（介紹精簡成一段，免費、不用註冊這類交給條款與隱私權政策），`vercel.json` 把舊網址 301 到 `about/`、網址參數照帶，about.js 帶著預設值時捲到表單。頁尾「關於」欄依序：關於我們、服務條款、隱私權政策。服務條款文案在 `src/terms-strings.mjs`（併進 `s.about.terms`），跟隱私權政策共用 `legalPage` 版型。文案在 `src/about-strings.mjs`（併進 `s.about`；執行期只嵌關於頁的 `form`），頁面程式 `assets/about.js`。表單送 `/api/feedback`，`vercel.json` 代理到 `apps/feedback` 的 Worker，寄到 woohop.app@gmail.com（類型的鍵兩邊要一致）。類型：推薦遊戲、修改建議（含回報問題）、合作邀約、其他；「跟哪個遊戲有關」只在修改建議時出現。網址可帶 `?game=bomb` 預選（自動選成修改建議），遊戲頁的「回報問題」可以直接連過來。GA 事件 `feedback_sent`。**隱私權政策要跟網站實際做的事一致**：加廣告（AdSense）、會員註冊、贊助金流、新的第三方服務時要改內容與 `updated` 日期（目前寫「目前不用註冊，之後有會員會是自願的並先更新本頁」）。**小額贊助（買杯咖啡）預留做法**：關於頁加 `id="support"` 區塊放外部贊助連結（不用後端），頁尾「關於」欄加一條連到 `about/#support` |
| `assets/site.css`、`assets/site.js` | 三頁共用的頁面樣式與程式（導覽、語言選單、遊戲卡、推薦器、破冰組合、GA、深淺模式切換） |

**深淺模式（全站）**：頁尾的 `.theme-switch`（chrome.mjs 的 footer）＋ `site.js` 的切換；`<head>` 一開始要放 `chrome.mjs` 的 `THEME_HEAD`（首頁 prerender 與四個遊戲的 build 都已接上，404 與阿瓦隆各有一份同樣的內嵌）。選擇記在 `localStorage web100-theme`。**顏色一律用 woohop.css 的變數**；JS 寫死在 SVG `fill` 屬性的顏色，用 `:root[data-theme="dark"] … use { fill }` 在 CSS 蓋過去（例：主視覺 W 陣列）。
| `assets/home.js`、`games.js`、`combo.js` | 各頁專用 |
| `og/{lang}.png`、`scripts/og-image.mjs` | 分享縮圖（1200×630，每語言一張，用首頁標語＋主視覺）。**版面是「置中安全區」**（2026-10-23）：標題、一句話、插圖都在中間 630×630 裡，LINE 小卡置中裁成正方形也完整；插圖描邊跟著放大倍率加粗（`ogStroke`）。同一支腳本也產生遊戲的縮圖（`node scripts/og-image.mjs bomb` → `apps/warmup/games/bomb/public/og/`），新遊戲改版時在 `TARGETS` 加一筆。**Vercel 建置時不會重產**（沒有瀏覽器）：改了 `heroTitle1/2` 或主視覺插圖後，本機跑 `node scripts/og-image.mjs`，把 PNG 一起 commit |
| `404.html` | 獨立頁（不走 prerender），Woohop 新設計：直接連 `/assets/woohop.css`＋`woohop-art.js`，八語文案內嵌、執行期判斷語言。深淺模式照記住的選擇或裝置（沒有切換鈕） |
| `design-tokens.css` | 舊的配色檔。monorepo 裡已經沒有人引用（阿瓦隆、404 都改版了），但舊專案可能用絕對網址連它，先留著照樣輸出 |

文案在建置時寫進靜態 HTML（給爬蟲），當頁語言的那一份也嵌進 `window.WOOHOP.t` 給執行期 JS 用，兩邊同一個來源。改了 `assets/` 的檔案要換 `prerender.js` 的 `ASSET_VERSION`，瀏覽器才會抓新版。

本機預覽：`node scripts/prerender.js` 之後用 launch.json 的 `homepage-preview`（伺服器開在 `dist/`）。

## SEO 要守的

- 網址不變：`/{lang}/` 是舊網址；`/games/`、`/combo/`、`/guides/` 是改版新增的
- **`/guides/` 目前 noindex、不進 sitemap**：指南文章還沒寫，只有「即將推出」卡片會被當成內容太薄。文章寫好後拿掉 `prerender.js` 的 `NOINDEX`
- 常見問題（`faq`）只有 zh-TW，另外輸出 FAQPage 結構化資料
- 網站名稱 `Woohop`，結構化資料的 `alternateName` 保留 `Web100`
- 幸福模擬器不是遊戲（獨立專案），只出現在首頁專區與頁尾，不進遊戲清單與結構化資料的 ItemList
- 中文長文不硬翻成其他語言（2026/8 降權的成因）

## 加新遊戲時要改的地方

1. `src/locales.mjs` 每個語言的 `games` 加上名稱與短介紹
2. `assets/site.js` 的 `GAMES` 加一筆（人數、時間、手機、目的、代表色）；`prerender.js` 的 `GAME_KEYS` 加上它，才會進靜態清單與結構化資料
3. 插圖加在 `design/brand-exploration.html` 的 `art`，再同步到 `assets/woohop-art.js`
4. 遊戲只做了部分語言（例如竹筍上線第一天只有 zh-TW）：`src/locales.mjs` 的 `GAME_LANGS` 列出有的語言，其他語言的首頁、找遊戲會標成「即將推出」、不連過去，靜態清單與結構化資料也不列
5. `vercel.json` 的 `rewrites` 加該遊戲的代理規則：**列白名單、不要 `/xxx/:path*` 全收**，並排在語言萬用規則之前（理由見 `docs/ARCHITECTURE.md` 3.1）

## 語言判斷

- 網址帶語言 → 直接用，並寫進 `localStorage['web100-lang']` 和 `web100_lang` cookie（`path=/`，全站共用，名稱不要改）
- `/` 沒帶語言 → `vercel.json` 先轉到 `/zh-TW/`；JS 那邊也會依上次選的語言轉（保險）
- 語言選單是一般連結，換語言就是換到另一個語言的同一頁
