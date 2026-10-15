/*
 * 端對端煙霧測試：對著跑起來的 wrangler dev 開一間真的房間，接 10 個 WebSocket 當玩家，
 * 走完「建房 → 加入 → 逐題限時作答 → 分組結果」。
 *
 * 分組要 10 個人才看得出來，用瀏覽器手動開十個分頁測不現實。
 * grouping.test.js 顧的是演算法本身，這支顧的是「DO 的狀態機真的把它接起來了」。
 *
 * 跑法：先 npm run dev，另一個視窗 node test/smoke.mjs
 */

const BASE = process.env.MATCH_URL || 'http://localhost:8788';
const API = BASE + '/match/api';
const WS = BASE.replace(/^http/, 'ws') + '/match/api/rooms';

// 刻意設計成三群人：p01-p03 幾乎全 O、p04-p06 前半 X 後半 O、p07-p09 幾乎全 X，
// p10 隨機。分組如果是對的，這三群應該大致各自成一組
const ANSWERS = {
  p01: 'OOOOOOOO',
  p02: 'OOOOOOOX',
  p03: 'OOOOOOXX',
  p04: 'XXXXOOOO',
  p05: 'XXXXOOOX',
  p06: 'XXXXOOXX',
  p07: 'XXXXXXXX',
  p08: 'XXXXXXXO',
  p09: 'XXXXXXOO',
  p10: 'OXOXOXOX',
};

const QUESTIONS = [
  { id: 'life.morning' },
  { id: 'life.breakfast' },
  { id: 'life.tidy' },
  { id: 'life.nap' },
  { id: 'food.boba' },
  { id: 'food.pineapple' },
  { id: 'food.taro' },
  { text: '自訂題：宵夜是必要的' },
];

let failures = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ' — ' + detail : ''}`);
  }
}

function connect(code, clientId, nickname, avatar) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS}/${code}/ws`);
    const player = { ws, clientId, nickname, state: null, welcomed: false };

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ t: 'hello', clientId, nickname, avatar }));
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.t === 'welcome') {
        player.welcomed = true;
        resolve(player);
      }
      if (msg.t === 'state') player.state = msg.state;
      if (msg.t === 'error') console.log(`  (${nickname} 收到 error: ${msg.code})`);
    });
    ws.addEventListener('error', reject);
    setTimeout(() => reject(new Error(`${nickname} 連線逾時`)), 5000);
  });
}

// DO 的廣播是非同步的，等到條件成立為止，不要用固定的 sleep
async function waitFor(player, predicate, label, timeoutMs = 8000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (player.state && predicate(player.state)) return player.state;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`等不到：${label}`);
}

