/*
 * 繁體中文，其他語言的對照基準（DEFAULT_LANG）。
 * 這裡有的 key，每個語言都要有；這裡沒有的，別的語言也不能多。
 * 三份清單（rulesHostSteps / rulesPlayerSteps / rulesFaq）的長度也要一致，
 * 少一項或多一項 build 都會擋下來（scripts/build.js 的 checkStrings）。
 *
 * {n} {m} {s} {time} 這種大括號是佔位符，翻譯時要原樣保留。
 */
export default {
  htmlLang: 'zh-Hant-TW',
  ogLocale: 'zh_TW',

  seoTitle:
    '定時炸彈破冰遊戲｜一支手機傳著玩，現場開網頁就能開始',
  seoDesc:
    '找破冰遊戲不用再讀一長串文章——這是一個打開就能玩的定時炸彈。一支手機當炸彈圍成一圈傳，畫面出一題，做完按完成傳給下一個人，什麼時候爆沒有人知道，爆在誰手上誰就輸。內建 90 題問答與挑戰題，也可以自己加題。小組聚會、團契、迎新、公司團康都能用，免下載、免註冊。',
  rulesSeoTitle:
    '定時炸彈怎麼玩？破冰遊戲規則、90 題題庫與主持人帶法',
  rulesSeoDesc:
    '定時炸彈破冰遊戲的完整玩法：幾個人玩、引爆時間怎麼設、兩種常見玩法差在哪、90 題題庫分成哪兩類，還有主持人現場最常遇到的三個狀況怎麼處理。',

  navTitle: '定時炸彈',
  navRules: '玩法',
  rulesLinkText: '第一次玩？看看怎麼開始 →',
  langSwitchLabel: '切換語言',
  themeToggleLabel: '切換深淺色',

  heroTitle: '定時炸彈：做完題目，快傳給下一個人',
  heroDesc:
    '整場只要一台手機，它就是炸彈。畫面出一題，拿到的人當場做完、按下「完成」、傳給旁邊的人。什麼時候爆沒有人知道——爆在誰手上，誰就是這一輪的輸家。',

  // ---------- 設定畫面 ----------
  timerHeading: '引爆時間',
  timerHint: '實際爆炸的時間會落在這個區間裡隨機一點，畫面上不會顯示剩幾秒。',
  minTimeLabel: '最短',
  maxTimeLabel: '最長',
  timerCustomToggle: '自訂區間',
  secondsUnit: '{n} 秒',
  minutesUnit: '{n} 分',
  timeRange: '{min}–{max}',

  questionsHeading: '題目',
  deckCount: '牌堆 {n} 題',
  groupAsk: '問答型',
  groupDare: '動作型',
  catCount: '{n} 題',

  deckEmptyWarning: '至少要選一個分類才能開始。',
  deckThinWarning: '牌堆只有 {n} 題，一輪之內可能會抽到重複的題目。',

  customLabel: '自訂題目',
  customPlaceholder: '例如：說出你最喜歡的食物',
  customCategoryLabel: '歸到哪一類',
  customAddButton: '加入',
  customDoneButton: '完成',
  customEmpty: '還沒有自訂的題目。',
  customRemoveLabel: '刪掉這題',
  customHint: '自己加的題目會留在這台裝置上，下次打開還在。',

  // ---------- 帶領的步驟（全站共用的 Leader，跟竹筍竹筍蹦蹦出同一套）----------
  // 每個畫面就是一步：[標題, 照著念]。進行中那一步手機在大家手上傳，不放步驟頭
  lead: {
    setup: ["選題目","我們來玩定時炸彈！先選要回答問題、做動作，還是兩種都要。"],
    rules: ["說明規則","這支手機就是炸彈。畫面出一題，拿到的人當場做完、按「完成」，再傳給旁邊的人。炸彈什麼時候爆沒人知道，爆在誰手上誰就輸！"],
    boom: ["誰輸了？","炸彈爆在誰手上？輸的人先選真心話、大冒險還是隨機，再拉一下拉霸！"],
  },
  // 「說明規則」那一步的三張插圖卡：[標題, 說明]
  ruleCards: [
    ["拿到就做","畫面出一題，當場做完：回答問題或做一個動作。"],
    ["做完傳下去","按「完成」，把手機交給旁邊的人。卡住了可以換一題。"],
    ["爆在誰手上誰輸","什麼時候爆沒人知道，爆炸那一刻拿著手機的人就輸了。"],
  ],
  rulesNext: "下一步：開始玩",

  startButton: "開始遊戲",

  // ---------- 遊戲進行中 ----------
  passButton: '完成！傳給下一個人',
  skipButton: '換一題',
  playHint: '做完畫面上這件事，按「完成」，然後把手機傳出去。',
  stuckHint: '卡住了？按「換一題」，別讓炸彈停在你手上。',
  bombAlt: '炸彈',

  // ---------- 爆炸 ----------
  boomTitle: '爆炸了！',
  boomStats: '這一輪撐了 {time}，完成 {done} 題',
  boomStatsWithSkips: '這一輪撐了 {time}，完成 {done} 題、跳過 {skipped} 題',
  durationMinSec: '{m} 分 {s} 秒',
  durationSec: '{s} 秒',
  againButton: '再玩一輪',

  // ---------- 離開確認 ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: '設定',
  gameBack: '返回',
  leaveTitle: '要結束這一輪嗎？',
  leaveDesc: '炸彈還在倒數，離開的話這一輪就沒了。',
  leaveConfirm: '結束這輪',
  leaveCancel: '繼續玩',

  // ---------- 規則頁 ----------
  rulesTitle: '定時炸彈怎麼玩',
  rulesIntro: "一支手機在大家手上傳，畫面出一題，做完就傳下去。炸彈什麼時候爆沒人知道，爆在誰手上誰就輸。",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["人數","4～15 人"],["準備","一支手機，大家圍成一圈"]],
  // 引爆時間依人數建議（對應設定畫面那三顆區間）
  rulesTimeLabel: "引爆時間怎麼選",
  rulesTimeGuide: [["4～6 人","30 秒～2 分"],["7～10 人","1～3 分"],["11～15 人","3～6 分"]],
  rulesTimeNote: "人越多，一圈傳得越久。玩 3～5 輪大約 10 分鐘。",
  rulesHowHeading: "怎麼玩",
  rulesHowSteps: [
    "選題目：問答型、動作型，或兩種都要。",
    "按「開始遊戲」，手機交給第一個人。",
    "讀題、當場做完，按「完成」，傳給旁邊的人。",
    "炸彈爆了，拿著手機的人就是這輪的輸家。",
  ],
  rulesLeadHeading: "主持人怎麼帶",
  // 主持人開場照著念的一句（畫面上是「照著念」卡片），底下是小提醒
  rulesLeadSay: "做完畫面上的事就傳給旁邊的人。炸彈爆在誰手上，誰就輸！",
  rulesLeadSteps: [
    "新朋友多先只開問答型；熟一點再加動作型。",
    "有人卡住就喊「下一個！」，別讓節奏停下來。",
    "輸的人不用懲罰，直接按「再玩一輪」就好。",
  ],
  rulesBack: '← 回到遊戲',
};
