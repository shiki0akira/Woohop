/*
 * Worker 進入點，照偷渡畫家（apps/sneaky-artist/src/worker.js，那邊照搶答）。這個 Worker 只負責 /truths/*：
 *   /truths/api/rooms          POST  建立房間
 *   /truths/api/rooms/:code    GET   查房間是否存在
 *   /truths/api/rooms/:code/ws GET   升級成 WebSocket，轉給對應的 Durable Object
 *   /truths/ 或 /truths 依語言轉址到 /truths/{lang}/
 */

import { TruthsRoom } from './room.js';

export { TruthsRoom };

const BASE = '/truths';
// 跟 app/strings.js 的 LANGS 與首頁的 SUPPORTED_LANGS 一致，三邊要一起改
const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
const DEFAULT_LANG = 'zh-TW';

// 跟搶答一樣：去掉 0/O/1/I/L（會唸、會手打）和 E（8E98 會被 GA4 當成科學記號）
const CODE_ALPHABET = 'ABCDFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;
const MAX_CREATE_ATTEMPTS = 5;

const REVEALS = ['show', 'hide']; // 猜的時候公布是誰寫的／先保密
const GUESS_SECS = [30, 45, 60]; // 要讀三句，比偷渡畫家長（老闆 11/11），預設 45

// 正式網域的頁面由 Vercel 代理，API 與 WebSocket 直連這個 Worker，建房的 POST 是跨來源請求
const ALLOWED_ORIGINS = ['https://www.vibeweb100.com'];

const ROOM_PATH = new RegExp(`^${BASE}/api/rooms/([A-Z0-9]{${CODE_LENGTH}})(/ws)?$`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS' && url.pathname.startsWith(`${BASE}/api/`)) {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === `${BASE}/api/rooms`) {
      if (request.method !== 'POST') return methodNotAllowed('POST');
      return withCors(await createRoom(request, env), cors);
    }

    const room = url.pathname.match(ROOM_PATH);
    if (room) {
      const [, code, isWs] = room;
      if (request.method !== 'GET') return methodNotAllowed('GET');
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      const response = await stub.fetch(new Request(isWs ? 'https://room/ws' : 'https://room/info', request));
      // 101 的回應不能碰（webSocket 要原樣傳回去），也不需要 CORS
      return isWs ? response : withCors(response, cors);
    }

    if (url.pathname === BASE || url.pathname === `${BASE}/`) {
      // 相對路徑：正式網域上這個 Worker 看到的 host 是 workers.dev，組絕對網址會把人踢出主網域
      return new Response(null, {
        status: 302,
        headers: { Location: `${BASE}/${pickLang(request)}/`, Vary: 'Accept-Language, Cookie' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function createRoom(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const hostId = typeof body.hostId === 'string' ? body.hostId.slice(0, 64) : '';
  if (!hostId) return json({ error: 'bad_request' }, 400);
  const reveal = REVEALS.includes(body.reveal) ? body.reveal : 'show';
  const guessSec = GUESS_SECS.includes(Number(body.guessSec)) ? Number(body.guessSec) : 45;
  const lang = LANGS.includes(body.lang) ? body.lang : DEFAULT_LANG;

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    const stub = env.ROOM.get(env.ROOM.idFromName(code));
    const created = await stub.fetch('https://room/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, hostId, reveal, guessSec, lang }),
    });

    if (created.ok) return json({ code });
    // 409 = 抽到的代碼已經有房間在用，換一個再試
    if (created.status !== 409) return json({ error: 'create_failed' }, 500);
  }

  return json({ error: 'code_exhausted' }, 503);
}

function randomCode() {
  const out = [];
  const buf = new Uint8Array(CODE_LENGTH * 2);
  // 砍掉尾巴那幾個值，取餘數才不會偏向字母表前面幾個字
  const limit = Math.floor(256 / CODE_ALPHABET.length) * CODE_ALPHABET.length;

  while (out.length < CODE_LENGTH) {
    crypto.getRandomValues(buf);
    for (const byte of buf) {
      if (out.length === CODE_LENGTH) break;
      if (byte < limit) out.push(CODE_ALPHABET[byte % CODE_ALPHABET.length]);
    }
  }
  return out.join('');
}

// 跟系列其他專案一致：cookie 優先於瀏覽器語言
function pickLang(request) {
  const cookie = request.headers.get('Cookie') || '';
  const saved = cookie.match(/(?:^|;\s*)web100_lang=([^;]+)/);
  if (saved && LANGS.includes(decodeURIComponent(saved[1]))) return decodeURIComponent(saved[1]);

  const header = request.headers.get('Accept-Language') || '';
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase();
    if (!tag) continue;
    const exact = LANGS.find((lang) => lang.toLowerCase() === tag);
    if (exact) return exact;
    // 中文要看地區才知道要繁體還是簡體，不能只看 zh 前綴
    if (tag.startsWith('zh')) {
      if (tag === 'zh-cn' || tag === 'zh-sg' || tag === 'zh-hans') return 'zh-CN';
      return 'zh-TW';
    }
    // de-AT、fr-CA、es-MX 這類地區變體歸到主要語言
    const base = LANGS.find((lang) => !lang.includes('-') && tag.startsWith(lang + '-'));
    if (base) return base;
  }
  return DEFAULT_LANG;
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function withCors(response, cors) {
  if (!Object.keys(cors).length) return response;
  const merged = new Response(response.body, response);
  for (const [key, value] of Object.entries(cors)) merged.headers.set(key, value);
  return merged;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function methodNotAllowed(allow) {
  return new Response('Method not allowed', { status: 405, headers: { Allow: allow } });
}
