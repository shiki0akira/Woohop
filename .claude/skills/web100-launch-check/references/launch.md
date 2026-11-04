# 上線（從「老闆確認繁中版」到部署完成）

新遊戲的流程是**先做繁中、老闆試玩確認、才做其他 7 語並上線**。老闆說「OK 上線」之後照這份做，做完接 SKILL.md 的驗收。2026-11-03 你畫我猜接力、11-04 偷渡畫家都是照這個順序同一天上完。

## 目錄

- [先分清楚是哪一種遊戲](#先分清楚是哪一種遊戲)
- [1. 先 commit 已經確認的東西](#1-先-commit-已經確認的東西)
- [2. 補齊 8 語](#2-補齊-8-語)
- [3. 接上首頁](#3-接上首頁)
- [4. 插圖與分享縮圖](#4-插圖與分享縮圖)
- [5. 部署順序](#5-部署順序)
- [6. 文件](#6-文件)
- [常踩的坑](#常踩的坑)

## 先分清楚是哪一種遊戲

| | 暖場型（一支手機或不用手機） | 房間型（每人一支手機，Durable Object） |
|---|---|---|
| 程式在哪 | `apps/warmup/games/{代號}/` | `apps/{代號}/`（照 `apps/buzzer` 開） |
| Worker | 全部共用 `woohop-warmup` | 每個遊戲自己一個（例：`woohop-sneaky-artist`） |
| vercel.json | 白名單 `:game(...)` 那一組加上代號 | 照搶答那一組，每條規則都要（含 `api/`、`vendor/`） |
| 本機預覽 | launch.json 的 `warmup-dev`（8790） | 自己加一組，連接埠往後排 |
| 多人測試 | 不用 | 不同網址（localhost／127.0.0.1／區網 IP）或 Node 寫的 WebSocket 機器人 |

## 1. 先 commit 已經確認的東西

試玩期間順手改到的共用檔（`apps/homepage/assets/*.css`、`game.js` 這些）先提交，跟新遊戲分開兩個 commit，出事比較好退。

## 2. 補齊 8 語

- 語言：`zh-TW en de fr ja ko es zh-CN`。8 語是標準，**不要縮**
- **遊戲名不直譯**：先查各國有沒有相近的遊戲或說法再取（例：畫畫接力 → Picture Telephone、お絵かき伝言ゲーム）。名字和理由寫進該遊戲 `CONCEPT.md` 的「各語言名稱」表
- 文案逐句照該語言的說法寫，不是丟翻譯 API；`{n}` 這種佔位符原樣保留
- 各語言自己挑在地的內容（主題清單、範例），長度不用跟 zh-TW 一樣的清單要寫在 `LIST_KEYS` 以外
- 改動多的話寫一支產生器放在 scratchpad，一次寫出 7 個 `locales/{lang}.js`，build 會檢查 key 一致
- 要接的地方：`app/strings.js` 的 `LANGS`／`STRINGS`（房間型還有 `LOCALE_LABELS`、`src/worker.js` 的 `LANGS` 和語言判斷）

## 3. 接上首頁

照 `apps/homepage/CLAUDE.md`「加新遊戲時要改的地方」，逐項打勾：

- [ ] `src/locales.mjs`：8 個語言的 `games` 加上 `[名稱, 短介紹]`
- [ ] `assets/site.js` 的 `GAMES`：人數、一局幾分鐘、手機（none／one／each）、目的（warmup／know／move／team／sit，可複數）、代表色、`added` 日期
- [ ] `scripts/prerender.js` 的 `GAME_KEYS`；房間型還要加進隱私權政策那句房間遊戲清單（`legal` 裡的 `['buzzer', 'match', 'bingo', ...]`）
- [ ] `vercel.json`：代理規則＋`/{代號}-sitemap.xml`（**列白名單、排在語言萬用規則之前**）
- [ ] `robots.txt`：加 `Sitemap: https://www.vibeweb100.com/{代號}-sitemap.xml`
- [ ] `apps/feedback/src/feedback.js` 的 `GAMES`（聯絡表單「跟哪個遊戲有關」），要部署 feedback Worker
- [ ] 改了 `assets/` 的檔案就換 `prerender.js` 的 `ASSET_VERSION`
- [ ] 改了 `scripts/og-image.mjs` 的 `TARGETS`（見下一段）
- [ ] `node scripts/prerender.js` 跑過，`dist/zh-TW/games/index.html` 找得到新遊戲名

## 4. 插圖與分享縮圖

- 插圖寫在 `design/woohop-art.js` 的 `art['{代號}']`，**同一段複製到 `apps/homepage/assets/woohop-art.js`**（兩份要一樣，用 `git diff` 比對）
- 跟同系列的遊戲要**一眼分得出來**（老闆 11/04：偷渡畫家原本跟你畫我猜接力都是一枝筆，改成兩枝筆畫同一張紙）
- 插圖片段含反引號和 `${}`，**不要用 shell 的 heredoc／node -e 塞**（會被 bash 吃掉、寫進壞掉的程式）：先用 Write 寫成檔案，再用 node 讀檔插入
- 分享縮圖：`scripts/og-image.mjs` 的 `TARGETS` 加一筆，跑 `node scripts/og-image.mjs {代號}`，輸出到該遊戲的 `public/og/`。用 Read 看 zh-TW 和一個長名字的語言（de）確認沒被切到；只重產那一個遊戲，別的遊戲的 PNG 有變就 `git checkout` 回去

## 5. 部署順序

1. **遊戲的 Worker 先上**（暖場：`cd apps/warmup && npm run deploy`；房間型：`cd apps/{代號} && npm run deploy`，第一次會建出新 Worker）
2. 共用檔（`apps/homepage/assets` 的 css／js、`chrome.mjs`）有改到的話，**每個會複製它們的遊戲都要重新部署**：`apps/warmup`、`buzzer`、`match`、`bingo`（新的房間型也算）
3. 有改聯絡表單就部署 `apps/feedback`
4. 最後才 `git push origin main`：首頁靠 Vercel 自動部署，代理規則要等 Worker 已經在了才指得過去
5. 用 `npx wrangler deployments list` 看每個 Worker 的最新部署時間是不是今天

還沒上線的遊戲資料夾（例如別的新遊戲的繁中版）在 `apps/warmup/games/` 裡的話，部署前先**暫時搬出去**，不然會跟著上到 workers.dev。

## 6. 文件

- 該遊戲的 `CONCEPT.md`、`CLAUDE.md`：狀態改「已上線（日期，8 語）」、各語言名稱、GA 事件表
- `docs/ARCHITECTURE.md`：目錄樹＋第 9 節進度表
- `apps/homepage/README.md` 的專案一覽
- `apps/warmup/CLAUDE.md` 的遊戲表（暖場型）
- 記憶裡該遊戲的那則（狀態、commit）

## 常踩的坑

- **內容有反引號（`` ` ``）或 `${}` 時別用 shell 改檔**：bash 會把它當指令執行。插圖、說明文件、模板都一樣，用編輯工具或把內容先寫成檔案再讀進來
- **複製連結在區網 IP 測試時沒反應**：`navigator.clipboard` 只在 https／localhost 才有，要有退回 `execCommand('copy')` 的寫法（偷渡畫家的 `copyText()`）
- **wrangler dev 開著時新增資料夾會 404**：要重開伺服器
- **手機連不到本機**：監聽的是 `workerd.exe`，每個新專案的 workerd 都會重跳防火牆詢問
- **預覽窗格在背景時** `requestAnimationFrame` 不跑、量到的寬度不準：先用 `resize_window` 設成手機尺寸再量
