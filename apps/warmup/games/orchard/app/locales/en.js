/*
 * English. Keys and list lengths must match zh-TW.js (topics may differ in length).
 * Name: Concentration — the English-speaking clapping game where you pick a category and take turns
 * naming things in it; repeat or hesitate and you're out. Chant cells: "The category is…"
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Concentration | Clap-along category icebreaker with a phone metronome and truth or dare',
  seoDesc:
    'The host calls a category — "Breakfast!" — and everyone claps to the beat: clap, clap, "pancakes"; clap, clap, "bacon"… No repeats, no wrong answers. The phone picks random categories (fruit, the zoo, the coffee shop…), keeps an adjustable beat, walks the host through the rules, and the losers spin a truth-or-dare slot. No props, no download, no sign-up.',
  rulesSeoTitle: 'How to play Concentration: rules and a host script',
  rulesSeoDesc: 'Concentration rules: how many players, how the clap-clap-say beat works, what counts as a mistake, what happens when you lose, plus a short script and category ideas for the host.',

  navTitle: 'Concentration',
  navRules: 'How to play',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Concentration: clap, clap, name one — and no repeats',
  heroDesc: 'The host calls a category, like "The zoo", and everyone takes turns to the beat: clap, clap, "lion"; clap, clap, "giraffe"… Repeat something already said or go off-category and you’re out.',

  lead: {
    setup: ['Get ready', 'Let’s play Concentration! Everyone stand in a circle — in a moment we’ll clap along to my beat.'],
    rules: ['Explain the rules', 'Three beats: clap, clap, say — clap twice, then say one word. First we all chant together, "The category is…", then I call today’s category, like "Breakfast". Starting with me, we go around the circle naming breakfast foods: clap, clap, pancakes; clap, clap, bacon… No repeats and no wrong answers — and if you freeze too long, you’re out too. Whoever loses picks up with a new category!'],
    play: ['Go!', 'All together: "The category is…" {topic}! Name {say}. I’ll go first.'],
    end: ['Who lost?', 'Everyone who messed up: pick truth, dare or random, then pull the lever!'],
  },
  ruleCards: [
    ['Pick a category', 'The host calls a category — "Breakfast" means breakfast foods, "The zoo" means animals. The phone can pick one at random.'],
    ['Keep the beat', 'Three beats: clap, clap, say. Start by chanting "The category is…", the host names it, then whoever’s turn it is names one thing on beat three.'],
    ['Repeat it, you lose', 'No repeats, nothing off-category, and freezing too long counts too (the host decides). Then switch categories and start with whoever lost.'],
  ],
  rulesNext: 'Next: start playing',

  startButton: 'Start the game',
  soundLabel: 'Music',

  chant: ['The', 'category', 'is…'],
  topicSay: 'Name {say}',
  topicShuffle: 'New category',
  topicPick: 'Choose a category',
  topics: [
    ['Fruit stand', 'a fruit'],
    ['Veggie patch', 'a vegetable'],
    ['The zoo', 'an animal'],
    ['Convenience store', 'something you can buy there'],
    ['Breakfast', 'a breakfast food'],
    ['Coffee shop', 'a drink'],
    ['Back to school', 'a school supply'],
    ['The kitchen', 'a kitchen item'],
    ['Sports day', 'a sport'],
    ['On the road', 'a vehicle'],
    ['World map', 'a country'],
    ['Road trip', 'a city'],
    ['Paint box', 'a color'],
    ['Cartoon channel', 'a cartoon character'],
    ['Career fair', 'a job'],
    ['Pizza night', 'a pizza topping'],
  ],

  endGame: 'Hold to end the game',
  againButton: 'Play again',

  leaveTitle: 'Back to the start?',
  leaveDesc: 'The game starts over with a new category.',
  leaveConfirm: 'Back to the start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play Concentration',
  rulesIntro: 'The host calls a category and everyone takes turns to the beat — clap, clap, say. No repeats, nothing off-category. When someone loses, switch categories and start with them.',
  rulesFacts: [
    ['Players', '4–30'],
    ['Time', 'As long as you like'],
    ['You need', 'No props — just the host’s phone'],
  ],
  rulesHowHeading: 'How it works',
  rulesHowSteps: [
    'Stand in a circle and chant together to the beat, "The category is…", then the host names today’s category, like "Breakfast" (the phone can pick one at random).',
    'The phone keeps a three-beat count: clap, clap, say. Everyone claps on the first two beats, and whoever’s turn it is names something on beat three — like "pancakes".',
    'The next person goes on the next three beats — clap, clap, "bacon" — and so on around the circle.',
    'Repeating something already said, going off-category ("lion" for breakfast), or freezing too long (the host decides) means you’re out.',
    'When someone loses, switch categories and start with them. When the host decides you’re done, the people who lost spin the truth-or-dare slot.',
  ],
  rulesLeadHeading: 'Hosting tips',
  rulesLeadSay: 'Let’s chant together to the beat: "The category is…" Breakfast! Name a breakfast food, starting with me: clap, clap, pancakes; clap, clap, bacon… No repeats, nothing off-category, and freezing too long counts too. Whoever loses starts the next category!',
  rulesLeadSteps: [
    'Start with a slow beat. Once everyone gets it, tap "faster" or turn on auto speed-up.',
    'The host decides how long is too long — go easy at first, then get stricter.',
    'At the end, let everyone who lost pull the lever once, or just the person who lost the most.',
  ],
  rulesBack: '← Back to the game',
};
