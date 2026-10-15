#!/usr/bin/env bash
#
# 檢查「整個網域的 404 都倒向首頁那一頁」還成不成立（ARCHITECTURE.md 第 3.1 節）。
# 每次加新專案、或改 vercel.json 的代理規則之後跑一次；部署完才跑，線上規則才是新的。
#
#   bash scripts/check-404.sh
#
# 加新專案時：把它底下亂打的網址加進 WANT_404，把它實際存在的網址加進 MUST_WORK。
set -u
BASE=${1:-https://www.vibeweb100.com}

# 這些都不存在，應該回 404 + 首頁那張 404 頁
WANT_404="
/nope
/zh-TW/nope
/avalon/nope
/avalon/zh-TWkk
/avalon/zh-TW/nope
/avalon/zh-TW/game/nope
/buzzer/nope
/buzzer/zh-TWkk
/buzzer/zh-TW/nope
/match/nope
/match/zh-TWkk
/match/zh-TW/nope
/bingo/nope
/bingo/zh-TWkk
/bingo/zh-TW/nope
/happiness/nope
/happiness/8
/happiness/zh-TWkk
/happiness/w1/zh-TW/nope
/happiness/w8/zh-TW/
/newproject/whatever
"

# 白名單漏列就會從 200 變 404，所以每一條實際存在的路徑都要在這裡
MUST_WORK="
307 /
200 /zh-TW/
200 /404.html
307 /avalon
200 /avalon/zh-TW
200 /avalon/zh-TW/game
200 /avalon/zh-TW/rules
200 /avalon/favicon.svg
200 /avalon-sitemap.xml
302 /buzzer
302 /buzzer/
200 /buzzer/zh-TW/
200 /buzzer/zh-TW/rules/
200 /buzzer/app.js
200 /buzzer/app.css
200 /buzzer/header.js
200 /buzzer/vendor/qrcode.js
200 /buzzer/favicon.svg
200 /buzzer/sitemap.xml
200 /buzzer-sitemap.xml
302 /match
302 /match/
200 /match/zh-TW/
200 /match/zh-TW/rules/
200 /match/app.js
200 /match/app.css
200 /match/header.js
200 /match/vendor/qrcode.js
200 /match/favicon.svg
200 /match/sitemap.xml
200 /match-sitemap.xml
302 /bingo
302 /bingo/
200 /bingo/zh-TW/
200 /bingo/en/
200 /bingo/ja/
200 /bingo/ko/
200 /bingo/de/
200 /bingo/fr/
200 /bingo/es/
200 /bingo/zh-CN/
200 /bingo/zh-TW/rules/
200 /bingo/de/rules/
200 /bingo/app.js
200 /bingo/app.css
200 /bingo/header.js
200 /bingo/vendor/qrcode.js
302 /happiness
302 /happiness/
302 /happiness/3
302 /happiness/h3
200 /happiness/zh-TW/
200 /happiness/w1/zh-TW/
200 /happiness/w7/zh-TW/p/
200 /happiness/w7/zh-TW/h/
200 /happiness/w1/host.js
200 /happiness/w1/art/standards.svg
200 /happiness/shared/room-client.js
200 /happiness/shared/logo.svg
200 /happiness/api/new-room
200 /happiness-sitemap.xml
200 /bingo/favicon.svg
200 /bingo/sitemap.xml
200 /bingo-sitemap.xml
"

fail=0

echo "== 應該回 404 + 首頁那張 404 頁 =="
for u in $WANT_404; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u")
  body=$(curl -s "$BASE$u")
  # id="home-btn" 只有首頁的 404.html 有，用它區分「我們的 404」和「子專案自己的 404」
  case "$body" in *'id="home-btn"'*) page=本站404 ;; *) page=別人的404 ; fail=1 ;; esac
  [ "$code" = 404 ] || { code="$code(該是404)"; fail=1; }
  printf '  %-30s %-16s %s\n' "$u" "$code" "$page"
done

echo
echo "== 這些不能壞 =="
echo "$MUST_WORK" | while read -r want u; do
  [ -z "${u:-}" ] && continue
  got=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u")
  if [ "$got" = "$want" ]; then printf '  %-30s %s\n' "$u" "$got"
  else printf '  %-30s %s（該是 %s）\n' "$u" "$got" "$want"; fi
done

echo
[ "$fail" = 0 ] && echo "404 全部倒向同一頁。" || echo "有沒倒過來的，看上面那組。"
