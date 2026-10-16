/*
 * Woohop 網站設計稿共用的程式：導覽列、頁尾、遊戲資料、遊戲卡片、推薦器、破冰組合。
 * 首頁、找遊戲、帶領指南三份設計稿都引用這一份，改一次三頁一起變。
 * 依賴 woohop-art.js（插圖、表情、W）。
 */
(() => {
  const { W, art, makeFace, body, ground, burst, plus, ring, K } = window.Woohop;

  /* ================= 頁面 ================= */
  // 導覽列只放已經有頁面的入口：
  //  - 派對房間還沒上線，只在首頁預告；上線後再加進來
  //  - 桌遊助手目前只有阿瓦隆，直接連過去；有第二個桌遊再做列表頁
  const PAGES = [
    ['找遊戲', 'games-draft.html', 'games'],
    ['破冰組合', 'combo-draft.html', 'combo'],
    ['桌遊助手', 'https://www.vibeweb100.com/avalon/zh-TW', 'boardgame'],
    ['帶領指南', 'guides-draft.html', 'guides'],
  ];

  /* ================= 遊戲資料（企劃書 §5.2 的精簡版） =================
   * players：最少～最多人；time：short(<5 分) / mid(5–15 分) / long(15+ 分)，可以有多個
   * phones：none / one / each；purpose：warmup / know / deep；minutes：排「破冰組合」用的大約長度
   * 幸福模擬器不是遊戲（獨立專案），不放在這裡，只在頁尾連結。
   */
  const GAMES = [
    { key: 'match',   name: '喜好二選一',     desc: '答完自動分組，還會列出你們的共同話題。', players: [5, 30], time: ['mid'],          minutes: 8, phones: 'each', purpose: ['know'],           color: '#F3A4FB', url: 'https://www.vibeweb100.com/match/zh-TW/' },
    { key: 'bingo',   name: '幸福賓果',       desc: '找到符合條件的人簽名，連成一線就賓果。', players: [8, 30], time: ['mid', 'long'],  minutes: 12, phones: 'each', purpose: ['know'],          color: '#FFC628', url: 'https://www.vibeweb100.com/bingo/zh-TW/' },
    { key: 'bomb',    name: '定時炸彈',       desc: '一支手機傳著玩，炸在誰手上誰就回答。',   players: [4, 15], time: ['short', 'mid'], minutes: 5, phones: 'one',  purpose: ['warmup', 'know'], color: '#EE7B6A', url: 'https://www.vibeweb100.com/bomb/zh-TW/' },
    { key: 'buzzer',  name: '搶答遊戲',       desc: '每人一支手機當搶答鈴，主持人出題。',     players: [5, 30], time: ['short', 'mid'], minutes: 5, phones: 'each', purpose: ['warmup'],         color: '#FF9419', url: 'https://www.vibeweb100.com/buzzer/zh-TW/' },
    { key: 'avalon',  name: '阿瓦隆語音主持', desc: '一支手機幫你主持整場，不用有人當旁白。', players: [5, 10], time: ['long'],         minutes: 40, phones: 'one', purpose: ['warmup'],         color: '#3D54B6', url: 'https://www.vibeweb100.com/avalon/zh-TW', boardgame: true },
    // 企劃書 §7 第 3 階段：不用手機的遊戲＋帶領播放器，先佔位
    { key: 'orchard', name: '果園菜園動物園', desc: '跟著拍子輪流說出水果、蔬菜或動物。',     players: [5, 20], time: ['short', 'mid'], minutes: 5, phones: 'none', purpose: ['warmup'],         color: '#FF9419', soon: true },
    { key: 'stairs',  name: '上樓下樓',       desc: '聽口令做相反的動作，反應慢的就輸。',     players: [6, 30], time: ['short'],        minutes: 3, phones: 'none', purpose: ['warmup'],         color: '#7489E6', soon: true },
    { key: 'bamboo',  name: '竹筍竹筍蹦蹦出', desc: '一個一個站起來喊數字，撞在一起就輸。',   players: [6, 20], time: ['short'],        minutes: 3, phones: 'none', purpose: ['warmup'],         color: '#4FB59A', soon: true },
  ];
  const PURPOSE = { warmup: ['暖場', 'b-new'], know: ['認識彼此', 'b-info'], deep: ['深入分享', 'b-live'] };
  const PHONES = { none: '不用手機', one: '一支手機', each: '每人一支' };
  const TIME = { short: '5 分鐘內', mid: '5–15 分', long: '15 分以上' };

  // 還沒畫插圖的遊戲：一顆有表情的圓球先佔位
  const placeholderArt = (color, face) => () => `${ground}${burst(132, 28, '#FFC628')}${ring(28, 34, color)}${plus(146, 80, color)}
    ${body('<circle cx="80" cy="74" r="36"/>', color)}${makeFace(face, 80, 72, 2.2)}`;
  art.orchard = art.orchard || placeholderArt('#FFC628', 'grin');
  art.stairs = art.stairs || placeholderArt('#aebcf3', 'wow');
  art.bamboo = art.bamboo || placeholderArt('#a8dccb', 'happy');
  const artSvg = key => `<svg viewBox="0 0 160 126" aria-hidden="true">${art[key]()}</svg>`;

  /* ================= 遊戲卡片 ================= */
  const card = g => {
    const tag = g.soon ? 'div' : 'a';
    const p = PURPOSE[g.purpose[0]];
    return `<${tag} class="game${g.soon ? ' soon' : ''}" ${g.soon ? '' : `href="${g.url}"`} data-key="${g.key}">
      ${g.soon ? '<span class="badge b-soon purpose">即將推出</span>' : `<span class="badge ${p[1]} purpose">${g.boardgame ? '桌遊助手' : p[0]}</span>`}
      <div class="art">${artSvg(g.key)}</div>
      <h4>${g.name}</h4>
      <p>${g.desc}</p>
      <div class="tags"><span>${g.players[0]}–${g.players[1]} 人</span><span>${TIME[g.time[0]]}</span><span>${PHONES[g.phones]}</span></div>
      <svg class="w-row" viewBox="0 0 177 48" aria-hidden="true">${[0, 1, 2].map(i => `<use href="#w" x="${i * 59}" width="59" height="48" fill="${g.color}"/>`).join('')}</svg>
    </${tag}>`;
  };

  /* ================= 推薦器 =================
   * finder(root, { filters, limit, moreHref })
   *   filters：要顯示哪些條件（首頁只放兩個，找遊戲頁放全部）
   *   limit：最多列幾張（首頁 3 張，下面接「看全部」）
   *   條件會同步到網址（?people=5-12&phones=each），首頁的「看全部」直接帶著條件過去
   */
  const FILTERS = {
    people:  { label: '幾個人？', type: 'one', options: [['2-4', '2–4 人'], ['5-12', '5–12 人'], ['13-30', '13–30 人'], ['31-99', '30+ 人']] },
    time:    { label: '有多少時間？', type: 'one', options: [['short', '5 分鐘內'], ['mid', '5–15 分'], ['long', '15 分以上']] },
    phones:  { label: '大家有手機嗎？', type: 'many', options: [['none', '不用手機'], ['one', '只有我一支'], ['each', '每人一支']] },
    purpose: { label: '想達到什麼？', type: 'many', options: [['warmup', '暖場炒熱'], ['know', '認識彼此']] },
  };
  const finder = (root, { filters = Object.keys(FILTERS), limit = Infinity, moreHref = null } = {}) => {
    const params = new URLSearchParams(location.search);
    const state = {};
    for (const k of Object.keys(FILTERS)) {
      const v = params.get(k);
      state[k] = FILTERS[k].type === 'one' ? (v || null) : new Set(v ? v.split(',') : []);
    }
    const isOn = (k, v) => (FILTERS[k].type === 'one' ? state[k] === v : state[k].has(v));
    const row = k => {
      const f = FILTERS[k], id = `lbl-${k}-${Math.random().toString(36).slice(2, 7)}`;
      const btns = f.options.map(([v, t]) => f.type === 'one'
        ? `<button type="button" aria-pressed="${isOn(k, v)}" data-k="${k}" data-v="${v}">${t}</button>`
        : `<button class="chip" type="button" aria-pressed="${isOn(k, v)}" data-k="${k}" data-v="${v}">${isOn(k, v) ? '<svg><use href="#i-check"/></svg>' : ''}${t}</button>`).join('');
      return `<div class="finder-row"><b id="${id}">${f.label}</b><div class="${f.type === 'one' ? 'segmented' : 'row'}" role="group" aria-labelledby="${id}">${btns}</div></div>`;
    };
    root.innerHTML = `
      <div class="finder">
        ${filters.map(row).join('')}
        <div class="finder-foot">
          <span class="result-count" aria-live="polite">找到 <em data-count>0</em> 個遊戲<span class="t-small" data-soon></span></span>
          <div class="row">
            <button class="btn btn-ghost btn-sm" type="button" data-clear>清除條件</button>
            <button class="btn btn-secondary btn-sm" type="button" data-random><svg><use href="#i-dice"/></svg>隨機一個</button>
          </div>
        </div>
      </div>
      <div class="results">
        <div class="game-grid" data-results></div>
        <div class="empty" data-empty hidden>
          <svg class="illo" viewBox="0 0 160 126" aria-hidden="true">${ground}${burst(132, 26, '#FFC628')}${ring(26, 30, '#F3A4FB')}
            ${body('<circle cx="66" cy="70" r="34"/>', '#d0daf9', '<path d="M88 40a38 38 0 0 1-32 70h40z" fill="#b8c4f6"/>')}${makeFace('wow', 66, 68, 2)}
            <path d="M104 92l18 18" stroke="#22222c" stroke-width="8" stroke-linecap="round"/>${body('<circle cx="98" cy="84" r="14"/>', '#ffffff', '', false)}</svg>
          <h4>找不到符合的遊戲</h4>
          <p>放寬一兩個條件試試看，或讓我們隨機推薦一個。</p>
          <div class="row" style="justify-content:center"><button class="btn btn-secondary btn-sm" type="button" data-clear>清除條件</button></div>
        </div>
        ${moreHref ? '<div class="more-row"><a class="btn btn-secondary" data-more href="#">看全部遊戲<svg><use href="#i-arrow"/></svg></a></div>' : ''}
      </div>`;

    const match = g => {
      if (state.people) { const [a, b] = state.people.split('-').map(Number); if (g.players[1] < a || g.players[0] > b) return false; }
      if (state.time && !g.time.includes(state.time)) return false;
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
      const all = GAMES.filter(match).sort((a, b) => (a.soon ? 1 : 0) - (b.soon ? 1 : 0));
      const list = all.slice(0, limit);
      $('[data-results]').innerHTML = list.map(card).join('');
      $('[data-count]').textContent = all.filter(g => !g.soon).length;
      const soon = all.filter(g => g.soon).length;
      $('[data-soon]').textContent = soon ? `，另有 ${soon} 個即將推出` : '';
      $('[data-empty]').hidden = all.length > 0;
      const more = $('[data-more]');
      if (more) { more.href = `${moreHref}${query() ? '?' + query() : ''}`; more.hidden = all.length <= limit; }
      if (!moreHref) history.replaceState(null, '', `${location.pathname}${query() ? '?' + query() : ''}${location.hash}`);
      if (flashKey) { const el = root.querySelector(`[data-key="${flashKey}"]`); if (el) { el.classList.add('flash'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
    };
    const clear = () => {
      for (const k of Object.keys(FILTERS)) state[k] = FILTERS[k].type === 'one' ? null : new Set();
      root.querySelectorAll('[data-k]').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.textContent = b.textContent; });
      render();
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
          b.innerHTML = (!on ? '<svg><use href="#i-check"/></svg>' : '') + b.textContent;
          on ? state[k].delete(v) : state[k].add(v);
        }
        render();
        return;
      }
      if (e.target.closest('[data-clear]')) clear();
      if (e.target.closest('[data-random]')) pickRandom();
    });
    const pickRandom = () => {
      const pool = GAMES.filter(g => !g.soon && match(g));
      if (!pool.length) clear();
      const from = pool.length ? pool : GAMES.filter(g => !g.soon);
      const g = from[Math.floor(Math.random() * from.length)];
      // 首頁只列前幾張：抽到的不在畫面上就把它擺到第一張
      const i = GAMES.indexOf(g); GAMES.splice(i, 1); GAMES.unshift(g);
      render(g.key);
    };
    render();
    return { pickRandom };
  };

  /* ================= 破冰組合：暖場＋認識，總長 10／15／20 分鐘 ================= */
  // onPick(pick, 分鐘)：每次排好一組就通知頁面（破冰組合頁用它來產生「怎麼帶」的流程）
  const combo = (root, { onPick } = {}) => {
    const STAGES = [['warmup', '暖場炒熱', 's1'], ['know', '認識彼此', 's2']];
    root.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <div class="segmented" role="group" aria-label="破冰時間" data-time>
          <button type="button" aria-pressed="false" data-v="10">10 分鐘</button><button type="button" aria-pressed="true" data-v="15">15 分鐘</button><button type="button" aria-pressed="false" data-v="20">20 分鐘</button>
        </div>
        <button class="btn btn-secondary btn-sm" type="button" data-shuffle><svg><use href="#i-dice"/></svg>換一組</button>
      </div>
      <div class="plan-steps" data-steps></div>
      <div class="plan-total" data-total></div>`;
    const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
    const build = () => {
      const total = +root.querySelector('[data-time] [aria-pressed="true"]').dataset.v;
      const pool = GAMES.filter(g => !g.soon && !g.boardgame);
      // 找出加起來最接近、但不超過總時間的一組（暖場一個＋認識一個），同分的隨機挑
      const pairs = [];
      for (const a of pool.filter(g => g.purpose.includes('warmup')))
        for (const b of pool.filter(g => g.purpose.includes('know') && g !== a))
          if (a.minutes + b.minutes <= total) pairs.push([a, b]);
      const best = Math.max(0, ...pairs.map(([a, b]) => a.minutes + b.minutes));
      const pick = shuffle(pairs.filter(([a, b]) => a.minutes + b.minutes === best || a.minutes + b.minutes >= best - 3))[0];
      root.querySelector('[data-steps]').innerHTML = pick
        ? pick.map((g, i) => `<a class="plan-step ${STAGES[i][2]}" href="${g.url}"><div class="mini">${artSvg(g.key)}</div><div><span class="stage-label">${i + 1}．${STAGES[i][1]}</span><h4>${g.name}</h4><span class="min">約 ${g.minutes} 分鐘・${PHONES[g.phones]}</span></div></a>`).join('<span class="plan-arrow" aria-hidden="true">→</span>')
        : `<div class="plan-step is-empty"><div class="mini">${W('#d4d4dc')}</div><div><h4>時間不太夠</h4><span class="min">選長一點的時間試試</span></div></div>`;
      const sum = pick ? pick[0].minutes + pick[1].minutes : 0;
      root.querySelector('[data-total]').textContent = pick ? `合計約 ${sum} 分鐘，接著就可以進入今天的主要聚會。` : '';
      if (onPick) onPick(pick, sum);
    };
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-time] button');
      if (t) { t.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === t))); build(); }
      if (e.target.closest('[data-shuffle]')) build();
    });
    build();
  };

  /* ================= 導覽列與頁尾 ================= */
  const nav = (current) => {
    const host = document.getElementById('site-nav');
    host.innerHTML = `<header class="navbar">
        <a class="brand wordmark" href="home-draft.html" aria-label="Woohop 首頁"><svg viewBox="0 0 59 48"><use href="#w" fill="#7489E6"/></svg>Woohop</a>
        <nav class="nav-links" aria-label="主要導覽"></nav>
        <div class="nav-actions">
          <button class="lang" type="button"><svg><use href="#i-globe"/></svg>繁中</button>
          <button class="btn btn-icon btn-secondary nav-burger" type="button" aria-label="選單" style="--h:44px"><svg><use href="#i-menu"/></svg></button>
        </div>
      </header>`;
    host.insertAdjacentHTML('afterend', `<dialog class="sheet" id="sheet" aria-label="選單"><div class="grabber"></div><div class="sheet-list">${PAGES.map(([t, h]) => `<a class="btn btn-secondary btn-block" href="${h}">${t}</a>`).join('')}<button class="btn btn-ghost btn-block" type="button" data-close>關閉</button></div></dialog>`);
    const links = host.querySelector('.nav-links');
    const render = n => {
      const shown = PAGES.slice(0, n), more = PAGES.slice(n);
      links.innerHTML = shown.map(([t, h, id]) => `<a href="${h}"${id === current ? ' aria-current="page"' : ''}>${t}</a>`).join('') +
        (more.length ? `<div class="nav-more"><button type="button" aria-expanded="false" aria-haspopup="true">更多<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-menu" hidden>${more.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div></div>` : '');
    };
    const fit = () => { for (let n = PAGES.length; n >= 0; n--) { render(n); if (links.scrollWidth <= links.clientWidth + 1) return; } };
    new ResizeObserver(fit).observe(links);
    document.addEventListener('click', e => {
      const b = e.target.closest('.nav-more > button');
      document.querySelectorAll('.nav-more > button').forEach(x => { if (x !== b) { x.setAttribute('aria-expanded', 'false'); x.nextElementSibling.hidden = true; } });
      if (b) { const open = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!open)); b.nextElementSibling.hidden = open; }
    });
    const sheet = document.getElementById('sheet');
    host.querySelector('.nav-burger').addEventListener('click', () => sheet.showModal());
    // 每條關閉路徑自己關，不靠 dialog 的 close 事件
    sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close(); });
  };
  const footer = () => {
    // 分欄：品牌＋一句話｜網站｜其他專案｜關於；最下面一行放版權
    document.getElementById('site-footer').innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="wordmark" href="home-draft.html" style="font-size:22px"><svg viewBox="0 0 59 48" style="width:30px;height:24.4px"><use href="#w" fill="#7489E6"/></svg>Woohop</a>
          <p>明天就要帶破冰？打開就能帶。<br>免下載、免註冊，手機瀏覽器直接開。</p>
        </div>
        <div class="footer-col"><h4>網站</h4>${PAGES.map(([t, h]) => `<a class="link" href="${h}">${t}</a>`).join('')}</div>
        <div class="footer-col"><h4>其他專案</h4><a class="link" href="https://www.vibeweb100.com/happiness/zh-TW/">幸福模擬器</a><span class="t-small">幸福小組七週互動信息</span></div>
        <div class="footer-col"><h4>關於</h4><span class="link is-disabled" aria-disabled="true">關於我們</span><span class="link is-disabled" aria-disabled="true">隱私權政策</span><span class="link is-disabled" aria-disabled="true">聯絡我們</span></div>
      </div>
      <div class="footer-bottom"><span>© 2026 Woohop</span><button class="lang" type="button"><svg><use href="#i-globe"/></svg>繁中</button></div>`;
  };


  // 內嵌預覽不支援同頁 #hash 跳轉，統一用 scrollIntoView；跨頁的 #hash 載入後再捲過去
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = document.querySelector(url.hash); if (!t) return;
    e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
  });
  addEventListener('load', () => { if (location.hash) document.querySelector(location.hash)?.scrollIntoView(); });

  window.Site = { GAMES, card, artSvg, finder, combo, nav, footer };
})();
