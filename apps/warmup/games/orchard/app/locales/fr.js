/*
 * Français. Clés et longueurs de listes identiques à zh-TW.js (topics peut avoir un autre nombre).
 * Pas d’équivalent français trouvé → nom descriptif « Catégories en rythme ».
 * Lancement : « Un, deux, trois ! », puis l’animateur annonce le thème.
 */
export default {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',

  seoTitle: 'Catégories en rythme | Jeu brise-glace avec métronome sur téléphone et action ou vérité',
  seoDesc:
    'L’animateur annonce un thème – « Le petit-déj ! » – et chacun son tour, en rythme : clap, clap, « croissant » ; clap, clap, « tartine »… Pas de répétition, pas de hors-sujet. Le téléphone tire des thèmes au hasard (fruits, zoo, supermarché…), donne un rythme réglable, guide l’animateur pas à pas, et les perdants tirent un défi action ou vérité. Sans matériel, sans téléchargement, sans inscription.',
  rulesSeoTitle: 'Règles de Catégories en rythme et texte pour l’animateur',
  rulesSeoDesc: 'Comment jouer à Catégories en rythme : nombre de joueurs, le rythme clap-clap-mot, ce qui compte comme une erreur, ce qui se passe ensuite, un petit texte à lire et des idées de thèmes.',

  navTitle: 'Catégories en rythme',
  navRules: 'Règles',
  gameBack: 'Retour',
  rulesLinkText: 'Toutes les règles →',

  heroTitle: 'Catégories en rythme : clap, clap, un mot – et jamais deux fois le même',
  heroDesc: 'L’animateur annonce un thème, par exemple « Le zoo », et chacun son tour en rythme : clap, clap, « lion » ; clap, clap, « girafe »… Répéter un mot déjà dit ou sortir du thème, c’est perdu.',

  lead: {
    setup: ['C’est parti', 'On joue à Catégories en rythme ! Mettez-vous en cercle : dans un instant, on tape dans les mains sur mon rythme.'],
    rules: ['Expliquer les règles', 'Trois temps : clap, clap, mot – on tape deux fois, et au troisième temps on dit un mot. D’abord, tous ensemble : « Un, deux, trois ! », puis j’annonce le thème, par exemple « Le petit-déj ». À partir de moi, chacun son tour cite quelque chose du petit-déj : clap, clap, croissant ; clap, clap, tartine… Pas de répétition, pas de hors-sujet, et si on bloque trop longtemps, c’est perdu aussi. Celui ou celle qui perd relance avec un nouveau thème !'],
    play: ['C’est parti !', 'Tous ensemble : « Un, deux, trois ! » Thème : « {topic} » – {say} ! Je commence.'],
    end: ['Qui a perdu ?', 'Ceux qui ont perdu : choisissez action, vérité ou au hasard, puis tirez le levier !'],
  },
  ruleCards: [
    ['Annoncer le thème', 'L’animateur annonce un thème : « Le petit-déj », on cite ce qu’on mange le matin ; « Le zoo », des animaux. Le téléphone peut en tirer un au hasard.'],
    ['Garder le rythme', 'Trois temps : clap, clap, mot. D’abord « Un, deux, trois ! » tous ensemble, puis le thème, et la personne dont c’est le tour dit un mot au troisième temps.'],
    ['Répété ? Perdu !', 'Pas de répétition, pas de hors-sujet, et bloquer trop longtemps compte aussi (l’animateur décide). Puis nouveau thème, et le perdant commence.'],
  ],
  rulesNext: 'Suivant : commencer',

  startButton: 'Lancer la partie',
  soundLabel: 'Musique',

  chant: ['Un,', 'deux,', 'trois !'],
  topicSay: 'Citez {say}',
  topicShuffle: 'Autre thème',
  topicPick: 'Choisir un thème',
  topics: [
    ['Le verger', 'un fruit'],
    ['Le potager', 'un légume'],
    ['Le zoo', 'un animal'],
    ['Le supermarché', 'un produit du supermarché'],
    ['Le petit-déj', 'quelque chose du petit-déj'],
    ['Le café', 'une boisson'],
    ['La rentrée', 'une fourniture scolaire'],
    ['La cuisine', 'un ustensile de cuisine'],
    ['Les JO', 'un sport'],
    ['En route', 'un moyen de transport'],
    ['La carte du monde', 'un pays'],
    ['La carte de France', 'une ville'],
    ['La palette', 'une couleur'],
    ['Les dessins animés', 'un personnage de dessin animé'],
    ['Les métiers', 'un métier'],
    ['La fromagerie', 'un fromage'],
  ],

  endGame: 'Maintenir pour terminer',
  againButton: 'Rejouer',

  leaveTitle: 'Revenir au début ?',
  leaveDesc: 'La partie reprend depuis le début, avec un nouveau thème.',
  leaveConfirm: 'Revenir au début',
  leaveCancel: 'Continuer',

  rulesTitle: 'Comment jouer à Catégories en rythme',
  rulesIntro: 'L’animateur annonce un thème, et chacun son tour en rythme : clap, clap, un mot. Pas de répétition, pas de hors-sujet. Quand quelqu’un perd, on change de thème et c’est lui qui commence.',
  rulesFacts: [
    ['Joueurs', '4 à 30'],
    ['Durée', 'Aussi longtemps que vous voulez'],
    ['Matériel', 'Rien, juste le téléphone de l’animateur'],
  ],
  rulesHowHeading: 'Déroulement',
  rulesHowSteps: [
    'En cercle, dites ensemble en rythme « Un, deux, trois ! », puis l’animateur annonce le thème, par exemple « Le petit-déj » (le téléphone peut en tirer un au hasard).',
    'Le téléphone bat trois temps : clap, clap, mot. Tout le monde tape sur les deux premiers, et au troisième, la personne dont c’est le tour cite quelque chose – « croissant », par exemple.',
    'La personne suivante enchaîne sur les trois temps suivants – clap, clap, « tartine » – et ainsi de suite dans le cercle.',
    'Répéter un mot déjà dit, sortir du thème (« lion » pour le petit-déj) ou bloquer trop longtemps (l’animateur décide) : c’est perdu.',
    'Quand quelqu’un perd, on change de thème et il ou elle commence. Quand l’animateur décide d’arrêter, les perdants tirent la machine action ou vérité.',
  ],
  rulesLeadHeading: 'Conseils pour l’animateur',
  rulesLeadSay: 'Tous ensemble en rythme : « Un, deux, trois ! » Thème : « Le petit-déj » – citez quelque chose du petit-déj ! Je commence : clap, clap, croissant ; clap, clap, tartine… Pas de répétition, pas de hors-sujet, et bloquer trop longtemps compte aussi. Le perdant relance avec un nouveau thème !',
  rulesLeadSteps: [
    'Commencez avec un rythme lent. Quand tout le monde a compris, appuyez sur « plus vite » ou activez l’accélération automatique.',
    'C’est l’animateur qui décide quand on a bloqué trop longtemps : d’abord coulant, puis de plus en plus strict.',
    'À la fin, faites tirer le levier une fois à tous ceux qui ont perdu, ou seulement à celui ou celle qui a perdu le plus souvent.',
  ],
  rulesBack: '← Retour au jeu',
};
