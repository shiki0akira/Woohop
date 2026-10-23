/*
 * 定時炸彈的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方：
 * 引爆時間的選項、題庫、語言下拉、玩法頁的時間建議表。
 */

import { LOCALE_LABELS, PROJECT_ID } from './app/strings.js';
import { QUESTIONS, CATEGORY_GROUPS, checkQuestions } from './app/questions.js';

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-08-31';

// 規則頁的清單長度要一致，否則某個語言會少一步驟而沒人發現
export const LIST_KEYS = ['rulesFacts', 'rulesTimeGuide', 'rulesHowSteps', 'rulesLeadSteps', 'ruleCards'];

export const RAW_TOKENS = ['questionsJson', 'timerJson', 'langOptions', 'rulesTimeRows'];

/*
 * 引爆時間的選項。**單一來源在這裡**，build 時內嵌進頁面（window.BOMB.timer），
 * app.js 不自己另外寫一份——兩邊各有一份的話，改了選項卻忘了改預設值，
 * 就會出現「預設值不在選項裡、五顆按鈕一顆都沒亮」。
 *
 * 上限 6 分鐘是題庫文件算題數餘裕時用的極端值；下限 30 秒再短就只夠傳兩個人。
 */
const TIMER = {
  minOptions: [30, 60, 120, 180],
  maxOptions: [60, 120, 180, 300, 360],
  defaultMin: 60,
  defaultMax: 180,
  /*
   * 設定畫面平常**只露出這三顆**，最短／最長那兩排收在「自訂」底下。
   *
   * 兩排攤開來是九顆按鈕加兩個標籤，而且還帶著一條要讀完才懂的規則
   * （最長不能小於最短）——主持人第一次打開就得先解一道題，才走得到「開始遊戲」。
   * 收成三個區間之後，這一頁要做的決定剩下「快一點還是慢一點」。
   *
   * 按鈕上只寫區間本身（「30 秒–2 分」），不另外取名字：區間就是最清楚的說明，
   * 而且不用為了三顆按鈕多翻八種語言。
   *
   * defaultMin / defaultMax 必須剛好等於其中一顆，不然一打開三顆都不亮，
   * 看起來像還沒選（checkTimer 會擋）。
   */
  presets: [
    { id: 'fast', min: 30, max: 120 },
    { id: 'normal', min: 60, max: 180 },
    { id: 'slow', min: 180, max: 360 },
  ],
};

export function check({ LANGS, STRINGS }) {
  checkTimer();
  checkQuestions(LANGS);

  /*
   * 分組的顯示名稱是「group + 首字大寫」組出來的，漏一個會讓設定畫面那顆按鈕沒有標題。
   *
   * 只檢查分組、不檢查 CATEGORIES 裡那五個分類：設定畫面上勾選的單位是分組
   * （問答型 / 動作型兩顆按鈕），五個分類只在 questions.js 裡當題庫的整理方式，
   * 對應 QUESTIONS.md 的章節，不會出現在畫面上，所以也不需要八種語言的名字。
   */
  for (const group of CATEGORY_GROUPS) {
    const key = `group${group.id[0].toUpperCase()}${group.id.slice(1)}`;
    for (const lang of LANGS) {
      if (!STRINGS[lang][key]) throw new Error(`${lang} 少了分組名稱 ${key}`);
    }
  }
}

export function gameBar({ page, strings }) {
  return {
    settingsLabel: strings.settingsTab,
    // 聲音開關（頂欄音符鍵）只在遊戲頁：玩法頁沒有聲音
    musicLabel: page.dir === 'rules' ? '' : strings.soundLabel,
  };
}

