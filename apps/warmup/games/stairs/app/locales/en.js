/*
 * English. Keys and list lengths must match zh-TW.js.
 * Chant: four beats, one word each — "One, up, to, four!" (your floor, up/down, to, the floor you call).
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Elevator | Clap-along icebreaker game with a phone metronome and truth or dare',
  seoDesc:
    'Everyone stands in a circle as Floor 1, Floor 2, Floor 3… and chants to the beat: "One up to four!" Floor 4 has to answer right away. Wrong direction, a floor that doesn’t exist, missing your turn or jumping in when it isn’t yours — you’re out and go to Floor 1. The phone keeps an adjustable beat, walks the host through the rules, and the losers spin a truth-or-dare slot. No props, no download, no sign-up.',
  rulesSeoTitle: 'How to play Elevator: rules and a host script',
  rulesSeoDesc: 'Elevator rules: how many players, how to number the floors, what counts as a mistake, what happens when you lose, the roof-and-basement variant, and a short script the host can read out.',

  navTitle: 'Elevator',
  navRules: 'How to play',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Elevator: call the floors to the beat, and don’t go the wrong way',
  heroDesc: 'Stand in a circle and number off: Floor 1, Floor 2, Floor 3… Chant "One up to four!" to the beat, and Floor 4 has to answer right away. Wrong direction, a floor that doesn’t exist or a missed turn — you’re out.',

  lead: {
    setup: ['Set the group size', 'Let’s play Elevator! First let’s count how many of us there are — and decide if we want a roof and a basement for anyone who joins late.'],
    rules: ['Explain the rules', 'Let’s number off, starting with me: I’m Floor 1, you’re Floor 2… We chant in four beats, one word per beat: "One, up, to, four!" Say your own floor, then up or down, then the floor you’re calling. Whoever gets called answers in the next four beats. Going the wrong way, calling a floor that doesn’t exist, missing your turn or jumping in when it isn’t yours — that’s a mistake. Whoever messes up moves to Floor 1, everyone below them moves up one, and Floor 1 starts again!'],
    play: ['Go!', 'Floor 1 starts! To the beat — one, up, to… which floor?'],
    end: ['Who lost?', 'Everyone who messed up: pick truth, dare or random, then pull the lever!'],
  },
  ruleCards: [
    ['Number off', 'Stand in a circle and count off from the host: Floor 1, Floor 2, Floor 3…'],
    ['Chant to the beat', 'Four beats, one word each: "One, up, to, four!" Your floor, up or down, then the floor you’re calling. Get the direction right — Floor 4 can’t say "Four down to five."'],
    ['Lose, go to Floor 1', 'Wrong call, a floor that doesn’t exist, a missed turn or jumping in early — you move to Floor 1 and everyone below you moves up one.'],
  ],
  rulesNext: 'Next: start playing',

  countHeading: 'How many players',
  countLess: 'One fewer player',
  countMore: 'One more player',
  expansionLabel: 'Add a roof and a basement',
  expansionSub: 'Two extra spots for people who join late',
  startButton: 'Start the game',
  soundLabel: 'Music',

  buildingHeading: 'This round’s floors',
  floorLabel: 'Floor {n}',
  floorTop: 'Roof',
  floorBasement: 'Basement',

  endGame: 'Hold to end the game',
  playHint: 'Whoever messes up moves to Floor 1, everyone below them moves up one, and Floor 1 starts again.',
  againButton: 'Play again',

  leaveTitle: 'Back to the start?',
  leaveDesc: 'Your group size is kept and the game starts over.',
  leaveConfirm: 'Back to the start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play Elevator',
  rulesIntro: 'Stand in a circle as floors and chant to the beat — "One up to four!", "Four down to two!" — and whoever gets called answers right away. Wrong direction, a floor that doesn’t exist, a missed turn or jumping in early, and you go to Floor 1.',
  rulesFacts: [
    ['Players', '4–30'],
    ['Time', 'As long as you like'],
    ['You need', 'No props — just the host’s phone'],
  ],
  rulesHowHeading: 'How it works',
  rulesHowSteps: [
    'Stand in a circle and number off from the host: Floor 1, Floor 2, Floor 3… (the variant adds a roof and a basement as two extra spots).',
    'The phone keeps a four-beat count. Floor 1 starts by chanting "One, up, to, four!" — one word per beat.',
    'Whoever is called answers in the next four beats, starting with their own floor: "Four down to two!", "Two up to roof!"… Get the direction right: Floor 4 can’t say "Four down to five."',
    'Going the wrong way, calling a floor that doesn’t exist, missing your turn, or answering when you weren’t called all count as a mistake.',
    'Whoever messes up moves to Floor 1, everyone who was below them moves up one, and Floor 1 starts again. When the host decides you’re done, the people who lost spin the truth-or-dare slot.',
  ],
  rulesLeadHeading: 'Hosting tips',
  rulesLeadSay: 'Let’s number off, starting with me: I’m Floor 1, you’re Floor 2… We chant in four beats: "One, up, to, four!" Your floor, up or down, then the floor you’re calling — and whoever’s called answers right away. Mess up and you go to Floor 1!',
  rulesLeadSteps: [
    'Start with a slow beat. Once everyone gets it, tap "faster" or turn on auto speed-up.',
    'The group decides who messed up — the host just calls "Wrong!" and moves that person to Floor 1.',
    'At the end, let everyone who lost pull the lever once, or just the person who lost the most.',
  ],
  rulesBack: '← Back to the game',
};
