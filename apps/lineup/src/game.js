/*
 * 數字默契排排站的規則，不碰 Durable Object（方便單元測試）。
 *   - 每個人一個不重複的 1～NUM_MAX 祕密數字（老闆 11/19：一人一支手機、1～100 不會重複）
 *   - 公布：照數字從小排到大
 */

export const NUM_MAX = 100;

// 從 1～NUM_MAX 裡挑一個還沒被用掉的（中途加入的人也用這個補發）
export function pickNumber(used, random = Math.random) {
  const free = [];
  for (let n = 1; n <= NUM_MAX; n += 1) if (!used.has(n)) free.push(n);
  if (!free.length) return null;
  return free[Math.floor(random() * free.length)];
}

// 一輪重新發：每個人一個、不重複
export function dealNumbers(ids, random = Math.random) {
  const used = new Set();
  const out = {};
  for (const id of ids) {
    const n = pickNumber(used, random);
    if (n == null) break;
    used.add(n);
    out[id] = n;
  }
  return out;
}

// 公布的順序：數字從小到大
export function lineupOrder(numbers) {
  return Object.keys(numbers).sort((a, b) => numbers[a] - numbers[b]);
}

// 暱稱：去掉換行和多餘空白、截斷（跟兩真一假一樣）
export function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}
