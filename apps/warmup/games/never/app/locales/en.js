/*
 * English. Same keys as zh-TW. The game already has a name everyone knows: Never Have I Ever
 * (no drinking here — you fold a finger). Examples must read naturally after both
 * "Never have I ever …" and "I have …", so they’re past participles ("fallen asleep in class").
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Never Have I Ever | Icebreaker game with a new topic every round — fold a finger if you have',
  seoDesc:
    'Take turns saying “Never have I ever…” — anyone who has done it folds a finger. Fold all five and you’re out; the last one with fingers up is king. The phone picks a topic each round (school days, daily habits, embarrassing moments…) with example lines, and you can flip it to “I have…”. No props, no download, no sign-up. The king picks someone to spin the truth-or-dare slot.',
  rulesSeoTitle: 'How to Play Never Have I Ever: Rules, Topics and Examples',
  rulesSeoDesc: 'How to play Never Have I Ever with fingers instead of drinks: how many players, how folding works, who wins, the flipped “I have…” version, a script for the host and 20+ topics with example lines.',

  navTitle: 'Never Have I Ever',
  navRules: 'How to play',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Never Have I Ever: if you’ve done it, fold a finger',
  heroDesc: 'Everyone holds up one hand. Take turns saying something you’ve never done, like “Never have I ever traveled abroad.” Anyone who has folds a finger. Fold all five and you’re out — the last one with fingers up wins. The phone picks a topic each round.',

  modeLabel: 'How to play',
  modeNever: 'Never have I ever',
  modeDid: 'I have…',
  modeHintNever: 'Say something you’ve never done. Anyone who has folds a finger.',
  modeHintDid: 'Say something you’ve done. Anyone who hasn’t folds a finger.',

  lead: {
    setup: ['Opening', 'Let’s play Never Have I Ever! Everyone, hold up one hand with all five fingers out.'],
    rules: ['The rules', 'Take turns saying something you’ve never done, like “Never have I ever traveled abroad.” Anyone who has done it folds a finger. Fold all five and you’re out — the last one with fingers up wins! Each round the phone picks a topic, and everything you say has to fit it.'],
    play: ['Let’s go!', 'This round’s topic is “{topic}”! I’ll start: say something about {topic} that you’ve never done. Anyone who has folds a finger.'],
    playFree: ['Let’s go!', 'This round is a free round — anything goes! I’ll start: say something you’ve never done. Anyone who has folds a finger.'],
    end: ['Who’s king?', 'The last one with fingers up is king! The king picks someone, who chooses truth, dare or random — then pulls the lever!'],
  },
  leadDid: {
    setup: ['Opening', 'Let’s play “I have…”! Everyone, hold up one hand with all five fingers out.'],
    rules: ['The rules', 'Take turns saying something you’ve done, like “I have gone to the movies alone.” Anyone who hasn’t folds a finger. Fold all five and you’re out — the last one with fingers up wins! Each round the phone picks a topic, and everything you say has to fit it.'],
    play: ['Let’s go!', 'This round’s topic is “{topic}”! I’ll start: say something about {topic} that you’ve done. Anyone who hasn’t folds a finger.'],
    playFree: ['Let’s go!', 'This round is a free round — anything goes! I’ll start: say something you’ve done. Anyone who hasn’t folds a finger.'],
    end: ['Who’s king?', 'The last one with fingers up is king! The king picks someone, who chooses truth, dare or random — then pulls the lever!'],
  },
  ruleCards: [
    ['A topic each round', 'The phone picks a topic, like “School days”, and this round everyone talks about that.'],
    ['Say what you’ve never done', 'Take turns saying “Never have I ever…” — it has to be true. Stuck? There’s an example under the topic.'],
    ['Done it? Fold a finger', 'Anyone who has done it folds a finger. Fold all five and you’re out; the last one standing is king!'],
  ],
  ruleCardsDid: [
    ['A topic each round', 'The phone picks a topic, like “School days”, and this round everyone talks about that.'],
    ['Say what you’ve done', 'Take turns saying “I have…” — it has to be true. The fewer people who’ve done it, the better.'],
    ['Haven’t? Fold a finger', 'Anyone who hasn’t done it folds a finger. Fold all five and you’re out; the last one standing is king!'],
  ],
  rulesNext: 'Next: start playing',

  startButton: 'Start the game',
  soundLabel: 'Music',

  roundLabel: 'Round {n}',
  exNever: 'e.g. Never have I ever {ex}',
  exDid: 'e.g. I have {ex}',
  exMore: 'Another example',
  topicShuffle: 'Another topic',
  topicPick: 'Pick a topic',
  nextRound: 'Everyone’s gone: next round',
  topics: [
    ['School days', ['fallen asleep in class', 'been class president', 'forgotten my homework', 'failed a test']],
    ['Daily habits', ['sung in the shower', 'hit snooze more than three times', 'gone a whole day without my phone', 'talked to my plants']],
    ['Travel', ['traveled abroad alone', 'missed my stop on a train', 'gotten lost in another country', 'been on a plane']],
    ['Food', ['eaten durian', 'eaten alone at a restaurant', 'eaten so much I couldn’t move', 'cooked instant noodles at midnight']],
    ['Work', ['had a part-time job', 'been late for work', 'blanked in a job interview', 'dozed off in a meeting']],
    ['Sports', ['run a marathon', 'fallen over on sports day', 'climbed a real mountain', 'paid for a gym and never gone']],
    ['Phones & internet', ['scrolled my phone until sunrise', 'texted the wrong person', 'bought a fake online', 'gone live on social media']],
    ['Childhood', ['run away from home', 'broken a toy and hidden it', 'drawn on the walls', 'sneaked candy before dinner']],
    ['Animals', ['had a pet', 'been chased by a dog', 'held a snake', 'been stung by a bee']],
    ['Embarrassing moments', ['tripped in front of everyone', 'called someone by the wrong name', 'waved back at someone who wasn’t waving at me', 'worn my shirt inside out all day']],
    ['Friends', ['forgotten my best friend’s birthday', 'shown up in the same outfit as a friend', 'talked with a friend until sunrise', 'kept a friend’s secret for years']],
    ['Getting around', ['ridden a motorcycle', 'taken the wrong bus', 'forgotten where I parked', 'slept through my stop']],
    ['Talents', ['learned an instrument', 'performed on stage', 'sung karaoke in front of strangers', 'danced in front of everyone']],
    ['At home', ['cooked dinner for a big group', 'shrunk my clothes in the wash', 'burned a pot', 'built furniture by myself']],
    ['Movies & shows', ['cried at a movie', 'binge-watched a whole series in one day', 'fallen asleep in the cinema', 'stayed up all night to watch a game']],
    ['Brave moves', ['ridden a roller coaster', 'gone to the movies alone', 'started a chat with a stranger', 'gone bungee jumping']],
    ['Weather', ['gone out in a storm', 'seen snow', 'gotten soaked in the rain', 'gotten sunburned']],
    ['Free round', ['dropped my phone in water', 'sung loudly in public', 'ordered the wrong dish and eaten it anyway', 'received a handwritten letter'], 'free'],
  ],

  endGame: 'Only one hand left? Hold to end',
  againButton: 'Play again',

  leaveTitle: 'Back to the start?',
  leaveDesc: 'The game starts over with new topics.',
  leaveConfirm: 'Back to the start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play Never Have I Ever',
  rulesIntro: 'Everyone holds up one hand and takes turns saying something they’ve never done. Anyone who has done it folds a finger. Fold all five and you’re out; the last one with fingers up wins. No props needed — the phone picks a topic and gives example lines each round.',
  rulesFacts: [
    ['Players', '3–15'],
    ['Time', '10–20 minutes'],
    ['You need', 'No props — just the host’s phone'],
  ],
  rulesHowHeading: 'How it works',
  rulesHowSteps: [
    'Sit in a circle. Everyone holds up one hand with all five fingers out.',
    'The phone picks a topic, like “School days”, and this round everyone says something about it. On a “Free round”, anything goes.',
    'Starting with the host, take turns saying something you’ve never done, like “Never have I ever fallen asleep in class.” It has to be true.',
    'Anyone who has done it folds a finger; the speaker doesn’t. Fold all five and you’re out.',
    'When everyone has had a turn, tap “Next round” for a new topic. The last one with fingers up is king and picks someone to spin the truth-or-dare slot.',
  ],
  rulesDidHeading: 'Flip it: “I have…”',
  rulesDidIntro: 'Choose “I have…” at the start and the rules flip:',
  rulesDidSteps: [
    'Take turns saying something you’ve done, like “I have gone to the movies alone.”',
    'Anyone who hasn’t done it folds a finger. Fold all five and you’re out.',
    'The fewer people who’ve done it, the better — the last one with fingers up wins.',
  ],
  rulesTopicsHeading: 'Topics and examples',
  rulesTopicsIntro: 'Each round the phone picks one of these topics, with an example line for anyone who’s stuck:',
  rulesLeadHeading: 'Hosting tips',
  rulesLeadSay: 'Everyone, hold up one hand! We take turns saying something we’ve never done. If you’ve done it, fold a finger — fold all five and you’re out, and the last one with fingers up wins. This round’s topic is “Travel”. I’ll start: never have I ever traveled abroad alone!',
  rulesLeadSteps: [
    'Go first in round one with something lots of people have done, so everyone gets it right away.',
    'Want someone to fold? Name something everyone has done except them — it always gets a laugh.',
    'With a big group, play with three fingers instead of five so it moves faster.',
  ],
  rulesBack: '← Back to the game',
};
