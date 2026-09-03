/*
 * 한국어. 교회 소그룹·환영 모임에서 쓰는 상황을 전제로 한 문구.
 * UI 는 해요체, 규칙 페이지의 단계는 짧게 끊어서 읽기 쉽게.
 */
export default {
  htmlLang: 'ko',
  ogLocale: 'ko_KR',

  seoTitle: '해피 빙고｜숫자가 아니라 사람을 찾는 아이스브레이킹 빙고',
  seoDesc:
    '소그룹, 청년부, 환영 모임에서 쓰는 아이스브레이킹 게임. 빙고 칸에 숫자 대신 "악기를 다룰 줄 아는 사람" 같은 설명이 들어 있어요. 해당하는 사람을 찾아 본인 휴대폰에서 확인을 받으면 칸이 채워집니다. 설치도 가입도 필요 없고, 두 명만 있어도 됩니다.',
  rulesSeoTitle: '해피 빙고 — 게임 방법',
  rulesSeoDesc:
    '방 만들기, 빙고 카드 설정, 짝 찾기와 확인이 어떻게 이뤄지는지, 그리고 진행자가 시작 전에 말해줄 것들.',

  navTitle: '해피 빙고',
  navRules: '게임 방법',
  rulesLinkText: '처음이신가요? 시작하는 법 보기 →',
  langSwitchLabel: '언어 변경',
  themeToggleLabel: '밝게／어둡게 전환',

  heroTitle: '해피 빙고: 사람을 찾고, 잠깐 이야기하고, 칸을 채우기',
  heroDesc:
    '한 사람당 빙고 카드 한 장씩. 칸에 들어 있는 건 숫자가 아니라 "올해 처음 소그룹에 온 사람" 같은 설명이에요. 해당하는 사람을 찾으면 그 사람이 자기 휴대폰에서 확인해야 칸이 채워집니다. 진행자가 정한 줄 수만큼 완성하면 성공.',

  createHeading: '방 만들기',
  maxPlayersLabel: '예상 인원',
  maxPlayersHint: '2~30명, 본인 포함. 두 명만 있어도 할 수 있어요.',
  createButton: '방 만들기',
  creating: '만드는 중…',
  createFailed: '방을 만들지 못했어요. 다시 시도해 주세요.',

  joinHeading: '기존 방에 들어가기',
  roomCodeLabel: '방 코드',
  roomCodePlaceholder: '예: A3KP',
  nicknameLabel: '이름',
  nicknamePlaceholder: '다들 알아볼 수 있는 이름',
  avatarLabel: '아바타 고르기',
  joinButton: '들어가기',

  joinTitle: '{code} 방 들어가기',
  profileContinue: '방에 들어가기',
  playerBadge: '참가자',
  cancelButton: '취소',
  backHome: '처음으로',
  rulesBack: '← 게임으로 돌아가기',
  roomClosedTitle: '방이 닫혔어요',
  roomClosedDesc: '진행자가 이 방을 닫았어요.',
  kickedTitle: '방에서 나왔어요',
  kickedDesc: '진행자가 회원님을 이 방에서 내보냈어요.',

  roomCodeCaption: '방 코드',
  shareHint: '이 QR 코드를 찍거나, 위의 코드를 직접 입력하세요.',
  qrAlt: '방에 들어가는 QR 코드',
  copyLinkButton: '링크 복사',
  copiedToast: '링크를 복사했어요',

  settingsHeading: '이번 판 설정',

  sizeLabel: '카드 크기',
  sizeHint: '3×3은 5~8명이거나 시간이 짧을 때, 5×5는 인원이 많고 시간 여유가 있을 때 좋아요.',
  sizeOption: '{size}×{size}',

  targetLinesLabel: '이기는 데 필요한 줄 수',
  targetLinesUnit: '{n}줄',
  targetLinesHint:
    '{size}×{size}에는 줄이 모두 {total}개 있고, {n}줄을 만들려면 최소 {cells}칸을 채워야 해요.',

  hostPlaysLabel: '진행자도 같이 하기',
  hostPlaysHint: '끄면 진행만 맡고 카드는 받지 않아요. 명단에는 남아 있어서 다른 사람이 회원님을 고르고 확인을 부탁할 수 있어요.',
  winnerCountLabel: '몇 명이 달성하면 끝낼까요',
  winnerCountUnit: '{n}명',
  winnerCountUnlimited: '제한 없음',
  winnerCountHint: '이 인원이 목표에 도달하면 자동으로 끝나고 최종 순위로 넘어가요. 진행자가 언제든 "이번 판 끝내기"를 눌러도 됩니다.',
  selfClaimLabel: '"해당하는 사람 없음, 직접 인정" 허용',
  selfClaimHint: '해당하는 사람을 못 찾으면 스스로 칸을 채울 수 있어요. 순위표에는 다른 색으로 표시됩니다. 2~4명일 때 켜두면 좋아요.',

  anchorHeading: '가운데 고정 칸',
  anchorHint:
    '이 칸은 줄 4개에 동시에 걸리는 한가운데 자리예요. "여기 있는 모든 사람이 반드시 누군가를 찾을 수 있는" 문항을 넣어 주세요.',
  anchorCustomLabel: '직접 쓰기',
  anchorCustomPlaceholder: '예: 오늘 모임에 온 사람',

  questionsHeading: '문항 고르기',
  questionsCount: '{total}개 중 {n}개 선택',
  questionsNeedMore: '{n}개 더 필요해요',
  questionsTooMany: '{n}개 많아요',
  questionsReady: '개수가 딱 맞아요. 시작할 수 있어요',
  selectedHeading: '고른 문항',
  setupDoneButton: '방 만들기',
  saveSettingsButton: '완료',
  editSettingsButton: '설정 직접 하기',
  settingsSummary: '{size}×{size} · {n}줄이면 승리 · {total}개 문항',
  randomButton: '무작위',
  clearButton: '비우기',
  categorySelectAll: '전체 선택',

  customLabel: '직접 문항 만들기',
  customPlaceholder: '예: 버블티를 직접 만들 줄 아는 사람',
  customAddButton: '추가',
  customRemoveLabel: '이 문항 삭제',

  categoryLife: '생활 습관',
  categoryTalent: '특기',
  categoryExperience: '경험',
  categoryChurch: '소그룹 생활',
  categoryPersonality: '성격',
  categoryFood: '먹는 것',
  categoryHobby: '취미',

  playersHeading: '방에 있는 사람',
  playersCount: '{total}명 중 {n}명',
  waitingForHost: '진행자가 시작하기를 기다리는 중이에요. 이름을 다들 알아볼 수 있는지 확인해 두세요.',
  hostBadge: '진행자',
  spectatorBadge: '관전',
  offlineBadge: '오프라인',
  kickLabel: '방에서 내보내기',

  startButton: '게임 시작',
  startBlockedQuestions: '문항이 아직 다 채워지지 않았어요',
  startBlockedAnchor: '가운데 칸 문항이 아직 없어요',
  startBlockedPlayers: '시작하려면 최소 두 명이 필요해요',

  cardHint: '문항에 맞는 사람을 찾아, 직접 말을 걸어 보세요!',
  progressHeading: '{target}줄 중 {done}줄',
  progressCells: '{n}칸 채움',
  progressWon: '목표를 채웠어요. 이제 전체 칸을 노려 보세요',
  blackoutBadge: '전체 완성',
  wonBadge: '달성',

  cellPending: '확인 대기',
  cellSelf: '직접 인정',
  cellWaiting: '{name}의 확인 대기 중',
  cellDone: '{name}이(가) 확인함',

  pickHint:
    '방금 이야기한 사람 중에서 이 칸에 해당하는 사람을 고르세요. 보낸 뒤에는 상대가 자기 휴대폰에서 확인해야 해요.',
  pickEmpty: '아직 방에 다른 사람이 없어요.',
  pickCancel: '취소',
  selfClaimButton: '해당하는 사람 없음, 직접 인정',

  cancelRequestButton: '취소',

  incomingHeading: '확인해 주세요',
  incomingEmpty: '지금은 확인을 기다리는 사람이 없어요.',
  incomingLine: '{name}이(가) 회원님을 골랐어요',
  confirmButton: '확인',
  declineButton: '아니에요',

  leaderboardLines: '{n}줄',
  leaderboardCells: '{n}칸',
  leaderboardWaiting: '{n}명이 기다리는 중',

  screenCard: '내 카드',
  boardHeading: '순위',
  listHeading: '문항',
  pickPendingBadge: '확인 대기',
  screenRequests: '확인해 주세요',

  endButton: '이번 판 끝내기',
  endedHeading: '순위',
  endedDesc: '이번 판이 끝났어요. 순위에 올랐는지 확인해 보세요!',
  resetButton: '방으로 돌아가기',

  leaveRoomButton: '방 나가기',
  closeRoomButton: '방 닫기',
  confirmLeaveTitle: '방에서 나갈까요?',
  confirmLeaveDesc: '나가면 회원님의 카드와 진행 상황이 이번 판에서 사라져요.',
  confirmLeaveOk: '나가기',
  confirmCloseTitle: '방을 닫을까요?',
  confirmCloseDesc: '모두 방에서 나가게 되고, 이번 판 결과는 남지 않아요.',
  confirmCloseOk: '방 닫기',
  confirmEndTitle: '이번 판을 끝낼까요?',
  confirmEndDesc: '끝내면 더 이상 짝을 찾을 수 없고, 최종 순위 화면으로 넘어가요.',
  confirmEndOk: '끝내기',


  toastConfirmed: '{name}이(가) 확인했어요. 칸 완성!',
  toastDeclined: '{name}은(는) 해당하지 않는다고 해요. 다른 사람을 찾아보세요',
  toastLine: '{n}줄 완성',
  toastWon: '목표 달성! {n}줄 완성',

  errorTitle: '이 방에 들어갈 수 없어요',
  errRoomNotFound: '그 코드의 방을 찾을 수 없어요. 다시 확인해 주세요.',
  errRoomFull: '방이 꽉 찼어요.',
  errRoomStarted: '이번 판은 이미 시작됐어요.',
  errNicknameRequired: '이름을 먼저 입력해 주세요.',
  errNicknameTaken: '이미 쓰고 있는 이름이에요. 다른 이름으로 해주세요.',
  errCannotPickSelf: '자신은 고를 수 없어요.',
  errAlreadyMarked: '이미 채워진 칸이에요.',
  errAlreadyPending: '이미 확인을 기다리는 칸이에요.',
  errSelfClaimDisabled: '진행자가 직접 인정을 허용하지 않았어요.',
  errSpectatorOnly:
    '중간에 들어와서 이번 판에는 카드가 없어요. 대신 다른 사람의 확인은 해줄 수 있어요.',
  errQuestionCount: '문항 수와 칸 수가 맞지 않아요.',
  errAnchorRequired: '가운데 칸 문항이 아직 없어요.',
  errNoPlayers: '방에 아직 아무도 없어요.',
  errNetwork: '연결이 끊겼어요. 다시 연결하는 중…',

  mcHeading: '이번 판은 진행만 맡았어요',
  mcDesc:
    '"진행자도 같이 하기"를 꺼서 카드가 없어요. 다른 사람이 회원님을 고를 수 있고, 확인도 해줄 수 있어요. 같이 하고 싶으면 대기실에서 "설정 직접 하기"로 다시 켜면 다음 판부터 카드를 받아요.',
  spectatorHeading: '중간에 들어왔어요',
  spectatorDesc:
    '이번 판의 문항과 카드는 시작할 때 확정돼서 회원님 카드는 없어요. 명단에는 있으니 다른 사람이 회원님을 고를 수 있고, 확인도 해줄 수 있어요. 다음 판에는 카드를 받습니다.',

  rulesTitle: '해피 빙고 게임 방법',
  rulesIntro:
    '한 판은 카드 크기와 승리 조건에 따라 10~20분쯤 걸려요. 진행자와 참가자가 각각 알아둘 것들입니다.',
  rulesHostHeading: '진행자',
  rulesHostSteps: [
    '카드 크기를 정하세요. 3×3은 5~8명이거나 시간이 짧을 때, 5×5는 인원이 많고 시간이 넉넉할 때, 4×4는 그 중간입니다.',
    '3×3과 5×5는 가운데 칸 문항을 준비하세요. 기준은 "여기 있는 모든 사람이 반드시 누군가를 찾을 수 있을 것". 가장 안전한 건 "오늘 모임에 온 사람"입니다. 4×4에는 이 칸이 없어요.',
    '문항을 필요한 수만큼 채우세요(3×3은 9개, 4×4는 16개, 5×5는 25개). "아무도 해당하지 않는" 문항과 "한 사람만 해당하는" 문항은 바꿔 주세요.',
    '몇 줄을 만들어야 이기는지 정하세요. 인원이 적거나 시간이 짧으면 적게 잡으세요.',
    '인원이 적을 때는 직접 인정을 켜 두세요. 안 그러면 해당자가 없는 칸에서 막힙니다.',
    '시작할 때 1분만 써서 세 가지를 짚어 주세요. 상대 본인이 확인해야 인정된다는 것, 목표에 도달해도 게임은 계속된다는 것, 순위는 재미로 보는 것이라는 것.',
  ],
  rulesPlayerHeading: '참가자',
  rulesPlayerSteps: [
    '이름을 넣고 들어간 다음, 진행자가 시작하기를 기다리세요.',
    '카드를 받으면 문항을 한 번 훑어보세요. 문항 내용은 모두 같지만 순서는 사람마다 다릅니다.',
    '찾을 수 있을 것 같은 칸을 골라, 해당하는 사람에게 말을 걸어 보세요.',
    '휴대폰으로 돌아와 그 칸을 누르고, 방금 이야기한 사람을 명단에서 골라 보내세요.',
    '상대가 확인해야 칸이 채워져요. 답이 없으면 취소할 수 있고, 거절당하면 다른 사람을 찾으면 됩니다.',
    '확인을 부탁받으면 설명을 읽고 누르세요. 확인은 되돌릴 수 없어요.',
  ],
  rulesFaqHeading: '자주 묻는 질문',
  rulesFaq: [
    {
      q: '모두 같은 카드인가요?',
      a: '문항 내용은 같아요. 모두 같은 문항 묶음을 씁니다. 다만 순서가 사람마다 달라서, 내 세 번째 칸과 옆 사람의 세 번째 칸은 다른 문항이에요. 3×3과 5×5의 한가운데만 예외로, 모두에게 같은 문항이 들어갑니다.',
    },
    {
      q: '같은 사람을 계속 골라도 되나요?',
      a: '네, 제한이 없어요. 그래서 두 명만 있어도 할 수 있습니다. 인원이 많으면 문항 자체가 자연스럽게 여러 사람 쪽으로 이끌어 줘요.',
    },
    {
      q: '한 줄 만들면 이기나요? 게임이 멈추나요?',
      a: '승리 조건은 진행자가 정한 줄 수라서 꼭 한 줄은 아니에요. 그리고 누가 달성해도 게임은 멈추지 않고 진행자가 끝낼 때까지 이어집니다. 달성한 사람은 전체 칸 완성을 노릴 수 있어요.',
    },
    {
      q: '확인한 다음에 되돌릴 수 있나요?',
      a: '아니요. 누르는 순간 바로 반영되니 설명을 먼저 읽어 주세요. 거절은 다릅니다. 칸이 채워지기 전의 일이에요.',
    },
    {
      q: '늦게 온 사람도 들어올 수 있나요?',
      a: '명단에는 들어올 수 있지만 그 판의 카드는 없어요(문항이 시작할 때 확정되기 때문입니다). 다른 사람이 고를 수 있고 확인도 해줄 수 있으며, 다음 판에는 카드를 받습니다.',
    },
  ],
};
