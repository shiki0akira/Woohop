/*
 * 偷渡畫家的規則邏輯（不碰 Durable Object，方便單獨測試，見 test/game.test.js）：
 * 發祕密題目、簡單版的 4 選 1 選項、進階版的打字比對、計分。
 *
 * 祕密題目來自全站共用的題庫（apps/homepage/src/word-bank.mjs，用途 draw），
 * 只取「一樣東西」的類型——要偷偷畫進同一張圖，動作、情境、成語塞不進去。
 */

import { wordsFor } from '../../homepage/src/word-bank.mjs';

export const SECRET_CATS = ['animals', 'objects', 'fruit', 'dessert', 'drink', 'cartoon'];
export const OPTION_COUNT = 4;

// 這個語言能當祕密題目的類型：[[代號, 類型名稱, [題目...]], ...]
export function secretPool(lang) {
  return wordsFor(lang, 'draw').filter(([id]) => SECRET_CATS.includes(id));
}

function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/*
 * 發一張祕密題目：{ cat, kind, word, options }。
 * exclude 是這張圖已經發出去的題目（同一張圖不重複）。
 * options 是簡單版的 4 選 1：答案＋同類型的 3 個（同類型才不會一眼就猜到），已經打亂。
 */
export function dealSecret(lang, exclude = [], rand = Math.random) {
  const pool = secretPool(lang);
  const all = [];
  for (const [cat, kind, words] of pool) for (const word of words) if (!exclude.includes(word)) all.push([cat, kind, word]);
  const [cat, kind, word] = all[Math.floor(rand() * all.length)];
  const same = pool.find(([id]) => id === cat)[2].filter((w) => w !== word);
  const options = shuffle([word, ...shuffle(same, rand).slice(0, OPTION_COUNT - 1)], rand);
  return { cat, kind, word, options };
}

// 進階版比對：忽略大小寫、全形半形、空白和標點（「珍珠 奶茶」「珍珠奶茶！」都算對）
export function normalize(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

export function isCorrect(answer, word) {
  const a = normalize(answer);
  return a.length > 0 && a === normalize(word);
}

// 進階版的字數提示：一個字一格，空白照原樣留著（英文詞組才看得出幾個字）
export function maskOf(word) {
  return Array.from(word).map((ch) => (/\s/.test(ch) ? ' ' : /[\p{L}\p{N}]/u.test(ch) ? '_' : ch)).join('');
}

/*
 * 一位畫家的一輪計分：猜中的人 +1，畫的人每有一個人猜中 +1（老闆 11/04 定的：鼓勵把祕密題目畫得看得懂）。
 * answers 是 { 猜的人: 答案 }，回傳 { gained: { 玩家: 分數 }, correct: [猜中的人] }
 */
export function scoreTurn(targetId, word, answers) {
  const correct = Object.keys(answers).filter((id) => id !== targetId && isCorrect(answers[id], word));
  const gained = {};
  for (const id of correct) gained[id] = 1;
  if (correct.length) gained[targetId] = correct.length;
  return { gained, correct };
}
