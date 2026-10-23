/*
 * Español. Mismas claves y mismos largos de listas que zh-TW (el build lo comprueba).
 * No hay un juego español consolidado para esto: un nombre que se entiende solo (CONCEPT.md sección 4). Palabras del día a día en España.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Reto al revés | Pon tu voz al revés, imítala, dale la vuelta y adivina',
  seoDesc:
    'Alguien graba una frase, el móvil la reproduce al revés y todos imitan ese galimatías; luego se le da la vuelta a la imitación para adivinar qué se dijo. El móvil reparte las consignas (frase, tararear, libre) y podéis pasaros un solo móvil o competir cada uno con el suyo. Sin app ni registro; las grabaciones se quedan en tu móvil.',
  rulesSeoTitle: 'Cómo se juega al Reto al revés: reglas y consejos para quien dirige',
  rulesSeoDesc: 'Las reglas del Reto al revés: cuántos jugadores, cómo dar una consigna, cómo imitar el sonido al revés, por turnos o a ver quién acierta antes, y un texto que quien dirige puede leer tal cual.',

  navTitle: 'Reto al revés',
  navRules: 'Reglas',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Reto al revés: al revés, imita y dale la vuelta',
  heroDesc: 'Graba una frase y el móvil la pone al revés: parece un idioma extraterrestre. Imita ese galimatías, dale la vuelta y a ver quién adivina primero la frase original.',

  lead: {
    setup: ['Número de jugadores', '¡Vamos a jugar al Reto al revés! Alguien graba una frase, el móvil la pone al revés y todos intentamos imitarla; luego le damos la vuelta para oír qué se dijo de verdad.'],
    rules: ['Las reglas', 'Damos una consigna por turnos: quien le toca mira la consigna en secreto y graba una frase. El móvil la pone al revés para todos. Después imitamos ese sonido raro, le damos la vuelta y adivinamos la frase.'],
    end: ['¡Se acabó!', '¡Qué bien imitáis! ¿Quién sonó más parecido y quién acertó primero? Para otra ronda, pulsa «Jugar otra vez».'],
  },
  ruleCards: [
    ['Mirar y grabar', 'A quien le toca saca una consigna: hacer una frase con una palabra, tararear una canción o decir lo que quiera. El móvil le da la vuelta a la grabación.'],
    ['Imitar el galimatías', 'Escuchad el sonido al revés, repetidlo igual, grabadlo y dadle la vuelta: suena sorprendentemente parecido al original.'],
    ['Adivinar la frase', '¿No sale? Mirad la pista y después escuchad el original para la respuesta. La siguiente persona da la próxima consigna.'],
  ],
  rulesNext: 'Siguiente: a jugar',

  startButton: 'Empezar',
  countLabel: 'Jugadores',
  countLess: 'Un jugador menos',
  countMore: 'Un jugador más',
  perLabel: 'Consignas cada uno',
  per1: '1',
  per2: '2',
  perFree: 'Sin límite',
  roundsHint: '{total} rondas: por turnos, cada uno da una consigna y se acaba.',
  roundsFreeHint: 'Sin límite: jugad lo que queráis y mantened pulsado «Terminar» al final.',
  modeLabel: 'Adivinar',
  modeOne: 'Por turnos',
  modeEach: 'A ver quién antes',
  modeOneHint: 'Basta con un móvil: tras grabar, se pasa a la siguiente persona, que imita y le da la vuelta.',
  modeEachHint: 'Todos escanean el código QR para abrir la grabadora, imitan y le dan la vuelta: ¡quien lo sepa primero, que lo grite!',
  recOnlyLink: 'Vengo a adivinar: solo la grabadora',

  kindNames: { sentence: 'Frase', hum: 'Tararear', free: 'Libre' },
  sentenceTask: 'Di una frase con «{word}»',
  roundNo: 'Ronda {n} / {total}',
  roundNoFree: 'Ronda {n}',
  drawButton: 'Sacar consigna',
  drawHint: '¡Solo mira quien le toca!',
  revealHint: '¿Te la sabes? Tápala 👇',
  coverButton: 'Tapar',
  cardShuffle: 'Otra',
  coveredText: 'Consigna tapada',
  peekAgain: 'Volver a mirar',
  hintButton: 'Pista',
  hintLine: 'Pista: {hint}',
  hintWord: '«{word}»',
  answerButton: 'Ver respuesta',
  prompts: {
    sentence: [
      // sustantivos
      'plátano', 'churros', 'tormenta', 'extraterrestre', 'tortilla', 'metro', 'bocadillo', 'gatito', 'dinosaurio', 'helado',
      'cepillo de dientes', 'despertador', 'tarta de cumpleaños', 'bicicleta', 'paraguas', 'piña', 'paella', 'concierto', 'café', 'pingüino',
      'móvil', 'profe', 'superhéroe', 'ascensor', 'sandía', 'Papá Noel', 'hamburguesa', 'panda', 'playa', 'arcoíris',
      'secador', 'palomitas', 'nevera', 'robot', 'chocolate',
      // verbos
      'nadar', 'estornudar', 'bailar', 'dormir', 'lavarse los dientes', 'ducharse', 'cantar', 'perderse', 'llamar por teléfono', 'hacer cola',
      'ponerse a dieta', 'llegar tarde', 'hacerse un selfi', 'discutir', 'mudarse',
      // adjetivos y sensaciones
      'enfadado', 'con sueño', 'muerto de hambre', 'helado de frío', 'feliz', 'nervioso', 'incómodo', 'agotado', 'riquísimo', 'demasiado picante',
      'tímido', 'aburrido',
      // situaciones
      'en el metro', 'en la primera cita', 'el fin de semana', 'un día de lluvia', 'la noche antes del examen', 'en Nochevieja', 'en las fiestas del pueblo', 'el día de mi cumpleaños', 'a las tres de la mañana', 'el lunes por la mañana',
      // conectores
      'pero', 'si', 'porque', 'aunque', 'mientras', 'cada vez más', 'no solo… sino también', 'de repente', 'por fin', 'en realidad',
      'en cuanto', 'sin embargo',
    ],
    hum: ['Tararea una canción infantil', 'Tararea un éxito que todo el mundo conozca', 'Tararea una sintonía de serie o de anuncio', 'Tararea una canción que escuches mucho últimamente'],
    free: ['Di lo que más te apetece decir hoy', 'Di un trabalenguas', 'Di tu coletilla favorita', 'Imita una frase de una peli o unos dibujos'],
  },

  recordHeading: 'Graba tu consigna',
  recordHint: 'Di una frase con tu consigna (15 segundos como máximo). Luego adivinan todos.',
  guessHeading: 'Ponla para todos',
  guessHint: 'Escuchad bien: podéis ponerla todas las veces que queráis.',
  askReverse: 'Al revés',
  redoLink: '¿No te gusta? Vuelve a grabar',
  stageCopy: 'La siguiente persona imita',
  stageCopyOne: 'Pasa el móvil: escucha el sonido al revés, repítelo igual, pulsa «Darle la vuelta» y adivina la frase.',
  copyMine: 'Mi imitación',
  copyReverse: 'Darle la vuelta',
  qrAlt: 'Código QR que abre la grabadora',
  stuckHeading: '¿No sale?',
  nextLocked: 'Escuchad el original con «Ver respuesta» antes de seguir.',
  nextRound: 'Siguiente ronda',
  lastRound: 'Listo: ver el final',
  // 要按住才會結束，防手滑（跟果園菜園動物園、竹筍同一個做法）
  endGame: 'Mantén pulsado para terminar',
  againButton: 'Jugar otra vez',

  recOnlyTitle: 'Grabadora al revés',
  recOnlyDesc: 'Graba el sonido al revés o tu imitación y pulsa «Al revés».',
  recOnlyMine: 'Original',
  recOnlyReverse: 'Al revés',
  recOnlyBack: '← Quiero dar una consigna',

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'Se borrará la grabación de esta ronda.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo se juega al Reto al revés',
  rulesIntro: 'Por turnos, alguien da una consigna: graba una frase y el móvil la pone al revés. Los demás imitan ese galimatías, le dan la vuelta y adivinan qué se dijo.',
  rulesFacts: [
    ['Jugadores', 'De 2 a 20'],
    ['Duración', 'Una consigna cada uno, o lo que queráis'],
    ['Necesitáis', 'Un móvil; en grupos grandes, cada uno puede competir con el suyo'],
  ],
  rulesHowHeading: 'Cómo se juega',
  rulesHowSteps: [
    'Por turnos. Cuando te toque, saca una consigna en el móvil: hacer una frase con una palabra, tararear una canción o decir lo que quieras.',
    'Tapa la consigna, pulsa «Grabar» (15 segundos como máximo) y luego «Al revés» para que lo oigan todos.',
    'Por turnos: pasa el móvil; la siguiente persona repite el sonido al revés y pulsa «Darle la vuelta». A ver quién antes (4 o más): todos escanean el código QR, imitan, le dan la vuelta y quien lo sepa primero lo grita.',
    '¿No sale? Mirad la pista y luego pulsad «Ver respuesta» para oír el original. Después da la consigna la siguiente persona; se acaba cuando todos han pasado.',
  ],
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: 'Ahora alguien va a grabar una frase y el móvil la va a poner al revés: sonará como un idioma extraterrestre. Imitad ese sonido tal cual, dadle la vuelta y adivinad qué se dijo de verdad. Cada uno dará una consigna por turnos.',
  rulesLeadSteps: [
    'Da tú la primera consigna: con una demostración, todos lo pillan.',
    'Las frases cortas se imitan mejor: de 3 a 5 segundos es ideal. Más largo, al revés no lo acierta nadie.',
    'Sin vergüenza al imitar: cuanto más raro suene, más gracia tiene al darle la vuelta.',
  ],
  rulesBack: '← Volver al juego',
};
