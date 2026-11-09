/*
 * 一個房間 = 一個 Durable Object instance（idFromName(房號)）。架構照搶答（apps/buzzer/src/room.js）：
 * WebSocket 用 Hibernation API，喚醒後記憶體會清空，所以每次改動都寫回 storage，連線身分放在 attachment。
 *
 * 偷渡畫家的流程（phase）：
 *   lobby 等人 → theme 公布主題、每人私下拿到祕密題目（可換）→ drawing 大家同時畫同一張圖
 *   → guessing 一次亮一位畫家的筆畫，其他人猜他偷渡了什麼 → reveal 公布這一位（答案、誰猜中、得分）
 *   → guessing 下一位 ⋯⋯ → scores 這張圖的總分 → theme 再畫一張｜ended 結束（最後排名）
 *
 * 主持人也是玩家（老闆 11/04 定的）：一樣要填暱稱、拿祕密題目、畫、猜，只是多了控場的按鈕。
 *
 * 筆畫：
 *   - 畫的時候客戶端每 50ms 送一段 seg（只轉給其他人，不存），手指放開送整筆 stroke（存起來、也轉給其他人蓋掉）。
 *     seg 不存是因為量太大；中途連上來的人收的是 strokes 快照（已經畫完的那些筆），正在畫的那筆等放開再補上
 *   - 一筆存成一個 key（stroke:000123），值 { id, by, c, p }，座標是 0～1000 的整數。順序就是畫的順序
 *   - **畫的時候不讓別人知道哪一筆是誰的**：轉送與快照都拿掉 by，到猜的時候才把 by 一起送出去
 *
 * 時間到不用 alarm（alarm 已經拿來清閒置房間）：客戶端倒數到 0 送 endDrawing／endTurn／nextTurn（公布後 5 秒），
 * 伺服器檢查時間真的到了才接受，誰先送都一樣。主持人可以提早結束（例如大家都畫好了）。
 */

import { dealSecret, isCorrect, maskOf, scoreTurn } from './game.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
const MAX_PLAYERS = 8; // 2～8 人：超過 8 個人擠在同一張手機大小的畫布上會畫成一團（上限老闆 11/04 定）
const MIN_PLAYERS = 2; // 老闆 11/09 從 3 降到 2：兩個人也玩得起來（互相猜對方偷渡了什麼）
const GUESS_MS = { easy: 20000, hard: 30000 };
const NEXT_MS = 5000; // 公布一位之後幾秒自動換下一位／看分數（老闆 11/04）
const GRACE_MS = 800; // 客戶端時鐘跟伺服器差一點點，時間到的訊息早到一點也接受
const MAX_NICKNAME_LENGTH = 16;
const MAX_THEME_LENGTH = 30;
const MAX_ANSWER_LENGTH = 30;
const MAX_POINTS = 1500; // 一筆最多幾個點
const MAX_STROKES_PER_PLAYER = 400;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const STROKE_ID_RE = /^[A-Za-z0-9_-]{4,24}$/;

export class SneakyRoom {
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

    const { code, hostId, mode, drawSec, lang } = await request.json();
    this.room = {
      code,
      hostId,
      mode, // easy：同類型 4 選 1／hard：打字，有類型和字數提示（主持人開房時選）
      drawSec,
      lang,
      createdAt: Date.now(),
      phase: 'lobby',
      started: false, // 開始之後不再收新玩家（已經在名單上的人重整、斷線還進得來）
      players: {}, // { [id]: { nickname, avatar, joinedAt, score } }
      strokeSeq: 0,
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
      case 'seg':
        return this.handleSeg(ws, room, who, msg);
      case 'stroke':
        return this.handleStroke(ws, room, who, msg);
      case 'undo':
        return this.handleUndo(ws, room, who, msg);
      case 'answer':
        return this.handleAnswer(ws, room, who, msg);
      case 'skipSecret':
        return this.handleSkipSecret(ws, room, who);
      case 'endDrawing':
        return this.handleEndDrawing(ws, room, isHost);
      case 'endTurn':
        return this.handleEndTurn(ws, room, isHost);
      case 'nextTurn':
        return this.handleNextTurn(ws, room, isHost);
      case 'leave':
        return this.handleLeave(ws, room, who);
      default:
        break;
    }

