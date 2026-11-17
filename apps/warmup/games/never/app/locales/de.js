/*
 * Deutsch. Gleiche Keys wie zh-TW. Im Deutschen heißt das Spiel „Ich hab noch nie“ (meist als Trinkspiel,
 * hier mit Fingern). Beispiele enden auf ein Partizip mit „haben“, damit sie nach „Ich hab noch nie …“
 * UND „Ich hab schon mal …“ passen – keine Verben mit „sein“ (gegangen, gefahren …).
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Ich hab noch nie | Partyspiel ohne Alkohol – Handy zieht jede Runde ein Thema, wer es getan hat, klappt einen Finger ein',
  seoDesc:
    'Reihum sagt jeder „Ich hab noch nie …“ – wer es schon gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus. Wer zuletzt noch Finger hat, wird König. Das Handy zieht jede Runde ein Thema (Schulzeit, Alltag, peinliche Momente …) mit Beispielsätzen, und umgekehrt geht es auch: „Ich hab schon mal …“. Ohne Material, ohne Download, ohne Anmeldung. Der König bestimmt jemanden für den Wahrheit-oder-Pflicht-Automaten.',
  rulesSeoTitle: 'Ich hab noch nie: Regeln, Themen und Beispiele',
  rulesSeoDesc: 'So spielt ihr „Ich hab noch nie“ mit Fingern statt Alkohol: wie viele Personen, wie das Einklappen geht, wer gewinnt, die umgekehrte Variante „Ich hab schon mal“, ein Text für die Spielleitung und über 20 Themen mit Beispielen.',

  navTitle: 'Ich hab noch nie',
  navRules: 'Spielregeln',
  gameBack: 'Zurück',
  rulesLinkText: 'Alle Regeln →',

  heroTitle: 'Ich hab noch nie: wer es getan hat, klappt einen Finger ein',
  heroDesc: 'Alle halten eine Hand hoch. Reihum sagt jeder etwas, das er noch nie gemacht hat, zum Beispiel „Ich hab noch nie im Ausland Urlaub gemacht“. Wer es schon gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus. Wer zuletzt noch Finger hat, gewinnt. Das Handy zieht jede Runde ein Thema.',

  modeLabel: 'Spielart',
  modeNever: 'Ich hab noch nie',
  modeDid: 'Ich hab schon mal',
  modeHintNever: 'Sag etwas, das du noch nie gemacht hast. Wer es schon gemacht hat, klappt einen Finger ein.',
  modeHintDid: 'Sag etwas, das du schon mal gemacht hast. Wer es noch nie gemacht hat, klappt einen Finger ein.',

  lead: {
    setup: ['Start', 'Wir spielen „Ich hab noch nie“! Alle halten eine Hand hoch, alle fünf Finger ausgestreckt.'],
    rules: ['Die Regeln', 'Reihum sagt jeder etwas, das er noch nie gemacht hat, zum Beispiel „Ich hab noch nie im Ausland Urlaub gemacht“. Wer es schon gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus – wer zuletzt noch Finger hat, gewinnt! Das Handy zieht jede Runde ein Thema, und alles muss dazu passen.'],
    play: ['Los geht’s!', 'Das Thema dieser Runde: „{topic}“! Ich fange an: Sag etwas zum Thema {topic}, das du noch nie gemacht hast. Wer es schon gemacht hat, klappt einen Finger ein.'],
    playFree: ['Los geht’s!', 'Diese Runde ist frei – alles ist erlaubt! Ich fange an: Sag etwas, das du noch nie gemacht hast. Wer es schon gemacht hat, klappt einen Finger ein.'],
    end: ['Wer ist König?', 'Wer zuletzt noch Finger hat, ist König! Der König bestimmt eine Person – sie wählt Wahrheit, Pflicht oder Zufall und zieht dann am Hebel!'],
  },
  leadDid: {
    setup: ['Start', 'Wir spielen „Ich hab schon mal“! Alle halten eine Hand hoch, alle fünf Finger ausgestreckt.'],
    rules: ['Die Regeln', 'Reihum sagt jeder etwas, das er schon mal gemacht hat, zum Beispiel „Ich hab schon mal allein einen Kinofilm angeschaut“. Wer es noch nie gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus – wer zuletzt noch Finger hat, gewinnt! Das Handy zieht jede Runde ein Thema, und alles muss dazu passen.'],
    play: ['Los geht’s!', 'Das Thema dieser Runde: „{topic}“! Ich fange an: Sag etwas zum Thema {topic}, das du schon mal gemacht hast. Wer es noch nie gemacht hat, klappt einen Finger ein.'],
    playFree: ['Los geht’s!', 'Diese Runde ist frei – alles ist erlaubt! Ich fange an: Sag etwas, das du schon mal gemacht hast. Wer es noch nie gemacht hat, klappt einen Finger ein.'],
    end: ['Wer ist König?', 'Wer zuletzt noch Finger hat, ist König! Der König bestimmt eine Person – sie wählt Wahrheit, Pflicht oder Zufall und zieht dann am Hebel!'],
  },
  ruleCards: [
    ['Jede Runde ein Thema', 'Das Handy zieht ein Thema, zum Beispiel „Schulzeit“, und in dieser Runde geht es nur darum.'],
    ['Sag, was du noch nie gemacht hast', 'Reihum „Ich hab noch nie …“ – und es muss stimmen. Keine Idee? Unter dem Thema steht ein Beispiel.'],
    ['Schon gemacht? Finger ein', 'Wer es schon gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus. Wer übrig bleibt, wird König!'],
  ],
  ruleCardsDid: [
    ['Jede Runde ein Thema', 'Das Handy zieht ein Thema, zum Beispiel „Schulzeit“, und in dieser Runde geht es nur darum.'],
    ['Sag, was du schon mal gemacht hast', 'Reihum „Ich hab schon mal …“ – und es muss stimmen. Je weniger es auch gemacht haben, desto besser.'],
    ['Noch nie gemacht? Finger ein', 'Wer es noch nie gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus. Wer übrig bleibt, wird König!'],
  ],
  rulesNext: 'Weiter: Spiel starten',

  startButton: 'Spiel starten',
  soundLabel: 'Musik',

  roundLabel: 'Runde {n}',
  exNever: 'z. B. Ich hab noch nie {ex}',
  exDid: 'z. B. Ich hab schon mal {ex}',
  exMore: 'Anderes Beispiel',
  topicShuffle: 'Anderes Thema',
  topicPick: 'Thema auswählen',
  nextRound: 'Alle waren dran: nächste Runde',
  topics: [
    ['Schulzeit', ['im Unterricht geschlafen', 'als Klassensprecher kandidiert', 'meine Hausaufgaben vergessen', 'eine Sechs geschrieben']],
    ['Alltag', ['unter der Dusche gesungen', 'den Wecker dreimal weggedrückt', 'einen ganzen Tag kein Handy benutzt', 'mit meinen Pflanzen geredet']],
    ['Reisen', ['allein im Ausland Urlaub gemacht', 'im Zug meine Haltestelle verpasst', 'mich im Ausland verlaufen', 'in einem Flugzeug gesessen']],
    ['Essen', ['Durian probiert', 'allein im Restaurant gegessen', 'so viel gegessen, dass ich mich nicht mehr bewegen konnte', 'um Mitternacht Instantnudeln gekocht']],
    ['Arbeit', ['einen Nebenjob gehabt', 'mich bei der Arbeit verspätet', 'im Vorstellungsgespräch einen Blackout gehabt', 'in einem Meeting gedöst']],
    ['Sport', ['einen Marathon geschafft', 'beim Sportfest einen Sturz hingelegt', 'einen Berggipfel bestiegen', 'ein Fitnessstudio bezahlt und nie genutzt']],
    ['Handy & Internet', ['bis zum Morgen am Handy gehangen', 'eine Nachricht an die falsche Person geschickt', 'online eine Fälschung gekauft', 'einen Livestream gemacht']],
    ['Kindheit', ['versucht, von zu Hause abzuhauen', 'ein Spielzeug kaputt gemacht und versteckt', 'an die Wand gemalt', 'vor dem Essen heimlich genascht']],
    ['Tiere', ['ein Haustier gehabt', 'ein Pferd geritten', 'eine Schlange angefasst', 'einen Bienenstich abbekommen']],
    ['Peinliche Momente', ['vor allen einen Sturz hingelegt', 'jemanden mit dem falschen Namen angesprochen', 'zurückgewinkt, obwohl gar nicht ich gemeint war', 'den Pulli den ganzen Tag verkehrt herum getragen']],
    ['Freunde', ['den Geburtstag meiner besten Freundin vergessen', 'das gleiche Outfit wie ein Freund getragen', 'mit Freunden bis zum Sonnenaufgang geredet', 'ein Geheimnis jahrelang für mich behalten']],
    ['Unterwegs', ['den falschen Bus genommen', 'vergessen, wo ich geparkt habe', 'meine Haltestelle verschlafen', 'ein Auto angeschoben']],
    ['Talente', ['ein Instrument gelernt', 'auf einer Bühne gespielt', 'vor Fremden Karaoke gesungen', 'vor allen getanzt']],
    ['Zu Hause', ['für eine große Runde gekocht', 'Kleidung beim Waschen einlaufen lassen', 'einen Topf anbrennen lassen', 'ein Möbelstück allein aufgebaut']],
    ['Filme & Serien', ['bei einem Film geweint', 'eine ganze Staffel an einem Tag geschaut', 'im Kino geschlafen', 'nachts bis zum Schluss ein Fußballspiel geschaut']],
    ['Mutproben', ['eine Achterbahnfahrt gemacht', 'allein einen Kinofilm angeschaut', 'einen Fremden einfach angesprochen', 'einen Bungee-Sprung gewagt']],
    ['Wetter', ['bei Sturm einen Spaziergang gemacht', 'einen Schneemann gebaut', 'mich im Regen bis auf die Haut nass regnen lassen', 'einen Sonnenbrand gehabt']],
    ['Freie Runde', ['mein Handy ins Wasser fallen lassen', 'in der Öffentlichkeit laut gesungen', 'das falsche Gericht bestellt und trotzdem aufgegessen', 'einen handgeschriebenen Brief bekommen'], 'free'],
  ],

  endGame: 'Nur noch eine Hand übrig? Gedrückt halten',
  againButton: 'Noch mal spielen',

  leaveTitle: 'Zurück zum Anfang?',
  leaveDesc: 'Das Spiel beginnt von vorn, die Themen werden neu gezogen.',
  leaveConfirm: 'Zurück zum Anfang',
  leaveCancel: 'Weiterspielen',

  rulesTitle: 'So spielt ihr „Ich hab noch nie“',
  rulesIntro: 'Alle halten eine Hand hoch und sagen reihum etwas, das sie noch nie gemacht haben. Wer es schon gemacht hat, klappt einen Finger ein; alle fünf eingeklappt heißt raus. Wer zuletzt noch Finger hat, gewinnt. Ihr braucht nichts – das Handy zieht jede Runde ein Thema und zeigt Beispielsätze.',
  rulesFacts: [
    ['Personen', '3–15'],
    ['Dauer', '10–20 Minuten'],
    ['Material', 'Nichts – nur das Handy der Spielleitung'],
  ],
  rulesHowHeading: 'Ablauf',
  rulesHowSteps: [
    'Setzt euch in einen Kreis. Alle halten eine Hand hoch, alle fünf Finger ausgestreckt.',
    'Das Handy zieht ein Thema, zum Beispiel „Schulzeit“, und in dieser Runde geht es nur darum. Bei „Freie Runde“ ist alles erlaubt.',
    'Ab der Spielleitung sagt reihum jeder etwas, das er noch nie gemacht hat, zum Beispiel „Ich hab noch nie im Unterricht geschlafen“. Es muss stimmen.',
    'Wer es schon gemacht hat, klappt einen Finger ein – wer es gesagt hat, nicht. Alle fünf eingeklappt: raus.',
    'Wenn alle dran waren, gibt’s mit „Nächste Runde“ ein neues Thema. Wer zuletzt noch Finger hat, wird König und bestimmt jemanden für den Wahrheit-oder-Pflicht-Automaten.',
  ],
  rulesDidHeading: 'Umgekehrt: „Ich hab schon mal“',
  rulesDidIntro: 'Wählt am Anfang „Ich hab schon mal“, dann drehen sich die Regeln um:',
  rulesDidSteps: [
    'Reihum sagt jeder etwas, das er schon mal gemacht hat, zum Beispiel „Ich hab schon mal allein einen Kinofilm angeschaut“.',
    'Wer es noch nie gemacht hat, klappt einen Finger ein. Alle fünf eingeklappt: raus.',
    'Je weniger es auch gemacht haben, desto besser – wer zuletzt noch Finger hat, gewinnt.',
  ],
  rulesTopicsHeading: 'Themen und Beispiele',
  rulesTopicsIntro: 'Das Handy zieht jede Runde eines dieser Themen und zeigt einen Beispielsatz für alle, denen nichts einfällt:',
  rulesLeadHeading: 'Tipps für die Spielleitung',
  rulesLeadSay: 'Alle eine Hand hoch! Reihum sagt jeder etwas, das er noch nie gemacht hat. Wer es schon gemacht hat, klappt einen Finger ein – alle fünf eingeklappt heißt raus, und wer zuletzt noch Finger hat, gewinnt. Das Thema dieser Runde: „Reisen“. Ich fange an: Ich hab noch nie allein im Ausland Urlaub gemacht!',
  rulesLeadSteps: [
    'Fangt in der ersten Runde selbst an, mit etwas, das viele schon gemacht haben – dann versteht jeder sofort, wie es geht.',
    'Ihr wollt, dass jemand einen Finger einklappt? Sagt etwas, das alle außer dieser Person schon gemacht haben – das sorgt immer für Lacher.',
    'In großen Gruppen nur mit drei Fingern spielen, dann geht es schneller.',
  ],
  rulesBack: '← Zurück zum Spiel',
};
