/*
 * 一個房間 = 一個 Durable Object instance（idFromName(房號)）。架構照兩真一假（apps/truths/src/room.js，那邊照偷渡畫家、搶答）：
 * WebSocket 用 Hibernation API，喚醒後記憶體會清空，所以每次改動都寫回 storage，連線身分放在 attachment。
 *
 * 數字默契排排站的流程（phase）：
 *   lobby 等人 → voting 抽三個主題，大家投一個（全部投完、或主持人按決定，票最多的；平手隨機）
 *   → playing 每個人拿到 1～3 張不重複的 1～100 祕密數字，大家互相形容，在自己的手機上把牌「排進去」，
 *     從第一格依序往後填；全部排上去之後大家最後確認，只有主持人能拖曳換順序
 *   → reveal 從第一張一張翻（下一張的主人或主持人翻），比前一張小就是排錯；全部翻完看排錯幾張
 *   → playing 下一輪（新數字、新主題）⋯⋯
 *
 * 老闆 11/20：大家掃**同一個** QR code、伺服器分配不同的數字、每支手機都看得到題目，主持人用自己那一支手機就能玩
 * （先做過的不開房間版要主持人另外一支手機出 QR，改掉了）。同一天再加：開房設人數上限、每人 1～3 張（大廳裡主持人選）、
 * 每輪投票選主題、順序排在手機上、大家一張一張翻、最後看排錯幾張。合作遊戲，沒有分數。
 *
 * 主題是「第幾個」（topic index），由主持人的手機從自己語言的主題庫抽、送上來；大家照自己那份 T.topics 顯示。
 * 自己的牌只放在每條連線各自的 you（broadcast 逐條送），共用的 state 只有誰的牌排在第幾張、翻開的那幾張的數字。
 */

