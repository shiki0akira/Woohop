/*
 * Deutsch. Die Key-Liste muss exakt der von zh-TW entsprechen (scripts/build.js, checkStrings).
 * {n} {m} {s} {time} sind Platzhalter und bleiben unverändert stehen.
 */
export default {
  htmlLang: 'de',
  ogLocale: 'de_DE',

  seoTitle: 'Zeitbombe | Handy herumreichen — wer es hält, wenn es knallt, hat verloren',
  seoDesc:
    'Ein Kennenlernspiel für Kleingruppen, Jugendkreise und Familienfeiern. Ein Handy ist die Bombe: im Kreis herumreichen, die Aufgabe auf dem Bildschirm erledigen, auf Fertig tippen, weitergeben. Niemand weiß, wann es hochgeht — wer es dann in der Hand hat, verliert die Runde. 90 Fragen und Aufgaben sind dabei, eigene lassen sich ergänzen. Kein Download, keine Anmeldung, einfach die Seite öffnen.',
  rulesSeoTitle: 'Zeitbombe — so wird gespielt',
  rulesSeoDesc:
    'Zündschnur einstellen, Kategorien auswählen, eigene Aufgaben ergänzen — und die drei Sätze, die vor dem Start gesagt werden sollten.',

  navTitle: 'Zeitbombe',
  navRules: 'Spielregeln',
  rulesLinkText: 'Zum ersten Mal dabei? So geht es →',
  langSwitchLabel: 'Sprache wechseln',
  themeToggleLabel: 'Hell und dunkel umschalten',

  heroTitle: 'Zeitbombe: Aufgabe erledigen, schnell weitergeben',
  heroDesc:
    'Ein einziges Handy für die ganze Runde — und dieses Handy ist die Bombe. Eine Aufgabe erscheint, wer es hält, erledigt sie, tippt auf Fertig und gibt weiter. Niemand weiß, wann es hochgeht. Wer es in dem Moment hält, verliert die Runde.',

  // ---------- Einstellungen ----------
  timerHeading: 'Länge der Zündschnur',
  timerHint:
    'Die Bombe geht zu einem zufälligen Zeitpunkt in diesem Bereich hoch. Die Restzeit wird nie angezeigt.',
  minTimeLabel: 'Mindestens',
  maxTimeLabel: 'Höchstens',
  timerCustomToggle: 'Eigener Bereich',
  secondsUnit: '{n} Sek.',
  minutesUnit: '{n} Min.',
  timeRange: '{min}–{max}',

  questionsHeading: 'Aufgaben',
  deckCount: '{n} im Stapel',
  groupAsk: 'Fragen',
  groupDare: 'Aktionen',
  catCount: '{n} Aufgaben',

  deckEmptyWarning: 'Wähle mindestens eine Kategorie aus, um zu starten.',
  deckThinWarning: 'Nur {n} im Stapel — Aufgaben können sich innerhalb einer Runde wiederholen.',

  customLabel: 'Eigene Aufgaben',
  customPlaceholder: 'z. B. Nenne dein Lieblingsessen',
  customCategoryLabel: 'Einsortieren unter',
  customAddButton: 'Hinzufügen',
  customDoneButton: 'Fertig',
  customEmpty: 'Du hast noch keine eigenen Aufgaben angelegt.',
  customRemoveLabel: 'Diese Aufgabe löschen',
  customHint: 'Eigene Aufgaben bleiben auf diesem Gerät und sind beim nächsten Mal wieder da.',

  startButton: 'Los geht es',

  // ---------- im Spiel ----------
  passButton: 'Fertig! Weitergeben',
  skipButton: 'Wechseln',
  playHint: 'Mach, was auf dem Bildschirm steht, tippe auf Fertig und gib das Handy weiter.',
  stuckHint: 'Hängst du fest? Tipp auf „Wechseln“ — lass die Bombe nicht bei dir liegen.',
  bombAlt: 'Bombe',

  // ---------- Explosion ----------
  boomTitle: 'Bumm!',
  boomStats: 'Diese Runde: {time}, {done} geschafft',
  boomStatsWithSkips: 'Diese Runde: {time}, {done} geschafft, {skipped} übersprungen',
  durationMinSec: '{m} Min. {s} Sek.',
  durationSec: '{s} Sek.',
  againButton: 'Noch eine Runde',
  backToSetupButton: 'Einstellungen ändern',

  // ---------- Runde vorzeitig verlassen ----------
  leaveTitle: 'Diese Runde beenden?',
  leaveDesc: 'Die Bombe tickt noch. Wenn du jetzt gehst, ist diese Runde vorbei.',
  leaveConfirm: 'Runde beenden',
  leaveCancel: 'Weiterspielen',

  // ---------- Regelseite ----------
  rulesTitle: 'Zeitbombe: so wird gespielt',
  rulesIntro:
    'Ein Handy, alle im Kreis. Eine Aufgabe erscheint, wer das Handy hält, erledigt sie und gibt weiter. Die Bombe geht zu einem zufälligen Zeitpunkt hoch, die Restzeit wird nie angezeigt. Wer sie dann hält, verliert die Runde.',
  rulesHostHeading: 'Vor dem Start (wer das Handy dabei hat)',
  rulesHostSteps: [
    'Wähl Fragen, Aktionen oder beides. Viele neue Gesichter? Fang nur mit Fragen an.',
    'Eigene Insider einbauen? Leg unter „Eigene Aufgaben“ ein paar an und ordne sie einer Seite zu.',
    'Zündschnur einstellen. Für die erste Runde passen die voreingestellten 1–3 Minuten; wenn alle warm sind, probiert 30 Sekunden bis 2 Minuten.',
    'Sag drei Sätze zum Start: mach, was auf dem Bildschirm steht; tippe auf Fertig und gib weiter; wer es beim Knall hält, verliert die Runde.',
  ],
  rulesPlayerHeading: 'Wenn das Handy bei dir ankommt',
  rulesPlayerSteps: [
    'Lies die Aufgabe und mach sie sofort — einen Satz sagen, ein Tiergeräusch machen, die Person gegenüber abklatschen.',
    'Tippe unten auf die Leiste „Fertig — weitergeben“.',
    'Gib das Handy an die nächste Person weiter.',
    'Geht nicht? Einfach auf Fertig tippen und weitergeben. Es gibt keine Punkte — das hier ist kein Quiz.',
  ],
  rulesFaqHeading: 'Häufige Fragen',
  rulesFaq: [
    {
      q: 'Braucht jede Person ein Handy?',
      a: 'Nein. Das ganze Spiel läuft auf einem einzigen Handy — dieses Handy ist die Bombe und wandert im Kreis. Das ist anders als bei den übrigen Spielen der Reihe, wo alle per QR-Code einem Raum beitreten.',
    },
    {
      q: 'Sehe ich, wie viel Zeit noch bleibt?',
      a: 'Nein, keine Sekunde. Das ist Absicht: Bei sichtbarem Countdown würde in den letzten zehn Sekunden niemand mehr das Handy annehmen und das Spiel bliebe stehen. Auch das Tempo des Tickens verrät nicht, wie nah der Knall ist.',
    },
    {
      q: 'Darf ich eine Aufgabe überspringen?',
      a: 'Ja, tipp einfach auf Fertig. Es gibt keine Punkte, und niemand zählt mit, wer was übersprungen hat.',
    },
    {
      q: 'Können wir eigene Aufgaben ergänzen?',
      a: 'Ja. Über „Eigene Aufgaben“ auf der Einstellungsseite hinzufügen und einer Kategorie zuordnen — beim nächsten Mal ist sie wieder da. Sie bleibt auf diesem Gerät und wird nirgendwohin hochgeladen.',
    },
    {
      q: 'Ein Handy von Hand zu Hand weiterreichen ist mir unangenehm.',
      a: 'Steck es in einen Gefrierbeutel oder nimm ein altes Ersatzhandy als Bombe.',
    },
    {
      q: 'Was, wenn sich der Bildschirm mitten in der Runde sperrt?',
      a: 'Während des Spiels bleibt der Bildschirm wach. Landet die Seite doch im Hintergrund, wird beim Zurückkommen sofort neu gerechnet — war die Zündschnur in der Zwischenzeit abgelaufen, landest du direkt auf der Explosion.',
    },
    {
      q: 'Was passiert mit der Person, die verloren hat?',
      a: 'Das entscheidet ihr — die App gibt nichts vor. Alle im Raum haben gesehen, wer sie in der Hand hatte.',
    },
  ],
  rulesBack: '← Zurück zum Spiel',
};
