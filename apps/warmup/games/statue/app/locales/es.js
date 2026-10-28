/*
 * Español. Basado en «Luz roja, luz verde» (el nombre más conocido en Latinoamérica y desde El juego del calamar;
 * en España es el «escondite inglés»). Quien la queda dice «luz verde» de espaldas y se gira en «¡luz roja!».
 * Mismo registro que el resto del sitio (móvil, vosotros).
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Luz roja, luz verde: versión acción | Saca una carta y avanza en moto o como un cangrejo',
  seoDesc:
    'Como luz roja, luz verde (el escondite inglés), pero cada uno saca primero una carta de acción en el móvil. Con «Ir en moto» avanzas en moto; con «Andar como un cangrejo», de lado. Si te mueves cuando quien la queda se gira, te pillan. Quien la toca pasa a quedarla y todos vuelven a sacar carta. Al final, quien gana saca una acción para que la imite quien pierde: ¡ráfaga de fotos! Sin material, sin app y sin registro.',
  rulesSeoTitle: 'Cómo se juega a Luz roja, luz verde: versión acción',
  rulesSeoDesc: 'Reglas de Luz roja, luz verde: versión acción: cuántas personas, cómo funcionan las cartas de acción, cuándo te pillan, quién la queda y un texto para que quien dirige lo lea tal cual.',

  navTitle: 'Luz roja, luz verde: versión acción',
  navRules: 'Cómo se juega',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Luz roja, luz verde – versión acción: saca una carta y muévete así',
  heroDesc: 'Como en luz roja, luz verde: si te mueves cuando quien la queda se gira, te pillan. La diferencia es que todos sacan una carta de acción: ir en moto, andar como un cangrejo, caminar como un pingüino… ¡y así se avanza!',

  lead: {
    setup: ['Empezamos', '¡Vamos a jugar a «Luz roja, luz verde: versión acción»! Primero elegimos quién la queda. Se pone allí, mirando a la pared, y los demás nos ponemos aquí en fila.'],
    rules: ['Las reglas', 'Como en luz roja, luz verde: con «luz verde» avanzamos y con «¡luz roja!» quien la queda se gira; si alguien se mueve, lo pilla. La diferencia: todos sacamos una carta de acción. Con «Ir en moto» avanzas en moto; con «Andar como un cangrejo», ¡de lado! Si no te mueves como dice tu carta, también te pillan. Quien la toca pasa a quedarla, quien la quedaba vuelve a jugar y todos sacamos carta otra vez.'],
    go: ['¡Empieza la ronda!', '¿Todos recordáis vuestra acción? Quien la queda, mirando a la pared: ¡luz verde!'],
    end: ['¡Fin del juego!', 'Quien tocó la última vez a quien la queda saca una acción para que la haga. ¡Sacad los móviles: ráfaga de fotos!'],
  },
  ruleCards: [
    ['Saca una carta de acción', 'El móvil va pasando: cada uno saca una carta y recuerda su acción.'],
    ['Avanza con tu acción', 'Con «luz verde», avanza a tu manera: en moto, como un cangrejo…'],
    ['Si te mueves, te pillan', 'Moverte con «¡luz roja!» o no hacer tu acción: te pillan. Quien toca a quien la queda, pasa a quedarla.'],
  ],
  rulesNext: 'Siguiente: sacar cartas',

  startButton: 'Empezar el juego',

  drawCount: '{n} sacadas',
  drawButton: 'Sacar una carta de acción',
  drawHint: '¡Te toca! Saca una',
  drawnHint: 'Recuerda tu acción y pasa el móvil',
  passButton: 'Pasar a la siguiente persona',
  allDrawn: 'Todos tienen carta, ¡a jugar!',
  actions: [
    ['moto', 'Ir en moto'],
    ['crab', 'Andar como un cangrejo'],
    ['penguin', 'Caminar como un pingüino'],
    ['kangaroo', 'Saltar como un canguro'],
    ['hop', 'A la pata coja'],
    ['back', 'Andar hacia atrás'],
    ['model', 'Desfilar como modelo'],
    ['zombie', 'Saltar como un zombi'],
    ['robot', 'Robot'],
    ['moon', 'Moonwalk'],
    ['row', 'Remar'],
    ['horse', 'Montar a caballo'],
    ['skate', 'Patinar'],
    ['ski', 'Esquiar'],
    ['rooster', 'Caminar como un gallo'],
    ['fly', 'Volar como un superhéroe'],
    ['ballet', 'Ballet'],
    ['tiptoe', 'De puntillas'],
    ['rope', 'Funambulista'],
    ['elephant', 'Balancear la trompa de elefante'],
    ['gorilla', 'Gorila golpeándose el pecho'],
    ['ninja', 'Ninja'],
    ['cane', 'Abuelo con bastón'],
    ['basket', 'Cargar bolsas muy pesadas'],
    ['jump', 'Saltar a la comba'],
    ['drive', 'Conducir un coche'],
    ['wiggle', 'Andar moviendo el culete'],
    ['heels', 'Andar con tacones'],
  ],

  goHint: 'Cuando alguien toca a quien la queda, se acaba la ronda: pasa a quedarla y quien la quedaba vuelve a jugar. ¡Todos a la salida y a sacar carta otra vez!',
  nextRound: 'Siguiente ronda: sacar otra vez',
  endGame: 'Mantén pulsado para terminar',
  againButton: 'Jugar otra vez',

  punishHeading: 'Quien gana saca una acción y quien pierde la imita: ¡ráfaga de fotos!',
  punishRandom: 'Sacar una al azar',

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'El juego empieza de nuevo y se vuelven a barajar las cartas.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo se juega a Luz roja, luz verde: versión acción',
  rulesIntro: 'Como luz roja, luz verde (o el escondite inglés), pero cada uno saca primero una carta de acción y tiene que avanzar así. Si te mueves cuando quien la queda se gira, o no haces tu acción, te pillan.',
  rulesFacts: [
    ['Personas', 'De 5 a 30'],
    ['Duración', 'Lo que queráis'],
    ['Material', 'Un poco de espacio y el móvil de quien dirige'],
  ],
  rulesHowHeading: 'Cómo funciona',
  rulesHowSteps: [
    'Elegid quién la queda. Se pone en un extremo mirando a la pared; los demás, en la salida, al otro lado.',
    'El móvil va pasando y cada uno saca una carta de acción (ir en moto, andar como un cangrejo…). En una ronda no se repite ninguna.',
    'Quien la queda, de espaldas, dice «luz verde» y todos avanzan a su manera. Con «¡luz roja!» se gira y todos se quedan quietos.',
    'Quien se mueva, o no esté haciendo su acción, queda pillado y se pone al lado de quien la queda.',
    'Cuando alguien toca a quien la queda, se acaba la ronda: pasa a quedarla, quien la quedaba vuelve a jugar y todos vuelven a la salida a sacar carta.',
    'Cuando os canséis, terminad: quien tocó la última vez saca una acción para que la haga quien la queda, ¡y todos le sacan una ráfaga de fotos!',
  ],
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: '¡Es como luz roja, luz verde, pero antes cada uno saca una carta de acción! Con «Ir en moto» avanzas en moto; con «Andar como un cangrejo», de lado. Si te mueves cuando me giro, o no haces tu acción, te pillo. ¡Quien me toque pasa a quedarla!',
  rulesLeadSteps: [
    'Jugad en un sitio amplio y sin nada con lo que tropezar. Todas las acciones se hacen de pie.',
    'Quien la queda puede decirlo rápido o despacio para pillar a la gente: «Luz… verde… ¡LUZ ROJA!» siempre hace reír.',
    'Quien la queda decide si una acción vale. Al principio con manga ancha y luego más estrictos.',
  ],
  rulesBack: '← Volver al juego',
};
