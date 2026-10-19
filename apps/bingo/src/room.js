/*
 * 一個房間 = 一個 Durable Object instance（roomId 用 idFromName 對應）。
 *
 * 跟 web100_03 的差別：那邊是「全場同步一題、限時作答」，這邊是**完全非同步**——
 * 每個人手上一張排列不同的卡，隨時可以對任何一格送出配對請求，隨時可能收到別人的請求。
 * 所以這裡沒有倒數、沒有題目指標，鬧鐘只服務閒置清除；
 * 但相對的，每條連線收到的內容不一樣（自己的卡片與待確認清單是私有的），
 * 廣播要一條一條組（見 broadcast()）。
 *
 * 「一格的狀態」是這個檔案的核心，只有四種：
 *   未配對 → 等待確認 →（對方確認）已打勾
 *                     →（對方婉拒 / 自己取消）回到未配對
 * 確認之後不可撤銷（CONCEPT.md 第四節）：已成立的連線要能倒退的話，
 * 排行榜、獲勝標記、達標時間全部都要跟著回滾，邊界情況會沒完沒了。
 */

import {
  SIZES,
  DEFAULT_SIZE,
  MAX_TARGET_LINES,
  DEFAULT_TARGET_LINES,
  cellCount,
  centerIndex,
  hasAnchor,
  countLines,
  completedLines,
  buildCard,
} from './bingo.js';

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 小時沒有人動作就清空房間

// 開始遊戲的最低人數。跟 src/worker.js 建房時的下限同一個數字
const MIN_PLAYERS = 2;

// 最多讓幾個人達標才收場。超過 3 就跟「開到喊停」沒兩樣了
const MAX_WINNERS = 3;

const MAX_NICKNAME_LENGTH = 16;
const MAX_QUESTION_LENGTH = 60; // 賓果格子塞不下長句，比 03 的 120 短
const MAX_QUESTION_ID_LENGTH = 48;

export class BingoRoom {
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
    // 這個專案只有閒置清除一件定時工作，直接設就好（03 還要跟題目倒數搶同一個鬧鐘）
    await this.ctx.storage.setAlarm(this.room.expiresAt);
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

      // lobby → playing → ended（主持人手動結束；達標不會自動結束遊戲）
      status: 'lobby',
      started: false,

      /*
       * 尺寸、題庫、獲勝連線數都是**開好房間之後**在大廳裡設定的，
       * 跟系列其他專案一致：首頁只負責開房與加入。
       */
      size: DEFAULT_SIZE,
      targetLines: DEFAULT_TARGET_LINES[DEFAULT_SIZE],
      // 主持人開關：開啟後玩家可以對「找不到人」的格子自行認定（CONCEPT.md 第四節）。
      // 人少的場合（2～4 人）幾乎一定要開
      allowSelfClaim: false,

      /*
       * 主持人預設也拿一張卡一起玩。關掉就是純控場：不發卡、不上排行榜，
       * 但**仍然留在名單上、仍然可以被別人選來配對**——他人就在現場，
       * 別人卡上的描述他一樣可能符合。
       */
      hostPlays: true,

      /*
       * 幾個人達標就結束這一輪（1～3）。
       *
       * 原本的設計是「達標只上榜、遊戲開到主持人喊停」，實際帶起來太拖——
       * 第一個人連完之後其他人還在跑，場子會散掉。改成到達人數就自動收場，
       * 主持人手上仍然留著「結束這一輪」當久久沒人達標時的退路。
       */
      winnerCount: 1,

      // 保底題：3×3 / 5×5 固定放正中央、不參與洗牌。4×4 沒有這格，維持 null
      anchor: null,
      // 洗牌題。內建題只有 id（各語言的文字在客戶端），自訂題只有 text
      questions: [],

