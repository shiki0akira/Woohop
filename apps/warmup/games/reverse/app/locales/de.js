/*
 * Deutsch. Keys und Listenlängen wie zh-TW (der Build prüft das).
 * Kein festes deutsches Spiel dafür gefunden, darum ein selbsterklärender Name (CONCEPT.md Abschnitt 4). Begriffe aus dem deutschen Alltag.
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Rückwärts-Challenge | Stimme rückwärts abspielen, nachsprechen, umdrehen und raten',
  seoDesc:
    'Eine Person nimmt einen Satz auf, das Handy spielt ihn rückwärts ab, und alle sprechen das Kauderwelsch nach – dann wird die Aufnahme wieder umgedreht und geraten, was gesagt wurde. Das Handy verteilt die Aufgaben (Satz bilden, summen, frei), ihr könnt ein Handy herumgeben oder jeder auf dem eigenen Handy um die Wette raten. Ohne App, ohne Anmeldung; die Aufnahmen bleiben auf deinem Handy.',
  rulesSeoTitle: 'Rückwärts-Challenge: Regeln und Tipps für die Spielleitung',
  rulesSeoDesc: 'So geht die Rückwärts-Challenge: wie viele Leute, wie man Aufgaben stellt, wie man den Rückwärts-Ton nachspricht, reihum raten oder um die Wette, dazu ein Text zum Vorlesen für die Spielleitung.',

  navTitle: 'Rückwärts-Challenge',
  navRules: 'Regeln',
  gameBack: 'Zurück',
  rulesLinkText: 'Alle Regeln →',

  heroTitle: 'Rückwärts-Challenge: rückwärts abspielen, nachsprechen, wieder umdrehen',
  heroDesc: 'Nimm einen Satz auf, und das Handy spielt ihn rückwärts ab – klingt wie eine Alien-Sprache. Sprich das Kauderwelsch nach, dreh es wieder um und finde heraus, wer den Satz zuerst errät!',

  lead: {
    setup: ['Einstieg', 'Wir spielen die Rückwärts-Challenge! Jemand nimmt einen Satz auf, das Handy spielt ihn rückwärts ab, und wir alle sprechen ihn nach – dann drehen wir ihn wieder um und hören, was eigentlich gesagt wurde.'],
    rules: ['Regeln', 'Wir stellen reihum Aufgaben: Wer dran ist, schaut heimlich auf die Aufgabe und nimmt einen Satz auf. Das Handy spielt ihn rückwärts für alle ab. Dann sprechen wir das komische Geräusch nach, drehen es um und raten den Satz!'],
    end: ['Geschafft!', 'Ihr seid richtig gut im Nachsprechen! Wer klang am ähnlichsten, wer hat zuerst geraten? Für eine neue Runde auf „Noch mal spielen“ tippen.'],
  },
  playTitle: 'Los geht’s!',
  playSay: {
    draw: '{who} ist dran! Zieh eine Aufgabe – und lass niemanden draufschauen.',
    reveal: 'Gemerkt? Dann Karte verdecken und bereit machen zum Aufnehmen.',
    record: 'Tippe auf „Aufnahme starten“, sag einen Satz zur Aufgabe und tippe auf „Stopp“ – das Handy spielt ihn rückwärts ab.',
    guessOne: 'Spielt es rückwärts für alle ab! Gebt das Handy weiter, die nächste Person spricht nach und dreht es wieder um.',
    guessEach: 'Spielt es rückwärts für alle ab! Alle sprechen auf dem eigenen Handy nach, drehen es um – wer es zuerst weiß, ruft es laut!',
  },
  whoNext: 'Person {n}',
  ruleCards: [
    ['Heimlich schauen und aufnehmen', 'Wer dran ist, zieht eine Aufgabe: einen Satz mit einem Wort bilden, ein Lied summen oder frei etwas sagen. Das Handy dreht die Aufnahme um.'],
    ['Das Kauderwelsch nachsprechen', 'Hört euch den Rückwärts-Ton an, sprecht ihn genauso nach und dreht ihn wieder um – das klingt erstaunlich nah am Original.'],
    ['Den Satz erraten', 'Keine Ahnung? Erst den Tipp anschauen, dann mit dem Original auflösen. Danach stellt die nächste Person eine Aufgabe.'],
  ],
  rulesNext: 'Weiter: spielen',

  startButton: 'Spiel starten',
  countLabel: 'Personen',
  countLess: 'Eine Person weniger',
  countMore: 'Eine Person mehr',
  perLabel: 'Aufgaben pro Person',
  per1: '1',
  per2: '2',
  perFree: 'Offen',
  roundsHint: '{total} Runden: Alle stellen reihum Aufgaben, dann ist Schluss.',
  roundsFreeHint: 'Offen: Spielt, so lange ihr wollt, und haltet am Ende „Beenden“ gedrückt.',
  modeLabel: 'Raten',
  modeOne: 'Reihum',
  modeEach: 'Um die Wette',
  modeOneHint: 'Ein Handy reicht: Nach der Aufnahme geht das Handy weiter, die nächste Person spricht nach und dreht es um.',
  modeEachHint: 'Alle scannen den QR-Code, öffnen den Rekorder, sprechen nach und drehen um – wer es zuerst weiß, ruft es laut!',
  recOnlyLink: 'Ich rate nur – nur den Rekorder bitte',

  kindNames: { sentence: 'Satz', hum: 'Summen', free: 'Frei' },
  sentenceTask: 'Sag einen Satz mit „{word}“',
  roundNo: 'Runde {n} / {total}',
  roundNoFree: 'Runde {n}',
  drawButton: 'Aufgabe ziehen',
  drawHint: 'Nur wer dran ist, darf schauen!',
  revealHint: 'Gemerkt? Verdecken 👇',
  coverButton: 'Verdecken',
  cardShuffle: 'Andere Aufgabe',
  coveredText: 'Aufgabe verdeckt',
  peekAgain: 'Noch mal schauen',
  hintButton: 'Tipp',
  hintLine: 'Tipp: {hint}',
  hintWord: '„{word}“',
  answerButton: 'Auflösen',
  prompts: {
    sentence: [
      // Nomen
      'Banane', 'Brezel', 'Gewitter', 'Außerirdischer', 'Pizza', 'U-Bahn', 'Butterbrot', 'Katze', 'Dinosaurier', 'Eis',
      'Zahnbürste', 'Wecker', 'Geburtstagskuchen', 'Fahrrad', 'Regenschirm', 'Ananas', 'Currywurst', 'Konzert', 'Kaffee', 'Pinguin',
      'Handy', 'Lehrerin', 'Superheld', 'Aufzug', 'Wassermelone', 'Weihnachtsmann', 'Hamburger', 'Panda', 'Strand', 'Regenbogen',
      'Föhn', 'Gummibärchen', 'Kühlschrank', 'Roboter', 'Schokolade',
      // Verben
      'schwimmen', 'niesen', 'tanzen', 'schlafen', 'Zähne putzen', 'duschen', 'singen', 'sich verlaufen', 'telefonieren', 'Schlange stehen',
      'eine Diät machen', 'zu spät kommen', 'ein Selfie machen', 'streiten', 'umziehen',
      // Adjektive und Gefühle
      'wütend', 'müde', 'hungrig', 'eiskalt', 'überglücklich', 'nervös', 'peinlich', 'total erschöpft', 'lecker', 'viel zu scharf',
      'schüchtern', 'gelangweilt',
      // Situationen
      'in der U-Bahn', 'beim ersten Date', 'am Wochenende', 'an einem Regentag', 'am Abend vor der Prüfung', 'an Silvester', 'auf dem Weihnachtsmarkt', 'an meinem Geburtstag', 'um drei Uhr nachts', 'am Montagmorgen',
      // Bindewörter
      'aber', 'wenn', 'weil', 'obwohl', 'während', 'immer mehr', 'nicht nur … sondern auch', 'plötzlich', 'endlich', 'eigentlich',
      'sobald', 'trotzdem',
    ],
    hum: ['Summ ein Kinderlied', 'Summ einen Hit, den alle kennen', 'Summ eine Werbemelodie oder ein Titellied', 'Summ ein Lied, das du gerade oft hörst'],
    free: ['Sag, was du heute am liebsten sagen willst', 'Sag einen Zungenbrecher', 'Sag deinen Lieblingsspruch', 'Zitier einen Satz aus einem Film oder Zeichentrick'],
  },

  recordHeading: 'Aufgabe aufnehmen',
  recordHint: 'Sag einen Satz zur Aufgabe (bis zu 15 Sekunden). Dann raten alle.',
  guessHeading: 'Für alle abspielen',
  guessHint: 'Gut zuhören – ihr könnt es so oft abspielen, wie ihr wollt.',
  askReverse: 'Rückwärts',
  redoLink: 'Nicht zufrieden? Neu aufnehmen',
  stageCopy: 'Die nächste Person spricht nach',
  stageCopyOne: 'Handy weitergeben: den Rückwärts-Ton anhören, genauso nachsprechen, dann auf „Wieder umdrehen“ tippen und den Satz raten.',
  copyMine: 'Meine Version',
  copyReverse: 'Wieder umdrehen',
  qrAlt: 'QR-Code, der den Rekorder öffnet',
  stuckHeading: 'Keine Ahnung?',
  nextLocked: 'Erst mit „Auflösen“ das Original anhören, dann geht es weiter.',
  nextRound: 'Nächste Runde',
  lastRound: 'Fertig – zum Ende',
  // 要按住才會結束，防手滑（跟果園菜園動物園、竹筍同一個做法）
  endGame: 'Gedrückt halten zum Beenden',
  againButton: 'Noch mal spielen',

  recOnlyTitle: 'Rückwärts-Rekorder',
  recOnlyDesc: 'Nimm den Rückwärts-Ton oder deine Version auf und tippe auf „Rückwärts“.',
  recOnlyMine: 'Original',
  recOnlyReverse: 'Rückwärts',
  recOnlyBack: '← Ich will eine Aufgabe stellen',

  leaveTitle: 'Zurück zum Anfang?',
  leaveDesc: 'Die Aufnahme dieser Runde wird gelöscht.',
  leaveConfirm: 'Zum Anfang',
  leaveCancel: 'Weiterspielen',

  rulesTitle: 'So geht die Rückwärts-Challenge',
  rulesIntro: 'Reihum stellt jemand eine Aufgabe: einen Satz aufnehmen, das Handy spielt ihn rückwärts ab. Die anderen sprechen das Kauderwelsch nach, drehen es wieder um und raten, was gesagt wurde.',
  rulesFacts: [
    ['Personen', '2–20'],
    ['Dauer', 'Eine Aufgabe pro Person oder so lange ihr wollt'],
    ['Ihr braucht', 'Ein Handy; in größeren Gruppen kann jeder auf dem eigenen Handy um die Wette raten'],
  ],
  rulesHowHeading: 'So wird gespielt',
  rulesHowSteps: [
    'Reihum stellt jemand eine Aufgabe. Wer dran ist, zieht auf dem Handy eine Aufgabe: einen Satz mit einem Wort bilden, ein Lied summen oder frei etwas sagen.',
    'Aufgabe verdecken, „Aufnahme starten“ (bis zu 15 Sekunden), dann mit „Rückwärts“ für alle abspielen.',
    'Reihum: Das Handy geht weiter, die nächste Person spricht den Rückwärts-Ton nach und tippt auf „Wieder umdrehen“. Um die Wette (ab 4 Personen): Alle scannen den QR-Code, öffnen den Rekorder, sprechen nach, drehen um – wer es zuerst weiß, ruft es laut.',
    'Keine Ahnung? Erst den Tipp, dann mit „Auflösen“ das Original abspielen. Danach ist die nächste Person dran; wenn alle dran waren, ist Schluss.',
  ],
  rulesLeadHeading: 'Tipps für die Spielleitung',
  rulesLeadSay: 'Gleich nimmt jemand einen Satz auf, und das Handy spielt ihn rückwärts ab – klingt wie eine Alien-Sprache. Sprecht das genauso nach, dreht es wieder um und ratet, was eigentlich gesagt wurde! Reihum stellt jeder eine Aufgabe.',
  rulesLeadSteps: [
    'Stell die erste Aufgabe selbst – nach einer Runde haben es alle verstanden.',
    'Kurze Sätze sind leichter nachzusprechen: 3–5 Sekunden sind ideal. Längeres errät rückwärts niemand.',
    'Beim Nachsprechen nicht schüchtern sein – je schräger es klingt, desto lustiger wird es umgedreht.',
  ],
  rulesBack: '← Zurück zum Spiel',
};
