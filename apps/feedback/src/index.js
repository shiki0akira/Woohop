// Woohop 意見表單的後端：POST /api/feedback → 檢查 → 寄到 woohop.app@gmail.com
import { EmailMessage } from 'cloudflare:email';
import { validate, buildMime } from './feedback.js';

const FROM = 'feedback@vibeweb100.com';
const TO = 'woohop.app@gmail.com';
// 只收本站送來的（vercel.json 代理過來時 Origin 是正式網域；本機預覽是 localhost）
const ORIGINS = new Set(['https://www.vibeweb100.com', 'https://vibeweb100.com']);
const isAllowedOrigin = (o) => ORIGINS.has(o) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(o || '');

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/feedback') return json({ ok: false, error: 'not-found' }, 404);
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    if (!isAllowedOrigin(request.headers.get('origin'))) return json({ ok: false, error: 'origin' }, 403);

    // 經過 Vercel 代理時 cf-connecting-ip 是 Vercel 的位址，真正的來源在 x-forwarded-for 第一個
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('cf-connecting-ip') || 'unknown';
    const { success } = await env.LIMIT.limit({ key: ip });
    if (!success) return json({ ok: false, error: 'rate' }, 429);

    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid' }, 400); }
    const result = validate(body);
    if (!result.ok) return json(result, 400);
    if (result.skip) { console.log('feedback skipped:', result.skip); return json({ ok: true }); }

    const raw = buildMime(result.data, { from: FROM, to: TO, ua: request.headers.get('user-agent') || '' });
    try {
      await env.MAIL.send(new EmailMessage(FROM, TO, raw));
    } catch (e) {
      console.error('feedback send failed:', e && e.message);
      return json({ ok: false, error: 'server' }, 502);
    }
    return json({ ok: true });
  },
};
