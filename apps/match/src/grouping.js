/*
 * 契合度計算與分組。全部是純函式，不碰 Durable Object 也不碰 WebSocket，
 * 才能用 `npm test` 單獨驗證——這是整個遊戲唯一「算錯了也不會報錯、只會結果很怪」的地方。
 *
 * 題目沒有正確答案（「火鍋要不要加芋頭」那種），所以這裡不存在分數、對錯、答對題數。
 * 唯一的量是「兩個人有多像」。
 */

/*
 * 主持人設定的是「分成幾組」，不是「每組幾個人」。
 * 現場的人只會知道「這裡要拆成幾攤」，換算每組幾個人是這支程式的事。
 */
export const MIN_GROUP_COUNT = 2;
export const MAX_GROUP_COUNT = 4;

// 每組人數不再由主持人指定，但還是要有邊界：2 人不算一組，超過 8 人就會有人插不上話
export const MIN_GROUP_SIZE = 2;
export const MAX_GROUP_SIZE = 8;

// 少於這個人數就不分組，只給兩兩契合度——5 個人才拆得出 3 + 2
export const MIN_PLAYERS_TO_GROUP = 5;

// 共同作答題數的絕對下限：1 題就 100% 只是誤導
export const MIN_COMMON_ANSWERS = 2;

/*
 * 上榜需要的共同作答題數＝這一輪題數的一半（但至少 MIN_COMMON_ANSWERS 題）。
 *
 * 固定門檻擋不住真正的問題：10 題的場次裡，只趕上 2 題的人只要那 2 題剛好跟你一樣
 * 就是 100%，會直接壓過答滿 10 題、跟你 8 題一樣的人——榜首變成全場最不熟的那個。
 * 用比例當門檻，畫面上的數字就一直是排序用的那個數字，不必為了修正可信度
 * 另外弄一套排序分數（那正是「顯示 A、排序 B」會讓人以為程式壞掉的老問題）。
 */
export function minCommonAnswers(questionCount) {
  return Math.max(MIN_COMMON_ANSWERS, Math.ceil(questionCount / 2));
}

// 每個人在結果頁看得到幾個「跟你最合的人」
export const TOP_PAIRS = 3;

/*
 * 依人數建議組數，給主持人當預設值（他可以自己改）。
 * 5–11 人 2 組、12–19 人 3 組、20 人以上 4 組，換算下來每組大約 3～8 人。
 */
export function suggestedGroupCount(playerCount) {
  if (playerCount >= 20) return 4;
  if (playerCount >= 12) return 3;
  return MIN_GROUP_COUNT;
}

/*
 * 每個「答案」的權重＝該答案在全場的比例的倒數。
 *
 * 全場九成都選 O 的題目，兩個人都選 O 幾乎沒有資訊量（權重 ≈ 1.1）；
 * 十個人裡只有兩個選 X，這兩個人都選 X 才是強訊號（權重 = 5）。
 * 不加權的話隨機兩人本來就有 ~50% 契合度，所有人的數字會擠在 50–75%，看不出差別。
 */
export function answerWeights(answers) {
  const tally = new Map(); // questionId -> { O, X, total }

  for (const perQuestion of Object.values(answers)) {
    for (const [questionId, value] of Object.entries(perQuestion)) {
      if (value !== 'O' && value !== 'X') continue;
      const row = tally.get(questionId) ?? { O: 0, X: 0, total: 0 };
      row[value] += 1;
      row.total += 1;
      tally.set(questionId, row);
    }
  }

  const weights = new Map(); // questionId -> { O, X, total }
  for (const [questionId, row] of tally) {
    weights.set(questionId, {
      // count 為 0 表示沒有人選這一邊，權重不會被用到，給 total 當上限就好
      O: row.O ? row.total / row.O : row.total,
      X: row.X ? row.total / row.X : row.total,
      total: row.total,
    });
  }
  return weights;
}

/*
 * 把「隨機兩個人」的期望分數校正回 1.0。
 *
 * 直覺上 1/比例 這個權重的期望貢獻就是 1，但那是把「同一個人抽兩次」也算進去才成立的。
 * 實際比對的一定是兩個**不同**的人，扣掉自己配自己之後期望值是 (T-2)/(T-1)：
 * 8 個人時是 0.857，30 個人時是 0.967——人少的場次分數會被系統性壓低。
 * 乘上這個倒數之後，不管幾個人來玩，1.0 都代表「跟路人甲一樣像」。
 *
 * 只有 2 個人答的題目沒有「隨機」可言（那一對就是全部），不校正。
 */
