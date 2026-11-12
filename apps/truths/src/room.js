/*
 * 一個房間 = 一個 Durable Object instance（idFromName(房號)）。架構照偷渡畫家（apps/sneaky-artist/src/room.js），
 * 那邊又是照搶答：WebSocket 用 Hibernation API，喚醒後記憶體會清空，所以每次改動都寫回 storage，連線身分放在 attachment。
 *
 * 兩真一假的流程（phase）：
 *   lobby 等人 → writing 每個人同時在自己手機上寫三句（兩真一假），寫好可以改。**不限時**（老闆 11/12）
 *   → ready 大家都寫好了，等主持人按「開始猜」（老闆 11/12：不要突然跳進猜題）
 *   → guessing 一次拿出一個人的三句，其他人投哪句是假的 → reveal 公布（假的那句、誰投什麼、誰寫的）
 *   → guessing 下一組（主持人按）⋯⋯ → ended 最後排名（最會猜、最會騙）→ writing 再玩一次
 *
 * 主持人也是玩家：一樣填暱稱、寫、猜，只是多了控場的按鈕。
 *
 * 「先保密」模式（room.reveal === 'hide'）：猜的時候不能讓人知道是誰寫的。所以
 *   - 廣播的 state 在 guessing 不帶 authorId，也不帶「誰投了」（沒投的那個就是作者），只帶投了幾個人
 *   - 「這組是不是我寫的」「我投了哪句」放在每條連線各自的 you（broadcast 逐條送）
 *
 * 時間到不用 alarm（alarm 拿來清閒置房間）：客戶端倒數到 0 送 endTurn，伺服器檢查時間真的到了才接受。
 * 猜的時候**時間內都可以改選擇**（老闆 11/12）；大家都選了就把剩下的時間縮成 ALL_VOTED_MS，給最後改主意的機會。
 */

import { cleanEntry, cleanText, shuffle, scoreTurn, awards } from './game.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
const MAX_PLAYERS = 15; // 一組大約 1 分鐘，15 個人就要 15 分鐘以上，再多會拖太久
const MIN_PLAYERS = 2; // 老闆 11/11：兩個人也能玩（互相猜）
const ALL_VOTED_MS = 5000; // 大家都選了：剩下的時間縮成 5 秒就公布（還可以改）
const GRACE_MS = 800; // 客戶端時鐘跟伺服器差一點點，時間到的訊息早到一點也接受
const MAX_NICKNAME_LENGTH = 16;

export class TruthsRoom {
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