async function main() {
  console.log(`對象：${BASE}\n`);

  // 1. 建房。主持人不作答，讓 10 個玩家剛好是被分組的人
  const created = await fetch(API + '/rooms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // 首頁只送人數上限，題目與其他設定進了房間才由主持人設定
    body: JSON.stringify({ hostId: 'host-smoke', maxPlayers: 12 }),
  }).then((r) => r.json());

  check('建立房間', Boolean(created.code), JSON.stringify(created));
  const code = created.code;
  console.log(`  房號 ${code}\n`);

  // 2. 主持人與 10 位玩家連線
  const host = await connect(code, 'host-smoke', '主持人', 'pizza');
  check('主持人拿到 welcome', host.welcomed);

  const players = [];
  for (const name of Object.keys(ANSWERS)) {
    players.push(await connect(code, name, name, 'boba'));
  }
  check('10 位玩家都連上', players.length === 10);

  await waitFor(host, (s) => s.players.length === 11, '名單收滿 11 人（含主持人）');
  check('名單上有主持人加 10 位玩家', host.state.players.length === 11);
  check('主持人在名單上有標記', host.state.players.filter((p) => p.host).length === 1);

  // 在大廳裡設定題目與其他選項——這是這一版跟搶答一致的流程
  host.ws.send(JSON.stringify({ t: 'settings', questions: QUESTIONS, groupCount: 3, hostPlays: false }));
  await waitFor(host, (s) => s.questions && s.questions.length === QUESTIONS.length, '題目設定生效');
  check('題目在大廳設定成功', host.state.questionCount === QUESTIONS.length, `拿到 ${host.state.questionCount}`);
  check('主持人選擇不作答', host.state.hostPlays === false);

  // 3. 開始遊戲
  host.ws.send(JSON.stringify({ t: 'startGame' }));
  await waitFor(host, (s) => s.status === 'question', '進入第一題');
  check('開始後進入第一題', host.state.status === 'question' && host.state.index === 0);
  check('倒數有帶下來', host.state.remainingMs > 0 && host.state.remainingMs <= 10000);

  // 4. 逐題作答
  for (let index = 0; index < QUESTIONS.length; index += 1) {
    await waitFor(host, (s) => s.status === 'question' && s.index === index, `第 ${index + 1} 題`);

    for (const player of players) {
      const value = ANSWERS[player.clientId][index];
      player.ws.send(JSON.stringify({ t: 'answer', index, value }));
    }

    // 等伺服器的 10 秒倒數自己到期（alarm 觸發 reveal），不由客戶端推
    await waitFor(host, (s) => s.status === 'reveal' && s.index === index, `第 ${index + 1} 題結算`, 15000);

    const tally = host.state.tally;
    check(
      `第 ${index + 1} 題統計加起來是 10`,
      tally.O + tally.X === 10,
      `O=${tally.O} X=${tally.X}`,
    );
    check(`第 ${index + 1} 題有列出投票的人`, Boolean(tally.voters && tally.voters.O && tally.voters.X));

    host.ws.send(JSON.stringify({ t: 'next' }));
  }

  check('開始後不再送出完整題目清單（防偷看）', players[0].state.questions === null);

  // 5. 結果
  await waitFor(host, (s) => s.status === 'results', '分組結果', 10000);
  const result = host.state.result;

  check('有算出結果', Boolean(result));
  check('有分組', result.grouped === true);
  check(
    '10 個人分成 4/3/3',
    JSON.stringify(result.groups.map((g) => g.members.length)) === '[4,3,3]',
    JSON.stringify(result.groups.map((g) => g.members.length)),
  );

  const seen = result.groups.flatMap((g) => g.members);
  check('每個人都在某一組裡', new Set(seen).size === 10, `只看到 ${new Set(seen).size} 人`);
  check('沒有人一題都沒答', result.skipped.length === 0);
  check(
    '每組都有共同話題',
    result.groups.every((g) => g.topics.length > 0),
    JSON.stringify(result.groups.map((g) => g.topics.length)),
  );

  console.log('\n分組結果：');
  for (const [i, group] of result.groups.entries()) {
    console.log(`  第 ${i + 1} 組：${group.members.join(', ')}（共同話題 ${group.topics.length} 題）`);
  }

  // 6. 玩家也要收到同一份結果
  const anyPlayer = players[0];
  await waitFor(anyPlayer, (s) => s.status === 'results', '玩家也看到結果');
  check('玩家收到的分組跟主持人一致',
    JSON.stringify(anyPlayer.state.result.groups) === JSON.stringify(result.groups));

  /*
   * 7. 結算畫面是靜態的：有人在結算後離開房間，他的暱稱與頭像不能從結果裡消失。
   *
   * 這是真的踩過的 bug——客戶端拿 id 去「現在的名單」查名字，人一走就查不到，
   * 別人的配對結果會剩一個頭像配空白。修法是把身分快照存進 result（見 computeResult）。
   */
  const leaver = players[1];
  const leaverId = leaver.clientId;
  check('結算結果帶了身分快照', Boolean(result.players && result.players[leaverId]), Object.keys(result.players || {}).length);
  const leaverName = result.players[leaverId].nickname;

  leaver.ws.send(JSON.stringify({ t: 'leave' }));
  await new Promise((r) => setTimeout(r, 400));

  check(
    '離開的人已經不在現役名單上',
    !host.state.players.some((p) => p.id === leaverId),
    host.state.players.map((p) => p.id),
  );
  check(
    '但結果裡的身分還在（畫面不會變空白）',
    host.state.result.players[leaverId] &&
      host.state.result.players[leaverId].nickname === leaverName,
    host.state.result.players[leaverId],
  );
  check(
    '他仍然出現在分組結果裡',
    host.state.result.groups.flatMap((g) => g.members).includes(leaverId),
  );

  // 8. 收攤
  host.ws.send(JSON.stringify({ t: 'close' }));
  await new Promise((r) => setTimeout(r, 300));
  const gone = await fetch(`${API}/rooms/${code}`);
  check('關房之後房間就查不到了', gone.status === 404, `拿到 ${gone.status}`);

  for (const player of players) player.ws.close();
  host.ws.close();

  console.log(failures ? `\n${failures} 項失敗` : '\n全部通過');
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error('\n煙霧測試中斷：', error.message);
  process.exit(1);
});
