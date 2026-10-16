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
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: 'Einstellungen',
  gameBack: 'Zurück',
  leaveTitle: 'Diese Runde beenden?',
  leaveDesc: 'Die Bombe tickt noch. Wenn du jetzt gehst, ist diese Runde vorbei.',
  leaveConfirm: 'Runde beenden',
  leaveCancel: 'Weiterspielen',

  // ---------- Regelseite ----------
  rulesTitle: 'Zeitbombe: so wird gespielt',
  rulesIntro: "Ein Handy wandert im Kreis. Eine Aufgabe erscheint, du erledigst sie und gibst weiter. Niemand weiß, wann die Bombe hochgeht – wer sie dann hält, verliert.",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["Spieler","4–15"],["Du brauchst","Ein Handy und einen Stuhlkreis"]],
  // 引爆時間依人數建議（對應設定畫面那三顆區間）
  rulesTimeLabel: "Welche Zündschnur?",
  rulesTimeGuide: [["4–6 Personen","30 Sek. – 2 Min."],["7–10 Personen","1–3 Min."],["11–15 Personen","3–6 Min."]],
  rulesTimeNote: "Je mehr Leute, desto länger dauert eine Runde im Kreis. 3–5 Runden dauern etwa 10 Minuten.",
  rulesHowHeading: "So geht’s",
  rulesHowSteps: [
    "Aufgaben wählen: Fragen, Aktionen oder beides.",
    "„Los geht es“ tippen und das Handy der ersten Person geben.",
    "Aufgabe lesen, erledigen, „Fertig“ tippen und weitergeben.",
    "Wenn die Bombe hochgeht, verliert, wer das Handy hält.",
  ],
  rulesLeadHeading: "So leitest du an",
  // 主持人開場照著念的一句（畫面上是「照著念」卡片），底下是小提醒
  rulesLeadSay: "Macht, was auf dem Bildschirm steht, und gebt das Handy weiter. Wer es beim Knall hält, verliert!",
  rulesLeadSteps: [
    "Bei neuen Leuten erst nur Fragen, Aktionen später dazunehmen.",
    "Hängt jemand fest, ruf „Weiter!“ – das Tempo darf nicht abreißen.",
    "Keine Strafe nötig: einfach „Noch eine Runde“ tippen.",
  ],
  rulesBack: '← Zurück zum Spiel',
};
