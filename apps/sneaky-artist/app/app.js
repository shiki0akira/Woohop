/*
 * 偷渡畫家的客戶端。純瀏覽器 script，沒有 bundler，架構照搶答（apps/buzzer/app/app.js）：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.SNEAKY 帶進來；房號放在 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 「我是不是主持人」由伺服器在 welcome 回答（clientId 存在 localStorage，重整後還是主持人）。
 * 主持人也是玩家：一樣填暱稱、拿祕密題目、畫、猜，只是房間畫面上多了控場的按鈕（[data-host]）。
 *
 * 畫布（canvas）：
 *   - 一筆 = { id, c: 顏色, p: [[x, y]⋯], by? }，座標是 0～1000 的整數，畫布大小變了也能重畫
 *   - 自己畫：本機先畫，每 SEG_MS 把新的點用 seg 送出去，手指放開送整筆 stroke
 *   - 別人畫：收到 seg 接在同一筆後面、收到 stroke 整筆蓋掉、收到 unstroke 拿掉；strokes 是整張快照（重連、換階段）
 *   - 猜的時候伺服器才會在每一筆帶上 by（誰畫的），只亮目前那一位的筆畫，其他人的淡掉
 */
(function () {
  'use strict';

  var T = window.T;
  var LANG = window.SNEAKY.lang;
  var BASE = window.SNEAKY.base;
  var API_ORIGIN = location.origin === window.SNEAKY.siteOrigin ? window.SNEAKY.workerOrigin : location.origin;

  var CLIENT_KEY = 'woohop-sneaky-client';
  var ROOM_KEY_PREFIX = 'woohop-sneaky-room-';
  var PROFILE_KEY = 'web100-profile'; // 暱稱與頭像跟系列其他遊戲共用同一份
  var CODE_RE = /^[A-Z0-9]{4}$/;
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 8000;
  var SEG_MS = 50;
  var GUESS_MS = { easy: 20000, hard: 30000 }; // 跟 src/room.js 一樣，只拿來畫倒數圈
  var NEXT_MS = 5000; // 公布後幾秒自動換下一位（跟 src/room.js 一樣）
  // 筆的顏色（跟你畫我猜接力一樣：黑、藍、紅、黃、綠），名稱在 locale 的 colorNames
  var INKS = ['#22222c', '#3D54B6', '#E0483B', '#F2B200', '#2E9C78'];

  var socket = null;
  var reconnectTimer = null;
  var reconnectDelay = RECONNECT_MIN_MS;
  var giveUp = false;
  var roomCode = null;
  var me = null; // { id, host, nickname }
  var lastState = null;
  var mySecret = null; // { kind, word }，只有自己收得到
  var pendingNickname = '';
  var currentView = null;
  var currentAvatar = 'initial';
  var renderedQrUrl = null;
  var joinReported = false;
  var justCreated = false; // 剛開房的主持人：填暱稱畫面換一句標題
  var myAnswers = {}; // { '第幾張-第幾位': 答案 }，重連後還記得自己猜了什麼
  var themeDeck = [];

  var el = {};

  function init() {
    cacheElements();
    var profile = readProfile();
    currentAvatar = profile.avatar || 'initial';
    if (profile.nickname) el['nickname'].value = profile.nickname;
    renderAvatarPicker();
    renderColors();
    bindHome();
    bindJoin();
    bindRoom();
    bindCanvas();
    bindExit();

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && roomCode && !giveUp && !isOpen()) connect();
    });
    window.addEventListener('resize', function () {
      if (!el['board'].hidden) fitCanvas();
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
      'round-no', 'theme-text', 'secret-card', 'secret-kind', 'secret-word', 'skip-secret', 'start-drawing', 'skip-theme',
      'board', 'board-title', 'theme-badge', 'secret-badge', 'timer', 'timer-arc', 'timer-num', 'canvas',
      'paint-colors', 'undo', 'end-drawing',
      'guess-me', 'guess-form', 'options', 'hard-guess', 'hint-kind', 'hint-mask', 'answer-input', 'answer-send',
      'answered-mine', 'answered-count',
      'result-title', 'result-answer', 'answer-list', 'nobody', 'next-turn', 'next-wait',
      'scores-title', 'secret-list', 'leaderboard-heading', 'score-list', 'next-round', 'end-game', 'play-again',
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

  function readStore(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null; // 無痕模式或封鎖 storage：功能照走，只是記不住
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* 記不住就算了 */
    }
  }

  function randomId(n) {
    var chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    var out = '';
    for (var i = 0; i < n; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function clientId() {
    var id = readStore(CLIENT_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + randomId(10);
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

  var prep = { mode: 'easy', drawSec: 45 };

  function bindHome() {
    document.querySelectorAll('.mode-choice').forEach(function (b) {
      b.addEventListener('click', function () {
        prep.mode = b.dataset.mode;
        document.querySelectorAll('.mode-choice').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x.dataset.mode === prep.mode));
        });
      });
    });
    document.querySelectorAll('input[name="draw-sec"]').forEach(function (input) {
      input.addEventListener('change', function () { prep.drawSec = Number(input.value); });
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

  /*
   * 複製到剪貼簿。navigator.clipboard 只在 https／localhost 才有：用區網 IP（http）測試、
   * 或某些 App 內建瀏覽器擋掉時，退回舊的 execCommand('copy')（2026-11-04 老闆在手機上按了沒反應）
   */
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
      body: JSON.stringify({ hostId: clientId(), mode: prep.mode, drawSec: prep.drawSec, lang: LANG }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('sneaky_artist_room_created', { mode: prep.mode, draw_seconds: prep.drawSec, room_id: data.code });
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
          track('sneaky_artist_player_joined', { host: me.host });
        }
        hideBanner();
        return;
      case 'state':
        onState(msg.state);
        return;
      case 'secret':
        mySecret = msg.secret;
        render();
        return;
      case 'strokes':
        strokes = msg.strokes;
        current = null;
        scheduleRedraw();
        return;
      case 'seg':
        appendSeg(msg);
        return;
      case 'stroke':
        upsertStroke(msg.stroke);
        return;
      case 'unstroke':
        removeStroke(msg.id);
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
    if (state.phase === 'theme') {
      // 新的一張圖：清掉畫布和自己的復原紀錄
      myStrokeIds = [];
      if (!prev || prev.phase !== 'theme') {
        strokes = [];
        scheduleRedraw();
      }
    }
    if (state.phase === 'guessing') {
      el['answer-input'].value = '';
    }
    if (state.phase === 'drawing' && navigator.vibrate) navigator.vibrate(80);
    // 畫完一張、看到分數：很多團體玩完直接關掉、不會按結束遊戲，靠這個才算得出「真的玩完」的房間。
    // 只在主持人的手機送（狀態是廣播給全場的，每台都送會記好幾次）
    if (state.phase === 'scores' && prev && prev.phase !== 'scores' && me && me.host) {
      track('sneaky_artist_round_finished', { round_number: state.round.n, player_count: state.players.length });
    }
  }

  /* ---------- 倒數：畫、猜都用同一個圈 ---------- */

  var timerId = 0;
  var deadline = 0;
  var totalMs = 1;
  var sentTimeUp = false;

  function syncTimer() {
    var s = lastState;
    var leftMs = 0;
    if (s.phase === 'drawing') {
      leftMs = s.round.drawLeftMs;
      totalMs = s.drawSec * 1000;
    } else if (s.phase === 'guessing') {
      leftMs = s.round.turn.leftMs;
      totalMs = GUESS_MS[s.mode];
    } else if (s.phase === 'reveal') {
      leftMs = s.round.nextLeftMs;
      totalMs = NEXT_MS;
    }
    if (s.phase === 'drawing' || s.phase === 'guessing' || s.phase === 'reveal') {
      deadline = Date.now() + leftMs;
      if (!timerId) timerId = setInterval(tickTimer, 200);
      tickTimer();
    } else {
      clearInterval(timerId);
      timerId = 0;
    }
  }

  function tickTimer() {
    var left = Math.max(0, deadline - Date.now());
    var sec = Math.ceil(left / 1000);
    el['timer-num'].textContent = sec;
    el['timer-arc'].style.strokeDashoffset = String(314.16 * (1 - left / totalMs));
    el['timer'].classList.toggle('is-urgent', sec <= 5 && left > 0);
    if (lastState && lastState.phase === 'reveal') paintNext(sec);
    // 時間到：誰的手機先倒數完都送，伺服器會檢查時間真的到了
    if (left <= 0 && !sentTimeUp && lastState) {
      if (lastState.phase === 'drawing') {
        sentTimeUp = true;
        finishCurrentStroke();
        send({ t: 'endDrawing' });
      } else if (lastState.phase === 'guessing') {
        sentTimeUp = true;
        send({ t: 'endTurn' });
      } else if (lastState.phase === 'reveal') {
        // 公布後 5 秒自動換下一位（老闆 11/04），伺服器檢查時間到了才換
        sentTimeUp = true;
        send({ t: 'nextTurn' });
      }
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
    // 畫的時候整頁不給選取：手機上畫到一半長按很容易反白（老闆 11/04），猜的時候要打字，不能鎖
    document.body.classList.toggle('no-select', s.phase === 'drawing');
    view.classList.toggle('is-host', !!me.host);
    view.querySelectorAll('[data-show]').forEach(function (node) {
      node.hidden = node.getAttribute('data-show').split(' ').indexOf(s.phase) < 0;
    });

    if (s.phase === 'lobby') renderLobby(s);
    if (s.phase === 'theme') renderTheme(s);
    if (s.phase === 'drawing' || s.phase === 'guessing' || s.phase === 'reveal' || s.phase === 'scores') renderBoard(s);
    if (s.phase === 'guessing') renderGuess(s);
    if (s.phase === 'reveal') renderReveal(s);
    if (s.phase === 'scores' || s.phase === 'ended') renderScores(s);
  }

  function renderLobby(s) {
    if (me.host) {
      if (el['host-room-code'].getAttribute('aria-label') !== s.code) {
        el['host-room-code'].replaceChildren();
        Array.from(s.code).forEach(function (ch) {
          var cell = document.createElement('span');
          cell.textContent = ch;
          el['host-room-code'].append(cell);
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
    el['room-tags'].textContent = (s.mode === 'hard' ? T.modeHardTag : T.modeEasyTag) + '・' + t('drawSecTag', { n: s.drawSec });
    renderPlayers(s.players);
  }

  function renderPlayers(players) {
    var list = el['player-list'];
    list.replaceChildren();
    players.forEach(function (player) {
      var item = document.createElement('li');
      item.className = 'player';
      if (!player.online) item.classList.add('is-offline');
      if (player.id === me.id) item.classList.add('is-me');
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = player.nickname;
      item.append(avatarSvg(player.avatar, 32, player.nickname), name);
      if (player.id === lastState.hostId) {
        var hostTag = document.createElement('span');
        hostTag.className = 'badge b-host';
        hostTag.textContent = T.hostBadge;
        item.append(hostTag);
      }
      if (!player.online) {
        var tag = document.createElement('span');
        tag.className = 't-caption';
        tag.textContent = T.offlineTag;
        item.append(tag);
      }
      if (me.host && player.id !== me.id) {
        var kick = document.createElement('button');
        kick.type = 'button';
        kick.className = 'btn btn-sm btn-ghost kick';
        kick.textContent = '✕';
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

  function renderTheme(s) {
    el['round-no'].textContent = t('roundNo', { n: s.round.n });
    el['theme-text'].textContent = s.round.theme;
    el['secret-card'].hidden = !mySecret;
    if (mySecret) {
      el['secret-kind'].textContent = mySecret.kind;
      el['secret-word'].textContent = mySecret.word;
    }
  }

  function renderBoard(s) {
    var r = s.round;
    var title = '';
    highlightId = null;
    if (s.phase === 'drawing') title = T.drawingTitle;
    if (s.phase === 'guessing' || s.phase === 'reveal') {
      highlightId = r.turn.targetId;
      title = t('guessTurn', { k: r.turn.index + 1, total: r.turn.total });
    }
    if (s.phase === 'scores') title = t('roundNo', { n: r.n });
    el['board-title'].textContent = title;
    el['theme-badge'].textContent = r.theme;
    el['secret-badge'].hidden = s.phase !== 'drawing' || !mySecret;
    if (mySecret) el['secret-badge'].textContent = t('mySecretShort', { word: mySecret.word });
    el['timer'].hidden = s.phase !== 'drawing' && s.phase !== 'guessing';
    drawingEnabled = s.phase === 'drawing' && !!mySecret;
    el['canvas'].classList.toggle('is-locked', !drawingEnabled);
    syncTools();
    fitCanvas();
  }

  function renderGuess(s) {
    var turn = s.round.turn;
    var mine = turn.targetId === me.id;
    var target = nameOf(turn.targetId);
    el['board-title'].textContent = mine ? T.guessMineTitle : t('guessTitle', { name: target.nickname });
    el['guess-me'].hidden = !mine;
    el['guess-form'].hidden = mine;

    var key = s.round.n + '-' + turn.index;
    var answered = turn.answered.indexOf(me.id) >= 0;
    var myAnswer = myAnswers[key];

    if (!mine) {
      var easy = s.mode === 'easy';
      el['options'].hidden = !easy;
      el['hard-guess'].hidden = easy || answered;
      if (easy) renderOptions(turn.options, myAnswer, answered, key);
      else {
        el['hint-kind'].textContent = turn.kind;
        renderMask(turn.mask);
      }
      el['answered-mine'].hidden = !answered || easy;
      el['answered-mine'].textContent = t('answeredMine', { text: myAnswer || '…' });
    }
    var total = Object.keys(s.round.names).length - 1;
    el['answered-count'].textContent = t('answeredCount', { n: turn.answered.length, total: total });
  }

  function renderOptions(options, myAnswer, answered, key) {
    var box = el['options'];
    if (box.dataset.key !== key) {
      box.dataset.key = key;
      box.replaceChildren();
      options.forEach(function (text) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-lg btn-secondary option';
        b.textContent = text;
        b.addEventListener('click', function () { submitAnswer(text); });
        box.append(b);
      });
    }
    box.querySelectorAll('.option').forEach(function (b) {
      b.disabled = answered;
      b.classList.toggle('is-picked', b.textContent === myAnswer);
    });
  }

  function renderMask(mask) {
    var box = el['hint-mask'];
    if (box.dataset.mask === mask) return;
    box.dataset.mask = mask;
    box.replaceChildren();
    Array.from(mask).forEach(function (ch) {
      var span = document.createElement('span');
      if (ch === '_') span.className = 'mask-box';
      else if (ch === ' ') span.className = 'mask-space';
      else span.textContent = ch;
      box.append(span);
    });
  }

  function submitAnswer(text) {
    var s = lastState;
    if (!s || s.phase !== 'guessing') return;
    var value = String(text || '').trim();
    if (!value) return;
    myAnswers[s.round.n + '-' + s.round.turn.index] = value;
    send({ t: 'answer', text: value });
    render();
  }

  function renderReveal(s) {
    var res = s.round.result;
    var target = nameOf(res.targetId);
    el['result-title'].textContent = t('answerIs', { name: target.nickname });
    el['result-answer'].textContent = res.word;
    var list = el['answer-list'];
    list.replaceChildren();
    var byId = {};
    res.answers.forEach(function (a) { byId[a.id] = a; });
    s.round.order.forEach(function (id) {
      if (id === res.targetId) return;
      var who = nameOf(id);
      var a = byId[id];
      var item = document.createElement('li');
      item.className = 'answer-item' + (a && a.correct ? ' is-correct' : '');
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = who.nickname;
      var text = document.createElement('span');
      text.className = 'answer-text';
      text.textContent = a ? a.text : T.noAnswer;
      var tag = document.createElement('span');
      tag.className = 'badge ' + (a && a.correct ? 'b-new' : 'b-soon');
      tag.textContent = a && a.correct ? T.correctTag + ' ' + t('gainedLine', { n: res.gained[id] }) : T.wrongTag;
      item.append(avatarSvg(who.avatar, 28, who.nickname), name, text, tag);
      list.append(item);
    });
    var targetGain = res.gained[res.targetId] || 0;
    el['nobody'].hidden = targetGain > 0;
    if (targetGain) {
      var mine = document.createElement('li');
      mine.className = 'answer-item is-artist';
      var n = document.createElement('span');
      n.className = 'name';
      n.textContent = target.nickname;
      var g = document.createElement('span');
      g.className = 'badge b-host';
      g.textContent = t('gainedLine', { n: targetGain });
      mine.append(avatarSvg(target.avatar, 28, target.nickname), n, g);
      list.prepend(mine);
    }
    paintNext(Math.ceil(Math.max(0, deadline - Date.now()) / 1000));
  }

  // 公布後的倒數：主持人的鍵上、玩家的提示上都寫還剩幾秒
  function paintNext(sec) {
    var r = lastState.round;
    var last = r.turn.index + 1 >= r.turn.total;
    el['next-turn'].textContent = t(last ? 'toScoresButton' : 'nextTurnButton', { s: sec });
    el['next-wait'].textContent = t(last ? 'toScoresIn' : 'nextTurnIn', { s: sec });
  }

  function renderScores(s) {
    var ended = s.phase === 'ended';
    el['scores-title'].textContent = ended ? T.endedTitle : T.scoresTitle;
    el['leaderboard-heading'].textContent = ended ? T.finalHeading : T.leaderboardHeading;
    if (!ended) {
      var list = el['secret-list'];
      list.replaceChildren();
      (s.round.results || []).forEach(function (x) {
        var who = nameOf(x.targetId);
        var item = document.createElement('li');
        item.className = 'answer-item';
        var name = document.createElement('span');
        name.className = 'name';
        name.textContent = who.nickname;
        var word = document.createElement('span');
        word.className = 'answer-text';
        word.textContent = x.word;
        var count = document.createElement('span');
        count.className = 't-caption';
        count.textContent = t('correctCount', { n: x.correctCount });
        item.append(avatarSvg(who.avatar, 28, who.nickname), name, word, count);
        list.append(item);
      });
    }
    var ranks = el['score-list'];
    ranks.replaceChildren();
    s.players.slice().sort(function (a, b) { return b.score - a.score; }).forEach(function (p, i) {
      var item = document.createElement('li');
      if (i === 0 && p.score > 0) item.classList.add('first');
      if (p.id === me.id) item.classList.add('me');
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = p.nickname;
      item.append(avatarSvg(p.avatar, 28, p.nickname), name);
      var gained = s.round && s.round.gained[p.id];
      if (!ended && gained) {
        var g = document.createElement('span');
        g.className = 't-caption';
        g.textContent = t('roundGained', { n: gained });
        item.append(g);
      }
      var score = document.createElement('span');
      score.className = 'score';
      score.textContent = t('pointsLabel', { n: p.score });
      item.append(score);
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

  /* ---------- 主持人控場 ---------- */

  // 主題由主持人的手機抽（整副抽完才重洗），送給伺服器
  function nextTheme() {
    var now = lastState && lastState.round ? lastState.round.theme : '';
    if (!themeDeck.length) {
      themeDeck = T.themes.slice();
      for (var i = themeDeck.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = themeDeck[i];
        themeDeck[i] = themeDeck[j];
        themeDeck[j] = tmp;
      }
    }
    var theme = themeDeck.pop();
    return theme === now && themeDeck.length ? themeDeck.pop() : theme;
  }

  function bindRoom() {
    el['start-game'].addEventListener('click', function () {
      track('sneaky_artist_game_started', { player_count: lastState.players.length, mode: lastState.mode });
      send({ t: 'startGame', theme: nextTheme() });
    });
    el['skip-theme'].addEventListener('click', function () {
      send({ t: 'theme', theme: nextTheme() });
    });
    el['skip-secret'].addEventListener('click', function () {
      send({ t: 'skipSecret' });
    });
    el['start-drawing'].addEventListener('click', function () {
      track('sneaky_artist_round_started', { round_number: lastState.round.n, player_count: lastState.players.length });
      send({ t: 'startDrawing' });
    });
    // 提早結束會打斷所有人，先確認（老闆 11/04：怕誤觸）
    el['end-drawing'].addEventListener('click', function () {
      askConfirm(T.endDrawingConfirmTitle, T.endDrawingConfirmDesc, T.endDrawingButton, function () {
        finishCurrentStroke();
        send({ t: 'endDrawing' });
      });
    });
    el['next-turn'].addEventListener('click', function () {
      send({ t: 'nextTurn' });
    });
    el['next-round'].addEventListener('click', function () {
      send({ t: 'nextRound', theme: nextTheme() });
    });
    // 結束遊戲：紅色、要按住 HOLD_MS 才算（跟你畫我猜接力的 .end-btn 同一個做法），鍵盤按 Enter 直接結束
    var HOLD_MS = 800;
    var holdId = 0;
    var endGame = function () {
      cancelHold();
      track('sneaky_artist_game_ended', { rounds: lastState.round.n, player_count: lastState.players.length });
      send({ t: 'endGame' });
    };
    var cancelHold = function () {
      clearTimeout(holdId);
      holdId = 0;
      el['end-game'].classList.remove('is-holding');
    };
    el['end-game'].addEventListener('click', function (event) {
      if (event.detail === 0) endGame();
    });
    el['end-game'].addEventListener('pointerdown', function (event) {
      if (event.button > 0) return;
      cancelHold();
      el['end-game'].classList.add('is-holding');
      holdId = setTimeout(endGame, HOLD_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
      el['end-game'].addEventListener(type, cancelHold);
    });
    el['end-game'].addEventListener('contextmenu', function (event) { event.preventDefault(); });
    el['play-again'].addEventListener('click', function () {
      send({ t: 'nextRound', theme: nextTheme() });
    });
    el['answer-send'].addEventListener('click', function () {
      submitAnswer(el['answer-input'].value);
    });
    el['answer-input'].addEventListener('keydown', function (event) {
      if (event.key === 'Enter') submitAnswer(el['answer-input'].value);
    });
  }

  /* ---------- 畫布 ---------- */

  var strokes = []; // 整張圖：[{ id, c, p, by? }]
  var current = null; // 自己正在畫的那一筆
  var pending = []; // 還沒用 seg 送出去的點
  var segTimer = 0;
  var myStrokeIds = []; // 自己這張畫了哪幾筆（復原用）
  var ink = INKS[0];
  var highlightId = null; // 猜的時候只亮這一位的筆畫
  var drawingEnabled = false;
  var redrawQueued = false;

  function renderColors() {
    INKS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'paint-color';
      b.style.setProperty('--ink', c);
      b.setAttribute('aria-label', T.colorNames[i]);
      b.title = T.colorNames[i];
      b.addEventListener('click', function () {
        ink = c;
        syncColors();
      });
      el['paint-colors'].append(b);
    });
    syncColors();
  }

  function syncColors() {
    Array.prototype.forEach.call(el['paint-colors'].children, function (b, i) {
      b.setAttribute('aria-pressed', String(INKS[i] === ink));
    });
  }

  function syncTools() {
    el['undo'].disabled = !drawingEnabled || !myStrokeIds.length;
  }

  function fitCanvas() {
    var canvas = el['canvas'];
    var r = canvas.getBoundingClientRect();
    if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(r.width * dpr);
    var h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    redraw();
  }

  function scheduleRedraw() {
    if (redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(function () {
      redrawQueued = false;
      redraw();
    });
  }

  function redraw() {
    var canvas = el['canvas'];
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, w * 0.012);
    // 猜的時候先畫淡掉的其他人，再把亮的那一位疊在最上面
    var pass = function (filter, alpha) {
      ctx.globalAlpha = alpha;
      strokes.forEach(function (s) {
        if (!filter(s) || !s.p.length) return;
        ctx.strokeStyle = s.c;
        ctx.beginPath();
        s.p.forEach(function (pt, i) {
          var x = (pt[0] / 1000) * w;
          var y = (pt[1] / 1000) * h;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        if (s.p.length === 1) ctx.lineTo((s.p[0][0] / 1000) * w + 0.1, (s.p[0][1] / 1000) * h);
        ctx.stroke();
      });
    };
    if (highlightId) {
      pass(function (s) { return s.by !== highlightId; }, 0.14);
      pass(function (s) { return s.by === highlightId; }, 1);
    } else {
      pass(function () { return true; }, 1);
    }
    ctx.globalAlpha = 1;
    syncTools();
  }

  function findStroke(id) {
    for (var i = 0; i < strokes.length; i += 1) if (strokes[i].id === id) return i;
    return -1;
  }

  function appendSeg(msg) {
    var i = findStroke(msg.id);
    if (i < 0) strokes.push({ id: msg.id, c: msg.c, p: msg.p.slice() });
    else strokes[i].p = strokes[i].p.concat(msg.p);
    scheduleRedraw();
  }

  function upsertStroke(stroke) {
    var i = findStroke(stroke.id);
    if (i < 0) strokes.push(stroke);
    else strokes[i] = stroke;
    scheduleRedraw();
  }

  function removeStroke(id) {
    var i = findStroke(id);
    if (i >= 0) strokes.splice(i, 1);
    scheduleRedraw();
  }

  function point(e) {
    var r = el['canvas'].getBoundingClientRect();
    return [
      Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 1000),
      Math.round(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) * 1000),
    ];
  }

  function flushSeg() {
    if (!current || !pending.length) return;
    send({ t: 'seg', id: current.id, c: current.c, p: pending });
    pending = [];
  }

  function finishCurrentStroke() {
    if (!current) return;
    clearInterval(segTimer);
    segTimer = 0;
    flushSeg();
    send({ t: 'stroke', id: current.id, c: current.c, p: current.p });
    myStrokeIds.push(current.id);
    current = null;
    syncTools();
  }

  function bindCanvas() {
    var canvas = el['canvas'];
    canvas.addEventListener('pointerdown', function (e) {
      if (!drawingEnabled) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      finishCurrentStroke();
      var pt = point(e);
      current = { id: randomId(10), c: ink, p: [pt] };
      strokes.push(current);
      pending = [pt];
      segTimer = setInterval(flushSeg, SEG_MS);
      scheduleRedraw();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!current) return;
      var pt = point(e);
      var last = current.p[current.p.length - 1];
      // 跟上一個點太近就不記（少送很多點），1000 分之 4 大約是一根頭髮的寬
      if (Math.abs(pt[0] - last[0]) + Math.abs(pt[1] - last[1]) < 4) return;
      current.p.push(pt);
      pending.push(pt);
      scheduleRedraw();
    });
    ['pointerup', 'pointercancel'].forEach(function (type) {
      canvas.addEventListener(type, finishCurrentStroke);
    });
    el['undo'].addEventListener('click', function () {
      var id = myStrokeIds.pop();
      if (!id) return;
      removeStroke(id);
      send({ t: 'undo', id: id });
      syncTools();
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
        if (isHost) track('sneaky_artist_room_closed');
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
      if (isHost) track('sneaky_artist_room_closed');
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
    document.body.classList.remove('no-select');
    hideBanner();
    roomCode = null;
    me = null;
    lastState = null;
    mySecret = null;
    strokes = [];
    myStrokeIds = [];
    prevPhaseKey = '';
    renderedQrUrl = null;
    joinReported = false;
    justCreated = false;
    showView('home');
  }

  // 放在最後：上面的 var（畫布、筆色、倒數）都賦值完才開始
  init();
})();
