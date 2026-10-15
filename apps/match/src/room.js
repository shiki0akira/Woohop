/*
 * 一個房間 = 一個 Durable Object instance（roomId 用 idFromName 對應）。
 *
 * 跟搶答遊戲（web100_02_BuzzerGame）最大的差別：那邊只要記「誰先按」，這邊要把
 * **每個人每一題的答案**留到遊戲結束才算得出分組，所以狀態量大得多，
 * 而且每次改動都要寫回 storage（Hibernation API 喚醒後記憶體會是空的）。
 *
 * 每題倒數的判定一律在這裡做（秒數由主持人設定，見 questionSeconds）。
 * 各家手機時鐘不一致，前端的倒數只是視覺效果，收到超過 deadline 的作答就不收。
 */

import {
  buildGroups,
  groupTopics,
  affinityRanking,
  topPairsByPlayer,
  suggestedGroupCount,
  MIN_GROUP_COUNT,
  MAX_GROUP_COUNT,
} from './grouping.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間
// 每題幾秒。主持人可以在大廳改，只收這幾個值——開放任意數字會出現 1 秒或 300 秒這種
// 沒人想玩的設定，而且 UI 是下拉選單，本來就只給這幾個選項
const QUESTION_SECONDS = [5, 8, 10, 12, 15];
const DEFAULT_QUESTION_SECONDS = 10;

/*
 * 過了 deadline 之後還願意收的緩衝。
 *
 * 在第 9.9 秒按下去、但封包走了 200ms 才到的人，不該被算成「沒作答」——
 * 那一題會直接從他跟所有人的共同題數裡消失。緩衝只影響「收不收」，
 * 畫面上的倒數還是準時歸零，玩家不會發現多這 0.4 秒。
 */
const ANSWER_GRACE_MS = 400;

const MAX_QUESTIONS = 20;
const MAX_QUESTION_LENGTH = 120;
const MAX_QUESTION_ID_LENGTH = 48;
const MAX_NICKNAME_LENGTH = 16;

