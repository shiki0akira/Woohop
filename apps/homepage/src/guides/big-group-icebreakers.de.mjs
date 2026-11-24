// „Eisbrecher für große Gruppen (30+)“ – Deutsch. Spielnamen wie auf den deutschen Spielseiten. Aufbau: src/guides.mjs.
export default {
  min: 6,
  title: 'Eisbrecher für große Gruppen ab 30 Personen',
  desc: 'Viele Leute, schwer anzuleiten? Diese 6 klappen mit 30–50 Personen: alle gleichzeitig am Handy, alle in Bewegung oder blitzschnell in Teams.',
  h1: 'Eisbrecher-Spiele für große Gruppen ab 30: 6, bei denen alle gleichzeitig mitspielen',
  seoTitle: '6 Eisbrecher-Spiele für große Gruppen ab 30 Personen | Woohop',
  seoDesc: 'Eisbrecher für große Gruppen mit 30–50 Personen: Buzzer-Spiel, Happy Bingo, Dies oder das, Ochs am Berg – Bewegungs-Edition, Pantomime-Stille-Post und Bilder-Stille-Post – mit Tipps fürs Anleiten.',
  lead: [
    'Ab 30 Leuten funktionieren viele Eisbrecher nicht mehr: Reihum dauert eine Runde zehn Minuten und länger, und die hinteren Reihen schauen nur noch aufs Handy. Eine große Gruppe braucht etwas, bei dem **alle gleichzeitig beschäftigt sind** – nicht alle warten, während eine Person etwas vorführt.',
    'Die sechs Spiele hier halten alle 30–50 Personen aus, in drei Varianten: Spiele, bei denen alle am eigenen Handy mitmachen, Spiele ohne Handy, bei denen sich der ganze Raum bewegt, und Spiele, bei denen ihr euch in Teams aufteilt, die gleichzeitig gegeneinander antreten. Alles kostenlos im Browser – zum Mitmachen einen QR-Code scannen, keine App nötig.',
  ],
  blocks: [
    { h2: 'Auf einen Blick: Gruppengröße und was du brauchst' },
    {
      table: {
        head: ['Spiel', 'Personen', 'Dauer', 'Du brauchst'],
        rows: [
          ['buzzer', '2–50', 'ca. 1 Min. pro Frage', 'Ein Handy pro Person, am besten einen Beamer'],
          ['bingo', '2–50', '10–20 Min.', 'Ein Handy pro Person'],
          ['match', '5–30', 'ca. 8 Min.', 'Ein Handy pro Person'],
          ['statue', '4–50', 'So lange ihr wollt', 'Freie Fläche + Handy der Spielleitung'],
          ['charades-relay', '3–10 pro Team', 'ca. 5 Min. pro Team', 'Platz für eine Reihe'],
          ['drawing-relay', '3–10 pro Team', 'ca. 3 Min. pro Begriff bei 5', 'Ein Handy pro Team'],
        ],
      },
    },
    { p: 'Sollen sich alle **kennenlernen**? Dann Happy Bingo oder Dies oder das. Soll erst mal **Stimmung** aufkommen? Buzzer-Spiel oder Ochs am Berg – Bewegungs-Edition. Lust auf einen **Teamwettkampf**? Eine der beiden Stille-Post-Varianten. Sitzen alle im Klassenzimmer, fang mit dem Buzzer-Spiel an.' },

    { h2: 'Jede und jeder am eigenen Handy: der ganze Raum spielt gleichzeitig' },
    { p: 'Diese drei sind „Raum“-Spiele: Die Spielleitung öffnet einen Raum, auf dem Bildschirm erscheint ein QR-Code, und alle scannen ihn mit dem eigenen Handy. Ob 10 oder 50 Leute – alle antworten oder suchen gleichzeitig, niemand steht herum und wartet.' },
    {
      game: 'buzzer',
      need: '2–50 Personen + Spielleitung · ca. 1 Min. pro Frage · ein Handy pro Person, Bildschirm der Spielleitung am besten per Beamer',
      p: [
        'Die Spielleitung stellt eine Frage, und das Handy aller wird zum Buzzer. Gedrückt werden darf erst, wenn die Frage vorgelesen ist und die Buttons aufleuchten; die Reihenfolge erscheint live, also sieht man sofort, wer am schnellsten war. Die oder der Schnellste antwortet zuerst, bei falscher Antwort ist Platz zwei dran.',
        'Die große Sorge bei vielen Leuten ist „nur die erste Reihe macht mit“ – beim Buzzer ist es umgekehrt, denn auch ganz hinten kann man Erste oder Erster sein. Die Fragen bestimmst du selbst: passend zum Tag (Firmengeschichte, Kursinhalte, Fun Facts über die Neuen) oder einfach lustig.',
      ],
      tip: 'Wirf den Bildschirm der Spielleitung per Beamer an die Wand, dann schauen alle gemeinsam auf die Rangliste. Fragen kannst du vorher eintippen und abschicken, dann stehen sie auf allen Handys. Ein kleiner Preis oder eine Punkteregel macht es deutlich spannender.',
    },
    {
      game: 'bingo',
      need: '2–50 Personen (am besten ab 8) · 10–20 Min. · ein Handy pro Person',
      p: [
        'Alle bekommen eine Bingokarte, auf der statt Zahlen Arten von Menschen stehen: „Jemand, der ein Haustier hat“, „Jemand, der vor 6 Uhr aufsteht“ … Such jemanden, der passt, quatscht kurz, und erst wenn die Person **auf ihrem eigenen Handy bestätigt**, darfst du das Feld abhaken. Eine volle Reihe bringt dich auf die Rangliste.',
        'Das ist das nützlichste Kennenlernspiel für große Gruppen: Je mehr Leute, desto mehr gibt es zu finden, also stehen alle wie von selbst auf, laufen herum und sprechen Leute an, die sie nicht kennen. Weil die andere Person bestätigen muss, kann niemand einfach selbst abhaken.',
      ],
      tip: 'Schau dir die Felder vorher an und tausche alle aus, auf die niemand – oder nur eine Person – passt. Wenn eine große Gruppe länger spielen will, stell ein, dass das Spiel erst endet, wenn zwei oder drei Personen fertig sind.',
    },
    {
      game: 'match',
      need: '5–30 Personen (Gruppen ab 6) · 8–10 Fragen, ca. 8 Min. · ein Handy pro Person',
      p: [
        'Bei jeder Frage wählst du innerhalb der Zeit „Zustimmen“ oder „Nicht zustimmen“ – es gibt kein Richtig oder Falsch. Am Ende kommen die Leute, die am ähnlichsten denken, in eine Gruppe, dazu gibt es gemeinsame Gesprächsthemen.',
        'Große Gruppen müssen oft aufgeteilt werden, aber Gruppen aus dem Durchzählen „1, 2, 3“ haben sich nichts zu sagen. Gruppen aus Dies oder das haben von Anfang an etwas gemeinsam, deshalb läuft die anschließende Gruppenarbeit viel runder.',
      ],
      tip: 'Bleib bei 8–10 Fragen, sonst werden alle müde. Wenn die Zeit für eine Frage um ist, lies kurz vor, wer auf welcher Seite steht – meistens fängt dann jemand an, sich zu erklären. Sind die Gruppen fertig, gib ihnen 5–10 Minuten, um über die Themen auf dem Bildschirm zu reden.',
    },

    { h2: 'Ohne Handy, der ganze Raum in Bewegung: ideal, wenn ihr Platz habt' },
    { p: 'Wenn der Raum groß genug ist – Aula, Turnhalle, Wiese draußen –, wärmt nichts so schnell auf, wie alle zusammen in Bewegung zu bringen.' },
    {
      game: 'statue',
      need: '4–50 Personen · so lange ihr wollt · freie Fläche + Handy der Spielleitung',
      p: [
        'Ochs am Berg, aber vorher zieht jede und jeder auf dem Handy der Spielleitung eine Bewegungskarte: Motorrad fahren, Krabbengang … Während der Ochs „Ochs am Berg, eins, zwei, drei!“ ruft, bewegen sich alle **so, wie es auf ihrer Karte steht**, nach vorne. Wer sich beim Umdrehen noch bewegt oder nicht wie auf der Karte geht, ist erwischt.',
        '50 Leute, die gleichzeitig nach vorne stürmen – das allein ist schon lustig. Erwachsenen ist das Original manchmal etwas peinlich, aber mit den Bewegungskarten trauen sich alle mehr, weil alle gleich albern aussehen.',
      ],
      tip: 'Bei vielen Leuten dauert es eine Weile, ein Handy zum Ziehen herumzugeben – lass alle in einer Reihe anstehen. Es gibt 28 Bewegungen; bei mehr als 28 Personen haben manche die gleiche, was es nur lustiger macht. Sorg für genug freie Fläche ohne Stolperfallen. Der Ochs darf mit dem Tempo spielen; langgezogen sorgt es für die meisten Lacher.',
    },

    { h2: 'In Teams gleichzeitig antreten: aus einer großen Gruppe werden mehrere kleine' },
    { p: 'Manche Spiele machen mit etwa 10 Leuten am meisten Spaß – dann teilt euch in Teams. Beide Stille-Post-Varianten gehen mit 3–10 pro Team: Drei Teams decken 30 Leute ab, vier oder fünf noch mehr. Um Punkte zu spielen schweißt außerdem mehr zusammen, als einfach reihum dranzukommen.' },
    {
      game: 'charades-relay',
      need: '3–10 pro Team, bei mehr Leuten mehr Teams · ca. 5 Min. pro Team · Handy der Spielleitung + Platz für eine Reihe',
      p: [
        'Jedes Team stellt sich in eine Reihe, alle mit dem Rücken nach vorne. Die erste Person sieht den Begriff, dreht sich um und stellt ihn der nächsten pantomimisch dar, und so weiter bis zur letzten Person, die die Antwort sagt. Jede Person hat nur ein paar Sekunden, dann piept das Handy und es geht weiter; das Team mit den meisten richtigen Antworten in seiner Zeit gewinnt.',
        'Der lustigste Moment kommt nach der Auflösung: Von hinten nach vorne fragt ihr „Was dachtest du, was es ist?“, und alle sehen, wo der Begriff abgedriftet ist. Die anderen Teams lachen beim Zuschauen genauso mit, also fühlt sich niemand wie in der Warteschlange.',
      ],
      tip: 'Jedes Team spielt eine Runde mit derselben Zeit, dann vergleicht ihr die Punkte. Zwei Teams können auch direkt gegeneinander antreten: gleich viele Leute nebeneinander, beide Ersten sehen denselben Begriff, die beiden Letzten raten um die Wette, und die Spielleitung zählt mit.',
    },
    {
      game: 'drawing-relay',
      need: '3–10 pro Team, bei mehr Leuten mehr Teams · ca. 3 Min. pro Begriff bei 5 Personen · ein Handy pro Team',
      p: [
        'Ein Handy geht die Reihe entlang: Die erste Person zeichnet den Begriff, die nächste sieht nur die vorige Zeichnung 5 Sekunden lang und zeichnet, was sie zu erkennen glaubt, und so weiter, bis die letzte Person anhand des letzten Bildes rät. Bei der Auflösung werden alle Zeichnungen nebeneinandergelegt, damit man sieht, wo es schiefgelaufen ist.',
        'Bei vielen Leuten spielt jedes Team gleichzeitig auf seinem eigenen Handy, und ihr schaut, welches Team denselben Begriff am Ende noch richtig hat. Alles läuft parallel, niemand wartet auf andere Teams, und es klappt auch, wenn alle sitzen.',
      ],
      tip: 'Beim Weitergeben erinnere alle, die noch nicht dran sind, wegzuschauen – wer frühere Zeichnungen sieht, verdirbt den Spaß. Geht nach der Auflösung die Bilder rückwärts durch und lass alle erzählen, was sie zu zeichnen glaubten.',
    },

    { h2: 'Fünf Punkte, wenn du eine große Gruppe anleitest' },
    {
      ul: [
        '**Raum vorher öffnen und an die Wand werfen**: Zeig den QR-Code des Raum-Spiels schon beim Reinkommen auf der Leinwand, dann scannen alle direkt nach dem Hinsetzen und zum Start muss niemand warten.',
        '**Internet prüfen**: Alle Handys brauchen Internet. In Kellern oder großen Hallen mit schlechtem Empfang vorher klären, ob das WLAN funktioniert, und Netzwerkname und Passwort gleich mit einblenden.',
        '**Das Mikrofon ist das Wichtigste**: Ab 30 Leuten bringt die klarste Regelerklärung nichts, wenn hinten keiner etwas hört. Prüf vorher, ob die letzte Reihe dich versteht.',
        '**Teams per Spiel bilden**: Wenn ihr Gruppen braucht, lass Dies oder das automatisch einteilen oder teil einfach nach Sitzplätzen auf – lass die Leute nicht selbst Gruppen suchen, sonst bleibt jemand übrig.',
        '**Höchstens drei Spiele pro Einheit**: Bei einer großen Gruppe heißt jeder Wechsel neu erklären und neu scannen. Zwei oder drei Spiele, die länger laufen, sind leichter anzuleiten als viele kurze. Eine Reihenfolge findest du bei der [Eisbrecher-Kombi](page:combo).',
      ],
    },

    { h2: 'Häufige Fragen' },
    {
      faq: [
        ['Was mache ich mit mehr als 50 Leuten?', 'Ochs am Berg – Bewegungs-Edition und beide Stille-Post-Varianten haben keine Obergrenze: Beim Ochs spielt der ganze Raum zusammen, bei Stille Post kommen einfach mehr Teams dazu. Buzzer-Spiel und Happy Bingo schaffen bis zu 50 pro Raum; bei mehr Leuten teilt ihr euch in zwei Bereiche mit je einem Raum.'],
        ['Geht es auch ohne Beamer?', 'Ja. Bei Happy Bingo und Dies oder das schaut jede und jeder aufs eigene Handy. Beim Buzzer-Spiel liest die Spielleitung ohne Beamer einfach die Rangliste vor – es fehlt nur ein bisschen das gemeinsame Hinschauen.'],
        ['Müssen die Teilnehmenden eine App herunterladen?', 'Nein. Bei Raum-Spielen scannt man mit dem Handy einen QR-Code, wählt einen Avatar und einen Spitznamen und ist dabei – auch ohne Anmeldung.'],
      ],
    },
    { p: 'Kleinere Gruppe oder nur ein kleiner Raum? Dann schau dir [10 Eisbrecher-Spiele ohne Material für drinnen](guide:no-props-indoor-icebreakers) an oder filtere unter [Spiele finden](page:games) nach Gruppengröße.' },
  ],
};
