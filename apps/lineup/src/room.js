/*
 * 一個房間 = 一個 Durable Object instance（idFromName(房號)）。架構照兩真一假（apps/truths/src/room.js，那邊照偷渡畫家、搶答）：
 * WebSocket 用 Hibernation API，喚醒後記憶體會清空，所以每次改動都寫回 storage，連線身分放在 attachment。
 *
 * 數字默契排排站的流程（phase）：
 *   lobby 等人 → playing 每個人拿到一個不重複的 1～100 祕密數字，大家看同一個主題、互相形容、排隊
 *   → reveal 主持人一張一張翻（照數字從小到大，翻開的才廣播）→ playing 下一輪（新數字、新主題）⋯⋯
 *
 * 老闆 11/20：大家掃**同一個** QR code、伺服器分配不同的數字、每支手機都看得到題目，主持人用自己那一支手機就能玩
 * （先做過的不開房間版要主持人另外一支手機出 QR，改掉了）。合作遊戲，沒有分數。
 *
 * 主題是「第幾個」（topic index），由主持人的手機從自己語言的主題庫抽、送上來；大家照自己那份 T.topics 顯示。
 * 自己的數字只放在每條連線各自的 you（broadcast 逐條送），共用的 state 只有翻開的那幾張。
 */

import { dealNumbers, pickNumber, lineupOrder, cleanText } from './game.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
const MAX_PLAYERS = 15; // 站成一排、一張一張翻，15 個人已經很長了
const MIN_PLAYERS = 2;
const MAX_NICKNAME_LENGTH = 16;
const MAX_TOPIC_INDEX = 999;

