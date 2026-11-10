/*
 * Français. Nom : À ras bord (CONCEPT.md §4 — ce jeu n’a de nom établi dans aucune langue,
 * donc chaque langue prend l’expression locale pour « rempli jusqu’au bord »).
 * Les repères comme {n} restent tels quels.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'À ras bord | Un seul téléphone, on remplit à tour de rôle sans faire déborder',
  seoDesc:
    'Un brise-glace avec un seul téléphone : de 2 à 12 personnes remplissent le même verre à tour de rôle. Un appui pour ouvrir l’eau, un autre pour la couper, puis on passe le téléphone. L’eau monte jusqu’au bord et la tension de surface la retient en bombé — celui qui la fait déborder perd. Chaque manche tire un récipient différent : verre à pied, verre à eau, bouteille au col étroit, et même une cruche en terre où il faut jouer à l’oreille. Sans téléchargement, sans inscription.',
  rulesSeoTitle: 'Comment jouer à À ras bord : règles et conduite d’animation',
  rulesSeoDesc: 'Les règles d’À ras bord : combien de joueurs, comment choisir la taille du verre selon le groupe, ce qui change entre les huit récipients, à partir de quand ça déborde, et un texte à lire pour lancer la partie.',

  navTitle: 'À ras bord',
  navRules: 'Règles',
  rulesLinkText: 'Toutes les règles →',
  soundLabel: 'Son', // un seul bouton pour le bruit de l’eau et la musique, donc pas « musique »

  heroTitle: 'À ras bord : on remplit à tour de rôle, celui qui fait déborder perd',
  heroDesc: 'Un téléphone tourne dans le cercle. Un appui et l’eau coule, un autre et elle s’arrête : c’est ton tour, puis tu passes. Quand la tension de surface tient l’eau au-dessus du bord, plus personne n’ose appuyer. Et le récipient change à chaque manche.',

  // ---------- Étapes d’animation ----------
  // [titre, à lire à voix haute]. Pendant les tours le téléphone circule : pas d’en-tête d’étape (apps/warmup/CLAUDE.md)
  lead: {
    setup: ['On commence', 'On joue à « À ras bord » ! Tout le monde en cercle — ce téléphone va passer entre toutes les mains.'],
    rules: ['Expliquer les règles', 'Il y a un verre sur le téléphone. À ton tour, un appui sur « Verser », un autre pour couper — une fois chacun, puis tu passes. La tension de surface retient l’eau en bombé au-dessus du bord : on croit toujours que c’est fini et ça tient encore. Des petites gorgées et ça dure longtemps, une grosse gorgée gourmande et tu perds tout de suite. Le récipient change à chaque manche, et il y en a où on ne voit rien : il faut écouter !'],
    end: ['Ça a débordé !', 'C’est lui ! Le perdant tire une action ou vérité, puis quelqu’un d’autre commence et on en remplit un autre.'],
  },
  // Les trois cartes illustrées de l’étape « Expliquer les règles » : [titre, texte]
  ruleCards: [
    ['Verser', 'À ton tour, un appui sur « Verser », un autre pour couper. Autant que tu veux — mais il en tombe toujours un peu.'],
    ['Passer la main', 'Une fois chacun. Tu appuies sur « Passer le téléphone » et tu le tends.'],
    ['Faire déborder, c’est perdre', 'L’eau bombe au-dessus du bord sans couler : c’est la tension de surface. Celui qui la fait déborder a perdu. Et le récipient est différent à chaque manche.'],
  ],
  rulesNext: 'Commencer',

  // ---------- Écran d’accueil ----------
  startButton: 'Commencer',
  // Taille du verre : toujours affichée (choisir selon le groupe est une étape qu’il ne faut pas sauter)
  advancedLabel: 'Taille du verre',
  sizeHint: 'À choisir selon le nombre de joueurs : chaque taille tient à peu près un à deux tours de cercle. 12 joueurs au maximum, au-delà faites deux groupes.',
  sizeSmall: 'Petit\n2–5 joueurs',
  sizeNormal: 'Moyen\n6–9 joueurs',
  sizeLarge: 'Grand\n10–12 joueurs',

  // ---------- On verse ----------
  // Un récipient est tiré au sort à chaque manche (SHAPES dans app.js) ; les clés sont les mêmes
  shapeNotes: {
    goblet: 'Cette manche : un verre à pied. Panse large, bord resserré — plus on approche du bord, plus ça monte vite.',
    glass: 'Cette manche : un verre à eau droit. Même largeur partout, le niveau est le plus facile à prévoir. Le plus juste des huit.',
    bottle: 'Cette manche : une bouteille en verre au col étroit. Corps large, col fin — dès que l’eau entre dans le col, elle grimpe d’un coup.',
    pot: 'Cette manche : une cruche en terre cuite, opaque. On ne voit pas le niveau et l’ouverture est minuscule ! Écoute — plus le son monte, plus c’est plein.',
    mug: 'Cette manche : un mug opaque. On ne voit pas le niveau, mais l’ouverture est large : on aperçoit l’eau avant la fin.',
    measure: 'Cette manche : un verre mesureur. Il est gradué — mettez-vous d’accord sur une ligne à ne pas dépasser, c’est encore mieux.',
    beaker: 'Cette manche : un bécher. Bas et large, la même quantité d’eau fait monter le niveau très peu. Le plus indulgent.',
    flask: 'Cette manche : une bouteille isotherme, opaque. Niveau invisible et goulot étroit — la plus dure des huit.',
  },
  // Récipient opaque et son coupé : on incite, sans jamais bloquer
  soundNudge: 'Active la note en haut : la hauteur du bruit de l’eau te dit si c’est bientôt plein.',
  pourTurn: 'Joueur {n}',
  pourButton: 'Verser',
  pourStopButton: 'Couper',
  pourHint: 'Un appui pour ouvrir l’eau, un autre pour la couper. Autant que tu veux.',
  // La phase où l’eau dépasse le bord (CONCEPT.md 2.5)
  tenseHint: 'L’eau bombe déjà au-dessus du bord… une goutte de plus et c’est fini !',
  passSay: 'C’est versé ! Passe le téléphone, c’est au suivant de verser.',
  drawSay: 'On tire un récipient…',
  passButton: 'Passer le téléphone',
  overflowFlash: 'Ça a débordé !',

  // ---------- Ça a débordé ----------
  endTitle: 'Ça a débordé !',
  // Tout le monde voit qui a perdu : on ne donne que le nombre de versées
  endStats: 'Ce verre a tenu {n} versées',
  endBest: 'Record du jour : {n}',
  slotHeading: 'Le perdant tire : action ou vérité ?',
  againButton: 'Un autre verre',

  // ---------- Confirmation de sortie ----------
  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'Ce verre est vidé et la partie repart d’un verre vide.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  // ---------- Page des règles ----------
  rulesTitle: 'Comment jouer à À ras bord',
  rulesIntro: 'Un téléphone tourne dans le cercle : chacun verse de l’eau dans le même verre, une fois par personne, et celui qui le fait déborder perd.',
  rulesFacts: [
    ['Joueurs', '2 à 12'],
    ['Durée', '2 à 5 minutes par verre'],
    ['Matériel', 'Un téléphone (pour le faire en vrai : un verre transparent et une carafe d’eau)'],
  ],
  rulesHowHeading: 'Comment on joue',
  rulesHowSteps: [
    'Asseyez-vous en cercle et donnez le téléphone au premier joueur. Avant de lancer, choisissez la taille du verre selon le groupe : petit pour 2–5, moyen pour 6–9, grand pour 10–12 joueurs.',
    'À son tour, on appuie sur « Verser » et l’eau coule dans le verre ; un deuxième appui la coupe. Il n’y a pas de limite en haut — mais dès que tu touches, un peu d’eau tombe.',
    'Ensuite on appuie sur « Passer le téléphone » et on le tend à son voisin. Une fois chacun, et on continue à tourner.',
    'Au bord, la tension de surface retient l’eau en bombé : on croit que ça déborde et ça tient. L’image se rapproche du bord, c’est le meilleur moment. À petites gorgées, ça peut encore tenir huit à dix fois ; en laissant le robinet ouvert, ça déborde en une seconde environ.',
    'Celui qui fait déborder a perdu. Il tire une action ou vérité, puis quelqu’un d’autre commence et on remplit le verre suivant.',
  ],
  rulesShapesHeading: 'Un récipient différent à chaque manche',
  rulesShapesIntro: 'Le récipient est tiré au sort parmi huit, et ils ne se jouent pas du tout pareil. Trois sont opaques : on ne voit pas le niveau. On peut quand même jouer sans le son (au bord, l’eau finit par apparaître à l’ouverture), mais avec le son on est avantagé : la hauteur du bruit dit plus tôt si c’est bientôt plein.',
  rulesShapes: [
    ['Verre à pied', 'Panse large, bord resserré — plus on approche du bord, plus le niveau monte vite.'],
    ['Verre à eau droit', 'Même largeur partout, le niveau monte régulièrement. Le plus lisible et le plus juste.'],
    ['Bouteille au col étroit', 'Corps large, col fin — l’eau grimpe d’un coup dès qu’elle entre dans le col. Le passage le plus tendu.'],
    ['Verre mesureur', 'Gradué, donc le seul avec lequel on peut vraiment calculer. Mettez-vous d’accord sur une ligne à ne pas dépasser.'],
    ['Bécher', 'Bas et large, la même quantité d’eau fait monter le niveau très peu. Le plus indulgent.'],
    ['Cruche en terre cuite, opaque', 'Niveau invisible et petite ouverture : on n’aperçoit l’eau qu’à la toute fin.'],
    ['Mug opaque', 'Niveau invisible, mais l’ouverture est large, donc on voit l’eau assez tôt. Le plus facile des trois opaques.'],
    ['Bouteille isotherme, opaque', 'Niveau invisible, goulot étroit, et l’eau grimpe d’un coup en haut. La plus dure des huit.'],
  ],
  rulesLeadHeading: 'Conseils d’animation',
  rulesLeadSay: 'On joue à « À ras bord » ! Il y a un verre sur le téléphone : à ton tour, un appui et l’eau coule, un autre et elle s’arrête, une fois chacun. En haut, l’eau bombe au-dessus du bord sans couler, donc on croit toujours que c’est fini… et celui qui la fait déborder a perdu !',
  rulesLeadSteps: [
    'Si tu veux du vrai matériel : un verre transparent et une carafe d’eau, et tu verses pour de vrai pendant que l’eau coule sur le téléphone — l’ambiance n’est pas la même. Sans matériel, le téléphone seul marche aussi bien.',
    'Choisis toujours la taille du verre selon le groupe (2–5, 6–9, 10–12 joueurs). Bien choisie, quelqu’un perd après un ou deux tours de cercle. Au-delà de 12 joueurs : deux groupes, un téléphone chacun.',
    'Au premier tour tout le monde n’appuie qu’une fraction de seconde — laisse faire. Dès que l’eau bombe, ça ralentit tout seul.',
    'Après l’action ou vérité, le verre suivant commence par la personne qui suit le perdant : ce n’est pas toujours le même qui ouvre.',
  ],
  rulesBack: '← Retour au jeu',
};
