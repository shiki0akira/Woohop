/*
 * 一個房間 = 一個 Durable Object instance（roomId 用 idFromName 對應）。
 *
 * 搶答排名不比對 timestamp，直接用「DO 收到訊息的先後」：Durable Object 是單執行緒，
 * 一次只處理一個事件，兩個人同時按也會被排成前後，天然沒有競爭問題。
 * buzzOrder 裡的 timestamp / ms 只是拿來顯示「第 2 名慢了 0.3 秒」，不參與排序。
 *
 * WebSocket 用 Hibernation API（ctx.acceptWebSocket）：沒有訊息往來時 DO 可以被卸載，
 * 有人送訊息再喚醒。搶答遊戲是「長時間等待 → 短暫密集互動 → 等待」，很適合這個模式。
 * 代價是喚醒後記憶體狀態會不見，所以每次改動都要寫回 storage，連線身分要放進 attachment。
 */

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
// 「開始搶答」之後先倒數，大家才有一致的起跑點——不然先看到題目的人佔便宜。
// 由伺服器擋掉倒數期間的搶答，客戶端的計時只負責畫面，快個幾十毫秒也搶不到。
const COUNTDOWN_MS = 3000;
const MAX_QUESTION_LENGTH = 500;
const MAX_NICKNAME_LENGTH = 16;

