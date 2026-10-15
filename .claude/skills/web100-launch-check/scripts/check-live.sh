#!/usr/bin/env bash
# 線上頁面與中繼標籤的批次檢查。
#
# 用法：bash check-live.sh https://www.vibeweb100.com/match "zh-TW en de fr ja ko es zh-CN"
#
# 一律用 curl 直接抓內容，不看瀏覽器畫面——部署完瀏覽器很容易還在拿快取，
# 用畫面判斷「線上是不是新版」會誤判。

set -u

BASE="${1:?用法: check-live.sh <正式網址前綴，例如 https://www.vibeweb100.com/match> [語言清單]}"
LANGS="${2:-zh-TW en de fr ja ko es zh-CN}"
ROOT="$(echo "$BASE" | sed -E 's#(https?://[^/]+).*#\1#')"

pass=0
fail=0

ok()   { printf '  ok   %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  FAIL %s\n' "$1"; fail=$((fail+1)); }

code() { curl -s -m 20 -o /dev/null -w '%{http_code}' "$1"; }
body() { curl -s -m 20 "$1"; }

echo "對象：$BASE"
echo

echo "── 頁面狀態 ──"
for lang in $LANGS; do
  c=$(code "$BASE/$lang/")
  [ "$c" = "200" ] && ok "$lang 首頁 200" || bad "$lang 首頁 $c"
done

c=$(code "$BASE/$(echo "$LANGS" | awk '{print $1}')/rules/")
[ "$c" = "200" ] && ok "規則頁 200" || bad "規則頁 $c"

echo
echo "── 轉址與錯誤頁 ──"
redirect=$(curl -s -m 20 -o /dev/null -w '%{redirect_url}' "$BASE/")
case "$redirect" in
  *"/$(echo "$LANGS" | awk '{print $1}')/"*) ok "不帶語言會轉到預設語言（$redirect）" ;;
  '') bad "不帶語言的路徑沒有轉址" ;;
  *) ok "不帶語言會轉址 → $redirect" ;;
esac

c=$(code "$BASE/zzz-not-a-real-path/")
[ "$c" = "404" ] && ok "亂打路徑回 404" || bad "亂打路徑回 $c（應該是 404）"

echo
echo "── 中繼標籤（以預設語言為樣本）──"
first=$(echo "$LANGS" | awk '{print $1}')
html=$(body "$BASE/$first/")

echo "$html" | grep -q "<title>" && ok "有 title" || bad "沒有 title"
echo "$html" | grep -q 'name="description"' && ok "有 description" || bad "沒有 description"

canonical=$(echo "$html" | grep -o 'rel="canonical" href="[^"]*"' | sed 's/.*href="//;s/"//')
case "$canonical" in
  "$BASE/$first/") ok "canonical 指向自己（$canonical）" ;;
  *workers.dev*)   bad "canonical 指到 workers.dev（$canonical）——會把權重導離正式網域" ;;
  '')              bad "沒有 canonical" ;;
  *)               bad "canonical 是 $canonical，預期 $BASE/$first/" ;;
esac

hreflang_count=$(echo "$html" | grep -c 'rel="alternate" hreflang=')
lang_count=$(echo "$LANGS" | wc -w)
if [ "$hreflang_count" -ge "$((lang_count + 1))" ]; then
  ok "hreflang $hreflang_count 條（含 x-default）"
else
  bad "hreflang 只有 $hreflang_count 條，預期至少 $((lang_count + 1))"
fi

for tag in og:title og:description og:url; do
  echo "$html" | grep -q "property=\"$tag\"" && ok "有 $tag" || bad "缺 $tag"
done

# og:image 單獨講：這個系列的主要分享管道是 LINE，沒有縮圖影響很大
if echo "$html" | grep -q 'property="og:image"'; then
  ok "有 og:image"
else
  bad "缺 og:image —— 分享到 LINE/FB 不會有縮圖預覽"
fi

echo
echo "── sitemap 與 robots ──"
c=$(code "$BASE/sitemap.xml")
[ "$c" = "200" ] && ok "專案 sitemap 200" || bad "專案 sitemap $c"

robots=$(body "$ROOT/robots.txt")
slug=$(basename "$BASE")
if echo "$robots" | grep -qi "$slug-sitemap\|$BASE/sitemap"; then
  ok "robots.txt 有列出這支 sitemap"
else
  bad "robots.txt 沒列這支 sitemap（GSC 也要另外提交，兩件事都要做）"
fi

echo
echo "通過 $pass 項，失敗 $fail 項"
[ "$fail" -eq 0 ] || exit 1
