/*
 * 數字默契排排站（房間版）的客戶端。純瀏覽器 script，沒有 bundler，架構照兩真一假（apps/truths/app/app.js，那邊照偷渡畫家、搶答）：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.LINEUP 帶進來；房號放在 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 老闆 11/20：大家掃**同一個** QR code 加入、伺服器分配不同的數字、每支手機都看得到題目；主持人用自己那支手機一起玩。
 * 「我是不是主持人」由伺服器在 welcome 回答（clientId 存在 localStorage，重整後還是主持人）。
 *
 * 伺服器每次送 state 都附上 you（只給這支手機的）：這一輪自己的牌（數字、排在第幾張）。共用的 state 只有誰的牌排在第幾張、翻開的那幾張。
 * 老闆 11/20 再加：開房設人數上限、每人 1～3 張（大廳裡主持人選）、大家在手機上把牌排進去、牌的主人一張一張翻（另一頁）、最後展開整排看排錯幾張。
 * 主題是「第幾個」：每一輪主持人的手機從自己的 T.topics 抽三個送上去，大家投票選一個（老闆 11/20），大家照自己那份 T.topics 顯示。
 * 排的時候格子先畫好（一排幾格看螢幕寬度），排進去放最左邊的空格；點自己的牌拿出來（空著不順移），大家都能拖曳換位置；全部排上去之後「我的牌」收起來。
 */
