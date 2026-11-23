/*
 * 誰是臥底（第 22 個，老闆 11/23 定的規則，照他用過的 app）：
 *   - 開場設人數和暱稱；一支手機傳下去，畫面寫暱稱，輪到的人才按住看詞
 *   - 大部分人拿到同一個詞，臥底拿到相近但不一樣的詞；**沒有人知道自己是不是臥底**（白板會知道自己沒有詞）
 *   - 每人一句話描述、大家投票，主持人在手機上點被投出去的暱稱，揭曉他是平民、臥底還是白板
 *   - 臥底＋白板全部出局平民贏；臥底＋白板的人數撐到跟平民一樣多，臥底贏。輸的一方拉真心話大冒險拉霸
 *
 * 一步一步帶（步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場 → rules 說明規則 → deal 傳手機看詞（不放步驟頭）→ play 描述和投票 → end 結果＋拉霸
 *   忘了詞的人在 play 點自己的名字，會回到 deal 再看一次（forgot 模式）
 * 返回鍵：開場直接離開；說明規則回開場；看詞、投票先確認；結果直接回開場。
 */
(function () {
  'use strict';

  var T = window.UNDERCOVER.T;
  var BASE = window.UNDERCOVER.base;
  var LANG = window.UNDERCOVER.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var PLAYERS = { min: 4, max: 20, def: 6 };
  // 臥底人數照人數預設：4～6 人 1 個、7～10 人 2 個、11 人以上 3 個
  function spiesFor(n) {
    return n <= 6 ? 1 : n <= 10 ? 2 : 3;
  }
  // 臥底＋白板一定要比平民少，不然一開始就分出勝負了
  function maxSpies(n, blank) {
    return Math.max(1, Math.floor((n - 1) / 2) - (blank ? 1 : 0));
  }
  var BLANK_MIN_PLAYERS = 5;

  // 每次進來都是預設值（不記上次玩過的，全站規則）；暱稱只留在這一次的頁面裡
  // cats：每一類有沒有勾（預設全勾，至少留一類）
  var setup = { players: PLAYERS.def, names: [], spies: spiesFor(PLAYERS.def), spiesTouched: false, blank: false, cats: T.pairCats.map(function () { return 1; }) };
  var game = null; // { players: [{ name, role, word, out }], civilianWord, spyWord, round, first, dealIndex, winner }
  var screen = 'setup';
  var gameNumber = 0;
  var startedAt = 0;
  var wakeLock = null;
  var pairDeck = []; // 這一次還沒抽過的詞對：全部輪完才重複
  var forgotIndex = -1; // 忘了詞、回來再看的那個人（-1 = 正常看詞）
  var peeked = false; // 這個人看過了沒

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), deal: $('view-deal'), play: $('view-play'), end: $('view-end') };
  var el = {
    playersValue: $('players-value'),
    playersLess: $('players-less'),
    playersMore: $('players-more'),
    nameList: $('name-list'),
    advToggle: $('adv-toggle'),
    advPanel: $('adv-panel'),
    spiesValue: $('spies-value'),
    spiesLess: $('spies-less'),
    spiesMore: $('spies-more'),
    blankInput: $('blank-input'),
    blankLabel: $('blank-label'),
    setupHint: $('setup-hint'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    dealProgress: $('deal-progress'),
    dealName: $('deal-name'),
    dealHint: $('deal-hint'),
    wordCard: $('word-card'),
    wordText: $('word-text'),
    wordSub: $('word-sub'),
    dealNext: $('deal-next'),
    votePanel: document.querySelector('.vote-panel'),
    roundTag: $('round-tag'),
    voteGrid: $('vote-grid'),
    forgotToggle: $('forgot-toggle'),
    forgotHint: $('forgot-hint'),
    revealPanel: $('reveal-panel'),
    revealArt: $('reveal-art'),
    revealTitle: $('reveal-title'),
    revealHint: $('reveal-hint'),
    revealNext: $('reveal-next'),
    civilianWord: $('civilian-word'),
    spyWord: $('spy-word'),
    roleList: $('role-list'),
    winBanner: $('win-banner'),
    winIcon: $('win-icon'),
    winTitle: $('win-title'),
    catChips: $('cat-chips'),
    again: $('again'),
    changePlayers: $('change-players'),
    voteModal: $('vote-modal'),
    voteTitle: $('vote-title'),
    voteCancel: $('vote-cancel'),
    voteOk: $('vote-ok'),
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
  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }
  function nameOf(i) {
    var raw = (setup.names[i] || '').trim();
    return raw || fill(T.namePlaceholder, { n: i + 1 });
  }

  // ---------- 開場：人數、暱稱、臥底幾個、白板 ----------

  function clampSetup() {
    if (setup.players < BLANK_MIN_PLAYERS) setup.blank = false;
    if (!setup.spiesTouched) setup.spies = spiesFor(setup.players);
    setup.spies = Math.max(1, Math.min(maxSpies(setup.players, setup.blank), setup.spies));
  }
  // 暱稱欄位跟著人數增減；已經打的字留著（減人數再加回來也還在）
  function renderNames() {
    var n = setup.players;
    while (el.nameList.children.length < n) {
      var i = el.nameList.children.length;
      var li = document.createElement('li');
      var input = document.createElement('input');
      input.className = 'input';
      input.type = 'text';
      input.maxLength = 12;
      input.autocomplete = 'off';
      input.placeholder = fill(T.namePlaceholder, { n: i + 1 });
      input.value = setup.names[i] || '';
      input.setAttribute('aria-label', fill(T.namePlaceholder, { n: i + 1 }));
      input.addEventListener('input', (function (k) {
        return function (e) { setup.names[k] = e.target.value; };
      })(i));
      // Enter 跳到下一格，最後一格收起鍵盤
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var next = e.target.parentNode.nextElementSibling;
        if (next) next.querySelector('input').focus();
        else e.target.blur();
      });
      li.appendChild(input);
      el.nameList.appendChild(li);
    }
    while (el.nameList.children.length > n) el.nameList.removeChild(el.nameList.lastChild);
  }
  // 題目類型：一類一顆 chip，只建一次、之後就地更新 aria-pressed；最後一顆不能取消
  function renderCats() {
    if (!el.catChips.children.length) {
      T.pairCats.forEach(function (cat, c) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = cat[0];
        chip.addEventListener('click', function () {
          var on = setup.cats.filter(Boolean).length;
          if (setup.cats[c] && on <= 1) return;
          setup.cats[c] = setup.cats[c] ? 0 : 1;
          renderCats();
        });
        el.catChips.appendChild(chip);
      });
    }
    Array.prototype.forEach.call(el.catChips.children, function (chip, c) {
      chip.setAttribute('aria-pressed', String(Boolean(setup.cats[c])));
    });
  }
  function renderSetup() {
    clampSetup();
    el.playersValue.textContent = setup.players;
    el.spiesValue.textContent = setup.spies;
    el.playersLess.disabled = setup.players <= PLAYERS.min;
    el.playersMore.disabled = setup.players >= PLAYERS.max;
    el.spiesLess.disabled = setup.spies <= 1;
    el.spiesMore.disabled = setup.spies >= maxSpies(setup.players, setup.blank);
    var canBlank = setup.players >= BLANK_MIN_PLAYERS;
    el.blankInput.disabled = !canBlank;
    el.blankInput.checked = setup.blank;
    el.blankLabel.parentNode.classList.toggle('is-disabled', !canBlank);
    el.blankLabel.textContent = canBlank ? T.blankLabel : T.blankNeedsMore;
    el.setupHint.textContent = fill(setup.blank ? T.setupHintBlank : T.setupHint, { n: setup.players, spies: setup.spies });
    renderCats();
    renderNames();
  }

  // ---------- 發詞 ----------

  // 只從勾選的類型抽；類型改了就重洗（deckKey 記住是用哪幾類洗的）
  var deckKey = '';
  function drawPair() {
    var key = setup.cats.join('');
    if (!pairDeck.length || key !== deckKey) {
      deckKey = key;
      pairDeck = [];
      T.pairCats.forEach(function (cat, c) {
        if (!setup.cats[c]) return;
        cat[1].forEach(function (_, k) { pairDeck.push([c, k]); });
      });
      shuffle(pairDeck);
    }
    var at = pairDeck.pop();
    var pair = T.pairCats[at[0]][1][at[1]].slice();
    // 哪一個是臥底的詞每局隨機
    return Math.random() < 0.5 ? pair : [pair[1], pair[0]];
  }

  function newGame() {
    var n = setup.players;
    var pair = drawPair();
    var roles = [];
    for (var i = 0; i < n; i += 1) roles.push(i < setup.spies ? 'spy' : setup.blank && i === setup.spies ? 'blank' : 'civilian');
    shuffle(roles);
    game = {
      civilianWord: pair[0],
      spyWord: pair[1],
      players: roles.map(function (role, k) {
        return { name: nameOf(k), role: role, word: role === 'civilian' ? pair[0] : role === 'spy' ? pair[1] : '', out: false };
      }),
      round: 1,
      first: 0,
      dealIndex: 0,
      winner: '',
    };
  }

  // ---------- 傳手機看詞 ----------

  function dealIndex() {
    return forgotIndex >= 0 ? forgotIndex : game.dealIndex;
  }
  function renderDeal() {
    var i = dealIndex();
    var p = game.players[i];
    peeked = false;
    closeWord();
    el.dealProgress.textContent = forgotIndex >= 0 ? '' : fill(T.dealProgress, { n: i + 1, total: game.players.length });
    el.dealProgress.hidden = forgotIndex >= 0;
    el.dealName.textContent = fill(T.dealTurn, { name: p.name });
    el.dealHint.textContent = fill(T.dealHint, { name: p.name });
    el.wordText.textContent = p.role === 'blank' ? T.blankWord : p.word;
    el.wordSub.textContent = p.role === 'blank' ? T.blankHint : '';
    renderDealNext();
  }
  function renderDealNext() {
    var last = forgotIndex >= 0 || game.dealIndex >= game.players.length - 1;
    el.dealNext.textContent = !peeked ? T.peekFirst : forgotIndex >= 0 ? T.forgotDone : last ? T.passDone : fill(T.passNext, { name: game.players[game.dealIndex + 1].name });
    el.dealNext.disabled = !peeked;
  }
  function openWord() {
    el.wordCard.classList.add('is-open');
    if (!peeked) {
      peeked = true;
      renderDealNext();
    }
  }
  function closeWord() {
    el.wordCard.classList.remove('is-open');
  }
  function dealNext() {
    if (!peeked) return;
    if (forgotIndex >= 0) {
      forgotIndex = -1;
      showScreen('play');
      return;
    }
    if (game.dealIndex < game.players.length - 1) {
      game.dealIndex += 1;
      renderDeal();
      window.scrollTo(0, 0);
      return;
    }
    startRound();
  }

  // ---------- 描述和投票 ----------

  function alive() {
    return game.players.filter(function (p) { return !p.out; });
  }
  function startRound() {
    // 這一輪第一個說的人：還在場上的人裡隨機挑
    var list = alive();
    game.first = game.players.indexOf(list[Math.floor(Math.random() * list.length)]);
    showScreen('play');
  }
  var roleLabel = function (r) { return r === 'spy' ? T.roleSpy : r === 'blank' ? T.roleBlank : T.roleCivilian; };
  function renderVote() {
    el.roundTag.textContent = fill(T.roundLabel, { n: game.round });
    el.voteGrid.textContent = '';
    game.players.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-secondary' + (p.out ? ' is-out' : '');
      b.textContent = p.name;
      // 出局的人：前面放身分圖示（變灰加叉叉），下面寫身分
      if (p.out) {
        var icon = document.createElement('i');
        icon.className = 'role-icon';
        icon.innerHTML = roleIcon(p.role);
        b.insertBefore(icon, b.firstChild);
        var tag = document.createElement('small');
        tag.textContent = roleLabel(p.role);
        b.appendChild(tag);
        b.disabled = true;
      }
      b.addEventListener('click', function () { pickPlayer(i); });
      el.voteGrid.appendChild(b);
    });
    el.revealPanel.hidden = true;
    el.votePanel.hidden = false;
    setForgot(false);
  }

  // 「有人忘了詞？」：打開後點自己的名字，回到看詞那頁再看一次（不會被算成投票）
  var forgotMode = false;
  function setForgot(on) {
    forgotMode = on;
    el.votePanel.classList.toggle('is-forgot', on);
    el.forgotHint.hidden = !on;
    el.forgotToggle.setAttribute('aria-pressed', String(on));
  }
  function pickPlayer(i) {
    if (game.players[i].out) return;
    if (forgotMode) {
      forgotIndex = i;
      showScreen('deal');
      return;
    }
    voteTarget = i;
    el.voteTitle.textContent = fill(T.voteConfirm, { name: game.players[i].name });
    if (typeof el.voteModal.showModal === 'function') el.voteModal.showModal();
    else voteOut();
  }
  var voteTarget = -1;
  function voteOut() {
    if (el.voteModal.open) el.voteModal.close();
    var p = game.players[voteTarget];
    if (!p || p.out) return;
    p.out = true;
    track('undercover_voted_out', { game_number: gameNumber, round_number: game.round, role: p.role });
    revealSound(p.role !== 'civilian');

    var key = p.role === 'spy' ? 'Spy' : p.role === 'blank' ? 'Blank' : 'Civilian';
    el.revealTitle.textContent = fill(T['reveal' + key], { name: p.name });
    el.revealHint.textContent = T['reveal' + key + 'Hint'];
    el.revealPanel.classList.toggle('is-spy', p.role !== 'civilian');
    el.revealArt.innerHTML = '<svg viewBox="0 0 160 126">' + roleArt(p.role, p.role === 'civilian' ? 'worry' : null) + '</svg>';
    game.winner = winner();
    el.revealNext.textContent = game.winner ? T.seeResult : T.nextRound;
    el.votePanel.hidden = true;
    el.revealPanel.hidden = false;
    window.scrollTo(0, 0);
  }
  /*
   * 臥底＋白板全部出局 → 平民贏。
   * 臥底贏：場上的臥底跟平民一樣多（白板不算進來，不然 5 人加白板投錯一次就結束），
   * 或只剩兩個人時臥底／白板還在
   */
  function winner() {
    var left = alive();
    var spies = left.filter(function (p) { return p.role === 'spy'; }).length;
    var bad = left.filter(function (p) { return p.role !== 'civilian'; }).length;
    var good = left.length - bad;
    if (!bad) return 'civilians';
    if (spies >= good || left.length <= 2) return 'spies';
    return '';
  }
  function revealNext() {
    if (game.winner) {
      track('undercover_game_ended', {
        game_number: gameNumber,
        winner: game.winner,
        rounds: game.round,
        players: game.players.length,
        duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
      });
      showScreen('end');
      return;
    }
    game.round += 1;
    startRound();
  }

  // ---------- 結果 ----------

  function renderEnd() {
    // 最上面：哪一方獲勝（老闆 11/23：要說清楚是平民還是臥底獲勝）
    var spiesWin = game.winner === 'spies';
    el.winBanner.classList.toggle('is-spy', spiesWin);
    el.winIcon.innerHTML = roleIcon(spiesWin ? 'spy' : 'civilian');
    el.winTitle.textContent = spiesWin ? T.bannerSpies : T.bannerCivilians;
    el.civilianWord.textContent = game.civilianWord;
    el.spyWord.textContent = game.spyWord;
    // 每個人一行：角色圖示＋名字＋身分；出局的圖示變灰、加叉叉
    el.roleList.textContent = '';
    game.players.forEach(function (p) {
      var li = document.createElement('li');
      li.className = (p.role === 'spy' ? 'is-spy' : p.role === 'blank' ? 'is-blank' : '') + (p.out ? ' is-out' : '');
      var icon = document.createElement('i');
      icon.className = 'role-icon';
      icon.innerHTML = roleIcon(p.role);
      var b = document.createElement('b');
      b.textContent = p.name;
      var s = document.createElement('span');
      s.textContent = roleLabel(p.role) + (p.out ? '・' + T.outTag : '');
      li.appendChild(icon);
      li.appendChild(b);
      li.appendChild(s);
      el.roleList.appendChild(li);
    });
  }

  // ---------- 插圖（woohop-art.js 的畫法，160×126） ----------

  var COLOR = { civilian: '#aebcf3', spy: '#EE7B6A', blank: '#ffffff' };
  var FACE = { civilian: 'smile', spy: 'cool', blank: 'wow' };
  /*
   * 角色（老闆 11/23：設計臥底和平民的 icon）：平民是藍色笑臉；臥底是珊瑚色、戴墨鏡和偵探帽；
   * 白板是白色、臉上一個問號。結果頁、投票格、揭曉都用同一個
   */
  function figure(role, face) {
    if (role === 'blank') {
      return W.body('<circle cx="80" cy="78" r="38"/>', COLOR.blank) +
        '<text x="80" y="96" text-anchor="middle" font-size="52" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">?</text>';
    }
    var out = W.body('<circle cx="80" cy="78" r="38"/>', COLOR[role]) + W.makeFace(face || FACE[role], 80, 82, 2.2);
    if (role === 'spy') {
      out += W.body('<path d="M56 50l6-24h36l6 24z"/>', '#3a3f5c', '', false) +
        W.body('<rect x="40" y="46" width="80" height="11" rx="5.5"/>', '#3a3f5c', '', false);
    }
    return out;
  }
  // 大張的（揭曉）：多一條地面和裝飾
  function roleArt(role, face) {
    return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 32, '#7489E6') + W.dot(148, 96, '#4FB59A', 4) + figure(role, face);
  }
  // 小圖示（結果頁的名單、投票格）：只有角色本身
  function roleIcon(role) {
    return '<svg viewBox="30 16 100 106" aria-hidden="true">' + figure(role) + '</svg>';
  }
  var bubble = function (x, y, w, text) {
    return '<g><rect x="' + (x - w / 2) + '" y="' + (y - 14) + '" width="' + w + '" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    // 一張蓋著的詞卡（大問號）
    function () {
      return W.ground + W.burst(140, 26, '#FFC628') + W.ring(22, 34, '#EE7B6A') + W.dot(146, 100, '#4FB59A', 4) +
        '<g transform="rotate(-6 80 72)">' + W.body('<rect x="42" y="30" width="76" height="86" rx="12"/>', '#aebcf3') + '</g>' +
        '<text x="80" y="88" text-anchor="middle" font-size="48" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">?</text>';
    },
    // 兩個人各說一句
    function () {
      return W.ground + W.plus(146, 92, '#4FB59A') + W.dot(18, 96, '#FFC628', 4) +
        W.body('<circle cx="52" cy="90" r="26"/>', '#aebcf3') + W.makeFace('smile', 52, 90, 1.4) +
        W.body('<circle cx="112" cy="90" r="26"/>', '#EE7B6A') + W.makeFace('cool', 112, 90, 1.4) +
        bubble(48, 40, 44, '…') + bubble(116, 34, 44, '…');
    },
    // 三個人，中間戴墨鏡的被一個箭頭指著
    function () {
      return W.ground + W.burst(28, 28, '#FFC628') + W.ring(146, 30, '#4FB59A') +
        W.body('<circle cx="34" cy="96" r="20"/>', '#aebcf3') + W.makeFace('worry', 34, 96, 1.1) +
        W.body('<circle cx="126" cy="96" r="20"/>', '#aebcf3') + W.makeFace('smile', 126, 96, 1.1) +
        W.body('<circle cx="80" cy="86" r="28"/>', '#EE7B6A') + W.makeFace('cool', 80, 86, 1.5) +
        '<path d="M80 22v22m-9-9 9 10 9-10" fill="none" ' + W.K + '/>';
    },
  ];

  // ---------- 聲音：揭曉（沒有背景配樂） ----------

  var SETTINGS_KEY = 'woohop-undercover-settings';
  var settings = { sound: true }; // 只記聲音開關（全站一樣）
  var audio = { ctx: null };
  function ensureAudio() {
    if (!settings.sound) return null;
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
  Leader.onAudioReset(function () {
    Leader.closeAudio(audio.ctx);
    audio.ctx = null;
  });
  function tone(freq, t, dur, type, peak) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  // 抓到臥底：往上的三個音；抓錯人：往下的兩個悶音
  function revealSound(caught) {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime + 0.02;
    if (caught) [523.25, 659.25, 783.99].forEach(function (f, i) { tone(f, t + i * 0.1, 0.25, 'triangle', 0.25); });
    else [330, 247].forEach(function (f, i) { tone(f, t + i * 0.18, 0.3, 'square', 0.08); });
  }

  var soundButton = $('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sound: settings.sound }));
    } catch (e) {
      /* 無痕模式：照樣能玩，只是記不住 */
    }
    if (settings.sound) Leader.resetAudio();
    syncSoundButton();
  };
  try {
    var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  } catch (e) {
    /* 同上 */
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
    if (document.visibilityState === 'visible' && (screen === 'deal' || screen === 'play')) {
      wakeLock = null;
      requestWakeLock();
    }
    // 切到背景時詞一定蓋起來
    if (document.visibilityState !== 'visible') closeWord();
  });

  // ---------- 帶領的步驟頭（Leader.lead）：deal 是手機在大家手上傳，不放 ----------

  var STEPS = ['setup', 'rules', 'deal', 'play', 'end'];

  function renderLead() {
    if (screen === 'deal') return;
    var text = T.lead[screen];
    var say = text[1];
    if (screen === 'play') say = fill(say, { first: game.players[game.first].name });
    if (screen === 'end') say = fill(say, { winner: game.winner === 'spies' ? T.winSpies : T.winCivilians });
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: text[0],
      say: say,
    });
  }

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    if (next === 'setup') renderSetup();
    if (next === 'rules') Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
    if (next === 'deal') renderDeal();
    if (next === 'play') renderVote();
    if (next === 'end') renderEnd();
    renderLead();
    if (next === 'deal' || next === 'play') requestWakeLock();
    else releaseWakeLock();
    syncSoundButton();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startGame() {
    gameNumber += 1;
    startedAt = Date.now();
    forgotIndex = -1;
    newGame();
    ensureAudio(); // 在使用者按下去的這一下建立（自動播放限制）
    showScreen('deal');
    track('undercover_game_started', { game_number: gameNumber, players: setup.players, spies: setup.spies, blank: setup.blank, categories: setup.cats.filter(Boolean).length });
  }

  // ---------- 返回鍵：開場直接離開；說明規則回開場；看詞、投票先確認；結果直接回開場 ----------

  function pushGameState() {
    history.pushState({ undercover: 'game' }, '');
  }
  function backToSetup() {
    game = null;
    forgotIndex = -1;
    showScreen('setup');
  }
  function goBack(fromPop) {
    if (el.voteModal.open) {
      el.voteModal.close();
      if (fromPop) pushGameState();
      return;
    }
    if (el.leaveModal.open) {
      el.leaveModal.close();
      if (fromPop) pushGameState();
      return;
    }
    if (screen === 'setup') {
      if (!fromPop) location.href = '/' + LANG + '/games/';
      return;
    }
    if (screen === 'deal' || screen === 'play') {
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

  el.playersLess.addEventListener('click', function () { setup.players = Math.max(PLAYERS.min, setup.players - 1); renderSetup(); });
  el.playersMore.addEventListener('click', function () { setup.players = Math.min(PLAYERS.max, setup.players + 1); renderSetup(); });
  el.spiesLess.addEventListener('click', function () { setup.spiesTouched = true; setup.spies -= 1; renderSetup(); });
  el.spiesMore.addEventListener('click', function () { setup.spiesTouched = true; setup.spies += 1; renderSetup(); });
  el.blankInput.addEventListener('change', function () { setup.blank = el.blankInput.checked; renderSetup(); });
  el.advToggle.addEventListener('click', function () {
    var open = el.advPanel.hidden;
    el.advPanel.hidden = !open;
    el.advToggle.setAttribute('aria-expanded', String(open));
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startGame);

  // 看詞卡：按住看、放開蓋起來。鍵盤（沒有按住可言）按一下翻開 2 秒
  el.wordCard.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    openWord();
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.wordCard.addEventListener(type, closeWord);
  });
  el.wordCard.addEventListener('click', function (e) {
    if (e.detail !== 0) return;
    openWord();
    setTimeout(closeWord, 2000);
  });
  el.wordCard.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.dealNext.addEventListener('click', dealNext);

  el.forgotToggle.addEventListener('click', function () { setForgot(!forgotMode); });
  el.voteCancel.addEventListener('click', function () { el.voteModal.close(); });
  el.voteOk.addEventListener('click', voteOut);
  el.revealNext.addEventListener('click', revealNext);

  el.again.addEventListener('click', startGame);
  el.changePlayers.addEventListener('click', function () { backToSetup(); history.back(); });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  showScreen('setup');
})();