export function tokens({ lang, LANGS, strings, toScriptJson, escapeHtml }) {
  return {
    langOptions: langOptions(lang, LANGS, escapeHtml),
    projectId: PROJECT_ID,
    // 分享縮圖的替代文字是「炸彈」，不是遊戲名
    ogImageAlt: strings.bombAlt,
    // 題庫只內嵌「這個語言的文字」，不是每種語言全帶：
    // 一份頁面只有一種語言，帶進全部會讓每頁多背用不到的題庫
    questionsJson: toScriptJson(questionsFor(lang)),
    timerJson: toScriptJson(TIMER),
    rulesTimeRows: strings.rulesTimeGuide
      .map(([who, time]) => `<tr><th>${escapeHtml(who)}</th><td>${escapeHtml(time)}</td></tr>`)
      .join(''),
  };
}

// 預設值不在選項裡的話，五顆按鈕會一顆都沒亮，而且畫面上完全看不出哪裡壞了
function checkTimer() {
  if (!TIMER.minOptions.includes(TIMER.defaultMin)) {
    throw new Error(`defaultMin ${TIMER.defaultMin} 不在 minOptions 裡`);
  }
  if (!TIMER.maxOptions.includes(TIMER.defaultMax)) {
    throw new Error(`defaultMax ${TIMER.defaultMax} 不在 maxOptions 裡`);
  }
  if (TIMER.defaultMax < TIMER.defaultMin) {
    throw new Error('預設的最長時間比最短還短');
  }
  // 最短選了最大值時，最長至少要有一個選項接得住，否則 clampRange 無路可走
  const biggestMin = Math.max(...TIMER.minOptions);
  if (!TIMER.maxOptions.some((value) => value >= biggestMin)) {
    throw new Error(`最短可以選到 ${biggestMin} 秒，但 maxOptions 沒有任何一個接得住`);
  }

  /*
   * 三顆預設的每個值都要真的在選項裡：點了預設之後畫面會把它寫回 settings，
   * 值不在選項裡的話「自訂」展開時那一排會一顆都不亮。
   */
  for (const preset of TIMER.presets) {
    if (!TIMER.minOptions.includes(preset.min)) {
      throw new Error(`預設 ${preset.id} 的最短 ${preset.min} 秒不在 minOptions 裡`);
    }
    if (!TIMER.maxOptions.includes(preset.max)) {
      throw new Error(`預設 ${preset.id} 的最長 ${preset.max} 秒不在 maxOptions 裡`);
    }
    if (preset.max < preset.min) {
      throw new Error(`預設 ${preset.id} 的最長比最短還短`);
    }
  }

  // 一打開沒有任何一顆亮著，看起來就像「還沒選」——那正是這次改版要消掉的東西
  if (!TIMER.presets.some((p) => p.min === TIMER.defaultMin && p.max === TIMER.defaultMax)) {
    throw new Error('預設值不等於任何一顆時間預設，設定畫面一打開會三顆都不亮');
  }
}

/*
 * 送到前端的題庫。
 *
 * 每一題只帶 `group`（ask / dare），**不帶五個分類的 category**：設定畫面上能勾的
 * 就只有兩顆按鈕，前端拿到 category 也沒有用途，還得自己再做一次分類→分組的對應。
 * 五個分類留在 questions.js 裡當題庫的整理方式（對應 QUESTIONS.md 的章節）。
 *
 * `familiar`（※ 記號）也不送：設定畫面已經沒有那個開關，那 2 題一律在牌堆裡。
 */
function questionsFor(lang) {
  const groupOf = new Map();
  for (const group of CATEGORY_GROUPS) {
    for (const category of group.categories) groupOf.set(category, group.id);
  }

  return {
    groups: CATEGORY_GROUPS.map((group) => group.id),
    list: QUESTIONS.map((question) => ({
      id: question.id,
      group: groupOf.get(question.category),
      text: question.text[lang],
    })),
  };
}

// selected 直接寫進 HTML：JS 還沒跑的時候下拉就已經指著當前語言，不會先閃成第一個選項
function langOptions(current, LANGS, escapeHtml) {
  return LANGS.map(
    (lang) =>
      `<option value="${lang}"${lang === current ? ' selected' : ''}>${escapeHtml(LOCALE_LABELS[lang])}</option>`,
  ).join('\n            ');
}
