// „10 Eisbrecher-Spiele ohne Material für drinnen“ – Deutsch. Spielnamen, Sprüche und Beispiele wie auf den deutschen Spielregel-Seiten (Ochs am Berg, Bis 10 zählen …). Aufbau: src/guides.mjs.
export default {
  min: 7,
  title: '10 Eisbrecher-Spiele ohne Material für drinnen',
  desc: 'Für Klassenzimmer, Meetingraum und Kleingruppe – die Spielleitung öffnet nur eine Webseite auf einem Handy. Sortiert nach Platz und Gruppengröße.',
  h1: '10 Eisbrecher-Spiele ohne Material für drinnen: ein Handy reicht',
  seoTitle: '10 Eisbrecher-Spiele ohne Material für drinnen – ein Handy reicht | Woohop',
  seoDesc: 'Eisbrecher für drinnen ohne Vorbereitung: Bis 10 zählen, Fahrstuhl, Kategorien-Klatschen, Ochs am Berg – Bewegungs-Edition, Zahlenraten und mehr. Mit Gruppengröße, Dauer und Tipps fürs Anleiten.',
  lead: [
    'Spontan einen Eisbrecher leiten und nichts zur Hand? Für alle Spiele in dieser Liste **brauchst du kein Material**: keine Zettel und Stifte, keinen Ball, nichts zum Ausdrucken. Die Spielleitung öffnet eine Webseite auf dem Handy, und los geht’s – das Handy gibt den Takt vor, liefert die Aufgaben, stoppt die Zeit und hat sogar die Wahrheit-oder-Pflicht-Fragen parat. Keine App, keine Anmeldung.',
    'Die Spiele sind danach sortiert, wie viel Platz ihr habt: Spiele, bei denen alle aufstehen, Spiele im Kreis im Takt und Spiele im Sitzen, bei denen ein einziges Handy herumgeht. Such dir in der Tabelle eins aus und lies dann weiter, wie du es anleitest.',
  ],
  blocks: [
    { h2: 'Auf einen Blick: Was passt zu deiner Gruppe?' },
    {
      table: {
        head: ['Spiel', 'Personen', 'Eine Runde', 'Platz'],
        rows: [
          ['bamboo', '4–20', '1–2 Min.', 'Platz zum Hocken und Aufstehen'],
          ['statue', '4–50', 'So lange ihr wollt', 'Etwas freie Fläche'],
          ['charades', '2–30', 'ca. 10 Min. bei 6 Personen', 'Etwas Platz vorne'],
          ['stairs', '4–30', 'So lange ihr wollt', 'Im Kreis'],
          ['orchard', '4–30', 'So lange ihr wollt', 'Im Kreis'],
          ['bomb', '4–15', 'ca. 10 Min. für 3–5 Runden', 'Im Sitzen, Handy reihum'],
          ['password', '3–20', '2–5 Min.', 'Im Sitzen, Handy reihum'],
          ['cup', '2–12', '2–5 Min.', 'Im Sitzen, Handy reihum'],
          ['seconds', '2–20', 'ca. 3 Min.', 'Im Sitzen, Handy reihum'],
          ['reverse', '2–20', 'Eine Aufgabe pro Person', 'Im Sitzen, Handy reihum'],
        ],
      },
    },
    { p: 'Viele Leute (30+) und keine Lust auf Kleingruppen? Dann Ochs am Berg – Bewegungs-Edition. Nur zu zweit oder zu dritt? Randvoll, Sekunden-Challenge oder Rückwärts-Challenge. Wenn sich alle zum ersten Mal sehen und noch etwas steif sind, fang mit den Spielen im Sitzen an und hol alle erst hoch, wenn die Stimmung locker ist.' },

    { h2: 'Aufstehen und bewegen: nach dem Essen oder nach langem Sitzen' },
    { p: 'Mitten im Meeting, in der zweiten Stunde, nach dem Mittagessen, wenn alle müde werden – diese drei bringen den ganzen Raum auf die Beine und zum Lachen. Danach setzen sich alle wieder hin und sind bereit für den nächsten Programmpunkt.' },
    {
      game: 'bamboo',
      need: '4–20 Personen · 1–2 Min. pro Runde · Handy der Spielleitung',
      p: [
        'Alle hocken sich hin wie kleine Bambussprossen und sprechen gemeinsam: „Bambus, Bambus, hoch hinaus!“ Dann darf jede und jeder aufstehen und die nächste Zahl rufen, angefangen bei 1. Spannend wird es, wenn **zwei gleichzeitig aufstehen**: Dann rufen beide um die Wette den Namen des anderen, und wer langsamer ist, hockt sich wieder hin. Wer am Ende noch hockt, verliert.',
        'Es gibt keine Reihenfolge, also überlegen alle ständig, ob jetzt gerade ein sicherer Moment ist – und irgendwer lacht immer. Das Handy verteilt an alle einen lustigen Namen (oder ihr nehmt eure echten). Bei einem Zusammenstoß einen Fantasienamen zu rufen ist viel lustiger als „Lena!“, und nebenbei merken sich alle die Namen.',
      ],
      tip: 'Wenn alle Namen gezogen sind, halte das Handy hoch, damit alle die Liste sehen. Wer schneller war, entscheidet die Gruppe; du rufst nur „Zusammenstoß!“.',
    },
    {
      game: 'statue',
      need: '4–50 Personen · so lange ihr wollt · etwas freie Fläche + Handy der Spielleitung',
      p: [
        'Es ist Ochs am Berg, aber vorher zieht jede und jeder auf dem Handy eine Bewegungskarte: Motorrad fahren, Krabbengang … Während der Ochs zur Wand „Ochs am Berg, eins, zwei, drei!“ ruft, bewegen sich alle **so, wie es auf ihrer Karte steht**, nach vorne. Wer sich beim Umdrehen noch bewegt oder nicht wie auf der Karte geht, ist erwischt.',
        'Von allen Spielen in dieser Liste kommt dieses am besten mit vielen Leuten klar – auch mit 50. Erwachsenen ist das Original manchmal etwas peinlich, aber mit den Bewegungskarten trauen sich alle mehr, weil alle gleich albern aussehen.',
      ],
      tip: 'Sorg für genug freie Fläche ohne Stolperfallen. Der Ochs darf mit dem Tempo spielen – ein langgezogenes „Ochs am Berg, eins … zwei … DREI!“ sorgt für die meisten Lacher. Zum Schluss sucht sich, wer den Ochs zuletzt abgeklatscht hat, eine Bewegung für den Ochs aus, und alle machen ein Serienfoto.',
    },
    {
      game: 'charades',
      need: '2–30 Personen · ca. 10 Min. bei 6 Personen mit je 1 Begriff · Handy der Spielleitung',
      p: [
        'Reihum geht jemand nach vorne und stellt den Begriff vom Handy pantomimisch dar: nicht reden, keine Geräusche, keine Lippenbewegungen. Alle anderen raten, und wer zuerst richtig liegt, bekommt einen Punkt.',
        'Das Lästigste an Pantomime ist meist, dass sich die Spielleitung Begriffe ausdenken muss. Hier sind sie schon fertig – in Kategorien wie Tiere, Berufe, Essen oder Redewendungen. Was sich nicht darstellen lässt, kann man vor dem Start überspringen, und wenn alle festhängen, gibt es Tipps.',
      ],
      tip: 'Für die erste Runde nur „Tiere“ und „Alltag“ wählen; „Redewendungen“ und „lustige Situationen“ kommen dazu, wenn alle warm sind. Bei einer großen Gruppe teilt ihr euch in zwei Teams und spielt stattdessen [Pantomime-Stille-Post](game:charades-relay).',
    },

    { h2: 'Im Kreis, im Takt: kein Herumlaufen, aber volle Konzentration' },
    { p: 'Beide sind Klassiker aus Gruppenstunde und Ferienlager, bei denen früher die Spielleitung den Takt klatschen musste. Jetzt gibt das Handy den Takt vor und kann ihn nach und nach beschleunigen – du kannst dich ganz darauf konzentrieren, wer sich verhaspelt. Stellt euch im Kreis auf oder setzt euch auf Stühle im Kreis.' },
    {
      game: 'stairs',
      need: '4–30 Personen · so lange ihr wollt · Handy der Spielleitung',
      p: [
        'Zählt im Kreis durch: Etage 1, Etage 2, Etage 3 … Im Vierertakt des Handys ruft Etage 1 „Eins, hoch, auf, vier!“, und Etage 4 muss in den nächsten vier Schlägen antworten: „Vier, runter, auf, zwei!“ Falsche Richtung (Etage 4 kann nicht „runter auf fünf“), eine Etage, die es nicht gibt, den Einsatz verpasst oder ungefragt reingerufen – das alles ist ein Fehler, und wer patzt, geht auf Etage 1.',
        'Die Regeln sind in einer Minute erklärt, aber je schneller es wird, desto mehr verhaspeln sich alle. Und weil die Person, die patzt, den Platz wechselt, verschieben sich ständig alle Etagen – jede und jeder muss sich immer wieder merken, auf welcher Etage man gerade ist.',
      ],
      tip: 'Fang langsam an und werde schneller, sobald alle den Dreh raushaben (das Handy kann auch von selbst schneller werden). Du rufst nur „Fehler!“ und schickst die Person auf Etage 1.',
    },
    {
      game: 'orchard',
      need: '4–30 Personen · so lange ihr wollt · Handy der Spielleitung',
      p: [
        'Alle rufen im Takt „Eins, zwei, drei!“, und die Spielleitung nennt ein Thema – zum Beispiel „Frühstück“. Dann gibt das Handy klatsch, klatsch, sag vor: Bei den ersten zwei Schlägen klatschen alle, beim dritten nennt die Person, die dran ist, etwas Passendes – „klatsch, klatsch, Brötchen“, „klatsch, klatsch, Müsli“ … Nichts doppelt, nichts am Thema vorbei, und wer zu lange hängt, ist auch raus.',
        'Das Thema kann das Handy auslosen, oder du wählst eins, das zum Anlass passt – „Orte in der Schule“ bei den Kennenlerntagen, „Dinge im Büro“ beim Teamevent –, dann leitet das Spiel direkt zum Thema des Tages über.',
      ],
      tip: 'Wie lange zu lange ist, entscheidest du: am Anfang großzügig, dann immer strenger. Wer verliert, fängt mit einem neuen Thema an.',
    },

    { h2: 'Im Sitzen, ein Handy geht reihum: ideal, wenn sich alle noch nicht kennen' },
    { p: 'Bei allen fünf geht ein einziges Handy durch die Gruppe, und wer dran ist, macht nur eine kleine Sache. Niemand muss nach vorne oder sich vorstellen, also fühlen sich auch Schüchterne nicht unter Druck. Klappt im Klassenzimmer, im Meetingraum oder am Restauranttisch.' },
    {
      game: 'bomb',
      need: '4–15 Personen · ca. 10 Min. für 3–5 Runden · ein Handy',
      p: [
        'Auf dem Handy erscheint eine Aufgabe; wer es hält, erledigt sie sofort und gibt das Handy weiter. Ihr könnt Fragen wählen (zum Beispiel „Was isst du am häufigsten zum Frühstück?“) oder Aktionen. Wann die Bombe hochgeht, weiß niemand – wer das Handy dann hält, verliert.',
        'Super als erstes Spiel: Die Fragen sind so leicht, dass ein Satz reicht, und während alle nervös das Handy weiterreichen, erfahren sie ganz nebenbei ein bisschen übereinander.',
      ],
      tip: 'Bei vielen neuen Gesichtern zuerst nur Fragen, Aktionen kommen dazu, wenn sich alle etwas kennen. Hängt jemand fest, ruf „Weiter!“ und halte das Tempo. Die Zündzeit wählst du nach Gruppengröße – der Bildschirm schlägt eine vor.',
    },
    {
      game: 'password',
      need: '3–20 Personen · 2–5 Min. pro Runde · ein Handy',
      p: [
        'Das Handy denkt sich heimlich eine Zahl aus (etwa 1–100), und alle raten reihum. Zu hoch oder zu niedrig, und der Bereich schrumpft: Wer 40 tippt und „höher“ hört, macht den Bereich zu 41–100. Der Bereich wird immer enger, es gibt immer weniger Ausweichmöglichkeiten, und **wer die geheime Zahl trifft, explodiert**.',
        'Früher musste sich jemand die Zahl merken; jetzt macht das das Handy, und die Spielleitung kann mitspielen. Erklären muss man fast nichts – ideal, wenn Großeltern und Kinder zusammen spielen.',
      ],
      tip: 'Lies nach jedem Tipp den neuen Bereich laut vor („41 bis 100!“), dann steigt die Spannung schnell. Gib allen nur fünf Sekunden Bedenkzeit, das macht das Spiel flotter. Bei großen Gruppen 1–1000 wählen.',
    },
    {
      game: 'cup',
      need: '2–12 Personen · 2–5 Min. pro Glas · ein Handy',
      p: [
        'Reihum gießt ihr Wasser ins selbe Glas: einmal tippen, und das Wasser läuft, nochmal tippen, und es stoppt. Gieß so viel, wie du dich traust, dann geht das Handy weiter. Wenn das Wasser am Rand ankommt, hält die Oberflächenspannung es als kleine Kuppe – sieht aus, als würde es gleich überlaufen, tut es aber noch nicht. Wer es überlaufen lässt, verliert.',
        'Jede Runde lost eines von acht Gefäßen aus, und ein Weinglas füllt sich ganz anders als eine Flasche mit engem Hals – deshalb wird es nicht langweilig. Besonders praktisch für kleine Gruppen, schon zu zweit spielbar.',
      ],
      tip: 'Wähl vor dem Start die Glasgröße nach Gruppengröße (klein für 2–5, mittel für 6–9, groß für 10–12). Lass den Ton an: Am Klang des Wassers hörst du, wie voll es schon ist.',
    },
    {
      game: 'seconds',
      need: '2–20 Personen · ca. 3 Min. pro Runde · ein Handy reihum',
      p: [
        'Das Handy gibt eine Zielzeit vor, zum Beispiel 7,35 Sekunden. Wer dran ist, tippt zum Starten, zählt im Kopf und tippt nochmal, wenn es so weit sein müsste. Die Zahlen sind nur in den ersten Sekunden zu sehen, danach zählt nur das Gefühl. Die drei Genauesten stehen auf dem Podest.',
        'Jede Person tippt nur zweimal und muss nichts sagen – das ist das Spiel mit der niedrigsten Hürde in dieser Liste. Während jemand zählt, wird es von selbst still im Raum, alle schauen gebannt hin, und der Jubel bei „nur 0,02 daneben!“ hebt sofort die Stimmung.',
      ],
      tip: 'Schwerer wird es, wenn die Zahlen nur eine Sekunde sichtbar sind; mit Kindern lasst sie drei Sekunden stehen. Ihr könnt vorher auch tippen, wer am genauesten sein wird.',
    },
    {
      game: 'reverse',
      need: '2–20 Personen · eine Aufgabe pro Person · ein Handy',
      p: [
        'Jemand nimmt einen Satz auf, und das Handy spielt ihn rückwärts ab – klingt wie eine Alien-Sprache. Die nächste Person spricht dieses Kauderwelsch nach, nimmt es auf und dreht es wieder um, und alle raten, was ursprünglich gesagt wurde.',
        'Der Spaß liegt im Nachmachen: Je ernsthafter du die seltsamen Laute nachahmst, desto lustiger klingt es, wenn es wieder umgedreht wird. Keine Idee? Das Handy hat Aufgaben zum Ziehen – einen Satz mit einem Wort bilden oder ein Lied summen.',
      ],
      tip: 'Die erste Aufgabe stellst du selbst; einmal vorgemacht, und alle haben es verstanden. Halte die Sätze kurz – 3–5 Sekunden sind ideal. Längeres wird rückwärts so schwer, dass niemand es errät.',
    },

    { h2: 'Vier Dinge, an die du vorher denken solltest' },
    {
      ul: [
        '**Lauter stellen**: Bei Fahrstuhl und Kategorien-Klatschen müssen alle den Takt hören. Bei größeren Gruppen das Handy an einen kleinen Lautsprecher anschließen oder ein Mikrofon daneben halten.',
        '**Erst vormachen, dann erklären**: Die Regeln dreimal zu erklären bringt weniger, als einmal selbst zu spielen. Auf der Spielregel-Seite jedes Spiels steht ein kurzer Text zum Vorlesen.',
        '**Strafen locker halten**: Wer verliert, braucht überhaupt keine Strafe. Wenn ihr eine wollt, gibt es bei den meisten Spielen den Wahrheit-oder-Pflicht-Automaten, du musst dir also nichts ausdenken.',
        '**Vom Sitzen zum Stehen**: Wenn ihr zwei oder drei Spiele spielt, beginnt mit einem Spiel im Sitzen, dann ein Takt-Spiel, und zum Schluss eins, bei dem sich alle bewegen. Für eine fertige Reihenfolge probier die [Eisbrecher-Kombi](page:combo): Zeit wählen, und sie stellt ein Aufwärm- und ein Kennenlern-Spiel zusammen – samt allem, was du sagen kannst.',
      ],
    },

    { h2: 'Häufige Fragen' },
    {
      faq: [
        ['Brauche ich wirklich gar kein Material?', 'Wirklich. Für alle zehn Spiele reicht das Handy der Spielleitung (läuft im Browser – keine App, keine Anmeldung). Für Ochs am Berg – Bewegungs-Edition braucht ihr zusätzlich etwas freie Fläche. Wer Randvoll in echt spielen möchte, kann ein durchsichtiges Glas und einen Krug Wasser dazunehmen, aber die Handy-Version reicht völlig.'],
        ['Was mache ich mit mehr als 30 Leuten?', 'Ochs am Berg – Bewegungs-Edition klappt mit 50 Leuten gleichzeitig. Bei Fahrstuhl und Kategorien-Klatschen dauert es in einem riesigen Kreis ewig, bis man dran ist – teilt euch in zwei oder drei Kreise mit je einem Handy.'],
        ['Ist das für Erwachsene nicht zu kindisch?', 'Gerade bei Bis 10 zählen und Fahrstuhl werden Erwachsene oft überraschend ehrgeizig, weil man sich umso leichter vertut, je schneller es geht. Für Firmenveranstaltungen oder förmlichere Anlässe startest du sicherer mit Zeitbombe (nur Fragen), Sekunden-Challenge oder Zahlenraten.'],
      ],
    },
    { p: 'Lust auf mehr? Unter [Spiele finden](page:games) kannst du nach Gruppengröße, Dauer und Handy-Bedarf filtern. Alle Spiele sind kostenlos.' },
  ],
};
