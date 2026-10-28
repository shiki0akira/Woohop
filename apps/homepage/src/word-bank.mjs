/*
 * 題庫（全站共用）：出題的遊戲都從這裡抽。2026-10-28 從比手畫腳搬過來，
 * 現在用的有比手畫腳、桌遊助手的「抽題目」；之後的比手畫腳接力、畫畫遊戲也從這裡抽，題庫越加越大。
 * 下一步（做畫畫遊戲時）：抽卡取名的名稱庫（name-pools）、倒放猜猜看的造句詞也併進來，標上各自的用途。
 *
 * 每個語言是 [代號, 類型名稱, [題目...]] 的清單：代號各語言一樣（開場勾選、提示類型用），題目各語言自己挑
 * 當地熟悉的，不是翻譯；「成語」在外語是當地的慣用語。
 *
 * 一個題目能拿來做什麼（用途，USES）：
 *   act   比得出來（比手畫腳、比手畫腳接力）
 *   draw  畫得出來（畫畫接力、一起畫一張圖）
 *   say   能拿來造句（倒放猜猜看）
 *   name  能當代號：短、喊得快（抽卡取名）
 * 題目寫成字串就是 DEFAULT_USES；不一樣的寫成 ['在雨中跳舞', ['act', 'say']]。
 * 各遊戲用 wordsFor(語言, 用途) 只拿自己用得到的，拿到的題目都是字串。
 *
 * checkWords()（build 時）守著：各語言代號一樣、用途只能是 USES 裡的、每類每種用途至少 25 題（有那種用途的話）、類內沒有重複。
 */
export const USES = ['act', 'draw', 'say', 'name'];
// 目前的題目都是比手畫腳挑的：比得出來，也大多畫得出來。併入其他題庫時再逐詞標例外
export const DEFAULT_USES = ['act', 'draw'];