export class BuzzerRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null; // 記憶體快取，休眠喚醒後會是 null，由 loadRoom() 補回來
  }

  async loadRoom() {
    if (!this.room) this.room = (await this.ctx.storage.get('room')) ?? null;
    return this.room;
  }

  // touch = 這次是「有人在用這個房間」的動作，把閒置清除的鬧鐘往後推。
  // 搶答本身不 touch：一輪搶答前面一定有主持人的動作推過鬧鐘了，
  // 每按一次就多寫一次 alarm 只是替最需要低延遲的路徑加負擔。
  async saveRoom({ touch = false } = {}) {
    await this.ctx.storage.put('room', this.room);
    if (touch) await this.ctx.storage.setAlarm(Date.now() + IDLE_MS);
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/create') return this.handleCreate(request);
    if (path === '/info') return this.handleInfo();
    if (path === '/ws') return this.handleUpgrade(request);
    return new Response('Not found', { status: 404 });
  }

  async handleCreate(request) {
    if (await this.loadRoom()) {
      // 這個代碼已經有人在用了，讓 Worker 換一個代碼重試
      return jsonResponse({ error: 'room_exists' }, 409);
    }

    const { code, maxPlayers, hostId } = await request.json();
    this.room = {
      code,
      hostId,
      maxPlayers,
      createdAt: Date.now(),
      status: 'waiting', // waiting | question_shown | buzzing | buzzed
      // 主持人按下「開始遊戲」之前是等待大廳，之後就不再開放新玩家加入。
      // 已經在名單上的人不受影響，重整、斷線重連都還進得來。
      started: false,
      currentQuestion: '',
      buzzStartedAt: null,
      buzzOpensAt: null, // 倒數結束、真正可以搶答的時刻
      players: {}, // { [playerId]: { nickname, joinedAt } }
      buzzOrder: [], // [{ playerId, nickname, timestamp, ms }]
    };
    await this.saveRoom({ touch: true });
    return jsonResponse({ ok: true, code });
  }

  async handleInfo() {
    const room = await this.loadRoom();
    if (!room) return jsonResponse({ error: 'room_not_found' }, 404);
    return jsonResponse({
      code: room.code,
      maxPlayers: room.maxPlayers,
      playerCount: Object.keys(room.players).length,
      status: room.status,
    });
  }

  async handleUpgrade(request) {
    if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }
    if (!(await this.loadRoom())) return new Response('room_not_found', { status: 404 });

    const pair = new WebSocketPair();
    // 身分還不知道，等客戶端送 hello 才寫 attachment
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return this.sendError(ws, 'bad_message');
    }

    const room = await this.loadRoom();
    if (!room) return this.sendError(ws, 'room_not_found', true);

    if (msg.t === 'hello') return this.handleHello(ws, room, msg);

    const who = ws.deserializeAttachment();
    if (!who) return this.sendError(ws, 'not_joined');

    switch (msg.t) {
      case 'question':
        return this.handleQuestion(ws, room, who, msg);
      case 'start':
        return this.handleStart(ws, room, who, msg);
      case 'buzz':
        return this.handleBuzz(ws, room, who);
      case 'reset':
        return this.handleReset(ws, room, who);
      case 'startGame':
        return this.handleStartGame(ws, room, who);
      case 'kick':
        return this.handleKick(ws, room, who, msg);
      case 'leave':
        return this.handleLeave(ws, room, who);
      case 'close':
        return this.handleClose(ws, room, who);
      case 'ping':
        return ws.send(JSON.stringify({ t: 'pong' }));
      default:
        return this.sendError(ws, 'unknown_message');
    }
  }

  async webSocketClose(ws) {
    // 玩家離線不從名單移除：手機鎖屏、切 App、隧道裡斷線都會走到這裡，
    // 把人踢掉會讓主持人看到名單一直跳。改成廣播一次讓大家看到「離線」標記。
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  async webSocketError(ws) {
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  async handleHello(ws, room, msg) {
    const clientId = typeof msg.clientId === 'string' ? msg.clientId.slice(0, 64) : '';
    if (!clientId) return this.sendError(ws, 'bad_client_id', true);

    const isHost = clientId === room.hostId;
    const nickname = cleanNickname(msg.nickname);

    if (!isHost) {
      // 非致命：客戶端會留著這條連線，等使用者填完暱稱再送一次 hello
      if (!nickname) return this.sendError(ws, 'nickname_required');

      const known = room.players[clientId];
      // 遊戲開始後就不收新人了。已經在名單上的人不受影響——
      // 這條擋的是「臨時加入」，不是「重整或斷線後回來」
      if (!known && room.started) {
        return this.sendError(ws, 'room_started', true);
      }
      if (!known && Object.keys(room.players).length >= room.maxPlayers) {
        return this.sendError(ws, 'room_full', true);
      }
      room.players[clientId] = {
        nickname,
        avatar: cleanAvatar(msg.avatar),
        joinedAt: known?.joinedAt ?? Date.now(),
      };
      // 改暱稱或換頭像時，這一輪已經寫進 buzzOrder 的紀錄要一起改，排名榜才不會留著舊的
      for (const entry of room.buzzOrder) {
        if (entry.playerId !== clientId) continue;
        entry.nickname = nickname;
        entry.avatar = room.players[clientId].avatar;
      }
    }

    const role = isHost ? 'host' : 'player';

    // 同一個 clientId 開兩個分頁不特別處理：online 是 Set，重複的會收斂成一個人；
    // 搶答又是用 playerId 去重，開幾個分頁都只記一次。刻意不去關舊連線——
    // 判斷「哪一條才是舊的」在重整、背景喚醒的情境下很容易誤殺還在用的那條。
    ws.serializeAttachment({ clientId, role });
    await this.saveRoom({ touch: true });

    ws.send(
      JSON.stringify({
        t: 'welcome',
        you: { id: clientId, role, nickname: isHost ? '' : nickname },
      }),
    );
    this.broadcast(room);
  }

  async handleQuestion(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    room.currentQuestion = String(msg.text ?? '').slice(0, MAX_QUESTION_LENGTH);
    // 送出新題目等於開新的一輪，把上一輪的排名清掉
    room.buzzOrder = [];
    room.buzzStartedAt = null;
    room.buzzOpensAt = null;
    room.status = room.currentQuestion ? 'question_shown' : 'waiting';

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleStart(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    // 主持人也可能沒先按「送出題目」就直接開搶答，這時一併帶上題目
    if (typeof msg.text === 'string') {
      room.currentQuestion = msg.text.slice(0, MAX_QUESTION_LENGTH);
    }
    room.status = 'buzzing';
    // 排名的時間差從「倒數結束」起算，不是從按下開始搶答起算，
    // 這樣第一名的 +0.32 秒才是真的反應時間
    room.buzzOpensAt = Date.now() + COUNTDOWN_MS;
    room.buzzStartedAt = room.buzzOpensAt;
    room.buzzOrder = [];

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleBuzz(ws, room, who) {
    if (who.role !== 'player') return this.sendError(ws, 'player_only');
    // buzzed 也接受：第一個人按完之後其他人還能繼續按，排名榜要排到最後一名
    if (room.status !== 'buzzing' && room.status !== 'buzzed') {
      return this.sendError(ws, 'not_buzzing');
    }
    // 倒數還沒結束就按，一律不算——搶跑的人不會因為手快而拿到第一
    if (room.buzzOpensAt && Date.now() < room.buzzOpensAt) {
      return this.sendError(ws, 'too_early');
    }
    // 同一輪同一個人只記一次，重複點擊直接忽略（不回錯誤，客戶端本來就允許一直按）
    if (room.buzzOrder.some((e) => e.playerId === who.clientId)) return;

    const now = Date.now();
    room.buzzOrder.push({
      playerId: who.clientId,
      nickname: room.players[who.clientId]?.nickname ?? '',
      avatar: room.players[who.clientId]?.avatar ?? '',
      timestamp: now,
      ms: room.buzzStartedAt ? now - room.buzzStartedAt : null,
    });
    room.status = 'buzzed';

    await this.saveRoom();
    this.broadcast(room);
  }

  async handleReset(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    room.currentQuestion = '';
    room.status = 'waiting';
    room.buzzOrder = [];
    room.buzzStartedAt = null;
    room.buzzOpensAt = null;

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 主持人按下「開始遊戲」：關掉大廳，之後只有名單上的人進得來
  async handleStartGame(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.started) return;

    room.started = true;
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 主持人把某個玩家移出房間
  async handleKick(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
    if (!room.players[playerId]) return this.sendError(ws, 'no_such_player');

    delete room.players[playerId];
    room.buzzOrder = room.buzzOrder.filter((entry) => entry.playerId !== playerId);
    await this.saveRoom({ touch: true });

    // 先通知本人再廣播，被踢的人才不會先看到「自己不在名單上」的狀態才收到通知
    for (const socket of this.ctx.getWebSockets()) {
      if (socket.deserializeAttachment()?.clientId !== playerId) continue;
      try {
        socket.send(JSON.stringify({ t: 'kicked' }));
        socket.serializeAttachment(null);
        socket.close(1000, 'kicked');
      } catch {
        /* 已經斷了 */
      }
    }
    this.broadcast(room);
  }

  // 玩家主動離開：跟「斷線」不同，要真的從名單移除，主持人才知道這個人不玩了
  async handleLeave(ws, room, who) {
    if (who.role !== 'player') return this.sendError(ws, 'player_only');

    delete room.players[who.clientId];
    room.buzzOrder = room.buzzOrder.filter((entry) => entry.playerId !== who.clientId);

    // 先把 attachment 清掉再廣播，這條連線才不會被算進「在線」
    ws.serializeAttachment(null);
    await this.saveRoom({ touch: true });
    this.broadcast(room);

    try {
      ws.close(1000, 'left');
    } catch {
      /* 已經在關了 */
    }
  }

  // 主持人關閉房間：先通知所有人，再把房間整個清掉
  async handleClose(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    const notice = JSON.stringify({ t: 'closed' });
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(notice);
      } catch {
        /* 這條已經斷了，跳過 */
      }
    }
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.close(1000, 'room_closed');
      } catch {
        /* 同上 */
      }
    }

    // deleteAll 會連鬧鐘一起清掉，之後拿同一個代碼進來就是 room_not_found
    await this.ctx.storage.deleteAll();
    this.room = null;
  }

  broadcast(room) {
    const sockets = this.ctx.getWebSockets();
    const online = new Set();
    for (const socket of sockets) {
      const who = socket.deserializeAttachment();
      if (who?.clientId) online.add(who.clientId);
    }

    const payload = JSON.stringify({ t: 'state', state: publicState(room, online) });
    for (const socket of sockets) {
      try {
        socket.send(payload);
      } catch {
        // 這條正在關閉，下一次廣播就不會有它了
      }
    }
  }

  sendError(ws, code, fatal = false) {
    try {
      ws.send(JSON.stringify({ t: 'error', code }));
    } catch {
      /* 已經斷了 */
    }
    if (fatal) {
      try {
        ws.close(1008, code);
      } catch {
        /* 已經斷了 */
      }
    }
  }

  // 閒置逾時：把房間狀態整個清掉，讓 DO 可以被回收
  async alarm() {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.close(1000, 'room_expired');
      } catch {
        /* 已經斷了 */
      }
    }
    await this.ctx.storage.deleteAll();
    this.room = null;
  }
}

