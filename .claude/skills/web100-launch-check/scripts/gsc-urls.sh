#!/usr/bin/env bash
# 列出 GSC 要貼的完整網址：sitemap 一支＋每個語言的遊戲頁與玩法頁（網址審查 → 要求建立索引）。
#
# 用法：bash gsc-urls.sh <路徑代號> [語言清單] [有沒有玩法頁 yes|no]
#   bash gsc-urls.sh sneaky-artist
#   bash gsc-urls.sh bomb "zh-TW en" no
#
# 只輸出網址、一行一個，方便整段複製。會先用 curl 確認每個網址真的是 200，
# 不是 200 的標成「先別貼」——把 404 送去要求建立索引只會在 GSC 留下錯誤紀錄。

set -u

SLUG="${1:?用法: gsc-urls.sh <路徑代號，例如 sneaky-artist> [語言清單] [yes|no]}"
LANGS="${2:-zh-TW en de fr ja ko es zh-CN}"
RULES="${3:-yes}"
ROOT="https://www.vibeweb100.com"

check() {
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1")
  if [ "$code" = "200" ]; then echo "$1"; else echo "$1    ← $code，先別貼"; fi
}

echo "── 1. Sitemap（GSC 左側「Sitemap」→ 新增 Sitemap，貼下面這一行）──"
check "$ROOT/$SLUG-sitemap.xml"
echo
echo "── 2. 網址審查（GSC 上方搜尋列貼一行 → 要求建立索引；一天有配額，先貼 zh-TW 與 en）──"
for lang in $LANGS; do
  check "$ROOT/$SLUG/$lang/"
done
if [ "$RULES" = "yes" ]; then
  for lang in $LANGS; do
    check "$ROOT/$SLUG/$lang/rules/"
  done
fi
echo
echo "── 3. 首頁的遊戲清單有變，順便送這兩頁（新遊戲卡片才會被抓到）──"
check "$ROOT/zh-TW/games/"
check "$ROOT/en/games/"
