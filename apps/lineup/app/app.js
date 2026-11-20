/*
 * 數字默契排排站（房間版）的客戶端。純瀏覽器 script，沒有 bundler，架構照兩真一假（apps/truths/app/app.js，那邊照偷渡畫家、搶答）：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.LINEUP 帶進來；房號放在 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 老闆 11/20：大家掃**同一個** QR code 加入、伺服器分配不同的數字、每支手機都看得到題目；主持人用自己那支手機一起玩。
 * 「我是不是主持人」由伺服器在 welcome 回答（clientId 存在 localStorage，重整後還是主持人）。
 *
 * 伺服器每次送 state 都附上 you（只給這支手機的）：這一輪自己的數字。共用的 state 只有翻開的那幾張。
 * 主題是「第幾個」：主持人的手機從自己的 T.topics 抽、送上去，大家照自己那份 T.topics 顯示。
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
  var you = { number: null };
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
      'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'share-card', 'host-room-code', 'copy-link', 'share-link', 'qr-box',
      'player-count', 'player-list', 'start-game', 'start-need',
      'round-tag', 'topic-name', 'scale-lo', 'scale-lo-ex', 'scale-hi', 'scale-hi-ex', 'topic-shuffle',
      'you-card', 'you-number', 'you-hold', 'you-hint', 'reveal',
      'flip-count', 'mine-line', 'lineup', 'reveal-done', 'flip', 'next-round', 'wait-flip',
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

  function createRoom() {
    hideFieldError(el['create-error']);
    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;
    fetch(API_ORIGIN + BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostId: clientId(), lang: LANG }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('lineup_room_created', { room_id: data.code });
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
    setOpen(false);
  }

  /* ---------- 主題：主持人的手機抽（洗牌，抽完才重洗），送「第幾個」上去 ---------- */

  function drawTopic(avoid) {
    if (!topicDeck.length) {
      topicDeck = T.topics.map(function (_, i) { return i; });
      for (var i = topicDeck.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = topicDeck[i];
        topicDeck[i] = topicDeck[j];
        topicDeck[j] = tmp;
      }
      if (topicDeck.length > 1 && topicDeck[topicDeck.length - 1] === avoid) topicDeck.unshift(topicDeck.pop());
    }
    return topicDeck.pop();
  }

  function currentTopic() {
    var r = lastState && lastState.round;
    return r ? r.topic : -1;
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
    if (s.phase === 'playing' || s.phase === 'reveal') renderTopic(s);
    if (s.phase === 'playing') renderYou(s);
    if (s.phase === 'reveal') renderReveal(s);
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

  // 主題卡：每支手機都一樣（主持人多一顆骰子）
  function renderTopic(s) {
    var topic = T.topics[s.round.topic % T.topics.length];
    el['round-tag'].textContent = t('roundLabel', { n: s.round.n });
    el['topic-name'].textContent = topic[0];
    el['scale-lo'].textContent = topic[1];
    el['scale-lo-ex'].textContent = t('exampleLabel', { text: topic[2] });
    el['scale-hi'].textContent = topic[3];
    el['scale-hi-ex'].textContent = t('exampleLabel', { text: topic[4] });
  }

  // 自己的數字：按住才看得到（公布中才加入的人這一輪沒有數字）
  function renderYou(s) {
    var has = you.number != null;
    el['you-number'].textContent = has ? you.number : '';
    el['you-card'].disabled = !has;
    el['you-hold'].textContent = has ? T.youHold : T.youWaitNext;
    el['reveal'].disabled = s.round.total < 1;
  }

  function setOpen(open) {
    if (el['you-card']) el['you-card'].classList.toggle('is-open', open);
  }

  // 公布：翻開的那幾張（第 k 位、誰、幾號）＋還沒翻的空格
  function renderReveal(s) {
    var r = s.round;
    var opened = r.flipped.length;
    el['flip-count'].textContent = t('flipCount', { n: opened, total: r.total });
    el['mine-line'].textContent = you.number != null ? t('mineLine', { n: you.number }) : '';
    el['mine-line'].hidden = you.number == null;
    var list = el['lineup'];
    list.replaceChildren();
    for (var i = 0; i < r.total; i += 1) {
      var card = r.flipped[i];
      var li = node('li', card ? 'is-flipped' : '');
      li.append(node('span', 'place', t('placeLabel', { k: i + 1 })));
      var face = node('span', 'num', card ? String(card.n) : '?');
      li.append(face);
      if (card) {
        var p = nameOf(card.id);
        if (card.id === me.id) li.classList.add('is-me');
        var who = node('span', 'who');
        who.append(avatarSvg(p.avatar, 22, p.nickname), node('span', '', p.nickname));
        li.append(who);
      }
      list.append(li);
    }
    var done = opened >= r.total;
    el['reveal-done'].hidden = !done;
    if (me.host) {
      el['flip'].hidden = done;
      el['next-round'].hidden = !done;
    }
    el['wait-flip'].hidden = me.host || done;
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
      track('lineup_game_started', { player_count: lastState.players.length });
      send({ t: 'startGame', topic: drawTopic(-1) });
      requestWakeLock();
    });
    el['topic-shuffle'].addEventListener('click', function () {
      var topic = drawTopic(currentTopic());
      send({ t: 'setTopic', topic: topic });
      track('lineup_topic_changed', { round_number: lastState.round.n, topic: T.topics[topic][0] });
    });
    el['reveal'].addEventListener('click', function () { send({ t: 'reveal' }); });
    el['flip'].addEventListener('click', function () {
      send({ t: 'flip' });
      var r = lastState.round;
      if (r.flipped.length + 1 >= r.total && revealedRound !== r.n) {
        revealedRound = r.n;
        track('lineup_revealed', { round_number: r.n, player_count: r.total, topic: T.topics[r.topic % T.topics.length][0] });
      }
    });
    el['next-round'].addEventListener('click', function () {
      send({ t: 'nextRound', topic: drawTopic(currentTopic()) });
    });

    // 自己的數字：按住看、放開蓋起來；鍵盤（沒有按住可言）就是按一下切換
    var card = el['you-card'];
    card.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || card.disabled) return;
      e.preventDefault();
      setOpen(true);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
      card.addEventListener(type, function () { setOpen(false); });
    });
    card.addEventListener('click', function (e) {
      if (e.detail === 0) setOpen(!card.classList.contains('is-open'));
    });
    card.addEventListener('contextmenu', function (e) { e.preventDefault(); });
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
    you = { number: null };
    prevPhaseKey = '';
    renderedQrUrl = null;
    joinReported = false;
    justCreated = false;
    showView('home');
  }

  // 放在最後：上面的 var 都賦值完才開始
  init();
})();
