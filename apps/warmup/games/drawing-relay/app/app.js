/*
 * 你畫我猜接力。一支手機在大家手上傳（CONCEPT.md 第二節）：
 * 第 1 個人看題目畫 → 交給下一個人，他只看上一張圖 5 秒，再畫出他以為的東西 → ⋯⋯ → 最後一個人看最後一張圖猜
 * → 答案揭曉，依序攤開每個人的畫（最好笑的地方）。
 *
 * 一步一步帶（跟比手畫腳接力賽同一套，步驟頭、規則卡是全站共用的 window.Leader）：
 *   setup 開場（一隊幾人、每人畫幾秒、題目類型）→ rules 說明規則
 *   → play（draw 抽題目 → word 給第 1 個人看 → paint 畫（倒數，時間到自動收）→ handoff 交給下一個人
 *           → view 看上一張圖 5 秒 → paint ⋯⋯ → guess 最後一個人看最後一張圖猜 → 公布答案 → reveal 答案＋每個人的畫）
 *   → 「下一題」回 draw；「結束遊戲」→ end 比了幾題、畫了幾張
 * 不記猜中沒（老闆 11/03：猜的時候只要一顆「公布答案」），重點是揭曉時大家一起看圖怎麼走樣。
 * 返回鍵一律回第一頁；已經抽過題目就先確認。只記聲音開關，其他設定每次都是預設。
 */
