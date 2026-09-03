/*
 * Español. El contexto es el grupo pequeño / grupo de casa de una iglesia.
 * Tuteo en todo el texto, igual que en los demás proyectos de Web100.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Happy Bingo | El bingo rompehielos donde buscas personas, no números',
  seoDesc:
    'Un juego rompehielos para grupos pequeños, grupos de casa y noches de bienvenida. Cada persona recibe un cartón de bingo cuyas casillas no llevan números, sino frases como «Alguien que toca un instrumento». Encuentra a esa persona, ella lo confirma en su propio móvil y la casilla es tuya. Sin descargas, sin registro, y funciona incluso con dos personas.',
  rulesSeoTitle: 'Happy Bingo — Cómo se juega',
  rulesSeoDesc:
    'Abrir una sala, preparar el cartón, cómo funcionan la asignación y la confirmación, y qué conviene decir antes de empezar.',

  navTitle: 'Happy Bingo',
  navRules: 'Cómo se juega',
  rulesLinkText: '¿Primera vez? Mira cómo empezar →',
  langSwitchLabel: 'Cambiar idioma',
  themeToggleLabel: 'Cambiar entre claro y oscuro',

  heroTitle: 'Happy Bingo: encuentra a alguien, charla un poco, marca una casilla',
  heroDesc:
    'Cada persona recibe un cartón de bingo. En las casillas no hay números, sino frases como «Alguien que vino al grupo por primera vez este año». Encuentra a esa persona en la sala: ella confirma en su propio móvil. Completa tantas líneas como pida quien dirige y ganas.',

  createHeading: 'Abrir sala',
  maxPlayersLabel: 'Personas previstas',
  maxPlayersHint: 'De 2 a 30 personas, contándote a ti. Con dos ya se puede.',
  createButton: 'Abrir sala',
  creating: 'Creando…',
  createFailed: 'No se pudo abrir la sala. Inténtalo otra vez.',

  joinHeading: 'Entrar en una sala',
  roomCodeLabel: 'Código de sala',
  roomCodePlaceholder: 'p. ej. A3KP',
  nicknameLabel: 'Tu nombre',
  nicknamePlaceholder: 'Como te llaman aquí',
  avatarLabel: 'Elige un avatar',
  joinButton: 'Entrar',

  joinTitle: 'Entrar en {code}',
  profileContinue: 'Entrar en la sala',
  playerBadge: 'Jugador',
  cancelButton: 'Cancelar',
  backHome: 'Volver al inicio',
  rulesBack: '← Volver al juego',
  roomClosedTitle: 'Sala cerrada',
  roomClosedDesc: 'Quien dirige ha cerrado esta sala.',
  kickedTitle: 'Has salido de la sala',
  kickedDesc: 'Quien dirige te ha sacado de esta sala.',

  roomCodeCaption: 'Código de sala',
  shareHint: 'Que todos escaneen este código QR, o escriban el código de arriba.',
  qrAlt: 'Código QR para entrar en la sala',
  copyLinkButton: 'Copiar enlace',
  copiedToast: 'Enlace copiado',

  settingsHeading: 'Ajustes de esta ronda',

  sizeLabel: 'Tamaño del cartón',
  sizeHint: '3×3 va bien con 5–8 personas o poco tiempo; 5×5, con un grupo grande y tiempo de sobra.',
  sizeOption: '{size}×{size}',

  targetLinesLabel: 'Líneas para ganar',
  targetLinesUnit: '{n}',
  targetLinesHint:
    'Un cartón {size}×{size} tiene {total} líneas en total, y hacen falta al menos {cells} casillas marcadas para completar {n}.',

  hostPlaysLabel: 'Quien dirige también juega',
  hostPlaysHint: 'Desactívalo para solo dirigir: no recibirás cartón. Sigues en la lista, así que pueden asignarte a una casilla y pedirte que confirmes.',
  winnerCountLabel: 'Cuántos aciertos antes de terminar',
  winnerCountUnit: '{n}',
  winnerCountUnlimited: 'Sin límite',
  winnerCountHint: 'La ronda termina automáticamente cuando este número de personas alcanza el objetivo; quien dirige también puede terminarla cuando quiera.',
  selfClaimLabel: 'Permitir «no encuentro a nadie, lo marco yo»',
  selfClaimHint: 'Si no aparece nadie que encaje, se puede marcar la casilla igualmente; en la clasificación sale de otro color. Va bien con 2–4 personas.',

  anchorHeading: 'Casilla fija del centro',
  anchorHint:
    'Esta casilla está en 4 líneas a la vez: es el centro del cartón. Pon aquí una pregunta para la que absolutamente todas las personas presentes encuentren a alguien.',
  anchorCustomLabel: 'Pregunta propia',
  anchorCustomPlaceholder: 'p. ej. Alguien que ha venido hoy',

  questionsHeading: 'Preguntas',
  questionsCount: '{n} de {total} elegidas',
  questionsNeedMore: 'Faltan {n}',
  questionsTooMany: 'Sobran {n}',
  questionsReady: 'El número es el correcto: se puede empezar',
  selectedHeading: 'Elegidas',
  setupDoneButton: 'Abrir sala',
  saveSettingsButton: 'Listo',
  editSettingsButton: 'Ajustes propios',
  settingsSummary: '{size}×{size} · {n} líneas para ganar · {total} preguntas',
  randomButton: 'Al azar',
  clearButton: 'Vaciar',
  categorySelectAll: 'Seleccionar todo',

  customLabel: 'Escribe la tuya',
  customPlaceholder: 'p. ej. Alguien que se prepara su propio bubble tea',
  customAddButton: 'Añadir',
  customRemoveLabel: 'Quitar esta pregunta',

  categoryLife: 'Día a día',
  categoryTalent: 'Habilidades',
  categoryExperience: 'Experiencias',
  categoryChurch: 'Vida del grupo',
  categoryPersonality: 'Carácter',
  categoryFood: 'Comida',
  categoryHobby: 'Aficiones',

  playersHeading: 'En la sala',
  playersCount: '{n} de {total}',
  waitingForHost: 'Esperando a quien dirige. Comprueba que tu nombre sea reconocible para todos.',
  hostBadge: 'Dirige',
  spectatorBadge: 'Mirando',
  offlineBadge: 'Sin conexión',
  kickLabel: 'Sacar de la sala',

  startButton: 'Empezar',
  startBlockedQuestions: 'Todavía faltan preguntas',
  startBlockedAnchor: 'Falta la pregunta del centro',
  startBlockedPlayers: 'Hacen falta al menos dos personas para empezar',

  cardHint: 'Lee las preguntas: ¡ve a conocer a alguien que encaje!',
  progressHeading: '{done} de {target} líneas',
  progressCells: '{n} casillas marcadas',
  progressWon: 'Objetivo cumplido: ve a por el cartón lleno',
  blackoutBadge: 'Cartón lleno',
  wonBadge: 'Conseguido',

  cellPending: 'Pendiente',
  cellSelf: 'Marcada por ti',
  cellWaiting: 'Esperando a {name}',
  cellDone: 'Confirmada por {name}',

  pickHint:
    'Elige a la persona con la que acabas de hablar. Después de enviarlo, tiene que confirmar en su propio móvil.',
  pickEmpty: 'Todavía no hay nadie más en la sala.',
  pickCancel: 'Cancelar',
  selfClaimButton: 'No encuentro a nadie, lo marco yo',

  cancelRequestButton: 'Cancelar',

  incomingHeading: 'Esperan tu confirmación',
  incomingEmpty: 'Ahora mismo nadie necesita que confirmes nada.',
  incomingLine: '{name} te ha elegido',
  confirmButton: 'Confirmar',
  declineButton: 'No soy yo',

  leaderboardLines: '{n} líneas',
  leaderboardCells: '{n} casillas',
  leaderboardWaiting: '{n} te están esperando',

  screenCard: 'Mi cartón',
  boardHeading: 'Clasificación',
  listHeading: 'Preguntas',
  pickPendingBadge: 'Pendiente',
  screenRequests: 'Esperan tu confirmación',

  endButton: 'Terminar la ronda',
  endedHeading: 'Clasificación',
  endedDesc: 'La ronda ha terminado: ¡mira si has entrado en la tabla!',
  resetButton: 'Volver a la sala',

  leaveRoomButton: 'Salir de la sala',
  closeRoomButton: 'Cerrar la sala',
  confirmLeaveTitle: '¿Salir de la sala?',
  confirmLeaveDesc: 'Tu cartón y tu progreso se quitan de esta ronda.',
  confirmLeaveOk: 'Salir',
  confirmCloseTitle: '¿Cerrar la sala?',
  confirmCloseDesc: 'Todo el mundo sale y el resultado de esta ronda no se guarda.',
  confirmCloseOk: 'Cerrar la sala',
  confirmEndTitle: '¿Terminar la ronda?',
  confirmEndDesc: 'Después ya nadie puede asignar casillas y todos pasan a la clasificación final.',
  confirmEndOk: 'Terminar',


  toastConfirmed: '{name} lo ha confirmado: ¡marcada!',
  toastDeclined: '{name} cree que no encaja. Prueba con otra persona',
  toastLine: '{n} líneas completadas',
  toastWon: '¡Objetivo cumplido! {n} líneas',

  errorTitle: 'No se puede entrar en esta sala',
  errRoomNotFound: 'No hay ninguna sala con ese código. Míralo otra vez.',
  errRoomFull: 'La sala está llena.',
  errRoomStarted: 'Esta ronda ya ha empezado.',
  errNicknameRequired: 'Escribe primero tu nombre.',
  errNicknameTaken: 'Ese nombre ya lo está usando alguien. Elige otro.',
  errCannotPickSelf: 'No puedes elegirte a ti.',
  errAlreadyMarked: 'Esa casilla ya está marcada.',
  errAlreadyPending: 'Esa casilla ya está esperando una confirmación.',
  errSelfClaimDisabled: 'Quien dirige no ha permitido marcar por cuenta propia.',
  errSpectatorOnly:
    'Has entrado con la ronda empezada, así que esta vez no tienes cartón, pero sí puedes confirmar para los demás.',
  errQuestionCount: 'El número de preguntas no cuadra con el de casillas.',
  errAnchorRequired: 'Todavía falta la pregunta del centro.',
  errNoPlayers: 'Todavía no hay nadie en la sala.',
  errNetwork: 'Se perdió la conexión, reconectando…',

  mcHeading: 'Esta ronda la diriges, no la juegas',
  mcDesc:
    'Has desactivado «Quien dirige también juega», así que no tienes cartón. Aun así pueden asignarte a una casilla y puedes confirmar para los demás. Vuelve a activarlo desde «Ajustes propios» y en la siguiente ronda tendrás cartón.',
  spectatorHeading: 'Has entrado con la ronda empezada',
  spectatorDesc:
    'Las preguntas y los cartones quedaron fijados al empezar, así que no tienes cartón. Pero estás en la lista: pueden asignarte a una casilla y puedes confirmar para los demás. En la siguiente ronda tendrás cartón.',

  rulesTitle: 'Cómo funciona Happy Bingo',
  rulesIntro:
    'Una ronda dura unos 10–20 minutos según el tamaño y la condición de victoria. Esto es lo que conviene saber, tanto a quien dirige como a quien juega.',
  rulesHostHeading: 'Quien dirige',
  rulesHostSteps: [
    'Elige el tamaño del cartón: 3×3 para 5–8 personas o poco tiempo, 5×5 para un grupo grande con tiempo, 4×4 a medio camino.',
    'En 3×3 y 5×5 escribe una pregunta para el centro. El criterio es que absolutamente todas las personas presentes encuentren a alguien; lo más seguro es «Alguien que ha venido hoy». El cartón 4×4 no tiene esta casilla.',
    'Completa el conjunto de preguntas (9 para 3×3, 16 para 4×4, 25 para 5×5) y cambia todo aquello con lo que no encaje nadie, o con lo que solo encaje una persona.',
    'Decide cuántas líneas hacen falta para ganar. Con grupo pequeño o poco tiempo, mejor pocas.',
    'Con poca gente, activa el marcar por cuenta propia; si no, las casillas sin nadie que encaje dejan la partida atascada.',
    'Dedica un minuto al principio a las tres cosas que importan: la otra persona tiene que confirmar ella misma, alcanzar el objetivo te pone en la tabla pero el juego sigue, y la clasificación es solo para animar.',
  ],
  rulesPlayerHeading: 'Quien juega',
  rulesPlayerSteps: [
    'Escribe tu nombre para entrar y espera a que empiece quien dirige.',
    'Lee tu cartón en cuanto lo recibas. Las preguntas son las mismas para todos, pero el orden cambia de una persona a otra.',
    'Elige una casilla para la que creas que encontrarás a alguien y ve a hablar con esa persona.',
    'De vuelta en el móvil, toca esa casilla y elige a la persona con la que acabas de hablar.',
    'La casilla no se marca hasta que confirme. Si no responde puedes cancelar; si dice que no, busca a otra persona.',
    'Cuando te pidan confirmar, lee la descripción antes de tocar: una confirmación no se puede deshacer.',
  ],
  rulesFaqHeading: 'Preguntas frecuentes',
  rulesFaq: [
    {
      q: '¿Todos tenemos el mismo cartón?',
      a: 'Las mismas preguntas sí, porque el conjunto es común. El orden cambia para cada persona, así que tu tercera casilla no es la tercera casilla de quien tienes al lado. El centro de un cartón 3×3 o 5×5 es la excepción: esa pregunta es igual para todos.',
    },
    {
      q: '¿Puedo recurrir una y otra vez a la misma persona?',
      a: 'Sí, sin ningún límite. Por eso con dos personas ya se puede jugar. En una sala más grande, las preguntas mismas te van llevando hacia gente distinta.',
    },
    {
      q: '¿He ganado al completar una línea? ¿Se para el juego?',
      a: 'El objetivo es el que haya puesto quien dirige, y suele ser más de una línea. Además el juego no se para cuando alguien lo alcanza: sigue hasta que quien dirige lo termine, y quien ya ha llegado puede ir a por el cartón lleno.',
    },
    {
      q: '¿Se puede deshacer una confirmación?',
      a: 'No. Surte efecto en el momento de tocar, así que lee antes la descripción. Rechazar es distinto: eso ocurre antes de que se marque nada.',
    },
    {
      q: '¿Pueden entrar quienes llegan tarde?',
      a: 'Entran en la lista, pero esta ronda se quedan sin cartón, porque las preguntas quedaron fijadas al empezar. Aun así pueden ser elegidos y pueden confirmar para los demás, y en la siguiente ronda sí tendrán cartón.',
    },
  ],
};