    if (!isHost) return this.sendError(ws, 'host_only');
    switch (msg.t) {
      case 'startGame':
        return this.handleStartGame(ws, room, msg);
      case 'theme':
        return this.handleTheme(ws, room, msg);
      case 'startDrawing':
        return this.handleStartDrawing(ws, room);
      case 'nextRound':
        return this.handleNextRound(ws, room, msg);
      case 'endGame':
        return this.handleEndGame(ws, room);
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

    const nickname = cleanNickname(msg.nickname);
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
      score: known?.score ?? 0,
    };
    // 這一張圖的名字快照也跟著改（猜的時候顯示「誰畫的」用快照，被移出的人也查得到）
    if (room.round?.names[clientId]) room.round.names[clientId] = { nickname, avatar: room.players[clientId].avatar };

    ws.serializeAttachment({ clientId });
    await this.saveRoom({ touch: true });

    ws.send(JSON.stringify({ t: 'welcome', you: { id: clientId, host: isHost, nickname } }));
    this.sendSecret(room, clientId, ws);
    ws.send(JSON.stringify({ t: 'strokes', strokes: await this.loadStrokes(room) }));
    this.broadcast(room);
  }

  /* ---------- 主持人：開始、主題、開始畫 ---------- */

  async handleStartGame(ws, room, msg) {
    if (room.phase !== 'lobby') return;
    if (Object.keys(room.players).length < MIN_PLAYERS) return this.sendError(ws, 'need_players');
    room.started = true;
    await this.newRound(room, msg.theme);
  }

  async newRound(room, theme) {
    await this.clearStrokes();
    room.roundNo += 1;
    const ids = Object.entries(room.players)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id]) => id);
    const secrets = {};
    const dealt = [];
    for (const id of ids) {
      secrets[id] = dealSecret(room.lang, dealt);
      dealt.push(secrets[id].word);
    }
    room.round = {
      n: room.roundNo,
      theme: cleanText(theme, MAX_THEME_LENGTH),
      order: ids, // 猜的順序＝加入順序
      names: Object.fromEntries(ids.map((id) => [id, { nickname: room.players[id].nickname, avatar: room.players[id].avatar }])),
      secrets,
      drawEndsAt: 0,
      turn: 0,
      guessEndsAt: 0,
      answers: {}, // 這一位畫家的：{ 猜的人: 答案 }
      results: [], // 每一位公布後的紀錄：{ targetId, word, kind, answers, correct, gained }
      gained: {}, // 這一張圖每個人得了幾分
      strokeCount: {}, // 每個人畫了幾筆（擋洗版）
    };
    room.phase = 'theme';
    await this.saveRoom({ touch: true });
    for (const id of ids) this.sendSecret(room, id);
    this.sendAll({ t: 'strokes', strokes: [] });
    this.broadcast(room);
  }

  async handleTheme(ws, room, msg) {
    if (room.phase !== 'theme') return;
    room.round.theme = cleanText(msg.theme, MAX_THEME_LENGTH);
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 換一個祕密題目：只有開始畫之前可以，不跟同一張圖的其他人重複
  async handleSkipSecret(ws, room, who) {
    if (room.phase !== 'theme' || !room.round.secrets[who.clientId]) return;
    const others = Object.entries(room.round.secrets).map(([, s]) => s.word);
    room.round.secrets[who.clientId] = dealSecret(room.lang, others);
    await this.saveRoom();
    this.sendSecret(room, who.clientId);
  }

  async handleStartDrawing(ws, room) {
    if (room.phase !== 'theme') return;
    room.phase = 'drawing';
    room.round.drawEndsAt = Date.now() + room.drawSec * 1000;
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /* ---------- 畫 ---------- */

  // 正在畫的那一段：只轉給其他人，不存（量太大），也不帶是誰畫的
  handleSeg(ws, room, who, msg) {
    if (room.phase !== 'drawing' || !room.round.secrets[who.clientId]) return;
    const id = typeof msg.id === 'string' && STROKE_ID_RE.test(msg.id) ? msg.id : '';
    const c = typeof msg.c === 'string' && COLOR_RE.test(msg.c) ? msg.c : '';
    const p = cleanPoints(msg.p, 200);
    if (!id || !c || !p.length) return;
    this.sendAll({ t: 'seg', id, c, p }, ws);
  }

  // 手指放開：整筆存起來，也轉給其他人（蓋掉他們用 seg 拼起來的那筆，中途漏掉的段落就補齊了）
  async handleStroke(ws, room, who, msg) {
    if (room.phase !== 'drawing' || !room.round.secrets[who.clientId]) return;
    const id = typeof msg.id === 'string' && STROKE_ID_RE.test(msg.id) ? msg.id : '';
    const c = typeof msg.c === 'string' && COLOR_RE.test(msg.c) ? msg.c : '';
    const p = cleanPoints(msg.p, MAX_POINTS);
    if (!id || !c || !p.length) return;

    const mine = room.round.strokeCount[who.clientId] || 0;
    if (mine >= MAX_STROKES_PER_PLAYER) return this.sendError(ws, 'too_many_strokes');
    room.round.strokeCount[who.clientId] = mine + 1;
    room.strokeSeq += 1;
    await this.ctx.storage.put('stroke:' + String(room.strokeSeq).padStart(6, '0'), { id, by: who.clientId, c, p });
    await this.saveRoom();
    this.sendAll({ t: 'stroke', stroke: { id, c, p } }, ws);
  }

  // 復原：只能拿掉自己畫的
  async handleUndo(ws, room, who, msg) {
    if (room.phase !== 'drawing') return;
    const strokes = await this.ctx.storage.list({ prefix: 'stroke:' });
    for (const [key, s] of strokes) {
      if (s.id !== msg.id) continue;
      if (s.by !== who.clientId) return;
      await this.ctx.storage.delete(key);
      room.round.strokeCount[who.clientId] = Math.max(0, (room.round.strokeCount[who.clientId] || 1) - 1);
      await this.saveRoom();
      this.sendAll({ t: 'unstroke', id: s.id }, ws);
      return;
    }
  }

  // 時間到（誰的手機先倒數完都可以送，伺服器檢查真的到了）或主持人提早結束
  async handleEndDrawing(ws, room, isHost) {
    if (room.phase !== 'drawing') return;
    if (!isHost && Date.now() < room.round.drawEndsAt - GRACE_MS) return;
    await this.startTurn(room, 0);
    // 進入猜的階段，筆畫連同「誰畫的」一起送出去（一次亮一位畫家的筆畫）
    this.sendAll({ t: 'strokes', strokes: await this.loadStrokes(room) });
  }

  /* ---------- 猜 ---------- */

  async startTurn(room, index) {
    room.phase = 'guessing';
    room.round.turn = index;
    room.round.answers = {};
    room.round.guessEndsAt = Date.now() + GUESS_MS[room.mode];
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleAnswer(ws, room, who, msg) {
    if (room.phase !== 'guessing') return;
    const target = room.round.order[room.round.turn];
    if (who.clientId === target || !room.players[who.clientId]) return;
    const text = cleanText(msg.text, MAX_ANSWER_LENGTH);
    if (!text) return;
    // 簡單版只收選項裡的答案
    if (room.mode === 'easy' && !room.round.secrets[target].options.includes(text)) return;
    room.round.answers[who.clientId] = text;

    // 在線上、該猜的人都答了就直接公布，不用等倒數
    const online = this.onlineIds();
    const waiting = Object.keys(room.players).filter((id) => id !== target && online.has(id) && !(id in room.round.answers));
    if (!waiting.length) return this.revealTurn(room);
    await this.saveRoom();
    this.broadcast(room);
  }

  async handleEndTurn(ws, room, isHost) {
    if (room.phase !== 'guessing') return;
    if (!isHost && Date.now() < room.round.guessEndsAt - GRACE_MS) return;
    await this.revealTurn(room);
  }

  async revealTurn(room) {
    const r = room.round;
    const targetId = r.order[r.turn];
    const secret = r.secrets[targetId];
    const { gained, correct } = scoreTurn(targetId, secret.word, r.answers);
    for (const [id, pts] of Object.entries(gained)) {
      if (room.players[id]) room.players[id].score += pts;
      r.gained[id] = (r.gained[id] || 0) + pts;
    }
    r.results.push({ targetId, word: secret.word, kind: secret.kind, answers: r.answers, correct, gained });
    r.nextAt = Date.now() + NEXT_MS;
    room.phase = 'reveal';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 公布後 NEXT_MS 自動換下一位：誰的手機先倒數完都可以送，伺服器檢查時間到了；主持人可以先按
  async handleNextTurn(ws, room, isHost) {
    if (room.phase !== 'reveal') return;
    if (!isHost && Date.now() < room.round.nextAt - GRACE_MS) return;
    const next = room.round.turn + 1;
    if (next < room.round.order.length) return this.startTurn(room, next);
    room.phase = 'scores';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  async handleNextRound(ws, room, msg) {
    if (room.phase !== 'scores' && room.phase !== 'ended') return;
    // 結束之後再玩一次：分數和第幾張都歸零
    if (room.phase === 'ended') {
      for (const p of Object.values(room.players)) p.score = 0;
      room.roundNo = 0;
    }
    await this.newRound(room, msg.theme);
  }

  async handleEndGame(ws, room) {
    if (room.phase !== 'scores') return;
    room.phase = 'ended';
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /* ---------- 名單：移出、離開、關房 ---------- */

  async handleKick(ws, room, msg) {
    const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
    if (!room.players[playerId] || playerId === room.hostId) return this.sendError(ws, 'no_such_player');
    delete room.players[playerId];
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
    delete room.players[who.clientId];
    ws.serializeAttachment(null);
    await this.saveRoom({ touch: true });
    try {
      ws.close(1000, 'left');
    } catch {
      /* 已經在關了 */
    }
    await this.afterRosterChange(room);
  }

  // 有人離開：如果正在等他作答，剩下的人都答完就直接公布
  async afterRosterChange(room) {
    if (room.phase === 'guessing') {
      const target = room.round.order[room.round.turn];
      const online = this.onlineIds();
      const waiting = Object.keys(room.players).filter((id) => id !== target && online.has(id) && !(id in room.round.answers));
      if (!waiting.length && Object.keys(room.round.answers).length) return this.revealTurn(room);
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

  /* ---------- 筆畫的存取 ---------- */

  // 快照：畫的時候不帶 by（不能讓人知道哪一筆是誰的），猜的階段以後才帶
  async loadStrokes(room) {
    const reveal = ['guessing', 'reveal', 'scores', 'ended'].includes(room.phase);
    const out = [];
    for (const [, s] of await this.ctx.storage.list({ prefix: 'stroke:' })) {
      out.push(reveal ? s : { id: s.id, c: s.c, p: s.p });
    }
    return out;
  }

  async clearStrokes() {
    const keys = [...(await this.ctx.storage.list({ prefix: 'stroke:' })).keys()];
    // delete 一次最多 128 個 key
    for (let i = 0; i < keys.length; i += 128) await this.ctx.storage.delete(keys.slice(i, i + 128));
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

  // 祕密題目只送給本人（一個人可能開了好幾條連線）
  sendSecret(room, clientId, only) {
    const s = room.round?.secrets[clientId];
    const payload = JSON.stringify({ t: 'secret', secret: s ? { kind: s.kind, word: s.word } : null });
    const sockets = only ? [only] : this.ctx.getWebSockets();
    for (const socket of sockets) {
      if (socket.deserializeAttachment()?.clientId !== clientId) continue;
      try {
        socket.send(payload);
      } catch {
        /* 已經斷了 */
      }
    }
  }

  sendAll(message, except) {
    const payload = JSON.stringify(message);
    for (const socket of this.ctx.getWebSockets()) {
      if (socket === except || !socket.deserializeAttachment()) continue;
      try {
        socket.send(payload);
      } catch {
        /* 正在關閉 */
      }
    }
  }

  broadcast(room) {
    this.sendAll({ t: 'state', state: publicState(room, this.onlineIds()) });
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

/*
 * 廣播給所有人的狀態。祕密題目不在這裡（另外只送給本人），
 * 只有公布之後的那幾個才放進來。剩餘時間用「還剩幾毫秒」，客戶端不用跟伺服器對時。
 */
function publicState(room, online) {
  const r = room.round;
  const now = Date.now();
  const state = {
    code: room.code,
    hostId: room.hostId,
    mode: room.mode,
    drawSec: room.drawSec,
    phase: room.phase,
    started: room.started,
    maxPlayers: MAX_PLAYERS,
    minPlayers: MIN_PLAYERS,
    players: Object.entries(room.players)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id, p]) => ({ id, nickname: p.nickname, avatar: p.avatar, online: online.has(id), score: p.score })),
    round: null,
  };
  if (!r) return state;

  state.round = {
    n: r.n,
    theme: r.theme,
    order: r.order,
    names: r.names,
    drawLeftMs: room.phase === 'drawing' ? Math.max(0, r.drawEndsAt - now) : 0,
    gained: r.gained,
  };

  if (room.phase === 'guessing' || room.phase === 'reveal') {
    const targetId = r.order[r.turn];
    const s = r.secrets[targetId];
    state.round.turn = {
      index: r.turn,
      total: r.order.length,
      targetId,
      kind: room.mode === 'hard' ? s.kind : '',
      mask: room.mode === 'hard' ? maskOf(s.word) : '',
      options: room.mode === 'easy' ? s.options : [],
      answered: Object.keys(r.answers),
      leftMs: room.phase === 'guessing' ? Math.max(0, r.guessEndsAt - now) : 0,
    };
  }
  if (room.phase === 'reveal') {
    const last = r.results[r.results.length - 1];
    state.round.nextLeftMs = Math.max(0, r.nextAt - now);
    state.round.result = {
      targetId: last.targetId,
      word: last.word,
      kind: last.kind,
      answers: Object.entries(last.answers).map(([id, text]) => ({ id, text, correct: isCorrect(text, last.word) })),
      gained: last.gained,
    };
  }
  if (room.phase === 'scores' || room.phase === 'ended') {
    state.round.results = r.results.map((x) => ({ targetId: x.targetId, word: x.word, correctCount: x.correct.length }));
  }
  return state;
}

// 座標收成 0～1000 的整數，丟掉格式不對的點
function cleanPoints(value, max) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const pt of value.slice(0, max)) {
    if (!Array.isArray(pt) || pt.length !== 2) continue;
    const x = Math.round(Number(pt[0]));
    const y = Math.round(Number(pt[1]));
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push([Math.max(0, Math.min(1000, x)), Math.max(0, Math.min(1000, y))]);
  }
  return out;
}

// 頭像只存 id 字串，客戶端對不到會退回預設（跟搶答一樣）
function cleanAvatar(value) {
  if (typeof value !== 'string') return '';
  return /^[a-z]{1,20}$/.test(value) ? value : '';
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanNickname(value) {
  return cleanText(value, MAX_NICKNAME_LENGTH);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
