/*
 * 搶答遊戲的客戶端。純瀏覽器 script，沒有 bundler：
 * 文案由 build.js 內嵌成 window.T，語言/路徑由 window.BUZZER 帶進來。
 *
 * 四個畫面（首頁 / 填暱稱 / 主持人 / 玩家）都在同一份 HTML 裡，靠 showView() 切換，
 * 房間代碼放在查詢字串 ?room=XXXX——QR code 掃進來就是這個網址。
 *
 * 「我是主持人還是玩家」不由前端決定：連上 WebSocket 送 hello 之後，
 * 由 Durable Object 比對 clientId 跟房間的 hostId 回答。主持人重整頁面也是走同一條路，
 * clientId 存在 localStorage，所以重整後還是主持人。
 */
(function () {
  'use strict';

  var T = window.T;
  var LANG = window.BUZZER.lang;
  var BASE = window.BUZZER.base;

  // 正式網域上的頁面是 Vercel rewrite 代理過來的，WebSocket 過不了那層代理，
  // 所以 API 與 WebSocket 都直連 Worker 自己的網址（Worker 有開對應的 CORS）。
  // 本機開發、區網測試、直接開 workers.dev 都維持同源，不受影響。
  var API_ORIGIN =
    location.origin === window.BUZZER.siteOrigin ? window.BUZZER.workerOrigin : location.origin;

  var CLIENT_KEY = 'web100-buzzer-client';
  var ROOM_KEY_PREFIX = 'web100-buzzer-room-';

  var CODE_RE = /^[A-Z0-9]{4}$/;
  var MIN_PLAYERS = 2;
  var MAX_PLAYERS = 30;
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 8000;

  var socket = null;
  var reconnectTimer = null;
  var reconnectDelay = RECONNECT_MIN_MS;
  var giveUp = false; // 致命錯誤（房間不存在、人數滿了）之後就不要再重連
  var roomCode = null;
  var me = null; // { id, role, nickname }
  var lastState = null;
  var pendingNickname = '';
  var questionSynced = false; // 主持人重整後只從伺服器補一次題目，之後以他正在打的內容為準
  var renderedQrUrl = null;
  var currentView = null;
  var countdownDeadline = 0; // 本機時鐘上的倒數結束時刻
  var countdownTimer = null;
  var joinReported = false; // GA4 的加入事件只算第一次，重連不重複計
  var buzzReported = false; // 這一輪的搶答事件是否已經送過

  var el = {};

  init();

  function init() {
    cacheElements();
    // 頭像要在畫選擇器之前決定：沒挑過的人用 clientId 推一個，不會每次重整換一張臉
    currentAvatar = readProfile().avatar || defaultAvatar();
    renderAvatarPicker();
    // 深淺色與語言切換在 header.js（規則頁也要用），這裡只管遊戲本身
    bindHome();
    bindJoin();
    bindHost();
    bindPlay();
    bindExit();

    document.addEventListener('visibilitychange', function () {
      // 手機鎖屏或切到別的 App 時連線常被系統收掉，回來時馬上補連，不要等退避計時器
      if (!document.hidden && roomCode && !giveUp && !isOpen()) connect();
    });

    // 先把網址上的房號讀下來：initHistory 會把 ?room= 從網址上拿掉
    var code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    initHistory();

    if (CODE_RE.test(code)) {
      enterRoom(code);
    } else {
      showView('home');
    }
  }

  function cacheElements() {
    [
      'view-home', 'view-join', 'view-host', 'view-play', 'view-error',
      'max-players', 'create-room', 'create-error', 'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'host-room-code', 'share-url', 'copy-link', 'qr-box',
      'player-count', 'player-list', 'player-empty',
      'question', 'show-question', 'start-buzz', 'reset-round',
      'host-rank-list', 'host-rank-empty',
      'play-title', 'play-desc', 'play-question', 'play-question-text',
      'buzz', 'buzz-label', 'play-rank-list', 'play-rank-empty',
      'error-title', 'error-desc', 'conn-banner',
      'close-room', 'leave-room',
      'confirm-dialog', 'confirm-title', 'confirm-desc', 'confirm-cancel', 'confirm-ok',
      'closed-dialog', 'closed-ok', 'kicked-dialog', 'kicked-ok',
      'share-card', 'question-card', 'host-rank-card',
      'start-game-block', 'start-game', 'start-game-error',
      'play-lobby-card', 'play-player-count', 'play-player-list', 'play-rank-card',
      'host-countdown',
    ].forEach(function (id) {
      el[id] = document.getElementById(id);
    });
  }

  /* ---------- 共用小工具 ---------- */

  // 文案裡的 {name} 換成實際的值
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

  function clientId() {
    var id = readStore(CLIENT_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2);
      writeStore(CLIENT_KEY, id);
    }
    return id;
  }

  /*
   * 暱稱與頭像存成一份 profile，key 跟系列其他專案共用（喜好二選一也讀同一份），
   * 下次進任何一個 Web100 遊戲都不用重挑。不做帳號系統：現場遊戲的人就在同一個房間裡，
   * 帳號只會在「免下載免註冊」這個賣點上加摩擦。
   */
  var PROFILE_KEY = 'web100-profile';
  var currentAvatar = '';

  function readProfile() {
    try {
      return JSON.parse(readStore(PROFILE_KEY) || 'null') || {};
    } catch (e) {
      return {}; // 存壞了就當作沒有
    }
  }

  function saveProfile(nickname) {
    writeStore(PROFILE_KEY, JSON.stringify({ nickname: nickname, avatar: currentAvatar }));
  }

  // 沒選過的人也要有頭像，用 clientId 決定，同一個人每次進來都是同一張臉
  function defaultAvatar() {
    var id = clientId();
    var hash = 0;
    for (var i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return window.AVATARS[hash % window.AVATARS.length].id;
  }

  function avatarSvg(id, size) {
    var found = null;
    for (var i = 0; i < window.AVATARS.length; i += 1) {
      if (window.AVATARS[i].id === id) found = window.AVATARS[i];
    }
    // 伺服器不驗證頭像 id（見 src/room.js 的 cleanAvatar），對不到就退回第一個
    if (!found) found = window.AVATARS[0];

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'avatar');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = '<rect width="64" height="64" fill="' + found.bg + '"/>' + found.svg;
    return svg;
  }

  function renderAvatarPicker() {
    var picker = el['avatar-picker'];
    picker.replaceChildren();

    window.AVATARS.forEach(function (avatar, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'avatar-option';
      button.setAttribute('role', 'radio');
      button.dataset.avatar = avatar.id;
      button.setAttribute('aria-checked', String(avatar.id === currentAvatar));
      button.setAttribute('aria-label', T.avatarLabel + ' ' + (index + 1));
      button.append(avatarSvg(avatar.id, 56));
      button.addEventListener('click', function () {
        selectAvatar(avatar.id);
      });
      picker.append(button);
    });
  }

  function selectAvatar(id) {
    currentAvatar = id;
    var options = el['avatar-picker'].querySelectorAll('[data-avatar]');
    for (var i = 0; i < options.length; i += 1) {
      options[i].setAttribute('aria-checked', String(options[i].dataset.avatar === id));
    }
  }

  function readRoomNickname(code) {
    return readStore(ROOM_KEY_PREFIX + code) || '';
  }

  function saveRoomNickname(code, nickname) {
    writeStore(ROOM_KEY_PREFIX + code, nickname);
  }

  function showView(name) {
    ['home', 'join', 'host', 'play', 'error'].forEach(function (view) {
      el['view-' + view].hidden = view !== name;
    });

    // render() 每收到一次廣播就會呼叫 showView，只有真的換畫面才送統計
    if (name !== currentView) {
      currentView = name;
      trackView(name);
    }
  }

  // 四個畫面共用同一個網址，GA4 的自動 page_view 只會看到一筆，
  // 分不出有多少人真的開了房間、有多少人只是看了首頁就走。
  function trackView(name) {
    window.trackPageView(BASE + '/' + LANG + '/' + name);
  }

  // GA4 自訂事件一律加 buzzer_ 前綴，跟阿瓦隆的 avalon_ 一樣——
  // 整個系列共用同一個 GA4 資源，沒有前綴就分不出是哪個遊戲的資料。
  //
  // 只在「動作的那台裝置」上送：狀態是廣播給全場的，如果照著狀態送，
  // 一場 10 個人的遊戲會把同一個事件記 10 次。
  function track(name, params) {
    if (typeof gtag !== 'function') return;
    gtag('event', name, params || {});
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

  /* ---------- 首頁 ---------- */

  function bindHome() {
    el['create-room'].addEventListener('click', createRoom);

    el['join-code'].addEventListener('input', function () {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      hideFieldError(el['join-error']);
    });

    el['join-room'].addEventListener('click', joinByCode);
    el['join-code'].addEventListener('keydown', function (event) {
      if (event.key === 'Enter') joinByCode();
    });
  }

  function createRoom() {
    hideFieldError(el['create-error']);

    var maxPlayers = parseInt(el['max-players'].value, 10);
    if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
      showFieldError(el['create-error'], T.maxPlayersHint);
      return;
    }

    var button = el['create-room'];
    button.disabled = true;
    button.textContent = T.creating;

    fetch(API_ORIGIN + BASE + '/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ maxPlayers: maxPlayers, hostId: clientId() }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('create_failed');
        return res.json();
      })
      .then(function (data) {
        track('buzzer_room_created', { max_players: maxPlayers });
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

  // 進房間就往 history 推一格（網址同時帶上 ?room=，重整、分享都靠它）。
  // 掃 QR code 進來的人也一樣推：initHistory 已經把基準那格改成首頁，
  // 推完之後返回鍵退的是首頁畫面，而不是整個網站的上一頁。
  function enterRoom(code) {
    roomCode = code;
    giveUp = false; // 上一場離開時立起來的旗標要放掉，不然這次斷線不會重連
    pendingNickname = readRoomNickname(code);
    pushRoomEntry(code);
    connect();
  }

  /* ---------- 填暱稱 ---------- */

  function bindJoin() {
    el['enter-room'].addEventListener('click', submitNickname);
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
    saveRoomNickname(roomCode, nickname);
    saveProfile(nickname);

    // 連線還在，重送一次 hello 就好；斷了才重連
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
      // 換掉舊的 handler，免得舊連線關閉時又觸發一次重連
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
      try {
        socket.close();
      } catch (e) {
        /* 已經關了 */
      }
    }

    showBanner(T.connecting);

    var url = new URL(BASE + '/api/rooms/' + roomCode + '/ws', API_ORIGIN);
    // 依 API 那端的協定決定，不是依當前頁面——兩者在正式網域上是不同的主機
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

    if (msg.t === 'welcome') {
      me = msg.you;
      if (me.role === 'player' && me.nickname) {
        saveRoomNickname(roomCode, me.nickname);
        // welcome 在每次重連都會來，只算第一次，不然斷線多的場次會灌水
        if (!joinReported) {
          joinReported = true;
          track('buzzer_player_joined');
        }
      }
      hideBanner();
      return;
    }

    if (msg.t === 'state') {
      lastState = msg.state;
      // 只在收到新狀態時對齊倒數。lastState 是快照，countdownMs 一寫下來就開始過期——
      // 從 render() 裡重讀會在倒數結束時又把它接回 3 秒，變成無限循環
      syncCountdown(lastState.countdownMs || 0);
      render();
      return;
    }

    if (msg.t === 'kicked') {
      giveUp = true;
      hideBanner();
      el['kicked-dialog'].showModal();
      return;
    }

    if (msg.t === 'closed') {
      // 主持人關了房間。giveUp 擋掉自動重連，否則跳出通知的同時還會一直重試
      giveUp = true;
      hideBanner();
      el['closed-dialog'].showModal();
      return;
    }

    if (msg.t === 'error') {
      handleServerError(msg.code);
    }
  }

  function handleServerError(code) {
    if (code === 'nickname_required') {
      // 連線留著，等使用者填完暱稱再送一次 hello
      hideBanner();
      el['join-title'].textContent = t('joinTitleWithCode', { code: roomCode });
      el['nickname'].value = pendingNickname;
      showView('join');
      el['nickname'].focus();
      return;
    }
    if (code === 'room_not_found') {
      showFatal('roomNotFoundTitle', 'roomNotFoundDesc');
      return;
    }
    if (code === 'room_full') {
      showFatal('roomFullTitle', 'roomFullDesc');
      return;
    }
    if (code === 'room_started') {
      showFatal('roomStartedTitle', 'roomStartedDesc');
      return;
    }
    // host_only / player_only / not_buzzing 這類是「按了現在不該按的東西」，
    // 畫面本來就會把按鈕鎖住，靜靜忽略即可，不用打斷使用者
  }

  /* ---------- 畫面 ---------- */

  /* ---------- 倒數 ---------- */

  // 每次收到狀態都用伺服器給的「剩餘毫秒」重新對齊本機的截止時刻，
  // 不需要跟伺服器對時，中途連上來的人也會拿到正確的剩餘時間。
  // 中間的每一格由本機計時器畫，不用一直跟伺服器要。
  function syncCountdown(remainingMs) {
    if (remainingMs > 0) {
      countdownDeadline = Date.now() + remainingMs;
      if (!countdownTimer) countdownTimer = setInterval(onCountdownTick, 100);
    } else {
      stopCountdown();
    }
  }

  function stopCountdown() {
    countdownDeadline = 0;
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function onCountdownTick() {
    if (countdownLeft() > 0) {
      paintCountdown();
      return;
    }
    // 倒數結束，重畫一次讓按鈕解鎖
    stopCountdown();
    render();
  }

  function countdownLeft() {
    return Math.max(0, countdownDeadline - Date.now());
  }

  // 顯示用的秒數：剩 2100ms 要顯示 3，剩 100ms 要顯示 1，所以無條件進位
  function countdownSeconds() {
    return Math.ceil(countdownLeft() / 1000);
  }

  function paintCountdown() {
    if (!me) return;
    if (me.role === 'player') {
      el['buzz-label'].textContent = countdownSeconds();
    } else {
      el['host-countdown'].textContent = t('hostCountdown', { n: countdownSeconds() });
    }
  }

  function render() {
    if (!lastState || !me) return;
    if (me.role === 'host') {
      showView('host');
      renderHost();
    } else {
      showView('play');
      renderPlay();
    }
  }

  function renderHost() {
    var state = lastState;

    // 開始遊戲前是「等待大廳」：只有房間代碼、QR code 和名單。
    // 開始之後就不再開放加入，分享區塊留著也沒有用，收起來讓出題成為焦點。
    el['share-card'].hidden = state.started;
    el['start-game-block'].hidden = state.started;
    el['question-card'].hidden = !state.started;
    el['host-rank-card'].hidden = !state.started;

    if (!state.started) {
      el['host-room-code'].textContent = state.code;
      var joinUrl = location.origin + BASE + '/' + LANG + '/?room=' + state.code;
      el['share-url'].textContent = joinUrl;
      renderQr(joinUrl);
      el['start-game'].disabled = state.players.length === 0;
    }

    el['player-count'].textContent = t('playerCount', {
      n: state.players.length,
      max: state.maxPlayers,
    });
    renderPlayers(el['player-list'], el['player-empty'], state.players, true);

    // 主持人重整後把伺服器上的題目補回輸入框，但只補一次——
    // 之後以他正在打的內容為準，不然每次廣播都會把游標和未送出的字洗掉
    if (!questionSynced) {
      el['question'].value = state.question;
      questionSynced = true;
    }

    el['show-question'].disabled = state.status === 'buzzing';
    el['start-buzz'].disabled = state.status === 'buzzing';
    el['reset-round'].disabled = state.status === 'waiting';

    // 主持人也要看得到倒數，才知道什麼時候可以停止說話
    var counting = countdownLeft() > 0;
    el['host-countdown'].hidden = !counting;
    if (counting) paintCountdown();

    renderRanks(el['host-rank-list'], el['host-rank-empty'], state.buzzOrder);
  }

  // withKick：只有主持人的名單才有「移出」按鈕
  function renderPlayers(list, empty, players, withKick) {
    list.replaceChildren();
    if (empty) empty.hidden = players.length > 0;

    /*
     * 自己排最上面，其餘照加入順序。
     *
     * 伺服器已經照 joinedAt 排好了，這裡只要把自己往前挪——Array.prototype.sort
     * 是穩定的，回傳 0 的那些會維持原本的順序。主持人不在這份名單裡（他是純控場，
     * 見 src/room.js 的 handleHello），所以只有「自己」要特別處理。
     */
    var me = clientId();
    var ordered = players.slice().sort(function (a, b) {
      var mineA = a.id === me;
      var mineB = b.id === me;
      if (mineA !== mineB) return mineA ? -1 : 1;
      return 0;
    });

    ordered.forEach(function (player) {
      var item = document.createElement('li');
      if (!player.online) item.classList.add('is-offline');

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = player.nickname;
      item.append(avatarSvg(player.avatar, 32), name);

      if (!player.online) {
        var tag = document.createElement('span');
        tag.className = 'offline';
        tag.textContent = T.offlineTag;
        item.append(tag);
      }

      if (withKick) {
        var kick = document.createElement('button');
        kick.type = 'button';
        kick.className = 'btn-outline btn-danger';
        kick.textContent = T.kickButton;
        kick.setAttribute('aria-label', t('kickAria', { nickname: player.nickname }));
        kick.addEventListener('click', function () {
          askConfirm(
            t('kickConfirmTitle', { nickname: player.nickname }),
            T.kickConfirmDesc,
            T.kickConfirmOk,
            function () {
              send({ t: 'kick', playerId: player.id });
            },
          );
        });
        item.append(kick);
      }

      list.append(item);
    });
  }

  function renderPlay() {
    var state = lastState;
    var open = state.status === 'buzzing' || state.status === 'buzzed';

    var myPlace = -1;
    for (var i = 0; i < state.buzzOrder.length; i += 1) {
      if (state.buzzOrder[i].playerId === me.id) {
        myPlace = i + 1;
        break;
      }
    }

    // 等伺服器把名次算回來才送事件，按了但被判太早（too_early）的不算。
    // 一輪只送一次，回合重置時解鎖。
    if (myPlace > 0 && !buzzReported) {
      buzzReported = true;
      track('buzzer_buzzed', { place: myPlace });
    } else if (state.status === 'waiting' || state.status === 'question_shown') {
      buzzReported = false;
    }

    // 開始遊戲前：看得到還有誰在，但沒有搶答鍵也沒有排名榜
    el['play-lobby-card'].hidden = state.started;
    el['buzz'].hidden = !state.started;
    el['play-rank-card'].hidden = !state.started;

    if (!state.started) {
      el['play-title'].textContent = T.lobbyWaitTitle;
      el['play-desc'].textContent = T.lobbyWaitDesc;
      el['play-question'].hidden = true;
      el['play-player-count'].textContent = t('playerCount', {
        n: state.players.length,
        max: state.maxPlayers,
      });
      renderPlayers(el['play-player-list'], null, state.players, false);
      return;
    }

    if (state.status === 'waiting') {
      el['play-title'].textContent = T.waitingTitle;
      el['play-desc'].textContent = T.waitingDesc;
    } else if (myPlace > 0) {
      el['play-title'].textContent = T.buzzedTitle;
      el['play-desc'].textContent = t('yourRank', { n: myPlace });
    } else {
      el['play-title'].textContent = T.readyTitle;
      el['play-desc'].textContent = open ? T.readyDesc : T.buzzClosedHint;
    }

    el['play-question'].hidden = !state.question;
    el['play-question-text'].textContent = state.question;

    // 倒數期間按鈕鎖住，數字直接長在按鈕上——視線本來就在那顆鈕上，
    // 數字放別的地方會讓人在倒數最後一秒還要移動視線
    var counting = countdownLeft() > 0;
    if (counting) {
      el['play-title'].textContent = T.countdownTitle;
      el['play-desc'].textContent = T.countdownDesc;
      paintCountdown();
    } else {
      el['buzz-label'].textContent = T.buzzButton;
    }

    // 已經搶答過還是可以按（規格要求不鎖死畫面），只是視覺上退一階
    el['buzz'].disabled = !open || counting;
    el['buzz'].classList.toggle('counting', counting);
    el['buzz'].classList.toggle('buzzed', myPlace > 0);

    renderRanks(el['play-rank-list'], el['play-rank-empty'], state.buzzOrder);
  }

  function renderRanks(list, empty, buzzOrder) {
    list.replaceChildren();
    empty.hidden = buzzOrder.length > 0;

    buzzOrder.forEach(function (entry, index) {
      var item = document.createElement('li');
      if (index === 0) item.classList.add('first');
      if (me && entry.playerId === me.id) item.classList.add('me');

      var place = document.createElement('span');
      place.className = 'place';
      place.textContent = t('rankLabel', { n: index + 1 });

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = entry.nickname;

      item.append(place, avatarSvg(entry.avatar, 28), name);

      if (entry.ms !== null && entry.ms !== undefined) {
        var delta = document.createElement('span');
        delta.className = 'delta';
        delta.textContent = t('deltaLabel', { s: (entry.ms / 1000).toFixed(2) });
        item.append(delta);
      }

      list.append(item);
    });
  }

  // QR code 只在網址變的時候重畫：每次廣播都重畫的話，主持人畫面會一直閃
  function renderQr(url) {
    if (renderedQrUrl === url) return;
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    // margin 給 4 個模組＝規格要求的靜區，掃描率差在這裡
    el['qr-box'].innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
    renderedQrUrl = url;
  }

  /* ---------- 主持人控制 ---------- */

  function bindHost() {
    el['start-game'].addEventListener('click', function () {
      if (!lastState || lastState.players.length === 0) {
        showFieldError(el['start-game-error'], T.startGameNeedsPlayer);
        return;
      }
      hideFieldError(el['start-game-error']);
      track('buzzer_game_started', { player_count: lastState.players.length });
      send({ t: 'startGame' });
    });

    el['show-question'].addEventListener('click', function () {
      send({ t: 'question', text: el['question'].value });
    });

    el['start-buzz'].addEventListener('click', function () {
      // 主持人可能沒先按「送出題目」就直接開搶答，題目一起帶過去
      track('buzzer_round_started');
      send({ t: 'start', text: el['question'].value });
    });

    el['reset-round'].addEventListener('click', function () {
      el['question'].value = '';
      send({ t: 'reset' });
    });

    el['copy-link'].addEventListener('click', function () {
      var url = el['share-url'].textContent;
      var button = el['copy-link'];
      navigator.clipboard
        .writeText(url)
        .then(function () {
          button.textContent = T.copied;
          setTimeout(function () {
            button.textContent = T.copyLink;
          }, 1600);
        })
        .catch(function () {
          button.textContent = T.copyFailed;
        });
    });
  }

  /* ---------- 離開 / 關閉房間 ---------- */

  function bindExit() {
    el['close-room'].addEventListener('click', function () {
      askConfirm(T.closeConfirmTitle, T.closeConfirmDesc, T.closeRoomButton, function () {
        // 不等伺服器回覆就離開：房間關掉之後這條連線本來就會斷，
        // 停在原地等只會讓主持人看到一瞬間的「重新連線中」
        track('buzzer_room_closed');
        send({ t: 'close' });
        goHome();
      });
    });

    el['leave-room'].addEventListener('click', function () {
      askConfirm(T.leaveConfirmTitle, T.leaveConfirmDesc, T.leaveRoomButton, function () {
        send({ t: 'leave' });
        goHome();
      });
    });

    el['confirm-cancel'].addEventListener('click', function () {
      el['confirm-dialog'].close();
    });

    el['closed-ok'].addEventListener('click', goHome);
    el['kicked-ok'].addEventListener('click', goHome);
  }

  // 傳入的是已經組好的字串（移出玩家的標題要帶暱稱），不是 strings 的 key
  function askConfirm(title, desc, confirmLabel, onConfirm) {
    // 已經開著的話先關掉：對同一個 <dialog> 連按兩次 showModal() 會丟例外
    if (el['confirm-dialog'].open) el['confirm-dialog'].close();
    el['confirm-title'].textContent = title;
    el['confirm-desc'].textContent = desc;
    el['confirm-ok'].textContent = confirmLabel;

    // 每次都換一顆新的按鈕，才不會把上一次的 handler 累積上去
    var ok = el['confirm-ok'];
    var fresh = ok.cloneNode(true);
    ok.parentNode.replaceChild(fresh, ok);
    el['confirm-ok'] = fresh;
    fresh.addEventListener('click', function () {
      el['confirm-dialog'].close();
      onConfirm();
    });

    el['confirm-dialog'].showModal();
  }

  // 回搶答首頁。giveUp 先立起來，離開途中連線斷掉不會又跳出重連橫幅。
  // 用 replace 不用 href：離開後按返回鍵不該又被拉回剛剛退出的房間
  function goHome() {
    giveUp = true;
    location.replace(BASE + '/' + LANG + '/');
  }

  /* ---------- 瀏覽器返回鍵 ---------- */

  /*
   * 進房間時推一格 history，返回鍵才不會一步跳出整個網站。退回來的行為分兩種：
   *
   *  - 還在等待大廳：直接離開房間、回到首頁畫面（跟按鈕的行為一致，主持人是關房）。
   *  - 已經開始搶答：先跳跟「離開房間 / 關閉房間」同一個確認框，確定了才回首頁，
   *    免得手機上手滑一劃就把一場正在進行的遊戲滑掉。
   */
  function initHistory() {
    // 基準那一格固定是首頁：網址先把 ?room= 拿掉，退回來重整才不會又被拉進房間
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
    if (!roomCode) return; // 已經在首頁那一格，讓瀏覽器照常退出這個網站

    // 房間已經沒了（被關、被移出、致命錯誤）：不用再問，把通知關掉回首頁畫面
    if (giveUp) {
      closeDialogs();
      leaveRoom(false);
      return;
    }

    if (lastState && lastState.started) {
      // 先把房間那一格補回去，按「取消」的人才留在原地
      pushRoomEntry(roomCode);
      var isHost = me && me.role === 'host';
      askConfirm(
        isHost ? T.closeConfirmTitle : T.leaveConfirmTitle,
        isHost ? T.closeConfirmDesc : T.leaveConfirmDesc,
        isHost ? T.closeRoomButton : T.leaveRoomButton,
        function () {
          if (isHost) track('buzzer_room_closed');
          send({ t: isHost ? 'close' : 'leave' });
          goHome();
        },
      );
      return;
    }

    leaveRoom(true);
  }

  // 離開房間但留在同一頁（返回鍵專用，goHome 是整頁換掉）。
  // notify=false 用在房間本來就沒了的情況，這時候再送訊息也沒人收
  function leaveRoom(notify) {
    if (notify) {
      var isHost = me && me.role === 'host';
      if (isHost) track('buzzer_room_closed');
      send({ t: isHost ? 'close' : 'leave' });
    }
    giveUp = true; // 收線的過程中不要又跳出重連橫幅
    closeSocket();
    resetRoomState();
    showView('home');
  }

  function closeSocket() {
    clearTimeout(reconnectTimer);
    if (!socket) return;
    socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
    try {
      socket.close();
    } catch (e) {
      /* 已經關了 */
    }
    socket = null;
  }

  // 回到首頁畫面＝下一場從頭來過，這一場的旗標全部歸零
  function resetRoomState() {
    stopCountdown();
    hideBanner();
    roomCode = null;
    me = null;
    lastState = null;
    pendingNickname = '';
    questionSynced = false;
    renderedQrUrl = null;
    joinReported = false;
    buzzReported = false;
  }

  function closeDialogs() {
    ['confirm-dialog', 'closed-dialog', 'kicked-dialog'].forEach(function (id) {
      if (el[id].open) el[id].close();
    });
  }

  /* ---------- 玩家搶答 ---------- */

  function bindPlay() {
    // pointerdown 而不是 click：click 要等 pointerup，搶答差的就是這幾十毫秒
    el['buzz'].addEventListener('pointerdown', function () {
      send({ t: 'buzz' });
    });

    // 鍵盤使用者按不到 pointerdown，補一條（滑鼠按下時不會重複觸發，
    // 因為 click 的 detail 在鍵盤操作下是 0）
    el['buzz'].addEventListener('click', function (event) {
      if (event.detail === 0) send({ t: 'buzz' });
    });
  }
})();
