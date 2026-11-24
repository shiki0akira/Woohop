/* 帶領指南：情境主圖（列表與文章頁）、列表頁的分類篩選（單選：點哪一類就只看那一類）；
 * 文章頁：遊戲連結塊畫上插圖、章節列表（寬螢幕一直展開，窄螢幕收合、點了章節就收起來）、捲到哪一段就標哪一項。 */
(() => {
  const { nav, esc, GAMES, artSvg } = window.Site;
  nav();
  document.querySelectorAll('.guide-hero[data-scene]').forEach(el => { el.innerHTML = window.Woohop.guideScene(el.dataset.scene); });
  document.querySelectorAll('.guide-link .art[data-art]').forEach(el => {
    const g = GAMES.find(x => x.key === el.dataset.art);
    el.innerHTML = artSvg(el.dataset.art);
    if (g) el.closest('.guide-link').style.setProperty('--game', g.color);
  });

  const toc = document.querySelector('.article-toc');
  if (toc) {
    const details = toc.querySelector('details');
    const wide = matchMedia('(min-width: 1100px)');
    const sync = () => { details.open = wide.matches; };
    sync();
    wide.addEventListener('change', sync);
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const heads = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
    links.forEach(a => a.addEventListener('click', () => { if (!wide.matches) details.open = false; }));
    // 目前這一段＝標題已經進到畫面上方三分之一的最後一個；還沒到第一段就不標
    let ticking = false;
    const mark = () => {
      ticking = false;
      let cur = -1;
      heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top < innerHeight / 3) cur = i; });
      // 捲到底：最後一段可能矮到標題到不了那條線，直接標最後一項
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = heads.length - 1;
      links.forEach((a, i) => {
        a.classList.toggle('is-active', i === cur);
        if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }
  const filter = document.getElementById('guide-filter');
  if (!filter) return;
  // 寫好的文章（一排一篇）和下面的即將推出清單一起篩；即將推出整塊沒有符合的就藏起標題
  const cards = [...document.querySelectorAll('#guides-root [data-type]')];
  const soon = document.getElementById('guide-soon');
  filter.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    filter.querySelectorAll('.chip').forEach(c => {
      const on = c === b;
      c.setAttribute('aria-pressed', String(on));
      c.innerHTML = (on ? '<svg><use href="#i-check"/></svg>' : '') + esc(c.textContent);
    });
    cards.forEach(card => { card.hidden = b.dataset.type !== 'all' && card.dataset.type !== b.dataset.type; });
    if (soon) soon.hidden = !soon.querySelector('li:not([hidden])');
  });
})();
