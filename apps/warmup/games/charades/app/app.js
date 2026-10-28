/*
 * 比手畫腳。手機不當裁判、不記分（CONCEPT.md 第二節），只做三件事：一步一步帶、出題、倒數。
 *
 * 一步一步帶（跟木頭人動作版同一套，步驟頭、規則卡是全站共用的 window.Leader）：
 *   setup 開場（題目類型、每題時間）→ rules 說明規則 → play（draw 抽題目 → ready 看題目 → acting 倒數 → result → 下一個人回 draw）
 *   → end 遊戲結束 → 再玩一次回 play
 * 返回鍵一律回第一頁；已經比過題目就先確認。
 */
(function () {
  'use strict';

  var T = window.CHARADES.T;
  var BASE = window.CHARADES.base;
  var LANG = window.CHARADES.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var PREP_KEY = 'web100-charades-prep';
  var TIMES = [60, 90, 120];

  // 開場的設定，存在手機上：題目類型（代號）、每題秒數、聲音
  var prep = { cats: T.categories.map(function (c) { return c[0]; }), seconds: 60, sound: true };
  var screen = 'setup';
  var phase = 'draw';
  var turnNumber = 0; // 這一場比到第幾題
  var gameNumber = 0;
  var startedAt = 0;
  var deck = []; // 這一場還沒抽的題目 [類型名稱, 題目]（洗好的、去掉重複）
  var card = null;
  var timerId = 0;
  var endsAt = 0;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    categoryGrid: $('category-grid'),
    timeSeg: $('time-seg'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    turnNo: $('turn-no'),
    card: $('card'),
    deck: $('deck'),
    draw: $('card-draw'),
    drawn: $('drawn'),
    cardKind: $('card-kind'),
    cardText: $('card-text'),
    timerBar: $('timer-bar').firstChild,
    timerSec: $('timer-sec'),
    actStart: $('act-start'),
    gotIt: $('got-it'),
    skip: $('skip'),
    resultTitle: $('result-title'),
    resultAnswer: $('result-answer'),
    resultHint: $('result-hint'),
    nextTurn: $('next-turn'),
    endBtn: $('end-btn'),
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

  // ---------- 設定（存在手機上） ----------

  function loadPrep() {
    try {
      var saved = JSON.parse(localStorage.getItem(PREP_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return;
      var known = T.categories.map(function (c) { return c[0]; });
      if (Array.isArray(saved.cats)) {
        var cats = saved.cats.filter(function (id) { return known.indexOf(id) >= 0; });
        if (cats.length) prep.cats = cats;
      }
      if (TIMES.indexOf(saved.seconds) >= 0) prep.seconds = saved.seconds;
      if (typeof saved.sound === 'boolean') prep.sound = saved.sound;
    } catch (e) {
      /* 無痕模式或存檔壞了：照樣能玩，只是記不住 */
    }
  }
  function savePrep() {
    try {
      localStorage.setItem(PREP_KEY, JSON.stringify(prep));
    } catch (e) {
      /* 同上 */
    }
  }

  // 題目類型：可複選、至少一類（最後一個不能取消）
  function renderCategories() {
    T.categories.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice category-choice';
      b.dataset.id = c[0];
      var name = document.createElement('span');
      name.className = 'choice-name';
      name.textContent = c[1];
      var sub = document.createElement('span');
      sub.className = 'choice-sub';
      sub.textContent = c[2].slice(0, 2).join('、');
      b.appendChild(name);
      b.appendChild(sub);
      b.addEventListener('click', function () {
        var i = prep.cats.indexOf(c[0]);
        if (i >= 0) {
          if (prep.cats.length === 1) return;
          prep.cats.splice(i, 1);
        } else {
          prep.cats.push(c[0]);
        }
        savePrep();
        syncCategories();
      });
      el.categoryGrid.appendChild(b);
    });
    syncCategories();
  }
  function syncCategories() {
    Array.prototype.forEach.call(el.categoryGrid.children, function (b) {
      b.setAttribute('aria-pressed', String(prep.cats.indexOf(b.dataset.id) >= 0));
    });
  }

  function renderTimes() {
    TIMES.forEach(function (sec) {
      var label = document.createElement('label');
      label.className = 'seg-item';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'seconds';
      input.value = String(sec);
      input.checked = sec === prep.seconds;
      input.addEventListener('change', function () {
        prep.seconds = sec;
        savePrep();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(fill(T.timeOption, { sec: sec })));
      el.timeSeg.appendChild(label);
    });
  }

  // ---------- 聲音：剩 5 秒每秒嗶一聲，時間到響一長聲 ----------

  var audio = null;
  function beep(freq, length, peak) {
    if (!prep.sound) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var t0 = audio.currentTime;
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
      osc.connect(gain).connect(audio.destination);
      osc.start(t0);
      osc.stop(t0 + length + 0.02);
    } catch (e) {
      /* 沒有聲音也照樣能玩 */
    }
  }
  // 頂欄的聲音鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫這個）
  function syncSound() {
    if (el.sound) el.sound.setAttribute('aria-pressed', String(prep.sound));
  }
  window.toggleMusic = function () {
    prep.sound = !prep.sound;
    savePrep();
    syncSound();
  };

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  // 上台那一步手機在比的人手上，不放步驟頭（apps/warmup/CLAUDE.md）
  function renderLead() {
    if (!T.lead[screen]) return;
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[screen][0],
      say: T.lead[screen][1],
    });
  }

  // ---------- 題目 ----------

  /*
   * 一疊卡的插圖，跟抽卡取名（game.js 的 deckArt）同一張，最上面換成這個遊戲的藍色、畫一個問號。
   * 最上面那張包在 .deck-top 裡，抽的時候只有它飛走（game.css 的 .deck.is-drawing）。
   */
  function deckArt() {
    var c = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#FFC628') + W.ring(22, 34, '#EE7B6A') + W.plus(142, 92, '#4FB59A') + W.dot(20, 92, '#F3A4FB') +
      c(36, 34, '#FFC628', -14) + c(70, 34, '#F3A4FB', 12) +
      '<g class="deck-top">' + c(53, 28, '#7489E6', 0) +
      '<path d="M72 54q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drawing = false;

  // 選了的類型的題目洗成一副；同一個詞出現在兩類（騎馬：運動／交通工具）只留一個
  function shuffleDeck() {
    var seen = {};
    deck = [];
    T.categories.forEach(function (c) {
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
    if (!deck.length) shuffleDeck(); // 整副比完再洗一次
    card = deck.pop();
    el.cardKind.textContent = card[0];
    el.cardText.textContent = card[1];
  }

  // 卡片從側面轉正（game.css 的 .drawn-card.pop）
  function flip() {
    el.drawn.classList.remove('pop');
    void el.drawn.offsetWidth;
    el.drawn.classList.add('pop');
  }

  /*
   * 上台的四段。畫面上哪些區塊出現由 CSS 看 #view-play 的 data-phase 決定（app.css 的 .phase-*），
   * 題卡自己的三面（draw／reveal／result）跟著換。
   */
  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.card.setAttribute('data-stage', next === 'draw' ? 'draw' : next === 'result' ? 'result' : 'reveal');
    el.turnNo.textContent = fill(T.turnCount, { n: turnNumber });
  }

  function drawFromDeck() {
    if (drawing) return;
    drawing = true;
    turnNumber += 1;
    nextCard();
    el.deck.classList.add('is-drawing');
    setTimeout(function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      setPhase('ready');
      flip();
    }, reduceMotion ? 0 : 380);
  }

  // ---------- 倒數 ----------

  var lastWhole = 0;
  function tick() {
    var left = Math.max(0, endsAt - Date.now());
    var whole = Math.ceil(left / 1000);
    el.timerBar.style.setProperty('--p', (left / (prep.seconds * 1000)) * 100 + '%');
    el.timerSec.textContent = whole;
    el.timerSec.classList.toggle('is-hurry', whole <= 5);
    if (whole !== lastWhole && whole <= 5 && whole > 0) beep(880, 0.12, 0.15);
    lastWhole = whole;
    if (left <= 0) {
      stopTimer();
      beep(440, 0.7, 0.25);
      showResult(false);
    }
  }
  function startTimer() {
    stopTimer();
    endsAt = Date.now() + prep.seconds * 1000;
    lastWhole = prep.seconds + 1;
    tick();
    timerId = setInterval(tick, 200);
  }
  function stopTimer() {
    clearInterval(timerId);
    timerId = 0;
  }

  function showResult(guessed) {
    // 時間到：標題接「答案是」，下面大字是答案（大家都看得到）
    el.resultTitle.textContent = guessed ? T.gotItResult : T.timeUpResult + ' ' + T.answerIs;
    el.resultAnswer.textContent = card[1];
    el.resultHint.textContent = guessed ? T.gotItHint : '';
    el.resultHint.hidden = !guessed;
    setPhase('result');
    track('charades_turn_ended', { turn_number: turnNumber, result: guessed ? 'guessed' : 'timeout', category: card[0] });
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 輪流上台（那疊卡）、只能比不能說（嘴巴打叉）、猜中得一分（開心臉＋1）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    deckArt,
    function () {
      return W.ground + W.plus(140, 34, '#4FB59A') + W.dot(22, 40, '#FFC628', 4) +
        W.body('<circle cx="80" cy="80" r="32"/>', '#7489E6') + W.makeFace('worry', 80, 76, 1.4) +
        '<path d="M70 92l20 0" stroke="#22222c" stroke-width="4" stroke-linecap="round"/>' + bubble(124, 40, '×');
    },
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 34, '#EE7B6A') +
        W.body('<circle cx="72" cy="80" r="32"/>', '#FFC628') + W.makeFace('grin', 72, 80, 1.4) + bubble(122, 40, '+1');
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
    if (next !== 'play') stopTimer();

    renderLead();
    syncSound();
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    turnNumber = 0;
    startedAt = Date.now();
    shuffleDeck();
    showScreen('play');
    setPhase('draw');
    track('charades_game_started', { game_number: gameNumber, categories: prep.cats.join(','), seconds: prep.seconds });
  }

  // ---------- 返回鍵：一律回第一頁；已經比過題目先確認 ----------

  function pushGameState() {
    history.pushState({ charades: 'game' }, '');
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
    if (screen === 'play' && turnNumber > 0) {
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

  // ---------- 結束遊戲：按住 HOLD_MS 才結束（跟果園同一個做法，防手滑） ----------

  var HOLD_MS = 800;
  var holdId = 0;

  function endGame() {
    cancelHold();
    track('charades_game_ended', {
      turns: turnNumber,
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

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.draw.addEventListener('click', drawFromDeck);
  el.actStart.addEventListener('click', function () {
    setPhase('acting');
    startTimer();
  });
  // 換一題：計時不重來（ready 還沒開始計時就只是換題）
  el.skip.addEventListener('click', function () {
    track('charades_skipped', { turn_number: turnNumber, category: card[0] });
    nextCard();
    flip();
  });
  el.gotIt.addEventListener('click', function () {
    stopTimer();
    showResult(true);
  });
  el.nextTurn.addEventListener('click', function () {
    setPhase('draw');
    window.scrollTo(0, 0);
  });

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

  loadPrep();
  syncSound();
  renderCategories();
  renderTimes();
  el.deck.innerHTML = deckArt();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
