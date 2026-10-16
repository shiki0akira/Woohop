/*
 * English. Key set must match zh-TW exactly (see scripts/build.js checkStrings).
 * {n} {m} {s} {time} are placeholders — keep them as-is.
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Time Bomb | Pass-the-phone icebreaker — whoever holds it when it blows, loses',
  seoDesc:
    'An icebreaker for small groups, youth groups and family gatherings. One phone is the bomb: pass it round the circle, do the task on screen, tap done and hand it on. Nobody knows when it goes off — whoever is holding it loses the round. 90 built-in questions and dares, plus your own. No download, no sign-up, just open the page.',
  rulesSeoTitle: 'Time Bomb — how to play',
  rulesSeoDesc:
    'Setting the fuse, picking which categories to use, adding your own questions, and the three things to say before you start.',

  navTitle: 'Time Bomb',
  navRules: 'How to play',
  rulesLinkText: 'First time? Here is how it works →',
  langSwitchLabel: 'Change language',
  themeToggleLabel: 'Toggle light and dark',

  heroTitle: 'Time Bomb: do the task, pass it on, fast',
  heroDesc:
    'One phone for the whole group — and that phone is the bomb. A task appears, whoever is holding it does it, taps done, and hands it to the next person. Nobody knows when it goes off. Whoever is holding it then loses the round.',

  // ---------- setup ----------
  timerHeading: 'Fuse length',
  timerHint: 'It goes off at a random moment inside this range. The screen never shows how long is left.',
  minTimeLabel: 'At least',
  maxTimeLabel: 'At most',
  timerCustomToggle: 'Custom range',
  secondsUnit: '{n} sec',
  minutesUnit: '{n} min',
  timeRange: '{min}–{max}',

  questionsHeading: 'Tasks',
  deckCount: '{n} in the deck',
  groupAsk: 'Questions',
  groupDare: 'Actions',
  catCount: '{n} tasks',

  deckEmptyWarning: 'Pick at least one category to start.',
  deckThinWarning: 'Only {n} in the deck — tasks may repeat within a single round.',

  customLabel: 'Your own tasks',
  customPlaceholder: 'e.g. Name your favourite food',
  customCategoryLabel: 'Put it under',
  customAddButton: 'Add',
  customDoneButton: 'Done',
  customEmpty: 'You have not added any of your own yet.',
  customRemoveLabel: 'Delete this one',
  customHint: 'Your own tasks stay on this device and will still be here next time.',

  startButton: 'Start',

  // ---------- play ----------
  passButton: 'Done! Pass it on',
  skipButton: 'Another one',
  playHint: 'Do the thing on screen, tap Done, then hand the phone over.',
  stuckHint: 'Stuck? Tap “Another one” and move on — don’t let the bomb stop with you.',
  bombAlt: 'Bomb',

  // ---------- boom ----------
  boomTitle: 'Boom!',
  boomStats: 'This round lasted {time} — {done} done',
  boomStatsWithSkips: 'This round lasted {time} — {done} done, {skipped} skipped',
  durationMinSec: '{m} min {s} sec',
  durationSec: '{s} sec',
  againButton: 'Play again',
  backToSetupButton: 'Change settings',

  // ---------- leaving mid-round ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: 'Settings',
  gameBack: 'Back',
  leaveTitle: 'End this round?',
  leaveDesc: 'The bomb is still ticking. Leave now and this round is gone.',
  leaveConfirm: 'End the round',
  leaveCancel: 'Keep playing',

  // ---------- rules page ----------
  rulesTitle: 'How to play Time Bomb',
  rulesIntro: "One phone goes around the circle. A task appears, you do it, you pass it on. Nobody knows when the bomb goes off; whoever is holding it loses.",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["Players","4–15"],["Time","1–3 min per round, about 10 min for a few rounds"],["You need","One phone and a circle of people"]],
  rulesHowHeading: "How to play",
  rulesHowSteps: [
    "Pick the tasks: questions, actions, or both.",
    "Tap “Start” and hand the phone to the first player.",
    "Read the task, do it, tap “Done” and pass the phone on.",
    "When the bomb goes off, whoever is holding the phone loses the round.",
  ],
  rulesLeadHeading: "How to lead it",
  rulesLeadSteps: [
    "Open with one line: “Do what the screen says, then pass it on. Whoever holds it when it blows up loses.”",
    "Keep the default 1–3 minutes for the first round; speed it up once people warm up.",
    "With new people, start with questions only; add actions later.",
    "If someone freezes, call out “Next!” and keep the pace going.",
  ],
  rulesBack: '← Back to the game',
};