      players: {}, // { [playerId]: { nickname, avatar, joinedAt, host, spectator } }
      cards: {}, // { [playerId]: [questionId × size²] }，開始時產生後就不再變
      marks: {}, // { [playerId]: { [cellIndex]: { by, mode, at } } }
      pending: {}, // { [requestId]: { from, to, index, at } }
      wins: {}, // { [playerId]: 達標時刻 }，決定排行榜順序與「獲勝」標記
      endedAt: null,
      finalBoard: null, // 結算當下的排行榜快照（見 handleEndGame）
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
      case 'endGame':
        return this.handleEndGame(ws, room, who);
      case 'reset':
        return this.handleReset(ws, room, who);
      case 'requestMatch':
        return this.handleRequestMatch(ws, room, who, msg);
      case 'cancelMatch':
        return this.handleCancelMatch(ws, room, who, msg);
      case 'respond':
        return this.handleRespond(ws, room, who, msg);
      case 'selfClaim':
        return this.handleSelfClaim(ws, room, who, msg);
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
    const room = await this.loadRoom();
    if (!room) return;

    /*
     * 大廳裡斷線就直接移出名單；開始之後只標「離線」，不移除。
     *
     * 分開處理的理由：手機鎖屏、切 App 都會走到這裡。大廳還沒發卡，移掉沒有代價，
     * 而且留著一排離線的人會讓主持人不知道到底幾個人在。但**進行中不能移**——
     * 那會刪掉他的卡片、打勾與名次，還會取消別人正在等他確認的請求，
     * 螢幕暗個三十秒就把進度洗掉。主持人斷線也不移除，不然房間就沒人管了。
     */
    const who = ws && ws.deserializeAttachment();
    if (room.status === 'lobby' && who && who.clientId !== room.hostId && room.players[who.clientId]) {
      this.forgetPlayer(room, who.clientId);
      await this.saveRoom();
    }

    this.broadcast(room);
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

    // 非致命：客戶端留著這條連線，等使用者填完暱稱再送一次 hello
    if (!nickname) return this.sendError(ws, 'nickname_required');

    /*
     * 擋重名。名單是拿來「點選剛剛跟我聊天的那個人」的，兩個一樣的名字
     * 不但選不對人，被選錯的那個還可能誤按確認——而確認是不可撤銷的。
     */
    const clash = Object.entries(room.players).some(
      ([id, player]) => id !== clientId && player.nickname.toLowerCase() === nickname.toLowerCase(),
    );
    if (clash) return this.sendError(ws, 'nickname_taken');

    const known = room.players[clientId];

    /*
     * 遊戲進行中才到的人**直接發一張卡**（2026-10-19 改）：題庫在開始時就鎖定了，
     * 但發卡只是把同一份題目換個順序排，晚到的人拿到的卡跟大家同一套規則，不影響別人。
     * 現場的人本來就是陸續到的，讓他乾等到下一輪太可惜。
     *
     * 只有這一輪已經結束（結算畫面）才進來的人是**旁觀者**：留在名單上，
     * 主持人按「再玩一輪」就會拿到卡（CONCEPT.md 第四節）。
     */
    const lateJoin = !known && room.status === 'playing' && !isHost;
    const spectator = !known && room.started && room.status !== 'playing' && !isHost;

    if (!known && !spectator && Object.keys(room.players).length >= room.maxPlayers) {
      return this.sendError(ws, 'room_full', true);
    }

    if (lateJoin) {
      room.cards[clientId] = buildCard(
        room.size,
        room.questions.map((question) => question.id),
        room.anchor ? room.anchor.id : null,
        `${room.code}:${clientId}`,
      );
      room.marks[clientId] = {};
    }

    room.players[clientId] = {
      nickname,
      avatar: cleanAvatar(msg.avatar),
      joinedAt: known?.joinedAt ?? Date.now(),
      host: isHost,
      spectator: known ? Boolean(known.spectator) : spectator,
    };

    const role = isHost ? 'host' : 'player';
    ws.serializeAttachment({ clientId, role });
    await this.saveRoom({ touch: true });

