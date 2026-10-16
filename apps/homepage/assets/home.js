/*
 * 首頁專用：精簡推薦器（兩個條件、三張卡）、破冰組合、主視覺插圖與 W 底圖、專區插圖、隨機來一個。
 */
(() => {
  const { GAMES, artSvg, finder, combo, nav, track, pageUrl } = window.Site;

  nav();
  finder(document.getElementById('finder-root'), { filters: ['people', 'phones'], limit: 3, moreHref: pageUrl('games') });
  combo(document.getElementById('combo-root'));
  document.getElementById('hero-illo').innerHTML = window.heroArt();
  const faqIllo = document.getElementById('faq-illo'); // 常見問題只有 zh-TW 有
  if (faqIllo) faqIllo.innerHTML = window.faqArt();

  // 隨機來一個：直接打開一個已上線的破冰遊戲（不含即將推出的、不含桌遊助手）
  document.getElementById('hero-random').addEventListener('click', () => {
    const pool = GAMES.filter(g => !g.soon && !g.boardgame);
    const g = pool[Math.floor(Math.random() * pool.length)];
    track('random_game', { game: g.key, source: 'hero' });
    location.href = g.url;
  });

  // 常見問題一次只開一題。<details name="faq"> 新瀏覽器會自己處理，這裡給舊瀏覽器補上同樣的行為
  const faqs = [...document.querySelectorAll('#faq details')];
  faqs.forEach(d => d.addEventListener('toggle', () => { if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; }); }));

  // 專區的插圖與底部一整排淡 W
  document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = artSvg(el.dataset.art); });
  document.querySelectorAll('[data-w-row]').forEach(el => {
    el.innerHTML = [0, 1, 2, 3, 4, 5].map(i => `<use href="#w" x="${i * 59}" width="59" height="48" fill="${el.dataset.wRow}"/>`).join('');
  });

  // 主視覺背景：滿版的 W 陣列，全部用同一個淡藍紫（#dde3fa，2026-10-17 從 #e6eafb 加深一階）；放大 1.8 倍，每顆多畫 0.8px 蓋掉接縫
  const tiles = document.getElementById('hero-tiles');
  const TW = 59 * 1.8, TH = 48 * 1.8;
  const draw = () => {
    const w = tiles.clientWidth, h = tiles.clientHeight;
    const cols = Math.ceil(w / TW) + 1, rows = Math.ceil(h / TH) + 1, ox = (w - cols * TW) / 2, oy = (h - rows * TH) / 2;
    let s = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<use href="#w" x="${ox + c * TW}" y="${oy + r * TH}" width="${TW + 0.8}" height="${TH + 0.8}" fill="#dde3fa"/>`;
    tiles.innerHTML = s;
  };
  draw();
  addEventListener('resize', draw);
})();
