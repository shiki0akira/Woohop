/*
 * 內建題庫。
 *
 * 每一題是「◯◯◯的人」這種描述句，玩家要在現場找到符合的人、請對方確認。
 * 題目本身沒有對錯，也不該出現分數的概念——這是破冰工具，不是問答遊戲。
 *
 * 出題的兩條原則（CONCEPT.md 第五節）：
 *   1. 不要出「在場沒有人符合」的題目——那一格會永遠打不了勾
 *   2. 也不要出「只有一個人符合」的題目——那個人會被全場輪流敲，
 *      整場低頭按確認，反而是最沒機會社交的人
 * 主持人開賽前會過一輪題庫，這兩件事在畫面上有提示。
 *
 * 保底題（ANCHORS）是另一組：3×3 與 5×5 的正中央固定放一道，不參與洗牌。
 * 它的檢核標準比一般題目嚴格得多，見下方註解。
 *
 * **翻譯**：8 種語言都要有，少一個 build 就會失敗（checkQuestions）。
 * 翻的時候顧的是「這句話在那個語言裡自然不自然」，不是逐字對齊中文——
 * 例如「吃火鍋一定加芋頭」在法文寫成 fondue chinoise、日文寫成鍋，
 * 而不是硬翻 huoguo。理由見 app/strings.js 開頭關於機器翻譯的那段。
 */

export const CATEGORIES = ['life', 'talent', 'experience', 'church', 'personality', 'food', 'hobby'];

/*
 * 保底題候選。
 *
 * **檢核標準只有一條：在場的每一位玩家，都要能在名單上找到至少一個符合的人。**
 * 是「每一位」不是「大部分人」——只要有一個人對不到，中央那格就卡住，
 * 而中央格同時卡在 4 條線上，整個保底機制就失效了。
 *
 * 所以這裡的條件只跟「有到場」或「不是自己」有關。像「找到一位異性朋友」
 * 這種看起來很簡單的題目**不能**當保底題：碰到姊妹小組或弟兄小組，
 * 全場每一個人都會卡住。想用那種題目就放進上面的洗牌題庫。
 */
export const ANCHORS = [
  {
    id: 'anchor.present',
    text: {
      'zh-TW': '今天有來聚會的人',
      en: 'Someone who showed up today',
      ja: '今日この集まりに来た人',
      ko: '오늘 모임에 온 사람',
      de: 'Jemand, der heute da ist',
      fr: 'Quelqu’un qui est venu aujourd’hui',
      es: 'Alguien que ha venido hoy',
      'zh-CN': '今天有来聚会的人',
    },
  },
  {
    id: 'anchor.talked',
    text: {
      'zh-TW': '今天跟你說過話的人',
      en: 'Someone you have talked to today',
      ja: '今日あなたと話した人',
      ko: '오늘 나와 이야기한 사람',
      de: 'Jemand, mit dem du heute gesprochen hast',
      fr: 'Quelqu’un à qui tu as parlé aujourd’hui',
      es: 'Alguien con quien has hablado hoy',
      'zh-CN': '今天跟你说过话的人',
    },
  },
];

export const DEFAULT_ANCHOR_ID = 'anchor.present';