export class MatchRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null; // 記憶體快取，休眠喚醒後會是 null，由 loadRoom() 補回來
  }

  async loadRoom() {
    if (!this.room) this.room = (await this.ctx.storage.get('room')) ?? null;
    return this.room;
  }

  // touch = 這次是「有人在用這個房間」的動作，把閒置清除的時間往後推
  async saveRoom({ touch = false } = {}) {
    if (touch) this.room.expiresAt = Date.now() + IDLE_MS;
    await this.ctx.storage.put('room', this.room);
    await this.scheduleAlarm();
  }

  /*
   * 一個 Durable Object 只有一個鬧鐘，但這裡有兩件事要定時：**題目時間到**
   * 與**房間閒置清除**。所以兩個時刻都存在 room 裡，鬧鐘永遠設在比較近的那個，
   * 醒來後再判斷是哪一件到期（搶答那個專案只有閒置清除，可以直接 setAlarm）。
   */
  async scheduleAlarm() {
    const room = this.room;
    if (!room) return;

    const times = [room.expiresAt];
    if (room.status === 'question' && room.deadline) times.push(room.deadline + ANSWER_GRACE_MS);

    const next = Math.min(...times.filter((time) => typeof time === 'number' && time > 0));
    if (Number.isFinite(next)) await this.ctx.storage.setAlarm(next);
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

    const body = await request.json();
    this.room = {
      code: body.code,
      hostId: body.hostId,
      maxPlayers: body.maxPlayers,
      createdAt: Date.now(),
      expiresAt: Date.now() + IDLE_MS,

      // lobby → question → reveal → …（最後一題的 reveal 之後）→ results
      status: 'lobby',
      started: false,

      // 主持人預設也一起作答、一起被分組。純控場的場合在大廳裡關掉
      hostPlays: true,
      /*
       * 組數預設是自動的：跟著**實際到場的人數**走，每有人進出就重算一次
       * （syncAutoGroupCount）。主持人在大廳親手點過那一排之後就鎖定，
       * 之後不再自動動。
       *
       * 開房這一刻還沒有人加入，只好先拿人數上限估一個值墊著——那也正是舊版
       * 唯一的依據，於是「上限預設 10」讓它永遠算出 2 組，五個人跟二十個人
       * 開出來的房間一模一樣。
       */
      groupCount: suggestedGroupCount(body.maxPlayers),
      groupCountAuto: true,
      questionSeconds: DEFAULT_QUESTION_SECONDS,

      /*
       * 題目在**開好房間之後**才由主持人在大廳裡設定（handleSettings），
       * 跟搶答遊戲的流程一致：首頁只負責開房與加入，設定都在房間裡做。
       *
       * 只存 id 與（自訂題的）文字，不存預設題庫的題目內容：
       * 玩家各自用自己手機的語言顯示，主持人開的是同一個房間，
       * 內建題目由客戶端拿 id 去查自己的題庫。自訂題就沒辦法翻譯，原樣顯示。
       */
      questions: [],
      index: -1, // 目前第幾題，-1 = 還在大廳
      deadline: null, // 這一題的截止時刻（epoch ms）

      players: {}, // { [playerId]: { nickname, joinedAt } }
      answers: {}, // { [playerId]: { [questionId]: 'O' | 'X' } }
      result: null, // 結束時算一次存起來，不要每次廣播都重算
    };
    await this.saveRoom({ touch: true });
    return jsonResponse({ ok: true, code: this.room.code });
  }

  async handleInfo() {
    const room = await this.loadRoom();
    if (!room) return jsonResponse({ error: 'room_not_found' }, 404);
    return jsonResponse({
      code: room.code,
      maxPlayers: room.maxPlayers,
      playerCount: Object.keys(room.players).length,
      status: room.status,
      started: room.started,
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
      case 'settings':
        return this.handleSettings(ws, room, who, msg);
      case 'startGame':
        return this.handleStartGame(ws, room, who);
      case 'reset':
        return this.handleReset(ws, room, who);
      case 'answer':
        return this.handleAnswer(ws, room, who, msg);
      case 'next':
        return this.handleNext(ws, room, who);
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

  async webSocketClose() {
    // 玩家離線不從名單移除：手機鎖屏、切 App 都會走到這裡，把人踢掉會讓主持人的名單一直跳
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  async webSocketError() {
    const room = await this.loadRoom();
    if (room) this.broadcast(room);
  }

  async handleHello(ws, room, msg) {
    const clientId = typeof msg.clientId === 'string' ? msg.clientId.slice(0, 64) : '';
    if (!clientId) return this.sendError(ws, 'bad_client_id', true);

    const isHost = clientId === room.hostId;
    const nickname = cleanNickname(msg.nickname);

    /*
     * 主持人也要填暱稱。
     *
     * 「主持人要不要一起作答」現在是大廳裡的開關（開房時還不知道），所以不能拿它來決定
     * 要不要收暱稱——等他在大廳裡打開才回頭要暱稱，會卡在遊戲要開始的那一刻。
     * 一律先收，真的不作答時再於 computeResult 把他濾掉。
     */
    if (!nickname) {
      // 非致命：客戶端留著這條連線，等使用者填完暱稱再送一次 hello
      return this.sendError(ws, 'nickname_required');
    }

    if (!isHost) {
      const known = room.players[clientId];
      // 開始之後就不收新人。已經在名單上的人不受影響——這條擋的是「臨時加入」，
      // 不是「重整或斷線後回來」
      if (!known && room.started) return this.sendError(ws, 'room_started', true);
      if (!known && Object.keys(room.players).length >= room.maxPlayers) {
        return this.sendError(ws, 'room_full', true);
      }
    }

    room.players[clientId] = {
      nickname,
      avatar: cleanAvatar(msg.avatar),
      joinedAt: room.players[clientId]?.joinedAt ?? Date.now(),
      host: isHost,
    };

    syncAutoGroupCount(room);

    const role = isHost ? 'host' : 'player';
    ws.serializeAttachment({ clientId, role });
    await this.saveRoom({ touch: true });

    ws.send(JSON.stringify({ t: 'welcome', you: { id: clientId, role, nickname } }));
    this.broadcast(room);
  }

  /*
   * 主持人在大廳裡改設定：題目、每組人數、每題秒數、自己要不要作答。
   *
   * 每次都送「完整的」題目清單而不是增減指令：主持人可能同時開好幾個分頁，
   * 用增減指令兩邊會愈疊愈亂，整份覆蓋則不管誰後送都會收斂到同一個狀態。
   *
   * 只有大廳階段能改。開始之後再換題目，已經作答的那幾題會對不到題號。
   */
  async handleSettings(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.status !== 'lobby') return this.sendError(ws, 'already_started');

    if (msg.questions !== undefined) {
      // 空清單是合法的中間狀態（主持人正在重挑），擋在 startGame 那關就好
      room.questions = cleanQuestions(msg.questions) ?? [];
    }
    /*
     * 客戶端**只在主持人親手改過組數時**才帶這個欄位（見 app.js 的 sendSettings）。
     * 無條件帶的話，「改個題目」也會被當成指定組數，自動調整就永久失效了。
     */
    if (msg.groupCount !== undefined) {
      const count = Number(msg.groupCount);
      if (Number.isInteger(count) && count >= MIN_GROUP_COUNT && count <= MAX_GROUP_COUNT) {
        room.groupCount = count;
        room.groupCountAuto = false;
      }
    }
    if (msg.questionSeconds !== undefined && QUESTION_SECONDS.includes(Number(msg.questionSeconds))) {
      room.questionSeconds = Number(msg.questionSeconds);
    }
    if (msg.hostPlays !== undefined) room.hostPlays = Boolean(msg.hostPlays);

    // 主持人改「自己要不要作答」會讓要分組的人數差一個，自動組數要跟著重算
    syncAutoGroupCount(room);

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 主持人在結算頁按「回到房間」：把房間退回大廳，同一批人可以再玩一輪。
   *
   * 保留成員與題目，只清掉答案與分組結果——重點是**把 started 放掉**，
   * 剛剛沒趕上的人這時可以加進來。要換題目的話回大廳按「改題目」就好。
   */
  async handleReset(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.status !== 'results') return this.sendError(ws, 'not_results');

    room.status = 'lobby';
    room.started = false;
    room.index = -1;
    room.deadline = null;
    room.answers = {};
    room.result = null;

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 主持人按下「開始遊戲」：關掉大廳，直接進第一題
  async handleStartGame(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.started) return;
    if (!room.questions.length) return this.sendError(ws, 'no_questions');

    room.started = true;
    this.openQuestion(room, 0);
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 收作答。允許在時限內改答案（直接覆寫），時間到就不收。
   *
   * msg.index 一定要帶：手機從背景喚醒時可能還停在上一題的畫面，
   * 沒有這道檢查會把上一題的答案寫進這一題。
   */
  async handleAnswer(ws, room, who, msg) {
    if (who.role === 'host' && !room.hostPlays) return this.sendError(ws, 'host_not_playing');
    if (room.status !== 'question' && room.status !== 'reveal') {
      return this.sendError(ws, 'not_answering');
    }
    if (msg.index !== room.index) return this.sendError(ws, 'stale_question');

    const value = msg.value === 'O' || msg.value === 'X' ? msg.value : null;
    if (!value) return this.sendError(ws, 'bad_answer');

    // 緩衝之外的一律不收。畫面上的倒數已經歸零，玩家看到的就是「來不及了」
    if (room.deadline && Date.now() > room.deadline + ANSWER_GRACE_MS) {
      return this.sendError(ws, 'too_late');
    }

    const question = room.questions[room.index];
    if (!question) return this.sendError(ws, 'stale_question');

    const mine = room.answers[who.clientId] ?? {};
    mine[question.id] = value;
    room.answers[who.clientId] = mine;

    // 作答本身不 touch：一輪作答前面一定有主持人的動作推過閒置時間，
    // 替十幾個人同時按的路徑多寫一次 alarm 不划算
    await this.saveRoom();
    this.broadcast(room);
  }

  // 主持人按「下一題」：從 reveal 前進到下一題，最後一題之後進結果頁
  async handleNext(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.status !== 'reveal') return this.sendError(ws, 'not_reveal');

    const next = room.index + 1;
    if (next < room.questions.length) this.openQuestion(room, next);
    else this.finish(room);

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  openQuestion(room, index) {
    room.status = 'question';
    room.index = index;
    room.deadline = Date.now() + room.questionSeconds * 1000;
  }

  // 時間到（或緩衝也過了）：鎖定這一題，停在統計畫面等主持人按下一題。
  // 刻意不自動連播——有人手機還沒載入、有人正在講話，主持人要留得住節奏
  closeQuestion(room) {
    room.status = 'reveal';
    room.deadline = null;
  }

  finish(room) {
    room.status = 'results';
    room.deadline = null;
    room.result = computeResult(room);
  }

  // 主持人把某個玩家移出房間
  async handleKick(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
    if (!room.players[playerId] || playerId === room.hostId) {
      return this.sendError(ws, 'no_such_player');
    }

    delete room.players[playerId];
    syncAutoGroupCount(room);
    delete room.answers[playerId];
    await this.saveRoom({ touch: true });

    // 先通知本人再廣播，被踢的人才不會先看到「自己不在名單上」才收到通知
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

  // 玩家主動離開：跟「斷線」不同，要真的從名單移除
  async handleLeave(ws, room, who) {
    if (who.role !== 'player') return this.sendError(ws, 'player_only');

    delete room.players[who.clientId];
    syncAutoGroupCount(room);
    delete room.answers[who.clientId];

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

  /*
   * 鬧鐘同時服務「題目時間到」與「房間閒置清除」，醒來要先分辨是哪一件。
   * 兩件事有可能同時到期（例如題目開著但沒人動作三小時），所以是兩個 if 不是 else。
   */
  async alarm() {
    const room = await this.loadRoom();
    if (!room) return;

    const now = Date.now();

    if (room.status === 'question' && room.deadline && now >= room.deadline) {
      this.closeQuestion(room);
      await this.ctx.storage.put('room', room);
      this.broadcast(room);
    }

    if (now >= room.expiresAt) {
      for (const socket of this.ctx.getWebSockets()) {
        try {
          socket.close(1000, 'room_expired');
        } catch {
          /* 已經斷了 */
        }
      }
      await this.ctx.storage.deleteAll();
      this.room = null;
      return;
    }

    await this.scheduleAlarm();
  }

  broadcast(room) {
    const sockets = this.ctx.getWebSockets();
    const online = new Set();
    for (const socket of sockets) {
      const who = socket.deserializeAttachment();
      if (who?.clientId) online.add(who.clientId);
    }

    // 所有人收到的內容一樣：沒有匿名模式，誰選了什麼本來就公開。
    // 「我選了什麼」由客戶端拿自己的 clientId 去 tally.voters 裡找，不用每條連線各算一份
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
}

/*
 * 廣播給所有人的房間狀態。誰是誰由客戶端拿自己的 clientId 去比對，
 * 不用為每條連線各算一份（只有「我的答案」是每個人不一樣，那個在 broadcast 裡加）。
 */
function publicState(room, online) {
  const question = room.index >= 0 ? room.questions[room.index] : null;
  const tally = question ? questionTally(room, question.id) : null;

  return {
    code: room.code,
    status: room.status,
    started: room.started,
    hostPlays: room.hostPlays,
    groupCount: room.groupCount,
    questionSeconds: room.questionSeconds,
    /*
     * 完整的題目清單**只在大廳送**。
     *
     * 主持人重整之後要能把勾選狀態還原，所以大廳一定要有；但遊戲開始後還照送的話，
     * 玩家打開 DevTools 就能先偷看後面的題目。進行中每個人只拿得到當前這一題。
     */
    questions: room.status === 'lobby' ? room.questions : null,
    maxPlayers: room.maxPlayers,
    questionCount: room.questions.length,
    index: room.index,
    question: question ? { id: question.id, text: question.text } : null,
    // 剩餘毫秒數而不是絕對時刻：客戶端不需要跟伺服器對時，中途連上來的人也拿得到正確的剩餘時間
    remainingMs: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
    // 每題總長也送下來，讓進度條有個固定的分母。前端如果拿收到當下的 remainingMs
    // 當分母，每收到一次廣播（有人作答就會有一次）進度條就會跳回滿格
    questionMs: room.questionSeconds * 1000,
    hostOnline: online.has(room.hostId),
    players: Object.entries(room.players)
      .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      .map(([id, player]) => ({
        id,
        nickname: player.nickname,
        avatar: player.avatar ?? '',
        host: Boolean(player.host),
        online: online.has(id),
        // 「答了沒」在匿名模式下也照送：知道誰還在想不會洩漏他選了什麼，
        // 主持人要靠這個決定還要不要等
        answered: question ? room.answers[id]?.[question.id] !== undefined : false,
      })),
    tally,
    result: room.result,
  };
}

/*
 * 這一題的票數與投票的人。
 *
 * 沒有匿名模式：每個人選了什麼一律公開，畫面上直接列暱稱與頭像。
 * 破冰的目的就是要知道「誰跟我一樣」，藏起來反而讓這個工具失去意義；
 * 而且伺服器本來就存得住每個人的答案（不然算不出分組），做成匿名也只是顯示層的假象。
 */
function questionTally(room, questionId) {
  const votes = { O: [], X: [] };
  for (const [playerId, mine] of Object.entries(room.answers)) {
    const value = mine[questionId];
    if (value === 'O' || value === 'X') votes[value].push(playerId);
  }
  return { O: votes.O.length, X: votes.X.length, voters: votes };
}

/*
 * 依**實到人數**重算組數。主持人親手改過（groupCountAuto === false）就不動。
 *
 * 算的是「真的會被分組的人」：主持人只控場時不算他自己，跟 computeResult 那邊一致。
 * suggestedGroupCount 只是建議值，最後 buildGroups 還會用 resolveGroupCount 夾一次
 * （5 個人選 4 組會被夾回去），所以這裡不用擔心算出做不到的組合。
 *
 * ⚠️ 舊房間的紀錄裡沒有 groupCountAuto，讀出來是 undefined＝falsy，會被當成
 * 「主持人指定過」而保持不動。那是安全的方向：寧可不自動，也不要去改人家設好的值。
 */
function syncAutoGroupCount(room) {
  if (!room.groupCountAuto) return;

  const ids = Object.keys(room.players).filter((id) => room.hostPlays || id !== room.hostId);
  room.groupCount = suggestedGroupCount(ids.length);
}

function computeResult(room) {
  // 主持人只控場時不列入分組。他仍然在 players 裡（大廳要顯示他），只是不參與配對
  const candidates = Object.keys(room.players).filter(
    (id) => room.hostPlays || id !== room.hostId,
  );

  // 一題都沒答的人也排除：把他放進任何一組都只是隨機塞人
  const playerIds = candidates.filter((id) => Object.keys(room.answers[id] ?? {}).length > 0);
  const skipped = candidates.filter((id) => !playerIds.includes(id));

  const { groups, grouped } = buildGroups(playerIds, room.answers, room.groupCount);

  return {
    /*
     * 結算畫面是**靜態的紀錄**，所以把當下每個人的暱稱與頭像一起存進來。
     *
     * 不存的話客戶端只能拿 id 去現在的名單裡查——有人在結算後離開房間，
     * 他就會從別人的配對結果裡整個消失（剩一個頭像配空白）。
     * 結果算完就不該再被任何人的進出影響。
     */
    players: Object.fromEntries(
      Object.entries(room.players).map(([id, player]) => [
        id,
        { nickname: player.nickname, avatar: player.avatar ?? '' },
      ]),
    ),
    grouped,
    groups: groups.map((group) => ({
      members: group.members,
      topics: groupTopics(group.members, room.answers),
    })),
    // 每個人自己的前三名，客戶端拿自己的 clientId 取用
    topPairs: topPairsByPlayer(playerIds, room.answers),
    // 主持人不作答時他不在 topPairs 裡，改看全場最合的幾對
    topPairsOverall: affinityRanking(playerIds, room.answers),
    skipped,
  };
}

function cleanNickname(value) {
  if (typeof value !== 'string') return '';
  // 控制字元會把名單與結果頁的版面弄壞，先拿掉再收合空白
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICKNAME_LENGTH);
}

/*
 * 頭像只存 id 字串，**不在這裡驗證是不是那 10 個之一**。
 *
 * 驗證需要把 app/avatars.js 整包（含 10 份 inline SVG）拉進 Worker bundle，
 * 只為了比對一個字串不划算。這裡只擋長度與字元，客戶端拿到不認得的 id 時
 * 會用 avatarFor() 退回預設值，最糟的情況是那個人的頭像跟他選的不一樣。
 */
function cleanAvatar(value) {
  if (typeof value !== 'string') return '';
  return /^[a-z]{1,20}$/.test(value) ? value : '';
}

/*
 * 建房時送進來的題目清單，由 Worker 呼叫。
 * 內建題只有 id（各語言的文字在客戶端），自訂題只有 text。
 */
export function cleanQuestions(value) {
  if (!Array.isArray(value)) return null;

  const questions = [];
  const seen = new Set();

  for (const item of value.slice(0, MAX_QUESTIONS)) {
    if (!item || typeof item !== 'object') continue;

    const text = typeof item.text === 'string' ? item.text.replace(/\s+/g, ' ').trim().slice(0, MAX_QUESTION_LENGTH) : '';
    const rawId = typeof item.id === 'string' ? item.id.slice(0, MAX_QUESTION_ID_LENGTH) : '';
    // 自訂題沒有 id，用序號發一個；內建題的 id 只收 a-z0-9.-_ 這幾種字元
    const id = /^[\w.-]+$/.test(rawId) ? rawId : `custom${questions.length + 1}`;

    if (!id.startsWith('custom') && text) continue; // 內建題不該帶文字，擋掉來路不明的東西
    if (id.startsWith('custom') && !text) continue; // 自訂題沒有文字就沒有意義
    if (seen.has(id)) continue;

    seen.add(id);
    questions.push({ id, text: id.startsWith('custom') ? text : '' });
  }

  return questions.length ? questions : null;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
