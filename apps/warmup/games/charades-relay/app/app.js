/*
 * 比手畫腳接力賽。手機一直在主持人手上：出題、整隊的總倒數、每一棒倒數（時間到自動換人）、記猜中幾題（CONCEPT.md 二之一）。
 *
 * 一步一步帶（跟比手畫腳同一套，步驟頭、規則卡是全站共用的 window.Leader）：
 *   setup 開場（一隊幾人、每隊幾分鐘、每個人比多久、題目類型）→ rules 說明規則
 *   → play（draw 排好、抽題目 → word 給排頭看 → relay 一棒一棒傳（人數 - 1 棒，每棒時間到自動換人）
 *           → guess 最後一個人猜（字格＋提示）→ reveal 答案揭曉 → 下一題回 draw）
 *   → end 時間到，猜中幾題 → 再玩一次回 play（下一隊上場也是按這個）
 * 總倒數只在 word／relay／guess 跑，抽題目和答案揭曉（往前問「你以為是什麼」）時停住。
 * 返回鍵一律回第一頁；已經抽過題目就先確認。只記聲音開關，其他設定每次都是預設。
 */
(function () {
  'use strict';

  var T = window.RELAY.T;
  var BASE = window.RELAY.base;
  var LANG = window.RELAY.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SIZE_MIN = 3; // 少於 3 人就只是比手畫腳，沒有「傳」
  var SIZE_MAX = 10;
  var SETTINGS_KEY = 'woohop-charades-relay-settings';

  var CATS = window.RELAY.words; // [代號, 類型名稱, [題目...]]（全站共用的 apps/homepage/src/word-bank.mjs）
  var ALL_CATS = CATS.map(function (c) { return c[0]; });

  // 開場的設定：每次打開都是預設（產品決定，不記上次選的），預設就能玩：一隊 5 人、每隊 5 分鐘、每人 15 秒、隨機題目
  // 一隊幾人決定要傳幾棒（size - 1），最後一棒傳完自動進猜答案
  var prep = { size: 5, min: 5, sec: 15, cats: ALL_CATS.slice() };
  var randomCats = true;
  // 只記聲音開關（跟定時炸彈一樣）
  var settings = { sound: true };

  var screen = 'setup';
  var phase = 'draw';
  var roundNumber = 0; // 這一場比到第幾題
  var gameNumber = 0;
  var finished = false; // 時間到了沒（結束畫面的照著念要用）
  var right = 0; // 猜中幾題
  var judged = 0; // 比完（猜中或沒猜到）幾題；時間到時正在傳的那題不算
  var deck = [];
  var card = null;
  var pass = 1; // 第幾棒：第 k 個人比給第 k+1 個人看
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
    roundBar: $('round-bar'),
    clock: $('clock'),
    card: $('card'),
    deck: $('deck'),
    draw: $('card-draw'),
    drawn: $('drawn'),
    cardKind: $('card-kind'),
    cardText: $('card-text'),
    relayStart: $('relay-start'),
    skip: $('skip'),
    passNo: $('pass-no'),
    passWho: $('pass-who'),
    timer: $('timer'),
    timerArc: $('timer-arc'),
    timerNum: $('timer-num'),
    hintKind: $('hint-kind'),
    hintMask: $('hint-mask'),
    hintKindBtn: $('hint-kind-btn'),
    hintCharBtn: $('hint-char-btn'),
    gotRight: $('got-right'),
    giveUp: $('give-up'),
    resultTitle: $('result-title'),
    resultAnswer: $('result-answer'),
    nextRound: $('next-round'),
    finalRight: $('final-right'),
    finalPlayed: $('final-played'),
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

  // ---------- 開場：一隊幾人、每隊幾分鐘、每個人比多久 ----------

  var totalPasses = function () { return prep.size - 1; };

  function syncSetup() {
    el.sizeValue.textContent = prep.size;
    el.sizeLess.disabled = prep.size <= SIZE_MIN;
    el.sizeMore.disabled = prep.size >= SIZE_MAX;
    document.querySelectorAll('input[name="min"]').forEach(function (input) {
      input.checked = input.value === String(prep.min);
    });
    document.querySelectorAll('input[name="sec"]').forEach(function (input) {
      input.checked = input.value === String(prep.sec);
    });
    el.roundsHint.textContent = fill(T.roundsHint, { min: prep.min, passes: totalPasses(), sec: prep.sec });
  }
  function setSize(n) {
    prep.size = Math.max(SIZE_MIN, Math.min(SIZE_MAX, n));
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
  // 上場那一步：主持人對大家說話的兩段才放（draw 排好、reveal 答案揭曉後往前問），word、relay、guess 畫面留給題卡
  var PLAY_LEAD = { draw: true, reveal: true };

  function renderLead() {
    var key = screen === 'play' ? phase : screen;
    if (screen === 'play' && !PLAY_LEAD[phase]) return;
    var line = T.lead[key];
    if (!line) return;
    var v = { result: resultLine() };
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: fill(line[0], v),
      say: fill(line[1], v),
    });
    // 答案揭曉只放標題、不放照著念；排好了嗎的照著念只在第 1 題出現，之後大家都知道了（老闆 11/03 要求）
    Leader.hideSay(!line[1] || (screen === 'play' && phase === 'draw' && roundNumber > 1));
  }

  // ---------- 整隊的總倒數：只在 word／relay／guess 跑，抽題目、答案揭曉時停住 ----------

  var RUNNING = { word: true, relay: true, guess: true };
  var usedMs = 0; // 已經用掉的時間（不含停住的時候）
  var runningSince = 0; // 這一段開始跑的時間；0 是停住
  var clockId = 0;

  var totalMs = function () { return prep.min * 60000; };
  var leftMs = function () {
    return Math.max(0, totalMs() - usedMs - (runningSince ? Date.now() - runningSince : 0));
  };
  // 上方的倒數 4:05
  function clockText(ms) {
    var s = Math.ceil(ms / 1000);
    var sec = s % 60;
    return Math.floor(s / 60) + ':' + (sec < 10 ? '0' : '') + sec;
  }
  function tickClock() {
    var left = leftMs();
    el.clock.textContent = clockText(left);
    el.clock.classList.toggle('is-urgent', left <= 10000);
    el.clock.classList.toggle('is-paused', !runningSince);
    el.roundBar.style.setProperty('--p', (1 - left / totalMs()) * 100 + '%');
    if (left <= 0) timeUp();
  }
  function setRunning(on) {
    if (on && !runningSince) runningSince = Date.now();
    if (!on && runningSince) {
      usedMs += Date.now() - runningSince;
      runningSince = 0;
    }
  }
  function startClock() {
    clearInterval(clockId);
    usedMs = 0;
    runningSince = 0;
    tickClock();
    clockId = setInterval(tickClock, 200);
  }
  function stopClock() {
    setRunning(false);
    clearInterval(clockId);
    clockId = 0;
  }

  // 結束時照著念的那一句：幾分鐘猜中幾題；一題都沒中另一句
  function resultLine() {
    if (!finished) return '';
    return fill(right ? T.resultLine : T.resultNone, { n: right, min: prep.min });
  }

  // ---------- 題目 ----------

  // 一疊卡的插圖（跟比手畫腳同一張），最上面換成這個遊戲的綠色、畫一個問號
  function deckArt() {
    var c = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#FFC628') + W.ring(22, 34, '#EE7B6A') + W.plus(142, 92, '#7489E6') + W.dot(20, 92, '#F3A4FB') +
      c(36, 34, '#FFC628', -14) + c(70, 34, '#F3A4FB', 12) +
      '<g class="deck-top">' + c(53, 28, '#4FB59A', 0) +
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
    hint = { kind: false, chars: Array.from(card[1]), shown: [] };
  }

  // ---------- 猜的時候的提示（照比手畫腳 games/charades/app/app.js）：一個字一個方塊、提示類型、提示一個字 ----------

  var hint = null; // 這一題給過的提示：{ kind: 給了類型沒, chars, shown: 已經露出的字的位置 }

  // 用 Array.from 切字，中日韓字、表情符號都算一個；空白和標點直接顯示，不算要猜的字
  var isLetter = function (ch) { return /[\p{L}\p{N}]/u.test(ch); };
  var hiddenLetters = function () {
    var list = [];
    hint.chars.forEach(function (ch, i) {
      if (isLetter(ch) && hint.shown.indexOf(i) < 0) list.push(i);
    });
    return list;
  };
  // 沒露出來的字畫成方塊：一個字一個 span；每個單字包成一組（.mask-word 不換行），換行只發生在單字之間
  function renderMask() {
    el.hintMask.textContent = '';
    var word = null;
    hint.chars.forEach(function (ch, i) {
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
      if (isLetter(ch) && hint.shown.indexOf(i) < 0) {
        span.className = 'mask-box';
        span.setAttribute('aria-hidden', 'true');
      } else {
        span.textContent = ch;
      }
      word.appendChild(span);
    });
  }

  function syncHints() {
    renderMask();
    el.hintKind.textContent = hint.kind ? card[0] : '';
    el.hintKind.hidden = !hint.kind;
    el.hintKindBtn.disabled = hint.kind;
    // 只剩最後一個字沒露出來，就不能再多給了
    el.hintCharBtn.disabled = hiddenLetters().length <= 1;
  }

  function giveKind() {
    hint.kind = true;
    syncHints();
    track('charades_relay_hint_shown', { round_number: roundNumber, kind: 'category', category: card[0] });
  }
  // 每按一次隨機多露一個字（最後一個字不露）
  function giveChar() {
    var hidden = hiddenLetters();
    if (hidden.length <= 1) return;
    hint.shown.push(hidden[Math.floor(Math.random() * hidden.length)]);
    syncHints();
    track('charades_relay_hint_shown', { round_number: roundNumber, kind: 'char', shown: hint.shown.length, category: card[0] });
  }

  function flip() {
    el.drawn.classList.remove('pop');
    void el.drawn.offsetWidth;
    el.drawn.classList.add('pop');
  }

  // ---------- 每一棒的倒數：時間到響一聲、自動換下一棒（沒有手動換人鍵，老闆 11/03 要求）；最後一棒時間到就進猜答案 ----------

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
    endsAt = Date.now() + prep.sec * 1000;
    lastBeep = -1;
    tickTimer();
    timerId = setInterval(tickTimer, 100);
  }
  function tickTimer() {
    var left = Math.max(0, endsAt - Date.now());
    var sec = Math.ceil(left / 1000);
    el.timerNum.textContent = sec;
    el.timerArc.style.strokeDashoffset = String(RING * (1 - left / (prep.sec * 1000)));
    el.timer.classList.toggle('is-urgent', sec <= 3 && left > 0);
    // 每秒滴一聲（輕），最後三秒換高音嗶（重）；第一秒不響，按下去那一聲已經是 pass 的音效
    if (sec > 0 && sec !== lastBeep) {
      if (lastBeep !== -1) {
        if (sec <= 3) beep(880, 0.08, 0.14);
        else beep(1200, 0.03, 0.05);
      }
      lastBeep = sec;
    }
    if (left <= 0) {
      stopTimer();
      if (navigator.vibrate) navigator.vibrate(200);
      nextPass(true);
    }
  }

  // ---------- 聲音：抽題、傳棒、倒數滴答（最後三秒嗶、時間到長一聲）、猜對猜錯、結束。頂欄音符鍵開關，只記這一個 ----------

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
    pass: function () { tune([[523, 0.07, 0.06], [784, 0.1, 0]]); },
    // 這一棒時間到、自動換人：低一點、長一點，跟自己按的那一聲分得出來
    swap: function () { beep(440, 0.4, 0.22); },
    // 整隊時間到
    timeUp: function () { beep(330, 0.25, 0.25, 0); beep(330, 0.6, 0.25, 0.32); },
    guess: function () { tune([[392, 0.1, 0.1], [523, 0.1, 0.1], [659, 0.18, 0]]); },
    right: function () { tune([[523, 0.1, 0.09], [659, 0.1, 0.09], [784, 0.1, 0.09], [1047, 0.3, 0]], 0.22); },
    wrong: function () { beep(196, 0.35, 0.16, 0, 'sawtooth'); },
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
    if (settings.sound) sfx.pass(); // 打開時響一下，順便在點擊裡把 AudioContext 叫醒
  };

  // ---------- 上場的五段 ----------

  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.card.setAttribute('data-stage', next);
    if (next !== 'relay') stopTimer();
    setRunning(!!RUNNING[next]);
    tickClock();
    renderLead();
  }

  function renderRound() {
    el.roundNo.textContent = fill(T.roundNo, { n: Math.max(1, roundNumber) });
  }

  // 知道一隊幾人，所以最後一棒寫「比給最後一個人看」，時間到就進猜答案
  function renderPass() {
    var last = pass >= totalPasses();
    el.passNo.textContent = fill(T.passNo, { k: pass, total: totalPasses() });
    el.passWho.textContent = fill(last ? T.passWhoLast : T.passWho, { k: pass, next: pass + 1 });
    startTimer();
  }

  function startRound() {
    roundNumber += 1;
    skips = 0;
    renderRound();
    setPhase('draw');
    window.scrollTo(0, 0);
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
      setPhase('word');
      flip();
    }, reduceMotion ? 0 : 380);
  }

  function startRelay() {
    pass = 1;
    sfx.pass();
    setPhase('relay');
    renderPass();
  }

  // auto：這一棒時間到自動換的（響換人的聲音）；沒帶就是主持人自己按的
  function nextPass(auto) {
    if (screen !== 'play' || phase !== 'relay') return;
    if (pass >= totalPasses()) {
      toGuess(auto);
      return;
    }
    pass += 1;
    if (auto) sfx.swap();
    else sfx.pass();
    renderPass();
    window.scrollTo(0, 0);
  }

  function toGuess(auto) {
    syncHints();
    if (auto) sfx.swap();
    sfx.guess();
    setPhase('guess');
    track('charades_relay_passed', { round_number: roundNumber, passes: pass, seconds: prep.sec });
  }

  // 猜中了／沒猜到：記下來、公布答案；下一題由主持人按（揭曉後要往前問「你以為是什麼」）
  function judge(ok) {
    if (phase !== 'guess') return;
    judged += 1;
    if (ok) right += 1;
    if (ok) sfx.right();
    else sfx.wrong();
    track('charades_relay_judged', {
      round_number: roundNumber, right: ok, passes: pass, category: card[0], skips: skips,
      hint_kind: hint.kind, hint_chars: hint.shown.length,
    });
    el.resultTitle.textContent = ok ? T.resultRight : T.answerIs;
    el.resultAnswer.textContent = card[1];
    setPhase('reveal');
  }

  // 整隊時間到：正在傳、正在猜的那題不算，直接結束
  function timeUp() {
    if (screen !== 'play' || finished) return;
    sfx.timeUp();
    if (navigator.vibrate) navigator.vibrate([200, 100, 400]);
    endGame();
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 排成一列（三個背對背的小人）、一個比給一個看（兩個小人＋拍肩的泡泡）、最後一個人猜（問號泡泡＋1）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var head = function (x, y, r, color, face) {
    return W.body('<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>', color) + (face ? W.makeFace(face, x, y, r / 24) : '');
  };
  var RULE_ART = [
    function () {
      return W.ground + W.dot(18, 30, '#FFC628', 4) + W.plus(144, 30, '#EE7B6A') +
        head(36, 82, 20, '#4FB59A', 'grin') + head(80, 82, 20, '#7489E6') + head(124, 82, 20, '#F3A4FB') +
        '<path d="M98 50l12 0m-5-5l5 5l-5 5M54 50l12 0m-5-5l5 5l-5 5" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    },
    function () {
      return W.ground + W.burst(142, 22, '#FFC628') + W.ring(20, 34, '#7489E6') +
        head(52, 80, 26, '#4FB59A', 'grin') + head(112, 80, 26, '#FFC628', 'worry') +
        '<path d="M78 74q8-10 16 0" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>' + bubble(52, 34, '×');
    },
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 34, '#EE7B6A') +
        head(72, 80, 32, '#F3A4FB', 'grin') + bubble(122, 40, '+1');
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
    if (next !== 'play') {
      stopTimer();
      stopClock();
    }

    renderLead();
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    roundNumber = 0;
    finished = false;
    right = 0;
    judged = 0;
    ensureAudio(); // 在點擊裡先建好，之後的音效才不會被自動播放限制擋掉
    shuffleDeck();
    showScreen('play');
    startClock();
    startRound();
    track('charades_relay_game_started', {
      game_number: gameNumber,
      size: prep.size,
      minutes: prep.min,
      seconds: prep.sec,
      categories: randomCats ? 'random' : prep.cats.join(','),
    });
  }

  function endGame() {
    stopTimer();
    stopClock();
    finished = true;
    track('charades_relay_game_ended', {
      rounds: judged,
      size: prep.size,
      right: right,
      minutes: prep.min,
      seconds: prep.sec,
    });
    el.finalRight.textContent = fill(T.finalCount, { n: right });
    el.finalPlayed.textContent = fill(T.finalCount, { n: judged });
    setTimeout(sfx.end, reduceMotion ? 0 : 900); // 時間到那兩聲先響完
    showScreen('end');
  }

  // ---------- 返回鍵：一律回第一頁；已經抽過題目先確認（照比手畫腳） ----------

  function pushGameState() {
    history.pushState({ relay: 'game' }, '');
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
  document.querySelectorAll('input[name="min"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prep.min = Number(input.value);
      syncSetup();
    });
  });
  document.querySelectorAll('input[name="sec"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prep.sec = Number(input.value);
      syncSetup();
    });
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.draw.addEventListener('click', drawFromDeck);
  // 換一題：只有開始傳之前可以（照比手畫腳），不算一題
  el.skip.addEventListener('click', function () {
    skips += 1;
    sfx.draw();
    track('charades_relay_skipped', { round_number: roundNumber, category: card[0] });
    nextCard();
    flip();
  });
  el.relayStart.addEventListener('click', startRelay);
  el.hintKindBtn.addEventListener('click', giveKind);
  el.hintCharBtn.addEventListener('click', giveChar);
  el.gotRight.addEventListener('click', function () { judge(true); });
  el.giveUp.addEventListener('click', function () { judge(false); });
  el.nextRound.addEventListener('click', startRound);

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  var saved = readJson(SETTINGS_KEY, null);
  if (saved && typeof saved === 'object' && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  syncSoundButton();
  renderCategories();
  syncSetup();
  el.deck.innerHTML = deckArt();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
