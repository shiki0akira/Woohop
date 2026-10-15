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

  startButton: 'Empezar',

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
  backToSetupButton: 'Cambiar ajustes',

  // ---------- salir a medias ----------
  leaveTitle: '¿Terminamos esta ronda?',
  leaveDesc: 'La bomba sigue corriendo. Si sales ahora, esta ronda se pierde.',
  leaveConfirm: 'Terminar la ronda',
  leaveCancel: 'Seguir jugando',

  // ---------- página de reglas ----------
  rulesTitle: 'Cómo se juega a la bomba de tiempo',
  rulesIntro:
    'Un móvil y todos en círculo. Aparece una prueba, quien tiene el móvil la hace y lo pasa. La bomba explota en un momento aleatorio y el tiempo restante no se muestra nunca. Quien lo tenga entonces pierde la ronda.',
  rulesHostHeading: 'Antes de empezar (quien saca el móvil)',
  rulesHostSteps: [
    'Elige Preguntas, Acciones o las dos. ¿Mucha cara nueva? Empieza solo con Preguntas.',
    '¿Queréis meter vuestras bromas internas? Añade unas cuantas en «Vuestras pruebas» y colócalas en un lado.',
    'Ajusta la mecha. Para la primera ronda, el 1–3 minutos por defecto va perfecto; cuando el grupo se anime, prueba 30 segundos a 2 minutos.',
    'Di tres frases para arrancar: haz lo que pone en pantalla, pulsa Hecho y pásalo, y quien lo tenga al explotar pierde la ronda.',
  ],
  rulesPlayerHeading: 'Cuando el móvil llega a tus manos',
  rulesPlayerSteps: [
    'Lee la prueba y hazla ahí mismo: soltar una frase, imitar a un animal, chocar la mano con quien tienes enfrente.',
    'Pulsa la barra de abajo: «Hecho — pásalo».',
    'Pasa el móvil a la siguiente persona.',
    '¿No te sale? Pulsa Hecho y pásalo. No hay puntos: esto no es un concurso.',
  ],
  rulesFaqHeading: 'Preguntas frecuentes',
  rulesFaq: [
    {
      q: '¿Hace falta un móvil por persona?',
      a: 'No. Todo el juego funciona con un único móvil: ese móvil es la bomba y va dando vueltas por el círculo. Es distinto de los demás juegos de la serie, donde cada uno entra en una sala escaneando un código QR.',
    },
    {
      q: '¿Se ve cuánto tiempo queda?',
      a: 'Ni un segundo, y es a propósito: con una cuenta atrás a la vista, en los últimos diez segundos nadie querría coger el móvil y el juego se quedaría parado. La velocidad del tictac tampoco indica si falta poco.',
    },
    {
      q: '¿Puedo saltarme una prueba que no sé hacer?',
      a: 'Sí, pulsa Hecho y ya está. No hay puntuación ni nadie lleva la cuenta de quién se salta qué.',
    },
    {
      q: '¿Podemos añadir nuestras propias pruebas?',
      a: 'Sí. Usa «Vuestras pruebas» en la pantalla de ajustes y colócala en una categoría: seguirá ahí la próxima vez. Se queda en este dispositivo y no se sube a ningún sitio.',
    },
    {
      q: 'Ir pasando un móvil de mano en mano me da un poco de cosa.',
      a: 'Métedlo en una bolsa con cierre, o usad un móvil viejo de repuesto como bomba.',
    },
    {
      q: '¿Y si se bloquea la pantalla a media ronda?',
      a: 'Mientras se juega, la pantalla se mantiene encendida. Si aun así la página pasa a segundo plano, al volver se recalcula al instante: si la mecha se agotó mientras tanto, caes directamente en la explosión.',
    },
    {
      q: '¿Qué le toca hacer a quien pierde?',
      a: 'Lo decidís vosotros; la aplicación no impone nada. Todos habéis visto quién la tenía en la mano.',
    },
  ],
  rulesBack: '← Volver al juego',
};
