/*
 * 简体中文。这里的 key 要跟 zh-TW 完全一致（scripts/build.js 的 checkStrings）。
 * 不是把繁体转个字就好：用词照大陆的说法（手机不叫「行動裝置」、屏幕不叫「螢幕」）。
 *
 * {n} {m} {s} {time} 是占位符，翻译时原样保留。
 */
export default {
  htmlLang: 'zh-Hans-CN',
  ogLocale: 'zh_CN',

  seoTitle: '定时炸弹｜一部手机传着玩的破冰游戏，炸在谁手上谁就输',
  seoDesc:
    '小组聚会、团契、家庭聚会的破冰游戏。一部手机就是那颗炸弹，围成一圈传：屏幕出一题，做完按完成、传给下一个人，什么时候炸没有人知道，炸在谁手上谁就是这一轮的输家。内置 90 道问答与挑战题，也可以自己加题。免下载、免注册，打开网页就能玩。',
  rulesSeoTitle: '定时炸弹 — 玩法说明',
  rulesSeoDesc: '怎么设置引爆时间、题目分类怎么挑、自己出题怎么加，还有主持人开场要讲的三句话。',

  navTitle: '定时炸弹',
  navRules: '玩法',
  rulesLinkText: '第一次玩？看看怎么开始 →',
  langSwitchLabel: '切换语言',
  themeToggleLabel: '切换深浅色',

  heroTitle: '定时炸弹：做完题目，快传给下一个人',
  heroDesc:
    '整场只要一部手机，它就是炸弹。屏幕出一题，拿到的人当场做完、按下「完成」、传给旁边的人。什么时候炸没有人知道——炸在谁手上，谁就是这一轮的输家。',

  // ---------- 设置界面 ----------
  timerHeading: '引爆时间',
  timerHint: '实际爆炸的时间会落在这个区间里随机一点，屏幕上不会显示还剩几秒。',
  minTimeLabel: '最短',
  maxTimeLabel: '最长',
  timerCustomToggle: '自定义区间',
  secondsUnit: '{n} 秒',
  minutesUnit: '{n} 分',
  timeRange: '{min}–{max}',

  questionsHeading: '题目',
  deckCount: '牌堆 {n} 题',
  groupAsk: '问答型',
  groupDare: '动作型',
  catCount: '{n} 题',

  deckEmptyWarning: '至少要选一个分类才能开始。',
  deckThinWarning: '牌堆只有 {n} 题，一轮之内可能会抽到重复的题目。',

  customLabel: '自定义题目',
  customPlaceholder: '例如：说出你最喜欢的食物',
  customCategoryLabel: '归到哪一类',
  customAddButton: '加入',
  customDoneButton: '完成',
  customEmpty: '还没有自定义的题目。',
  customRemoveLabel: '删掉这题',
  customHint: '自己加的题目会留在这台设备上，下次打开还在。',

  // ---------- 帶領的步驟（全站共用的 Leader，跟竹筍竹筍蹦蹦出同一套）----------
  // 每個畫面就是一步：[標題, 照著念]。進行中那一步手機在大家手上傳，不放步驟頭
  lead: {
    setup: ["选题目","我们来玩定时炸弹！先选要回答问题、做动作，还是两种都要。"],
    rules: ["说明规则","这部手机就是炸弹。屏幕上出一题，拿到的人当场做完、按「完成」，再传给旁边的人。炸弹什么时候爆没人知道，爆在谁手上谁就输！"],
    boom: ["谁输了？","炸弹爆在谁手上？输的人先选真心话、大冒险还是随机，再拉一下老虎机！"],
  },
  // 「說明規則」那一步的三張插圖卡：[標題, 說明]
  ruleCards: [
    ["拿到就做","屏幕上出一题，当场做完：回答问题或做一个动作。"],
    ["做完传下去","按「完成」，把手机交给旁边的人。卡住了可以换一题。"],
    ["爆在谁手上谁输","什么时候爆没人知道，爆炸那一刻拿着手机的人就输了。"],
  ],
  rulesNext: "下一步：开始玩",

  // 頂欄音符鍵的名稱（給螢幕閱讀器念）：管全部聲音——滴答、爆炸、拉霸
  soundLabel: "音效",
  startButton: "开始游戏",

  // ---------- 游戏进行中 ----------
  passButton: '完成！传给下一个人',
  skipButton: '换一题',
  playHint: '做完屏幕上这件事，按「完成」，然后把手机传出去。',
  stuckHint: '卡住了？按「换一题」，别让炸弹停在你手上。',
  bombAlt: '炸弹',

  // ---------- 爆炸 ----------
  boomTitle: '爆炸了！',
  boomStats: '这一轮撑了 {time}，完成 {done} 题',
  boomStatsWithSkips: '这一轮撑了 {time}，完成 {done} 题、跳过 {skipped} 题',
  durationMinSec: '{m} 分 {s} 秒',
  durationSec: '{s} 秒',
  againButton: '再玩一轮',

  // ---------- 离开确认 ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: '设置',
  gameBack: '返回',
  leaveTitle: '要结束这一轮吗？',
  leaveDesc: '炸弹还在倒数，离开的话这一轮就没了。',
  leaveConfirm: '结束这轮',
  leaveCancel: '继续玩',

  // ---------- 规则页 ----------
  rulesTitle: '定时炸弹怎么玩',
  rulesIntro: "一部手机在大家手上传，画面出一题，做完就传下去。炸弹什么时候爆没人知道，爆在谁手上谁就输。",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["人数","4～15 人"],["准备","一部手机，大家围成一圈"]],
  // 引爆時間依人數建議（對應設定畫面那三顆區間）
  rulesTimeLabel: "引爆时间怎么选",
  rulesTimeGuide: [["4～6 人","30 秒～2 分"],["7～10 人","1～3 分"],["11～15 人","3～6 分"]],
  rulesTimeNote: "人越多，一圈传得越久。玩 3～5 轮大约 10 分钟。",
  rulesHowHeading: "怎么玩",
  rulesHowSteps: [
    "选题目：问答型、动作型，或两种都要。",
    "按「开始游戏」，手机交给第一个人。",
    "读题、当场做完，按「完成」，传给旁边的人。",
    "炸弹爆了，拿着手机的人就是这轮的输家。",
  ],
  rulesLeadHeading: "主持人怎么带",
  // 主持人開場照著念的一句（畫面上是「照著念」卡片），底下是小提醒
  rulesLeadSay: "做完画面上的事就传给旁边的人。炸弹爆在谁手上，谁就输！",
  rulesLeadSteps: [
    "新朋友多先只开问答型；熟一点再加动作型。",
    "有人卡住就喊「下一个！」，别让节奏停下来。",
    "输的人不用惩罚，直接按「再玩一轮」就好。",
  ],
  rulesBack: '← 回到游戏',
};
