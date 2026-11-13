/*
 * 桌遊助手總覽（/{lang}/tools/）與小工具頁（tools/truth-or-dare/、metronome/、names/、recorder/、actions/、words/、timer/）。2026-10-22，錄音機 2026-10-23，抽題目 2026-10-28，計時器 2026-11-13
 *
 * 小工具本體就是遊戲裡用的那一份全站共用帶領元件 window.Leader（assets/game.js），這裡只負責：
 *   - 總覽頁：把爬蟲用的純文字連結換成有插圖的卡片（遊戲卡用 site.js 的 Site.card，工具卡自己畫）
 *   - 工具頁：建工具、底下「也用在這些遊戲」換成卡片
 * 文案在 window.WOOHOP.t.tools（src/tools-strings.mjs）；工具資料（題目、名稱庫）在 window.WOOHOP.tool。
 */
(() => {
  'use strict';

  const { lang, t } = window.WOOHOP;
  const T = t.tools;
  const Site = window.Site;
  const W = window.Woohop;
  const esc = Site.esc;
  const track = Site.track;
  // 導覽列與頁尾的下拉（語言、更多）、手機選單：其他頁各自呼叫，這裡漏了就整個點不開
  Site.nav();

  // ---------- 卡片 ----------
  // 錄音機跟倒放猜猜看用同一張插圖
  // 計時器跟秒數挑戰用同一張插圖（有表情的碼錶）
  const TOOL_ART = { truthOrDare: 'toolSlot', metronome: 'toolMetronome', names: 'toolNames', recorder: 'reverse', actions: 'toolActions', words: 'toolWords', timer: 'seconds' };
  const TOOL_COLOR = { truthOrDare: '#FFC628', metronome: '#7489E6', names: '#4FB59A', recorder: '#F3A4FB', actions: '#EE7B6A', words: '#FF9419', timer: '#4FB59A' };
  // 橫式卡：左邊插圖，右邊標題＋說明
  const hCard = ({ href, attr, art, color, name, desc }) => `<a class="game tool-card" href="${href}" ${attr}>
      <div class="art"><svg viewBox="0 0 160 126" aria-hidden="true">${art}</svg></div>
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
      <svg class="w-row" viewBox="0 0 177 48" aria-hidden="true">${[0, 1, 2].map(i => `<use href="#w" x="${i * 59}" width="59" height="48" fill="${color}"/>`).join('')}</svg>
    </a>`;
  const toolCard = (key, href) => hCard({
    href, attr: `data-tool="${key}"`, art: W.art[TOOL_ART[key]](), color: TOOL_COLOR[key],
    name: T.items[key].name, desc: T.items[key].short,
  });
  // 桌遊（目前只有阿瓦隆）：資料用 site.js 的 GAMES，畫成跟小工具一樣的橫式卡
  const boardCard = (key, href) => {
    const g = Site.GAMES.find(x => x.key === key);
    return hCard({ href, attr: `data-key="${key}"`, art: W.art[key](), color: g.color, name: g.name, desc: g.desc });
  };

  // 爬蟲版的遊戲連結換成首頁同款的遊戲卡（data-games 列出要放哪幾個）
  document.querySelectorAll('[data-games]').forEach(grid => {
    const keys = grid.getAttribute('data-games').split(',').filter(Boolean);
    const games = keys.map(k => Site.GAMES.find(g => g.key === k)).filter(Boolean);
    if (games.length) grid.innerHTML = games.map(g => Site.card(g)).join('');
  });

  // 總覽頁：桌遊和小工具同一個格子，爬蟲版的純文字連結換成插圖卡
  const toolGrid = document.getElementById('tool-grid');
  if (toolGrid) {
    toolGrid.innerHTML = Array.prototype.map.call(toolGrid.children, a => a.dataset.board
      ? boardCard(a.dataset.board, a.getAttribute('href'))
      : toolCard(a.dataset.tool, a.getAttribute('href'))).join('');
  }

  // ---------- 工具頁 ----------
  const tool = window.WOOHOP.tool;
  const root = document.getElementById('tool-root');
  if (!tool || !root) return;
  const Leader = window.Leader;
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  // 動作抽卡：跟木頭人動作版「遊戲結束」那一步同一個（Leader.actionCard）
  if (tool.key === 'actions') {
    Leader.actionCard(root, {
      actions: tool.actions,
      onDraw: action => track('tool_action_drawn', { action: action[0] }),
    });
  }

  // 抽題目：題庫跟比手畫腳同一份（src/word-bank.mjs）。勾選類型（至少留一類）→ 抽一題；
  // 選了的類型洗成一副，同一個詞在兩類只留一個，整副抽完或換了類型才重洗（跟比手畫腳的 shuffleDeck 一樣）
  if (tool.key === 'words') {
    const I = T.items.words;
    const cats = tool.words;
    const picked = new Set(cats.map(c => c[0]));

    // 類型平常收起來（九張卡在手機上佔滿一個畫面），開關上寫選了幾類；打開才有「全選」和勾選卡
    // （開關的樣子跟定時炸彈的「自訂區間」一樣：文字連結＋箭頭）
    const bar = make('div', 'word-cats-bar');
    const toggle = make('button', 'link tool-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'word-cats');
    const allBtn = make('button', 'link tool-toggle-side', I.selectAll);
    allBtn.type = 'button';
    allBtn.hidden = true;
    bar.appendChild(toggle);
    bar.appendChild(allBtn);
    root.appendChild(bar);
    const grid = make('div', 'theme-grid word-cats');
    grid.id = 'word-cats';
    grid.hidden = true;
    root.appendChild(grid);
    const buttons = [];
    const sync = () => {
      buttons.forEach(([id, b]) => b.setAttribute('aria-pressed', String(picked.has(id))));
      const all = picked.size === cats.length;
      toggle.textContent = `${I.catLabel}・${all ? I.catAll : I.catCount.replace('{n}', picked.size)}`;
      allBtn.disabled = all;
      deck = [];
    };
    toggle.addEventListener('click', () => {
      const open = grid.hidden;
      grid.hidden = !open;
      allBtn.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    allBtn.addEventListener('click', () => {
      cats.forEach(c => picked.add(c[0]));
      sync();
    });
    cats.forEach(c => {
      const b = make('button', 'choice');
      b.type = 'button';
      b.appendChild(make('span', 'choice-name', c[1]));
      b.appendChild(make('span', 'choice-sub', c[2].slice(0, 2).join(lang.startsWith('zh') || lang === 'ja' ? '、' : ', ')));
      b.addEventListener('click', () => {
        if (picked.has(c[0])) {
          if (picked.size === 1) return; // 最後一類不能取消
          picked.delete(c[0]);
        } else picked.add(c[0]);
        sync();
      });
      buttons.push([c[0], b]);
      grid.appendChild(b);
    });

    const card = make('div', 'action-card word-card');
    const face = make('div', 'action-face word-face');
    face.hidden = true;
    const kind = make('span', 'badge word-kind');
    const word = make('p', 'action-name word-name');
    word.setAttribute('aria-live', 'polite');
    face.appendChild(kind);
    face.appendChild(word);
    const btn = make('button', 'btn btn-lg btn-solid btn-block action-draw');
    btn.type = 'button';
    btn.innerHTML = '<svg aria-hidden="true"><use href="#i-dice"/></svg><span></span>';
    btn.querySelector('span').textContent = I.drawLabel;
    card.appendChild(face);
    card.appendChild(btn);
    // 抽一題放最上面：類型九張卡在手機上就佔滿一個畫面，放下面要一直捲
    root.insertBefore(card, root.firstChild);

    let deck = [];
    let last = '';
    sync();
    const shuffle = () => {
      const seen = new Set();
      deck = [];
      cats.filter(c => picked.has(c[0])).forEach(c => c[2].forEach(w => {
        if (!seen.has(w)) { seen.add(w); deck.push([c[0], c[1], w]); }
      }));
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // 重洗後第一張不要剛好是上一題
      if (deck.length > 1 && deck[deck.length - 1][2] === last) deck.unshift(deck.pop());
    };
    btn.addEventListener('click', () => {
      if (!deck.length) shuffle();
      const [id, name, w] = deck.pop();
      last = w;
      kind.textContent = name;
      word.textContent = w;
      face.hidden = false;
      face.classList.remove('pop');
      void face.offsetWidth;
      face.classList.add('pop');
      track('tool_word_drawn', { category: id });
    });
  }

  // 真心話大冒險拉霸：跟遊戲裡「誰輸了？」那一步同一個
  if (tool.key === 'truthOrDare') {
    Leader.slot(root, {
      prompts: tool.slot.prompts,
      actions: tool.slot.actions,
      onPull: info => track('tool_slot_pulled', { kind: info.kind, mode: info.mode }),
    }).reset();
  }

  // 節拍器：可選幾拍一組、可開配樂（配樂規則跟遊戲一樣：沒打拍子時原速，打拍子才跟著加快）
  if (tool.key === 'metronome') {
    const I = T.items.metronome;
    const controls = make('div', 'tool-controls');
    const beatsLabel = make('span', 'field-label', I.beatsLabel);
    const seg = make('div', 'segmented tool-beats');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', I.beatsLabel);
    const musicChip = make('button', 'chip tool-music', I.musicLabel);
    musicChip.type = 'button';
    musicChip.setAttribute('aria-pressed', 'false');
    controls.appendChild(beatsLabel);
    controls.appendChild(seg);
    controls.appendChild(musicChip);
    const host = make('div', 'tool-metro');
    root.appendChild(controls);
    root.appendChild(host);

    let beats = 4;
    let music = false;
    let metro = null;
    // 換拍數要重建節拍器（燈的數量不同）：換一個新的容器，舊的那個停掉丟掉
    const build = () => {
      if (metro) { metro.stop(); metro.music(false); }
      const box = make('div');
      host.textContent = '';
      host.appendChild(box);
      metro = Leader.metronome(box, {
        bpm: 80, min: 50, max: 180, step: 5, beats, accents: [beats - 1], groove: true,
        onStart: () => track('tool_metronome_started', { beats, music }),
      });
      if (music) metro.music(true);
    };
    [2, 3, 4].forEach(n => {
      const b = make('button', '', String(n));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(n === beats));
      b.addEventListener('click', () => {
        if (n === beats) return;
        beats = n;
        seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        build();
      });
      seg.appendChild(b);
    });
    musicChip.addEventListener('click', () => {
      music = !music;
      musicChip.setAttribute('aria-pressed', String(music));
      metro.music(music);
    });
    // 切到背景時節拍器會自己把配樂停掉，開關也要跟著變回關
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && music) {
        music = false;
        musicChip.setAttribute('aria-pressed', 'false');
      }
    });
    build();
  }

  // 抽卡取名（2026-10-28 改成跟抽題目一樣簡單）：一進來就能抽，主題收起來（預設隨機＝所有主題混著抽），
  // 抽過的名字列在下面，整個主題抽完才會重複。名稱庫跟竹筍同一份（src/name-pools.mjs）；一組聽起來很像的名稱只會抽到其中一個。
  // 遊戲裡的取名流程（Leader.namer：自己取、大家都取好了）小工具用不到，不用它；選主題還是共用的 Leader.themes
  if (tool.key === 'names') {
    const I = T.items.names;
    const pool = tool.names;
    let theme = 'random';
    const used = new Set(); // 抽過的組：「主題:第幾組」
    const drawn = [];

    const card = make('div', 'action-card word-card');
    const face = make('div', 'action-face word-face');
    face.hidden = true;
    const kind = make('span', 'badge word-kind');
    const nameEl = make('p', 'action-name word-name');
    nameEl.setAttribute('aria-live', 'polite');
    face.appendChild(kind);
    face.appendChild(nameEl);
    const btn = make('button', 'btn btn-lg btn-solid btn-block action-draw');
    btn.type = 'button';
    btn.innerHTML = '<svg aria-hidden="true"><use href="#i-dice"/></svg><span></span>';
    btn.querySelector('span').textContent = t.drawButton;
    card.appendChild(face);
    card.appendChild(btn);
    root.appendChild(card);

    // 主題：收起來的開關（跟抽題目的類型一樣），打開是 Leader.themes 的單選卡
    const bar = make('div', 'word-cats-bar');
    const toggle = make('button', 'link tool-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'name-themes');
    bar.appendChild(toggle);
    root.appendChild(bar);
    const grid = make('div', 'word-cats');
    grid.id = 'name-themes';
    grid.hidden = true;
    root.appendChild(grid);
    const label = () => { toggle.textContent = `${t.themeHeading}・${theme === 'random' ? t.themeRandom : Leader.themeLabel(theme)}`; };
    Leader.themes(grid, { pool, value: theme, realname: false, onChange: id => { theme = id; label(); } });
    label();
    toggle.addEventListener('click', () => {
      const open = grid.hidden;
      grid.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });

    // 抽過的名字
    const list = make('div', 'name-list');
    list.hidden = true;
    const listHead = make('div', 'word-cats-bar');
    listHead.appendChild(make('h2', 'tool-h', t.namedHeading));
    const clear = make('button', 'link tool-toggle-side', I.clearLabel);
    clear.type = 'button';
    listHead.appendChild(clear);
    const names = make('p', 'name-list-text');
    list.appendChild(listHead);
    list.appendChild(names);
    root.appendChild(list);
    const syncList = () => {
      list.hidden = !drawn.length;
      names.textContent = drawn.join(t.listSep);
    };
    clear.addEventListener('click', () => {
      used.clear();
      drawn.length = 0;
      face.hidden = true;
      syncList();
    });

    btn.addEventListener('click', () => {
      const themes = theme === 'random' ? pool.themes : [theme];
      const freeGroups = () => {
        const free = [];
        themes.forEach(th => pool.groups[th].forEach((g, i) => { if (!used.has(th + ':' + i)) free.push([th, i, g]); }));
        return free;
      };
      let free = freeGroups();
      // 主題抽完了就從頭再來，可以重複（使用者要求，不叫人自己取）
      if (!free.length) {
        themes.forEach(th => pool.groups[th].forEach((g, i) => used.delete(th + ':' + i)));
        free = freeGroups();
      }
      const [th, i, g] = free[Math.floor(Math.random() * free.length)];
      const name = g[Math.floor(Math.random() * g.length)];
      used.add(th + ':' + i);
      drawn.push(name);
      face.hidden = false;
      kind.textContent = Leader.themeLabel(th);
      nameEl.textContent = name;
      syncList();
      track('tool_name_drawn', { theme: th, random: theme === 'random' });
      face.classList.remove('pop');
      void face.offsetWidth;
      face.classList.add('pop');
    });
  }

  /*
   * 計時器（2026-11-13，老闆 11/12 提的）：碼錶＋倒數。數字是秒數挑戰那種一位一個底塊（.timer-tiles）。
   *   碼錶：mm:ss.cc，開始／暫停／重設；沒有聲音
   *   倒數：mm:ss，預設 1 分鐘，±30 秒調整，或點數字直接打（像微波爐：打 130 就是 1:30）；時間到響鈴＋震動
   *   數字上面有一個跑步的小人：碼錶在原地跑（地板往後退），暫停就停下來喘氣；
   *   倒數從起跑線跑向終點線，跑到的位置＝過了多少時間，時間到衝過終點舉雙手
   * 時間一律從 performance.now() 算（不是每次加 50ms），所以切到背景再回來也是準的；
   * 倒數到 0 用 setTimeout 另外排一個，畫面在背景不更新也會準時響。
   * 跑的時候要求螢幕不要自動關（Wake Lock，瀏覽器不支援就算了）。
   */
  if (tool.key === 'timer') {
    const I = T.items.timer;
    const STEP = 30;
    const MAX_CD = 99 * 60 + 59;
    let mode = 'sw'; // sw 碼錶／cd 倒數
    let running = false;
    let swMs = 0; // 碼錶累積（暫停時的值）
    let cdTotal = 60; // 倒數設定的秒數
    let cdLeftMs = cdTotal * 1000;
    let startAt = 0; // 這一段開始的 performance.now()
    let loop = 0;
    let endTimer = 0;
    let wake = null;
    let editing = false;

    // 模式：碼錶／倒數（全站的 .segmented）
    const tabs = make('div', 'segmented timer-tabs');
    tabs.setAttribute('role', 'group');
    const tabBtn = (id, label) => {
      const b = make('button', '', label);
      b.type = 'button';
      b.dataset.mode = id;
      b.addEventListener('click', () => setMode(id));
      tabs.appendChild(b);
    };
    tabBtn('sw', I.stopwatchLabel);
    tabBtn('cd', I.countdownLabel);

    // ---------- 跑步小人（畫法照動作卡的小人：圓頭長身＋粗線手腳） ----------
    const INK = '#22222c';
    const C = ['#a8dccb', '#7cc9b1'];
    const limb = (d, hand, w = 6) =>
      `<path d="${d}" fill="none" stroke="${INK}" stroke-linecap="round" stroke-width="${w + 8}" vector-effect="non-scaling-stroke"/>` +
      `<path d="${d}" fill="none" stroke="${C[0]}" stroke-linecap="round" stroke-width="${w}" vector-effect="non-scaling-stroke"/>` +
      (hand ? `<circle cx="${hand[0]}" cy="${hand[1]}" r="4.5" fill="${C[0]}" ${W.K}/>` : '');
    // 腳：粗一點，腳底一隻深色鞋子（鞋尖朝前）
    const leg = limb('M0 0L0 16', null, 8) + `<path d="M-3.5 15h8a3.5 3.5 0 0 1 0 7h-8z" fill="${INK}"/>`;
    const at = (x, y, cls, inner) => `<g transform="translate(${x} ${y})"><g class="${cls}">${inner}</g></g>`;
    // 身體以「屁股」為原點：頭頂 y=-48、寬 30；臉朝右（往前跑的方向）
    const bean = '<path d="M-15 2V-33A15 15 0 0 1 15 -33V2Z"/>';
    const shade = `<path d="M-9 -60h30v70h-30z" fill="${C[1]}"/>`;
    const fx = 3, fy = -33, fs = 1.4;
    // 喘氣的臉：眼睛 > <、嘴巴張開一縮一放
    const tiredFace =
      `<path d="M${fx - 8} ${fy - 2.6}l3.4 2.4-3.4 2.4M${fx + 8} ${fy - 2.6}l-3.4 2.4 3.4 2.4" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<ellipse class="r-mouth" cx="${fx}" cy="${fy + 6}" rx="2.6" ry="3.2" fill="${INK}"/>`;
    const runner =
      `<g class="r-pos"><g class="r-bob">` +
        `<g class="r-speed"><path d="M-40 -40h-14M-36 -28h-20M-42 -16h-12" fill="none" stroke="#7489E6" stroke-width="3.5" stroke-linecap="round"/></g>` +
        at(0, -22, 'r-leg r-leg-b', leg) +
        at(0, -22, 'r-leg r-leg-f', leg) +
        at(0, -22, 'r-lean',
          at(0, -18, 'r-arm r-arm-b', limb('M0 0q3 9 1 16', [1, 16])) +
          W.body(bean, C[0], shade) +
          `<g class="r-face f-idle">${W.makeFace('smile', fx, fy, fs)}</g>` +
          `<g class="r-face f-run">${W.makeFace('grin', fx, fy, fs)}</g>` +
          `<g class="r-face f-tired">${tiredFace}</g>` +
          `<g class="r-face f-done">${W.makeFace('happy', fx, fy, fs)}</g>` +
          at(0, -18, 'r-arm r-arm-f', limb('M0 0q3 9 1 16', [1, 16])) +
          // 喘氣：額頭的汗、嘴巴前面的白氣
          `<path class="r-sweat" d="M-10 -44q-3 4 0 6 3-2 0-6z" fill="#7cc8f0" stroke="${INK}" stroke-width="1.6"/>` +
          `<circle class="r-puff" cx="26" cy="-26" r="4" fill="#fff" stroke="${INK}" stroke-width="1.6"/>` +
          `<circle class="r-puff r-puff-2" cx="33" cy="-31" r="3" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`) +
      `</g></g>`;
    // 倒數才有的起跑線、終點（地上的格子線＋旗桿，旗子朝跑來的方向）、衝線後的彩帶；
    // 時間到小人衝過終點線停在右邊（FINISH_X）
    const checker = (x, y, w, h, n) => {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`;
      const cw = w / n, ch = h / 2;
      for (let i = 0; i < n; i++) s += `<rect x="${x + i * cw}" y="${y + (i % 2) * ch}" width="${cw}" height="${ch}" fill="${INK}"/>`;
      return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    };
    const course =
      `<g class="t-course">` +
        `<path d="M22 92v-10" stroke="var(--text-2)" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M252 92V14" style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/>` +
        checker(228, 14, 24, 14, 4) +
        `<rect x="244" y="88" width="8" height="8" fill="${INK}"/><rect x="244" y="88" width="4" height="4" fill="#fff"/><rect x="248" y="92" width="4" height="4" fill="#fff"/>` +
      `</g>` +
      `<g class="t-party">${W.burst(212, 46, '#FFC628')}${W.plus(234, 62, '#EE7B6A')}${W.ring(196, 70, '#7489E6', 4)}${W.dot(224, 82, '#F3A4FB', 3.5)}</g>`;
    const scene = make('div', 'timer-scene');
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML =
      `<svg viewBox="0 0 300 100">` +
        `<path class="t-ground" d="M0 92.5H300" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="16 10"/>` +
        course + runner +
      `</svg>`;
    const rPos = scene.querySelector('.r-pos');
    const RUN_FROM = 34, RUN_TO = 222, FINISH_X = 278;

    // ---------- 數字＋（倒數時）點數字直接打 ----------
    const display = make('div', 'timer-display');
    const tilesWrap = make('div', 'timer-tiles-wrap');
    const tiles = make('div', 'timer-tiles');
    const input = make('input', 'timer-input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.maxLength = 4;
    input.setAttribute('aria-label', I.inputLabel);
    tilesWrap.appendChild(tiles);
    tilesWrap.appendChild(input);
    const hint = make('p', 'timer-hint', I.editHint);
    const status = make('p', 'timer-status', I.doneLabel);
    display.appendChild(tilesWrap);
    display.appendChild(hint);
    display.appendChild(status);

    // 倒數：±30 秒（跑的時候藏起來）
    const adjust = make('div', 'timer-adjust');
    const less = make('button', 'btn btn-secondary', I.lessLabel);
    const more = make('button', 'btn btn-secondary', I.moreLabel);
    less.type = more.type = 'button';
    const setTotal = (sec) => { cdTotal = sec; cdLeftMs = sec * 1000; syncAll(); };
    less.addEventListener('click', () => setTotal(Math.max(1, cdTotal - STEP)));
    more.addEventListener('click', () => setTotal(Math.min(MAX_CD, cdTotal + STEP)));
    adjust.appendChild(less);
    adjust.appendChild(more);

    const actions = make('div', 'timer-actions');
    const startBtn = make('button', 'btn btn-lg btn-solid');
    const resetBtn = make('button', 'btn btn-lg btn-secondary', I.resetLabel);
    startBtn.type = resetBtn.type = 'button';
    actions.appendChild(startBtn);
    actions.appendChild(resetBtn);

    root.appendChild(tabs);
    root.appendChild(scene);
    root.appendChild(display);
    root.appendChild(adjust);
    root.appendChild(actions);

    // ---------- 鈴聲（只有倒數時間到才響）：按開始時建 AudioContext；iPhone 靜音鍵照全站做法重建 ----------
    let ctx = null;
    const ensureAudio = () => {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = null; }
    };
    if (Leader && Leader.onAudioReset) {
      Leader.onAudioReset(() => {
        if (running) return;
        Leader.closeAudio(ctx);
        ctx = null;
      });
    }
    const beep = (freq, offset, dur) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + offset;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    };
    // 時間到：三組「嗶嗶」＋震動
    const alarm = () => {
      for (let i = 0; i < 3; i++) {
        beep(1046.5, i * 0.5, 0.16);
        beep(1318.5, i * 0.5 + 0.18, 0.2);
      }
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    };

    // ---------- 螢幕不要自動關 ----------
    const keepAwake = async (on) => {
      try {
        if (on && 'wakeLock' in navigator && !wake) wake = await navigator.wakeLock.request('screen');
        if (!on && wake) { await wake.release(); wake = null; }
      } catch (e) { wake = null; }
    };

    // ---------- 畫數字：一位一個底塊，冒號、小數點沒有底塊 ----------
    const paint = (text) => {
      const chars = text.split('');
      if (tiles.children.length !== chars.length) {
        tiles.textContent = '';
        chars.forEach(ch => tiles.appendChild(make('span', /[0-9]/.test(ch) ? 'timer-digit' : 'timer-sep')));
      }
      chars.forEach((ch, i) => { if (tiles.children[i].textContent !== ch) tiles.children[i].textContent = ch; });
    };
    const two = n => String(n).padStart(2, '0');
    const swText = (ms) => {
      const cs = Math.floor(ms / 10);
      const m = Math.min(99, Math.floor(cs / 6000));
      return two(m) + ':' + two(Math.floor(cs / 100) % 60) + '.' + two(cs % 100);
    };
    // 倒數顯示「還剩幾秒」往上取整：剛按下 1:00 時是 1:00，不會馬上跳成 0:59
    const cdText = (ms) => {
      const s = Math.max(0, Math.ceil(ms / 1000));
      return two(Math.floor(s / 60)) + ':' + two(s % 60);
    };
    const now = () => performance.now();
    const currentMs = () => {
      if (mode === 'sw') return running ? swMs + (now() - startAt) : swMs;
      return running ? cdLeftMs - (now() - startAt) : cdLeftMs;
    };

    const placeRunner = () => {
      let x = 150;
      if (mode === 'cd') {
        const done = Math.min(1, Math.max(0, 1 - currentMs() / (cdTotal * 1000)));
        x = cdLeftMs <= 0 && !running ? FINISH_X : RUN_FROM + (RUN_TO - RUN_FROM) * done;
      }
      // 用 CSS transform（不是 SVG 屬性）：衝線那一下才有 transition 可以滑過去
      rPos.style.transform = `translate(${x.toFixed(1)}px, 92px) scale(1.25)`;
    };
    const tick = () => {
      if (!editing) paint(mode === 'sw' ? swText(currentMs()) : cdText(currentMs()));
      placeRunner();
    };

    const syncAll = () => {
      const done = mode === 'cd' && cdLeftMs <= 0;
      const started = mode === 'sw' ? swMs > 0 : cdLeftMs !== cdTotal * 1000;
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      // 小人：跑／停下來喘氣（開始過但暫停）／衝線／站著
      scene.className = 'timer-scene mode-' + mode + (running ? ' is-run' : done ? ' is-done' : started ? ' is-tired' : '');
      const canEdit = mode === 'cd' && !running;
      adjust.hidden = !canEdit;
      input.disabled = !canEdit;
      tilesWrap.classList.toggle('is-editable', canEdit);
      hint.hidden = !canEdit || done;
      less.disabled = cdTotal <= STEP;
      more.disabled = cdTotal >= MAX_CD;
      startBtn.textContent = running ? I.pauseLabel : started && !done ? I.resumeLabel : I.startLabel;
      startBtn.classList.toggle('is-running', running);
      resetBtn.disabled = running || !started;
      root.classList.toggle('timer-done', done);
      status.hidden = !done;
      tick();
    };

    // 點數字直接打：從右邊推進去（打 1、3、0 → 01:30），離開輸入框才算數；秒數打超過 59 會自動進位
    const editDigits = () => input.value.replace(/\D/g, '').slice(-4);
    const showEntry = () => {
      const d = editDigits().padStart(4, '0');
      paint(d.slice(0, 2) + ':' + d.slice(2));
    };
    input.addEventListener('focus', () => {
      if (input.disabled) return;
      editing = true;
      input.value = '';
      tilesWrap.classList.add('is-editing');
      showEntry();
    });
    input.addEventListener('input', () => {
      input.value = editDigits();
      showEntry();
    });
    const commit = () => {
      if (!editing) return;
      editing = false;
      tilesWrap.classList.remove('is-editing');
      const d = editDigits();
      if (d) {
        const p = d.padStart(4, '0');
        const sec = Math.min(MAX_CD, Number(p.slice(0, 2)) * 60 + Number(p.slice(2)));
        if (sec > 0) { setTotal(sec); return; }
      }
      syncAll();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });

    const finish = () => {
      clearInterval(loop);
      clearTimeout(endTimer);
      running = false;
      cdLeftMs = 0;
      keepAwake(false);
      alarm();
      syncAll();
      track('tool_timer_finished', { seconds: cdTotal });
    };

    const start = () => {
      commit(); // 還在輸入就按開始：先把打的時間算進去（不靠 blur，有的瀏覽器不一定先送）
      if (mode === 'cd') {
        ensureAudio();
        if (cdLeftMs <= 0) cdLeftMs = cdTotal * 1000; // 時間到之後再按開始＝重新倒數
      }
      running = true;
      startAt = now();
      loop = setInterval(tick, 50);
      if (mode === 'cd') endTimer = setTimeout(finish, cdLeftMs);
      keepAwake(true);
      track('tool_timer_started', { mode: mode === 'sw' ? 'stopwatch' : 'countdown', seconds: mode === 'cd' ? cdTotal : 0 });
      syncAll();
    };
    const pause = () => {
      const ms = currentMs();
      clearInterval(loop);
      clearTimeout(endTimer);
      running = false;
      if (mode === 'sw') swMs = ms;
      else cdLeftMs = ms;
      keepAwake(false);
      syncAll();
    };
    const reset = () => {
      if (mode === 'sw') swMs = 0;
      else cdLeftMs = cdTotal * 1000;
      syncAll();
    };
    const setMode = (m) => {
      if (m === mode) return;
      if (running) pause();
      mode = m;
      tiles.textContent = ''; // 位數不一樣（碼錶 6 位、倒數 4 位），格子重建
      syncAll();
    };

    startBtn.addEventListener('click', () => (running ? pause() : start()));
    resetBtn.addEventListener('click', reset);
    // 切回這一頁：Wake Lock 會被瀏覽器收回，還在跑就再要一次；數字也馬上補到現在
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (running) { wake = null; keepAwake(true); }
        tick();
      }
    });
    syncAll();
  }

  // 倒放錄音機：跟倒放猜猜看同一個 Leader.recorder，多了播放速度（連音高一起變，慢像大叔、快像花栗鼠）
  if (tool.key === 'recorder') {
    const I = T.items.recorder;
    const controls = make('div', 'tool-controls');
    controls.appendChild(make('span', 'field-label', I.speedLabel));
    const seg = make('div', 'segmented tool-speed');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', I.speedLabel);
    controls.appendChild(seg);
    const host = make('div', 'tool-recorder');
    root.appendChild(controls);
    root.appendChild(host);

    const rec = Leader.recorder(host, {
      maxSec: 30,
      onRecorded: sec => track('tool_recorder_recorded', { seconds: Math.round(sec) }),
    });
    const played = dir => () => track('tool_recorder_played', { direction: dir, rate: rec.rate });
    rec.plays.appendChild(rec.button('forward', 'btn-lg btn-secondary', 'i-play', I.mineLabel, played('forward')));
    rec.plays.appendChild(rec.button('backward', 'btn-lg btn-solid is-reverse', 'i-play', I.reverseLabel, played('backward')));

    [0.5, 0.75, 1, 1.5, 2].forEach(r => {
      // 德法西文的小數點是逗號（0,5×）
      const b = make('button', '', r.toLocaleString(lang) + '×');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(r === 1));
      b.addEventListener('click', () => {
        rec.setRate(r);
        seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      seg.appendChild(b);
    });
  }
})();

