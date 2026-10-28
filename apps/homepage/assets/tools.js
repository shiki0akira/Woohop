/*
 * 桌遊助手總覽（/{lang}/tools/）與小工具頁（tools/truth-or-dare/、metronome/、names/、recorder/）。2026-10-22，錄音機 2026-10-23
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
  const TOOL_ART = { truthOrDare: 'toolSlot', metronome: 'toolMetronome', names: 'toolNames', recorder: 'reverse', actions: 'toolActions' };
  const TOOL_COLOR = { truthOrDare: '#FFC628', metronome: '#7489E6', names: '#4FB59A', recorder: '#F3A4FB', actions: '#EE7B6A' };
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

  // 抽卡取名：先選主題，再手機傳一圈每人抽一個（跟竹筍的取名同一個）。小工具只抽名字，
  // 自己取、「大家都取好了」這些遊戲用的按鈕在 site.css 藏掉；抽過的名字留在下面的名單
  if (tool.key === 'names') {
    const I = T.items.names;
    const pool = tool.names;
    let theme = 'random';

    const pick = make('div', 'tool-names-pick');
    pick.appendChild(make('h2', 'tool-h', t.themeHeading));
    const grid = make('div');
    pick.appendChild(grid);
    const start = make('button', 'btn btn-lg btn-solid btn-block', I.start);
    start.type = 'button';
    pick.appendChild(start);

    const play = make('div');
    play.hidden = true;

    root.appendChild(pick);
    root.appendChild(play);

    Leader.themes(grid, { pool, value: theme, realname: false, onChange: id => { theme = id; } });

    let namer = null;
    const session = { theme: '', random: false, names: [], own: [] };
    start.addEventListener('click', () => {
      session.random = theme === 'random';
      session.theme = session.random ? Leader.randomTheme(pool) : theme;
      session.names = [];
      session.own = [];
      if (!namer) namer = Leader.namer(play, { pool, session, minPlayers: 1 });
      else namer.reset(session);
      pick.hidden = true;
      play.hidden = false;
      track('tool_names_started', { theme: session.theme, random: session.random });
    });
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
