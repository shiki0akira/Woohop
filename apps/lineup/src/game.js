/*
 * 數字默契排排站的規則，不碰 Durable Object（方便單元測試）。
 *   - 每張牌一個不重複的 1～NUM_MAX 祕密數字（老闆 11/19：一人一支手機、1～100 不會重複）
 *   - 每人 1～3 張（老闆 11/20：預設一張，人少可以玩進階一人 2～3 張）
 *   - 大家在手機上排好順序、一張一張翻：比前面翻開的任何一張小就是排錯（老闆 11/20：10、31、13、19 的 19 也算錯）
 */

export const NUM_MAX = 100;
export const MAX_PER_PLAYER = 3;
export const MAX_CARDS = 30; // 一整排最多幾張：每人張數 × 人數（一人 3 張最多 10 個人）

// 從 1～NUM_MAX 裡挑一個還沒被用掉的（中途加入的人也用這個補發）
export function pickNumber(used, random = Math.random) {
  const free = [];
  for (let n = 1; n <= NUM_MAX; n += 1) if (!used.has(n)) free.push(n);
  if (!free.length) return null;
  return free[Math.floor(random() * free.length)];
}

// 發給一個人 perPlayer 張（不跟 used 重複，發出去的會加進 used）。牌的 id＝「主人 id.第幾張」
export function dealTo(cards, owner, perPlayer, used, random = Math.random) {
  for (let i = 0; i < perPlayer; i += 1) {
    const n = pickNumber(used, random);
    if (n == null) return;
    used.add(n);
    cards[owner + '.' + i] = { owner, n };
  }
}

// 一輪重新發：每個人 perPlayer 張、全部不重複
export function dealCards(ids, perPlayer, random = Math.random) {
  const used = new Set();
  const cards = {};
  for (const id of ids) dealTo(cards, id, perPlayer, used, random);
  return cards;
}

export function usedNumbers(cards) {
  return new Set(Object.values(cards).map((c) => c.n));
}

// 翻開的這幾張對不對：比前面翻開的每一張都大才對（比前面最大的那張小就是排錯）
export function judge(numbers) {
  let max = -Infinity;
  return numbers.map((n) => {
    const ok = n > max;
    if (ok) max = n;
    return ok;
  });
}

export function cleanPerPlayer(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_PER_PLAYER ? n : 1;
}

export const MAX_PLAYERS = 15;

// 人數上限：開房時設（老闆 11/20：開房設人數，每人幾張進房間再設），2～15，預設 10
export function cleanMaxPlayers(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 2 && n <= MAX_PLAYERS ? n : 10;
}

// 現在這些人最多可以每人幾張（一整排最多 MAX_CARDS 張：3 張最多 10 人、2 張最多 15 人）
export function maxPerPlayerFor(players) {
  return Math.max(1, Math.min(MAX_PER_PLAYER, Math.floor(MAX_CARDS / Math.max(1, players))));
}

// 暱稱：去掉換行和多餘空白、截斷（跟兩真一假一樣）
export function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

// 主題投票（老闆 11/20：每一輪先抽三個主題，大家投一個）：票最多的贏，平手隨機；沒人投就隨機
export function tallyVotes(votes, optionCount, random = Math.random) {
  const counts = new Array(optionCount).fill(0);
  for (const pick of Object.values(votes)) if (pick >= 0 && pick < optionCount) counts[pick] += 1;
  const best = Math.max(...counts);
  const top = counts.map((c, i) => (c === best ? i : -1)).filter((i) => i >= 0);
  return top[Math.floor(random() * top.length)];
}

// 把一張牌挪到第 to 個位置（主持人拖曳換順序）
export function moveTo(line, id, to) {
  const at = line.indexOf(id);
  if (at < 0) return false;
  const target = Math.max(0, Math.min(line.length - 1, to));
  if (target === at) return false;
  line.splice(at, 1);
  line.splice(target, 0, id);
  return true;
}