function chanceCorrection(total) {
  return total > 2 ? (total - 1) / (total - 2) : 1;
}

/*
 * 兩個人的契合度。只看「雙方都有作答」的題目——沒在 10 秒內答完的題目直接跳過，
 * 不能當成「答案不同」，那會平白拉低沒趕上時間的人的契合度。
 *
 *   score = Σ(答案相同的題目權重) ÷ 共同作答題數
 *
 * 分母**不能**用「雙方那幾題的權重總和」：兩個人如果每題都一樣，分子分母會完全相消，
 * 不管答的是冷門還是熱門答案都得到 1.0，加權等於白做（這條是被測試抓出來的）。
 * 改成除以題數之後，這個分數有一個很好用的性質：
 *
 *   **隨機兩個人的期望分數剛好是 1.0。**
 *
 * 因為每題的期望貢獻 = P(答案剛好一樣) × E[權重 | 一樣]
 *                    = (n_O² + n_X²) / T² × T² / (n_O² + n_X²) = 1
 *
 * 所以 1.0 ＝「跟路人甲一樣像」，2.0 ＝「像到隨機的兩倍」。**這個分數只拿來分組**，
 * 契合度榜的排序與顯示都走 same / common 的白話比例：收合時是百分比，
 * 展開後是「8 / 10 題一樣」。加權分數不好懂也不好解釋，不要顯示，
 * 也不要拿來排一個顯示別的數字的榜。
 */
export function pairAffinity(a, b, weights) {
  let matched = 0;
  let same = 0;
  let common = 0;
  const sharedQuestions = [];

  for (const [questionId, valueA] of Object.entries(a)) {
    const valueB = b[questionId];
    if (valueB === undefined) continue;

    const weight = weights.get(questionId);
    if (!weight) continue;

    common += 1;
    if (valueA === valueB) {
      same += 1;
      sharedQuestions.push({ questionId, value: valueA });
      matched += weight[valueA] * chanceCorrection(weight.total);
    }
    // 答案不同：分子不加，但分母（共同作答題數）照算，自然把分數拉下來
  }

  return {
    score: common > 0 ? matched / common : 0,
    same,
    common,
    // 顯示用的百分比走白話版本，不是加權版
    percent: common > 0 ? Math.round((same / common) * 100) : 0,
    sharedQuestions,
  };
}

/*
 * 全部兩兩組合。playerIds 先排序，讓同樣的輸入永遠算出同樣的結果——
 * DO 休眠喚醒後可能重算，兩次算出不同的分組會很難看。
 */
export function affinityMatrix(playerIds, answers) {
  const ids = [...playerIds].sort();
  const weights = answerWeights(answers);
  const matrix = new Map(); // "a|b"（a < b）-> affinity

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ids[i];
      const b = ids[j];
      matrix.set(`${a}|${b}`, pairAffinity(answers[a] ?? {}, answers[b] ?? {}, weights));
    }
  }
  return { ids, weights, matrix };
}

export function lookup(matrix, a, b) {
  return matrix.get(a < b ? `${a}|${b}` : `${b}|${a}`) ?? null;
}

/*
 * 分組：有人數上限的凝聚式分法。
 *
 *   1. 先算好每組要幾個人（總人數平均分，餘數往前面的組加）
 *   2. 取契合度最高、且兩人都還沒分組的一對當種子
 *   3. 反覆把「與組內現有成員平均契合度最高」的人加進來，直到這組滿員
 *   4. 開下一組重複
 *
 * 重點是**每個人都會在某一組裡**。原本一對一配對的話，「最佳拍檔」不是對稱的
 * （A 的拍檔是 B，不代表 B 的拍檔是 A），一定會有人不是任何人的拍檔——
 * 破冰活動裡讓人發現自己沒被任何人選到是最糟的結果。
 */