    const { code, hostId, reveal, guessSec, lang } = await request.json();
    this.room = {
      code,
      hostId,
      reveal, // show：猜的時候就知道是誰寫的／hide：公布答案時才翻出來（主持人開房時選）
      guessSec,
      lang,
      createdAt: Date.now(),
      phase: 'lobby',
      started: false, // 開始之後不再收新玩家（已經在名單上的人重整、斷線還進得來）
      players: {}, // { [id]: { nickname, avatar, joinedAt, guess, fool } }
      round: null,
      roundNo: 0,
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
    const isHost = who.clientId === room.hostId;

    switch (msg.t) {
      case 'submit':
        return this.handleSubmit(ws, room, who, msg);
      case 'unsubmit':
        return this.handleUnsubmit(ws, room, who);
      case 'vote':
        return this.handleVote(ws, room, who, msg);
      case 'endWriting':
        return this.handleEndWriting(ws, room, isHost);
      case 'endTurn':
        return this.handleEndTurn(ws, room, isHost);
      case 'leave':
        return this.handleLeave(ws, room, who);
      default:
        break;
    }

    if (!isHost) return this.sendError(ws, 'host_only');
    switch (msg.t) {
      case 'startGame':
        return this.handleStartGame(ws, room);
      case 'startGuess':
        return this.handleStartGuess(ws, room);
      case 'nextTurn':
        return this.handleNextTurn(ws, room);
      case 'playAgain':
        return this.handlePlayAgain(ws, room);
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

  /* ---------- 加入 ---------- */

  async handleHello(ws, room, msg) {
    const clientId = typeof msg.clientId === 'string' ? msg.clientId.slice(0, 64) : '';
    if (!clientId) return this.sendError(ws, 'bad_client_id', true);

    const nickname = cleanText(msg.nickname, MAX_NICKNAME_LENGTH);
    // 主持人也是玩家，一樣要暱稱。非致命：連線留著，等填完暱稱再送一次 hello
    if (!nickname) return this.sendError(ws, 'nickname_required');

    const known = room.players[clientId];
    const isHost = clientId === room.hostId;
    if (!known && !isHost && room.started) return this.sendError(ws, 'room_started', true);
    if (!known && Object.keys(room.players).length >= MAX_PLAYERS) return this.sendError(ws, 'room_full', true);

    room.players[clientId] = {
      nickname,
      avatar: cleanAvatar(msg.avatar),
      joinedAt: known?.joinedAt ?? Date.now(),
      guess: known?.guess ?? 0,
      fool: known?.fool ?? 0,
    };
    // 這一場的名字快照也跟著改（公布「誰寫的」用快照，被移出的人也查得到）
    if (room.round?.names[clientId]) room.round.names[clientId] = { nickname, avatar: room.players[clientId].avatar };

    ws.serializeAttachment({ clientId });
    await this.saveRoom({ touch: true });

    ws.send(JSON.stringify({ t: 'welcome', you: { id: clientId, host: isHost, nickname } }));
    this.broadcast(room);
  }

  /* ---------- 主持人：開始 ---------- */

  async handleStartGame(ws, room) {
    if (room.phase !== 'lobby') return;
    if (Object.keys(room.players).length < MIN_PLAYERS) return this.sendError(ws, 'need_players');
    room.started = true;
    await this.newRound(room);
  }

  async newRound(room) {
    room.roundNo += 1;
    const ids = sortedIds(room);
    room.round = {
      n: room.roundNo,
      names: Object.fromEntries(ids.map((id) => [id, { nickname: room.players[id].nickname, avatar: room.players[id].avatar }])),
      entries: {}, // { [id]: { items: [{ topic, text }], fake } }
      order: [], // 猜的順序（開始猜的時候，從寫好的人裡隨機排）
      turn: 0,
      guessEndsAt: 0,
      votes: {}, // 這一組的：{ 投的人: 第幾句 }
      results: [], // 每一組公布後的紀錄：{ authorId, correct, fooled }
    };
    room.phase = 'writing';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /* ---------- 寫 ---------- */

  async handleSubmit(ws, room, who, msg) {
    if (room.phase !== 'writing' || !room.players[who.clientId]) return;
    const entry = cleanEntry(msg.entry);
    if (!entry) return this.sendError(ws, 'bad_entry');
    room.round.entries[who.clientId] = entry;
    // 在線上的人都寫好了就不用等倒數，進「大家都寫好了」那一頁等主持人
    if (this.everyoneWrote(room)) return this.toReady(room);
    await this.saveRoom();
    this.broadcast(room);
  }

  // 寫好之後想改：收回去，改完再送一次
  async handleUnsubmit(ws, room, who) {
    if (room.phase !== 'writing' || !room.round.entries[who.clientId]) return;
    delete room.round.entries[who.clientId];
    await this.saveRoom();
    this.broadcast(room);
  }

  everyoneWrote(room) {
    const online = this.onlineIds();
    const ids = Object.keys(room.players).filter((id) => online.has(id));
    return ids.length > 0 && ids.every((id) => room.round.entries[id]);
  }

  // 寫不限時，有人一直沒寫好就靠主持人「提早開始猜」：直接開始猜（他已經決定了，不用再按一次）。只有主持人能送
  async handleEndWriting(ws, room, isHost) {
    if (room.phase !== 'writing' || !isHost) return;
    if (!Object.keys(room.round.entries).length) return this.sendError(ws, 'nobody_wrote');
    await this.startGuessing(room);
  }

  async toReady(room) {
    room.phase = 'ready';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleStartGuess(ws, room) {
    if (room.phase !== 'ready') return;
    await this.startGuessing(room);
  }

  async startGuessing(room) {
    room.round.order = shuffle(Object.keys(room.round.entries));
    await this.startTurn(room, 0);
  }

  /* ---------- 猜 ---------- */

  async startTurn(room, index) {
    room.phase = 'guessing';
    room.round.turn = index;
    room.round.votes = {};
    room.round.guessEndsAt = Date.now() + room.guessSec * 1000;
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleVote(ws, room, who, msg) {
    if (room.phase !== 'guessing') return;
    const author = room.round.order[room.round.turn];
    if (who.clientId === author || !room.players[who.clientId]) return;
    const pick = Number(msg.pick);
    if (!Number.isInteger(pick) || pick < 0 || pick > 2) return;
    // 時間內都可以改（老闆 11/12），所以同一個人再投一次就是蓋掉
    room.round.votes[who.clientId] = pick;
    this.hurryIfAllVoted(room);
    await this.saveRoom();
    this.broadcast(room);
  }

  // 大家都選了：不直接公布（有人可能還想改），剩下的時間縮成 ALL_VOTED_MS。只會縮、不會加長
  hurryIfAllVoted(room) {
    if (this.waitingVoters(room).length || !Object.keys(room.round.votes).length) return;
    room.round.guessEndsAt = Math.min(room.round.guessEndsAt, Date.now() + ALL_VOTED_MS);
  }

  // 還在等誰投：在線上、不是作者、還沒投
  waitingVoters(room) {
    const author = room.round.order[room.round.turn];
    const online = this.onlineIds();
    return Object.keys(room.players).filter((id) => id !== author && online.has(id) && !(id in room.round.votes));
  }

  async handleEndTurn(ws, room, isHost) {
    if (room.phase !== 'guessing') return;
    if (!isHost && Date.now() < room.round.guessEndsAt - GRACE_MS) return;
    await this.revealTurn(room);
  }

  async revealTurn(room) {
    const r = room.round;
    const authorId = r.order[r.turn];
    const { correct, fooled } = scoreTurn(authorId, r.entries[authorId].fake, r.votes);
    for (const id of correct) if (room.players[id]) room.players[id].guess += 1;
    if (room.players[authorId]) room.players[authorId].fool += fooled.length;
    r.results.push({ authorId, votes: r.votes, correct, fooled });
    room.phase = 'reveal';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 下一組由主持人按（公布是聊天的時間，自動跳會打斷，CONCEPT.md 第三節）
  async handleNextTurn(ws, room) {
    if (room.phase !== 'reveal') return;
    const next = room.round.turn + 1;
    if (next < room.round.order.length) return this.startTurn(room, next);
    room.phase = 'ended';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 再玩一次：分數歸零、重新寫
  async handlePlayAgain(ws, room) {
    if (room.phase !== 'ended') return;
    for (const p of Object.values(room.players)) {
      p.guess = 0;
      p.fool = 0;
    }
    await this.newRound(room);
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
    await this.afterRosterChange(room);
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
    await this.afterRosterChange(room);
  }

  // 寫的時候走掉：他寫的那組也拿掉（不然會出一組沒人能回答「那是怎麼回事」的題）。開始猜之後就留著
  removePlayer(room, id) {
    delete room.players[id];
    if (room.phase === 'writing') delete room.round.entries[id];
  }

  // 有人離開：如果正在等他，剩下的人都好了就直接往下
  async afterRosterChange(room) {
    if (room.phase === 'writing' && Object.keys(room.round.entries).length && this.everyoneWrote(room)) {
      return this.toReady(room);
    }
    if (room.phase === 'guessing') {
      this.hurryIfAllVoted(room);
      await this.saveRoom();
    }
    this.broadcast(room);
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

  /*
   * 廣播：大家共用的 state ＋ 每條連線自己的 you（寫好沒、自己寫的那三句、這組是不是我寫的、我投了哪句）。
   * 「先保密」模式靠這個才不會在共用的 state 裡露出作者。
   */
  broadcast(room) {
    const state = publicState(room, this.onlineIds());
    for (const socket of this.ctx.getWebSockets()) {
      const who = socket.deserializeAttachment();
      if (!who) continue;
      try {
        socket.send(JSON.stringify({ t: 'state', state, you: privateState(room, who.clientId) }));
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
 * 廣播給所有人的狀態。寫的三句在 guessing 之前不在這裡（自己的放在 you），
 * 「先保密」模式下 guessing 不帶作者、不帶誰投了。剩餘時間用「還剩幾毫秒」，客戶端不用跟伺服器對時。
 */
function publicState(room, online) {
  const r = room.round;
  const now = Date.now();
  const state = {
    code: room.code,
    hostId: room.hostId,
    reveal: room.reveal,
    guessSec: room.guessSec,
    phase: room.phase,
    started: room.started,
    maxPlayers: MAX_PLAYERS,
    minPlayers: MIN_PLAYERS,
    players: sortedIds(room).map((id) => {
      const p = room.players[id];
      return { id, nickname: p.nickname, avatar: p.avatar, online: online.has(id), guess: p.guess, fool: p.fool };
    }),
    round: null,
  };
  if (!r) return state;

  state.round = { n: r.n, names: r.names };

  if (room.phase === 'writing' || room.phase === 'ready') {
    state.round.written = Object.keys(r.entries);
  }

  if (room.phase === 'guessing' || room.phase === 'reveal') {
    const authorId = r.order[r.turn];
    const showAuthor = room.reveal === 'show' || room.phase === 'reveal';
    state.round.turn = {
      index: r.turn,
      total: r.order.length,
      authorId: showAuthor ? authorId : null,
      items: r.entries[authorId].items,
      votedCount: Object.keys(r.votes).length,
      allVoted: Object.keys(r.votes).length > 0 && Object.keys(r.votes).length >= Object.keys(room.players).filter((id) => id !== authorId).length,
      // 該投的人數（不含作者）：公開模式才給名單之外的人數也一樣算得出來，所以兩種模式都給
      voterTotal: Object.keys(room.players).filter((id) => id !== authorId).length,
      leftMs: room.phase === 'guessing' ? Math.max(0, r.guessEndsAt - now) : 0,
    };
  }
  if (room.phase === 'reveal') {
    const last = r.results[r.results.length - 1];
    const byItem = [[], [], []];
    for (const [id, pick] of Object.entries(last.votes)) byItem[pick].push(id);
    state.round.result = {
      authorId: last.authorId,
      fake: r.entries[last.authorId].fake,
      byItem,
      correct: last.correct,
      fooled: last.fooled,
    };
  }
  if (room.phase === 'ended') {
    state.round.awards = awards(Object.entries(room.players).map(([id, p]) => ({ id, guess: p.guess, fool: p.fool })));
    state.round.played = r.results.length;
  }
  return state;
}

// 只給這一個人的：寫的時候自己的三句（重整後還能改）、猜的時候這組是不是我寫的、我投了哪句
function privateState(room, clientId) {
  const r = room.round;
  const you = { entry: null, isAuthor: false, vote: -1 };
  if (!r) return you;
  if (room.phase === 'writing') you.entry = r.entries[clientId] || null;
  if (room.phase === 'guessing' || room.phase === 'reveal') {
    const authorId = r.order[r.turn];
    you.isAuthor = authorId === clientId;
    if (you.isAuthor) you.fake = r.entries[authorId].fake; // 自己的手機可以看到自己選的假的那句
    const votes = room.phase === 'reveal' ? r.results[r.results.length - 1].votes : r.votes;
    if (clientId in votes) you.vote = votes[clientId];
  }
  return you;
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
