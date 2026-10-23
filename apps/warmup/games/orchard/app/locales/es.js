/*
 * Español. Claves y longitudes de listas iguales que zh-TW.js (topics puede tener otro número).
 * No encontramos un equivalente claro → nombre descriptivo «Categorías al ritmo».
 * Arranque: «¡Un, dos, tres!», y quien dirige dice el tema.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Categorías al ritmo | Juego rompehielos con metrónomo en el móvil y verdad o reto',
  seoDesc:
    'Quien dirige dice un tema –«¡El desayuno!»– y por turnos, al ritmo: palmas, palmas, «tostada»; palmas, palmas, «churros»… Nada repetido, nada fuera del tema. El móvil saca temas al azar (fruta, el zoo, el súper…), marca un ritmo ajustable, guía a quien dirige paso a paso y quienes pierden giran la tragaperras de verdad o reto. Sin material, sin descargas, sin registro.',
  rulesSeoTitle: 'Cómo se juega a Categorías al ritmo: reglas y guion para quien dirige',
  rulesSeoDesc: 'Reglas de Categorías al ritmo: cuántas personas, cómo va el ritmo de palmas-palmas-palabra, qué cuenta como fallo, qué pasa después, un texto corto para leer e ideas de temas.',

  navTitle: 'Categorías al ritmo',
  navRules: 'Cómo se juega',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Categorías al ritmo: palmas, palmas, una palabra… y nada repetido',
  heroDesc: 'Quien dirige dice un tema, por ejemplo «El zoo», y por turnos al ritmo: palmas, palmas, «león»; palmas, palmas, «jirafa»… Si repites algo ya dicho o te sales del tema, pierdes.',

  lead: {
    setup: ['A preparar', '¡Vamos a jugar a Categorías al ritmo! Poneos en círculo: enseguida damos palmas a mi ritmo.'],
    rules: ['Explicar las reglas', 'Tres tiempos: palmas, palmas, palabra; dos palmadas y en el tercer tiempo se dice una palabra. Primero todos juntos: «¡Un, dos, tres!», y luego digo el tema, por ejemplo «El desayuno». Empezando por mí, por turnos decimos algo de desayuno: palmas, palmas, tostada; palmas, palmas, churros… Nada repetido, nada fuera del tema, y si te quedas en blanco demasiado rato, también pierdes. ¡Quien pierde empieza con un tema nuevo!'],
    play: ['¡A jugar!', 'Todos juntos: «¡Un, dos, tres!». Tema: «{topic}»: ¡{say}! Empiezo yo.'],
    end: ['¿Quién ha perdido?', 'Quienes hayan perdido: elegid verdad, reto o al azar, ¡y tirad de la palanca!'],
  },
  ruleCards: [
    ['Decir el tema', 'Quien dirige dice un tema: «El desayuno» es algo de desayuno; «El zoo», animales. El móvil también puede sacar uno al azar.'],
    ['Seguir el ritmo', 'Tres tiempos: palmas, palmas, palabra. Primero «¡Un, dos, tres!» todos juntos, luego el tema, y a quien le toca dice una palabra en el tercer tiempo.'],
    ['¿Repetido? ¡Pierdes!', 'Nada repetido, nada fuera del tema, y quedarse en blanco demasiado rato también cuenta (decide quien dirige). Luego tema nuevo, y empieza quien perdió.'],
  ],
  rulesNext: 'Siguiente: a jugar',

  startButton: 'Empezar el juego',
  soundLabel: 'Música',

  chant: ['¡Un,', 'dos,', 'tres!'],
  topicSay: 'Di {say}',
  topicShuffle: 'Otro tema',
  topicPick: 'Elegir tema',
  topics: [
    ['La frutería', 'una fruta'],
    ['El huerto', 'una verdura'],
    ['El zoo', 'un animal'],
    ['El súper', 'algo del súper'],
    ['El desayuno', 'algo de desayuno'],
    ['La cafetería', 'una bebida'],
    ['La papelería', 'algo de papelería'],
    ['La cocina', 'un utensilio de cocina'],
    ['Las Olimpiadas', 'un deporte'],
    ['De viaje', 'un medio de transporte'],
    ['El mapa del mundo', 'un país'],
    ['El mapa de España', 'una ciudad'],
    ['La paleta', 'un color'],
    ['Los dibujos animados', 'un personaje de dibujos'],
    ['Las profesiones', 'una profesión'],
    ['El bar de tapas', 'una tapa'],
  ],

  endGame: 'Mantén pulsado para terminar',
  againButton: 'Jugar otra vez',

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'El juego empieza de nuevo, con otro tema.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo se juega a Categorías al ritmo',
  rulesIntro: 'Quien dirige dice un tema y por turnos, al ritmo de palmas, palmas, palabra, cada uno dice algo. Nada repetido, nada fuera del tema. Cuando alguien pierde, se cambia de tema y empieza esa persona.',
  rulesFacts: [
    ['Personas', 'De 4 a 30'],
    ['Duración', 'Lo que queráis'],
    ['Material', 'Nada, solo el móvil de quien dirige'],
  ],
  rulesHowHeading: 'Cómo funciona',
  rulesHowSteps: [
    'En círculo, decid todos juntos al ritmo «¡Un, dos, tres!», y luego quien dirige dice el tema, por ejemplo «El desayuno» (el móvil puede sacar uno al azar).',
    'El móvil marca tres tiempos: palmas, palmas, palabra. En los dos primeros todos dan palmas y en el tercero, a quien le toca dice algo del tema, como «tostada».',
    'La siguiente persona sigue en los tres tiempos siguientes –palmas, palmas, «churros»– y así por todo el círculo.',
    'Repetir algo ya dicho, salirse del tema («león» en el desayuno) o quedarse en blanco demasiado rato (decide quien dirige) es perder.',
    'Cuando alguien pierde, se cambia de tema y empieza esa persona. Cuando quien dirige decide parar, quienes han perdido giran la tragaperras de verdad o reto.',
  ],
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: 'Todos juntos al ritmo: «¡Un, dos, tres!». Tema: «El desayuno»: ¡di algo de desayuno! Empiezo yo: palmas, palmas, tostada; palmas, palmas, churros… Nada repetido, nada fuera del tema, y quedarse en blanco demasiado rato también cuenta. ¡Quien pierda empieza con un tema nuevo!',
  rulesLeadSteps: [
    'Empezad con un ritmo lento. Cuando todo el mundo lo pille, pulsad «más rápido» o activad la aceleración automática.',
    'Cuánto rato en blanco es demasiado lo decide quien dirige: al principio con manga ancha, luego cada vez más estricto.',
    'Al final, que tiren de la palanca todos los que han perdido, o solo quien más veces ha perdido.',
  ],
  rulesBack: '← Volver al juego',
};
