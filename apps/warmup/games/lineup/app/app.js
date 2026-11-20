/*
 * 數字默契排排站。每人一支手機、不開房間（老闆 11/19～20 定的）：
 *   主持人：setup 幾個人 → rules 說明 → deal 一次出一個 QR code，大家輪流掃 → play 抽主題，大家形容、排隊
 *           → reveal 從小到大一張一張翻（第 k 位：數字）→ 下一輪回 play
 *   玩家：掃 QR code 進來（#j=種子＋第幾位）→ you 按住看自己的數字 → 主持人說下一輪就按「下一輪」
 *
 * **不用伺服器也不會重複**：數字由「種子＋第幾輪」用同一個亂數算出一串不重複的 1～100，第幾位就拿第幾個。
 * 主持人的手機算的是同一串，所以公布時只要把那一串從小排到大（老闆：不用大家把手機翻開解鎖，看主持人手機就好）。
 * 主題只在主持人手機上（主持人念），所以換主題不會跟玩家對不上。
 */
(function () {
  'use strict';

  var T = window.LINEUP.T;
  var BASE = window.LINEUP.base;
  var LANG = window.LINEUP.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var PLAYERS_MIN = 2;
  var PLAYERS_MAX = 10; // 第幾位只用一個字元（0～9）帶在網址裡
  var NUM_MAX = 100;

  var screen = 'setup';
  var players = 5;
  var seed = '';
  var round = 1;
  var dealIndex = 0;
  var topicIndex = -1;
  var topicDeck = [];
  var flipped = 0;
  var gameNumber = 0;
  var me = null; // 玩家：{ seed, seat }
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = {
    setup: $('view-setup'), rules: $('view-rules'), deal: $('view-deal'), play: $('view-play'),
    reveal: $('view-reveal'), you: $('view-you'),
  };
  var el = {
    playersLess: $('players-less'),
    playersMore: $('players-more'),
    playersValue: $('players-value'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    dealTitle: $('deal-title'),
    qrBox: $('qr-box'),
    dealNext: $('deal-next'),
    roundTag: $('round-tag'),
    topicName: $('topic-name'),
    scaleLo: $('scale-lo'),
    scaleHi: $('scale-hi'),
    topicShuffle: $('topic-shuffle'),
    reveal: $('reveal'),
    lineup: $('lineup'),
    revealDone: $('reveal-done'),
    flip: $('flip'),
    nextRound: $('next-round'),
    youRound: $('you-round'),
    youCard: $('you-card'),
    youNumber: $('you-number'),
    youNext: $('you-next'),
    youWrong: $('you-wrong'),
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

  // ---------- 數字：種子＋第幾輪 → 一串不重複的 1～100（每支手機算的一樣） ----------

  // FNV-1a 把字串變成 32 位元整數，再餵給 mulberry32（Math.random 不能給種子）
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }
  function rng(s) {
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 第 0～count-1 位的數字（不重複）
  function numbersFor(s, r, count) {
    var next = rng(hash(s + ':' + r));
    var out = [];
    while (out.length < count) {
      var n = 1 + Math.floor(next() * NUM_MAX);
      if (out.indexOf(n) < 0) out.push(n);
    }
    return out;
  }

  // 種子：3 個英文字母（拿掉 I、L、O 這種會看錯的），每次發數字產生一個新的
  var SEED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  var JOIN_RE = /^#j=([A-HJKMNP-Z]{3})([0-9])$/;
  function newSeed() {
    var out = '';
    for (var i = 0; i < 3; i += 1) out += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
    return out;
  }

  // ---------- 開場 ----------

  function syncPlayers() {
    el.playersValue.textContent = fill(T.playersUnit, { n: players });
    el.playersLess.disabled = players <= PLAYERS_MIN;
    el.playersMore.disabled = players >= PLAYERS_MAX;
  }

  // ---------- 發數字：一次一個 QR code ----------

  function renderDeal() {
    el.dealTitle.textContent = fill(T.dealTitle, { k: dealIndex + 1, n: players });
    el.dealNext.textContent = dealIndex + 1 >= players ? T.dealDone : T.dealNext;
    if (typeof window.qrcode !== 'function') return;
    var qr = window.qrcode(0, 'M');
    qr.addData(location.origin + BASE + '/' + LANG + '/#j=' + seed + dealIndex);
    qr.make();
    el.qrBox.innerHTML = W && W.qrSvg ? W.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  // ---------- 主題 ----------

  function drawTopic() {
    if (!topicDeck.length) {
      topicDeck = T.topics.map(function (_, i) { return i; });
      for (var i = topicDeck.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = topicDeck[i]; topicDeck[i] = topicDeck[j]; topicDeck[j] = tmp;
      }
      if (topicDeck.length > 1 && topicDeck[topicDeck.length - 1] === topicIndex) topicDeck.unshift(topicDeck.pop());
    }
    return topicDeck.pop();
  }
  function setTopic(index) {
    topicIndex = index;
    var t = T.topics[index];
    el.topicName.textContent = t[0];
    el.scaleLo.textContent = t[1];
    el.scaleHi.textContent = t[2];
    el.roundTag.textContent = fill(T.roundLabel, { n: round });
    if (screen === 'play') renderLead();
  }

  // ---------- 公布：從小到大，一張一張翻 ----------

  function renderLineup() {
    var sorted = numbersFor(seed, round, players).slice().sort(function (a, b) { return a - b; });
    el.lineup.textContent = '';
    sorted.forEach(function (n, i) {
      var li = document.createElement('li');
      var place = document.createElement('span');
      place.className = 'place';
      place.textContent = fill(T.revealPlace, { k: i + 1 });
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = '?';
      num.dataset.n = n;
      li.appendChild(place);
      li.appendChild(num);
      el.lineup.appendChild(li);
    });
    flipped = 0;
    el.flip.hidden = false;
    el.nextRound.hidden = true;
    el.revealDone.hidden = true;
  }
  function flipNext() {
    var li = el.lineup.children[flipped];
    if (!li) return;
    var num = li.querySelector('.num');
    num.textContent = num.dataset.n;
    li.classList.add('is-flipped');
    flipped += 1;
    if (flipped >= players) {
      el.flip.hidden = true;
      el.nextRound.hidden = false;
      el.revealDone.hidden = false;
      track('lineup_revealed', { round_number: round, players: players, topic: T.topics[topicIndex][0] });
    }
  }

  // ---------- 玩家：按住看數字 ----------

  // 玩家不小心重新整理也不會丟掉數字：第幾位、第幾輪記在這個分頁的 sessionStorage（關掉分頁就沒了）
  var ME_KEY = 'woohop-lineup-me';
  function saveMe() {
    try {
      sessionStorage.setItem(ME_KEY, JSON.stringify({ seed: me.seed, seat: me.seat, round: round }));
    } catch (e) {
      /* 無痕模式：照樣能玩，只是重新整理會回到開場 */
    }
  }
  function renderYou() {
    saveMe();
    el.youRound.textContent = fill(T.youRound, { n: round });
    el.youNumber.textContent = numbersFor(me.seed, round, me.seat + 1)[me.seat];
    el.youCard.classList.remove('is-open');
  }
  function setOpen(open) {
    el.youCard.classList.toggle('is-open', open);
  }

  // ---------- 帶領的步驟頭（Leader.lead）：玩家的畫面不放 ----------

  var STEPS = ['setup', 'rules', 'deal', 'play', 'reveal'];
  function renderLead() {
    var line = T.lead[screen];
    if (!line) return;
    var say = line[1];
    if (screen === 'play') {
      var t = T.topics[topicIndex];
      say = fill(say, { topic: t[0], lo: t[1], hi: t[2] });
      if (round > 1) say = T.lead.next[1] + ' ' + say; // 第二輪起：先請大家在自己手機按下一輪
    }
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: Math.min(STEPS.indexOf(screen), 3),
      total: 4,
      title: line[0],
      say: say,
    });
  }

  /*
   * 「說明規則」三張插圖卡（woohop-art.js 的畫法）：一支手機上一個問號、一個說話泡泡、三張從小到大的數字卡
   */
  var tile = function (x, y, text, color) {
    return W.body('<rect x="' + (x - 20) + '" y="' + (y - 24) + '" width="40" height="48" rx="9"/>', color, '', false) +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="17" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text>';
  };
  var RULE_ART = [
    function () {
      return W.ground + W.burst(140, 26, '#FFC628') + W.ring(22, 34, '#EE7B6A') + W.dot(146, 100, '#F3A4FB', 4) +
        W.body('<rect x="56" y="22" width="48" height="92" rx="10"/>', '#a8dccb', '<path d="M88 14h30v110H88z" fill="#7fc9b1"/>') +
        W.body('<rect x="62" y="34" width="36" height="62" rx="5"/>', '#ffffff', '', false) +
        '<text x="80" y="66" text-anchor="middle" dominant-baseline="middle" font-size="30" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">?</text>';
    },
    function () {
      return W.ground + W.plus(18, 30, '#7489E6') + W.dot(146, 96, '#FFC628', 4) +
        W.body('<circle cx="52" cy="86" r="28"/>', '#FFC628') + W.makeFace('grin', 52, 86, 1.2) +
        W.body('<rect x="86" y="22" width="62" height="40" rx="12"/>', '#ffffff', '', false) +
        '<path d="M96 60l-8 12 18-10" fill="#fff" ' + W.K + '/>' +
        '<path d="M100 42h34M100 50h22" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round"/>';
    },
    function () {
      return W.ground + W.burst(146, 24, '#FFC628') + W.ring(18, 30, '#7489E6') +
        tile(36, 82, '12', '#fbb3a8') + tile(80, 82, '37', '#a8dccb') + tile(124, 82, '81', '#aebcf3') +
        '<path d="M52 44h56m-6-5 6 5-6 5" fill="none" stroke="#22222c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    },
  ];

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
  var keepAwake = function () { return screen === 'deal' || screen === 'play' || screen === 'reveal' || screen === 'you'; };
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && keepAwake()) {
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
    if (keepAwake()) requestWakeLock();
    else releaseWakeLock();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startDeal() {
    gameNumber += 1;
    seed = newSeed();
    round = 1;
    dealIndex = 0;
    topicDeck = [];
    topicIndex = -1;
    renderDeal();
    showScreen('deal');
    track('lineup_game_started', { game_number: gameNumber, players: players });
  }
  function startRound() {
    setTopic(drawTopic());
    showScreen('play');
  }

  // 掃 QR code 進來的人：直接進自己的數字（不走帶領步驟，照秒數挑戰的 #c=）
  function enterAsPlayer(hashStr) {
    var m = JOIN_RE.exec(hashStr);
    if (!m) return false;
    me = { seed: m[1], seat: Number(m[2]) };
    round = 1;
    renderYou();
    showScreen('you');
    track('lineup_joined', { seat: me.seat + 1 });
    return true;
  }

  // ---------- 返回鍵：開場、說明直接退；發數字以後先確認 ----------

  function pushGameState() {
    history.pushState({ lineup: 'game' }, '');
  }
  function backToSetup() {
    me = null;
    try {
      sessionStorage.removeItem(ME_KEY);
    } catch (e) {
      /* 同上 */
    }
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
    if (screen !== 'rules') {
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

  el.playersLess.addEventListener('click', function () { players = Math.max(PLAYERS_MIN, players - 1); syncPlayers(); });
  el.playersMore.addEventListener('click', function () { players = Math.min(PLAYERS_MAX, players + 1); syncPlayers(); });
  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startDeal);
  el.dealNext.addEventListener('click', function () {
    if (dealIndex + 1 >= players) {
      startRound();
      return;
    }
    dealIndex += 1;
    renderDeal();
    window.scrollTo(0, 0);
  });
  el.topicShuffle.addEventListener('click', function () {
    setTopic(drawTopic());
    track('lineup_topic_changed', { round_number: round, topic: T.topics[topicIndex][0] });
  });
  el.reveal.addEventListener('click', function () {
    renderLineup();
    showScreen('reveal');
  });
  el.flip.addEventListener('click', flipNext);
  el.nextRound.addEventListener('click', function () {
    round += 1;
    startRound();
  });

  // 玩家：按住看、放開蓋起來；鍵盤（沒有按住可言）就是按一下切換
  el.youCard.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    e.preventDefault();
    setOpen(true);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.youCard.addEventListener(type, function () { setOpen(false); });
  });
  el.youCard.addEventListener('click', function (e) {
    if (e.detail === 0) setOpen(!el.youCard.classList.contains('is-open'));
  });
  el.youCard.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.youNext.addEventListener('click', function () {
    round += 1;
    renderYou();
    track('lineup_player_next', { round_number: round });
  });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  syncPlayers();
  /*
   * 掃 QR code 進來（網址 #j=種子＋第幾位）：先放一個開場的歷史紀錄再進來，返回鍵就會先問；
   * 網址上的 # 拿掉，重新整理才不會一直帶著。看不懂的連結顯示提示
   */
  var joinHash = location.hash;
  var saved = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(ME_KEY) || 'null');
  } catch (e) {
    saved = null;
  }
  showScreen('setup');
  if (!/^#j=/.test(joinHash) && saved && JOIN_RE.test('#j=' + saved.seed + saved.seat)) {
    // 重新整理：回到自己的數字、同一輪
    pushGameState();
    me = { seed: saved.seed, seat: saved.seat };
    round = Number(saved.round) || 1;
    renderYou();
    showScreen('you');
  } else if (/^#j=/.test(joinHash)) {
    history.replaceState(null, '', location.pathname + location.search);
    pushGameState();
    if (!enterAsPlayer(joinHash)) {
      showScreen('you');
      el.youCard.hidden = true;
      el.youNext.hidden = true;
      el.youWrong.hidden = false;
    }
  }
})();
