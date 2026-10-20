/*
 * Woohop 首頁（正式版）的共用程式：導覽列、語言切換、頁尾、遊戲卡片、推薦器、破冰組合、GA。
 * 由 design/site.js（設計稿）改來：文案改讀 window.WOOHOP.t（建置時嵌進來的當頁語言），
 * 網址改成正式路徑（/{lang}/、/{lang}/games/、/{lang}/combo/）。
 * 依賴 woohop-art.js（插圖、表情、W）。
 */
(() => {
  const { W, art, makeFace, body, ground, burst, plus, ring, K } = window.Woohop;
  const { lang, page, t, langs, langNames } = window.WOOHOP;
  const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ================= 語言記憶（跟其他 Woohop 專案共用同一個 cookie 與 localStorage） ================= */
  const remember = l => {
    try { localStorage.setItem('web100-lang', l); } catch { /* 無痕模式等情況，略過 */ }
    document.cookie = `web100_lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };
  // 根目錄 / 沒帶語言：依上次選的語言轉過去（vercel.json 也會先把 / 轉到 /zh-TW/，這裡是保險）
  if (location.pathname === '/' || location.pathname === '/index.html') {
    let saved = null;
    try { saved = localStorage.getItem('web100-lang'); } catch { /* 略過 */ }
    location.replace(`/${langs.includes(saved) ? saved : 'zh-TW'}/`);
    return;
  }
  remember(lang);

  /* ================= 網址 ================= */
  const PATHS = { home: '', games: 'games/', combo: 'combo/', guides: 'guides/' };
  const pageUrl = (p, l = lang) => `/${l}/${PATHS[p]}`;
  const gameLangs = window.WOOHOP.gameLangs || {};
  const gameUrl = key => (key === 'avalon' ? `/avalon/${lang}` : key === 'happy' ? '/happiness/zh-TW/' : `/${key}/${lang}/`);

  /* ================= GA4 ================= */
  const track = (name, params) => { if (typeof gtag === 'function') gtag('event', name, params); };
  // 遊戲頁（例如定時炸彈）會依畫面自己送 page_view，載入 site.js 時帶 ownPageView 就不重複送
  if (!window.WOOHOP.ownPageView) track('page_view', { page_title: document.title, page_location: location.origin + location.pathname, page_path: location.pathname });

  /* ================= 遊戲資料 =================
   * players：最少～最多人；time：0=5 分內／1=5–15 分／2=15 分以上；minutes：排破冰組合用的大約長度
   * phones：none / one / each；purpose：warmup / know（桌遊助手不是破冰遊戲，留空，選了目的就不會出現）
   * 幸福模擬器不是遊戲（獨立專案），不在這裡，只在首頁專區與頁尾。
   */
  const GAMES = [
    { key: 'match',   players: [5, 30], time: [1],    minutes: 8,  phones: 'each', purpose: ['know'],           color: '#F3A4FB' },
    { key: 'bingo',   players: [8, 30], time: [1, 2], minutes: 12, phones: 'each', purpose: ['know'],           color: '#FFC628' },
    { key: 'bomb',    players: [4, 15], time: [0, 1], minutes: 5,  phones: 'one',  purpose: ['warmup', 'know'], color: '#EE7B6A' },
    { key: 'buzzer',  players: [5, 30], time: [0, 1], minutes: 5,  phones: 'each', purpose: ['warmup'],         color: '#FF9419' },
    { key: 'bamboo',  players: [4, 20], time: [0],    minutes: 3,  phones: 'none', purpose: ['warmup'],         color: '#4FB59A' },
    { key: 'avalon',  players: [5, 10], time: [2],    minutes: 40, phones: 'one',  purpose: [],                 color: '#3D54B6', boardgame: true },
    // 企劃書第 3 階段：不用手機的遊戲＋帶領播放器，先佔位
    { key: 'orchard', players: [5, 20], time: [0, 1], minutes: 5,  phones: 'none', purpose: ['warmup'],         color: '#FF9419', soon: true },
    { key: 'stairs',  players: [6, 30], time: [0],    minutes: 3,  phones: 'none', purpose: ['warmup'],         color: '#7489E6', soon: true },
  ].map(g => ({
    ...g, name: t.games[g.key][0], desc: t.games[g.key][1], url: gameUrl(g.key),
    // 只開放部分語言的遊戲（prerender 從 locales.mjs 的 GAME_LANGS 帶進來）：其他語言當成「即將推出」
    soon: g.soon || Boolean(gameLangs[g.key] && !gameLangs[g.key].includes(lang)),
  }));

  // 還沒畫插圖的遊戲：一顆有表情的圓球先佔位
  const placeholderArt = (color, face) => () => `${ground}${burst(132, 28, '#FFC628')}${ring(28, 34, color)}${plus(146, 80, color)}
    ${body('<circle cx="80" cy="74" r="36"/>', color)}${makeFace(face, 80, 72, 2.2)}`;
  art.orchard = art.orchard || placeholderArt('#FFC628', 'grin');
  art.stairs = art.stairs || placeholderArt('#aebcf3', 'wow');
  const artSvg = key => `<svg viewBox="0 0 160 126" aria-hidden="true">${art[key]()}</svg>`;

  /* ================= 遊戲卡片 ================= */
  const card = (g, purposes = new Set()) => {
    const tag = g.soon ? 'div' : 'a';
    const badge = g.soon ? ['b-soon', t.soon] : g.boardgame ? ['b-info', t.badgeBoard] : (g.purpose.find(p => purposes.has(p)) || g.purpose[0]) === 'know' ? ['b-info', t.badgeKnow] : ['b-new', t.badgeWarm];
    return `<${tag} class="game${g.soon ? ' soon' : ''}" ${g.soon ? '' : `href="${g.url}"`} data-key="${g.key}">
      <span class="badge ${badge[0]} purpose">${esc(badge[1])}</span>
      <div class="art">${artSvg(g.key)}</div>
      <h3>${esc(g.name)}</h3>
      <p>${esc(g.desc)}</p>
      <div class="tags"><span>${esc(fmt(t.tagPlayers, { a: g.players[0], b: g.players[1] }))}</span><span>${esc(t.tagTime[g.time[0]])}</span><span>${esc(t.tagPhones[g.phones])}</span></div>
      <svg class="w-row" viewBox="0 0 177 48" aria-hidden="true">${[0, 1, 2].map(i => `<use href="#w" x="${i * 59}" width="59" height="48" fill="${g.color}"/>`).join('')}</svg>
    </${tag}>`;
  };

  /* ================= 推薦器 =================
   * finder(root, { filters, limit, moreHref })：首頁只放兩個條件、列三張；找遊戲頁放全部。
   * 條件同步到網址（?people=5-15&phones=each），首頁的「看全部遊戲」帶著條件過去。
   */
  const FILTERS = {
    people:  { label: t.fPeople,  type: 'one',  values: ['2-4', '5-15', '15-30', '31-99'], labels: t.oPeople },
    time:    { label: t.fTime,    type: 'one',  values: ['0', '1', '2'],                  labels: t.oTime },
    phones:  { label: t.fPhones,  type: 'many', values: ['none', 'one', 'each'],          labels: t.oPhones },
    purpose: { label: t.fPurpose, type: 'many', values: ['warmup', 'know'],               labels: t.oPurpose },
  };
  const finder = (root, { filters = Object.keys(FILTERS), limit = Infinity, moreHref = null } = {}) => {
    const params = new URLSearchParams(location.search);
    const state = {};
    for (const k of Object.keys(FILTERS)) {
      const v = params.get(k);
      state[k] = FILTERS[k].type === 'one' ? (FILTERS[k].values.includes(v) ? v : null) : new Set(v ? v.split(',').filter(x => FILTERS[k].values.includes(x)) : []);
    }
    const isOn = (k, v) => (FILTERS[k].type === 'one' ? state[k] === v : state[k].has(v));
    const row = k => {
      const f = FILTERS[k], id = `lbl-${k}`;
      const btns = f.values.map((v, i) => f.type === 'one'
        ? `<button type="button" aria-pressed="${isOn(k, v)}" data-k="${k}" data-v="${v}">${esc(f.labels[i])}</button>`
        : `<button class="chip" type="button" aria-pressed="${isOn(k, v)}" data-k="${k}" data-v="${v}">${isOn(k, v) ? '<svg><use href="#i-check"/></svg>' : ''}${esc(f.labels[i])}</button>`).join('');
      return `<div class="finder-row"><b id="${id}">${esc(f.label)}</b><div class="${f.type === 'one' ? 'segmented' : 'row'}" role="group" aria-labelledby="${id}">${btns}</div></div>`;
    };
    root.innerHTML = `
      <div class="finder">
        ${filters.map(row).join('')}
        <div class="finder-foot">
          <span class="result-count" aria-live="polite" data-count></span>
          <div class="row">
            <button class="btn btn-ghost btn-sm" type="button" data-clear>${esc(t.clear)}</button>
            <button class="btn btn-secondary btn-sm" type="button" data-random><svg><use href="#i-dice"/></svg>${esc(t.random)}</button>
          </div>
        </div>
      </div>
      <div class="results">
        <div class="game-grid" data-results></div>
        <div class="empty" data-empty hidden>
          <svg class="illo" viewBox="0 0 160 126" aria-hidden="true">${ground}${burst(132, 26, '#FFC628')}${ring(26, 30, '#F3A4FB')}
            ${body('<circle cx="66" cy="70" r="34"/>', '#d0daf9', '<path d="M88 40a38 38 0 0 1-32 70h40z" fill="#b8c4f6"/>')}${makeFace('wow', 66, 68, 2)}
            <path d="M104 92l18 18" stroke="#22222c" stroke-width="8" stroke-linecap="round"/>${body('<circle cx="98" cy="84" r="14"/>', '#ffffff', '', false)}</svg>
          <h4>${esc(t.emptyTitle)}</h4>
          <p>${esc(t.emptyText)}</p>
          <div class="row" style="justify-content:center"><button class="btn btn-secondary btn-sm" type="button" data-clear>${esc(t.clear)}</button></div>
        </div>
        ${moreHref ? `<div class="more-row"><a class="btn btn-secondary" data-more href="${moreHref}">${esc(t.seeAll)}<svg><use href="#i-arrow"/></svg></a></div>` : ''}
      </div>`;

    const match = g => {
      if (state.people) { const [a, b] = state.people.split('-').map(Number); if (g.players[1] < a || g.players[0] > b) return false; }
      if (state.time !== null && !g.time.includes(Number(state.time))) return false;
      if (state.phones.size && !state.phones.has(g.phones)) return false;
      if (state.purpose.size && !g.purpose.some(p => state.purpose.has(p))) return false;
      return true;
    };
    const query = () => {
      const q = new URLSearchParams();
      for (const k of Object.keys(FILTERS)) {
        const v = FILTERS[k].type === 'one' ? state[k] : [...state[k]].join(',');
        if (v) q.set(k, v);
      }
      return q.toString();
    };
    const $ = sel => root.querySelector(sel);
    const render = flashKey => {
      // 選了任何條件就只列能玩的；即將推出的只在沒篩選時排在最後
      const filtered = !!query();
      const all = GAMES.filter(g => match(g) && !(filtered && g.soon)).sort((a, b) => (a.soon ? 1 : 0) - (b.soon ? 1 : 0));
      $('[data-results]').innerHTML = all.slice(0, limit).map(g => card(g, state.purpose)).join('');
      const n = all.filter(g => !g.soon).length, soon = all.filter(g => g.soon).length;
      $('[data-count]').innerHTML = fmt(esc(t.found), { n: `<em>${n}</em>` }) + (soon ? `<span class="t-small">${esc(fmt(t.soonCount, { n: soon }))}</span>` : '');
      $('[data-empty]').hidden = all.length > 0;
      const more = $('[data-more]');
      if (more) { more.href = `${moreHref}${query() ? '?' + query() : ''}`; more.hidden = all.length <= limit; }
      // 找遊戲頁把條件寫回網址，重整或分享都會保留（首頁不改網址，保持乾淨的 /{lang}/）
      if (!moreHref) history.replaceState(null, '', `${location.pathname}${query() ? '?' + query() : ''}`);
      if (flashKey) { const el = root.querySelector(`[data-key="${flashKey}"]`); if (el) { el.classList.add('flash'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
    };
    const clear = () => {
      for (const k of Object.keys(FILTERS)) state[k] = FILTERS[k].type === 'one' ? null : new Set();
      root.querySelectorAll('[data-k]').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.textContent = b.textContent; });
      render();
    };
    const pickRandom = () => {
      const pool = GAMES.filter(g => !g.soon && match(g));
      if (!pool.length) clear();
      const from = pool.length ? pool : GAMES.filter(g => !g.soon);
      const g = from[Math.floor(Math.random() * from.length)];
      // 首頁只列前幾張：抽到的不在畫面上就擺到第一張
      GAMES.splice(GAMES.indexOf(g), 1); GAMES.unshift(g);
      track('random_game', { game: g.key, source: page });
      render(g.key);
    };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (b) {
        const k = b.dataset.k, v = b.dataset.v, on = b.getAttribute('aria-pressed') === 'true';
        if (FILTERS[k].type === 'one') {
          b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
          if (!on) b.setAttribute('aria-pressed', 'true');
          state[k] = on ? null : v;
        } else {
          b.setAttribute('aria-pressed', String(!on));
          b.innerHTML = (!on ? '<svg><use href="#i-check"/></svg>' : '') + esc(b.textContent);
          on ? state[k].delete(v) : state[k].add(v);
        }
        render();
        return;
      }
      if (e.target.closest('[data-clear]')) clear();
      if (e.target.closest('[data-random]')) pickRandom();
    });
    render();
  };

  /* ================= 破冰組合：暖場＋認識，總長 10／15／20 分鐘 ================= */
  const combo = (root, { onPick } = {}) => {
    root.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <div class="segmented" role="group" aria-label="${esc(t.comboTimeLabel)}" data-time>
          ${[10, 15, 20].map(n => `<button type="button" aria-pressed="${n === 15}" data-v="${n}">${esc(fmt(t.minutes, { n }))}</button>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" type="button" data-shuffle><svg><use href="#i-dice"/></svg>${esc(t.shuffle)}</button>
      </div>
      <div class="plan-steps" data-steps></div>
      <div class="plan-total" data-total></div>`;
    const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
    const build = () => {
      const total = +root.querySelector('[data-time] [aria-pressed="true"]').dataset.v;
      const pool = GAMES.filter(g => !g.soon && !g.boardgame);
      // 找出加起來最接近、但不超過總時間的一組（暖場一個＋認識一個），差不多長的隨機挑
      const pairs = [];
      for (const a of pool.filter(g => g.purpose.includes('warmup')))
        for (const b of pool.filter(g => g.purpose.includes('know') && g !== a))
          if (a.minutes + b.minutes <= total) pairs.push([a, b]);
      const best = Math.max(0, ...pairs.map(([a, b]) => a.minutes + b.minutes));
      const pick = shuffle(pairs.filter(([a, b]) => a.minutes + b.minutes >= best - 3))[0];
      const stages = [[t.stageWarm, 's1'], [t.stageKnow, 's2']];
      root.querySelector('[data-steps]').innerHTML = pick
        ? pick.map((g, i) => `<a class="plan-step ${stages[i][1]}" href="${g.url}" data-key="${g.key}"><div class="mini">${artSvg(g.key)}</div><div><span class="stage-label">${i + 1}．${esc(stages[i][0])}</span><h4>${esc(g.name)}</h4><span class="min">${esc(fmt(t.approx, { n: g.minutes }))}・${esc(t.tagPhones[g.phones])}</span></div></a>`).join('<span class="plan-arrow" aria-hidden="true">→</span>')
        : `<div class="plan-step is-empty"><div class="mini">${W('#d4d4dc')}</div><div><h4>${esc(t.notEnough)}</h4><span class="min">${esc(t.notEnoughHint)}</span></div></div>`;
      const sum = pick ? pick[0].minutes + pick[1].minutes : 0;
      root.querySelector('[data-total]').textContent = pick ? fmt(t.comboTotal, { n: sum }) : '';
      if (onPick) onPick(pick);
    };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-time] button');
      if (b) { b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); build(); }
      if (e.target.closest('[data-shuffle]')) { track('combo_shuffle', { source: page }); build(); }
    });
    build();
  };

  /* ================= 導覽列（分頁置中，放不下的收進「更多」）、語言選單、手機選單 ================= */
  const NAV = [[t.navGames, pageUrl('games'), 'games'], [t.navCombo, pageUrl('combo'), 'combo'], [t.navBoardgame, `/avalon/${lang}`, 'boardgame'], [t.navGuides, pageUrl('guides'), 'guides']];
  const nav = () => {
    const host = document.getElementById('site-nav');
    const links = host.querySelector('.nav-links');
    const render = n => {
      const shown = NAV.slice(0, n), more = NAV.slice(n);
      links.innerHTML = shown.map(([label, href, id]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('') +
        (more.length ? `<div class="nav-more"><button type="button" aria-expanded="false" aria-haspopup="true">${esc(t.more)}<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-menu" hidden>${more.map(([label, href]) => `<a href="${href}">${esc(label)}</a>`).join('')}</div></div>` : '');
    };
    const fit = () => { for (let n = NAV.length; n >= 0; n--) { render(n); if (links.scrollWidth <= links.clientWidth + 1) return; } };
    new ResizeObserver(fit).observe(links);

    // 下拉選單（「更多」與語言）：點按鈕開關，點其他地方關
    document.addEventListener('click', e => {
      const b = e.target.closest('.nav-more > button');
      document.querySelectorAll('.nav-more > button').forEach(x => { if (x !== b) { x.setAttribute('aria-expanded', 'false'); x.nextElementSibling.hidden = true; } });
      if (b) { const open = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!open)); b.nextElementSibling.hidden = open; }
      const l = e.target.closest('[data-lang]');
      if (l) { remember(l.dataset.lang); track('change_language', { from: lang, to: l.dataset.lang }); }
    });

    // 手機選單：底部面板。每條關閉路徑自己關，不靠 dialog 的 close 事件
    const sheet = document.getElementById('sheet');
    // 打開後把焦點放在面板本身：不然瀏覽器會自動聚焦第一個連結，看起來像「找遊戲」被選取
    host.querySelector('.nav-burger').addEventListener('click', () => { sheet.showModal(); sheet.focus(); });
    sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close(); });
  };

  /* ================= 遊戲連結點擊（首頁、找遊戲、破冰組合都算） ================= */
  document.addEventListener('click', e => {
    const a = e.target.closest('a.game[data-key], a.plan-step[data-key]');
    if (a) track('select_game', { game: a.dataset.key, source: page });
  });

  /* ================= 淺色／深色模式（頁尾 .theme-switch） =================
   * 選過就記住（web100-theme，系列共用；選回「跟隨系統」就拿掉記錄），沒選過跟隨裝置、裝置切換也跟著變。
   * 第一次決定在 <head> 的 THEME_HEAD（chrome.mjs），這裡負責之後的切換。 */
  const THEME_KEY = 'web100-theme';
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const readTheme = () => { try { const v = localStorage.getItem(THEME_KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch { return 'system'; } };
  const applyTheme = choice => {
    const dark = choice === 'dark' || (choice === 'system' && darkMedia.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', dark ? '#1c1c24' : '#f4f4f6');
    document.querySelectorAll('[data-theme-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice)));
  };
  applyTheme(readTheme());
  darkMedia.addEventListener('change', () => { if (readTheme() === 'system') applyTheme('system'); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-theme-choice]');
    if (!b) return;
    const choice = b.dataset.themeChoice;
    try { if (choice === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, choice); } catch { /* 記不住就只套用這一次 */ }
    applyTheme(choice);
    track('change_theme', { theme: choice });
  });

  /* ================= 頁尾的聯絡信箱：HTML 裡只放拆開的兩半，這裡組回 mailto 連結 ================= */
  document.querySelectorAll('.footer-mail[data-u]').forEach(a => {
    const addr = a.dataset.u + '@' + a.dataset.d;
    a.href = 'mailto:' + addr;
    a.querySelector('span').textContent = addr;
    a.hidden = false;
  });

  window.Site = { GAMES, card, artSvg, finder, combo, nav, track, fmt, esc, pageUrl };
})();