export const QUESTIONS = [
  // 生活習慣
  {
    id: 'life.early',
    category: 'life',
    text: {
      'zh-TW': '早上六點前就起床的人',
      en: 'Someone who wakes up before 6 a.m.',
      ja: '朝6時前に起きる人',
      ko: '아침 6시 전에 일어나는 사람',
      de: 'Jemand, der vor 6 Uhr aufsteht',
      fr: 'Quelqu’un qui se lève avant 6 h',
      es: 'Alguien que se levanta antes de las 6',
      'zh-CN': '早上六点前就起床的人',
    },
  },
  {
    id: 'life.pet',
    category: 'life',
    text: {
      'zh-TW': '家裡有養寵物的人',
      en: 'Someone who has a pet at home',
      ja: '家でペットを飼っている人',
      ko: '집에서 반려동물을 키우는 사람',
      de: 'Jemand, der ein Haustier hat',
      fr: 'Quelqu’un qui a un animal à la maison',
      es: 'Alguien que tiene mascota en casa',
      'zh-CN': '家里有养宠物的人',
    },
  },
  {
    id: 'life.exercise',
    category: 'life',
    text: {
      'zh-TW': '每週都會運動的人',
      en: 'Someone who works out every week',
      ja: '毎週運動している人',
      ko: '매주 운동하는 사람',
      de: 'Jemand, der jede Woche Sport macht',
      fr: 'Quelqu’un qui fait du sport chaque semaine',
      es: 'Alguien que hace deporte cada semana',
      'zh-CN': '每周都会运动的人',
    },
  },
  {
    id: 'life.commute',
    category: 'life',
    text: {
      'zh-TW': '通勤超過半小時的人',
      en: 'Someone whose commute is over 30 minutes',
      ja: '通勤・通学に30分以上かかる人',
      ko: '통근·통학이 30분 넘는 사람',
      de: 'Jemand, der über 30 Minuten zur Arbeit braucht',
      fr: 'Quelqu’un dont le trajet dure plus de 30 minutes',
      es: 'Alguien que tarda más de 30 minutos en llegar',
      'zh-CN': '通勤超过半小时的人',
    },
  },
  {
    id: 'life.wallpaper',
    category: 'life',
    text: {
      'zh-TW': '手機桌布是自己拍的照片的人',
      en: 'Someone whose phone wallpaper is their own photo',
      ja: 'スマホの壁紙が自分で撮った写真の人',
      ko: '휴대폰 배경화면이 직접 찍은 사진인 사람',
      de: 'Jemand, dessen Handy-Hintergrund ein eigenes Foto ist',
      fr: 'Quelqu’un dont le fond d’écran est une photo qu’il a prise',
      es: 'Alguien cuyo fondo de pantalla es una foto suya',
      'zh-CN': '手机壁纸是自己拍的照片的人',
    },
  },
  {
    id: 'life.night',
    category: 'life',
    text: {
      'zh-TW': '昨天十二點前就睡的人',
      en: 'Someone who went to bed before midnight',
      ja: '昨日は12時前に寝た人',
      ko: '어제 12시 전에 잔 사람',
      de: 'Jemand, der gestern vor Mitternacht im Bett war',
      fr: 'Quelqu’un qui s’est couché avant minuit hier',
      es: 'Alguien que ayer se acostó antes de medianoche',
      'zh-CN': '昨天十二点前就睡的人',
    },
  },

  // 才藝專長
  {
    id: 'talent.instrument',
    category: 'talent',
    text: {
      'zh-TW': '會彈奏樂器的人',
      en: 'Someone who plays a musical instrument',
      ja: '楽器が弾ける人',
      ko: '악기를 다룰 줄 아는 사람',
      de: 'Jemand, der ein Instrument spielt',
      fr: 'Quelqu’un qui joue d’un instrument',
      es: 'Alguien que toca un instrumento',
      'zh-CN': '会弹奏乐器的人',
    },
  },
  {
    id: 'talent.sing',
    category: 'talent',
    text: {
      'zh-TW': '敢在大家面前唱歌的人',
      en: 'Someone brave enough to sing in front of others',
      ja: 'みんなの前で歌える人',
      ko: '사람들 앞에서 노래할 수 있는 사람',
      de: 'Jemand, der sich traut, vor anderen zu singen',
      fr: 'Quelqu’un qui ose chanter devant les autres',
      es: 'Alguien que se atreve a cantar delante de los demás',
      'zh-CN': '敢在大家面前唱歌的人',
    },
  },
  {
    id: 'talent.cook',
    category: 'talent',
    text: {
      'zh-TW': '會做一道拿手菜的人',
      en: 'Someone with a signature dish',
      ja: '得意料理が一つある人',
      ko: '자신 있는 요리가 하나 있는 사람',
      de: 'Jemand, der ein Lieblingsgericht draufhat',
      fr: 'Quelqu’un qui a un plat de signature',
      es: 'Alguien que tiene un plato estrella',
      'zh-CN': '会做一道拿手菜的人',
    },
  },
  {
    id: 'talent.language',
    category: 'talent',
    text: {
      'zh-TW': '會說第三種語言的人',
      en: 'Someone who speaks a third language',
      ja: '三つ目の言語が話せる人',
      ko: '세 번째 언어를 할 줄 아는 사람',
      de: 'Jemand, der eine dritte Sprache spricht',
      fr: 'Quelqu’un qui parle une troisième langue',
      es: 'Alguien que habla un tercer idioma',
      'zh-CN': '会说第三种语言的人',
    },
  },
  {
    id: 'talent.drive',
    category: 'talent',
    text: {
      'zh-TW': '會開車的人',
      en: 'Someone who can drive',
      ja: '車を運転できる人',
      ko: '운전할 줄 아는 사람',
      de: 'Jemand, der Auto fahren kann',
      fr: 'Quelqu’un qui sait conduire',
      es: 'Alguien que sabe conducir',
      'zh-CN': '会开车的人',
    },
  },
  {
    id: 'talent.craft',
    category: 'talent',
    text: {
      'zh-TW': '手很巧、會做手工的人',
      en: 'Someone who is good with their hands',
      ja: '手先が器用で工作が得意な人',
      ko: '손재주가 좋아 만들기를 잘하는 사람',
      de: 'Jemand, der handwerklich geschickt ist',
      fr: 'Quelqu’un d’habile de ses mains',
      es: 'Alguien mañoso con las manos',
      'zh-CN': '手很巧、会做手工的人',
    },
  },

  // 經歷
  {
    id: 'exp.abroad',
    category: 'experience',
    text: {
      'zh-TW': '去過國外旅行的人',
      en: 'Someone who has traveled abroad',
      ja: '海外旅行に行ったことがある人',
      ko: '해외여행을 가 본 사람',
      de: 'Jemand, der schon im Ausland war',
      fr: 'Quelqu’un qui a voyagé à l’étranger',
      es: 'Alguien que ha viajado al extranjero',
      'zh-CN': '去过国外旅行的人',
    },
  },
  {
    id: 'exp.moved',
    category: 'experience',
    text: {
      'zh-TW': '搬過三次以上家的人',
      en: 'Someone who has moved house 3+ times',
      ja: '3回以上引っ越したことがある人',
      ko: '이사를 세 번 넘게 해 본 사람',
      de: 'Jemand, der schon dreimal oder öfter umgezogen ist',
      fr: 'Quelqu’un qui a déménagé au moins trois fois',
      es: 'Alguien que se ha mudado tres veces o más',
      'zh-CN': '搬过三次以上家的人',
    },
  },
  {
    id: 'exp.stage',
    category: 'experience',
    text: {
      'zh-TW': '曾經上台表演過的人',
      en: 'Someone who has performed on stage',
      ja: '舞台に立って発表したことがある人',
      ko: '무대에 서서 공연해 본 사람',
      de: 'Jemand, der schon auf einer Bühne stand',
      fr: 'Quelqu’un qui est déjà monté sur scène',
      es: 'Alguien que ha actuado en un escenario',
      'zh-CN': '曾经上台表演过的人',
    },
  },
  {
    id: 'exp.kids',
    category: 'experience',
    text: {
      'zh-TW': '照顧過小孩的人',
      en: 'Someone who has taken care of a child',
      ja: '子どもの世話をしたことがある人',
      ko: '아이를 돌봐 본 사람',
      de: 'Jemand, der schon auf ein Kind aufgepasst hat',
      fr: 'Quelqu’un qui a déjà gardé un enfant',
      es: 'Alguien que ha cuidado de un niño',
      'zh-CN': '照顾过小孩的人',
    },
  },
  {
    id: 'exp.race',
    category: 'experience',
    text: {
      'zh-TW': '參加過路跑或馬拉松的人',
      en: 'Someone who has run a race',
      ja: 'マラソンやランニング大会に出たことがある人',
      ko: '마라톤이나 달리기 대회에 나가 본 사람',
      de: 'Jemand, der schon einen Lauf mitgemacht hat',
      fr: 'Quelqu’un qui a déjà couru une course',
      es: 'Alguien que ha corrido una carrera',
      'zh-CN': '参加过路跑或马拉松的人',
    },
  },
  {
    id: 'exp.away',
    category: 'experience',
    text: {
      'zh-TW': '曾經在外地讀書或工作的人',
      en: 'Someone who has studied or worked away from home',
      ja: '地元を離れて学んだり働いたりしたことがある人',
      ko: '고향을 떠나 공부하거나 일해 본 사람',
      de: 'Jemand, der schon auswärts studiert oder gearbeitet hat',
      fr: 'Quelqu’un qui a étudié ou travaillé loin de chez lui',
      es: 'Alguien que ha estudiado o trabajado fuera de casa',
      'zh-CN': '曾经在外地读书或工作的人',
    },
  },

  // 小組生活
  {
    id: 'church.new',
    category: 'church',
    text: {
      'zh-TW': '今年第一次來小組的人',
      en: 'Someone at small group for the first time this year',
      ja: '今年はじめて小グループに来た人',
      ko: '올해 처음 소그룹에 온 사람',
      de: 'Jemand, der dieses Jahr zum ersten Mal in der Gruppe ist',
      fr: 'Quelqu’un qui vient au groupe pour la première fois cette année',
      es: 'Alguien que viene al grupo por primera vez este año',
      'zh-CN': '今年第一次来小组的人',
    },
  },
  {
    id: 'church.sunday',
    category: 'church',
    text: {
      'zh-TW': '這個月每週都有來主日的人',
      en: 'Someone who came to service every week this month',
      ja: '今月は毎週礼拝に来ている人',
      ko: '이번 달 매주 예배에 온 사람',
      de: 'Jemand, der diesen Monat jede Woche im Gottesdienst war',
      fr: 'Quelqu’un qui est venu au culte chaque semaine ce mois-ci',
      es: 'Alguien que ha venido al culto cada semana este mes',
      'zh-CN': '这个月每周都有来主日聚会的人',
    },
  },
  {
    id: 'church.worship',
    category: 'church',
    text: {
      'zh-TW': '參與過敬拜服事的人',
      en: 'Someone who has served on the worship team',
      ja: '賛美チームで奉仕したことがある人',
      ko: '찬양팀에서 섬겨 본 사람',
      de: 'Jemand, der schon im Lobpreisteam mitgemacht hat',
      fr: 'Quelqu’un qui a déjà servi dans l’équipe de louange',
      es: 'Alguien que ha servido en el equipo de alabanza',
      'zh-CN': '参与过敬拜服事的人',
    },
  },
  {
    id: 'church.invite',
    category: 'church',
    text: {
      'zh-TW': '曾經邀請朋友來小組的人',
      en: 'Someone who has invited a friend to group',
      ja: '友だちを小グループに誘ったことがある人',
      ko: '친구를 소그룹에 초대해 본 사람',
      de: 'Jemand, der schon einen Freund in die Gruppe eingeladen hat',
      fr: 'Quelqu’un qui a déjà invité un ami au groupe',
      es: 'Alguien que ha invitado a un amigo al grupo',
      'zh-CN': '曾经邀请朋友来小组的人',
    },
  },
  {
    id: 'church.bible',
    category: 'church',
    text: {
      'zh-TW': '讀完過一整卷聖經的人',
      en: 'Someone who has read a whole book of the Bible',
      ja: '聖書を一巻まるごと読み通したことがある人',
      ko: '성경 한 권을 끝까지 읽어 본 사람',
      de: 'Jemand, der ein ganzes biblisches Buch durchgelesen hat',
      fr: 'Quelqu’un qui a lu un livre entier de la Bible',
      es: 'Alguien que ha leído un libro entero de la Biblia',
      'zh-CN': '读完过一整卷圣经的人',
    },
  },
  {
    id: 'church.serve',
    category: 'church',
    text: {
      'zh-TW': '在教會裡有固定服事的人',
      en: 'Someone who serves regularly at church',
      ja: '教会で定期的に奉仕している人',
      ko: '교회에서 꾸준히 섬기는 사람',
      de: 'Jemand, der regelmäßig in der Gemeinde mitarbeitet',
      fr: 'Quelqu’un qui sert régulièrement dans l’église',
      es: 'Alguien que sirve con regularidad en la iglesia',
      'zh-CN': '在教会里有固定服事的人',
    },
  },

  // 個性
  {
    id: 'pers.slow',
    category: 'personality',
    text: {
      'zh-TW': '自認是慢熱型的人',
      en: 'Someone who is slow to warm up',
      ja: '自分は打ち解けるのに時間がかかると思う人',
      ko: '스스로 낯을 가리는 편이라고 생각하는 사람',
      de: 'Jemand, der von sich sagt, dass er lange zum Auftauen braucht',
      fr: 'Quelqu’un qui se trouve long à se dérider',
      es: 'Alguien que se considera de arranque lento',
      'zh-CN': '自认是慢热型的人',
    },
  },
  {
    id: 'pers.list',
    category: 'personality',
    text: {
      'zh-TW': '做事之前一定先列清單的人',
      en: 'Someone who always makes a list first',
      ja: '何かする前に必ずリストを作る人',
      ko: '무슨 일이든 먼저 목록부터 만드는 사람',
      de: 'Jemand, der vorher immer eine Liste schreibt',
      fr: 'Quelqu’un qui fait toujours une liste avant',
      es: 'Alguien que siempre hace una lista antes',
      'zh-CN': '做事之前一定先列清单的人',
    },
  },
  {
    id: 'pers.alone',
    category: 'personality',
    text: {
      'zh-TW': '喜歡自己一個人充電的人',
      en: 'Someone who recharges alone',
      ja: '一人の時間で元気を取り戻す人',
      ko: '혼자 있는 시간으로 충전하는 사람',
      de: 'Jemand, der allein wieder auftankt',
      fr: 'Quelqu’un qui recharge ses batteries en solo',
      es: 'Alguien que recarga pilas estando a solas',
      'zh-CN': '喜欢自己一个人充电的人',
    },
  },
  {
    id: 'pers.quick',
    category: 'personality',
    text: {
      'zh-TW': '做決定很快的人',
      en: 'Someone who decides quickly',
      ja: '決断が早い人',
      ko: '결정을 빨리 내리는 사람',
      de: 'Jemand, der sich schnell entscheidet',
      fr: 'Quelqu’un qui décide vite',
      es: 'Alguien que decide rápido',
      'zh-CN': '做决定很快的人',
    },
  },
  {
    id: 'pers.birthday',
    category: 'personality',
    text: {
      'zh-TW': '記得住別人生日的人',
      en: 'Someone who remembers other people birthdays',
      ja: '人の誕生日を覚えている人',
      ko: '다른 사람 생일을 기억하는 사람',
      de: 'Jemand, der sich Geburtstage merkt',
      fr: 'Quelqu’un qui retient les anniversaires des autres',
      es: 'Alguien que se acuerda de los cumpleaños',
      'zh-CN': '记得住别人生日的人',
    },
  },
  {
    id: 'pers.patient',
    category: 'personality',
    text: {
      'zh-TW': '常常被說很有耐心的人',
      en: 'Someone often told they are patient',
      ja: 'よく「忍耐強いね」と言われる人',
      ko: '인내심이 많다는 말을 자주 듣는 사람',
      de: 'Jemand, dem oft gesagt wird, er sei geduldig',
      fr: 'Quelqu’un à qui on dit souvent qu’il est patient',
      es: 'Alguien a quien le dicen a menudo que es paciente',
      'zh-CN': '常常被说很有耐心的人',
    },
  },

  // 飲食
  {
    id: 'food.breakfast',
    category: 'food',
    text: {
      'zh-TW': '早餐一定會吃的人',
      en: 'Someone who never skips breakfast',
      ja: '朝ごはんを必ず食べる人',
      ko: '아침을 꼭 챙겨 먹는 사람',
      de: 'Jemand, der nie das Frühstück auslässt',
      fr: 'Quelqu’un qui ne saute jamais le petit-déjeuner',
      es: 'Alguien que nunca se salta el desayuno',
      'zh-CN': '早餐一定会吃的人',
    },
  },
  {
    id: 'food.coffee',
    category: 'food',
    text: {
      'zh-TW': '完全不喝咖啡的人',
      en: 'Someone who never drinks coffee',
      ja: 'コーヒーをまったく飲まない人',
      ko: '커피를 전혀 안 마시는 사람',
      de: 'Jemand, der überhaupt keinen Kaffee trinkt',
      fr: 'Quelqu’un qui ne boit jamais de café',
      es: 'Alguien que no bebe café en absoluto',
      'zh-CN': '完全不喝咖啡的人',
    },
  },
  {
    id: 'food.cilantro',
    category: 'food',
    text: {
      'zh-TW': '敢吃香菜的人',
      en: 'Someone who eats cilantro',
      ja: 'パクチーが食べられる人',
      ko: '고수를 먹을 수 있는 사람',
      de: 'Jemand, der Koriander mag',
      fr: 'Quelqu’un qui mange de la coriandre',
      es: 'Alguien que come cilantro',
      'zh-CN': '敢吃香菜的人',
    },
  },
  {
    id: 'food.taro',
    category: 'food',
    text: {
      'zh-TW': '吃火鍋一定加芋頭的人',
      en: 'Someone who always adds taro to hotpot',
      ja: '鍋には必ずタロイモを入れる人',
      ko: '훠궈에 토란을 꼭 넣는 사람',
      de: 'Jemand, der beim Hotpot immer Taro dazugibt',
      fr: 'Quelqu’un qui met toujours du taro dans sa fondue chinoise',
      es: 'Alguien que siempre echa taro al hotpot',
      'zh-CN': '吃火锅一定加芋头的人',
    },
  },
  {
    id: 'food.lunchbox',
    category: 'food',
    text: {
      'zh-TW': '會自己帶便當的人',
      en: 'Someone who packs their own lunch',
      ja: 'お弁当を自分で用意する人',
      ko: '도시락을 직접 싸 오는 사람',
      de: 'Jemand, der sich sein Essen selbst mitbringt',
      fr: 'Quelqu’un qui prépare sa propre gamelle',
      es: 'Alguien que se lleva su propia comida',
      'zh-CN': '会自己带便当的人',
    },
  },
  {
    id: 'food.spicy',
    category: 'food',
    text: {
      'zh-TW': '很能吃辣的人',
      en: 'Someone who loves spicy food',
      ja: '辛いものがとても得意な人',
      ko: '매운 음식을 아주 잘 먹는 사람',
      de: 'Jemand, der richtig scharf essen kann',
      fr: 'Quelqu’un qui supporte très bien le piment',
      es: 'Alguien que aguanta muy bien el picante',
      'zh-CN': '很能吃辣的人',
    },
  },

  // 興趣
  {
    id: 'hobby.movie',
    category: 'hobby',
    text: {
      'zh-TW': '今年有進電影院看過電影的人',
      en: 'Someone who has been to the cinema this year',
      ja: '今年映画館で映画を観た人',
      ko: '올해 영화관에서 영화를 본 사람',
      de: 'Jemand, der dieses Jahr im Kino war',
      fr: 'Quelqu’un qui est allé au cinéma cette année',
      es: 'Alguien que ha ido al cine este año',
      'zh-CN': '今年有进电影院看过电影的人',
    },
  },
  {
    id: 'hobby.book',
    category: 'hobby',
    text: {
      'zh-TW': '最近一個月有看完一本書的人',
      en: 'Someone who finished a book in the past month',
      ja: 'この一か月で本を一冊読み終えた人',
      ko: '최근 한 달 안에 책 한 권을 다 읽은 사람',
      de: 'Jemand, der im letzten Monat ein Buch zu Ende gelesen hat',
      fr: 'Quelqu’un qui a fini un livre le mois dernier',
      es: 'Alguien que ha terminado un libro en el último mes',
      'zh-CN': '最近一个月有看完一本书的人',
    },
  },
  {
    id: 'hobby.game',
    category: 'hobby',
    text: {
      'zh-TW': '會玩手機遊戲或電玩的人',
      en: 'Someone who plays mobile or video games',
      ja: 'スマホゲームやテレビゲームをする人',
      ko: '모바일 게임이나 비디오 게임을 하는 사람',
      de: 'Jemand, der Handy- oder Videospiele spielt',
      fr: 'Quelqu’un qui joue à des jeux mobiles ou vidéo',
      es: 'Alguien que juega a videojuegos o juegos de móvil',
      'zh-CN': '会玩手机游戏或电玩的人',
    },
  },
  {
    id: 'hobby.photo',
    category: 'hobby',
    text: {
      'zh-TW': '喜歡拍照記錄生活的人',
      en: 'Someone who likes photographing everyday life',
      ja: '日々の暮らしを写真に残すのが好きな人',
      ko: '일상을 사진으로 남기는 걸 좋아하는 사람',
      de: 'Jemand, der gern den Alltag fotografiert',
      fr: 'Quelqu’un qui aime photographier son quotidien',
      es: 'Alguien a quien le gusta fotografiar su día a día',
      'zh-CN': '喜欢拍照记录生活的人',
    },
  },
  {
    id: 'hobby.sports',
    category: 'hobby',
    text: {
      'zh-TW': '會看運動比賽轉播的人',
      en: 'Someone who watches sports on TV',
      ja: 'スポーツ中継を観る人',
      ko: '스포츠 중계를 보는 사람',
      de: 'Jemand, der Sport im Fernsehen schaut',
      fr: 'Quelqu’un qui regarde du sport à la télé',
      es: 'Alguien que ve deporte por televisión',
      'zh-CN': '会看体育比赛转播的人',
    },
  },
  {
    id: 'hobby.series',
    category: 'hobby',
    text: {
      'zh-TW': '追過一整部影集的人',
      en: 'Someone who has binged a whole series',
      ja: 'ドラマを一気に最後まで観たことがある人',
      ko: '드라마 한 편을 정주행해 본 사람',
      de: 'Jemand, der schon eine ganze Serie durchgeschaut hat',
      fr: 'Quelqu’un qui a enchaîné une série entière',
      es: 'Alguien que se ha visto una serie entera del tirón',
      'zh-CN': '追过一整部剧集的人',
    },
  },
];

