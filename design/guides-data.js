/*
 * 帶領指南的假資料（設計稿用）。正式上線時每篇都是一個獨立網址的文章頁，企劃書 §4 的 SEO 入口。
 * type：新手 / 情境 / 技巧，對應徽章顏色。
 */
const GUIDE_TYPES = { beginner: ['新手必看', 'b-new'], scene: ['情境', 'b-info'], tip: ['技巧', 'b-live'] };
const GUIDES = [
  { type: 'beginner', title: '第一次帶小組破冰：15 分鐘流程範例', desc: '開場、暖場、認識彼此，每一段要做什麼、說什麼，照著帶就好。', min: 5 },
  { type: 'scene',    title: '一群完全不認識的人，先玩哪一個？',   desc: '不用自我介紹也能破冰的三個遊戲，適合迎新和第一次聚會。',   min: 4 },
  { type: 'tip',      title: '冷場了怎麼救？主持人的五句救場話',   desc: '沒人回答、有人太害羞、玩到一半卡住時，可以直接說的話。',   min: 3 },
  { type: 'scene',    title: '只有 5 個人的小組，適合玩什麼？',     desc: '人少的時候，大團體遊戲會冷掉。這幾個在小組裡反而更好玩。', min: 4 },
  { type: 'beginner', title: '沒有網路、沒有投影，也能帶的破冰',   desc: '戶外、營地、教室斷網時的備案，一支手機或什麼都不用。',     min: 3 },
  { type: 'tip',      title: '怎麼讓害羞的人也願意開口？',         desc: '分組、輪流、給選項——讓不習慣講話的人也有參與感的小技巧。', min: 5 },
  { type: 'scene',    title: '公司新人訓的破冰，跟教會小組哪裡不同？', desc: '同一個遊戲換個問法，就能適合不同場合。附問題改寫範例。',   min: 6 },
];
const guideCard = g => {
  const [label, cls] = GUIDE_TYPES[g.type];
  // 文章還沒寫，卡片先停用（不是連結），標「即將推出」
  return `<div class="guide is-disabled" aria-disabled="true" data-type="${g.type}"><span class="badge ${cls}">${label}</span><h4>${g.title}</h4><p>${g.desc}</p><span class="meta">約 ${g.min} 分鐘讀完</span><span class="badge b-soon">即將推出</span></div>`;
};