// 廣播給所有人的房間狀態。主持人與玩家收到的內容一樣，
// 「我是誰」由客戶端拿自己的 clientId 去比對，不用為每條連線各算一份。
function publicState(room, online) {
  return {
    code: room.code,
    maxPlayers: room.maxPlayers,
    status: room.status,
    started: room.started,
    // 剩餘倒數毫秒數。用「還剩多久」而不是絕對時刻，客戶端就不需要跟伺服器對時，
    // 中途才連上來的人也會拿到正確的剩餘時間
    countdownMs: room.buzzOpensAt ? Math.max(0, room.buzzOpensAt - Date.now()) : 0,
    question: room.currentQuestion,
    hostOnline: online.has(room.hostId),
    players: Object.entries(room.players)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id, player]) => ({
        id,
        nickname: player.nickname,
        avatar: player.avatar ?? '',
        online: online.has(id),
      })),
    buzzOrder: room.buzzOrder.map((entry) => ({
      playerId: entry.playerId,
      nickname: entry.nickname,
      avatar: entry.avatar ?? '',
      ms: entry.ms,
    })),
  };
}

/*
 * 頭像只存 id 字串，不在這裡驗證是不是那 10 個之一——驗證要把 app/avatars.js 整包
 * （含 10 份 inline SVG）拉進 Worker bundle，只為了比對一個字串不划算。
 * 客戶端拿到不認得的 id 會退回預設值。
 */
function cleanAvatar(value) {
  if (typeof value !== 'string') return '';
  return /^[a-z]{1,20}$/.test(value) ? value : '';
}

function cleanNickname(value) {
  if (typeof value !== 'string') return '';
  // 控制字元會把排名榜的版面弄壞，先拿掉再收合空白
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICKNAME_LENGTH);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
