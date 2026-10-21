/*
 * Español. La lista de claves debe coincidir exactamente con la de zh-TW
 * (scripts/build.js, checkStrings). {n} {m} {s} {time} son marcadores: déjalos tal cual.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Bomba de tiempo | Se pasa un móvil: quien lo tenga cuando explote, pierde',
  seoDesc:
    'Un juego para romper el hielo en grupos pequeños, grupos de jóvenes y reuniones familiares. Un solo móvil hace de bomba: se va pasando en círculo, haces la prueba que aparece en pantalla, pulsas Hecho y lo pasas. Nadie sabe cuándo explota; quien lo tenga en la mano pierde la ronda. Incluye 90 preguntas y retos, y puedes añadir los vuestros. Sin descargas ni registro: solo abre la página.',
  rulesSeoTitle: 'Bomba de tiempo — cómo se juega',
  rulesSeoDesc:
    'Ajustar la mecha, elegir las categorías, añadir vuestras propias pruebas y las tres frases que hay que decir antes de empezar.',

  navTitle: 'Bomba de tiempo',
  navRules: 'Cómo se juega',
  rulesLinkText: '¿Primera vez? Mira cómo empezar →',
  langSwitchLabel: 'Cambiar de idioma',
  themeToggleLabel: 'Cambiar entre claro y oscuro',

  heroTitle: 'Bomba de tiempo: haz la prueba y pásalo rápido',
  heroDesc:
    'Un solo móvil para todo el grupo, y ese móvil es la bomba. Aparece una prueba, quien lo tenga la hace, pulsa Hecho y se lo pasa al siguiente. Nadie sabe cuándo explota. Quien lo tenga en ese momento pierde la ronda.',

  // ---------- ajustes ----------
  timerHeading: 'Longitud de la mecha',
  timerHint:
    'Explota en un momento aleatorio dentro de este intervalo. El tiempo restante no se muestra nunca.',
  minTimeLabel: 'Como mínimo',
  maxTimeLabel: 'Como máximo',
  timerCustomToggle: 'Intervalo personalizado',
  secondsUnit: '{n} s',
  minutesUnit: '{n} min',
  timeRange: '{min}–{max}',

  questionsHeading: 'Pruebas',
  deckCount: '{n} en el mazo',
  groupAsk: 'Preguntas',
  groupDare: 'Acciones',
  catCount: '{n} pruebas',

  deckEmptyWarning: 'Elige al menos una categoría para empezar.',
  deckThinWarning: 'Solo hay {n} en el mazo: pueden repetirse pruebas dentro de una misma ronda.',

  customLabel: 'Vuestras pruebas',
  customPlaceholder: 'p. ej.: di tu comida favorita',
  customCategoryLabel: 'Ponla en',
  customAddButton: 'Añadir',
  customDoneButton: 'Listo',
  customEmpty: 'Todavía no has añadido ninguna prueba propia.',
  customRemoveLabel: 'Borrar esta prueba',
  customHint: 'Tus pruebas se quedan en este dispositivo y seguirán aquí la próxima vez.',

  // ---------- 帶領的步驟（全站共用的 Leader，跟竹筍竹筍蹦蹦出同一套）----------
  // 每個畫面就是一步：[標題, 照著念]。進行中那一步手機在大家手上傳，不放步驟頭
  lead: {
    setup: ["Elige las pruebas","¡Vamos a jugar a la bomba de tiempo! Primero elegid: preguntas, acciones o las dos cosas."],
    rules: ["Las reglas","Este móvil es la bomba. Aparece una prueba: quien lo tiene la hace en el momento, pulsa «Hecho» y lo pasa al de al lado. Nadie sabe cuándo explota. ¡Quien lo tenga en la mano cuando explote, pierde!"],
    boom: ["¿Quién perdió?","¿En qué manos explotó? Quien pierde elige verdad, reto o al azar, ¡y tira de la tragaperras!"],
  },
  // 「說明規則」那一步的三張插圖卡：[標題, 說明]
  ruleCards: [
    ["Hazlo ya","Aparece una prueba: responde la pregunta o haz la acción en el momento."],
    ["Pásalo","Pulsa «Hecho» y pasa el móvil al de al lado. ¿Te atascas? Cambia de prueba."],
    ["Si explota, pierdes","Nadie sabe cuándo explota. Quien tenga el móvil en ese momento, pierde."],
  ],
  rulesNext: "Siguiente: a jugar",

  // 頂欄音符鍵的名稱（給螢幕閱讀器念）：管全部聲音——滴答、爆炸、配樂、拉霸
  soundLabel: "Sonido",
  startButton: "Empezar el juego",

  // ---------- en juego ----------
  passButton: '¡Hecho! Pásalo',
  skipButton: 'Otra prueba',
  playHint: 'Haz lo que pone en pantalla, pulsa Hecho y pasa el móvil.',
  stuckHint: '¿Te has atascado? Pulsa «Otra prueba» y sigue: no te quedes con la bomba.',
  bombAlt: 'Bomba',

  // ---------- explosión ----------
  boomTitle: '¡Bum!',
  boomStats: 'Esta ronda: {time}, {done} hechas',
  boomStatsWithSkips: 'Esta ronda: {time}, {done} hechas, {skipped} saltadas',
  durationMinSec: '{m} min {s} s',
  durationSec: '{s} s',
  againButton: 'Otra ronda',

  // ---------- salir a medias ----------
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: 'Ajustes',
  gameBack: 'Volver',
  leaveTitle: '¿Terminamos esta ronda?',
  leaveDesc: 'La bomba sigue corriendo. Si sales ahora, esta ronda se pierde.',
  leaveConfirm: 'Terminar la ronda',
  leaveCancel: 'Seguir jugando',

  // ---------- página de reglas ----------
  rulesTitle: 'Cómo se juega a la bomba de tiempo',
  rulesIntro: "Un móvil pasa de mano en mano. Aparece una prueba, la haces y lo pasas. Nadie sabe cuándo explota la bomba: quien la tenga entonces, pierde.",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["Jugadores","4–15"],["Necesitas","Un móvil y un círculo de gente"]],
  // 引爆時間依人數建議（對應設定畫面那三顆區間）
  rulesTimeLabel: "¿Qué mecha elegir?",
  rulesTimeGuide: [["4–6 personas","30 s – 2 min"],["7–10 personas","1–3 min"],["11–15 personas","3–6 min"]],
  rulesTimeNote: "Cuanta más gente, más tarda una vuelta al círculo. 3–5 rondas duran unos 10 minutos.",
  rulesHowHeading: "Cómo se juega",
  rulesHowSteps: [
    "Elige las pruebas: preguntas, acciones o ambas.",
    "Pulsa «Empezar» y dale el móvil a la primera persona.",
    "Lee la prueba, hazla, pulsa «Hecho» y pasa el móvil.",
    "Cuando explota la bomba, quien tiene el móvil pierde la ronda.",
  ],
  rulesLeadHeading: "Cómo dirigirlo",
  // 主持人開場照著念的一句（畫面上是「照著念」卡片），底下是小提醒
  rulesLeadSay: "Haced lo que diga la pantalla y pasad el móvil. ¡Quien lo tenga cuando explote, pierde!",
  rulesLeadSteps: [
    "Con gente nueva, empieza solo con preguntas y añade acciones después.",
    "Si alguien se bloquea, grita «¡Siguiente!» para no perder el ritmo.",
    "No hace falta castigo: pulsa «Otra ronda» y ya.",
  ],
  rulesBack: '← Volver al juego',
};
