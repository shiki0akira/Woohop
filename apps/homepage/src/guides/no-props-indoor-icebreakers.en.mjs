// "10 no-prop indoor icebreakers" — English. Game names, chants and examples follow the English rules pages. Structure: src/guides.mjs.
export default {
  min: 7,
  title: '10 indoor icebreakers with no props',
  desc: 'For classrooms, meeting rooms and small groups — the host just opens a web page on one phone. Sorted by space and group size.',
  h1: '10 indoor icebreaker games with no props: all you need is one phone',
  seoTitle: '10 Indoor Icebreaker Games With No Props (Just One Phone) | Woohop',
  seoDesc: 'No-prop indoor icebreakers: Pop-Up Count, Elevator, Concentration, Red Light, Green Light: Action Edition, Higher or Lower and more — with group sizes, timing and hosting tips.',
  lead: [
    'Asked to run an icebreaker on the spot, with nothing to hand? Every game in this list **needs no props**: no pens and paper, no ball, nothing to print. The host opens a web page on one phone and that’s it — the phone keeps the beat, deals out the prompts, runs the timer and even serves up the truth-or-dare questions. No app to download, no sign-up.',
    'The games are grouped by how much space you have: ones that get everyone on their feet, ones you play standing in a circle to a beat, and ones you play sitting down, passing a single phone around. Pick one from the table, then read on for how to lead it.',
  ],
  blocks: [
    { h2: 'At a glance: which one fits your group' },
    {
      table: {
        head: ['Game', 'Players', 'One round', 'Space'],
        rows: [
          ['bamboo', '4–20', '1–2 min', 'Room to crouch and stand'],
          ['statue', '4–50', 'As long as you like', 'Some open floor'],
          ['charades', '2–30', '~10 min for 6 players', 'A little space up front'],
          ['stairs', '4–30', 'As long as you like', 'Stand in a circle'],
          ['orchard', '4–30', 'As long as you like', 'Stand in a circle'],
          ['bomb', '4–15', '~10 min for 3–5 rounds', 'Seated, pass the phone'],
          ['password', '3–20', '2–5 min', 'Seated, pass the phone'],
          ['cup', '2–12', '2–5 min', 'Seated, pass the phone'],
          ['seconds', '2–20', '~3 min', 'Seated, pass the phone'],
          ['reverse', '2–20', 'One prompt each', 'Seated, pass the phone'],
        ],
      },
    },
    { p: 'A big crowd (30+) and no wish to split into groups? Go for Red Light, Green Light: Action Edition. Only two or three of you? One Drop Too Many, Stop the Clock or the Reverse Audio Challenge. If people are meeting for the first time and still a bit stiff, start with the seated games and get everyone up once the room has warmed up.' },

    { h2: 'Get on your feet: after lunch or a long sit' },
    { p: 'Halfway through a meeting, second lesson of the morning, everyone drowsy after a meal — these three get the whole room up and laughing, and afterwards people sit back down ready for whatever comes next.' },
    {
      game: 'bamboo',
      need: '4–20 players · 1–2 min a round · one phone for the host',
      p: [
        'Everyone crouches down like a bamboo shoot and chants “bamboo, bamboo, pop up now!”. Then anyone can stand up and call the next number, starting from 1. The catch comes when **two people pop up at the same time**: they race to shout each other’s name, and the slower one has to crouch again. Whoever is still crouching at the end loses.',
        'There’s no turn order, so everyone is guessing whether now is a safe moment to stand — and the room keeps cracking up. The phone deals everyone a silly name (or just use real names). Shouting “Captain Noodle!” in a collision is funnier than shouting “Sam!”, and it helps people remember each other too.',
      ],
      tip: 'Once the names are drawn, hold the phone up so everyone can see the list. Let the group judge who was first; all the host has to do is call “Collision!”.',
    },
    {
      game: 'statue',
      need: '4–50 players · as long as you like · some open floor + the host’s phone',
      p: [
        'It’s Red Light, Green Light, but everyone first draws a move card on the phone: ride a motorbike, crab walk… When It calls “Green light!”, you move forward **the way your card says**. When It turns around on “Red light!”, anyone still moving — or not moving their way — is caught.',
        'This is the game on the list that copes best with a big crowd; it works with 50 people. Adults often feel a bit silly playing the original, but the move cards actually help people let go, because everyone looks equally ridiculous.',
      ],
      tip: 'Make sure the floor is clear and wide enough. It can play with the timing — a long, drawn-out “Greeeen… RED light!” gets the biggest laughs. To finish, whoever tagged It last picks a move for It to perform while everyone grabs a photo burst.',
    },
    {
      game: 'charades',
      need: '2–30 players · about 10 min for 6 players, one word each · the host’s phone',
      p: [
        'Take turns going up front and acting out the word on the phone: no talking, no sounds, no mouthing. Everyone else shouts guesses, and the first to get it scores a point.',
        'The usual headache with charades is that the host has to come up with the words. Here they’re ready-made in categories like animals, jobs, food and idioms; the actor can swap a word they can’t act before starting, and if everyone is stuck there are hints.',
      ],
      tip: 'For a first game, pick only “Animals” and “Everyday life”; add “Idioms” and “Funny situations” once people are comfortable. With a big group, split into two teams and play [Telephone Charades](game:charades-relay) instead.',
    },

    { h2: 'In a circle, to the beat: no running around, but brains on' },
    { p: 'These two are party-game classics that used to rely on the host clapping out the rhythm. Now the phone keeps the beat and can speed it up little by little, so the host is free to watch for mistakes. Stand or sit in a circle — no moving around needed.' },
    {
      game: 'stairs',
      need: '4–30 players · as long as you like · the host’s phone',
      p: [
        'Number off around the circle — Floor 1, Floor 2, Floor 3… To the phone’s four-beat count, Floor 1 chants “One, up, to, four!”, and Floor 4 has to answer on the next four beats: “Four, down, to, two!”. The wrong direction (Floor 4 can’t go “down to five”), a floor that doesn’t exist, a missed turn or jumping in uncalled all count as a mistake, and whoever slips moves to Floor 1.',
        'The rules take a minute to explain, but the faster it goes, the more tongues get tied. And because the loser changes places, all the floors keep shifting — everyone has to keep remembering which floor they’re on now.',
      ],
      tip: 'Start slow and speed up once the group gets the hang of it (the phone can also speed up on its own). The host just calls “Out!” and moves the person who slipped to Floor 1.',
    },
    {
      game: 'orchard',
      need: '4–30 players · as long as you like · the host’s phone',
      p: [
        'Chant together to the beat, “The category is…”, and the host names a category — say, “Breakfast”. Then the phone counts clap, clap, say: everyone claps on the first two beats, and on the third, whoever’s turn it is names something that fits — “clap, clap, pancakes”, “clap, clap, bacon”… No repeats, nothing off-category, and freezing too long also means you’re out.',
        'The phone can pick a random category, or you can choose one that fits the occasion — “places at school” for a new-student orientation, “things in an office” for a work event — so the game leads straight into the topic of the day.',
      ],
      tip: 'The host decides how long is too long: be generous at first and stricter as you go. When someone loses, switch categories and start with them.',
    },

    { h2: 'Seated, passing one phone: best for people who’ve just met' },
    { p: 'In all five of these, a single phone goes round the group and each person only has one small thing to do on their turn. Nobody has to stand up front or introduce themselves, so even shy people feel no pressure. They work in a classroom, a meeting room or a restaurant booth.' },
    {
      game: 'bomb',
      need: '4–15 players · ~10 min for 3–5 rounds · one phone',
      p: [
        'A task appears on the phone; whoever is holding it does it on the spot, then passes it on. You can choose questions (like “What do you eat for breakfast most often?”) or actions. Nobody knows when the bomb will go off — whoever is holding it when it does, loses.',
        'It makes a great first game: the questions are light enough to answer in one sentence, and while everyone is busy nervously passing the phone, they end up learning a little about each other without noticing.',
      ],
      tip: 'With lots of new faces, start with questions only and add actions once people know each other a bit. If someone freezes, call “Next!” and keep the pace going. Pick the fuse length for your group size — the screen suggests one.',
    },
    {
      game: 'password',
      need: '3–20 players · 2–5 min a round · one phone',
      p: [
        'The phone secretly picks a number (say, 1–100) and everyone takes turns guessing. Too high or too low and the range shrinks: guess 40, hear “Higher!”, and it becomes 41–100. The range keeps closing in, there’s less and less room to dodge, and **whoever hits the secret number explodes**.',
        'In the old version someone had to keep the number in their head; now the phone does it, so the host can play too. There’s nothing to explain, which makes it ideal when grandparents and kids are playing together.',
      ],
      tip: 'Read the new range out loud after every guess (“41 to 100!”) and the tension builds fast. Give everyone five seconds to guess for a quicker pace. With a big group, use 1–1000.',
    },
    {
      game: 'cup',
      need: '2–12 players · 2–5 min a glass · one phone',
      p: [
        'Take turns adding water to the same glass: tap to start the water, tap again to stop. Pour as much as you dare, then pass the phone on. Once the water reaches the rim, surface tension holds it up in a dome — it looks about to spill, but it isn’t yet. Whoever makes it overflow loses.',
        'Each round draws one of eight containers at random, and a wine glass fills very differently from a narrow-necked bottle, so it doesn’t get old. It’s especially handy for small groups — it works with just two players.',
      ],
      tip: 'Choose the glass size for your group before you start (small for 2–5, medium for 6–9, large for 10–12). Keep the sound on: the pitch of the pouring water tells you how full it is.',
    },
    {
      game: 'seconds',
      need: '2–20 players · about 3 min a round · one phone passed around',
      p: [
        'The phone shows a target time, like 7.35 seconds. On your turn, tap to start, count in your head and tap again when you think you’ve hit it. The numbers are only visible for the first few seconds, then it’s all down to feel. The three closest make the podium.',
        'Each player only taps twice and doesn’t have to say a word, so this is the easiest game on the list to join in. While someone is counting, the room goes quiet on its own and everyone watches — and the cheer for “only 0.02 off!” lifts the mood instantly.',
      ],
      tip: 'For a harder game, show the numbers for just one second; with kids, leave them up for three. You can also ask everyone to predict who’ll be closest beforehand.',
    },
    {
      game: 'reverse',
      need: '2–20 players · one prompt each · one phone',
      p: [
        'Someone records a line and the phone plays it backwards — it sounds like an alien language. The next person copies that gibberish into the phone, then flips it back to hear what they actually said, and everyone guesses the original line.',
        'The fun is all in the copying: the harder you commit to the weird sounds, the funnier it is when it’s flipped back. No ideas for a prompt? The phone has prompts to draw — make a sentence with a word, or hum a song.',
      ],
      tip: 'Give the first prompt yourself; one demo and everyone gets it. Keep lines short — 3–5 seconds is perfect. Anything longer gets so hard backwards that nobody can guess it.',
    },

    { h2: 'Four things to remember before you start' },
    {
      ul: [
        '**Turn the volume up**: Elevator and Concentration depend on hearing the beat. With a bigger group, connect a small speaker or hold a microphone near the phone.',
        '**Play one round before you explain**: explaining the rules three times is worse than the host playing once. Every game’s rules page has a short “Say this” script you can read out.',
        '**Keep forfeits light**: the loser doesn’t need a penalty at all. If you want one, most of the games have a truth-or-dare slot to spin, so you don’t have to think one up.',
        '**Go from seated to standing**: if you’re playing two or three, start with a seated warm-up, then a beat game, and finish with one that gets people moving. For a ready-made order, try the [icebreaker combo](page:combo): pick how long you have and it builds a warm-up-then-get-to-know-you set, with what to say at each step.',
      ],
    },

    { h2: 'Frequently asked questions' },
    {
      faq: [
        ['Do I really not need any props?', 'Really. All ten games just need the host’s phone (it runs in the browser — no app, no sign-up). Red Light, Green Light: Action Edition also needs a bit of open floor. If you’d like to play One Drop Too Many for real, you can add a clear glass and a jug of water, but the phone version is plenty.'],
        ['What if there are more than 30 people?', 'Red Light, Green Light: Action Edition works with 50 at once. In Elevator and Concentration a huge circle means long waits between turns, so split into two or three circles with a phone each.'],
        ['Isn’t this too childish for adults?', 'Adults tend to get surprisingly competitive in Pop-Up Count and Elevator, because the faster it goes, the easier it is to slip up. For a work event or a more formal setting, it’s safer to open with Time Bomb (questions only), Stop the Clock or Higher or Lower.'],
      ],
    },
    { p: 'Want more? Head to [Find games](page:games) and filter by group size, time and whether you need phones. Every game is free.' },
  ],
};
