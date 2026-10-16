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
  gameBack: 'Back',
  leaveTitle: 'End this round?',
  leaveDesc: 'The bomb is still ticking. Leave now and this round is gone.',
  leaveConfirm: 'End the round',
  leaveCancel: 'Keep playing',

  // ---------- rules page ----------
  rulesTitle: 'How to play Time Bomb',
  rulesIntro:
    'One phone, everyone in a circle. A task appears, whoever is holding the phone does it and passes it on. The bomb goes off at a random moment and the screen never shows how long is left. Whoever is holding it then loses the round.',
  rulesHostHeading: 'Before you start (whoever has the phone)',
  rulesHostSteps: [
    'Pick Questions, Actions, or both. Lots of new faces? Start with Questions only.',
    'Want your own in-jokes in there? Add a few under “Your own tasks” and file them on one side.',
    'Set the fuse. The default 1–3 minutes is right for a first round; once everyone is warmed up, try 30 seconds to 2 minutes.',
    'Say three things to start: do the thing on screen, tap done and pass it on, whoever holds it when it blows loses the round.',
  ],
  rulesPlayerHeading: 'When the phone reaches you',
  rulesPlayerSteps: [
    'Read the task and do it right there — say a line, make an animal noise, high-five the person opposite.',
    'Tap the bar at the bottom: “Done — pass it on”.',
    'Hand the phone to the next person.',
    'Cannot do it? Just tap done and pass it on. Nobody is keeping score — this is not a quiz.',
  ],
  rulesFaqHeading: 'Questions people ask',
  rulesFaq: [
    {
      q: 'Does everyone need a phone?',
      a: 'No. The whole game runs on one phone — that phone is the bomb and it goes round the circle. This is unlike the other games in the series, where everyone joins a room by scanning a QR code.',
    },
    {
      q: 'Can I see how long is left?',
      a: 'No, not for a second. That is deliberate: if you could see a countdown, nobody would take the phone in the last ten seconds and the game would stall. How fast it ticks does not tell you how close it is either.',
    },
    {
      q: 'Can I skip a task I cannot do?',
      a: 'Yes, just tap done. There is no score and nobody is counting who skipped what.',
    },
    {
      q: 'Can we add our own tasks?',
      a: 'Yes. Open “Your own tasks” on the setup screen and file it under a category — it will still be there next time. They stay on this device and are never uploaded.',
    },
    {
      q: 'Passing a phone around hand to hand feels a bit much.',
      a: 'Put it in a zip bag, or use an old spare phone as the bomb.',
    },
    {
      q: 'What if the screen locks mid-round?',
      a: 'The game keeps the screen awake while it runs. If it does get pushed to the background, the moment you come back it recalculates — and if the fuse ran out while you were away, you land straight on the explosion.',
    },
    {
      q: 'What happens to the loser?',
      a: 'That is up to you — the app does not decide. Everyone in the room saw who was holding it; what happens next is your call.',
    },
  ],
  rulesBack: '← Back to the game',
};
