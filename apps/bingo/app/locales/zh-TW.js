/*
 * 繁體中文，其他語言的對照基準（DEFAULT_LANG）。
 * 這裡有的 key，每個語言都要有；這裡沒有的，別的語言也不能多。
 *
 * {name} {n} {total} {size} 這種大括號是佔位符，翻譯時要原樣保留。
 */
export default {
  htmlLang: 'zh-Hant-TW',
  ogLocale: 'zh_TW',

  seoTitle: '幸福賓果｜找人配對的破冰賓果卡，小組聚會用手機就能玩',
  seoDesc:
    '幸福小組、團契、迎新聚會的破冰遊戲。每個人拿到一張賓果卡，格子裡是「會彈奏樂器的人」這種描述，到現場找到符合的人、對方確認後就打勾，連成指定條數就獲勝。免下載、免註冊，掃 QR code 就能玩，兩個人也玩得起來。',
  rulesSeoTitle: '幸福賓果 — 玩法說明',
  rulesSeoDesc: '房間怎麼開、賓果卡怎麼設定、配對與確認的流程，還有主持人開場要講的幾件事。',

  navTitle: '幸福賓果',
  navRules: '玩法',
  rulesLinkText: '第一次玩？看看怎麼開始 →',
  langSwitchLabel: '切換語言',
  themeToggleLabel: '切換深淺色',

  heroTitle: '幸福賓果：找到人、聊兩句、打個勾',
  heroDesc:
    '每個人一張賓果卡，格子裡不是數字，是「今年第一次來小組的人」這種描述。到現場找到符合的人，對方在自己手機上按確認才算數。連成主持人指定的條數就獲勝。',

  createHeading: '建立房間',
  maxPlayersLabel: '預計人數',
  maxPlayersHint: '2～30 人，含你自己。兩個人就玩得起來。',
  createButton: '建立房間',
  creating: '建立中…',
  createFailed: '建立房間失敗，再試一次。',

  joinHeading: '加入現有房間',
  roomCodeLabel: '房間代碼',
  roomCodePlaceholder: '例如 A3KP',
  nicknameLabel: '你的名字',
  nicknamePlaceholder: '大家認得出來的稱呼',
  avatarLabel: '選一個頭像',
  joinButton: '加入',

  joinTitle: '加入 {code}',
  profileContinue: '進入房間',
  playerBadge: '玩家',
  cancelButton: '取消',
  backHome: '回首頁',
  rulesBack: '← 回到遊戲',
  roomClosedTitle: '房間已關閉',
  roomClosedDesc: '主持人把這個房間關掉了。',
  kickedTitle: '你已離開房間',
  kickedDesc: '主持人把你移出了這個房間。',

  roomCodeCaption: '房間代碼',
  shareHint: '請大家掃這個 QR code，或直接輸入上面的代碼。',
  qrAlt: '加入房間的 QR code',
  copyLinkButton: '複製連結',
  copiedToast: '連結已複製',

  settingsHeading: '這一輪的設定',

  sizeLabel: '賓果卡尺寸',
  sizeHint: '3×3 適合 5～8 人或想快點結束；5×5 適合人多、時間充裕。',
  sizeOption: '{size}×{size}',

  targetLinesLabel: '獲勝線條數',
  targetLinesUnit: '{n} 條',
  targetLinesHint: '{size}×{size} 總共有 {total} 條線，最少要打勾 {cells} 格才連得到 {n} 條。',

  hostPlaysLabel: '主持人也一起玩',
  hostPlaysHint: '關掉的話你只負責控場，不會拿到賓果卡。但你還在名單上，別人一樣可以找你配對、請你確認。',
  winnerCountLabel: '幾個人達標就結束',
  winnerCountUnit: '{n} 人',
  winnerCountUnlimited: '不限',
  winnerCountHint: '達到此人數就自動結束跳到最終排行榜。或是主持人可以隨時點選「結束這輪」。',
  selfClaimLabel: '允許「找不到人，自行認定」',
  selfClaimHint: '找不到符合的人時可以自己打勾，榜上會標成不同顏色。2～4 人的場合建議開。',

  anchorHeading: '保底題（固定放正中央）',
  anchorHint:
    '這一格同時卡在 4 條線上，是中心的位置，所以建議放一道「在場每一位玩家都找得到人」的題目。',
  anchorCustomLabel: '自訂題目',
  anchorCustomPlaceholder: '例如：今天有來聚會的人',

  questionsHeading: '出題',
  questionsCount: '已選 {n} / {total} 題',
  questionsNeedMore: '還差 {n} 題',
  questionsTooMany: '多了 {n} 題',
  questionsReady: '題數剛好，可以開始了',
  selectedHeading: '已選題目',
  setupDoneButton: '創建房間',
  saveSettingsButton: '完成',
  editSettingsButton: '自訂設定',
  settingsSummary: '{size}×{size}、連成 {n} 條線獲勝、{total} 題',
  randomButton: '隨機',
  clearButton: '清空',
  categorySelectAll: '全選',

  customLabel: '自己出題',
  customPlaceholder: '例如：會做手搖飲的人',
  customAddButton: '加入',
  customRemoveLabel: '移除這題',

  categoryLife: '生活習慣',
  categoryTalent: '才藝專長',
  categoryExperience: '經歷',
  categoryChurch: '小組生活',
  categoryPersonality: '個性',
  categoryFood: '飲食',
  categoryHobby: '興趣',

  playersHeading: '在房間裡的人',
  playersCount: '{n} / {total} 人',
  waitingForHost: '等主持人開始，先確認一下你的名字大家認得出來。',
  hostBadge: '主持人',
  spectatorBadge: '旁觀',
  offlineBadge: '離線',
  kickLabel: '移出房間',

  startButton: '開始遊戲',
  startBlockedQuestions: '題庫還沒填滿，不能開始',
  startBlockedAnchor: '還沒設定保底題',
  startBlockedPlayers: '至少要兩個人才能開始',

  cardHint: '對應題目，去認識符合描述的朋友吧！',
  progressHeading: '已連成 {done} / {target} 條線',
  progressCells: '打勾 {n} 格',
  progressWon: '你已經達標了，繼續挑戰全滿貫吧',
  blackoutBadge: '全滿貫',
  wonBadge: '獲勝',

  cellPending: '確認中',
  cellSelf: '自行認定',
  cellWaiting: '等 {name} 確認',
  cellDone: '{name} 確認了',

  pickHint: '選出剛剛跟你聊過、符合這一格的人。送出後要等對方在他自己的手機上按確認。',
  pickEmpty: '房間裡還沒有別人。',
  pickCancel: '取消',
  selfClaimButton: '找不到人，自行認定',

  cancelRequestButton: '取消',

  incomingHeading: '待你確認',
  incomingEmpty: '目前沒有人需要你確認。',
  incomingLine: '{name} 選了你',
  confirmButton: '確認',
  declineButton: '不是',

  leaderboardLines: '{n} 條線',
  leaderboardCells: '{n} 格',
  leaderboardWaiting: '{n} 人在等你確認',

  screenCard: '我的卡片',
  boardHeading: '排行榜',
  listHeading: '題目',
  pickPendingBadge: '待確認',
  screenRequests: '待你確認',

  endButton: '結束這輪',
  endedHeading: '排行榜',
  endedDesc: '這一輪已結束，快來看看自己有沒有上榜吧！',
  resetButton: '回到房間',

  leaveRoomButton: '離開房間',
  closeRoomButton: '關閉房間',
  confirmLeaveTitle: '要離開房間嗎？',
  confirmLeaveDesc: '離開後你的卡片與進度會從這一輪移除。',
  confirmLeaveOk: '離開',
  confirmCloseTitle: '要關閉房間嗎？',
  confirmCloseDesc: '所有人都會被請出房間，這一輪的結果不會留下來。',
  confirmCloseOk: '關閉房間',
  confirmEndTitle: '要結束這輪嗎？',
  confirmEndDesc: '結束之後大家就不能再配對了，畫面會切到最終排行榜。',
  confirmEndOk: '結束',


  toastConfirmed: '{name} 確認了，打勾！',
  toastDeclined: '{name} 覺得不太符合，再找別人吧',
  toastLine: '連成 {n} 條線了',
  toastWon: '達標！你連成 {n} 條線',

  errorTitle: '進不去這個房間',
  errRoomNotFound: '找不到這個房間，代碼再確認一下。',
  errRoomFull: '房間人數已滿。',
  errRoomStarted: '這一輪已經開始了。',
  errNicknameRequired: '請先填名字。',
  errNicknameTaken: '這個名字已經有人用了，換一個吧。',
  errCannotPickSelf: '不能選自己。',
  errAlreadyMarked: '這一格已經打勾了。',
  errAlreadyPending: '這一格已經在等待確認了。',
  errSelfClaimDisabled: '主持人沒有開放自行認定。',
  errSpectatorOnly: '你是中途加入的，這一輪沒有卡片，但可以幫別人按確認。',
  errQuestionCount: '題數跟格數對不上。',
  errAnchorRequired: '還沒設定保底題。',
  errNoPlayers: '房間裡還沒有人。',
  errNetwork: '連線斷了，正在重新連上⋯⋯',

  mcHeading: '你這一輪只負責控場',
  mcDesc: '你關掉了「主持人也一起玩」，所以沒有自己的卡。別人還是可以找你配對，你也可以幫他們按確認；想一起玩就回大廳按「自訂設定」打開它，下一輪就會發卡。',
  spectatorHeading: '你是中途加入的',
  spectatorDesc:
    '這一輪的題庫與卡片在開始時就鎖定了，所以你沒有自己的卡。但你在名單上，別人可以找你配對，你也可以幫他們按確認。下一輪就會發卡給你。',

  rulesTitle: '幸福賓果玩法',
  rulesIntro: '一場大概 10～20 分鐘，看尺寸與獲勝條件。以下是主持人與玩家各自要知道的事。',
  rulesHostHeading: '主持人',
  rulesHostSteps: [
    '決定賓果卡尺寸：3×3 適合 5～8 人或短時段，5×5 適合人多、時間充裕，4×4 介於中間。',
    '3×3 與 5×5 要寫一道保底題放正中央。標準是「在場每一位玩家都找得到符合的人」，最保險的是「今天有來聚會的人」。4×4 沒有這一格。',
    '把題庫填滿（3×3 是 9 題、4×4 是 16 題、5×5 是 25 題），並把「沒有人符合」和「只有一個人符合」的題目換掉。',
    '設定要連成幾條線才算獲勝。人少或時間短就選少一點。',
    '人少的場合記得打開「允許自行認定」，不然找不到人的格子會卡住。',
    '開場花一分鐘講清楚：對方要親自按確認才算數、連到指定條數先上榜但遊戲會繼續、名次只是助興。',
  ],
  rulesPlayerHeading: '玩家',
  rulesPlayerSteps: [
    '輸入名字加入房間，等主持人開始。',
    '拿到卡之後先看一遍題目。大家的題目內容一樣，但排列順序每個人都不同。',
    '挑一格你覺得找得到人的，去現場找符合的人聊兩句。',
    '回到手機點那一格，從名單選出剛剛聊天的人，送出配對請求。',
    '等對方按確認才會打勾。對方沒反應可以取消，按婉拒就再找別人。',
    '別人找你確認時，看清楚描述再按——確認之後沒辦法反悔。',
  ],
  rulesFaqHeading: '常見問題',
  rulesFaq: [
    {
      q: '每個人的賓果卡都一樣嗎？',
      a: '題目內容一樣，全場共用同一份題庫；排列順序每個人都不同，所以你的第 3 格跟隔壁的人不會是同一題。3×3 和 5×5 的正中央例外，那是所有人共同的保底題。',
    },
    {
      q: '可以一直找同一個人嗎？',
      a: '可以，完全不設限。這也是為什麼兩個人就玩得起來。人多的時候，題目本身自然會把你推向不同的人。',
    },
    {
      q: '連成一線就贏了嗎？遊戲會停嗎？',
      a: '獲勝條件是主持人設定的條數，不一定是一條。而且就算有人達標，遊戲也不會停，會一直進行到主持人手動結束，達標的人可以繼續挑戰全滿貫。',
    },
    {
      q: '對方按確認之後可以反悔嗎？',
      a: '不行。確認一按下去就立刻生效，所以按之前看清楚描述。婉拒沒有這個問題，那發生在打勾之前。',
    },
    {
      q: '遲到的人可以加入嗎？',
      a: '可以加入名單，但這一輪拿不到卡（題庫在開始時就鎖定了）。他可以被別人選來配對、也可以幫忙按確認，下一輪就會發卡。',
    },
  ],
};
