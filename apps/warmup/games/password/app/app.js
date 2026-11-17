/*
 * 終極密碼。一支手機在大家手上傳（跟定時炸彈一樣）：
 * 手機藏一個密碼 → 拿到手機的人輸入一個範圍裡的數字 → 太大／太小，範圍縮小 → 傳給下一個人 ⋯⋯ → 猜中密碼的人爆炸
 *
 * 一步一步帶（步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場（選範圍）→ rules 說明規則 → play 猜（手機在大家手上，不放步驟頭）→ boom 爆炸（拉霸）→ 再玩一次回 play
 * 返回鍵一律回第一頁；猜到一半先確認。
 *
 * 範圍是「包含兩端」的：1～100 猜 40 太小，就變成 41～100。縮到只剩一個數字時，下一個人只能猜它（一定爆）。
 */
(function () {
  'use strict';

  var T = window.PASSWORD.T;
  var BASE = window.PASSWORD.base;
  var LANG = window.PASSWORD.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SETTINGS_KEY = 'woohop-password-settings';
  var settings = { sound: true }; // 只記聲音開關；範圍每次都是預設 1～100（不記上次玩過的，全站規則）

  var screen = 'setup';
  var rangeMax = 100;
  var lo = 1;
  var hi = 100;
  var secret = 0;
  var input = '';
  var guesses = 0;
  var gameNumber = 0;
  var startedAt = 0;
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), boom: $('view-boom') };
  var el = {
    rangeInputs: document.querySelectorAll('input[name="range"]'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    rangeLo: $('range-lo'),
    rangeHi: $('range-hi'),
    rangeMsg: $('range-msg'),
    rangeCount: $('range-count'),
    guessValue: $('guess-value'),
    keypad: $('keypad'),
    go: $('guess-go'),
    boomTitle: $('boom-title'),
    boomStats: $('boom-stats'),
    slotRoot: $('slot-root'),
    again: $('again'),
    leaveModal: $('leave-modal'),
    leaveCancel: $('leave-cancel'),
    leaveConfirm: $('leave-confirm'),
    sound: $('game-music'),
  };

  function fill(s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  }
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // ---------- 設定（只有聲音開關） ----------

  try {
    var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  } catch (e) {
    /* 無痕模式：照樣能玩，只是記不住 */
  }
  function syncSoundButton() {
    if (el.sound) el.sound.setAttribute('aria-pressed', String(settings.sound));
  }
  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫這個）：管按鍵、提示音、爆炸、拉霸
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sound: settings.sound }));
    } catch (e) {
      /* 同上 */
    }
    syncSoundButton();
    if (settings.sound) Leader.resetAudio(); // 先重建引擎：靜音狀態下建的那個不會出聲
  };

  // ---------- 聲音：當場合成，不載音檔（跟定時炸彈一樣） ----------

  var audio = { ctx: null };
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
  // iPhone 靜音鍵：在靜音狀態下建的引擎一輩子不出聲，切回頁面／打開聲音時重建。都是一聲一聲的短音，隨時丟都安全
  Leader.onAudioReset(function () { Leader.closeAudio(audio.ctx); audio.ctx = null; });

  function tone(freq, at, seconds, peak, type) {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime + 0.01 + (at || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds + 0.05);
  }
  var sfx = {
    key: function () { tone(1300, 0, 0.04, 0.06, 'square'); },
    // 太大：往下掉兩個音；太小：往上爬兩個音（聽得出是哪一邊縮了）
    big: function () { tone(784, 0, 0.12, 0.16); tone(523, 0.11, 0.18, 0.16); },
    small: function () { tone(523, 0, 0.12, 0.16); tone(784, 0.11, 0.18, 0.16); },
    err: function () { tone(180, 0, 0.18, 0.18, 'square'); },
    // 只剩一個數字：高音三連，像倒數
    last: function () { tone(988, 0.3, 0.08, 0.12, 'square'); tone(988, 0.42, 0.08, 0.12, 'square'); tone(988, 0.54, 0.08, 0.12, 'square'); },
  };
  // 爆炸：照抄定時炸彈的 playBoom（白噪音×指數衰減，低通往下掃）
  function playBoom() {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var now = ctx.currentTime;
    var seconds = 0.9;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + seconds);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, now);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  // ---------- 帶領的步驟頭（Leader.lead）：play 手機在大家手上傳，不放 ----------

  var STEPS = ['setup', 'rules', 'play', 'boom'];
  function renderLead() {
    var line = T.lead[screen];
    if (!line) return;
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: line[0],
      say: fill(line[1], { lo: 1, hi: rangeMax }),
    });
  }

  /*
   * 「說明規則」三張插圖卡（woohop-art.js 的畫法）：一把有表情的鎖、兩個數字往中間夾、炸開的星星
   */
  var tile = function (x, y, text, color) {
    return W.body('<rect x="' + (x - 24) + '" y="' + (y - 18) + '" width="48" height="36" rx="9"/>', color, '', false) +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text>';
  };
  var RULE_ART = [
    function () {
      return W.ground + W.burst(140, 26, '#FFC628') + W.ring(22, 34, '#EE7B6A') + W.dot(146, 100, '#4FB59A', 4) +
        '<path d="M62 64V48a18 18 0 0 1 36 0v16" fill="none" ' + W.K + '/>' +
        W.body('<rect x="48" y="62" width="64" height="54" rx="14"/>', '#7489E6', '<path d="M92 50h30v80H92z" fill="#5c70cf"/>') +
        W.makeFace('wink', 80, 88, 1.4);
    },
    function () {
      return W.ground + W.plus(18, 30, '#F3A4FB') + W.dot(146, 28, '#FFC628', 4) +
        tile(36, 74, '41', '#a8dccb') + tile(124, 74, '100', '#aebcf3') +
        '<path d="M66 74h14m-5-5 5 5-5 5M94 74H80m5-5-5 5 5 5" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    },
    function () {
      return W.ground + W.ring(22, 30, '#7489E6') + W.plus(142, 96, '#4FB59A') +
        '<g transform="translate(36 22) scale(1.4)">' + W.body('<path d="m32 2 6.6 12.2L51 8.6l-3.4 13.2 13.6-.9-9.4 9.9 12.2 6.2-12.2 6.2 9.4 9.9-13.6-.9L51 55.4l-12.4-5.6L32 62l-6.6-12.2L13 55.4l3.4-13.2-13.6.9 9.4-9.9L0 27l12.2-6.2-9.4-9.9 13.6.9L13 8.6l12.4 5.6L32 2Z"/>', '#EE7B6A') + '</g>' +
        W.makeFace('wow', 80, 66, 1.4);
    },
  ];

  // ---------- 猜 ----------

  var maxDigits = function () { return String(rangeMax).length; };

  function renderRange(moved) {
    el.rangeLo.textContent = lo;
    el.rangeHi.textContent = hi;
    [el.rangeLo, el.rangeHi].forEach(function (n) { n.classList.remove('is-moved'); });
    if (moved) {
      void moved.offsetWidth;
      moved.classList.add('is-moved');
    }
    el.rangeCount.textContent = lo === hi ? fill(T.lastOne, { n: lo }) : fill(T.guessCount, { n: guesses + 1 });
  }
  function setMsg(text, warn) {
    el.rangeMsg.textContent = text;
    el.rangeMsg.classList.remove('is-warn');
    if (warn) {
      void el.rangeMsg.offsetWidth;
      el.rangeMsg.classList.add('is-warn');
    }
  }
  function renderInput() {
    el.guessValue.textContent = input;
    el.go.disabled = !input;
  }

  function press(key) {
    if (screen !== 'play') return;
    if (key === 'go') {
      submit();
      return;
    }
    if (key === 'del') input = input.slice(0, -1);
    else if (input.length < maxDigits() && !(input === '' && key === '0')) input += key;
    else return;
    sfx.key();
    renderInput();
  }

  function submit() {
    if (!input) return;
    var n = parseInt(input, 10);
    input = '';
    renderInput();
    if (n < lo || n > hi) {
      setMsg(fill(T.outOfRange, { lo: lo, hi: hi }), true);
      sfx.err();
      if (navigator.vibrate) navigator.vibrate(80);
      return;
    }
    guesses += 1;
    if (n === secret) {
      explode();
      return;
    }
    var moved;
    if (n < secret) {
      lo = n + 1;
      moved = el.rangeLo;
      setMsg(T.tooSmall + ' ' + T.passHint);
      sfx.small();
    } else {
      hi = n - 1;
      moved = el.rangeHi;
      setMsg(T.tooBig + ' ' + T.passHint);
      sfx.big();
    }
    renderRange(moved);
    if (lo === hi) sfx.last();
  }

  // ---------- 爆炸 ----------

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.PASSWORD.slot.prompts,
        actions: window.PASSWORD.slot.actions,
        sound: function () { return settings.sound; },
        onPull: function (info) {
          track('password_slot_pulled', { game_number: gameNumber, kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
  }

  function explode() {
    el.boomTitle.textContent = fill(T.boomTitle, { n: secret });
    el.boomStats.textContent = fill(T.boomStats, { n: guesses });
    showScreen('boom');
    playBoom();
    if (navigator.vibrate) navigator.vibrate([120, 60, 240]);
    track('password_exploded', {
      game_number: gameNumber,
      range: rangeMax,
      guesses: guesses,
      duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    });
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
    if (document.visibilityState === 'visible' && screen === 'play') {
      wakeLock = null;
      requestWakeLock();
    }
  });

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    if (next === 'rules') Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
    renderLead();
    if (next === 'play') requestWakeLock();
    else releaseWakeLock();
    if (next === 'boom') resetSlot();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    lo = 1;
    hi = rangeMax;
    secret = 1 + Math.floor(Math.random() * rangeMax);
    input = '';
    guesses = 0;
    startedAt = Date.now();
    ensureAudio(); // 在點擊裡先建好，之後的音效才不會被自動播放限制擋掉
    renderInput();
    renderRange();
    setMsg(T.firstHint);
    showScreen('play');
    track('password_game_started', { game_number: gameNumber, range: rangeMax });
  }

  // ---------- 返回鍵：一律回第一頁；猜到一半先確認 ----------

  function pushGameState() {
    history.pushState({ password: 'game' }, '');
  }
  function backToSetup() {
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

  // ---------- 綁定 ----------

  Array.prototype.forEach.call(el.rangeInputs, function (r) {
    r.addEventListener('change', function () { if (r.checked) rangeMax = Number(r.value); });
  });
  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.keypad.addEventListener('click', function (e) {
    var key = e.target.closest('.key');
    if (key && !key.disabled) press(key.dataset.key);
  });
  // 電腦鍵盤也能打：數字、Backspace、Enter
  document.addEventListener('keydown', function (e) {
    if (screen !== 'play' || el.leaveModal.open || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('go');
    else return;
    e.preventDefault();
  });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  // 範圍每次都是預設 1～100（瀏覽器記住的勾選一律蓋回來）
  Array.prototype.forEach.call(el.rangeInputs, function (r) { r.checked = r.value === '100'; });
  syncSoundButton();
  showScreen('setup');
})();
