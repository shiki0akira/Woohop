/*
 * 數字默契排排站（房間版）的客戶端。純瀏覽器 script，沒有 bundler，架構照兩真一假（apps/truths/app/app.js，那邊照偷渡畫家、搶答）：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.LINEUP 帶進來；房號放在 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 老闆 11/20：大家掃**同一個** QR code 加入、伺服器分配不同的數字、每支手機都看得到題目；主持人用自己那支手機一起玩。
 * 「我是不是主持人」由伺服器在 welcome 回答（clientId 存在 localStorage，重整後還是主持人）。
 *
 * 伺服器每次送 state 都附上 you（只給這支手機的）：這一輪自己的牌（數字、排在第幾張）。共用的 state 只有誰的牌排在第幾張、翻開的那幾張。
 * 老闆 11/20 再加：每人 1～3 張（開房時選）、大家在手機上把牌排進去、牌的主人一張一張翻、最後看排錯幾張。
 * 主題是「第幾個」：每一輪主持人的手機從自己的 T.topics 抽三個送上去，大家投票選一個（老闆 11/20），大家照自己那份 T.topics 顯示。
 * 排的時候一排 6 格、格子先畫好，排進去從第一格往後填；全部排上去之後「我的牌」收起來，只有主持人能拖曳換順序。
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
  var perPlayer = 1; // 開房時選的每人幾張牌
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
    bindPerPlayer();
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
      'per-stepper', 'per-player-out', 'per-player-tag', 'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'share-card', 'host-room-code', 'copy-link', 'share-link', 'qr-box',
      'player-count', 'player-list', 'start-game', 'start-need',
      'vote-title', 'vote-count', 'vote-list', 'decide',
      'round-tag', 'topic-name', 'scale-lo', 'scale-hi',
      'line-title', 'line-count', 'line', 'line-hint', 'hand-panel', 'hand', 'hand-wait', 'reveal',
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

  // 每人幾張牌：設計系統的 .stepper（照喜好二選一的人數上限），1～3
  function bindPerPlayer() {
    el['per-stepper'].addEventListener('click', function (event) {
      var button = event.target.closest('button[data-step]');
      if (!button) return;
      perPlayer = Math.min(3, Math.max(1, perPlayer + Number(button.dataset.step)));
      el['per-player-out'].textContent = String(perPlayer);
      syncStepper();
    });
    syncStepper();
  }

  function syncStepper() {
    var buttons = el['per-stepper'].querySelectorAll('button[data-step]');
    buttons[0].disabled = perPlayer <= 1;
    buttons[1].disabled = perPlayer >= 3;
  }

  function createRoom() {
    hideFieldError(el['create-error']);
    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;
    fetch(API_ORIGIN + BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostId: clientId(), lang: LANG, perPlayer: perPlayer }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('lineup_room_created', { room_id: data.code, per_player: perPlayer });
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

  // 投票：三個主題（例子寫在這裡），每個選項下面是投它的人
  function renderVote(s) {
    var r = s.round;
    var votes = r.votes || {};
    var voted = Object.keys(votes).length;
    var online = s.players.filter(function (p) { return p.online; }).length;
    el['vote-title'].textContent = t('voteTitle', { n: r.n });
    el['vote-count'].textContent = t('voteCount', { n: voted, total: online });
    var list = el['vote-list'];
    list.replaceChildren();
    r.options.forEach(function (index, pick) {
      var topic = topicOf(index);
      var b = node('button', 'vote-option');
      b.type = 'button';
      if (votes[me.id] === pick) b.classList.add('is-picked');
      b.setAttribute('aria-pressed', votes[me.id] === pick ? 'true' : 'false');
      b.append(node('strong', 'vote-name', topic[0]));
      var ends = node('span', 'vote-ends');
      var lo = node('span', 'vote-end');
      lo.append(node('b', '', '1'), document.createTextNode(t('voteEnd', { lo: topic[1], ex: topic[2] })));
      var hi = node('span', 'vote-end');
      hi.append(node('b', '', '100'), document.createTextNode(t('voteEnd', { lo: topic[3], ex: topic[4] })));
      ends.append(lo, hi);
      b.append(ends);
      var voters = node('span', 'vote-voters');
      Object.keys(votes).forEach(function (id) {
        if (votes[id] !== pick) return;
        var p = nameOf(id);
        voters.append(avatarSvg(p.avatar, 22, p.nickname));
      });
      b.append(voters);
      b.addEventListener('click', function () { send({ t: 'vote', pick: pick }); });
      list.append(b);
    });
    el['decide'].disabled = false;
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
    return s.phase === 'playing' && s.round.total > 0 && s.round.line.length >= s.round.total;
  }

  // 大家排的那一排：一排 6 格，格子照這一輪的張數先畫好（空的是虛線框），翻開的有數字和對錯
  var dragging = null; // 主持人正在拖的那張：{ id, from, el, x, y, moved }
  var selected = null; // 主持人點選要換位置的那張（不用拖的方式）

  function renderLine(s) {
    if (dragging) return; // 拖到一半不重畫，放開再畫
    var r = s.round;
    var reveal = s.phase === 'reveal';
    var full = allPlaced(s);
    el['line-title'].textContent = reveal ? T.flipTitle : T.lineTitle;
    el['line-count'].textContent = t('lineCount', { n: reveal ? r.flipped : r.line.length, total: reveal ? r.line.length : r.total });
    var hint = '';
    if (!reveal) {
      if (!r.line.length) hint = T.lineEmpty;
      else if (!full) hint = t('linePlacing', { n: r.total - r.line.length });
      else hint = me.host ? T.lineFullHost : T.lineFull;
    }
    el['line-hint'].textContent = hint;
    el['line-hint'].hidden = !hint;
    if (selected && r.line.map(function (c) { return c.id; }).indexOf(selected) < 0) selected = null;
    var canDrag = me.host && !reveal && r.line.length > 1;
    var list = el['line'];
    list.classList.toggle('is-draggable', canDrag);
    list.replaceChildren();
    var slots = reveal ? r.line.length : Math.max(r.total, r.line.length);
    for (var i = 0; i < slots; i += 1) {
      var card = r.line[i];
      var li = node('li', 'lu-slot');
      li.dataset.index = String(i);
      if (!card) {
        li.classList.add('is-empty');
        li.append(node('span', 'lu-slot-face', String(i + 1)), node('span', 'lu-slot-who', ''));
        list.append(li);
        continue;
      }
      var p = nameOf(card.owner);
      li.dataset.card = card.id;
      if (isMine(card)) li.classList.add('is-mine');
      if (card.id === selected) li.classList.add('is-selected');
      var flipped = card.n != null;
      if (flipped) li.classList.add('is-flipped', card.ok ? 'is-ok' : 'is-bad');
      if (reveal && i === r.flipped) li.classList.add('is-next');
      li.setAttribute('aria-label', t('cardOf', { nickname: p.nickname }) + ' · ' + t('placedAt', { k: i + 1 }) + (flipped ? ' · ' + card.n : ''));
      var face = node('span', 'lu-slot-face');
      face.append(node('span', 'lu-slot-pos', String(i + 1)));
      // 自己的牌按住也看得到數字（「我的牌」收起來之後還能看）
      var mineN = !flipped && isMine(card) ? myNumber(card.id) : null;
      face.append(node('span', 'lu-slot-num', flipped ? String(card.n) : '?'));
      if (mineN != null) face.append(node('span', 'lu-slot-peek', String(mineN)));
      if (flipped) face.append(node('span', 'lu-slot-mark', card.ok ? '✓' : '✗'));
      li.append(face);
      var who = node('span', 'lu-slot-who');
      who.append(avatarSvg(p.avatar, 16, p.nickname), node('span', '', p.nickname));
      li.append(who);
      list.append(li);
    }
  }

  // 我的牌（照數字小到大）：按住看數字；沒排的「排進去」（放到下一個空格），排了的顯示第幾張。大家都排完就收起來
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
      hand.style.setProperty('--hand-count', String(Math.max(1, cards.length)));
      cards.forEach(function (c) {
        var col = node('div', 'hand-col');
        var card = node('button', 'hand-card');
        card.type = 'button';
        card.setAttribute('aria-label', T.holdHint);
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
    el['reveal'].disabled = s.round.line.length < 1;
  }

  // 翻牌：下一張的主人翻（主持人可以幫忙）；全部翻完換成結果
  function renderFlip(s) {
    var r = s.round;
    var done = r.flipped >= r.line.length;
    el['flip-actions'].hidden = done;
    el['result'].hidden = !done;
    if (done) {
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
    var next = r.line[r.flipped];
    var owner = nameOf(next.owner);
    var mine = isMine(next);
    el['flip'].hidden = !mine && !me.host;
    el['flip'].textContent = mine ? T.flipMine : t('flipFor', { nickname: owner.nickname });
    el['flip-wait'].hidden = mine;
    el['flip-wait'].textContent = t('flipWait', { nickname: owner.nickname });
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
    // 開始翻：還有牌沒排進去就先問（那幾張這一輪不算）
    el['reveal'].addEventListener('click', function () {
      var r = lastState.round;
      var left = r.total - r.line.length;
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

    // 我的牌：按住看、放開蓋起來（事件掛在外層，牌重畫也不用重綁）；鍵盤（沒有按住可言）就是按一下切換
    var hand = el['hand'];
    hand.addEventListener('pointerdown', function (e) {
      var card = e.target.closest('.hand-card');
      if (!card || e.button > 0) return;
      e.preventDefault();
      card.classList.add('is-open');
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* 舊瀏覽器 */ }
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      hand.addEventListener(type, function (e) {
        var card = e.target.closest && e.target.closest('.hand-card');
        if (card) card.classList.remove('is-open');
      });
    });
    hand.addEventListener('click', function (e) {
      var card = e.target.closest('.hand-card');
      if (card && e.detail === 0) card.classList.toggle('is-open');
    });
    hand.addEventListener('contextmenu', function (e) { if (e.target.closest('.hand-card, .lu-slot')) e.preventDefault(); });
    bindLine();
  }

  /*
   * 那一排：自己的牌按住看數字；主持人（排的時候）可以拖曳換位置，或點一張、再點要放的格子。
   * 拖的時候那張牌跟著手指走，放開時手指下面是哪一格就放到哪一格（moveTo，其他照順序往後擠）
   */
  function bindLine() {
    var list = el['line'];
    list.addEventListener('contextmenu', function (e) { if (e.target.closest('.lu-slot')) e.preventDefault(); });
    list.addEventListener('pointerdown', function (e) {
      var li = e.target.closest('.lu-slot');
      if (!li || !li.dataset.card || e.button > 0) return;
      var canDrag = list.classList.contains('is-draggable');
      if (li.classList.contains('is-mine')) li.classList.add('is-peek');
      if (!canDrag && !li.classList.contains('is-mine')) return;
      e.preventDefault();
      dragging = { id: li.dataset.card, from: Number(li.dataset.index), el: li, x: e.clientX, y: e.clientY, moved: false, canDrag: canDrag };
      try { li.setPointerCapture(e.pointerId); } catch (err) { /* 舊瀏覽器 */ }
    });
    list.addEventListener('pointermove', function (e) {
      if (!dragging || !dragging.canDrag) return;
      var dx = e.clientX - dragging.x;
      var dy = e.clientY - dragging.y;
      if (!dragging.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      dragging.moved = true;
      dragging.el.classList.remove('is-peek');
      dragging.el.classList.add('is-dragging');
      dragging.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      var target = slotAt(e.clientX, e.clientY);
      list.querySelectorAll('.is-drop').forEach(function (n) { n.classList.remove('is-drop'); });
      if (target && target !== dragging.el) target.classList.add('is-drop');
    });
    var end = function (e) {
      if (!dragging) return;
      var d = dragging;
      dragging = null;
      d.el.classList.remove('is-peek', 'is-dragging');
      d.el.style.transform = '';
      if (d.moved) {
        var target = e.type === 'pointerup' ? slotAt(e.clientX, e.clientY) : null;
        if (target && target !== d.el) send({ t: 'moveTo', card: d.id, to: Number(target.dataset.index) });
        selected = null;
        render();
        return;
      }
      // 沒有拖：主持人點一張選起來，再點另一格就放過去
      if (d.canDrag && e.type === 'pointerup') {
        if (selected && selected !== d.id) {
          send({ t: 'moveTo', card: selected, to: d.from });
          selected = null;
        } else {
          selected = selected === d.id ? null : d.id;
        }
      }
      render();
    };
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
    // 選了一張之後點空格（排的時候後面的虛線框）也算
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.lu-slot.is-empty');
      if (!li || !selected) return;
      send({ t: 'moveTo', card: selected, to: Number(li.dataset.index) });
      selected = null;
    });
  }

  function slotAt(x, y) {
    var hit = document.elementsFromPoint(x, y);
    for (var i = 0; i < hit.length; i += 1) {
      var li = hit[i].closest && hit[i].closest('.lu-slot');
      if (li && !li.classList.contains('is-dragging') && el['line'].contains(li)) return li;
    }
    return null;
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
    selected = null;
    prevPhaseKey = '';
    renderedQrUrl = null;
    joinReported = false;
    justCreated = false;
    showView('home');
  }

  // 放在最後：上面的 var 都賦值完才開始
  init();
})();
