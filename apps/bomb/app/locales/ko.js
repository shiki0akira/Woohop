/*
 * 한국어. 키 목록은 zh-TW와 정확히 같아야 합니다(scripts/build.js의 checkStrings).
 * {n} {m} {s} {time}은 자리표시자이므로 그대로 두세요.
 */
export default {
  htmlLang: 'ko',
  ogLocale: 'ko_KR',

  seoTitle: '시한폭탄｜휴대폰 하나를 돌리는 아이스브레이킹, 터질 때 들고 있으면 지는 게임',
  seoDesc:
    '소그룹 모임, 청년부, 가족 모임을 위한 아이스브레이킹 게임. 휴대폰 한 대가 곧 폭탄입니다. 화면에 나온 미션을 그 자리에서 하고 「완료」를 누른 뒤 옆 사람에게 넘기세요. 언제 터질지는 아무도 모릅니다. 터질 때 들고 있던 사람이 그 판의 패자입니다. 질문과 액션 미션 90개 기본 수록, 우리만의 미션도 추가할 수 있습니다. 설치도 가입도 필요 없이 페이지만 열면 됩니다.',
  rulesSeoTitle: '시한폭탄 — 게임 방법',
  rulesSeoDesc:
    '폭발 시간 설정, 미션 분류 고르기, 직접 미션 추가하기, 그리고 시작 전에 말해 둘 세 가지.',

  navTitle: '시한폭탄',
  navRules: '게임 방법',
  rulesLinkText: '처음이신가요? 시작하는 법 →',
  langSwitchLabel: '언어 바꾸기',
  themeToggleLabel: '밝게／어둡게 바꾸기',

  heroTitle: '시한폭탄: 미션을 끝냈으면 얼른 옆으로',
  heroDesc:
    '전체를 통틀어 휴대폰은 딱 한 대, 그게 바로 폭탄입니다. 미션이 뜨면 들고 있는 사람이 그 자리에서 하고 「완료」를 누른 뒤 옆 사람에게 넘깁니다. 언제 터질지는 아무도 모르고, 터질 때 들고 있던 사람이 그 판의 패자입니다.',

  // ---------- 설정 화면 ----------
  timerHeading: '폭발까지의 시간',
  timerHint: '실제 폭발은 이 범위 안의 무작위한 순간에 일어납니다. 남은 시간은 화면에 전혀 나오지 않습니다.',
  minTimeLabel: '최소',
  maxTimeLabel: '최대',
  timerCustomToggle: '직접 설정',
  secondsUnit: '{n}초',
  minutesUnit: '{n}분',
  timeRange: '{min}~{max}',

  questionsHeading: '미션',
  deckCount: '덱 {n}개',
  groupAsk: '질문',
  groupDare: '액션',
  catCount: '{n}개',

  deckEmptyWarning: '분류를 하나 이상 골라야 시작할 수 있습니다.',
  deckThinWarning: '덱에 {n}개뿐이라 한 판 안에서 같은 미션이 다시 나올 수 있습니다.',

  customLabel: '내가 만든 미션',
  customPlaceholder: '예: 좋아하는 음식을 말해 보세요',
  customCategoryLabel: '넣을 분류',
  customAddButton: '추가',
  customDoneButton: '완료',
  customEmpty: '아직 직접 만든 미션이 없습니다.',
  customRemoveLabel: '이 미션 삭제',
  customHint: '직접 만든 미션은 이 기기에 남아서 다음에 열어도 그대로 있습니다.',

  startButton: '시작',

  // ---------- 진행 중 ----------
  passButton: '완료! 다음 사람에게',
  skipButton: '다른 미션',
  playHint: '화면에 뜬 미션을 하고 「완료」를 누른 뒤, 휴대폰을 넘기세요.',
  stuckHint: '막혔나요? 「다른 미션」을 눌러 넘어가세요. 폭탄을 붙잡고 있지 마세요.',
  bombAlt: '폭탄',

  // ---------- 폭발 ----------
  boomTitle: '펑!',
  boomStats: '이번 판은 {time} 동안, {done}개 완료',
  boomStatsWithSkips: '이번 판은 {time} 동안, {done}개 완료, {skipped}개 건너뜀',
  durationMinSec: '{m}분 {s}초',
  durationSec: '{s}초',
  againButton: '한 판 더',
  backToSetupButton: '설정 바꾸기',

  // ---------- 도중에 나갈 때 ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: '설정',
  gameBack: '뒤로',
  leaveTitle: '이 판을 끝낼까요?',
  leaveDesc: '폭탄이 아직 돌아가고 있습니다. 지금 나가면 이 판은 사라집니다.',
  leaveConfirm: '이 판 끝내기',
  leaveCancel: '계속하기',

  // ---------- 게임 방법 페이지 ----------
  rulesTitle: '시한폭탄 게임 방법',
  rulesIntro: "휴대폰 한 대를 돌려 가며 합니다. 미션이 나오면 바로 하고 옆으로 넘기세요. 폭탄이 언제 터질지는 아무도 모르고, 그때 들고 있던 사람이 집니다.",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["인원","4~15명"],["시간","한 판 1~3분, 몇 판 하면 약 10분"],["준비물","휴대폰 한 대, 둥글게 앉기"]],
  rulesHowHeading: "게임 방법",
  rulesHowSteps: [
    "미션 고르기: 질문형, 행동형, 또는 둘 다.",
    "「시작」을 누르고 첫 번째 사람에게 휴대폰을 건네요.",
    "미션을 읽고 바로 한 뒤 「완료」를 누르고 옆으로 넘겨요.",
    "폭탄이 터질 때 휴대폰을 든 사람이 이번 판의 패자예요.",
  ],
  rulesLeadHeading: "진행 요령",
  rulesLeadSteps: [
    "시작할 때 한마디면 충분해요: 「화면에 나온 걸 하고 넘기세요. 터질 때 들고 있으면 져요.」",
    "첫 판은 기본값 1~3분으로, 분위기가 오르면 짧게 바꿔요.",
    "처음 만난 사람이 많으면 질문형만으로 시작하고 행동형은 나중에 더해요.",
    "누가 멈칫하면 「다음!」 하고 외쳐서 흐름을 이어 가요.",
  ],
  rulesBack: '← 게임으로 돌아가기',
};
