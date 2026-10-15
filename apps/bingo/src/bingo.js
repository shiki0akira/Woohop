/*
 * 賓果卡的純邏輯：連線判定、卡片洗牌、參數上下限。
 *
 * 這裡不碰 Durable Object、不碰網路，全部是可以單獨測的函式（test/bingo.test.js）。
 * 分出來的理由跟 web100_03 的 grouping.js 一樣：這段算錯不會拋錯，
 * 只會讓某個人的連線莫名其妙少一條，很難從畫面上看出來。
 *
 * 格子用一維索引 0..size²-1，列優先（index = row * size + col）。
 */

export const SIZES = [3, 4, 5];
// 4×4 當預設：3×3 太快結束、5×5 在手機上一格只剩 56px 寬，4×4 兩邊都不極端
export const DEFAULT_SIZE = 4;

/*
 * 各尺寸的獲勝連線數上限。**不是三種尺寸都開放到 5**。
 *
 * 依據是 minCellsForLines() 算出來的門檻（CONCEPT.md 第三節有完整的表）：
 * 3×3 連 4 條和連 5 條都要打勾 7 格，難度完全一樣，開放到 4 以上沒有意義；
 * 4×4 連 5 條要 12/16 格（75%），已經接近全滿貫，所以收在 4。
 */
export const MAX_TARGET_LINES = { 3: 3, 4: 4, 5: 5 };
// 預設值刻意依尺寸不同，讓三種尺寸的「最少要打勾幾格」落在差不多的比例：
// 3×3 連 2 條 = 5/9（56%）、4×4 連 3 條 = 9/16（56%）、5×5 連 3 條 = 12/25（48%）
export const DEFAULT_TARGET_LINES = { 3: 2, 4: 3, 5: 3 };

// 3×3 與 5×5 的正中央同時卡在 4 條線上（橫、直、兩條對角線），是單點故障，
// 所以那一格固定放保底題。4×4 是偶數格、兩條對角線不交會，沒有這個問題。
export function hasAnchor(size) {
  return size % 2 === 1;
}

export function cellCount(size) {
  return size * size;
}

export function centerIndex(size) {
  if (!hasAnchor(size)) return -1;
  const mid = (size - 1) / 2;
  return mid * size + mid;
}

const lineCache = new Map();

/*
 * 這個尺寸的所有連線，每條是一組格子索引。
 * 順序固定成「橫、直、主對角線、反對角線」，前端要標示是哪一條時才有穩定的編號。
 */
export function linesFor(size) {
  const cached = lineCache.get(size);
  if (cached) return cached;

  const lines = [];

  for (let row = 0; row < size; row += 1) {
    const cells = [];
    for (let col = 0; col < size; col += 1) cells.push(row * size + col);
    lines.push(cells);
  }

  for (let col = 0; col < size; col += 1) {
    const cells = [];
    for (let row = 0; row < size; row += 1) cells.push(row * size + col);
    lines.push(cells);
  }

  const main = [];
  const anti = [];
  for (let i = 0; i < size; i += 1) {
    main.push(i * size + i);
    anti.push(i * size + (size - 1 - i));
  }
  lines.push(main, anti);

  lineCache.set(size, lines);
  return lines;
}

// 這個尺寸總共有幾條線：3×3 → 8、4×4 → 10、5×5 → 12
export function totalLines(size) {
  return linesFor(size).length;
}

/*
 * 已打勾的格子能連成幾條線。
 * marked 可以是 Set、陣列，或是「索引 → 真值」的物件（room 存的就是物件）。
 */
export function countLines(size, marked) {
  const set = toIndexSet(marked);
  let count = 0;
  for (const line of linesFor(size)) {
    if (line.every((index) => set.has(index))) count += 1;
  }
  return count;
}

// 哪幾條線已經連成（回傳 linesFor 的索引）。前端要畫連線動畫時用得到
export function completedLines(size, marked) {
  const set = toIndexSet(marked);
  const done = [];
  linesFor(size).forEach((line, index) => {
    if (line.every((cell) => set.has(cell))) done.push(index);
  });
  return done;
}

function toIndexSet(marked) {
  if (marked instanceof Set) return marked;
  if (Array.isArray(marked)) return new Set(marked.map(Number));
  return new Set(
    Object.entries(marked ?? {})
      .filter(([, value]) => Boolean(value))
      .map(([key]) => Number(key)),
  );
}

/*
 * 連成 N 條線最少要打勾幾格。只用在測試與文件驗算，執行期不會呼叫。
 *
 * 不需要窮舉所有打勾組合（5×5 有 3355 萬種）：要連成 N 條線，打勾的格子**必定包含
 * 那 N 條線的聯集**，而聯集本身就已經連成那 N 條線了。所以最小值 = 所有 N 條線組合裡
 * 最小的聯集大小，只要枚舉線的組合（5×5 連 5 條也才 C(12,5) = 792 種）。
 *
 * test/bingo.test.js 會拿 3×3 / 4×4 的窮舉結果對照，確認兩種算法一致。
 */
export function minCellsForLines(size, targetLines) {
  const lines = linesFor(size);
  if (targetLines < 1 || targetLines > lines.length) return null;

  let best = Infinity;
  const chosen = [];

  const walk = (start) => {
    if (chosen.length === targetLines) {
      const union = new Set();
      for (const line of chosen) for (const cell of line) union.add(cell);
      if (union.size < best) best = union.size;
      return;
    }
    // 剩下的線不夠湊滿就不用往下走了
    for (let i = start; i <= lines.length - (targetLines - chosen.length); i += 1) {
      chosen.push(lines[i]);
      walk(i + 1);
      chosen.pop();
    }
  };
  walk(0);

  return best;
}

/*
 * 產生一個人的賓果卡：回傳長度 size² 的題目 id 陣列。
 *
 * seed 用「房間代碼 + 玩家 id」：同一個人在同一間房永遠拿到同一張卡，
 * 換一間房才會不一樣。卡片本身仍然會存進 storage（見 room.js），
 * 這裡的決定性是為了可測試、以及萬一要重建時能算得回來。
 *
 * anchorId 有值時固定放正中央、不參與洗牌（3×3 與 5×5）；
 * 4×4 傳 null，size² 題全部洗牌。
 */
export function buildCard(size, questionIds, anchorId, seed) {
  const total = cellCount(size);
  const center = hasAnchor(size) ? centerIndex(size) : -1;
  const need = anchorId ? total - 1 : total;

  if (questionIds.length !== need) {
    throw new Error(`需要 ${need} 道洗牌題，收到 ${questionIds.length} 道`);
  }

  const shuffled = shuffle(questionIds, seed);
  const card = new Array(total);

  let cursor = 0;
  for (let i = 0; i < total; i += 1) {
    if (i === center && anchorId) card[i] = anchorId;
    else card[i] = shuffled[cursor++];
  }
  return card;
}

// Fisher-Yates，亂數來自 seed。不改動傳進來的陣列
export function shuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(hashString(String(seed)));
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// FNV-1a：夠散、夠短，不需要加密強度（洗的是誰都看得到的題庫）
function hashString(value) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
