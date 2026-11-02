/*
 * 比手畫腳接力。手機一直在主持人手上：出題、計時、記各隊分數（CONCEPT.md 第二節）。
 *
 * 一步一步帶（跟比手畫腳同一套，步驟頭、規則卡是全站共用的 window.Leader）：
 *   setup 開場（幾隊、每隊比幾題、每個人比多久、題目類型）→ rules 說明規則
 *   → play（draw 這隊排好、抽題目 → word 給排頭看 → relay 一棒一棒傳 → guess 最後一個人說答案
 *           → reveal 公布答案、猜對了沒 → 下一隊回 draw）
 *   → end 各隊分數（題數比完自動進來）→ 再玩一次回 play
 * 返回鍵一律回第一頁；已經抽過題目就先確認。只記聲音開關，其他設定每次都是預設。
 */
(function () {
  'use strict';

  var T = window.RELAY.T;
  var BASE = window.RELAY.base;
  var LANG = window.RELAY.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var TEAM_MIN = 1;
  var TEAM_MAX = 4; // 隊名（locale 的 teamNames）只有 4 個，build.mjs 會擋
  var TEAM_COLORS = ['blue', 'yellow', 'mint', 'pink'];
  var SETTINGS_KEY = 'woohop-charades-relay-settings';

  var CATS = window.RELAY.words; // [代號, 類型名稱, [題目...]]（全站共用的 apps/homepage/src/word-bank.mjs）
  var ALL_CATS = CATS.map(function (c) { return c[0]; });

  // 開場的設定：每次打開都是預設（產品決定，不記上次選的），預設就能玩：兩隊、每隊 2 題、每人 20 秒、隨機題目
  var prep = { teams: 2, per: 2, sec: 20, cats: ALL_CATS.slice() };
  var randomCats = true;
  // 只記聲音開關（跟定時炸彈一樣）
  var settings = { sound: true };

  var screen = 'setup';
  var phase = 'draw';
  var roundNumber = 0; // 這一場比到第幾題（各隊輪流，第 1 題藍隊、第 2 題黃隊⋯）
  var gameNumber = 0;
  var startedAt = 0;
  var scores = [];
  var deck = [];
  var card = null;
  var pass = 1; // 第幾棒：第 k 個人比給第 k+1 個人看
  var skips = 0;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    teamLess: $('team-less'),
    teamMore: $('team-more'),
    teamValue: $('team-value'),
    roundsHint: $('rounds-hint'),
    categoryGrid: $('category-grid'),
    categoryToggle: $('category-toggle'),
    categoryPanel: $('category-panel'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    roundNo: $('round-no'),
    roundBar: $('round-bar'),
    scoreboard: $('scoreboard'),
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
    timerHint: $('timer-hint'),
    passNext: $('pass-next'),
    lastSeen: $('last-seen'),
    peek: $('peek'),
    peekAnswer: $('peek-answer'),
    reveal: $('reveal'),
    resultAnswer: $('result-answer'),
    gotRight: $('got-right'),
    gotWrong: $('got-wrong'),
    finalScores: $('final-scores'),
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

  // ---------- 開場：幾隊、每隊比幾題、每個人比多久 ----------

  var totalRounds = function () { return prep.teams * prep.per; };
  var isLast = function () { return roundNumber >= totalRounds(); };
  var teamOf = function (round) { return (Math.max(1, round) - 1) % prep.teams; };
  var teamName = function (i) { return T.teamNames[i]; };

  function syncSetup() {
    el.teamValue.textContent = prep.teams;
    el.teamLess.disabled = prep.teams <= TEAM_MIN;
    el.teamMore.disabled = prep.teams >= TEAM_MAX;
    document.querySelectorAll('input[name="per"]').forEach(function (input) {
      input.checked = input.value === String(prep.per);
    });
    document.querySelectorAll('input[name="sec"]').forEach(function (input) {
      input.checked = input.value === String(prep.sec);
    });
    el.roundsHint.textContent = fill(prep.teams > 1 ? T.roundsHint : T.roundsHintOne, { total: totalRounds() });
  }
  function setTeams(n) {
    prep.teams = Math.max(TEAM_MIN, Math.min(TEAM_MAX, n));
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
  // 上場那一步：主持人對大家說話的三段才放（draw／guess／reveal），word、relay 畫面留給題卡和倒數
  var PLAY_LEAD = { draw: true, guess: true, reveal: true };

  function renderLead() {
    var key = screen === 'play' ? phase : screen;
    if (screen === 'play' && !PLAY_LEAD[phase]) return;
    var line = T.lead[key];
    if (!line) return;
    var v = { team: teamName(teamOf(roundNumber)), winner: winnerLine() };
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: fill(line[0], v),
      say: fill(line[1], v),
    });
  }

  // ---------- 分數 ----------

  function renderScores(listEl, current) {
    listEl.textContent = '';
    for (var i = 0; i < prep.teams; i += 1) {
      var li = document.createElement('li');
      li.className = 'team-score t-' + TEAM_COLORS[i] + (i === current ? ' is-on' : '');
      var name = document.createElement('span');
      name.className = 'team-name';
      name.textContent = teamName(i);
      var pts = document.createElement('b');
      pts.textContent = fill(T.scoreUnit, { n: scores[i] || 0 });
      li.appendChild(name);
      li.appendChild(pts);
      listEl.appendChild(li);
    }
  }

  // 結束時照著念的那一句：誰贏、平手、都沒猜中；只有一隊就說猜中幾題
  function winnerLine() {
    if (!scores.length) return '';
    if (prep.teams === 1) return fill(T.soloResult, { n: scores[0], total: totalRounds() });
    var best = Math.max.apply(null, scores);
    if (best === 0) return T.winnerNone;
    var top = [];
    scores.forEach(function (s, i) { if (s === best) top.push(teamName(i)); });
    if (top.length === 1) return fill(T.winnerOne, { team: top[0] });
    return fill(T.winnerTie, { team: top.join(T.listAnd) });
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
  }

  function flip() {
    el.drawn.classList.remove('pop');
    void el.drawn.offsetWidth;
    el.drawn.classList.add('pop');
  }

  // ---------- 倒數：每一棒重新算，時間到只提醒、不自動換人（主持人看大家比完了再按） ----------

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
    el.timer.classList.remove('is-urgent', 'is-up');
    el.timer.hidden = !prep.sec;
    if (!prep.sec) {
      el.timerHint.textContent = T.noTimer;
      return;
    }
    el.timerHint.textContent = '';
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
    if (sec <= 3 && sec > 0 && sec !== lastBeep) {
      lastBeep = sec;
      beep(880, 0.08, 0.12);
    }
    if (left <= 0) {
      stopTimer();
      el.timer.classList.add('is-up');
      el.timerHint.textContent = T.timeUp;
      beep(440, 0.5, 0.25);
      if (navigator.vibrate) navigator.vibrate(200);
    }
  }

  // ---------- 聲音：最後三秒嗶、時間到長一聲。頂欄音符鍵開關，只記這一個 ----------

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
  function beep(freq, seconds, peak) {
    if (!settings.sound) return;
    var c = ensureAudio();
    if (!c) return;
    var t0 = c.currentTime + 0.01;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  var soundButton = document.getElementById('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    writeJson(SETTINGS_KEY, { sound: settings.sound });
    syncSoundButton();
  };

  // ---------- 上場的五段 ----------

  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.card.setAttribute('data-stage', next);
    if (next !== 'relay') stopTimer();
    renderLead();
  }

  function renderRound() {
    var n = Math.max(1, roundNumber);
    el.roundNo.textContent = fill(T.roundNo, { n: n, total: totalRounds() }) + ' · ' + teamName(teamOf(n));
    el.roundBar.style.setProperty('--p', ((roundNumber - 1) / totalRounds()) * 100 + '%');
    renderScores(el.scoreboard, teamOf(n));
  }

  function renderPass() {
    el.passNo.textContent = fill(T.passNo, { k: pass });
    el.passWho.textContent = fill(T.passWho, { k: pass, next: pass + 1 });
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
    setTimeout(function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      setPhase('word');
      flip();
    }, reduceMotion ? 0 : 380);
  }

  function startRelay() {
    ensureAudio(); // 在點擊裡先建好，倒數的嗶聲才不會被自動播放限制擋掉
    pass = 1;
    setPhase('relay');
    renderPass();
  }

  function toGuess() {
    el.peekAnswer.hidden = true;
    el.peekAnswer.textContent = card[1];
    el.peek.textContent = T.peekButton;
    setPhase('guess');
    track('charades_relay_passed', { round_number: roundNumber, passes: pass, seconds: prep.sec });
  }

  function showAnswer() {
    el.resultAnswer.textContent = card[1];
    el.gotRight.textContent = T.gotRight;
    setPhase('reveal');
  }

  function judge(right) {
    var team = teamOf(roundNumber);
    if (right) scores[team] += 1;
    track('charades_relay_judged', { round_number: roundNumber, right: right, passes: pass, category: card[0], skips: skips });
    el.roundBar.style.setProperty('--p', (roundNumber / totalRounds()) * 100 + '%');
    if (isLast()) endGame();
    else startRound();
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
    if (next !== 'play') stopTimer();

    renderLead();
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    roundNumber = 0;
    startedAt = Date.now();
    scores = [];
    for (var i = 0; i < prep.teams; i += 1) scores.push(0);
    shuffleDeck();
    showScreen('play');
    startRound();
    track('charades_relay_game_started', {
      game_number: gameNumber,
      teams: prep.teams,
      per: prep.per,
      seconds: prep.sec,
      categories: randomCats ? 'random' : prep.cats.join(','),
    });
  }

  function endGame() {
    stopTimer();
    track('charades_relay_game_ended', {
      rounds: roundNumber,
      teams: prep.teams,
      scores: scores.join(','),
      duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });
    renderScores(el.finalScores, -1);
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

  el.teamLess.addEventListener('click', function () { setTeams(prep.teams - 1); });
  el.teamMore.addEventListener('click', function () { setTeams(prep.teams + 1); });
  document.querySelectorAll('input[name="per"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prep.per = Number(input.value);
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
  // 換一題：只有開始傳之前可以（照比手畫腳），同一隊、不算一題
  el.skip.addEventListener('click', function () {
    skips += 1;
    track('charades_relay_skipped', { round_number: roundNumber, category: card[0] });
    nextCard();
    flip();
  });
  el.relayStart.addEventListener('click', startRelay);
  el.passNext.addEventListener('click', function () {
    pass += 1;
    renderPass();
    window.scrollTo(0, 0);
  });
  el.lastSeen.addEventListener('click', toGuess);
  // 偷看答案：主持人自己看、或給看戲的隊伍看一眼，再按一次蓋起來
  el.peek.addEventListener('click', function () {
    el.peekAnswer.hidden = !el.peekAnswer.hidden;
    el.peek.textContent = el.peekAnswer.hidden ? T.peekButton : T.hideButton;
  });
  el.reveal.addEventListener('click', showAnswer);
  el.gotRight.addEventListener('click', function () { judge(true); });
  el.gotWrong.addEventListener('click', function () { judge(false); });

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