export const WORDS = {
  'zh-TW': [
    ['animals', '動物', [
      '袋鼠', '企鵝', '大象', '長頸鹿', '猴子', '螃蟹', '章魚', '蛇', '青蛙', '兔子',
      '貓頭鷹', '孔雀', '鱷魚', '無尾熊', '海豚', '蝴蝶', '蜜蜂', '公雞', '烏龜', '獅子',
      '老鷹', '松鼠', '刺蝟', '蚊子', '鯊魚', '大猩猩', '河馬', '斑馬', '蝙蝠', '蜘蛛',
      '螞蟻', '鴕鳥', '海獅', '熊貓', '樹懶', '獨角仙', '蝸牛', '啄木鳥', '火鶴', '變色龍',
    ]],
    ['jobs', '職業', [
      '牙醫', '魔術師', '交通警察', '廚師', '理髮師', '消防員', '攝影師', '空服員', '指揮家', '外送員',
      '健身教練', '畫家', '司機', '園丁', '醫生', '老師', '主播', '保全', '拳擊手', 'DJ',
      '美甲師', '算命師', '機長', '漁夫', '清潔員', '獸醫', '太空人', '偵探', '小丑', '農夫',
      '木匠', '修車師傅', '調酒師', '導遊', '啦啦隊', '模特兒', '歌手', 'YouTuber', '救生員', '新郎',
    ]],
    ['sports', '運動', [
      '游泳', '射箭', '拳擊', '跳高', '桌球', '羽毛球', '籃球', '足球', '保齡球', '高爾夫',
      '划船', '滑雪', '衝浪', '溜冰', '舉重', '跳水', '擊劍', '跳繩', '騎腳踏車', '瑜珈',
      '攀岩', '棒球', '網球', '排球', '相撲', '跳遠', '撐竿跳', '鉛球', '標槍', '騎馬',
      '跆拳道', '柔道', '體操', '花式滑冰', '浮潛', '滑板', '呼拉圈', '拔河', '賽跑', '啞鈴',
    ]],
    ['daily', '日常生活', [
      '刷牙', '擠捷運', '穿雨衣', '自拍', '打噴嚏', '綁鞋帶', '吹頭髮', '洗碗', '打電動', '晾衣服',
      '倒垃圾', '追公車', '敷面膜', '搶購', '打瞌睡', '量體重', '開瓶蓋', '剪指甲', '找鑰匙', '熨衣服',
      '撐傘', '打蚊子', '抓癢', '照鏡子', '拖地', '化妝', '刮鬍子', '穿襪子', '鋪床', '澆花',
      '遛狗', '掏耳朵', '打哈欠', '伸懶腰', '滑手機', '搶紅包', '找停車位', '掃地', '打字', '戴隱形眼鏡',
    ]],
    ['food', '食物', [
      '吃拉麵', '剝香蕉', '喝珍珠奶茶', '吃西瓜', '烤肉', '吃冰淇淋', '剝螃蟹', '吃辣椒', '包水餃', '吃棉花糖',
      '啃玉米', '吹生日蠟燭', '喝熱湯', '嗑瓜子', '吃火鍋', '捏飯糰', '煎荷包蛋', '剝橘子', '吃臭豆腐', '咬甘蔗',
      '吸果凍', '吃爆米花', '切洋蔥', '開汽水', '吃麵線', '吃鳳梨', '吃壽司', '拉起司', '吃雞腿', '剝蝦子',
      '喝咖啡', '吃蛋糕', '搖飲料', '吃檸檬', '吃泡麵', '撒胡椒', '打蛋', '吃口香糖', '吃熱狗', '舔棒棒糖',
    ]],
    ['vehicles', '交通工具', [
      '騎摩托車', '開車', '搭飛機', '坐火車', '騎腳踏車', '划獨木舟', '開船', '搭電梯', '坐雲霄飛車', '騎馬',
      '開坦克', '坐熱氣球', '搭直升機', '騎獨輪車', '坐纜車', '開挖土機', '滑滑板', '坐輪椅', '開消防車', '推嬰兒車',
      '坐旋轉木馬', '開潛水艇', '搭手扶梯', '坐計程車', '開卡車', '騎駱駝', '搭火箭', '推購物車', '開救護車', '坐雪橇',
    ]],
    ['objects', '生活物品', [
      '雨傘', '吹風機', '吸塵器', '牙刷', '手電筒', '望遠鏡', '剪刀', '釘書機', '鬧鐘', '自拍棒',
      '電風扇', '微波爐', '洗衣機', '鏡子', '梳子', '枕頭', '拖把', '掃把', '蒼蠅拍', '打火機',
      '相機', '耳機', '麥克風', '鍵盤', '遙控器', '保溫瓶', '安全帽', '行李箱', '吊床', '溜溜球',
      '風箏', '呼拉圈', '彈弓', '釣竿', '弓箭', '拐杖', '降落傘', '蠟燭', '鈴鐺', '時鐘',
    ]],
    ['scenes', '好笑情境', [
      '踩到香蕉皮', '被蚊子叮', '吃到很辣的東西', '電梯裡有人放屁', '打翻飲料', '鞋子裡有石頭', '被雷打到', '在冰上滑倒', '找不到廁所', '睡過頭',
      '被狗追', '拉鍊壞掉', '手機掉進馬桶', '喝到很燙的湯', '被門夾到手', '走路撞到電線桿', '打嗝停不下來', '腳麻了', '洗澡沒熱水', '頭髮被風吹亂',
      '被老闆抓到偷懶', '看恐怖片', '中樂透', '考試作弊', '第一次約會', '迷路', '衣服穿反', '抓到小偷', '被鳥屎打中', '演唱會搖滾區',
    ]],
    ['idioms', '成語', [
      '守株待兔', '畫蛇添足', '對牛彈琴', '狐假虎威', '亡羊補牢', '雞飛狗跳', '手舞足蹈', '目瞪口呆', '一箭雙鵰', '虎頭蛇尾',
      '掩耳盜鈴', '井底之蛙', '如坐針氈', '抱頭鼠竄', '捧腹大笑', '東張西望', '張牙舞爪', '眉飛色舞', '大海撈針', '騎虎難下',
      '一石二鳥', '雞同鴨講', '縮頭烏龜', '狼吞虎嚥', '盲人摸象', '打草驚蛇', '杯弓蛇影', '刻舟求劍', '拔苗助長', '聞雞起舞',
      '七上八下', '搖頭晃腦', '瞎子摸魚', '半途而廢', '孔融讓梨',
    ]],
  ],
  'zh-CN': [
    ['animals', '动物', [
      '袋鼠', '企鹅', '大象', '长颈鹿', '猴子', '螃蟹', '章鱼', '蛇', '青蛙', '兔子',
      '猫头鹰', '孔雀', '鳄鱼', '考拉', '海豚', '蝴蝶', '蜜蜂', '公鸡', '乌龟', '狮子',
      '老鹰', '松鼠', '刺猬', '蚊子', '鲨鱼', '大猩猩', '河马', '斑马', '蝙蝠', '蜘蛛',
      '蚂蚁', '鸵鸟', '海狮', '熊猫', '树懒', '蜗牛', '啄木鸟', '火烈鸟', '变色龙', '哈士奇',
    ]],
    ['jobs', '职业', [
      '牙医', '魔术师', '交警', '厨师', '理发师', '消防员', '摄影师', '空姐', '指挥家', '外卖小哥',
      '健身教练', '画家', '司机', '园丁', '医生', '老师', '主持人', '保安', '拳击手', 'DJ',
      '美甲师', '算命先生', '机长', '渔夫', '保洁阿姨', '兽医', '宇航员', '侦探', '小丑', '农民',
      '木匠', '修车师傅', '调酒师', '导游', '啦啦队', '模特', '歌手', '主播', '救生员', '新郎',
    ]],
    ['sports', '运动', [
      '游泳', '射箭', '拳击', '跳高', '乒乓球', '羽毛球', '篮球', '足球', '保龄球', '高尔夫',
      '划船', '滑雪', '冲浪', '溜冰', '举重', '跳水', '击剑', '跳绳', '骑自行车', '瑜伽',
      '攀岩', '棒球', '网球', '排球', '相扑', '跳远', '撑竿跳', '铅球', '标枪', '骑马',
      '跆拳道', '柔道', '体操', '花样滑冰', '浮潜', '滑板', '呼啦圈', '拔河', '赛跑', '踢毽子',
    ]],
    ['daily', '日常生活', [
      '刷牙', '挤地铁', '穿雨衣', '自拍', '打喷嚏', '系鞋带', '吹头发', '洗碗', '打游戏', '晾衣服',
      '倒垃圾', '追公交', '敷面膜', '抢购', '打瞌睡', '称体重', '拧瓶盖', '剪指甲', '找钥匙', '熨衣服',
      '打伞', '打蚊子', '挠痒痒', '照镜子', '拖地', '化妆', '刮胡子', '穿袜子', '铺床', '浇花',
      '遛狗', '掏耳朵', '打哈欠', '伸懒腰', '刷手机', '抢红包', '找车位', '扫地', '打字', '扫码付款',
    ]],
    ['food', '美食', [
      '吃拉面', '剥香蕉', '喝奶茶', '吃西瓜', '烤串', '吃冰淇淋', '吃小龙虾', '吃辣椒', '包饺子', '吃棉花糖',
      '啃玉米', '吹生日蜡烛', '喝热汤', '嗑瓜子', '吃火锅', '吃煎饼果子', '煎荷包蛋', '剥橘子', '吃臭豆腐', '啃甘蔗',
      '吸果冻', '吃爆米花', '切洋葱', '开可乐', '嗦粉', '吃菠萝', '吃寿司', '拉芝士', '啃鸡腿', '剥虾',
      '喝咖啡', '吃蛋糕', '摇奶茶', '吃柠檬', '泡方便面', '撒胡椒', '打鸡蛋', '嚼口香糖', '吃热狗', '舔棒棒糖',
    ]],
    ['vehicles', '交通工具', [
      '骑电动车', '开车', '坐飞机', '坐高铁', '骑自行车', '划皮划艇', '开船', '坐电梯', '坐过山车', '骑马',
      '开坦克', '坐热气球', '坐直升机', '骑独轮车', '坐缆车', '开挖掘机', '玩滑板', '坐轮椅', '开消防车', '推婴儿车',
      '坐旋转木马', '开潜水艇', '坐扶梯', '打车', '开卡车', '骑骆驼', '坐火箭', '推购物车', '开救护车', '坐雪橇',
    ]],
    ['objects', '生活用品', [
      '雨伞', '吹风机', '吸尘器', '牙刷', '手电筒', '望远镜', '剪刀', '订书机', '闹钟', '自拍杆',
      '电风扇', '微波炉', '洗衣机', '镜子', '梳子', '枕头', '拖把', '扫把', '苍蝇拍', '打火机',
      '相机', '耳机', '麦克风', '键盘', '遥控器', '保温杯', '头盔', '行李箱', '吊床', '溜溜球',
      '风筝', '弹弓', '钓鱼竿', '弓箭', '拐杖', '降落伞', '蜡烛', '铃铛', '时钟', '充电宝',
    ]],
    ['scenes', '搞笑情境', [
      '踩到香蕉皮', '被蚊子咬', '吃到很辣的东西', '电梯里有人放屁', '打翻饮料', '鞋子里有石头', '被雷劈到', '在冰上滑倒', '找不到厕所', '睡过头',
      '被狗追', '拉链坏了', '手机掉进马桶', '喝到很烫的汤', '被门夹到手', '走路撞到电线杆', '打嗝停不下来', '腿麻了', '洗澡没热水', '头发被风吹乱',
      '摸鱼被老板抓到', '看恐怖片', '中彩票', '考试作弊', '第一次约会', '迷路', '衣服穿反', '抓小偷', '被鸟屎砸中', '演唱会前排',
    ]],
    ['idioms', '成语', [
      '守株待兔', '画蛇添足', '对牛弹琴', '狐假虎威', '亡羊补牢', '鸡飞狗跳', '手舞足蹈', '目瞪口呆', '一箭双雕', '虎头蛇尾',
      '掩耳盗铃', '井底之蛙', '如坐针毡', '抱头鼠窜', '捧腹大笑', '东张西望', '张牙舞爪', '眉飞色舞', '大海捞针', '骑虎难下',
      '鸡同鸭讲', '狼吞虎咽', '盲人摸象', '打草惊蛇', '杯弓蛇影', '刻舟求剑', '拔苗助长', '闻鸡起舞', '七上八下', '摇头晃脑',
      '半途而废', '孔融让梨', '乱七八糟', '呆若木鸡', '鹤立鸡群',
    ]],
  ],
  'en': [
    ['animals', 'Animals', [
      'Kangaroo', 'Penguin', 'Elephant', 'Giraffe', 'Monkey', 'Crab', 'Octopus', 'Snake', 'Frog', 'Rabbit',
      'Owl', 'Peacock', 'Crocodile', 'Koala', 'Dolphin', 'Butterfly', 'Bee', 'Rooster', 'Turtle', 'Lion',
      'Eagle', 'Squirrel', 'Hedgehog', 'Mosquito', 'Shark', 'Gorilla', 'Hippo', 'Bat', 'Spider', 'Ostrich',
      'Seal', 'Panda', 'Sloth', 'Snail', 'Woodpecker', 'Flamingo', 'Chameleon', 'T-rex',
    ]],
    ['jobs', 'Jobs', [
      'Dentist', 'Magician', 'Traffic cop', 'Chef', 'Hairdresser', 'Firefighter', 'Photographer', 'Flight attendant', 'Conductor', 'Delivery driver',
      'Personal trainer', 'Painter', 'Bus driver', 'Gardener', 'Doctor', 'Teacher', 'News anchor', 'Security guard', 'Boxer', 'DJ',
      'Fortune teller', 'Pilot', 'Fisherman', 'Vet', 'Astronaut', 'Detective', 'Clown', 'Farmer', 'Carpenter', 'Mechanic',
      'Bartender', 'Tour guide', 'Cheerleader', 'Model', 'Singer', 'YouTuber', 'Lifeguard', 'Bride',
    ]],
    ['sports', 'Sports', [
      'Swimming', 'Archery', 'Boxing', 'High jump', 'Table tennis', 'Badminton', 'Basketball', 'Soccer', 'Bowling', 'Golf',
      'Rowing', 'Skiing', 'Surfing', 'Ice skating', 'Weightlifting', 'Diving', 'Fencing', 'Jump rope', 'Cycling', 'Yoga',
      'Rock climbing', 'Baseball', 'Tennis', 'Volleyball', 'Sumo wrestling', 'Long jump', 'Pole vault', 'Shot put', 'Javelin', 'Horse riding',
      'Karate', 'Gymnastics', 'Figure skating', 'Snorkeling', 'Skateboarding', 'Hula hoop', 'Tug of war', 'Sprinting',
    ]],
    ['daily', 'Everyday life', [
      'Brushing your teeth', 'Rush-hour train', 'Putting on a raincoat', 'Taking a selfie', 'Sneezing', 'Tying your shoes', 'Blow-drying your hair', 'Washing dishes', 'Playing video games', 'Hanging up laundry',
      'Taking out the trash', 'Chasing the bus', 'Face mask', 'Black Friday shopping', 'Nodding off', 'Stepping on a scale', 'Opening a jar', 'Clipping your nails', 'Looking for your keys', 'Ironing',
      'Opening an umbrella', 'Swatting a mosquito', 'Scratching an itch', 'Looking in the mirror', 'Mopping the floor', 'Putting on makeup', 'Shaving', 'Making the bed', 'Watering plants', 'Walking the dog',
      'Yawning', 'Stretching', 'Scrolling on your phone', 'Parallel parking', 'Typing', 'Putting in contact lenses',
    ]],
    ['food', 'Food', [
      'Eating spaghetti', 'Peeling a banana', 'Drinking bubble tea', 'Eating watermelon', 'Grilling burgers', 'Eating an ice cream cone', 'Cracking a lobster', 'Eating a hot chili', 'Making pizza', 'Toasting marshmallows',
      'Eating corn on the cob', 'Blowing out birthday candles', 'Sipping hot soup', 'Eating a taco', 'Flipping pancakes', 'Frying an egg', 'Peeling an orange', 'Eating a giant sandwich', 'Slurping noodles', 'Eating popcorn',
      'Chopping onions', 'Opening a soda', 'Eating sushi with chopsticks', 'Stretchy cheese pizza', 'Eating a lemon', 'Drinking coffee', 'Eating cake', 'Chewing gum', 'Eating a hot dog', 'Licking a lollipop',
      'Eating ribs', 'Carving a turkey', 'Eating a burrito', 'Shaking a milkshake',
    ]],
    ['vehicles', 'Getting around', [
      'Riding a motorbike', 'Driving a car', 'Taking a plane', 'Riding a train', 'Riding a bike', 'Paddling a kayak', 'Steering a ship', 'Taking the elevator', 'Riding a roller coaster', 'Riding a horse',
      'Driving a tank', 'Hot-air balloon', 'Flying a helicopter', 'Riding a unicycle', 'Cable car', 'Driving an excavator', 'Skateboarding', 'Pushing a stroller', 'Fire truck', 'Merry-go-round',
      'Submarine', 'Escalator', 'Hailing a taxi', 'Driving a truck', 'Riding a camel', 'Rocket launch', 'Pushing a shopping cart', 'Ambulance', 'Riding a sled', 'Pogo stick',
    ]],
    ['objects', 'Things', [
      'Umbrella', 'Hair dryer', 'Vacuum cleaner', 'Toothbrush', 'Flashlight', 'Binoculars', 'Scissors', 'Stapler', 'Alarm clock', 'Selfie stick',
      'Electric fan', 'Microwave', 'Washing machine', 'Mirror', 'Comb', 'Pillow', 'Mop', 'Broom', 'Fly swatter', 'Lighter',
      'Camera', 'Headphones', 'Microphone', 'Keyboard', 'Remote control', 'Helmet', 'Suitcase', 'Hammock', 'Yo-yo', 'Kite',
      'Slingshot', 'Fishing rod', 'Bow and arrow', 'Walking stick', 'Parachute', 'Candle', 'Bell', 'Clock',
    ]],
    ['scenes', 'Funny situations', [
      'Slipping on a banana peel', 'Getting bitten by a mosquito', 'Eating something really spicy', 'Someone farted in the elevator', 'Spilling your drink', 'A pebble in your shoe', 'Getting struck by lightning', 'Slipping on ice', 'Can’t find a toilet', 'Oversleeping',
      'Being chased by a dog', 'Broken zipper', 'Dropping your phone in the toilet', 'Burning your tongue on soup', 'Hand stuck in the door', 'Walking into a lamppost', 'Can’t stop hiccuping', 'Your leg fell asleep', 'No hot water in the shower', 'Windy bad hair day',
      'Boss catches you slacking', 'Watching a horror movie', 'Winning the lottery', 'Cheating on a test', 'First date', 'Getting lost', 'Shirt on inside out', 'Catching a thief', 'Pooped on by a bird', 'Front row at a concert',
    ]],
    ['idioms', 'Idioms', [
      'Break the ice', 'Raining cats and dogs', 'Cold feet', 'Spill the beans', 'Piece of cake', 'Hit the sack', 'Cry over spilled milk', 'Let the cat out of the bag', 'Bite the bullet', 'Butterflies in your stomach',
      'Head in the clouds', 'Walking on eggshells', 'Couch potato', 'Elephant in the room', 'Break a leg', 'Pull someone’s leg', 'Hold your horses', 'Burn the midnight oil', 'Cut corners', 'Kill two birds with one stone',
      'Over the moon', 'Under the weather', 'Bend over backwards', 'Get your ducks in a row', 'Hit the road', 'Jump on the bandwagon', 'Sit on the fence', 'Barking up the wrong tree', 'Turn the tables', 'Run like the wind',
    ]],
  ],
  'ja': [
    ['animals', '動物', [
      'カンガルー', 'ペンギン', 'ゾウ', 'キリン', 'サル', 'カニ', 'タコ', 'ヘビ', 'カエル', 'ウサギ',
      'フクロウ', 'クジャク', 'ワニ', 'コアラ', 'イルカ', 'チョウ', 'ハチ', 'ニワトリ', 'カメ', 'ライオン',
      'ワシ', 'リス', 'ハリネズミ', '蚊', 'サメ', 'ゴリラ', 'カバ', 'コウモリ', 'クモ', 'ダチョウ',
      'アシカ', 'パンダ', 'ナマケモノ', 'カタツムリ', 'キツツキ', 'フラミンゴ', 'カメレオン', 'カブトムシ',
    ]],
    ['jobs', '職業', [
      '歯医者', 'マジシャン', '交通整理のおまわりさん', '料理人', '美容師', '消防士', 'カメラマン', '客室乗務員', '指揮者', '配達員',
      'ジムのトレーナー', '画家', 'バスの運転手', '庭師', '医者', '先生', 'アナウンサー', '警備員', 'ボクサー', 'DJ',
      '占い師', 'パイロット', '漁師', '獣医', '宇宙飛行士', '探偵', 'ピエロ', '農家', '大工', '自動車整備士',
      'バーテンダー', 'ツアーガイド', 'チアリーダー', 'モデル', '歌手', 'YouTuber', 'ライフセーバー', '花嫁',
    ]],
    ['sports', 'スポーツ', [
      '水泳', 'アーチェリー', 'ボクシング', '走り高跳び', '卓球', 'バドミントン', 'バスケットボール', 'サッカー', 'ボウリング', 'ゴルフ',
      'ボート', 'スキー', 'サーフィン', 'スケート', '重量挙げ', '飛び込み', 'フェンシング', 'なわとび', 'サイクリング', 'ヨガ',
      'ボルダリング', '野球', 'テニス', 'バレーボール', '相撲', '走り幅跳び', '棒高跳び', '砲丸投げ', 'やり投げ', '乗馬',
      '空手', '柔道', '体操', 'フィギュアスケート', 'シュノーケリング', 'スケートボード', '綱引き', 'リレー',
    ]],
    ['daily', '日常', [
      '歯みがき', '満員電車', 'レインコートを着る', '自撮り', 'くしゃみ', '靴ひもを結ぶ', 'ドライヤー', '皿洗い', 'ゲームをする', '洗濯物を干す',
      'ゴミ出し', 'バスを追いかける', 'フェイスパック', 'セールの争奪戦', '居眠り', '体重計に乗る', 'ビンのふたを開ける', '爪を切る', '鍵を探す', 'アイロンがけ',
      '傘をさす', '蚊をたたく', '背中をかく', '鏡を見る', '床をふく', 'お化粧', 'ひげそり', '布団を敷く', '花に水をやる', '犬の散歩',
      'あくび', '伸び', 'スマホをいじる', '縦列駐車', 'キーボードを打つ', 'コンタクトを入れる',
    ]],
    ['food', '食べ物', [
      'ラーメンを食べる', 'バナナの皮をむく', 'タピオカを飲む', 'スイカを食べる', '焼き肉', 'ソフトクリームを食べる', 'カニを食べる', '激辛料理を食べる', 'たこ焼きを作る', '綿あめを食べる',
      'とうもろこしをかじる', 'ケーキのろうそくを消す', '熱いお茶をすする', '流しそうめん', 'お好み焼きをひっくり返す', '目玉焼きを焼く', 'みかんをむく', 'おにぎりを握る', 'そばをすする', 'ポップコーンを食べる',
      '玉ねぎを切る', '炭酸を開ける', 'お寿司を食べる', 'ピザのチーズがのびる', 'レモンをかじる', 'コーヒーを飲む', 'ガムをかむ', 'ホットドッグを食べる', 'ペロペロキャンディーをなめる', '鍋をつつく',
      '餅をのばす', '納豆を混ぜる', 'かき氷を食べる', 'せんべいをかじる',
    ]],
    ['vehicles', '乗り物', [
      'バイクに乗る', '車を運転する', '飛行機に乗る', '新幹線に乗る', '自転車に乗る', 'カヌーをこぐ', '船を操縦する', 'エレベーターに乗る', 'ジェットコースター', '馬に乗る',
      '戦車', '熱気球', 'ヘリコプター', '一輪車', 'ロープウェイ', 'ショベルカー', 'スケボー', 'ベビーカーを押す', '消防車', 'メリーゴーランド',
      '潜水艦', 'エスカレーター', 'タクシーを止める', 'トラックを運転する', 'ラクダに乗る', 'ロケット発射', 'ショッピングカートを押す', '救急車', 'そり', '人力車',
    ]],
    ['objects', '身近なもの', [
      '傘', 'ドライヤー', '掃除機', '歯ブラシ', '懐中電灯', '双眼鏡', 'はさみ', 'ホッチキス', '目覚まし時計', '自撮り棒',
      '扇風機', '電子レンジ', '洗濯機', '鏡', 'くし', '枕', 'モップ', 'ほうき', 'ハエたたき', 'ライター',
      'カメラ', 'ヘッドホン', 'マイク', 'キーボード', 'リモコン', 'ヘルメット', 'スーツケース', 'ハンモック', 'ヨーヨー', 'たこ',
      'パチンコ', '釣りざお', '弓矢', '杖', 'パラシュート', 'ろうそく', '鈴', 'けん玉',
    ]],
    ['scenes', 'おもしろシチュエーション', [
      'バナナの皮ですべる', '蚊に刺される', '激辛のものを食べる', 'エレベーターで誰かがおなら', '飲み物をこぼす', '靴に小石が入る', '雷に打たれる', '氷の上ですべる', 'トイレが見つからない', '寝坊',
      '犬に追いかけられる', 'チャックが壊れる', 'スマホをトイレに落とす', '熱いスープでやけど', 'ドアに手をはさむ', '電柱にぶつかる', 'しゃっくりが止まらない', '足がしびれる', 'シャワーがお湯にならない', '強風で髪がボサボサ',
      'サボっているのを上司に見つかる', 'ホラー映画を見る', '宝くじが当たる', 'テストでカンニング', '初デート', '道に迷う', '服を裏返しに着る', '泥棒をつかまえる', '鳥のフンが落ちてくる', 'ライブの最前列',
    ]],
    ['idioms', 'ことわざ', [
      '猿も木から落ちる', '猫に小判', '豚に真珠', '犬も歩けば棒に当たる', '石橋を叩いて渡る', '急がば回れ', '棚からぼたもち', '泣き面に蜂', '花より団子', '寝耳に水',
      '二兎を追う者は一兎をも得ず', '口は災いの元', '七転び八起き', '猫の手も借りたい', '鬼に金棒', '馬の耳に念仏', '笑う門には福来る', '井の中の蛙', '一石二鳥', '雀の涙',
      '目から鱗', '腹が減っては戦ができぬ', '肩を落とす', '頭を抱える', '首を長くして待つ', '手も足も出ない', '腰を抜かす', '鼻が高い', '耳を疑う', '開いた口がふさがらない',
    ]],
  ],
  'ko': [
    ['animals', '동물', [
      '캥거루', '펭귄', '코끼리', '기린', '원숭이', '게', '문어', '뱀', '개구리', '토끼',
      '부엉이', '공작', '악어', '코알라', '돌고래', '나비', '벌', '수탉', '거북이', '사자',
      '독수리', '다람쥐', '고슴도치', '모기', '상어', '고릴라', '하마', '박쥐', '거미', '타조',
      '물개', '판다', '나무늘보', '달팽이', '딱따구리', '홍학', '카멜레온', '장수풍뎅이',
    ]],
    ['jobs', '직업', [
      '치과 의사', '마술사', '교통경찰', '요리사', '미용사', '소방관', '사진작가', '승무원', '지휘자', '배달 기사',
      '헬스 트레이너', '화가', '버스 기사', '정원사', '의사', '선생님', '아나운서', '경비원', '권투 선수', 'DJ',
      '점쟁이', '조종사', '어부', '수의사', '우주비행사', '탐정', '광대', '농부', '목수', '정비사',
      '바텐더', '관광 가이드', '치어리더', '모델', '가수', '유튜버', '인명 구조원', '신부',
    ]],
    ['sports', '운동', [
      '수영', '양궁', '권투', '높이뛰기', '탁구', '배드민턴', '농구', '축구', '볼링', '골프',
      '조정', '스키', '서핑', '스케이트', '역도', '다이빙', '펜싱', '줄넘기', '자전거', '요가',
      '클라이밍', '야구', '테니스', '배구', '씨름', '멀리뛰기', '장대높이뛰기', '포환던지기', '창던지기', '승마',
      '태권도', '유도', '체조', '피겨스케이팅', '스노클링', '스케이트보드', '줄다리기', '이어달리기',
    ]],
    ['daily', '일상생활', [
      '양치질', '지옥철', '우비 입기', '셀카 찍기', '재채기', '신발 끈 묶기', '머리 말리기', '설거지', '게임하기', '빨래 널기',
      '쓰레기 버리기', '버스 쫓아가기', '마스크팩', '선착순 쇼핑', '꾸벅꾸벅 졸기', '체중계 올라가기', '병뚜껑 따기', '손톱 깎기', '열쇠 찾기', '다림질',
      '우산 쓰기', '모기 잡기', '등 긁기', '거울 보기', '걸레질', '화장하기', '면도하기', '이불 개기', '화분에 물 주기', '강아지 산책',
      '하품', '기지개', '휴대폰 보기', '평행 주차', '타자 치기', '렌즈 끼기',
    ]],
    ['food', '음식', [
      '라면 먹기', '바나나 껍질 까기', '버블티 마시기', '수박 먹기', '삼겹살 굽기', '아이스크림 먹기', '게 먹기', '매운 고추 먹기', '김밥 말기', '솜사탕 먹기',
      '옥수수 먹기', '생일 촛불 끄기', '뜨거운 국물 마시기', '떡볶이 먹기', '부침개 뒤집기', '달걀 프라이', '귤 까기', '쌈 싸 먹기', '냉면 먹기', '팝콘 먹기',
      '양파 썰기', '사이다 따기', '초밥 먹기', '피자 치즈 늘리기', '레몬 먹기', '커피 마시기', '껌 씹기', '핫도그 먹기', '막대사탕 핥기', '치킨 뜯기',
      '호떡 먹기', '빙수 먹기', '컵라면 물 붓기', '젓가락으로 콩 집기',
    ]],
    ['vehicles', '탈것', [
      '오토바이 타기', '운전하기', '비행기 타기', 'KTX 타기', '자전거 타기', '카약 젓기', '배 운전하기', '엘리베이터 타기', '롤러코스터 타기', '말 타기',
      '탱크', '열기구', '헬리콥터', '외발자전거', '케이블카', '굴착기', '킥보드', '유모차 밀기', '소방차', '회전목마',
      '잠수함', '에스컬레이터', '택시 잡기', '트럭 운전하기', '낙타 타기', '로켓 발사', '카트 밀기', '구급차', '썰매 타기', '바이킹',
    ]],
    ['objects', '생활용품', [
      '우산', '드라이기', '청소기', '칫솔', '손전등', '망원경', '가위', '스테이플러', '알람 시계', '셀카봉',
      '선풍기', '전자레인지', '세탁기', '거울', '빗', '베개', '대걸레', '빗자루', '파리채', '라이터',
      '카메라', '헤드폰', '마이크', '키보드', '리모컨', '헬멧', '캐리어', '해먹', '요요', '연',
      '새총', '낚싯대', '활', '지팡이', '낙하산', '촛불', '종', '효자손',
    ]],
    ['scenes', '웃긴 상황', [
      '바나나 껍질 밟고 미끄러지기', '모기한테 물리기', '엄청 매운 거 먹기', '엘리베이터에서 누가 방귀', '음료수 쏟기', '신발에 돌멩이', '벼락 맞기', '빙판에서 미끄러지기', '화장실을 못 찾음', '늦잠',
      '개한테 쫓기기', '지퍼 고장', '휴대폰을 변기에 빠뜨리기', '뜨거운 국물에 혀 데기', '문에 손 끼이기', '전봇대에 부딪히기', '딸꾹질이 안 멈춤', '다리 저림', '샤워하는데 찬물만 나옴', '바람에 머리 엉망',
      '땡땡이치다 상사한테 걸림', '공포 영화 보기', '복권 당첨', '시험 컨닝', '첫 데이트', '길 잃기', '옷 뒤집어 입기', '도둑 잡기', '새똥 맞기', '콘서트 맨 앞줄',
    ]],
    ['idioms', '속담', [
      '원숭이도 나무에서 떨어진다', '소 잃고 외양간 고친다', '그림의 떡', '누워서 떡 먹기', '돌다리도 두들겨 보고 건너라', '꿩 먹고 알 먹고', '고래 싸움에 새우 등 터진다', '닭 쫓던 개 지붕 쳐다본다', '우물 안 개구리', '빈 수레가 요란하다',
      '세 살 버릇 여든까지 간다', '등잔 밑이 어둡다', '낮말은 새가 듣고 밤말은 쥐가 듣는다', '개구리 올챙이 적 생각 못 한다', '하늘의 별 따기', '식은 죽 먹기', '발 없는 말이 천 리 간다', '가는 날이 장날', '울며 겨자 먹기', '도토리 키 재기',
      '눈 감고 아웅', '금강산도 식후경', '바늘 도둑이 소도둑 된다', '귀에 걸면 귀걸이 코에 걸면 코걸이', '미운 아이 떡 하나 더 준다', '서당 개 삼 년이면 풍월을 읊는다', '호랑이도 제 말 하면 온다', '방귀 뀐 놈이 성낸다', '가재는 게 편', '손바닥으로 하늘 가리기',
    ]],
  ],
  'de': [
    ['animals', 'Tiere', [
      'Känguru', 'Pinguin', 'Elefant', 'Giraffe', 'Affe', 'Krabbe', 'Krake', 'Schlange', 'Frosch', 'Hase',
      'Eule', 'Pfau', 'Krokodil', 'Koala', 'Delfin', 'Schmetterling', 'Biene', 'Hahn', 'Schildkröte', 'Löwe',
      'Adler', 'Eichhörnchen', 'Igel', 'Mücke', 'Hai', 'Gorilla', 'Nilpferd', 'Fledermaus', 'Spinne', 'Strauß',
      'Robbe', 'Panda', 'Faultier', 'Schnecke', 'Specht', 'Flamingo', 'Chamäleon', 'Dackel',
    ]],
    ['jobs', 'Berufe', [
      'Zahnarzt', 'Zauberer', 'Verkehrspolizist', 'Koch', 'Friseur', 'Feuerwehrmann', 'Fotograf', 'Flugbegleiterin', 'Dirigent', 'Paketbote',
      'Fitnesstrainer', 'Maler', 'Busfahrer', 'Gärtner', 'Ärztin', 'Lehrerin', 'Nachrichtensprecher', 'Türsteher', 'Boxer', 'DJ',
      'Wahrsagerin', 'Pilot', 'Fischer', 'Tierärztin', 'Astronaut', 'Detektiv', 'Clown', 'Bauer', 'Schreiner', 'Mechaniker',
      'Barkeeper', 'Reiseleiter', 'Cheerleader', 'Model', 'Sänger', 'Schornsteinfeger', 'Rettungsschwimmer', 'Braut',
    ]],
    ['sports', 'Sport', [
      'Schwimmen', 'Bogenschießen', 'Boxen', 'Hochsprung', 'Tischtennis', 'Badminton', 'Basketball', 'Fußball', 'Bowling', 'Golf',
      'Rudern', 'Skifahren', 'Surfen', 'Schlittschuhlaufen', 'Gewichtheben', 'Turmspringen', 'Fechten', 'Seilspringen', 'Radfahren', 'Yoga',
      'Klettern', 'Baseball', 'Tennis', 'Volleyball', 'Sumoringen', 'Weitsprung', 'Stabhochsprung', 'Kugelstoßen', 'Speerwerfen', 'Reiten',
      'Karate', 'Turnen', 'Eiskunstlauf', 'Schnorcheln', 'Skateboarden', 'Hula-Hoop', 'Tauziehen', 'Sackhüpfen',
    ]],
    ['daily', 'Alltag', [
      'Zähneputzen', 'Volle U-Bahn', 'Regenjacke anziehen', 'Selfie machen', 'Niesen', 'Schuhe binden', 'Haare föhnen', 'Abwaschen', 'Videospiele zocken', 'Wäsche aufhängen',
      'Müll rausbringen', 'Dem Bus hinterherrennen', 'Gesichtsmaske', 'Schnäppchenjagd', 'Einnicken', 'Auf die Waage steigen', 'Glas aufschrauben', 'Nägel schneiden', 'Schlüssel suchen', 'Bügeln',
      'Regenschirm aufspannen', 'Mücke erschlagen', 'Rücken kratzen', 'In den Spiegel schauen', 'Boden wischen', 'Schminken', 'Rasieren', 'Bett machen', 'Blumen gießen', 'Gassi gehen',
      'Gähnen', 'Strecken', 'Am Handy scrollen', 'Einparken', 'Tippen', 'Kontaktlinsen einsetzen',
    ]],
    ['food', 'Essen', [
      'Spaghetti essen', 'Banane schälen', 'Bubble Tea trinken', 'Wassermelone essen', 'Grillen', 'Eis essen', 'Hummer knacken', 'Scharfe Chili essen', 'Pizza belegen', 'Marshmallows rösten',
      'Maiskolben essen', 'Geburtstagskerzen auspusten', 'Heiße Suppe schlürfen', 'Döner essen', 'Pfannkuchen wenden', 'Spiegelei braten', 'Orange schälen', 'Brezel essen', 'Nudeln schlürfen', 'Popcorn essen',
      'Zwiebeln schneiden', 'Limo aufmachen', 'Sushi mit Stäbchen essen', 'Käsefäden ziehen', 'In eine Zitrone beißen', 'Kaffee trinken', 'Kuchen essen', 'Kaugummi kauen', 'Bratwurst essen', 'Am Lutscher lecken',
      'Fondue', 'Weißwurst zuzeln', 'Milchshake schütteln', 'Brot schneiden',
    ]],
    ['vehicles', 'Unterwegs', [
      'Motorrad fahren', 'Auto fahren', 'Fliegen', 'Zug fahren', 'Fahrrad fahren', 'Kajak paddeln', 'Schiff steuern', 'Aufzug fahren', 'Achterbahn fahren', 'Reiten',
      'Panzer', 'Heißluftballon', 'Hubschrauber', 'Einrad fahren', 'Seilbahn', 'Bagger fahren', 'Tretroller', 'Kinderwagen schieben', 'Feuerwehrauto', 'Karussell',
      'U-Boot', 'Rolltreppe', 'Taxi heranwinken', 'Lkw fahren', 'Kamelreiten', 'Raketenstart', 'Einkaufswagen schieben', 'Krankenwagen', 'Schlitten fahren', 'Traktor fahren',
    ]],
    ['objects', 'Gegenstände', [
      'Regenschirm', 'Föhn', 'Staubsauger', 'Zahnbürste', 'Taschenlampe', 'Fernglas', 'Schere', 'Tacker', 'Wecker', 'Selfiestick',
      'Ventilator', 'Mikrowelle', 'Waschmaschine', 'Spiegel', 'Kamm', 'Kissen', 'Wischmopp', 'Besen', 'Fliegenklatsche', 'Feuerzeug',
      'Kamera', 'Kopfhörer', 'Mikrofon', 'Tastatur', 'Fernbedienung', 'Helm', 'Koffer', 'Hängematte', 'Jo-Jo', 'Drachen',
      'Steinschleuder', 'Angel', 'Pfeil und Bogen', 'Gehstock', 'Fallschirm', 'Kerze', 'Glocke', 'Kuckucksuhr',
    ]],
    ['scenes', 'Lustige Situationen', [
      'Auf einer Bananenschale ausrutschen', 'Von einer Mücke gestochen werden', 'Etwas sehr Scharfes essen', 'Jemand pupst im Aufzug', 'Getränk umkippen', 'Steinchen im Schuh', 'Vom Blitz getroffen werden', 'Auf Glatteis ausrutschen', 'Keine Toilette finden', 'Verschlafen',
      'Von einem Hund gejagt werden', 'Reißverschluss kaputt', 'Handy fällt ins Klo', 'Zunge an heißer Suppe verbrennen', 'Hand in der Tür einklemmen', 'Gegen einen Laternenpfahl laufen', 'Schluckauf, der nicht aufhört', 'Eingeschlafenes Bein', 'Kein warmes Wasser unter der Dusche', 'Frisur vom Wind zerzaust',
      'Chef erwischt dich beim Faulenzen', 'Horrorfilm schauen', 'Lotto-Gewinn', 'Spicken in der Prüfung', 'Erstes Date', 'Sich verlaufen', 'Pulli verkehrt herum an', 'Einen Dieb fangen', 'Vom Vogel getroffen werden', 'Erste Reihe beim Konzert',
    ]],
    ['idioms', 'Redewendungen', [
      'Die Daumen drücken', 'Tomaten auf den Augen haben', 'Ins Fettnäpfchen treten', 'Die Katze aus dem Sack lassen', 'Auf den Arm nehmen', 'Den Nagel auf den Kopf treffen', 'Schwein haben', 'Ins kalte Wasser springen', 'Kalte Füße bekommen', 'Den Kopf in den Sand stecken',
      'Mit dem falschen Fuß aufstehen', 'Zwei Fliegen mit einer Klappe schlagen', 'Auf Wolke sieben schweben', 'Eine Eselsbrücke bauen', 'Jemandem einen Bären aufbinden', 'Die Nase voll haben', 'Durch die Blume sagen', 'Wie ein Elefant im Porzellanladen', 'Die Ohren steif halten', 'Hals über Kopf',
      'Sich ein Bein ausreißen', 'Den Faden verlieren', 'Mit den Hühnern ins Bett gehen', 'Ein Brett vor dem Kopf haben', 'Auf dem Holzweg sein', 'Den Löffel abgeben', 'Alles in Butter', 'Um den heißen Brei herumreden', 'Ins Gras beißen', 'Luftschlösser bauen',
    ]],
  ],
  'fr': [
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
  'es': [
    ['animals', 'Animales', [
      'Canguro', 'Pingüino', 'Elefante', 'Jirafa', 'Mono', 'Cangrejo', 'Pulpo', 'Serpiente', 'Rana', 'Conejo',
      'Búho', 'Pavo real', 'Cocodrilo', 'Koala', 'Delfín', 'Mariposa', 'Abeja', 'Gallo', 'Tortuga', 'León',
      'Águila', 'Ardilla', 'Erizo', 'Mosquito', 'Tiburón', 'Gorila', 'Hipopótamo', 'Murciélago', 'Araña', 'Avestruz',
      'Foca', 'Panda', 'Perezoso', 'Caracol', 'Pájaro carpintero', 'Flamenco', 'Camaleón', 'Toro',
    ]],
    ['jobs', 'Profesiones', [
      'Dentista', 'Mago', 'Guardia de tráfico', 'Cocinero', 'Peluquero', 'Bombero', 'Fotógrafo', 'Azafata', 'Director de orquesta', 'Repartidor',
      'Entrenador personal', 'Pintor', 'Conductor de autobús', 'Jardinero', 'Médico', 'Profesora', 'Presentador de telediario', 'Portero de discoteca', 'Boxeador', 'DJ',
      'Adivina', 'Piloto', 'Pescador', 'Veterinaria', 'Astronauta', 'Detective', 'Payaso', 'Agricultor', 'Carpintero', 'Mecánico',
      'Camarero', 'Guía turístico', 'Animadora', 'Modelo', 'Cantante', 'Torero', 'Socorrista', 'Novia',
    ]],
    ['sports', 'Deportes', [
      'Natación', 'Tiro con arco', 'Boxeo', 'Salto de altura', 'Ping-pong', 'Bádminton', 'Baloncesto', 'Fútbol', 'Bolos', 'Golf',
      'Remo', 'Esquí', 'Surf', 'Patinaje sobre hielo', 'Halterofilia', 'Saltos de trampolín', 'Esgrima', 'Saltar a la comba', 'Ciclismo', 'Yoga',
      'Escalada', 'Béisbol', 'Tenis', 'Voleibol', 'Sumo', 'Salto de longitud', 'Salto con pértiga', 'Lanzamiento de peso', 'Jabalina', 'Equitación',
      'Kárate', 'Gimnasia', 'Patinaje artístico', 'Buceo con tubo', 'Monopatín', 'Hula hoop', 'Tira y afloja', 'Pádel',
    ]],
    ['daily', 'Vida diaria', [
      'Lavarse los dientes', 'Metro abarrotado', 'Ponerse un chubasquero', 'Hacerse un selfie', 'Estornudar', 'Atarse los cordones', 'Secarse el pelo', 'Fregar los platos', 'Jugar a la consola', 'Tender la ropa',
      'Bajar la basura', 'Correr detrás del autobús', 'Mascarilla facial', 'Las rebajas', 'Quedarse dormido en el sofá', 'Subirse a la báscula', 'Abrir un bote', 'Cortarse las uñas', 'Buscar las llaves', 'Planchar',
      'Abrir el paraguas', 'Matar un mosquito', 'Rascarse la espalda', 'Mirarse al espejo', 'Fregar el suelo', 'Maquillarse', 'Afeitarse', 'Hacer la cama', 'Regar las plantas', 'Pasear al perro',
      'Bostezar', 'Estirarse', 'Mirar el móvil', 'Aparcar en línea', 'Escribir en el teclado', 'Ponerse las lentillas',
    ]],
    ['food', 'Comida', [
      'Comer espaguetis', 'Pelar un plátano', 'Beber bubble tea', 'Comer sandía', 'Hacer una barbacoa', 'Comer un helado', 'Abrir un bogavante', 'Morder una guindilla', 'Hacer una pizza', 'Tostar nubes',
      'Comer una mazorca', 'Soplar las velas', 'Tomar sopa muy caliente', 'Comer churros', 'Dar la vuelta a la tortilla', 'Freír un huevo', 'Pelar una naranja', 'Comer un bocadillo enorme', 'Sorber fideos', 'Comer palomitas',
      'Cortar cebolla', 'Abrir un refresco', 'Comer sushi con palillos', 'Pizza con queso que se estira', 'Morder un limón', 'Tomar un café', 'Comer tarta', 'Mascar chicle', 'Comer un perrito caliente', 'Chupar una piruleta',
      'Comer paella', 'Comer las uvas de Nochevieja', 'Agitar un batido', 'Cortar jamón',
    ]],
    ['vehicles', 'Transportes', [
      'Ir en moto', 'Conducir un coche', 'Ir en avión', 'Ir en tren', 'Ir en bici', 'Remar en kayak', 'Pilotar un barco', 'Subir en ascensor', 'Montaña rusa', 'Montar a caballo',
      'Tanque', 'Globo aerostático', 'Helicóptero', 'Monociclo', 'Teleférico', 'Conducir una excavadora', 'Patinete', 'Empujar un carrito de bebé', 'Camión de bomberos', 'Tiovivo',
      'Submarino', 'Escalera mecánica', 'Parar un taxi', 'Conducir un camión', 'Montar en camello', 'Despegue de un cohete', 'Empujar el carro de la compra', 'Ambulancia', 'Ir en trineo', 'Tractor',
    ]],
    ['objects', 'Objetos', [
      'Paraguas', 'Secador de pelo', 'Aspiradora', 'Cepillo de dientes', 'Linterna', 'Prismáticos', 'Tijeras', 'Grapadora', 'Despertador', 'Palo selfie',
      'Ventilador', 'Microondas', 'Lavadora', 'Espejo', 'Peine', 'Almohada', 'Fregona', 'Escoba', 'Matamoscas', 'Mechero',
      'Cámara de fotos', 'Auriculares', 'Micrófono', 'Teclado', 'Mando a distancia', 'Casco', 'Maleta', 'Hamaca', 'Yoyó', 'Cometa',
      'Tirachinas', 'Caña de pescar', 'Arco y flechas', 'Bastón', 'Paracaídas', 'Vela', 'Campana', 'Abanico',
    ]],
    ['scenes', 'Situaciones graciosas', [
      'Resbalar con una piel de plátano', 'Que te pique un mosquito', 'Comer algo muy picante', 'Alguien se tira un pedo en el ascensor', 'Tirar la bebida', 'Una piedrecita en el zapato', 'Que te caiga un rayo', 'Resbalar en el hielo', 'No encontrar el baño', 'Quedarse dormido',
      'Que te persiga un perro', 'Cremallera rota', 'Se te cae el móvil al váter', 'Quemarse la lengua con la sopa', 'Pillarse la mano con la puerta', 'Chocar con una farola', 'Hipo que no se quita', 'Se te duerme la pierna', 'Ducha sin agua caliente', 'Pelo revuelto por el viento',
      'Tu jefe te pilla vagueando', 'Ver una peli de miedo', 'Ganar la lotería', 'Copiar en un examen', 'Primera cita', 'Perderse', 'Llevar la camiseta del revés', 'Atrapar a un ladrón', 'Que te cague un pájaro', 'Primera fila en un concierto',
    ]],
    ['idioms', 'Expresiones', [
      'Romper el hielo', 'Tomar el pelo', 'Estar en las nubes', 'Ponerse las pilas', 'Meter la pata', 'Costar un ojo de la cara', 'Llover a cántaros', 'Estar como una cabra', 'Dormir como un tronco', 'Echar una mano',
      'Ser pan comido', 'Hablar por los codos', 'Tirar la toalla', 'Estar hecho polvo', 'Matar dos pájaros de un tiro', 'Buscar una aguja en un pajar', 'Tener mala leche', 'Estar como pez en el agua', 'Quedarse de piedra', 'Dar en el clavo',
      'Ir al grano', 'Hacer la pelota', 'Estar entre la espada y la pared', 'Tener la cabeza en otra parte', 'Morderse la lengua', 'Írsele a alguien la olla', 'Ponerse rojo como un tomate', 'Andarse por las ramas', 'Hacerse el sueco', 'Tener mucha cara',
    ]],
  ],
};

const textOf = (w) => (Array.isArray(w) ? w[0] : w);
const usesOf = (w) => (Array.isArray(w) ? w[1] : DEFAULT_USES);

// 這個語言、這種用途的題庫：[[代號, 類型名稱, [題目字串...]], ...]，一題都沒有的類型不列
export function wordsFor(lang, use) {
  return (WORDS[lang] || WORDS['zh-TW'])
    .map(([id, name, words]) => [id, name, words.filter((w) => usesOf(w).includes(use)).map(textOf)])
    .filter(([, , words]) => words.length);
}

export function checkWords() {
  const ref = WORDS['zh-TW'].map(([id]) => id).join();
  for (const [lang, cats] of Object.entries(WORDS)) {
    if (cats.map(([id]) => id).join() !== ref) throw new Error(`word-bank：${lang} 的類型代號跟 zh-TW 不一樣`);
    for (const [id, , words] of cats) {
      const texts = words.map(textOf);
      if (new Set(texts).size !== texts.length) throw new Error(`word-bank：${lang} 的 ${id} 有重複的題目`);
      for (const w of words) {
        const bad = usesOf(w).find((u) => !USES.includes(u));
        if (bad) throw new Error(`word-bank：${lang} 的「${textOf(w)}」用途 ${bad} 不在 USES 裡`);
      }
      for (const use of USES) {
        const n = words.filter((w) => usesOf(w).includes(use)).length;
        if (n && n < 25) throw new Error(`word-bank：${lang} 的 ${id} 能 ${use} 的只有 ${n} 題，至少要 25 題`);
      }
    }
  }
}
