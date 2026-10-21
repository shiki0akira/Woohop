/*
 * 內建題庫。內容準則、主持人的替換建議、以及不能直譯的那兩題，都寫在 QUESTIONS.md。
 *
 * 每一題只做兩件事之一：**回答一個問題**（talk），或**做一個動作**（其餘四類）。
 * 三條硬準則（QUESTIONS.md）：20 秒內能完成、不需要任何道具坐在原位就能做、
 * 不涉及外貌／感情狀況／收入這類會讓人下不了台的主題。加新題目前先對一次這三條。
 *
 * 分類就是主持人在設定畫面勾選的單位（CONCEPT.md 2.4）：
 *   talk      問答型         45 題
 *   voice     聲音與模仿     13 題  ┐
 *   quickfire 快問快答       10 題  │ 這四類合起來是題庫文件說的「動作型」45 題
 *   gesture   表情與肢體     12 題  │
 *   interact  跟旁邊的人互動 10 題  ┘
 *
 * `familiar: true` 是題庫文件的 ※ 記號：需要對在場的人有一定認識才答得出來。
 * 只有 2 題，設定畫面有獨立開關，新朋友多的場次關掉。
 *
 * **翻譯**：8 種語言都要有，少一個 build 就會失敗（checkQuestions）。
 * 翻的時候顧的是「這句話在那個語言裡自然不自然」，不是逐字對齊中文——
 * 例如「用台語說出三種水果」在其他語言換成「你會的另一種語言或方言」，
 * 「三個台灣的縣市不能有重複的字」在拼音語言換成「開頭字母不能重複」。
 * 理由見 app/strings.js 開頭關於機器翻譯的那段。
 */

export const CATEGORIES = ['talk', 'voice', 'quickfire', 'gesture', 'interact'];

/*
 * 設定畫面把分類分成兩組顯示（問答型 / 動作型）。這裡只是分組用的中繼資料，
 * 抽題邏輯完全不看它——牌堆是「勾選到的分類」整副洗牌，沒有 50/50 的類別平衡
 * （兩類本來就都是 45 題，比例已經是平的，見 QUESTIONS.md）。
 */
export const CATEGORY_GROUPS = [
  { id: 'ask', categories: ['talk'] },
  { id: 'dare', categories: ['voice', 'quickfire', 'gesture', 'interact'] },
];