export function buildGroups(playerIds, answers, groupCount = MIN_GROUP_COUNT) {
  const { ids, matrix } = affinityMatrix(playerIds, answers);
  if (!ids.length) return { groups: [], grouped: false, matrix };

  if (ids.length < MIN_PLAYERS_TO_GROUP) {
    // 人太少，分組沒意義：整場當一組，畫面只顯示兩兩契合度
    return { groups: [{ members: ids }], grouped: false, matrix };
  }

  const targets = groupSizes(ids.length, resolveGroupCount(ids.length, groupCount));

  const remaining = new Set(ids);
  const groups = [];

  for (const target of targets) {
    if (!remaining.size) break;
    const members = [];

    // 種子：剩下的人裡契合度最高的一對
    const seed = bestPair(remaining, matrix);
    if (seed) {
      members.push(seed[0], seed[1]);
      remaining.delete(seed[0]);
      remaining.delete(seed[1]);
    } else {
      const only = [...remaining].sort()[0];
      members.push(only);
      remaining.delete(only);
    }

    while (members.length < target && remaining.size) {
      const next = bestFit(members, remaining, matrix);
      members.push(next);
      remaining.delete(next);
    }

    groups.push({ members });
  }

  // 理論上不會有剩的人，但組數算法改動時容易出錯，補一層保險：塞進平均契合度最高的組
  for (const leftover of [...remaining].sort()) {
    let best = groups[0];
    let bestScore = -Infinity;
    for (const group of groups) {
      const score = averageScore(leftover, group.members, matrix);
      if (score > bestScore) {
        bestScore = score;
        best = group;
      }
    }
    best.members.push(leftover);
  }

  return { groups, grouped: true, matrix };
}

/*
 * 主持人選的組數不一定跟實到人數搭得起來，這裡夾回做得出來的範圍。
 *
 * 下限：組數太少會有組超過 MAX_GROUP_SIZE（30 人分 2 組 = 每組 15 個，聊不起來）
 * 上限：組數太多會有組不到 MIN_GROUP_SIZE（5 人分 4 組會生出 3 個 1 人組）
 *
 * 兩邊夾完之後範圍一定不會是空的：ids.length ≥ MIN_PLAYERS_TO_GROUP 才會走到這裡。
 */
function resolveGroupCount(total, requested) {
  const fewest = Math.max(MIN_GROUP_COUNT, Math.ceil(total / MAX_GROUP_SIZE));
  const most = Math.min(MAX_GROUP_COUNT, Math.floor(total / MIN_GROUP_SIZE));
  return clamp(requested, fewest, Math.max(fewest, most));
}

// 平均分，餘數往前面的組加：10 人分 3 組 = 4 / 3 / 3，不會變成 4 / 4 / 2
function groupSizes(total, count) {
  const base = Math.floor(total / count);
  const extra = total % count;
  return Array.from({ length: count }, (unused, index) => base + (index < extra ? 1 : 0));
}

// 同分時比共同作答題數，再同分就比 id：同樣的輸入要能算出一模一樣的分組
function betterPair(candidate, incumbent) {
  if (!incumbent) return true;
  if (candidate.score !== incumbent.score) return candidate.score > incumbent.score;
  if (candidate.common !== incumbent.common) return candidate.common > incumbent.common;
  return candidate.key < incumbent.key;
}

function bestPair(remaining, matrix) {
  const ids = [...remaining].sort();
  let best = null;

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const affinity = lookup(matrix, ids[i], ids[j]);
      if (!affinity) continue;
      const candidate = {
        score: affinity.score,
        common: affinity.common,
        key: `${ids[i]}|${ids[j]}`,
        pair: [ids[i], ids[j]],
      };
      if (betterPair(candidate, best)) best = candidate;
    }
  }
  return best?.pair ?? null;
}

function bestFit(members, remaining, matrix) {
  let best = null;

  for (const id of [...remaining].sort()) {
    const candidate = {
      score: averageScore(id, members, matrix),
      common: averageCommon(id, members, matrix),
      key: id,
    };
    if (betterPair(candidate, best)) best = candidate;
  }
  return best.key;
}

function averageScore(id, members, matrix) {
  if (!members.length) return 0;
  let sum = 0;
  for (const member of members) sum += lookup(matrix, id, member)?.score ?? 0;
  return sum / members.length;
}

function averageCommon(id, members, matrix) {
  if (!members.length) return 0;
  let sum = 0;
  for (const member of members) sum += lookup(matrix, id, member)?.common ?? 0;
  return sum / members.length;
}

/*
 * 組內共同話題：全組答案一致的題目。
 *
 * 4 個人全部一致的題目可能一題都沒有，那樣結果頁會開天窗，所以不足 minTopics 題時
 * 補上「只有一個人不一樣」的題目並標記 dissenter——那種題目其實更好聊
 * （「就你一個人不加芋頭喔？」），不是退而求其次。
 */
