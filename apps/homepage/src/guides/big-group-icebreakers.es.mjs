// «Rompehielos para grupos grandes (30+)» – español. Nombres de juegos como en las páginas de juegos en español. Estructura: src/guides.mjs.
export default {
  min: 6,
  title: 'Rompehielos para grupos grandes de 30 o más',
  desc: '¿Mucha gente y difícil de dirigir? Estos 6 funcionan con 30–50 personas: todos con el móvil a la vez, todos en movimiento o en equipos en un momento.',
  h1: 'Juegos rompehielos para grupos grandes (30+): 6 en los que juega toda la sala a la vez',
  seoTitle: '6 juegos rompehielos para grupos grandes de 30 o más | Woohop',
  seoDesc: 'Rompehielos para grupos grandes de 30 a 50 personas: Juego de timbre, Happy Bingo, Esto o aquello, Luz roja, luz verde: versión acción, Mímica en cadena y Dibujos en cadena, con consejos para dirigir a mucha gente.',
  lead: [
    'Cuando el grupo pasa de 30, muchos rompehielos dejan de funcionar: ir por turnos lleva diez minutos o más y las últimas filas acaban mirando el móvil. Un grupo grande necesita que **todo el mundo tenga algo que hacer a la vez**, no que todos esperen mirando a una sola persona.',
    'Los seis juegos de esta lista aguantan bien con 30–50 personas, en tres estilos: los que cada uno juega en su propio móvil, los que mueven a toda la sala sin móviles y los que reparten al grupo en equipos que compiten a la vez. Todos son gratis y funcionan en el navegador: para unirse basta con escanear un código QR, sin descargar ninguna app.',
  ],
  blocks: [
    { h2: 'De un vistazo: número de personas y qué necesitas' },
    {
      table: {
        head: ['Juego', 'Jugadores', 'Duración', 'Necesitas'],
        rows: [
          ['buzzer', '2–50', 'unos 1 min por pregunta', 'Un móvil cada uno, a ser posible un proyector'],
          ['bingo', '2–50', '10–20 min', 'Un móvil cada uno'],
          ['match', '5–30', 'unos 8 min', 'Un móvil cada uno'],
          ['statue', '4–50', 'Lo que queráis', 'Espacio libre + el móvil de quien dirige'],
          ['charades-relay', '3–10 por equipo', 'unos 5 min por equipo', 'Sitio para una fila'],
          ['drawing-relay', '3–10 por equipo', 'unos 3 min por palabra con 5', 'Un móvil por equipo'],
        ],
      },
    },
    { p: '¿Quieres que la gente **se conozca**? Happy Bingo o Esto o aquello. ¿Quieres primero **animar la sala**? Juego de timbre o Luz roja, luz verde: versión acción. ¿Te apetece una **competición por equipos**? Cualquiera de los dos juegos en cadena. Si estáis en un aula con todos sentados, empieza por el Juego de timbre.' },

    { h2: 'Cada uno con su móvil: toda la sala juega a la vez' },
    { p: 'Estos tres son juegos de «sala»: quien dirige abre una sala, aparece un código QR en la pantalla y todos lo escanean con su móvil. Da igual que seáis 10 o 50: todos están respondiendo o buscando a la vez, nadie se queda esperando.' },
    {
      game: 'buzzer',
      need: '2–50 jugadores + quien dirige · unos 1 min por pregunta · un móvil cada uno, a ser posible con la pantalla de quien dirige proyectada',
      p: [
        'Quien dirige hace una pregunta y el móvil de cada uno se convierte en un timbre. Solo se puede pulsar cuando la pregunta se ha leído y los botones se iluminan, y el orden aparece en directo, así que se ve al momento quién fue más rápido. El más rápido responde primero; si falla, le toca al segundo.',
        'El gran miedo con un grupo grande es que «solo participe la primera fila», y con el timbre pasa lo contrario: alguien sentado al fondo del todo puede ser el primero. Las preguntas las decides tú: relacionadas con el día (historia de la empresa, contenido del curso, curiosidades de los nuevos) o simplemente divertidas.',
      ],
      tip: 'Proyecta la pantalla de quien dirige para que todos sigan la clasificación juntos. Puedes escribir las preguntas antes y enviarlas para que aparezcan en todos los móviles. Un pequeño premio o un sistema de puntos lo vuelve mucho más reñido.',
    },
    {
      game: 'bingo',
      need: '2–50 jugadores (mejor desde 8) · 10–20 min · un móvil cada uno',
      p: [
        'Cada persona recibe un cartón de bingo en el que las casillas no son números, sino tipos de personas: «Alguien que tiene mascota en casa», «Alguien que se levanta antes de las 6»… Busca a alguien que encaje, charlad un momento, y solo cuando esa persona **lo confirma en su propio móvil** puedes marcar la casilla. Con una línea completa entras en la clasificación.',
        'Es el juego para conocerse más útil con un grupo grande: cuanta más gente, más personas que encontrar, así que todos se levantan de forma natural, se mueven por la sala y hablan con gente que no conocen. Y como la otra persona tiene que confirmar, nadie puede marcar por su cuenta.',
      ],
      tip: 'Revisa las casillas antes de empezar y cambia las que no vayan a encajar con nadie, o solo con una persona. Si el grupo es grande y quiere jugar más rato, configura que la partida termine cuando lo consigan dos o tres personas.',
    },
    {
      game: 'match',
      need: '5–30 jugadores (grupos desde 6) · 8–10 preguntas, unos 8 min · un móvil cada uno',
      p: [
        'En cada pregunta eliges «de acuerdo» o «en desacuerdo» antes de que se acabe el tiempo; no hay respuestas incorrectas. Al final, las personas que piensan de forma más parecida quedan en el mismo grupo, junto con temas en común de los que hablar.',
        'Los grupos grandes a menudo tienen que dividirse, pero los grupos hechos contando «1, 2, 3» no tienen de qué hablar. Los que salen de Esto o aquello ya tienen algo en común desde el principio, así que el trabajo en grupo o la actividad que viene después funciona mucho mejor.',
      ],
      tip: 'Quédate en 8–10 preguntas; con más, la gente se cansa. Cuando acabe el tiempo de cada una, dedica unos segundos a decir quién eligió cada lado: casi siempre alguien empieza a explicarse. Con los grupos hechos, dales 5–10 minutos para hablar de los temas de la pantalla.',
    },

    { h2: 'Sin móviles, toda la sala en movimiento: ideal si hay espacio' },
    { p: 'Si el lugar es lo bastante grande –un salón de actos, un gimnasio, un césped al aire libre–, poner a todo el mundo en movimiento anima el ambiente más rápido que cualquier juego con el móvil.' },
    {
      game: 'statue',
      need: '4–50 jugadores · lo que queráis · espacio libre + el móvil de quien dirige',
      p: [
        'Luz roja, luz verde, pero antes cada uno saca una tarjeta de movimiento en el móvil de quien dirige: ir en moto, andar como un cangrejo… Con «luz verde» todos avanzan **como indica su tarjeta**; cuando quien la queda se gira con «¡luz roja!», quien siga moviéndose –o no se mueva como le toca– queda atrapado.',
        'Cincuenta personas lanzándose hacia delante a la vez ya es gracioso por sí solo. A los adultos el juego clásico a veces les da un poco de vergüenza, pero con las tarjetas de movimiento se sueltan más, porque todos parecen igual de ridículos.',
      ],
      tip: 'Con mucha gente, pasar un solo móvil para sacar las tarjetas lleva un rato, así que haced cola. Hay 28 movimientos, así que con más de 28 jugadores algunos repetirán, lo que aún lo hace más divertido. Asegúrate de que el suelo sea amplio y esté despejado. Quien la queda puede jugar con el ritmo; alargar la frase provoca las mayores carcajadas.',
    },

    { h2: 'En equipos que juegan a la vez: convertir un grupo grande en varios pequeños' },
    { p: 'Algunos juegos funcionan mejor con unas diez personas: haced equipos. Los dos juegos en cadena se juegan con 3–10 por equipo: tres equipos cubren 30 personas, y cuatro o cinco, todavía más. Además, competir por puntos une más que simplemente ir por turnos.' },
    {
      game: 'charades-relay',
      need: '3–10 por equipo, más equipos si hay más gente · unos 5 min por equipo · el móvil de quien dirige + sitio para una fila',
      p: [
        'Cada equipo se pone en fila, de espaldas. La primera persona ve la palabra, se gira y se la representa con mímica a la siguiente, y así hasta la última, que dice la respuesta. Cada uno tiene solo unos segundos antes de que suene el móvil y pase al siguiente; gana el equipo que más palabras acierte en su tiempo.',
        'El momento más divertido llega después de la respuesta: id preguntando desde el final hacia delante «¿Qué creías que era?» y todos verán dónde se torció la palabra. Los demás equipos se ríen igual mirando, así que nadie siente que está esperando.',
      ],
      tip: 'Cada equipo juega una ronda con el mismo tiempo y luego comparáis puntos. Dos equipos también pueden enfrentarse directamente: mismo número de personas una al lado de la otra, los dos primeros ven la misma palabra, los dos últimos compiten por responder antes y quien dirige lleva la cuenta.',
    },
    {
      game: 'drawing-relay',
      need: '3–10 por equipo, más equipos si hay más gente · unos 3 min por palabra con 5 personas · un móvil por equipo',
      p: [
        'Un móvil va pasando por la fila: la primera persona dibuja la palabra, la siguiente solo ve el dibujo anterior durante 5 segundos y dibuja lo que cree que era, y así hasta la última, que adivina a partir del último dibujo. Al final se ponen todos los dibujos uno al lado del otro para ver dónde se desvió.',
        'Con un grupo grande, cada equipo juega a la vez en su propio móvil y se ve qué equipo sigue acertando la misma palabra al final. Todo pasa en paralelo, nadie espera a los demás equipos y funciona con todo el mundo sentado.',
      ],
      tip: 'Al pasar el móvil, recuerda a quienes aún no les toca que miren hacia otro lado: ver los dibujos anteriores lo estropea. Después de la respuesta, repasad los dibujos uno a uno hacia atrás y pedid a cada uno que cuente qué creía que estaba dibujando.',
    },

    { h2: 'Cinco claves para dirigir a un grupo grande' },
    {
      ul: [
        '**Abre la sala y proyéctala antes de que llegue la gente**: pon el código QR del juego de sala en la pantalla grande desde la entrada, para que todos lo escaneen al sentarse y no haya esperas al empezar.',
        '**Comprueba la conexión**: todos los móviles necesitan internet. En sótanos o salones grandes con poca cobertura, comprueba que funcione el wifi del lugar y proyecta también el nombre de la red y la contraseña.',
        '**El micrófono es lo más importante**: con más de 30 personas, por muy clara que sea tu explicación, no sirve de nada si al fondo no se oye. Comprueba que la última fila te oye antes de empezar.',
        '**Haz los equipos con un juego**: cuando haga falta hacer grupos, deja que Esto o aquello los reparta automáticamente o divide por asientos; no dejes que cada uno busque su grupo, o alguien se quedará solo.',
        '**No más de tres juegos por sesión**: con un grupo grande, cada cambio significa volver a explicar y volver a escanear. Dos o tres juegos durante más rato son más fáciles de dirigir que muchos cortos. Para el orden, mira el [combo rompehielos](page:combo).',
      ],
    },

    { h2: 'Preguntas frecuentes' },
    {
      faq: [
        ['¿Y si somos más de 50?', 'Luz roja, luz verde: versión acción y los dos juegos en cadena no tienen límite: en el primero juega toda la sala junta y en los otros basta con añadir equipos. El Juego de timbre y Happy Bingo admiten hasta 50 por sala; si sois más, dividíos en dos zonas y abrid una sala en cada una.'],
        ['¿Se puede jugar sin proyector?', 'Sí. En Happy Bingo y Esto o aquello cada uno mira su propio móvil. Sin proyector, quien dirige el Juego de timbre simplemente lee la clasificación en voz alta; solo se pierde un poco del ambiente de mirar la pantalla juntos.'],
        ['¿Los participantes tienen que descargar una app?', 'No. En los juegos de sala basta con escanear un código QR con el móvil, elegir un avatar y un apodo, y listo; tampoco hace falta registrarse.'],
      ],
    },
    { p: '¿Grupo más pequeño o solo un aula pequeña? Echa un vistazo a [10 juegos rompehielos sin materiales para interiores](guide:no-props-indoor-icebreakers), o filtra por número de jugadores en [Buscar juegos](page:games).' },
  ],
};
