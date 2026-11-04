import test from 'node:test';
import assert from 'node:assert/strict';

import { dealSecret, isCorrect, maskOf, scoreTurn, secretPool, OPTION_COUNT } from '../src/game.js';

// 固定的亂數，測試結果才不會每次不一樣
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

test('祕密題目只從「一樣東西」的類型抽，選項是同類型的 4 個、含答案', () => {
  const rand = seeded(7);
  const pool = secretPool('zh-TW');
  for (let i = 0; i < 50; i += 1) {
    const s = dealSecret('zh-TW', [], rand);
    const cat = pool.find(([id]) => id === s.cat);
    assert.ok(cat, s.cat);
    assert.equal(s.kind, cat[1]);
    assert.equal(s.options.length, OPTION_COUNT);
    assert.ok(s.options.includes(s.word));
    assert.equal(new Set(s.options).size, OPTION_COUNT);
    for (const o of s.options) assert.ok(cat[2].includes(o), o);
  }
});

test('同一張圖不會發到重複的題目', () => {
  const rand = seeded(3);
  const dealt = [];
  for (let i = 0; i < 8; i += 1) dealt.push(dealSecret('zh-TW', dealt.slice(), rand).word);
  assert.equal(new Set(dealt).size, 8);
});

test('進階版比對忽略空白、標點、大小寫、全形', () => {
  assert.ok(isCorrect(' 長頸鹿！', '長頸鹿'));
  assert.ok(isCorrect('ＰＩＫＡ', 'pika'));
  assert.ok(!isCorrect('長頸', '長頸鹿'));
  assert.ok(!isCorrect('', '長頸鹿'));
});

test('字數提示一個字一格、空白保留', () => {
  assert.equal(maskOf('長頸鹿'), '___');
  assert.equal(maskOf('ice cream'), '___ _____');
});

test('計分：猜中 +1，畫的人每有一人猜中 +1', () => {
  const r = scoreTurn('a', '長頸鹿', { b: '長頸鹿', c: '斑馬', d: '長頸鹿' });
  assert.deepEqual(r.correct.sort(), ['b', 'd']);
  assert.deepEqual(r.gained, { b: 1, d: 1, a: 2 });
  assert.deepEqual(scoreTurn('a', '長頸鹿', { b: '斑馬' }).gained, {});
  // 畫的人自己的答案不算
  assert.deepEqual(scoreTurn('a', '長頸鹿', { a: '長頸鹿' }).gained, {});
});
