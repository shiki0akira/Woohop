/*
 * 每週指標（唯讀）：GA4 的主持人數、Google 搜尋使用者、Threads 帶來的人、總使用者，外加 10/22 起的累計使用者。
 * 指標定義與目標在 docs/roadmap.md「11/03 調整」。只算 www.vibeweb100.com（本機測試不算）。
 *
 *   node scripts/ga-weekly.mjs                     # 最近 6 週（週一～週日）
 *   GA_KEY=C:/path/key.json node scripts/ga-weekly.mjs
 *
 * 金鑰是服務帳戶 ga-reader 的 JSON，預設在 C:/Users/shiki/secrets/ga-reader.json；只讀路徑，不印內容、不要放進 repo。
 */
import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const KEY_PATH = process.env.GA_KEY || 'C:/Users/shiki/secrets/ga-reader.json';
const PROPERTY = '532193804';
const NORTH_STAR_START = '2026-10-22';

const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
  iss: key.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly',
  aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
});
const sig = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
const tokenRes = await (await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
})).json();
if (!tokenRes.access_token) throw new Error('拿不到 token：' + JSON.stringify(tokenRes.error || tokenRes));

async function report(body) {
  const r = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
    method: 'POST', headers: { authorization: `Bearer ${tokenRes.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })).json();
  if (r.error) throw new Error(r.error.message);
  return r.rows || [];
}

const www = { filter: { fieldName: 'hostName', stringFilter: { matchType: 'EXACT', value: 'www.vibeweb100.com' } } };
const and = (...e) => ({ andGroup: { expressions: e } });
const eq = (field, value) => ({ filter: { fieldName: field, stringFilter: { matchType: 'EXACT', value } } });
const hostEvents = { filter: { fieldName: 'eventName', stringFilter: { matchType: 'FULL_REGEXP', value: '.*_(room_created|game_started)' } } };

// 最近 6 個完整或進行中的 ISO 週（週一開始）
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 35);
const ymd = (d) => d.toISOString().slice(0, 10);
const weekly = async (filter) => {
  const rows = await report({
    dateRanges: [{ startDate: ymd(monday), endDate: 'today' }],
    dimensions: [{ name: 'isoYearIsoWeek' }], metrics: [{ name: 'totalUsers' }], dimensionFilter: filter,
  });
  return Object.fromEntries(rows.map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)]));
};

const [hosts, google, threads, total] = await Promise.all([
  weekly(and(www, hostEvents)),
  weekly(and(www, eq('sessionSourceMedium', 'google / organic'))),
  weekly(and(www, eq('sessionSource', 'threads'))),
  weekly(www),
]);
const cumulative = await report({ dateRanges: [{ startDate: NORTH_STAR_START, endDate: 'today' }], metrics: [{ name: 'totalUsers' }], dimensionFilter: www });

const weeks = [...new Set([...Object.keys(total), ...Object.keys(hosts)])].sort();
console.log('週（ISO） | 主持人數 | Google 搜尋 | Threads | 總使用者');
for (const w of weeks) console.log(`${w} | ${hosts[w] || 0} | ${google[w] || 0} | ${threads[w] || 0} | ${total[w] || 0}`);
console.log(`\n${NORTH_STAR_START} 起累計使用者（www）：${cumulative[0] ? cumulative[0].metricValues[0].value : 0}`);
console.log('（最後一週通常還沒過完；ISO 週 202644 = 2026-10-26～11-01）');