(function () {
  'use strict';

  var T = window.DRAWRELAY.T;
  var BASE = window.DRAWRELAY.base;
  var LANG = window.DRAWRELAY.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SIZE_MIN = 3; // 至少一個人畫、一個人看圖再畫、一個人猜
  var SIZE_MAX = 10;
  var VIEW_SEC = 5; // 看上一張圖幾秒
  var SETTINGS_KEY = 'woohop-drawing-relay-settings';

  var CATS = window.DRAWRELAY.words; // [代號, 類型名稱, [題目...]]（全站共用的 apps/homepage/src/word-bank.mjs，用途 draw）
  var ALL_CATS = CATS.map(function (c) { return c[0]; });

  // 開場的設定：每次打開都是預設（產品決定，不記上次選的），預設就能玩：一隊 5 人、傳話、每人畫 20 秒、隨機題目
  // 玩法 mode（11/04 老闆加的）：relay 傳話（只看上一張圖、各畫一張）／team 合力（輪流看題目，在同一張圖上接著畫）。
  // 秒數兩種玩法分開記：傳話 15／20／30／45（預設 20），合力很短 5／8／10／15。
  // 合力的預設跟著人數走（老闆 11/04）：人少每人多畫一點、人多每人少畫一點，整張圖大約 30～45 秒畫完，
  // 才不會前面幾個人就畫得很完整。主持人自己點過秒數（secTeamPicked）就不再自動改
  var teamSecFor = function (size) {
    var painters = size - 1;
    if (painters <= 3) return 10; // 3～4 人也只給 10 秒，不夠主持人再自己調（老闆 11/04）
    if (painters <= 5) return 8;
    return 5;
  };
  var prep = { size: 5, mode: 'relay', secRelay: 20, secTeam: teamSecFor(5), cats: ALL_CATS.slice() };
  var secTeamPicked = false;
  var isTeam = function () { return prep.mode === 'team'; };
  var sec = function () { return isTeam() ? prep.secTeam : prep.secRelay; };
  var randomCats = true;
  // 只記聲音開關（跟比手畫腳接力賽一樣）
  var settings = { sound: true };

  var screen = 'setup';
  var phase = 'draw';
  var roundNumber = 0; // 這一場比到第幾題
  var gameNumber = 0;
  var startedAt = 0;
  var judged = 0; // 揭曉過幾題
  var drawn = 0; // 這一場大家總共畫了幾張
  var playedWords = []; // 這一場的題目：[{ word, last: 最後一張圖 }]，結束畫面列出來
  var finished = false;
  var deck = [];
  var card = null;
  var painter = 1; // 現在輪到第幾個人（1 號看題目畫；最後一號猜）
  var drawings = []; // 這一題每個人畫的圖（dataURL），第 i 張是第 i+1 個人畫的
  var skips = 0;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    sizeLess: $('size-less'),
    sizeMore: $('size-more'),
    sizeValue: $('size-value'),
    roundsHint: $('rounds-hint'),
    categoryGrid: $('category-grid'),
    categoryToggle: $('category-toggle'),
    categoryPanel: $('category-panel'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    roundNo: $('round-no'),
    card: $('card'),
    deck: $('deck'),
    draw: $('card-draw'),
    drawn: $('drawn'),
    cardKind: $('card-kind'),
    cardText: $('card-text'),
    wordHint: $('word-hint'),
    paintStart: $('paint-start'),
    skip: $('skip'),
    modes: document.querySelectorAll('.mode-choice'),
    secRelay: document.querySelector('.sec-relay'),
    secTeam: document.querySelector('.sec-team'),
    painterNo: $('painter-no'),
    timer: $('timer'),
    timerArc: $('timer-arc'),
    timerNum: $('timer-num'),
    canvas: $('canvas'),
    colors: $('paint-colors'),
    undo: $('undo'),
    clear: $('clear'),
    paintDone: $('paint-done'),
    handoffTitle: $('handoff-title'),
    handoffGo: $('handoff-go'),
    viewImg: $('view-img'),
    viewNum: $('view-num'),
    guessImg: $('guess-img'),
    hintKind: $('hint-kind'),
    hintMask: $('hint-mask'),
    hintNext: $('hint-next'),
    revealAnswer: $('reveal-answer'),
    resultAnswer: $('result-answer'),
    gallery: $('gallery'),
    nextRound: $('next-round'),
    endGame: $('end-game'),
    history: $('history'),
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

  // ---------- 開場：一隊幾人、每人畫幾秒 ----------

  var lastPainter = function () { return prep.size - 1; }; // 畫的人數；最後一個人只猜

  function syncSetup() {
    el.sizeValue.textContent = prep.size;
    el.sizeLess.disabled = prep.size <= SIZE_MIN;
    el.sizeMore.disabled = prep.size >= SIZE_MAX;
    document.querySelectorAll('input[name="sec"]').forEach(function (input) {
      input.checked = input.value === String(prep.secRelay);
    });
    document.querySelectorAll('input[name="sec-team"]').forEach(function (input) {
      input.checked = input.value === String(prep.secTeam);
    });
    Array.prototype.forEach.call(el.modes, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === prep.mode));
    });
    el.secRelay.hidden = isTeam();
    el.secTeam.hidden = !isTeam();
    el.roundsHint.textContent = fill(isTeam() ? T.roundsHintTeam : T.roundsHint, { painters: lastPainter(), sec: sec() });
  }
  function setSize(n) {
    prep.size = Math.max(SIZE_MIN, Math.min(SIZE_MAX, n));
    if (!secTeamPicked) prep.secTeam = teamSecFor(prep.size);
    syncSetup();
  }

  // 題目類型：照比手畫腳（第一張「隨機」，點某一類改成自己挑、可複選，最後一類取消掉回到隨機）
  function categoryCard(id, title, subText, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice category-choice' + (cls ? ' ' + cls : '');
    b.dataset.id = id;
    var name = document.createElement('span');
    name.className = 'choice-name';
    name.textContent = title;
    var sub = document.createElement('span');
    sub.className = 'choice-sub';
    sub.textContent = subText;
    b.appendChild(name);
    b.appendChild(sub);
    el.categoryGrid.appendChild(b);
    return b;
  }
  function renderCategories() {
    categoryCard('random', T.categoryRandom, T.categoryRandomSub, 'c-yellow').addEventListener('click', function () {
      randomCats = true;
      prep.cats = ALL_CATS.slice();
      syncCategories();
    });
    CATS.forEach(function (c) {
      categoryCard(c[0], c[1], c[2].slice(0, 2).join(T.listSep)).addEventListener('click', function () {
        if (randomCats) {
          randomCats = false;
          prep.cats = [c[0]];
        } else {
          var i = prep.cats.indexOf(c[0]);
          if (i >= 0) prep.cats.splice(i, 1);
          else prep.cats.push(c[0]);
          if (!prep.cats.length) {
            randomCats = true;
            prep.cats = ALL_CATS.slice();
          }
        }
        syncCategories();
      });
    });
    el.categoryToggle.addEventListener('click', function () {
      var open = el.categoryPanel.hidden;
      el.categoryPanel.hidden = !open;
      el.categoryToggle.setAttribute('aria-expanded', String(open));
    });
    el.categoryToggle.textContent = T.categoryLabel;
    syncCategories();
  }
  function syncCategories() {
    Array.prototype.forEach.call(el.categoryGrid.children, function (b) {
      var on = b.dataset.id === 'random' ? randomCats : !randomCats && prep.cats.indexOf(b.dataset.id) >= 0;
      b.setAttribute('aria-pressed', String(on));
    });
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];
  // 上場那一步：主持人對大家說話的兩段才放（draw 排好、reveal 攤開大家的畫），其他畫面手機在畫的人手上
  var PLAY_LEAD = { draw: true, reveal: true };

  function renderLead() {
    var key = screen === 'play' ? phase : screen;
    if (screen === 'play' && !PLAY_LEAD[phase]) return;
    var line = T.lead[key];
    if (!line) return;
    var v = { result: resultLine() };
    // 合力的說明規則換一段念法
    var say = screen === 'rules' && isTeam() ? T.rulesTeamSay : line[1];
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: fill(line[0], v),
      say: fill(say, v),
    });
    // 照著念是空的就收起來；排好了嗎只在第 1 題念（跟比手畫腳接力賽一樣）
    Leader.hideSay(!line[1] || (screen === 'play' && phase === 'draw' && roundNumber > 1));
  }

  function resultLine() {
    if (!finished) return '';
    return fill(T.resultLine, { n: judged, d: drawn });
  }

  // ---------- 題目 ----------

  // 一疊卡的插圖（跟比手畫腳同一張），最上面換成這個遊戲的黃色、畫一枝筆
  function deckArt() {
    var c = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#FF9419') + W.ring(22, 34, '#7489E6') + W.plus(142, 92, '#4FB59A') + W.dot(20, 92, '#F3A4FB') +
      c(36, 34, '#4FB59A', -14) + c(70, 34, '#F3A4FB', 12) +
      '<g class="deck-top">' + c(53, 28, '#FFC628', 0) +
      '<path d="M72 54q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drawing = false;

  // 選了的類型洗成一副；同一個詞出現在兩類只留一個；整副抽完才重洗
  function shuffleDeck() {
    var seen = {};
    deck = [];
    CATS.forEach(function (c) {
      if (prep.cats.indexOf(c[0]) < 0) return;
      c[2].forEach(function (word) {
        if (seen[word]) return;
        seen[word] = true;
        deck.push([c[1], word]);
      });
    });
    for (var i = deck.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
  }

  function nextCard() {
    if (!deck.length) shuffleDeck();
    card = deck.pop();
    el.cardKind.textContent = card[0];
    el.cardText.textContent = card[1];
  }

  function flip() {
    el.drawn.classList.remove('pop');
    void el.drawn.offsetWidth;
    el.drawn.classList.add('pop');
  }

  // ---------- 畫布：手指畫線，五種筆的顏色，可以復原一筆、清掉重畫 ----------
  // 一筆 = { c: 顏色, p: [[x, y]⋯] }，座標存 0～1，畫布大小變了（轉螢幕）也能重畫；交出去時壓成白底 PNG 存進 drawings。
  // 合力時大家接著同一張畫：turnStart 之前的筆是前面的人畫的，復原、清掉都碰不到（傳話時 turnStart 一律是 0）

  var ctx = el.canvas.getContext('2d');
  var strokes = [];
  var turnStart = 0;
  var current = null;
  var locked = true;
  // 筆的顏色（老闆 11/03 要求：黑、藍、紅、黃、綠），名稱在 locale 的 colorNames，順序要一樣；黃色在白底上要夠深才看得到
  var INKS = ['#22222c', '#3D54B6', '#E0483B', '#F2B200', '#2E9C78'];
  var ink = INKS[0];

  function renderColors() {
    INKS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'paint-color';
      b.style.setProperty('--ink', c);
      b.setAttribute('aria-label', T.colorNames[i]);
      b.title = T.colorNames[i];
      b.addEventListener('click', function () {
        ink = c;
        syncColors();
      });
      el.colors.appendChild(b);
    });
  }
  function syncColors() {
    Array.prototype.forEach.call(el.colors.children, function (b, i) {
      b.setAttribute('aria-pressed', String(INKS[i] === ink));
    });
  }

  function fitCanvas() {
    var r = el.canvas.getBoundingClientRect();
    if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.canvas.width = Math.round(r.width * dpr);
    el.canvas.height = Math.round(r.height * dpr);
    redraw();
  }
  function redraw() {
    var w = el.canvas.width;
    var h = el.canvas.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, w * 0.012);
    strokes.forEach(function (s) {
      ctx.strokeStyle = s.c;
      ctx.beginPath();
      s.p.forEach(function (p, i) {
        if (i) ctx.lineTo(p[0] * w, p[1] * h);
        else ctx.moveTo(p[0] * w, p[1] * h);
      });
      if (s.p.length === 1) ctx.lineTo(s.p[0][0] * w + 0.1, s.p[0][1] * h); // 只點一下也畫出一個點
      ctx.stroke();
    });
    syncTools();
  }
  function point(e) {
    var r = el.canvas.getBoundingClientRect();
    return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
  }
  function syncTools() {
    var mine = strokes.length > turnStart;
    el.undo.disabled = locked || !mine;
    el.clear.disabled = locked || !mine;
  }
  el.canvas.addEventListener('pointerdown', function (e) {
    if (locked) return;
    e.preventDefault();
    el.canvas.setPointerCapture(e.pointerId);
    current = { c: ink, p: [point(e)] };
    strokes.push(current);
    redraw();
  });
  el.canvas.addEventListener('pointermove', function (e) {
    if (!current) return;
    current.p.push(point(e));
    redraw();
  });
  ['pointerup', 'pointercancel'].forEach(function (type) {
    el.canvas.addEventListener(type, function () { current = null; });
  });
  window.addEventListener('resize', function () {
    if (phase === 'paint') fitCanvas();
  });

  // ---------- 倒數：畫的時候每秒輕滴、最後三秒嗶，到 0 自動收畫、交給下一個人 ----------

  var timerId = 0;
  var endsAt = 0;
  var lastBeep = -1;
  var RING = 314.16;

  function stopTimer() {
    clearInterval(timerId);
    timerId = 0;
  }
  function startTimer() {
    stopTimer();
    el.timer.classList.remove('is-urgent');
    endsAt = Date.now() + sec() * 1000;
    lastBeep = -1;
    tickTimer();
    timerId = setInterval(tickTimer, 100);
  }
  function tickTimer() {
    var left = Math.max(0, endsAt - Date.now());
    var s = Math.ceil(left / 1000);
    el.timerNum.textContent = s;
    el.timerArc.style.strokeDashoffset = String(RING * (1 - left / (sec() * 1000)));
    el.timer.classList.toggle('is-urgent', s <= 3 && left > 0);
    if (s > 0 && s !== lastBeep) {
      if (lastBeep !== -1) {
        if (s <= 3) beep(880, 0.08, 0.14);
        else if (s <= 10) beep(1200, 0.03, 0.05);
      }
      lastBeep = s;
    }
    if (left <= 0) {
      stopTimer();
      if (navigator.vibrate) navigator.vibrate(200);
      finishPainting(true);
    }
  }

  // 看上一張圖：VIEW_SEC 秒後自動換成空白畫布
  var viewId = 0;
  function startView() {
    clearInterval(viewId);
    var until = Date.now() + VIEW_SEC * 1000;
    var tick = function () {
      var left = Math.max(0, until - Date.now());
      el.viewNum.textContent = Math.ceil(left / 1000);
      if (left <= 0) {
        clearInterval(viewId);
        viewId = 0;
        startPainting();
      }
    };
    tick();
    viewId = setInterval(tick, 100);
  }
  function stopView() {
    clearInterval(viewId);
    viewId = 0;
  }

  // ---------- 聲音：抽題、開始畫、倒數滴答、時間到換人、猜對猜錯、結束。頂欄音符鍵開關，只記這一個 ----------

  var audio = null;
  function ensureAudio() {
    try {
      if (!audio) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        audio = new C();
      }
      if (audio.state === 'suspended') audio.resume();
      return audio;
    } catch (e) {
      return null;
    }
  }
  // iPhone 靜音鍵：在靜音狀態下建的引擎一輩子不出聲，切回頁面／打開聲音時重建（game.js 的 Leader.resetAudio）
  Leader.onAudioReset(function () { Leader.closeAudio(audio); audio = null; });
  function beep(freq, seconds, peak, delay, type) {
    if (!settings.sound) return;
    var c = ensureAudio();
    if (!c) return;
    var t0 = c.currentTime + 0.01 + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }
  // 幾個音接著響（[頻率, 長度, 隔多久]），三角波比方波柔，當提示音
  function tune(notes, peak) {
    var at = 0;
    notes.forEach(function (n) {
      beep(n[0], n[1], peak || 0.18, at, 'triangle');
      at += n[2];
    });
  }
  var sfx = {
    draw: function () { tune([[660, 0.08, 0.07], [990, 0.12, 0]]); },
    go: function () { tune([[523, 0.07, 0.06], [784, 0.1, 0]]); },
    // 時間到、收畫：低一點、長一點
    swap: function () { beep(440, 0.4, 0.22); },
    guess: function () { tune([[392, 0.1, 0.1], [523, 0.1, 0.1], [659, 0.18, 0]]); },
    reveal: function () { tune([[523, 0.1, 0.09], [659, 0.1, 0.09], [784, 0.1, 0.09], [1047, 0.3, 0]], 0.22); },
    end: function () { tune([[523, 0.12, 0.12], [659, 0.12, 0.12], [784, 0.12, 0.12], [1047, 0.12, 0.16], [784, 0.12, 0.12], [1047, 0.5, 0]], 0.22); },
  };

  var soundButton = document.getElementById('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    writeJson(SETTINGS_KEY, { sound: settings.sound });
    syncSoundButton();
    if (settings.sound) {
      Leader.resetAudio(); // 先重建引擎：靜音狀態下建的那個不會出聲
      sfx.go(); // 打開時響一下，順便在點擊裡把新的 AudioContext 叫醒
    }
  };

  // ---------- 猜的時候：一個字一個方塊，猜 HINT_KIND_AT 秒還沒中自動亮類型（照比手畫腳接力賽，不露字） ----------

  var HINT_KIND_AT = 10;
  var guessId = 0;
  var guessSince = 0;
  var kindShown = false;

  // 用 Array.from 切字，中日韓字、表情符號都算一個；空白和標點直接顯示，不算要猜的字
  var isLetter = function (ch) { return /[\p{L}\p{N}]/u.test(ch); };
  function renderMask() {
    el.hintMask.textContent = '';
    var word = null;
    Array.from(card[1]).forEach(function (ch) {
      if (/\s/.test(ch)) {
        word = null;
        var gap = document.createElement('span');
        gap.className = 'mask-space';
        el.hintMask.appendChild(gap);
        return;
      }
      if (!word) {
        word = document.createElement('span');
        word.className = 'mask-word';
        el.hintMask.appendChild(word);
      }
      var span = document.createElement('span');
      if (isLetter(ch)) {
        span.className = 'mask-box';
        span.setAttribute('aria-hidden', 'true');
      } else {
        span.textContent = ch;
      }
      word.appendChild(span);
    });
  }
  function stopGuessTimer() {
    clearInterval(guessId);
    guessId = 0;
  }
  function startGuessTimer() {
    stopGuessTimer();
    kindShown = false;
    el.hintKind.hidden = true;
    el.hintKind.textContent = card[0];
    renderMask();
    guessSince = Date.now();
    tickGuess();
    guessId = setInterval(tickGuess, 200);
  }
  function tickGuess() {
    var s = (Date.now() - guessSince) / 1000;
    if (!kindShown && s >= HINT_KIND_AT) {
      kindShown = true;
      el.hintKind.hidden = false;
      sfx.go();
      track('drawing_relay_hint_shown', { round_number: roundNumber, category: card[0] });
    }
    el.hintNext.textContent = kindShown ? '' : fill(T.hintKindIn, { s: Math.ceil(HINT_KIND_AT - s) });
    if (kindShown) stopGuessTimer();
  }

  // ---------- 上場的七段 ----------

  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    // 畫的時候整頁不給選取：手機上畫到一半長按很容易反白（老闆 11/04）
    document.body.classList.toggle('no-select', next === 'paint');
    el.card.setAttribute('data-stage', next);
    if (next !== 'paint') stopTimer();
    if (next !== 'view') stopView();
    if (next !== 'guess') stopGuessTimer();
    renderLead();
    window.scrollTo(0, 0);
  }

  function renderRound() {
    el.roundNo.textContent = fill(T.roundNo, { n: Math.max(1, roundNumber) });
  }

  function startRound() {
    roundNumber += 1;
    skips = 0;
    drawings = [];
    strokes = [];
    turnStart = 0;
    painter = 1;
    renderRound();
    setPhase('draw');
  }

  function drawFromDeck() {
    if (drawing) return;
    drawing = true;
    nextCard();
    el.deck.classList.add('is-drawing');
    sfx.draw();
    setTimeout(function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      el.wordHint.textContent = isTeam() ? T.wordHintTeam : T.wordHint;
      el.skip.hidden = false;
      setPhase('word');
      flip();
    }, reduceMotion ? 0 : 380);
  }

  // 第 painter 個人開始畫、倒數。傳話：空白畫布、從黑色開始；
  // 合力：接著前面的人畫，每個人預設一種筆色（輪流），一步一步看時分得出誰畫的
  function startPainting() {
    if (!isTeam()) strokes = [];
    turnStart = strokes.length;
    current = null;
    locked = false;
    ink = isTeam() ? INKS[(painter - 1) % INKS.length] : INKS[0];
    syncColors();
    el.clear.textContent = isTeam() ? T.clearMine : T.clearButton;
    el.painterNo.textContent = fill(T.painterNo, { k: painter, total: lastPainter() });
    sfx.go();
    setPhase('paint');
    fitCanvas();
    startTimer();
  }

  // 畫好了（時間到或自己按）：收畫、交給下一個人
  function finishPainting(auto) {
    if (phase !== 'paint') return;
    locked = true;
    current = null;
    redraw();
    drawings.push(el.canvas.toDataURL('image/png'));
    if (auto) sfx.swap();
    painter += 1;
    el.handoffTitle.textContent = painter > lastPainter() ? T.handoffLast : fill(T.handoffTo, { k: painter });
    el.handoffGo.textContent = painter > lastPainter() ? T.handoffGoLast : fill(T.handoffGo, { k: painter });
    setPhase('handoff');
  }

  // 下一個人拿到手機：看上一張圖（最後一個人直接看最後一張圖猜）；合力時先看題目，再接著同一張圖畫
  function takeOver() {
    var last = drawings[drawings.length - 1];
    if (painter > lastPainter()) {
      el.guessImg.src = last;
      sfx.guess();
      setPhase('guess');
      startGuessTimer();
      return;
    }
    if (isTeam()) {
      // 輪流看題目（11/04 老闆：不要大家一起先看），第 2 個人以後不能換題
      el.wordHint.textContent = fill(T.wordHintNext, { k: painter - 1 });
      el.skip.hidden = true;
      setPhase('word');
      flip();
      return;
    }
    el.viewImg.src = last;
    setPhase('view');
    startView();
  }

  // 公布答案：揭曉答案、攤開每個人的畫（不記猜中沒）
  function revealAnswer() {
    if (phase !== 'guess') return;
    judged += 1;
    drawn += drawings.length;
    playedWords.push({ word: card[1], last: drawings[drawings.length - 1] });
    sfx.reveal();
    track('drawing_relay_revealed', { round_number: roundNumber, painters: drawings.length, category: card[0], skips: skips, hint_kind: kindShown, mode: prep.mode });
    el.resultAnswer.textContent = card[1];
    renderGallery();
    renderRound();
    setPhase('reveal');
  }

  function renderGallery() {
    el.gallery.textContent = '';
    drawings.forEach(function (src, i) {
      var li = document.createElement('li');
      li.className = 'gallery-item';
      var label = document.createElement('span');
      label.className = 'gallery-label';
      label.textContent = fill(isTeam() ? T.galleryLabelTeam : T.galleryLabel, { k: i + 1 });
      var img = document.createElement('img');
      img.className = 'paint-img';
      img.src = src;
      img.alt = label.textContent;
      li.appendChild(label);
      li.appendChild(img);
      el.gallery.appendChild(li);
    });
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 看題目畫（一張紙＋筆）、只看上一張圖（眼睛＋箭頭）、最後一個人猜（問號泡泡）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var head = function (x, y, r, color, face) {
    return W.body('<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>', color) + (face ? W.makeFace(face, x, y, r / 24) : '');
  };
  var paper = function (x, y, w, h) {
    return W.body('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>', '#ffffff', '', false);
  };
  var RULE_ART = [
    function () {
      return W.ground + W.burst(140, 22, '#FFC628') + W.dot(18, 30, '#4FB59A', 4) +
        paper(54, 34, 60, 70) +
        '<path d="M66 82q8-22 18-6t20-10" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>' +
        '<g transform="rotate(35 120 50)">' + W.body('<rect x="114" y="22" width="12" height="52" rx="4"/>', '#FF9419', '', false) + '</g>' +
        head(30, 86, 16, '#F3A4FB', 'grin');
    },
    function () {
      return W.ground + W.ring(144, 28, '#7489E6') + W.plus(18, 36, '#EE7B6A') +
        paper(28, 40, 48, 56) + '<path d="M38 80q8-18 16-4t14-8" fill="none" stroke="#22222c" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M84 68h14m-5-5l5 5l-5 5" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        paper(104, 40, 48, 56) + '<path d="M114 84q10-26 20-2" fill="none" stroke="#22222c" stroke-width="3" stroke-linecap="round"/>';
    },
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 34, '#EE7B6A') +
        head(72, 80, 32, '#a8dccb', 'wow') + bubble(122, 40, '?');
    },
  ];

  // 合力的三張卡：輪流看題目（一張紙＋眼睛）、接著同一張圖畫（兩種顏色的線）、最後一個人猜（同一張問號泡泡）
  var RULE_ART_TEAM = [
    function () {
      return W.ground + W.burst(140, 22, '#FFC628') + W.dot(18, 30, '#4FB59A', 4) +
        paper(54, 34, 60, 70) +
        '<path d="M64 60h40M64 74h28" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>' +
        head(30, 86, 16, '#F3A4FB', 'wow');
    },
    function () {
      return W.ground + W.ring(144, 28, '#7489E6') + W.plus(18, 36, '#EE7B6A') +
        paper(30, 34, 96, 70) +
        '<path d="M42 90q14-30 28-10" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M76 88q8-24 22-16t16-10" fill="none" stroke="#3D54B6" stroke-width="3.5" stroke-linecap="round"/>' +
        '<g transform="rotate(35 128 46)">' + W.body('<rect x="122" y="18" width="12" height="52" rx="4"/>', '#FF9419', '', false) + '</g>';
    },
    RULE_ART[2],
  ];

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;
    if (next !== 'play') {
      document.body.classList.remove('no-select');
      stopTimer();
      stopView();
    }
    renderLead();
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    roundNumber = 0;
    judged = 0;
    drawn = 0;
    playedWords = [];
    finished = false;
    startedAt = Date.now();
    ensureAudio(); // 在點擊裡先建好，之後的音效才不會被自動播放限制擋掉
    shuffleDeck();
    showScreen('play');
    startRound();
    track('drawing_relay_game_started', {
      game_number: gameNumber,
      size: prep.size,
      mode: prep.mode,
      seconds: sec(),
      categories: randomCats ? 'random' : prep.cats.join(','),
    });
  }

  // 結束畫面：這次的題目，上面最後一張圖（傳到最後變成什麼）、下面題目
  function renderHistory() {
    el.history.textContent = '';
    playedWords.forEach(function (h) {
      var li = document.createElement('li');
      li.className = 'history-item';
      var word = document.createElement('span');
      word.className = 'history-word';
      word.textContent = h.word;
      var img = document.createElement('img');
      img.className = 'paint-img';
      img.src = h.last;
      img.alt = fill(T.historyLast, { word: h.word });
      li.appendChild(img);
      li.appendChild(word);
      el.history.appendChild(li);
    });
  }

  // 結束遊戲要按住 HOLD_MS（跟比手畫腳、果園同一個做法，防手滑）
  var HOLD_MS = 800;
  var holdId = 0;
  function cancelHold() {
    clearTimeout(holdId);
    holdId = 0;
    el.endGame.classList.remove('is-holding');
  }

  function endGame() {
    cancelHold();
    stopTimer();
    stopView();
    finished = true;
    track('drawing_relay_game_ended', {
      rounds: judged,
      drawings: drawn,
      size: prep.size,
      mode: prep.mode,
      seconds: sec(),
      duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    });
    renderHistory();
    sfx.end();
    showScreen('end');
  }

  // ---------- 返回鍵：一律回第一頁；已經抽過題目先確認（照比手畫腳接力賽） ----------

  function pushGameState() {
    history.pushState({ drawrelay: 'game' }, '');
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
    if (screen === 'play' && (roundNumber > 1 || phase !== 'draw')) {
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

  el.sizeLess.addEventListener('click', function () { setSize(prep.size - 1); });
  el.sizeMore.addEventListener('click', function () { setSize(prep.size + 1); });
  document.querySelectorAll('input[name="sec"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prep.secRelay = Number(input.value);
      syncSetup();
    });
  });
  document.querySelectorAll('input[name="sec-team"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prep.secTeam = Number(input.value);
      secTeamPicked = true;
      syncSetup();
    });
  });
  Array.prototype.forEach.call(el.modes, function (b) {
    b.addEventListener('click', function () {
      prep.mode = b.dataset.mode;
      syncSetup();
    });
  });

  el.start.addEventListener('click', function () {
    // 說明規則的三張卡依玩法換
    Leader.ruleCards(el.ruleCards, isTeam() ? T.ruleCardsTeam : T.ruleCards, isTeam() ? RULE_ART_TEAM : RULE_ART);
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.draw.addEventListener('click', drawFromDeck);
  // 換一題：只有開始畫之前可以，不算一題
  el.skip.addEventListener('click', function () {
    skips += 1;
    sfx.draw();
    track('drawing_relay_skipped', { round_number: roundNumber, category: card[0] });
    nextCard();
    flip();
  });
  el.paintStart.addEventListener('click', startPainting);
  el.undo.addEventListener('click', function () {
    if (strokes.length > turnStart) strokes.pop();
    redraw();
  });
  el.clear.addEventListener('click', function () {
    strokes.length = turnStart;
    redraw();
  });
  el.paintDone.addEventListener('click', function () { finishPainting(false); });
  el.handoffGo.addEventListener('click', takeOver);
  el.revealAnswer.addEventListener('click', revealAnswer);
  el.nextRound.addEventListener('click', startRound);
  el.endGame.addEventListener('click', function (event) {
    if (event.detail === 0) endGame(); // 鍵盤沒有「按住」可言
  });
  el.endGame.addEventListener('pointerdown', function (event) {
    if (event.button > 0) return;
    cancelHold();
    el.endGame.classList.add('is-holding');
    holdId = setTimeout(endGame, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.endGame.addEventListener(type, cancelHold);
  });
  el.endGame.addEventListener('contextmenu', function (event) { event.preventDefault(); });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  var saved = readJson(SETTINGS_KEY, null);
  if (saved && typeof saved === 'object' && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  syncSoundButton();
  renderCategories();
  renderColors();
  syncSetup();
  el.deck.innerHTML = deckArt();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
