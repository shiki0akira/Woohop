/*
 * 產生分享縮圖（og:image）：每個語言一張 1200×630 的 PNG。
 *
 *   node scripts/og-image.mjs          首頁 → apps/homepage/og/{lang}.png
 *   node scripts/og-image.mjs bomb     定時炸彈 → apps/bomb/public/og/{lang}.png
 *
 * 各遊戲改版成 Woohop 新設計時，在下面的 TARGETS 加一筆（標題兩行＋那個遊戲的插圖）。
 *
 * 用本機的 Chrome／Edge 無頭模式截圖，所以**不在 Vercel 建置時跑**；改了首頁標語或插圖之後，
 * 手動跑一次 `node scripts/og-image.mjs`，把產生的 PNG 一起 commit。
 * 版面：左邊 logo＋首頁標語＋網址，右邊首頁主視覺插圖，底下鋪首頁同款的淡色 W 圖案。
 */
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { LANGS, STRINGS } from '../src/locales.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/*
 * 每個對象：要寫到哪、標題兩行、右邊放哪張插圖（插圖是 woohop-art.js 裡的程式碼字串，在截圖頁裡執行）。
 * 遊戲的標題拆法跟遊戲頁的 h1 一樣：冒號前是遊戲名、冒號後是一句話。
 */
const splitTitle = (t) => { const m = t.match(/^(.+?)s*[:：]s*(.+)$/); return m ? [m[1], m[2]] : [t, '']; };
const TARGETS = {
  home: async () => ({
    out: path.join(ROOT, 'og'),
    title: (lang) => [STRINGS[lang].heroTitle1, STRINGS[lang].heroTitle2],
    scripts: ['hero-art.js'], art: 'window.heroArt()', viewBox: '0 0 530 380', artWidth: 560,
  }),
  bomb: async () => {
    const { STRINGS: B } = await import(pathToFileURL(path.join(ROOT, '..', 'bomb', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'bomb', 'public', 'og'),
      title: (lang) => splitTitle(B[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.bomb()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  match: async () => {
    const { STRINGS: M } = await import(pathToFileURL(path.join(ROOT, '..', 'match', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'match', 'public', 'og'),
      title: (lang) => splitTitle(M[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.match()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  buzzer: async () => {
    const { STRINGS: Z } = await import(pathToFileURL(path.join(ROOT, '..', 'buzzer', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'buzzer', 'public', 'og'),
      title: (lang) => splitTitle(Z[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.buzzer()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  bingo: async () => {
    const { STRINGS: G } = await import(pathToFileURL(path.join(ROOT, '..', 'bingo', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'bingo', 'public', 'og'),
      title: (lang) => splitTitle(G[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.bingo()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
};
const which = process.argv[2] || 'home';
if (!TARGETS[which]) throw new Error('不認得的對象：' + which + '（可用：' + Object.keys(TARGETS).join('、') + '）');
const T = await TARGETS[which]();
const OUT = T.out;
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];
const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error('找不到 Chrome／Edge，無法截圖');

const asset = (f) => pathToFileURL(path.join(ROOT, 'assets', f)).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const page = (lang, [t1, t2]) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@800;900&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="${asset('woohop.css')}" />
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #f4f4f6; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .og { position: relative; width: 1200px; height: 630px; overflow: hidden; }
  #tiles { position: absolute; inset: 0; width: 100%; height: 100%; }
  .copy { position: absolute; left: 76px; top: 70px; bottom: 70px; width: 510px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-family: "Fredoka", sans-serif; font-weight: 700; font-size: 64px; line-height: 1; color: var(--indigo-edge); letter-spacing: -0.01em; }
  .brand svg { width: 78px; height: 63.5px; }
  h1 { margin: auto 0; word-break: keep-all; font-size: 66px; line-height: 1.18; font-weight: 900; color: #22222c; letter-spacing: -0.01em; }
  h1 span { display: block; color: #3D54B6; }
  h1, h1 span { text-wrap: balance; }
  .url { align-self: flex-start; padding: 10px 20px; border: 2px solid #22222c; border-bottom-width: 6px; border-radius: 999px; background: #fff; font-family: "Fredoka", sans-serif; font-weight: 600; font-size: 26px; color: #22222c; }
  .art { position: absolute; right: 30px; top: 50%; width: ${T.artWidth}px; transform: translateY(-50%); }
  .art svg { display: block; width: 100%; height: auto; --ill-sw: 4px; }
</style>
</head>
<body>
<div class="og">
  <svg id="tiles" aria-hidden="true"></svg>
  <div class="copy">
    <div class="brand"><svg viewBox="0 0 59 48"><use href="#w" fill="#7489E6"/></svg>Woohop</div>
    <h1 id="title">${esc(t1)}<span>${esc(t2)}</span></h1>
    <div class="url">vibeweb100.com</div>
  </div>
  <div class="art"><svg id="art" viewBox="${T.viewBox}"></svg></div>
</div>
<script src="${asset('woohop-art.js')}"></script>
${T.scripts.map((f) => `<script src="${asset(f)}"></script>`).join('')}
<script>
  document.getElementById('art').innerHTML = ${T.art};
  // 背景：首頁主視覺同款的淡色 W 圖案，鋪滿整張
  const TW = 59 * 1.8, TH = 48 * 1.8;
  let t = '';
  for (let r = -1; r < 630 / TH + 1; r++) for (let c = -1; c < 1200 / TW + 1; c++)
    t += '<use href="#w" x="' + (c * TW - 20) + '" y="' + (r * TH - 30) + '" width="' + (TW + .8) + '" height="' + (TH + .8) + '" fill="#dde3fa"/>';
  document.getElementById('tiles').innerHTML = t;
  // 標語太長（德文、法文）就縮小字級，直到塞進左欄；日文不讓它在詞中間斷行（keep-all），寧可縮小
  const h1 = document.getElementById('title');
  document.fonts.ready.then(() => {
    let size = 66;
    while (size > 36 && (h1.scrollWidth > 510 || h1.offsetHeight > size * 1.18 * 3 + 4)) h1.style.fontSize = (size -= 2) + 'px';
  });
</script>
</body>
</html>
`;

mkdirSync(OUT, { recursive: true });
const tmp = path.join(os.tmpdir(), 'woohop-og');
mkdirSync(tmp, { recursive: true });
for (const lang of LANGS) {
  const html = path.join(tmp, `${lang}.html`);
  writeFileSync(html, page(lang, T.title(lang)));
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=5000',
    `--user-data-dir=${path.join(tmp, 'profile')}`,
    `--screenshot=${path.join(OUT, `${lang}.png`)}`, pathToFileURL(html).href,
  ], { stdio: 'ignore' });
  console.log(path.relative(path.join(ROOT, '..'), path.join(OUT, lang + '.png')));
}
rmSync(tmp, { recursive: true, force: true });