/*
 * 預設勾選的順序。**刻意跨分類交錯**，不是照上面的順序排。
 *
 * 主持人選 3×3 時預設只會用到前 8 題，如果照原順序就會全部落在「生活習慣」，
 * 一整張卡問的都是同一類事情。交錯之後不管取前 8、前 16 還是前 24，
 * 七個分類都會平均出現。
 */
export const DEFAULT_ORDER = interleaveByCategory();

function interleaveByCategory() {
  const buckets = CATEGORIES.map((category) =>
    QUESTIONS.filter((question) => question.category === category).map((question) => question.id),
  );

  const order = [];
  for (let round = 0; ; round += 1) {
    let added = false;
    for (const bucket of buckets) {
      if (round < bucket.length) {
        order.push(bucket[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  return order;
}

/*
 * build 時檢查題庫，漏翻的題目在執行期會變成空格子，很難發現。
 * 一併確認 DEFAULT_ORDER 沒有漏掉或重複任何一題，以及題庫夠不夠填滿最大的 5×5。
 */
export function checkQuestions(langs) {
  const ids = new Set();

  for (const question of [...QUESTIONS, ...ANCHORS]) {
    if (ids.has(question.id)) throw new Error(`題目 id 重複：${question.id}`);
    ids.add(question.id);

    for (const lang of langs) {
      if (!question.text[lang]) throw new Error(`題目 ${question.id} 少了 ${lang} 的文字`);
    }
  }

  for (const question of QUESTIONS) {
    if (!CATEGORIES.includes(question.category)) {
      throw new Error(`題目 ${question.id} 的分類 ${question.category} 不在 CATEGORIES 裡`);
    }
  }

  if (!ANCHORS.some((anchor) => anchor.id === DEFAULT_ANCHOR_ID)) {
    throw new Error(`DEFAULT_ANCHOR_ID ${DEFAULT_ANCHOR_ID} 不在 ANCHORS 裡`);
  }

  if (DEFAULT_ORDER.length !== QUESTIONS.length) {
    throw new Error(`DEFAULT_ORDER 有 ${DEFAULT_ORDER.length} 題，題庫有 ${QUESTIONS.length} 題`);
  }
  if (new Set(DEFAULT_ORDER).size !== DEFAULT_ORDER.length) {
    throw new Error('DEFAULT_ORDER 有重複的題目');
  }

  // 5×5 要 24 道洗牌題，題庫少於這個數字的話主持人根本湊不滿一張卡
  if (QUESTIONS.length < 24) {
    throw new Error(`題庫只有 ${QUESTIONS.length} 題，5×5 需要至少 24 題`);
  }
}
