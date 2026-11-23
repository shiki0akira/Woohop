// « 10 jeux brise-glace sans matériel en intérieur » – français. Noms de jeux, formules et exemples repris des pages de règles françaises (1, 2, 3, soleil !, L’ascenseur…). Structure : src/guides.mjs.
export default {
  min: 7,
  title: '10 jeux brise-glace sans matériel, en intérieur',
  desc: 'En classe, en salle de réunion ou en petit groupe : l’animateur ouvre simplement une page web sur un téléphone. Classés selon l’espace et le nombre.',
  h1: '10 jeux brise-glace sans matériel, en intérieur : un seul téléphone suffit',
  seoTitle: '10 jeux brise-glace sans matériel en intérieur (un seul téléphone) | Woohop',
  seoDesc: 'Brise-glace en intérieur sans préparation : Compter jusqu’à 10, L’ascenseur, Catégories en rythme, 1, 2, 3, soleil ! – version mimes, Plus ou moins et d’autres, avec nombre de joueurs, durée et conseils d’animation.',
  lead: [
    'On vous demande d’animer un brise-glace au pied levé, sans rien sous la main ? Aucun des jeux de cette liste **ne demande de matériel** : ni papier ni stylo, ni ballon, rien à imprimer. L’animateur ouvre une page web sur son téléphone et c’est parti – le téléphone donne le rythme, distribue les consignes, gère le chrono et propose même les questions action ou vérité. Pas d’application à télécharger, pas d’inscription.',
    'Les jeux sont classés selon l’espace dont vous disposez : ceux qui font lever tout le monde, ceux qui se jouent en cercle et en rythme, et ceux qui se jouent assis en se passant un seul téléphone. Choisissez-en un dans le tableau, puis lisez la suite pour savoir comment l’animer.',
  ],
  blocks: [
    { h2: 'En un coup d’œil : lequel convient à votre groupe' },
    {
      table: {
        head: ['Jeu', 'Joueurs', 'Une manche', 'Espace'],
        rows: [
          ['bamboo', '4 à 20', '1 à 2 min', 'De quoi s’accroupir et se lever'],
          ['statue', '4 à 50', 'Aussi longtemps que vous voulez', 'Un peu d’espace libre'],
          ['charades', '2 à 30', 'env. 10 min à 6', 'Un peu de place devant'],
          ['stairs', '4 à 30', 'Aussi longtemps que vous voulez', 'En cercle'],
          ['orchard', '4 à 30', 'Aussi longtemps que vous voulez', 'En cercle'],
          ['bomb', '4 à 15', 'env. 10 min pour 3 à 5 manches', 'Assis, on se passe le téléphone'],
          ['password', '3 à 20', '2 à 5 min', 'Assis, on se passe le téléphone'],
          ['cup', '2 à 12', '2 à 5 min', 'Assis, on se passe le téléphone'],
          ['seconds', '2 à 20', 'env. 3 min', 'Assis, on se passe le téléphone'],
          ['reverse', '2 à 20', 'Une consigne chacun', 'Assis, on se passe le téléphone'],
        ],
      },
    },
    { p: 'Beaucoup de monde (plus de 30) et pas envie de faire des groupes ? Choisissez 1, 2, 3, soleil ! – version mimes. Seulement deux ou trois ? À ras bord, Défi chrono ou Défi à l’envers. Si les participants se rencontrent pour la première fois et sont encore un peu raides, commencez par les jeux assis et faites lever tout le monde une fois l’ambiance détendue.' },

    { h2: 'Debout, on bouge : après le repas ou quand on est assis depuis trop longtemps' },
    { p: 'En pleine réunion, en deuxième heure de cours, quand tout le monde pique du nez après le déjeuner : ces trois-là font lever toute la salle et éclater de rire. Ensuite, chacun se rassoit, prêt pour la suite du programme.' },
    {
      game: 'bamboo',
      need: '4 à 20 joueurs · 1 à 2 min par manche · le téléphone de l’animateur',
      p: [
        'Tout le monde s’accroupit comme une pousse de bambou et dit ensemble : « Bambou, bambou, tous debout ! » Ensuite, chacun peut se lever et annoncer le nombre suivant, en commençant par 1. Tout se joue quand **deux personnes se lèvent en même temps** : elles doivent crier le nom de l’autre au plus vite, et la plus lente se rassoit. Le dernier encore accroupi a perdu.',
        'Il n’y a pas d’ordre, donc chacun se demande en permanence si c’est le bon moment pour se lever – et quelqu’un finit toujours par rire. Le téléphone attribue à chacun un nom rigolo (ou gardez vos vrais prénoms). Crier un surnom loufoque lors d’une collision est bien plus drôle que « Julie ! », et ça aide à retenir les noms.',
      ],
      tip: 'Une fois les noms tirés, levez le téléphone pour que tout le monde voie la liste. C’est le groupe qui décide qui a été le plus rapide ; l’animateur se contente de crier « Collision ! ».',
    },
    {
      game: 'statue',
      need: '4 à 50 joueurs · aussi longtemps que vous voulez · un peu d’espace + le téléphone de l’animateur',
      p: [
        'C’est 1, 2, 3, soleil !, mais chacun tire d’abord une carte mime sur le téléphone : faire de la moto, marcher en crabe… Pendant que le meneur crie « 1, 2, 3, soleil ! » face au mur, chacun avance **en mimant sa carte**. Quand il se retourne, ceux qui bougent encore – ou qui ne miment pas leur carte – sont pris.',
        'C’est le jeu de la liste qui supporte le mieux les grands groupes : il marche avec 50 personnes. Les adultes se sentent parfois un peu ridicules avec la version classique, mais les cartes mime aident à se lâcher, puisque tout le monde a l’air aussi bête.',
      ],
      tip: 'Prévoyez assez de place et un sol dégagé. Le meneur peut jouer avec le rythme : un « 1… 2… 3… SOLEIL ! » bien traîné déclenche les plus grands fous rires. Pour finir, le dernier à avoir touché le meneur lui choisit un mime, et tout le monde le prend en rafale.',
    },
    {
      game: 'charades',
      need: '2 à 30 joueurs · env. 10 min à 6 joueurs avec 1 mot chacun · le téléphone de l’animateur',
      p: [
        'Chacun son tour, on passe devant et on mime le mot affiché sur le téléphone : pas de paroles, pas de bruits, pas de mots articulés. Les autres proposent des réponses, et le premier qui trouve gagne un point.',
        'Le casse-tête habituel du jeu de mimes, c’est que l’animateur doit inventer les mots. Ici, ils sont déjà prêts, dans des catégories comme animaux, métiers, nourriture ou expressions ; on peut passer un mot impossible à mimer avant de commencer, et si tout le monde sèche, il y a des indices.',
      ],
      tip: 'Pour une première partie, ne gardez que « animaux » et « vie quotidienne » ; ajoutez « expressions » et « situations drôles » quand tout le monde est à l’aise. Avec un grand groupe, faites deux équipes et passez au [Téléphone mimé](game:charades-relay).',
    },

    { h2: 'En cercle, en rythme : on ne bouge pas, mais le cerveau chauffe' },
    { p: 'Ce sont deux classiques des jeux de groupe, pour lesquels l’animateur devait autrefois taper le rythme dans ses mains. Désormais, le téléphone bat la mesure et peut accélérer petit à petit : vous pouvez vous concentrer sur qui se trompe. Debout en cercle ou assis sur des chaises en rond, peu importe.' },
    {
      game: 'stairs',
      need: '4 à 30 joueurs · aussi longtemps que vous voulez · le téléphone de l’animateur',
      p: [
        'Numérotez-vous dans le cercle : étage 1, étage 2, étage 3… Sur les quatre temps du téléphone, l’étage 1 lance « Un, monte, au, quatre ! », et l’étage 4 doit répondre sur les quatre temps suivants : « Quatre, descend, au, deux ! ». Se tromper de sens (l’étage 4 ne peut pas « descendre au cinq »), appeler un étage qui n’existe pas, rater son tour ou répondre sans être appelé : tout ça compte comme une erreur, et celui qui se trompe passe à l’étage 1.',
        'Les règles s’expliquent en une minute, mais plus ça va vite, plus les langues s’emmêlent. Et comme celui qui se trompe change de place, tous les étages bougent sans arrêt : chacun doit sans cesse se rappeler à quel étage il est.',
      ],
      tip: 'Commencez lentement et accélérez quand le groupe a pris le coup (le téléphone peut aussi accélérer tout seul). L’animateur crie simplement « Raté ! » et envoie la personne à l’étage 1.',
    },
    {
      game: 'orchard',
      need: '4 à 30 joueurs · aussi longtemps que vous voulez · le téléphone de l’animateur',
      p: [
        'Tout le monde dit en rythme « Un, deux, trois ! », puis l’animateur annonce un thème – par exemple « Le petit-déj ». Le téléphone bat ensuite clap, clap, mot : tout le monde tape dans ses mains sur les deux premiers temps, et sur le troisième, la personne dont c’est le tour cite quelque chose qui colle au thème – « clap, clap, croissant », « clap, clap, tartine »… Pas de répétition, pas de hors-sujet, et bloquer trop longtemps fait aussi perdre.',
        'Le thème peut être tiré au hasard par le téléphone, ou choisi pour coller à l’occasion – « les lieux de l’école » pour une journée d’intégration, « les objets du bureau » pour un séminaire d’équipe –, et le jeu mène directement au sujet du jour.',
      ],
      tip: 'C’est l’animateur qui décide à partir de quand on bloque trop longtemps : soyez indulgent au début, puis de plus en plus strict. Quand quelqu’un perd, on change de thème et c’est lui qui recommence.',
    },

    { h2: 'Assis, avec un seul téléphone qui circule : idéal pour une première rencontre' },
    { p: 'Dans ces cinq jeux, un seul téléphone fait le tour du groupe et chacun n’a qu’une petite chose à faire à son tour. Personne n’a à passer devant ni à se présenter : même les plus timides ne se sentent pas sous pression. Ça marche en classe, en salle de réunion ou à une table de restaurant.' },
    {
      game: 'bomb',
      need: '4 à 15 joueurs · env. 10 min pour 3 à 5 manches · un téléphone',
      p: [
        'Un défi s’affiche ; celui qui tient le téléphone le fait tout de suite, puis le passe. Vous pouvez choisir des questions (par exemple « Qu’est-ce que tu manges le plus souvent au petit-déjeuner ? ») ou des actions. Personne ne sait quand la bombe va exploser : celui qui tient le téléphone à ce moment-là a perdu.',
        'Parfait comme premier jeu : les questions sont assez légères pour qu’une phrase suffise, et pendant que tout le monde se passe nerveusement le téléphone, on finit par en apprendre un peu sur les autres sans s’en rendre compte.',
      ],
      tip: 'S’il y a beaucoup de nouvelles têtes, commencez avec les questions seulement et ajoutez les actions quand les gens se connaissent un peu. Si quelqu’un bloque, lancez « Suivant ! » pour garder le rythme. Choisissez la durée de la mèche selon le nombre de joueurs – l’écran en propose une.',
    },
    {
      game: 'password',
      need: '3 à 20 joueurs · 2 à 5 min par manche · un téléphone',
      p: [
        'Le téléphone choisit un nombre en secret (par exemple entre 1 et 100) et chacun essaie de le deviner à son tour. Trop grand ou trop petit, et l’intervalle se resserre : on dit 40, on entend « plus ! », et il devient 41–100. L’intervalle se réduit sans cesse, il y a de moins en moins d’échappatoires, et **celui qui tombe sur le nombre secret explose**.',
        'Avant, il fallait que quelqu’un garde le nombre en tête ; maintenant, c’est le téléphone qui s’en charge, et l’animateur peut jouer aussi. Il n’y a presque rien à expliquer, ce qui en fait le jeu idéal quand grands-parents et enfants jouent ensemble.',
      ],
      tip: 'Après chaque essai, lisez le nouvel intervalle à voix haute (« de 41 à 100 ! ») : la tension monte vite. Donnez cinq secondes à chacun pour répondre, ça accélère la partie. Avec un grand groupe, prenez 1–1000.',
    },
    {
      game: 'cup',
      need: '2 à 12 joueurs · 2 à 5 min par verre · un téléphone',
      p: [
        'Chacun son tour, on verse de l’eau dans le même verre : on touche pour faire couler, on retouche pour arrêter. Versez autant que vous osez, puis passez le téléphone. Quand l’eau atteint le bord, la tension superficielle la retient en un petit dôme – on dirait que ça va déborder, mais pas encore. Celui qui fait déborder a perdu.',
        'Chaque manche tire au hasard l’un des huit récipients, et un verre à pied ne se remplit pas du tout comme une bouteille à col étroit : on ne s’en lasse pas. Particulièrement pratique en petit groupe, il se joue dès deux.',
      ],
      tip: 'Avant de commencer, choisissez la taille du verre selon le groupe (petit pour 2 à 5, moyen pour 6 à 9, grand pour 10 à 12). Gardez le son : la hauteur du bruit de l’eau vous dit si c’est presque plein.',
    },
    {
      game: 'seconds',
      need: '2 à 20 joueurs · env. 3 min par manche · un téléphone qu’on se passe',
      p: [
        'Le téléphone donne un temps cible, par exemple 7,35 secondes. À son tour, on touche pour lancer, on compte dans sa tête et on retouche quand on pense y être. Les chiffres ne sont visibles qu’au début, ensuite tout se joue au feeling. Les trois plus proches montent sur le podium.',
        'Chacun ne touche l’écran que deux fois, sans avoir à parler : c’est le jeu le plus accessible de la liste. Pendant que quelqu’un compte, la salle se tait d’elle-même et tout le monde regarde – et le cri de joie sur un « seulement 0,02 d’écart ! » réchauffe l’ambiance d’un coup.',
      ],
      tip: 'Pour corser le jeu, n’affichez les chiffres qu’une seconde ; avec des enfants, laissez-les trois secondes. Vous pouvez aussi faire parier avant : qui sera le plus précis ?',
    },
    {
      game: 'reverse',
      need: '2 à 20 joueurs · une consigne chacun · un téléphone',
      p: [
        'Quelqu’un enregistre une phrase et le téléphone la joue à l’envers : on dirait une langue extraterrestre. La personne suivante imite ce charabia, l’enregistre, puis le remet à l’endroit, et tout le monde devine la phrase d’origine.',
        'Tout le sel du jeu est dans l’imitation : plus on imite sérieusement les sons bizarres, plus c’est drôle une fois remis à l’endroit. Pas d’idée ? Le téléphone propose des consignes à tirer – faire une phrase avec un mot, ou fredonner une chanson.',
      ],
      tip: 'Donnez vous-même la première consigne : une démonstration et tout le monde a compris. Gardez des phrases courtes – 3 à 5 secondes, c’est parfait. Au-delà, c’est si difficile à l’envers que personne ne trouve.',
    },

    { h2: 'Quatre choses à garder en tête avant de commencer' },
    {
      ul: [
        '**Montez le son** : pour L’ascenseur et Catégories en rythme, il faut entendre le rythme. Avec un grand groupe, branchez le téléphone sur une petite enceinte ou approchez un micro.',
        '**Jouez une manche avant d’expliquer** : expliquer trois fois les règles marche moins bien que de jouer une fois soi-même. La page de règles de chaque jeu propose un court texte à lire à voix haute.',
        '**Des gages légers** : le perdant n’a pas forcément besoin de gage. Si vous en voulez un, la plupart des jeux proposent la machine action ou vérité, vous n’avez rien à inventer.',
        '**Du assis au debout** : si vous enchaînez deux ou trois jeux, commencez par un jeu assis pour vous échauffer, puis un jeu en rythme, et terminez par un jeu où l’on bouge. Pour un ordre tout prêt, essayez le [combo brise-glace](page:combo) : indiquez votre temps et il associe un échauffement à un jeu pour faire connaissance – avec quoi dire à chaque étape.',
      ],
    },

    { h2: 'Questions fréquentes' },
    {
      faq: [
        ['Je n’ai vraiment besoin d’aucun matériel ?', 'Vraiment. Les dix jeux ne demandent que le téléphone de l’animateur (tout se passe dans le navigateur : ni application ni inscription). 1, 2, 3, soleil ! – version mimes demande en plus un peu d’espace pour avancer. Si vous voulez jouer à À ras bord pour de vrai, ajoutez un verre transparent et une carafe d’eau, mais la version sur téléphone suffit largement.'],
        ['Et si on est plus de 30 ?', '1, 2, 3, soleil ! – version mimes se joue à 50 sans problème. Pour L’ascenseur et Catégories en rythme, un cercle immense signifie une longue attente entre deux tours : formez deux ou trois cercles, avec un téléphone chacun.'],
        ['Ce n’est pas trop enfantin pour des adultes ?', 'Les adultes se prennent souvent au jeu à Compter jusqu’à 10 et à L’ascenseur, car plus ça va vite, plus on se trompe facilement. Pour un événement d’entreprise ou un cadre plus formel, il est plus sûr de commencer par Bombe à retardement (questions seulement), Défi chrono ou Plus ou moins.'],
      ],
    },
    { p: 'Envie d’autres idées ? Rendez-vous sur [Trouver un jeu](page:games) pour filtrer selon le nombre de joueurs, la durée et le besoin de téléphones. Tous les jeux sont gratuits.' },
  ],
};