export function groupTopics(members, answers, minTopics = 3) {
  const unanimous = [];
  const almost = [];
  const questionIds = new Set();
  for (const id of members) {
    for (const questionId of Object.keys(answers[id] ?? {})) questionIds.add(questionId);
  }

  for (const questionId of [...questionIds].sort()) {
    const votes = { O: [], X: [] };
    for (const id of members) {
      const value = answers[id]?.[questionId];
      if (value === 'O' || value === 'X') votes[value].push(id);
    }
    const answered = votes.O.length + votes.X.length;
    // 只有一個人作答的題目不算共同話題，聊不起來
    if (answered < 2) continue;

    if (votes.O.length === answered) unanimous.push({ questionId, value: 'O', dissenter: null });
    else if (votes.X.length === answered) unanimous.push({ questionId, value: 'X', dissenter: null });
    else if (votes.O.length === 1) almost.push({ questionId, value: 'X', dissenter: votes.O[0] });
    else if (votes.X.length === 1) almost.push({ questionId, value: 'O', dissenter: votes.X[0] });
  }

  const topics = [...unanimous];
  if (topics.length < minTopics) topics.push(...almost.slice(0, minTopics - topics.length));
  return topics;
}

/*
 * 全場的兩兩契合度榜。每個玩家看的是 topPairsByPlayer 算出來的自己那三列，
 * 這支只剩一個用途：主持人選了不作答時他沒有任何配對，拿全場最合的幾對頂上，
 * 不然他的結果頁會開天窗。
 *
 * 共同作答題數不到門檻的組合不列——1 題就 100% 只會讓人誤會。
 */
export function affinityRanking(playerIds, answers, limit = TOP_PAIRS) {
  const { ids, weights, matrix } = affinityMatrix(playerIds, answers);
  const required = minCommonAnswers(weights.size);
  const rows = [];

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const affinity = lookup(matrix, ids[i], ids[j]);
      if (!affinity || affinity.common < required) continue;
      rows.push({
        players: [ids[i], ids[j]],
        same: affinity.same,
        common: affinity.common,
        percent: affinity.percent,
        shared: affinity.sharedQuestions,
      });
    }
  }

  rows.sort(byDisplayedRatio);
  return rows.slice(0, limit);
}

/*
 * 每個人自己的「跟你最合的人」前幾名。
 *
 * 為什麼在伺服器算好而不是把全部配對送下去讓客戶端篩：廣播的內容所有人共用一份，
 * 30 個人有 435 種配對，每一組還要帶共同答案的題號，整包會膨脹到幾十 KB，
 * 而每個人真正會看的只有 3 列。這裡先切好，只送出去 人數 × 3 列。
 */
export function topPairsByPlayer(playerIds, answers, limit = TOP_PAIRS) {
  const { ids, weights, matrix } = affinityMatrix(playerIds, answers);
  // weights 的 key 就是這一輪有人作答過的題目，拿它當題數不用另外把題目清單傳進來
  const required = minCommonAnswers(weights.size);
  const out = {};

  for (const id of ids) {
    const rows = [];
    for (const other of ids) {
      if (other === id) continue;
      const affinity = lookup(matrix, id, other);
      if (!affinity || affinity.common < required) continue;
      rows.push({
        // 第一個永遠是自己，客戶端不用再判斷哪一邊是「我」
        players: [id, other],
        same: affinity.same,
        common: affinity.common,
        percent: affinity.percent,
        shared: affinity.sharedQuestions,
      });
    }
    rows.sort(byDisplayedRatio);
    out[id] = rows.slice(0, limit);
  }
  return out;
}

/*
 * 排序用畫面上顯示的那個比例（same / common），不是加權分數。
 *
 * 加權分數是拿來分組的，人少的時候沒有統計意義：3 個人的場次「少數派」永遠剛好是
 * 1 個人，權重只是在放大雜訊。而畫面顯示 same / common、排序卻用加權分數的話，
 * 兩個數字不同調就會出現「8 / 10 題一樣」排在「6 / 8 題一樣」下面，玩家只會覺得程式壞了。
 *
 * 交叉相乘比大小，避免除法的浮點誤差（common 一定 ≥ MIN_COMMON_ANSWERS，不會是 0）。
 * 比例相同時共同作答題數多的排前面：8 / 10 比 4 / 5 可信。
 */
function byDisplayedRatio(a, b) {
  // 最後拿配對本身當關鍵字，同分時的順序才不會受輸入順序影響
  const keyA = a.players.join('|');
  const keyB = b.players.join('|');
  return (
    b.same * a.common - a.same * b.common ||
    b.common - a.common ||
    (keyA < keyB ? -1 : keyA > keyB ? 1 : 0)
  );
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}
