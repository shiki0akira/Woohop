/*
 * 秒數挑戰。一支手機傳著玩：手機出一個目標秒數，大家輪流點一下開始、再點一下停，看誰最接近（CONCEPT.md）。
 *
 * 一步一步帶（跟福杯滿溢同一套，步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場（數字看得到幾秒）→ rules 說明規則 → play（draw 抽秒數 → ready → running → done → ready ⋯⋯）
 *   → end 看結果（前三名頒獎台＋排名）→ 再來一輪回 play
 * 人數在開場先設定（老闆 11/12），最後一位按完「傳給下一位」就變成「看結果」。結束不放拉霸（老闆 11/12）。
 *
 * 兩種玩法（開場選，老闆 11/12）：
 *   one  輪流按：一支手機傳著玩（上面那套）
 *   each 一起按：每人一支手機，照倒放猜猜看的搶答——**沒有伺服器**。選了一起按，開場就出 QR code（網址帶
 *        #c=代碼）。代碼＝3 個英文字母的種子＋看得到幾秒（例 KMQ2）。
 *        沒掃到的人按「我是來按的，只要計時器」：**不用代碼**（老闆 11/12：又不是房間遊戲），
 *        就是一個計時器，目標聽主持人念（free），畫面上不放目標、不算差多少。
 *        每一輪的目標秒數由「種子＋第幾輪」算出來（targetFor），
 *        所以大家掃一次就好，換下一輪各自按「下一輪」也會是同一個秒數。結果在自己手機上，大家亮手機比。
 *        一起按沒有配樂（好幾支手機同時放會亂，跟房間型遊戲同一個規則）。
 * 輪流按的那一步手機在大家手上傳，**不放步驟頭**（apps/warmup/CLAUDE.md）。
 * 不記名字，結果用「第幾位」（老闆 11/12）。返回鍵一律回第一頁；已經有人按過就先確認。
 *
 * 時間一律用 performance.now() 量（不受系統時鐘調整影響），顯示到小數兩位。
 * **計時中配樂停下來**（老闆 11/12）：配樂有固定節拍，大家會跟著數拍子算秒數。
 */
