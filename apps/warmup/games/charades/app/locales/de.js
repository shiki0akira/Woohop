/*
 * Deutsch. Auf Partys sagt man „Pantomime“ (Scharade ist selten). Begriffe sind für den deutschsprachigen Raum gewählt,
 * keine Übersetzung; „Redewendungen“ sind deutsche Redewendungen, die man darstellen kann. Hinweise decken Buchstaben auf.
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Pantomime-Spiel | Begriffe-Generator fürs Handy – mit Tipps, wenn keiner draufkommt',
  seoDesc:
    'Pantomime-Begriffe vom Handy: Tiere, Berufe, Sport, Alltag, Essen, Unterwegs, Gegenstände, lustige Situationen und Redewendungen – Hunderte Begriffe, Kategorien frei wählbar. Reihum stellt jemand den Begriff stumm dar, bis ihn jemand errät; was nicht geht, wird übersprungen, und wenn alle festhängen, gibt es Tipps. Ohne App, ohne Anmeldung – für Partys, Teamevents und Spieleabende.',
  rulesSeoTitle: 'Pantomime-Spiel: Spielregeln, Kategorien und Tipps',
  rulesSeoDesc: 'Spielregeln fürs Pantomime-Spiel: wie viele Personen, wie es reihum geht, was verboten ist, wann geraten gilt, und ein Text zum Vorlesen für die Spielleitung.',

  navTitle: 'Pantomime-Spiel',
  navRules: 'Spielregeln',
  gameBack: 'Zurück',
  rulesLinkText: 'Alle Regeln →',

  heroTitle: 'Pantomime-Spiel – Begriff ziehen und darstellen: ohne ein Wort!',
  heroDesc: 'Reihum zieht jemand am Handy einen Begriff und stellt ihn stumm dar, alle anderen raten. Was nicht geht, wird übersprungen, und wenn alle festhängen, gibt es Tipps – wer errät, bekommt einen Punkt!',

  lead: {
    setup: ['Los geht’s', 'Wir spielen Pantomime! Zuerst stellen wir ein, wie viele mitspielen, wählen die Kategorien für heute und setzen uns in einen Kreis.'],
    rules: ['Die Regeln', 'Wir sind reihum dran. Wer dran ist, nimmt das Handy und zieht einen Begriff, dann wird er dargestellt – nicht reden, keine Geräusche, keine Lippenbewegungen. Alle anderen raten, bis jemand es hat, und der bekommt einen Punkt. Vor dem Start darf man einen Begriff überspringen; danach wird er verdeckt, und wenn alle wirklich festhängen, darf man einen Tipp geben: die Kategorie oder einen Buchstaben. Wer die meisten Punkte hat, gewinnt!'],
    end: ['Spielende!', 'Zählt nach, wie viele ihr erraten habt – wer die meisten hat, gewinnt!'],
  },
  ruleCards: [
    ['Reihum dran', 'Wer dran ist, nimmt das Handy und zieht einen Begriff. Nicht zeigen!'],
    ['Darstellen, nicht reden', 'Nicht reden, keine Geräusche, keine Lippenbewegungen und auf nichts im Raum zeigen.'],
    ['Erraten gibt Punkte', 'Weiter, bis jemand es errät – wer zuerst richtig liegt, bekommt einen Punkt. Hängt ihr fest? Tipp geben.'],
  ],
  rulesNext: 'Weiter: Spiel starten',

  categoryLabel: 'Kategorien',
  categoryHint: 'Beliebig viele wählen (mindestens eine)',
  countLabel: 'Wie viele spielen?',
  countLess: 'Eine Person weniger',
  countMore: 'Eine Person mehr',
  perLabel: 'Begriffe pro Person',
  per1: '1',
  per2: '2',
  perFree: 'Unbegrenzt',
  roundsHint: 'Insgesamt {total} Begriffe – reihum, und wenn alle durch sind, ist das Spiel vorbei.',
  roundsFreeHint: 'Unbegrenzt – zum Beenden „Spiel beenden“ gedrückt halten.',
  startButton: 'Spiel starten',

  roundNo: 'Begriff {n} von {total}',
  roundNoFree: 'Begriff {n}',
  turnWho: 'Person {k} ist dran',
  drawButton: 'Begriff ziehen',
  drawHint: 'Du bist dran! Zieh einen Begriff – nicht zeigen',
  startActing: 'Los geht’s!',
  skipButton: 'Überspringen',
  gotIt: 'Erraten!',
  peekButton: 'Zurück und Begriff ansehen',
  continueActing: 'Weiter darstellen!',
  hintKindButton: 'Kategorie verraten',
  hintCharButton: 'Buchstabe verraten',
  gotItResult: 'Erraten!',
  gotItHint: 'Wer es erraten hat, bekommt einen Punkt – merkt euch eure Punkte!',
  answerIs: 'Die Lösung war',
  nextTurn: 'Die nächste Person',
  seeResult: 'Zum Ergebnis',
  endGame: 'Gedrückt halten zum Beenden',
  againButton: 'Noch mal spielen',

  categories: [
    ['animals', 'Tiere', [
      'Känguru', 'Pinguin', 'Elefant', 'Giraffe', 'Affe', 'Krabbe', 'Krake', 'Schlange', 'Frosch', 'Hase',
      'Eule', 'Pfau', 'Krokodil', 'Koala', 'Delfin', 'Schmetterling', 'Biene', 'Hahn', 'Schildkröte', 'Löwe',
      'Adler', 'Eichhörnchen', 'Igel', 'Mücke', 'Hai', 'Gorilla', 'Nilpferd', 'Fledermaus', 'Spinne', 'Strauß',
      'Robbe', 'Panda', 'Faultier', 'Schnecke', 'Specht', 'Flamingo', 'Chamäleon', 'Dackel',
    ]],
    ['jobs', 'Berufe', [
      'Zahnarzt', 'Zauberer', 'Verkehrspolizist', 'Koch', 'Friseur', 'Feuerwehrmann', 'Fotograf', 'Flugbegleiterin', 'Dirigent', 'Paketbote',
      'Fitnesstrainer', 'Maler', 'Busfahrer', 'Gärtner', 'Ärztin', 'Lehrerin', 'Nachrichtensprecher', 'Türsteher', 'Boxer', 'DJ',
      'Wahrsagerin', 'Pilot', 'Fischer', 'Tierärztin', 'Astronaut', 'Detektiv', 'Clown', 'Bauer', 'Schreiner', 'Mechaniker',
      'Barkeeper', 'Reiseleiter', 'Cheerleader', 'Model', 'Sänger', 'Schornsteinfeger', 'Rettungsschwimmer', 'Braut',
    ]],
    ['sports', 'Sport', [
      'Schwimmen', 'Bogenschießen', 'Boxen', 'Hochsprung', 'Tischtennis', 'Badminton', 'Basketball', 'Fußball', 'Bowling', 'Golf',
      'Rudern', 'Skifahren', 'Surfen', 'Schlittschuhlaufen', 'Gewichtheben', 'Turmspringen', 'Fechten', 'Seilspringen', 'Radfahren', 'Yoga',
      'Klettern', 'Baseball', 'Tennis', 'Volleyball', 'Sumoringen', 'Weitsprung', 'Stabhochsprung', 'Kugelstoßen', 'Speerwerfen', 'Reiten',
      'Karate', 'Turnen', 'Eiskunstlauf', 'Schnorcheln', 'Skateboarden', 'Hula-Hoop', 'Tauziehen', 'Sackhüpfen',
    ]],
    ['daily', 'Alltag', [
      'Zähneputzen', 'Volle U-Bahn', 'Regenjacke anziehen', 'Selfie machen', 'Niesen', 'Schuhe binden', 'Haare föhnen', 'Abwaschen', 'Videospiele zocken', 'Wäsche aufhängen',
      'Müll rausbringen', 'Dem Bus hinterherrennen', 'Gesichtsmaske', 'Schnäppchenjagd', 'Einnicken', 'Auf die Waage steigen', 'Glas aufschrauben', 'Nägel schneiden', 'Schlüssel suchen', 'Bügeln',
      'Regenschirm aufspannen', 'Mücke erschlagen', 'Rücken kratzen', 'In den Spiegel schauen', 'Boden wischen', 'Schminken', 'Rasieren', 'Bett machen', 'Blumen gießen', 'Gassi gehen',
      'Gähnen', 'Strecken', 'Am Handy scrollen', 'Einparken', 'Tippen', 'Kontaktlinsen einsetzen',
    ]],
    ['food', 'Essen', [
      'Spaghetti essen', 'Banane schälen', 'Bubble Tea trinken', 'Wassermelone essen', 'Grillen', 'Eis essen', 'Hummer knacken', 'Scharfe Chili essen', 'Pizza belegen', 'Marshmallows rösten',
      'Maiskolben essen', 'Geburtstagskerzen auspusten', 'Heiße Suppe schlürfen', 'Döner essen', 'Pfannkuchen wenden', 'Spiegelei braten', 'Orange schälen', 'Brezel essen', 'Nudeln schlürfen', 'Popcorn essen',
      'Zwiebeln schneiden', 'Limo aufmachen', 'Sushi mit Stäbchen essen', 'Käsefäden ziehen', 'In eine Zitrone beißen', 'Kaffee trinken', 'Kuchen essen', 'Kaugummi kauen', 'Bratwurst essen', 'Am Lutscher lecken',
      'Fondue', 'Weißwurst zuzeln', 'Milchshake schütteln', 'Brot schneiden',
    ]],
    ['vehicles', 'Unterwegs', [
      'Motorrad fahren', 'Auto fahren', 'Fliegen', 'Zug fahren', 'Fahrrad fahren', 'Kajak paddeln', 'Schiff steuern', 'Aufzug fahren', 'Achterbahn fahren', 'Reiten',
      'Panzer', 'Heißluftballon', 'Hubschrauber', 'Einrad fahren', 'Seilbahn', 'Bagger fahren', 'Tretroller', 'Kinderwagen schieben', 'Feuerwehrauto', 'Karussell',
      'U-Boot', 'Rolltreppe', 'Taxi heranwinken', 'Lkw fahren', 'Kamelreiten', 'Raketenstart', 'Einkaufswagen schieben', 'Krankenwagen', 'Schlitten fahren', 'Traktor fahren',
    ]],
    ['objects', 'Gegenstände', [
      'Regenschirm', 'Föhn', 'Staubsauger', 'Zahnbürste', 'Taschenlampe', 'Fernglas', 'Schere', 'Tacker', 'Wecker', 'Selfiestick',
      'Ventilator', 'Mikrowelle', 'Waschmaschine', 'Spiegel', 'Kamm', 'Kissen', 'Wischmopp', 'Besen', 'Fliegenklatsche', 'Feuerzeug',
      'Kamera', 'Kopfhörer', 'Mikrofon', 'Tastatur', 'Fernbedienung', 'Helm', 'Koffer', 'Hängematte', 'Jo-Jo', 'Drachen',
      'Steinschleuder', 'Angel', 'Pfeil und Bogen', 'Gehstock', 'Fallschirm', 'Kerze', 'Glocke', 'Kuckucksuhr',
    ]],
    ['scenes', 'Lustige Situationen', [
      'Auf einer Bananenschale ausrutschen', 'Von einer Mücke gestochen werden', 'Etwas sehr Scharfes essen', 'Jemand pupst im Aufzug', 'Getränk umkippen', 'Steinchen im Schuh', 'Vom Blitz getroffen werden', 'Auf Glatteis ausrutschen', 'Keine Toilette finden', 'Verschlafen',
      'Von einem Hund gejagt werden', 'Reißverschluss kaputt', 'Handy fällt ins Klo', 'Zunge an heißer Suppe verbrennen', 'Hand in der Tür einklemmen', 'Gegen einen Laternenpfahl laufen', 'Schluckauf, der nicht aufhört', 'Eingeschlafenes Bein', 'Kein warmes Wasser unter der Dusche', 'Frisur vom Wind zerzaust',
      'Chef erwischt dich beim Faulenzen', 'Horrorfilm schauen', 'Lotto-Gewinn', 'Spicken in der Prüfung', 'Erstes Date', 'Sich verlaufen', 'Pulli verkehrt herum an', 'Einen Dieb fangen', 'Vom Vogel getroffen werden', 'Erste Reihe beim Konzert',
    ]],
    ['idioms', 'Redewendungen', [
      'Die Daumen drücken', 'Tomaten auf den Augen haben', 'Ins Fettnäpfchen treten', 'Die Katze aus dem Sack lassen', 'Auf den Arm nehmen', 'Den Nagel auf den Kopf treffen', 'Schwein haben', 'Ins kalte Wasser springen', 'Kalte Füße bekommen', 'Den Kopf in den Sand stecken',
      'Mit dem falschen Fuß aufstehen', 'Zwei Fliegen mit einer Klappe schlagen', 'Auf Wolke sieben schweben', 'Eine Eselsbrücke bauen', 'Jemandem einen Bären aufbinden', 'Die Nase voll haben', 'Durch die Blume sagen', 'Wie ein Elefant im Porzellanladen', 'Die Ohren steif halten', 'Hals über Kopf',
      'Sich ein Bein ausreißen', 'Den Faden verlieren', 'Mit den Hühnern ins Bett gehen', 'Ein Brett vor dem Kopf haben', 'Auf dem Holzweg sein', 'Den Löffel abgeben', 'Alles in Butter', 'Um den heißen Brei herumreden', 'Ins Gras beißen', 'Luftschlösser bauen',
    ]],
  ],

  leaveTitle: 'Zurück zum Anfang?',
  leaveDesc: 'Das Spiel beginnt von vorne.',
  leaveConfirm: 'Zurück zum Anfang',
  leaveCancel: 'Weiterspielen',

  rulesTitle: 'Pantomime-Spiel: So wird’s gespielt',
  rulesIntro: 'Reihum stellt jemand den Begriff vom Handy stumm dar, alle anderen raten. Wer errät, bekommt einen Punkt, und wer die meisten Punkte hat, gewinnt.',
  rulesFacts: [
    ['Personen', '2–30'],
    ['Dauer', 'Je nach Anzahl – 6 Personen mit je 1 Begriff dauern etwa 10 Minuten'],
    ['Material', 'Das Handy der Spielleitung'],
  ],
  rulesHowHeading: 'Ablauf',
  rulesHowSteps: [
    'Stellt ein, wie viele mitspielen und wie viele Begriffe pro Person, dann wählt die Kategorien (Tiere, Berufe, Sport, Alltag, Essen, Unterwegs, Gegenstände, lustige Situationen, Redewendungen – beliebig viele).',
    'Setzt euch in einen Kreis. Die erste Person nimmt das Handy und zieht einen Begriff, ohne ihn zu zeigen.',
    'Auf „Los geht’s!“ tippen und darstellen: nicht reden, keine Geräusche, keine Lippenbewegungen und auf nichts im Raum zeigen.',
    'Alle raten, bis jemand es hat; wer zuerst richtig liegt, bekommt einen Punkt, und die darstellende Person tippt auf „Erraten!“. Was sich nicht darstellen lässt, kann man vor dem Start überspringen.',
    'Nach dem Start ist der Begriff verdeckt, nur die Anzahl der Buchstaben ist zu sehen – wer ihn vergisst, geht kurz zurück. Hängen alle fest, gibt es einen Tipp: „Kategorie verraten“ oder „Buchstabe verraten“, dann das Handy herzeigen. Wenn alle Begriffe durch sind, gewinnt, wer die meisten Punkte hat.',
  ],
  rulesLeadHeading: 'Tipps für die Spielleitung',
  rulesLeadSay: 'Wir spielen Pantomime! Reihum stellt jemand den Begriff vom Handy dar – nicht reden, keine Geräusche. Alle anderen raten, und wer zuerst richtig liegt, bekommt einen Punkt, also merkt euch eure Punkte. Was nicht geht, darf man überspringen, und wenn wir festhängen, gibt es Tipps. Wer die meisten Punkte hat, gewinnt!',
  rulesLeadSteps: [
    'Für die erste Runde nur „Tiere“ und „Alltag“ nehmen, später „Redewendungen“ und „Lustige Situationen“ dazu – dann wird’s richtig lustig.',
    'Wer zuerst richtig geraten hat, entscheidet die darstellende Person; rufen zwei gleichzeitig, bekommen beide einen Punkt.',
    'Das Handy zählt keine Punkte – zählt selbst. Lust auf eine Strafaufgabe? Wer am wenigsten hat, zieht bei den „Spielhelfern“ eine „Bewegungskarte“.',
  ],
  rulesBack: '← Zurück zum Spiel',
};
