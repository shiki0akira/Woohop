import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, buildMime } from '../src/feedback.js';

const good = { type: 'idea', game: 'bomb', message: '炸彈頁按了沒反應', email: 'a@b.co', lang: 'zh-TW', from: '/bomb/zh-TW/', elapsed: 9000 };

test('正常內容會通過', () => {
  const r = validate(good);
  assert.equal(r.ok, true);
  assert.equal(r.data.type, 'idea');
  assert.equal(r.data.from, '/bomb/zh-TW/');
});

test('蜜罐有填、或填太快：假裝成功但不寄', () => {
  assert.equal(validate({ ...good, website: 'http://spam' }).skip, 'honeypot');
  assert.equal(validate({ ...good, elapsed: 500 }).skip, 'too-fast');
});

test('類型、內容、信箱不對會被擋', () => {
  assert.equal(validate({ ...good, type: 'x' }).error, 'type');
  assert.equal(validate({ ...good, message: '嗨' }).error, 'message');
  assert.equal(validate({ ...good, message: 'a'.repeat(3001) }).error, 'message');
  assert.equal(validate({ ...good, email: 'not-mail' }).error, 'email');
  assert.equal(validate({ ...good, email: '' }).ok, true);
});

test('不認得的遊戲與外站來源會被清掉', () => {
  const r = validate({ ...good, game: '<script>', from: 'https://evil.example/' });
  assert.equal(r.data.game, '');
  assert.equal(r.data.from, '');
});

test('信件：有 Reply-To、中文用 base64、沒有裸換行', () => {
  const raw = buildMime(validate(good).data, { from: 'feedback@vibeweb100.com', to: 'woohop.app@gmail.com', ua: 'UA', id: 'x' });
  assert.match(raw, /^Reply-To: <a@b\.co>$/m);
  assert.match(raw, /^Subject: =\?UTF-8\?B\?/m);
  assert.match(raw, /^Message-ID: <x@vibeweb100\.com>$/m);
  assert.doesNotMatch(raw, /[^\r]\n/);
  const body = raw.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  assert.match(Buffer.from(body, 'base64').toString('utf8'), /炸彈頁按了沒反應/);
});

test('沒留信箱就沒有 Reply-To', () => {
  const raw = buildMime(validate({ ...good, email: '' }).data, { from: 'f@vibeweb100.com', to: 't@x.com' });
  assert.doesNotMatch(raw, /Reply-To/);
});

test('舊頁面送來的 bug 當成修改建議', () => {
  assert.equal(validate({ ...good, type: 'bug' }).data.type, 'idea');
});
