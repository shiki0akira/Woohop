/*
 * 產生分享縮圖（og:image）：每個語言一張 1200×630 的 PNG。
 *
 *   node scripts/og-image.mjs          首頁 → apps/homepage/og/{lang}.png
 *   node scripts/og-image.mjs bomb     定時炸彈 → apps/warmup/games/bomb/public/og/{lang}.png
 *
 * 各遊戲改版成 Woohop 新設計時，在下面的 TARGETS 加一筆（標題兩行＋那個遊戲的插圖）。
 *
 * 用本機的 Chrome／Edge 無頭模式截圖，所以**不在 Vercel 建置時跑**；改了首頁標語或插圖之後，
 * 手動跑一次 `node scripts/og-image.mjs`，把產生的 PNG 一起 commit。
 * 版面（2026-10-23 改成「置中安全區」）：標題、一句話、插圖都放在中間 630×630 的正方形裡，
 * Woohop 標誌在左上、網址在右下，底下鋪首頁同款的淡色 W 圖案。LINE 的小卡會把縮圖置中裁成正方形，
 * 這樣裁完內容還是完整的。舊的左右排版留著（OG_LAYOUT=side），比較用。
 */
import { writeFileSync, mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
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
/*
 * 插圖的描邊：網站上的卡片插圖約 160px 寬、描邊 4px；縮圖把插圖放大到 500px 左右，描邊卻是固定像素（non-scaling-stroke），
 * 照原本的 4px 看起來會太細（2026-10-23 使用者回報）。跟著放大倍率加粗，但不完全等比，免得線比圖搶眼。
 */
// 首頁主視覺本來就畫得大（viewBox 530 寬），照倍率算只有 4px，跟遊戲插圖一比太細，給它自己的 stroke
const ogStroke = (T) => T.stroke || Math.max(4, Math.round(4 * (T.artWidth / Number(T.viewBox.split(" ")[2])) * 0.7));
// 空白要寫 \s：之前少了反斜線（s*），名稱最後一個字母是 s 的（Reto al revés）會被吃掉
const splitTitle = (t) => { const m = t.match(/^(.+?)\s*[:：]\s*(.+)$/); return m ? [m[1], m[2]] : [t, '']; };
const TARGETS = {
  home: async () => ({
    out: path.join(ROOT, 'og'),
    title: (lang) => [STRINGS[lang].heroTitle1, STRINGS[lang].heroTitle2],
    scripts: ['hero-art.js'], art: 'window.heroArt()', viewBox: '0 0 530 380', artWidth: 560, stroke: 6,
  }),
  bomb: async () => {
    const { STRINGS: B } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'bomb', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'bomb', 'public', 'og'),
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
  // 阿瓦隆的文案在 JSON（React 專案）：分享標題 seo.ogTitle 用「 - 」分成遊戲名＋一句話
  avalon: async () => {
    const read = (lang) => JSON.parse(readFileSync(path.join(ROOT, '..', 'avalon', 'src', 'locales', `${lang}.json`), 'utf8'));
    return {
      out: path.join(ROOT, '..', 'avalon', 'public', 'og'),
      title: (lang) => { const [a, b = ''] = read(lang).seo.ogTitle.split(/\s+-\s+/); return [a, b]; },
      scripts: [], art: 'window.Woohop.art.avalon()', viewBox: '0 0 160 128', artWidth: 500,
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
  // 竹筍竹筍蹦蹦出：apps/warmup/games/bamboo/app/strings.js 的 LANGS
  bamboo: async () => {
    const { STRINGS: Bm, LANGS: BL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'bamboo', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'bamboo', 'public', 'og'),
      langs: BL,
      title: (lang) => splitTitle(Bm[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.bamboo()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  // 果園菜園動物園（apps/warmup/games/orchard/app/strings.js 的 LANGS）
  orchard: async () => {
    const { STRINGS: Om, LANGS: OL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'orchard', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'orchard', 'public', 'og'),
      langs: OL,
      title: (lang) => splitTitle(Om[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.orchard()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  // 倒放猜猜看（apps/warmup/games/reverse/app/strings.js 的 LANGS）
  reverse: async () => {
    const { STRINGS: Rm, LANGS: RL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'reverse', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'reverse', 'public', 'og'),
      langs: RL,
      title: (lang) => splitTitle(Rm[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.reverse()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  // 比手畫腳（apps/warmup/games/charades/app/strings.js 的 LANGS）
  charades: async () => {
    const { STRINGS: Cm, LANGS: CL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'charades', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'charades', 'public', 'og'),
      langs: CL,
      title: (lang) => splitTitle(Cm[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.charades()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  // 木頭人動作版（apps/warmup/games/statue/app/strings.js 的 LANGS）
  statue: async () => {
    const { STRINGS: Tm, LANGS: TL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'statue', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'statue', 'public', 'og'),
      langs: TL,
      title: (lang) => splitTitle(Tm[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.statue()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
  // 上樓下樓（apps/warmup/games/stairs/app/strings.js 的 LANGS）
  stairs: async () => {
    const { STRINGS: Sm, LANGS: SL } = await import(pathToFileURL(path.join(ROOT, '..', 'warmup', 'games', 'stairs', 'app', 'strings.js')).href);
    return {
      out: path.join(ROOT, '..', 'warmup', 'games', 'stairs', 'public', 'og'),
      langs: SL,
      title: (lang) => splitTitle(Sm[lang].heroTitle),
      scripts: [], art: 'window.Woohop.art.stairs()', viewBox: '0 0 160 128', artWidth: 500,
    };
  },
};
const which = process.argv[2] || 'home';
if (!TARGETS[which]) throw new Error('不認得的對象：' + which + '（可用：' + Object.keys(TARGETS).join('、') + '）');
const T = await TARGETS[which]();
// OG_LAYOUT=side：舊的左右排版（比較用）；OG_OUT 可以改輸出到別的資料夾
const LAYOUT = process.env.OG_LAYOUT || 'center';
const OUT = process.env.OG_OUT || T.out;
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
  .copy { position: absolute; left: 76px; top: 70px; bottom: 70px; width: 580px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-family: "Fredoka", sans-serif; font-weight: 700; font-size: 64px; line-height: 1; color: var(--indigo-edge); letter-spacing: -0.01em; }
  .brand svg { width: 78px; height: 63.5px; }
  h1 { margin: auto 0; word-break: keep-all; font-size: 80px; line-height: 1.18; font-weight: 900; color: #22222c; letter-spacing: -0.01em; }
  h1 span { display: block; color: #3D54B6; }
  h1, h1 span { text-wrap: balance; }
  .url { align-self: flex-start; padding: 10px 20px; border: 2px solid #22222c; border-bottom-width: 6px; border-radius: 999px; background: #fff; font-family: "Fredoka", sans-serif; font-weight: 600; font-size: 26px; color: #22222c; }
  .art { position: absolute; right: 30px; top: 50%; width: ${T.artWidth}px; transform: translateY(-50%); }
  .art svg { display: block; width: 100%; height: auto; --ill-sw: ${ogStroke(T)}px; }
  /* 置中版（預設）：遊戲名＋一句話＋插圖都在中間 630×630 的正方形裡，兩側只放品牌和網址（被裁掉也沒關係） */
  .og.center .brand { position: absolute; left: 56px; top: 48px; font-size: 44px; gap: 10px; }
  .og.center .brand svg { width: 54px; height: 44px; }
  .og.center .url { position: absolute; right: 56px; bottom: 48px; font-size: 22px; }
  .og.center .mid { position: absolute; left: 285px; width: 630px; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; }
  .og.center h1 { margin: 0; font-size: 76px; max-width: 590px; }
  .og.center h1 span { font-size: 0.42em; line-height: 1.3; margin-top: 6px; }
  .og.center .art { position: static; transform: none; width: 400px; margin-top: 6px; }
</style>
</head>
<body>
${LAYOUT === 'center' ? `<div class="og center">
  <svg id="tiles" aria-hidden="true"></svg>
  <div class="brand"><svg viewBox="0 0 59 48"><use href="#w" fill="#7489E6"/></svg>Woohop</div>
  <div class="url">vibeweb100.com</div>
  <div class="mid">
    <h1 id="title">${esc(t1)}<span>${esc(t2)}</span></h1>
    <div class="art"><svg id="art" viewBox="${T.viewBox}"></svg></div>
  </div>
</div>` : `<div class="og">
  <svg id="tiles" aria-hidden="true"></svg>
  <div class="copy">
    <div class="brand"><svg viewBox="0 0 59 48"><use href="#w" fill="#7489E6"/></svg>Woohop</div>
    <h1 id="title">${esc(t1)}<span>${esc(t2)}</span></h1>
    <div class="url">vibeweb100.com</div>
  </div>
  <div class="art"><svg id="art" viewBox="${T.viewBox}"></svg></div>
</div>`}
<script src="${asset('woohop-art.js')}"></script>
${T.scripts.map((f) => `<script src="${asset(f)}"></script>`).join('')}
<script>
  document.getElementById('art').innerHTML = ${T.art};
  // 背景：首頁主視覺同款的淡色 W 圖案，鋪滿整張
  // 背景的 W 比首頁主視覺大一點（2026-10-23 使用者要求放大 120%），縮圖縮小看時才認得出是 Woohop
  const TW = 59 * 2.16, TH = 48 * 2.16;
  let t = '';
  for (let r = -1; r < 630 / TH + 1; r++) for (let c = -1; c < 1200 / TW + 1; c++)
    t += '<use href="#w" x="' + (c * TW - 20) + '" y="' + (r * TH - 30) + '" width="' + (TW + .8) + '" height="' + (TH + .8) + '" fill="#dde3fa"/>';
  document.getElementById('tiles').innerHTML = t;
  // 標語太長（德文、法文）就縮小字級，直到塞進左欄；日文不讓它在詞中間斷行（keep-all），寧可縮小
  const h1 = document.getElementById('title');
  document.fonts.ready.then(() => {
    let size = 80;
    const maxW = document.querySelector('.og.center') ? 590 : 580;
    while (size > 40 && (h1.scrollWidth > maxW || h1.offsetHeight > size * 1.18 * 3 + 4)) h1.style.fontSize = (size -= 2) + 'px';
  });
</script>
</body>
</html>
`;

mkdirSync(OUT, { recursive: true });
const tmp = path.join(os.tmpdir(), 'woohop-og');
mkdirSync(tmp, { recursive: true });
// OG_LANGS=zh-TW,de：只產這幾個語言（比較版面用）
const only = process.env.OG_LANGS ? process.env.OG_LANGS.split(',') : null;
for (const lang of (T.langs || LANGS).filter((l) => !only || only.includes(l))) {
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