(function () {
  'use strict';

  var T = window.T;
  var LANG = window.LINEUP.lang;
  var BASE = window.LINEUP.base;
  var API_ORIGIN = location.origin === window.LINEUP.siteOrigin ? window.LINEUP.workerOrigin : location.origin;

  var CLIENT_KEY = 'woohop-lineup-client';
  var ROOM_KEY_PREFIX = 'woohop-lineup-room-';
  var PROFILE_KEY = 'web100-profile'; // 暱稱與頭像跟系列其他遊戲共用同一份
  var CODE_RE = /^[A-Z0-9]{4}$/;
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 8000;

  var socket = null;
  var reconnectTimer = null;
  var reconnectDelay = RECONNECT_MIN_MS;
  var giveUp = false;
  var roomCode = null;
  var me = null; // { id, host, nickname }
  var lastState = null;
  var you = { cards: [] };
  var maxPlayers = 10; // 開房時設的人數上限（2～15）
  var revealShownAt = {}; // 翻完的那一輪什麼時候展開整排（最後一張先讓大家看一下）
  var handKey = ''; // 我的牌畫過的樣子，沒變就不重畫（不然按住看數字的時候被廣播洗掉）
  var pendingNickname = '';
  var currentView = null;
  var currentAvatar = 'initial';
  var renderedQrUrl = null;
  var joinReported = false;
  var justCreated = false; // 剛開房的主持人：填暱稱畫面換一句標題
  var topicDeck = [];
  var wakeLock = null;

  var el = {};

  function init() {
    cacheElements();
    var profile = readProfile();
    currentAvatar = profile.avatar || 'initial';
    if (profile.nickname) el['nickname'].value = profile.nickname;
    renderAvatarPicker();
    bindHome();
    bindMaxPlayers();
    bindJoin();
    bindRoom();
    bindExit();

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && roomCode && !giveUp && !isOpen()) connect();
      if (!document.hidden && currentView === 'room') {
        wakeLock = null;
        requestWakeLock();
      }
    });

    var code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    initHistory();
    if (CODE_RE.test(code)) enterRoom(code);
    else showView('home');
  }

  function cacheElements() {
    [
      'view-home', 'view-join', 'view-room', 'view-error',
      'max-stepper', 'max-players-out', 'per-player-tag', 'per-seg', 'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'share-card', 'host-room-code', 'copy-link', 'share-link', 'qr-box',
      'player-count', 'player-list', 'start-game', 'start-need',
      'vote-title', 'vote-count', 'vote-list', 'decide',
      'round-tag', 'topic-name', 'scale-lo', 'scale-hi',
      'line-title', 'line-count', 'line', 'line-hint', 'hand-panel', 'hand', 'hand-wait', 'reveal',
      'flip-panel', 'flip-count', 'flip-pos', 'flip-card', 'flip-num', 'flip-mark', 'flip-who', 'flip-note', 'flip-dots',
      'flip-actions', 'flip', 'flip-wait', 'result', 'result-title', 'result-desc', 'next-round',
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

  function bindHome() {
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

  // 人數上限：設計系統的 .stepper（照喜好二選一），2～15（老闆 11/20：開房設人數，每人幾張進房間再設）
  function bindMaxPlayers() {
    el['max-stepper'].addEventListener('click', function (event) {
      var button = event.target.closest('button[data-step]');
      if (!button) return;
      maxPlayers = Math.min(15, Math.max(2, maxPlayers + Number(button.dataset.step)));
      el['max-players-out'].textContent = String(maxPlayers);
      syncStepper();
    });
    syncStepper();
  }

  function syncStepper() {
    var buttons = el['max-stepper'].querySelectorAll('button[data-step]');
    buttons[0].disabled = maxPlayers <= 2;
    buttons[1].disabled = maxPlayers >= 15;
  }

  function createRoom() {
    hideFieldError(el['create-error']);
    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;
    fetch(API_ORIGIN + BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostId: clientId(), lang: LANG, maxPlayers: maxPlayers }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('lineup_room_created', { room_id: data.code, max_players: maxPlayers });
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
          track('lineup_player_joined', { host: me.host });
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
    // 其他（按了現在不該按的）靜靜忽略，畫面本來就會把按鈕鎖住
  }

  /* ---------- 收到狀態 ---------- */

  var prevPhaseKey = '';

  function onState(state) {
    var prev = lastState;
    lastState = state;
    var r = state.round;
    var key = state.phase + '|' + (r ? r.n : 0);
    if (key !== prevPhaseKey) {
      prevPhaseKey = key;
      onPhaseChange(prev, state);
    }
    render();
  }

  // 換階段時要做一次的事：新的一輪震一下（拿到新數字了）
  function onPhaseChange(prev, state) {
    if (state.phase === 'playing' && navigator.vibrate) navigator.vibrate(60);
    handKey = '';
  }

  /* ---------- 主題：主持人的手機一次抽三個給大家投票（洗牌，抽完才重洗），送「第幾個」上去 ---------- */

  function drawTopics() {
    var avoid = lastState && lastState.round && lastState.round.topic;
    var picks = [];
    var guard = 0;
    while (picks.length < Math.min(3, T.topics.length) && guard < 200) {
      guard += 1;
      if (!topicDeck.length) {
        topicDeck = T.topics.map(function (_, i) { return i; });
        for (var i = topicDeck.length - 1; i > 0; i -= 1) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = topicDeck[i];
          topicDeck[i] = topicDeck[j];
          topicDeck[j] = tmp;
        }
      }
      var n = topicDeck.pop();
      if (picks.indexOf(n) < 0 && n !== avoid) picks.push(n);
    }
    return picks;
  }

  function topicOf(index) {
    return T.topics[index % T.topics.length];
  }

  /* ---------- 房間畫面 ---------- */

  function nameOf(id) {
    var p = lastState.players.filter(function (x) { return x.id === id; })[0];
    return p || { id: id, nickname: '?', avatar: '' };
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
    // [data-host] 只給主持人、[data-player] 只給玩家（data-show 先算，這裡再把不是自己身分的藏起來）
    view.querySelectorAll('[data-host]').forEach(function (n) { if (!me.host) n.hidden = true; });
    view.querySelectorAll('[data-player]').forEach(function (n) { if (me.host) n.hidden = true; });

    if (s.phase === 'lobby') renderLobby(s);
    if (s.phase === 'voting') renderVote(s);
    if (s.phase === 'playing' || s.phase === 'reveal') {
      renderTopic(s);
      renderLine(s);
    }
    if (s.phase === 'playing') renderHand(s);
    if (s.phase === 'reveal') renderFlip(s);
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
    el['per-player-tag'].textContent = t('perPlayerTag', { n: s.perPlayer });
    // 每人幾張（主持人）：人多了 3 張放不下就鎖起來
    el['per-seg'].querySelectorAll('input').forEach(function (input) {
      var n = Number(input.value);
      input.checked = n === s.perPlayer;
      input.disabled = n > s.maxPerPlayer;
      input.parentNode.classList.toggle('is-disabled', input.disabled);
    });
    renderPlayers(el['player-list'], s.players);
  }

  // 名單：大廳可以移出人（照兩真一假）
  function renderPlayers(list, players) {
    list.replaceChildren();
    players.forEach(function (player) {
      var item = node('li', 'player');
      if (!player.online) item.classList.add('is-offline');
      if (player.id === me.id) item.classList.add('is-me');
      item.append(avatarSvg(player.avatar, 32, player.nickname), node('span', 'name', player.nickname));
      if (player.id === lastState.hostId) item.append(node('span', 'badge b-host', T.hostBadge));
      if (!player.online) item.append(node('span', 't-caption', T.offlineTag));
      if (me.host && player.id !== me.id) {
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

  // 投票：三個主題，例子寫在這裡（「1 越不想做（例：寫報告）←→ 100 越想做（例：出國玩）」）。不顯示誰投了什麼（老闆 11/20）
  function renderVote(s) {
    var r = s.round;
    var online = s.players.filter(function (p) { return p.online; }).length;
    el['vote-title'].textContent = t('voteTitle', { n: r.n });
    el['vote-count'].textContent = t('voteCount', { n: r.voted, total: online });
    var key = r.n + '|' + r.options.join(',') + '|' + you.vote;
    if (el['vote-list'].dataset.key === key) return;
    el['vote-list'].dataset.key = key;
    var list = el['vote-list'];
    list.replaceChildren();
    r.options.forEach(function (index, pick) {
      var topic = topicOf(index);
      var b = node('button', 'vote-option');
      b.type = 'button';
      var picked = you.vote === pick;
      b.classList.toggle('is-picked', picked);
      b.setAttribute('aria-pressed', picked ? 'true' : 'false');
      b.append(node('strong', 'vote-name', topic[0]));
      var ends = node('span', 'vote-ends');
      ends.append(voteEnd('1', topic[1], topic[2]), node('span', 'scale-line'), voteEnd('100', topic[3], topic[4]));
      b.append(ends);
      b.addEventListener('click', function () { send({ t: 'vote', pick: pick }); });
      list.append(b);
    });
  }

  function voteEnd(num, word, ex) {
    var end = node('span', 'vote-end');
    end.append(node('b', '', num), node('span', 'vote-word', word), node('span', 'vote-ex', t('exampleLabel', { text: ex })));
    return end;
  }

  // 主題卡：排的時候只有題目和「1 越小 ←→ 100 越大」
  function renderTopic(s) {
    var topic = topicOf(s.round.topic);
    el['round-tag'].textContent = t('roundLabel', { n: s.round.n });
    el['topic-name'].textContent = topic[0];
    el['scale-lo'].textContent = topic[1];
    el['scale-hi'].textContent = topic[3];
  }

  function isMine(card) {
    return card.owner === me.id;
  }

  function myNumber(cardId) {
    var c = (you.cards || []).filter(function (x) { return x.id === cardId; })[0];
    return c ? c.n : null;
  }

  function allPlaced(s) {
    return s.phase === 'playing' && s.round.total > 0 && s.round.placed >= s.round.total;
  }

  // 翻完的那一輪：最後一張先停一下再展開整排（每支手機自己算，晚進來的直接展開）
  var EXPAND_DELAY_MS = 1800;
  function expanded(s) {
    var r = s.round;
    if (s.phase !== 'reveal' || r.flipped < r.line.length) return false;
    if (!revealShownAt[r.n]) {
      revealShownAt[r.n] = Date.now();
      setTimeout(render, EXPAND_DELAY_MS + 50);
    }
    return Date.now() - revealShownAt[r.n] >= EXPAND_DELAY_MS;
  }

  // 大家排的那一排：格子照這一輪的張數先畫好（空的是虛線框，一排幾格看螢幕寬度）；自己的牌直接看得到數字。翻完展開時有數字和對錯
  var dragging = null; // 正在拖的那張：{ id, from, ghost, cells, to, x, y, moved }

  function renderLine(s) {
    if (dragging) return; // 拖到一半不重畫，放開再畫
    var r = s.round;
    var reveal = s.phase === 'reveal';
    var linePanel = el['line'].closest('.line-panel');
    if (reveal && !expanded(s)) {
      linePanel.hidden = true;
      return;
    }
    var full = allPlaced(s);
    el['line-title'].textContent = reveal ? T.flipTitle : T.lineTitle;
    el['line-count'].textContent = t('lineCount', { n: reveal ? r.line.length : r.placed, total: reveal ? r.line.length : r.total });
    var hint = '';
    if (!reveal) {
      if (!r.placed) hint = T.lineEmpty;
      else if (!full) hint = t('linePlacing', { n: r.total - r.placed });
      else hint = T.lineFull;
    }
    el['line-hint'].textContent = hint;
    el['line-hint'].hidden = !hint;
    // 大家都可以拖（老闆 11/20），點自己的牌拿出來
    el['line'].classList.toggle('is-draggable', !reveal && r.placed > 0);
    drawLine(r.line, reveal ? r.line.length : Math.max(r.total, r.line.length), reveal, null);
  }

  // 畫那一排；holder＝拖曳時「會放在這一格」的牌 id（畫成虛線框）
  function drawLine(line, slots, reveal, holder) {
    var list = el['line'];
    list.replaceChildren();
    for (var i = 0; i < slots; i += 1) {
      var card = line[i] || null;
      if (holder && card && card.id === holder) {
        var h = node('li', 'lu-slot is-holder');
        h.dataset.index = String(i);
        h.append(node('span', 'lu-slot-face', ''), node('span', 'lu-slot-who', ''));
        list.append(h);
        continue;
      }
      list.append(slotNode(card, i, reveal));
    }
  }

  function slotNode(card, i, reveal) {
    var li = node('li', 'lu-slot');
    li.dataset.index = String(i);
    if (!card) {
      li.classList.add('is-empty');
      li.append(node('span', 'lu-slot-face', String(i + 1)), node('span', 'lu-slot-who', ''));
      return li;
    }
    var p = nameOf(card.owner);
    li.dataset.card = card.id;
    if (isMine(card)) li.classList.add('is-mine');
    var flipped = card.n != null;
    if (flipped) li.classList.add('is-flipped', card.ok ? 'is-ok' : 'is-bad');
    li.setAttribute('aria-label', t('cardOf', { nickname: p.nickname }) + ' · ' + t('placedAt', { k: i + 1 }) + (flipped ? ' · ' + card.n : ''));
    var face = node('span', 'lu-slot-face');
    face.append(node('span', 'lu-slot-pos', String(i + 1)));
    // 自己的牌直接看得到數字（老闆 11/20），別人的是問號
    var mineN = !flipped && isMine(card) ? myNumber(card.id) : null;
    face.append(node('span', 'lu-slot-num', flipped ? String(card.n) : mineN != null ? String(mineN) : '?'));
    if (flipped) face.append(node('span', 'lu-slot-mark', card.ok ? '✓' : '✗'));
    li.append(face);
    var who = node('span', 'lu-slot-who');
    who.append(avatarSvg(p.avatar, 16, p.nickname), node('span', '', p.nickname));
    li.append(who);
    return li;
  }

  // 我的牌（照數字小到大）：數字直接看得到；沒排的「排進去」（放到下一個空格），排了的顯示第幾張。大家都排完就收起來
  function renderHand(s) {
    var cards = you.cards || [];
    var full = allPlaced(s);
    el['hand-panel'].hidden = full;
    el['hand-wait'].hidden = cards.length > 0;
    var key = s.round.n + '|' + cards.map(function (c) { return c.id + ':' + c.n + ':' + c.at; }).join(',');
    if (key !== handKey) {
      handKey = key;
      var hand = el['hand'];
      hand.replaceChildren();
      cards.forEach(function (c) {
        var col = node('div', 'hand-col');
        var card = node('div', 'hand-card');
        card.append(node('span', 'hand-num', String(c.n)));
        col.append(card);
        if (c.at < 0) {
          var place = node('button', 'btn btn-sm btn-solid hand-place', T.placeButton);
          place.type = 'button';
          place.addEventListener('click', function () { send({ t: 'place', card: c.id }); });
          col.append(place);
        } else {
          col.classList.add('is-placed');
          col.append(node('span', 'hand-at', t('placedAt', { k: c.at + 1 })));
        }
        hand.append(col);
      });
    }
    el['reveal'].disabled = s.round.placed < 1;
  }

  // 翻牌頁（老闆 11/20）：一次一張大牌。還沒翻就是下一張（問號），翻開的那張顯示數字和對錯；全部翻完停一下，展開整排＋結果
  function renderFlip(s) {
    var r = s.round;
    var done = r.flipped >= r.line.length;
    var open = expanded(s);
    el['flip-panel'].hidden = open;
    el['flip-actions'].hidden = done;
    el['result'].hidden = !open;
    if (open) {
      var ok = r.line.length - r.wrong;
      el['result'].classList.toggle('is-perfect', r.wrong === 0);
      el['result-title'].textContent = r.wrong === 0 ? T.resultAllTitle : t('resultWrongTitle', { n: r.wrong });
      el['result-desc'].textContent = r.wrong === 0 ? t('resultAllDesc', { n: r.line.length }) : t('resultWrongDesc', { ok: ok });
      if (me.host && revealedRound !== r.n) {
        revealedRound = r.n;
        track('lineup_revealed', { round_number: r.n, cards: r.line.length, wrong: r.wrong, per_player: s.perPlayer, topic: topicOf(r.topic)[0] });
      }
      return;
    }
    // 大牌：剛翻開的那張（還一張都沒翻就是第一張的背面）
    var showing = r.flipped > 0 ? r.flipped - 1 : 0;
    var card = r.line[showing];
    var shown = card.n != null;
    var owner = nameOf(card.owner);
    el['flip-count'].textContent = t('flipCount', { n: r.flipped, total: r.line.length });
    el['flip-pos'].textContent = t('flipPos', { k: showing + 1 });
    var cardEl = el['flip-card'];
    cardEl.className = 'flip-card' + (shown ? ' is-flipped ' + (card.ok ? 'is-ok' : 'is-bad') : '') + (isMine(card) ? ' is-mine' : '');
    var key = r.n + ':' + r.flipped;
    if (shown && cardEl.dataset.key !== key) {
      // 每翻一張重新跑一次彈出來的動畫
      cardEl.dataset.key = key;
      cardEl.classList.remove('is-pop');
      void cardEl.offsetWidth;
      cardEl.classList.add('is-pop');
    }
    el['flip-num'].textContent = shown ? String(card.n) : isMine(card) && myNumber(card.id) != null ? String(myNumber(card.id)) : '?';
    el['flip-mark'].textContent = shown ? (card.ok ? '✓' : '✗') : '';
    el['flip-who'].replaceChildren(avatarSvg(owner.avatar, 24, owner.nickname), node('span', '', owner.nickname));
    var prevMax = 0;
    for (var i = 0; i < showing; i += 1) prevMax = Math.max(prevMax, r.line[i].n || 0);
    el['flip-note'].textContent = showing === 0 ? T.flipNoteFirst : t('flipNoteMax', { n: prevMax });
    // 進度：一張一個點，翻開的有對錯顏色
    var dots = el['flip-dots'];
    dots.replaceChildren();
    r.line.forEach(function (c, i) {
      var d = node('li', 'flip-dot');
      if (c.n != null) d.classList.add(c.ok ? 'is-ok' : 'is-bad');
      if (i === showing) d.classList.add('is-current');
      dots.append(d);
    });
    if (done) return;
    var next = r.line[r.flipped];
    var nextOwner = nameOf(next.owner);
    var mine = isMine(next);
    el['flip'].hidden = !mine && !me.host;
    el['flip'].textContent = mine ? T.flipMine : t('flipFor', { nickname: nextOwner.nickname });
    el['flip-wait'].hidden = mine;
    el['flip-wait'].textContent = t('flipWait', { nickname: nextOwner.nickname });
  }

  function renderQr(url) {
    if (renderedQrUrl === url) return;
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    el['qr-box'].innerHTML = window.Woohop && window.Woohop.qrSvg ? window.Woohop.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    renderedQrUrl = url;
  }

  /* ---------- 螢幕保持亮著（拿著手機排隊、聊天很久） ---------- */

  function requestWakeLock() {
    if (!navigator.wakeLock || wakeLock) return;
    navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }).catch(function () {});
  }

  /* ---------- 按鈕 ---------- */

  var revealedRound = 0; // 這一輪已經送過「全部翻完」的 GA 了

  function bindRoom() {
    el['start-game'].addEventListener('click', function () {
      track('lineup_game_started', { player_count: lastState.players.length, per_player: lastState.perPlayer });
      send({ t: 'startGame', topics: drawTopics() });
      requestWakeLock();
    });
    el['decide'].addEventListener('click', function () { send({ t: 'decide' }); });
    el['per-seg'].addEventListener('change', function (e) {
      if (e.target.name === 'per') send({ t: 'setPerPlayer', n: Number(e.target.value) });
    });
    // 開始翻：還有牌沒排進去就先問（那幾張這一輪不算）
    el['reveal'].addEventListener('click', function () {
      var r = lastState.round;
      var left = r.total - r.placed;
      if (left > 0) {
        askConfirm(t('revealNotAllTitle', { n: left }), T.revealNotAllDesc, T.revealButton, function () { send({ t: 'reveal' }); });
        return;
      }
      send({ t: 'reveal' });
    });
    el['flip'].addEventListener('click', function () { send({ t: 'flip' }); });
    el['next-round'].addEventListener('click', function () {
      send({ t: 'nextRound', topics: drawTopics() });
    });

    bindLine();
  }

  /*
   * 那一排（老闆 11/20）：大家都可以拖曳換位置；點自己排進去的牌就拿出來（那一格空著，其他不動）。
   * 拖的時候牌變成跟著手指走的浮動卡，格子的位置在開始拖時記下來（格子是固定的，不會跟著內容跑），
   * 手指在哪一格，就照伺服器同一套規則（moveTo：牌落在那一格，擋路的往最近的空格擠）預覽，那一格畫成虛線框
   */
  function bindLine() {
    var list = el['line'];
    list.addEventListener('contextmenu', function (e) { if (e.target.closest('.lu-slot')) e.preventDefault(); });
    list.addEventListener('pointerdown', function (e) {
      var li = e.target.closest('.lu-slot');
      if (!li || !li.dataset.card || e.button > 0 || !list.classList.contains('is-draggable')) return;
      e.preventDefault();
      dragging = { id: li.dataset.card, from: Number(li.dataset.index), el: li, x: e.clientX, y: e.clientY, moved: false, to: Number(li.dataset.index) };
      // 移動、放開掛在 window：拖的時候那一排會重畫，事件不能靠原本那格冒泡
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
    var move = function (e) {
      if (!dragging) return;
      var d = dragging;
      if (!d.moved) {
        if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 8) return;
        startDrag(d);
      }
      d.ghost.style.transform = 'translate(' + (e.clientX - d.x) + 'px,' + (e.clientY - d.y) + 'px)';
      var k = cellAt(d.cells, e.clientX, e.clientY);
      if (k < 0 || k === d.to) return;
      d.to = k;
      previewLine(d);
    };
    var end = function (e) {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      if (!dragging) return;
      var d = dragging;
      dragging = null;
      if (d.ghost) d.ghost.remove();
      if (d.moved) {
        if (e.type === 'pointerup' && d.to !== d.from) send({ t: 'moveTo', card: d.id, to: d.to });
      } else if (e.type === 'pointerup' && d.el.classList.contains('is-mine')) {
        // 沒有拖、點的是自己的牌：拿出來
        send({ t: 'takeOut', card: d.id });
      }
      render();
    };
  }

  // 開始拖：記下每一格的位置，牌變成 body 上跟著手指走的浮動卡，原本那格畫成虛線框
  function startDrag(d) {
    d.moved = true;
    d.cells = Array.prototype.map.call(el['line'].children, function (n) { return n.getBoundingClientRect(); });
    var rect = d.el.getBoundingClientRect();
    var ghost = d.el.cloneNode(true);
    ghost.classList.add('lu-ghost');
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    document.body.append(ghost);
    d.ghost = ghost;
    previewLine(d);
  }

  function cellAt(cells, x, y) {
    for (var i = 0; i < cells.length; i += 1) {
      var r = cells[i];
      if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4) return i;
    }
    return -1;
  }

  // 照 moveTo 的規則（跟 src/game.js 同一套）算出放下去之後的樣子，畫出來
  function previewLine(d) {
    var r = lastState.round;
    var line = r.line.map(function (c) { return c ? c.id : null; });
    var slots = Math.max(r.total, line.length);
    if (d.to !== d.from) moveToLocal(line, d.id, d.to);
    var byId = {};
    r.line.forEach(function (c) { if (c) byId[c.id] = c; });
    drawLine(line.map(function (id) { return id ? byId[id] : null; }), slots, false, d.id);
  }

  function moveToLocal(line, id, k) {
    var at = line.indexOf(id);
    if (at < 0 || k === at) return;
    line[at] = null;
    while (line.length <= k) line.push(null);
    if (line[k] == null) { line[k] = id; return; }
    var right = -1;
    var left = -1;
    var i;
    for (i = k + 1; i < line.length; i += 1) if (line[i] == null) { right = i; break; }
    for (i = k - 1; i >= 0; i -= 1) if (line[i] == null) { left = i; break; }
    if (right < 0 && left < 0) { line.push(null); right = line.length - 1; }
    if (right >= 0 && (left < 0 || right - k <= k - left)) for (i = right; i > k; i -= 1) line[i] = line[i - 1];
    else for (i = left; i < k; i += 1) line[i] = line[i + 1];
    line[k] = id;
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
        if (isHost) track('lineup_room_closed');
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
      if (isHost) track('lineup_room_closed');
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
    hideBanner();
    roomCode = null;
    me = null;
    lastState = null;
    you = { cards: [] };
    handKey = '';
    dragging = null;
    revealShownAt = {};
    prevPhaseKey = '';
    renderedQrUrl = null;
    joinReported = false;
    justCreated = false;
    showView('home');
  }

  // 放在最後：上面的 var 都賦值完才開始
  init();
})();