/*
 * 「這些遊戲裡也有用到」的左右鍵（老闆 2026-11-10）：卡片一排放不下才出現。
 * 按鈕是滑鼠的方便鍵，內容本來就能捲到，所以對輔助科技隱藏（aria-hidden）——
 * 這樣也不用為了兩顆箭頭多開八個語言的文案。
 */
(function gameRail() {
  var grid = document.querySelector('.tool-used .game-grid');
  if (!grid || grid.children.length < 2) return;

  var wrap = document.createElement('div');
  wrap.className = 'rail-wrap';
  grid.parentNode.insertBefore(wrap, grid);
  wrap.appendChild(grid);

  function arrow(cls, d) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-btn ' + cls;
    b.setAttribute('aria-hidden', 'true');
    b.tabIndex = -1;
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
    wrap.appendChild(b);
    return b;
  }
  var prev = arrow('rail-prev', 'M15 5 8 12l7 7');
  var next = arrow('rail-next', 'M9 5l7 7-7 7');

  function page() { return Math.max(grid.clientWidth - 60, 200); }
  prev.addEventListener('click', function () { grid.scrollBy({ left: -page(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { grid.scrollBy({ left: page(), behavior: 'smooth' }); });

  function sync() {
    var over = grid.scrollWidth - grid.clientWidth > 8;
    prev.hidden = !over || grid.scrollLeft <= 4;
    next.hidden = !over || grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 4;
  }
  grid.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  sync();
})();
