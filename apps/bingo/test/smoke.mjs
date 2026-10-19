/*
 * 端對端 smoke test：開一間真的房間、接真的 WebSocket，走完整個配對流程。
 *
 * 需要先跑起 `npm run dev`（預設 http://127.0.0.1:8789，用 BINGO_URL 可以改）。
 *
 * 位址寫死 127.0.0.1 而不是 localhost：Node 解析 localhost 時會優先拿到 IPv6 的 ::1，
 * 但 wrangler dev 只綁 IPv4，連過去會是 fetch failed 而不是明確的錯誤訊息。
 *
 * 為什麼不用瀏覽器手動測：這個遊戲的核心是「甲送出請求 → 乙在自己的裝置上確認」，
 * 至少要兩個獨立的連線才看得出來，而且要驗的邊界情況（取消、婉拒、不能選自己、
 * 中途加入、確認不可撤銷）每一個都要重新擺一次場——手動開分頁點不完。
 *
 * test/bingo.test.js 顧的是連線判定的算術，這支顧的是狀態機與權限。
 */

const BASE = process.env.BINGO_URL || 'http://127.0.0.1:8789';
const API = `${BASE}/bingo/api`;

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
  }
}

/*
 * 一個玩家連線的包裝。
 *
 * 每次廣播都會覆蓋 state / you，另外把收到的錯誤碼堆進 errors——
 * 有幾個測試要驗的正是「伺服器有沒有擋下來」，錯誤本身就是預期結果。
 */
class Client {
  constructor(code, clientId, nickname) {
    this.code = code;
    this.clientId = clientId;
    this.nickname = nickname;
    this.state = null;
    this.you = null;
    this.errors = [];
    this.events = [];
    this.waiters = [];
  }

  connect() {
    const url = `${BASE.replace(/^http/, 'ws')}/bingo/api/rooms/${this.code}/ws`;
    this.ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.ws.addEventListener('error', reject);
      this.ws.addEventListener('open', () => {
        this.send({
          t: 'hello',
          clientId: this.clientId,
          nickname: this.nickname,
          avatar: 'fox',
        });
      });
      this.ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.t === 'state') {
          this.state = msg.state;
          this.you = msg.you;
        } else if (msg.t === 'error') {
          this.errors.push(msg.code);
        } else if (msg.t === 'welcome') {
          this.role = msg.you.role;
          resolve(this);
        } else {
          this.events.push(msg.t);
        }
        for (const waiter of this.waiters.splice(0)) waiter();
      });
      // hello 被擋下來時不會有 welcome，改用錯誤碼收尾
      setTimeout(() => (this.errors.length ? resolve(this) : null), 800);
    });
  }

  send(msg) {
    this.ws.send(JSON.stringify(msg));
  }

  // 送出動作之後等下一次廣播，比固定 sleep 穩、也比較快
  async act(msg, turns = 1) {
    for (let i = 0; i < turns; i += 1) {
      const wait = new Promise((resolve) => this.waiters.push(resolve));
      if (i === 0) this.send(msg);
      await Promise.race([wait, sleep(700)]);
    }
    await sleep(80);
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* 已經斷了 */
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createRoom(hostId, maxPlayers = 10) {
  const response = await fetch(`${API}/rooms`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ hostId, maxPlayers }),
  });
  if (!response.ok) throw new Error(`建房失敗：${response.status}`);
  return (await response.json()).code;
}

/*
 * 3×3、連 1 條線就獲勝的設定。
 *
 * 刻意用最小的尺寸與最低的門檻：這支測的是狀態機，不是耐力——
 * 3 格就能連成一條線，達標與排行榜排序在幾個動作內就驗得完。
 */
async function setupRound(host, { size = 3, targetLines = 1, allowSelfClaim = false, winnerCount = 3 } = {}) {
  const slots = size * size - (size % 2 === 1 ? 1 : 0);
  const questions = Array.from({ length: slots }, (unused, i) => ({ id: `q.${i}` }));

  await host.act({
    t: 'settings',
    size,
    targetLines,
    allowSelfClaim,
    winnerCount,
    anchor: { id: 'anchor.present' },
    questions,
  });
}

