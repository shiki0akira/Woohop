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

  startButton: '开始游戏',

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
  backToSetupButton: '改设置',

  // ---------- 离开确认 ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  gameBack: '返回',
  leaveTitle: '要结束这一轮吗？',
  leaveDesc: '炸弹还在倒数，离开的话这一轮就没了。',
  leaveConfirm: '结束这轮',
  leaveCancel: '继续玩',

  // ---------- 规则页 ----------
  rulesTitle: '定时炸弹怎么玩',
  rulesIntro:
    '一部手机、一群人围成一圈。屏幕出一题，拿到手机的人做完就传给下一个人；炸弹什么时候炸是随机的，也看不到还剩几秒。炸在谁手上，谁就是这一轮的输家。',
  rulesHostHeading: '开始之前（拿手机的那个人）',
  rulesHostSteps: [
    '选「问答型」、「动作型」，或两个都要。新朋友多就先只开问答型。',
    '想加自己小组的梗，用「自定义题目」加几题，选一边归进去。',
    '设置引爆区间。第一轮用默认的 1～3 分钟就好，玩开了想快一点再改成 30 秒～2 分钟。',
    '开场讲三句话：做完屏幕上的事、按完成传给下一个人、炸在谁手上谁就是这轮的输家。',
  ],
  rulesPlayerHeading: '拿到手机的时候',
  rulesPlayerSteps: [
    '读屏幕上那一题，当场做完——说一句话、学个动物叫、跟旁边的人击个掌都算。',
    '按下方那条「完成，传给下一个人」。',
    '把手机传给旁边的人。',
    '做不出来？直接按完成传下去，没有人会计较，这不是问答比赛。',
  ],
  rulesFaqHeading: '常见问题',
  rulesFaq: [
    {
      q: '每个人都要有手机吗？',
      a: '不用。整场只需要一部手机，它就是那颗炸弹，围成一圈传。这跟系列里其他几个游戏不一样，那些是每人一部手机扫二维码加入房间。',
    },
    {
      q: '看得到还剩几秒吗？',
      a: '看不到，一秒都看不到。这是刻意的——看得到倒数的话，最后十秒没有人肯接手机，游戏会卡在原地。滴答声的快慢也不代表快炸了。',
    },
    {
      q: '题目做不出来可以跳过吗？',
      a: '可以，直接按完成。没有分数，也没有人在记谁跳过几题。',
    },
    {
      q: '可以加我们自己的题目吗？',
      a: '可以。设置界面的「自定义题目」加进去、选一个分类，下次打开还在。加的题目留在这台设备上，不会上传。',
    },
    {
      q: '手机一直在人手之间传，有点介意。',
      a: '套个密封袋，或者拿一部不常用的备用机来当炸弹。',
    },
    {
      q: '中途手机锁屏了会怎样？',
      a: '游戏进行中会挡住自动锁屏。真的被切到后台，回到界面的当下会立刻重算——如果在后台期间就已经过了引爆时刻，一回来就是爆炸界面。',
    },
    {
      q: '输的人要做什么？',
      a: '由你们自己决定，系统不规定。谁输了现场所有人都看得到，罚他做什么是主持人和全场的事。',
    },
  ],
  rulesBack: '← 回到游戏',
};
