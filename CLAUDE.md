# web100_05_TimeBomb

一台手機傳著玩的定時炸彈，Web100 系列第五個專案。畫面出一題、做完按完成（做不出來按跳過）、傳給下一個人，爆在誰手上誰就是這一輪的輸家。

系列整體架構（子路徑策略、網址結構規則、共用 design tokens、repo 命名）在 `web100_00_Homepage` repo 的 `ARCHITECTURE.md`。玩法與規則推演在 `CONCEPT.md`，題庫的內容準則在 `QUESTIONS.md`。這裡只記跟程式碼直接相關的事。

## 這個專案是單機的，不要「順手」補上連線

02、03、04 都是 Durable Object 房間 + 每人一台手機。**這裡刻意不是。** 決策與代價寫在 `CONCEPT.md` 2.1，重點是實體傳遞那個動作就是遊戲的樂趣本體。之後如果想加連線版，先回去讀那一節，不要當成「還沒做完的功能」補上。

連帶結果：

- 沒有後端、沒有 `src/`，**執行期零依賴**（唯一的 npm 套件是開發用的 wrangler）
- 部署在 Cloudflare Workers，但 `wrangler.jsonc` **沒有 `main`**——assets-only Worker，一行 Worker 程式都沒有。02～04 那個 `main` 是為了 Durable Object 與 API 存在的，這裡兩者都沒有，補一個只會把請求原樣轉給 ASSETS 的 fetch handler 只是多一層可以寫錯的東西
- 純前端卻走 Workers 是 `ARCHITECTURE.md` 第 4 節那條規則的例外，理由寫在新增的 4.1
- 也**不需要**02～04 那套「網頁走代理、API 與 WebSocket 直連」的繞道——沒有 API 也沒有長連線
- 本機開發是 `wrangler dev`，跟線上走同一套資源服務規則（目錄補 index.html、找不到回 404）

## `app/app.js` 裡最容易做壞的三件事

**1. 計時用絕對截止時刻，不要累加。** `startRound()` 一開始就把引爆時刻算成 `Date.now() + …` 存進 `round.deadline`，之後只是反覆比對。改成每秒把計數器加一的話，手機鎖屏或切到別的 App 時計時器會被節流甚至停掉，症狀是「把手機收進口袋再拿出來，炸彈永遠不爆」。`visibilitychange` 回前景時會立刻再比對一次，背景期間就過期的話當場爆炸。

**2. 滴答的加速用「最長時間」當分母，不是實際引爆時間。** 見 `scheduleTick()`。用實際時間的話，滴答一定會在爆炸前加速到最快，等於把刻意藏起來的倒數用聲音演出來（`CONCEPT.md` 2.2 藏秒數的理由就全白費了）。

**3. 那兩顆分類按鈕只建一次，之後走 `syncPickUi()` 就地更新。** 原本每次勾選都重建整塊 DOM，結果是鍵盤使用者按空白鍵的當下焦點跟著被刪掉的節點消失，而且連續改動時後面的事件打在已經脫離文件、狀態停在舊值的節點上，`settings` 會跟畫面對不起來。畫面永遠是 `settings` 的投影，不要反過來從 DOM 讀狀態。

其他幾個小地方：

- 「完成」與「換一題」走同一個 `advance()`，按下的當下會**先確認一次引爆時刻**再換題。少了這一步，在 200ms 的檢查間隔裡按下去會先換到下一題、下一個瞬間才爆，看起來像爆在錯的人手上
- `AudioContext` 綁在「開始遊戲」那一下建立／`resume()`，不是頁面載入時——自動播放限制要求它在使用者手勢裡。**沒有音效開關**，要安靜就關手機音量（CONCEPT.md 2.8）
- 「換一題」平常是收合 + `disabled` 的，同一題停滿 **5 秒**才由 `armStuckHint()` 掛上 `.show-skip` 滑進來（提示文字同時換掉），換題時 `setStuck(false)` 重置。一開始就擺兩顆的話，那顆鍵會從救生圈變成捷徑（CONCEPT.md 2.7）。⚠️ CSS 的 class 名還是 `.pass-skip` / `.show-skip`，跟顯示文案脫鉤，改文案時不用動它們
- 「再玩一輪」牌堆**接著發、不重洗**；重洗的話剛出過的題目可能馬上又回來

## 返回鍵

照系列規則：設定畫面直接退出；**遊戲進行中**按返回先跳確認。爆炸畫面例外，直接回設定——那時候這一輪已經結束，返回鍵不會讓任何東西消失。

做法是開始遊戲時 `pushState` 一格，返回鍵先吃掉它；`onPopState` 判斷當前畫面決定要攔還是放行。要離開時**先切回設定畫面再 `history.back()`**，`onPopState` 才會走 `'setup'` 那條直接 return，不會又推一格回去。`history.length` 不會隨著反覆按返回而增長（測過）。

