/*
 * Français. En français, les « charades » sont des devinettes de mots : le jeu où l’on mime s’appelle « jeu de mimes ».
 * Les mots sont choisis pour un public francophone, pas traduits ; les « expressions » sont des expressions françaises
 * qu’on peut mimer. Les indices dévoilent des lettres.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Jeu de mimes | Générateur de mots à mimer sur téléphone, avec indices',
  seoDesc:
    'Les mots à mimer, c’est le téléphone qui les donne : animaux, métiers, sports, vie quotidienne, nourriture, transports, objets, situations drôles et expressions – des centaines de mots, catégories au choix. Chacun son tour, on mime sans un mot jusqu’à ce que quelqu’un trouve ; on peut passer un mot impossible, et donner des indices quand tout le monde sèche. Sans appli, sans inscription – pour les soirées, les team buildings et les repas de famille.',
  rulesSeoTitle: 'Comment jouer au jeu de mimes : règles, catégories et conseils',
  rulesSeoDesc: 'Les règles du jeu de mimes : nombre de joueurs, tour de rôle, ce qui est interdit, quand une réponse compte, et un texte que l’animateur peut lire tel quel.',

  navTitle: 'Jeu de mimes',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'Jeu de mimes : tirez un mot et mimez-le, sans parler !',
  heroDesc: 'Chacun son tour, on tire un mot sur le téléphone et on le mime sans un mot pendant que les autres devinent. On peut passer les mots impossibles, et donner des indices quand tout le monde sèche – celui qui trouve gagne un point !',

  lead: {
    setup: ['C’est parti', 'On joue au jeu de mimes ! D’abord, on règle le nombre de joueurs, on choisit les catégories du jour, et on se met en cercle.'],
    rules: ['Les règles', 'Chacun son tour, on prend le téléphone et on tire un mot, puis on le mime : pas de paroles, pas de bruits, pas de mots articulés en silence. Les autres proposent des réponses jusqu’à ce que quelqu’un trouve, et celui-là gagne un point. Avant de commencer, on peut passer un mot ; après, le mot est caché, et si personne ne trouve, on peut donner un indice : la catégorie ou une lettre de la réponse. Celui qui a le plus de points gagne !'],
    end: ['Fin de la partie !', 'Comptez combien vous en avez trouvé – celui qui en a le plus gagne !'],
  },
  ruleCards: [
    ['Chacun son tour', 'Celui qui joue prend le téléphone et tire un mot. Ne le montre à personne !'],
    ['Mimer sans parler', 'Pas de paroles, pas de bruits, pas de mots articulés, et on ne montre rien dans la pièce.'],
    ['Trouvé, un point', 'On continue jusqu’à ce que quelqu’un trouve : le premier gagne un point. On sèche ? Un indice.'],
  ],
  rulesNext: 'Suivant : on commence',

  categoryLabel: 'Catégories',
  categoryHint: 'Autant que tu veux (au moins une)',
  countLabel: 'Nombre de joueurs',
  countLess: 'Un joueur de moins',
  countMore: 'Un joueur de plus',
  perLabel: 'Mots par joueur',
  per1: '1',
  per2: '2',
  perFree: 'Illimité',
  roundsHint: '{total} mots en tout – chacun son tour, et la partie s’arrête quand ils sont tous passés.',
  roundsFreeHint: 'Illimité – maintiens « Terminer » appuyé pour finir.',
  startButton: 'Lancer la partie',

  roundNo: 'Mot {n} sur {total}',
  roundNoFree: 'Mot {n}',
  turnWho: 'Au tour du joueur {k}',
  drawButton: 'Tirer un mot',
  drawHint: 'À toi ! Tire un mot – ne le montre à personne',
  startActing: 'C’est parti !',
  skipButton: 'Un autre mot',
  gotIt: 'Trouvé !',
  peekButton: 'Revoir',
  continueActing: 'Continuer !',
  hintKindButton: 'Donner la catégorie',
  hintCharButton: 'Donner une lettre',
  gotItResult: 'Trouvé !',
  gotItHint: 'Celui qui a trouvé gagne un point – retenez vos scores !',
  answerIs: 'La réponse était',
  nextTurn: 'Au suivant',
  seeResult: 'Voir le résultat',
  endGame: 'Maintenir pour terminer',
  againButton: 'Rejouer',

  categories: [
    ['animals', 'Animaux', [
      'Kangourou', 'Pingouin', 'Éléphant', 'Girafe', 'Singe', 'Crabe', 'Pieuvre', 'Serpent', 'Grenouille', 'Lapin',
      'Hibou', 'Paon', 'Crocodile', 'Koala', 'Dauphin', 'Papillon', 'Abeille', 'Coq', 'Tortue', 'Lion',
      'Aigle', 'Écureuil', 'Hérisson', 'Moustique', 'Requin', 'Gorille', 'Hippopotame', 'Chauve-souris', 'Araignée', 'Autruche',
      'Phoque', 'Panda', 'Paresseux', 'Escargot', 'Pic-vert', 'Flamant rose', 'Caméléon', 'Poule',
    ]],
    ['jobs', 'Métiers', [
      'Dentiste', 'Magicien', 'Agent de la circulation', 'Cuisinier', 'Coiffeur', 'Pompier', 'Photographe', 'Hôtesse de l’air', 'Chef d’orchestre', 'Livreur',
      'Coach sportif', 'Peintre', 'Chauffeur de bus', 'Jardinier', 'Médecin', 'Professeur', 'Présentateur télé', 'Vigile', 'Boxeur', 'DJ',
      'Voyante', 'Pilote', 'Pêcheur', 'Vétérinaire', 'Astronaute', 'Détective', 'Clown', 'Agriculteur', 'Menuisier', 'Garagiste',
      'Barman', 'Guide touristique', 'Pom-pom girl', 'Mannequin', 'Chanteur', 'Boulanger', 'Maître-nageur', 'Mariée',
    ]],
    ['sports', 'Sports', [
      'Natation', 'Tir à l’arc', 'Boxe', 'Saut en hauteur', 'Ping-pong', 'Badminton', 'Basket', 'Football', 'Bowling', 'Golf',
      'Aviron', 'Ski', 'Surf', 'Patin à glace', 'Haltérophilie', 'Plongeon', 'Escrime', 'Corde à sauter', 'Vélo', 'Yoga',
      'Escalade', 'Baseball', 'Tennis', 'Volley', 'Sumo', 'Saut en longueur', 'Saut à la perche', 'Lancer de poids', 'Javelot', 'Équitation',
      'Judo', 'Gymnastique', 'Patinage artistique', 'Plongée avec tuba', 'Skateboard', 'Hula hoop', 'Tir à la corde', 'Pétanque',
    ]],
    ['daily', 'Vie quotidienne', [
      'Se brosser les dents', 'Métro bondé', 'Mettre un imperméable', 'Faire un selfie', 'Éternuer', 'Faire ses lacets', 'Se sécher les cheveux', 'Faire la vaisselle', 'Jouer aux jeux vidéo', 'Étendre le linge',
      'Sortir les poubelles', 'Courir après le bus', 'Masque de beauté', 'Les soldes', 'S’endormir en classe', 'Monter sur la balance', 'Ouvrir un bocal', 'Se couper les ongles', 'Chercher ses clés', 'Repasser',
      'Ouvrir un parapluie', 'Écraser un moustique', 'Se gratter le dos', 'Se regarder dans le miroir', 'Passer la serpillière', 'Se maquiller', 'Se raser', 'Faire son lit', 'Arroser les plantes', 'Promener le chien',
      'Bâiller', 'S’étirer', 'Faire défiler son téléphone', 'Faire un créneau', 'Taper au clavier', 'Mettre ses lentilles',
    ]],
    ['food', 'Nourriture', [
      'Manger des spaghettis', 'Éplucher une banane', 'Boire un bubble tea', 'Manger une pastèque', 'Faire un barbecue', 'Manger une glace', 'Décortiquer un homard', 'Croquer un piment', 'Faire une pizza', 'Griller des chamallows',
      'Manger un épi de maïs', 'Souffler les bougies', 'Boire une soupe brûlante', 'Manger une baguette', 'Faire sauter une crêpe', 'Faire un œuf au plat', 'Éplucher une orange', 'Manger un croissant', 'Aspirer des nouilles', 'Manger du pop-corn',
      'Couper des oignons', 'Ouvrir une canette', 'Manger des sushis', 'Raclette', 'Croquer un citron', 'Boire un café', 'Manger un gâteau', 'Mâcher un chewing-gum', 'Manger un hot-dog', 'Lécher une sucette',
      'Fondue au fromage', 'Ouvrir des huîtres', 'Secouer un milk-shake', 'Manger des escargots',
    ]],
    ['vehicles', 'Transports', [
      'Faire de la moto', 'Conduire une voiture', 'Prendre l’avion', 'Prendre le train', 'Faire du vélo', 'Pagayer en kayak', 'Piloter un bateau', 'Prendre l’ascenseur', 'Faire des montagnes russes', 'Monter à cheval',
      'Char d’assaut', 'Montgolfière', 'Hélicoptère', 'Monocycle', 'Téléphérique', 'Conduire une pelleteuse', 'Trottinette', 'Pousser une poussette', 'Camion de pompiers', 'Manège',
      'Sous-marin', 'Escalator', 'Héler un taxi', 'Conduire un camion', 'Monter à dos de chameau', 'Décollage de fusée', 'Pousser un caddie', 'Ambulance', 'Faire de la luge', 'Tracteur',
    ]],
    ['objects', 'Objets', [
      'Parapluie', 'Sèche-cheveux', 'Aspirateur', 'Brosse à dents', 'Lampe de poche', 'Jumelles', 'Ciseaux', 'Agrafeuse', 'Réveil', 'Perche à selfie',
      'Ventilateur', 'Micro-ondes', 'Machine à laver', 'Miroir', 'Peigne', 'Oreiller', 'Serpillière', 'Balai', 'Tapette à mouches', 'Briquet',
      'Appareil photo', 'Casque audio', 'Micro', 'Clavier', 'Télécommande', 'Casque de vélo', 'Valise', 'Hamac', 'Yo-yo', 'Cerf-volant',
      'Lance-pierre', 'Canne à pêche', 'Arc et flèches', 'Canne', 'Parachute', 'Bougie', 'Cloche', 'Horloge',
    ]],
    ['scenes', 'Situations drôles', [
      'Glisser sur une peau de banane', 'Se faire piquer par un moustique', 'Manger un truc très piquant', 'Quelqu’un a pété dans l’ascenseur', 'Renverser son verre', 'Un caillou dans la chaussure', 'Être frappé par la foudre', 'Glisser sur le verglas', 'Ne pas trouver les toilettes', 'Se réveiller en retard',
      'Être poursuivi par un chien', 'Fermeture éclair cassée', 'Téléphone tombé dans les toilettes', 'Se brûler la langue avec la soupe', 'Se coincer la main dans la porte', 'Se cogner contre un lampadaire', 'Hoquet qui ne s’arrête pas', 'Jambe engourdie', 'Pas d’eau chaude sous la douche', 'Cheveux décoiffés par le vent',
      'Le patron te surprend à glander', 'Regarder un film d’horreur', 'Gagner au loto', 'Tricher à un examen', 'Premier rendez-vous', 'Se perdre', 'Pull à l’envers', 'Attraper un voleur', 'Recevoir une fiente d’oiseau', 'Premier rang au concert',
    ]],
    ['idioms', 'Expressions', [
      'Briser la glace', 'Avoir un poil dans la main', 'Poser un lapin', 'Coûter les yeux de la tête', 'Tomber dans les pommes', 'Avoir le cafard', 'Mettre les pieds dans le plat', 'Avoir la tête dans les nuages', 'Donner sa langue au chat', 'Casser les pieds',
      'Se lever du pied gauche', 'Faire la grasse matinée', 'Pleuvoir des cordes', 'Avoir un chat dans la gorge', 'Être dans la lune', 'Tourner autour du pot', 'Mettre la main à la pâte', 'Avoir les dents longues', 'Prendre ses jambes à son cou', 'Être muet comme une carpe',
      'Faire d’une pierre deux coups', 'Avoir des fourmis dans les jambes', 'Avoir la chair de poule', 'Mener quelqu’un en bateau', 'Tirer les vers du nez', 'Se creuser la tête', 'Être sur son trente-et-un', 'Rire jaune', 'Avoir le cœur sur la main', 'Couper la poire en deux',
    ]],
  ],

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'La partie recommence depuis le début.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer au jeu de mimes',
  rulesIntro: 'Chacun son tour, on mime sans parler le mot affiché sur le téléphone. Les autres devinent, celui qui trouve gagne un point, et celui qui a le plus de points gagne.',
  rulesFacts: [
    ['Joueurs', '2 à 30'],
    ['Durée', 'Selon le nombre de mots – 6 joueurs avec 1 mot chacun, environ 10 minutes'],
    ['Matériel', 'Le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Déroulement',
  rulesHowSteps: [
    'Réglez le nombre de joueurs et de mots par joueur, puis choisissez les catégories (animaux, métiers, sports, vie quotidienne, nourriture, transports, objets, situations drôles, expressions – autant que vous voulez).',
    'Mettez-vous en cercle. Le premier joueur prend le téléphone et tire un mot sans le montrer.',
    'Appuyez sur « C’est parti ! » et mimez : pas de paroles, pas de bruits, pas de mots articulés, et on ne montre rien dans la pièce.',
    'Les autres proposent des réponses jusqu’à ce que quelqu’un trouve ; le premier gagne un point et celui qui mime appuie sur « Trouvé ! ». Un mot impossible ? On peut le passer avant de commencer.',
    'Une fois lancé, le mot est caché et on ne voit que le nombre de lettres – reviens en arrière pour le revoir. Si tout le monde sèche, donne un indice : « Donner la catégorie » ou « Donner une lettre », puis montre le téléphone. Quand tous les mots sont passés, celui qui a le plus de points gagne.',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'On joue au jeu de mimes ! Chacun son tour, on mime le mot du téléphone, sans parler et sans bruit. Les autres devinent, et le premier qui trouve gagne un point, alors retenez vos scores. On peut passer un mot impossible, et donner un indice si on sèche. Celui qui a le plus de points gagne !',
  rulesLeadSteps: [
    'Pour un premier tour, prenez juste « Animaux » et « Vie quotidienne », puis ajoutez « Expressions » et « Situations drôles » une fois que tout le monde est chaud.',
    'C’est celui qui mime qui décide qui a trouvé en premier ; si deux personnes crient en même temps, les deux marquent.',
    'Le téléphone ne compte pas les points – comptez vous-mêmes. Envie d’un gage ? Le dernier tire une « Carte mime » dans les « Outils de soirée jeux ».',
  ],
  rulesBack: '← Retour au jeu',
};
