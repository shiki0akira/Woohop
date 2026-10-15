/*
 * Français. La liste des clés doit correspondre exactement à celle de zh-TW
 * (scripts/build.js, checkStrings). {n} {m} {s} {time} sont des variables : à conserver telles quelles.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Bombe à retardement | On se passe le téléphone : celui qui l’a quand ça explose a perdu',
  seoDesc:
    'Un brise-glace pour petits groupes, groupes de jeunes et réunions de famille. Un seul téléphone sert de bombe : on le fait tourner, on réalise le défi affiché, on appuie sur Terminé et on le passe. Personne ne sait quand ça explose — celui qui l’a en main a perdu la manche. 90 questions et défis inclus, et vous pouvez ajouter les vôtres. Sans téléchargement ni inscription, il suffit d’ouvrir la page.',
  rulesSeoTitle: 'Bombe à retardement — comment jouer',
  rulesSeoDesc:
    'Régler la mèche, choisir les catégories, ajouter ses propres défis, et les trois phrases à dire avant de commencer.',

  navTitle: 'Bombe à retardement',
  navRules: 'Règles',
  rulesLinkText: 'C’est la première fois ? Voici comment ça marche →',
  langSwitchLabel: 'Changer de langue',
  themeToggleLabel: 'Basculer clair / sombre',

  heroTitle: 'Bombe à retardement : fais le défi et passe vite',
  heroDesc:
    'Un seul téléphone pour tout le groupe — et ce téléphone, c’est la bombe. Un défi s’affiche, celui qui l’a en main le réalise, appuie sur Terminé et le passe à son voisin. Personne ne sait quand ça explose. Celui qui l’a à ce moment-là a perdu la manche.',

  // ---------- réglages ----------
  timerHeading: 'Longueur de la mèche',
  timerHint:
    'L’explosion tombe à un instant aléatoire dans cet intervalle. Le temps restant n’est jamais affiché.',
  minTimeLabel: 'Au moins',
  maxTimeLabel: 'Au plus',
  timerCustomToggle: 'Intervalle personnalisé',
  secondsUnit: '{n} s',
  minutesUnit: '{n} min',
  timeRange: '{min}–{max}',

  questionsHeading: 'Défis',
  deckCount: '{n} dans la pioche',
  groupAsk: 'Questions',
  groupDare: 'Actions',
  catCount: '{n} défis',

  deckEmptyWarning: 'Choisis au moins une catégorie pour commencer.',
  deckThinWarning: 'Seulement {n} dans la pioche : des défis peuvent revenir dans une même manche.',

  customLabel: 'Vos propres défis',
  customPlaceholder: 'ex. : dis ton plat préféré',
  customCategoryLabel: 'À classer dans',
  customAddButton: 'Ajouter',
  customDoneButton: 'Terminé',
  customEmpty: 'Tu n’as encore ajouté aucun défi.',
  customRemoveLabel: 'Supprimer ce défi',
  customHint: 'Tes défis restent sur cet appareil et seront encore là la prochaine fois.',

  startButton: 'C’est parti',

  // ---------- en jeu ----------
  passButton: 'Terminé ! Au suivant',
  skipButton: 'Autre défi',
  playHint: 'Fais ce qui est affiché, appuie sur Terminé, puis passe le téléphone.',
  stuckHint: 'Tu bloques ? Appuie sur « Autre défi » — ne garde pas la bombe.',
  bombAlt: 'Bombe',

  // ---------- explosion ----------
  boomTitle: 'Boum !',
  boomStats: 'Cette manche : {time}, {done} réussies',
  boomStatsWithSkips: 'Cette manche : {time}, {done} réussies, {skipped} passées',
  durationMinSec: '{m} min {s} s',
  durationSec: '{s} s',
  againButton: 'On rejoue',
  backToSetupButton: 'Changer les réglages',

  // ---------- quitter en cours ----------
  leaveTitle: 'Terminer cette manche ?',
  leaveDesc: 'La bombe tourne encore. Si tu pars maintenant, cette manche est perdue.',
  leaveConfirm: 'Terminer la manche',
  leaveCancel: 'Continuer',

  // ---------- page des règles ----------
  rulesTitle: 'Comment jouer à la bombe à retardement',
  rulesIntro:
    'Un téléphone, tout le monde en cercle. Un défi s’affiche, celui qui a le téléphone le réalise puis le passe. La bombe explose à un instant aléatoire et le temps restant n’est jamais affiché. Celui qui l’a alors en main perd la manche.',
  rulesHostHeading: 'Avant de commencer (celui qui sort le téléphone)',
  rulesHostSteps: [
    'Choisis Questions, Actions, ou les deux. Beaucoup de nouveaux ? Commence avec Questions seulement.',
    'Envie d’y glisser vos private jokes ? Ajoute-en quelques-uns via « Vos propres défis » et classe-les d’un côté.',
    'Règle la mèche. Pour une première manche, les 1 à 3 minutes par défaut vont très bien ; une fois l’ambiance lancée, essaie 30 secondes à 2 minutes.',
    'Dis trois phrases pour lancer : fais ce qui est affiché, appuie sur Terminé et passe, celui qui l’a quand ça explose perd la manche.',
  ],
  rulesPlayerHeading: 'Quand le téléphone arrive dans tes mains',
  rulesPlayerSteps: [
    'Lis le défi et fais-le sur-le-champ — dire une phrase, imiter un animal, taper dans la main de la personne en face.',
    'Appuie sur la barre du bas : « Terminé — au suivant ».',
    'Passe le téléphone à ton voisin.',
    'Tu n’y arrives pas ? Appuie sur Terminé et passe. Il n’y a pas de points, ce n’est pas un quiz.',
  ],
  rulesFaqHeading: 'Questions fréquentes',
  rulesFaq: [
    {
      q: 'Il faut un téléphone par personne ?',
      a: 'Non. Tout le jeu tient sur un seul téléphone : c’est lui la bombe, et il tourne dans le cercle. C’est différent des autres jeux de la série, où chacun rejoint un salon en scannant un QR code.',
    },
    {
      q: 'On voit le temps restant ?',
      a: 'Pas une seconde, et c’est voulu : avec un compte à rebours visible, plus personne ne prendrait le téléphone dans les dix dernières secondes et le jeu s’arrêterait. La vitesse du tic-tac n’indique pas non plus si l’explosion approche.',
    },
    {
      q: 'On peut passer un défi qu’on n’arrive pas à faire ?',
      a: 'Oui, appuie simplement sur Terminé. Il n’y a pas de score et personne ne compte les défis sautés.',
    },
    {
      q: 'On peut ajouter nos propres défis ?',
      a: 'Oui. Passe par « Vos propres défis » sur l’écran des réglages et classe-le dans une catégorie : il sera encore là la prochaine fois. Tout reste sur cet appareil et n’est jamais envoyé ailleurs.',
    },
    {
      q: 'Se passer un téléphone de main en main me gêne un peu.',
      a: 'Glisse-le dans un sachet zip, ou utilise un vieux téléphone de secours comme bombe.',
    },
    {
      q: 'Et si l’écran se verrouille en pleine manche ?',
      a: 'Le jeu empêche la mise en veille pendant la partie. Si la page passe quand même en arrière-plan, tout est recalculé dès le retour : si la mèche s’est terminée entre-temps, tu tombes directement sur l’explosion.',
    },
    {
      q: 'Le perdant doit faire quoi ?',
      a: 'À vous de décider, l’appli n’impose rien. Tout le monde a vu qui l’avait en main.',
    },
  ],
  rulesBack: '← Retour au jeu',
};