**自訂題目彈窗也吃一格 history**：開的時候 `pushState`，返回鍵就是「關掉彈窗」而不是離開網站（設定畫面的返回鍵本來就是直接退出，少了這條，在彈窗裡按返回會連整個遊戲一起關掉）。`onPopState` 的第一件事就是判斷彈窗開著沒有，開著就只關彈窗。

⚠️ 收掉那一格的時機**不要掛在 `<dialog>` 的 `close` 事件上**——那個事件在各家 WebView 的支援度不一致（開發時用的內嵌瀏覽器就完全不發，連自己 `createElement` 出來的 dialog 也不發），漏發一次就多留一格，返回鍵得多按一次才離得開。做法是每條關閉路徑（「完成」、返回鍵、Esc）各自收掉那一格，由 `customOpen` 這個旗標擋掉「同一次關閉被兩條路徑各收一次」。`isCustomOpen()` 也讀旗標，不讀 DOM 的 `open` 屬性。反覆開關十次 `history.length` 不變（測過）。

## 題庫（`app/questions.js`）

90 題 × 8 種語言，分五個分類（`talk` / `voice` / `quickfire` / `gesture` / `interact`），`CATEGORY_GROUPS` 把它們分成兩組。

**設定畫面上只有分組那兩顆按鈕，五個分類完全不露出。** `scripts/build.js` 的 `questionsFor()` 只把 `group` 送到前端，`app.js` 收不到 `category`——想在畫面上用到分類的話，要先改 build 那邊，不要在前端自己重做一次對應表。

- `familiar: true` 是 `QUESTIONS.md` 的 ※ 記號，只有 2 題。**現在沒有開關**（CONCEPT.md 2.4），欄位留著當標記，`npm test` 守著「剛好 2 題」
- **有兩題不能直譯**：`voice.dialectFruits`（台語）與 `quickfire.threeCities`（不能有重複的字），要換成當地等價的說法。`test/questions.test.js` 會擋下把它們改回直譯的修改
- 漏翻、id 重複、分類不存在由 `checkQuestions()` 在 build 時擋；文字重複、分類題數、※ 題數由 `npm test` 擋

自訂題目存在 `localStorage` 的 `web100-bomb-custom`（帶的是 `group`，不是 `category`），**只有輸入時的那一種語言**，不翻譯。設定存在 `web100-bomb-settings`。深淺色（`web100-theme`）與語言（`web100-lang` / `web100_lang` cookie）沿用系列共用的 key，不要自己發明。

## 引爆時間的選項在 `scripts/build.js`

`TIMER`（`minOptions` / `maxOptions` / `presets` / 預設值）的**單一來源在 build 腳本裡**，build 時內嵌成 `window.BOMB.timer`。`app.js` 不自己另外寫一份——兩邊各有一份的話，改了選項卻忘了改預設值，就會出現「預設值不在選項裡、五顆按鈕一顆都沒亮」。`checkTimer()` 會在 build 時擋下這種組合。

設定畫面平常**只露出 `presets` 那三顆區間**，最短／最長那兩排收在「自訂區間」底下（CONCEPT.md 2.2）。`checkTimer()` 一起守著三件事：每顆預設的 min/max 都真的在選項裡、max 不小於 min、而且 `defaultMin`/`defaultMax` 剛好等於其中一顆——最後這條漏了的話，一打開三顆都不亮，看起來像「還沒選」。

- 預設按鈕上只寫區間本身（「30 秒–2 分」），不取名字，所以加一顆預設**不用動 locales**
- 存檔的區間對不到任何預設時，`loadSettings()` 會強制把「自訂區間」展開
- 「最長」小於「最短」的選項直接 `disabled`（壓扁樣式），不是選了再跳錯誤
- ⚠️ 那一排是 `.seg-3`，字級與換行規則跟 `.seg-4` / `.seg-5` **不一樣**（見「配色 / UI」）

## 前端結構

沒有 bundler。三個畫面（設定／進行中／爆炸）在同一份 HTML 裡靠 `showScreen()` 切換，共用同一個網址。自訂題目是**同一頁的 `<dialog>`，不是第四個畫面、也不是另一個網址**——開一個 `/bomb/{lang}/custom/` 的話，那是八種語言各多一頁「只有兩個輸入框、幾乎沒有內文」的頁面進 sitemap，正是 2026/8 那次被演算法降權的樣態（`app/strings.js` 開頭）。順帶也不用回首頁的 `vercel.json` 補白名單。

- **文案唯一來源是 `app/strings.js` + `app/locales/`**。`scripts/build.js` 用它替換 `template.html` 的 `{{token}}`，每個語言各產生一份靜態頁，同時把該語言內嵌成 `window.BOMB.T`。對不到值的 token 會**直接讓 build 失敗**
- 題庫只內嵌「這一頁那個語言」的文字，不是八種全帶
- `/bomb/` 沒帶語言時由 `app/redirect.html` 在瀏覽器裡判斷（localStorage → cookie → 瀏覽器語言 → zh-TW）。前幾個專案是 Worker 回 302，這裡沒有後端，所以那一頁是 `noindex` + canonical 指向預設語言頁——它回的是 200，不 noindex 的話 Google 會當成重複內容