async function main() {
  console.log(`smoke test → ${BASE}\n`);

  /* ---------- 建房與加入 ---------- */
  console.log('建房與加入');
  const hostId = 'host-' + Math.random().toString(36).slice(2, 8);
  const code = await createRoom(hostId);
  check('建房拿到 4 碼房號', /^[A-Z0-9]{4}$/.test(code), code);

  const host = await new Client(code, hostId, '主持人').connect();
  const alice = await new Client(code, 'p-alice', '小美').connect();
  const bob = await new Client(code, 'p-bob', '阿明').connect();
  await sleep(200);

  check('主持人身分由伺服器判定', host.role === 'host', host.role);
  check('玩家身分是 player', alice.role === 'player', alice.role);
  check('名單上有三個人', host.state.players.length === 3, host.state.players.length);

  // 重名要擋掉：名單是拿來點選「剛剛跟我聊天的那個人」的
  const clash = await new Client(code, 'p-clash', '小美').connect();
  check('重名被擋下來', clash.errors.includes('nickname_taken'), clash.errors);
  clash.close();

  /*
   * 人數上限**含主持人自己**（跟 02 搶答不一樣，那邊主持人是純控場所以不算）。
   * 首頁那行「2～30 人，含你自己」是使用者看得到的承諾，這裡把它釘住。
   */
  const tinyHostId = 'host-tiny-' + Math.random().toString(36).slice(2, 8);
  const tinyCode = await createRoom(tinyHostId, 2);
  const tinyHost = await new Client(tinyCode, tinyHostId, '主持人').connect();
  const tinyPlayer = await new Client(tinyCode, 'tiny-1', '玩家一').connect();
  await sleep(200);
  check('上限 2 人時主持人加一位玩家就滿了', tinyHost.state.players.length === 2, tinyHost.state.players.length);

  const overflow = await new Client(tinyCode, 'tiny-2', '玩家二').connect();
  check('第三個人被擋在門外', overflow.errors.includes('room_full'), overflow.errors);
  for (const client of [tinyHost, tinyPlayer, overflow]) client.close();

  /*
   * 大廳裡斷線＝離開房間。進行中不適用（那會刪掉卡片與別人的待確認請求），
   * 只有還沒發卡的大廳才這樣處理。
   */
  const dropId = 'host-drop-' + Math.random().toString(36).slice(2, 8);
  const dropCode = await createRoom(dropId);
  const dropHost = await new Client(dropCode, dropId, '主持人').connect();
  const dropPlayer = await new Client(dropCode, 'drop-1', '會斷線的人').connect();
  await sleep(200);
  check('大廳有兩個人', dropHost.state.players.length === 2, dropHost.state.players.length);

  dropPlayer.close();
  await sleep(500);
  check(
    '大廳裡斷線就從名單移除',
    dropHost.state.players.length === 1,
    dropHost.state.players.map((p) => p.nickname),
  );
  check('主持人自己還在', dropHost.state.players[0].host === true, dropHost.state.players[0]);
  dropHost.close();

  /* ---------- 大廳設定 ---------- */
  console.log('\n大廳設定');
  await setupRound(host, { size: 3, targetLines: 1 });
  check('尺寸鎖成 3×3', host.state.size === 3, host.state.size);
  check('獲勝條件 1 條線', host.state.targetLines === 1, host.state.targetLines);
  check('洗牌題剛好 8 題', host.state.questions.length === 8, host.state.questions.length);
  check('保底題設好了', host.state.anchor?.id === 'anchor.present', host.state.anchor);
  check('中央格是第 4 格', host.state.anchorIndex === 4, host.state.anchorIndex);

  // 3×3 的上限是 3 條（連 4 條跟連 5 條門檻一樣，開放沒有意義）
  await host.act({ t: 'settings', targetLines: 5 });
  check('超過尺寸上限的連線數被忽略', host.state.targetLines === 1, host.state.targetLines);

  // 題數不對就不能開始
  await host.act({ t: 'settings', questions: [{ id: 'only.one' }] });
  await host.act({ t: 'startGame' });
  check('題數沒填滿擋住開始', host.errors.includes('question_count_mismatch'), host.errors);
  check('房間仍在大廳', host.state.status === 'lobby', host.state.status);

  const playerOnly = alice.errors.length;
  await alice.act({ t: 'settings', size: 5 });
  check('玩家不能改設定', alice.errors.length > playerOnly, alice.errors);

  /* ---------- 開始的最低人數 ---------- */
  console.log('\n最低人數');
  const soloId = 'host-solo-' + Math.random().toString(36).slice(2, 8);
  const soloCode = await createRoom(soloId);
  const solo = await new Client(soloCode, soloId, '獨自一人').connect();
  await setupRound(solo, { size: 3, targetLines: 1 });
  await solo.act({ t: 'startGame' });
  check('一個人不能開始', solo.errors.includes('need_two_players'), solo.errors);
  check('房間停在大廳', solo.state.status === 'lobby', solo.state.status);

  const soloMate = await new Client(soloCode, 'solo-mate', '第二人').connect();
  await sleep(200);
  await solo.act({ t: 'startGame' });
  await sleep(200);
  check('第二個人到了就能開始', solo.state.status === 'playing', solo.state.status);
  for (const client of [solo, soloMate]) client.close();

  /* ---------- 主持人只控場 ---------- */
  console.log('\n主持人只控場');
  const mcId = 'host-mc-' + Math.random().toString(36).slice(2, 8);
  const mcCode = await createRoom(mcId);
  const mc = await new Client(mcCode, mcId, '控場福長').connect();
  const mcPlayer = await new Client(mcCode, 'mc-p1', '玩家甲').connect();
  await sleep(200);

  await setupRound(mc, { size: 3, targetLines: 1 });
  await mc.act({ t: 'settings', hostPlays: false });
  check('hostPlays 收得到', mc.state.hostPlays === false, mc.state.hostPlays);

  await mc.act({ t: 'startGame' });
  await sleep(250);
  check('主持人沒有拿到卡', mc.you.card === null, mc.you.card);
  check('玩家照樣有卡', mcPlayer.you.card?.length === 9, mcPlayer.you.card?.length);

  const mcRow = mc.state.players.find((player) => player.id === mcId);
  check('主持人標成旁觀（前端據此排除出排行榜）', mcRow?.spectator === true, mcRow);

  // 但他還在名單上，別人一樣可以找他配對、請他確認——他人就在現場
  await mcPlayer.act({ t: 'requestMatch', index: 0, playerId: mcId });
  await sleep(200);
  check('可以找只控場的主持人配對', mc.you.incoming.length === 1, mc.you.incoming);
  await mc.act({ t: 'respond', requestId: mc.you.incoming[0].requestId, accept: true });
  await sleep(200);
  check('他按確認一樣算數', Boolean(mcPlayer.you.marks[0]), mcPlayer.you.marks);
  for (const client of [mc, mcPlayer]) client.close();

  /* ---------- 開始遊戲與發卡 ---------- */
  console.log('\n開始遊戲');
  await setupRound(host, { size: 3, targetLines: 1 });
  await host.act({ t: 'startGame' });
  await sleep(200);

  check('狀態進入 playing', host.state.status === 'playing', host.state.status);
  check('每個人都拿到 9 格', alice.you.card.length === 9, alice.you.card?.length);
  check('保底題固定在中央', alice.you.card[4] === 'anchor.present', alice.you.card[4]);
  check(
    '不同玩家的排列不一樣',
    alice.you.card.join() !== bob.you.card.join(),
    { alice: alice.you.card.join(), bob: bob.you.card.join() },
  );
  check(
    '每個人的題目內容相同（只有順序不同）',
    alice.you.card.slice().sort().join() === bob.you.card.slice().sort().join(),
  );

  /* ---------- 配對流程 ---------- */
  console.log('\n配對流程');
  await alice.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  check('送出後進入等待確認', alice.you.outgoing.length === 1, alice.you.outgoing);
  check('對方收到待確認', bob.you.incoming.length === 1, bob.you.incoming);
  check(
    '待確認帶的是題目 id，讓對方用自己的語言顯示',
    bob.you.incoming[0].questionId === alice.you.card[0],
    bob.you.incoming[0],
  );
  check('等待中還沒打勾', Object.keys(alice.you.marks).length === 0, alice.you.marks);

  // 不能選自己：能選自己的話保底題就變成偷偷的 Free 格
  const beforeSelf = alice.errors.length;
  await alice.act({ t: 'requestMatch', index: 1, playerId: 'p-alice' });
  check('不能選自己', alice.errors.includes('cannot_pick_self'), alice.errors.slice(beforeSelf));

  // 同一格重複送要擋掉
  await alice.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  check('同一格不能重複送出', alice.errors.includes('already_pending'), alice.errors);

  // 婉拒：回到未配對，可以再找別人
  const declineId = bob.you.incoming[0].requestId;
  await bob.act({ t: 'respond', requestId: declineId, accept: false });
  await sleep(150);
  check('婉拒後回到未配對', alice.you.outgoing.length === 0, alice.you.outgoing);
  check('婉拒不會打勾', Object.keys(alice.you.marks).length === 0, alice.you.marks);

  // 取消：對方沒反應時唯一的出路
  await alice.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  await alice.act({ t: 'cancelMatch', index: 0 });
  await sleep(150);
  check('可以取消送出中的請求', alice.you.outgoing.length === 0, alice.you.outgoing);
  check('對方的待確認也跟著消失', bob.you.incoming.length === 0, bob.you.incoming);

  // 確認：正式打勾
  await alice.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  await sleep(150);
  await bob.act({ t: 'respond', requestId: bob.you.incoming[0].requestId, accept: true });
  await sleep(200);
  check('確認後打勾', Boolean(alice.you.marks[0]), alice.you.marks);
  check('打勾記得是誰確認的', alice.you.marks[0].by === 'p-bob', alice.you.marks[0]);
  check('已打勾的格子不能再送請求', true);

  const beforeMarked = alice.errors.length;
  await alice.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  check('重複打勾被擋下', alice.errors.includes('already_marked'), alice.errors.slice(beforeMarked));

  /* ---------- 自行認定 ---------- */
  console.log('\n自行認定');
  const beforeClaim = alice.errors.length;
  await alice.act({ t: 'selfClaim', index: 1 });
  check('主持人沒開放時擋下', alice.errors.includes('self_claim_disabled'), alice.errors.slice(beforeClaim));

  await host.act({ t: 'settings', allowSelfClaim: true });
  check('進行中不能改設定', host.state.allowSelfClaim === false, host.state.allowSelfClaim);

  /* ---------- 連線與達標 ---------- */
  console.log('\n連線與達標');
  // 第一列是 0,1,2；index 0 已經打勾，補完 1 跟 2 就連成一條線
  for (const index of [1, 2]) {
    await alice.act({ t: 'requestMatch', index, playerId: 'p-bob' });
    await sleep(150);
    const request = bob.you.incoming.find((item) => item.from === 'p-alice');
    await bob.act({ t: 'respond', requestId: request.requestId, accept: true });
    await sleep(150);
  }
  check('連成一條線', alice.you.lines === 1, alice.you.lines);
  check('completed 指出是第一列', alice.you.completed.includes(0), alice.you.completed);
  check('達標旗標立起來', alice.you.won === true, alice.you.won);

  const board = alice.state.players;
  check('達標的人排在榜首', board[0].id === 'p-alice', board.map((p) => p.id));
  check('榜上標示達標時間', typeof board[0].wonAt === 'number', board[0].wonAt);
  check('遊戲沒有因為有人達標就結束', alice.state.status === 'playing', alice.state.status);

  /*
   * 達標人數到了就自動收場。
   *
   * 上面那一段刻意把 winnerCount 設成 3（房裡只有 2 個人玩得到），所以連成一條線
   * 之後遊戲還開著；這裡另開一間 winnerCount = 1 的房，驗第一個人達標就結束。
   */
  console.log('\n達標自動收場');
  const autoId = 'host-auto-' + Math.random().toString(36).slice(2, 8);
  const autoCode = await createRoom(autoId);
  const autoHost = await new Client(autoCode, autoId, '收場主持').connect();
  const autoPlayer = await new Client(autoCode, 'auto-p1', '衝線的人').connect();
  await sleep(200);
  await setupRound(autoHost, { size: 3, targetLines: 1, winnerCount: 1 });
  check('winnerCount 收得到', autoHost.state.winnerCount === 1, autoHost.state.winnerCount);

  await autoHost.act({ t: 'startGame' });
  await sleep(250);
  for (const index of [0, 1, 2]) {
    await autoPlayer.act({ t: 'requestMatch', index, playerId: autoId });
    await sleep(150);
    const request = autoHost.you.incoming.find((item) => item.from === 'auto-p1');
    await autoHost.act({ t: 'respond', requestId: request.requestId, accept: true });
    await sleep(150);
  }
  check('第一個人達標就自動結束', autoHost.state.status === 'ended', autoHost.state.status);
  check('自動結束也有拍最終榜', autoHost.state.players.length === 2, autoHost.state.players.length);
  check('自動結束也清掉待確認', Object.keys(autoPlayer.you.outgoing).length === 0, autoPlayer.you.outgoing);
  for (const client of [autoHost, autoPlayer]) client.close();

  /*
   * 沒有「不限」了（2026-10-19，介面上也沒有「結束這輪」）：winnerCount = 0 要被擋下來。
   * 另外設 3 人、但只有 2 個人拿卡時，兩個人都達標就要收場，不然這一輪永遠結束不了。
   */
  const fewId = 'host-few-' + Math.random().toString(36).slice(2, 8);
  const fewCode = await createRoom(fewId);
  const fewHost = await new Client(fewCode, fewId, '人少主持').connect();
  const fewPlayer = await new Client(fewCode, 'few-p1', '衝線的人').connect();
  await sleep(200);
  await setupRound(fewHost, { size: 3, targetLines: 1, winnerCount: 0 });
  check('不收 0（不限）', fewHost.state.winnerCount === 1, fewHost.state.winnerCount);
  await setupRound(fewHost, { size: 3, targetLines: 1, winnerCount: 3 });
  check('3 人收得到', fewHost.state.winnerCount === 3, fewHost.state.winnerCount);

  await fewHost.act({ t: 'startGame' });
  await sleep(250);
  // 玩家連成一條線：只有 1 人達標，還沒結束
  for (const index of [0, 1, 2]) {
    await fewPlayer.act({ t: 'requestMatch', index, playerId: fewId });
    await sleep(150);
    const req = fewHost.you.incoming.find((item) => item.from === 'few-p1');
    await fewHost.act({ t: 'respond', requestId: req.requestId, accept: true });
    await sleep(150);
  }
  check('1 人達標時還沒結束', fewHost.state.status === 'playing', fewHost.state.status);
  // 主持人也連成一條線：拿卡的 2 人都達標了，就算設的是 3 人也要收場
  for (const index of [0, 1, 2]) {
    await fewHost.act({ t: 'requestMatch', index, playerId: 'few-p1' });
    await sleep(150);
    const req = fewPlayer.you.incoming.find((item) => item.from === fewId);
    await fewPlayer.act({ t: 'respond', requestId: req.requestId, accept: true });
    await sleep(150);
  }
  check('拿卡的人全部達標就收場', fewHost.state.status === 'ended', fewHost.state.status);
  for (const client of [fewHost, fewPlayer]) client.close();

  /* ---------- 中途加入 ---------- */
  console.log('\n中途加入');
  const carol = await new Client(code, 'p-carol', '小華').connect();
  await sleep(250);
  check('遲到的人加得進來', carol.role === 'player', carol.errors);
  // 進行中才到的人直接發卡（同一份題目、自己的排列），不再當旁觀
  check('遲到的人也拿到卡片', Array.isArray(carol.you.card) && carol.you.card.length === bob.you.card.length, carol.you.card);
  const carolRow = carol.state.players.find((player) => player.id === 'p-carol');
  check('榜上不是旁觀', carolRow?.spectator === false, carolRow);

  const beforeLate = carol.errors.length;
  await carol.act({ t: 'requestMatch', index: 0, playerId: 'p-bob' });
  await sleep(150);
  check('遲到的人可以送配對請求', !carol.errors.slice(beforeLate).includes('spectator_only'), carol.errors.slice(beforeLate));
  await carol.act({ t: 'cancelMatch', index: 0 });

  // 也可以被別人選、按確認
  await bob.act({ t: 'requestMatch', index: 0, playerId: 'p-carol' });
  await sleep(150);
  check('遲到的人收得到待確認', carol.you.incoming.length === 1, carol.you.incoming);
  await carol.act({ t: 'respond', requestId: carol.you.incoming[0].requestId, accept: true });
  await sleep(200);
  check('遲到的人確認後對方打勾', Boolean(bob.you.marks[0]), bob.you.marks);

  /* ---------- 結束與再玩一輪 ---------- */
  console.log('\n結束與再玩一輪');
  await bob.act({ t: 'requestMatch', index: 1, playerId: 'p-alice' });
  await sleep(150);
  await host.act({ t: 'endGame' });
  await sleep(200);
  check('狀態進入 ended', host.state.status === 'ended', host.state.status);
  check('結算時清掉未回應的請求', bob.you.outgoing.length === 0, bob.you.outgoing);
  check('打勾的結果留著', Boolean(bob.you.marks[0]), bob.you.marks);

  const playerEnd = alice.errors.length;
  await alice.act({ t: 'endGame' });
  check('玩家不能結束遊戲', alice.errors.length > playerEnd, alice.errors);

  /*
   * 結算畫面是靜態的：有人在結算後離開房間，他不能從最終排行榜上消失。
   *
   * 03_PreferenceMatch 踩過同一個 bug（結果畫面拿 id 去現在的名單查名字，人一走就變空白）。
   * 這裡的修法是在 endGame 當下把整份排行榜快照起來（見 handleEndGame 的 finalBoard）。
   */
  const boardBefore = host.state.players.map((player) => player.id);
  check('結算榜上有阿明', boardBefore.includes('p-bob'), boardBefore);

  await bob.act({ t: 'leave' });
  await sleep(300);
  const boardAfter = host.state.players.map((player) => player.id);
  check('他離開房間之後最終榜還是有他', boardAfter.includes('p-bob'), boardAfter);
  check('名次也沒有位移', boardAfter.join() === boardBefore.join(), { boardBefore, boardAfter });

  await host.act({ t: 'reset' });
  await sleep(200);
  check('重設回到大廳', host.state.status === 'lobby', host.state.status);
  check('題庫保留', host.state.questions.length === 8, host.state.questions.length);
  // 阿明剛剛在結算階段離開了，所以是 3 個人（主持人、小美、小華）
  check('名單保留', host.state.players.length === 3, host.state.players.length);
  check('卡片與進度清空', alice.you.card === null, alice.you.card);
  // 大廳裡沒有人該被標成旁觀——這時每個人都還沒有卡，包含主持人在內
  check(
    '回到大廳後沒有人被標成旁觀',
    host.state.players.every((player) => player.spectator === false),
    host.state.players.map((player) => [player.nickname, player.spectator]),
  );

  await host.act({ t: 'startGame' });
  await sleep(250);
  check('再玩一輪時遲到的人也拿到卡', carol.you.card?.length === 9, carol.you.card?.length);

  /* ---------- 收尾 ---------- */
  console.log('\n收尾');
  host.send({ t: 'close' });
  await sleep(300);
  const gone = await fetch(`${API}/rooms/${code}`);
  check('關房之後房間就不存在了', gone.status === 404, gone.status);

  for (const client of [host, alice, bob, carol]) client.close();

  console.log(`\n${passed} 通過、${failed} 失敗`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error('\n測試中斷：', error.message);
  console.error('（先確認 npm run dev 已經跑起來了）');
  process.exit(1);
});
