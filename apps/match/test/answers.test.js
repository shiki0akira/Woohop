/*
 * 「大家都答完就直接公布」的判斷（src/room.js 的 everyoneAnswered）。
 * 算錯的症狀很隱密：多算一個人就永遠等不到、少算一個人就把還在想的人提早鎖掉。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { everyoneAnswered } from '../src/room.js';

const room = (extra = {}) => ({
  hostId: 'host',
  hostPlays: false,
  players: { host: {}, a: {}, b: {}, c: {} },
  answers: {},
  ...extra,
});

test('在線上的玩家都答了才算答完', () => {
  const r = room({ answers: { a: { q1: 'O' }, b: { q1: 'X' } } });
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b', 'c']), 'q1'), false);
  r.answers.c = { q1: 'O' };
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b', 'c']), 'q1'), true);
});

test('主持人只控場時不等他', () => {
  const r = room({ answers: { a: { q1: 'O' }, b: { q1: 'O' }, c: { q1: 'X' } } });
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b', 'c']), 'q1'), true);
});

test('主持人也作答時要等他', () => {
  const r = room({ hostPlays: true, answers: { a: { q1: 'O' }, b: { q1: 'O' }, c: { q1: 'X' } } });
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b', 'c']), 'q1'), false);
  r.answers.host = { q1: 'O' };
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b', 'c']), 'q1'), true);
});

test('斷線的人不擋（交給倒數）', () => {
  const r = room({ answers: { a: { q1: 'O' }, b: { q1: 'X' } } });
  assert.equal(everyoneAnswered(r, new Set(['host', 'a', 'b']), 'q1'), true);
});

test('上一題的答案不算這一題', () => {
  const r = room({ answers: { a: { q0: 'O' }, b: { q1: 'X' }, c: { q1: 'X' } } });
  assert.equal(everyoneAnswered(r, new Set(['a', 'b', 'c']), 'q1'), false);
});

test('一個要作答的人都不在線上時不提早公布', () => {
  assert.equal(everyoneAnswered(room(), new Set(['host']), 'q1'), false);
});
