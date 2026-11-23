// «10 rompehielos sin materiales para interiores» – español. Nombres de juegos, frases y ejemplos como en las páginas de reglas en español (Luz roja, luz verde, El ascensor…). Estructura: src/guides.mjs.
export default {
  min: 7,
  title: '10 rompehielos sin materiales para interiores',
  desc: 'Para el aula, la sala de reuniones o grupos pequeños: quien dirige solo abre una página web en un móvil. Ordenados por espacio y número de personas.',
  h1: '10 juegos rompehielos sin materiales para interiores: basta con un móvil',
  seoTitle: '10 juegos rompehielos sin materiales para interiores (con un móvil) | Woohop',
  seoDesc: 'Rompehielos para interiores sin preparar nada: Contar hasta diez, El ascensor, Categorías al ritmo, Luz roja, luz verde: versión acción, Adivina el número y más, con número de jugadores, duración y consejos para dirigir.',
  lead: [
    '¿Te piden dirigir un rompehielos sobre la marcha y no tienes nada a mano? Ninguno de los juegos de esta lista **necesita materiales**: ni papel y boli, ni pelota, nada que imprimir. Quien dirige abre una página web en el móvil y listo: el móvil marca el ritmo, reparte las consignas, lleva el tiempo y hasta propone las preguntas de verdad o reto. Sin descargar ninguna app y sin registrarse.',
    'Los juegos están agrupados según el espacio que tengáis: los que ponen a todo el mundo de pie, los que se juegan en círculo al ritmo y los que se juegan sentados pasándose un solo móvil. Elige uno en la tabla y luego sigue leyendo para ver cómo dirigirlo.',
  ],
  blocks: [
    { h2: 'De un vistazo: cuál encaja con tu grupo' },
    {
      table: {
        head: ['Juego', 'Jugadores', 'Una ronda', 'Espacio'],
        rows: [
          ['bamboo', '4–20', '1–2 min', 'Sitio para agacharse y levantarse'],
          ['statue', '4–50', 'Lo que queráis', 'Algo de espacio libre'],
          ['charades', '2–30', 'unos 10 min con 6', 'Un poco de sitio delante'],
          ['stairs', '4–30', 'Lo que queráis', 'En círculo'],
          ['orchard', '4–30', 'Lo que queráis', 'En círculo'],
          ['bomb', '4–15', 'unos 10 min para 3–5 rondas', 'Sentados, pasando el móvil'],
          ['password', '3–20', '2–5 min', 'Sentados, pasando el móvil'],
          ['cup', '2–12', '2–5 min', 'Sentados, pasando el móvil'],
          ['seconds', '2–20', 'unos 3 min', 'Sentados, pasando el móvil'],
          ['reverse', '2–20', 'Una consigna cada uno', 'Sentados, pasando el móvil'],
        ],
      },
    },
    { p: '¿Mucha gente (más de 30) y sin ganas de hacer grupos? Elige Luz roja, luz verde: versión acción. ¿Solo dos o tres? Hasta el borde, Para el cronómetro o Reto al revés. Si el grupo se conoce por primera vez y todavía hay algo de corte, empieza por los juegos sentados y pon a todos de pie cuando el ambiente se haya relajado.' },

    { h2: 'De pie y a moverse: después de comer o tras mucho rato sentados' },
    { p: 'A mitad de una reunión, en la segunda hora de clase, cuando a todos les entra el sueño después de comer: estos tres ponen a toda la sala de pie y la hacen reír. Después, todos vuelven a sentarse listos para lo que venga.' },
    {
      game: 'bamboo',
      need: '4–20 jugadores · 1–2 min por ronda · el móvil de quien dirige',
      p: [
        'Todos se agachan como brotes de bambú y dicen juntos: «Bambú, bambú, ¡arriba!». Después, cualquiera puede levantarse y decir el siguiente número, empezando por el 1. La gracia está en cuando **dos personas se levantan a la vez**: tienen que gritar el nombre de la otra lo más rápido posible, y la más lenta vuelve a agacharse. Quien quede agachado al final, pierde.',
        'No hay turnos, así que todos están pendientes de si es buen momento para levantarse, y siempre hay alguien que se ríe. El móvil le da a cada uno un nombre divertido (o usad vuestros nombres reales). Gritar un mote absurdo en un choque es mucho más gracioso que gritar «¡Lucía!», y de paso ayuda a recordar los nombres.',
      ],
      tip: 'Cuando estén todos los nombres, levanta el móvil para que todos vean la lista. Quién fue más rápido lo decide el grupo; quien dirige solo tiene que gritar «¡Choque!».',
    },
    {
      game: 'statue',
      need: '4–50 jugadores · lo que queráis · algo de espacio libre + el móvil de quien dirige',
      p: [
        'Es Luz roja, luz verde, pero antes cada uno saca una tarjeta de movimiento en el móvil: ir en moto, andar como un cangrejo… Cuando quien la queda dice «luz verde», todos avanzan **como indica su tarjeta**. Con «¡luz roja!» se gira, y quien siga moviéndose –o no se mueva como le toca– queda atrapado.',
        'Es el juego de la lista que mejor aguanta los grupos grandes: funciona con 50 personas. A los adultos el juego clásico a veces les da un poco de vergüenza, pero con las tarjetas de movimiento se sueltan más, porque todos parecen igual de ridículos.',
      ],
      tip: 'Asegúrate de que haya espacio suficiente y nada con lo que tropezar. Quien la queda puede jugar con el ritmo: un «luz verde… verde… ¡ROJA!» bien alargado provoca las mayores carcajadas. Para terminar, quien tocó por última vez a quien la queda le elige un movimiento, y todos le hacen una ráfaga de fotos.',
    },
    {
      game: 'charades',
      need: '2–30 jugadores · unos 10 min con 6 jugadores y 1 palabra cada uno · el móvil de quien dirige',
      p: [
        'Por turnos, alguien sale delante y representa con mímica la palabra del móvil: sin hablar, sin sonidos y sin vocalizar. Los demás intentan adivinarla, y quien acierta primero se lleva un punto.',
        'Lo más pesado de la mímica suele ser que quien dirige tiene que inventarse las palabras. Aquí ya vienen preparadas, en categorías como animales, profesiones, comida o expresiones; las que no se puedan representar se pueden cambiar antes de empezar, y si nadie da con ella, hay pistas.',
      ],
      tip: 'Para la primera partida, elige solo «animales» y «vida diaria»; añade «expresiones» y «situaciones graciosas» cuando todos estén sueltos. Con un grupo grande, haced dos equipos y jugad a [Mímica en cadena](game:charades-relay).',
    },

    { h2: 'En círculo y al ritmo: sin moverse del sitio, pero con la cabeza a tope' },
    { p: 'Son dos clásicos de los juegos de grupo en los que antes quien dirigía tenía que marcar el ritmo con palmas. Ahora el móvil lleva el compás y puede acelerarlo poco a poco, así que tú puedes centrarte en ver quién se equivoca. Se puede jugar de pie en círculo o sentados en sillas en corro.' },
    {
      game: 'stairs',
      need: '4–30 jugadores · lo que queráis · el móvil de quien dirige',
      p: [
        'Numeraos en el círculo: piso 1, piso 2, piso 3… Al compás de cuatro tiempos del móvil, el piso 1 dice «¡Uno, sube, al, cuatro!», y el piso 4 tiene que responder en los cuatro tiempos siguientes: «¡Cuatro, baja, al, dos!». Equivocarse de dirección (el piso 4 no puede «bajar al cinco»), llamar a un piso que no existe, perder el turno o contestar sin que te llamen cuentan como error, y quien falla pasa al piso 1.',
        'Las reglas se explican en un minuto, pero cuanto más rápido va, más se traba la lengua. Y como quien falla cambia de sitio, los pisos se mueven todo el rato: todos tienen que volver a recordar en qué piso están.',
      ],
      tip: 'Empieza despacio y acelera cuando el grupo le pille el truco (el móvil también puede acelerar solo). Quien dirige solo grita «¡Fallo!» y manda a esa persona al piso 1.',
    },
    {
      game: 'orchard',
      need: '4–30 jugadores · lo que queráis · el móvil de quien dirige',
      p: [
        'Todos dicen al ritmo «¡Un, dos, tres!» y quien dirige anuncia un tema, por ejemplo «El desayuno». Luego el móvil marca palmada, palmada, palabra: en los dos primeros tiempos todos dan palmas y en el tercero, a quien le toca dice algo que encaje con el tema: «palmada, palmada, tostada», «palmada, palmada, café»… Sin repetir, sin salirse del tema, y quedarse en blanco demasiado rato también elimina.',
        'El tema lo puede sortear el móvil o puedes elegir uno que encaje con la ocasión –«lugares del instituto» en una jornada de acogida, «cosas de la oficina» en una actividad de equipo–, y el juego lleva directamente al tema del día.',
      ],
      tip: 'Cuánto es demasiado rato lo decides tú: al principio sé generoso y luego cada vez más estricto. Cuando alguien pierde, se cambia de tema y empieza esa persona.',
    },

    { h2: 'Sentados, con un solo móvil que va pasando: ideal cuando no os conocéis' },
    { p: 'En estos cinco, un único móvil recorre el grupo y cada uno solo tiene que hacer una cosa pequeña en su turno. Nadie tiene que salir delante ni presentarse, así que ni los más tímidos se sienten presionados. Funcionan en el aula, en una sala de reuniones o en la mesa de un restaurante.' },
    {
      game: 'bomb',
      need: '4–15 jugadores · unos 10 min para 3–5 rondas · un móvil',
      p: [
        'En el móvil aparece una prueba; quien lo tiene la hace en el momento y lo pasa. Puedes elegir preguntas (por ejemplo, «¿Qué desayunas más a menudo?») o acciones. Nadie sabe cuándo explotará la bomba: quien tenga el móvil en ese momento, pierde.',
        'Es perfecto como primer juego: las preguntas son tan ligeras que basta con una frase, y mientras todos se pasan el móvil con nervios, acaban sabiendo un poco más de los demás sin darse cuenta.',
      ],
      tip: 'Si hay muchas caras nuevas, empieza solo con preguntas y añade acciones cuando la gente se conozca un poco. Si alguien se bloquea, di «¡Siguiente!» para no perder el ritmo. Elige el tiempo de la mecha según el número de jugadores: la pantalla sugiere uno.',
    },
    {
      game: 'password',
      need: '3–20 jugadores · 2–5 min por ronda · un móvil',
      p: [
        'El móvil elige un número en secreto (por ejemplo, del 1 al 100) y todos van intentando adivinarlo por turnos. Si te pasas o te quedas corto, el rango se reduce: dices 40, oyes «¡más alto!», y pasa a ser 41–100. El rango se va cerrando, cada vez hay menos escapatoria y **quien da con el número secreto, explota**.',
        'Antes alguien tenía que acordarse del número; ahora lo hace el móvil y quien dirige también puede jugar. Casi no hay nada que explicar, así que es ideal cuando juegan juntos abuelos y niños.',
      ],
      tip: 'Después de cada intento, lee en voz alta el nuevo rango («¡del 41 al 100!») y la tensión subirá rápido. Da cinco segundos a cada uno para contestar y el juego irá más ágil. Con un grupo grande, usa 1–1000.',
    },
    {
      game: 'cup',
      need: '2–12 jugadores · 2–5 min por vaso · un móvil',
      p: [
        'Por turnos, echáis agua en el mismo vaso: tocas para que caiga y vuelves a tocar para pararla. Echa tanto como te atrevas y pasa el móvil. Cuando el agua llega al borde, la tensión superficial la sostiene formando una pequeña cúpula: parece que se va a desbordar, pero todavía no. Quien la haga desbordar, pierde.',
        'En cada ronda sale al azar uno de ocho recipientes, y una copa no se llena igual que una botella de cuello estrecho, así que no cansa. Es especialmente práctico para grupos pequeños: se puede jugar desde dos personas.',
      ],
      tip: 'Antes de empezar, elige el tamaño del vaso según el grupo (pequeño para 2–5, mediano para 6–9, grande para 10–12). Deja el sonido activado: el tono del agua te avisa de si ya está casi lleno.',
    },
    {
      game: 'seconds',
      need: '2–20 jugadores · unos 3 min por ronda · un móvil que va pasando',
      p: [
        'El móvil da un tiempo objetivo, por ejemplo 7,35 segundos. En tu turno, tocas para empezar, cuentas mentalmente y vuelves a tocar cuando creas que has llegado. Los números solo se ven los primeros segundos; después, todo es intuición. Los tres que más se acerquen suben al podio.',
        'Cada uno solo toca dos veces y no tiene que decir nada: es el juego más fácil de la lista para participar. Mientras alguien cuenta, la sala se queda en silencio sola y todos miran, y el grito de «¡solo 0,02 de diferencia!» anima el ambiente al instante.',
      ],
      tip: 'Para hacerlo más difícil, deja los números visibles solo un segundo; con niños, tres. También podéis apostar antes quién será el más preciso.',
    },
    {
      game: 'reverse',
      need: '2–20 jugadores · una consigna cada uno · un móvil',
      p: [
        'Alguien graba una frase y el móvil la reproduce al revés: suena como un idioma extraterrestre. La siguiente persona imita ese galimatías, lo graba y le vuelve a dar la vuelta, y todos adivinan cuál era la frase original.',
        'La gracia está en la imitación: cuanto más en serio imitas los sonidos raros, más divertido suena al darle la vuelta. ¿Sin ideas? El móvil tiene consignas para sacar: hacer una frase con una palabra o tararear una canción.',
      ],
      tip: 'Pon tú la primera consigna: con una demostración, todos lo entienden. Que las frases sean cortas: 3–5 segundos es lo ideal. Si son más largas, al revés resultan tan difíciles que nadie las adivina.',
    },

    { h2: 'Cuatro cosas a tener en cuenta antes de empezar' },
    {
      ul: [
        '**Sube el volumen**: en El ascensor y Categorías al ritmo hay que oír el compás. Con un grupo grande, conecta el móvil a un altavoz pequeño o acerca un micrófono.',
        '**Primero juega una ronda, luego explica**: explicar las reglas tres veces funciona peor que jugar una vez tú. La página de reglas de cada juego tiene un texto corto para leer en voz alta.',
        '**Castigos suaves**: quien pierde no necesita ningún castigo. Si queréis uno, la mayoría de los juegos tienen la tragaperras de verdad o reto, así que no tienes que inventar nada.',
        '**De sentados a de pie**: si vais a jugar dos o tres, empezad con uno sentados para calentar, seguid con uno de ritmo y terminad con uno en el que haya que moverse. Para un orden ya preparado, prueba el [combo rompehielos](page:combo): eliges el tiempo y te arma un juego para entrar en calor y otro para conocerse, con lo que puedes decir en cada paso.',
      ],
    },

    { h2: 'Preguntas frecuentes' },
    {
      faq: [
        ['¿De verdad no necesito ningún material?', 'De verdad. Los diez juegos solo necesitan el móvil de quien dirige (funcionan en el navegador: sin app y sin registro). Luz roja, luz verde: versión acción necesita además algo de espacio para avanzar. Si queréis jugar a Hasta el borde de verdad, podéis añadir un vaso transparente y una jarra de agua, pero con la versión del móvil basta.'],
        ['¿Y si somos más de 30?', 'Luz roja, luz verde: versión acción funciona con 50 personas a la vez. En El ascensor y Categorías al ritmo, un círculo enorme significa esperar mucho entre turno y turno: dividíos en dos o tres círculos, con un móvil cada uno.'],
        ['¿No es demasiado infantil para adultos?', 'En Contar hasta diez y El ascensor los adultos suelen picarse más de lo que esperan, porque cuanto más rápido va, más fácil es equivocarse. Para un evento de empresa o un ambiente más formal, es más seguro empezar con Bomba de tiempo (solo preguntas), Para el cronómetro o Adivina el número.'],
      ],
    },
    { p: '¿Quieres más? En [Buscar juegos](page:games) puedes filtrar por número de jugadores, duración y si hace falta móvil. Todos los juegos son gratis.' },
  ],
};
