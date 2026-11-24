// "Icebreakers for big groups (30+)" — English. Game names and examples follow the English game pages. Structure: src/guides.mjs.
export default {
  min: 6,
  title: 'Icebreakers for big groups of 30+',
  desc: 'Big crowd, hard to lead? These 6 work with 30–50 people: everyone on their phone at once, everyone moving, or split into teams in seconds.',
  h1: 'Icebreaker games for big groups (30+): 6 the whole room can play at once',
  seoTitle: '6 Icebreaker Games for Big Groups of 30+ | Woohop',
  seoDesc: 'Big-group icebreakers that work with 30–50 people: Buzzer Game, Happy Bingo, This or That, Red Light, Green Light: Action Edition, Telephone Charades and Picture Telephone — with tips for leading a crowd.',
  lead: [
    'Once a group passes 30, lots of icebreakers stop working: going round one person at a time takes ten minutes or more, and the back rows end up scrolling on their phones. A big group needs **everyone to have something to do at the same time** — not everyone waiting to watch one person perform.',
    'The six games here all hold up with 30–50 people, in three styles: ones where everyone plays on their own phone, ones where the whole room moves together with no phones, and ones where you split into teams that compete at the same time. All free, all in the browser — players join by scanning a QR code, no app to download.',
  ],
  blocks: [
    { h2: 'At a glance: group size and what you need' },
    {
      table: {
        head: ['Game', 'Players', 'Time', 'You need'],
        rows: [
          ['buzzer', '2–50', '~1 min a question', 'A phone each, ideally a projector'],
          ['bingo', '2–50', '10–20 min', 'A phone each'],
          ['match', '5–30', '~8 min', 'A phone each'],
          ['statue', '4–50', 'As long as you like', 'Open floor + the host’s phone'],
          ['charades-relay', '3–10 per team', '~5 min per team', 'Room for a line'],
          ['drawing-relay', '3–10 per team', '~3 min a word for 5', 'One phone per team'],
        ],
      },
    },
    { p: 'Want people to **get to know each other**? Happy Bingo or This or That. Want to **warm the room up** first? Buzzer Game or Red Light, Green Light: Action Edition. Want a **team competition**? Either of the two relays. If you’re in a classroom with everyone seated, start with the Buzzer Game.' },

    { h2: 'Everyone on their own phone: the whole room plays at once' },
    { p: 'These three are “room” games: the host opens a room, a QR code appears on screen and everyone scans in with their own phone. Whether it’s 10 people or 50, everyone is answering or hunting at the same time — nobody is standing around waiting.' },
    {
      game: 'buzzer',
      need: '2–50 players + a host · ~1 min a question · a phone each, ideally project the host’s screen',
      p: [
        'The host asks a question and everyone’s phone becomes a buzzer. Buzzers only light up once the question has been read, and presses are ranked live, so it’s obvious who was fastest. The fastest answers first; get it wrong and it passes to second place.',
        'The big-group worry is “only the front row is playing” — buzzers turn that around, because someone in the very back can still be first. The questions are entirely up to you: tie them to the day (company history, course content, fun facts about the new people) or keep them silly.',
      ],
      tip: 'Project the host’s screen so everyone watches the ranking together. You can type questions in advance and send them so they show on everyone’s phone. A small prize or a points rule makes it far more competitive.',
    },
    {
      game: 'bingo',
      need: '2–50 players (best with 8+) · 10–20 min · a phone each',
      p: [
        'Everyone gets a bingo card where the squares aren’t numbers but kinds of people: “Someone who has a pet at home”, “Someone who wakes up before 6 a.m.”… Find someone who fits, chat for a moment, and they confirm **on their own phone** before you can tick the square. Complete a line and you’re on the leaderboard.',
        'This is the most useful get-to-know-you game for a big group: the more people, the more people to find, so everyone naturally gets up, walks around and talks to people they don’t know. And because the other person has to confirm, nobody can tick squares on their own.',
      ],
      tip: 'Check the squares before you start and swap out any that nobody — or only one person — will fit. With a big group that wants to play longer, set the game to end only once two or three people have finished.',
    },
    {
      game: 'match',
      need: '5–30 players (groups form from 6) · 8–10 questions, ~8 min · a phone each',
      p: [
        'For each question you choose “agree” or “disagree” before time runs out — there are no wrong answers. At the end, the people who think most alike are put in a group, along with topics you have in common to talk about.',
        'Big groups often need to split up, but groups made by counting off “1, 2, 3” have nothing to talk about. Groups from This or That start out with something in common, so the small-group discussion or activity that follows goes much more smoothly.',
      ],
      tip: 'Stick to 8–10 questions — more and people get tired. When time’s up on each one, take a few seconds to read out who picked which side; someone usually starts explaining. Once the groups are set, give them 5–10 minutes to chat using the topics on screen.',
    },

    { h2: 'No phones, the whole room moving: best when you have space' },
    { p: 'If the venue is big enough — a hall, a gym, a lawn outside — getting everyone up and moving warms the room faster than any phone game.' },
    {
      game: 'statue',
      need: '4–50 players · as long as you like · open floor + the host’s phone',
      p: [
        'Red Light, Green Light, but everyone first draws a move card on the host’s phone: ride a motorbike, crab walk… On “Green light!” everyone moves forward **the way their card says**; when It turns around on “Red light!”, anyone still moving — or not moving their way — is caught.',
        'Fifty people charging forward at once is funny all on its own. Adults can feel a bit silly with the original, but the move cards actually help people let go, because everyone looks equally ridiculous.',
      ],
      tip: 'With a big crowd, passing one phone around to draw cards takes a while, so have people queue up. There are 28 moves, so with more than 28 players some people will share a move — which only makes it funnier. Make sure the floor is wide and clear. It can play with the timing; a long drawn-out call gets the biggest laughs.',
    },

    { h2: 'Split into teams that play at once: turn one big group into several small ones' },
    { p: 'Some games are best with about 10 people, so split into teams. Both relays take 3–10 per team: three teams cover 30 people, four or five cover more. Competing on scores also builds more team spirit than simply taking turns.' },
    {
      game: 'charades-relay',
      need: '3–10 per team, more teams for more people · ~5 min per team · the host’s phone + room for a line',
      p: [
        'Each team stands in a line, facing away. The first person sees the word, turns round and acts it out for the next, and so on down the line until the last person says the answer. Everyone only gets a few seconds before the phone beeps and it moves on; the team with the most correct answers in its time wins.',
        'The funniest moment comes after the reveal: go back up the line asking “What did you think it was?” and everyone sees where the word went wrong. The other teams laugh just as hard watching, so nobody feels like they’re waiting.',
      ],
      tip: 'Give each team one round with the same time limit and compare scores. Two teams can also go head to head: equal numbers side by side, both leaders see the same word, the two last players race to answer, and the host keeps score.',
    },
    {
      game: 'drawing-relay',
      need: '3–10 per team, more teams for more people · ~3 min a word for 5 people · one phone per team',
      p: [
        'One phone goes down the line: the first person draws the word, the next sees only the previous drawing for 5 seconds and draws what they think it was, and so on until the last person guesses from the final picture. At the reveal, everyone’s drawings are laid out so you can see where it went off track.',
        'With a big group, each team plays at the same time on its own phone, and you see which team still gets the same word right at the end. Everything happens at once, nobody waits for other teams, and it works with everyone seated.',
      ],
      tip: 'When passing the phone, remind people whose turn hasn’t come to look away — seeing earlier drawings spoils it. After the reveal, go back through the pictures and ask each person what they thought they were drawing.',
    },

    { h2: 'Five keys to leading a big group' },
    {
      ul: [
        '**Open the room and project it before people arrive**: put the room game’s QR code on the big screen as people come in, so everyone can scan in as soon as they sit down and there’s no waiting when you start.',
        '**Check the connection**: every phone needs internet. In basements or big halls with poor signal, make sure the venue Wi-Fi works and put the network name and password on screen too.',
        '**A microphone matters more than anything**: with 30+ people, however clearly you explain the rules, it’s no use if the back can’t hear. Check the last row can hear you before you start.',
        '**Let a game make the teams**: when you need groups, let This or That sort people automatically, or just split by seating — don’t let people pick their own groups, or someone will be left out.',
        '**No more than three games in one session**: with a big group, every switch means explaining again and scanning in again. Two or three games played for longer beat lots of short ones. For an order, see the [icebreaker combo](page:combo).',
      ],
    },

    { h2: 'Frequently asked questions' },
    {
      faq: [
        ['What if there are more than 50 people?', 'Red Light, Green Light: Action Edition and both relays have no upper limit: the whole room plays Red Light, Green Light together, and for the relays you just add teams. The Buzzer Game and Happy Bingo take up to 50 per room; for more, split into two areas and open a room for each.'],
        ['Can we play without a projector?', 'Yes. In Happy Bingo and This or That everyone just looks at their own phone. Without a projector, the host of the Buzzer Game simply reads out the ranking — you only lose a bit of the shared atmosphere.'],
        ['Do players need to download an app?', 'No. For room games, players scan a QR code with their phone to join, pick an avatar and a nickname, and they’re in — no sign-up either.'],
      ],
    },
    { p: 'Smaller group, or just one small classroom? Try [10 indoor icebreaker games with no props](guide:no-props-indoor-icebreakers), or filter by group size in [Find games](page:games).' },
  ],
};
