/*
 * 简体中文。用语跟着大陆的习惯走，不是把繁体逐字转过来——
 * 「小组」「团契」这类词保留（这是教会小组的场景），但「手摇饮」改成「奶茶」、
 * 「主日」改成「主日聚会」这类只在台湾通行的说法要换掉。
 */
export default {
  htmlLang: 'zh-Hans',
  ogLocale: 'zh_CN',

  seoTitle: '幸福宾果｜找人配对的破冰宾果卡，小组聚会用手机就能玩',
  seoDesc:
    '小组、团契、迎新聚会的破冰游戏。每个人拿到一张宾果卡，格子里是「会弹奏乐器的人」这种描述，到现场找到符合的人、对方确认后就打勾，连成指定条数就获胜。免下载、免注册，扫二维码就能玩，两个人也玩得起来。',
  rulesSeoTitle: '幸福宾果 — 玩法说明',
  rulesSeoDesc: '房间怎么开、宾果卡怎么设置、配对与确认的流程，还有主持人开场要讲的几件事。',

  navTitle: '幸福宾果',
  navRules: '玩法',
  rulesLinkText: '第一次玩？看看怎么开始 →',
  langSwitchLabel: '切换语言',
  themeToggleLabel: '切换深浅色',

  heroTitle: '幸福宾果：找到人、聊两句、打个勾',
  heroDesc:
    '每个人一张宾果卡，格子里不是数字，是「今年第一次来小组的人」这种描述。到现场找到符合的人，对方在自己手机上按确认才算数。连成主持人指定的条数就获胜。',

  createHeading: '创建房间',
  maxPlayersLabel: '预计人数',
  maxPlayersHint: '2～30 人，含你自己。两个人就玩得起来。',
  createButton: '创建房间',
  creating: '创建中…',
  createFailed: '创建房间失败，再试一次。',

  joinHeading: '加入现有房间',
  roomCodeLabel: '房间代码',
  roomCodePlaceholder: '例如 A3KP',
  nicknameLabel: '你的名字',
  nicknamePlaceholder: '大家认得出来的称呼',
  avatarLabel: '选一个头像',
  joinButton: '加入',

  joinTitle: '加入 {code}',
  profileContinue: '进入房间',
  playerBadge: '玩家',
  cancelButton: '取消',
  backHome: '回首页',
  rulesBack: '← 回到游戏',
  roomClosedTitle: '房间已关闭',
  roomClosedDesc: '主持人把这个房间关掉了。',
  kickedTitle: '你已离开房间',
  kickedDesc: '主持人把你移出了这个房间。',

  roomCodeCaption: '房间代码',
  shareHint: '请大家扫这个二维码，或直接输入上面的代码。',
  qrAlt: '加入房间的二维码',
  copyLinkButton: '复制链接',
  copiedToast: '链接已复制',

  settingsHeading: '这一轮的设置',

  sizeLabel: '宾果卡尺寸',
  sizeHint: '3×3 适合 5～8 人或想快点结束；5×5 适合人多、时间充裕。',
  sizeOption: '{size}×{size}',

  targetLinesLabel: '获胜线条数',
  targetLinesUnit: '{n} 条',
  targetLinesHint: '{size}×{size} 一共有 {total} 条线，最少要打勾 {cells} 格才连得到 {n} 条。',

  hostPlaysLabel: '主持人也一起玩',
  hostPlaysHint: '关掉的话你只负责控场，不会拿到宾果卡。但你还在名单上，别人一样可以找你配对、请你确认。',
  winnerCountLabel: '几个人达标就结束',
  winnerCountUnit: '{n} 人',
  winnerCountUnlimited: '不限',
  winnerCountHint: '达到这个人数就自动结束，跳到最终排行榜。主持人也可以随时点「结束这轮」。',
  selfClaimLabel: '允许「找不到人，自行认定」',
  selfClaimHint: '找不到符合的人时可以自己打勾，榜上会标成不同颜色。2～4 人的场合建议开。',

  anchorHeading: '保底题（固定放正中央）',
  anchorHint:
    '这一格同时卡在 4 条线上，是中心的位置，所以建议放一道「在场每一位玩家都找得到人」的题目。',
  anchorCustomLabel: '自定义题目',
  anchorCustomPlaceholder: '例如：今天有来聚会的人',

  questionsHeading: '出题',
  questionsCount: '已选 {n} / {total} 题',
  questionsNeedMore: '还差 {n} 题',
  questionsTooMany: '多了 {n} 题',
  questionsReady: '题数刚好，可以开始了',
  selectedHeading: '已选题目',
  setupDoneButton: '创建房间',
  saveSettingsButton: '完成',
  editSettingsButton: '自定义设置',
  settingsSummary: '{size}×{size}、连成 {n} 条线获胜、{total} 题',
  randomButton: '随机',
  clearButton: '清空',
  categorySelectAll: '全选',

  customLabel: '自己出题',
  customPlaceholder: '例如：会自己做奶茶的人',
  customAddButton: '加入',
  customRemoveLabel: '移除这题',

  categoryLife: '生活习惯',
  categoryTalent: '才艺特长',
  categoryExperience: '经历',
  categoryChurch: '小组生活',
  categoryPersonality: '性格',
  categoryFood: '饮食',
  categoryHobby: '兴趣',

  playersHeading: '在房间里的人',
  playersCount: '{n} / {total} 人',
  waitingForHost: '等主持人开始，先确认一下你的名字大家认得出来。',
  hostBadge: '主持人',
  spectatorBadge: '旁观',
  offlineBadge: '离线',
  kickLabel: '移出房间',

  startButton: '开始游戏',
  startBlockedQuestions: '题库还没填满，不能开始',
  startBlockedAnchor: '还没设置保底题',
  startBlockedPlayers: '至少要两个人才能开始',

  cardHint: '对照题目，去认识符合描述的朋友吧！',
  progressHeading: '已连成 {done} / {target} 条线',
  progressCells: '打勾 {n} 格',
  progressWon: '你已经达标了，继续挑战全满贯吧',
  blackoutBadge: '全满贯',
  wonBadge: '获胜',

  cellPending: '确认中',
  cellSelf: '自行认定',
  cellWaiting: '等 {name} 确认',
  cellDone: '{name} 确认了',

  pickHint: '选出刚刚跟你聊过、符合这一格的人。发出后要等对方在他自己的手机上按确认。',
  pickEmpty: '房间里还没有别人。',
  pickCancel: '取消',
  selfClaimButton: '找不到人，自行认定',

  cancelRequestButton: '取消',

  incomingHeading: '待你确认',
  incomingEmpty: '目前没有人需要你确认。',
  incomingLine: '{name} 选了你',
  confirmButton: '确认',
  declineButton: '不是',

  leaderboardLines: '{n} 条线',
  leaderboardCells: '{n} 格',
  leaderboardWaiting: '{n} 人在等你确认',

  screenCard: '我的卡片',
  boardHeading: '排行榜',
  listHeading: '题目',
  pickPendingBadge: '待确认',
  screenRequests: '待你确认',

  endButton: '结束这轮',
  endedHeading: '排行榜',
  endedDesc: '这一轮已结束，快来看看自己有没有上榜吧！',
  resetButton: '回到房间',

  leaveRoomButton: '离开房间',
  closeRoomButton: '关闭房间',
  confirmLeaveTitle: '要离开房间吗？',
  confirmLeaveDesc: '离开后你的卡片与进度会从这一轮移除。',
  confirmLeaveOk: '离开',
  confirmCloseTitle: '要关闭房间吗？',
  confirmCloseDesc: '所有人都会被请出房间，这一轮的结果不会留下来。',
  confirmCloseOk: '关闭房间',
  confirmEndTitle: '要结束这轮吗？',
  confirmEndDesc: '结束之后大家就不能再配对了，画面会切到最终排行榜。',
  confirmEndOk: '结束',


  toastConfirmed: '{name} 确认了，打勾！',
  toastDeclined: '{name} 觉得不太符合，再找别人吧',
  toastLine: '连成 {n} 条线了',
  toastWon: '达标！你连成 {n} 条线',

  errorTitle: '进不去这个房间',
  errRoomNotFound: '找不到这个房间，代码再确认一下。',
  errRoomFull: '房间人数已满。',
  errRoomStarted: '这一轮已经开始了。',
  errNicknameRequired: '请先填名字。',
  errNicknameTaken: '这个名字已经有人用了，换一个吧。',
  errCannotPickSelf: '不能选自己。',
  errAlreadyMarked: '这一格已经打勾了。',
  errAlreadyPending: '这一格已经在等待确认了。',
  errSelfClaimDisabled: '主持人没有开放自行认定。',
  errSpectatorOnly: '你是中途加入的，这一轮没有卡片，但可以帮别人按确认。',
  errQuestionCount: '题数跟格数对不上。',
  errAnchorRequired: '还没设置保底题。',
  errNoPlayers: '房间里还没有人。',
  errNetwork: '连接断了，正在重新连上⋯⋯',

  mcHeading: '你这一轮只负责控场',
  mcDesc: '你关掉了「主持人也一起玩」，所以没有自己的卡。别人还是可以找你配对，你也可以帮他们按确认；想一起玩就回大厅点「自定义设置」打开它，下一轮就会发卡。',
  spectatorHeading: '你是中途加入的',
  spectatorDesc:
    '这一轮的题库与卡片在开始时就锁定了，所以你没有自己的卡。但你在名单上，别人可以找你配对，你也可以帮他们按确认。下一轮就会发卡给你。',

  rulesTitle: '幸福宾果玩法',
  rulesIntro: '一场大概 10～20 分钟，看尺寸与获胜条件。以下是主持人与玩家各自要知道的事。',
  rulesHostHeading: '主持人',
  rulesHostSteps: [
    '决定宾果卡尺寸：3×3 适合 5～8 人或短时段，5×5 适合人多、时间充裕，4×4 介于中间。',
    '3×3 与 5×5 要写一道保底题放正中央。标准是「在场每一位玩家都找得到符合的人」，最保险的是「今天有来聚会的人」。4×4 没有这一格。',
    '把题库填满（3×3 是 9 题、4×4 是 16 题、5×5 是 25 题），并把「没有人符合」和「只有一个人符合」的题目换掉。',
    '设定要连成几条线才算获胜。人少或时间短就选少一点。',
    '人少的场合记得打开「允许自行认定」，不然找不到人的格子会卡住。',
    '开场花一分钟讲清楚：对方要亲自按确认才算数、连到指定条数先上榜但游戏会继续、名次只是助兴。',
  ],
  rulesPlayerHeading: '玩家',
  rulesPlayerSteps: [
    '输入名字加入房间，等主持人开始。',
    '拿到卡之后先看一遍题目。大家的题目内容一样，但排列顺序每个人都不同。',
    '挑一格你觉得找得到人的，去现场找符合的人聊两句。',
    '回到手机点那一格，从名单选出刚刚聊天的人，发出配对请求。',
    '等对方按确认才会打勾。对方没反应可以取消，按婉拒就再找别人。',
    '别人找你确认时，看清楚描述再按——确认之后没办法反悔。',
  ],
  rulesFaqHeading: '常见问题',
  rulesFaq: [
    {
      q: '每个人的宾果卡都一样吗？',
      a: '题目内容一样，全场共用同一份题库；排列顺序每个人都不同，所以你的第 3 格跟旁边的人不会是同一题。3×3 和 5×5 的正中央例外，那是所有人共同的保底题。',
    },
    {
      q: '可以一直找同一个人吗？',
      a: '可以，完全不设限。这也是为什么两个人就玩得起来。人多的时候，题目本身自然会把你推向不同的人。',
    },
    {
      q: '连成一线就赢了吗？游戏会停吗？',
      a: '获胜条件是主持人设定的条数，不一定是一条。而且就算有人达标，游戏也不会停，会一直进行到主持人手动结束，达标的人可以继续挑战全满贯。',
    },
    {
      q: '对方按确认之后可以反悔吗？',
      a: '不行。确认一按下去就立刻生效，所以按之前看清楚描述。婉拒没有这个问题，那发生在打勾之前。',
    },
    {
      q: '迟到的人可以加入吗？',
      a: '可以加入名单，但这一轮拿不到卡（题库在开始时就锁定了）。他可以被别人选来配对、也可以帮忙按确认，下一轮就会发卡。',
    },
  ],
};
