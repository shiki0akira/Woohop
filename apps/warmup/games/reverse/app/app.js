/*
 * 倒放猜猜看。手機做三件事：一步一步帶、抽題、錄音倒放（CONCEPT.md）。不計分，誰猜中大家自己喊。
 *
 * 一步一步帶（跟果園菜園動物園同一套，步驟頭、規則卡是全站共用的 window.Leader）：
 *   setup 開場（幾個人、玩幾題、怎麼猜）→ rules 說明規則 → play 開始 → end 玩完了
 * play 裡一題分四段（setPhase）：draw 抽題目 → reveal 翻開看 → record 蓋起來錄音 → guess 倒放、大家學、提示／答案、下一題。
 * 一次只露那一段要按的東西，「下一題」在最後一段、不黏底（使用者要求：怕誤觸）。
 * 另外有 rec「只有錄音機」：搶答時，猜的人掃 QR code 進來（網址帶 #rec），不走帶領步驟。
 * 返回鍵一律回第一頁；玩到一半先確認。
 *
 * 錄音只留在手機的記憶體裡，不上傳、不存檔（錄音機本體是共用的 Leader.recorder）。
 */
(function () {
  'use strict';

  var T = window.REVERSE.T;
  var BASE = window.REVERSE.base;
  var LANG = window.REVERSE.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var MAX_SEC = 15;
  // 抽題的題型比例（使用者定的）：造句 75%、哼歌 15%、自由發揮 10%
  var WEIGHTS = { sentence: 75, hum: 15, free: 10 };

  var COUNT_MIN = 2;
  var COUNT_MAX = 20;
  var RACE_MIN = 4; // 幾個人以上才給選「搶答」；人少固定輪流猜，一支手機傳（使用者要求）

  // 人數一變，每人幾題、怎麼猜就換回這個人數的預設（使用者定的）：
  // 3 人以下不限題數、輪流猜；4～5 人每人兩題、搶答；6 人以上每人一題、搶答
  function defaultsFor(n) {
    return { per: n <= 3 ? 'free' : n <= 5 ? 2 : 1, mode: n >= RACE_MIN ? 'each' : 'one' };
  }

  // 都不記上次選的（產品決定），預設值打開就能玩
  var screen = 'setup';
  var count = 6; // 幾個人
  var per = defaultsFor(count).per; // 每人出幾題：1、2 或 free 不限
  var mode = defaultsFor(count).mode; // one 輪流猜（一支手機傳）／each 搶答（各自用手機，QR code）
  var phase = 'draw';
  var roundNumber = 0;
  var card = null; // { kind, text, hint }

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end'), rec: $('view-rec') };
  var el = {
    start: $('start'),
    countLess: $('count-less'),
    countMore: $('count-more'),
    countValue: $('count-value'),
    roundsHint: $('rounds-hint'),
    modeField: $('mode-field'),
    modeHint: $('mode-hint'),
    setupQr: $('setup-qr'),
    recOnlyLink: $('rec-only-link'),
    recOnlyBack: $('rec-only-back'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    roundNo: $('round-no'),
    roundBar: $('round-bar'),
    roundProgress: $('round-progress'),
    card: $('card'),
    deck: $('deck'),
    cardDraw: $('card-draw'),
    drawn: $('drawn'),
    cardKind: $('card-kind'),
    cardText: $('card-text'),
    cardCover: $('card-cover'),
    cardShuffle: $('card-shuffle'),
    cardPeek: $('card-peek'),
    hintBtn: $('hint-btn'),
    cardHintText: $('card-hint-text'),
    stuckRow: $('stuck-row'),
    guessPlay: $('guess-play'),
    redo: $('redo'),
    stageOne: $('stage-one'),
    nextRound: $('next-round'),
    endEarly: $('end-early'),
    nextHint: $('next-hint'),
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

  // ---------- 聲音：錄音、倒放、播放 ----------
  // 錄音機是全站共用的 Leader.recorder（homepage/assets/game.js），桌遊助手的「錄音機」也是同一份
  var recorder = function (root, opts) {
    opts.maxSec = MAX_SEC;
    return Leader.recorder(root, opts);
  };
  var stopPlaying = Leader.stopPlaying;

  // 每台錄音機下面都是同一排：左邊小的「原聲」、右邊大的「倒放」。出題的原聲就是答案
  function playRow(rec, mineLabel, revLabel, onMine) {
    rec.plays.appendChild(rec.button('forward', 'btn-lg btn-secondary', 'i-play', mineLabel, onMine));
    rec.plays.appendChild(rec.button('backward', 'btn-lg btn-solid is-reverse', 'i-play', revLabel));
  }

  // 出題的錄音機只有錄音鍵；錄完直接進 guess。倒放鍵在「放給大家聽」，原聲就是「公布答案」（主要・粉彩，不跟倒放的實心鍵搶）
  var ask = recorder($('ask-rec'), {
    onRecorded: function (sec) {
      setPhase('guess');
      track('reverse_recorded', { round_number: roundNumber, stage: 'ask', seconds: Math.round(sec) });
    },
  });
  el.guessPlay.appendChild(ask.button('backward', 'btn-lg btn-solid btn-block is-reverse', 'i-play', T.askReverse));
  el.stuckRow.appendChild(ask.button('forward', 'btn-lg answer-btn', 'i-play', T.answerButton, function () {
    el.nextRound.disabled = false;
    el.nextHint.hidden = true;
    track('reverse_answer_revealed', { round_number: roundNumber, kind: card.kind });
  }));

  // 一支手機：傳給下一個人學
  var copy = recorder($('copy-rec'), {
    onRecorded: function (sec) { track('reverse_recorded', { round_number: roundNumber, stage: 'copy', seconds: Math.round(sec) }); },
  });
  playRow(copy, T.copyMine, T.copyReverse);

  // 只有錄音機（每人一支手機時猜的人用）
  var solo = recorder($('solo-rec'), {});
  playRow(solo, T.recOnlyMine, T.recOnlyReverse);

  // ---------- 抽題：翻牌，只給出題的人看（CONCEPT.md 2.2；樣子照抽卡取名） ----------

  /*
   * 一疊卡的插圖，跟抽卡取名（game.js 的 deckArt）同一張，最上面換成這個遊戲的粉紅、畫一個問號。
   * 最上面那張包在 .deck-top 裡，抽的時候只有它飛走（game.css 的 .deck.is-drawing）。
   */
  function deckArt() {
    var c = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#FFC628') + W.ring(22, 34, '#7489E6') + W.plus(142, 92, '#EE7B6A') + W.dot(20, 92, '#4FB59A') +
      c(36, 34, '#FFC628', -14) + c(70, 34, '#aebcf3', 12) +
      '<g class="deck-top">' + c(53, 28, '#F3A4FB', 0) +
      '<path d="M72 54q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drawing = false;

  function pick(list, not) {
    if (list.length < 2) return list[0];
    var next;
    do next = list[Math.floor(Math.random() * list.length)]; while (next === not);
    return next;
  }

  // 按比例抽題型；換一題時 exclude 是現在的題型，一定換成另一種（使用者要求）
  function drawCard(exclude) {
    var kinds = Object.keys(WEIGHTS).filter(function (k) { return k !== exclude; });
    var total = kinds.reduce(function (s, k) { return s + WEIGHTS[k]; }, 0);
    var r = Math.random() * total;
    var kind = kinds[kinds.length - 1];
    for (var i = 0; i < kinds.length; i += 1) {
      r -= WEIGHTS[kinds[i]];
      if (r < 0) { kind = kinds[i]; break; }
    }
    var item = pick(T.prompts[kind], card && card.kind === kind ? card.item : null);
    // 造句的提示就是那個詞；哼歌、自由發揮的提示是題型本身
    card = kind === 'sentence'
      ? { kind: kind, item: item, text: fill(T.sentenceTask, { word: item }), hint: fill(T.hintWord, { word: item }) }
      : { kind: kind, item: item, text: item, hint: T.kindNames[kind] };
    el.cardKind.textContent = T.kindNames[kind];
    el.cardText.textContent = card.text;
    el.cardHintText.textContent = fill(T.hintLine, { hint: card.hint });
  }

  /*
   * 一題的四段。畫面上哪些區塊出現由 CSS 看 #view-play 的 data-phase 決定（app.css 的 .phase-*），
   * 題卡自己的三面（draw／reveal／covered）跟著換。換段時照著念也跟著換，主持人照念就知道下一步。
   */
  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
    el.card.setAttribute('data-stage', next === 'record' || next === 'guess' ? 'covered' : next);
    if (next !== 'guess') el.cardHintText.hidden = true;
    el.stageOne.hidden = mode !== 'one';
    if (screen === 'play') {
      renderLead();
      // 換段後把這一段的開頭捲進畫面，下一件事不用自己往下滑找（使用者要求）
      if (next !== 'draw') views.play.querySelector('.lead-slot').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // 輪到誰：照人數繞圈數「第 n 個人」，每人兩題或不限題數就從頭再繞
  function who() {
    return fill(T.whoNext, { n: ((roundNumber - 1) % count) + 1 });
  }
  function playSay() {
    if (phase === 'draw') return fill(T.playSay.draw, { who: who() });
    if (phase === 'guess') return mode === 'each' ? T.playSay.guessEach : T.playSay.guessOne; // 第二題起藏起來（renderLead）
    return T.playSay[phase];
  }

  // 卡片從側面轉正（game.css 的 .drawn-card.pop），換一題也再翻一次
  function flip() {
    el.drawn.classList.remove('pop');
    void el.drawn.offsetWidth;
    el.drawn.classList.add('pop');
  }

  function drawFromDeck() {
    if (drawing) return;
    drawing = true;
    el.deck.classList.add('is-drawing');
    setTimeout(function () {
      drawing = false;
      el.deck.classList.remove('is-drawing');
      setPhase('reveal');
      flip();
    }, reduceMotion ? 0 : 380);
  }

  // ---------- 每人一支手機：QR code 連到「只有錄音機」 ----------

  function renderQr(box) {
    if (box.firstChild || typeof window.qrcode !== 'function') return;
    var qr = window.qrcode(0, 'M');
    qr.addData(location.origin + BASE + '/' + LANG + '/#rec');
    qr.make();
    box.innerHTML = W && W.qrSvg ? W.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  function renderLead() {
    if (STEPS.indexOf(screen) < 0) return;
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: screen === 'play' ? T.playTitle : T.lead[screen][0],
      say: screen === 'play' ? playSay() : T.lead[screen][1],
    });
    // 「放給大家聽」那段的照著念只在第一題出現（使用者要求）：說過一次大家就知道怎麼學
    Leader.hideSay(screen === 'play' && phase === 'guess' && roundNumber > 1);
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 偷看題目（說話泡泡）、學怪聲（倒過來的音符）、猜中（皇冠般的開心臉）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.dot(22, 40, '#7489E6', 4) +
        W.body('<circle cx="80" cy="80" r="32"/>', '#F3A4FB') + W.makeFace('grin', 80, 80, 1.4) + bubble(124, 42, '…');
    },
    function () {
      return W.ground + W.ring(22, 34, '#7489E6') + W.plus(140, 30, '#4FB59A') +
        W.body('<circle cx="80" cy="80" r="32"/>', '#FFC628') + W.makeFace('worry', 80, 80, 1.4) +
        bubble(34, 62, '♪') + bubble(126, 62, '?');
    },
    function () {
      return W.ground + W.burst(140, 24, '#FF9419') + W.burst(20, 40, '#F3A4FB') +
        W.body('<circle cx="80" cy="80" r="32"/>', '#4FB59A') + W.makeFace('grin', 80, 80, 1.4) + bubble(80, 28, '!');
    },
  ];

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' || next === 'rec' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;
    if (next !== 'play') { ask.reset(); copy.reset(); }
    if (next !== 'rec') solo.reset();
    renderLead();
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  // 每人 1／2 題：題數 = 人數 × 題數，有進度條；不限題數只顯示第幾題，多一顆「結束遊戲」
  var limited = function () { return per !== 'free'; };
  var totalRounds = function () { return count * per; };
  var isLast = function () { return limited() && roundNumber >= totalRounds(); };

  function newRound() {
    roundNumber += 1;
    stopPlaying();
    ask.reset();
    copy.reset();
    drawCard(null);
    el.roundNo.textContent = limited() ? fill(T.roundNo, { n: roundNumber, total: totalRounds() }) : fill(T.roundNoFree, { n: roundNumber });
    el.roundProgress.hidden = !limited();
    el.roundBar.style.setProperty('--p', limited() ? (roundNumber / totalRounds()) * 100 + '%' : '0%');
    el.nextRound.textContent = isLast() ? T.lastRound : T.nextRound;
    el.endEarly.hidden = limited();
    // 公布答案之後才能下一題（使用者要求：不然一下就按掉了）。不限題數的「結束遊戲」隨時能按
    el.nextRound.disabled = true;
    el.nextHint.hidden = false;
    setPhase('draw');
  }

  function endGame() {
    track('reverse_game_ended', { rounds: roundNumber, per: per, mode: mode });
    showScreen('end');
  }

  function startPlay() {
    roundNumber = 0;
    newRound();
    showScreen('play');
    track('reverse_game_started', { players: count, per: per, mode: mode });
  }

  // ---------- 返回鍵：一律回第一頁；這一題錄了音先確認 ----------

  function pushGameState() {
    history.pushState({ reverse: 'game' }, '');
  }

  function backToSetup() {
    stopPlaying();
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
    if (screen === 'play' && (phase !== 'draw' || roundNumber > 1)) {
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

  // 開場的人數、每人幾題、怎麼猜。人數一變就套回那個人數的預設（defaultsFor），主持人不用自己想
  function setCount(n) {
    count = Math.max(COUNT_MIN, Math.min(COUNT_MAX, n));
    var d = defaultsFor(count);
    per = d.per;
    mode = d.mode;
    syncSetup();
  }
  function syncSetup() {
    el.countValue.textContent = count;
    el.countLess.disabled = count <= COUNT_MIN;
    el.countMore.disabled = count >= COUNT_MAX;
    document.querySelector('input[name=per][value="' + per + '"]').checked = true;
    document.querySelector('input[name=mode][value="' + mode + '"]').checked = true;
    el.roundsHint.textContent = limited() ? fill(T.roundsHint, { total: totalRounds() }) : T.roundsFreeHint;
    el.modeField.hidden = count < RACE_MIN;
    el.modeHint.textContent = mode === 'one' ? T.modeOneHint : T.modeEachHint;
    el.setupQr.hidden = mode !== 'each';
    if (mode === 'each') renderQr(el.setupQr);
  }

  el.countLess.addEventListener('click', function () { setCount(count - 1); });
  el.countMore.addEventListener('click', function () { setCount(count + 1); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name=per]'), function (input) {
    input.addEventListener('change', function () { per = input.value === 'free' ? 'free' : Number(input.value); syncSetup(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[name=mode]'), function (input) {
    input.addEventListener('change', function () { mode = input.value; syncSetup(); });
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);

  el.recOnlyLink.addEventListener('click', function (event) {
    event.preventDefault();
    pushGameState();
    showScreen('rec');
  });
  el.recOnlyBack.addEventListener('click', function (event) {
    event.preventDefault();
    goBack(false);
  });

  el.cardDraw.addEventListener('click', drawFromDeck);
  // 「蓋起來」：只蓋上題卡，錄音讓玩家自己按「開始錄音」（錄到一半偷看再蓋回來，錄音照樣繼續）
  el.cardCover.addEventListener('click', function () { setPhase('record'); });
  // 再偷看一次：翻回去看，按「蓋起來」回到錄音
  el.cardPeek.addEventListener('click', function () { setPhase('reveal'); flip(); });
  el.cardShuffle.addEventListener('click', function () {
    drawCard(card.kind);
    flip();
    track('reverse_card_shuffled', { round_number: roundNumber, kind: card.kind });
  });
  el.redo.addEventListener('click', function () {
    stopPlaying();
    copy.reset();
    el.nextRound.disabled = true;
    el.nextHint.hidden = false;
    setPhase('record');
  });
  el.hintBtn.addEventListener('click', function () {
    el.cardHintText.hidden = false;
    track('reverse_hint_shown', { round_number: roundNumber, kind: card.kind });
  });
  el.nextRound.addEventListener('click', function () {
    if (isLast()) return endGame();
    newRound();
    window.scrollTo(0, 0);
  });
  el.endEarly.addEventListener('click', endGame);
  el.again.addEventListener('click', startPlay);

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  el.deck.innerHTML = deckArt();
  syncSetup();
  if (location.hash === '#rec') {
    // 掃 QR code 進來的猜的人：直接開錄音機。拿掉 #rec，返回鍵回開場時網址才不會再帶著它
    history.replaceState(null, '', location.pathname + location.search);
    pushGameState();
    showScreen('rec');
  } else {
    showScreen('setup');
  }
})();
