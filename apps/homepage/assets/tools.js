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
   *   碼錶：mm:ss.cc，開始／暫停／重設
   *   倒數：mm:ss，常用時間一鍵選（30 秒～10 分）＋ −10／+10 秒微調；最後 5 秒滴答、時間到響鈴＋震動
   * 時間一律從 performance.now() 算（不是每次加 50ms），所以切到背景再回來也是準的；
   * 倒數到 0 用 setTimeout 另外排一個，畫面在背景不更新也會準時響。
   * 跑的時候要求螢幕不要自動關（Wake Lock，瀏覽器不支援就算了）。
   */
  if (tool.key === 'timer') {
    const I = T.items.timer;
    const PRESETS = [30, 60, 120, 180, 300, 600];
    const MAX_CD = 99 * 60 + 59;
    let mode = 'sw'; // sw 碼錶／cd 倒數
    let running = false;
    let swMs = 0; // 碼錶累積（暫停時的值）
    let cdTotal = 60; // 倒數設定的秒數
    let cdLeftMs = cdTotal * 1000;
    let startAt = 0; // 這一段開始的 performance.now()
    let loop = 0;
    let endTimer = 0;
    let lastTickSec = -1;
    let sound = true;
    let wake = null;

    // 模式：碼錶／倒數（全站的 .segmented）
    const tabs = make('div', 'segmented timer-tabs');
    tabs.setAttribute('role', 'group');
    const tabBtn = (id, label) => {
      const b = make('button', '', label);
      b.type = 'button';
      b.dataset.mode = id;
      b.addEventListener('click', () => setMode(id));
      tabs.appendChild(b);
      return b;
    };
    tabBtn('sw', I.stopwatchLabel);
    tabBtn('cd', I.countdownLabel);

    const display = make('div', 'timer-display');
    const tiles = make('div', 'timer-tiles');
    tiles.setAttribute('aria-live', 'off');
    const status = make('p', 'timer-status', I.doneLabel);
    status.hidden = true;
    display.appendChild(tiles);
    display.appendChild(status);

    // 倒數的設定：常用時間＋微調（跑的時候藏起來）
    const setter = make('div', 'timer-setter');
    const presetRow = make('div', 'timer-presets');
    PRESETS.forEach(sec => {
      const b = make('button', 'chip', sec < 60 ? I.secFmt.replace('{n}', sec) : I.minFmt.replace('{n}', sec / 60));
      b.type = 'button';
      b.dataset.sec = String(sec);
      b.addEventListener('click', () => { cdTotal = sec; cdLeftMs = sec * 1000; syncAll(); });
      presetRow.appendChild(b);
    });
    const adjust = make('div', 'timer-adjust');
    const less = make('button', 'btn btn-secondary', I.lessLabel);
    const more = make('button', 'btn btn-secondary', I.moreLabel);
    less.type = more.type = 'button';
    less.addEventListener('click', () => { cdTotal = Math.max(5, cdTotal - 10); cdLeftMs = cdTotal * 1000; syncAll(); });
    more.addEventListener('click', () => { cdTotal = Math.min(MAX_CD, cdTotal + 10); cdLeftMs = cdTotal * 1000; syncAll(); });
    adjust.appendChild(less);
    adjust.appendChild(more);
    setter.appendChild(presetRow);
    setter.appendChild(adjust);

    const actions = make('div', 'timer-actions');
    const startBtn = make('button', 'btn btn-lg btn-solid');
    const resetBtn = make('button', 'btn btn-lg btn-secondary', I.resetLabel);
    startBtn.type = resetBtn.type = 'button';
    actions.appendChild(startBtn);
    actions.appendChild(resetBtn);

    const soundChip = make('button', 'chip timer-sound', I.soundLabel);
    soundChip.type = 'button';
    soundChip.setAttribute('aria-pressed', 'true');
    soundChip.addEventListener('click', () => {
      sound = !sound;
      soundChip.setAttribute('aria-pressed', String(sound));
    });

    root.appendChild(tabs);
    root.appendChild(display);
    root.appendChild(setter);
    root.appendChild(actions);
    root.appendChild(soundChip);

    // ---------- 聲音：開始後第一次按就建 AudioContext；iPhone 靜音鍵照全站做法重建 ----------
    let ctx = null;
    const ensureAudio = () => {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = null; }
      return ctx;
    };
    if (Leader && Leader.onAudioReset) {
      Leader.onAudioReset(() => {
        if (running) return;
        Leader.closeAudio(ctx);
        ctx = null;
      });
    }
    const beep = (freq, at, dur, vol) => {
      if (!sound || !ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + (at || 0);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    };
    // 時間到：三組「嗶嗶」
    const alarm = () => {
      for (let i = 0; i < 3; i++) {
        beep(1046.5, i * 0.5, 0.16, 0.35);
        beep(1318.5, i * 0.5 + 0.18, 0.2, 0.35);
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

    const tick = () => {
      const ms = currentMs();
      if (mode === 'sw') { paint(swText(ms)); return; }
      paint(cdText(ms));
      // 最後 5 秒每秒滴一聲
      const sec = Math.ceil(ms / 1000);
      if (running && sec <= 5 && sec >= 1 && sec !== lastTickSec) {
        lastTickSec = sec;
        beep(880, 0, 0.08, 0.2);
      }
    };

    const syncAll = () => {
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      setter.hidden = mode !== 'cd' || running;
      presetRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.sec) === cdTotal)));
      less.disabled = cdTotal <= 5;
      more.disabled = cdTotal >= MAX_CD;
      const started = mode === 'sw' ? swMs > 0 : cdLeftMs !== cdTotal * 1000;
      startBtn.textContent = running ? I.pauseLabel : started && !(mode === 'cd' && cdLeftMs <= 0) ? I.resumeLabel : I.startLabel;
      startBtn.classList.toggle('is-running', running);
      resetBtn.disabled = running || !started;
      root.classList.toggle('timer-done', mode === 'cd' && cdLeftMs <= 0);
      status.hidden = !(mode === 'cd' && cdLeftMs <= 0);
      tick();
    };

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
      ensureAudio();
      if (mode === 'cd' && cdLeftMs <= 0) cdLeftMs = cdTotal * 1000; // 時間到之後再按開始＝重新倒數
      running = true;
      startAt = now();
      lastTickSec = -1;
      loop = setInterval(tick, 50);
      if (mode === 'cd') endTimer = setTimeout(finish, cdLeftMs);
      keepAwake(true);
      beep(1320, 0, 0.07, 0.2);
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