(function () {
  'use strict';

  var T = window.SECONDS.T;
  var BASE = window.SECONDS.base;
  var LANG = window.SECONDS.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SETTINGS_KEY = 'woohop-seconds-settings';

  /*
   * 目標秒數：TARGET_MIN～TARGET_MAX 之間隨機、到小數兩位（現在 5.00～15.00 秒）。
   * 下限要比「數字看得到幾秒」（最多 3 秒）大一截，不然看著數字就按完了。
   * 上限 15 秒：再長大家等得很無聊，一輪 10 個人就要好幾分鐘。
   */
  var TARGET_MIN = 5;
  var TARGET_MAX = 15;
  // 開始之後這麼短就按停，當成手滑（連點兩下）不算：數字回到 0、重新開始
  var MIN_PRESS_MS = 250;

  var PLAYERS_MIN = 2;
  var PLAYERS_MAX = 20;
  // 遊戲人數、數字看得到幾秒（每次打開都是預設，系列慣例不記上次選的）
  var prep = { mode: 'one', players: 4, peek: 2 };
  // 一起按：這一場的種子、第幾輪、這支手機是不是開 QR code 的主持人
  // free：按「我是來按的，只要計時器」進來的，只計時、不出目標（目標聽主持人念）
  var each = { seed: '', round: 1, host: false, free: false };
  var settings = { sound: true }; // 只記聲音開關

  var screen = 'setup';
  var phase = 'draw';
  var target = 0; // 這一輪的目標秒數
  var results = []; // 這一輪每個人按了幾秒（照順序，第 1 位在 index 0）
  var runStart = 0;
  var raf = 0;
  var peekTimer = 0; // 前幾秒過了就把數字藏起來（用 setTimeout 不靠 rAF：rAF 在背景或省電時會停）
  var gameNumber = 0;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    target: $('target'),
    turn: $('turn'),
    clock: $('clock'),
    clockNum: $('clock-num'),
    clockMask: $('clock-mask'),
    result: $('result'),
    resultLine: $('result-line'),
    resultDiff: $('result-diff'),
    pressHint: $('press-hint'),
    press: $('press'),
    next: $('next'),
    playersLess: $('players-less'),
    playersMore: $('players-more'),
    playersValue: $('players-value'),
    playersField: $('players-field'),
    modeHint: $('mode-hint'),
    qrWrap: $('setup-qr-wrap'),
    qrBox: $('qr-box'),
    joinOnly: $('join-only'),
    endEach: $('end-each'),
    compareHint: $('compare-hint'),
    endTarget: $('end-target'),
    podium: $('podium'),
    ranks: $('ranks'),
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
  function fmt(sec) {
    return sec.toFixed(2);
  }
  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback; // 無痕模式、封鎖 storage：照樣能玩，只是記不住
    }
  }
  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 同上 */
    }
  }

  // ---------- 聲音：配樂＋開始／停的提示音（Web Audio 當場合成，不載音檔） ----------

  /*
   * 配樂照搬竹筍那一首（福杯滿溢也是同一份，記憶 music-library-idea），固定 112 BPM 不加速。
   * **計時中（running）停掉**：有節拍就能跟著數拍子，這個遊戲就壞了（老闆 11/12）。
   * 開始／停各一聲短短的提示音，不在拍子上，不會變成節拍器。
   * 什麼時候播一律由 syncMusic() 決定：play 畫面、不是 running、聲音開著、頁面在前景。
   */
  var audio = { ctx: null, bus: null, noise: null };
  var music = { timer: 0, playing: false, next: 0, step: 0, bar: 0 };
  var MUSIC_BPM = 112;
  var MUSIC_VOL = 0.25;

  var NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5,
  };
  var BASS = ['C3', null, 'C3', null, 'G3', null, 'A3', null, 'C3', null, 'C3', null, 'E3', null, 'G3', 'D3'];
  var MELODY = [
    ['E5', null, 'G5', null, 'A5', null, 'G5', null, 'E5', null, null, 'D5', 'C5', null, null, null],
    ['D5', null, 'E5', null, 'G5', null, 'E5', null, 'A5', null, 'G5', null, 'E5', 'D5', 'C5', null],
  ];

  // AudioContext 一定要在使用者手勢裡建立／resume：第一次是在說明規則按「開始遊戲」那一下
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

  // iPhone 靜音鍵：靜音狀態下建的 context 一輩子不出聲，打開聲音／切回頁面時重建（game.js 的 Leader.resetAudio 會叫到這裡）
  Leader.onAudioReset(function () {
    if (music.playing) return;
    Leader.closeAudio(audio.ctx);
    audio.ctx = null;
    audio.bus = null;
    audio.noise = null;
  });

  function env(gain, at, peak, decay) {
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  }

  function tone(type, freq, at, peak, decay, filterFreq, out) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    env(gain, at, peak, decay);
    if (filterFreq) {
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(out || audio.bus);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }

  function kick(at, peak) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.14);
    env(gain, at, peak, 0.22);
    osc.connect(gain);
    gain.connect(audio.bus);
    osc.start(at);
    osc.stop(at + 0.3);
  }

  function noiseBuffer(ctx) {
    if (audio.noise) return audio.noise;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    audio.noise = buffer;
    return buffer;
  }

  function hat(at, peak, decay, hp) {
    var ctx = audio.ctx;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    var gain = ctx.createGain();
    env(gain, at, peak, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audio.bus);
    src.start(at);
    src.stop(at + decay + 0.05);
  }

  function scheduleStep(at) {
    var s = music.step;
    var bar = music.bar;
    if (s === 0 || s === 8 || (bar % 2 === 1 && s === 10)) kick(at, 0.8);
    if (s === 4 || s === 12) hat(at, 0.28, 0.1, 1500); // 拍手
    if (s % 2 === 0) hat(at, s % 4 === 2 ? 0.12 : 0.06, 0.03, 7000);
    if (BASS[s]) tone('triangle', NOTE[BASS[s]], at, 0.35, 0.22);
    var note = MELODY[bar % 2][s];
    if (note) tone('square', NOTE[note], at, 0.07, 0.16, 2600);
  }

  // 「音訊時鐘＋往前看」：每 25ms 把接下來 0.12 秒的音排好，主執行緒在忙也不會歪拍
  function musicTick() {
    var ctx = audio.ctx;
    if (!ctx || !music.playing) return;
    var guard = 0;
    while (music.next < ctx.currentTime + 0.12 && guard < 24) {
      scheduleStep(music.next);
      music.next += 15 / MUSIC_BPM;
      music.step = (music.step + 1) % 16;
      if (music.step === 0) music.bar += 1;
      guard += 1;
    }
    if (music.next < ctx.currentTime) music.next = ctx.currentTime + 0.05;
  }

  function rampBus(target, seconds) {
    if (!audio.bus || !audio.ctx) return;
    var now = audio.ctx.currentTime;
    var g = audio.bus.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(Math.max(0.0001, target), now + seconds);
  }

  function ensureBus() {
    var ctx = ensureAudio();
    if (!ctx) return null;
    if (!audio.bus) {
      audio.bus = ctx.createGain();
      audio.bus.gain.value = 0.0001;
      audio.bus.connect(ctx.destination);
    }
    return ctx;
  }

  function startMusic() {
    if (music.playing) return;
    var ctx = ensureBus();
    if (!ctx) return;
    music.playing = true;
    music.step = 0;
    music.bar = 0;
    music.next = ctx.currentTime + 0.08;
    rampBus(MUSIC_VOL, 0.4);
    music.timer = setInterval(musicTick, 25);
    musicTick();
  }

  // 已經排進音訊時鐘的音停不掉，所以是把匯流排淡掉。計時一開始要「馬上」安靜，fade 給很短
  function stopMusic(fade) {
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    rampBus(0.0001, fade == null ? 0.3 : fade);
  }

  function syncMusic() {
    var want = settings.sound && prep.mode === 'one' && screen === 'play' && phase !== 'running' && !document.hidden;
    if (want && !music.playing) startMusic();
    else if (!want && music.playing) stopMusic(phase === 'running' ? 0.06 : 0.3);
    else if (want && audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  }

  // 開始：短短往上一聲；停：往下一聲。直接接 destination（不受配樂匯流排的淡入淡出影響）
  function beep(up) {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var now = ctx.currentTime + 0.01;
    tone('sine', up ? 880 : 660, now, 0.25, 0.12, 0, ctx.destination);
    tone('sine', up ? 1320 : 440, now + 0.07, 0.22, 0.16, 0, ctx.destination);
  }

  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫 window.toggleMusic）
  var soundButton = $('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    if (settings.sound) {
      stopMusic(0);
      Leader.resetAudio(); // 先重建引擎：靜音狀態下建的那個不會出聲（結束畫面的拉霸也一起）
    }
    syncMusic();
    writeJson(SETTINGS_KEY, { sound: settings.sound });
    syncSoundButton();
  };

  // ---------- 輪流按 ----------

  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.turn.textContent = each.free && prep.mode === 'each'
      ? T.timerOnlyLabel
      : prep.mode === 'each'
      ? fill(T.roundLabel, { n: each.round })
      : fill(T.turnLabel, { n: Math.min(results.length + 1, prep.players), total: prep.players });
    if (next === 'ready') {
      el.press.textContent = T.startPress;
      el.press.classList.remove('is-running');
      el.pressHint.textContent = T.readyHint;
      setClock(0);
      el.clock.classList.remove('is-hidden');
    }
    if (next === 'running') {
      el.press.textContent = T.stopPress;
      el.press.classList.add('is-running');
      el.pressHint.textContent = T.runningHint;
    }
    syncMusic();
  }

  /*
   * 計時的數字：每一位一個底塊、小數點不加底塊（老闆 11/12：像碼錶）。
   * 固定四位數（00.00），所以格子只在第一次建，之後每個 frame 只換字、不重建 DOM。
   */
  function paintTiles(box, text) {
    var chars = text.split('');
    if (box.children.length !== chars.length) {
      box.textContent = '';
      chars.forEach(function (ch) {
        var span = document.createElement('span');
        span.className = ch === '.' ? 'clock-dot' : 'clock-digit';
        box.appendChild(span);
      });
    }
    chars.forEach(function (ch, i) {
      if (box.children[i].textContent !== ch) box.children[i].textContent = ch;
    });
  }
  function setClock(sec) {
    // 固定四位數 00.00（老闆 11/12）：底塊一開始就是四格，超過 10 秒也不會突然多一格
    var text = fmt(Math.min(sec, 99.99)).padStart(5, '0');
    paintTiles(el.clockNum, text);
    // 問號跟數字一樣多位，淡掉的時候寬度才不會跳
    paintTiles(el.clockMask, text.replace(/[0-9]/g, '?'));
  }

  function frame() {
    if (phase !== 'running') return;
    var sec = (performance.now() - runStart) / 1000;
    setClock(sec);
    raf = requestAnimationFrame(frame);
  }

  function startRun() {
    runStart = performance.now();
    setPhase('running');
    beep(true);
    raf = requestAnimationFrame(frame);
    // 前 prep.peek 秒看得到數字，之後淡掉換成問號（老闆 11/12）
    clearTimeout(peekTimer);
    peekTimer = setTimeout(function () {
      if (phase === 'running') el.clock.classList.add('is-hidden');
    }, prep.peek * 1000);
  }

  function stopRun() {
    var ms = performance.now() - runStart;
    cancelAnimationFrame(raf);
    clearTimeout(peekTimer);
    // 連點兩下手滑：不算，數字歸零重新準備
    if (ms < MIN_PRESS_MS) {
      setPhase('ready');
      return;
    }
    var sec = Math.round(ms / 10) / 100;
    if (prep.mode === 'one') results.push(sec);
    beep(false);
    showResult(sec);
    setPhase('done');
  }

  function showResult(sec) {
    var diff = Math.round(Math.abs(sec - target) * 100) / 100;
    setClock(sec);
    el.clock.classList.remove('is-hidden');
    el.resultLine.textContent = fill(T.resultLine, { t: fmt(sec) });
    el.resultDiff.textContent = diff === 0 ? T.diffExact : fill(sec > target ? T.diffOver : T.diffUnder, { d: fmt(diff) });
    // 最後一位按完：換人的鍵變成「看結果」；一起按就是「下一輪」，下面提醒大家亮手機比
    el.next.textContent = prep.mode === 'each' ? (each.free ? T.againPress : T.nextRoundButton) : isLast() ? T.finishButton : T.nextButton;
    el.compareHint.hidden = prep.mode !== 'each';
    el.compareHint.textContent = each.free ? T.compareFreeHint : T.compareHint;
    // 只要計時器：沒有目標，不算差多少
    el.resultDiff.hidden = prep.mode === 'each' && each.free;
    // 一起按的主持人：可以結束遊戲（掃進來的人、只要計時器的人不用，主持人說結束就結束）
    el.endEach.hidden = !(prep.mode === 'each' && each.host && !each.free);
  }

  // 抽目標秒數：數字跑一陣子再停在真正的那個（reduceMotion 時直接出結果）
  var drawToken = 0;
  function drawTarget(done) {
    target = prep.mode === 'each'
      ? targetFor(each.seed, each.round)
      : Math.round((TARGET_MIN + Math.random() * (TARGET_MAX - TARGET_MIN)) * 100) / 100;
    if (reduceMotion) {
      el.target.textContent = fmt(target);
      done();
      return;
    }
    var token = (drawToken += 1);
    var delays = [60, 60, 70, 80, 95, 115, 140, 175, 215, 265];
    var i = 0;
    (function step() {
      if (token !== drawToken || screen !== 'play') return;
      if (i >= delays.length) {
        el.target.textContent = fmt(target);
        el.target.parentNode.classList.add('is-drawn');
        done();
        return;
      }
      el.target.textContent = fmt(TARGET_MIN + Math.random() * (TARGET_MAX - TARGET_MIN));
      setTimeout(step, delays[i]);
      i += 1;
    })();
  }

  function isLast() {
    return prep.mode === 'one' && results.length >= prep.players;
  }

  // ---------- 一起按：種子、QR code ----------

  /*
   * 由「種子＋第幾輪」算出目標秒數（TARGET_MIN～TARGET_MAX、小數兩位）。每支手機算的一樣，所以不用伺服器。
   * FNV-1a：短、每台瀏覽器結果一致（不能用 Math.random，它不能給種子）
   */
  function targetFor(seed, round) {
    var str = seed + ':' + round;
    var h = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    var span = Math.round((TARGET_MAX - TARGET_MIN) * 100);
    return (TARGET_MIN * 100 + (h % span)) / 100;
  }

  // 種子：3 個英文字母（拿掉 I、L、O 這種會看錯的），一打開頁面選一起按就產生一次，這一場都用同一個
  var SEED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  var CODE_RE = /^([A-HJKMNP-Z]{3})([123])$/;
  function newSeed() {
    var out = '';
    for (var i = 0; i < 3; i += 1) out += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
    return out;
  }

  // 代碼＝種子＋看得到幾秒（KMQ2），打代碼加入的人也會拿到一樣的「看得到幾秒」
  function joinCode() {
    return each.seed + prep.peek;
  }

  function renderQr() {
    if (typeof window.qrcode !== 'function') return;
    var qr = window.qrcode(0, 'M');
    qr.addData(location.origin + BASE + '/' + LANG + '/#c=' + joinCode());
    qr.make();
    el.qrBox.innerHTML = W && W.qrSvg ? W.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  // 掃 QR code 進來的人：直接進按的畫面（不走帶領步驟）
  function enterAsPlayer(code) {
    var m = CODE_RE.exec(code);
    if (!m) return false;
    prep.mode = 'each';
    prep.peek = Number(m[2]);
    each.seed = m[1];
    each.round = 1;
    each.host = false;
    each.free = false;
    showScreen('play');
    startEachRound();
    track('seconds_joined', { peek_seconds: prep.peek });
    return true;
  }

  // 我是來按的，只要計時器：不用代碼，只計時（目標聽主持人念）
  function enterAsTimer() {
    prep.mode = 'each';
    each.host = false;
    each.free = true;
    each.round = 1;
    showScreen('play');
    startEachRound();
    track('seconds_timer_only', { peek_seconds: prep.peek });
  }

  // 一起按的一輪：目標秒數由種子算，主持人和掃進來的人都走這裡
  function startEachRound() {
    el.target.parentNode.classList.remove('is-drawn');
    el.compareHint.hidden = true;
    views.play.classList.toggle('is-free', each.free);
    if (each.free) {
      setPhase('ready');
      return;
    }
    setPhase('draw');
    drawTarget(function () { setPhase('ready'); });
  }

  function startPlay() {
    if (prep.mode === 'each') {
      // 主持人：用開場那個 QR code 的種子（大家已經掃了），從第 1 輪開始
      gameNumber += 1;
      each.round = 1;
      each.host = true;
      showScreen('play');
      startEachRound();
      track('seconds_game_started', { game_number: gameNumber, mode: 'each', peek_seconds: prep.peek });
      return;
    }
    gameNumber += 1;
    results = [];
    el.target.parentNode.classList.remove('is-drawn');
    setPhase('draw');
    showScreen('play');
    syncMusic(); // 這裡一定在使用者的 click 裡，AudioContext 才建得起來
    drawTarget(function () { setPhase('ready'); });
    track('seconds_game_started', { game_number: gameNumber, mode: 'one', players: prep.players, peek_seconds: prep.peek });
  }

  function nextPerson() {
    if (prep.mode === 'each') {
      each.round += 1;
      startEachRound();
      window.scrollTo(0, 0);
      return;
    }
    if (isLast()) {
      showEnd();
      return;
    }
    setPhase('ready');
    window.scrollTo(0, 0);
  }

  // ---------- 結果 ----------

  /*
   * 一起按的結束（老闆 11/12）：沒有伺服器收成績，所以沒有頒獎台，只說玩了幾輪、請大家自己數贏了幾輪。
   * 再玩一次要回開場換新的 QR code（新的種子），大家重新掃，輪數才會從頭對得上
   */
  function showEachEnd() {
    el.endTarget.textContent = fill(T.endEachLine, { n: each.round });
    el.podium.hidden = true;
    el.ranks.hidden = true;
    el.again.textContent = T.againEach;
    track('seconds_game_ended', { game_number: gameNumber, mode: 'each', rounds: each.round, peek_seconds: prep.peek });
    showScreen('end');
  }

  function showEnd() {
    el.podium.hidden = false;
    el.ranks.hidden = false;
    el.again.textContent = T.againButton;
    var rows = results.map(function (sec, i) {
      return { n: i + 1, sec: sec, diff: Math.round(Math.abs(sec - target) * 100) / 100 };
    });
    rows.sort(function (a, b) { return a.diff - b.diff || a.n - b.n; });
    el.endTarget.textContent = fill(T.endTarget, { t: fmt(target) });
    renderPodium(rows);
    el.ranks.textContent = '';
    rows.slice(3).forEach(function (r, i) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = fill(T.rankRow, { n: r.n });
      var time = document.createElement('span');
      time.className = 'time';
      time.textContent = fmt(r.sec);
      var diff = document.createElement('span');
      diff.className = 'diff';
      diff.textContent = fill(T.rankDiff, { d: fmt(r.diff) });
      li.append(name, time, diff);
      el.ranks.appendChild(li);
    });
    track('seconds_round_ended', {
      game_number: gameNumber,
      players: rows.length,
      best_diff: rows[0].diff,
      peek_seconds: prep.peek,
    });
    showScreen('end');
  }

  /*
   * 頒獎台（設計系統頁「14. 結果」、幸福賓果的結算同一套）：第一名在中間、最高、黃色加皇冠，
   * 第二名藍、第三名橘，畫面上的順序是 2、1、3。不記名字，所以台上寫「第幾位」，下面是按了幾秒和差多少。
   * 只有兩個人的時候台上就兩欄。沒有懲罰，所以差最多的人不另外標（老闆 11/12：下面的清單用一般的白底就好）。
   */
  var STEPS_PODIUM = [
    { height: 100, face: 'var(--yellow-face)', edge: 'var(--yellow-edge)' },
    { height: 70, face: 'var(--blue-face)', edge: 'var(--blue-edge)' },
    { height: 52, face: 'var(--orange-face)', edge: 'var(--orange-edge)' },
  ];

  function renderPodium(rows) {
    var top = rows.slice(0, 3);
    el.podium.textContent = '';
    [1, 0, 2].filter(function (rank) { return rank < top.length; }).forEach(function (rank) {
      var r = top[rank];
      var step = STEPS_PODIUM[rank];
      var col = document.createElement('div');
      col.className = 'col';
      if (rank === 0) col.insertAdjacentHTML('beforeend', '<svg class="crown" width="26" height="26" aria-hidden="true"><use href="#i-crown"/></svg>');
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = fill(T.rankRow, { n: r.n });
      var time = document.createElement('span');
      time.className = 'podium-time';
      time.textContent = fmt(r.sec);
      var diff = document.createElement('span');
      diff.className = 'podium-diff';
      diff.textContent = fill(T.rankDiff, { d: fmt(r.diff) });
      col.append(name, time, diff);
      var block = document.createElement('div');
      block.className = 'block';
      block.style.height = step.height + 'px';
      block.style.background = step.face;
      block.style.borderColor = step.edge;
      block.textContent = String(rank + 1);
      col.append(block);
      el.podium.appendChild(col);
    });
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  // play 不放步驟頭：手機在大家手上傳（apps/warmup/CLAUDE.md）
  function renderLead() {
    if (screen === 'play') return;
    // 一起按的結束畫面沒有「最準的是他」，換一句
    var lead = screen === 'end' && prep.mode === 'each' ? T.leadEachEnd : T.lead[screen];
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: lead[0],
      say: lead[1],
    });
  }

  // ---------- 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法：粗描邊、有表情） ----------

  // 一個有表情的碼錶：圓形錶面＋上面的按鈕
  function watch(cx, cy, r, color, face, s) {
    return W.body('<rect x="' + (cx - 6) + '" y="' + (cy - r - 12) + '" width="12" height="10" rx="3"/>', '#22222c', '', false) +
      W.body('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>', color) +
      W.makeFace(face, cx, cy + 4, s);
  }
  function label(x, y, text, color) {
    return '<g><rect x="' + (x - 26) + '" y="' + (y - 13) + '" width="52" height="26" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="900" fill="' + (color || '#22222c') + '" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  }
  var RULE_ART = [
    // 1. 看目標秒數：碼錶在笑，頭上掛著 7.35
    function () {
      return W.ground + W.burst(140, 30, '#FFC628') + W.ring(20, 40, '#7489E6') + W.dot(150, 100, '#4FB59A', 4) +
        watch(80, 82, 30, '#aebcf3', 'smile', 1.5) + label(80, 22, '7.35');
    },
    // 2. 點開始、再點停：一根手指按著碼錶的按鈕，數字變成問號
    function () {
      return W.ground + W.plus(146, 28, '#F3A4FB') + W.dot(18, 96, '#FFC628', 4) +
        watch(70, 84, 30, '#FFC628', 'wow', 1.5) + label(70, 24, '?.??', '#E0483B') +
        W.body('<path d="M118 40h12v34h-12z"/>', '#f6d8a8') + '<path d="M112 44h-14" fill="none" ' + W.K + '/>';
    },
    // 3. 看誰最準：兩個碼錶，左邊開心、右邊哭
    function () {
      return W.ground + W.burst(28, 26, '#FFC628') + W.ring(146, 30, '#EE7B6A') +
        watch(48, 88, 24, '#4FB59A', 'happy', 1.2) + watch(114, 88, 24, '#fbb3a8', 'worry', 1.2) +
        label(48, 40, '-0.02', '#2E9C78');
    },
  ];

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    renderLead();
    syncMusic();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  // ---------- 返回鍵：一律回第一頁；已經有人按過就先確認（照 02／03 的 history 處理） ----------

  function pushGameState() {
    history.pushState({ seconds: 'game' }, '');
  }

  function backToSetup() {
    each.free = false;
    views.play.classList.remove('is-free');
    Array.prototype.forEach.call(document.querySelectorAll('input[name="mode"]'), function (input) {
      input.checked = input.value === prep.mode;
    });
    syncMode();
    cancelAnimationFrame(raf);
    drawToken += 1;
    phase = 'draw';
    stopMusic(0.25);
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
    // 一起按：玩到一半（主持人第 2 輪以後、或正在計時）才確認；掃進來的人直接回開場
    var busy = prep.mode === 'each' ? each.host && (each.round > 1 || phase === 'running') : results.length > 0 || phase === 'running';
    if (screen === 'play' && busy) {
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

  (function initSettings() {
    var saved = readJson(SETTINGS_KEY, null);
    if (saved && typeof saved === 'object' && typeof saved.sound === 'boolean') settings.sound = saved.sound;
    syncSoundButton();
  })();

  // 怎麼玩：輪流按／一起按。一起按不用設人數
  function syncMode() {
    el.playersField.hidden = prep.mode !== 'one';
    el.modeHint.textContent = prep.mode === 'each' ? T.modeEachHint : T.modeOneHint;
    // 選一起按就出 QR code（照倒放猜猜看）；種子一場只產生一次，換「看得到幾秒」只換代碼最後一位
    el.qrWrap.hidden = prep.mode !== 'each';
    if (prep.mode === 'each') {
      if (!each.seed || !each.host) {
        // 沒有種子、或這支手機是掃別人的 QR code 進來的：自己當主持人要換一個新的
        each.seed = newSeed();
        each.host = true;
      }
      renderQr();
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('input[name="mode"]'), function (input) {
    input.checked = input.value === prep.mode;
    input.addEventListener('change', function () {
      if (input.checked) prep.mode = input.value;
      syncMode();
    });
  });
  syncMode();

  // 遊戲人數：全站的 .stepper（照倒數猜猜看、比手畫腳）
  function syncPlayers() {
    el.playersValue.textContent = String(prep.players);
    el.playersLess.disabled = prep.players <= PLAYERS_MIN;
    el.playersMore.disabled = prep.players >= PLAYERS_MAX;
  }
  el.playersLess.addEventListener('click', function () {
    prep.players = Math.max(PLAYERS_MIN, prep.players - 1);
    syncPlayers();
  });
  el.playersMore.addEventListener('click', function () {
    prep.players = Math.min(PLAYERS_MAX, prep.players + 1);
    syncPlayers();
  });
  syncPlayers();

  Array.prototype.forEach.call(document.querySelectorAll('input[name="peek"]'), function (input) {
    input.checked = Number(input.value) === prep.peek;
    input.addEventListener('change', function () {
      if (input.checked) prep.peek = Number(input.value);
      if (prep.mode === 'each') renderQr(); // 代碼最後一位是看得到幾秒
    });
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', function () {
    if (prep.mode === 'each') {
      // 一起按再玩一次：回開場換新的 QR code（種子清掉，syncMode 會重新產生），大家重新掃
      each.seed = '';
      backToSetup();
      history.back();
      return;
    }
    startPlay();
  });

  // 結束遊戲（一起按的主持人）：紅色、要按住 HOLD_MS 才算（照偷渡畫家），鍵盤按 Enter 直接結束
  var HOLD_MS = 800;
  var holdId = 0;
  function cancelHold() {
    clearTimeout(holdId);
    holdId = 0;
    el.endEach.classList.remove('is-holding');
  }
  function endEach() {
    cancelHold();
    showEachEnd();
  }
  el.endEach.addEventListener('click', function (event) {
    if (event.detail === 0) endEach();
  });
  el.endEach.addEventListener('pointerdown', function (event) {
    if (event.button > 0) return;
    cancelHold();
    el.endEach.classList.add('is-holding');
    holdId = setTimeout(endEach, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.endEach.addEventListener(type, cancelHold);
  });
  el.endEach.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  el.next.addEventListener('click', nextPerson);
  // 我是來按的，只要計時器（照倒放猜猜看的「只要錄音機」）：不用代碼，直接計時
  el.joinOnly.addEventListener('click', function () {
    pushGameState();
    enterAsTimer();
  });

  // 點一下開始、再點一下停（老闆 11/12）。一顆按鈕兩個狀態，只接 click（鍵盤本來就會觸發 click）
  el.press.addEventListener('click', function () {
    if (phase === 'ready') startRun();
    else if (phase === 'running') stopRun();
  });

  /*
   * 切到別的 App、鎖屏：計時中的那一次不算（回來重按），配樂也停。
   * 切回來由 game.js 的 Leader.resetAudio 先重建引擎（靜音鍵可能剛扳回來），這裡再接著播。
   */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (phase === 'running') {
        cancelAnimationFrame(raf);
        setPhase('ready');
      }
      stopMusic(0.1);
      return;
    }
    syncMusic();
  });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);

  /*
   * 掃主持人的 QR code 進來（網址 #c=代碼）：直接進到按的畫面，不走帶領步驟（照倒放猜猜看的 #rec）。
   * 先放一個開場的歷史紀錄再進來，返回鍵就會回到開場；網址上的 # 拿掉，重新整理才不會一直帶著
   */
  var joinMatch = /^#c=([A-Z0-9]{4})$/.exec(location.hash);
  showScreen('setup');
  if (joinMatch) {
    history.replaceState(null, '', location.pathname + location.search);
    pushGameState();
    if (!enterAsPlayer(joinMatch[1])) history.back();
  }
})();
