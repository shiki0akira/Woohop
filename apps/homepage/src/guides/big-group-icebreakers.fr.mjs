// « Brise-glace pour grands groupes (30+) » – français. Noms de jeux repris des pages de jeux françaises. Structure : src/guides.mjs.
export default {
  min: 6,
  title: 'Brise-glace pour grands groupes de 30 personnes et plus',
  desc: 'Beaucoup de monde, difficile à animer ? Ces 6 jeux marchent à 30–50 : tout le monde sur son téléphone en même temps, tout le monde qui bouge, ou des équipes en un instant.',
  h1: 'Jeux brise-glace pour grands groupes (30+) : 6 jeux où toute la salle joue en même temps',
  seoTitle: '6 jeux brise-glace pour grands groupes de 30 et plus | Woohop',
  seoDesc: 'Brise-glace pour grands groupes de 30 à 50 personnes : Jeu de buzzer, Happy Bingo, Ceci ou cela, 1, 2, 3, soleil ! – version mimes, Téléphone mimé et Téléphone dessiné, avec des conseils pour animer une foule.',
  lead: [
    'Au-delà de 30 personnes, beaucoup de brise-glace ne fonctionnent plus : passer chacun son tour prend dix minutes ou plus, et les derniers rangs finissent sur leur téléphone. Un grand groupe a besoin que **tout le monde ait quelque chose à faire en même temps** – pas que tout le monde attende en regardant une seule personne.',
    'Les six jeux de cette liste tiennent tous la route à 30–50 personnes, en trois styles : ceux où chacun joue sur son propre téléphone, ceux où toute la salle bouge sans téléphone, et ceux où l’on se répartit en équipes qui jouent en même temps. Tout est gratuit et se joue dans le navigateur : on rejoint en scannant un QR code, sans application à télécharger.',
  ],
  blocks: [
    { h2: 'En un coup d’œil : nombre de joueurs et ce qu’il faut prévoir' },
    {
      table: {
        head: ['Jeu', 'Joueurs', 'Durée', 'À prévoir'],
        rows: [
          ['buzzer', '2 à 50', 'env. 1 min par question', 'Un téléphone chacun, idéalement un projecteur'],
          ['bingo', '2 à 50', '10 à 20 min', 'Un téléphone chacun'],
          ['match', '5 à 30', 'env. 8 min', 'Un téléphone chacun'],
          ['statue', '4 à 50', 'Aussi longtemps que vous voulez', 'De l’espace + le téléphone de l’animateur'],
          ['charades-relay', '3 à 10 par équipe', 'env. 5 min par équipe', 'De quoi faire une file'],
          ['drawing-relay', '3 à 10 par équipe', 'env. 3 min par mot à 5', 'Un téléphone par équipe'],
        ],
      },
    },
    { p: 'Vous voulez que les gens **fassent connaissance** ? Happy Bingo ou Ceci ou cela. Vous voulez d’abord **chauffer la salle** ? Jeu de buzzer ou 1, 2, 3, soleil ! – version mimes. Envie d’une **compétition par équipes** ? L’un des deux jeux de téléphone. Si tout le monde est assis dans une salle de classe, commencez par le Jeu de buzzer.' },

    { h2: 'Chacun sur son téléphone : toute la salle joue en même temps' },
    { p: 'Ces trois-là sont des jeux « salon » : l’animateur ouvre un salon, un QR code s’affiche à l’écran et chacun le scanne avec son téléphone. Qu’on soit 10 ou 50, tout le monde répond ou cherche en même temps : personne ne reste à attendre.' },
    {
      game: 'buzzer',
      need: '2 à 50 joueurs + un animateur · env. 1 min par question · un téléphone chacun, idéalement l’écran de l’animateur projeté',
      p: [
        'L’animateur pose une question et le téléphone de chacun devient un buzzer. On ne peut buzzer qu’une fois la question lue et les boutons allumés, et le classement s’affiche en direct : on voit tout de suite qui a été le plus rapide. Le plus rapide répond en premier ; s’il se trompe, c’est au deuxième.',
        'La grande crainte avec un grand groupe, c’est que « seul le premier rang participe » – avec le buzzer, c’est l’inverse, puisque quelqu’un tout au fond peut arriver premier. Les questions sont entièrement libres : liées à la journée (histoire de l’entreprise, contenu du cours, anecdotes sur les nouveaux) ou simplement drôles.',
      ],
      tip: 'Projetez l’écran de l’animateur pour que tout le monde suive le classement ensemble. Vous pouvez taper les questions à l’avance et les envoyer : elles s’affichent sur tous les téléphones. Un petit lot ou un système de points rend le jeu bien plus disputé.',
    },
    {
      game: 'bingo',
      need: '2 à 50 joueurs (idéal à partir de 8) · 10 à 20 min · un téléphone chacun',
      p: [
        'Chacun reçoit une carte de bingo dont les cases ne sont pas des nombres mais des types de personnes : « Quelqu’un qui a un animal à la maison », « Quelqu’un qui se lève avant 6 h »… Trouvez quelqu’un qui correspond, discutez un instant, et c’est seulement quand cette personne **confirme sur son propre téléphone** que vous pouvez cocher la case. Une ligne complète vous place au classement.',
        'C’est le jeu pour faire connaissance le plus utile en grand groupe : plus il y a de monde, plus il y a de gens à trouver, donc chacun se lève naturellement, circule et aborde des inconnus. Et comme l’autre doit confirmer, personne ne peut cocher tout seul.',
      ],
      tip: 'Vérifiez les cases avant de commencer et remplacez celles qui ne correspondront à personne – ou à une seule personne. Avec un grand groupe qui veut jouer plus longtemps, réglez la fin de partie à deux ou trois gagnants.',
    },
    {
      game: 'match',
      need: '5 à 30 joueurs (groupes à partir de 6) · 8 à 10 questions, env. 8 min · un téléphone chacun',
      p: [
        'À chaque question, on choisit « d’accord » ou « pas d’accord » avant la fin du temps – il n’y a pas de mauvaise réponse. À la fin, les personnes qui pensent le plus pareil sont réunies en groupe, avec des sujets de conversation en commun.',
        'Les grands groupes doivent souvent se répartir, mais des groupes formés en comptant « 1, 2, 3 » n’ont rien à se dire. Ceux qui sortent de Ceci ou cela ont un point commun dès le départ, et l’atelier ou l’activité qui suit se passe beaucoup mieux.',
      ],
      tip: 'Tenez-vous-en à 8 à 10 questions, sinon les gens fatiguent. À la fin de chaque question, prenez quelques secondes pour dire qui a choisi quoi : quelqu’un commence presque toujours à se justifier. Une fois les groupes formés, laissez-leur 5 à 10 minutes pour discuter des sujets affichés.',
    },

    { h2: 'Sans téléphone, toute la salle en mouvement : idéal quand il y a de la place' },
    { p: 'Si le lieu est assez grand – amphi, gymnase, pelouse dehors –, faire bouger tout le monde ensemble réchauffe l’ambiance plus vite que n’importe quel jeu sur téléphone.' },
    {
      game: 'statue',
      need: '4 à 50 joueurs · aussi longtemps que vous voulez · de l’espace + le téléphone de l’animateur',
      p: [
        '1, 2, 3, soleil !, mais chacun tire d’abord une carte mime sur le téléphone de l’animateur : faire de la moto, marcher en crabe… Pendant que le meneur crie « 1, 2, 3, soleil ! », chacun avance **en mimant sa carte** ; quand il se retourne, ceux qui bougent encore – ou qui ne miment pas leur carte – sont pris.',
        'Cinquante personnes qui foncent en même temps, c’est déjà drôle en soi. Les adultes se sentent parfois un peu ridicules avec la version classique, mais les cartes mime aident à se lâcher, puisque tout le monde a l’air aussi bête.',
      ],
      tip: 'Avec beaucoup de monde, faire passer un seul téléphone pour tirer les cartes prend un moment : faites la queue. Il y a 28 mimes, donc au-delà de 28 joueurs certains auront le même – ce qui n’en est que plus drôle. Prévoyez un sol large et dégagé. Le meneur peut jouer avec le rythme ; un « soleil » bien traîné déclenche les plus grands fous rires.',
    },

    { h2: 'En équipes qui jouent en même temps : transformer un grand groupe en plusieurs petits' },
    { p: 'Certains jeux sont plus drôles à une dizaine : faites des équipes. Les deux jeux de téléphone se jouent à 3 à 10 par équipe : trois équipes couvrent 30 personnes, quatre ou cinq encore plus. Jouer aux points crée aussi plus d’esprit d’équipe que de simplement passer chacun son tour.' },
    {
      game: 'charades-relay',
      need: '3 à 10 par équipe, plus d’équipes s’il y a plus de monde · env. 5 min par équipe · le téléphone de l’animateur + de quoi faire une file',
      p: [
        'Chaque équipe se met en file, dos tourné. La première personne voit le mot, se retourne et le mime pour la suivante, et ainsi de suite jusqu’à la dernière, qui donne la réponse. Chacun n’a que quelques secondes avant que le téléphone sonne et passe au suivant ; l’équipe qui trouve le plus de mots dans son temps gagne.',
        'Le moment le plus drôle arrive après la réponse : on remonte la file en demandant « Tu croyais que c’était quoi ? », et tout le monde voit où le mot a dérapé. Les autres équipes rient tout autant en regardant, donc personne n’a l’impression d’attendre.',
      ],
      tip: 'Chaque équipe joue une manche avec le même temps, puis on compare les scores. Deux équipes peuvent aussi s’affronter directement : même nombre de joueurs côte à côte, les deux premiers voient le même mot, les deux derniers répondent au plus vite, et l’animateur compte les points.',
    },
    {
      game: 'drawing-relay',
      need: '3 à 10 par équipe, plus d’équipes s’il y a plus de monde · env. 3 min par mot à 5 · un téléphone par équipe',
      p: [
        'Un téléphone passe de main en main : la première personne dessine le mot, la suivante ne voit le dessin précédent que 5 secondes et dessine ce qu’elle croit avoir vu, et ainsi de suite jusqu’à la dernière, qui devine à partir du dernier dessin. À la fin, on étale tous les dessins pour voir où ça a déraillé.',
        'Avec un grand groupe, chaque équipe joue en même temps sur son propre téléphone, et on regarde quelle équipe retrouve encore le même mot à la fin. Tout se passe en parallèle, personne n’attend les autres équipes, et ça marche avec tout le monde assis.',
      ],
      tip: 'Quand le téléphone circule, rappelez à ceux dont ce n’est pas encore le tour de détourner les yeux : voir les dessins précédents gâche tout. Après la réponse, remontez les dessins un par un et demandez à chacun ce qu’il pensait dessiner.',
    },

    { h2: 'Cinq points clés pour animer un grand groupe' },
    {
      ul: [
        '**Ouvrez le salon et projetez-le avant l’arrivée des gens** : affichez le QR code du jeu salon sur le grand écran dès l’accueil, pour que chacun le scanne en s’asseyant et qu’il n’y ait pas d’attente au moment de commencer.',
        '**Vérifiez la connexion** : tous les téléphones ont besoin d’internet. Dans un sous-sol ou une grande salle mal couverte, vérifiez que le Wi-Fi du lieu fonctionne et affichez aussi le nom du réseau et le mot de passe.',
        '**Le micro compte plus que tout** : au-delà de 30 personnes, une explication claire ne sert à rien si le fond de la salle n’entend pas. Vérifiez que le dernier rang vous entend avant de commencer.',
        '**Faites les équipes avec un jeu** : quand il faut des groupes, laissez Ceci ou cela répartir les gens automatiquement, ou répartissez selon les places – ne laissez pas chacun chercher son groupe, sinon quelqu’un restera seul.',
        '**Pas plus de trois jeux par séance** : avec un grand groupe, chaque changement veut dire réexpliquer et rescanner. Deux ou trois jeux joués plus longtemps sont plus faciles à animer que beaucoup de jeux courts. Pour un ordre, voyez le [combo brise-glace](page:combo).',
      ],
    },

    { h2: 'Questions fréquentes' },
    {
      faq: [
        ['Et si on est plus de 50 ?', '1, 2, 3, soleil ! – version mimes et les deux jeux de téléphone n’ont pas de limite : toute la salle joue ensemble au premier, et pour les autres il suffit d’ajouter des équipes. Le Jeu de buzzer et Happy Bingo acceptent jusqu’à 50 par salon ; au-delà, faites deux zones avec un salon chacune.'],
        ['Peut-on jouer sans projecteur ?', 'Oui. Dans Happy Bingo et Ceci ou cela, chacun regarde son propre téléphone. Sans projecteur, l’animateur du Jeu de buzzer lit simplement le classement à voix haute – on perd juste un peu de l’ambiance de l’écran partagé.'],
        ['Les participants doivent-ils télécharger une application ?', 'Non. Pour les jeux salon, on scanne un QR code avec son téléphone, on choisit un avatar et un pseudo, et c’est parti – sans inscription non plus.'],
      ],
    },
    { p: 'Groupe plus petit, ou juste une petite salle ? Découvrez [10 jeux brise-glace sans matériel, en intérieur](guide:no-props-indoor-icebreakers), ou filtrez par nombre de joueurs dans [Trouver un jeu](page:games).' },
  ],
};
