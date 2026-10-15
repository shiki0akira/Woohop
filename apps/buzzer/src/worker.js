/*
 * Worker 進入點。這個 Worker 只負責 /buzzer/*：
 * 正式網域上 /buzzer/* 以外的請求根本不會進來（由首頁的 rewrite / 之後的 Worker 路由總機決定），
 * 所以所有 API 路徑、靜態資源都要待在 /buzzer/ 底下。
 *
 * 靜態頁由 assets binding 處理（wrangler.jsonc），找不到才落到這裡：
 *   /buzzer/api/rooms          POST  建立房間
 *   /buzzer/api/rooms/:code    GET   查房間是否存在（加入頁先擋掉打錯的代碼）
 *   /buzzer/api/rooms/:code/ws GET   升級成 WebSocket，轉給對應的 Durable Object
 *   /buzzer/ 或 /buzzer        依語言轉址到 /buzzer/{lang}/
 */

import { BuzzerRoom } from './room.js';

export { BuzzerRoom };

const BASE = '/buzzer';
// 跟 app/strings.js 的 LANGS 與首頁的 SUPPORTED_LANGS 一致，三邊要一起改
const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];
const DEFAULT_LANG = 'zh-TW';

// 去掉 0/O/1/I/L：房間代碼會被唸出來、也會被手動輸入，形近字一定會有人打錯
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;
const MAX_CREATE_ATTEMPTS = 5;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30;

// 正式網域上的頁面由 Vercel 代理過來，但 API 與 WebSocket 是直連這個 Worker，
// 所以建房那支 POST 會是跨來源請求，要放行。只放行正式網域，不用 *。
// WebSocket 不受 CORS 規範，這裡只影響 fetch。
const ALLOWED_ORIGINS = ['https://www.vibeweb100.com'];

const ROOM_PATH = new RegExp(`^${BASE}/api/rooms/([A-Z0-9]{${CODE_LENGTH}})(/ws)?$`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    // 跨來源的 POST 會先送 preflight，擋掉的話建房會直接失敗
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
      // 用原本的 request 當 init，Upgrade 之類的標頭才會一起帶進 Durable Object
      const response = await stub.fetch(
        new Request(isWs ? 'https://room/ws' : 'https://room/info', request),
      );
      // 101 的回應不能碰（webSocket 要原樣傳回去），也不需要 CORS
      return isWs ? response : withCors(response, cors);
    }

    if (url.pathname === BASE || url.pathname === `${BASE}/`) {
      // Location 給相對路徑，不要組絕對網址。正式網域上這個 Worker 看到的 host 是
      // workers.dev（請求是 Vercel 代理進來的），組絕對網址會把使用者踢出主網域，
      // Google 也會看成跨網域轉址。相對路徑會留在當下這個 host 上。
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

  const maxPlayers = Number(body.maxPlayers);
  if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
    return json({ error: 'bad_max_players' }, 400);
  }

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    const stub = env.ROOM.get(env.ROOM.idFromName(code));
    const created = await stub.fetch('https://room/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, maxPlayers, hostId }),
    });

    if (created.ok) return json({ code, maxPlayers });
    // 409 = 抽到的代碼已經有房間在用，換一個再試；其他錯誤沒有重試的意義
    if (created.status !== 409) return json({ error: 'create_failed' }, 500);
  }

  return json({ error: 'code_exhausted' }, 503);
}

function randomCode() {
  const out = [];
  const buf = new Uint8Array(CODE_LENGTH * 2);
  // 248 = 31 × 8：砍掉尾巴那幾個值，取餘數才不會偏向字母表前面幾個字
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

// 跟系列其他專案一致：cookie 優先於瀏覽器語言（使用者手動選過的不該被覆蓋）
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
      return 'zh-TW'; // zh-HK / zh-MO / 單一個 zh 都給繁體
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
