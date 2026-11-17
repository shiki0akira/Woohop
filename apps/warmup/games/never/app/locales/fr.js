/*
 * Français. Mêmes clés que zh-TW. Le jeu s’appelle déjà « Je n’ai jamais » (en soirée, souvent avec des verres ;
 * ici, on baisse un doigt). Les exemples sont des participes avec « avoir », pour marcher après
 * « Je n’ai jamais … » ET « J’ai déjà … » — pas de verbes avec « être » (allé, parti, tombé…).
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Je n’ai jamais | Jeu de soirée sans alcool : un thème à chaque tour, si tu l’as fait, baisse un doigt',
  seoDesc:
    'Chacun son tour dit « Je n’ai jamais… » : ceux qui l’ont déjà fait baissent un doigt. Cinq doigts baissés, tu es éliminé ; le dernier à garder des doigts levés devient le roi. Le téléphone tire un thème à chaque tour (l’école, le quotidien, les moments gênants…) avec des exemples, et on peut aussi jouer à l’envers : « J’ai déjà… ». Sans matériel, sans téléchargement, sans inscription. Le roi désigne quelqu’un pour la machine action ou vérité.',
  rulesSeoTitle: 'Je n’ai jamais : règles, thèmes et exemples',
  rulesSeoDesc: 'Comment jouer à « Je n’ai jamais » avec les doigts au lieu des verres : combien de joueurs, comment baisser les doigts, qui gagne, la version à l’envers « J’ai déjà », un texte pour l’animateur et plus de 20 thèmes avec exemples.',

  navTitle: 'Je n’ai jamais',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'Je n’ai jamais : si tu l’as fait, baisse un doigt',
  heroDesc: 'Tout le monde lève une main. Chacun son tour dit une chose qu’il n’a jamais faite, par exemple « Je n’ai jamais voyagé seul à l’étranger ». Ceux qui l’ont déjà fait baissent un doigt. Cinq doigts baissés : éliminé. Le dernier à garder des doigts levés gagne. Le téléphone tire un thème à chaque tour.',

  modeLabel: 'Façon de jouer',
  modeNever: 'Je n’ai jamais',
  modeDid: 'J’ai déjà',
  modeHintNever: 'Dis une chose que tu n’as jamais faite. Ceux qui l’ont faite baissent un doigt.',
  modeHintDid: 'Dis une chose que tu as déjà faite. Ceux qui ne l’ont jamais faite baissent un doigt.',

  lead: {
    setup: ['Introduction', 'On joue à « Je n’ai jamais » ! Tout le monde lève une main, les cinq doigts bien écartés.'],
    rules: ['Les règles', 'Chacun son tour dit une chose qu’il n’a jamais faite, par exemple « Je n’ai jamais voyagé seul à l’étranger ». Ceux qui l’ont déjà faite baissent un doigt. Cinq doigts baissés : éliminé — le dernier à garder des doigts levés gagne ! À chaque tour, le téléphone tire un thème, et tout ce qu’on dit doit coller au thème.'],
    play: ['C’est parti !', 'Le thème de ce tour : « {topic} » ! Je commence : dis une chose liée à {topic} que tu n’as jamais faite. Ceux qui l’ont faite baissent un doigt.'],
    playFree: ['C’est parti !', 'Ce tour est libre, tout est permis ! Je commence : dis une chose que tu n’as jamais faite. Ceux qui l’ont faite baissent un doigt.'],
    end: ['Qui est le roi ?', 'Le dernier à garder des doigts levés est le roi ! Le roi désigne quelqu’un, qui choisit action, vérité ou au hasard — puis tire le levier !'],
  },
  leadDid: {
    setup: ['Introduction', 'On joue à « J’ai déjà » ! Tout le monde lève une main, les cinq doigts bien écartés.'],
    rules: ['Les règles', 'Chacun son tour dit une chose qu’il a déjà faite, par exemple « J’ai déjà vu un film seul au cinéma ». Ceux qui ne l’ont jamais faite baissent un doigt. Cinq doigts baissés : éliminé — le dernier à garder des doigts levés gagne ! À chaque tour, le téléphone tire un thème, et tout ce qu’on dit doit coller au thème.'],
    play: ['C’est parti !', 'Le thème de ce tour : « {topic} » ! Je commence : dis une chose liée à {topic} que tu as déjà faite. Ceux qui ne l’ont jamais faite baissent un doigt.'],
    playFree: ['C’est parti !', 'Ce tour est libre, tout est permis ! Je commence : dis une chose que tu as déjà faite. Ceux qui ne l’ont jamais faite baissent un doigt.'],
    end: ['Qui est le roi ?', 'Le dernier à garder des doigts levés est le roi ! Le roi désigne quelqu’un, qui choisit action, vérité ou au hasard — puis tire le levier !'],
  },
  ruleCards: [
    ['Un thème par tour', 'Le téléphone tire un thème, par exemple « L’école », et pendant ce tour on ne parle que de ça.'],
    ['Dis ce que tu n’as jamais fait', 'Chacun son tour : « Je n’ai jamais… », et ça doit être vrai. Pas d’idée ? Il y a un exemple sous le thème.'],
    ['Déjà fait ? Baisse un doigt', 'Ceux qui l’ont déjà fait baissent un doigt. Cinq doigts baissés : éliminé. Le dernier debout devient le roi !'],
  ],
  ruleCardsDid: [
    ['Un thème par tour', 'Le téléphone tire un thème, par exemple « L’école », et pendant ce tour on ne parle que de ça.'],
    ['Dis ce que tu as déjà fait', 'Chacun son tour : « J’ai déjà… », et ça doit être vrai. Moins il y a de gens qui l’ont fait, mieux c’est.'],
    ['Jamais fait ? Baisse un doigt', 'Ceux qui ne l’ont jamais fait baissent un doigt. Cinq doigts baissés : éliminé. Le dernier debout devient le roi !'],
  ],
  rulesNext: 'Suivant : commencer',

  startButton: 'Lancer la partie',
  soundLabel: 'Musique',

  roundLabel: 'Tour {n}',
  exNever: 'ex. : Je n’ai jamais {ex}',
  exDid: 'ex. : J’ai déjà {ex}',
  exMore: 'Autre exemple',
  topicShuffle: 'Autre thème',
  topicPick: 'Choisir un thème',
  nextRound: 'Tout le monde a parlé : tour suivant',
  topics: [
    ['L’école', ['dormi en cours', 'été délégué de classe', 'oublié mes devoirs', 'eu un zéro à un contrôle']],
    ['Le quotidien', ['chanté sous la douche', 'appuyé trois fois sur le réveil', 'passé une journée entière sans téléphone', 'parlé à mes plantes']],
    ['Les voyages', ['voyagé seul à l’étranger', 'raté mon arrêt dans le train', 'perdu mon chemin dans un pays étranger', 'pris l’avion']],
    ['La nourriture', ['goûté du durian', 'mangé seul au restaurant', 'tellement mangé que je ne pouvais plus bouger', 'cuisiné des nouilles instantanées à minuit']],
    ['Le travail', ['eu un petit boulot', 'été en retard au travail', 'eu un trou noir en entretien d’embauche', 'piqué du nez en réunion']],
    ['Le sport', ['couru un marathon', 'fait une chute devant tout le monde en cours de sport', 'gravi un vrai sommet', 'payé une salle de sport sans jamais y aller']],
    ['Téléphone & internet', ['scrollé jusqu’au lever du soleil', 'envoyé un message à la mauvaise personne', 'acheté une contrefaçon en ligne', 'fait un live sur les réseaux']],
    ['L’enfance', ['fait une fugue', 'cassé un jouet et caché les morceaux', 'dessiné sur les murs', 'piqué des bonbons avant le dîner']],
    ['Les animaux', ['eu un animal de compagnie', 'fait du cheval', 'touché un serpent', 'été piqué par une abeille']],
    ['Moments gênants', ['trébuché devant tout le monde', 'appelé quelqu’un par le mauvais prénom', 'fait coucou à quelqu’un qui ne me saluait pas', 'porté mon pull à l’envers toute la journée']],
    ['Les amis', ['oublié l’anniversaire de mon meilleur ami', 'porté la même tenue qu’un ami', 'discuté avec un ami jusqu’à l’aube', 'gardé le secret d’un ami pendant des années']],
    ['Les transports', ['conduit un scooter', 'pris le mauvais bus', 'oublié où j’avais garé la voiture', 'dormi jusqu’au terminus']],
    ['Les talents', ['appris un instrument', 'joué sur scène', 'chanté au karaoké devant des inconnus', 'dansé devant tout le monde']],
    ['À la maison', ['cuisiné pour une grande tablée', 'fait rétrécir un vêtement au lavage', 'brûlé une casserole', 'monté un meuble tout seul']],
    ['Films & séries', ['pleuré devant un film', 'regardé une série entière en un jour', 'dormi au cinéma', 'regardé un match en pleine nuit']],
    ['Les défis', ['fait des montagnes russes', 'vu un film seul au cinéma', 'abordé un inconnu', 'fait du saut à l’élastique']],
    ['La météo', ['affronté une tempête dehors', 'fait un bonhomme de neige', 'pris une averse sans parapluie', 'attrapé un coup de soleil']],
    ['Tour libre', ['fait tomber mon téléphone dans l’eau', 'chanté fort en public', 'commandé le mauvais plat et tout mangé quand même', 'reçu une lettre écrite à la main'], 'free'],
  ],

  endGame: 'Plus qu’une main levée ? Maintenir pour terminer',
  againButton: 'Rejouer',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'La partie reprend depuis le début, avec de nouveaux thèmes.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer à « Je n’ai jamais »',
  rulesIntro: 'Tout le monde lève une main et, chacun son tour, dit une chose qu’il n’a jamais faite. Ceux qui l’ont déjà faite baissent un doigt ; cinq doigts baissés, c’est l’élimination. Le dernier à garder des doigts levés gagne. Pas besoin de matériel : le téléphone tire un thème et propose des exemples à chaque tour.',
  rulesFacts: [
    ['Joueurs', '3 à 15'],
    ['Durée', '10 à 20 minutes'],
    ['Matériel', 'Rien, juste le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Déroulement',
  rulesHowSteps: [
    'Asseyez-vous en cercle. Tout le monde lève une main, les cinq doigts écartés.',
    'Le téléphone tire un thème, par exemple « L’école », et pendant ce tour on ne parle que de ça. Sur un « Tour libre », tout est permis.',
    'En commençant par l’animateur, chacun dit une chose qu’il n’a jamais faite, par exemple « Je n’ai jamais dormi en cours ». Ça doit être vrai.',
    'Ceux qui l’ont déjà faite baissent un doigt ; celui qui parle, non. Cinq doigts baissés : éliminé.',
    'Quand tout le monde a parlé, « Tour suivant » donne un nouveau thème. Le dernier à garder des doigts levés devient le roi et désigne quelqu’un pour la machine action ou vérité.',
  ],
  rulesDidHeading: 'À l’envers : « J’ai déjà »',
  rulesDidIntro: 'Choisissez « J’ai déjà » au début, et les règles s’inversent :',
  rulesDidSteps: [
    'Chacun son tour dit une chose qu’il a déjà faite, par exemple « J’ai déjà vu un film seul au cinéma ».',
    'Ceux qui ne l’ont jamais faite baissent un doigt. Cinq doigts baissés : éliminé.',
    'Moins il y a de gens qui l’ont fait, mieux c’est — le dernier à garder des doigts levés gagne.',
  ],
  rulesTopicsHeading: 'Thèmes et exemples',
  rulesTopicsIntro: 'À chaque tour, le téléphone tire un de ces thèmes, avec un exemple pour ceux qui sèchent :',
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'Tout le monde lève une main ! Chacun son tour, on dit une chose qu’on n’a jamais faite. Si vous l’avez déjà faite, baissez un doigt — cinq doigts baissés, c’est fini, et le dernier à garder des doigts levés gagne. Le thème de ce tour : « Les voyages ». Je commence : je n’ai jamais voyagé seul à l’étranger !',
  rulesLeadSteps: [
    'Au premier tour, commencez vous-même avec une chose que beaucoup ont déjà faite : tout le monde comprend tout de suite.',
    'Vous voulez qu’une personne baisse un doigt ? Dites une chose que tout le monde a faite sauf elle — ça fait toujours rire.',
    'En grand groupe, jouez avec trois doigts au lieu de cinq pour aller plus vite.',
  ],
  rulesBack: '← Retour au jeu',
};
