/*
 * 兩真一假（房間版）的客戶端。純瀏覽器 script，沒有 bundler，架構照偷渡畫家（apps/sneaky-artist/app/app.js，那邊照搶答）：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.TRUTHS 帶進來；房號放在 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 「我是不是主持人」由伺服器在 welcome 回答（clientId 存在 localStorage，重整後還是主持人）。
 * 主持人也是玩家：一樣填暱稱、寫、猜，只是房間畫面上多了控場的按鈕（[data-host]）。
 *
 * 伺服器每次送 state 都附上 you（只給這支手機的）：自己寫好的三句、這組是不是我寫的、我投了哪句。
 * 「先保密」模式就是靠 you 才不會在大家共用的 state 裡露出作者。
 *
 * 寫的時候：主題由這支手機自己從 T.topics 抽（每個人不一樣、可以單個換），還沒送出的草稿存在 sessionStorage，
 * 重整不會不見。寫的列表只在「換主題／新的一場」時重畫，不跟著每次 state 重畫（不然正在打字的框會被洗掉）。
 */
(function () {
  'use strict';

  var T = window.T;
  var LANG = window.TRUTHS.lang;
  var BASE = window.TRUTHS.base;
  var API_ORIGIN = location.origin === window.TRUTHS.siteOrigin ? window.TRUTHS.workerOrigin : location.origin;

  var CLIENT_KEY = 'woohop-truths-client';
  var ROOM_KEY_PREFIX = 'woohop-truths-room-';
  var DRAFT_KEY_PREFIX = 'woohop-truths-draft-';
  var PROFILE_KEY = 'web100-profile'; // 暱稱與頭像跟系列其他遊戲共用同一份
  var CODE_RE = /^[A-Z0-9]{4}$/;
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 8000;
  var MAX_TEXT = 60; // 跟 src/game.js 的 MAX_TEXT_LENGTH 一樣

  var socket = null;
  var reconnectTimer = null;
  var reconnectDelay = RECONNECT_MIN_MS;
  var giveUp = false;
  var roomCode = null;
  var me = null; // { id, host, nickname }
  var lastState = null;
  var you = { entry: null, isAuthor: false, vote: -1 };
  var pendingNickname = '';
  var currentView = null;
  var currentAvatar = 'initial';
  var renderedQrUrl = null;
  var joinReported = false;
  var justCreated = false; // 剛開房的主持人：填暱稱畫面換一句標題
  var draft = null; // { n: 第幾場, topics: [[主題, 範例] ×3], texts: ['', '', ''], fake: -1 }
  var topicDeck = [];

  var el = {};

  function init() {
    cacheElements();
    var profile = readProfile();
    currentAvatar = profile.avatar || 'initial';
    if (profile.nickname) el['nickname'].value = profile.nickname;
    renderAvatarPicker();
    bindHome();
    bindJoin();
    bindRoom();
    bindExit();

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && roomCode && !giveUp && !isOpen()) connect();
    });

    var code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    initHistory();
    if (CODE_RE.test(code)) enterRoom(code);
    else showView('home');
  }

  function cacheElements() {
    [
      'view-home', 'view-join', 'view-room', 'view-error',
      'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'share-card', 'host-room-code', 'copy-link', 'share-link', 'qr-box',
      'player-count', 'room-tags', 'player-list', 'start-game', 'start-need',
      'write-desc', 'write-form', 'write-list', 'submit-entry', 'submit-need',
      'submitted', 'mine-list', 'edit-entry', 'written-count', 'written-list', 'start-guess',
      'ready-title', 'ready-desc', 'start-guess-ready',
      'turn-no', 'turn-author', 'turn-title', 'turn-timer', 'turn-timer-arc', 'turn-timer-num',
      'mine-note', 'statements', 'turn-hint', 'you-result', 'fooled-line', 'next-turn',
      'award-guess', 'award-fool', 'score-list', 'play-again',
      'error-title', 'error-desc', 'conn-banner',
      'confirm-dialog', 'confirm-title', 'confirm-desc', 'confirm-cancel', 'confirm-ok',
      'closed-dialog', 'closed-ok', 'kicked-dialog', 'kicked-ok',
    ].forEach(function (id) {
      el[id] = document.getElementById(id);
    });
  }

  /* ---------- 共用小工具 ---------- */

  function t(key, vars) {
    var text = T[key] || '';
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole;
    });
  }

  function readStore(key, session) {
    try {
      return (session ? sessionStorage : localStorage).getItem(key);
    } catch (e) {
      return null; // 無痕模式或封鎖 storage：功能照走，只是記不住
    }
  }

  function writeStore(key, value, session) {
    try {
      (session ? sessionStorage : localStorage).setItem(key, value);
    } catch (e) {
      /* 記不住就算了 */
    }
  }

  function clientId() {
    var id = readStore(CLIENT_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2);
      writeStore(CLIENT_KEY, id);
    }
    return id;
  }

  function readProfile() {
    try {
      return JSON.parse(readStore(PROFILE_KEY) || 'null') || {};
    } catch (e) {
      return {};
    }
  }

  function saveProfile(nickname) {
    writeStore(PROFILE_KEY, JSON.stringify({ nickname: nickname, avatar: currentAvatar }));
  }

  function track(name, params) {
    if (typeof gtag !== 'function') return;
    var p = params || {};
    if (roomCode && !p.room_id) p.room_id = roomCode;
    gtag('event', name, p);
  }

  function showFieldError(node, message) {
    node.textContent = message;
    node.hidden = false;
  }

  function hideFieldError(node) {
    node.hidden = true;
  }

  function showBanner(message) {
    el['conn-banner'].textContent = message;
    el['conn-banner'].hidden = false;
  }

  function hideBanner() {
    el['conn-banner'].hidden = true;
  }

  function showFatal(titleKey, descKey) {
    giveUp = true;
    hideBanner();
    el['error-title'].textContent = t(titleKey);
    el['error-desc'].textContent = t(descKey);
    showView('error');
  }

  function node(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- 頭像（照搶答：設計系統的食物頭像，第一格是名字第一個字） ---------- */

  function avatarList() {
    return (window.Woohop && window.Woohop.AVATARS) || window.AVATARS;
  }

  function initialBg(name) {
    var list = avatarList();
    var hash = 0;
    var chars = Array.from(name || '');
    for (var i = 0; i < chars.length; i += 1) hash = (hash * 31 + chars[i].codePointAt(0)) >>> 0;
    return list[hash % list.length].bg;
  }

  // 頭像圖裡的 clipPath id 每畫一次就換成獨一無二的（重複的 id 會讓裁切失效，見搶答的說明）
  var avatarSeq = 0;
  function uniqueAvatarIds(svg) {
    avatarSeq += 1;
    return svg.replace(/av-[a-z]+-[0-9]+/g, function (id) { return id + '-' + avatarSeq; });
  }

  function avatarSvg(id, size, name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'avatar');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (!id || id === 'initial') {
      var letter = Array.from((name || '').trim())[0] || '?';
      svg.innerHTML =
        '<rect width="64" height="64" fill="' + initialBg(name) + '"/>' +
        '<text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-size="30" font-weight="900" fill="#22222c"></text>';
      svg.querySelector('text').textContent = letter;
      return svg;
    }
    var list = avatarList();
    var found = null;
    for (var i = 0; i < list.length; i += 1) if (list[i].id === id) found = list[i];
    if (!found) found = list[0];
    svg.innerHTML = '<rect width="64" height="64" fill="' + found.bg + '"/>' + uniqueAvatarIds(found.svg);
    return svg;
  }

  function renderAvatarPicker() {
    var picker = el['avatar-picker'];
    picker.replaceChildren();
    var options = [{ id: 'initial', label: T.avatarInitialLabel }].concat(
      avatarList().map(function (avatar, index) {
        return { id: avatar.id, label: T.avatarLabel + ' ' + (index + 1) };
      }),
    );
    options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'avatar-option';
      button.setAttribute('role', 'radio');
      button.dataset.avatar = option.id;
      button.setAttribute('aria-checked', String(option.id === currentAvatar));
      button.setAttribute('aria-label', option.label);
      button.append(avatarSvg(option.id, 56, el['nickname'].value));
      button.addEventListener('click', function () {
        currentAvatar = option.id;
        picker.querySelectorAll('[data-avatar]').forEach(function (b) {
          b.setAttribute('aria-checked', String(b.dataset.avatar === option.id));
        });
      });
      picker.append(button);
    });
  }

  function refreshInitialOption() {
    var option = el['avatar-picker'].querySelector('[data-avatar="initial"]');
    if (option) option.replaceChildren(avatarSvg('initial', 56, el['nickname'].value));
  }

  /* ---------- 畫面切換 ---------- */

  function showView(name) {
    ['home', 'join', 'room', 'error'].forEach(function (view) {
      el['view-' + view].hidden = view !== name;
    });
    var inRoom = name === 'room';
    document.body.setAttribute('data-game-mode', inRoom ? 'play' : 'browse');
    var badge = document.getElementById('game-bar-badge');
    if (badge) {
      var host = inRoom && me && me.host;
      badge.textContent = inRoom ? (host ? T.hostBadge : T.playerBadge) : '';
      badge.classList.toggle('b-host', !!host);
      badge.classList.toggle('b-info', !host);
    }
    var gameTitle = document.querySelector('.game-bar .title');
    if (gameTitle) gameTitle.tabIndex = inRoom ? -1 : 0;
    if (name !== currentView) {
      currentView = name;
      window.trackPageView(BASE + '/' + LANG + '/' + name);
    }
  }

  /* ---------- 首頁：開房、加入 ---------- */

  var prep = { reveal: 'show', guessSec: 45 };

  function bindHome() {
    document.querySelectorAll('.reveal-choice').forEach(function (b) {
      b.addEventListener('click', function () {
        prep.reveal = b.dataset.reveal;
        document.querySelectorAll('.reveal-choice').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x.dataset.reveal === prep.reveal));
        });
      });
    });
    document.querySelectorAll('input[name="guess-sec"]').forEach(function (input) {
      input.addEventListener('change', function () { prep.guessSec = Number(input.value); });
    });
    el['create-room'].addEventListener('click', createRoom);
    el['join-room'].addEventListener('click', joinByCode);

    // 房號四格：打一個字跳下一格、刪除退回上一格、貼上整組自動分格（照搶答）
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#code-boxes input'));
    var sync = function () {
      el['join-code'].value = boxes.map(function (b) { return b.value; }).join('');
      hideFieldError(el['join-error']);
    };
    var fill = function (from, text) {
      var chars = text.replace(/[^a-z0-9]/gi, '').toUpperCase().split('');
      for (var i = from; i < boxes.length && chars.length; i += 1) boxes[i].value = chars.shift();
      sync();
      var next = boxes.filter(function (b) { return !b.value; })[0];
      (next || boxes[boxes.length - 1]).focus();
    };
    boxes.forEach(function (box, i) {
      box.addEventListener('input', function () {
        var v = box.value;
        box.value = '';
        fill(i, v);
      });
      box.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace' && !box.value && boxes[i - 1]) {
          boxes[i - 1].value = '';
          boxes[i - 1].focus();
          sync();
          event.preventDefault();
        }
        if (event.key === 'Enter') joinByCode();
      });
      box.addEventListener('paste', function (event) {
        var text = (event.clipboardData || window.clipboardData).getData('text');
        if (!text) return;
        event.preventDefault();
        fill(i, text);
      });
    });

    if (navigator.share) {
      el['share-link'].hidden = false;
      el['share-link'].addEventListener('click', function () {
        navigator.share({ title: document.title, url: shareLink() }).catch(function () { /* 取消分享 */ });
      });
    }
    el['copy-link'].addEventListener('click', function () {
      var label = el['copy-link'].querySelector('.label');
      copyText(shareLink()).then(function () {
        label.textContent = T.copied;
        setTimeout(function () { label.textContent = T.copyLink; }, 1600);
      }).catch(function () {
        label.textContent = T.copyFailed;
      });
    });
  }

  // 複製到剪貼簿：navigator.clipboard 只在 https／localhost 才有，區網 IP 測試時退回 execCommand（照偷渡畫家）
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      area.setSelectionRange(0, text.length); // iOS 要這一行才選得到
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      area.remove();
      if (ok) resolve();
      else reject(new Error('copy_failed'));
    });
  }

  function shareLink() {
    return location.origin + BASE + '/' + LANG + '/?room=' + roomCode;
  }

  function createRoom() {
    hideFieldError(el['create-error']);
    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;
    fetch(API_ORIGIN + BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostId: clientId(), reveal: prep.reveal, guessSec: prep.guessSec, lang: LANG }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('truths_room_created', { reveal: prep.reveal, guess_seconds: prep.guessSec, room_id: data.code });
        justCreated = true;
        enterRoom(data.code);
      })
      .catch(function () {
        showFieldError(el['create-error'], T.createFailed);
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = T.createButton;
      });
  }

  function joinByCode() {
    var code = el['join-code'].value.trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      showFieldError(el['join-error'], T.joinCodeInvalid);
      return;
    }
    enterRoom(code);
  }

  function enterRoom(code) {
    roomCode = code;
    giveUp = false;
    pendingNickname = readStore(ROOM_KEY_PREFIX + code) || '';
    pushRoomEntry(code);
    connect();
  }

  /* ---------- 填暱稱 ---------- */

  function bindJoin() {
    el['enter-room'].addEventListener('click', submitNickname);
    el['nickname'].addEventListener('input', refreshInitialOption);
    el['nickname'].addEventListener('keydown', function (event) {
      if (event.key === 'Enter') submitNickname();
    });
  }

  function submitNickname() {
    var nickname = el['nickname'].value.trim();
    if (!nickname) {
      showFieldError(el['nickname-error'], T.nicknameRequired);
      return;
    }
    hideFieldError(el['nickname-error']);
    pendingNickname = nickname;
    writeStore(ROOM_KEY_PREFIX + roomCode, nickname);
    saveProfile(nickname);
    if (isOpen()) sendHello();
    else connect();
  }

  /* ---------- WebSocket ---------- */

  function isOpen() {
    return socket && socket.readyState === WebSocket.OPEN;
  }

  function send(message) {
    if (isOpen()) socket.send(JSON.stringify(message));
  }

  function connect() {
    clearTimeout(reconnectTimer);
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
      try {
        socket.close();
      } catch (e) {
        /* 已經關了 */
      }
    }
    showBanner(T.connecting);
    var url = new URL(BASE + '/api/rooms/' + roomCode + '/ws', API_ORIGIN);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(url.toString());
    socket.onopen = function () {
      reconnectDelay = RECONNECT_MIN_MS;
      sendHello();
    };
    socket.onmessage = function (event) {
      handleMessage(event.data);
    };
    socket.onclose = function (event) {
      if (giveUp) return;
      if (event.reason === 'room_expired') {
        showFatal('roomExpiredTitle', 'roomExpiredDesc');
        return;
      }
      showBanner(T.reconnecting);
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
    };
  }

  function sendHello() {
    send({ t: 'hello', clientId: clientId(), nickname: pendingNickname, avatar: currentAvatar });
  }

  function handleMessage(raw) {
    var msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }
    switch (msg.t) {
      case 'welcome':
        me = msg.you;
        writeStore(ROOM_KEY_PREFIX + roomCode, me.nickname);
        if (!joinReported) {
          joinReported = true;
          track('truths_player_joined', { host: me.host });
        }
        hideBanner();
        return;
      case 'state':
        you = msg.you || you;
        onState(msg.state);
        return;
      case 'kicked':
        giveUp = true;
        hideBanner();
        el['kicked-dialog'].showModal();
        return;
      case 'closed':
        giveUp = true;
        hideBanner();
        el['closed-dialog'].showModal();
        return;
      case 'error':
        handleServerError(msg.code);
        return;
      default:
        return;
    }
  }

  function handleServerError(code) {
    if (code === 'nickname_required') {
      hideBanner();
      el['join-title'].textContent = justCreated ? T.hostJoinTitle : t('joinTitleWithCode', { code: roomCode });
      if (pendingNickname) el['nickname'].value = pendingNickname;
      refreshInitialOption();
      showView('join');
      el['nickname'].focus();
      return;
    }
    if (code === 'room_not_found') return showFatal('roomNotFoundTitle', 'roomNotFoundDesc');
    if (code === 'room_full') return showFatal('roomFullTitle', 'roomFullDesc');
    if (code === 'room_started') return showFatal('roomStartedTitle', 'roomStartedDesc');
    if (code === 'nobody_wrote') {
      el['submit-need'].textContent = T.nobodyWrote;
      return;
    }
    // 其他（按了現在不該按的）靜靜忽略，畫面本來就會把按鈕鎖住
  }

  /* ---------- 收到狀態 ---------- */

  var prevPhaseKey = '';

  function onState(state) {
    var prev = lastState;
    lastState = state;
    var r = state.round;
    var key = state.phase + '|' + (r ? r.n : 0) + '|' + (r && r.turn ? r.turn.index : '');
    if (key !== prevPhaseKey) {
      prevPhaseKey = key;
      onPhaseChange(prev, state);
    }
    syncTimer();
    render();
  }

  // 換階段時要做一次的事
  function onPhaseChange(prev, state) {
    sentTimeUp = false;
    if (state.phase === 'writing') ensureDraft(state.round.n);
    if (state.phase === 'guessing' && navigator.vibrate) navigator.vibrate(60);
    // 玩完一場：很多團體玩完直接關掉，靠這個才算得出「真的玩完」的房間。只在主持人的手機送
    if (state.phase === 'ended' && prev && prev.phase !== 'ended' && me && me.host) {
      track('truths_game_ended', { rounds: state.round.n, player_count: state.players.length, turns: state.round.played });
    }
  }

  /* ---------- 倒數：只有猜的時候有（寫的時候不限時，老闆 11/12） ---------- */

  var timerId = 0;
  var deadline = 0;
  var totalMs = 1;
  var sentTimeUp = false;

  function syncTimer() {
    var s = lastState;
    if (s.phase === 'guessing') {
      totalMs = s.guessSec * 1000;
      deadline = Date.now() + s.round.turn.leftMs;
      if (!timerId) timerId = setInterval(tickTimer, 200);
      tickTimer();
    } else {
      clearInterval(timerId);
      timerId = 0;
    }
  }

  function tickTimer() {
    var s = lastState;
    if (!s) return;
    var left = Math.max(0, deadline - Date.now());
    var sec = Math.ceil(left / 1000);
    el['turn-timer-num'].textContent = sec;
    el['turn-timer-arc'].style.strokeDashoffset = String(314.16 * (1 - Math.min(1, left / totalMs)));
    el['turn-timer'].classList.toggle('is-urgent', sec <= 5 && left > 0);
    // 時間到：誰的手機先倒數完都送，伺服器會檢查時間真的到了
    if (left <= 0 && !sentTimeUp && s.phase === 'guessing') {
      sentTimeUp = true;
      send({ t: 'endTurn' });
    }
  }

  /* ---------- 房間畫面 ---------- */

  function nameOf(id) {
    var r = lastState.round;
    var p = lastState.players.filter(function (x) { return x.id === id; })[0];
    if (p) return p;
    if (r && r.names[id]) return { id: id, nickname: r.names[id].nickname, avatar: r.names[id].avatar };
    return { id: id, nickname: '?', avatar: '' };
  }

  function render() {
    if (!lastState || !me) return;
    var s = lastState;
    showView('room');
    var view = el['view-room'];
    view.setAttribute('data-phase', s.phase);
    view.classList.toggle('is-host', !!me.host);
    view.querySelectorAll('[data-show]').forEach(function (n) {
      n.hidden = n.getAttribute('data-show').split(' ').indexOf(s.phase) < 0;
    });

    if (s.phase === 'lobby') renderLobby(s);
    if (s.phase === 'writing') renderWriting(s);
    if (s.phase === 'ready') renderReady(s);
    if (s.phase === 'guessing' || s.phase === 'reveal') renderTurn(s);
    if (s.phase === 'ended') renderEnded(s);
  }

  function renderLobby(s) {
    if (me.host) {
      if (el['host-room-code'].getAttribute('aria-label') !== s.code) {
        el['host-room-code'].replaceChildren();
        Array.from(s.code).forEach(function (ch) {
          el['host-room-code'].append(node('span', '', ch));
        });
        el['host-room-code'].setAttribute('aria-label', s.code);
      }
      renderQr(shareLink());
      var enough = s.players.length >= s.minPlayers;
      el['start-game'].disabled = !enough;
      el['start-need'].hidden = enough;
      el['start-need'].textContent = t('startNeed', { n: s.minPlayers });
    }
    el['player-count'].textContent = t('playerCount', { n: s.players.length, max: s.maxPlayers });
    el['room-tags'].textContent = (s.reveal === 'hide' ? T.revealHideTag : T.revealShowTag) + '・' + t('guessSecTag', { n: s.guessSec });
    renderPlayers(el['player-list'], s.players, true);
  }

  // 名單：大廳可以移出人；寫的時候在後面標「寫好了／還在寫」
  function renderPlayers(list, players, withKick, written) {
    list.replaceChildren();
    players.forEach(function (player) {
      var item = node('li', 'player');
      if (!player.online) item.classList.add('is-offline');
      if (player.id === me.id) item.classList.add('is-me');
      item.append(avatarSvg(player.avatar, 32, player.nickname), node('span', 'name', player.nickname));
      if (player.id === lastState.hostId) item.append(node('span', 'badge b-host', T.hostBadge));
      if (written) {
        var done = written.indexOf(player.id) >= 0;
        item.append(node('span', 'badge ' + (done ? 'b-done' : 'b-wait'), done ? T.writtenTag : T.writingTag));
      }
      if (!player.online) item.append(node('span', 't-caption', T.offlineTag));
      if (withKick && me.host && player.id !== me.id) {
        var kick = node('button', 'btn btn-sm btn-ghost kick', '✕');
        kick.type = 'button';
        kick.setAttribute('aria-label', t('kickAria', { nickname: player.nickname }));
        kick.addEventListener('click', function () {
          askConfirm(t('kickConfirmTitle', { nickname: player.nickname }), T.kickConfirmDesc, T.kickConfirmOk, function () {
            send({ t: 'kick', playerId: player.id });
          });
        });
        item.append(kick);
      }
      list.append(item);
    });
  }

  /* ---------- 寫 ---------- */

  function shuffleTopics() {
    topicDeck = T.topics.slice();
    for (var i = topicDeck.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = topicDeck[i];
      topicDeck[i] = topicDeck[j];
      topicDeck[j] = tmp;
    }
  }

  // 抽一個主題，不要跟畫面上的另外兩個重複（牌抽完就重洗）
  function drawTopic(avoid) {
    for (var guard = 0; guard < 200; guard += 1) {
      if (!topicDeck.length) shuffleTopics();
      var topic = topicDeck.pop();
      if (avoid.indexOf(topic[0]) < 0) return topic;
    }
    return T.topics[0];
  }

  function exampleOf(name) {
    for (var i = 0; i < T.topics.length; i += 1) if (T.topics[i][0] === name) return T.topics[i][1];
    return '';
  }

  function draftKey(n) {
    return DRAFT_KEY_PREFIX + roomCode + '-' + n;
  }

  function saveDraft() {
    if (draft) writeStore(draftKey(draft.n), JSON.stringify(draft), true);
  }

  // 新的一場：先看 sessionStorage 有沒有這一場的草稿（重整回來），沒有就抽三個新主題
  function ensureDraft(n) {
    if (draft && draft.n === n) return;
    var saved = null;
    try {
      saved = JSON.parse(readStore(draftKey(n), true) || 'null');
    } catch (e) {
      saved = null;
    }
    if (saved && saved.n === n && saved.topics && saved.topics.length === 3) {
      draft = saved;
    } else {
      var topics = [];
      for (var i = 0; i < 3; i += 1) topics.push(drawTopic(topics.map(function (x) { return x[0]; })));
      draft = { n: n, topics: topics, texts: ['', '', ''], fake: -1 };
      saveDraft();
    }
    buildWriteList();
  }

  // 寫的那三格：只在換主題、新的一場、按「修改」時整個重畫（打字中的框不能被 state 洗掉）
  function buildWriteList() {
    var list = el['write-list'];
    list.replaceChildren();
    draft.topics.forEach(function (topic, i) {
      var item = node('li', 'write-item');
      var head = node('div', 'write-head');
      head.append(node('span', 'write-topic', topic[0]));
      var swap = node('button', 'btn btn-sm btn-secondary write-swap');
      swap.type = 'button';
      swap.innerHTML = '<svg aria-hidden="true"><use href="#i-dice"/></svg><span></span>';
      swap.querySelector('span').textContent = T.topicSwap;
      swap.addEventListener('click', function () {
        var others = draft.topics.map(function (x) { return x[0]; });
        draft.topics[i] = drawTopic(others);
        saveDraft();
        buildWriteList();
      });
      head.append(swap);

      var area = node('textarea', 'input write-text');
      area.rows = 1;
      area.maxLength = MAX_TEXT;
      area.value = draft.texts[i];
      area.placeholder = t('exampleLabel', { text: topic[1] });
      area.setAttribute('aria-label', topic[0]);
      area.addEventListener('input', function () {
        draft.texts[i] = area.value;
        saveDraft();
        syncSubmit();
        fitText(area);
      });

      var fake = node('button', 'fake-toggle', T.fakeButton);
      fake.type = 'button';
      fake.addEventListener('click', function () {
        draft.fake = draft.fake === i ? -1 : i;
        saveDraft();
        syncFake();
        syncSubmit();
      });

      item.append(head, area, fake);
      list.append(item);
      fitText(area);
    });
    syncFake();
    syncSubmit();
  }

  // 輸入框高度跟著字數：一開始一排，換行了才長高（先歸零再量 scrollHeight，刪字時才縮得回來）
  // 藏起來的時候量不到（scrollHeight 是 0），先不動，等 renderWriting 露出來之後再量一次
  function fitText(area) {
    if (!area.offsetParent) return;
    area.style.height = 'auto';
    var border = area.offsetHeight - area.clientHeight; // 上下框線（box-sizing: border-box）
    area.style.height = area.scrollHeight + border + 'px';
  }

  function syncFake() {
    Array.prototype.forEach.call(el['write-list'].children, function (item, i) {
      var on = draft.fake === i;
      item.classList.toggle('is-fake', on);
      var b = item.querySelector('.fake-toggle');
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? '✕ ' + T.fakeTag : T.fakeButton;
    });
  }

  function syncSubmit() {
    var filled = draft.texts.every(function (x) { return x.trim(); });
    var ok = filled && draft.fake >= 0;
    el['submit-entry'].disabled = !ok;
    el['submit-need'].textContent = ok ? '' : !filled ? T.submitNeedText : T.submitNeedFake;
  }

  function submitEntry() {
    if (!draft) return;
    var items = draft.topics.map(function (topic, i) {
      return { topic: topic[0], text: draft.texts[i].trim() };
    });
    send({ t: 'submit', entry: { items: items, fake: draft.fake } });
  }

  function renderWriting(s) {
    ensureDraft(s.round.n);
    var done = !!you.entry;
    el['write-form'].hidden = done;
    el['submitted'].hidden = !done;
    // 露出來之後才量得到高度（剛進寫的畫面、按了「修改」、重整回來）
    if (!done) el['write-list'].querySelectorAll('.write-text').forEach(fitText);
    el['write-desc'].hidden = done;
    if (done) {
      var list = el['mine-list'];
      list.replaceChildren();
      you.entry.items.forEach(function (it, i) {
        var li = node('li', 'mine-item' + (i === you.entry.fake ? ' is-fake' : ''));
        li.append(node('span', 'mine-topic', it.topic), node('span', 'mine-text', it.text));
        if (i === you.entry.fake) li.append(node('span', 'mine-tag', T.fakeTag));
        list.append(li);
      });
    }
    var written = s.round.written;
    el['written-count'].textContent = t('writtenCount', { n: written.length, total: s.players.length });
    renderPlayers(el['written-list'], s.players, false, written);
  }

  // 大家都寫好了（或時間到）：等主持人按開始
  function renderReady(s) {
    var written = s.round.written;
    el['ready-title'].textContent = T.readyTitle;
    el['ready-desc'].textContent = t('readyDesc', { n: written.length });
    el['written-count'].textContent = t('writtenCount', { n: written.length, total: s.players.length });
    renderPlayers(el['written-list'], s.players, false, written);
  }

  /* ---------- 猜、公布 ---------- */

  function renderTurn(s) {
    var turn = s.round.turn;
    var reveal = s.phase === 'reveal';
    var res = reveal ? s.round.result : null;
    var authorId = turn.authorId;
    var author = authorId ? nameOf(authorId) : null;

    el['turn-no'].textContent = t('guessTurn', { k: turn.index + 1, total: turn.total });
    el['turn-author'].replaceChildren();
    if (author) {
      el['turn-author'].append(avatarSvg(author.avatar, 36, author.nickname), node('span', '', reveal ? t('authorIs', { name: author.nickname }) : author.nickname));
    }
    el['turn-title'].textContent = you.isAuthor && !reveal
      ? T.mineTitle
      : author && !reveal
        ? t('guessTitle', { name: author.nickname })
        : reveal
          ? ''
          : T.guessTitleHidden;
    el['turn-title'].hidden = reveal;
    el['turn-timer'].hidden = reveal;

    // 自己寫的那組：手機上看得到自己選的假話，提醒別露餡
    el['mine-note'].hidden = !you.isAuthor || reveal;
    el['mine-note'].textContent = s.reveal === 'hide' ? T.mineDescHide : T.mineDescShow;

    renderStatements(s, turn, res);

    var hint = '';
    if (!reveal) {
      if (turn.allVoted) hint = T.allVotedHint;
      else if (you.isAuthor) hint = t('votedCount', { n: turn.votedCount, total: turn.voterTotal });
      else if (you.vote >= 0) hint = T.votedHint + '・' + t('votedCount', { n: turn.votedCount, total: turn.voterTotal });
      else hint = T.guessHint;
    }
    el['turn-hint'].textContent = hint;
    el['turn-hint'].hidden = !hint;

    if (reveal) {
      el['you-result'].textContent = you.isAuthor ? '' : you.vote < 0 ? T.youNoVote : you.vote === res.fake ? T.youRight : T.youWrong;
      el['you-result'].className = 'you-result' + (you.isAuthor || you.vote < 0 ? '' : you.vote === res.fake ? ' is-right' : ' is-wrong');
      el['you-result'].hidden = you.isAuthor;
      el['fooled-line'].textContent = res.fooled.length ? t('fooledLine', { n: res.fooled.length }) : T.fooledNobody;
      var last = turn.index + 1 >= turn.total;
      el['next-turn'].textContent = last ? T.toResultsButton : T.nextTurnButton;
    }
  }

  function renderStatements(s, turn, res) {
    var list = el['statements'];
    var key = s.round.n + '-' + turn.index;
    if (list.dataset.key !== key) {
      list.dataset.key = key;
      list.replaceChildren();
      turn.items.forEach(function (it, i) {
        var li = node('li');
        var b = node('button', 'statement');
        b.type = 'button';
        b.append(node('span', 'st-topic', it.topic), node('span', 'st-text', it.text));
        b.append(node('span', 'st-tag'));
        b.append(node('span', 'st-voters'));
        b.addEventListener('click', function () { vote(i); });
        li.append(b);
        list.append(li);
      });
    }
    var reveal = !!res;
    Array.prototype.forEach.call(list.children, function (li, i) {
      var b = li.firstChild;
      var tag = b.querySelector('.st-tag');
      var voters = b.querySelector('.st-voters');
      // 公布之後不標「我選的」：不然另外兩句會被淡掉，看不清真假（投了什麼看下面的頭像）
      var picked = !reveal && you.vote === i;
      var myFake = you.isAuthor && !reveal && you.fake === i;
      b.disabled = reveal || you.isAuthor; // 時間內都可以改選擇（老闆 11/12）
      b.classList.toggle('is-picked', picked);
      b.classList.toggle('is-my-fake', myFake);
      b.classList.toggle('is-fake', reveal && i === res.fake);
      b.classList.toggle('is-true', reveal && i !== res.fake);
      tag.textContent = reveal ? (i === res.fake ? '✕ ' + T.fakeTag : '✓ ' + T.trueTag) : myFake ? T.myFakeTag : '';
      tag.hidden = !tag.textContent;
      voters.replaceChildren();
      voters.hidden = !reveal;
      if (reveal) {
        var ids = res.byItem[i];
        if (!ids.length) voters.append(node('span', 't-caption', T.noVotes));
        ids.forEach(function (id) {
          var p = nameOf(id);
          var chip = node('span', 'voter');
          chip.append(avatarSvg(p.avatar, 22, p.nickname), node('span', '', p.nickname));
          voters.append(chip);
        });
      }
    });
  }

  function vote(i) {
    var s = lastState;
    if (!s || s.phase !== 'guessing' || you.isAuthor || you.vote === i) return;
    you.vote = i; // 先在本機標起來，伺服器的 state 回來會一致
    send({ t: 'vote', pick: i });
    render();
  }

  /* ---------- 結束 ---------- */

  function renderEnded(s) {
    var a = s.round.awards;
    var byId = {};
    s.players.forEach(function (p) { byId[p.id] = p; });
    var fillAward = function (box, ids, key, descKey) {
      box.replaceChildren();
      if (!ids.length) {
        box.append(node('span', 'award-none', T.awardNone));
        return;
      }
      ids.forEach(function (id) {
        var p = byId[id] || nameOf(id);
        var row = node('div', 'award-row');
        row.append(avatarSvg(p.avatar, 40, p.nickname), node('span', 'award-nick', p.nickname));
        box.append(row);
      });
      box.append(node('span', 'award-desc', t(descKey, { n: byId[ids[0]] ? byId[ids[0]][key] : 0 })));
    };
    fillAward(el['award-guess'], a.guess, 'guess', 'awardGuessDesc');
    fillAward(el['award-fool'], a.fool, 'fool', 'awardFoolDesc');

    var ranks = el['score-list'];
    ranks.replaceChildren();
    s.players.slice().sort(function (x, y) { return y.guess - x.guess || y.fool - x.fool; }).forEach(function (p, i) {
      var item = node('li');
      if (i === 0 && p.guess > 0) item.classList.add('first');
      if (p.id === me.id) item.classList.add('me');
      item.append(avatarSvg(p.avatar, 28, p.nickname), node('span', 'name', p.nickname), node('span', 'score', t('rankLine', { g: p.guess, f: p.fool })));
      ranks.append(item);
    });
  }

  function renderQr(url) {
    if (renderedQrUrl === url) return;
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    el['qr-box'].innerHTML = window.Woohop && window.Woohop.qrSvg ? window.Woohop.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    renderedQrUrl = url;
  }

  /* ---------- 按鈕 ---------- */

  function bindRoom() {
    el['start-game'].addEventListener('click', function () {
      track('truths_game_started', { player_count: lastState.players.length, reveal: lastState.reveal });
      send({ t: 'startGame' });
    });
    el['submit-entry'].addEventListener('click', submitEntry);
    // 修改：把送出去的收回來，草稿照送出的內容還原（換過主題的範例從主題庫找回來）
    el['edit-entry'].addEventListener('click', function () {
      if (you.entry && draft) {
        draft.topics = you.entry.items.map(function (it) { return [it.topic, exampleOf(it.topic)]; });
        draft.texts = you.entry.items.map(function (it) { return it.text; });
        draft.fake = you.entry.fake;
        saveDraft();
        buildWriteList();
      }
      send({ t: 'unsubmit' });
    });
    // 提早開始猜會跳過還沒寫好的人，先確認；大家都寫好了不用問（伺服器那時已經自己開始了）
    el['start-guess'].addEventListener('click', function () {
      askConfirm(T.startGuessConfirmTitle, T.startGuessConfirmDesc, T.startGuessButton, function () {
        send({ t: 'endWriting' });
      });
    });
    el['start-guess-ready'].addEventListener('click', function () {
      send({ t: 'startGuess' });
    });
    el['next-turn'].addEventListener('click', function () {
      send({ t: 'nextTurn' });
    });
    el['play-again'].addEventListener('click', function () {
      send({ t: 'playAgain' });
    });
  }

  /* ---------- 離開 / 關閉房間（照搶答：頂欄返回鍵＝離開，開始後先確認） ---------- */

  window.gameBack = function () {
    if (currentView === 'home') location.href = '/' + LANG + '/games/';
    else if (currentView === 'room') confirmExit();
    else if (currentView === 'error') goHome();
    else history.back();
  };

  function confirmExit() {
    var isHost = me && me.host;
    askConfirm(
      isHost ? T.closeConfirmTitle : T.leaveConfirmTitle,
      isHost ? T.closeConfirmDesc : T.leaveConfirmDesc,
      isHost ? T.closeRoomButton : T.leaveRoomButton,
      function () {
        if (isHost) track('truths_room_closed');
        send({ t: isHost ? 'close' : 'leave' });
        goHome();
      },
    );
  }

  function bindExit() {
    el['confirm-cancel'].addEventListener('click', function () { el['confirm-dialog'].close(); });
    el['closed-ok'].addEventListener('click', goHome);
    el['kicked-ok'].addEventListener('click', goHome);
  }

  function askConfirm(title, desc, confirmLabel, onConfirm) {
    if (el['confirm-dialog'].open) el['confirm-dialog'].close();
    el['confirm-title'].textContent = title;
    el['confirm-desc'].textContent = desc;
    var ok = el['confirm-ok'];
    var fresh = ok.cloneNode(true);
    fresh.textContent = confirmLabel;
    ok.parentNode.replaceChild(fresh, ok);
    el['confirm-ok'] = fresh;
    fresh.addEventListener('click', function () {
      el['confirm-dialog'].close();
      onConfirm();
    });
    el['confirm-dialog'].showModal();
  }

  function goHome() {
    giveUp = true;
    location.replace(BASE + '/' + LANG + '/');
  }

  /* ---------- 瀏覽器返回鍵：大廳直接退，開始後先確認（照搶答） ---------- */

  function initHistory() {
    var home = new URL(location.href);
    home.searchParams.delete('room');
    history.replaceState({ view: 'home' }, '', home.toString());
    window.addEventListener('popstate', onPopState);
  }

  function pushRoomEntry(code) {
    var url = new URL(location.href);
    url.searchParams.set('room', code);
    history.pushState({ view: 'room', code: code }, '', url.toString());
  }

  function onPopState() {
    if (!roomCode) return;
    if (giveUp) {
      ['confirm-dialog', 'closed-dialog', 'kicked-dialog'].forEach(function (id) {
        if (el[id].open) el[id].close();
      });
      leaveRoom(false);
      return;
    }
    if (lastState && lastState.started) {
      pushRoomEntry(roomCode);
      confirmExit();
      return;
    }
    leaveRoom(true);
  }

  function leaveRoom(notify) {
    if (notify) {
      var isHost = me && me.host;
      if (isHost) track('truths_room_closed');
      send({ t: isHost ? 'close' : 'leave' });
    }
    giveUp = true;
    clearTimeout(reconnectTimer);
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
      try {
        socket.close();
      } catch (e) {
        /* 已經關了 */
      }
      socket = null;
    }
    clearInterval(timerId);
    timerId = 0;
    hideBanner();
    roomCode = null;
    me = null;
    lastState = null;
    you = { entry: null, isAuthor: false, vote: -1 };
    draft = null;
    prevPhaseKey = '';
    renderedQrUrl = null;
    joinReported = false;
    justCreated = false;
    showView('home');
  }

  // 放在最後：上面的 var（倒數）都賦值完才開始
  init();
})();
