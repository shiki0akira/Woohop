/*
 * 題庫的不變式。
 *
 * `checkQuestions()`（build 時跑）顧的是「有沒有漏翻、id 有沒有重複、分類存不存在」。
 * 這裡補的是它抓不到、而且**在畫面上完全看不出來**的那幾種壞法：
 *
 *   - 兩題的 id 不同但文字一模一樣 → 現場會連續出到兩張看起來一樣的牌，
 *     玩的人只會覺得「這個 App 壞了」，不會知道是題庫貼錯
 *   - 分類的題數跟 QUESTIONS.md 寫的對不上 → 文件與程式各說各話，
 *     主持人照文件挑分類會拿到跟預期不同的牌堆
 *   - ※ 記號的題目變多或變少 → QUESTIONS.md 與 CONCEPT.md 都寫死「共 2 題」，
 *     而那 2 題現在一律在牌堆裡（沒有開關），數量變了文件就開始說謊
 *   - 該在地化的兩題被人「順手改成直譯」→ QUESTIONS.md 最後一節的理由就沒了
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { QUESTIONS, CATEGORIES, CATEGORY_GROUPS, checkQuestions } from '../app/questions.js';
import { LANGS } from '../app/strings.js';

// QUESTIONS.md 的兩張表：問答型 45 題、動作型 45 題（拆成四個分類）
const EXPECTED_COUNTS = {
  talk: 45,
  voice: 13,
  quickfire: 10,
  gesture: 12,
  interact: 10,
};

test('checkQuestions 通過（跟 build 跑的是同一份檢查）', () => {
  checkQuestions(LANGS);
});

test('每個分類的題數跟 QUESTIONS.md 一致', () => {
  const counts = {};
  for (const question of QUESTIONS) {
    counts[question.category] = (counts[question.category] || 0) + 1;
  }
  assert.deepEqual(counts, EXPECTED_COUNTS);
});

test('問答型與動作型各 45 題，合計 90 題', () => {
  const sizeOf = (groupId) =>
    CATEGORY_GROUPS.find((group) => group.id === groupId).categories.reduce(
      (total, category) => total + EXPECTED_COUNTS[category],
      0,
    );

  assert.equal(sizeOf('ask'), 45);
  assert.equal(sizeOf('dare'), 45);
  assert.equal(QUESTIONS.length, 90);
});

test('※ 記號剛好 2 題，而且都在動作型', () => {
  const marked = QUESTIONS.filter((question) => question.familiar);
  assert.equal(marked.length, 2, 'QUESTIONS.md 與 CONCEPT.md 都寫死「共 2 題」');

  const dare = CATEGORY_GROUPS.find((group) => group.id === 'dare').categories;
  for (const question of marked) {
    assert.ok(dare.includes(question.category), `${question.id} 應該在動作型裡`);
  }
});

test('同一種語言裡沒有兩題文字一模一樣', () => {
  for (const lang of LANGS) {
    const seen = new Map();
    for (const question of QUESTIONS) {
      const text = question.text[lang].trim();
      const first = seen.get(text);
      assert.equal(first, undefined, `${lang}：${first} 與 ${question.id} 的文字相同（${text}）`);
      seen.set(text, question.id);
    }
  }
});

/*
 * 這兩題在 QUESTIONS.md 裡被特別點名不能直譯：
 * 「台語」是台灣的在地語言、「不能有重複的字」是漢字才成立的限制。
 * 之後有人拿翻譯 API 重跑一遍題庫的話，這兩條會先擋下來。
 */
test('該在地化的兩題沒有被改成直譯', () => {
  const dialect = QUESTIONS.find((question) => question.id === 'voice.dialectFruits');
  assert.ok(dialect, '找不到 voice.dialectFruits');
  for (const lang of ['en', 'de', 'fr', 'es']) {
    assert.doesNotMatch(
      dialect.text[lang],
      /taiwanese|taiwanisch|taïwanais|taiwanés/i,
      `${lang} 不該出現「台語」的直譯，要換成「你會的另一種語言或方言」`,
    );
  }

  const cities = QUESTIONS.find((question) => question.id === 'quickfire.threeCities');
  assert.ok(cities, '找不到 quickfire.threeCities');
  for (const lang of ['en', 'de', 'fr', 'es']) {
    assert.match(
      cities.text[lang],
      /letter|buchstaben|lettre|letra/i,
      `${lang} 要用「開頭字母不能重複」，不是漢字才成立的「不能有重複的字」`,
    );
  }
});

test('CATEGORIES 與 CATEGORY_GROUPS 蓋到的分類完全相同', () => {
  const grouped = CATEGORY_GROUPS.flatMap((group) => group.categories);
  assert.deepEqual([...grouped].sort(), [...CATEGORIES].sort());
  assert.equal(grouped.length, new Set(grouped).size, '同一個分類被放進兩個分組');
});