## 配色 / UI

色票、圓角、間距全部來自 `https://www.vibeweb100.com/design-tokens.css`（外部引用，**不要把變數複製進這個 repo**）。`app.css` 裡不寫死 hex。

- `app.css` 從開頭到「定時炸彈專屬」那條分隔線之間，是跟 00～04 共用的元件（導覽列、按鈕、表單、彈窗、頁尾）。**不要在這個檔案裡覆寫它們**，要改就回去改共用的那份，六個專案一起動
- 設定畫面那兩顆按鈕（`.pick-button`）的色組與立體語言，數值跟 03_PreferenceMatch 的 O／X 鍵完全相同。問答型固定 Primary、動作型固定 Secondary，兩個主題都一樣——不能改用 `--btn-face`，它在淺色模式是 Secondary，問答型會跟著變粉色
- ⚠️ `.seg-3`（三顆引爆區間）**不能跟 `.seg-4` / `.seg-5` 共用 `.seg-item` 的尺寸**：它放的是「30 Sek.–2 Min.」這種兩段式文字，德文在 375px 下量出來剛好把 92px 的格子塞滿、貼死框線。所以那一排單獨降一階字級（0.8rem）、`white-space: normal`、`height: auto` + `min-height: 44px`，讓德文在破折號後折成兩行。修改預設區間或新增語言時，**這一條要在 375px 用德文實測**
- 「開始遊戲」（`.btn-start`）是 `position: sticky; bottom`，捲動時黏在畫面底部（CONCEPT.md 2.14）。它靠的是祖先都沒有 `overflow: hidden`——`main` / `.view` 現在都沒有，之後要在那兩層加 overflow 前先想一下這顆鍵
- 深淺色用 `<html class="light">` 表示淺色，深色是預設值。class 掛在 `<html>` 而不是 `<body>`：決定主題那段 script 在 `<head>` 就要跑完，那時 `<body>` 還不存在
- 頁尾那條分隔線要**滿版**：寬度限制下在 `.footer-inner`，不是 `<footer>` 本身
- 導覽列在 420px 以下才隱藏標題（量過的臨界點，別往上調）；語言下拉在 520px 以下縮到 124px，那條規則**一定要放在基礎 `select` 規則之後**
- 按鈕的立體／壓扁語言、disabled 的配色都照 `ARCHITECTURE.md` 第 7 節，不要改成疊 `opacity`
- 跳過鍵的滑入動畫用 flex + `max-width`，不是 `grid-template-columns` 的 `fr` 內插：`fr` 的下限是 min-content，收到 `0fr` 還是文字寬度，壓成 `minmax(0, 0fr)` 又會讓德文的「Überspringen」展開後被切掉
- ⚠️ `.pass-row .pass-bar` 那條**一定要 `:not(.pass-skip)`**。「換一題」也帶著 `.pass-bar`，不排除的話它的特異性會蓋掉 `.pass-skip` 的 `flex: 0 0 auto`，兩顆就長成一樣寬
- ⚠️ **`skipButton` 的文案要短**：那顆鍵是 `flex: 0 0 auto` + `nowrap`，寬度由文字決定，「完成」只能撿剩下的。德文一度是「Andere Aufgabe」，375px 下量出來 154px vs 主鍵 131px，主次直接顛倒（改成「Wechseln」後是 105 vs 180）。**新增或修改語言時，這一條要在 375px 實測**：單字或 3～4 個中日韓字為上限

## GA4

測量 ID `G-S7PE5687BG`，跟首頁與系列其他專案共用同一個資源。

- `send_page_view: false`，改由 `app.js` 在**畫面切換**時手動送。三個畫面共用同一個網址，靠自動送只會記到一筆。路徑是 `/bomb/{lang}/{setup|play|boom}`，規則頁是 `/bomb/{lang}/rules/`
- 自訂事件一律加 **`bomb_` 前綴**（阿瓦隆是 `avalon_`、搶答是 `buzzer_`）——整個系列共用一個 GA4 資源，沒有前綴就分不出是哪個遊戲的
- 事件清單：`bomb_game_started`（`groups` / `deck_size` / `min_seconds` / `max_seconds`）、`bomb_round_ended`（`duration_seconds` / `tasks_done` / `tasks_skipped`）、`bomb_custom_added`（`group`）
- **刻意不送每一題的事件**：一輪抽幾十題，每題送一次會把整個資源洗掉，而且「抽了幾題」已經在 `bomb_round_ended` 裡了

## SEO

- `sitemap.xml` 由 build 自動產生在 `/bomb/sitemap.xml`，不用手動維護
- 首頁的 `vercel.json` 已經用白名單接好 `/bomb/*`，`robots.txt` 也掛上了 `/bomb-sitemap.xml`。**改路徑或多一個頁面時要回首頁補一條 rewrite**，不然本機測得到、線上 404
