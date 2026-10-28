/*
 * Français. Basé sur « 1, 2, 3, soleil ! » : le meneur se tourne vers le mur, crie « 1, 2, 3, soleil ! »
 * et se retourne – ceux qui bougent encore sont pris.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: '1, 2, 3, soleil ! – version mimes | Tirez une carte et avancez en moto ou en crabe',
  seoDesc:
    'Comme 1, 2, 3, soleil !, mais chacun tire d’abord une carte mime sur le téléphone. « Faire de la moto » : on avance en moto. « Marcher en crabe » : on avance de côté. Ceux qui bougent encore quand le meneur se retourne sont pris. Celui qui touche le meneur devient le nouveau meneur et tout le monde retire une carte. À la fin, le gagnant tire un mime que le perdant doit faire – rafale de photos ! Sans matériel, sans appli, sans inscription.',
  rulesSeoTitle: '1, 2, 3, soleil ! – version mimes : règles et conseils',
  rulesSeoDesc: 'Les règles de 1, 2, 3, soleil ! – version mimes : nombre de joueurs, cartes mimes, quand on est pris, qui devient meneur, et un texte que l’animateur peut lire tel quel.',

  navTitle: '1, 2, 3, soleil ! – version mimes',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: '1, 2, 3, soleil ! – version mimes : tirez une carte, avancez en la mimant',
  heroDesc: 'Comme au 1, 2, 3, soleil !, ceux qui bougent quand le meneur se retourne sont pris. La différence : chacun tire une carte mime. Faire de la moto, marcher en crabe, se dandiner comme un pingouin… et on avance comme ça !',

  lead: {
    setup: ['C’est parti', 'On joue à « 1, 2, 3, soleil ! – version mimes » ! D’abord, on choisit un meneur. Il se place là-bas, face au mur, et tous les autres s’alignent ici.'],
    rules: ['Les règles', 'Comme au 1, 2, 3, soleil ! : pendant que le meneur crie « 1, 2, 3, soleil ! », on avance ; quand il se retourne, ceux qui bougent encore sont pris. La différence : chacun tire une carte mime. Avec « Faire de la moto », on avance en moto ; avec « Marcher en crabe », on avance de côté ! Ne pas mimer sa carte, c’est aussi être pris. Celui qui touche le meneur devient le nouveau meneur, l’ancien rejoint les joueurs, et tout le monde retire une carte.'],
    go: ['La manche commence !', 'Tout le monde se souvient de son mime ? Meneur, face au mur : 1, 2, 3, soleil !'],
    end: ['Fin de la partie !', 'Le dernier à avoir touché le meneur tire un mime pour lui ! Sortez vos téléphones – rafale de photos !'],
  },
  ruleCards: [
    ['Tirer une carte mime', 'Le téléphone fait le tour : chacun tire une carte et retient son mime.'],
    ['Avancer en mimant', 'Pendant « 1, 2, 3, soleil ! », on avance à sa façon : en moto, en crabe…'],
    ['On bouge ? Pris !', 'Bouger quand le meneur se retourne, ou ne pas mimer sa carte : pris. Toucher le meneur, c’est devenir le prochain meneur.'],
  ],
  rulesNext: 'Suivant : tirer les cartes',

  startButton: 'Lancer la partie',

  drawCount: '{n} carte(s) tirée(s)',
  drawButton: 'Tirer une carte mime',
  drawHint: 'À toi ! Tire une carte',
  drawnHint: 'Retiens ton mime, puis passe le téléphone',
  passButton: 'Passer à la personne suivante',
  allDrawn: 'Tout le monde a tiré, c’est parti !',
  actions: [
    ['moto', 'Faire de la moto'],
    ['crab', 'Marcher en crabe'],
    ['penguin', 'Se dandiner comme un pingouin'],
    ['kangaroo', 'Sauter comme un kangourou'],
    ['hop', 'Sauter à cloche-pied'],
    ['back', 'Marcher à reculons'],
    ['model', 'Défiler comme un mannequin'],
    ['zombie', 'Sauter comme un zombie'],
    ['robot', 'Robot'],
    ['moon', 'Moonwalk'],
    ['row', 'Ramer'],
    ['horse', 'Faire du cheval'],
    ['skate', 'Patiner'],
    ['ski', 'Skier'],
    ['rooster', 'Marcher comme un coq'],
    ['fly', 'Voler comme un super-héros'],
    ['ballet', 'Danse classique'],
    ['tiptoe', 'Sur la pointe des pieds'],
    ['rope', 'Funambule'],
    ['elephant', 'Balancer sa trompe d’éléphant'],
    ['gorilla', 'Gorille qui se tape la poitrine'],
    ['ninja', 'Ninja'],
    ['cane', 'Papi avec sa canne'],
    ['basket', 'Porter des courses très lourdes'],
    ['jump', 'Corde à sauter'],
    ['drive', 'Conduire une voiture'],
    ['wiggle', 'Marcher en remuant les fesses'],
    ['heels', 'Marcher en talons hauts'],
  ],

  goHint: 'Quand quelqu’un touche le meneur, la manche est finie : il devient le nouveau meneur et l’ancien rejoint les joueurs. Tout le monde revient au départ et retire une carte !',
  nextRound: 'Manche suivante : retirer une carte',
  endGame: 'Maintenir pour terminer',
  againButton: 'Rejouer',

  punishHeading: 'Le gagnant tire un mime, le perdant l’imite – rafale de photos !',
  punishRandom: 'Tirer au hasard',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'La partie recommence et les cartes mimes sont remélangées.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer à 1, 2, 3, soleil ! – version mimes',
  rulesIntro: 'Comme 1, 2, 3, soleil !, mais chacun tire d’abord une carte mime et doit avancer en la mimant. Bouger quand le meneur se retourne, ou ne pas mimer sa carte : on est pris.',
  rulesFacts: [
    ['Joueurs', '5 à 30'],
    ['Durée', 'Aussi longtemps que vous voulez'],
    ['Matériel', 'Un peu d’espace et le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Déroulement',
  rulesHowSteps: [
    'Choisissez un meneur. Il se place d’un côté, face au mur ; les autres s’alignent au départ, de l’autre côté.',
    'Le téléphone fait le tour : chacun tire une carte mime (faire de la moto, marcher en crabe…). Pas deux fois le même mime dans une manche.',
    'Face au mur, le meneur crie « 1, 2, 3, soleil ! » : pendant ce temps, chacun avance à sa façon. Quand il se retourne, tout le monde se fige.',
    'Ceux qui bougent encore, ou qui ne miment pas leur carte, sont pris et vont se placer à côté du meneur.',
    'Quand quelqu’un touche le meneur, la manche est finie : il devient le nouveau meneur, l’ancien rejoint les joueurs, tout le monde revient au départ et retire une carte.',
    'Quand vous en avez assez, terminez la partie : le dernier à avoir touché le meneur tire un mime pour lui, et tout le monde le prend en rafale !',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'C’est comme 1, 2, 3, soleil !, mais chacun tire d’abord une carte mime ! Avec « Faire de la moto », on avance en moto ; avec « Marcher en crabe », on avance de côté. Bouger quand le meneur se retourne, ou ne pas mimer sa carte : on est pris. Celui qui touche le meneur devient le prochain meneur !',
  rulesLeadSteps: [
    'Jouez dans un grand espace, sans rien qui fasse trébucher. Tous les mimes se font debout.',
    'Le meneur peut crier vite ou lentement pour piéger les joueurs : « 1… 2… 3… SOLEIL ! » fait toujours rire.',
    'C’est le meneur qui décide si un mime compte. Soyez souples au début, plus stricts ensuite.',
  ],
  rulesBack: '← Retour au jeu',
};
