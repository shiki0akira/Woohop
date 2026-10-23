/*
 * Français. Mêmes clés que zh-TW.js. Le nom du jeu reprend le jeu de groupe connu
 * « Compter jusqu’à 10 », pas une traduction littérale (CONCEPT.md section 5).
 * Les marqueurs comme {n} restent tels quels.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Compter jusqu’à 10 | Jeu brise-glace avec noms rigolos, refrain et musique',
  seoDesc:
    'Tout le monde s’accroupit comme une pousse de bambou. Chacun peut se lever et annoncer le nombre suivant, mais si deux personnes se lèvent en même temps, la première qui crie le nom de l’autre reste debout. Le dernier accroupi a perdu. Le téléphone distribue des noms rigolos (plats, boissons, animaux, personnages de dessins animés), lance le refrain et la musique, et finit par une machine à sous action ou vérité. Sans matériel, sans téléchargement, sans inscription.',
  rulesSeoTitle: 'Compter jusqu’à 10 : règles du jeu et conseils pour l’animer',
  rulesSeoDesc:
    'Les règles de « Compter jusqu’à 10 » : combien de joueurs, comment marchent les noms, que faire quand deux personnes se lèvent ensemble, qui perd, et un petit texte que l’animateur peut lire.',

  navTitle: 'Compter jusqu’à 10',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'Compter jusqu’à 10 : on se lève, on compte, on crie un nom',
  heroDesc: 'Tout le monde s’accroupit, puis chacun se lève à son tour en annonçant le nombre suivant. Deux debout en même temps ? Le premier qui crie le nom de l’autre reste. Le dernier accroupi a perdu.',

  lead: {
    setup: ['Choisir un thème', 'On joue à « Compter jusqu’à 10 » ! Choisissez d’abord un thème : dans un instant, chacun recevra un nom.'],
    name: ['Tirer les noms', 'Faites passer le téléphone. Chacun tire un nom et le lit à voix haute pour que tout le monde l’entende !'],
    rules: ['Les règles', 'Tout le monde s’accroupit comme une pousse de bambou. Après le refrain, chacun peut se lever et annoncer le nombre suivant, en commençant par 1. Si deux personnes se lèvent ensemble, criez vite le nom de l’autre ! Le dernier accroupi a perdu.'],
    play: ['C’est parti !', 'Tout le monde en bas ! Répétez avec moi — bambou, bambou, tous debout !'],
    end: ['Qui a perdu ?', 'Le dernier accroupi choisit action, vérité ou hasard, puis tire la machine à sous !'],
  },
  ruleCards: [
    ['Se lever et compter', 'Chacun peut se lever quand il veut et annoncer le nombre suivant. Interdit de se mettre d’accord !'],
    ['Ensemble ? Criez un nom', 'Le premier qui crie le nom de l’autre reste debout, le plus lent se rassoit. Crié en même temps ? Pierre, feuille, ciseaux.'],
    ['Le dernier perd', 'Celui qui est encore accroupi à la fin a perdu.'],
  ],
  rulesNext: 'Suivant : on joue',

  startNaming: 'Lancer la partie',
  startRealname: 'Lancer la partie',


  playNames: 'Voici nos pousses de bambou du jour : {names} !',
  startRound: 'Lancer la manche',
  endRound: 'Maintenir pour finir',
  musicLabel: 'Musique',
  chant: ['Bam', 'bou', 'bam', 'bou', 'tous', 'de', 'bout !'],
  playHintIdle: 'Tout le monde s’accroupit, puis appuyez sur lancer.',
  playHintRunning: 'Ensemble ? Criez son nom ! Le dernier accroupi perd.',

  againButton: 'Encore une manche',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'Les noms tirés seront effacés.',
  leaveConfirm: 'Au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer à « Compter jusqu’à 10 »',
  rulesIntro: 'Tout le monde s’accroupit comme une pousse de bambou et se lève à tour de rôle avec le nombre suivant. Si deux se lèvent ensemble, ils crient le nom de l’autre au plus vite. Le dernier accroupi a perdu.',
  rulesFacts: [
    ['Joueurs', '4 à 20'],
    ['Durée', '1 à 2 minutes par manche'],
    ['Matériel', 'Rien, juste le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Comment jouer',
  rulesHowSteps: [
    'Choisissez un thème et faites passer le téléphone : chacun tire un nom (ou en invente un, ou garde son vrai prénom).',
    'Tout le monde s’accroupit et dit ensemble : « Bambou, bambou, tous debout ! »',
    'Chacun peut se lever et annoncer le nombre suivant, en commençant par 1. Une fois debout, on reste debout.',
    'Deux se lèvent ensemble : le premier qui crie le nom de l’autre reste debout et son nombre compte ; le plus lent se rassoit. Crié en même temps ? Pierre, feuille, ciseaux. Mauvais nom ? On continue jusqu’à ce que quelqu’un ait juste. Trois ou plus ? Le premier qui crie n’importe quel nom reste.',
    'Le dernier encore accroupi a perdu. Avec N joueurs, on compte jusqu’à N−1.',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'D’abord, chacun tire un nom sur le téléphone. Ensuite on s’accroupit tous et chacun peut se lever avec le nombre suivant — mais si deux se lèvent ensemble, criez vite le nom de l’autre ! Le dernier accroupi a perdu.',
  rulesLeadSteps: [
    'Une fois les noms tirés, montrez le téléphone pour que tout le monde voie la liste.',
    'C’est le groupe qui décide qui a crié en premier. L’animateur n’a qu’à crier « Collision ! ».',
    'Le perdant tire la machine à sous, répond ou fait l’action, puis « Encore une manche ».',
  ],
  rulesBack: '← Retour au jeu',
};
