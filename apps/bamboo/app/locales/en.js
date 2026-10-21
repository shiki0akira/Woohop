/*
 * English. Same keys as zh-TW.js. The game name follows the closest English group game
 * (“Count to 20”), not a literal translation of 竹筍竹筍蹦蹦出 — see CONCEPT.md section 5.
 * Placeholders like {n} {names} stay as they are.
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Pop-Up Count | Icebreaker game with funny names, a chant and music',
  seoDesc:
    'Everyone crouches down like a bamboo shoot. Anyone can pop up and call the next number, but if two people stand at the same time, the first to shout the other’s name stays up. Last one down loses. The phone hands out funny names (food, drinks, animals, cartoon characters), plays the chant and music, and ends with a truth-or-dare slot machine. No props, no download, no sign-up.',
  rulesSeoTitle: 'How to play Pop-Up Count: rules and how to lead it',
  rulesSeoDesc:
    'Pop-Up Count rules: how many players, how names work, what happens when two people stand up together, who loses, and a short script the host can read out.',

  navTitle: 'Pop-Up Count',
  navRules: 'How to play',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Pop-Up Count: stand up, call a number, shout a name',
  heroDesc: 'Everyone crouches like a bamboo shoot and takes turns popping up with the next number. Two people up at once? Race to shout the other’s name. Last one still down loses.',

  lead: {
    setup: ['Pick a theme', 'Let’s play Pop-Up Count! Pick a theme first — in a minute everyone gets a name from it.'],
    name: ['Get your names', 'Pass the phone around. Everyone draws a name and reads it out loud so we all hear it!'],
    rules: ['The rules', 'Everyone crouches down like a bamboo shoot. After the chant, anyone can pop up and call the next number, starting from 1. If two of you stand up together, race to shout the other person’s name! Last one still down loses.'],
    play: ['Go!', 'Everybody down! Chant with me — bamboo, bamboo, pop up now!'],
    end: ['Who lost?', 'Last one down: pick truth, dare or random, then pull the slot machine!'],
  },
  ruleCards: [
    ['Pop up and count', 'Anyone can stand up and call the next number. No planning the order!'],
    ['Clash? Shout a name', 'Two up at once: the first to shout the other’s name stays up, the slower one crouches again. Shout together? Rock, paper, scissors.'],
    ['Last one loses', 'Whoever is still crouching at the end loses.'],
  ],
  rulesNext: 'Next: let’s play',

  themeHeading: 'Name theme',
  themeRandom: 'Random',
  themeRandomSub: 'Phone picks one',
  themeFood: 'Food',
  themeDrink: 'Drinks',
  themeAnimal: 'Animals',
  themeFruit: 'Fruit',
  themeDessert: 'Desserts',
  themeCartoon: 'Cartoons',
  themeRealname: 'Real names',
  themeRealnameSub: 'No new names',
  themeExample: '{a}, {b}…',
  startNaming: 'Start the game',
  startRealname: 'Start the game',

  nameTurn: 'Player {n}',
  nameTheme: 'Theme: {theme}',
  rerollTheme: 'Another theme',
  drawButton: 'Draw a name',
  ownButton: 'Make up my own',
  ownSay: 'Think of a name and announce it: “I’m ___!” Then pass the phone on.',
  ownCancel: 'Draw instead',
  ownSlot: 'Own name {n}',
  youAre: 'You are…',
  redraw: 'Another',
  passNext: 'Pass it on',
  revealHint: 'Got it? Tap “Pass it on” and hand over the phone 👇',
  poolEmpty: 'This theme is all used up — make up your own!',
  namedHeading: 'Names so far',
  removeName: 'Remove “{name}”',
  allDone: 'Everyone has a name — next',
  allDoneNeed: 'You need at least {n} players to start.',

  playNames: 'Meet today’s bamboo shoots: {names}!',
  listSep: ', ',
  startRound: 'Start the round',
  endRound: 'Hold to end the round',
  musicLabel: 'Music',
  chant: ['Bam', 'boo', 'bam', 'boo', 'pop', 'up', 'now!'],
  playHintIdle: 'Everyone crouch down, then tap start.',
  playHintRunning: 'Clash? Shout their name! Last one down loses.',

  againButton: 'Another round',

  leaveTitle: 'Go back to the start?',
  leaveDesc: 'The names you’ve drawn will be cleared.',
  leaveConfirm: 'Back to start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play Pop-Up Count',
  rulesIntro: 'Everyone crouches like a bamboo shoot and pops up one at a time with the next number. If two stand up together, they race to shout each other’s name. Last one still down loses.',
  rulesFacts: [
    ['Players', '4–20'],
    ['Time', '1–2 minutes a round'],
    ['You need', 'No props, one phone for the host'],
  ],
  rulesHowHeading: 'How to play',
  rulesHowSteps: [
    'Pick a theme and pass the phone around. Everyone draws a name (or makes one up, or just uses their real name).',
    'Everyone crouches down and chants “bamboo, bamboo, pop up now!”',
    'Anyone can stand up and call the next number, starting from 1. Once you’re up, you stay up.',
    'Two people up at once: the first to shout the other’s name stays up and their number counts; the slower one crouches again. Shout together? Rock, paper, scissors. Wrong name? Keep shouting until someone gets it right. Three or more? The first to shout anyone’s name stays up.',
    'The last one still crouching loses. With N players you count to N−1.',
  ],
  rulesLeadHeading: 'How to lead it',
  rulesLeadSay: 'Everyone draws a name on the phone first. Then we all crouch down and anyone can pop up with the next number — but if two of you stand up together, race to shout the other’s name! Last one still down loses.',
  rulesLeadSteps: [
    'After the names are drawn, hold up the phone so everyone can see the list.',
    'Let the group decide who shouted first. As host, you only need to call “Clash!”',
    'The loser pulls the slot machine and answers or does the dare, then tap “Another round”.',
  ],
  rulesBack: '← Back to the game',
};
