#!/usr/bin/env bash
# 列出系列各專案送出的 GA4 事件，用來對照漏斗有沒有缺口。
#
# 用法：bash ga4-events.sh [web100 根目錄]
#
# 為什麼要對照而不是單看一個專案：漏掉的事件不會報錯、不影響功能，
# 只會讓報表少一段。跟既有專案並排看，缺口才會浮出來。

set -u
ROOT="${1:-$(cd "$(dirname "$0")/../../../.." && pwd)}"

echo "掃描：$ROOT"
echo

for dir in "$ROOT"/web100_*/; do
  name=$(basename "$dir")
  app="$dir/app/app.js"
  # 001 是 React/TS，事件寫在 .ts/.tsx；-o 要用跳脫過的括號括起來，
  # 不然 -name 只綁到最後一個條件，整個專案會被漏掉
  [ -f "$app" ] || app=$(find "$dir/src" "$dir/app" \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | head -60)
  [ -n "$app" ] || continue

  # 各專案的送出方式不一樣（gtag 直呼、track、trackEvent、sendEvent），
  # 所以比對「追蹤呼叫 + 緊接著的字串」。
  # 不能只抓「看起來像事件名的字串」——WebSocket 的錯誤碼（room_full、
  # create_failed…）長得一模一樣，會混進來變成假的事件清單。
  events=$(grep -hoE "(gtag\('event', *|track\(|trackEvent\(|sendEvent\()'[a-z_]+'" $app 2>/dev/null \
    | grep -oE "'[a-z_]+'\$" | tr -d "'" | sort -u)

  [ -n "$events" ] || continue
  echo "$name"
  echo "$events" | sed 's/^/  /'
  echo
done

cat <<'NOTE'
── 漏斗自我檢查 ──
每個遊戲類專案至少要能回答這四題，缺一段就看不出轉換率：

  1. 有多少人開了房間？    <前綴>_room_created
  2. 有多少人真的加入？    <前綴>_player_joined
  3. 有多少房間真的開始？  <前綴>_game_started   ← 最常漏的一個
  4. 有多少玩到看見結果？  <前綴>_results_shown（或等價的結束事件）

規則提醒：
  - 事件名一律加專案前綴，整個系列共用同一個 GA4 資源
  - 只在「做那個動作的那台裝置」上送，照廣播狀態送會一場記十次
  - page_view 手動送，多畫面共用同一個網址時自動送只會記到一筆
NOTE
