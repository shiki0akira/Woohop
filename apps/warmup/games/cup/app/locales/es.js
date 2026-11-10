/*
 * Español. Nombre: Hasta el borde (CONCEPT.md §4 — el juego no tiene nombre establecido
 * en ningún idioma, así que cada lengua usa su propia expresión para «lleno hasta el borde»).
 * Los marcadores como {n} se dejan tal cual.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Hasta el borde | Un solo móvil, se echa agua por turnos y no debe desbordarse',
  seoDesc:
    'Un juego para romper el hielo con un solo móvil: de 2 a 12 personas echan agua por turnos en el mismo vaso. Un toque y sale el agua, otro toque y se corta; luego se pasa el móvil. El agua sube hasta el borde y la tensión superficial la aguanta formando una cúpula: quien la haga desbordar, pierde. Cada partida sale un recipiente distinto: copa de vino, vaso de agua, botella de cuello estrecho e incluso una jarra de barro en la que solo puedes guiarte por el oído. Sin descargas ni registro.',
  rulesSeoTitle: 'Cómo se juega a Hasta el borde: reglas y guion para quien dirige',
  rulesSeoDesc: 'Cómo se juega a Hasta el borde: cuántas personas, cómo elegir el tamaño del vaso según el grupo, en qué se diferencian los ocho recipientes, cuándo cuenta como desbordado y unas frases que quien dirige puede leer en voz alta.',

  navTitle: 'Hasta el borde',
  navRules: 'Cómo se juega',
  rulesLinkText: 'Reglas completas →',
  soundLabel: 'Sonido', // un solo botón para el sonido del agua y la música, así que no es «música»

  heroTitle: 'Hasta el borde: se echa agua por turnos y quien la desborda pierde',
  heroDesc: 'Un móvil va dando la vuelta al corro. Un toque y sale el agua, otro toque y se corta: ese es tu turno, y lo pasas. Cuando la tensión superficial aguanta el agua por encima del borde, nadie se atreve a tocar. Y en cada partida cambia el recipiente.',

  // ---------- Pasos para dirigir ----------
  // [título, para leer en voz alta]. Mientras el móvil circula no se pone cabecera de paso (apps/warmup/CLAUDE.md)
  lead: {
    setup: ['Empezamos', '¡Vamos a jugar a «Hasta el borde»! Poneos todos en corro: este móvil va a pasar por las manos de cada uno.'],
    rules: ['Explicar las reglas', 'En el móvil hay un vaso. Cuando te toque, pulsa una vez «Echar agua» y otra vez para cortarla: cada persona echa una sola vez y pasa el móvil. La tensión superficial aguanta el agua en una cúpula por encima del borde, así que siempre parece que se va a desbordar y no lo hace. A sorbitos aguanta muchísimo; una pasada de codicia y pierdes al momento. El recipiente cambia cada partida, y algunos no son transparentes: ¡entonces hay que escuchar!'],
    end: ['¡Se ha desbordado!', '¡Ha sido esta persona! Que tire de la ruleta de verdad o atrevimiento y luego empieza otro, que vamos con otro vaso.'],
  },
  // Las tres tarjetas ilustradas del paso «Explicar las reglas»: [título, texto]
  ruleCards: [
    ['Echar agua', 'En tu turno pulsa «Echar agua» y pulsa otra vez para cortarla. Puedes echar lo que quieras, pero al tocar siempre cae algo.'],
    ['Pasar el móvil', 'Una vez cada persona. Pulsa «Pasar el móvil» y entrégalo.'],
    ['Si se desborda, pierdes', 'El agua se abomba por encima del borde sin caer: esa es la tensión superficial. Quien la haga desbordar pierde. Y el recipiente es distinto cada partida.'],
  ],
  rulesNext: 'Empezar a jugar',

  // ---------- Pantalla de inicio ----------
  startButton: 'Empezar a jugar',
  // Tamaño del vaso: siempre a la vista (elegirlo según el grupo es un paso que no conviene saltarse)
  advancedLabel: 'Tamaño del vaso',
  sizeHint: 'Elígelo según cuántos seáis: con cada tamaño alguien pierde más o menos a la primera o segunda vuelta. Máximo 12 personas; si sois más, haced dos grupos.',
  sizeSmall: 'Pequeño\n2–5 personas',
  sizeNormal: 'Normal\n6–9 personas',
  sizeLarge: 'Grande\n10–12 personas',

  // ---------- Echando agua ----------
  // En cada partida se sortea un recipiente (SHAPES en app.js); las claves son las mismas
  shapeNotes: {
    goblet: 'Esta partida: una copa de vino. Ancha abajo y cerrada arriba, así que cuanto más cerca del borde, más rápido sube.',
    glass: 'Esta partida: un vaso de agua recto. Igual de ancho de arriba abajo, el nivel es el más fácil de prever. El más justo de todos.',
    bottle: 'Esta partida: una botella de vidrio de cuello estrecho. Cuerpo ancho y cuello fino: en cuanto el agua entra en el cuello, se dispara.',
    pot: 'Esta partida: una jarra de barro opaca. No ves el nivel y encima la boca es pequeñísima. Guíate por el oído: cuanto más agudo suena, más llena está.',
    mug: 'Esta partida: una taza opaca. No ves el nivel, pero la boca es ancha, así que verás el agua cuando esté a punto.',
    measure: 'Esta partida: un vaso medidor. Tiene marcas, así que poneos de acuerdo en una línea que nadie debe pasar y gana mucho.',
    beaker: 'Esta partida: un vaso de precipitados. Bajo y ancho: con la misma agua el nivel sube lo mínimo. El más indulgente.',
    flask: 'Esta partida: un termo opaco. No ves el nivel y la boca es estrecha: el más difícil de los ocho.',
  },
  // Si sale un recipiente opaco con el sonido apagado: solo se sugiere, nunca se bloquea
  soundNudge: 'Enciende el botón de la nota arriba: lo agudo del agua te dice si ya está a punto de llenarse.',
  pourTurn: 'Persona {n}',
  pourButton: 'Echar agua',
  pourStopButton: 'Cortar',
  pourHint: 'Un toque y sale el agua, otro toque y se corta. Echa lo que quieras.',
  // La parte en la que el agua sobresale del borde (CONCEPT.md 2.5)
  tenseHint: 'El agua ya sobresale del borde… ¡una gota más y se desborda!',
  passSay: '¡Ya está! Pasa el móvil a la siguiente persona, le toca echar a ella.',
  drawSay: 'Sorteando un recipiente…',
  passButton: 'Pasar el móvil',
  overflowFlash: '¡Se desbordó!',

  // ---------- Se ha desbordado ----------
  endTitle: '¡Se ha desbordado!',
  // Quién ha perdido lo ve todo el mundo, así que solo contamos las veces que aguantó
  endStats: 'Este vaso aguantó {n} veces',
  endBest: 'Récord de hoy: {n}',
  slotHeading: 'Quien pierde, tira: ¿verdad o atrevimiento?',
  againButton: 'Otro vaso',

  // ---------- Confirmación para volver ----------
  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'Este vaso se vacía y la partida empieza otra vez desde cero.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  // ---------- Página de reglas ----------
  rulesTitle: 'Cómo se juega a Hasta el borde',
  rulesIntro: 'Un móvil va dando la vuelta al corro: todos echan agua por turnos en el mismo vaso, una vez cada uno, y quien lo haga desbordar pierde.',
  rulesFacts: [
    ['Personas', '2–12'],
    ['Tiempo', '2–5 minutos por vaso'],
    ['Hace falta', 'Un móvil (si lo queréis de verdad, un vaso transparente y una jarra de agua)'],
  ],
  rulesHowHeading: 'Cómo se juega',
  rulesHowSteps: [
    'Sentaos en corro y dad el móvil a la primera persona. Antes de empezar, elegid el tamaño del vaso según cuántos seáis: pequeño para 2–5, normal para 6–9, grande para 10–12.',
    'A quien le toque pulsa «Echar agua» y el agua entra en el vaso; otro toque la corta. No hay límite por arriba, pero en cuanto tocas, algo cae siempre.',
    'Después pulsa «Pasar el móvil» y se lo da a quien tiene al lado. Una vez cada persona, y así vuelta y vuelta.',
    'Cuando el agua llega al borde, la tensión superficial la aguanta formando una cúpula: parece desbordada y todavía no lo está. La imagen se acerca al borde y es el mejor momento del juego. A sorbitos aún caben ocho o diez veces más; si dejas el grifo abierto, se desborda en un segundo.',
    'Quien la haga desbordar pierde. Tira de verdad o atrevimiento y luego empieza otra persona con el siguiente vaso.',
  ],
  rulesShapesHeading: 'Cada partida, un recipiente distinto',
  rulesShapesIntro: 'El recipiente se sortea entre ocho y la sensación cambia muchísimo. Tres son opacos y no dejan ver el nivel: se puede jugar con el sonido apagado (al llegar al borde el agua asoma por la boca), pero con sonido vas con ventaja, porque lo agudo del agua te avisa antes de que esté llena.',
  rulesShapes: [
    ['Copa de vino', 'Ancha abajo y cerrada arriba: cuanto más cerca del borde, más rápido sube el nivel.'],
    ['Vaso de agua recto', 'Igual de ancho de arriba abajo, el nivel sube de forma constante. El más fácil de leer y el más justo.'],
    ['Botella de cuello estrecho', 'Cuerpo ancho y cuello fino: el agua se dispara en cuanto entra en el cuello. El tramo más emocionante.'],
    ['Vaso medidor', 'Tiene marcas, así que es el único con el que de verdad se puede calcular. Acordad una línea que nadie debe pasar.'],
    ['Vaso de precipitados', 'Bajo y ancho: con la misma agua el nivel sube lo mínimo. El más indulgente.'],
    ['Jarra de barro opaca', 'No se ve el nivel y la boca es pequeña: solo asoma un poco de agua al final.'],
    ['Taza opaca', 'No se ve el nivel, pero la boca es ancha y el agua se ve pronto. La más fácil de las tres opacas.'],
    ['Termo opaco', 'No se ve el nivel, la boca es estrecha y al final el agua se dispara. El más difícil de los ocho.'],
  ],
  rulesLeadHeading: 'Consejos para dirigirlo',
  rulesLeadSay: '¡Vamos a jugar a «Hasta el borde»! En el móvil hay un vaso: cuando te toque, un toque y sale el agua, otro y se corta, una sola vez cada uno. Arriba el agua se abomba sobre el borde sin caer, así que siempre parece que se acaba… ¡y quien la haga desbordar pierde!',
  rulesLeadSteps: [
    'Si queréis material de verdad, preparad un vaso transparente y una jarra de agua, y echad agua de verdad mientras en el móvil está saliendo: el ambiente cambia por completo. Sin material, con el móvil solo funciona igual de bien.',
    'Elige siempre el tamaño del vaso según el grupo (2–5, 6–9, 10–12 personas). Bien elegido, alguien pierde a la primera o segunda vuelta. Si sois más de 12: dos grupos con un móvil cada uno.',
    'En la primera vuelta todos tocan un instante nada más; no hace falta meterles prisa. En cuanto el agua empieza a abombarse, se frenan solos.',
    'Después de verdad o atrevimiento, el siguiente vaso empieza por quien está al lado de quien ha perdido, así no abre siempre la misma persona.',
  ],
  rulesBack: '← Volver al juego',
};
