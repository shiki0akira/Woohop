/*
 * Español. En España se dice «mímica» (en Latinoamérica «Caras y gestos», va en la descripción). Mismo registro que el
 * resto del sitio (móvil, vosotros). Las palabras son para hispanohablantes, no traducidas; las «expresiones» son
 * expresiones españolas que se pueden representar. Las pistas descubren letras.
 */
export default {
  htmlLang: 'es',
  ogLocale: 'es_ES',

  seoTitle: 'Mímica | Generador de palabras para jugar a mímica en el móvil, con pistas',
  seoDesc:
    'Las palabras para jugar a mímica (o caras y gestos) te las da el móvil: animales, profesiones, deportes, vida diaria, comida, transportes, objetos, situaciones graciosas y expresiones; cientos de palabras y eliges las categorías. Por turnos, alguien la representa sin hablar hasta que otro la adivina; se puede pasar una palabra imposible y dar pistas cuando nadie la saca. Sin app y sin registro: para fiestas, team buildings y cenas familiares.',
  rulesSeoTitle: 'Cómo se juega a mímica: reglas, categorías y consejos',
  rulesSeoDesc: 'Reglas de mímica: cuántas personas, cómo van los turnos, qué está prohibido, cuándo vale una respuesta y un texto para que quien dirige lo lea tal cual.',

  navTitle: 'Mímica',
  navRules: 'Cómo se juega',
  gameBack: 'Volver',
  rulesLinkText: 'Todas las reglas →',

  heroTitle: 'Mímica: saca una palabra y represéntala, ¡sin hablar!',
  heroDesc: 'Por turnos, alguien saca una palabra en el móvil y la representa sin decir nada mientras los demás adivinan. Se pueden pasar las imposibles y dar pistas cuando nadie la saca: ¡quien la adivina se lleva un punto!',

  lead: {
    setup: ['Empezamos', '¡Vamos a jugar a mímica! Primero ponemos cuántos somos, elegimos las categorías de hoy y nos sentamos en círculo.'],
    rules: ['Las reglas', 'Vamos por turnos. Cuando te toca, coges el móvil, sacas una palabra y la representas: sin hablar, sin hacer ruidos y sin vocalizar. Los demás dicen respuestas hasta que alguien la adivina, y se lleva un punto. Antes de empezar se puede pasar una palabra; después queda tapada y, si nadie la saca, se puede dar una pista: la categoría o una letra de la respuesta. ¡Gana quien tenga más puntos!'],
    end: ['¡Fin del juego!', 'Contad cuántas habéis adivinado: ¡gana quien tenga más!'],
  },
  ruleCards: [
    ['Por turnos', 'A quien le toca coge el móvil y saca una palabra. ¡Que no la vea nadie!'],
    ['Representar sin hablar', 'Sin hablar, sin ruidos, sin vocalizar y sin señalar cosas de la sala.'],
    ['Adivinar da puntos', 'Se sigue hasta que alguien la adivina: el primero se lleva un punto. ¿Nadie la saca? Una pista.'],
  ],
  rulesNext: 'Siguiente: a jugar',

  categoryLabel: 'Categorías',
  categoryHint: 'Elige las que quieras (al menos una)',
  countLabel: 'Cuántos jugáis',
  countLess: 'Una persona menos',
  countMore: 'Una persona más',
  perLabel: 'Palabras por persona',
  per1: '1',
  per2: '2',
  perFree: 'Sin límite',
  roundsHint: '{total} palabras en total: por turnos, y el juego acaba cuando se terminan.',
  roundsFreeHint: 'Sin límite: mantén pulsado «Terminar» cuando queráis acabar.',
  startButton: 'Empezar el juego',

  roundNo: 'Palabra {n} de {total}',
  roundNoFree: 'Palabra {n}',
  turnWho: 'Le toca a la persona {k}',
  drawButton: 'Sacar una palabra',
  drawHint: '¡Te toca! Saca una, que no la vea nadie',
  startActing: '¡A representar!',
  skipButton: 'Otra',
  gotIt: '¡Adivinada!',
  peekButton: 'Volver a ver la palabra',
  continueActing: '¡Seguir!',
  hintKindButton: 'Decir la categoría',
  hintCharButton: 'Destapar una letra',
  gotItResult: '¡Adivinada!',
  gotItHint: 'Quien la ha adivinado se lleva un punto: ¡apuntad los puntos!',
  answerIs: 'La respuesta era',
  nextTurn: 'Siguiente persona',
  seeResult: 'Ver el resultado',
  endGame: 'Mantén pulsado para terminar',
  againButton: 'Jugar otra vez',

  categories: [
    ['animals', 'Animales', [
      'Canguro', 'Pingüino', 'Elefante', 'Jirafa', 'Mono', 'Cangrejo', 'Pulpo', 'Serpiente', 'Rana', 'Conejo',
      'Búho', 'Pavo real', 'Cocodrilo', 'Koala', 'Delfín', 'Mariposa', 'Abeja', 'Gallo', 'Tortuga', 'León',
      'Águila', 'Ardilla', 'Erizo', 'Mosquito', 'Tiburón', 'Gorila', 'Hipopótamo', 'Murciélago', 'Araña', 'Avestruz',
      'Foca', 'Panda', 'Perezoso', 'Caracol', 'Pájaro carpintero', 'Flamenco', 'Camaleón', 'Toro',
    ]],
    ['jobs', 'Profesiones', [
      'Dentista', 'Mago', 'Guardia de tráfico', 'Cocinero', 'Peluquero', 'Bombero', 'Fotógrafo', 'Azafata', 'Director de orquesta', 'Repartidor',
      'Entrenador personal', 'Pintor', 'Conductor de autobús', 'Jardinero', 'Médico', 'Profesora', 'Presentador de telediario', 'Portero de discoteca', 'Boxeador', 'DJ',
      'Adivina', 'Piloto', 'Pescador', 'Veterinaria', 'Astronauta', 'Detective', 'Payaso', 'Agricultor', 'Carpintero', 'Mecánico',
      'Camarero', 'Guía turístico', 'Animadora', 'Modelo', 'Cantante', 'Torero', 'Socorrista', 'Novia',
    ]],
    ['sports', 'Deportes', [
      'Natación', 'Tiro con arco', 'Boxeo', 'Salto de altura', 'Ping-pong', 'Bádminton', 'Baloncesto', 'Fútbol', 'Bolos', 'Golf',
      'Remo', 'Esquí', 'Surf', 'Patinaje sobre hielo', 'Halterofilia', 'Saltos de trampolín', 'Esgrima', 'Saltar a la comba', 'Ciclismo', 'Yoga',
      'Escalada', 'Béisbol', 'Tenis', 'Voleibol', 'Sumo', 'Salto de longitud', 'Salto con pértiga', 'Lanzamiento de peso', 'Jabalina', 'Equitación',
      'Kárate', 'Gimnasia', 'Patinaje artístico', 'Buceo con tubo', 'Monopatín', 'Hula hoop', 'Tira y afloja', 'Pádel',
    ]],
    ['daily', 'Vida diaria', [
      'Lavarse los dientes', 'Metro abarrotado', 'Ponerse un chubasquero', 'Hacerse un selfie', 'Estornudar', 'Atarse los cordones', 'Secarse el pelo', 'Fregar los platos', 'Jugar a la consola', 'Tender la ropa',
      'Bajar la basura', 'Correr detrás del autobús', 'Mascarilla facial', 'Las rebajas', 'Quedarse dormido en el sofá', 'Subirse a la báscula', 'Abrir un bote', 'Cortarse las uñas', 'Buscar las llaves', 'Planchar',
      'Abrir el paraguas', 'Matar un mosquito', 'Rascarse la espalda', 'Mirarse al espejo', 'Fregar el suelo', 'Maquillarse', 'Afeitarse', 'Hacer la cama', 'Regar las plantas', 'Pasear al perro',
      'Bostezar', 'Estirarse', 'Mirar el móvil', 'Aparcar en línea', 'Escribir en el teclado', 'Ponerse las lentillas',
    ]],
    ['food', 'Comida', [
      'Comer espaguetis', 'Pelar un plátano', 'Beber bubble tea', 'Comer sandía', 'Hacer una barbacoa', 'Comer un helado', 'Abrir un bogavante', 'Morder una guindilla', 'Hacer una pizza', 'Tostar nubes',
      'Comer una mazorca', 'Soplar las velas', 'Tomar sopa muy caliente', 'Comer churros', 'Dar la vuelta a la tortilla', 'Freír un huevo', 'Pelar una naranja', 'Comer un bocadillo enorme', 'Sorber fideos', 'Comer palomitas',
      'Cortar cebolla', 'Abrir un refresco', 'Comer sushi con palillos', 'Pizza con queso que se estira', 'Morder un limón', 'Tomar un café', 'Comer tarta', 'Mascar chicle', 'Comer un perrito caliente', 'Chupar una piruleta',
      'Comer paella', 'Comer las uvas de Nochevieja', 'Agitar un batido', 'Cortar jamón',
    ]],
    ['vehicles', 'Transportes', [
      'Ir en moto', 'Conducir un coche', 'Ir en avión', 'Ir en tren', 'Ir en bici', 'Remar en kayak', 'Pilotar un barco', 'Subir en ascensor', 'Montaña rusa', 'Montar a caballo',
      'Tanque', 'Globo aerostático', 'Helicóptero', 'Monociclo', 'Teleférico', 'Conducir una excavadora', 'Patinete', 'Empujar un carrito de bebé', 'Camión de bomberos', 'Tiovivo',
      'Submarino', 'Escalera mecánica', 'Parar un taxi', 'Conducir un camión', 'Montar en camello', 'Despegue de un cohete', 'Empujar el carro de la compra', 'Ambulancia', 'Ir en trineo', 'Tractor',
    ]],
    ['objects', 'Objetos', [
      'Paraguas', 'Secador de pelo', 'Aspiradora', 'Cepillo de dientes', 'Linterna', 'Prismáticos', 'Tijeras', 'Grapadora', 'Despertador', 'Palo selfie',
      'Ventilador', 'Microondas', 'Lavadora', 'Espejo', 'Peine', 'Almohada', 'Fregona', 'Escoba', 'Matamoscas', 'Mechero',
      'Cámara de fotos', 'Auriculares', 'Micrófono', 'Teclado', 'Mando a distancia', 'Casco', 'Maleta', 'Hamaca', 'Yoyó', 'Cometa',
      'Tirachinas', 'Caña de pescar', 'Arco y flechas', 'Bastón', 'Paracaídas', 'Vela', 'Campana', 'Abanico',
    ]],
    ['scenes', 'Situaciones graciosas', [
      'Resbalar con una piel de plátano', 'Que te pique un mosquito', 'Comer algo muy picante', 'Alguien se tira un pedo en el ascensor', 'Tirar la bebida', 'Una piedrecita en el zapato', 'Que te caiga un rayo', 'Resbalar en el hielo', 'No encontrar el baño', 'Quedarse dormido',
      'Que te persiga un perro', 'Cremallera rota', 'Se te cae el móvil al váter', 'Quemarse la lengua con la sopa', 'Pillarse la mano con la puerta', 'Chocar con una farola', 'Hipo que no se quita', 'Se te duerme la pierna', 'Ducha sin agua caliente', 'Pelo revuelto por el viento',
      'Tu jefe te pilla vagueando', 'Ver una peli de miedo', 'Ganar la lotería', 'Copiar en un examen', 'Primera cita', 'Perderse', 'Llevar la camiseta del revés', 'Atrapar a un ladrón', 'Que te cague un pájaro', 'Primera fila en un concierto',
    ]],
    ['idioms', 'Expresiones', [
      'Romper el hielo', 'Tomar el pelo', 'Estar en las nubes', 'Ponerse las pilas', 'Meter la pata', 'Costar un ojo de la cara', 'Llover a cántaros', 'Estar como una cabra', 'Dormir como un tronco', 'Echar una mano',
      'Ser pan comido', 'Hablar por los codos', 'Tirar la toalla', 'Estar hecho polvo', 'Matar dos pájaros de un tiro', 'Buscar una aguja en un pajar', 'Tener mala leche', 'Estar como pez en el agua', 'Quedarse de piedra', 'Dar en el clavo',
      'Ir al grano', 'Hacer la pelota', 'Estar entre la espada y la pared', 'Tener la cabeza en otra parte', 'Morderse la lengua', 'Írsele a alguien la olla', 'Ponerse rojo como un tomate', 'Andarse por las ramas', 'Hacerse el sueco', 'Tener mucha cara',
    ]],
  ],

  leaveTitle: '¿Volver al principio?',
  leaveDesc: 'El juego empieza de nuevo.',
  leaveConfirm: 'Volver al principio',
  leaveCancel: 'Seguir jugando',

  rulesTitle: 'Cómo se juega a mímica',
  rulesIntro: 'Por turnos, alguien representa sin hablar la palabra que sale en el móvil. Los demás adivinan, quien acierta se lleva un punto y gana quien tenga más.',
  rulesFacts: [
    ['Personas', 'De 2 a 30'],
    ['Duración', 'Según las palabras: 6 personas con 1 palabra cada una, unos 10 minutos'],
    ['Material', 'El móvil de quien dirige'],
  ],
  rulesHowHeading: 'Cómo funciona',
  rulesHowSteps: [
    'Poned cuántos jugáis y cuántas palabras por persona, y elegid las categorías (animales, profesiones, deportes, vida diaria, comida, transportes, objetos, situaciones graciosas, expresiones; las que queráis).',
    'Sentaos en círculo. La primera persona coge el móvil y saca una palabra sin enseñarla.',
    'Pulsa «¡A representar!» y represéntala: sin hablar, sin ruidos, sin vocalizar y sin señalar cosas de la sala.',
    'Los demás dicen respuestas hasta que alguien la adivina; el primero se lleva un punto y quien representa pulsa «¡Adivinada!». ¿Una palabra imposible? Se puede pasar antes de empezar.',
    'Una vez empezada, la palabra queda tapada y solo se ve cuántas letras tiene: vuelve atrás para verla. Si nadie la saca, da una pista: «Decir la categoría» o «Destapar una letra», y enseña el móvil. Cuando se acaban las palabras, gana quien tenga más puntos.',
  ],
  rulesLeadHeading: 'Consejos para quien dirige',
  rulesLeadSay: '¡Vamos a jugar a mímica! Por turnos, representamos la palabra del móvil sin hablar y sin hacer ruido. Los demás adivinan, y el primero que acierta se lleva un punto, así que apuntad. Se puede pasar una palabra imposible y dar una pista si nadie la saca. ¡Gana quien tenga más puntos!',
  rulesLeadSteps: [
    'Para la primera ronda, solo «Animales» y «Vida diaria»; cuando estéis calentitos, añadid «Expresiones» y «Situaciones graciosas».',
    'Quien representa decide quién ha acertado primero; si dos lo dicen a la vez, puntúan los dos.',
    'El móvil no lleva la cuenta: contad vosotros. ¿Queréis prenda? Quien tenga menos saca una «Carta de acción» en las «Ayudas para noches de juegos».',
  ],
  rulesBack: '← Volver al juego',
};
