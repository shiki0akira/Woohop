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
  // 遊戲內頂欄左上角的返回鍵（只給螢幕閱讀器念，畫面上是箭頭）
  // 遊戲內頂欄的「設定」分頁（裡面是自訂題目）
  settingsTab: 'Réglages',
  gameBack: 'Retour',
  leaveTitle: 'Terminer cette manche ?',
  leaveDesc: 'La bombe tourne encore. Si tu pars maintenant, cette manche est perdue.',
  leaveConfirm: 'Terminer la manche',
  leaveCancel: 'Continuer',

  // ---------- page des règles ----------
  rulesTitle: 'Comment jouer à la bombe à retardement',
  rulesIntro: "Un téléphone fait le tour du cercle. Un défi s’affiche, tu le fais, tu passes. Personne ne sait quand la bombe explose : celui qui la tient perd.",
  // 一眼看到的三件事：人數、時間、要準備什麼
  rulesFacts: [["Joueurs","4 à 15"],["Il faut","Un téléphone et un cercle de joueurs"]],
  // 引爆時間依人數建議（對應設定畫面那三顆區間）
  rulesTimeLabel: "Quelle durée choisir ?",
  rulesTimeGuide: [["4 à 6 joueurs","30 s – 2 min"],["7 à 10 joueurs","1 à 3 min"],["11 à 15 joueurs","3 à 6 min"]],
  rulesTimeNote: "Plus vous êtes nombreux, plus un tour de cercle est long. 3 à 5 manches prennent environ 10 minutes.",
  rulesHowHeading: "Comment jouer",
  rulesHowSteps: [
    "Choisis les défis : questions, actions, ou les deux.",
    "Appuie sur « C’est parti » et donne le téléphone au premier joueur.",
    "Lis le défi, fais-le, appuie sur « Terminé » et passe le téléphone.",
    "Quand la bombe explose, celui qui tient le téléphone perd la manche.",
  ],
  rulesLeadHeading: "Comment animer",
  // 主持人開場照著念的一句（畫面上是「照著念」卡片），底下是小提醒
  rulesLeadSay: "Faites ce qui est écrit à l’écran, puis passez le téléphone. Celui qui le tient quand ça explose a perdu !",
  rulesLeadSteps: [
    "Avec des nouveaux, commence par les questions ; ajoute les actions ensuite.",
    "Si quelqu’un bloque, lance « Suivant ! » pour garder le rythme.",
    "Pas besoin de gage : appuie simplement sur « On rejoue ».",
  ],
  rulesBack: '← Retour au jeu',
};
