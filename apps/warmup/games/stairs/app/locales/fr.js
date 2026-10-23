/*
 * Français. Clés et longueurs de listes identiques à zh-TW.js.
 * Formule : quatre temps, un mot par temps – « Un, monte, au, quatre ! » (son étage, monte/descend, au, l’étage appelé).
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'L’ascenseur | Jeu brise-glace en rythme, métronome sur téléphone et action ou vérité',
  seoDesc:
    'Tout le monde forme un cercle : étage 1, étage 2, étage 3… et on lance en rythme « Un monte au quatre ! ». L’étage 4 doit enchaîner tout de suite. Mauvaise direction, étage qui n’existe pas, tour raté ou réponse à la place d’un autre : on file à l’étage 1. Le téléphone donne un rythme réglable, guide l’animateur pas à pas, et les perdants tirent un défi action ou vérité. Sans matériel, sans téléchargement, sans inscription.',
  rulesSeoTitle: 'Règles de L’ascenseur et texte pour l’animateur',
  rulesSeoDesc: 'Comment jouer à L’ascenseur : nombre de joueurs, répartition des étages, ce qui compte comme une erreur, ce qui se passe ensuite, la variante toit et sous-sol, et un petit texte à lire pour lancer la partie.',

  navTitle: 'L’ascenseur',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'L’ascenseur : annoncez les étages en rythme, sans vous tromper de sens',
  heroDesc: 'Formez un cercle et numérotez-vous : étage 1, étage 2, étage 3… En rythme, lancez « Un monte au quatre ! » et l’étage 4 doit répondre aussitôt. Mauvais sens, étage qui n’existe pas ou tour raté : perdu.',

  lead: {
    setup: ['Nombre de joueurs', 'On joue à L’ascenseur ! On compte d’abord combien on est, et on voit si on ajoute un toit et un sous-sol pour ceux qui arrivent en retard.'],
    rules: ['Expliquer les règles', 'On se numérote en commençant par moi : je suis l’étage 1, toi l’étage 2… On parle sur quatre temps, un mot par temps : « Un, monte, au, quatre ! » D’abord son étage, puis monte ou descend, puis l’étage qu’on appelle. La personne appelée répond sur les quatre temps suivants. Se tromper de sens, appeler un étage qui n’existe pas, rater son tour ou répondre alors qu’on n’était pas appelé : c’est perdu. Celui ou celle qui se trompe passe à l’étage 1, tous ceux d’en dessous montent d’un étage, et l’étage 1 relance !'],
    play: ['C’est parti !', 'L’étage 1 commence ! En rythme : un, monte, au… quel étage ?'],
    end: ['Qui a perdu ?', 'Ceux qui se sont trompés : choisissez action, vérité ou au hasard, puis tirez le levier !'],
  },
  ruleCards: [
    ['On se numérote', 'En cercle, on compte à partir de l’animateur : étage 1, étage 2, étage 3…'],
    ['En rythme', 'Quatre temps, un mot par temps : « Un, monte, au, quatre ! » Son étage, monte ou descend, puis l’étage appelé. Attention au sens : l’étage 4 ne peut pas dire « Quatre descend au cinq ».'],
    ['Perdu ? Étage 1', 'Mauvaise annonce, étage qui n’existe pas, tour raté ou réponse trop tôt : tu passes à l’étage 1 et ceux d’en dessous montent d’un étage.'],
  ],
  rulesNext: 'Suivant : commencer',

  countHeading: 'Nombre de joueurs',
  countLess: 'Un joueur de moins',
  countMore: 'Un joueur de plus',
  expansionLabel: 'Ajouter un toit et un sous-sol',
  expansionSub: 'Deux places en plus pour les retardataires',
  startButton: 'Lancer la partie',
  soundLabel: 'Musique',

  buildingHeading: 'Les étages de la partie',
  floorLabel: 'Étage {n}',
  floorTop: 'Toit',
  floorBasement: 'Sous-sol',

  endGame: 'Maintenir pour terminer',
  playHint: 'Celui ou celle qui se trompe passe à l’étage 1, ceux d’en dessous montent d’un étage, et l’étage 1 relance.',
  againButton: 'Rejouer',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'Le nombre de joueurs est conservé, la partie reprend depuis le début.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer à L’ascenseur',
  rulesIntro: 'En cercle, chacun est un étage. On lance en rythme « Un monte au quatre ! », « Quatre descend au deux ! », et la personne appelée enchaîne aussitôt. Mauvais sens, étage qui n’existe pas, tour raté ou réponse trop tôt : direction l’étage 1.',
  rulesFacts: [
    ['Joueurs', '4 à 30'],
    ['Durée', 'Aussi longtemps que vous voulez'],
    ['Matériel', 'Rien, juste le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Déroulement',
  rulesHowSteps: [
    'Formez un cercle et numérotez-vous à partir de l’animateur : étage 1, étage 2, étage 3… (la variante ajoute un toit et un sous-sol, deux places en plus).',
    'Le téléphone bat la mesure sur quatre temps. L’étage 1 commence : « Un, monte, au, quatre ! », un mot par temps.',
    'La personne appelée répond sur les quatre temps suivants, en commençant par son étage : « Quatre descend au deux ! », « Deux monte au toit ! »… Attention au sens : l’étage 4 ne peut pas dire « Quatre descend au cinq ».',
    'Se tromper de sens, appeler un étage qui n’existe pas, rater son tour ou répondre sans avoir été appelé : tout ça compte comme une erreur.',
    'Celui ou celle qui se trompe passe à l’étage 1, ceux qui étaient en dessous montent d’un étage, et l’étage 1 relance. Quand l’animateur décide d’arrêter, les perdants tirent la machine action ou vérité.',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'On se numérote en commençant par moi : je suis l’étage 1, toi l’étage 2… On parle sur quatre temps : « Un, monte, au, quatre ! » Son étage, monte ou descend, puis l’étage qu’on appelle, et la personne appelée enchaîne tout de suite. Une erreur, et c’est l’étage 1 !',
  rulesLeadSteps: [
    'Commencez avec un rythme lent. Quand tout le monde a compris, appuyez sur « plus vite » ou activez l’accélération automatique.',
    'C’est le groupe qui juge les erreurs : l’animateur dit juste « Perdu ! » et envoie la personne à l’étage 1.',
    'À la fin, faites tirer le levier une fois à tous ceux qui ont perdu, ou seulement à celui ou celle qui s’est le plus trompé.',
  ],
  rulesBack: '← Retour au jeu',
};
