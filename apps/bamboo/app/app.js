/*
 * 竹筍竹筍蹦蹦出。手機不當裁判（CONCEPT.md 2.2），只做四件事：教學、取名、配樂、分享拉霸。
 *
 * 整個遊戲就是一步一步帶（CONCEPT.md 3.2），每一步是一個畫面，靠 showScreen() 切換、共用同一個網址：
 *   setup 選主題 → name 大家取名（手機傳一圈）→ rules 說明規則 → play 開始玩 → end 拉霸 → 回 play 再一輪
 * 選了「用本名」的話跳過 name。每一步上方的步驟頭（標題＋照著念）由 renderLead() 填。
 *
 * 架構跟定時炸彈（apps/bomb/app/app.js）一樣，返回鍵、彈窗、AudioContext 的坑也一樣，
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
  var draft = null;

  var screen = 'setup';
  var stage = 'choose';
  var running = false;
  var roundNumber = 0;
  var wakeLock = null;

  // ---------- DOM ----------

  var $ = function (id) {
    return document.getElementById(id);
  };

  var views = { setup: $('view-setup'), name: $('view-name'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };

  var el = {
    leadHead: $('lead-head'),
    stepDots: $('step-dots'),
    stepNo: $('step-no'),
    leadTitle: $('lead-title'),
    leadSay: $('lead-say'),
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
    slot: $('slot'),
    slotMode: $('slot-mode'),
    slotReel: $('slot-reel'),
    slotResult: $('slot-result'),
    spin: $('spin'),
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
    return T['theme' + id.charAt(0).toUpperCase() + id.slice(1)] || id;
  }

  // 比對重複時不分大小寫、不管前後空白：「Pikachu」和「pikachu 」是同一個人
  function norm(name) {
    return String(name).trim().toLowerCase();
  }

  function isTaken(name) {
    var n = norm(name);
    return game.names.some(function (other) {
      return norm(other) === n;
    });
  }

  // 用本名時手機不知道有幾個人（不用設定，主持人自己帶），回 0
  function playerCount() {
    return game.theme === 'realname' ? 0 : game.names.length;
  }

  // ---------- 設定與這一局的存取 ----------

  function loadSettings() {
    var saved = readJson(localStorage, SETTINGS_KEY, null);
    if (!saved || typeof saved !== 'object') return;
    // 逐項檢查：存檔可能是舊版留下的，帶著已經不存在的主題
    if (saved.theme === 'random' || saved.theme === 'realname' || NAMES.themes.indexOf(saved.theme) !== -1) {
      settings.theme = saved.theme;
    }
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

  /*
   * 一疊名稱卡：三張卡疊著、左右兩張歪一點，最上面那張寫「?」。畫法照網站插圖（woohop-art.js 的 body：
   * 描邊 4px 留缺口、色塊往右下錯開露出白邊），顏色用遊戲卡片那幾個粉彩色。
   * 最上面那張包在 .deck-top 裡，抽的時候只有它飛走（app.css）。
   */
  var card = function (x, y, color, angle) {
    return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
      W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
  };
  var DECK_ART = function () {
    return W.ground + W.burst(138, 24, '#FFC628') + W.ring(22, 34, '#7489E6') + W.plus(142, 92, '#EE7B6A') + W.dot(20, 92, '#4FB59A') +
      card(36, 34, '#FFC628', -14) + card(70, 34, '#aebcf3', 12) +
      '<g class="deck-top">' + card(53, 28, '#4FB59A', 0) +
      '<path d="M72 54q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  };

  // 用本名沒有「大家取名」那一步，所以總共幾步要看主題（還在選主題時看設定，開始之後看這一局）
  function stepList() {
    var real = (game ? game.theme : settings.theme) === 'realname';
    return real ? ['setup', 'rules', 'play', 'end'] : ['setup', 'name', 'rules', 'play', 'end'];
  }

  /*
   * 步驟頭只有一份（template 的 #lead-head），搬進目前畫面的 .lead-slot，再填上這一步的標題和「照著念」。
   * 不在每個畫面各放一份：步驟點、標題、照著念的排版要改的時候只改一個地方。
   */
  function renderLead() {
    var list = stepList();
    var index = list.indexOf(screen);
    var slot = views[screen] && views[screen].querySelector('.lead-slot');
    if (slot && el.leadHead.parentNode !== slot) slot.appendChild(el.leadHead);

    el.stepDots.textContent = '';
    list.forEach(function (key, i) {
      var dot = document.createElement('i');
      if (i === index) dot.className = 'on';
      else if (i < index) dot.className = 'done';
      el.stepDots.appendChild(dot);
    });
    el.stepNo.textContent = fill(T.stepLabel, { n: index + 1, total: list.length });
    el.leadTitle.textContent = T.lead[screen][0];
    el.leadHead.classList.remove('no-say');
    el.leadSay.textContent = '';
    if (screen === 'play' && game && game.names.length) appendNames(el.leadSay);
    el.leadSay.appendChild(document.createTextNode(T.lead[screen][1]));
  }

  /*
   * 「開始！」那一步的照著念，前面先照取名的順序把大家的名稱念一遍，名稱用 <mark> 標起來好找。
   * 用 DOM 節點拼、不用 innerHTML：名稱是使用者取的（自己取 1⋯）也可能是名稱庫的，一律當純文字。
   */
  function appendNames(node) {
    var parts = String(T.playNames).split('{names}');
    node.appendChild(document.createTextNode(parts[0]));
    game.names.forEach(function (name, i) {
      if (i) node.appendChild(document.createTextNode(T.listSep));
      var mark = document.createElement('mark');
      mark.textContent = name;
      node.appendChild(mark);
    });
    node.appendChild(document.createTextNode((parts[1] || '') + ' '));
  }

  // 「說明規則」那一步的三張插圖卡，插圖是 STEP_ART 後三張
  function buildRuleCards() {
    el.ruleCards.textContent = '';
    T.ruleCards.forEach(function (card, i) {
      var li = document.createElement('li');
      li.className = 'rule-card';
      var art = STEP_ART[i + 2];
      li.innerHTML = '<svg class="illo" viewBox="0 0 160 126" aria-hidden="true">' + (art ? art() : '') + '</svg>';
      var body = document.createElement('div');
      var h = document.createElement('h3');
      h.textContent = card[0];
      var p = document.createElement('p');
      p.textContent = card[1];
      body.appendChild(h);
      body.appendChild(p);
      li.appendChild(body);
      el.ruleCards.appendChild(li);
    });
  }

  // ---------- 主題 ----------

  var themeButtons = {};

  // 主題按鈕只建一次，之後走 syncThemeUi() 就地更新（跟定時炸彈那兩顆分類鈕同一個理由：焦點不會跟著節點消失）
  function buildThemes() {
    var items = [{ id: 'random', name: T.themeRandom, sub: T.themeRandomSub, color: 'c-yellow' }];
    NAMES.themes.forEach(function (id) {
      var groups = NAMES.groups[id];
      items.push({ id: id, name: themeLabel(id), sub: fill(T.themeExample, { a: groups[0][0], b: groups[1][0] }), color: 'c-mint' });
    });
    items.push({ id: 'realname', name: T.themeRealname, sub: T.themeRealnameSub, color: 'c-blue' });

    el.themeGrid.textContent = '';
    items.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice theme-choice ' + item.color;

      var name = document.createElement('span');
      name.className = 'choice-name';
      name.textContent = item.name;
      var sub = document.createElement('span');
      sub.className = 'choice-sub';
      sub.textContent = item.sub;

      button.appendChild(name);
      button.appendChild(sub);
      button.addEventListener('click', function () {
        settings.theme = item.id;
        saveSettings();
        syncThemeUi();
      });
      el.themeGrid.appendChild(button);
      themeButtons[item.id] = button;
    });
    syncThemeUi();
  }

  function syncThemeUi() {
    Object.keys(themeButtons).forEach(function (id) {
      themeButtons[id].setAttribute('aria-pressed', String(id === settings.theme));
    });
    var real = settings.theme === 'realname';
    el.start.textContent = real ? T.startRealname : T.startNaming;
    if (screen === 'setup') renderLead(); // 選用本名會少一步，步驟點跟著變
  }

  function randomTheme(except) {
    var pool = NAMES.themes.filter(function (id) {
      return id !== except;
    });
    return pick(pool);
  }

  // ---------- 取名 ----------

  /*
   * 還能抽的組：已經被取走的名稱所在的那一組整組不能再抽（同一組是聽起來很像的名稱，見 names.js），
   * 自己取的名稱剛好在名稱庫裡也一樣。現在翻開的那一組也排除，「換一個」才一定會換。
   */
  function freeGroups() {
    var groups = NAMES.groups[game.theme];
    return groups.filter(function (group) {
      if (draft && group.indexOf(draft) !== -1) return false;
      return !group.some(function (name) {
        return isTaken(name);
      });
    });
  }

  function drawName() {
    var free = freeGroups();
    if (!free.length) return null;
    return pick(pick(free));
  }

  function setStage(next) {
    stage = next;
    el.nameCard.setAttribute('data-stage', next);
  }

  function renderName() {
    // 主持人的「照著念」只在一開始要：第一個人按下去之後手機就在大家手上傳，那張卡只是把抽牌往下推
    el.leadHead.classList.toggle('no-say', game.names.length > 0 || stage !== 'choose');
    el.nameTurn.textContent = fill(T.nameTurn, { n: game.names.length + 1 });
    el.nameTheme.textContent = fill(T.nameTheme, { theme: themeLabel(game.theme) });
    // 「換一個主題」只在隨機、而且還沒有人取名的時候：有人取了再換，前面那些人的名稱就跟主題對不上了
    el.reroll.hidden = !(game.random && game.names.length === 0 && stage === 'choose');

    var empty = stage === 'choose' && freeGroups().length === 0;
    el.draw.hidden = empty;
    el.poolEmpty.hidden = !empty;

    el.namedList.textContent = '';
    game.names.forEach(function (name) {
      var li = document.createElement('li');
      li.className = 'named-chip';
      var text = document.createElement('span');
      text.textContent = name;
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'chosen-remove';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', fill(T.removeName, { name: name }));
      remove.addEventListener('click', function () {
        game.names = game.names.filter(function (other) {
          return other !== name;
        });
        game.own = game.own.filter(function (other) {
          return other !== name;
        });
        saveGame();
        renderName();
      });
      li.appendChild(text);
      li.appendChild(remove);
      el.namedList.appendChild(li);
    });
    el.named.hidden = game.names.length === 0;

    // 翻開還沒送出的那一個也算：最後一個人抽完直接按「大家都取好了」是很自然的動作
    var count = game.names.length + (stage === 'reveal' || stage === 'own' ? 1 : 0);
    var enough = count >= MIN_PLAYERS;
    el.allDone.disabled = !enough;
    // 夠人數就是實心的主要按鈕（使用者要求）；還不夠時是停用的灰色
    el.allDone.classList.toggle('btn-solid', enough);
    el.allDone.classList.toggle('btn-secondary', !enough);
    el.needMore.hidden = enough;
    el.needMore.textContent = fill(T.allDoneNeed, { n: MIN_PLAYERS });
  }

  function commitName(name, own) {
    game.names.push(name);
    if (own) game.own.push(name);
    draft = null;
    saveGame();
    setStage('choose');
    renderName();
    // 下一個人拿到手機時，看到的是「第 N 位」的開頭，不是上一個人捲到一半的地方
    window.scrollTo(0, 0);
  }

  // 「自己取 N」：從 1 往上找第一個還沒用過的號碼，中間刪掉一個也不會撞號
  function ownSlot() {
    for (var n = 1; ; n += 1) {
      var name = fill(T.ownSlot, { n: n });
      if (game.own.indexOf(name) === -1) return name;
    }
  }

  // 「大家都取好了」：翻開的、輸入到一半而且有效的，都先算進去
  function finishNaming() {
    if (stage === 'reveal' && draft) commitName(draft, false);
    else if (stage === 'own') commitName(ownSlot(), true);
    if (game.names.length < MIN_PLAYERS) return;

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

  /*
   * 題目在窗格裡往上滾，越滾越慢，停在中間那一格。
   *
   * 捲軸是「題目清單重複 LOOPS 遍」排成一長條，每次拉都先瞬間跳回第一遍裡跟現在同一題的位置
   * （看起來沒動），再用一次 transition 滾到後面那幾遍裡選中的題目。只動 transform，手機上也順。
   * 收尾用計時器、不用 transitionend：內嵌瀏覽器可能把 transition 凍住，事件永遠不來。
   */
  /*
   * 拉霸的內容：問題（slotPrompts）和小動作（slotActions）混在一起。每次打開頁面洗一次牌，
   * 兩種會穿插著出現，不會一整段都是問題。每一格帶著 kind，停下來時上面標「回答」或「動作」。
   */
  var SLOT_ALL = shuffleList(
    T.slotPrompts.map(function (text) { return { kind: 'ask', text: text }; })
      .concat(T.slotActions.map(function (text) { return { kind: 'do', text: text }; })),
  );

  function shuffleList(list) {
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  /*
   * 拉之前先選：真心話（只滾問題）／隨機（兩種都有）／大冒險（只滾動作），像真心話大冒險。
   * 每一輪回到「隨機」：選的是輸的那個人，每次都該由他自己決定（resetSlot）。
   * 換模式就重建捲軸，SLOT_ITEMS 永遠是「目前這個模式」滾得到的那幾格。
   */
  var SLOT_MODES = ['ask', 'mix', 'do'];
  var slotMode = 'mix';
  var SLOT_ITEMS = SLOT_ALL;
  var SLOT_LOOPS = 3;
  var modeInputs = {};

  function buildSlotModes() {
    var labels = { ask: T.slotAsk, mix: T.slotMix, do: T.slotDo };
    el.slotMode.textContent = '';
    SLOT_MODES.forEach(function (mode) {
      var label = document.createElement('label');
      label.className = 'seg-item';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'slot-mode';
      input.value = mode;
      input.addEventListener('change', function () {
        if (slot.spinning) return;
        setSlotMode(mode);
      });
      var span = document.createElement('span');
      span.textContent = labels[mode];
      label.appendChild(input);
      label.appendChild(span);
      el.slotMode.appendChild(label);
      modeInputs[mode] = input;
    });
  }

  function setSlotMode(mode) {
    slotMode = mode;
    modeInputs[mode].checked = true;
    SLOT_ITEMS = mode === 'mix' ? SLOT_ALL : SLOT_ALL.filter(function (item) { return item.kind === mode; });
    // 捲軸要重複幾遍：至少滾過 40 格才有拉霸的感覺，格子少就多重複幾遍
    SLOT_LOOPS = Math.max(3, Math.ceil(40 / SLOT_ITEMS.length) + 2);
    buildSlot();
  }

  var SLOT_MS = 2600;
  var slot = { index: 0, spinning: false, id: 0, row: 0 };

  function buildSlot() {
    el.slotReel.textContent = '';
    for (var loop = 0; loop < SLOT_LOOPS; loop += 1) {
      SLOT_ITEMS.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'slot-' + item.kind;
        var kind = document.createElement('span');
        kind.className = 'slot-kind';
        kind.textContent = item.kind === 'do' ? T.slotDo : T.slotAsk;
        var text = document.createElement('span');
        text.className = 'slot-text';
        text.textContent = item.text;
        li.appendChild(kind);
        li.appendChild(text);
        el.slotReel.appendChild(li);
      });
    }
    slot.index = Math.floor(Math.random() * SLOT_ITEMS.length);
    placeSlot(restRow(slot.index), false);
  }

  // 停著的時候用第二遍裡的那一列：上下都有鄰居，窗格不會露出空白
  function restRow(index) {
    return SLOT_ITEMS.length + index;
  }

  // 第 row 列放到窗格正中間。列高從畫面量，字級或語言改了也不用跟著改數字
  function placeSlot(row, animate) {
    var first = el.slotReel.children[0];
    slot.row = first ? first.offsetHeight : slot.row;
    el.slotReel.style.transition = animate ? 'transform ' + SLOT_MS + 'ms cubic-bezier(.12,.75,.2,1)' : 'none';
    el.slotReel.style.transform = 'translateY(' + -(row - 1) * slot.row + 'px)';
    Array.prototype.forEach.call(el.slotReel.children, function (li, i) {
      li.classList.toggle('on', !animate && i === row);
    });
  }

  function spinSlot() {
    if (slot.spinning) return;
    slot.spinning = true;
    el.spin.disabled = true;
    el.slot.classList.add('is-spinning');
    el.slotMode.classList.add('is-locked');

    var len = SLOT_ITEMS.length;
    var chosen = Math.floor(Math.random() * len);
    // 不要停在跟上一次同一題：拉了卻好像沒動，會以為壞掉
    if (len > 1 && chosen === slot.index) chosen = (chosen + 1 + Math.floor(Math.random() * (len - 1))) % len;

    placeSlot(restRow(slot.index), false);
    void el.slotReel.offsetHeight; // 先讓瀏覽器畫好起點，下面那次才會有動畫
    var target = (SLOT_LOOPS - 1) * len + chosen;
    placeSlot(target, true);
    slotTicks(target - restRow(slot.index));
    el.slotResult.textContent = '';

    slot.id = setTimeout(function () {
      slot.index = chosen;
      placeSlot(restRow(chosen), false);
      el.slot.classList.remove('is-spinning');
      el.slotMode.classList.remove('is-locked');
      var item = SLOT_ITEMS[chosen];
      el.slotResult.textContent = (item.kind === 'do' ? T.slotDo : T.slotAsk) + '：' + item.text;
      el.spin.textContent = T.spinAgain;
      el.spin.disabled = false;
      slot.spinning = false;
      if (ensureAudio()) popHit(music.ctx.currentTime + 0.01);
    }, SLOT_MS + 50);
    track('bamboo_slot_pulled', { round_number: roundNumber, kind: SLOT_ITEMS[chosen].kind, mode: slotMode });
  }

  /*
   * 每經過一題「喀」一聲，跟著減速變稀。時間點用跟 CSS 同一條 ease-out 曲線的反函數算不划算，
   * 用 1-(1-p)^3 近似就夠了：耳朵聽得出越來越慢，聽不出曲線差一點。
   */
  function slotTicks(rows) {
    var ctx = ensureAudio();
    if (!ctx) return;
    var start = ctx.currentTime + 0.02;
    var seconds = SLOT_MS / 1000;
    // 題目多的時候不是每題都喀一聲：最多 30 聲，再密就變成嗡嗡聲了
    var every = Math.max(1, Math.ceil(rows / 30));
    for (var k = every; k <= rows; k += every) {
      var p = 1 - Math.cbrt(1 - k / rows); // 第 k 題經過的時間比例
      woodblock(start + p * seconds * 0.95, (k / every) % 2 === 0);
    }
  }

  function resetSlot() {
    clearTimeout(slot.id);
    slot.spinning = false;
    el.spin.disabled = false;
    el.spin.textContent = T.spin;
    el.slot.classList.remove('is-spinning');
    el.slotMode.classList.remove('is-locked');
    el.slotResult.textContent = '';
    setSlotMode('mix');
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
      game = { theme: random ? randomTheme() : theme, random: random, names: [], own: [] };
      draft = null;
      setStage('choose');
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
    draft = null;
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
    return game.names.length > 0 || stage !== 'choose';
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

  el.reroll.addEventListener('click', function () {
    game.theme = randomTheme(game.theme);
    saveGame();
    renderName();
  });

  /*
   * 抽：最上面那張卡先往上飛（app.css 的 .deck.is-drawing，約 0.38 秒），飛完才換到翻牌畫面。
   * 動畫期間鎖住按鈕，連按不會抽兩張。不想要動畫的人（prefers-reduced-motion）直接翻。
   */
  var drawing = false;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  el.draw.addEventListener('click', function () {
    if (drawing) return;
    var name = drawName();
    if (!name) {
      renderName();
      return;
    }
    var reveal = function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      el.draw.disabled = false;
      draft = name;
      el.drawnName.textContent = name;
      setStage('reveal');
      renderName();
    };
    if (reduceMotion) return reveal();
    drawing = true;
    el.draw.disabled = true;
    el.deck.classList.add('is-drawing');
    // 用計時器而不是 animationend：內嵌瀏覽器可能把動畫凍住，事件永遠不來
    setTimeout(reveal, 380);
  });

  el.redraw.addEventListener('click', function () {
    var name = drawName();
    if (!name) return; // 抽完了：留著現在這一個
    draft = name;
    el.drawnName.textContent = name;
    // 換一張：卡片重新翻一次（app.css 的 .drawn-card）
    var card = el.drawnName.parentNode;
    card.classList.remove('pop');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
    card.classList.add('pop');
  });

  el.passNext.addEventListener('click', function () {
    if (draft) commitName(draft, false);
  });

  el.ownOpen.addEventListener('click', function () {
    setStage('own');
    renderName();
  });
  el.ownConfirm.addEventListener('click', function () {
    commitName(ownSlot(), true);
  });
  el.ownCancel.addEventListener('click', function () {
    setStage('choose');
    renderName();
  });

  el.allDone.addEventListener('click', finishNaming);

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

  el.spin.addEventListener('click', spinSlot);
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
  el.deck.innerHTML = DECK_ART();
  buildThemes();
  buildChant();
  buildSlotModes();
  setSlotMode('mix');
  syncMusicToggle(); // 頂欄那顆一載入就要對上記住的偏好（HTML 預設是開）

  /*
   * 不小心重新整理：sessionStorage 裡還有這一局就接著玩。
   * history 的那一格在重新整理後還在（state 會保留），不在的話補推一格，返回鍵的規則才對得上。
   */
  var saved = loadGame();
  if (saved) {
    game = { theme: saved.theme, random: Boolean(saved.random), names: saved.names, own: Array.isArray(saved.own) ? saved.own : [] };
    setStage('choose');
    if (!history.state || history.state.bamboo !== 'game') pushGameState();
    showScreen(saved.screen);
  } else {
    showScreen('setup');
  }
})();
