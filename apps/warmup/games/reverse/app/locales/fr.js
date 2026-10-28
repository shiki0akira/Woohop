/*
 * Français. Mêmes clés et mêmes longueurs de listes que zh-TW (le build vérifie).
 * Pas de jeu français établi pour ça : un nom qui se comprend tout seul (CONCEPT.md section 4). Des mots du quotidien en France.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Défi à l’envers | Passer sa voix à l’envers, l’imiter, la remettre à l’endroit et deviner',
  seoDesc:
    'Quelqu’un enregistre une phrase, le téléphone la joue à l’envers, et tout le monde imite ce charabia – puis on remet l’imitation à l’endroit pour deviner ce qui a été dit. Le téléphone donne les consignes (phrase, fredonner, libre) ; on peut se passer un seul téléphone ou faire la course chacun sur le sien. Sans appli ni inscription, les enregistrements restent sur ton téléphone.',
  rulesSeoTitle: 'Comment jouer au Défi à l’envers : règles et conseils pour l’animateur',
  rulesSeoDesc: 'Les règles du Défi à l’envers : combien de joueurs, comment donner une consigne, comment imiter le son à l’envers, chacun son tour ou en mode course, et un texte que l’animateur peut lire tel quel.',

  navTitle: 'Défi à l’envers',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'Défi à l’envers : on passe à l’envers, on imite, on remet à l’endroit',
  heroDesc: 'Enregistre une phrase et le téléphone la joue à l’envers – on dirait une langue extraterrestre. Imite ce charabia, remets-le à l’endroit, et voyons qui devine la phrase en premier !',

  lead: {
    setup: ['Nombre de joueurs', 'On joue au Défi à l’envers ! Quelqu’un enregistre une phrase, le téléphone la passe à l’envers, et on essaie tous de l’imiter – puis on la remet à l’endroit pour entendre ce qui a vraiment été dit.'],
    rules: ['Les règles', 'On donne une consigne chacun son tour : on regarde la consigne en cachette et on enregistre une phrase. Le téléphone la passe à l’envers pour tout le monde. Ensuite, on imite ce son bizarre, on le remet à l’endroit et on devine la phrase !'],
    end: ['C’est fini !', 'Bravo pour les imitations ! Qui était le plus proche, qui a deviné en premier ? Pour une autre partie, appuie sur « Rejouer ».'],
  },
  ruleCards: [
    ['Regarder et enregistrer', 'La personne dont c’est le tour tire une consigne : faire une phrase avec un mot, fredonner une chanson ou dire ce qu’on veut. Le téléphone retourne l’enregistrement.'],
    ['Imiter le charabia', 'Écoutez le son à l’envers, répétez-le pareil et enregistrez-le, puis remettez-le à l’endroit – c’est étonnamment proche de l’original.'],
    ['Deviner la phrase', 'Bloqués ? Regardez l’indice, puis écoutez l’original pour la réponse. La personne suivante donne la consigne d’après.'],
  ],
  rulesNext: 'Suivant : on joue',

  startButton: 'Commencer',
  countLabel: 'Joueurs',
  countLess: 'Un joueur de moins',
  countMore: 'Un joueur de plus',
  perLabel: 'Consignes chacun',
  per1: '1',
  per2: '2',
  perFree: 'Illimité',
  roundsHint: '{total} manches : chacun son tour donne une consigne, puis c’est fini.',
  roundsFreeHint: 'Illimité : jouez autant que vous voulez, puis maintenez « Terminer » appuyé.',
  modeLabel: 'Deviner',
  modeOne: 'Chacun son tour',
  modeEach: 'Course',
  modeOneHint: 'Un seul téléphone suffit : après l’enregistrement, on le passe à la personne suivante qui imite et remet à l’endroit.',
  modeEachHint: 'Tout le monde scanne le QR code pour ouvrir l’enregistreur, imite et remet à l’endroit – le premier qui trouve le crie !',
  recOnlyLink: 'Je devine – juste l’enregistreur',

  kindNames: { sentence: 'Phrase', hum: 'Fredonner', free: 'Libre' },
  sentenceTask: 'Dis une phrase avec « {word} »',
  roundNo: 'Manche {n} / {total}',
  roundNoFree: 'Manche {n}',
  turnWho: 'Au tour du joueur {k}',
  drawButton: 'Tirer une consigne',
  drawHint: 'Seule la personne dont c’est le tour regarde !',
  revealHint: 'Retenu ? Cache-la 👇',
  coverButton: 'Cacher',
  cardShuffle: 'Une autre',
  coveredText: 'Consigne cachée',
  peekAgain: 'Revoir',
  hintButton: 'Indice',
  hintLine: 'Indice : {hint}',
  hintWord: '« {word} »',
  answerButton: 'Réponse',
  prompts: {
    sentence: [
      // noms
      'banane', 'croissant', 'orage', 'extraterrestre', 'pizza', 'métro', 'baguette', 'chaton', 'dinosaure', 'glace',
      'brosse à dents', 'réveil', 'gâteau d’anniversaire', 'vélo', 'parapluie', 'ananas', 'crêpe', 'concert', 'café', 'pingouin',
      'téléphone', 'maîtresse', 'super-héros', 'ascenseur', 'pastèque', 'Père Noël', 'hamburger', 'panda', 'plage', 'arc-en-ciel',
      'sèche-cheveux', 'fromage', 'frigo', 'robot', 'chocolat',
      // verbes
      'nager', 'éternuer', 'danser', 'dormir', 'se brosser les dents', 'prendre une douche', 'chanter', 'se perdre', 'téléphoner', 'faire la queue',
      'faire un régime', 'être en retard', 'prendre un selfie', 'se disputer', 'déménager',
      // adjectifs et sensations
      'en colère', 'fatigué', 'affamé', 'gelé', 'super content', 'stressé', 'gêné', 'épuisé', 'délicieux', 'beaucoup trop épicé',
      'timide', 'ennuyé',
      // situations
      'dans le métro', 'au premier rendez-vous', 'le week-end', 'un jour de pluie', 'la veille d’un examen', 'le soir du Nouvel An', 'au marché', 'le jour de mon anniversaire', 'à trois heures du matin', 'le lundi matin',
      // mots de liaison
      'mais', 'si', 'parce que', 'même si', 'pendant que', 'de plus en plus', 'non seulement… mais aussi', 'soudain', 'enfin', 'en fait',
      'dès que', 'pourtant',
    ],
    hum: ['Fredonne une comptine', 'Fredonne un tube que tout le monde connaît', 'Fredonne un générique ou un jingle de pub', 'Fredonne une chanson que tu écoutes beaucoup en ce moment'],
    free: ['Dis ce que tu as le plus envie de dire aujourd’hui', 'Dis un virelangue', 'Dis ton expression préférée', 'Cite une réplique de film ou de dessin animé'],
  },

  recordHeading: 'Enregistre ta consigne',
  recordHint: 'Dis une phrase pour ta consigne (15 secondes max). Ensuite, tout le monde devine.',
  guessHeading: 'Faire écouter à tout le monde',
  guessHint: 'Écoutez bien – vous pouvez la repasser autant de fois que vous voulez.',
  askReverse: 'À l’envers',
  redoLink: 'Pas content ? Recommencer',
  stageCopy: 'La personne suivante imite',
  stageCopyOne: 'Passe le téléphone : écoute le son à l’envers, répète-le pareil, puis appuie sur « Remettre à l’endroit » et devine la phrase.',
  copyMine: 'Mon imitation',
  copyReverse: 'Remettre à l’endroit',
  qrAlt: 'QR code qui ouvre l’enregistreur',
  stuckHeading: 'Bloqués ?',
  nextLocked: 'Écoutez l’original avec « Réponse » avant de passer à la suite.',
  nextRound: 'Manche suivante',
  lastRound: 'Terminé – voir la fin',
  // 要按住才會結束，防手滑（跟果園菜園動物園、竹筍同一個做法）
  endGame: 'Maintenir pour terminer',
  againButton: 'Rejouer',

  recOnlyTitle: 'Enregistreur à l’envers',
  recOnlyDesc: 'Enregistre le son à l’envers ou ton imitation, puis appuie sur « À l’envers ».',
  recOnlyMine: 'Original',
  recOnlyReverse: 'À l’envers',
  recOnlyBack: '← Je veux donner une consigne',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'L’enregistrement de cette manche sera effacé.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer au Défi à l’envers',
  rulesIntro: 'Chacun son tour, on donne une consigne : on enregistre une phrase, le téléphone la joue à l’envers. Les autres imitent ce charabia, le remettent à l’endroit et devinent ce qui a été dit.',
  rulesFacts: [
    ['Joueurs', '2 à 20'],
    ['Durée', 'Une consigne chacun, ou aussi longtemps que vous voulez'],
    ['Matériel', 'Un téléphone ; en grand groupe, chacun peut faire la course sur le sien'],
  ],
  rulesHowHeading: 'Comment jouer',
  rulesHowSteps: [
    'Chacun son tour. À ton tour, tire une consigne sur le téléphone : faire une phrase avec un mot, fredonner une chanson ou dire ce que tu veux.',
    'Cache la consigne, appuie sur « Enregistrer » (15 secondes max), puis sur « À l’envers » pour la faire écouter.',
    'Chacun son tour : passe le téléphone, la personne suivante répète le son à l’envers et appuie sur « Remettre à l’endroit ». Course (4 joueurs et plus) : tout le monde scanne le QR code, imite, remet à l’endroit – le premier qui trouve le crie.',
    'Bloqués ? Regardez l’indice, puis appuyez sur « Réponse » pour écouter l’original. La personne suivante donne la consigne ; la partie se termine quand tout le monde est passé.',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'Quelqu’un va enregistrer une phrase et le téléphone va la jouer à l’envers – on dirait une langue extraterrestre. Imitez ce son exactement, remettez-le à l’endroit et devinez ce qui a vraiment été dit ! Chacun donnera une consigne à son tour.',
  rulesLeadSteps: [
    'Donne la première consigne toi-même : après une démo, tout le monde a compris.',
    'Les phrases courtes sont plus faciles à imiter : 3 à 5 secondes, c’est parfait. Plus long, personne ne trouve à l’envers.',
    'Pas de gêne en imitant : plus c’est bizarre, plus c’est drôle remis à l’endroit.',
  ],
  rulesBack: '← Retour au jeu',
};
