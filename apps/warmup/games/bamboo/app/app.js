/*
 * 竹筍竹筍蹦蹦出。手機不當裁判（CONCEPT.md 2.2），只做四件事：教學、取名、配樂、分享拉霸。
 *
 * 整個遊戲就是一步一步帶（CONCEPT.md 3.2），每一步是一個畫面，靠 showScreen() 切換、共用同一個網址：
 *   setup 選主題 → name 大家取名（手機傳一圈）→ rules 說明規則 → play 開始玩 → end 拉霸 → 回 play 再一輪
 * 選了「用本名」的話跳過 name。每一步上方的步驟頭（標題＋照著念）由 renderLead() 填。
 *
 * 架構跟定時炸彈（games/bomb/app/app.js）一樣，返回鍵、彈窗、AudioContext 的坑也一樣，
 * 那邊的 CLAUDE.md 有寫為什麼要這樣做。
 */
(function () {
  'use strict';

  var T = window.BAMBOO.T;
  var NAMES = window.BAMBOO.names;
  var BASE = window.BAMBOO.base;
  var LANG = window.BAMBOO.lang;
  var W = window.Woohop;

  var SETTINGS_KEY = 'web100-bamboo-settings';
  // 這一局的名單放 sessionStorage：不小心重新整理不會白取，關掉分頁就沒了（產品決定：不記使用者玩過什麼）
  var GAME_KEY = 'web100-bamboo-game';

  var MIN_PLAYERS = 4;

  // ---------- 狀態 ----------

  var settings = {
    theme: 'random', // 'random'、名稱庫的主題、或 'realname'
    music: true,
  };

  /*
   * 這一局。theme 是實際用的主題（「隨機」在按下開始的那一刻就決定好了），
   * names 是已經取好的名稱；自己取的人不打字，記成「自己取 1」這種格子，own 記是哪幾個。
   */
  var game = null;

  // 取名畫面正在翻開、還沒按「傳給下一個人」的那個名稱

  var screen = 'setup';
  var running = false;
  var roundNumber = 0;
  var wakeLock = null;

  // ---------- DOM ----------

  var $ = function (id) {
    return document.getElementById(id);
  };

  var views = { setup: $('view-setup'), name: $('view-name'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };

  var el = {
    themeGrid: $('theme-grid'),
    namerRoot: $('namer-root'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    themeGrid: $('theme-grid'),
    start: $('start'),
    nameCard: $('name-card'),
    nameTurn: $('name-turn'),
    nameTheme: $('name-theme'),
    reroll: $('reroll-theme'),
    deck: $('deck'),
    draw: $('draw'),
    poolEmpty: $('pool-empty'),
    ownOpen: $('own-open'),
    ownCancel: $('own-cancel'),
    ownConfirm: $('own-confirm'),
    drawnName: $('drawn-name'),
    redraw: $('redraw'),
    passNext: $('pass-next'),
    named: $('named'),
    namedList: $('named-list'),
    needMore: $('need-more'),
    allDone: $('all-done'),
    chant: $('chant'),
    roundBtn: $('round-btn'),
    // 頂欄的音樂開關（chrome.mjs 的 gameBar，按下去 game.js 會呼叫 window.toggleMusic）
    musicToggle: $('game-music'),
    playHint: $('play-hint'),
    slotRoot: $('slot-root'),
    again: $('again'),
    leaveModal: $('leave-modal'),
    leaveCancel: $('leave-cancel'),
    leaveConfirm: $('leave-confirm'),
  };

  // ---------- 小工具 ----------

  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (whole, key) {
      return key in values ? values[key] : whole;
    });
  }

  function track(name, params) {
    if (typeof gtag !== 'function') return;
    gtag('event', name, params || {});
  }

  function readJson(storage, key, fallback) {
    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      // 無痕模式、封鎖 storage、存進去的東西被改壞：照樣能玩，只是記不住
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    try {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 同上 */
    }
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function themeLabel(id) {
    return Leader.themeLabel(id);
  }

  // 用本名時手機不知道有幾個人（不用設定，主持人自己帶），回 0
  function playerCount() {
    return game.theme === 'realname' ? 0 : game.names.length;
  }

  // ---------- 設定與這一局的存取 ----------

  function loadSettings() {
    var saved = readJson(localStorage, SETTINGS_KEY, null);
    if (!saved || typeof saved !== 'object') return;
    // 只記音樂開關。主題每次打開都是預設的隨機（2026-10-29 使用者要求：記住上次的選擇反而困擾）
    if (typeof saved.music === 'boolean') settings.music = saved.music;
  }

  function saveSettings() {
    writeJson(localStorage, SETTINGS_KEY, settings);
  }

  function saveGame() {
    writeJson(sessionStorage, GAME_KEY, game ? { theme: game.theme, random: game.random, names: game.names, own: game.own, screen: screen === 'end' ? 'play' : screen } : null);
  }

  function loadGame() {
    var saved = readJson(sessionStorage, GAME_KEY, null);
    if (!saved || !Array.isArray(saved.names)) return null;
    if (saved.theme !== 'realname' && NAMES.themes.indexOf(saved.theme) === -1) return null;
    if (['name', 'rules', 'play'].indexOf(saved.screen) === -1) return null;
    return saved;
  }

  // ---------- 帶領的步驟 ----------

  /*
   * 每一步的插圖都用 woohop-art.js 的竹筍角色（Woohop.shoot）拼出來：
   * 蹲著的竹筍矮、站起來的高。數字泡泡用阿拉伯數字，每種語言都看得懂，插圖不用翻譯。
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 13) + '" y="' + (y - 13) + '" width="26" height="26" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var tag = function (x, y) {
    return '<g transform="rotate(-8 ' + x + ' ' + y + ')"><rect x="' + (x - 20) + '" y="' + (y - 10) + '" width="40" height="20" rx="6" fill="#FFC628" ' + W.K + '/>' +
      '<path d="M' + (x - 10) + ' ' + y + 'h20" stroke="#22222c" stroke-width="3" stroke-linecap="round"/></g>';
  };
  var STEP_ART = [
    function () { return W.ground + W.burst(128, 26, '#FFC628') + W.ring(26, 34, '#7489E6') + W.shoot(80, 84, 'happy') + tag(118, 58); },
    function () { return W.ground + W.plus(146, 40, '#FF9419') + W.shoot(36, 40, 'smile') + W.shoot(80, 42, 'happy') + W.shoot(124, 40, 'wink'); },
    function () { return W.ground + W.shoot(36, 40, 'smile', '#a8dccb') + W.shoot(124, 40, 'smile', '#a8dccb') + W.shoot(80, 86, 'grin') + bubble(112, 30, '1'); },
    function () { return W.ground + W.burst(80, 30, '#EE7B6A') + W.shoot(50, 84, 'wow') + W.shoot(110, 84, 'wow') + W.shoot(140, 38, 'smile', '#a8dccb'); },
    function () { return W.ground + W.shoot(34, 84, 'happy') + W.shoot(126, 84, 'happy') + W.shoot(80, 40, 'worry', '#a8dccb'); },
  ];

  // 用本名沒有「大家取名」那一步，所以總共幾步要看主題（還在選主題時看設定，開始之後看這一局）
  function stepList() {
    var real = (game ? game.theme : settings.theme) === 'realname';
    return real ? ['setup', 'rules', 'play', 'end'] : ['setup', 'name', 'rules', 'play', 'end'];
  }

  // 步驟頭（全站共用的 Leader.lead，game.js）：步驟點、STEP n / total、標題、照著念
  function renderLead() {
    var list = stepList();
    var slot = views[screen] && views[screen].querySelector('.lead-slot');
    Leader.lead(slot, {
      index: list.indexOf(screen),
      total: list.length,
      title: T.lead[screen][0],
      say: function (node) {
        if (screen === 'play' && game && game.names.length) appendNames(node);
        node.appendChild(document.createTextNode(T.lead[screen][1]));
      },
    });
  }

  /*
   * 「開始！」那一步的照著念，前面先照取名的順序把大家的名稱念一遍，名稱用 <mark> 標起來好找。
   * 用 DOM 節點拼、不用 innerHTML：名稱是使用者取的（自己取 1⋯）也可能是名稱庫的，一律當純文字。
   */
  function appendNames(node) {
    var parts = String(T.playNames).split('{names}');
    node.appendChild(document.createTextNode(parts[0]));
    game.names.forEach(function (name, i) {
      if (i) node.appendChild(document.createTextNode(window.WOOHOP.t.listSep));
      var mark = document.createElement('mark');
      mark.textContent = name;
      node.appendChild(mark);
    });
    node.appendChild(document.createTextNode((parts[1] || '') + ' '));
  }

  // 「說明規則」那一步的三張插圖卡（全站共用的 Leader.ruleCards），插圖是 STEP_ART 後三張
  function buildRuleCards() {
    Leader.ruleCards(el.ruleCards, T.ruleCards, STEP_ART.slice(2));
  }

  // ---------- 主題（全站共用的 Leader.themes，game.js） ----------

  var themePicker = null;

  function buildThemes() {
    themePicker = Leader.themes(el.themeGrid, {
      pool: NAMES,
      value: settings.theme,
      realname: true,
      onChange: function (id) {
        settings.theme = id;
        saveSettings();
        syncThemeUi();
      },
    });
    syncThemeUi();
  }

  function syncThemeUi() {
    var real = settings.theme === 'realname';
    el.start.textContent = real ? T.startRealname : T.startNaming;
    if (screen === 'setup') renderLead(); // 選用本名會少一步，步驟點跟著變
  }

  // ---------- 取名（全站共用的 Leader.namer，game.js） ----------

  /*
   * 手機傳一圈，每個人抽一個名稱或自己大聲說（CONCEPT.md 3.1）。抽卡、自己取、名單、「大家都取好了」
   * 都在 Leader.namer 裡；這裡只把這一局（game）交給它、存檔、在取完時往下一步走。
   */
  var namer = null;

  function namerStage() {
    return namer ? namer.stage() : 'choose';
  }

  function renderName() {
    if (!namer) {
      namer = Leader.namer(el.namerRoot, {
        pool: NAMES,
        session: game,
        minPlayers: MIN_PLAYERS,
        onChange: function (stage) {
          // 主持人的「照著念」只在一開始要：第一個人按下去之後手機就在大家手上傳
          Leader.hideSay(game.names.length > 0 || stage !== 'choose');
          saveGame();
        },
        onDone: finishNaming,
      });
    } else {
      namer.reset(game);
    }
    Leader.hideSay(game.names.length > 0);
  }

  function finishNaming() {
    track('bamboo_names_done', {
      players: game.names.length,
      theme: game.theme,
      random: game.random,
      own_names: game.own.length,
    });
    showScreen('rules');
  }

  // ---------- 開始玩 ----------

  function renderPlay() {
    syncRound();
  }

  function syncRound() {
    el.roundBtn.textContent = running ? T.endRound : T.startRound;
    el.roundBtn.classList.toggle('is-running', running);
    el.playHint.textContent = running ? T.playHintRunning : T.playHintIdle;
    syncMusicToggle();
  }

  function syncMusicToggle() {
    // 玩的時候按鈕反映「現在有沒有在放」（切到背景會停，見 visibilitychange）；沒在玩的時候反映偏好
    var on = running ? music.playing : settings.music;
    if (el.musicToggle) el.musicToggle.setAttribute('aria-pressed', String(on));
  }

  var roundStartedAt = 0;

  function startRound() {
    running = true;
    roundNumber += 1;
    roundStartedAt = Date.now();
    requestWakeLock();
    if (settings.music) startMusic(true);
    syncRound();
    track('bamboo_round_started', {
      round_number: roundNumber,
      players: playerCount(),
      theme: game.theme,
      music: settings.music,
    });
  }

  function stopRound() {
    running = false;
    stopMusic();
    releaseWakeLock();
    syncRound();
  }

  function buildChant() {
    el.chant.textContent = '';
    T.chant.forEach(function (ch, i) {
      var span = document.createElement('span');
      span.textContent = ch;
      if (i === T.chant.length - 1) span.className = 'accent';
      el.chant.appendChild(span);
    });
  }

  function lightChant(index) {
    Array.prototype.forEach.call(el.chant.children, function (span, i) {
      span.classList.toggle('on', i === index);
    });
  }

  // ---------- 配樂（全部用 Web Audio 當場合成，CONCEPT.md 3.3） ----------

  /*
   * 兩段：先是七拍口令（跟著 T.chant 那七個字一個一個亮），接著是一直循環的背景音，
   * 每過幾小節快一點，越玩越緊張。
   *
   * 排程用「音訊時鐘＋往前看」：setInterval 每 25ms 醒來一次，把接下來 0.12 秒內的音符
   * 用 ctx.currentTime 排好。只靠 setTimeout 打拍子的話，主執行緒一忙拍子就會歪。
   */
  var music = { ctx: null, master: null, timer: 0, playing: false, next: 0, step: 0, bar: 0, visualIds: [] };

  var CHANT_GAP = 0.34; // 口令每個字的間隔（秒）
  var BPM_START = 112;
  var BPM_MAX = 136;

  function ensureAudio() {
    try {
      if (!music.ctx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        music.ctx = new Ctx();
        music.master = music.ctx.createGain();
        music.master.gain.value = 0.5;
        music.master.connect(music.ctx.destination);
      }
      if (music.ctx.state === 'suspended') music.ctx.resume();
      return music.ctx;
    } catch (e) {
      return null;
    }
  }

  function env(gain, t, peak, decay) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }

  function tone(type, freq, t, peak, decay, filterFreq) {
    var ctx = music.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env(gain, t, peak, decay);
    var out = gain;
    if (filterFreq) {
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    out.connect(music.master);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }

  function kick(t, peak) {
    var ctx = music.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    env(gain, t, peak || 0.9, 0.22);
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  var noiseBuffer = null;
  function noise(t, peak, decay, hp) {
    var ctx = music.ctx;
    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    var gain = ctx.createGain();
    env(gain, t, peak, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(music.master);
    src.start(t);
    src.stop(t + decay + 0.05);
  }

  // 木魚聲：口令的前六拍
  function woodblock(t, high) {
    tone('sine', high ? 1050 : 820, t, 0.6, 0.09);
    tone('triangle', high ? 2100 : 1640, t, 0.12, 0.04);
  }

  // 「出」：大鼓＋拍手，最重的一拍
  function popHit(t) {
    kick(t, 1);
    noise(t, 0.5, 0.16, 1200);
    noise(t + 0.012, 0.35, 0.12, 1800);
  }

  // 背景音的音符（C 大調五聲音階，聽起來輕快、不會刺耳）
  var NOTE = { C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C4: 261.63, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, C5: 523.25 };
  var BASS = ['C3', null, 'C3', null, 'G3', null, 'A3', null, 'C3', null, 'C3', null, 'E3', null, 'G3', 'D3'];
  // 兩小節一個樂句：第一小節問、第二小節答
  var MELODY = [
    ['E5', null, 'G5', null, 'A5', null, 'G5', null, 'E5', null, null, 'D5', 'C5', null, null, null],
    ['D5', null, 'E5', null, 'G5', null, 'E5', null, 'A5', null, 'G5', null, 'E5', 'D5', 'C5', null],
  ];

  function bpmNow() {
    return Math.min(BPM_MAX, BPM_START + music.bar * 1.5);
  }

  function scheduleStep(t) {
    var s = music.step;
    var bar = music.bar;
    if (s === 0 || s === 8 || (bar % 2 === 1 && s === 10)) kick(t, 0.8);
    if (s === 4 || s === 12) noise(t, 0.28, 0.1, 1500); // 拍手
    // 前四小節只有八分音符的 hi-hat，之後補滿十六分音符：一樣的旋律，聽起來越來越急
    if (s % 2 === 0 || bar >= 4) noise(t, s % 4 === 2 ? 0.12 : 0.06, 0.03, 7000);
    if (BASS[s]) tone('triangle', NOTE[BASS[s]], t, 0.35, 0.22);
    var note = MELODY[bar % 2][s];
    if (note) tone('square', NOTE[note], t, 0.07, 0.16, 2600);
    // 第八小節之後每小節最後一拍加一聲高音，像在催
    if (bar >= 8 && s === 15) tone('square', NOTE.C6, t, 0.05, 0.08, 4000);
  }

  function tick() {
    var ctx = music.ctx;
    while (music.next < ctx.currentTime + 0.12) {
      scheduleStep(music.next);
      music.next += 60 / bpmNow() / 4;
      music.step += 1;
      if (music.step === 16) {
        music.step = 0;
        music.bar += 1;
      }
    }
  }

  /*
   * withChant：剛按下「開始這一輪」時先放七拍口令再接背景音；
   * 玩到一半重新打開音樂就直接接背景音，不再喊一次口令。
   */
  function startMusic(withChant) {
    var ctx = ensureAudio();
    if (!ctx) return;
    stopMusic();
    music.playing = true;
    // stopMusic 把總音量壓到 0、0.25 秒後才拉回來；接著馬上要放的話提早拉回，不然口令第一拍會被吃掉
    music.master.gain.cancelScheduledValues(ctx.currentTime);
    music.master.gain.setValueAtTime(0, ctx.currentTime);
    music.master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.08);

    var t = ctx.currentTime + 0.12;
    if (withChant) {
      T.chant.forEach(function (ch, i) {
        var at = t + i * CHANT_GAP;
        if (i === T.chant.length - 1) popHit(at);
        else woodblock(at, i % 2 === 1);
        // 畫面上的字跟著亮。用 setTimeout 對齊音訊時鐘；差個幾十毫秒眼睛看不出來
        music.visualIds.push(setTimeout(function () { lightChant(i); }, Math.max(0, (at - ctx.currentTime) * 1000)));
      });
      var end = t + T.chant.length * CHANT_GAP;
      music.visualIds.push(setTimeout(function () { lightChant(-1); }, (end - ctx.currentTime) * 1000 + 250));
      t = end + CHANT_GAP; // 「出」之後空一拍再進背景音
    }

    music.next = t;
    music.step = 0;
    music.bar = 0;
    music.timer = setInterval(tick, 25);
    tick();
    syncMusicToggle();
  }

  function stopMusic() {
    clearInterval(music.timer);
    music.timer = 0;
    music.visualIds.forEach(clearTimeout);
    music.visualIds = [];
    lightChant(-1);
    music.playing = false;
    // 已經排進音訊時鐘的音符停不掉，讓總音量瞬間歸零再拉回來，聽起來就是「啪」一聲停了
    if (music.master && music.ctx) {
      var now = music.ctx.currentTime;
      music.master.gain.cancelScheduledValues(now);
      music.master.gain.setValueAtTime(0, now);
      music.master.gain.setValueAtTime(0.5, now + 0.25);
    }
    syncMusicToggle();
  }

  // ---------- 分享拉霸 ----------

  // 真心話大冒險拉霸：全站共用的 Leader.slot（game.js），題目在 apps/homepage/src/slot-prompts.mjs
  var slotTool = null;

  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.BAMBOO.slot.prompts,
        actions: window.BAMBOO.slot.actions,
        onPull: function (info) {
          track('bamboo_slot_pulled', { round_number: roundNumber, kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
  }

  // ---------- 螢幕保持亮著 ----------

  function requestWakeLock() {
    if (!navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (lock) {
      wakeLock = lock;
    }).catch(function () {});
  }

  function releaseWakeLock() {
    if (!wakeLock) return;
    var lock = wakeLock;
    wakeLock = null;
    lock.release().catch(function () {});
  }

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) {
      views[key].hidden = key !== next;
    });
    document.body.setAttribute('data-screen', next);
    // 遊戲內頂欄（game.css）：主題畫面是 browse（有玩法分頁與選單），之後都是 play（只剩返回＋遊戲名）
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var gameTitle = document.querySelector('.game-bar .title');
    if (gameTitle) gameTitle.tabIndex = next === 'setup' ? 0 : -1;

    renderLead();
    if (next === 'name') renderName();
    if (next === 'play') renderPlay();
    if (next === 'end') resetSlot();
    if (game) saveGame();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startGame() {
    var theme = settings.theme;
    if (theme === 'realname') {
      game = { theme: 'realname', random: false, names: [], own: [] };
    } else {
      var random = theme === 'random';
      game = { theme: random ? Leader.randomTheme(NAMES) : theme, random: random, names: [], own: [] };
    }
    pushGameState();
    // 按下「開始遊戲」：有多少人打開頁面之後真的開始玩、選了哪個主題
    track('bamboo_game_started', { theme: game.theme, random: game.random });
    showScreen(theme === 'realname' ? 'rules' : 'name');
  }

  function backToSetup() {
    stopRound();
    resetSlot();
    game = null;
    saveGame();
    showScreen('setup');
  }

  // ---------- 返回鍵 ----------

  /*
   * 返回鍵（頂欄左上角、手機的返回鍵）一律是**回到開頭那一頁**（2026-10-20 使用者要求），不是回上一步：
   *   - 有取好的名單 → 先跳確認（名單會清掉）
   *   - 沒有名單（還沒人取、或用本名）→ 直接回去
   * 遊戲裡的「下一步」只往前走；離開主題畫面時推一格 history，返回鍵先吃掉它，不會整個離開網站。
   */
  function pushGameState() {
    history.pushState({ bamboo: 'game' }, '');
  }

  function hasProgress() {
    if (!game) return false;
    if (game.theme === 'realname') return false;
    return game.names.length > 0 || namerStage() !== 'choose';
  }

  // fromPop：返回鍵造成的，推的那一格已經被吃掉了，要留在遊戲裡就得推回去
  function goBack(fromPop) {
    if (el.leaveModal.open) {
      closeLeaveModal();
      if (fromPop) pushGameState();
      return;
    }
    if (screen === 'setup') {
      if (!fromPop) location.href = '/' + LANG + '/games/';
      return;
    }
    if (hasProgress()) {
      if (fromPop) pushGameState();
      openLeaveModal();
      return;
    }
    // 沒有東西會不見：直接回主題畫面。按的是頂欄返回鍵的話，順便把推的那一格收掉
    backToSetup();
    if (!fromPop) history.back();
  }

  function openLeaveModal() {
    if (typeof el.leaveModal.showModal === 'function') el.leaveModal.showModal();
    else confirmLeave(); // 沒有 <dialog> 的舊瀏覽器：不要卡住使用者
  }

  function closeLeaveModal() {
    if (el.leaveModal.open) el.leaveModal.close();
  }

  function confirmLeave() {
    closeLeaveModal();
    // 先切回主題畫面再 history.back()，popstate 才會走 'setup' 那條直接 return
    backToSetup();
    history.back();
  }

  // ---------- 綁定 ----------

  el.rulesNext.addEventListener('click', function () {
    showScreen('play');
  });

  el.start.addEventListener('click', startGame);

  /*
   * 開始是點一下；結束要**按住 HOLD_MS**（按鈕會從左到右填滿深紅色，app.css 的 .is-holding）。
   * 同一顆鍵剛按過「開始」，連點兩下或手滑碰到就整輪沒了，所以結束不能只是一下。
   * 鍵盤（Enter／空白鍵）沒有「按住」可言，event.detail 是 0，就直接結束。
   */
  var HOLD_MS = 800;
  var holdId = 0;

  function endRound() {
    cancelHold();
    var hadMusic = music.playing; // stopRound 會把它關掉，先記下來
    stopRound();
    // 一輪玩多久：看大家是不是真的玩起來了（幾秒就結束通常是按錯或還沒搞懂）
    track('bamboo_round_ended', {
      round_number: roundNumber,
      duration_seconds: Math.round((Date.now() - roundStartedAt) / 1000),
      music: hadMusic,
    });
    showScreen('end');
  }

  function cancelHold() {
    clearTimeout(holdId);
    holdId = 0;
    el.roundBtn.classList.remove('is-holding');
  }

  el.roundBtn.addEventListener('click', function (event) {
    if (!running) {
      startRound();
      return;
    }
    if (event.detail === 0) endRound();
  });

  el.roundBtn.addEventListener('pointerdown', function (event) {
    if (!running || event.button > 0) return;
    cancelHold();
    el.roundBtn.classList.add('is-holding');
    holdId = setTimeout(endRound, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.roundBtn.addEventListener(type, cancelHold);
  });
  // 長按在手機上會跳出選字或右鍵選單，擋掉
  el.roundBtn.addEventListener('contextmenu', function (event) {
    if (running) event.preventDefault();
  });

  window.toggleMusic = function () {
    if (running) {
      // 玩到一半：按一下就是開或關，順便記成偏好
      if (music.playing) {
        settings.music = false;
        stopMusic();
      } else {
        settings.music = true;
        startMusic(false);
      }
    } else {
      settings.music = !settings.music;
    }
    saveSettings();
    syncMusicToggle();
  };

  el.again.addEventListener('click', function () {
    showScreen('play');
  });

  el.leaveCancel.addEventListener('click', closeLeaveModal);
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () {
    goBack(false);
  };

  window.addEventListener('popstate', function () {
    goBack(true);
  });

  // 切到背景時停音樂、不自動繼續（CONCEPT.md 3.3）；回來時這一輪還算在跑，按「音樂」就能接著放
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      if (music.playing) stopMusic();
      return;
    }
    if (running) requestWakeLock(); // wake lock 在背景會被系統收回
    syncMusicToggle();
  });

  // ---------- 起手 ----------

  loadSettings();
  buildRuleCards();
  buildThemes();
  buildChant();
  syncMusicToggle(); // 頂欄那顆一載入就要對上記住的偏好（HTML 預設是開）

  /*
   * 不小心重新整理：sessionStorage 裡還有這一局就接著玩。
   * history 的那一格在重新整理後還在（state 會保留），不在的話補推一格，返回鍵的規則才對得上。
   */
  var saved = loadGame();
  if (saved) {
    game = { theme: saved.theme, random: Boolean(saved.random), names: saved.names, own: Array.isArray(saved.own) ? saved.own : [] };
    if (!history.state || history.state.bamboo !== 'game') pushGameState();
    showScreen(saved.screen);
  } else {
    showScreen('setup');
  }
})();
