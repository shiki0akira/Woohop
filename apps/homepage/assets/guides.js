/* 帶領指南頁：分類篩選（單選：點哪一類就只看那一類）。文章還沒寫，卡片先不能點。 */
(() => {
  const { nav, esc } = window.Site;
  nav();
  const filter = document.getElementById('guide-filter');
  const cards = [...document.querySelectorAll('#guides-root .guide')];
  filter.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    filter.querySelectorAll('.chip').forEach(c => {
      const on = c === b;
      c.setAttribute('aria-pressed', String(on));
      c.innerHTML = (on ? '<svg><use href="#i-check"/></svg>' : '') + esc(c.textContent);
    });
    cards.forEach(card => { card.hidden = b.dataset.type !== 'all' && card.dataset.type !== b.dataset.type; });
  });
})();
