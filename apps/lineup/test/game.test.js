import test from 'node:test';
import assert from 'node:assert/strict';

import { NUM_MAX, pickNumber, dealNumbers, lineupOrder, cleanText } from '../src/game.js';

test('一輪發的數字不重複、都在 1～100', () => {
  const ids = Array.from({ length: 15 }, (_, i) => 'p' + i);
  for (let round = 0; round < 200; round += 1) {
    const nums = dealNumbers(ids);
    const values = Object.values(nums);
    assert.equal(values.length, 15);
    assert.equal(new Set(values).size, 15);
    for (const n of values) assert.ok(Number.isInteger(n) && n >= 1 && n <= NUM_MAX);
  }
});

test('中途補發不會跟已經用掉的重複；用光就回 null', () => {
  const used = new Set([1, 2, 3]);
  for (let i = 0; i < 100; i += 1) assert.ok(!used.has(pickNumber(used)));
  const all = new Set(Array.from({ length: NUM_MAX }, (_, i) => i + 1));
  assert.equal(pickNumber(all), null);
  // 只剩一個空位就一定是它
  all.delete(42);
  assert.equal(pickNumber(all), 42);
});

test('公布順序照數字從小到大', () => {
  assert.deepEqual(lineupOrder({ a: 50, b: 3, c: 99, d: 12 }), ['b', 'd', 'a', 'c']);
  assert.deepEqual(lineupOrder({}), []);
});

test('暱稱收掉換行與多餘空白、截斷', () => {
  assert.equal(cleanText('  小\n明  ', 16), '小 明');
  assert.equal(cleanText('x'.repeat(30), 16).length, 16);
  assert.equal(cleanText(123, 16), '');
});
