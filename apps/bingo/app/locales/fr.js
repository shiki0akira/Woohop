/*
 * Français. Le contexte est le petit groupe / groupe de maison d’une église.
 * Tutoiement partout, comme dans les autres projets Web100.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Happy Bingo | Le bingo brise-glace où l’on cherche des personnes, pas des numéros',
  seoDesc:
    'Un jeu brise-glace pour les petits groupes, les groupes de maison et les soirées d’accueil. Chacun reçoit une carte de bingo dont les cases ne contiennent pas des numéros mais des phrases comme « Quelqu’un qui joue d’un instrument ». Trouve cette personne, elle confirme sur son propre téléphone, et la case est à toi. Sans téléchargement, sans inscription, et jouable même à deux.',
  rulesSeoTitle: 'Happy Bingo — Comment jouer',
  rulesSeoDesc:
    'Ouvrir une salle, régler la carte, comment fonctionnent l’association et la confirmation, et ce que l’animateur doit dire avant de commencer.',

  navTitle: 'Happy Bingo',
  navRules: 'Comment jouer',
  rulesLinkText: 'C’est ta première fois ? Voici comment démarrer →',
  langSwitchLabel: 'Changer de langue',
  themeToggleLabel: 'Basculer clair et sombre',

  heroTitle: 'Happy Bingo : trouver quelqu’un, discuter un peu, cocher une case',
  heroDesc:
    'Chacun reçoit une carte de bingo. Dans les cases, pas de numéros mais des phrases comme « Quelqu’un qui vient au groupe pour la première fois cette année ». Trouve cette personne dans la salle : elle confirme sur son propre téléphone. Complète autant de lignes que l’animateur l’a demandé et tu gagnes.',

  createHeading: 'Ouvrir une salle',
  maxPlayersLabel: 'Nombre de participants prévu',
  maxPlayersHint: '2 à 30 personnes, toi compris. À deux, ça marche déjà.',
  createButton: 'Ouvrir une salle',
  creating: 'Création…',
  createFailed: 'Impossible d’ouvrir la salle. Réessaie.',

  joinHeading: 'Rejoindre une salle existante',
  roomCodeLabel: 'Code de la salle',
  roomCodePlaceholder: 'ex. A3KP',
  nicknameLabel: 'Ton nom',
  nicknamePlaceholder: 'Celui sous lequel on te reconnaît ici',
  avatarLabel: 'Choisis un avatar',
  joinButton: 'Rejoindre',

  joinTitle: 'Rejoindre {code}',
  profileContinue: 'Entrer dans la salle',
  playerBadge: 'Joueur',
  cancelButton: 'Annuler',
  backHome: 'Retour à l’accueil',
  rulesBack: '← Retour au jeu',
  roomClosedTitle: 'Salle fermée',
  roomClosedDesc: 'L’animateur a fermé cette salle.',
  kickedTitle: 'Tu as quitté la salle',
  kickedDesc: 'L’animateur t’a retiré de cette salle.',

  roomCodeCaption: 'Code de la salle',
  shareHint: 'Fais scanner ce QR code, ou saisis directement le code ci-dessus.',
  qrAlt: 'QR code pour rejoindre la salle',
  copyLinkButton: 'Copier le lien',
  copiedToast: 'Lien copié',

  settingsHeading: 'Réglages de cette manche',

  sizeLabel: 'Taille de la carte',
  sizeHint: '3×3 convient à 5–8 personnes ou à un créneau court ; 5×5 à un groupe plus grand qui a le temps.',
  sizeOption: '{size}×{size}',

  targetLinesLabel: 'Lignes pour gagner',
  targetLinesUnit: '{n}',
  targetLinesHint:
    'Une carte {size}×{size} compte {total} lignes en tout, et il faut au moins {cells} cases cochées pour en compléter {n}.',

  hostPlaysLabel: 'L’animateur joue aussi',
  hostPlaysHint: 'Désactive-le pour seulement animer : tu n’auras pas de carte. Tu restes sur la liste, donc on peut t’associer à une case et te demander de confirmer.',
  winnerCountLabel: 'Combien de réussites avant la fin',
  winnerCountUnit: '{n}',
  winnerCountUnlimited: 'Sans limite',
  winnerCountHint: 'La manche se termine automatiquement dès que ce nombre de personnes atteint l’objectif — l’animateur peut aussi y mettre fin quand il veut.',
  selfClaimLabel: 'Autoriser « personne ne correspond, je coche moi-même »',
  selfClaimHint: 'On peut cocher une case à laquelle personne ne correspond ; elle apparaît d’une autre couleur au classement. Utile à 2–4 personnes.',

  anchorHeading: 'Case fixe au centre',
  anchorHint:
    'Cette case est sur 4 lignes à la fois — c’est le centre de la carte. Mets ici une question pour laquelle absolument chaque personne présente trouvera quelqu’un.',
  anchorCustomLabel: 'Question personnalisée',
  anchorCustomPlaceholder: 'ex. Quelqu’un qui est venu aujourd’hui',

  questionsHeading: 'Questions',
  questionsCount: '{n} sur {total} choisies',
  questionsNeedMore: 'Il en manque {n}',
  questionsTooMany: '{n} de trop',
  questionsReady: 'Le compte est bon — on peut commencer',
  selectedHeading: 'Sélectionnées',
  setupDoneButton: 'Ouvrir la salle',
  saveSettingsButton: 'Terminé',
  editSettingsButton: 'Réglages perso',
  settingsSummary: '{size}×{size} · {n} lignes pour gagner · {total} questions',
  randomButton: 'Aléatoire',
  clearButton: 'Vider',
  categorySelectAll: 'Tout sélectionner',

  customLabel: 'Écris la tienne',
  customPlaceholder: 'ex. Quelqu’un qui prépare son bubble tea lui-même',
  customAddButton: 'Ajouter',
  customRemoveLabel: 'Retirer cette question',

  categoryLife: 'Quotidien',
  categoryTalent: 'Talents',
  categoryExperience: 'Vécu',
  categoryChurch: 'Vie du groupe',
  categoryPersonality: 'Caractère',
  categoryFood: 'Nourriture',
  categoryHobby: 'Loisirs',

  playersHeading: 'Dans la salle',
  playersCount: '{n} sur {total}',
  waitingForHost: 'On attend l’animateur. Vérifie que ton nom est reconnaissable par tout le monde.',
  hostBadge: 'Animateur',
  spectatorBadge: 'Spectateur',
  offlineBadge: 'Hors ligne',
  kickLabel: 'Retirer de la salle',

  startButton: 'Lancer la partie',
  startBlockedQuestions: 'Il manque encore des questions',
  startBlockedAnchor: 'Aucune question pour le centre',
  startBlockedPlayers: 'Il faut au moins deux personnes pour commencer',

  cardHint: 'Lis les questions, et va rencontrer quelqu’un qui correspond !',
  progressHeading: '{done} lignes sur {target}',
  progressCells: '{n} cases cochées',
  progressWon: 'Objectif atteint — tente la carte pleine',
  blackoutBadge: 'Carte pleine',
  wonBadge: 'Réussi',

  cellPending: 'En attente',
  cellSelf: 'Coché soi-même',
  cellWaiting: 'En attente de {name}',
  cellDone: 'Confirmé par {name}',

  pickHint:
    'Choisis la personne avec qui tu viens de parler. Une fois envoyé, elle doit confirmer sur son propre téléphone.',
  pickEmpty: 'Il n’y a encore personne d’autre dans la salle.',
  pickCancel: 'Annuler',
  selfClaimButton: 'Personne ne correspond — je coche moi-même',

  cancelRequestButton: 'Annuler',

  incomingHeading: 'On attend ta confirmation',
  incomingEmpty: 'Personne n’attend ta confirmation pour l’instant.',
  incomingLine: '{name} t’a choisi',
  confirmButton: 'Confirmer',
  declineButton: 'Ce n’est pas moi',

  leaderboardLines: '{n} lignes',
  leaderboardCells: '{n} cases',
  leaderboardWaiting: '{n} en attente de toi',

  screenCard: 'Ma carte',
  boardHeading: 'Classement',
  listHeading: 'Questions',
  pickPendingBadge: 'En attente',
  screenRequests: 'On attend ta confirmation',

  endButton: 'Terminer la manche',
  endedHeading: 'Classement',
  endedDesc: 'La manche est finie — regarde si tu es au tableau !',
  resetButton: 'Retour à la salle',

  leaveRoomButton: 'Quitter la salle',
  closeRoomButton: 'Fermer la salle',
  confirmLeaveTitle: 'Quitter la salle ?',
  confirmLeaveDesc: 'Ta carte et ta progression seront retirées de cette manche.',
  confirmLeaveOk: 'Quitter',
  confirmCloseTitle: 'Fermer la salle ?',
  confirmCloseDesc: 'Tout le monde est renvoyé et le résultat de cette manche n’est pas conservé.',
  confirmCloseOk: 'Fermer la salle',
  confirmEndTitle: 'Terminer la manche ?',
  confirmEndDesc: 'Ensuite plus personne ne peut s’associer, et tout le monde passe au classement final.',
  confirmEndOk: 'Terminer',


  toastConfirmed: '{name} a confirmé — coché !',
  toastDeclined: '{name} trouve que ça ne correspond pas. Essaie quelqu’un d’autre',
  toastLine: '{n} lignes complétées',
  toastWon: 'Objectif atteint ! {n} lignes',

  errorTitle: 'Impossible d’entrer dans cette salle',
  errRoomNotFound: 'Aucune salle avec ce code. Vérifie-le encore une fois.',
  errRoomFull: 'La salle est pleine.',
  errRoomStarted: 'Cette manche a déjà commencé.',
  errNicknameRequired: 'Saisis d’abord ton nom.',
  errNicknameTaken: 'Quelqu’un utilise déjà ce nom. Choisis-en un autre.',
  errCannotPickSelf: 'Tu ne peux pas te choisir toi-même.',
  errAlreadyMarked: 'Cette case est déjà cochée.',
  errAlreadyPending: 'Cette case attend déjà une confirmation.',
  errSelfClaimDisabled: 'L’animateur n’a pas autorisé de cocher soi-même.',
  errSpectatorOnly:
    'Tu es arrivé en cours de manche, donc tu n’as pas de carte cette fois — tu peux quand même confirmer pour les autres.',
  errQuestionCount: 'Le nombre de questions ne correspond pas au nombre de cases.',
  errAnchorRequired: 'Il manque encore la question du centre.',
  errNoPlayers: 'Il n’y a encore personne dans la salle.',
  errNetwork: 'Connexion perdue, reconnexion…',

  mcHeading: 'Tu animes cette manche, tu n’y joues pas',
  mcDesc:
    'Tu as désactivé « L’animateur joue aussi », donc tu n’as pas de carte. On peut quand même t’associer à une case et tu peux confirmer pour les autres. Réactive-le depuis « Réglages perso » et tu auras une carte à la manche suivante.',
  spectatorHeading: 'Tu es arrivé en cours de manche',
  spectatorDesc:
    'Les questions et les cartes ont été figées au démarrage, donc tu n’as pas de carte. Tu es sur la liste malgré tout : on peut t’associer à une case et tu peux confirmer pour les autres. Tu auras une carte à la manche suivante.',

  rulesTitle: 'Comment fonctionne Happy Bingo',
  rulesIntro:
    'Une manche dure environ 10 à 20 minutes selon la taille et la condition de victoire. Voici ce que l’animateur et les joueurs doivent savoir.',
  rulesHostHeading: 'Animateur',
  rulesHostSteps: [
    'Choisis la taille de la carte : 3×3 pour 5–8 personnes ou un créneau court, 5×5 pour un grand groupe qui a le temps, 4×4 entre les deux.',
    'Pour 3×3 et 5×5, écris une question pour le centre. Le critère : absolument chaque personne présente trouve quelqu’un. Le plus sûr est « Quelqu’un qui est venu aujourd’hui ». Une carte 4×4 n’a pas cette case.',
    'Remplis la réserve de questions (9 pour 3×3, 16 pour 4×4, 25 pour 5×5) et remplace tout ce à quoi personne ne correspond, ou ce à quoi une seule personne correspond.',
    'Fixe le nombre de lignes nécessaires pour gagner. Moins pour un petit groupe ou un créneau court.',
    'En petit comité, active le fait de cocher soi-même, sinon les cases sans personne correspondante bloquent la partie.',
    'Prends une minute au début pour les trois points qui comptent : l’autre doit confirmer elle-même, atteindre l’objectif place au tableau mais le jeu continue, et le classement n’est là que pour l’ambiance.',
  ],
  rulesPlayerHeading: 'Joueurs',
  rulesPlayerSteps: [
    'Saisis ton nom pour rejoindre, puis attends que l’animateur lance la partie.',
    'Lis ta carte une fois reçue. Les questions sont les mêmes pour tous, mais l’ordre change d’une personne à l’autre.',
    'Choisis une case pour laquelle tu penses trouver quelqu’un, et va lui parler.',
    'De retour sur ton téléphone, appuie sur cette case et choisis la personne avec qui tu viens de parler.',
    'La case n’est cochée qu’après sa confirmation. Sans réponse tu peux annuler ; si elle refuse, cherche quelqu’un d’autre.',
    'Quand on te demande de confirmer, lis la description avant d’appuyer — une confirmation ne s’annule pas.',
  ],
  rulesFaqHeading: 'Questions fréquentes',
  rulesFaq: [
    {
      q: 'Tout le monde a-t-il la même carte ?',
      a: 'Les mêmes questions, oui — une réserve commune. L’ordre change pour chacun, donc ta troisième case n’est pas la troisième case de ton voisin. Le centre d’une carte 3×3 ou 5×5 fait exception : cette question est la même pour tous.',
    },
    {
      q: 'Puis-je revenir sans cesse vers la même personne ?',
      a: 'Oui, sans aucune limite. C’est pour ça qu’à deux, ça marche déjà. Dans une salle plus grande, les questions t’orientent d’elles-mêmes vers des personnes différentes.',
    },
    {
      q: 'Ai-je gagné dès qu’une ligne est complète ? La partie s’arrête-t-elle ?',
      a: 'L’objectif est celui fixé par l’animateur, souvent plus d’une ligne. Et la partie ne s’arrête pas quand quelqu’un l’atteint : elle continue jusqu’à ce que l’animateur y mette fin, et qui a atteint l’objectif peut viser la carte pleine.',
    },
    {
      q: 'Peut-on revenir sur une confirmation ?',
      a: 'Non. Elle prend effet dès l’appui, alors lis d’abord la description. Refuser est autre chose : cela se passe avant que quoi que ce soit soit coché.',
    },
    {
      q: 'Les retardataires peuvent-ils entrer ?',
      a: 'Ils rejoignent la liste mais n’ont pas de carte pour cette manche — les questions ont été figées au démarrage. On peut quand même les associer à une case, ils peuvent confirmer pour les autres, et ils auront une carte à la manche suivante.',
    },
  ],
};
