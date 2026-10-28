// 意見表單的檢查與信件內容。跟 Workers 執行環境無關的部分都放這裡，node --test 測得到。

// 表單的「想跟我們說什麼」。順序跟頁面上的選項一樣（文案在 apps/homepage/src/about-strings.mjs）
export const TYPES = ['recommend', 'idea', 'collab', 'other'];
export const TYPE_LABEL = {
  recommend: '推薦遊戲', idea: '修改建議', collab: '合作邀約', other: '其他',
};
// 「跟哪個遊戲有關」：site 是網站整體；空字串是沒選
export const GAMES = ['', 'site', 'match', 'bingo', 'bomb', 'buzzer', 'bamboo', 'stairs', 'orchard', 'reverse', 'statue', 'charades', 'avalon',
  'truthOrDare', 'metronome', 'names', 'recorder', 'actions', 'words'];
export const LANGS = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'es', 'zh-CN'];

export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 3000;
// 打開頁面到送出不到這麼久，當成機器人
export const MIN_FILL_MS = 3000;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/*
 * 檢查表單內容。回傳：
 *   { ok: true, data }    要寄
 *   { ok: true, skip }    看起來是機器人：假裝成功、不寄（不讓對方知道被擋）
 *   { ok: false, error }  使用者要修正的錯（頁面上本來就擋了，這裡是保險）
 */
export function validate(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid' };
  // 蜜罐：畫面上藏起來的欄位，人不會填
  if (str(body.website, 200)) return { ok: true, skip: 'honeypot' };
  if (typeof body.elapsed === 'number' && body.elapsed < MIN_FILL_MS) return { ok: true, skip: 'too-fast' };

  // 回報問題（bug）上線當天併進修改建議；還開著舊頁面的人送來的 bug 照樣收
  const type = body.type === 'bug' ? 'idea' : TYPES.includes(body.type) ? body.type : null;
  const game = GAMES.includes(body.game) ? body.game : '';
  const message = str(body.message, MESSAGE_MAX + 1);
  const email = str(body.email, 200);
  if (!type) return { ok: false, error: 'type' };
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) return { ok: false, error: 'message' };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: 'email' };

  return {
    ok: true,
    data: {
      type, game, message, email,
      lang: LANGS.includes(body.lang) ? body.lang : '',
      // 從哪一頁點進來的（只收本站路徑），回報問題時知道是哪一頁
      from: typeof body.from === 'string' && /^\/[\w\-./]*$/.test(body.from) ? body.from.slice(0, 200) : '',
    },
  };
}

// UTF-8 → base64（每 76 字斷行，信件標準要求）
function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/.{76}/g, '$&\r\n');
}
const header = (text) => `=?UTF-8?B?${b64(text).replace(/\r\n/g, '')}?=`;

/*
 * 組成一封純文字信（Email Routing 的 send_email 要整封 MIME）。
 * 有留信箱就放進 Reply-To，在 Gmail 直接按回覆就是回給對方。
 */
export function buildMime(data, { from, to, ua = '', now = new Date(), id = crypto.randomUUID() }) {
  const label = TYPE_LABEL[data.type];
  const subject = `[Woohop ${label}]${data.game ? ` ${data.game}` : ''} ${data.message.replace(/\s+/g, ' ').slice(0, 40)}`;
  const body = [
    `類型：${label}`,
    `遊戲：${data.game || '（沒選）'}`,
    `語言：${data.lang || '（不明）'}`,
    `來自頁面：${data.from || '（不明）'}`,
    `回覆信箱：${data.email || '（沒留）'}`,
    `瀏覽器：${ua.slice(0, 300) || '（不明）'}`,
    '',
    '────────',
    data.message,
  ].join('\n');
  const lines = [
    `From: ${header('Woohop 意見表單')} <${from}>`,
    `To: <${to}>`,
    ...(data.email ? [`Reply-To: <${data.email}>`] : []),
    `Subject: ${header(subject)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@${from.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(body),
  ];
  return lines.join('\r\n');
}