export const QUESTIONS = [
  // ---------- 問答型（45 題）----------
  {
    id: 'talk.thankful',
    category: 'talk',
    text: {
      'zh-TW': '說一件你這禮拜最感謝的事！',
      en: 'Name one thing you are most thankful for this week!',
      ja: '今週いちばん感謝していることを一つ言って！',
      ko: '이번 주에 가장 감사한 일 하나 말해 보세요!',
      de: 'Nenne eine Sache, für die du diese Woche am dankbarsten bist!',
      fr: 'Dis une chose dont tu es le plus reconnaissant cette semaine !',
      es: '¡Di una cosa por la que estés más agradecido esta semana!',
      'zh-CN': '说一件你这礼拜最感谢的事！',
    },
  },
  {
    id: 'talk.scaryFood',
    category: 'talk',
    text: {
      'zh-TW': '你最不敢吃的食物是什麼？',
      en: 'What food can you absolutely not bring yourself to eat?',
      ja: 'どうしても食べられない食べ物は何？',
      ko: '도저히 못 먹겠는 음식은 뭐예요?',
      de: 'Welches Essen bekommst du absolut nicht runter?',
      fr: 'Quel aliment tu n’arrives absolument pas à manger ?',
      es: '¿Qué comida no eres capaz de probar?',
      'zh-CN': '你最不敢吃的食物是什么？',
    },
  },
  {
    id: 'talk.extraDay',
    category: 'talk',
    text: {
      'zh-TW': '如果明天多放你一天假，你最想做什麼？',
      en: 'If you got one extra day off tomorrow, what would you do?',
      ja: '明日もう一日休みがもらえたら、何をする？',
      ko: '내일 하루가 더 생긴다면 뭘 하고 싶어요?',
      de: 'Wenn du morgen einen Tag extra frei hättest, was würdest du machen?',
      fr: 'Si on t’offrait un jour de congé de plus demain, tu ferais quoi ?',
      es: 'Si mañana te dieran un día libre extra, ¿qué harías?',
      'zh-CN': '如果明天多放你一天假，你最想做什么？',
    },
  },
  {
    id: 'talk.lastPhoto',
    category: 'talk',
    text: {
      'zh-TW': '你手機裡最近拍的一張照片是什麼？',
      en: 'What is the most recent photo on your phone?',
      ja: 'スマホで最近撮った写真は何？',
      ko: '휴대폰에 가장 최근에 찍은 사진은 뭐예요?',
      de: 'Was ist das neueste Foto auf deinem Handy?',
      fr: 'C’est quoi la dernière photo prise avec ton téléphone ?',
      es: '¿Cuál es la última foto que hiciste con el móvil?',
      'zh-CN': '你手机里最近拍的一张照片是什么？',
    },
  },
  {
    id: 'talk.nickname',
    category: 'talk',
    text: {
      'zh-TW': '說出一個你小時候的綽號！',
      en: 'Tell us a nickname you had as a kid!',
      ja: '子どものころのあだ名を一つ言って！',
      ko: '어릴 때 별명 하나 말해 보세요!',
      de: 'Nenne einen Spitznamen aus deiner Kindheit!',
      fr: 'Dis un surnom que tu avais enfant !',
      es: '¡Di un apodo que tenías de pequeño!',
      'zh-CN': '说出一个你小时候的绰号！',
    },
  },
  {
    id: 'talk.lastLaugh',
    category: 'talk',
    text: {
      'zh-TW': '你最近一次大笑是因為什麼事？',
      en: 'What made you laugh out loud most recently?',
      ja: 'この前、大笑いしたのは何がきっかけ？',
      ko: '최근에 크게 웃은 건 무슨 일 때문이었어요?',
      de: 'Worüber hast du zuletzt richtig laut gelacht?',
      fr: 'C’est quoi la dernière chose qui t’a fait éclater de rire ?',
      es: '¿Qué fue lo último que te hizo reír a carcajadas?',
      'zh-CN': '你最近一次大笑是因为什么事？',
    },
  },
  {
    id: 'talk.breakfast',
    category: 'talk',
    text: {
      'zh-TW': '你早餐最常吃什麼？',
      en: 'What do you eat for breakfast most often?',
      ja: '朝ごはんにいちばんよく食べるものは？',
      ko: '아침으로 제일 자주 먹는 건 뭐예요?',
      de: 'Was isst du am häufigsten zum Frühstück?',
      fr: 'Qu’est-ce que tu manges le plus souvent au petit-déjeuner ?',
      es: '¿Qué desayunas más a menudo?',
      'zh-CN': '你早餐最常吃什么？',
    },
  },
  {
    id: 'talk.wallpaper',
    category: 'talk',
    text: {
      'zh-TW': '你的手機桌布是什麼？',
      en: 'What is your phone wallpaper?',
      ja: 'スマホの壁紙は何にしてる？',
      ko: '휴대폰 배경화면이 뭐예요?',
      de: 'Was ist dein Handy-Hintergrundbild?',
      fr: 'C’est quoi ton fond d’écran de téléphone ?',
      es: '¿Qué tienes de fondo de pantalla en el móvil?',
      'zh-CN': '你的手机桌布是什么？',
    },
  },
  {
    id: 'talk.songOnRepeat',
    category: 'talk',
    text: {
      'zh-TW': '說出你最近單曲循環的一首歌！',
      en: 'Name a song you have had on repeat lately!',
      ja: '最近リピートで聴いている曲を一つ言って！',
      ko: '요즘 무한 반복으로 듣는 노래 하나 말해 보세요!',
      de: 'Nenne ein Lied, das du gerade in Dauerschleife hörst!',
      fr: 'Dis une chanson que tu écoutes en boucle en ce moment !',
      es: '¡Di una canción que tengas en bucle últimamente!',
      'zh-CN': '说出你最近单曲循环的一首歌！',
    },
  },
  {
    id: 'talk.favoriteFilm',
    category: 'talk',
    text: {
      'zh-TW': '你最喜歡的一部電影或影集？',
      en: 'What is your favourite film or series?',
      ja: 'いちばん好きな映画かドラマは？',
      ko: '가장 좋아하는 영화나 드라마는 뭐예요?',
      de: 'Was ist dein Lieblingsfilm oder deine Lieblingsserie?',
      fr: 'C’est quoi ton film ou ta série préférée ?',
      es: '¿Cuál es tu película o serie favorita?',
      'zh-CN': '你最喜欢的一部电影或剧集？',
    },
  },
  {
    id: 'talk.teleport',
    category: 'talk',
    text: {
      'zh-TW': '如果可以瞬間移動去一個地方，你會去哪？',
      en: 'If you could teleport anywhere right now, where would you go?',
      ja: '今どこへでも瞬間移動できるとしたら、どこに行く？',
      ko: '지금 어디로든 순간이동할 수 있다면 어디로 갈래요?',
      de: 'Wenn du dich jetzt irgendwohin beamen könntest, wohin?',
      fr: 'Si tu pouvais te téléporter n’importe où, tu irais où ?',
      es: 'Si pudieras teletransportarte a cualquier sitio, ¿adónde irías?',
      'zh-CN': '如果可以瞬间移动去一个地方，你会去哪？',
    },
  },
  {
    id: 'talk.lifelongHabit',
    category: 'talk',
    text: {
      'zh-TW': '你有沒有什麼從小到大都沒變過的習慣？',
      en: 'Is there a habit you have kept since childhood?',
      ja: '子どものころからずっと変わらない習慣はある？',
      ko: '어릴 때부터 지금까지 안 변한 습관이 있어요?',
      de: 'Gibt es eine Gewohnheit, die du seit deiner Kindheit hast?',
      fr: 'Tu as une habitude que tu gardes depuis l’enfance ?',
      es: '¿Tienes alguna costumbre que mantienes desde pequeño?',
      'zh-CN': '你有没有什么从小到大都没变过的习惯？',
    },
  },
  {
    id: 'talk.wantToLearn',
    category: 'talk',
    text: {
      'zh-TW': '說一個你很想學但一直沒去學的東西！',
      en: 'Name something you have always wanted to learn but never started!',
      ja: 'ずっと習いたいのに始めていないことを一つ言って！',
      ko: '늘 배우고 싶었지만 아직 시작 못 한 것 하나 말해 보세요!',
      de: 'Nenne etwas, das du schon immer lernen wolltest, aber nie angefangen hast!',
      fr: 'Dis une chose que tu veux apprendre depuis longtemps sans jamais t’y mettre !',
      es: '¡Di algo que siempre has querido aprender y nunca has empezado!',
      'zh-CN': '说一个你很想学但一直没去学的东西！',
    },
  },
  {
    id: 'talk.mostAfraid',
    category: 'talk',
    text: {
      'zh-TW': '你最怕的東西是什麼？',
      en: 'What are you most afraid of?',
      ja: 'いちばん怖いものは何？',
      ko: '가장 무서워하는 게 뭐예요?',
      de: 'Wovor hast du am meisten Angst?',
      fr: 'De quoi as-tu le plus peur ?',
      es: '¿A qué le tienes más miedo?',
      'zh-CN': '你最怕的东西是什么？',
    },
  },
  {
    id: 'talk.bestPurchase',
    category: 'talk',
    text: {
      'zh-TW': '你最近買過最滿意的一樣東西？',
      en: 'What is the best thing you have bought recently?',
      ja: '最近買ってよかったものは？',
      ko: '최근에 산 것 중에 제일 만족스러운 건 뭐예요?',
      de: 'Was ist das Beste, das du in letzter Zeit gekauft hast?',
      fr: 'C’est quoi le meilleur achat que tu as fait récemment ?',
      es: '¿Qué es lo mejor que has comprado últimamente?',
      'zh-CN': '你最近买过最满意的一样东西？',
    },
  },
  {
    id: 'talk.lifeSkill',
    category: 'talk',
    text: {
      'zh-TW': '你覺得自己最厲害的一項生活技能是什麼？',
      en: 'What everyday skill are you best at?',
      ja: '生活の中でいちばん得意なことは何？',
      ko: '생활 기술 중에 제일 자신 있는 건 뭐예요?',
      de: 'In welcher Alltagsfähigkeit bist du am besten?',
      fr: 'Quelle compétence du quotidien maîtrises-tu le mieux ?',
      es: '¿En qué habilidad cotidiana eres el mejor?',
      'zh-CN': '你觉得自己最厉害的一项生活技能是什么？',
    },
  },
  {
    id: 'talk.placeAgain',
    category: 'talk',
    text: {
      'zh-TW': '說一個你去過、覺得最值得再去一次的地方！',
      en: 'Name a place you have been that is most worth going back to!',
      ja: '行ったことがある中で、もう一度行きたい場所を一つ言って！',
      ko: '가 본 곳 중에 다시 가고 싶은 곳 하나 말해 보세요!',
      de: 'Nenne einen Ort, an dem du warst und unbedingt wieder hinwillst!',
      fr: 'Dis un endroit où tu es allé et où tu retournerais volontiers !',
      es: '¡Di un sitio donde hayas estado y al que volverías sin dudar!',
      'zh-CN': '说一个你去过、觉得最值得再去一次的地方！',
    },
  },
  {
    id: 'talk.beforeSleep',
    category: 'talk',
    text: {
      'zh-TW': '你睡覺前最後做的一件事通常是什麼？',
      en: 'What is usually the last thing you do before sleeping?',
      ja: '寝る前に最後にすることはたいてい何？',
      ko: '자기 전에 마지막으로 하는 일은 보통 뭐예요?',
      de: 'Was machst du normalerweise als Letztes vor dem Einschlafen?',
      fr: 'C’est quoi la dernière chose que tu fais avant de dormir ?',
      es: '¿Qué es lo último que sueles hacer antes de dormir?',
      'zh-CN': '你睡觉前最后做的一件事通常是什么？',
    },
  },
  {
    id: 'talk.ownShop',
    category: 'talk',
    text: {
      'zh-TW': '如果你要開一間店，你會開什麼店？',
      en: 'If you opened a shop, what kind would it be?',
      ja: 'お店を開くとしたら、どんなお店にする？',
      ko: '가게를 연다면 어떤 가게를 열고 싶어요?',
      de: 'Wenn du einen Laden aufmachen würdest, was für einen?',
      fr: 'Si tu ouvrais une boutique, ce serait quoi ?',
      es: 'Si abrieras una tienda, ¿de qué sería?',
      'zh-CN': '如果你要开一间店，你会开什么店？',
    },
  },
  {
    id: 'talk.favoriteWeekday',
    category: 'talk',
    text: {
      'zh-TW': '你最喜歡星期幾，為什麼？',
      en: 'Which day of the week is your favourite, and why?',
      ja: '何曜日がいちばん好き？その理由も。',
      ko: '무슨 요일을 제일 좋아해요? 이유도 같이.',
      de: 'Welcher Wochentag ist dein Lieblingstag, und warum?',
      fr: 'Quel jour de la semaine préfères-tu, et pourquoi ?',
      es: '¿Qué día de la semana es tu favorito y por qué?',
      'zh-CN': '你最喜欢星期几，为什么？',
    },
  },
  {
    id: 'talk.bravestThing',
    category: 'talk',
    text: {
      'zh-TW': '說一件你今年做過最勇敢的事！',
      en: 'Name the bravest thing you have done this year!',
      ja: '今年やったいちばん勇気のいることを一つ言って！',
      ko: '올해 한 일 중에 가장 용감했던 일 하나 말해 보세요!',
      de: 'Nenne das Mutigste, das du dieses Jahr getan hast!',
      fr: 'Dis la chose la plus courageuse que tu aies faite cette année !',
      es: '¡Di la cosa más valiente que has hecho este año!',
      'zh-CN': '说一件你今年做过最勇敢的事！',
    },
  },
  {
    id: 'talk.misunderstood',
    category: 'talk',
    text: {
      'zh-TW': '你最常被別人誤會的一點是什麼？',
      en: 'What do people most often get wrong about you?',
      ja: '人によく誤解されるところは何？',
      ko: '사람들이 나에 대해 가장 자주 오해하는 건 뭐예요?',
      de: 'Was verstehen andere am häufigsten falsch an dir?',
      fr: 'Sur quoi les gens se trompent-ils le plus souvent à ton sujet ?',
      es: '¿Qué es lo que la gente más malinterpreta de ti?',
      'zh-CN': '你最常被别人误会的一点是什么？',
    },
  },
  {
    id: 'talk.catchphrase',
    category: 'talk',
    text: {
      'zh-TW': '有沒有一句話是你常常掛在嘴邊的？',
      en: 'Is there a phrase you say all the time?',
      ja: '口ぐせになっている言葉はある？',
      ko: '입버릇처럼 자주 하는 말이 있어요?',
      de: 'Gibt es einen Satz, den du ständig sagst?',
      fr: 'Tu as une phrase que tu répètes tout le temps ?',
      es: '¿Tienes alguna frase que repites constantemente?',
      'zh-CN': '有没有一句话是你常常挂在嘴边的？',
    },
  },
  {
    id: 'talk.childhoodDream',
    category: 'talk',
    text: {
      'zh-TW': '你小時候的志願是什麼？',
      en: 'What did you want to be when you grew up?',
      ja: '子どものころの将来の夢は何だった？',
      ko: '어릴 때 장래 희망이 뭐였어요?',
      de: 'Was wolltest du als Kind werden?',
      fr: 'Tu voulais faire quoi quand tu étais petit ?',
      es: '¿Qué querías ser de mayor cuando eras pequeño?',
      'zh-CN': '你小时候的志愿是什么？',
    },
  },
  {
    id: 'talk.threeWords',
    category: 'talk',
    text: {
      'zh-TW': '說出三個可以形容你自己的詞！',
      en: 'Say three words that describe you!',
      ja: '自分を表す言葉を三つ言って！',
      ko: '자신을 표현하는 단어 세 개를 말해 보세요!',
      de: 'Nenne drei Wörter, die dich beschreiben!',
      fr: 'Dis trois mots qui te décrivent !',
      es: '¡Di tres palabras que te describan!',
      'zh-CN': '说出三个可以形容你自己的词！',
    },
  },
  {
    id: 'talk.favoriteSeason',
    category: 'talk',
    text: {
      'zh-TW': '你最喜歡哪個季節，為什麼？',
      en: 'Which season do you like best, and why?',
      ja: 'どの季節がいちばん好き？その理由も。',
      ko: '어느 계절을 제일 좋아해요? 이유도 같이.',
      de: 'Welche Jahreszeit magst du am liebsten, und warum?',
      fr: 'Quelle saison préfères-tu, et pourquoi ?',
      es: '¿Qué estación te gusta más y por qué?',
      'zh-CN': '你最喜欢哪个季节，为什么？',
    },
  },
  {
    id: 'talk.quirkyRule',
    category: 'talk',
    text: {
      'zh-TW': '你有沒有什麼很奇怪的小堅持？',
      en: 'Do you have an oddly specific rule you stick to?',
      ja: '自分だけの変なこだわりはある？',
      ko: '남들이 보기엔 이상한 나만의 고집이 있어요?',
      de: 'Hast du eine seltsame kleine Marotte, an der du festhältst?',
      fr: 'Tu as une petite manie bizarre à laquelle tu tiens ?',
      es: '¿Tienes alguna manía rara que sigues a rajatabla?',
      'zh-CN': '你有没有什么很奇怪的小坚持？',
    },
  },
  {
    id: 'talk.memorableDream',
    category: 'talk',
    text: {
      'zh-TW': '說一個讓你印象很深的夢！',
      en: 'Tell us about a dream that stuck with you!',
      ja: '強く印象に残っている夢を一つ話して！',
      ko: '기억에 남는 꿈 하나 말해 보세요!',
      de: 'Erzähl von einem Traum, der dir im Gedächtnis geblieben ist!',
      fr: 'Raconte un rêve qui t’a marqué !',
      es: '¡Cuenta un sueño que se te quedó grabado!',
      'zh-CN': '说一个让你印象很深的梦！',
    },
  },
  {
    id: 'talk.movedRecently',
    category: 'talk',
    text: {
      'zh-TW': '你最近一次覺得很感動，是因為什麼事？',
      en: 'What most recently moved you?',
      ja: 'この前、心が動かされたのはどんなこと？',
      ko: '최근에 마음이 뭉클했던 건 무슨 일이었어요?',
      de: 'Was hat dich zuletzt richtig berührt?',
      fr: 'Qu’est-ce qui t’a touché récemment ?',
      es: '¿Qué te ha emocionado últimamente?',
      'zh-CN': '你最近一次觉得很感动，是因为什么事？',
    },
  },
  {
    id: 'talk.noPhoneDay',
    category: 'talk',
    text: {
      'zh-TW': '如果有一整天完全不能用手機，你會做什麼？',
      en: 'If you had a whole day with no phone at all, what would you do?',
      ja: '丸一日スマホが一切使えないとしたら、何をする？',
      ko: '하루 종일 휴대폰을 전혀 못 쓴다면 뭘 할래요?',
      de: 'Was würdest du an einem ganzen Tag komplett ohne Handy machen?',
      fr: 'Si tu passais une journée entière sans téléphone, tu ferais quoi ?',
      es: 'Si pasaras un día entero sin móvil, ¿qué harías?',
      'zh-CN': '如果有一整天完全不能用手机，你会做什么？',
    },
  },
  {
    id: 'talk.catOrDog',
    category: 'talk',
    text: {
      'zh-TW': '你覺得自己比較像貓還是像狗，為什麼？',
      en: 'Are you more of a cat or a dog, and why?',
      ja: '自分は猫っぽい？犬っぽい？その理由も。',
      ko: '자신이 고양이 같아요, 강아지 같아요? 이유도 같이.',
      de: 'Bist du eher Katze oder Hund, und warum?',
      fr: 'Tu es plutôt chat ou chien, et pourquoi ?',
      es: '¿Eres más de gato o de perro, y por qué?',
      'zh-CN': '你觉得自己比较像猫还是像狗，为什么？',
    },
  },
  {
    id: 'talk.recommendRestaurant',
    category: 'talk',
    text: {
      'zh-TW': '說出一間你很推薦的餐廳或小吃！',
      en: 'Name a restaurant or food spot you really recommend!',
      ja: 'おすすめのお店を一つ挙げて！',
      ko: '정말 추천하고 싶은 식당이나 맛집 하나 말해 보세요!',
      de: 'Nenne ein Restaurant oder einen Imbiss, den du wirklich empfiehlst!',
      fr: 'Cite un restaurant ou un endroit où bien manger que tu recommandes !',
      es: '¡Di un restaurante o un sitio de comer que recomiendes de verdad!',
      'zh-CN': '说出一间你很推荐的餐厅或小吃！',
    },
  },
  {
    id: 'talk.favoriteHoliday',
    category: 'talk',
    text: {
      'zh-TW': '你最喜歡的節日是哪一個？',
      en: 'Which holiday is your favourite?',
      ja: 'いちばん好きな行事や祝日は？',
      ko: '가장 좋아하는 명절이나 기념일은 뭐예요?',
      de: 'Welcher Feiertag ist dein liebster?',
      fr: 'Quelle fête préfères-tu ?',
      es: '¿Cuál es tu día festivo favorito?',
      'zh-CN': '你最喜欢的节日是哪一个？',
    },
  },
  {
    id: 'talk.travelMustBring',
    category: 'talk',
    text: {
      'zh-TW': '你出門旅行一定會帶的一樣東西是什麼？',
      en: 'What is the one thing you always pack for a trip?',
      ja: '旅行に絶対持っていくものは何？',
      ko: '여행 갈 때 꼭 챙기는 물건 하나는 뭐예요?',
      de: 'Was packst du auf jede Reise garantiert ein?',
      fr: 'Quel objet emportes-tu systématiquement en voyage ?',
      es: '¿Qué es lo que siempre metes en la maleta?',
      'zh-CN': '你出门旅行一定会带的一样东西是什么？',
    },
  },
  {
    id: 'talk.cantActually',
    category: 'talk',
    text: {
      'zh-TW': '說一件別人以為你會、但其實你不會的事！',
      en: 'Name something people assume you can do but you actually cannot!',
      ja: 'できると思われているけど、実はできないことを一つ言って！',
      ko: '남들은 잘할 거라 생각하지만 사실은 못하는 것 하나 말해 보세요!',
      de: 'Nenne etwas, von dem alle denken, du könntest es — kannst du aber nicht!',
      fr: 'Dis une chose que les gens pensent que tu sais faire alors que non !',
      es: '¡Di algo que todos creen que sabes hacer pero en realidad no!',
      'zh-CN': '说一件别人以为你会、但其实你不会的事！',
    },
  },
  {
    id: 'talk.bestAboutGrowingUp',
    category: 'talk',
    text: {
      'zh-TW': '你覺得長大之後最好的一件事是什麼？',
      en: 'What is the best thing about being grown up?',
      ja: '大人になっていちばん良かったことは何？',
      ko: '어른이 되고 나서 제일 좋은 점은 뭐예요?',
      de: 'Was ist das Beste daran, erwachsen zu sein?',
      fr: 'C’est quoi le meilleur côté du fait d’être adulte ?',
      es: '¿Qué es lo mejor de ser adulto?',
      'zh-CN': '你觉得长大之后最好的一件事是什么？',
    },
  },
  {
    id: 'talk.following',
    category: 'talk',
    text: {
      'zh-TW': '你最近在追什麼？（劇、球隊、什麼都算）',
      en: 'What are you following right now — a show, a team, anything?',
      ja: '今ハマって追いかけているものは？（ドラマでもチームでも何でも）',
      ko: '요즘 챙겨 보는 게 뭐예요? 드라마든 팀이든 뭐든.',
      de: 'Was verfolgst du gerade — eine Serie, ein Team, irgendetwas?',
      fr: 'Tu suis quoi en ce moment — une série, une équipe, n’importe quoi ?',
      es: '¿Qué estás siguiendo ahora mismo: una serie, un equipo, lo que sea?',
      'zh-CN': '你最近在追什么？（剧、球队、什么都算）',
    },
  },
  {
    id: 'talk.treasuredThing',
    category: 'talk',
    text: {
      'zh-TW': '說一樣你很珍惜的東西，還有它是怎麼來的！',
      en: 'Name something you treasure and how you got it!',
      ja: '大切にしているものと、それを手に入れた経緯を話して！',
      ko: '아끼는 물건 하나와 그게 어떻게 생겼는지 말해 보세요!',
      de: 'Nenne etwas, das dir viel bedeutet, und wie du es bekommen hast!',
      fr: 'Cite un objet auquel tu tiens et raconte comment tu l’as eu !',
      es: '¡Di algo que aprecias mucho y cómo llegó a tus manos!',
      'zh-CN': '说一样你很珍惜的东西，还有它是怎么来的！',
    },
  },
  {
    id: 'talk.tenYearsAgo',
    category: 'talk',
    text: {
      'zh-TW': '如果可以跟十年前的自己說一句話，你會說什麼？',
      en: 'If you could say one sentence to yourself ten years ago, what would it be?',
      ja: '十年前の自分に一言だけ言えるとしたら、何て言う？',
      ko: '십 년 전의 나에게 한마디만 할 수 있다면 뭐라고 할래요?',
      de: 'Wenn du deinem Ich von vor zehn Jahren einen Satz sagen könntest, welchen?',
      fr: 'Si tu pouvais dire une phrase à toi d’il y a dix ans, ce serait quoi ?',
      es: 'Si pudieras decirle una frase a ti de hace diez años, ¿cuál sería?',
      'zh-CN': '如果可以跟十年前的自己说一句话，你会说什么？',
    },
  },
  {
    id: 'talk.greatDay',
    category: 'talk',
    text: {
      'zh-TW': '你覺得什麼樣的一天算是很棒的一天？',
      en: 'What makes a day a really good day for you?',
      ja: 'どんな一日を「いい一日」だと思う？',
      ko: '어떤 하루가 정말 좋은 하루라고 생각해요?',
      de: 'Was macht für dich einen richtig guten Tag aus?',
      fr: 'C’est quoi une très bonne journée pour toi ?',
      es: '¿Qué hace que un día sea un buen día para ti?',
      'zh-CN': '你觉得什么样的一天算是很棒的一天？',
    },
  },
  {
    id: 'talk.joinedGroup',
    category: 'talk',
    text: {
      'zh-TW': '你是怎麼來到這個聚會的？',
      en: 'How did you end up at this get-together?',
      ja: 'この集まりに来ることになったきっかけは？',
      ko: '이 모임에 어떻게 오게 됐어요?',
      de: 'Wie bist du zu diesem Treffen gekommen?',
      fr: 'Qu’est-ce qui t’a amené ici aujourd’hui ?',
      es: '¿Cómo acabaste viniendo a esta reunión?',
      'zh-CN': '你是怎么来到这个聚会的？',
    },
  },
  {
    id: 'talk.smallJoy',
    category: 'talk',
    text: {
      'zh-TW': '說一件這禮拜發生的小確幸！',
      en: 'Name one small good thing that happened this week!',
      ja: '今週あった小さな幸せを一つ言って！',
      ko: '이번 주에 있었던 소소한 행복 하나 말해 보세요!',
      de: 'Nenne eine kleine schöne Sache aus dieser Woche!',
      fr: 'Dis un petit bonheur qui t’est arrivé cette semaine !',
      es: '¡Di una pequeña alegría que hayas tenido esta semana!',
      'zh-CN': '说一件这礼拜发生的小确幸！',
    },
  },
  {
    id: 'talk.prayFor',
    category: 'talk',
    text: {
      'zh-TW': '說一個你最近想為他禱告的人，講名字就好！',
      en: 'Name someone you would like to pray for — just the name is enough!',
      ja: '今、祈りたい人の名前を一人だけ挙げて！',
      ko: '요즘 기도해 주고 싶은 사람 이름만 하나 말해 보세요!',
      de: 'Nenne jemanden, für den du beten möchtest — der Name reicht!',
      fr: 'Cite quelqu’un pour qui tu voudrais prier — le prénom suffit !',
      es: '¡Di alguien por quien te gustaría orar; con el nombre basta!',
      'zh-CN': '说一个你最近想为他祷告的人，讲名字就好！',
    },
  },
  {
    id: 'talk.favoriteHymn',
    category: 'talk',
    text: {
      'zh-TW': '你最喜歡的一首詩歌是哪一首？',
      en: 'What is your favourite worship song?',
      ja: 'いちばん好きな讃美歌は？',
      ko: '가장 좋아하는 찬양은 뭐예요?',
      de: 'Was ist dein liebstes Lobpreislied?',
      fr: 'Quel est ton chant de louange préféré ?',
      es: '¿Cuál es tu canción de alabanza favorita?',
      'zh-CN': '你最喜欢的一首诗歌是哪一首？',
    },
  },
  {
    id: 'talk.grateful',
    category: 'talk',
    text: {
      'zh-TW': '說一件讓你感到感恩的事！',
      en: 'Name something that makes you feel grateful!',
      ja: 'ありがたいなと思うことを一つ言って！',
      ko: '감사하다고 느끼는 일 하나 말해 보세요!',
      de: 'Nenne etwas, wofür du dankbar bist!',
      fr: 'Dis une chose pour laquelle tu te sens reconnaissant !',
      es: '¡Di algo por lo que te sientas agradecido!',
      'zh-CN': '说一件让你感到感恩的事！',
    },
  },

  // ---------- 動作型：聲音與模仿（13 題）----------
  {
    id: 'voice.animalGuess',
    category: 'voice',
    text: {
      'zh-TW': '發出一個動物叫聲，讓大家猜是什麼！',
      en: 'Make an animal sound and let everyone guess what it is!',
      ja: '動物の鳴き声を一つ出して、みんなに当ててもらって！',
      ko: '동물 소리를 하나 내고 다 같이 맞혀 보게 하세요!',
      de: 'Mach ein Tiergeräusch und lass die anderen raten, welches Tier!',
      fr: 'Fais un cri d’animal et laisse les autres deviner lequel !',
      es: '¡Haz un sonido de animal y que los demás adivinen cuál es!',
      'zh-CN': '发出一个动物叫声，让大家猜是什么！',
    },
  },
  {
    id: 'voice.angryLove',
    category: 'voice',
    text: {
      'zh-TW': '用最兇的語氣說「我愛你」！',
      en: 'Say “I love you” in the angriest voice you can!',
      ja: 'いちばん怖い声で「愛してる」と言って！',
      ko: '가장 무서운 말투로 “사랑해”라고 말해 보세요!',
      de: 'Sag „Ich liebe dich“ im wütendsten Ton, den du hinkriegst!',
      fr: 'Dis « je t’aime » sur le ton le plus menaçant possible !',
      es: '¡Di «te quiero» con el tono más enfadado que puedas!',
      'zh-CN': '用最凶的语气说「我爱你」！',
    },
  },
  {
    id: 'voice.whisperChorus',
    category: 'voice',
    text: {
      'zh-TW': '用氣音唱出一首歌的副歌，讓大家猜是哪首！',
      en: 'Whisper-sing a chorus and let everyone guess the song!',
      ja: '息だけでサビを歌って、何の曲か当ててもらって！',
      ko: '바람 소리로 후렴을 부르고 무슨 노래인지 맞혀 보게 하세요!',
      de: 'Flüstere einen Refrain und lass die anderen das Lied erraten!',
      fr: 'Chuchote un refrain et laisse les autres deviner la chanson !',
      es: '¡Canta un estribillo susurrando y que adivinen la canción!',
      'zh-CN': '用气音唱出一首歌的副歌，让大家猜是哪首！',
    },
  },
  {
    id: 'voice.newsAnchor',
    category: 'voice',
    text: {
      'zh-TW': '模仿新聞主播播報「今天天氣很好」！',
      en: 'Read “the weather is lovely today” like a news anchor!',
      ja: 'ニュースキャスターになりきって「今日はいい天気です」と読んで！',
      ko: '뉴스 앵커처럼 “오늘 날씨가 참 좋습니다”라고 읽어 보세요!',
      de: 'Lies „Heute ist schönes Wetter“ wie ein Nachrichtensprecher!',
      fr: 'Annonce « il fait très beau aujourd’hui » comme un présentateur du JT !',
      es: '¡Di «hoy hace muy buen tiempo» como un presentador de telediario!',
      'zh-CN': '模仿新闻主播播报「今天天气很好」！',
    },
  },
  {
    id: 'voice.cryingFull',
    category: 'voice',
    text: {
      'zh-TW': '用哭腔說「我吃飽了」！',
      en: 'Say “I am full” like you are about to burst into tears!',
      ja: '泣きそうな声で「おなかいっぱい」と言って！',
      ko: '울먹이는 목소리로 “배불러요”라고 말해 보세요!',
      de: 'Sag „Ich bin satt“ mit weinerlicher Stimme!',
      fr: 'Dis « j’ai bien mangé » avec une voix au bord des larmes !',
      es: '¡Di «estoy lleno» con voz de estar a punto de llorar!',
      'zh-CN': '用哭腔说「我吃饱了」！',
    },
  },
  {
    id: 'voice.singName',
    category: 'voice',
    text: {
      'zh-TW': '用唱歌的方式說出你的名字！',
      en: 'Sing your own name instead of saying it!',
      ja: '自分の名前を歌うように言って！',
      ko: '자기 이름을 노래하듯이 말해 보세요!',
      de: 'Sing deinen eigenen Namen, statt ihn zu sagen!',
      fr: 'Chante ton prénom au lieu de le dire !',
      es: '¡Canta tu propio nombre en vez de decirlo!',
      'zh-CN': '用唱歌的方式说出你的名字！',
    },
  },
  {
    id: 'voice.vehicle',
    category: 'voice',
    text: {
      'zh-TW': '模仿一種交通工具的聲音！',
      en: 'Imitate the sound of a vehicle!',
      ja: '乗り物の音を一つまねして！',
      ko: '탈것 소리를 하나 흉내 내 보세요!',
      de: 'Ahme das Geräusch eines Fahrzeugs nach!',
      fr: 'Imite le bruit d’un véhicule !',
      es: '¡Imita el sonido de un vehículo!',
      'zh-CN': '模仿一种交通工具的声音！',
    },
  },
  {
    /*
     * QUESTIONS.md 說明過：台語是台灣的在地語言，直譯到別的語言沒有對應。
     * 其他語言一律換成「你會的另一種語言或方言」，難度與笑點都保得住。
     */
    id: 'voice.dialectFruits',
    category: 'voice',
    text: {
      'zh-TW': '用台語說出兩種水果！',
      en: 'Name two fruits in another language or dialect you know!',
      ja: '方言で果物を二つ言って！',
      ko: '사투리로 과일 두 가지를 말해 보세요!',
      de: 'Nenne zwei Obstsorten in einem Dialekt oder einer anderen Sprache!',
      fr: 'Nomme deux fruits dans une autre langue ou un patois que tu connais !',
      es: '¡Di dos frutas en otro idioma o dialecto que conozcas!',
      'zh-CN': '用方言说出两种水果！',
    },
  },
  {
    id: 'voice.soDelicious',
    category: 'voice',
    text: {
      'zh-TW': '用最浮誇的語氣說「這也太好吃了吧」！',
      en: 'Say “this is unbelievably good” as over the top as you can!',
      ja: 'これでもかというくらい大げさに「めちゃくちゃおいしい！」と言って！',
      ko: '최대한 오버해서 “이거 진짜 너무 맛있다”라고 말해 보세요!',
      de: 'Sag „Das ist ja unfassbar lecker“ so übertrieben wie möglich!',
      fr: 'Dis « c’est trop bon » de la façon la plus exagérée possible !',
      es: '¡Di «esto está buenísimo» de la forma más exagerada posible!',
      'zh-CN': '用最浮夸的语气说「这也太好吃了吧」！',
    },
  },
  {
    id: 'voice.babyCry',
    category: 'voice',
    text: {
      'zh-TW': '學嬰兒哭三秒鐘！',
      en: 'Cry like a baby for three seconds!',
      ja: '赤ちゃんの泣き声を三秒間まねして！',
      ko: '아기 우는 소리를 3초 동안 흉내 내 보세요!',
      de: 'Wein drei Sekunden lang wie ein Baby!',
      fr: 'Pleure comme un bébé pendant trois secondes !',
      es: '¡Llora como un bebé durante tres segundos!',
      'zh-CN': '学婴儿哭三秒钟！',
    },
  },
  {
    id: 'voice.slowMotion',
    category: 'voice',
    text: {
      'zh-TW': '用超級慢的速度說完「我現在手上有一顆炸彈」！',
      en: 'Say “I am holding a bomb right now” in extreme slow motion!',
      ja: '超スローで「今わたしの手に爆弾があります」と言い切って！',
      ko: '아주 느린 속도로 “지금 내 손에 폭탄이 있어요”를 끝까지 말해 보세요!',
      de: 'Sag „Ich halte gerade eine Bombe in der Hand“ in extremer Zeitlupe!',
      fr: 'Dis « j’ai une bombe entre les mains » au ralenti extrême !',
      es: '¡Di «ahora mismo tengo una bomba en las manos» a cámara muy lenta!',
      'zh-CN': '用超级慢的速度说完「我现在手上有一颗炸弹」！',
    },
  },
  {
    id: 'voice.robot',
    category: 'voice',
    text: {
      'zh-TW': '用機器人的聲音說「今天很高興見到大家」！',
      en: 'Say “great to see you all today” in a robot voice!',
      ja: 'ロボットの声で「今日はみなさんに会えてうれしいです」と言って！',
      ko: '로봇 목소리로 “오늘 여러분을 만나서 반갑습니다”라고 말해 보세요!',
      de: 'Sag „Schön, euch heute alle zu sehen“ mit Roboterstimme!',
      fr: 'Dis « content de tous vous voir aujourd’hui » avec une voix de robot !',
      es: '¡Di «me alegro de veros hoy» con voz de robot!',
      'zh-CN': '用机器人的声音说「今天很高兴见到大家」！',
    },
  },
  {
    id: 'voice.twoAnimals',
    category: 'voice',
    text: {
      'zh-TW': '學兩種動物叫聲！',
      en: 'Make the sounds of two different animals!',
      ja: '動物の鳴き声を二種類まねして！',
      ko: '동물 소리 두 가지를 흉내 내 보세요!',
      de: 'Ahme die Geräusche von zwei verschiedenen Tieren nach!',
      fr: 'Imite les cris de deux animaux différents !',
      es: '¡Imita los sonidos de dos animales distintos!',
      'zh-CN': '学两种动物叫声！',
    },
  },

  // ---------- 動作型：快問快答（10 題）----------
  {
    id: 'quickfire.threeFruits',
    category: 'quickfire',
    text: {
      'zh-TW': '說出三個水果的名字，中間不能停超過兩秒！',
      en: 'Name three fruits without pausing more than two seconds between them!',
      ja: '果物の名前を三つ、二秒以上止まらずに言って！',
      ko: '과일 이름 세 개를 2초 이상 멈추지 않고 말해 보세요!',
      de: 'Nenne drei Obstsorten, ohne länger als zwei Sekunden zu stocken!',
      fr: 'Nomme trois fruits sans t’arrêter plus de deux secondes !',
      es: '¡Di tres frutas sin parar más de dos segundos entre una y otra!',
      'zh-CN': '说出三个水果的名字，中间不能停超过两秒！',
    },
  },
  {
    id: 'quickfire.threeCountries',
    category: 'quickfire',
    text: {
      'zh-TW': '十秒內說出三個國家的名字！',
      en: 'Name three countries in ten seconds!',
      ja: '十秒以内に国名を三つ言って！',
      ko: '10초 안에 나라 이름 세 개를 말해 보세요!',
      de: 'Nenne in zehn Sekunden drei Länder!',
      fr: 'Cite trois pays en dix secondes !',
      es: '¡Di tres países en diez segundos!',
      'zh-CN': '十秒内说出三个国家的名字！',
    },
  },
  {
    id: 'quickfire.countdownClap',
    category: 'quickfire',
    text: {
      'zh-TW': '從 30 倒數到 20，遇到 5 的倍數要拍手！',
      en: 'Count down from 30 to 20, clapping on every multiple of five!',
      ja: '30 から 20 まで逆に数えて、5 の倍数で手をたたいて！',
      ko: '30부터 20까지 거꾸로 세면서 5의 배수마다 손뼉을 치세요!',
      de: 'Zähl von 30 auf 20 rückwärts und klatsche bei jedem Vielfachen von fünf!',
      fr: 'Compte à rebours de 30 à 20 en tapant dans tes mains à chaque multiple de cinq !',
      es: '¡Cuenta hacia atrás de 30 a 20 y da una palmada en cada múltiplo de cinco!',
      'zh-CN': '从 30 倒数到 20，遇到 5 的倍数要拍手！',
    },
  },
  {
    id: 'quickfire.threeColours',
    category: 'quickfire',
    text: {
      'zh-TW': '十秒內說出三種你身上有的顏色！',
      en: 'Name three colours you are wearing, in ten seconds!',
      ja: '十秒以内に、今身につけている色を三つ言って！',
      ko: '10초 안에 지금 몸에 걸친 색깔 세 가지를 말해 보세요!',
      de: 'Nenne in zehn Sekunden drei Farben, die du gerade trägst!',
      fr: 'Cite en dix secondes trois couleurs que tu portes !',
      es: '¡Di en diez segundos tres colores que lleves puestos!',
      'zh-CN': '十秒内说出三种你身上有的颜色！',
    },
  },
  {
    id: 'quickfire.fridgeItems',
    category: 'quickfire',
    text: {
      'zh-TW': '說出三樣冰箱裡常會有的東西！',
      en: 'Name three things you usually find in a fridge!',
      ja: '冷蔵庫によく入っているものを三つ言って！',
      ko: '냉장고에 흔히 있는 것 세 가지를 말해 보세요!',
      de: 'Nenne drei Dinge, die meistens im Kühlschrank sind!',
      fr: 'Cite trois choses qu’on trouve souvent dans un frigo !',
      es: '¡Di tres cosas que suele haber en una nevera!',
      'zh-CN': '说出三样冰箱里常会有的东西！',
    },
  },
  {
    id: 'quickfire.threeIdioms',
    category: 'quickfire',
    text: {
      'zh-TW': '連續說出三個成語！',
      en: 'Rattle off three idioms or set phrases in a row!',
      ja: '四字熟語かことわざを三つ続けて言って！',
      ko: '사자성어나 속담 세 개를 연달아 말해 보세요!',
      de: 'Sag drei Redewendungen am Stück auf!',
      fr: 'Enchaîne trois expressions toutes faites !',
      es: '¡Suelta tres refranes o frases hechas seguidos!',
      'zh-CN': '连续说出三个成语！',
    },
  },
  {
    /*
     * 「不能有重複的字」是漢字才成立的限制。拼音語言換成「開頭字母不能重複」，
     * 保住「講得出來還不夠、要多想一層」的那層難度（QUESTIONS.md）。
     */
    id: 'quickfire.threeCities',
    category: 'quickfire',
    text: {
      'zh-TW': '說出三個台灣的縣市，而且不能有重複的字！',
      en: 'Name three cities that all start with different letters!',
      ja: '同じ文字で始まらない都市名を三つ言って！',
      ko: '서로 다른 글자로 시작하는 도시 이름 세 개를 말해 보세요!',
      de: 'Nenne drei Städte, die alle mit einem anderen Buchstaben anfangen!',
      fr: 'Cite trois villes commençant chacune par une lettre différente !',
      es: '¡Di tres ciudades que empiecen cada una por una letra distinta!',
      'zh-CN': '说出三个中国的城市，而且不能有重复的字！',
    },
  },
  {
    id: 'quickfire.threeApps',
    category: 'quickfire',
    text: {
      'zh-TW': '十秒內說出三個手機 App 的名字！',
      en: 'Name three phone apps in ten seconds!',
      ja: '十秒以内にスマホアプリの名前を三つ言って！',
      ko: '10초 안에 휴대폰 앱 이름 세 개를 말해 보세요!',
      de: 'Nenne in zehn Sekunden drei Handy-Apps!',
      fr: 'Cite trois applis de téléphone en dix secondes !',
      es: '¡Di tres aplicaciones del móvil en diez segundos!',
      'zh-CN': '十秒内说出三个手机 App 的名字！',
    },
  },
  {
    id: 'quickfire.thingsInRoom',
    category: 'quickfire',
    text: {
      'zh-TW': '說出三種在這個房間裡看得到的東西！',
      en: 'Name three things you can see in this room!',
      ja: 'この部屋の中に見えるものを三つ言って！',
      ko: '이 방에서 보이는 것 세 가지를 말해 보세요!',
      de: 'Nenne drei Dinge, die du in diesem Raum sehen kannst!',
      fr: 'Cite trois choses que tu vois dans cette pièce !',
      es: '¡Di tres cosas que puedas ver en esta sala!',
      'zh-CN': '说出三种在这个房间里看得到的东西！',
    },
  },
  {
    id: 'quickfire.twoNames',
    category: 'quickfire',
    familiar: true,
    text: {
      'zh-TW': '說出在場兩個人的名字！',
      en: 'Say the names of two people in the room!',
      ja: 'この場にいる二人の名前を言って！',
      ko: '이 자리에 있는 두 사람의 이름을 말해 보세요!',
      de: 'Nenne die Namen von zwei Leuten hier im Raum!',
      fr: 'Dis les prénoms de deux personnes présentes !',
      es: '¡Di los nombres de dos personas que estén aquí!',
      'zh-CN': '说出在场两个人的名字！',
    },
  },

  // ---------- 動作型：表情與肢體（12 題）----------
  {
    id: 'gesture.emotionFace',
    category: 'gesture',
    text: {
      'zh-TW': '做一個表情，讓大家猜你在演什麼情緒！',
      en: 'Pull a face and let everyone guess the emotion!',
      ja: '表情を一つ作って、どんな感情か当ててもらって！',
      ko: '표정을 하나 짓고 무슨 감정인지 맞혀 보게 하세요!',
      de: 'Zieh eine Grimasse und lass die anderen das Gefühl erraten!',
      fr: 'Fais une tête et laisse les autres deviner l’émotion !',
      es: '¡Pon una cara y que los demás adivinen la emoción!',
      'zh-CN': '做一个表情，让大家猜你在演什么情绪！',
    },
  },
  {
    id: 'gesture.animalHands',
    category: 'gesture',
    text: {
      'zh-TW': '用手比出一個動物，讓大家猜！',
      en: 'Shape an animal with your hands and let everyone guess!',
      ja: '手だけで動物を作って、みんなに当ててもらって！',
      ko: '손으로 동물을 만들어서 다 같이 맞혀 보게 하세요!',
      de: 'Forme mit den Händen ein Tier und lass die anderen raten!',
      fr: 'Forme un animal avec tes mains et laisse les autres deviner !',
      es: '¡Haz un animal con las manos y que los demás lo adivinen!',
      'zh-CN': '用手比出一个动物，让大家猜！',
    },
  },
  {
    id: 'gesture.findRed',
    category: 'gesture',
    text: {
      'zh-TW': '現場找出一樣紅色的東西，舉起來！',
      en: 'Find something red around you and hold it up!',
      ja: '身のまわりから赤いものを見つけて掲げて！',
      ko: '주변에서 빨간 물건을 찾아 들어 올리세요!',
      de: 'Finde etwas Rotes in deiner Nähe und halte es hoch!',
      fr: 'Trouve quelque chose de rouge autour de toi et lève-le !',
      es: '¡Busca algo rojo a tu alrededor y levántalo!',
      'zh-CN': '现场找出一样红色的东西，举起来！',
    },
  },
  {
    id: 'gesture.bodyLetter',
    category: 'gesture',
    text: {
      'zh-TW': '用身體比出一個英文字母！',
      en: 'Form a letter of the alphabet with your body!',
      ja: '体でアルファベットを一文字つくって！',
      ko: '몸으로 알파벳 한 글자를 만들어 보세요!',
      de: 'Stell mit deinem Körper einen Buchstaben dar!',
      fr: 'Forme une lettre de l’alphabet avec ton corps !',
      es: '¡Forma una letra del abecedario con el cuerpo!',
      'zh-CN': '用身体比出一个英文字母！',
    },
  },
  {
    id: 'gesture.twoFaces',
    category: 'gesture',
    text: {
      'zh-TW': '連續做出兩個不同的鬼臉！',
      en: 'Pull two different silly faces in a row!',
      ja: '違う変顔を二つ続けてやって！',
      ko: '서로 다른 우스꽝스러운 표정 두 개를 연달아 지어 보세요!',
      de: 'Schneide zwei verschiedene Grimassen hintereinander!',
      fr: 'Fais deux grimaces différentes à la suite !',
      es: '¡Pon dos muecas distintas seguidas!',
      'zh-CN': '连续做出两个不同的鬼脸！',
    },
  },
  {
    id: 'gesture.hotNoodles',
    category: 'gesture',
    text: {
      'zh-TW': '假裝你正在吃一碗很燙的麵！',
      en: 'Pretend you are eating a bowl of scalding hot noodles!',
      ja: '熱々の麺を食べているふりをして！',
      ko: '아주 뜨거운 국수를 먹는 척해 보세요!',
      de: 'Tu so, als würdest du eine Schüssel kochend heiße Nudeln essen!',
      fr: 'Fais semblant de manger un bol de nouilles brûlantes !',
      es: '¡Haz como si comieras un plato de fideos hirviendo!',
      'zh-CN': '假装你正在吃一碗很烫的面！',
    },
  },
  {
    id: 'gesture.twoMimes',
    category: 'gesture',
    text: {
      'zh-TW': '用手勢演出「開車」「游泳」兩個動作！',
      en: 'Mime driving and swimming!',
      ja: '「運転」「泳ぐ」の二つをジェスチャーでやって！',
      ko: '“운전”, “수영” 두 동작을 몸짓으로 표현해 보세요!',
      de: 'Mime Autofahren und Schwimmen!',
      fr: 'Mime conduire et nager !',
      es: '¡Haz mímica de conducir y nadar!',
      'zh-CN': '用手势演出「开车」「游泳」两个动作！',
    },
  },
  {
    id: 'gesture.spinOnce',
    category: 'gesture',
    text: {
      'zh-TW': '站起來原地轉一圈再坐下！',
      en: 'Stand up, spin around once, and sit back down!',
      ja: '立ち上がってその場で一回転してから座って！',
      ko: '일어나서 제자리에서 한 바퀴 돌고 다시 앉으세요!',
      de: 'Steh auf, dreh dich einmal um dich selbst und setz dich wieder!',
      fr: 'Lève-toi, fais un tour sur toi-même et rassieds-toi !',
      es: '¡Levántate, da una vuelta sobre ti mismo y siéntate!',
      'zh-CN': '站起来原地转一圈再坐下！',
    },
  },
  {
    id: 'gesture.selfiePoses',
    category: 'gesture',
    text: {
      'zh-TW': '假裝你在自拍，擺兩個不同的姿勢！',
      en: 'Pretend to take a selfie, striking two different poses!',
      ja: '自撮りのふりをして、違うポーズを二つ決めて！',
      ko: '셀카 찍는 척하면서 서로 다른 포즈 두 개를 취해 보세요!',
      de: 'Tu so, als machtest du ein Selfie, mit zwei verschiedenen Posen!',
      fr: 'Fais semblant de prendre un selfie avec deux poses différentes !',
      es: '¡Haz como si te hicieras un selfi con dos poses distintas!',
      'zh-CN': '假装你在自拍，摆两个不同的姿势！',
    },
  },
  {
    id: 'gesture.holdWorkout',
    category: 'gesture',
    text: {
      'zh-TW': '做一個健身動作，維持五秒！',
      en: 'Hold one workout pose for five seconds!',
      ja: '筋トレのポーズを一つ、五秒キープして！',
      ko: '운동 동작 하나를 5초 동안 유지해 보세요!',
      de: 'Halte eine Fitnessübung fünf Sekunden lang!',
      fr: 'Tiens une position de sport pendant cinq secondes !',
      es: '¡Aguanta una postura de ejercicio durante cinco segundos!',
      'zh-CN': '做一个健身动作，维持五秒！',
    },
  },
  {
    id: 'gesture.bigStretch',
    category: 'gesture',
    text: {
      'zh-TW': '用最誇張的方式伸一個懶腰！',
      en: 'Do the most dramatic stretch you can manage!',
      ja: 'これ以上ないくらい大げさに伸びをして！',
      ko: '최대한 과장되게 기지개를 켜 보세요!',
      de: 'Streck dich so übertrieben wie nur möglich!',
      fr: 'Fais l’étirement le plus théâtral possible !',
      es: '¡Haz el estiramiento más exagerado que puedas!',
      'zh-CN': '用最夸张的方式伸一个懒腰！',
    },
  },
  {
    id: 'gesture.silentHello',
    category: 'gesture',
    text: {
      'zh-TW': '不出聲，只用眼神跟左邊的人打招呼！',
      en: 'Greet the person on your left using only your eyes, no sound!',
      ja: '声を出さず、目だけで左の人にあいさつして！',
      ko: '소리 내지 말고 눈빛만으로 왼쪽 사람에게 인사하세요!',
      de: 'Begrüße die Person links von dir nur mit den Augen, ohne Ton!',
      fr: 'Salue la personne à ta gauche uniquement avec les yeux, sans un bruit !',
      es: '¡Saluda a quien tienes a la izquierda solo con la mirada, sin hacer ruido!',
      'zh-CN': '不出声，只用眼神跟左边的人打招呼！',
    },
  },

  // ---------- 動作型：跟旁邊的人互動（10 題）----------
  {
    id: 'interact.highFive',
    category: 'interact',
    text: {
      'zh-TW': '跟對面的人擊掌，並說一句鼓勵的話！',
      en: 'High-five the person opposite you and say something encouraging!',
      ja: '向かいの人とハイタッチして、励ましの一言を！',
      ko: '맞은편 사람과 하이파이브하고 격려의 한마디를 건네세요!',
      de: 'Klatsch die Person gegenüber ab und sag ihr etwas Aufmunterndes!',
      fr: 'Tape dans la main de la personne en face et dis-lui un mot encourageant !',
      es: '¡Choca la mano con quien tienes enfrente y dile algo de ánimo!',
      'zh-CN': '跟对面的人击掌，并说一句鼓励的话！',
    },
  },
  {
    id: 'interact.rockPaperScissors',
    category: 'interact',
    text: {
      'zh-TW': '跟左邊的人猜拳，輸的人要稱讚對方一句！',
      en: 'Play rock-paper-scissors with the person on your left; the loser pays the winner a compliment!',
      ja: '左の人とじゃんけん。負けたほうが相手をほめて！',
      ko: '왼쪽 사람과 가위바위보를 하고, 진 사람이 상대를 칭찬하세요!',
      de: 'Spiel Schere-Stein-Papier mit der Person links; wer verliert, macht ein Kompliment!',
      fr: 'Fais pierre-feuille-ciseaux avec la personne à ta gauche ; le perdant fait un compliment !',
      es: '¡Juega a piedra-papel-tijera con quien tienes a la izquierda; quien pierda le hace un cumplido!',
      'zh-CN': '跟左边的人猜拳，输的人要称赞对方一句！',
    },
  },
  {
    id: 'interact.handshake',
    category: 'interact',
    text: {
      'zh-TW': '跟旁邊的人握手，說「今天很高興見到你」！',
      en: 'Shake hands with the person next to you and say “great to see you today”!',
      ja: '隣の人と握手して「今日会えてうれしいです」と言って！',
      ko: '옆 사람과 악수하며 “오늘 만나서 반가워요”라고 말하세요!',
      de: 'Gib der Person neben dir die Hand und sag „Schön, dich heute zu sehen“!',
      fr: 'Serre la main de ton voisin et dis-lui « content de te voir aujourd’hui » !',
      es: '¡Dale la mano a quien tienes al lado y dile «me alegro de verte hoy»!',
      'zh-CN': '跟旁边的人握手，说「今天很高兴见到你」！',
    },
  },
  {
    id: 'interact.stareDown',
    category: 'interact',
    text: {
      'zh-TW': '跟對面的人對看五秒，先笑的人輸！',
      en: 'Hold eye contact with the person opposite for five seconds; first to laugh loses!',
      ja: '向かいの人と五秒間見つめ合って、先に笑ったほうが負け！',
      ko: '맞은편 사람과 5초 동안 눈을 맞추고, 먼저 웃는 사람이 집니다!',
      de: 'Halte fünf Sekunden Blickkontakt mit der Person gegenüber; wer zuerst lacht, verliert!',
      fr: 'Fixe la personne en face pendant cinq secondes ; le premier qui rit a perdu !',
      es: '¡Mantén la mirada con quien tienes enfrente cinco segundos; pierde el primero que se ría!',
      'zh-CN': '跟对面的人对看五秒，先笑的人输！',
    },
  },
  {
    id: 'interact.sayToEveryone',
    category: 'interact',
    text: {
      'zh-TW': '對全場說一句你最想說的話！',
      en: 'Say the one thing you most want to say to everyone here!',
      ja: 'この場のみんなに、いちばん言いたい一言を！',
      ko: '이 자리에 있는 모두에게 가장 하고 싶은 한마디를 하세요!',
      de: 'Sag allen hier den einen Satz, den du am liebsten loswerden willst!',
      fr: 'Dis à tout le monde la phrase que tu as le plus envie de dire !',
      es: '¡Dile a todos la frase que más te apetece decir!',
      'zh-CN': '对全场说一句你最想说的话！',
    },
  },
  {
    id: 'interact.matchingColour',
    category: 'interact',
    text: {
      'zh-TW': '找一個跟你今天穿同色系的人，兩個人一起舉手！',
      en: 'Find someone wearing the same colour as you today and both raise your hands!',
      ja: '今日の服の色が近い人を見つけて、二人で手を挙げて！',
      ko: '오늘 옷 색이 비슷한 사람을 찾아 둘이 함께 손을 드세요!',
      de: 'Finde jemanden, der heute eine ähnliche Farbe trägt, und hebt beide die Hand!',
      fr: 'Trouve quelqu’un habillé dans les mêmes tons que toi et levez la main ensemble !',
      es: '¡Busca a alguien vestido de un color parecido al tuyo y levantad la mano los dos!',
      'zh-CN': '找一个跟你今天穿同色系的人，两个人一起举手！',
    },
  },
  {
    id: 'interact.inventMove',
    category: 'interact',
    text: {
      'zh-TW': '邀請全場一起做一個你當場設計的動作！',
      en: 'Invent a move on the spot and get everyone to do it with you!',
      ja: 'その場で動きを一つ考えて、みんなを巻き込んでやって！',
      ko: '즉석에서 동작을 하나 만들어 다 같이 따라 하게 하세요!',
      de: 'Denk dir spontan eine Bewegung aus und lass alle mitmachen!',
      fr: 'Invente un geste sur le moment et fais-le faire à tout le monde !',
      es: '¡Inventa un movimiento sobre la marcha y que todos lo hagan contigo!',
      'zh-CN': '邀请全场一起做一个你当场设计的动作！',
    },
  },
  {
    id: 'interact.describeRight',
    category: 'interact',
    familiar: true,
    text: {
      'zh-TW': '用一個形容詞描述你右邊的人！',
      en: 'Describe the person on your right in one adjective!',
      ja: '右の人を形容詞一つで表して！',
      ko: '오른쪽 사람을 형용사 하나로 표현해 보세요!',
      de: 'Beschreib die Person rechts von dir mit einem einzigen Adjektiv!',
      fr: 'Décris la personne à ta droite en un seul adjectif !',
      es: '¡Describe con un solo adjetivo a quien tienes a la derecha!',
      'zh-CN': '用一个形容词描述你右边的人！',
    },
  },
  {
    id: 'interact.firstImpression',
    category: 'interact',
    text: {
      'zh-TW': '說出你對右邊的人的第一印象！',
      en: 'Say what your first impression of the person on your right was!',
      ja: '右の人の第一印象を言って！',
      ko: '오른쪽 사람의 첫인상을 말해 보세요!',
      de: 'Sag, was dein erster Eindruck von der Person rechts von dir war!',
      fr: 'Dis quelle a été ta première impression de la personne à ta droite !',
      es: '¡Di cuál fue tu primera impresión de quien tienes a la derecha!',
      'zh-CN': '说出你对右边的人的第一印象！',
    },
  },
  {
    id: 'interact.duoPose',
    category: 'interact',
    text: {
      'zh-TW': '跟左邊的人一起做一個雙人合照的姿勢！',
      en: 'Strike a two-person photo pose with the person on your left!',
      ja: '左の人と二人でツーショットのポーズを決めて！',
      ko: '왼쪽 사람과 둘이 함께 사진 포즈를 취해 보세요!',
      de: 'Posiert mit der Person links von dir für ein gemeinsames Foto!',
      fr: 'Prends une pose de photo à deux avec la personne à ta gauche !',
      es: '¡Haz una pose de foto en pareja con quien tienes a la izquierda!',
      'zh-CN': '跟左边的人一起做一个双人合照的姿势！',
    },
  },
];

