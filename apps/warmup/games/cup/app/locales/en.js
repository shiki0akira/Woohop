/*
 * English. Name: One Drop Too Many (CONCEPT.md §4 — this game has no established name
 * in any language, so every language gets a phrase locals use for "filled to the brim").
 * {n} placeholders stay as they are.
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'One Drop Too Many | Pass one phone, add water, don’t let it spill',
  seoDesc:
    'An icebreaker you play with a single phone: 2–12 people take turns adding water to the same glass. Tap once to start the tap, tap again to stop, then pass the phone on. The water climbs to the rim and surface tension holds it in a dome — whoever makes it spill loses. Every round picks a different container: wine glass, water glass, narrow-necked bottle, even a clay jug you can only judge by ear. No download, no sign-up.',
  rulesSeoTitle: 'How to play One Drop Too Many: rules and a script for the host',
  rulesSeoDesc: 'How One Drop Too Many works: how many players, how to pick the glass size for your group, how the eight random containers differ, when it counts as a spill, and a few lines the host can read out loud.',

  navTitle: 'One Drop Too Many',
  navRules: 'How to play',
  rulesLinkText: 'Full rules →',
  soundLabel: 'Sound', // one button for the water sound and the music, so not "music" or "effects"

  heroTitle: 'One Drop Too Many: take turns adding water, whoever spills it loses',
  heroDesc: 'One phone goes around the circle. Tap once to start the water, tap again to stop, and that’s your turn — then pass it on. Once surface tension holds the water above the rim, nobody dares to tap. And every round you get a different container.',

  // ---------- Hosting steps ----------
  // [title, read out loud]. No step header while the phone is going round (apps/warmup/CLAUDE.md)
  lead: {
    setup: ['Get started', 'Let’s play “One Drop Too Many”! Everyone in a circle — this phone is going to make its way around all of you.'],
    rules: ['Explain the rules', 'There’s a glass on the phone. On your turn, tap “Add water” once, tap again to stop — one pour each, then pass the phone on. Surface tension will hold the water in a dome above the rim, so it looks like it’s spilling when it isn’t — tiny sips keep you safe for ages, one greedy gulp and you lose on the spot. Every round the container changes, and some of them you can’t see through, so use your ears!'],
    end: ['It spilled!', 'That’s our loser! Pull the truth-or-dare slot, then someone else starts and we fill another one.'],
  },
  // Three illustrated cards on the "explain the rules" step: [title, text]
  ruleCards: [
    ['Add water', 'On your turn tap “Add water”, then tap again to stop. Pour as much as you dare — but you always pour at least a little.'],
    ['Pass it on', 'One pour each. Tap “Pass the phone” and hand it over.'],
    ['Spill and you lose', 'The water bulges above the rim without spilling — that’s surface tension. Whoever makes it spill is the loser. Each round the container is different.'],
  ],
  rulesNext: 'Start the game',

  // ---------- Setup ----------
  startButton: 'Start the game',
  // Glass size: always on screen (picking it to match the group is a step you don’t want skipped)
  advancedLabel: 'Glass size',
  sizeHint: 'Pick it by group size — each one lasts about one or two times round the circle. Up to 12 players; more than that, split into two groups.',
  sizeSmall: 'Small\n2–5 people',
  sizeNormal: 'Medium\n6–9 people',
  sizeLarge: 'Large\n10–12 people',

  // ---------- Pouring ----------
  // One container is drawn at random each round (SHAPES in app.js); keys match the codes there
  shapeNotes: {
    goblet: 'This round: a wine glass. Wide bowl, narrow rim — the closer to the top, the faster the level climbs.',
    glass: 'This round: a tall water glass. Same width all the way up, so the level is the easiest to predict. The fairest one.',
    bottle: 'This round: a narrow-necked bottle. Wide body, thin neck — once the water reaches the neck it shoots up.',
    pot: 'This round: an opaque clay jug. You can’t see the level and the mouth is tiny! Use your ears — the higher the sound, the fuller it is.',
    mug: 'This round: an opaque mug. You can’t see the level, but the mouth is wide, so you’ll spot the water near the top.',
    measure: 'This round: a measuring cup. It has markings — agree on a line nobody should cross and it gets even better.',
    beaker: 'This round: a beaker. Short and wide, so the same amount of water barely raises the level. The most forgiving one.',
    flask: 'This round: an opaque thermos. You can’t see the level and the mouth is narrow — the hardest of the eight.',
  },
  // When an opaque container comes up and the sound is off: nudge, never block
  soundNudge: 'Turn on the note button in the corner — the pitch of the water tells you how full it is.',
  pourTurn: 'Player {n}',
  pourButton: 'Add water',
  pourStopButton: 'Stop',
  pourHint: 'Tap once to start the water, tap again to stop. Pour as much as you dare.',
  // The stretch where the water sits above the rim (CONCEPT.md 2.5)
  tenseHint: 'The water is bulging over the rim… one more drop and it’s gone!',
  passSay: 'Done! Pass the phone to the next person — their turn to pour.',
  drawSay: 'Picking a container…',
  passButton: 'Pass the phone',
  overflowFlash: 'It spilled!',

  // ---------- It spilled ----------
  endTitle: 'It spilled!',
  // Everyone can see who lost, so we only count the pours
  endStats: 'This one held {n} pours',
  endBest: 'Best today: {n}',
  slotHeading: 'Loser pulls: truth or dare?',
  againButton: 'Fill another one',

  // ---------- Leaving confirmation ----------
  leaveTitle: 'Back to the start?',
  leaveDesc: 'This glass gets emptied and the game starts again from empty.',
  leaveConfirm: 'Back to the start',
  leaveCancel: 'Keep playing',

  // ---------- Rules page ----------
  rulesTitle: 'How to play One Drop Too Many',
  rulesIntro: 'One phone goes around the circle: everyone takes turns adding water to the same glass, one pour each, and whoever makes it spill loses.',
  rulesFacts: [
    ['Players', '2–12'],
    ['Time', '2–5 minutes a glass'],
    ['You need', 'One phone (want the real thing? add a clear glass and a jug of water)'],
  ],
  rulesHowHeading: 'How to play',
  rulesHowSteps: [
    'Sit in a circle and give the phone to the first player. Before you start, pick the glass size for your group: small for 2–5, medium for 6–9, large for 10–12.',
    'On your turn, tap “Add water” and the water starts running; tap again to stop. There’s no upper limit — but the moment you touch it, at least a little goes in.',
    'Tap “Pass the phone” and hand it to the person next to you. One pour each, round and round.',
    'Once the water reaches the rim, surface tension holds it in a dome — it looks like it’s spilling, but it isn’t. The view zooms in on the rim, and this is the best part. Tiny sips can keep it going eight or ten more times; hold the tap open and it spills in about a second.',
    'Whoever makes it spill loses. They pull the truth-or-dare slot, then someone else starts and you fill another one.',
  ],
  rulesShapesHeading: 'A different container every round',
  rulesShapesIntro: 'The container is drawn at random from eight, and they feel very different. Three of them are opaque, so you can’t see the level — you can still play with the sound off (the water shows at the mouth once it reaches the rim), but sound gives you an edge: the pitch tells you how full it is before you can see it.',
  rulesShapes: [
    ['Wine glass', 'Wide bowl, narrow rim — the closer to the top, the faster the level climbs.'],
    ['Tall water glass', 'Same width all the way up, so the level rises evenly. The easiest to read and the fairest.'],
    ['Narrow-necked bottle', 'Wide body, thin neck — the water shoots up the moment it reaches the neck. The most nerve-racking stretch of all.'],
    ['Measuring cup', 'It has markings, so it’s the one you can actually calculate. Agree on a line nobody should cross.'],
    ['Beaker', 'Short and wide, so the same amount of water barely raises the level. The most forgiving one.'],
    ['Opaque clay jug', 'You can’t see the level and the mouth is small — you only glimpse the water right at the end.'],
    ['Opaque mug', 'You can’t see the level, but the mouth is wide, so you spot the water early. The easiest of the opaque three.'],
    ['Opaque thermos', 'You can’t see the level, the mouth is narrow, and the water shoots up at the top. The hardest of the eight.'],
  ],
  rulesLeadHeading: 'Hosting it',
  rulesLeadSay: 'Let’s play “One Drop Too Many”! There’s a glass on the phone — on your turn, tap once to start the water, tap again to stop, one pour each. The water fills to the rim and bulges without spilling, so it always looks like it’s going… and whoever makes it spill loses!',
  rulesLeadSteps: [
    'Want props? Get a clear glass and a jug of water, and pour for real while the phone’s tap is running — it changes the whole mood. No props is fine too, the phone alone plays the same.',
    'Always pick the glass size for your group (2–5, 6–9, 10–12 people). Get it right and someone loses after about one or two times round. More than 12 players: split into two groups with a phone each.',
    'On the first lap everyone taps very briefly — don’t rush them. They slow down by themselves once the water starts to bulge.',
    'After the truth-or-dare, start the next glass with the person after the loser, so it isn’t the same player going first every time.',
  ],
  rulesBack: '← Back to the game',
};