export class LineupRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null; // 記憶體快取，休眠喚醒後會是 null，由 loadRoom() 補回來
  }

  async loadRoom() {
    if (!this.room) this.room = (await this.ctx.storage.get('room')) ?? null;
    return this.room;
  }

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
    if (await this.loadRoom()) return jsonResponse({ error: 'room_exists' }, 409);
    const { code, hostId, lang } = await request.json();
    this.room = {
      code,
      hostId,
      lang,
      createdAt: Date.now(),
      phase: 'lobby',
      started: false,
      players: {}, // { [id]: { nickname, avatar, joinedAt } }
      roundNo: 0,
      topic: 0, // 主題是第幾個（主持人的手機抽的）
      numbers: {}, // 這一輪：{ [id]: 數字 }
      order: [], // 公布時：照數字從小到大的 id
      flipped: 0, // 公布時：翻開了幾張
    };
    await this.saveRoom({ touch: true });
    return jsonResponse({ ok: true, code });
  }

  async handleInfo() {
    const room = await this.loadRoom();
    if (!room) return jsonResponse({ error: 'room_not_found' }, 404);
    return jsonResponse({ code: room.code, playerCount: Object.keys(room.players).length, phase: room.phase });
  }

  async handleUpgrade(request) {
    if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }
    if (!(await this.loadRoom())) return new Response('room_not_found', { status: 404 });
    const pair = new WebSocketPair();
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
    if (msg.t === 'ping') return ws.send(JSON.stringify({ t: 'pong' }));

    const who = ws.deserializeAttachment();
    if (!who) return this.sendError(ws, 'not_joined');
    if (msg.t === 'leave') return this.handleLeave(ws, room, who);

    if (who.clientId !== room.hostId) return this.sendError(ws, 'host_only');
    switch (msg.t) {
      case 'startGame':
        return this.handleStartGame(ws, room, msg);
      case 'setTopic':
        return this.handleSetTopic(room, msg);
      case 'reveal':
        return this.handleReveal(room);
      case 'flip':
        return this.handleFlip(room);
      case 'nextRound':
        return this.handleNextRound(room, msg);
      case 'kick':
        return this.handleKick(ws, room, msg);
      case 'close':
        return this.handleClose(ws, room);
      default:
        return this.sendError(ws, 'unknown_message');
    }
  }

  async webSocketClose() {
    // 玩家離線不從名單移除（手機鎖屏、切 App 都會走到這裡），廣播一次讓大家看到「離線」
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  async webSocketError() {
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  /* ---------- 加入：隨時都能加入，進行中加入的人當場補發一個沒用過的數字 ---------- */

  async handleHello(ws, room, msg) {
    const clientId = typeof msg.clientId === 'string' ? msg.clientId.slice(0, 64) : '';
    if (!clientId) return this.sendError(ws, 'bad_client_id', true);

    const nickname = cleanText(msg.nickname, MAX_NICKNAME_LENGTH);
    // 主持人也是玩家，一樣要暱稱。非致命：連線留著，等填完暱稱再送一次 hello
    if (!nickname) return this.sendError(ws, 'nickname_required');

    const known = room.players[clientId];
    if (!known && Object.keys(room.players).length >= MAX_PLAYERS) return this.sendError(ws, 'room_full', true);

    room.players[clientId] = {
      nickname,
      avatar: cleanAvatar(msg.avatar),
      joinedAt: known?.joinedAt ?? Date.now(),
    };
    // 排隊的時候才加入：補一個沒用過的數字（公布到一半加入的人等下一輪）
    if (room.phase === 'playing' && !(clientId in room.numbers)) {
      const n = pickNumber(new Set(Object.values(room.numbers)));
      if (n != null) room.numbers[clientId] = n;
    }

    ws.serializeAttachment({ clientId });
    await this.saveRoom({ touch: true });

    ws.send(JSON.stringify({ t: 'welcome', you: { id: clientId, host: clientId === room.hostId, nickname } }));
    this.broadcast(room);
  }

  /* ---------- 主持人 ---------- */

  async handleStartGame(ws, room, msg) {
    if (room.phase !== 'lobby') return;
    if (Object.keys(room.players).length < MIN_PLAYERS) return this.sendError(ws, 'need_players');
    room.started = true;
    await this.newRound(room, msg.topic);
  }

  // 新的一輪：名單上每個人重新發一個不重複的數字、換主題
  async newRound(room, topic) {
    room.roundNo += 1;
    room.topic = cleanTopic(topic);
    room.numbers = dealNumbers(sortedIds(room));
    room.order = [];
    room.flipped = 0;
    room.phase = 'playing';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleSetTopic(room, msg) {
    if (room.phase !== 'playing') return;
    room.topic = cleanTopic(msg.topic);
    await this.saveRoom();
    this.broadcast(room);
  }

  // 公布：照數字從小到大排好，一張都還沒翻
  async handleReveal(room) {
    if (room.phase !== 'playing') return;
    room.order = lineupOrder(room.numbers);
    room.flipped = 0;
    room.phase = 'reveal';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleFlip(room) {
    if (room.phase !== 'reveal' || room.flipped >= room.order.length) return;
    room.flipped += 1;
    await this.saveRoom();
    this.broadcast(room);
  }

  async handleNextRound(room, msg) {
    if (room.phase !== 'reveal' && room.phase !== 'playing') return;
    await this.newRound(room, msg.topic);
  }

  /* ---------- 名單：移出、離開、關房 ---------- */

  async handleKick(ws, room, msg) {
    const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
    if (!room.players[playerId] || playerId === room.hostId) return this.sendError(ws, 'no_such_player');
    this.removePlayer(room, playerId);
    await this.saveRoom({ touch: true });
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

  async handleLeave(ws, room, who) {
    if (who.clientId === room.hostId) return; // 主持人離開＝關房，走 close
    this.removePlayer(room, who.clientId);
    ws.serializeAttachment(null);
    await this.saveRoom({ touch: true });
    try {
      ws.close(1000, 'left');
    } catch {
      /* 已經在關了 */
    }
    this.broadcast(room);
  }

  // 走掉的人：數字收回來；公布中也從那一排拿掉（翻開的張數不超過剩下的）
  removePlayer(room, id) {
    delete room.players[id];
    delete room.numbers[id];
    if (room.phase === 'reveal') {
      const at = room.order.indexOf(id);
      if (at >= 0) {
        room.order.splice(at, 1);
        if (at < room.flipped) room.flipped -= 1;
      }
    }
  }

  async handleClose() {
    const notice = JSON.stringify({ t: 'closed' });
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(notice);
        socket.close(1000, 'room_closed');
      } catch {
        /* 已經斷了 */
      }
    }
    await this.ctx.storage.deleteAll();
    this.room = null;
  }

  /* ---------- 傳送 ---------- */

  onlineIds() {
    const online = new Set();
    for (const socket of this.ctx.getWebSockets()) {
      const who = socket.deserializeAttachment();
      if (who?.clientId) online.add(who.clientId);
    }
    return online;
  }

  // 廣播：大家共用的 state ＋ 每條連線自己的 you（自己的數字）
  broadcast(room) {
    const state = publicState(room, this.onlineIds());
    for (const socket of this.ctx.getWebSockets()) {
      const who = socket.deserializeAttachment();
      if (!who) continue;
      try {
        socket.send(JSON.stringify({ t: 'state', state, you: { number: room.numbers[who.clientId] ?? null } }));
      } catch {
        /* 正在關閉 */
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

  // 閒置逾時：把房間整個清掉
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

function sortedIds(room) {
  return Object.entries(room.players)
    .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
    .map(([id]) => id);
}

/*
 * 廣播給所有人的狀態。**沒翻開的數字不在這裡**：公布時只給前 flipped 張（id＋數字），其他只給總共幾張。
 * 每個人有沒有拿到這一輪的數字（hasNumber）給名單用（公布中才加入的人這一輪沒有）
 */
function publicState(room, online) {
  const state = {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    started: room.started,
    maxPlayers: MAX_PLAYERS,
    minPlayers: MIN_PLAYERS,
    players: sortedIds(room).map((id) => {
      const p = room.players[id];
      return { id, nickname: p.nickname, avatar: p.avatar, online: online.has(id), hasNumber: id in room.numbers };
    }),
    round: null,
  };
  if (room.phase === 'lobby') return state;
  state.round = { n: room.roundNo, topic: room.topic, total: Object.keys(room.numbers).length };
  if (room.phase === 'reveal') {
    state.round.total = room.order.length;
    state.round.flipped = room.order.slice(0, room.flipped).map((id) => ({ id, n: room.numbers[id] }));
  }
  return state;
}

function cleanTopic(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= MAX_TOPIC_INDEX ? n : 0;
}

// 頭像只存 id 字串，客戶端對不到會退回預設（跟搶答一樣）
function cleanAvatar(value) {
  if (typeof value !== 'string') return '';
  return /^[a-z]{1,20}$/.test(value) ? value : '';
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
