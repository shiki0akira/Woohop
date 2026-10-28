/*
 * English. The game is simply "Charades" in English. Word lists are picked for English speakers, not translated
 * (idioms are English idioms you can act out). Hints reveal letters, not characters.
 */
export default {
  htmlLang: 'en',
  ogLocale: 'en_US',

  seoTitle: 'Charades | Free charades word generator — draw a card, act it out, get hints',
  seoDesc:
    'A charades word generator on your phone: animals, jobs, sports, everyday life, food, getting around, things, funny situations and idioms — hundreds of words, pick the categories you like. Take turns acting it out in silence until someone guesses; skip the ones you can’t do, and give hints when everyone’s stuck. No app, no sign-up — great for parties, team building and family nights.',
  rulesSeoTitle: 'How to play Charades: rules, categories and hosting tips',
  rulesSeoDesc: 'How to play Charades: how many players, taking turns, what you’re not allowed to do, when a guess counts, plus a script the host can read out.',

  navTitle: 'Charades',
  navRules: 'How to play',
  gameBack: 'Back',
  rulesLinkText: 'Full rules →',

  heroTitle: 'Charades: draw a word, act it out — no talking!',
  heroDesc: 'Take turns going up with the phone, draw a word and act it out without a sound while everyone shouts guesses. Skip the ones you can’t do, give hints when everyone’s stuck — whoever guesses gets a point!',

  lead: {
    setup: ['Welcome', 'Let’s play Charades! First set how many of us are playing, pick today’s categories, and sit in a circle.'],
    rules: ['How it works', 'We take turns. When it’s your turn, take the phone and draw a word, then act it out — no talking, no sounds, no mouthing the word. Everyone else shouts guesses until someone gets it, and they get a point. Before you start acting you can skip a word; once you start, the word gets covered up, and if everyone’s really stuck you can give a hint: the category, or a letter of the answer. Most points wins!'],
    end: ['Game over!', 'Count up how many you guessed — most points wins!'],
  },
  ruleCards: [
    ['Take turns', 'Whoever’s up takes the phone and draws a word. Don’t let anyone see!'],
    ['Act, don’t talk', 'No talking, no sounds, no mouthing, and no pointing at things in the room.'],
    ['Guess it, score it', 'Keep going until someone guesses — first to get it scores a point. Stuck? Give a hint.'],
  ],
  rulesNext: 'Next: start playing',

  categoryLabel: 'Categories',
  categoryHint: 'Pick as many as you like (at least one)',
  countLabel: 'Players',
  countLess: 'One fewer player',
  countMore: 'One more player',
  perLabel: 'Words each',
  per1: '1',
  per2: '2',
  perFree: 'No limit',
  roundsHint: '{total} words in total — everyone takes turns, and the game ends when they’re done.',
  roundsFreeHint: 'No limit — press and hold “End game” when you’re done.',
  startButton: 'Start the game',

  roundNo: 'Word {n} of {total}',
  roundNoFree: 'Word {n}',
  turnWho: 'Player {k}’s turn',
  drawButton: 'Draw a word',
  drawHint: 'Your turn! Draw one — don’t let anyone see',
  startActing: 'Start acting!',
  skipButton: 'Skip this one',
  gotIt: 'Got it!',
  peekButton: 'Go back and see the word',
  continueActing: 'Keep acting!',
  hintKindButton: 'Show category',
  hintCharButton: 'Reveal a letter',
  gotItResult: 'Got it!',
  gotItHint: 'Whoever guessed it gets a point — keep track of your score!',
  answerIs: 'The answer was',
  nextTurn: 'Next player',
  seeResult: 'See the results',
  endGame: 'Hold to end the game',
  againButton: 'Play again',

  categories: [
    ['animals', 'Animals', [
      'Kangaroo', 'Penguin', 'Elephant', 'Giraffe', 'Monkey', 'Crab', 'Octopus', 'Snake', 'Frog', 'Rabbit',
      'Owl', 'Peacock', 'Crocodile', 'Koala', 'Dolphin', 'Butterfly', 'Bee', 'Rooster', 'Turtle', 'Lion',
      'Eagle', 'Squirrel', 'Hedgehog', 'Mosquito', 'Shark', 'Gorilla', 'Hippo', 'Bat', 'Spider', 'Ostrich',
      'Seal', 'Panda', 'Sloth', 'Snail', 'Woodpecker', 'Flamingo', 'Chameleon', 'T-rex',
    ]],
    ['jobs', 'Jobs', [
      'Dentist', 'Magician', 'Traffic cop', 'Chef', 'Hairdresser', 'Firefighter', 'Photographer', 'Flight attendant', 'Conductor', 'Delivery driver',
      'Personal trainer', 'Painter', 'Bus driver', 'Gardener', 'Doctor', 'Teacher', 'News anchor', 'Security guard', 'Boxer', 'DJ',
      'Fortune teller', 'Pilot', 'Fisherman', 'Vet', 'Astronaut', 'Detective', 'Clown', 'Farmer', 'Carpenter', 'Mechanic',
      'Bartender', 'Tour guide', 'Cheerleader', 'Model', 'Singer', 'YouTuber', 'Lifeguard', 'Bride',
    ]],
    ['sports', 'Sports', [
      'Swimming', 'Archery', 'Boxing', 'High jump', 'Table tennis', 'Badminton', 'Basketball', 'Soccer', 'Bowling', 'Golf',
      'Rowing', 'Skiing', 'Surfing', 'Ice skating', 'Weightlifting', 'Diving', 'Fencing', 'Jump rope', 'Cycling', 'Yoga',
      'Rock climbing', 'Baseball', 'Tennis', 'Volleyball', 'Sumo wrestling', 'Long jump', 'Pole vault', 'Shot put', 'Javelin', 'Horse riding',
      'Karate', 'Gymnastics', 'Figure skating', 'Snorkeling', 'Skateboarding', 'Hula hoop', 'Tug of war', 'Sprinting',
    ]],
    ['daily', 'Everyday life', [
      'Brushing your teeth', 'Rush-hour train', 'Putting on a raincoat', 'Taking a selfie', 'Sneezing', 'Tying your shoes', 'Blow-drying your hair', 'Washing dishes', 'Playing video games', 'Hanging up laundry',
      'Taking out the trash', 'Chasing the bus', 'Face mask', 'Black Friday shopping', 'Nodding off', 'Stepping on a scale', 'Opening a jar', 'Clipping your nails', 'Looking for your keys', 'Ironing',
      'Opening an umbrella', 'Swatting a mosquito', 'Scratching an itch', 'Looking in the mirror', 'Mopping the floor', 'Putting on makeup', 'Shaving', 'Making the bed', 'Watering plants', 'Walking the dog',
      'Yawning', 'Stretching', 'Scrolling on your phone', 'Parallel parking', 'Typing', 'Putting in contact lenses',
    ]],
    ['food', 'Food', [
      'Eating spaghetti', 'Peeling a banana', 'Drinking bubble tea', 'Eating watermelon', 'Grilling burgers', 'Eating an ice cream cone', 'Cracking a lobster', 'Eating a hot chili', 'Making pizza', 'Toasting marshmallows',
      'Eating corn on the cob', 'Blowing out birthday candles', 'Sipping hot soup', 'Eating a taco', 'Flipping pancakes', 'Frying an egg', 'Peeling an orange', 'Eating a giant sandwich', 'Slurping noodles', 'Eating popcorn',
      'Chopping onions', 'Opening a soda', 'Eating sushi with chopsticks', 'Stretchy cheese pizza', 'Eating a lemon', 'Drinking coffee', 'Eating cake', 'Chewing gum', 'Eating a hot dog', 'Licking a lollipop',
      'Eating ribs', 'Carving a turkey', 'Eating a burrito', 'Shaking a milkshake',
    ]],
    ['vehicles', 'Getting around', [
      'Riding a motorbike', 'Driving a car', 'Taking a plane', 'Riding a train', 'Riding a bike', 'Paddling a kayak', 'Steering a ship', 'Taking the elevator', 'Riding a roller coaster', 'Riding a horse',
      'Driving a tank', 'Hot-air balloon', 'Flying a helicopter', 'Riding a unicycle', 'Cable car', 'Driving an excavator', 'Skateboarding', 'Pushing a stroller', 'Fire truck', 'Merry-go-round',
      'Submarine', 'Escalator', 'Hailing a taxi', 'Driving a truck', 'Riding a camel', 'Rocket launch', 'Pushing a shopping cart', 'Ambulance', 'Riding a sled', 'Pogo stick',
    ]],
    ['objects', 'Things', [
      'Umbrella', 'Hair dryer', 'Vacuum cleaner', 'Toothbrush', 'Flashlight', 'Binoculars', 'Scissors', 'Stapler', 'Alarm clock', 'Selfie stick',
      'Electric fan', 'Microwave', 'Washing machine', 'Mirror', 'Comb', 'Pillow', 'Mop', 'Broom', 'Fly swatter', 'Lighter',
      'Camera', 'Headphones', 'Microphone', 'Keyboard', 'Remote control', 'Helmet', 'Suitcase', 'Hammock', 'Yo-yo', 'Kite',
      'Slingshot', 'Fishing rod', 'Bow and arrow', 'Walking stick', 'Parachute', 'Candle', 'Bell', 'Clock',
    ]],
    ['scenes', 'Funny situations', [
      'Slipping on a banana peel', 'Getting bitten by a mosquito', 'Eating something really spicy', 'Someone farted in the elevator', 'Spilling your drink', 'A pebble in your shoe', 'Getting struck by lightning', 'Slipping on ice', 'Can’t find a toilet', 'Oversleeping',
      'Being chased by a dog', 'Broken zipper', 'Dropping your phone in the toilet', 'Burning your tongue on soup', 'Hand stuck in the door', 'Walking into a lamppost', 'Can’t stop hiccuping', 'Your leg fell asleep', 'No hot water in the shower', 'Windy bad hair day',
      'Boss catches you slacking', 'Watching a horror movie', 'Winning the lottery', 'Cheating on a test', 'First date', 'Getting lost', 'Shirt on inside out', 'Catching a thief', 'Pooped on by a bird', 'Front row at a concert',
    ]],
    ['idioms', 'Idioms', [
      'Break the ice', 'Raining cats and dogs', 'Cold feet', 'Spill the beans', 'Piece of cake', 'Hit the sack', 'Cry over spilled milk', 'Let the cat out of the bag', 'Bite the bullet', 'Butterflies in your stomach',
      'Head in the clouds', 'Walking on eggshells', 'Couch potato', 'Elephant in the room', 'Break a leg', 'Pull someone’s leg', 'Hold your horses', 'Burn the midnight oil', 'Cut corners', 'Kill two birds with one stone',
      'Over the moon', 'Under the weather', 'Bend over backwards', 'Get your ducks in a row', 'Hit the road', 'Jump on the bandwagon', 'Sit on the fence', 'Barking up the wrong tree', 'Turn the tables', 'Run like the wind',
    ]],
  ],

  leaveTitle: 'Back to the start?',
  leaveDesc: 'The game starts over.',
  leaveConfirm: 'Back to the start',
  leaveCancel: 'Keep playing',

  rulesTitle: 'How to play Charades',
  rulesIntro: 'Take turns going up with the phone and acting out the word it shows — no talking. Everyone else shouts guesses, whoever gets it scores a point, and most points wins.',
  rulesFacts: [
    ['Players', '2–30'],
    ['Time', 'Depends on the words — 6 players, 1 word each takes about 10 minutes'],
    ['You need', 'The host’s phone'],
  ],
  rulesHowHeading: 'How it works',
  rulesHowSteps: [
    'Set how many players and how many words each, then pick categories (animals, jobs, sports, everyday life, food, getting around, things, funny situations, idioms — as many as you like).',
    'Sit in a circle. The first player takes the phone and draws a word without letting anyone see.',
    'Tap “Start acting!” and act it out: no talking, no sounds, no mouthing, and no pointing at things in the room.',
    'Everyone shouts guesses until someone gets it; the first to guess scores a point and the actor taps “Got it!”. Can’t act it out? Tap “Skip this one” before you start.',
    'Once you start, the word is covered and only the number of letters shows — go back to see it if you forget. If everyone’s stuck, give a hint: “Show category” or “Reveal a letter”, then turn the phone around. When all the words are done, most points wins.',
  ],
  rulesLeadHeading: 'Hosting tips',
  rulesLeadSay: 'Let’s play Charades! We take turns acting out the word on the phone — no talking, no sounds. Everyone else shouts guesses, and the first to get it scores a point, so keep track. You can skip a word you can’t do, and give a hint if we’re stuck. Most points wins!',
  rulesLeadSteps: [
    'For a first round, try just “Animals” and “Everyday life”, then add “Idioms” and “Funny situations” once everyone’s warmed up.',
    'The actor decides who guessed first; if two people shout it at the same time, both score.',
    'The phone doesn’t keep score — just count. Want a forfeit? Have the lowest scorer draw from “Action cards” in Game night helpers.',
  ],
  rulesBack: '← Back to the game',
};
