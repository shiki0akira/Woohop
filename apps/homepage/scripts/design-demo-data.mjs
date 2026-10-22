// 設計系統頁（design/brand-exploration.html）的「帶領元件」示範要用的資料：
// 共用元件 window.Leader（assets/game.js）需要的 zh-TW 文字、一小份拉霸題目、名稱庫。
// 設計系統頁是直接用 file:// 開的，不能 import ES module，所以產生成一支一般的 JS 檔。
//
//   node scripts/design-demo-data.mjs   → design/leader-demo-data.js，並把 assets/game.js、game.css 複製到 design/
//   （設計系統頁的預覽伺服器只開放 design/，跟 woohop-art.js 一樣放一份副本）
//
// 改了 locales.mjs 裡 Leader 用到的文字、題目或名稱庫，跑一次再 commit。

import { writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { STRINGS } from '../src/locales.mjs';
import { SLOT } from '../src/slot-prompts.mjs';
import { THEMES, groupsFor } from '../src/name-pools.mjs';

const LANG = 'zh-TW';
const s = STRINGS[LANG];
// Leader 會讀的 key：步驟頭、照著念、拉霸、選主題、抽卡取名、節拍器
const KEYS = Object.keys(s).filter((k) => /^(leadStep|sayLabel|slot|theme|metro|allDone|drawButton|name|named|own|passNext|poolEmpty|redraw|removeName|rerollTheme|revealHint|youAre)/.test(k));
const t = Object.fromEntries(KEYS.map((k) => [k, s[k]]));

const data = {
  t,
  slot: { prompts: SLOT[LANG].prompts.slice(0, 12), actions: SLOT[LANG].actions.slice(0, 8) },
  names: { themes: THEMES, groups: Object.fromEntries(THEMES.map((th) => [th, groupsFor(th, LANG)])) },
};

const out = path.resolve('..', '..', 'design', 'leader-demo-data.js');
writeFileSync(out, `// 由 apps/homepage/scripts/design-demo-data.mjs 產生，不要手改\nwindow.WOOHOP = ${JSON.stringify({ lang: LANG, t: data.t })};\nwindow.LEADER_DEMO = ${JSON.stringify({ slot: data.slot, names: data.names })};\n`);
for (const f of ['game.js', 'game.css']) copyFileSync(path.resolve('assets', f), path.resolve('..', '..', 'design', f));
console.log('寫入', out, KEYS.length, '個文字，並複製 game.js、game.css');