    ws.send(JSON.stringify({ t: 'welcome', you: { id: clientId, role, nickname } }));
    this.broadcast(room);
  }

  /*
   * 主持人在大廳裡改設定：尺寸、獲勝連線數、保底題、題庫、自行認定開關。
   *
   * 每次都送「完整的」題目清單而不是增減指令：主持人可能同時開好幾個分頁，
   * 用增減指令兩邊會愈疊愈亂，整份覆蓋則不管誰後送都會收斂到同一個狀態。
   *
   * 只有大廳能改。開始之後尺寸、題庫、獲勝連線數一律鎖定（CONCEPT.md 2.5），
   * 中途改等於換規則，對配對到一半的人不公平。
   */
  async handleSettings(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.status !== 'lobby') return this.sendError(ws, 'already_started');

    if (msg.size !== undefined) {
      const size = Number(msg.size);
      if (SIZES.includes(size)) {
        room.size = size;
        // 尺寸變了，原本的獲勝條件可能超過新尺寸的上限（例如 5×5 選了 5 條再改成 3×3）
        room.targetLines = Math.min(room.targetLines, MAX_TARGET_LINES[size]);
        // 4×4 沒有中央格，切過去要把保底題丟掉，免得題數算錯
        if (!hasAnchor(size)) room.anchor = null;
      }
    }

    if (msg.targetLines !== undefined) {
      const lines = Number(msg.targetLines);
      if (Number.isInteger(lines) && lines >= 1 && lines <= MAX_TARGET_LINES[room.size]) {
        room.targetLines = lines;
      }
    }

    if (msg.allowSelfClaim !== undefined) room.allowSelfClaim = Boolean(msg.allowSelfClaim);
    if (msg.hostPlays !== undefined) room.hostPlays = Boolean(msg.hostPlays);
    if (msg.winnerCount !== undefined) {
      const count = Number(msg.winnerCount);
      // 1～3 人。沒有「不限」：介面上沒有手動結束的按鈕，一輪一定要靠達標人數收場（2026-10-19 拿掉）
      if (Number.isInteger(count) && count >= 1 && count <= MAX_WINNERS) room.winnerCount = count;
    }

    if (msg.anchor !== undefined) {
      // 空清單是合法的中間狀態（主持人正在重挑），擋在 startGame 那關就好
      room.anchor = hasAnchor(room.size) ? (cleanQuestions([msg.anchor])?.[0] ?? null) : null;
    }

    if (msg.questions !== undefined) {
      room.questions = cleanQuestions(msg.questions, shuffleSlots(room.size)) ?? [];
    }

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 主持人按下「開始遊戲」：驗題數、發卡、鎖定設定。
   *
   * 題數沒填滿就開始的話，空題目會產生永遠打不了勾的格子——而如果它剛好落在
   * 中央（4 條線）或角落（3 條線），那個人的卡等於直接廢掉幾條線。
   */
  async handleStartGame(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.started) return this.sendError(ws, 'already_started');

    if (hasAnchor(room.size) && !room.anchor) return this.sendError(ws, 'anchor_required');
    if (room.questions.length !== shuffleSlots(room.size)) {
      return this.sendError(ws, 'question_count_mismatch');
    }

    /*
     * 至少要兩個人。一個人的房間沒有人可以配對——每一格都要「找到一個別人」
     * 並請對方確認，只有自己的話整張卡一格都打不了勾。
     *
     * 算的是房間裡的人數，不是拿卡的人數：主持人就算關掉「一起玩」也還在現場，
     * 別人一樣可以找他配對、請他確認。
     */
    const players = Object.keys(room.players);
    if (players.length < MIN_PLAYERS) return this.sendError(ws, 'need_two_players');

    room.started = true;
    room.status = 'playing';
    room.endedAt = null;
    room.cards = {};
    room.marks = {};
    room.pending = {};
    room.wins = {};

    const ids = room.questions.map((question) => question.id);
    for (const playerId of players) {
      // 純控場的主持人不發卡。他仍然留在名單上，別人可以找他配對、請他確認
      if (!room.hostPlays && playerId === room.hostId) {
        room.players[playerId].spectator = true;
        continue;
      }
      room.players[playerId].spectator = false;
      room.cards[playerId] = buildCard(
        room.size,
        ids,
        room.anchor ? room.anchor.id : null,
        `${room.code}:${playerId}`,
      );
      room.marks[playerId] = {};
    }

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 主持人手動結束。2026-10-19 起介面上已經沒有「結束這輪」的按鈕（一輪靠達標人數自動收場，見 checkWin），
   * 這個訊息留給煙霧測試直接收場用，也讓舊版頁面送來時不會出錯。
   */
  async handleEndGame(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');
    if (room.status !== 'playing') return this.sendError(ws, 'not_playing');

    this.finishRound(room);

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 主持人在結算頁按「再玩一輪」：退回大廳，同一批人可以再來一次。
   *
   * 保留成員與題庫，清掉卡片、打勾與名次。重點是把 started 放掉——
   * 剛剛只能旁觀的人這時就變成正式玩家，下一輪會拿到卡。
   */
  async handleReset(ws, room, who) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    room.status = 'lobby';
    room.started = false;
    room.endedAt = null;
    room.cards = {};
    room.marks = {};
    room.pending = {};
    room.wins = {};
    room.finalBoard = null;
    for (const player of Object.values(room.players)) player.spectator = false;

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 送出配對請求：「我覺得你符合第 N 格的描述」。
   *
   * 可以同時對很多格送出，不必等前一格有結果——限制一次只能等一格的話，
   * 全場節奏會被別人的按鈕速度綁死（CONCEPT.md 第四節）。
   */
  async handleRequestMatch(ws, room, who, msg) {
    const error = this.checkPlaying(room, who);
    if (error) return this.sendError(ws, error);

    const index = Number(msg.index);
    if (!this.validCell(room, who.clientId, index)) return this.sendError(ws, 'bad_cell');

    const targetId = typeof msg.playerId === 'string' ? msg.playerId : '';
    // 不能選自己。這條直接決定保底題的性質：能選自己的話，
    // 「今天有來聚會的人」就變成偷偷的 Free 格，保底題的設計就失效了
    if (targetId === who.clientId) return this.sendError(ws, 'cannot_pick_self');
    if (!room.players[targetId]) return this.sendError(ws, 'no_such_player');

    if (room.marks[who.clientId]?.[index]) return this.sendError(ws, 'already_marked');
    if (this.pendingFor(room, who.clientId, index)) return this.sendError(ws, 'already_pending');

    const requestId = `${who.clientId}:${index}:${Date.now().toString(36)}`;
    room.pending[requestId] = { from: who.clientId, to: targetId, index, at: Date.now() };

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 取消自己送出、還沒被回應的請求。
   *
   * 沒有這個動作的話，對方關掉頁面、手機沒電、跑去別的地方，那一格就永久卡在
   * 「等待確認」——而這比「題目對不到人」更常發生（CONCEPT.md 第四節）。
   */
  async handleCancelMatch(ws, room, who, msg) {
    const error = this.checkPlaying(room, who);
    if (error) return this.sendError(ws, error);

    const index = Number(msg.index);
    const found = this.pendingFor(room, who.clientId, index);
    if (!found) return this.sendError(ws, 'no_such_request');

    delete room.pending[found];
    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 回應別人的請求：確認或婉拒。
   *
   * **確認之後不可撤銷。** 誤按沒有反悔的機會，所以客戶端在按鈕上做防呆
   * （確認前顯示完整句子）；婉拒沒有這個問題，它發生在打勾之前。
   */
  async handleRespond(ws, room, who, msg) {
    if (room.status !== 'playing') return this.sendError(ws, 'not_playing');

    const requestId = typeof msg.requestId === 'string' ? msg.requestId : '';
    const request = room.pending[requestId];
    if (!request) return this.sendError(ws, 'no_such_request');
    // 只有被指名的那個人能回應。旁觀者也可以——他人在現場，也符合描述
    if (request.to !== who.clientId) return this.sendError(ws, 'not_your_request');

    delete room.pending[requestId];

    if (msg.accept) {
      const marks = room.marks[request.from] ?? {};
      // 這一格在等待期間可能已經被自行認定填掉了，不覆寫
      if (!marks[request.index]) {
        marks[request.index] = { by: who.clientId, mode: 'confirmed', at: Date.now() };
        room.marks[request.from] = marks;
        this.checkWin(room, request.from);
      }
    }

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  /*
   * 自行認定：找不到符合的人時直接打勾，由主持人的開關決定能不能用。
   *
   * 沒有這條的話，「找不到人可以算自己符合」那條寬鬆規則在畫面上根本按不下去——
   * 系統唯一的打勾途徑是「選人 → 對方確認」（CONCEPT.md 第四節）。
   */
  async handleSelfClaim(ws, room, who, msg) {
    const error = this.checkPlaying(room, who);
    if (error) return this.sendError(ws, error);
    if (!room.allowSelfClaim) return this.sendError(ws, 'self_claim_disabled');

    const index = Number(msg.index);
    if (!this.validCell(room, who.clientId, index)) return this.sendError(ws, 'bad_cell');
    if (room.marks[who.clientId]?.[index]) return this.sendError(ws, 'already_marked');

    // 這一格如果還有送出中的請求，一併作廢——對方之後才按確認會變成重複打勾
    const stale = this.pendingFor(room, who.clientId, index);
    if (stale) delete room.pending[stale];

    const marks = room.marks[who.clientId] ?? {};
    marks[index] = { by: null, mode: 'self', at: Date.now() };
    room.marks[who.clientId] = marks;
    this.checkWin(room, who.clientId);

    await this.saveRoom({ touch: true });
    this.broadcast(room);
  }

  // 達標就記下時刻。只記第一次——排行榜的第一鍵是「達標時間」，重寫會讓名次亂跳
  checkWin(room, playerId) {
    if (room.wins[playerId]) return;
    const lines = countLines(room.size, room.marks[playerId] ?? {});
    if (lines < room.targetLines) return;

    room.wins[playerId] = Date.now();

    /*
     * 達標人數到了就自動收場（介面上已經沒有「結束這輪」的按鈕，這是唯一的收場方式）。
     *
     * 拿到卡的人比設定的人數少時（例如設 3 人、只有 2 個人在玩），改成「拿卡的人全部達標」就收場，
     * 不然這一輪永遠結束不了。舊房間存著 0（以前的「不限」）的也當成 1。
     */
    const need = Math.min(Math.max(1, room.winnerCount), Object.keys(room.cards).length);
    if (Object.keys(room.wins).length >= need) {
      this.finishRound(room);
    }
  }

  /*
   * 收場。主持人手動結束與達標自動結束共用這一段，兩條路的結果必須一模一樣——
   * 分開寫的話遲早有一邊忘了清 pending 或忘了拍快照。
   */
  finishRound(room) {
    room.status = 'ended';
    room.endedAt = Date.now();
    // 還在等待確認的請求一律作廢，結算畫面才不會有半成品
    room.pending = {};

    /*
     * 結算畫面是**靜態的紀錄**，所以把當下的排行榜整份存起來。
     *
     * 不存的話，有人在結算後離開房間（forgetPlayer 會把他從 players 刪掉）
     * 就會直接從最終榜上消失——名次跟著位移，看起來像沒玩過。
     * online / waiting 是「現在」才有意義的欄位，靜態紀錄裡歸零。
     */
    room.finalBoard = leaderboard(room, new Set(Object.keys(room.players))).map((row) => ({
      ...row,
      online: true,
      waiting: 0,
    }));
  }

  checkPlaying(room, who) {
    if (room.status !== 'playing') return 'not_playing';
    // 旁觀者沒有卡片，只能幫別人按確認
    if (!room.cards[who.clientId]) return 'spectator_only';
    return null;
  }

  validCell(room, playerId, index) {
    const card = room.cards[playerId];
    if (!card) return false;
    return Number.isInteger(index) && index >= 0 && index < card.length;
  }

  // 這個人的這一格有沒有還在等待中的請求，有的話回傳 requestId
  pendingFor(room, playerId, index) {
    for (const [requestId, request] of Object.entries(room.pending)) {
      if (request.from === playerId && request.index === index) return requestId;
    }
    return null;
  }

  // 主持人把某個玩家移出房間
  async handleKick(ws, room, who, msg) {
    if (who.role !== 'host') return this.sendError(ws, 'host_only');

    const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
    if (!room.players[playerId] || playerId === room.hostId) {
      return this.sendError(ws, 'no_such_player');
    }

    this.forgetPlayer(room, playerId);
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

    this.forgetPlayer(room, who.clientId);

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

  /*
   * 把一個人從房間裡抹掉。
   *
   * 他送出與收到的待確認請求都要一起清掉，否則別人的格子會卡在「等待一個已經
   * 不存在的人確認」，而且取消按鈕在對方消失後仍然是唯一的出路——不如直接放掉。
   * **已經打勾的格子不動**：那是別人已經成立的連線，不因為確認人離場而倒退。
   */
  forgetPlayer(room, playerId) {
    delete room.players[playerId];
    delete room.cards[playerId];
    delete room.marks[playerId];
    delete room.wins[playerId];
    for (const [requestId, request] of Object.entries(room.pending)) {
      if (request.from === playerId || request.to === playerId) delete room.pending[requestId];
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

  async alarm() {
    const room = await this.loadRoom();
    if (!room) return;

    if (Date.now() >= room.expiresAt) {
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

    await this.ctx.storage.setAlarm(room.expiresAt);
  }

  /*
   * 廣播。跟系列其他專案不同，這裡**每條連線收到的內容不一樣**：
   * 公開狀態（名單、排行榜、設定）大家一樣，但自己的卡片、打勾、
   * 送出中的請求、待你確認的清單是私有的，要一條一條組。
   *
   * 30 人 × 25 格的規模下，每次廣播組 30 份 payload 不是問題；
   * 換成「全部人的卡片都廣播給全部人」反而是 30 倍的量，還讓人看得到別人卡片的排列。
   */
  broadcast(room) {
    const sockets = this.ctx.getWebSockets();
    const online = new Set();
    for (const socket of sockets) {
      const who = socket.deserializeAttachment();
      if (who?.clientId) online.add(who.clientId);
    }

    const shared = publicState(room, online);

    for (const socket of sockets) {
      const who = socket.deserializeAttachment();
      try {
        socket.send(
          JSON.stringify({
            t: 'state',
            state: shared,
            you: who?.clientId ? privateState(room, who.clientId) : null,
          }),
        );
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

// 這個尺寸要準備幾道洗牌題（保底題不算在內）：3×3 → 8、4×4 → 16、5×5 → 24
export function shuffleSlots(size) {
  return cellCount(size) - (hasAnchor(size) ? 1 : 0);
}

/*
 * 大家都一樣的部分。
 *
 * 題庫**全程都送**，不像 03 要在開始後藏起來：這裡每個人卡片上的題目內容本來就一模一樣，
 * 差別只在排列順序，藏題庫沒有任何保護作用，反而讓客戶端畫不出自己的卡。
 */
function publicState(room, online) {
  return {
    code: room.code,
    status: room.status,
    started: room.started,
    size: room.size,
    targetLines: room.targetLines,
    allowSelfClaim: room.allowSelfClaim,
    hostPlays: room.hostPlays,
    winnerCount: room.winnerCount,
    maxPlayers: room.maxPlayers,
    anchor: room.anchor,
    anchorIndex: hasAnchor(room.size) ? centerIndex(room.size) : -1,
    questions: room.questions,
    hostOnline: online.has(room.hostId),
    endedAt: room.endedAt,
    // 結算後一律送快照，不再受任何人進出影響
    players:
      room.status === 'ended' && room.finalBoard ? room.finalBoard : leaderboard(room, online),
  };
}

/*
 * 排行榜。排序規則（CONCEPT.md 2.6）：**先看是否達標與達標時間，再看總連線數。**
 *
 * 沒有這條規則的話會出現「甲先連 3 條達標掛著獲勝標記、乙後來連到 7 條」
 * 卻沒人知道獎該給誰的情況——遊戲不會在有人達標時停下來，所以這一定會發生。
 */
function leaderboard(room, online) {
  return Object.entries(room.players)
    .map(([id, player]) => {
      const marks = room.marks[id] ?? {};
      const marked = Object.keys(marks).length;
      const lines = room.cards[id] ? countLines(room.size, marks) : 0;
      return {
        id,
        nickname: player.nickname,
        avatar: player.avatar ?? '',
        host: Boolean(player.host),
        // 大廳名單要照加入順序排（排行榜不用，但兩邊共用同一份 players）
        joinedAt: player.joinedAt,
        /*
         * 大廳裡沒有人是旁觀者——卡片要按下開始才發，這時每個人都還沒有卡。
         * 少了這個 status 判斷，大廳名單會把在場所有人（含主持人）都標上「旁觀」。
         */
        spectator: room.status === 'lobby' ? false : Boolean(player.spectator) || !room.cards[id],
        online: online.has(id),
        lines,
        marked,
        // 全滿貫 = 整張卡打滿，等於連滿這個尺寸的全部連線數。跟「獲勝」是兩個層級的目標
        blackout: Boolean(room.cards[id]) && marked === cellCount(room.size),
        wonAt: room.wins[id] ?? null,
        // 「還有幾個人在等你確認」：熱門的人會被洗版，主持人看得到才好調節
        waiting: Object.values(room.pending).filter((request) => request.to === id).length,
      };
    })
    /*
     * 排名（2026-10-19 改）：**連線越多越前面，連線一樣比打勾的格數**。
     * 兩項都一樣才看誰先達標，最後照暱稱，順序才穩定。
     */
    .sort((a, b) => {
      if (b.lines !== a.lines) return b.lines - a.lines;
      if (b.marked !== a.marked) return b.marked - a.marked;
      if (a.wonAt && b.wonAt) return a.wonAt - b.wonAt;
      if (a.wonAt || b.wonAt) return a.wonAt ? -1 : 1;
      return a.nickname.localeCompare(b.nickname);
    });
}

/*
 * 只有自己看得到的部分：卡片排列、打勾、送出中的請求、待你確認的清單。
 *
 * 待確認清單帶的是 questionId 而不是題目文字：收到請求的人用自己手機的語言
 * 去查同一份題庫，兩邊看到的是各自的語言（自訂題沒得翻譯，原樣顯示）。
 */
function privateState(room, playerId) {
  const card = room.cards[playerId] ?? null;
  const marks = room.marks[playerId] ?? {};

  const outgoing = [];
  const incoming = [];
  for (const [requestId, request] of Object.entries(room.pending)) {
    if (request.from === playerId) {
      outgoing.push({ requestId, index: request.index, to: request.to, at: request.at });
    }
    if (request.to === playerId) {
      const fromCard = room.cards[request.from];
      incoming.push({
        requestId,
        from: request.from,
        at: request.at,
        questionId: fromCard ? fromCard[request.index] : null,
      });
    }
  }
  // 先來的先處理，被洗版的時候順序才不會每次廣播都跳
  incoming.sort((a, b) => a.at - b.at);
  outgoing.sort((a, b) => a.index - b.index);

  return {
    card,
    marks,
    outgoing,
    incoming,
    lines: card ? countLines(room.size, marks) : 0,
    completed: card ? completedLines(room.size, marks) : [],
    won: Boolean(room.wins[playerId]),
  };
}

function cleanNickname(value) {
  if (typeof value !== 'string') return '';
  // 控制字元會把名單與排行榜的版面弄壞，先拿掉再收合空白
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICKNAME_LENGTH);
}

/*
 * 頭像只存 id 字串，**不在這裡驗證是不是那幾個之一**。
 *
 * 驗證需要把 app/avatars.js 整包（含 inline SVG）拉進 Worker bundle，
 * 只為了比對一個字串不划算。客戶端拿到不認得的 id 會退回預設值。
 */
function cleanAvatar(value) {
  if (typeof value !== 'string') return '';
  return /^[a-z]{1,20}$/.test(value) ? value : '';
}

/*
 * 主持人送上來的題目清單。內建題只有 id（各語言的文字在客戶端），自訂題只有 text。
 * 超過上限的直接截斷，重複的 id 只留第一個——同一張卡出現兩道一樣的題目會很怪。
 */
export function cleanQuestions(value, limit = 25) {
  if (!Array.isArray(value)) return null;

  const questions = [];
  const seen = new Set();

  for (const item of value.slice(0, limit)) {
    if (!item || typeof item !== 'object') continue;

    const text =
      typeof item.text === 'string'
        ? item.text.replace(/\s+/g, ' ').trim().slice(0, MAX_QUESTION_LENGTH)
        : '';
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
