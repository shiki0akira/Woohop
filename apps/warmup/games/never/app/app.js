/*
 * 我從來沒有。手指是大家自己折的、手機不記分（CONCEPT.md），手機只做四件事：
 * 一步一步帶、每一輪抽主題＋給例句、讓主持人按「下一輪」、國王指定的人拉真心話大冒險拉霸。
 * 五根折完的人出局，最後還留著手指的人當國王（老闆 11/16：看誰最後勝利、像國王遊戲一樣指定一個人）。
 *
 * 一步一步帶（跟果園菜園動物園同一套，步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場（選玩法）→ rules 說明規則 → play 開始（主題卡、下一輪）→ end 國王是誰（拉霸）→ 再玩一次回 play
 * 返回鍵一律回第一頁；開始玩之後先確認。
 */
(function () {
  'use strict';

  var T = window.NEVER.T;
  var BASE = window.NEVER.base;
  var LANG = window.NEVER.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  // 玩法：never 我從來沒有（預設）／did 我曾經做過。每次進來都是預設值（不記上次玩過的，全站規則）
  var mode = 'never';
  var screen = 'setup';
  var topicIndex = -1; // 這一輪的主題（T.topics 的第幾個）
  var exIndex = 0; // 這個主題現在顯示第幾句例句
  var deck = []; // 這一局還沒抽到的主題：一局裡先輪完所有主題才會重複
  var roundNumber = 0; // 這一局的第幾輪
  var gameNumber = 0; // 第幾局（再玩一次 +1）
  var startedAt = 0;
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    modeInputs: document.querySelectorAll('input[name="mode"]'),
    modeHint: $('mode-hint'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    roundTag: $('round-tag'),
    topicName: $('topic-name'),
    topicEx: $('topic-ex'),
    topicExText: $('topic-ex-text'),
    topicShuffle: $('topic-shuffle'),
    topicChips: $('topic-chips'),
    topicToggle: $('topic-toggle'),
    nextRound: $('next-round'),
    endBtn: $('end-btn'),
    slotRoot: $('slot-root'),
    again: $('again'),
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
  var leadTexts = function () { return mode === 'did' ? T.leadDid : T.lead; };

  // ---------- 開場：選玩法 ----------

  function setMode(next) {
    mode = next === 'did' ? 'did' : 'never';
    Array.prototype.forEach.call(el.modeInputs, function (input) { input.checked = input.value === mode; });
    el.modeHint.textContent = mode === 'did' ? T.modeHintDid : T.modeHintNever;
    if (screen === 'setup') renderLead();
  }

  // ---------- 主題：每一輪抽一個，也可以換或自己選 ----------
  /*
   * T.topics 是 [主題, [例句⋯]]。例句前面接「我從來沒有」或「我曾經」（看玩法），點一下換下一句。
   * 一局裡用洗好的牌抽：所有主題輪過一遍才會重複，也不會連著抽到同一個。
   */
  function drawTopic() {
    if (!deck.length) {
      deck = T.topics.map(function (_, i) { return i; });
      for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
      }
      if (deck.length > 1 && deck[deck.length - 1] === topicIndex) deck.unshift(deck.pop());
    }
    return deck.pop();
  }

  function setTopic(index, how) {
    topicIndex = index;
    var i = deck.indexOf(index);
    if (i >= 0) deck.splice(i, 1); // 自己選的也算抽過
    var topic = T.topics[index];
    exIndex = Math.floor(Math.random() * topic[1].length);
    el.topicName.textContent = topic[0];
    renderExample();
    el.roundTag.textContent = fill(T.roundLabel, { n: roundNumber });
    Array.prototype.forEach.call(el.topicChips.children, function (chip, k) {
      chip.setAttribute('aria-pressed', String(k === index));
    });
    if (screen === 'play') renderLead();
    if (how) track('never_topic_changed', { round_number: roundNumber, topic: topic[0], mode: mode, random: how === 'random' });
  }

  function renderExample() {
    var examples = T.topics[topicIndex][1];
    el.topicExText.textContent = fill(mode === 'did' ? T.exDid : T.exNever, { ex: examples[exIndex % examples.length] });
  }

  function renderTopicChips() {
    T.topics.forEach(function (topic, i) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = topic[0];
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', function () { setTopic(i, 'pick'); });
      el.topicChips.appendChild(chip);
    });
  }

  function nextRound() {
    roundNumber += 1;
    setTopic(drawTopic());
    track('never_round_started', { round_number: roundNumber, topic: T.topics[topicIndex][0], mode: mode });
    window.scrollTo(0, 0);
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  function renderLead() {
    // 抽到「自由發揮」（topics 第三格是 'free'）那一輪念 playFree：不限主題
    var free = screen === 'play' && topicIndex >= 0 && T.topics[topicIndex][2] === 'free';
    var text = leadTexts()[free ? 'playFree' : screen];
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: text[0],
      say: topicIndex >= 0 ? fill(text[1], { topic: T.topics[topicIndex][0] }) : text[1],
    });
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 每輪一個主題（一張在笑的主題卡）、輪流說（說話泡泡）、折手指（一隻手、兩根手指折下去）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 18) + '" y="' + (y - 14) + '" width="36" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  /*
   * 一隻手（手心朝前）：四根手指＋大拇指在手掌後面，folded 列出折下去的手指（0 食指 ⋯ 3 小指、4 大拇指），
   * 折下去的只露出一小截。之後首頁插圖（art.never）也用這個樣子
   */
  function hand(folded, color, face) {
    var tops = [26, 18, 22, 34];
    var out = '';
    [52, 68, 84, 100].forEach(function (x, i) {
      // 折下去的手指：指尖彎到手掌前面，畫成手掌上緣的一截圓頭
      var top = folded.indexOf(i) >= 0 ? 42 : tops[i];
      out += W.body('<rect x="' + x + '" y="' + top + '" width="16" height="' + (84 - top) + '" rx="8"/>', color, '', false);
    });
    var thumb = folded.indexOf(4) >= 0 ? 'rotate(-15 50 104)' : 'rotate(-45 50 104)';
    out += W.body('<rect x="40" y="66" width="17" height="42" rx="8.5" transform="' + thumb + '"/>', color, '', false);
    out += W.body('<rect x="48" y="58" width="72" height="59" rx="20"/>', color);
    return out + W.makeFace(face, 84, 88, 1.5);
  }
  var RULE_ART = [
    function () {
      return W.ground + W.burst(140, 26, '#FFC628') + W.ring(22, 34, '#7489E6') + W.dot(146, 100, '#4FB59A', 4) +
        '<g transform="rotate(-8 80 74)">' + W.body('<rect x="46" y="30" width="68" height="86" rx="12"/>', '#FFC628') + '</g>' +
        W.makeFace('happy', 80, 64, 1.6) +
        '<path d="M62 92h36M68 102h24" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>';
    },
    function () {
      return W.ground + W.plus(146, 92, '#4FB59A') + W.dot(20, 96, '#FFC628', 4) +
        W.body('<circle cx="70" cy="84" r="32"/>', '#F3A4FB') + W.makeFace('wink', 70, 84, 1.4) +
        bubble(118, 36, '…') + '<path d="M104 50l-8 10 14-6" fill="#fff" ' + W.K + '/>';
    },
    function () {
      return W.ground + W.burst(28, 30, '#FFC628') + W.ring(142, 30, '#4FB59A') + hand([2, 3], '#fbb3a8', 'worry');
    },
  ];

  // ---------- 國王指定一個人拉真心話大冒險拉霸（Leader.slot） ----------
  // 拉霸的題目全站共用、都是破冰安全的，國王不用自己想要人做什麼（11/16 討論）

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.NEVER.slot.prompts,
        actions: window.NEVER.slot.actions,
        sound: function () { return settings.sound; },
        // 拉霸轉的時候配樂再壓低，停下來回到背景音量（照果園菜園動物園）
        onPull: function (info) {
          duckMusic(true);
          track('never_slot_pulled', { game_number: gameNumber, kind: info.kind, mode: info.mode });
        },
        onLand: function () { duckMusic(false); },
      });
    }
    slotTool.reset();
  }

  /*
   * ---------- 背景配樂（老闆 11/16：開始玩時也要有配樂） ----------
   *
   * 樂曲照搬竹筍（福杯滿溢也是同一首）：大鼓＋拍手＋hi-hat＋triangle 貝斯＋square 小旋律、C 大調五聲音階、
   * 貝斯一小節一圈、旋律兩小節一句，速度固定 112 BPM 不加速（系列規則）。引擎照福杯滿溢的 music 那段複製，
   * 拿掉水位與表面張力。window.Leader 還沒有「只有配樂」的共用引擎（之後做配樂庫再抽，memory music-library-idea）。
   *
   * 音量跟福杯滿溢一樣（MUSIC_VOL 0.3；11/16 先做 0.16，老闆說太小聲）。
   * 什麼時候播：syncMusic() 一個地方決定——play、end 兩個畫面、聲音開著才播；end（國王）更小聲當背景，
   * 拉霸轉的時候再壓低。開場不播、頂欄音符鍵在開場藏起來（全站規則）。
   */
  var SETTINGS_KEY = 'woohop-never-settings';
  var settings = { sound: true }; // 只記聲音開關（全站一樣），其他設定每次都是預設
  var MUSIC_VOL = 0.3; // 跟福杯滿溢一樣（11/16 老闆：0.16 太小聲）
  var MUSIC_BG_VOL = 0.18; // 國王那一步：背景
  var MUSIC_DUCK = 0.06; // 拉霸轉的時候
  var MUSIC_BPM = 112;
  var audio = { ctx: null, noise: null };
  var music = { bus: null, timer: 0, playing: false, next: 0, step: 0, bar: 0, ducked: false };

  function ensureAudio() {
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
    if (music.playing && document.visibilityState === 'visible') return; // 正在出聲的不重建
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    music.bus = null;
    Leader.closeAudio(audio.ctx);
    audio.ctx = null;
    audio.noise = null;
  });
  function noiseBuffer(ctx) {
    if (audio.noise) return audio.noise;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    audio.noise = buffer;
    return buffer;
  }

  var NOTE = { C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 };
  var BASS = ['C3', null, 'C3', null, 'G3', null, 'A3', null, 'C3', null, 'C3', null, 'E3', null, 'G3', 'D3'];
  var MELODY = [
    ['E5', null, 'G5', null, 'A5', null, 'G5', null, 'E5', null, null, 'D5', 'C5', null, null, null],
    ['D5', null, 'E5', null, 'G5', null, 'E5', null, 'A5', null, 'G5', null, 'E5', 'D5', 'C5', null],
  ];

  function env(gain, t, peak, decay) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }
  function mtone(type, freq, t, peak, decay, filterFreq) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env(gain, t, peak, decay);
    if (filterFreq) {
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(music.bus);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }
  function kick(t, peak) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    env(gain, t, peak || 0.9, 0.22);
    osc.connect(gain);
    gain.connect(music.bus);
    osc.start(t);
    osc.stop(t + 0.3);
  }
  function mnoise(t, peak, decay, hp) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    var gain = ctx.createGain();
    env(gain, t, peak, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(music.bus);
    src.start(t);
    src.stop(t + decay + 0.05);
  }
  // 一步（十六分音符），照竹筍的 scheduleStep，不加速、不隨時間變密
  function scheduleMusicStep(t) {
    var s = music.step;
    var bar = music.bar;
    if (s === 0 || s === 8 || (bar % 2 === 1 && s === 10)) kick(t, 0.8);
    if (s === 4 || s === 12) mnoise(t, 0.28, 0.1, 1500); // 拍手
    if (s % 2 === 0) mnoise(t, s % 4 === 2 ? 0.12 : 0.06, 0.03, 7000);
    if (BASS[s]) mtone('triangle', NOTE[BASS[s]], t, 0.35, 0.22);
    var note = MELODY[bar % 2][s];
    if (note) mtone('square', NOTE[note], t, 0.07, 0.16, 2600);
  }
  function musicTick() {
    var ctx = audio.ctx;
    if (!ctx || !music.playing) return;
    var guard = 0;
    while (music.next < ctx.currentTime + 0.12 && guard < 24) {
      scheduleMusicStep(music.next);
      music.next += 15 / MUSIC_BPM;
      music.step = (music.step + 1) % 16;
      if (music.step === 0) music.bar += 1;
      guard += 1;
    }
    // 計時器被節流過（切到背景、省電模式）就不要補排一大串過期的音，直接跳到現在
    if (music.next < ctx.currentTime) music.next = ctx.currentTime + 0.05;
  }
  function musicLevel() {
    if (music.ducked) return MUSIC_DUCK;
    return screen === 'end' ? MUSIC_BG_VOL : MUSIC_VOL;
  }
  function rampBus(target, seconds) {
    if (!music.bus || !audio.ctx) return;
    var now = audio.ctx.currentTime;
    var g = music.bus.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(Math.max(0.0001, target), now + seconds);
  }
  function duckMusic(on) {
    if (music.ducked === on) return;
    music.ducked = on;
    if (music.playing) rampBus(musicLevel(), on ? 0.08 : 0.5);
  }
  function startMusic() {
    if (music.playing) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    if (!music.bus) {
      music.bus = ctx.createGain();
      music.bus.gain.value = 0.0001;
      music.bus.connect(ctx.destination);
    }
    music.playing = true;
    music.step = 0;
    music.bar = 0;
    music.next = ctx.currentTime + 0.08;
    rampBus(musicLevel(), 0.4);
    music.timer = setInterval(musicTick, 25);
    musicTick();
  }
  // 已經排進音訊時鐘的音停不掉，所以是把匯流排淡掉
  function stopMusic() {
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    rampBus(0.0001, 0.3);
  }
  // 該播的時候播、不該播的時候不要自己冒出來；換畫面、切回頁面、開關聲音都走這裡
  function syncMusic() {
    var want = settings.sound && (screen === 'play' || screen === 'end') && document.visibilityState === 'visible';
    if (want && !music.playing) startMusic();
    else if (!want && music.playing) stopMusic();
    else if (want) rampBus(musicLevel(), 0.4); // 從 play 換到 end：音量往下
    syncSoundButton();
  }

  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫 window.toggleMusic）：管配樂和拉霸的聲音
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
    syncMusic();
  };
  try {
    var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  } catch (e) {
    /* 同上 */
  }

  // ---------- 螢幕保持亮著（一輪可能講很久） ----------

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
  // 切到背景會被系統放掉，回來時還在玩就再要一次
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && screen === 'play') {
      wakeLock = null;
      requestWakeLock();
    }
    // 切到背景停配樂（背景分頁的 setInterval 會被節流、排程會亂），切回來再接上
    syncMusic();
  });

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    if (next === 'rules') Leader.ruleCards(el.ruleCards, mode === 'did' ? T.ruleCardsDid : T.ruleCards, RULE_ART);
    renderLead();
    if (next === 'play') requestWakeLock();
    else releaseWakeLock();
    if (next === 'end') resetSlot();
    syncMusic();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    roundNumber = 1;
    startedAt = Date.now();
    deck = [];
    setTopic(drawTopic());
    showScreen('play');
    track('never_game_started', { game_number: gameNumber, mode: mode, topic: T.topics[topicIndex][0] });
  }

  // ---------- 返回鍵：一律回第一頁；開始玩之後先確認 ----------

  function pushGameState() {
    history.pushState({ never: 'game' }, '');
  }

  function backToSetup() {
    topicIndex = -1;
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
    if (screen === 'play') {
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

  // ---------- 結束遊戲：按住 HOLD_MS 才結束（跟竹筍同一個做法，防手滑） ----------

  var HOLD_MS = 800;
  var holdId = 0;

  function endGame() {
    cancelHold();
    track('never_game_ended', {
      game_number: gameNumber,
      mode: mode,
      rounds: roundNumber,
      duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });
    showScreen('end');
  }
  function cancelHold() {
    clearTimeout(holdId);
    holdId = 0;
    el.endBtn.classList.remove('is-holding');
  }

  // ---------- 綁定 ----------

  Array.prototype.forEach.call(el.modeInputs, function (input) {
    input.addEventListener('change', function () { if (input.checked) setMode(input.value); });
  });

  el.topicShuffle.addEventListener('click', function () { setTopic(drawTopic(), 'random'); });
  el.topicEx.addEventListener('click', function () {
    exIndex += 1;
    renderExample();
  });
  el.topicToggle.addEventListener('click', function () {
    var open = el.topicChips.hidden;
    el.topicChips.hidden = !open;
    el.topicToggle.setAttribute('aria-expanded', String(open));
  });
  el.nextRound.addEventListener('click', nextRound);

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.endBtn.addEventListener('click', function (event) {
    if (event.detail === 0) endGame(); // 鍵盤沒有「按住」可言
  });
  el.endBtn.addEventListener('pointerdown', function (event) {
    if (event.button > 0) return;
    cancelHold();
    el.endBtn.classList.add('is-holding');
    holdId = setTimeout(endGame, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.endBtn.addEventListener(type, cancelHold);
  });
  el.endBtn.addEventListener('contextmenu', function (event) { event.preventDefault(); });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  renderTopicChips();
  showScreen('setup');
  setMode('never');
})();
