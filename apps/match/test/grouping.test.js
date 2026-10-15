/*
 * 分組演算法的測試。這一段是整個遊戲唯一「算錯了不會報錯、只會結果很怪」的地方，
 * 而且要真的把 10 個人湊在同一個房間才看得出來，所以用單元測試守住。
 *
 * 跑法：npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  answerWeights,
  pairAffinity,
  buildGroups,
  groupTopics,
  affinityRanking,
  affinityMatrix,
  lookup,
  topPairsByPlayer,
  suggestedGroupCount,
  minCommonAnswers,
} from '../src/grouping.js';

// 依序把答案字串（例如 'OOXX'）攤成 { q1: 'O', q2: 'O', q3: 'X', q4: 'X' }。
// '-' 代表這題沒在時限內作答。
function answersFrom(rows) {
  const out = {};
  for (const [id, pattern] of Object.entries(rows)) {
    const perQuestion = {};
    [...pattern].forEach((value, index) => {
      if (value !== '-') perQuestion[`q${index + 1}`] = value;
    });
    out[id] = perQuestion;
  }
  return out;
}

test('權重＝該答案全場比例的倒數', () => {
  // q1：4 個人選 O、1 個人選 X
  const answers = answersFrom({ a: 'O', b: 'O', c: 'O', d: 'O', e: 'X' });
  const weights = answerWeights(answers);

  assert.equal(weights.get('q1').O, 5 / 4);
  assert.equal(weights.get('q1').X, 5 / 1);
});

test('少數派意見一致，分數高於多數派意見一致', () => {
  // q1 是壓倒性的 O（8:2），q2 也是壓倒性的 O（8:2）
  const answers = answersFrom({
    minority1: 'XX',
    minority2: 'XX',
    m1: 'OO',
    m2: 'OO',
    m3: 'OO',
    m4: 'OO',
    m5: 'OO',
    m6: 'OO',
    m7: 'OO',
    m8: 'OO',
  });
  const weights = answerWeights(answers);

  const rare = pairAffinity(answers.minority1, answers.minority2, weights);
  const common = pairAffinity(answers.m1, answers.m2, weights);

  // 白話百分比兩組都是 100%，看不出差別
  assert.equal(rare.percent, 100);
  assert.equal(common.percent, 100);
  // 但加權分數要能分出「都選冷門那邊」才是真的像
  assert.ok(rare.score > common.score, `${rare.score} 應該大於 ${common.score}`);
});

test('隨機兩個人的期望分數是 1.0（分數的基準線）', () => {
  // 把全場所有兩兩組合的分數平均起來，應該回到 1.0。
  // 這是加權公式的核心性質：1.0 ＝「跟路人甲一樣像」，看到 2.0 才是真的合拍。
  const answers = answersFrom({
    a: 'OOXOX',
    b: 'OXXOO',
    c: 'XXOXO',
    d: 'XOOXX',
    e: 'OXOXO',
    f: 'XOXOX',
    g: 'OOOOO',
    h: 'XXXXX',
  });
  // 加權分數只在分組時用得到，不會送到畫面上，所以直接從矩陣取
  const { ids, matrix } = affinityMatrix(Object.keys(answers), answers);
  const scores = [];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) scores.push(lookup(matrix, ids[i], ids[j]).score);
  }
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  assert.ok(Math.abs(mean - 1) < 1e-9, `平均分數應該是 1.0，實際是 ${mean}`);
});

test('沒作答的題目跳過，不算成答案不同', () => {
  const answers = answersFrom({ a: 'OOX', b: 'OO-' });
  const weights = answerWeights(answers);
  const affinity = pairAffinity(answers.a, answers.b, weights);

  // q3 只有 a 答了，不列入共同題數
  assert.equal(affinity.common, 2);
  assert.equal(affinity.same, 2);
  assert.equal(affinity.percent, 100);
});

test('10 人分 3 組 = 4 / 3 / 3，每個人剛好在一組裡', () => {
  const answers = answersFrom({
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
  });
  // 第三個參數是**組數**，不是每組人數
  const { groups, grouped } = buildGroups(Object.keys(answers), answers, 3);

  assert.equal(grouped, true);
  assert.deepEqual(
    groups.map((group) => group.members.length),
    [4, 3, 3],
  );

  const seen = groups.flatMap((group) => group.members);
  assert.equal(seen.length, 10, '每個人只能出現一次');
  assert.equal(new Set(seen).size, 10, '不能有人重複或漏掉');
});

test('同樣的輸入一定算出同樣的分組', () => {
  const answers = answersFrom({
    p1: 'OOXOX',
    p2: 'OOXOO',
    p3: 'XXOXO',
    p4: 'XXOXX',
    p5: 'OXOXO',
    p6: 'XOXOX',
    p7: 'OOOOO',
    p8: 'XXXXX',
  });
  const first = buildGroups(Object.keys(answers), answers, 4);
  // 打亂 id 順序也要得到一樣的結果：DO 休眠喚醒後重算不能跑出不同的分組
  const second = buildGroups(Object.keys(answers).reverse(), answers, 4);

  assert.deepEqual(
    first.groups.map((group) => group.members),
    second.groups.map((group) => group.members),
  );
});

test('不到 5 個人就不分組', () => {
  const answers = answersFrom({ a: 'OOX', b: 'OOX', c: 'XXO', d: 'XXO' });
  const { groups, grouped } = buildGroups(Object.keys(answers), answers, 2);

  assert.equal(grouped, false);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].members.length, 4);
});

test('剛好 5 個人分 2 組 = 3 + 2', () => {
  const answers = answersFrom({ a: 'OOX', b: 'OOX', c: 'XXO', d: 'XXO', e: 'OXO' });
  const { groups, grouped } = buildGroups(Object.keys(answers), answers, 2);

  assert.equal(grouped, true);
  assert.deepEqual(groups.map((group) => group.members.length), [3, 2]);
});

/*
 * 主持人選的組數跟實到人數不一定搭得起來。這兩條守住夾回範圍的邏輯——
 * 「最多 4 組」跟「每組最多 8 人」是兩個獨立的上限，30 人分 4 組剛好卡在邊緣。
 */
