/*
 * English. Keys and list lengths must match zh-TW (the build checks).
 * The game is named after the viral "Reverse Audio Challenge" (CONCEPT.md section 4); prompts are picked for English speakers.
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Reverse Audio Challenge | Play a voice backwards, copy it, flip it back and guess',
  seoDesc:
    'One player records a line, the phone plays it backwards, and everyone tries to copy the gibberish — then flips their copy back to guess what was said. The phone deals prompts (sentences, humming, free style), and you can pass one phone around or race on your own phones. No app, no sign-up; recordings stay on your phone.',
  rulesSeoTitle: 'How to play the Reverse Audio Challenge: rules and hosting tips',
  rulesSeoDesc: 'How the Reverse Audio Challenge works: how many players, how to give prompts, how to copy the backwards sound, taking turns vs. racing, plus an intro the host can read aloud.',

  navTitle: 'Reverse Audio Challenge',
  navRules: 'Rules',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Reverse Audio Challenge: play it backwards, copy it, flip it back',
  heroDesc: 'Record a line and the phone plays it in reverse — it sounds like an alien language. Copy the gibberish, flip it back, and see who guesses the original first!',

  lead: {
    setup: ['Set up players', 'Let’s play the Reverse Audio Challenge! Someone records a line, the phone plays it backwards, and we all try to copy it — then flip it back to hear what it really said.'],
    rules: ['How it works', 'We take turns giving prompts: peek at your prompt, record a line, and the phone plays it backwards to everyone. Then we copy that weird sound, flip it back and guess what was said!'],
    end: ['That’s a wrap!', 'Great copying, everyone! Who sounded closest, and who guessed first? Tap “Play again” for another round.'],
  },
  ruleCards: [
    ['Peek and record', 'The player whose turn it is draws a prompt: make a sentence with a word, hum a song, or say anything. The phone flips the recording backwards.'],
    ['Copy the gibberish', 'Listen to the reversed sound, say it the same way into the phone, and flip it back — it sounds surprisingly close to the original.'],
    ['Guess the original', 'Stuck? Check the hint, then play the original to reveal the answer. Next player gives the next prompt.'],
  ],
  rulesNext: 'Next: let’s play',

  startButton: 'Start game',
  countLabel: 'Players',
  countLess: 'One fewer player',
  countMore: 'One more player',
  perLabel: 'Prompts each',
  per1: '1',
  per2: '2',
  perFree: 'No limit',
  roundsHint: '{total} rounds: everyone takes turns giving a prompt, then the game ends.',
  roundsFreeHint: 'No limit: play as long as you like, then press and hold the end button when you’re done.',
  modeLabel: 'Guessing',
  modeOne: 'Take turns',
  modeEach: 'Race',
  modeOneHint: 'One phone is enough: after recording, pass the phone to the next person to copy it and flip it back.',
  modeEachHint: 'Everyone scans the QR code to open the recorder, copies and flips it on their own phone — first to guess shouts it out!',
  recOnlyLink: 'I’m guessing — just give me the recorder',

  kindNames: { sentence: 'Sentence', hum: 'Hum', free: 'Free style' },
  sentenceTask: 'Say a sentence with “{word}”',
  roundNo: 'Round {n} / {total}',
  roundNoFree: 'Round {n}',
  turnWho: 'Player {k} asks',
  drawButton: 'Draw a prompt',
  drawHint: 'Only the prompt giver should look!',
  revealHint: 'Got it? Hide it 👇',
  coverButton: 'Hide it',
  cardShuffle: 'Another one',
  coveredText: 'Prompt hidden',
  peekAgain: 'Peek again',
  hintButton: 'Hint',
  hintLine: 'Hint: {hint}',
  hintWord: '“{word}”',
  answerButton: 'Reveal answer',
  prompts: {
    sentence: [
      // nouns
      'banana', 'pizza', 'thunderstorm', 'alien', 'pancakes', 'subway', 'lunchbox', 'kitten', 'dinosaur', 'ice cream',
      'toothbrush', 'alarm clock', 'birthday cake', 'bicycle', 'umbrella', 'pineapple', 'hot dog', 'concert', 'coffee', 'penguin',
      'smartphone', 'teacher', 'superhero', 'elevator', 'watermelon', 'Santa Claus', 'hamburger', 'panda', 'beach', 'rainbow',
      'hair dryer', 'popcorn', 'sneakers', 'robot', 'cupcake',
      // verbs
      'swim', 'sneeze', 'dance', 'sleep', 'brush your teeth', 'take a shower', 'sing', 'get lost', 'call someone', 'wait in line',
      'go on a diet', 'be late', 'take a selfie', 'argue', 'move house',
      // adjectives and feelings
      'angry', 'sleepy', 'starving', 'freezing', 'super happy', 'nervous', 'awkward', 'exhausted', 'delicious', 'way too spicy',
      'shy', 'bored',
      // situations
      'on the subway', 'a first date', 'a snow day', 'the weekend', 'a rainy day', 'the night before an exam', 'New Year’s Eve', 'at the mall', 'my birthday', 'three in the morning',
      // connectors
      'but', 'if', 'because', 'although', 'while', 'more and more', 'not only… but also', 'suddenly', 'finally', 'actually',
      'as soon as', 'unless',
    ],
    hum: ['Hum a nursery rhyme', 'Hum a pop song everyone knows', 'Hum a TV theme or a jingle', 'Hum a song you’ve been playing a lot lately'],
    free: ['Say what you most want to say today', 'Say a tongue twister', 'Say your favorite catchphrase', 'Quote a line from a movie or cartoon'],
  },

  recordHeading: 'Record your prompt',
  recordHint: 'Say a line for your prompt (up to 15 seconds). Then everyone guesses.',
  guessHeading: 'Play it for everyone',
  guessHint: 'Listen closely — you can play it as many times as you like.',
  askReverse: 'Play backwards',
  redoLink: 'Not happy? Record again',
  stageCopy: 'Next person copies it',
  stageCopyOne: 'Pass the phone on: listen to the reversed sound, say it the same way, then tap “Flip it back” and guess the original.',
  copyMine: 'My copy',
  copyReverse: 'Flip it back',
  qrAlt: 'QR code that opens the recorder',
  stuckHeading: 'Stuck?',
  nextLocked: 'Play the answer with “Reveal answer” before moving on.',
  nextRound: 'Next round',
  lastRound: 'All done — see the end',
  // 要按住才會結束，防手滑（跟果園菜園動物園、竹筍同一個做法）
  endGame: 'Hold to end the game',
  againButton: 'Play again',

  recOnlyTitle: 'Reverse recorder',
  recOnlyDesc: 'Record the reversed sound or your own copy, then tap “Play backwards”.',
  recOnlyMine: 'Original',
  recOnlyReverse: 'Play backwards',
  recOnlyBack: '← I want to give a prompt',

  leaveTitle: 'Back to the start?',
  leaveDesc: 'This round’s recording will be cleared.',
  leaveConfirm: 'Back to start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play the Reverse Audio Challenge',
  rulesIntro: 'Take turns giving prompts: record a line and the phone plays it backwards. Everyone else copies the gibberish, flips it back, and guesses what was said.',
  rulesFacts: [
    ['Players', '2–20'],
    ['Time', 'One prompt each, or as long as you like'],
    ['You need', 'One phone; with a bigger group everyone can race on their own phone'],
  ],
  rulesHowHeading: 'How to play',
  rulesHowSteps: [
    'Take turns. On your turn, draw a prompt on the phone: make a sentence with a word, hum a song, or say anything you like.',
    'Hide the prompt, tap “Start recording” (up to 15 seconds), then tap “Play backwards” for everyone.',
    'Take turns: pass the phone on — the next person says the reversed sound into the phone and taps “Flip it back”. Race (4+ players): everyone scans the QR code to open the recorder, copies it, flips it back, and the first to guess shouts it out.',
    'Stuck? Check the hint, then tap “Reveal answer” to play the original. Then the next player gives a prompt; the game ends when everyone has had a turn.',
  ],
  rulesLeadHeading: 'Hosting tips',
  rulesLeadSay: 'Someone’s going to record a line and the phone will play it backwards — it’ll sound like an alien language. Copy that sound exactly, flip it back, and guess what was really said! We’ll all take turns giving a prompt.',
  rulesLeadSteps: [
    'Give the first prompt yourself — one demo and everyone gets it.',
    'Short lines are easier to copy: 3–5 seconds is perfect. Anything longer gets impossible backwards.',
    'Don’t be shy when copying — the weirder it sounds, the funnier it is flipped back.',
  ],
  rulesBack: '← Back to the game',
};
