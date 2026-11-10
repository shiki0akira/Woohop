/*
 * Deutsch. Name: Randvoll (CONCEPT.md §4 — für dieses Spiel gibt es nirgends einen
 * eingeführten Namen, also nimmt jede Sprache ihre eigene Wendung für „bis zum Rand voll“).
 * Platzhalter wie {n} bleiben unverändert stehen.
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Randvoll | Ein Handy reihum, Wasser nachfüllen, nicht überlaufen lassen',
  seoDesc:
    'Ein Kennenlernspiel mit nur einem Handy: 2–12 Leute füllen abwechselnd Wasser in dasselbe Glas. Einmal tippen, das Wasser läuft, noch einmal tippen, es stoppt — dann gibt man weiter. Das Wasser steigt bis zum Rand und wölbt sich durch die Oberflächenspannung darüber. Wer es überlaufen lässt, verliert. Jede Runde ein anderes Gefäß: Weinglas, Wasserglas, Glasflasche mit engem Hals, dazu ein Tonkrug, bei dem nur das Ohr hilft. Ohne Download, ohne Anmeldung.',
  rulesSeoTitle: 'Randvoll spielen: Regeln und Anleitung für die Moderation',
  rulesSeoDesc: 'So geht Randvoll: wie viele Leute, wie man die Glasgröße nach der Gruppe wählt, wie sich die acht Gefäße unterscheiden, wann es als übergelaufen gilt — und ein Text, den die Moderation vorlesen kann.',

  navTitle: 'Randvoll',
  navRules: 'Anleitung',
  rulesLinkText: 'Ganze Anleitung →',
  soundLabel: 'Ton', // eine Taste für Wassergeräusch und Musik, deshalb nicht „Musik“

  heroTitle: 'Randvoll: abwechselnd nachfüllen, wer es überlaufen lässt, verliert',
  heroDesc: 'Ein Handy geht im Kreis herum. Einmal tippen und das Wasser läuft, noch einmal tippen und es stoppt — das war dein Zug, dann gib weiter. Wenn die Oberflächenspannung das Wasser über dem Rand hält, traut sich keiner mehr. Und jede Runde gibt es ein anderes Gefäß.',

  // ---------- Schritte für die Moderation ----------
  // [Titel, zum Vorlesen]. Beim Nachfüllen ist das Handy unterwegs, da kein Schritt-Kopf (apps/warmup/CLAUDE.md)
  lead: {
    setup: ['Los geht’s', 'Wir spielen „Randvoll“! Alle in einen Kreis — dieses Handy wandert gleich einmal durch alle Hände.'],
    rules: ['Regeln erklären', 'Auf dem Handy ist ein Glas. Wer dran ist, tippt einmal auf „Wasser“, dann noch einmal zum Stoppen — eine Füllung pro Person, dann weitergeben. Die Oberflächenspannung hält das Wasser als Wölbung über dem Rand, es sieht ständig aus, als wäre es gleich vorbei — kleine Schlückchen halten ewig, ein gieriger Schwall und du hast sofort verloren. Jede Runde ein anderes Gefäß, und bei einigen siehst du nichts: dann hilft nur das Ohr!'],
    end: ['Übergelaufen!', 'Das war’s — und zwar für den da! Einmal am Wahrheit-oder-Pflicht-Automaten ziehen, dann fängt jemand anderes an und wir füllen das nächste.'],
  },
  // Die drei Bildkarten im Schritt „Regeln erklären“: [Titel, Text]
  ruleCards: [
    ['Wasser nachfüllen', 'Wer dran ist, tippt einmal auf „Wasser“ und noch einmal zum Stoppen. So viel du willst — aber ein bisschen läuft immer rein.'],
    ['Weitergeben', 'Eine Füllung pro Person. Auf „Weitergeben“ tippen und das Handy übergeben.'],
    ['Überlaufen heißt verloren', 'Das Wasser wölbt sich über den Rand, ohne zu laufen — das ist die Oberflächenspannung. Wer es überlaufen lässt, verliert. Das Gefäß ist jede Runde ein anderes.'],
  ],
  rulesNext: 'Spiel starten',

  // ---------- Start ----------
  startButton: 'Spiel starten',
  // Glasgröße: immer sichtbar (die Wahl nach Gruppengröße soll niemand überspringen)
  advancedLabel: 'Glasgröße',
  sizeHint: 'Nach Gruppengröße wählen — jede Größe reicht etwa für eine bis zwei Runden im Kreis. Höchstens 12 Leute, sonst zwei Gruppen.',
  sizeSmall: 'Klein\n2–5 Leute',
  sizeNormal: 'Mittel\n6–9 Leute',
  sizeLarge: 'Groß\n10–12 Leute',

  // ---------- Nachfüllen ----------
  // Jede Runde wird ein Gefäß gezogen (SHAPES in app.js); die Keys heißen wie dort
  shapeNotes: {
    goblet: 'Diese Runde: ein Weinglas. Bauchig, der Rand läuft zusammen — je näher am Rand, desto schneller steigt es.',
    glass: 'Diese Runde: ein Wasserglas. Überall gleich weit, der Stand lässt sich am besten einschätzen. Das fairste Gefäß.',
    bottle: 'Diese Runde: eine Glasflasche mit engem Hals. Breiter Körper, dünner Hals — im Hals schießt das Wasser nach oben.',
    pot: 'Diese Runde: ein Tonkrug, undurchsichtig. Du siehst den Stand nicht und die Öffnung ist winzig! Hör hin — je höher der Ton, desto voller.',
    mug: 'Diese Runde: eine Tasse, undurchsichtig. Du siehst den Stand nicht, aber die Öffnung ist weit, also siehst du das Wasser oben noch rechtzeitig.',
    measure: 'Diese Runde: ein Messbecher. Mit Skala — verabredet eine Linie, die niemand überschreiten darf, dann wird’s noch besser.',
    beaker: 'Diese Runde: ein Becherglas. Flach und weit, dieselbe Menge hebt den Stand am wenigsten. Das gnädigste Gefäß.',
    flask: 'Diese Runde: eine Thermosflasche, undurchsichtig. Kein Blick auf den Stand und dazu eine enge Öffnung — die schwerste der acht.',
  },
  // Undurchsichtiges Gefäß und der Ton ist aus: hinweisen, aber nicht blockieren
  soundNudge: 'Schalte oben die Notentaste ein — die Tonhöhe des Wassers verrät dir, wie voll es ist.',
  pourTurn: 'Person {n}',
  pourButton: 'Wasser',
  pourStopButton: 'Stopp',
  pourHint: 'Einmal tippen, das Wasser läuft; noch einmal tippen, es stoppt. So viel du willst.',
  // Die Phase, in der das Wasser über dem Rand steht (CONCEPT.md 2.5)
  tenseHint: 'Das Wasser wölbt sich schon über den Rand … noch ein Tropfen und es ist vorbei!',
  passSay: 'Fertig! Gib das Handy weiter, jetzt füllt die nächste Person.',
  drawSay: 'Ein Gefäß wird gezogen …',
  passButton: 'Weitergeben',
  overflowFlash: 'Übergelaufen!',

  // ---------- Übergelaufen ----------
  endTitle: 'Übergelaufen!',
  // Wer verloren hat, sehen alle — deshalb nur die Zahl der Füllungen
  endStats: 'Dieses Glas hat {n} Füllungen gehalten',
  endBest: 'Bestwert heute: {n}',
  slotHeading: 'Wer verloren hat, zieht: Wahrheit oder Pflicht?',
  againButton: 'Nächstes Glas',

  // ---------- Zurück zum Anfang ----------
  leaveTitle: 'Zurück zum Anfang?',
  leaveDesc: 'Dieses Glas wird ausgeschüttet, das Spiel fängt leer wieder an.',
  leaveConfirm: 'Zum Anfang',
  leaveCancel: 'Weiterspielen',

  // ---------- Anleitungsseite ----------
  rulesTitle: 'Randvoll – so wird gespielt',
  rulesIntro: 'Ein Handy geht im Kreis herum: Alle füllen abwechselnd Wasser in dasselbe Glas, eine Füllung pro Person — wer es überlaufen lässt, verliert.',
  rulesFacts: [
    ['Leute', '2–12'],
    ['Dauer', '2–5 Minuten pro Glas'],
    ['Material', 'Ein Handy (richtig gut: dazu ein durchsichtiges Glas und eine Kanne Wasser)'],
  ],
  rulesHowHeading: 'So wird gespielt',
  rulesHowSteps: [
    'Alle setzen sich in einen Kreis, das Handy bekommt die erste Person. Vorher die Glasgröße nach der Gruppe wählen: klein für 2–5, mittel für 6–9, groß für 10–12 Leute.',
    'Wer dran ist, tippt auf „Wasser“, dann läuft es ins Glas; noch einmal tippen stoppt es. Nach oben gibt es keine Grenze — aber sobald du tippst, läuft mindestens ein Schluck hinein.',
    'Dann auf „Weitergeben“ tippen und das Handy der Person daneben geben. Eine Füllung pro Person, immer weiter im Kreis.',
    'Am Rand hält die Oberflächenspannung das Wasser als Wölbung — es sieht aus wie übergelaufen, ist es aber nicht. Das Bild zoomt auf den Rand, und genau das ist der beste Teil. Mit kleinen Schlückchen gehen noch acht bis zehn Füllungen; wer den Hahn offen lässt, hat nach etwa einer Sekunde verloren.',
    'Wer es überlaufen lässt, verliert. Diese Person zieht einmal Wahrheit oder Pflicht, dann fängt jemand anderes an und das nächste Glas wird gefüllt.',
  ],
  rulesShapesHeading: 'Jede Runde ein anderes Gefäß',
  rulesShapesIntro: 'Das Gefäß wird jede Runde aus acht gezogen, und sie spielen sich sehr verschieden. Drei sind undurchsichtig, da siehst du den Stand nicht — ohne Ton geht es trotzdem (am Rand kommt das Wasser sichtbar hoch), mit Ton bist du aber klar im Vorteil: die Tonhöhe verrät dir früher, wie voll es ist.',
  rulesShapes: [
    ['Weinglas', 'Bauchig, der Rand läuft zusammen — je näher am Rand, desto schneller steigt der Stand.'],
    ['Wasserglas', 'Überall gleich weit, der Stand steigt gleichmäßig. Am besten einzuschätzen und am fairsten.'],
    ['Glasflasche mit engem Hals', 'Breiter Körper, dünner Hals — im Hals schießt das Wasser nach oben. Die nervigste Phase von allen.'],
    ['Messbecher', 'Mit Skala, also das einzige Gefäß, bei dem man wirklich rechnen kann. Verabredet eine Linie, die niemand überschreitet.'],
    ['Becherglas', 'Flach und weit, dieselbe Menge hebt den Stand am wenigsten. Das gnädigste Gefäß.'],
    ['Tonkrug, undurchsichtig', 'Kein Blick auf den Stand, dazu eine kleine Öffnung — du siehst das Wasser erst ganz am Ende.'],
    ['Tasse, undurchsichtig', 'Kein Blick auf den Stand, aber die Öffnung ist weit, du siehst das Wasser früh. Die leichteste der drei undurchsichtigen.'],
    ['Thermosflasche, undurchsichtig', 'Kein Blick auf den Stand, enge Öffnung, und oben schießt das Wasser hoch. Die schwerste der acht.'],
  ],
  rulesLeadHeading: 'Tipps für die Moderation',
  rulesLeadSay: 'Wir spielen „Randvoll“! Auf dem Handy ist ein Glas: Wer dran ist, tippt einmal, dann läuft Wasser, noch einmal tippen stoppt es — eine Füllung pro Person. Oben am Rand wölbt sich das Wasser, ohne zu laufen, es sieht also immer gleich nach Ende aus … und wer es überlaufen lässt, verliert!',
  rulesLeadSteps: [
    'Mit echtem Material wird’s noch besser: ein durchsichtiges Glas und eine Kanne Wasser, und du gießt wirklich mit, solange auf dem Handy Wasser läuft. Ohne Material geht es genauso, dann spielt ihr nur mit dem Handy.',
    'Wähl am Anfang immer die Glasgröße nach der Gruppe (2–5, 6–9, 10–12 Leute). Passt sie, verliert nach etwa einer bis zwei Runden jemand. Über 12 Leute: zwei Gruppen mit je einem Handy.',
    'In der ersten Runde tippen alle nur ganz kurz — lass sie. Sobald sich das Wasser wölbt, werden sie von selbst langsamer.',
    'Nach Wahrheit oder Pflicht fängt das nächste Glas mit der Person nach dem Verlierer an, dann ist nicht immer dieselbe Person zuerst dran.',
  ],
  rulesBack: '← Zurück zum Spiel',
};