import { dealCards, dealTo, usedNumbers, judge, cleanPerPlayer, cleanMaxPlayers, maxPerPlayerFor, cleanText, tallyVotes, moveTo } from './game.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
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
    const { code, hostId, lang, maxPlayers } = await request.json();
    this.room = {
      code,
      hostId,
      lang,
      maxPlayers: cleanMaxPlayers(maxPlayers), // 人數上限（開房時設）
      perPlayer: 1, // 每人幾張（1～3，大廳裡主持人選）
      createdAt: Date.now(),
      phase: 'lobby',
      started: false,
      players: {}, // { [id]: { nickname, avatar, joinedAt } }
      roundNo: 0,
      topic: 0, // 主題是第幾個（投票選出來的）
      options: [], // 投票時的三個主題（第幾個，主持人的手機抽的）
      votes: {}, // 投票：{ [id]: 選第幾個選項 }
      cards: {}, // 這一輪：{ [牌 id（主人 id.第幾張）]: { owner, n } }
      line: [], // 排好的順序（牌 id），大家自己排進去
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
    if (msg.t === 'vote') return this.handleVote(room, who, msg);
    if (msg.t === 'place') return this.handlePlace(room, who, msg);
    if (msg.t === 'flip') return this.handleFlip(ws, room, who);

    if (who.clientId !== room.hostId) return this.sendError(ws, 'host_only');
    switch (msg.t) {
      case 'startGame':
        return this.handleStartGame(ws, room, msg);
      case 'setPerPlayer':
        return this.handleSetPerPlayer(room, msg);
      case 'decide':
        return this.handleDecide(room);
      case 'moveTo':
        return this.handleMoveTo(room, msg);
      case 'reveal':
        return this.handleReveal(room);
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
    if (!known && Object.keys(room.players).length >= room.maxPlayers) return this.sendError(ws, 'room_full', true);

    room.players[clientId] = {
      nickname,
      avatar: cleanAvatar(msg.avatar),
      joinedAt: known?.joinedAt ?? Date.now(),
    };
    // 人變多、每人張數放不下了（一整排最多 30 張）：還沒發牌的時候自動降一級
    if (room.phase === 'lobby' || room.phase === 'voting') room.perPlayer = Math.min(room.perPlayer, maxPerPlayerFor(Object.keys(room.players).length));
    // 排隊的時候才加入：補發沒用過的數字（公布到一半加入的人等下一輪）
    if (room.phase === 'playing' && !hasCards(room, clientId)) {
      dealTo(room.cards, clientId, room.perPlayer, usedNumbers(room.cards));
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
    await this.newRound(room, msg.topics);
  }

  // 新的一輪：先投票選主題（三個選項由主持人的手機抽、送上來）
  async newRound(room, topics) {
    room.roundNo += 1;
    room.options = cleanOptions(topics);
    room.votes = {};
    room.cards = {};
    room.line = [];
    room.flipped = 0;
    room.phase = 'voting';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 每人幾張（大廳、投票時主持人可以改；發牌之後下一輪才算）
  async handleSetPerPlayer(room, msg) {
    if (room.phase !== 'lobby' && room.phase !== 'voting') return;
    const n = cleanPerPlayer(msg.n);
    if (n > maxPerPlayerFor(Object.keys(room.players).length)) return;
    room.perPlayer = n;
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /* ---------- 投票選主題 ---------- */

  async handleVote(room, who, msg) {
    if (room.phase !== 'voting') return;
    const pick = Number(msg.pick);
    if (!Number.isInteger(pick) || pick < 0 || pick >= room.options.length) return;
    room.votes[who.clientId] = pick;
    // 在線上的人都投了就直接決定
    const online = this.onlineIds();
    const waiting = Object.keys(room.players).filter((id) => online.has(id) && !(id in room.votes));
    if (!waiting.length) return this.decide(room);
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 主持人不等了：用現在票最多的
  async handleDecide(room) {
    if (room.phase !== 'voting') return;
    await this.decide(room);
  }

  // 決定主題、發牌（名單上每個人，不重複）
  async decide(room) {
    room.topic = room.options[tallyVotes(room.votes, room.options.length)] ?? 0;
    room.cards = dealCards(sortedIds(room), room.perPlayer);
    room.line = [];
    room.phase = 'playing';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /* ---------- 排：自己的牌排進去（從第一格依序往後填），主持人拖曳換順序 ---------- */

  async handlePlace(room, who, msg) {
    const id = typeof msg.card === 'string' ? msg.card : '';
    const card = room.cards[id];
    if (room.phase !== 'playing' || !card || card.owner !== who.clientId || room.line.includes(id)) return;
    room.line.push(id);
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 主持人把一張牌拖到第 to 格（老闆 11/20：全部排上去之後最後確認，只有主持人的手機可以換順序）
  async handleMoveTo(room, msg) {
    if (room.phase !== 'playing' || typeof msg.card !== 'string') return;
    if (!moveTo(room.line, msg.card, Number(msg.to) | 0)) return;
    await this.saveRoom();
    this.broadcast(room);
  }

  // 開始翻（主持人）：照排好的順序從第一張翻。還沒排進去的牌這一輪不算（客戶端會先問）
  async handleReveal(room) {
    if (room.phase !== 'playing' || !room.line.length) return;
    room.flipped = 0;
    room.phase = 'reveal';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 翻下一張：那張牌的主人自己翻，主持人也可以（主人離線的時候）
  async handleFlip(ws, room, who) {
    if (room.phase !== 'reveal' || room.flipped >= room.line.length) return;
    const next = room.cards[room.line[room.flipped]];
    if (who.clientId !== room.hostId && next?.owner !== who.clientId) return this.sendError(ws, 'not_your_turn');
    room.flipped += 1;
    await this.saveRoom();
    this.broadcast(room);
  }

  async handleNextRound(room, msg) {
    if (room.phase === 'lobby') return;
    await this.newRound(room, msg.topics);
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

  // 走掉的人：牌收回來、從那一排拿掉（翻開的張數跟著調）
  removePlayer(room, id) {
    delete room.players[id];
    delete room.votes[id];
    for (const [cardId, card] of Object.entries(room.cards)) {
      if (card.owner !== id) continue;
      delete room.cards[cardId];
      const at = room.line.indexOf(cardId);
      if (at < 0) continue;
      room.line.splice(at, 1);
      if (at < room.flipped) room.flipped -= 1;
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

  // 廣播：大家共用的 state ＋ 每條連線自己的 you（自己的牌：數字、排在第幾張，照數字小到大）
  broadcast(room) {
    const state = publicState(room, this.onlineIds());
    for (const socket of this.ctx.getWebSockets()) {
      const who = socket.deserializeAttachment();
      if (!who) continue;
      try {
        socket.send(JSON.stringify({ t: 'state', state, you: { cards: myCards(room, who.clientId), vote: room.votes?.[who.clientId] ?? null } }));
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

function hasCards(room, id) {
  return Object.values(room.cards).some((c) => c.owner === id);
}

function myCards(room, id) {
  return Object.entries(room.cards)
    .filter(([, c]) => c.owner === id)
    .map(([cardId, c]) => ({ id: cardId, n: c.n, at: room.line.indexOf(cardId) }))
    .sort((a, b) => a.n - b.n);
}

/*
 * 廣播給所有人的狀態。**沒翻開的數字不在這裡**：那一排只給牌 id 和主人，翻開的才多 n（數字）和 ok（比前一張大）。
 * 每個人這一輪有沒有牌（hasCards）給名單用（公布中才加入的人這一輪沒有）
 */
function publicState(room, online) {
  const state = {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    started: room.started,
    perPlayer: room.perPlayer,
    maxPlayers: room.maxPlayers,
    maxPerPlayer: maxPerPlayerFor(Object.keys(room.players).length),
    minPlayers: MIN_PLAYERS,
    players: sortedIds(room).map((id) => {
      const p = room.players[id];
      return { id, nickname: p.nickname, avatar: p.avatar, online: online.has(id), hasCards: hasCards(room, id) };
    }),
    round: null,
  };
  if (room.phase === 'lobby') return state;
  if (room.phase === 'voting') {
    state.round = { n: room.roundNo, options: room.options, voted: Object.keys(room.votes).length };
    return state;
  }
  const shown = room.phase === 'reveal' ? room.flipped : 0;
  const numbers = room.line.slice(0, shown).map((id) => room.cards[id].n);
  const ok = judge(numbers);
  state.round = {
    n: room.roundNo,
    topic: room.topic,
    total: Object.keys(room.cards).length, // 這一輪發出去幾張（還沒排進去的也算）
    line: room.line.map((id, i) => {
      const item = { id, owner: room.cards[id].owner };
      if (i < shown) {
        item.n = numbers[i];
        item.ok = ok[i];
      }
      return item;
    }),
    flipped: shown,
    wrong: ok.filter((x) => !x).length,
  };
  return state;
}

// 三個主題選項（第幾個），不重複；壞掉的就給 [0]
function cleanOptions(value) {
  const list = Array.isArray(value) ? value.map(cleanTopic) : [];
  const unique = [...new Set(list)].slice(0, 3);
  return unique.length ? unique : [0];
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
