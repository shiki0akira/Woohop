/*
 * 我從來沒有。手指是大家自己折的、手機不記分（CONCEPT.md），手機只做四件事：
 * 一步一步帶、每一輪抽主題＋給例句、讓主持人按「下一輪」、輸的人拉真心話大冒險拉霸。
 *
 * 一步一步帶（跟果園菜園動物園同一套，步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場（選玩法）→ rules 說明規則 → play 開始（主題卡、下一輪）→ end 誰輸了（拉霸）→ 再玩一次回 play
 * 返回鍵一律回第一頁；開始玩之後先確認。
 */
(function () {
  'use strict';

  var T = window.NEVER.T;
  var BASE = window.NEVER.base;
  var LANG = window.NEVER.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  // 玩法：never 我從來沒有（預設）／did 我做過。每次進來都是預設值（不記上次玩過的，全站規則）
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
    var text = leadTexts()[screen];
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

  // ---------- 拉霸（Leader.slot） ----------
  // 這個遊戲沒有配樂、沒有聲音開關（講話的遊戲），拉霸照常出聲

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.NEVER.slot.prompts,
        actions: window.NEVER.slot.actions,
        onPull: function (info) {
          track('never_slot_pulled', { round_number: roundNumber, kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
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