/*
 * build 時檢查題庫（scripts/build.js 會呼叫）。漏翻的題目在執行期只會變成空白卡片，
 * 現場才發現就來不及了，所以一律在 build 擋下來。
 */
export function checkQuestions(langs) {
  const ids = new Set();

  for (const question of QUESTIONS) {
    if (ids.has(question.id)) throw new Error(`題目 id 重複：${question.id}`);
    ids.add(question.id);

    if (!CATEGORIES.includes(question.category)) {
      throw new Error(`題目 ${question.id} 的分類 ${question.category} 不在 CATEGORIES 裡`);
    }

    for (const lang of langs) {
      if (!question.text[lang]) throw new Error(`題目 ${question.id} 少了 ${lang} 的文字`);
    }
  }

  // 分組要蓋掉每一個分類，漏一個的話那類題目會抽得到、但設定畫面上勾不到
  const grouped = CATEGORY_GROUPS.flatMap((group) => group.categories);
  for (const category of CATEGORIES) {
    if (!grouped.includes(category)) {
      throw new Error(`分類 ${category} 沒有被放進任何一個 CATEGORY_GROUPS`);
    }
  }
  for (const category of grouped) {
    if (!CATEGORIES.includes(category)) {
      throw new Error(`CATEGORY_GROUPS 裡的 ${category} 不在 CATEGORIES 裡`);
    }
  }

  // 每一類都要有題目：空的分類在設定畫面上是一個勾了也沒用的選項
  for (const category of CATEGORIES) {
    if (!QUESTIONS.some((question) => question.category === category)) {
      throw new Error(`分類 ${category} 一題都沒有`);
    }
  }
}

