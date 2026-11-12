/*
 * 兩真一假的規則邏輯（不碰 Durable Object，方便單獨測試，見 test/game.test.js）：
 * 收三句（cleanEntry）、猜的順序（shuffle）、一組的計分（scoreTurn）、最後的兩個獎（awards）。
 *
 * 主題庫在各語言的 locale（客戶端自己抽），伺服器只收「主題名稱＋寫的那句」。
 */

export const ITEM_COUNT = 3;
export const MAX_TOPIC_LENGTH = 20;
export const MAX_TEXT_LENGTH = 60;

export function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  // 先把換行這類空白收成一格，再拿掉其他控制字元（順序反過來換行會直接消失、兩個字黏在一起）
  return value
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);
}

/*
 * 寫好的三句：{ items: [{ topic, text } ×3], fake: 0～2 }。
 * 格式不對（少一句、空白、假的沒選）回 null，伺服器就不收。
 */
export function cleanEntry(value) {
  if (!value || !Array.isArray(value.items) || value.items.length !== ITEM_COUNT) return null;
  const items = value.items.map((it) => ({
    topic: cleanText(it && it.topic, MAX_TOPIC_LENGTH),
    text: cleanText(it && it.text, MAX_TEXT_LENGTH),
  }));
  if (items.some((it) => !it.text)) return null;
  const fake = Number(value.fake);
  if (!Number.isInteger(fake) || fake < 0 || fake >= ITEM_COUNT) return null;
  return { items, fake };
}

export function shuffle(list, rand = Math.random) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/*
 * 一組的計分（老闆 11/11 定的）：猜對的人「最會猜」+1，寫的人每騙到一個人「最會騙」+1。
 * votes 是 { 投的人: 第幾句 }，回傳 { correct: [猜對的人], fooled: [被騙的人] }
 */
export function scoreTurn(authorId, fake, votes) {
  const correct = [];
  const fooled = [];
  for (const [id, pick] of Object.entries(votes)) {
    if (id === authorId) continue;
    if (pick === fake) correct.push(id);
    else fooled.push(id);
  }
  return { correct, fooled };
}

/*
 * 最後的兩個獎：最會猜（猜對最多）、最會騙（騙到最多人）。同分的都算，0 分沒有獎。
 * players 是 [{ id, guess, fool }]，回傳 { guess: [id], fool: [id] }
 */
export function awards(players) {
  const top = (key) => {
    const best = Math.max(0, ...players.map((p) => p[key]));
    return best > 0 ? players.filter((p) => p[key] === best).map((p) => p.id) : [];
  };
  return { guess: top('guess'), fool: top('fool') };
}
