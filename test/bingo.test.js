/*
 * 賓果卡邏輯的測試。重點不是「程式會不會炸」，而是把 CONCEPT.md 第三節那張表
 * 釘死——那些數字是拿來決定「各尺寸的獲勝連線數上限」的依據，算錯的話
 * 3×3 會開放到一個「連 4 條跟連 5 條一樣難」的無意義設定，而畫面上完全看不出來。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SIZES,
  MAX_TARGET_LINES,
  DEFAULT_TARGET_LINES,
  linesFor,
  totalLines,
  countLines,
  completedLines,
  minCellsForLines,
  buildCard,
  cellCount,
  centerIndex,
  hasAnchor,
  shuffle,
} from '../src/bingo.js';

test('各尺寸的連線數：橫 + 直 + 兩條對角線', () => {
  assert.equal(totalLines(3), 8);
  assert.equal(totalLines(4), 10);
  assert.equal(totalLines(5), 12);
});

test('每條線的長度都等於尺寸，而且格子不重複', () => {
  for (const size of SIZES) {
    for (const line of linesFor(size)) {
      assert.equal(line.length, size);
      assert.equal(new Set(line).size, size);
      for (const cell of line) {
        assert.ok(cell >= 0 && cell < cellCount(size), `格子 ${cell} 超出 ${size}×${size}`);
      }
    }
  }
});

test('中央格只有奇數尺寸才有，而且同時卡在 4 條線上', () => {
  assert.equal(hasAnchor(3), true);
  assert.equal(hasAnchor(5), true);
  assert.equal(hasAnchor(4), false);
  assert.equal(centerIndex(4), -1);

  // 這是保底題只做 3×3 / 5×5 的理由：4×4 沒有任何一格卡在 4 條線上
  for (const size of [3, 5]) {
    const center = centerIndex(size);
    const through = linesFor(size).filter((line) => line.includes(center));
    assert.equal(through.length, 4, `${size}×${size} 的中央格應該卡在 4 條線上`);
  }

  const worst4 = Math.max(
    ...Array.from({ length: cellCount(4) }, (unused, cell) =>
      linesFor(4).filter((line) => line.includes(cell)).length),
  );
  assert.equal(worst4, 3, '4×4 風險最高的格子只到 3 條線');
});

test('CONCEPT.md 的門檻表：連 N 條線最少要打勾幾格', () => {
  // [連線數, 3×3, 4×4, 5×5]
  const table = [
    [1, 3, 4, 5],
    [2, 5, 7, 9],
    [3, 6, 9, 12],
    [4, 7, 11, 14],
    [5, 7, 12, 16],
  ];

  for (const [lines, s3, s4, s5] of table) {
    assert.equal(minCellsForLines(3, lines), s3, `3×3 連 ${lines} 條`);
    assert.equal(minCellsForLines(4, lines), s4, `4×4 連 ${lines} 條`);
    assert.equal(minCellsForLines(5, lines), s5, `5×5 連 ${lines} 條`);
  }
});

test('門檻表用窮舉再算一次，兩種算法要一致', () => {
  // minCellsForLines 是枚舉「線的組合」求最小聯集；這裡改成窮舉「所有打勾組合」，
  // 兩條完全獨立的路徑得到同一組數字，才敢拿去當設定上限的依據。
  // 只跑 3×3（512 種）與 4×4（65536 種），5×5 窮舉要 3355 萬種太慢。
  for (const size of [3, 4]) {
    const total = cellCount(size);
    const best = new Map();

    for (let mask = 0; mask < 1 << total; mask += 1) {
      const set = new Set();
      let bits = 0;
      for (let i = 0; i < total; i += 1) {
        if (mask & (1 << i)) {
          set.add(i);
          bits += 1;
        }
      }
      const lines = countLines(size, set);
      for (let n = 1; n <= lines; n += 1) {
        if (!best.has(n) || bits < best.get(n)) best.set(n, bits);
      }
    }

    for (let n = 1; n <= 5; n += 1) {
      assert.equal(best.get(n), minCellsForLines(size, n), `${size}×${size} 連 ${n} 條`);
    }
  }
});

test('3×3 連 4 條與連 5 條門檻相同，所以上限收在 3', () => {
  assert.equal(minCellsForLines(3, 4), minCellsForLines(3, 5));
  assert.equal(MAX_TARGET_LINES[3], 3);

  // 上限本身也不能超過該尺寸的總連線數
  for (const size of SIZES) {
    assert.ok(MAX_TARGET_LINES[size] <= totalLines(size));
    assert.ok(DEFAULT_TARGET_LINES[size] <= MAX_TARGET_LINES[size]);
    assert.ok(DEFAULT_TARGET_LINES[size] >= 1);
  }
});

test('countLines 認得橫、直、兩條對角線', () => {
  assert.equal(countLines(5, [0, 1, 2, 3, 4]), 1); // 第一列
  assert.equal(countLines(5, [0, 5, 10, 15, 20]), 1); // 第一行
  assert.equal(countLines(5, [0, 6, 12, 18, 24]), 1); // 主對角線
  assert.equal(countLines(5, [4, 8, 12, 16, 20]), 1); // 反對角線
  assert.equal(countLines(5, [0, 1, 2, 3]), 0); // 差一格不算
  assert.equal(countLines(3, []), 0);

  // 整張打滿 = 連滿全部的線（CONCEPT.md 的「全滿貫」定義）
  for (const size of SIZES) {
    const all = Array.from({ length: cellCount(size) }, (unused, i) => i);
    assert.equal(countLines(size, all), totalLines(size));
  }
});

test('countLines 收 Set / 陣列 / 物件三種形式（room 存的是物件）', () => {
  const cells = [0, 1, 2, 3, 4];
  const asObject = { 0: { by: 'a' }, 1: { by: 'b' }, 2: { by: 'c' }, 3: { by: 'd' }, 4: { by: 'e' } };
  assert.equal(countLines(5, new Set(cells)), 1);
  assert.equal(countLines(5, cells), 1);
  assert.equal(countLines(5, asObject), 1);
  // 值是 falsy 的不算打勾
  assert.equal(countLines(5, { ...asObject, 4: null }), 0);
});

test('completedLines 回報的是哪幾條', () => {
  const done = completedLines(3, [0, 1, 2]);
  assert.deepEqual(done, [0]); // 第 0 條 = 第一列

  // 兩條對角線交會在中央，5 格連 2 條
  assert.equal(completedLines(3, [0, 4, 8, 2, 6]).length, 2);
});

test('buildCard 把保底題固定放中央、其餘洗牌', () => {
  const shuffled = Array.from({ length: 24 }, (unused, i) => `q${i}`);
  const card = buildCard(5, shuffled, 'anchor', 'ROOM:player-1');

  assert.equal(card.length, 25);
  assert.equal(card[centerIndex(5)], 'anchor');
  assert.equal(new Set(card).size, 25, '同一張卡不能有重複題目');
  for (const id of shuffled) assert.ok(card.includes(id), `${id} 沒有出現在卡片上`);
});

test('buildCard 在 4×4 沒有保底題，全部 16 題洗牌', () => {
  const ids = Array.from({ length: 16 }, (unused, i) => `q${i}`);
  const card = buildCard(4, ids, null, 'ROOM:player-1');

  assert.equal(card.length, 16);
  assert.equal(new Set(card).size, 16);
});

test('題數對不上直接丟錯，不會產出半張卡', () => {
  assert.throws(() => buildCard(5, ['a', 'b'], 'anchor', 'seed'), /需要 24 道/);
  assert.throws(() => buildCard(4, new Array(15).fill('x'), null, 'seed'), /需要 16 道/);
});

test('同一個 seed 一定得到同一張卡，不同玩家拿到不同排列', () => {
  const ids = Array.from({ length: 24 }, (unused, i) => `q${i}`);

  // 重整頁面、斷線重連都會重算一次，排列必須一模一樣，
  // 否則已打勾的格子位置會整個錯亂
  assert.deepEqual(
    buildCard(5, ids, 'anchor', 'ABCD:player-1'),
    buildCard(5, ids, 'anchor', 'ABCD:player-1'),
  );

  const a = buildCard(5, ids, 'anchor', 'ABCD:player-1');
  const b = buildCard(5, ids, 'anchor', 'ABCD:player-2');
  assert.notDeepEqual(a, b, '不同玩家應該拿到不同排列');

  // 同一個人在不同房間也該重洗
  assert.notDeepEqual(
    buildCard(5, ids, 'anchor', 'ABCD:player-1'),
    buildCard(5, ids, 'anchor', 'WXYZ:player-1'),
  );
});

test('shuffle 不動到傳進來的陣列', () => {
  const original = ['a', 'b', 'c', 'd', 'e'];
  const copy = original.slice();
  shuffle(original, 'seed');
  assert.deepEqual(original, copy);
});

test('洗牌沒有明顯偏向：每個題目都會出現在各種位置', () => {
  // 不是嚴謹的隨機性檢定，只是擋掉「seed 沒作用」「永遠洗出同一個排列」這種壞法
  const ids = Array.from({ length: 9 }, (unused, i) => `q${i}`);
  const seen = new Set();
  for (let i = 0; i < 200; i += 1) seen.add(buildCard(3, ids, null, `seed-${i}`).join(','));
  assert.ok(seen.size > 150, `200 個 seed 只洗出 ${seen.size} 種排列`);
});
