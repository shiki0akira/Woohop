/*
 * Deutsch. Keys und Listenlängen wie in zh-TW.js (topics dürfen anders viele sein).
 * Kein direktes deutsches Gegenstück gefunden → beschreibender Name „Kategorien-Klatschen“.
 * Auftakt: „Eins, zwei, drei!“, danach nennt die Spielleitung das Thema.
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Kategorien-Klatschen | Kennenlernspiel im Takt mit Handy-Metronom und Wahrheit oder Pflicht',
  seoDesc:
    'Die Spielleitung nennt ein Thema – „Frühstück!“ – und alle klatschen im Takt: klatsch, klatsch, „Brötchen“; klatsch, klatsch, „Müsli“ … Nichts doppelt, nichts am Thema vorbei. Das Handy lost Themen aus (Obst, Zoo, Supermarkt …), gibt einen einstellbaren Takt vor, führt die Spielleitung durch die Regeln, und wer verloren hat, dreht am Wahrheit-oder-Pflicht-Automaten. Ohne Material, ohne Download, ohne Anmeldung.',
  rulesSeoTitle: 'Kategorien-Klatschen – Spielregeln und Text für die Spielleitung',
  rulesSeoDesc: 'So geht Kategorien-Klatschen: wie viele mitspielen, wie der Klatsch-Klatsch-Sag-Takt funktioniert, was als Fehler zählt, was danach passiert, plus ein kurzer Text zum Vorlesen und Themenideen.',

  navTitle: 'Kategorien-Klatschen',
  navRules: 'Spielregeln',
  gameBack: 'Zurück',
  rulesLinkText: 'Alle Regeln →',

  heroTitle: 'Kategorien-Klatschen: klatsch, klatsch, ein Wort – und nichts doppelt',
  heroDesc: 'Die Spielleitung nennt ein Thema, zum Beispiel „Zoo“, und alle sind reihum im Takt dran: klatsch, klatsch, „Löwe“; klatsch, klatsch, „Giraffe“ … Wer etwas wiederholt oder am Thema vorbei antwortet, ist raus.',

  lead: {
    setup: ['Los geht’s', 'Wir spielen Kategorien-Klatschen! Stellt euch alle im Kreis auf – gleich klatschen wir zusammen in meinem Takt.'],
    rules: ['Regeln erklären', 'Drei Schläge: klatsch, klatsch, sag – zweimal klatschen, beim dritten Schlag ein Wort. Zuerst rufen wir alle zusammen „Eins, zwei, drei!“, dann nenne ich das Thema, zum Beispiel „Frühstück“. Ab mir geht’s reihum, jeder nennt etwas zum Frühstück: klatsch, klatsch, Brötchen; klatsch, klatsch, Müsli … Nichts doppelt, nichts am Thema vorbei, und wer zu lange hängt, ist auch raus. Wer verliert, fängt mit einem neuen Thema an!'],
    play: ['Los!', 'Alle zusammen: „Eins, zwei, drei!“ Thema: „{topic}“ – {say}! Ich fange an.'],
    end: ['Wer hat verloren?', 'Alle, die raus waren: Wahrheit, Pflicht oder Zufall wählen und dann am Hebel ziehen!'],
  },
  ruleCards: [
    ['Thema nennen', 'Die Spielleitung nennt ein Thema – „Frühstück“ heißt Frühstückssachen, „Zoo“ heißt Tiere. Das Handy kann auch eins auslosen.'],
    ['Im Takt bleiben', 'Drei Schläge: klatsch, klatsch, sag. Erst alle zusammen „Eins, zwei, drei!“, dann das Thema, und wer dran ist, sagt beim dritten Schlag ein Wort.'],
    ['Doppelt? Raus!', 'Nichts doppelt, nichts am Thema vorbei, zu langes Hängen zählt auch (entscheidet die Spielleitung). Dann neues Thema, und wer verloren hat, fängt an.'],
  ],
  rulesNext: 'Weiter: Spiel starten',

  startButton: 'Spiel starten',
  soundLabel: 'Musik',

  chant: ['Eins,', 'zwei,', 'drei!'],
  topicSay: 'Nenne {say}',
  topicShuffle: 'Neues Thema',
  topicPick: 'Thema auswählen',
  topics: [
    ['Obstgarten', 'eine Obstsorte'],
    ['Gemüsebeet', 'ein Gemüse'],
    ['Zoo', 'ein Tier'],
    ['Supermarkt', 'etwas aus dem Supermarkt'],
    ['Frühstück', 'etwas zum Frühstück'],
    ['Café', 'ein Getränk'],
    ['Federmäppchen', 'etwas für die Schule'],
    ['Küche', 'ein Küchenutensil'],
    ['Sportfest', 'eine Sportart'],
    ['Unterwegs', 'ein Verkehrsmittel'],
    ['Weltkarte', 'ein Land'],
    ['Deutschlandkarte', 'eine Stadt'],
    ['Farbkasten', 'eine Farbe'],
    ['Zeichentrick', 'eine Zeichentrickfigur'],
    ['Berufe', 'einen Beruf'],
    ['Pizzeria', 'einen Pizzabelag'],
  ],

  endGame: 'Gedrückt halten zum Beenden',
  againButton: 'Noch mal spielen',

  leaveTitle: 'Zurück zum Anfang?',
  leaveDesc: 'Das Spiel beginnt von vorn, das Thema wird neu ausgelost.',
  leaveConfirm: 'Zurück zum Anfang',
  leaveCancel: 'Weiterspielen',

  rulesTitle: 'So spielt man Kategorien-Klatschen',
  rulesIntro: 'Die Spielleitung nennt ein Thema, und alle sind reihum im Takt „klatsch, klatsch, sag“ dran. Nichts doppelt, nichts am Thema vorbei. Wer verliert, fängt mit einem neuen Thema an.',
  rulesFacts: [
    ['Personen', '4–30'],
    ['Dauer', 'So lange ihr wollt'],
    ['Material', 'Nichts – nur das Handy der Spielleitung'],
  ],
  rulesHowHeading: 'Ablauf',
  rulesHowSteps: [
    'Stellt euch im Kreis auf und ruft im Takt zusammen „Eins, zwei, drei!“, dann nennt die Spielleitung das Thema, zum Beispiel „Frühstück“ (das Handy kann eins auslosen).',
    'Das Handy gibt drei Schläge vor: klatsch, klatsch, sag. Bei den ersten zwei klatschen alle, beim dritten nennt die Person, die dran ist, etwas zum Thema – etwa „Brötchen“.',
    'Die nächste Person ist bei den nächsten drei Schlägen dran – klatsch, klatsch, „Müsli“ – und so weiter im Kreis.',
    'Wer etwas wiederholt, am Thema vorbei antwortet („Löwe“ beim Frühstück) oder zu lange hängt (entscheidet die Spielleitung), ist raus.',
    'Wer verliert, fängt mit einem neuen Thema an. Wenn die Spielleitung Schluss macht, drehen alle, die verloren haben, am Wahrheit-oder-Pflicht-Automaten.',
  ],
  rulesLeadHeading: 'Tipps für die Spielleitung',
  rulesLeadSay: 'Alle zusammen im Takt: „Eins, zwei, drei!“ Thema: „Frühstück“ – nennt etwas zum Frühstück! Ich fange an: klatsch, klatsch, Brötchen; klatsch, klatsch, Müsli … Nichts doppelt, nichts am Thema vorbei, und zu langes Hängen zählt auch. Wer verliert, fängt mit einem neuen Thema an!',
  rulesLeadSteps: [
    'Fangt mit einem langsamen Takt an. Sobald alle drin sind, auf „schneller“ tippen oder das automatische Tempo einschalten.',
    'Wie lange zu lange ist, entscheidet die Spielleitung – erst locker, dann immer strenger.',
    'Am Ende dürfen alle, die verloren haben, einmal am Hebel ziehen – oder nur die Person, die am häufigsten raus war.',
  ],
  rulesBack: '← Zurück zum Spiel',
};