test('組數太多時夾回來，不會生出 1 人組', () => {
  const answers = answersFrom({ a: 'OOX', b: 'OOX', c: 'XXO', d: 'XXO', e: 'OXO' });
  // 5 個人選 4 組的話會變成 2 / 1 / 1 / 1
  const { groups } = buildGroups(Object.keys(answers), answers, 4);

  assert.equal(groups.length, 2);
  for (const group of groups) assert.ok(group.members.length >= 2, '不能有 1 個人的組');
});

test('人多時組數往上夾，不會有超過 8 個人的組', () => {
  const rows = {};
  for (let i = 1; i <= 30; i += 1) {
    rows[`p${String(i).padStart(2, '0')}`] = i % 2 ? 'OOXOX' : 'XOXOO';
  }
  const answers = answersFrom(rows);
  // 主持人選 2 組的話會變成每組 15 個人，聊不起來
  const { groups } = buildGroups(Object.keys(answers), answers, 2);

  assert.equal(groups.length, 4);
  for (const group of groups) assert.ok(group.members.length <= 8, '一組最多 8 個人');
  assert.equal(groups.flatMap((group) => group.members).length, 30);
});

test('建議組數：5–11 人 2 組、12–19 人 3 組、20 人以上 4 組', () => {
  assert.equal(suggestedGroupCount(5), 2);
  assert.equal(suggestedGroupCount(11), 2);
  assert.equal(suggestedGroupCount(12), 3);
  assert.equal(suggestedGroupCount(19), 3);
  assert.equal(suggestedGroupCount(20), 4);
  assert.equal(suggestedGroupCount(30), 4);
});

test('每個人的前三名是自己的配對，而且第一個永遠是自己', () => {
  // a 跟 b 全一樣，跟 c 完全相反
  const answers = answersFrom({ a: 'OOOO', b: 'OOOO', c: 'XXXX', d: 'OOXX' });
  const pairs = topPairsByPlayer(Object.keys(answers), answers);

  assert.deepEqual(pairs.a[0].players, ['a', 'b']);
  assert.equal(pairs.a[0].same, 4);
  // 三個人以外的配對不該出現在自己的清單裡
  for (const [id, rows] of Object.entries(pairs)) {
    assert.ok(rows.length <= 3, `${id} 最多三列`);
    for (const row of rows) assert.equal(row.players[0], id);
  }
  // 展開要看得到共同答案的題目
  assert.deepEqual(
    pairs.a[0].shared.map((topic) => topic.questionId),
    ['q1', 'q2', 'q3', 'q4'],
  );
});

