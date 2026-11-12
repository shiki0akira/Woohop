import test from 'node:test';
import assert from 'node:assert/strict';

import { cleanEntry, scoreTurn, awards, shuffle } from '../src/game.js';

test('三句都要有字、假的要選，格式不對就不收', () => {
  const items = [
    { topic: '食物', text: '我一次吃三碗飯' },
    { topic: '旅行', text: '我去過十個國家' },
    { topic: '寵物', text: '我養過烏龜' },
  ];
  assert.deepEqual(cleanEntry({ items, fake: 1 }), { items, fake: 1 });
  assert.equal(cleanEntry({ items, fake: 3 }), null);
  assert.equal(cleanEntry({ items, fake: '1.5' }), null);
  assert.equal(cleanEntry({ items: items.slice(0, 2), fake: 0 }), null);
  assert.equal(cleanEntry({ items: [items[0], items[1], { topic: '寵物', text: '   ' }], fake: 0 }), null);
  // 換行、多餘空白收掉，太長截斷
  const long = cleanEntry({ items: [{ topic: 'a', text: ' 我\n會  彈琴 ' }, items[1], { topic: 'x', text: 'y'.repeat(200) }], fake: 0 });
  assert.equal(long.items[0].text, '我 會 彈琴');
  assert.equal(long.items[2].text.length, 60);
});

test('猜對的人算最會猜，猜錯的人算被作者騙到；作者自己投的不算', () => {
  const { correct, fooled } = scoreTurn('A', 2, { B: 2, C: 0, D: 1, A: 2 });
  assert.deepEqual(correct, ['B']);
  assert.deepEqual(fooled.sort(), ['C', 'D']);
});

test('兩個獎各自取最高分，同分都算，0 分沒有獎', () => {
  const a = awards([
    { id: 'A', guess: 3, fool: 0 },
    { id: 'B', guess: 3, fool: 2 },
    { id: 'C', guess: 1, fool: 2 },
  ]);
  assert.deepEqual(a.guess, ['A', 'B']);
  assert.deepEqual(a.fool, ['B', 'C']);
  assert.deepEqual(awards([{ id: 'A', guess: 0, fool: 0 }]), { guess: [], fool: [] });
});

test('洗牌不會弄丟或重複', () => {
  const list = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(shuffle(list).sort(), list);
});
