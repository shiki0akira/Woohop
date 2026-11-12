# 秒數挑戰（apps/warmup/games/seconds）

一支手機傳著玩：手機出一個目標秒數，大家輪流點一下開始、再點一下停，數字前幾秒看得到之後就消失，看誰最接近。
玩法與設計決策在 `CONCEPT.md`，這裡只記跟程式碼直接相關的事。

建置與部署跟其他暖場遊戲共用（`apps/warmup`，見那裡的 CLAUDE.md）。2026-11-12 參考福杯滿溢的結構寫的。

⚠️ **目前只有繁體中文**（`app/strings.js` 的 `LANGS` 只有 `zh-TW`），還沒接首頁、還沒部署。老闆確認繁中版之後才跑 `/web100-launch-check`。
⚠️ 上線時首頁 `vercel.json` 要多一條 `/seconds/vendor/qrcode.js`（跟倒放猜猜看一樣，QR code 用的）。
⚠️ **`apps/warmup` 整包一起部署**：還沒上線之前要部署別的暖場遊戲，先把這個資料夾暫時搬出 `games/`（並刪掉 `dist/seconds`），
不然會跟著上到 workers.dev。

## `app/app.js` 的結構

- **兩種玩法** `prep.mode`：`one` 輪流按（一支手機傳）／`each` 一起按（每人一支，老闆 11/12）。
  一起按**沒有伺服器**（照倒放猜猜看的 `#rec`）：開場選了一起按，`syncMode()` 就產生種子（3 個英文字母）、在開場畫 QR code（網址 `#c=代碼`，代碼＝種子＋看得到幾秒，例 KMQ2）。
  掃進來的手機在檔案最後解析 `location.hash`，走 `enterAsPlayer()` 直接進 play（返回鍵回開場；網址的 # 拿掉）。
  開場的「我是來按的，只要計時器」**不用代碼**（老闆 11/12：又不是房間遊戲）：`enterAsTimer()`，`each.free`，只計時、不出目標、不算差多少（目標聽主持人念）
  每一輪的目標是 `targetFor(種子, 第幾輪)`（FNV-1a 雜湊，每台瀏覽器算的一樣），**不要改成 Math.random**，不然大家的秒數會不一樣。
  一起按的主持人按完會多一顆紅色「按住，結束遊戲」（`end-each`，按住 0.8 秒，老闆 11/12），結束畫面 `showEachEnd()` 只寫玩了幾輪（沒有頒獎台，照著念換 `leadEachEnd`），
  「再玩一次」回開場換新的 QR code（種子清掉）。掃進來的人、只要計時器的人沒有結束鍵。一起按不收成績（大家亮手機比）、沒有配樂（`syncMusic` 只在 one 播）；QR code 只在開場（跟倒放一樣，開始之後不再出現）
- **一步一步帶**：`setup`（遊戲人數 2～20（只有輪流按）、數字看得到幾秒 1～3、怎麼玩（老闆 11/12：放在看得到幾秒下面））→ `rules` → `play` → `end`（頒獎台＋排名，**沒有拉霸**，老闆 11/12）→「再來一輪」回 `play`。
  步驟頭（`Leader.lead`）只在開場、說明規則、看結果；`play` 手機在大家手上傳，不放
- **play 分四段** `setPhase()`：`draw`（抽目標秒數的動畫）→ `ready` → `running` → `done`（按了幾秒、差多少；評語 11/12 拿掉了）→「傳給下一位」回 `ready`；最後一位（`isLast()`：按過的人數到了開場設定的人數）那顆鍵變成「看結果」。
  哪段露哪些區塊由 CSS 看 `#view-play` 的 `data-phase`
- 時間用 `performance.now()`，結果四捨五入到 0.01 秒。`MIN_PRESS_MS` 250ms 內又按停當成手滑、歸零
- **數字淡掉用 `setTimeout(prep.peek 秒)`，不要放回 rAF 裡判斷**：rAF 在背景、省電、預覽窗格裡會停，數字就不會消失（開發時實際踩到）
- `results` 照順序記每個人按了幾秒，排名在 `showEnd()` 依差距排。**前三名站上設計系統的頒獎台**（`renderPodium()`，woohop.css 的 `.podium`，照幸福賓果的結算：中間第一名黃色加皇冠、第二名藍、第三名橘），第 4 名以後接 `.rank-list`（名次從 4 開始）。差最多的人不另外標（沒有懲罰；老闆 11/12：清單用一般的白底）
- **聲音**：配樂照搬竹筍那首（固定 112 BPM），`syncMusic()` 一個地方決定，**`running` 時一定停**（老闆 11/12：會被拿來數拍子）。
  開始／停各一聲 `beep()`，直接接 destination。靜音鍵問題照全站做法：`Leader.onAudioReset`、打開聲音時 `Leader.resetAudio()`。
  音符鍵一顆管配樂和提示音（locale 的 `soundLabel` 是「聲音」），存 `localStorage` 的 `woohop-seconds-settings`
- 輪到誰、計時數字、結果收在一張底卡 `.clock-card`（老闆 11/12）。數字每一位一個底塊（`setClock()` → `paintTiles()`，小數點沒有底塊；位數變了才重建，平常只換字），問號那層用同樣位數，淡掉時寬度不跳
- 手機上玩的那一屏**不捲動**（`app.css` 的 `@media (max-width: 760px)`，底卡吃掉剩下的高度、內容置中）
- 返回鍵：開場直接回找遊戲；有人按過或正在計時先跳確認，照 02／03 的 history 處理

## GA4

`send_page_view: false`，由 `app.js` 在畫面切換時送 page_view，路徑是 `/seconds/{lang}/{setup|rules|play|end}`。

| 事件 | 時機 | 參數 |
|---|---|---|
| `seconds_game_started` | 開始一輪（含再來一輪）；一起按是主持人開 QR code | `game_number`、`mode`（one／each）、`players`（只有 one）、`peek_seconds` |
| `seconds_joined` | 一起按：掃 QR code 進來 | `peek_seconds` |
| `seconds_game_ended` | 一起按的主持人按住結束遊戲 | `game_number`、`mode`（each）、`rounds`、`peek_seconds` |
| `seconds_round_ended` | 最後一位按完、按「看結果」 | `game_number`、`players`、`best_diff`、`peek_seconds` |

**刻意不送每一次按停的事件**：一輪十幾個人，每次送一筆會把資源洗掉（跟定時炸彈、福杯滿溢同一個結論）。
