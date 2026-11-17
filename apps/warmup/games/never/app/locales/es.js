/*
 * Español. Mismas claves que zh-TW. El juego ya tiene nombre: «Yo nunca» (en España «Yo nunca nunca»;
 * suele jugarse bebiendo, aquí se baja un dedo). Los ejemplos son participios que van detrás de «he»,
 * para que suenen bien con «Yo nunca he …» Y con «Yo sí he …» (sin verbos reflexivos: «me he perdido» no encaja).
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Yo nunca | Juego para romper el hielo sin alcohol: el móvil saca un tema cada ronda y quien lo haya hecho baja un dedo',
  seoDesc:
    'Por turnos, cada uno dice «Yo nunca…»: quien lo haya hecho baja un dedo. Con los cinco dedos bajados quedas fuera, y quien conserve dedos hasta el final es el rey. El móvil saca un tema cada ronda (el cole, las costumbres, momentos vergonzosos…) con frases de ejemplo, y también se puede jugar al revés: «Yo sí he…». Sin material, sin descargas, sin registro. El rey elige a alguien para la tragaperras de verdad o reto.',
  rulesSeoTitle: 'Yo nunca: reglas, temas y ejemplos',
  rulesSeoDesc: 'Cómo jugar a «Yo nunca» con dedos en vez de bebida: cuántas personas, cómo se bajan los dedos, quién gana, la versión al revés «Yo sí he», un texto para quien dirige y más de 20 temas con ejemplos.',

  navTitle: 'Yo nunca',
  navRules: 'Cómo se juega',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Yo nunca: si lo has hecho, baja un dedo',
  heroDesc: 'Todos levantan una mano. Por turnos, cada uno dice algo que nunca ha hecho, por ejemplo «Yo nunca he viajado solo al extranjero». Quien lo haya hecho baja un dedo. Con los cinco bajados, fuera. Quien conserve dedos hasta el final gana. El móvil saca un tema cada ronda.',

  modeLabel: 'Modo de juego',
  modeNever: 'Yo nunca',
  modeDid: 'Yo sí he',
  modeHintNever: 'Di algo que nunca hayas hecho. Quien lo haya hecho baja un dedo.',
  modeHintDid: 'Di algo que sí hayas hecho. Quien no lo haya hecho baja un dedo.',

  lead: {
    setup: ['Para empezar', '¡Vamos a jugar a «Yo nunca»! Levantad todos una mano con los cinco dedos abiertos.'],
    rules: ['Las reglas', 'Por turnos, cada uno dice algo que nunca ha hecho, por ejemplo «Yo nunca he viajado solo al extranjero». Quien lo haya hecho baja un dedo. Con los cinco bajados, fuera: ¡gana quien conserve dedos hasta el final! Cada ronda el móvil saca un tema y todo lo que digáis tiene que ir de eso.'],
    play: ['¡A jugar!', 'El tema de esta ronda es «{topic}». Empiezo yo: decid algo sobre {topic} que nunca hayáis hecho. Quien lo haya hecho baja un dedo.'],
    playFree: ['¡A jugar!', 'Esta ronda es libre, ¡vale todo! Empiezo yo: decid algo que nunca hayáis hecho. Quien lo haya hecho baja un dedo.'],
    end: ['¿Quién es el rey?', '¡Quien conserva dedos hasta el final es el rey! El rey elige a alguien, que escoge verdad, reto o al azar… ¡y tira de la palanca!'],
  },
  leadDid: {
    setup: ['Para empezar', '¡Vamos a jugar a «Yo sí he»! Levantad todos una mano con los cinco dedos abiertos.'],
    rules: ['Las reglas', 'Por turnos, cada uno dice algo que sí ha hecho, por ejemplo «Yo sí he ido solo al cine». Quien no lo haya hecho baja un dedo. Con los cinco bajados, fuera: ¡gana quien conserve dedos hasta el final! Cada ronda el móvil saca un tema y todo lo que digáis tiene que ir de eso.'],
    play: ['¡A jugar!', 'El tema de esta ronda es «{topic}». Empiezo yo: decid algo sobre {topic} que sí hayáis hecho. Quien no lo haya hecho baja un dedo.'],
    playFree: ['¡A jugar!', 'Esta ronda es libre, ¡vale todo! Empiezo yo: decid algo que sí hayáis hecho. Quien no lo haya hecho baja un dedo.'],
    end: ['¿Quién es el rey?', '¡Quien conserva dedos hasta el final es el rey! El rey elige a alguien, que escoge verdad, reto o al azar… ¡y tira de la palanca!'],
  },
  ruleCards: [
    ['Un tema por ronda', 'El móvil saca un tema, por ejemplo «El cole», y en esa ronda todo va de eso.'],
    ['Di algo que nunca hayas hecho', 'Por turnos: «Yo nunca…», y tiene que ser verdad. ¿Sin ideas? Debajo del tema hay un ejemplo.'],
    ['¿Lo has hecho? Baja un dedo', 'Quien lo haya hecho baja un dedo. Con los cinco bajados, fuera. ¡Quien quede el último es el rey!'],
  ],
  ruleCardsDid: [
    ['Un tema por ronda', 'El móvil saca un tema, por ejemplo «El cole», y en esa ronda todo va de eso.'],
    ['Di algo que sí hayas hecho', 'Por turnos: «Yo sí he…», y tiene que ser verdad. Cuanta menos gente lo haya hecho, mejor.'],
    ['¿No lo has hecho? Baja un dedo', 'Quien no lo haya hecho baja un dedo. Con los cinco bajados, fuera. ¡Quien quede el último es el rey!'],
  ],
  rulesNext: 'Siguiente: a jugar',

  startButton: 'Empezar el juego',
  soundLabel: 'Música',

  roundLabel: 'Ronda {n}',
  exNever: 'p. ej.: Yo nunca he {ex}',
  exDid: 'p. ej.: Yo sí he {ex}',
  exMore: 'Otro ejemplo',
  topicShuffle: 'Otro tema',
  topicPick: 'Elegir tema',
  nextRound: 'Ya hemos hablado todos: siguiente ronda',
  topics: [
    ['El cole', ['dormido en clase', 'sido delegado de clase', 'olvidado los deberes', 'sacado un cero en un examen']],
    ['Costumbres', ['cantado en la ducha', 'apagado el despertador tres veces', 'pasado un día entero sin móvil', 'hablado con mis plantas']],
    ['Viajes', ['viajado solo al extranjero', 'pasado de parada en el tren', 'pedido indicaciones en otro idioma', 'subido a un avión']],
    ['Comida', ['probado el durián', 'comido solo en un restaurante', 'comido tanto que no podía moverme', 'hecho fideos instantáneos a medianoche']],
    ['Trabajo', ['tenido un trabajo de verano', 'llegado tarde al trabajo', 'olvidado qué decir en una entrevista', 'dado una cabezada en una reunión']],
    ['Deporte', ['corrido una maratón', 'tropezado delante de todos en clase de gimnasia', 'subido a una montaña de verdad', 'pagado el gimnasio sin ir nunca']],
    ['Móvil e internet', ['estado con el móvil hasta el amanecer', 'mandado un mensaje a la persona equivocada', 'comprado una falsificación por internet', 'hecho un directo en redes']],
    ['La infancia', ['intentado escaparme de casa', 'roto un juguete y escondido los trozos', 'pintado en las paredes', 'picado chuches antes de cenar']],
    ['Animales', ['tenido mascota', 'montado a caballo', 'tocado una serpiente', 'recibido una picadura de abeja']],
    ['Momentos vergonzosos', ['tropezado delante de todos', 'llamado a alguien por otro nombre', 'saludado a alguien que no me saludaba a mí', 'llevado la camiseta del revés todo el día']],
    ['Amigos', ['olvidado el cumpleaños de mi mejor amigo', 'ido vestido igual que un amigo', 'hablado con un amigo hasta el amanecer', 'guardado el secreto de un amigo durante años']],
    ['Transporte', ['conducido una moto', 'cogido el autobús equivocado', 'olvidado dónde aparqué', 'dormido hasta el final de la línea']],
    ['Talentos', ['aprendido a tocar un instrumento', 'actuado en un escenario', 'cantado karaoke delante de desconocidos', 'bailado delante de todos']],
    ['En casa', ['cocinado para un grupo grande', 'encogido ropa en la lavadora', 'quemado una olla', 'montado un mueble yo solo']],
    ['Pelis y series', ['llorado con una película', 'visto una serie entera en un día', 'dormido en el cine', 'visto un partido de madrugada']],
    ['Retos', ['subido a una montaña rusa', 'ido solo al cine', 'hablado con un desconocido sin más', 'hecho puenting']],
    ['El tiempo', ['salido con tormenta', 'hecho un muñeco de nieve', 'acabado empapado por la lluvia', 'cogido una quemadura de sol']],
    ['Ronda libre', ['dejado caer el móvil al agua', 'cantado a gritos en público', 'pedido el plato equivocado y comido igual', 'recibido una carta escrita a mano'], 'free'],
  ],

  endGame: '¿Solo queda una mano? Mantén pulsado para terminar',
  againButton: 'Jugar otra vez',

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'El juego empieza de nuevo, con otros temas.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo jugar a «Yo nunca»',
  rulesIntro: 'Todos levantan una mano y, por turnos, dicen algo que nunca han hecho. Quien lo haya hecho baja un dedo; con los cinco bajados, fuera. Gana quien conserve dedos hasta el final. No hace falta material: el móvil saca un tema y da ejemplos cada ronda.',
  rulesFacts: [
    ['Personas', 'De 3 a 15'],
    ['Duración', '10–20 minutos'],
    ['Material', 'Nada, solo el móvil de quien dirige'],
  ],
  rulesHowHeading: 'Cómo funciona',
  rulesHowSteps: [
    'Sentaos en círculo. Todos levantan una mano con los cinco dedos abiertos.',
    'El móvil saca un tema, por ejemplo «El cole», y en esa ronda todo va de eso. En una «Ronda libre» vale todo.',
    'Empezando por quien dirige, cada uno dice algo que nunca ha hecho, por ejemplo «Yo nunca he dormido en clase». Tiene que ser verdad.',
    'Quien lo haya hecho baja un dedo; quien lo dice, no. Con los cinco bajados, fuera.',
    'Cuando hayáis hablado todos, «Siguiente ronda» saca otro tema. Quien conserve dedos hasta el final es el rey y elige a alguien para la tragaperras de verdad o reto.',
  ],
  rulesDidHeading: 'Al revés: «Yo sí he»',
  rulesDidIntro: 'Elegid «Yo sí he» al principio y las reglas se invierten:',
  rulesDidSteps: [
    'Por turnos, cada uno dice algo que sí ha hecho, por ejemplo «Yo sí he ido solo al cine».',
    'Quien no lo haya hecho baja un dedo. Con los cinco bajados, fuera.',
    'Cuanta menos gente lo haya hecho, mejor: gana quien conserve dedos hasta el final.',
  ],
  rulesTopicsHeading: 'Temas y ejemplos',
  rulesTopicsIntro: 'Cada ronda el móvil saca uno de estos temas, con un ejemplo para quien se quede en blanco:',
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: '¡Levantad todos una mano! Por turnos, decimos algo que nunca hemos hecho. Si lo habéis hecho, bajad un dedo: con los cinco bajados, fuera, y gana quien conserve dedos hasta el final. El tema de esta ronda es «Viajes». Empiezo yo: ¡yo nunca he viajado solo al extranjero!',
  rulesLeadSteps: [
    'En la primera ronda empieza tú con algo que mucha gente haya hecho: así todos lo pillan enseguida.',
    '¿Quieres que alguien baje un dedo? Di algo que hayan hecho todos menos esa persona: siempre hace gracia.',
    'Con grupos grandes, jugad con tres dedos en vez de cinco para que vaya más rápido.',
  ],
  rulesBack: '← Volver al juego',
};
