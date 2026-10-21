/*
 * Español. Mismas claves que zh-TW.js. El nombre sigue el juego de grupo conocido
 * «Contar hasta diez», no una traducción literal (CONCEPT.md sección 5).
 * Los marcadores como {n} se dejan tal cual.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Contar hasta diez | Juego rompehielos con nombres divertidos, canción y música',
  seoDesc:
    'Todos se agachan como brotes de bambú. Cualquiera puede levantarse y decir el siguiente número, pero si dos se levantan a la vez, se queda de pie quien grite antes el nombre del otro. El último agachado pierde. El móvil reparte nombres divertidos (comidas, bebidas, animales, personajes de dibujos), pone la canción y la música, y termina con una tragaperras de verdad o reto. Sin material, sin descargas, sin registro.',
  rulesSeoTitle: 'Cómo jugar a Contar hasta diez: reglas y consejos para dirigirlo',
  rulesSeoDesc:
    'Las reglas de Contar hasta diez: cuántos juegan, cómo funcionan los nombres, qué pasa si dos se levantan a la vez, quién pierde y un texto corto que quien dirige puede leer en voz alta.',

  navTitle: 'Contar hasta diez',
  navRules: 'Cómo se juega',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Contar hasta diez: levántate, di un número, grita un nombre',
  heroDesc: 'Todos se agachan y se van levantando de uno en uno con el siguiente número. ¿Dos de pie a la vez? Gana quien grite antes el nombre del otro. El último agachado pierde.',

  lead: {
    setup: ['Elige un tema', '¡Vamos a jugar a Contar hasta diez! Primero elegid un tema: enseguida cada uno tendrá un nombre.'],
    name: ['Sacad los nombres', 'Pasad el móvil. Cada uno saca un nombre y lo lee en voz alta para que todos lo oigan.'],
    rules: ['Las reglas', 'Todos se agachan como brotes de bambú. Después de la canción, cualquiera puede levantarse y decir el siguiente número, empezando por el 1. Si dos se levantan a la vez, ¡a gritar el nombre del otro! El último agachado pierde.'],
    play: ['¡Ya!', '¡Todos abajo! Repetid conmigo: bambú, bambú, ¡arriba!'],
    end: ['¿Quién perdió?', 'El último agachado elige verdad, reto o al azar, ¡y tira de la tragaperras!'],
  },
  ruleCards: [
    ['Levántate y cuenta', 'Cualquiera puede levantarse cuando quiera y decir el siguiente número. ¡Prohibido ponerse de acuerdo!'],
    ['¿A la vez? Grita un nombre', 'Quien grite antes el nombre del otro se queda de pie; el más lento se vuelve a agachar. ¿Gritáis a la vez? Piedra, papel o tijera.'],
    ['El último pierde', 'Quien siga agachado al final, pierde.'],
  ],
  rulesNext: 'Siguiente: a jugar',

  themeHeading: 'Tema de los nombres',
  themeRandom: 'Al azar',
  themeRandomSub: 'Elige el móvil',
  themeFood: 'Comida',
  themeDrink: 'Bebidas',
  themeAnimal: 'Animales',
  themeFruit: 'Frutas',
  themeDessert: 'Postres',
  themeCartoon: 'Dibujos',
  themeRealname: 'Nombres reales',
  themeRealnameSub: 'Sin nombres nuevos',
  themeExample: '{a}, {b}…',
  startNaming: 'Empezar el juego',
  startRealname: 'Empezar el juego',

  nameTurn: 'Jugador {n}',
  nameTheme: 'Tema: {theme}',
  rerollTheme: 'Otro tema',
  drawButton: 'Sacar un nombre',
  ownButton: 'Elegir el mío',
  ownSay: 'Piensa un nombre y dilo bien alto: «¡Soy ___!». Después pasa el móvil.',
  ownCancel: 'Mejor sacar uno',
  ownSlot: 'Nombre propio {n}',
  youAre: 'Eres…',
  redraw: 'Otro',
  passNext: 'Pasar al siguiente',
  revealHint: '¿Lo tienes? Pulsa «Pasar al siguiente» y entrega el móvil 👇',
  poolEmpty: 'Ya no quedan nombres de este tema: invéntate uno.',
  namedHeading: 'Nombres ya elegidos',
  removeName: 'Quitar «{name}»',
  allDone: 'Todos tienen nombre, siguiente',
  allDoneNeed: 'Hacen falta al menos {n} jugadores.',

  playNames: 'Os presento a los brotes de hoy: ¡{names}!',
  listSep: ', ',
  startRound: 'Empezar la ronda',
  endRound: 'Mantén para terminar',
  musicLabel: 'Música',
  chant: ['Bam', 'bú', 'bam', 'bú', 'a', 'rri', '¡ba!'],
  playHintIdle: 'Todos agachados y pulsad empezar.',
  playHintRunning: '¿A la vez? ¡Grita su nombre! El último agachado pierde.',

  againButton: 'Otra ronda',

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'Se borrarán los nombres que habéis sacado.',
  leaveConfirm: 'Al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo jugar a Contar hasta diez',
  rulesIntro: 'Todos se agachan como brotes de bambú y se van levantando de uno en uno con el siguiente número. Si dos se levantan a la vez, se pican a ver quién grita antes el nombre del otro. El último agachado pierde.',
  rulesFacts: [
    ['Jugadores', 'De 4 a 20'],
    ['Duración', '1–2 minutos por ronda'],
    ['Material', 'Nada, solo el móvil de quien dirige'],
  ],
  rulesHowHeading: 'Cómo se juega',
  rulesHowSteps: [
    'Elegid un tema y pasad el móvil: cada uno saca un nombre (o se inventa uno, o usa su nombre real).',
    'Todos se agachan y dicen juntos: «Bambú, bambú, ¡arriba!».',
    'Cualquiera puede levantarse y decir el siguiente número, empezando por el 1. Quien se levanta ya no se vuelve a agachar.',
    'Dos se levantan a la vez: quien grite antes el nombre del otro se queda de pie y su número cuenta; el más lento se vuelve a agachar. ¿A la vez? Piedra, papel o tijera. ¿Nombre equivocado? Seguid hasta que alguien acierte. ¿Tres o más? Se queda quien grite antes cualquier nombre.',
    'El último que sigue agachado pierde. Con N jugadores se cuenta hasta N−1.',
  ],
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: 'Primero cada uno saca un nombre en el móvil. Luego nos agachamos todos y cualquiera puede levantarse con el siguiente número, pero si dos se levantan a la vez, ¡a gritar el nombre del otro! El último agachado pierde.',
  rulesLeadSteps: [
    'Cuando estén todos los nombres, levanta el móvil para que todos vean la lista.',
    'Quién gritó antes lo decide el grupo. Quien dirige solo tiene que gritar «¡Choque!».',
    'Quien pierde tira de la tragaperras, responde o hace el reto, y directos a «Otra ronda».',
  ],
  rulesBack: '← Volver al juego',
};