test('全組一致的題目不足時，補上只有一人不同的題目', () => {
  // q1 全組一致；q2 只有 d 不同；q3 只有 a 不同；q4 兩兩分裂
  const answers = answersFrom({ a: 'OOXO', b: 'OOOX', c: 'OOOO', d: 'OXOX' });
  const topics = groupTopics(['a', 'b', 'c', 'd'], answers, 3);

  assert.equal(topics.length, 3);
  assert.deepEqual(topics[0], { questionId: 'q1', value: 'O', dissenter: null });

  const withDissenter = topics.filter((topic) => topic.dissenter);
  assert.equal(withDissenter.length, 2);
  assert.deepEqual(
    withDissenter.map((topic) => topic.questionId).sort(),
    ['q2', 'q3'],
  );
});

test('共同作答不到一半題數的組合不列進契合度榜', () => {
  const answers = answersFrom({ a: 'O--', b: 'O--', c: 'OOX', d: 'OOX' });
  const ranking = affinityRanking(Object.keys(answers), answers);

  // 3 題的場次要至少 2 題共同；a、b 只有 q1 一題
  const pairs = ranking.map((row) => row.players.join('|'));
  assert.ok(!pairs.includes('a|b'), 'a|b 只有 1 題共同，不該上榜');
  assert.ok(pairs.includes('c|d'), 'c|d 有 3 題共同，應該上榜');
});

test('門檻是題數的一半，至少 2 題', () => {
  assert.equal(minCommonAnswers(0), 2);
  assert.equal(minCommonAnswers(3), 2);
  assert.equal(minCommonAnswers(4), 2);
  assert.equal(minCommonAnswers(10), 5);
  assert.equal(minCommonAnswers(20), 10);
});

/*
 * 只趕上兩三題的人不能因為「那兩題剛好一樣」就變成全場榜首。
 * 固定門檻 2 題擋不住這件事，10 題的場次要 5 題共同才算數。
 */
test('只答了 2 題的人不會用 100% 霸榜', () => {
  const answers = answersFrom({
    a: 'OOOOOOOOOO',
    b: 'OOOOOOOOXX', // 跟 a 共同 10 題、一樣 8 題
    c: 'OOOOOXXXXX',
    d: 'OO--------', // 只趕上 2 題，而且都跟 a 一樣 → 2/2 = 100%
  });
  const rows = topPairsByPlayer(Object.keys(answers), answers).a;
  const others = rows.map((row) => row.players[1]);

  assert.ok(!others.includes('d'), 'd 只有 2 題共同，不該出現在 a 的清單裡');
  assert.equal(others[0], 'b', '榜首應該是真的答滿又最像的 b');
  assert.equal(rows[0].percent, 80);
});

/*
 * 這個榜顯示的是 same / common，排序就必須跟那個數字一致。
 * 以前是照加權分數排的，畫面上會出現「8 / 10 題一樣」排在「6 / 8 題一樣」下面，
 * 3 人房實測就會撞到——少數派永遠剛好 1 個人，加權只是在放大雜訊。
 */
test('契合度榜照畫面顯示的比例排序，不是照加權分數', () => {
  // a 跟 c 都答滿 10 題、8 題一樣（80%）；b 漏了 2 題，跟 a 是 6 / 8 一樣（75%）
  const answers = answersFrom({
    a: 'OOOOOOOOOO',
    b: 'OOOOOOXX--',
    c: 'OOOOXXOOOO',
  });
  const ranking = affinityRanking(Object.keys(answers), answers);

  const top = ranking[0];
  assert.deepEqual(top.players, ['a', 'c']);
  assert.equal(top.same, 8);
  assert.equal(top.common, 10);

  // 顯示的比例必須是遞減的，否則玩家看到的順序就是亂的
  for (let i = 1; i < ranking.length; i += 1) {
    const prev = ranking[i - 1];
    const row = ranking[i];
    assert.ok(
      prev.same / prev.common >= row.same / row.common,
      `第 ${i} 列 ${row.same}/${row.common} 排在 ${prev.same}/${prev.common} 後面，比例卻比較高`,
    );
  }
});

test('每個人都答一樣時不會爆掉，分數也不會是 NaN', () => {
  const answers = answersFrom({ a: 'OOO', b: 'OOO', c: 'OOO', d: 'OOO', e: 'OOO', f: 'OOO' });
  const { groups } = buildGroups(Object.keys(answers), answers, 3);

  assert.equal(groups.flatMap((group) => group.members).length, 6);
  const pairs = topPairsByPlayer(Object.keys(answers), answers);
  for (const rows of Object.values(pairs)) {
    for (const row of rows) assert.ok(Number.isFinite(row.percent), 'percent 不能是 NaN');
  }
});

test('完全沒有人作答時回傳空結果，不丟例外', () => {
  const { groups, grouped } = buildGroups([], {}, 4);
  assert.equal(grouped, false);
  assert.deepEqual(groups, []);
});
