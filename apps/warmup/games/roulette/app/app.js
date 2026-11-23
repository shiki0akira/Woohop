/*
 * 拉炮輪盤。派對版的俄羅斯輪盤（老闆 11/16 提、11/23 定）：
 *   - 外型是拉炮，不用手槍（學校、教會、公司都會用）
 *   - 彈夾格數預設等於人數、可以自己調；會爆的發數也能設（1 ～ 格數−1）
 *   - 一支手機傳下去，拉過的格子不重轉；砰的人噴彩帶、拉真心話大冒險拉霸
 *   - 全部砰完才結束
 *
 * 一步一步帶（步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場（設定）→ rules 說明規則 → play 傳下去拉（不放步驟頭）→ pop 砰！拉霸 → 還有就回 play，全部砰完就結束
 * 返回鍵：開場直接離開；說明規則回開場；開始玩之後先確認。
 */
(function () {
  'use strict';

  var T = window.ROULETTE.T;
  var BASE = window.ROULETTE.base;
  var LANG = window.ROULETTE.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  // 人數、格數、會爆幾發的範圍。每次進來都是預設值（不記上次玩過的，全站規則）
  var PLAYERS = { min: 2, max: 20, def: 4 };
  var CHAMBERS = { min: 2, max: 30 };
  var BANGS = { def: 1, max: 10 }; // 會爆幾發：最多 10（老闆 11/23），也不能超過格數−1
  /*
   * 格數照人數分級（老闆 11/23）：一般俄羅斯輪盤是六發左輪，4 人以下 6 格、5～8 人 12 格，
   * 之後每多 4 人多 6 格（9～12 人 18 格⋯⋯20 人 30 格）。比人數多，傳完一圈不一定有人中
   */
  function chambersFor(players) {
    return 6 * Math.ceil(players / 4);
  }
  var SUSPENSE_MS = 900; // 拉下去到揭曉：抖一抖、喀喀喀
  var POP_TO_SLOT_MS = 1500; // 砰完彩帶噴一下，再換到拉霸

  var setup = { players: PLAYERS.def, chambers: chambersFor(PLAYERS.def), bangs: BANGS.def, chambersTouched: false };
  var game = null; // { chambers: [true/false…], index, popped, bangs, pulls }
  var screen = 'setup';
  var busy = false; // 拉下去、還沒揭曉
  var gameNumber = 0;
  var startedAt = 0;
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), pop: $('view-pop') };
  var el = {
    playersValue: $('players-value'),
    playersLess: $('players-less'),
    playersMore: $('players-more'),
    bangsValue: $('bangs-value'),
    bangsLess: $('bangs-less'),
    bangsMore: $('bangs-more'),
    chambersValue: $('chambers-value'),
    chambersLess: $('chambers-less'),
    chambersMore: $('chambers-more'),
    chambersToggle: $('chambers-toggle'),
    chambersPanel: $('chambers-panel'),
    setupHint: $('setup-hint'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    chambersLeft: $('chambers-left'),
    bangsLeft: $('bangs-left'),
    cylinder: $('cylinder'),
    stage: $('popper-stage'),
    art: $('popper-art'),
    playTitle: $('play-title'),
    playHint: $('play-hint'),
    pull: $('pull'),
    pass: $('pass'),
    slotRoot: $('slot-root'),
    again: $('again'),
    confetti: $('confetti'),
    leaveModal: $('leave-modal'),
    leaveCancel: $('leave-cancel'),
    leaveConfirm: $('leave-confirm'),
  };

  function fill(s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  }
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // ---------- 開場：幾個人、會爆幾發、彈夾格數 ----------
  /*
   * 格數沒自己調過的話照人數分級（chambersFor）；自己調過就不再跟。
   * 會爆的至少 1 發、最多 10 發，也不能超過格數−1（至少留一格是安全的）。
   */
  function clampSetup() {
    if (!setup.chambersTouched) setup.chambers = chambersFor(setup.players);
    setup.chambers = Math.max(CHAMBERS.min, Math.min(CHAMBERS.max, setup.chambers));
    setup.bangs = Math.max(1, Math.min(setup.chambers - 1, BANGS.max, setup.bangs));
  }
  function renderSetup() {
    clampSetup();
    el.playersValue.textContent = setup.players;
    el.chambersValue.textContent = setup.chambers;
    el.bangsValue.textContent = setup.bangs;
    el.playersLess.disabled = setup.players <= PLAYERS.min;
    el.playersMore.disabled = setup.players >= PLAYERS.max;
    el.chambersLess.disabled = setup.chambers <= CHAMBERS.min;
    el.chambersMore.disabled = setup.chambers >= CHAMBERS.max;
    el.bangsLess.disabled = setup.bangs <= 1;
    el.bangsMore.disabled = setup.bangs >= Math.min(setup.chambers - 1, BANGS.max);
    var hint = fill(T.setupHint, { chambers: setup.chambers, bangs: setup.bangs });
    if (setup.chambers > setup.players) hint += fill(T.setupHintMore, { chambers: setup.chambers });
    el.setupHint.textContent = hint;
  }
  function bump(key, delta) {
    if (key === 'players') setup.players = Math.max(PLAYERS.min, Math.min(PLAYERS.max, setup.players + delta));
    if (key === 'chambers') {
      setup.chambersTouched = true;
      setup.chambers += delta;
    }
    if (key === 'bangs') setup.bangs += delta;
    renderSetup();
  }

  // ---------- 拉炮插圖（woohop-art.js 的畫法，160×126） ----------
  /*
   * 一支斜放的拉炮：尖端在左下、開口朝右上。state：
   *   idle 平常（笑）、shake 拉下去還沒揭曉（擔心）、safe 喀（鬆一口氣）、pop 砰（噴彩帶）
   */
  var FACE = { idle: 'smile', shake: 'worry', safe: 'happy', pop: 'wow' };
  function streamers() {
    // 從開口（92,56）往右上噴：彎彎的彩帶＋小點點
    var colors = ['#FFC628', '#7489E6', '#4FB59A', '#EE7B6A', '#F3A4FB'];
    var paths = [
      'M96 50q8-14 4-24t6-20', 'M100 54q14-6 22-2t18-8', 'M98 58q16 4 24 14t20 4',
      'M92 48q-2-14 -10-20t-6-18', 'M102 52q12-16 24-14',
    ];
    var out = '';
    paths.forEach(function (d, i) {
      out += '<path d="' + d + '" fill="none" stroke="' + colors[i] + '" stroke-width="5" stroke-linecap="round"/>';
    });
    return out + W.dot(132, 22, '#FF9419', 4) + W.dot(146, 44, '#7489E6', 3.5) + W.dot(118, 12, '#4FB59A', 3) +
      W.dot(150, 76, '#FFC628', 4) + W.plus(76, 16, '#EE7B6A', 4) + W.burst(140, 60, '#FFC628');
  }
  function popperArt(state) {
    var deco = state === 'pop' ? streamers() :
      W.ring(136, 30, '#7489E6') + W.plus(28, 34, '#4FB59A') + W.dot(146, 92, '#FFC628', 4);
    // 圓錐：尖端 (30,114)、開口中心 (96,52)。條紋放在 body 的陰影層裡，才會被圓錐裁切、不會凸出去
    var stripes = '<path d="M26 78l41 41M63 42l43 43" fill="none" stroke="#e48aee" stroke-width="9"/>';
    return W.ground + deco +
      // 拉繩：從尖端垂下來
      '<path d="M30 114q-10 2-10 6" fill="none" ' + W.K + '/>' +
      W.body('<path d="M30 114L75 31L117 73Z"/>', '#F3A4FB', stripes) +
      // 開口
      W.body('<ellipse cx="96" cy="52" rx="30" ry="10" transform="rotate(45 96 52)"/>', '#FFC628', '', false) +
      W.makeFace(FACE[state] || 'smile', 67, 80, 1.5);
  }
  function drawPopper(state) {
    el.art.innerHTML = popperArt(state);
  }

  // 「說明規則」三張插圖卡：手機拉炮、喀（沒事）、砰（彩帶）
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 20) + '" y="' + (y - 14) + '" width="40" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c">' + text + '</text></g>';
  };
  var RULE_ART = [
    function () { return popperArt('idle'); },
    function () { return popperArt('safe') + bubble(128, 30, T.clickBubble); },
    function () { return popperArt('pop'); },
  ];

  // ---------- 彈夾 ----------

  function newGame() {
    var n = setup.chambers;
    var list = [];
    for (var i = 0; i < n; i += 1) list.push(i < setup.bangs);
    for (var j = list.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = list[j]; list[j] = list[k]; list[k] = tmp;
    }
    game = { chambers: list, index: 0, popped: 0, bangs: setup.bangs, pulls: 0, players: setup.players, hits: [] };
    el.cylinder.textContent = '';
    list.forEach(function () { el.cylinder.appendChild(document.createElement('li')); });
  }

  function renderCylinder() {
    Array.prototype.forEach.call(el.cylinder.children, function (li, i) {
      li.className = i < game.index ? (game.chambers[i] ? 'is-pop' : 'is-safe') : i === game.index ? 'is-next' : '';
    });
    el.chambersLeft.textContent = fill(T.chambersLeft, { left: game.chambers.length - game.index });
    el.bangsLeft.textContent = fill(T.bangsLeft, { bangs: game.bangs - game.popped });
  }

  // 輪到下一個人：拉炮笑著、只有「拉！」
  function readyToPull() {
    busy = false;
    el.stage.classList.remove('is-shaking', 'is-click');
    drawPopper('idle');
    renderCylinder();
    var left = game.chambers.length - game.index;
    var bangsLeft = game.bangs - game.popped;
    el.playTitle.textContent = '';
    el.playHint.textContent = left === bangsLeft ? T.lastSafe : T.pullHint;
    el.pull.hidden = false;
    el.pull.disabled = false;
    el.pass.hidden = true;
  }

  function pull() {
    if (busy || !game || game.index >= game.chambers.length) return;
    busy = true;
    el.pull.disabled = true;
    el.stage.classList.remove('is-click');
    el.stage.classList.add('is-shaking');
    drawPopper('shake');
    el.playTitle.textContent = T.pulling;
    el.playHint.textContent = '';
    suspenseSound();
    setTimeout(reveal, SUSPENSE_MS);
  }

  function reveal() {
    if (screen !== 'play' || !game) return;
    var hit = game.chambers[game.index];
    game.index += 1;
    game.pulls += 1;
    if (hit) game.popped += 1;
    el.stage.classList.remove('is-shaking');
    renderCylinder();

    if (!hit) {
      // 喀：沒事，傳給下一個人
      void el.stage.offsetWidth;
      el.stage.classList.add('is-click');
      drawPopper('safe');
      clickSound();
      el.playTitle.textContent = T.safeTitle;
      el.playHint.textContent = T.safeHint;
      el.pull.hidden = true;
      el.pass.hidden = false;
      busy = false;
      return;
    }

    // 砰！記下是第幾位（從第一個拉的人開始數，傳完一圈從 1 重來）
    var seat = ((game.pulls - 1) % game.players) + 1;
    game.hits.push(seat);
    drawPopper('pop');
    bangSound();
    confetti();
    if (navigator.vibrate) navigator.vibrate([60, 40, 180]);
    el.playTitle.textContent = T.popTitle;
    el.pull.hidden = true;
    track('roulette_popped', { game_number: gameNumber, pop_number: game.popped, pull_number: game.pulls });

    /*
     * 還沒砰完：不進拉霸（老闆 11/23），記住是誰、繼續傳。
     * 全部砰完才一起進拉霸，照著念那裡念出第幾位中了。
     */
    if (game.popped < game.bangs) {
      el.playHint.textContent = fill(T.popHint, { seat: seatText([seat]) });
      el.pass.hidden = false;
      busy = false;
      return;
    }
    el.playHint.textContent = '';
    track('roulette_game_ended', {
      game_number: gameNumber,
      pulls: game.pulls,
      chambers: game.chambers.length,
      bangs: game.bangs,
      duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });
    setTimeout(function () {
      if (screen === 'play') showScreen('pop');
    }, POP_TO_SLOT_MS);
  }

  // [5, 2, 2] → 「第 2 位（2 次）、第 5 位」：照座位順序，同一位中兩次以上標次數
  function seatText(hits) {
    var order = [];
    var count = {};
    hits.forEach(function (s) {
      if (!count[s]) order.push(s);
      count[s] = (count[s] || 0) + 1;
    });
    order.sort(function (a, b) { return a - b; }); // 照座位順序念，主持人好找人
    return order.map(function (s) {
      return fill(count[s] > 1 ? T.seatTimes : T.seat, { n: s, times: count[s] });
    }).join(T.seatJoin);
  }
  function uniqueHits() {
    return game.hits.filter(function (s, i) { return game.hits.indexOf(s) === i; }).length;
  }

  // ---------- 彩帶：全畫面噴一下，從拉炮開口往上噴、再飄下來 ----------

  var CONFETTI_COLORS = ['#FFC628', '#7489E6', '#4FB59A', '#EE7B6A', '#F3A4FB', '#FF9419'];
  function confetti() {
    var layer = el.confetti;
    if (!layer || !layer.animate) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var rect = el.stage.getBoundingClientRect();
    // 開口在插圖的 (96,52)/(160,126)
    var ox = rect.left + rect.width * 0.6;
    var oy = rect.top + rect.height * 0.41;
    var h = window.innerHeight;
    for (var i = 0; i < 90; i += 1) {
      var piece = document.createElement('i');
      var w = 6 + Math.random() * 6;
      piece.style.width = w + 'px';
      piece.style.height = (Math.random() < 0.5 ? w : w * 2.4) + 'px';
      piece.style.left = ox + 'px';
      piece.style.top = oy + 'px';
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      layer.appendChild(piece);
      // 往右上為主、散開一點；先衝上去，再隨重力落到畫面外
      var angle = (-90 + (Math.random() * 150 - 60)) * Math.PI / 180;
      var speed = 160 + Math.random() * 260;
      var dx = Math.cos(angle) * speed;
      var dy = Math.sin(angle) * speed;
      var spin = (Math.random() * 2 - 1) * 900;
      var dur = 1600 + Math.random() * 1000;
      piece.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + spin / 3 + 'deg)', opacity: 1, offset: 0.25 },
          { transform: 'translate(' + dx * 1.6 + 'px,' + (h - oy + 40) + 'px) rotate(' + spin + 'deg)', opacity: 0.9 },
        ],
        { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
      ).onfinish = (function (p) { return function () { p.remove(); }; })(piece);
    }
  }

  // ---------- 聲音：喀喀喀、喀、砰（沒有背景配樂） ----------

  var SETTINGS_KEY = 'woohop-roulette-settings';
  var settings = { sound: true }; // 只記聲音開關（全站一樣）
  var audio = { ctx: null, noise: null };

  function ensureAudio() {
    if (!settings.sound) return null;
    try {
      if (!audio.ctx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audio.ctx = new Ctx();
      }
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      return audio.ctx;
    } catch (e) {
      return null;
    }
  }
  // iPhone 靜音鍵：在靜音狀態下建的引擎一輩子不出聲，切回頁面／打開聲音時重建（game.js 的 Leader.resetAudio）
  Leader.onAudioReset(function () {
    Leader.closeAudio(audio.ctx);
    audio.ctx = null;
    audio.noise = null;
  });
  function noiseBuffer(ctx) {
    if (audio.noise) return audio.noise;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.5), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    audio.noise = buffer;
    return buffer;
  }
  function env(gain, t, peak, decay) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }
  function noise(t, peak, decay, type, freq) {
    var ctx = audio.ctx;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    var gain = ctx.createGain();
    env(gain, t, peak, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
    src.stop(t + decay + 0.05);
  }
  function tone(type, f0, f1, t, peak, decay) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + decay);
    env(gain, t, peak, decay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }
  // 拉下去之後：越來越快的喀喀喀
  function suspenseSound() {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime + 0.02;
    [0, 0.26, 0.48, 0.64, 0.76].forEach(function (dt) {
      noise(t + dt, 0.35, 0.04, 'highpass', 3500);
      tone('square', 900, 0, t + dt, 0.05, 0.03);
    });
  }
  // 喀：沒事，一個空空的扳機聲＋往上的小音
  function clickSound() {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime + 0.01;
    noise(t, 0.6, 0.06, 'bandpass', 2400);
    tone('triangle', 520, 0, t + 0.12, 0.25, 0.12);
    tone('triangle', 780, 0, t + 0.22, 0.25, 0.18);
  }
  // 砰：低沉的爆裂＋紙花沙沙＋亮晶晶的上行音
  function bangSound() {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime + 0.01;
    noise(t, 1, 0.45, 'lowpass', 1400);
    tone('sine', 160, 40, t, 0.9, 0.35);
    noise(t + 0.05, 0.25, 0.9, 'highpass', 6000);
    [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) {
      tone('triangle', f, 0, t + 0.18 + i * 0.07, 0.12, 0.25);
    });
  }

  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫 window.toggleMusic）：管喀、砰和拉霸的聲音
  var soundButton = $('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sound: settings.sound }));
    } catch (e) {
      /* 無痕模式：照樣能玩，只是記不住 */
    }
    if (settings.sound) Leader.resetAudio(); // 先重建引擎：靜音狀態下建的那個不會出聲
    syncSoundButton();
  };
  try {
    var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  } catch (e) {
    /* 同上 */
  }

  // ---------- 真心話大冒險拉霸（Leader.slot） ----------

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.ROULETTE.slot.prompts,
        actions: window.ROULETTE.slot.actions,
        sound: function () { return settings.sound; },
        onPull: function (info) {
          track('roulette_slot_pulled', { game_number: gameNumber, kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
  }

  // ---------- 螢幕保持亮著 ----------

  function requestWakeLock() {
    if (!navigator.wakeLock || wakeLock) return;
    navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }).catch(function () {});
  }
  function releaseWakeLock() {
    if (!wakeLock) return;
    var lock = wakeLock;
    wakeLock = null;
    lock.release().catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && (screen === 'play' || screen === 'pop')) {
      wakeLock = null;
      requestWakeLock();
    }
  });

  // ---------- 帶領的步驟頭（Leader.lead）：play 是手機在大家手上傳，不放 ----------

  var STEPS = ['setup', 'rules', 'play', 'pop'];

  function renderLead() {
    if (screen === 'play') return;
    // 拉霸那一步：念出第幾位中了；不只一個人中就叫他們一個一個來
    var key = screen === 'pop' && uniqueHits() > 1 ? 'popMany' : screen;
    var text = T.lead[key];
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: text[0],
      say: screen === 'pop' ? fill(text[1], { who: seatText(game.hits) }) : text[1],
    });
  }

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    if (next === 'rules') Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
    if (next === 'play') readyToPull();
    if (next === 'pop') {
      resetSlot();
    }
    renderLead();
    if (next === 'play' || next === 'pop') requestWakeLock();
    else releaseWakeLock();
    syncSoundButton();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    startedAt = Date.now();
    newGame();
    ensureAudio(); // 在使用者按下去的這一下建立（自動播放限制）
    showScreen('play');
    track('roulette_game_started', { game_number: gameNumber, players: setup.players, chambers: setup.chambers, bangs: setup.bangs });
  }

  // ---------- 返回鍵：開場直接離開；說明規則回開場；開始玩之後先確認 ----------

  function pushGameState() {
    history.pushState({ popper: 'game' }, '');
  }

  function backToSetup() {
    game = null;
    busy = false;
    showScreen('setup');
  }

  function goBack(fromPop) {
    if (el.leaveModal.open) {
      el.leaveModal.close();
      if (fromPop) pushGameState();
      return;
    }
    if (screen === 'setup') {
      if (!fromPop) location.href = '/' + LANG + '/games/';
      return;
    }
    // 開始玩之後（還有沒砰完的）先確認；全部砰完了就直接回開場
    if ((screen === 'play' || screen === 'pop') && game && game.popped < game.bangs) {
      if (fromPop) pushGameState();
      if (typeof el.leaveModal.showModal === 'function') el.leaveModal.showModal();
      else confirmLeave();
      return;
    }
    backToSetup();
    if (!fromPop) history.back();
  }

  function confirmLeave() {
    if (el.leaveModal.open) el.leaveModal.close();
    backToSetup();
    history.back();
  }

  // ---------- 綁定 ----------

  el.playersLess.addEventListener('click', function () { bump('players', -1); });
  el.playersMore.addEventListener('click', function () { bump('players', 1); });
  el.chambersLess.addEventListener('click', function () { bump('chambers', -1); });
  el.chambersMore.addEventListener('click', function () { bump('chambers', 1); });
  el.bangsLess.addEventListener('click', function () { bump('bangs', -1); });
  el.bangsMore.addEventListener('click', function () { bump('bangs', 1); });
  el.chambersToggle.addEventListener('click', function () {
    var open = el.chambersPanel.hidden;
    el.chambersPanel.hidden = !open;
    el.chambersToggle.setAttribute('aria-expanded', String(open));
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.pull.addEventListener('click', pull);
  el.pass.addEventListener('click', readyToPull);
  el.again.addEventListener('click', startPlay);

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  renderSetup();
  drawPopper('idle');
  showScreen('setup');
})();
