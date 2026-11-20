import test from 'node:test';
import assert from 'node:assert/strict';

import { NUM_MAX, pickNumber, dealCards, dealTo, usedNumbers, judge, cleanPerPlayer, cleanMaxPlayers, maxPerPlayerFor, cleanText } from '../src/game.js';

test('一輪發的牌不重複、都在 1～100、每人張數對', () => {
  const ids = Array.from({ length: 10 }, (_, i) => 'p' + i);
  for (const per of [1, 2, 3]) {
    for (let round = 0; round < 100; round += 1) {
      const cards = dealCards(ids, per);
      const values = Object.values(cards).map((c) => c.n);
      assert.equal(values.length, 10 * per);
      assert.equal(new Set(values).size, 10 * per);
      for (const n of values) assert.ok(Number.isInteger(n) && n >= 1 && n <= NUM_MAX);
      for (const id of ids) assert.equal(Object.values(cards).filter((c) => c.owner === id).length, per);
    }
  }
});

test('中途補發不會跟已經用掉的重複；用光就回 null', () => {
  const used = new Set([1, 2, 3]);
  for (let i = 0; i < 100; i += 1) assert.ok(!used.has(pickNumber(used)));
  const all = new Set(Array.from({ length: NUM_MAX }, (_, i) => i + 1));
  assert.equal(pickNumber(all), null);
  all.delete(42);
  assert.equal(pickNumber(all), 42);

  const cards = dealCards(['a', 'b'], 2);
  dealTo(cards, 'late', 2, usedNumbers(cards));
  assert.equal(Object.keys(cards).length, 6);
  assert.equal(usedNumbers(cards).size, 6);
  assert.deepEqual(Object.keys(cards).filter((k) => k.startsWith('late.')), ['late.0', 'late.1']);
});

test('翻牌對錯：跟任何一張大小順序顛倒就是排錯', () => {
  assert.deepEqual(judge([3, 12, 50, 99]), [true, true, true, true]);
  // 老闆 11/20 的例子：30、58、55、79 的 58 和 55 都算錯
  assert.deepEqual(judge([30, 58, 55, 79]), [true, false, false, true]);
  // 10、31、13、19 的 19 也算錯（比前面的 31 小）
  assert.deepEqual(judge([10, 31, 13, 19]), [true, false, false, false]);
  // 翻到一半：前面那張是不是錯，後面翻開才知道
  assert.deepEqual(judge([30, 58]), [true, true]);
  assert.deepEqual(judge([]), []);
});

test('人數上限 2～15、每人張數 1～3（人多就不能選太多張）', () => {
  assert.equal(cleanPerPlayer(2), 2);
  assert.equal(cleanPerPlayer(4), 1);
  assert.equal(cleanPerPlayer('x'), 1);
  assert.equal(cleanMaxPlayers(8), 8);
  assert.equal(cleanMaxPlayers(1), 10);
  assert.equal(cleanMaxPlayers(20), 10);
  assert.equal(maxPerPlayerFor(4), 3);
  assert.equal(maxPerPlayerFor(10), 3);
  assert.equal(maxPerPlayerFor(11), 2);
  assert.equal(maxPerPlayerFor(15), 2);
});

test('暱稱收掉換行與多餘空白、截斷', () => {
  assert.equal(cleanText('  小\n明  ', 16), '小 明');
  assert.equal(cleanText('x'.repeat(30), 16).length, 16);
  assert.equal(cleanText(123, 16), '');
});

test('主題投票：票最多的贏，平手只會在最高票裡挑', async () => {
  const { tallyVotes } = await import('../src/game.js');
  assert.equal(tallyVotes({ a: 1, b: 1, c: 0 }, 3), 1);
  for (let i = 0; i < 50; i += 1) assert.ok([0, 2].includes(tallyVotes({ a: 0, b: 2 }, 3)));
  for (let i = 0; i < 50; i += 1) assert.ok([0, 1, 2].includes(tallyVotes({}, 3)));
});

test('排進去填最左邊的空格、拿出來不順移', async () => {
  const { placeInto, takeOut } = await import('../src/game.js');
  const line = [];
  placeInto(line, 'a'); placeInto(line, 'b'); placeInto(line, 'c');
  assert.deepEqual(line, ['a', 'b', 'c']);
  assert.ok(takeOut(line, 'b'));
  assert.deepEqual(line, ['a', null, 'c']);
  placeInto(line, 'd');
  assert.deepEqual(line, ['a', 'd', 'c']);
  takeOut(line, 'c');
  assert.deepEqual(line, ['a', 'd']);
});

test('拖曳：牌落在指定的格子，擋路的往最近的空格擠', async () => {
  const { moveTo } = await import('../src/game.js');
  let line = ['a', 'b', 'c', 'd'];
  assert.ok(moveTo(line, 'd', 0)); // 最後一張拖到第一格：原本的位置空出來，前面三張往後擠
  assert.deepEqual(line, ['d', 'a', 'b', 'c']);
  assert.ok(moveTo(line, 'd', 3)); // 再拖回最後一格
  assert.deepEqual(line, ['a', 'b', 'c', 'd']);
  line = ['a', null, 'c', 'd'];
  assert.ok(moveTo(line, 'a', 1)); // 拖到空格：直接放
  assert.deepEqual(line, [null, 'a', 'c', 'd']);
  line = ['a', 'b', null, 'c', 'd'];
  assert.ok(moveTo(line, 'd', 1)); // 拖到 b：b 往右邊最近的空格擠
  assert.deepEqual(line, ['a', 'd', 'b', 'c']);
  line = ['a', 'b'];
  assert.ok(moveTo(line, 'a', 3)); // 拖到後面的空格
  assert.deepEqual(line, [null, 'b', null, 'a']);
  assert.equal(moveTo(line, 'x', 1), false);
  assert.equal(moveTo(line, 'b', 1), false);
});
