/*
 * 木頭人動作版。手機不當裁判（誰被抓由鬼判斷，CONCEPT.md 第二節），只做三件事：一步一步帶、抽動作卡、遊戲結束時選動作給鬼做。
 *
 * 一步一步帶（跟果園菜園動物園同一套，步驟頭、規則卡都是全站共用的 window.Leader）：
 *   setup 開場 → rules 說明規則 → play（draw 抽 → drawn 傳下去 ⋯⋯ → go 這一局開始 → 下一局回 draw）→ end 遊戲結束（選動作給鬼做、三連拍）→ 再玩一次回 play
 * 返回鍵一律回第一頁；已經開始抽了就先確認。
 */
(function () {
  'use strict';

  var T = window.STATUE.T;
  var BASE = window.STATUE.base;
  var LANG = window.STATUE.lang;
  var W = window.Woohop;
  var Leader = window.Leader;
  var ACTIONS = window.STATUE.actions; // [插圖代號, 名稱]（apps/homepage/src/action-cards.mjs）

  var screen = 'setup';
  var phase = 'draw';
  var roundNumber = 0; // 第幾局（有人摸到鬼、重新抽動作就是新的一局）
  var gameNumber = 0; // 第幾場（再玩一次）
  var startedAt = 0;
  var deck = []; // 這一局還沒抽的動作（洗好的），同一局不會抽到一樣的
  var drawnCount = 0;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    card: $('card'),
    deck: $('deck'),
    draw: $('card-draw'),
    drawn: $('drawn'),
    cardText: $('card-text'),
    cardArt: $('card-art'),
    pass: $('card-pass'),
    drawCount: $('draw-count'),
    allDrawn: $('all-drawn'),
    nextRound: $('next-round'),
    endBtn: $('end-btn'),
    punishRoot: $('punish-root'),
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

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  // 抽動作那幾段手機在大家手上傳，不放步驟頭；go 手機回到主持人手上才放（apps/warmup/CLAUDE.md）
  function renderLead() {
    var key = screen === 'play' ? 'go' : screen;
    if (screen === 'play' && phase !== 'go') return;
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[key][0],
      say: T.lead[key][1],
    });
  }

  // ---------- 抽動作卡（樣子照抽卡取名，用 game.css 的 .namer） ----------

  /*
   * 一疊卡的插圖，跟抽卡取名（game.js 的 deckArt）同一張，最上面換成這個遊戲的黃色、畫一個驚嘆號。
   * 最上面那張包在 .deck-top 裡，抽的時候只有它飛走（game.css 的 .deck.is-drawing）。
   */
  function deckArt() {
    var c = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#EE7B6A') + W.ring(22, 34, '#7489E6') + W.plus(142, 92, '#4FB59A') + W.dot(20, 92, '#F3A4FB') +
      c(36, 34, '#aebcf3', -14) + c(70, 34, '#F3A4FB', 12) +
      '<g class="deck-top">' + c(53, 28, '#FFC628', 0) +
      '<path d="M80 44v24" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  }
  // 動作卡的插圖：全站共用的 Leader.actionArt（woohop-art.js 的 Woohop.actionArt），每抽一張隨機換小人的顏色
  var actionArt = Leader.actionArt;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drawing = false;

  function shuffleDeck() {
    deck = ACTIONS.slice();
    for (var i = deck.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
  }

  // 卡片從側面轉正（game.css 的 .drawn-card.pop）
  function flip(card) {
    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');
  }

  /*
   * 一局的三段。畫面上哪些區塊出現由 CSS 看 #view-play 的 data-phase 決定（app.css 的 .phase-*），
   * 動作卡自己的兩面（draw／reveal）跟著換。
   */
  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.card.setAttribute('data-stage', next === 'drawn' ? 'reveal' : 'draw');
    el.allDrawn.disabled = drawnCount === 0;
    el.drawCount.hidden = drawnCount === 0 || next === 'go';
    el.drawCount.textContent = fill(T.drawCount, { n: drawnCount });
    renderLead();
  }

  // 下一局（CONCEPT.md 2.2）：摸到鬼的人當新的鬼、原本的鬼回去一起玩，大家重新抽
  function newRound() {
    roundNumber += 1;
    drawnCount = 0;
    shuffleDeck();
    setPhase('draw');
  }

  function drawFromDeck() {
    if (drawing) return;
    drawing = true;
    if (!deck.length) shuffleDeck(); // 人比動作多：整副抽完再洗一次
    var action = deck.pop(); // [插圖代號, 名稱]
    drawnCount += 1;
    el.cardText.textContent = action[1];
    el.cardArt.innerHTML = actionArt(action[0]);
    el.deck.classList.add('is-drawing');
    setTimeout(function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      setPhase('drawn');
      flip(el.drawn);
    }, reduceMotion ? 0 : 380);
    track('statue_action_drawn', { round_number: roundNumber, action: action[0], count: drawnCount });
  }

  function startRound() {
    setPhase('go');
    window.scrollTo(0, 0);
    track('statue_round_started', { round_number: roundNumber, players: drawnCount });
  }

  // ---------- 遊戲結束：摸到鬼的人隨機抽一個動作讓鬼做，大家幫鬼三連拍（CONCEPT.md 2.3，不用拉霸、不列出全部） ----------

  // 動作卡＋隨機抽一個：全站共用的 Leader.actionCard（桌遊助手的動作抽卡也是這一個），不列出全部動作（使用者要求）
  var punish = Leader.actionCard(el.punishRoot, {
    actions: ACTIONS,
    onDraw: function (action) { track('statue_punish_drawn', { action: action[0] }); },
  });

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 抽一張（那疊卡）、用動作往前走（開心臉＋往前的箭頭）、動了就被抓（緊張臉＋驚嘆號）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    deckArt,
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 34, '#7489E6') +
        W.body('<circle cx="72" cy="80" r="32"/>', '#FFC628') + W.makeFace('grin', 72, 80, 1.4) +
        '<path d="M116 72h24m-8-8 8 8-8 8" fill="none" ' + W.K + '/>' + bubble(36, 40, '♪');
    },
    function () {
      return W.ground + W.plus(140, 34, '#4FB59A') + W.dot(22, 40, '#FFC628', 4) +
        W.body('<circle cx="80" cy="80" r="32"/>', '#EE7B6A') + W.makeFace('worry', 80, 80, 1.4) + bubble(122, 40, '!');
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
    if (next === 'end') punish.reset();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    gameNumber += 1;
    roundNumber = 0;
    startedAt = Date.now();
    showScreen('play');
    newRound();
    track('statue_game_started', { game_number: gameNumber });
  }

  // ---------- 返回鍵：一律回第一頁；已經開始抽了先確認 ----------

  function pushGameState() {
    history.pushState({ statue: 'game' }, '');
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
    if (screen === 'play' && (drawnCount > 0 || roundNumber > 1)) {
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
    track('statue_game_ended', {
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

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.draw.addEventListener('click', drawFromDeck);
  el.pass.addEventListener('click', function () { setPhase('draw'); });
  el.allDrawn.addEventListener('click', startRound);
  el.nextRound.addEventListener('click', function () {
    newRound();
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

  el.deck.innerHTML = deckArt();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
