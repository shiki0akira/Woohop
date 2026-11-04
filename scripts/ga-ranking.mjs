/*
 * 找遊戲的加權排名（唯讀 GA4）：熱門 70%＋新上線 30%，算完印出表格；加 --write 才改寫 apps/homepage/assets/site.js 的 RANK。
 * 規則是老闆 2026-11-04 定的，每兩週的週日進度檢查跑一次，老闆確認後才部署（push 首頁）。
 *
 *   node scripts/ga-ranking.mjs            # 只看
 *   node scripts/ga-ranking.mjs --write    # 改寫 site.js 的 RANK（之後要換 prerender.js 的 ASSET_VERSION、commit、push）
 *
 * 熱門分：近 28 天在 www 按下開始的主持人數（各遊戲的 *_game_started；阿瓦隆是 avalon_game_start）
 *         ÷ 上線天數（最多 28、最少 7：剛上線的不會因為一兩天的數字衝第一），再除以最高的那個、開根號（倒放領先太多，不壓會全擠在 0）
 *         不用頁面瀏覽數：房間型一個主持人帶 5 個玩家進來，會灌水
 * 新上線分：上線當天 1，之後每天少 1/14，滿 14 天歸零（上線日期是 site.js GAMES 的 added；沒填的是改版前就有的，當作很久）
 * 總分 = 0.7 × 熱門分 + 0.3 × 新上線分
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'apps', 'homepage', 'assets', 'site.js');
const KEY_PATH = process.env.GA_KEY || 'C:/Users/shiki/secrets/ga-reader.json';
const PROPERTY = '532193804';
const W_HOT = 0.7;
const W_NEW = 0.3;
const NEW_DAYS = 14;
const MIN_DAYS = 7;
const WINDOW = 28;

// 遊戲清單與上線日期：直接讀 site.js 的 GAMES（{ key: 'xxx', ... added: 'YYYY-MM-DD' }）
const site = readFileSync(SITE, 'utf8');
const games = [...site.matchAll(/\{ key: '([a-z-]+)',[^\n]*/g)].map((m) => ({ key: m[1], added: (m[0].match(/added: '(\d{4}-\d{2}-\d{2})'/) || [])[1] || null }));
const eventOf = (key) => (key === 'avalon' ? 'avalon_game_start' : `${key.replace(/-/g, '_')}_game_started`);

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

const res = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
  method: 'POST', headers: { authorization: `Bearer ${tokenRes.access_token}`, 'content-type': 'application/json' },
  body: JSON.stringify({
    dateRanges: [{ startDate: `${WINDOW}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'eventName' }], metrics: [{ name: 'totalUsers' }],
    dimensionFilter: { andGroup: { expressions: [
      { filter: { fieldName: 'hostName', stringFilter: { matchType: 'EXACT', value: 'www.vibeweb100.com' } } },
      { filter: { fieldName: 'eventName', inListFilter: { values: games.map((g) => eventOf(g.key)) } } },
    ] } },
  }),
})).json();
if (res.error) throw new Error(res.error.message);
const hosts = Object.fromEntries((res.rows || []).map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)]));

const today = new Date(new Date().toISOString().slice(0, 10));
const rows = games.map((g) => {
  const since = g.added ? Math.round((today - new Date(g.added)) / 86400000) : Infinity; // 上線幾天（當天是 0）
  const days = Math.max(MIN_DAYS, Math.min(WINDOW, since + 1));
  const h = hosts[eventOf(g.key)] || 0;
  return { ...g, since, hosts: h, rate: h / days, fresh: Math.max(0, 1 - since / NEW_DAYS) };
});
const maxRate = Math.max(...rows.map((r) => r.rate)) || 1;
for (const r of rows) {
  r.hot = Math.sqrt(r.rate / maxRate);
  r.score = W_HOT * r.hot + W_NEW * r.fresh;
}
// 同分：主持人多的先、再來是比較新的
rows.sort((a, b) => b.score - a.score || b.hosts - a.hosts || (b.added || '').localeCompare(a.added || ''));

console.log(`近 ${WINDOW} 天（到今天）的加權排名`);
console.log('名次 | 遊戲 | 開局主持人 | 上線天數 | 熱門分 | 新上線分 | 總分');
rows.forEach((r, i) => console.log(`${i + 1} | ${r.key} | ${r.hosts} | ${r.since === Infinity ? '28+' : r.since} | ${r.hot.toFixed(2)} | ${r.fresh.toFixed(2)} | ${r.score.toFixed(2)}`));

const line = `  const RANK = [${rows.map((r) => `'${r.key}'`).join(', ')}];`;
if (process.argv.includes('--write')) {
  const next = site.replace(/(\/\/ RANK:BEGIN\n)[^\n]*(\n\s*\/\/ RANK:END)/, `$1${line}$2`);
  if (next === site) console.log('\nRANK 沒有變，不用改');
  else {
    writeFileSync(SITE, next);
    console.log('\n已改寫 site.js 的 RANK。接著：換 apps/homepage/scripts/prerender.js 的 ASSET_VERSION → commit → push');
  }
} else {
  console.log(`\n要套用：node scripts/ga-ranking.mjs --write\n${line.trim()}`);
}
