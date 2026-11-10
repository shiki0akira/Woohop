/*
 * 福杯滿溢。一支手機傳著玩：輪流往同一個杯子加水，誰讓水溢出來就輸（CONCEPT.md 一）。
 *
 * 一步一步帶（跟木頭人動作版同一套，步驟頭、規則卡、拉霸都是全站共用的 window.Leader）：
 *   setup 開場 → rules 說明規則 → play（pour 按住加水 → pass 傳給下一個人，回 pour ⋯⋯ → 溢出）
 *   → end 水溢出來了（輸的人拉真心話大冒險）→ 再來一杯回 play
 * 加水那一步手機在大家手上傳，**不放步驟頭**（apps/warmup/CLAUDE.md）。
 * 返回鍵一律回第一頁；已經加過水就先確認。只記聲音開關，杯子大小每次都是預設。
 *
 * 畫面上**沒有任何百分比**：杯子本身就是儀表板（CONCEPT.md 2.6）。
 */
(function () {
  'use strict';

  var T = window.CUP.T;
  var BASE = window.CUP.base;
  var LANG = window.CUP.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SETTINGS_KEY = 'woohop-cup-settings';

  // ---------- 水位與加水速度 ----------

  /*
   * 水位 level：0 = 空杯，RIM_LEVEL = 剛好到杯口，> 1 = 溢出。
   * RIM_LEVEL 到 1 之間是**表面張力把水面撐起來**的那一段（CONCEPT.md 2.5）。
   *
   * level 是「已經加進去的水量」，跟杯型無關；杯型只決定這些水量在畫面上升到多高
   * （每個杯型的 levelToY，從剖面積出來的）。所以**杯子大小與杯型是兩件獨立的事**：
   * 大小 = 要幾秒才滿，杯型 = 長相與手感。
   */
  var RIM_LEVEL = 0.88;

  /*
   * **杯口以下**的速度：d(水位)/dt = R0 × (1 + TENSE_K × 水位)。空杯最慢，到杯口是 2.6 倍快。
   * 這是設計過的曲線，不是對杯型做積分（CONCEPT.md 2.2）。
   * 八種杯型共用這條曲線——瓶頸那種「突然衝很快」是**形狀**造成的，不是另外加速度參數。
   */
  var TENSE_K = 1.6;
  /*
   * 一直開著水不關，從空杯到**杯口**要幾秒（杯口以上的張力那一段另外算，見下面）。
   * 按鈕上寫的是人數，因為杯子大小唯一要配合的就是人數（CONCEPT.md 2.3）。
   */
  var SIZES = { small: 2.5, normal: 4.5, large: 6.5 };
  var MIN_POUR_MS = 200; // 下限：點開又馬上關也算 0.2 秒，否則可以加 0 秒傳下去。**沒有上限**：想加多少是玩家的賭注

  /*
   * **杯口以上（表面張力那一段）的速度，整個遊戲最好玩的地方，規則跟杯子裡不一樣。**
   *
   * 老闆 2026-11-09 實測：舊版一進張力就「大概第三個人就溢出來」——因為舊版在杯口以上
   * 還是沿用「越滿越快」，剩下的空間最小、速度卻最快。現在杯口以上改成：
   *
   *     這一次加水推進的張力進度 = tenseK × （這一次開水幾秒）^1.6
   *
   * 1.6 次方是關鍵：**小口小口加可以撐很久，貪心大口倒就當場輸**。
   *   - 一次點 0.25 秒 → 要 8～11 次才會溢出來（各杯型的 tenseK 不同）
   *   - 一次開著不放 → 0.8～1 秒就溢出來，乾脆俐落
   * 進度只跟「這一次開了多久」有關，所以照樣是解析解，不受 rAF 節流影響（CLAUDE.md 第 1 點）。
   */
  var TENSE_POW = 1.6;

  // ---------- 杯型：一個杯型一筆設定（SVG 座標，viewBox 0 0 160 196） ----------

  var GLASS = '#cbe7de'; // 玻璃的零件（杯腳）：淡薄荷。杯肚留透明，才看得到水位
  var CERAMIC = '#f0b9a6'; // 陶壺的壺身（不透明）
  var CERAMIC_IN = '#d98c74'; // 壺口裡面：比壺身深，看起來才像一個開口
  var WATER = '#9ad3ec';
  var FOAM = '#c9eaf8'; // 水面那一道亮色

  /*
   * 每一局隨機抽一種容器（老闆 2026-11-09）。**要加第五種就在這裡再加一筆**，別的地方不用改。
   *
   *   rimY / rimL / rimR  杯口那條線的 y 與兩端 x：表面張力的凸起、溢出的水都從這裡長出來
   *   profile   [[y, 半寬], …]，從杯底排到杯口（y 由大到小）。**水面高度是從這份剖面積出來的**
   *             （buildProfile）：窄的地方同樣的水量升得比較高，所以瓶頸那一段水位自己就會衝上去
   *   bulgeMax  表面張力凸起的最大高度（px）；杯口越窄撐得越少
   *   tenseK    杯口以上那一段的手感：**越大越兇**（0.84 燒杯最寬容 ～ 1.23 細頸瓶／保溫瓶最兇）。
   *             實際意義是「一次點 0.25 秒大概還能加幾次」＝ 1 /（tenseK × 0.25^1.6）
   *   weight    抽中的權重。不透明的三種故意調低（0.6～0.8），不然一直抽到看不見水位的
   *   opaque    true = 看不到水位（只有壺口看得到），這一款要靠流水聲的音高判斷
   *   shell     不透明容器的外殼顏色（opaque 專用）
   *   ticks     杯身上的刻度線（量杯、燒杯）。畫在水**之後**，水面上下都看得到
   *   zoom      水快滿時鏡頭拉到哪：以 (x, y) 為中心放大 scale 倍。
   *             ⚠️ **倍率的上限是「這個杯型最寬的地方（含溢出來的水）要整個留在畫面裡」**——
   *             老闆 2026-11-09 回報高腳杯的杯肚被切掉，就是倍率超過這條線。杯身可以從畫面
   *             下緣出去（那像特寫），但左右兩側一旦切到看起來就只是壞掉
   *   behind / front  容器以外的零件（杯腳、把手），分別畫在容器後面／前面
   *   mouth     看得到的壺口（橢圓）。fill 有值 = 不透明容器的開口，裡面要另外畫一層水
   *   spill / drops   溢出來的水：路徑要走在容器輪廓**外側**，畫在裡面會被水整片蓋掉
   */
  var SHAPES = {
    // 1. 高腳杯：杯肚寬（半寬 50）、杯口收起來（半寬 38），所以越接近杯口水位升得越快
    goblet: {
      rimY: 34, rimL: 42, rimR: 118, bulgeMax: 18, opaque: false, tenseK: 0.92, weight: 1,
      zoom: { x: 80, y: 84, scale: 1.33 },
      body: 'M42 34C34 52 28 62 30 76C33 96 52 112 80 112C108 112 127 96 130 76C132 62 126 52 118 34Z',
      profile: [[112, 3], [104, 34], [96, 41], [86, 47], [76, 50], [62, 50], [48, 44], [34, 38]],
      behind: function () {
        return W.body('<path d="M72 112h16v32H72z"/>', GLASS) +
          W.body('<path d="M44 176c0-6 8-8 14-12 6-4 8-12 8-20h28c0 8 2 16 8 20 6 4 14 6 14 12z"/>', GLASS);
      },
      spill: ['M42 34C32 40 26 48 26 62', 'M118 34C128 40 134 48 134 62'],
      drops: [[34, 100, 5], [126, 104, 4.5]],
    },
    // 2. 直筒水杯：上下一樣寬，水位是線性的——最好預測、最「公平」的一種
    glass: {
      rimY: 50, rimL: 48, rimR: 112, bulgeMax: 16, opaque: false, tenseK: 0.85, weight: 1,
      zoom: { x: 80, y: 84, scale: 1.7 },
      body: 'M48 50h64v114c0 7-6 12-13 12H61c-7 0-13-5-13-12z',
      profile: [[174, 24], [167, 31], [160, 32], [50, 32]],
      behind: function () { return ''; },
      spill: ['M48 50C41 58 40 66 40 76', 'M112 50C119 58 120 66 120 76'],
      drops: [[42, 96, 5], [118, 98, 4.5]],
    },
    // 3. 細頸玻璃瓶：瓶身寬（半寬 40）、瓶頸窄（半寬 14），水一進瓶頸就會衝上去
    bottle: {
      rimY: 46, rimL: 66, rimR: 94, bulgeMax: 13, opaque: false, tenseK: 1.0, weight: 1,
      zoom: { x: 80, y: 88, scale: 1.6 },
      body: 'M66 46h28v16c0 10 12 17 20 29 6 10 6 19 6 29v44c0 7-6 12-13 12H53c-7 0-13-5-13-12v-44c0-10 0-19 6-29 8-12 20-19 20-29V46z',
      profile: [[174, 27], [166, 39], [164, 40], [120, 40], [108, 38], [91, 34], [80, 25], [70, 16], [62, 14], [46, 14]],
      behind: function () { return ''; },
      mouth: { cx: 80, cy: 46, rx: 14, ry: 4.5, fill: '' }, // 玻璃瓶：只畫瓶口的輪廓，水本來就透得出來
      spill: ['M66 46C58 52 54 60 53 72', 'M94 46C102 52 106 60 107 72'],
      drops: [[38, 92, 5], [122, 96, 4.5]],
    },
    // 4. 不透明陶壺：看不到水位，壺口又小。三種不透明裡最難的「用耳朵判斷」款
    pot: {
      rimY: 56, rimL: 60, rimR: 100, bulgeMax: 14, opaque: true, tenseK: 0.92, weight: 0.6,
      shell: CERAMIC,
      zoom: { x: 80, y: 105, scale: 1.42 },
      body: 'M60 56c0 12-24 20-24 48v30c0 24 6 42 14 42h60c8 0 14-18 14-42v-30c0-28-24-36-24-48z',
      profile: [[176, 30], [168, 36], [150, 42], [134, 44], [104, 44], [86, 37], [70, 27], [56, 20]],
      behind: function () { return ''; },
      mouth: { cx: 80, cy: 56, rx: 20, ry: 6, fill: CERAMIC_IN },
      spill: ['M60 56C50 62 44 70 42 82', 'M100 56C110 62 116 70 118 82'],
      drops: [[32, 92, 5], [128, 88, 4.5]],
    },
    // 5. 不透明馬克杯：杯身直、杯口寬，快滿的時候從杯口就看得到水面——不透明裡的入門款
    mug: {
      rimY: 58, rimL: 42, rimR: 108, bulgeMax: 16, opaque: true, tenseK: 0.92, weight: 0.8,
      shell: '#a8dccb',
      zoom: { x: 83, y: 101, scale: 1.5 },
      body: 'M42 58h66v108c0 6-5 10-11 10H53c-6 0-11-4-11-10z',
      profile: [[176, 26], [170, 31], [166, 33], [58, 33]],
      // 把手畫在杯身後面（杯身的描邊才不會被把手切斷）
      behind: function () {
        return W.body('<path d="M106 80c16 0 24 9 24 21s-9 21-25 21v-11c10 0 18-4 18-10s-7-10-17-10z"/>', '#a8dccb');
      },
      mouth: { cx: 75, cy: 58, rx: 33, ry: 8, fill: '#6fb79e' },
      spill: ['M42 58C36 66 37 74 37 86', 'M108 58C114 64 116 70 116 76'],
      drops: [[39, 102, 5], [124, 70, 4.5]],
    },
    // 6. 量杯：身上有刻度，是最「可以算」的一款——一桌人可以約好「不要超過哪一條線」
    measure: {
      rimY: 44, rimL: 52, rimR: 108, bulgeMax: 14, opaque: false, tenseK: 0.85, weight: 1,
      zoom: { x: 82.5, y: 81, scale: 1.7 },
      body: 'M52 44h56l-4 116c-.3 8-6 14-14 14H70c-8 0-13.7-6-14-14z',
      profile: [[174, 20], [168, 25], [160, 26], [100, 27], [44, 28]],
      // 右上角的傾倒嘴（溢出來的水就從這裡出去）
      behind: function () { return W.body('<path d="M106 44c7 0 12 2 14 7-6 3-11 3-14 1z"/>', '#cbe7de'); },
      ticks: 'M58 150h18M58 130h12M58 110h18M59 90h12M60 70h18',
      spill: ['M118 50C121 56 122 62 122 70'],
      drops: [[118, 88, 4.5], [46, 92, 5]],
    },
    // 7. 燒杯：矮而寬，同樣的水量水位升得最慢——最寬容的一款，刻度也比量杯粗略
    beaker: {
      rimY: 88, rimL: 34, rimR: 126, bulgeMax: 16, opaque: false, tenseK: 0.78, weight: 1,
      zoom: { x: 84, y: 117, scale: 1.25 },
      body: 'M34 88h92v76c0 7-6 12-13 12H47c-7 0-13-5-13-12z',
      profile: [[176, 38], [170, 43], [164, 46], [88, 46]],
      behind: function () { return W.body('<path d="M124 88c7 0 12 2 14 7-6 3-11 3-14 1z"/>', '#cbe7de'); },
      ticks: 'M42 152h22M42 130h14M42 108h22',
      spill: ['M137 94C140 100 141 106 141 114'],
      drops: [[140, 130, 5], [132, 148, 4]],
    },
    // 8. 不透明保溫瓶：看不到水位**又**會在瓶口突然衝上去，八種裡的大魔王
    flask: {
      rimY: 30, rimL: 64, rimR: 94, bulgeMax: 12, opaque: true, tenseK: 1.0, weight: 0.6,
      shell: '#aebcf3',
      zoom: { x: 79, y: 56, scale: 2.05 },
      body: 'M64 30h30v26c0 8 17 8 17 24v84c0 7-6 12-13 12H60c-7 0-13-5-13-12V80c0-16 17-16 17-24V30z',
      profile: [[176, 26], [170, 30], [164, 32], [80, 32], [70, 25], [58, 16], [30, 15]],
      behind: function () { return ''; },
      mouth: { cx: 79, cy: 30, rx: 15, ry: 5, fill: '#7489E6' },
      spill: ['M64 30C57 36 54 42 54 52', 'M94 30C101 36 104 42 104 52'],
      drops: [[50, 70, 5], [108, 74, 4.5]],
    },
  };
  var SHAPE_KEYS = ['goblet', 'glass', 'bottle', 'pot', 'mug', 'measure', 'beaker', 'flask'];

  /*
   * 從剖面積出「杯子裡裝了幾成水 → 水面在哪個 y」。
   *
   * 窄的地方同樣的水量升得比較高，所以瓶頸那一段水面自己就會衝上去——
   * **這是形狀造成的，沒有另外加速度參數**（老闆 2026-11-09 特別交代的）。
   * 只在起手跑一次（杯型是固定的設定），每個 frame 只查這張表。
   */
  function buildLevelToY(shape) {
    var pts = shape.profile;
    var y0 = pts[0][0]; // 杯底
    var y1 = pts[pts.length - 1][0]; // 杯口
    var N = 96;
    var step = (y1 - y0) / N; // 負的：y 往上變小
    function halfAt(y) {
      for (var j = 1; j < pts.length; j += 1) {
        if (y <= pts[j - 1][0] && y >= pts[j][0]) {
          var f = (pts[j - 1][0] - y) / (pts[j - 1][0] - pts[j][0]);
          return pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f;
        }
      }
      return pts[pts.length - 1][1];
    }
    var vol = [0];
    for (var i = 1; i <= N; i += 1) {
      vol.push(vol[i - 1] + (halfAt(y0 + step * (i - 1)) + halfAt(y0 + step * i)) * Math.abs(step));
    }
    var total = vol[N];
    return function (u) {
      var target = Math.max(0, Math.min(1, u)) * total;
      var lo = 0;
      var hi = N;
      while (hi - lo > 1) {
        var mid = (lo + hi) >> 1;
        if (vol[mid] <= target) lo = mid;
        else hi = mid;
      }
      var span = vol[hi] - vol[lo];
      return y0 + step * (lo + (span > 0 ? (target - vol[lo]) / span : 0));
    };
  }
  SHAPE_KEYS.forEach(function (key) { SHAPES[key].levelToY = buildLevelToY(SHAPES[key]); });

  function baseRate() {
    // R0 = ln(1 + K × RIM_LEVEL) / (K × 秒數)：一直開著水剛好 SIZES[size] 秒從空杯到杯口
    return Math.log(1 + TENSE_K * RIM_LEVEL) / (TENSE_K * SIZES[prep.size]);
  }

  /*
   * 開了 seconds 秒之後的水位（這一次從 start 開始）。
   *
   * **一定要從「這一次開了多久」算出水位，不要每個 frame 把增量加上去。**
   * 累加的話 requestAnimationFrame 被節流（省電模式、背景分頁、低階手機）時
   * 同樣開 1.2 秒加的水會差很多倍——測的時候就踩到了，畫面沒在前景時幾乎加不進水。
   *
   * 杯口上下是**兩條不同的曲線**，接在 RIM_LEVEL：
   *   杯口以下：d(水位)/dt = R0 × (1 + K × 水位) 的解析解（越滿越快）
   *   杯口以上：張力進度 += tenseK × 秒^1.6（小口撐很久、大口當場輸，見上面 TENSE_POW）
   * 兩段都只跟「這一次開了多久」有關，所以都是解析解。
   */
  function tenseAfter(start, seconds) {
    var band = 1 - RIM_LEVEL;
    var u = (start - RIM_LEVEL) / band; // 張力進度 0～1，超過 1 就是溢出
    return RIM_LEVEL + (u + shape.tenseK * Math.pow(Math.max(0, seconds), TENSE_POW)) * band;
  }

  function levelAfter(start, seconds) {
    if (start >= RIM_LEVEL) return tenseAfter(start, seconds);
    var r = baseRate();
    // 從 start 開到杯口還要幾秒
    var toRim = Math.log((1 + TENSE_K * RIM_LEVEL) / (1 + TENSE_K * start)) / (r * TENSE_K);
    if (seconds <= toRim) return ((1 + TENSE_K * start) * Math.exp(r * TENSE_K * seconds) - 1) / TENSE_K;
    // 這一次加水從杯子裡一路加到杯口以上：張力那一段的時間從「碰到杯口」那一刻才開始算
    return tenseAfter(RIM_LEVEL, seconds - toRim);
  }

  // ---------- 狀態 ----------

  var prep = { size: 'normal' }; // 每次打開都是預設（跟系列其他遊戲一樣，不記上次選的）
  var settings = { sound: true }; // 只記這一個

  var screen = 'setup';
  var phase = 'pour';
  var noteDone = false; // 這一局的杯型說明收起來了沒（第一次開水就收）
  var shapeKey = 'goblet'; // 這一局抽到的杯型（startPlay 每局重抽）
  var shape = SHAPES.goblet;
  var level = 0;
  var pours = 0; // 已經加完幾次水（溢出的那一次不算）
  var gameNumber = 0;
  var best = 0; // 這一場（同一次打開）最多撐過幾次，不存進手機
  var startedAt = 0;
  var tense = false; // 水面凸出杯口了沒
  var tenseSeen = false; // 這一杯報過一次 GA4 就好
  var pouring = false;
  var raf = 0;
  var pourStart = 0; // 這一次按住是什麼時候開始的（performance.now）
  var pourFrom = 0; // 按下去的當下水位多高
  var overflowed = false;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    sizePanel: $('size-panel'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    turn: $('turn'),
    cupWrap: $('cup-wrap'),
    cupStage: $('cup-stage'),
    cupCam: $('cup-cam'),
    cup: $('cup'),
    cupNote: $('cup-note'),
    soundNudge: $('sound-nudge'),
    flash: $('flash'),
    pour: $('pour'),
    pourHint: $('pour-hint'),
    pass: $('pass'),
    endCup: $('end-cup'),
    endStats: $('end-stats'),
    endBest: $('end-best'),
    slotRoot: $('slot-root'),
    again: $('again'),
    leaveModal: $('leave-modal'),
    leaveCancel: $('leave-cancel'),
    leaveConfirm: $('leave-confirm'),
  };

  function fill(s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  }
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback; // 無痕模式、封鎖 storage：照樣能玩，只是記不住
    }
  }
  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 同上 */
    }
  }

  // ---------- 杯子的 SVG ----------

  /*
   * 杯子一局畫一次（renderCup），之後只改水的位置（paintCup）。
   * 水裁在容器裡（clipPath），**但表面張力的凸起不裁**——它要凸出杯口。
   * 容器的描邊畫在水之後，才蓋得住水的邊緣。
   *
   * 不透明的陶壺：水照樣畫在壺身裡，再用一層不透明的外殼（.shell）整片蓋住，
   * 只有壺口那個橢圓裡另外畫一層水——所以「看不到水位、但看得到水從壺口冒出來」。
   *
   * ⚠️ `cupSvg()` 會呼叫兩次（遊戲畫面一個、結束畫面一個），clipPath 的 id 用 cupSeq 分開。
   */
  var cupSeq = 0;
  function cupSvg(sh) {
    var n = (cupSeq += 1);
    var clip = 'cupin' + n;
    var mclip = 'cupmouth' + n;
    var shell = sh.opaque;
    var m = sh.mouth;
    var out = [
      '<defs><clipPath id="' + clip + '"><path d="' + sh.body + '"/></clipPath>' +
        (m && m.fill ? '<clipPath id="' + mclip + '"><ellipse cx="' + m.cx + '" cy="' + m.cy + '" rx="' + m.rx + '" ry="' + m.ry + '"/></clipPath>' : '') +
        '</defs>',
      /*
       * 背景的小裝飾與地線（照設計系統頁的插圖畫法）。
       * 放在自己的一層：鏡頭拉近的時候整組淡出（app.css 的 .is-zoom），
       * 不然會被畫框切成半個圈圈、半條線，看起來像壞掉。
       */
      '<g class="cup-decor">',
      W.burst(140, 26, '#7489E6'),
      W.ring(22, 28, '#F3A4FB'),
      W.dot(24, 150, '#FFC628', 4),
      W.plus(138, 152, '#4FB59A'),
      '<path d="M24 188h44M78 188h12M100 188h36" fill="none" ' + W.K + '/>',
      '</g>',
      // 容器以外的零件（杯腳、把手、傾倒嘴）先畫，在容器後面
      sh.behind(),
      // 容器先墊一層白，水才不會透出背景
      '<path d="' + sh.body + '" fill="#fff"/>',
      '<g clip-path="url(#' + clip + ')">',
      '<rect class="water" x="18" y="196" width="124" height="220" fill="' + WATER + '"/>',
      '<rect class="foam" x="18" y="196" width="124" height="5" fill="' + FOAM + '"/>',
      '</g>',
      // 刻度：畫在水之後，所以水面上下都看得到（量杯、燒杯）
      sh.ticks ? '<path d="' + sh.ticks + '" fill="none" stroke="#22222c" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>' : '',
      // 不透明：外殼蓋住水位（它自己帶描邊）；透明：只畫描邊，蓋在水上面
      shell
        ? W.body('<path d="' + sh.body + '"/>', sh.shell)
        : '<path d="' + sh.body + '" fill="none" ' + W.K + '/>',
    ];
    // 看得到的壺口：不透明的要在開口裡另外畫一層水（水快冒出來的時候就是從這裡看到的）
    if (m) {
      var ell = 'cx="' + m.cx + '" cy="' + m.cy + '" rx="' + m.rx + '" ry="' + m.ry + '"';
      if (m.fill) {
        out.push('<ellipse ' + ell + ' fill="' + m.fill + '"/>');
        out.push('<g clip-path="url(#' + mclip + ')">');
        out.push('<rect class="water" x="18" y="196" width="124" height="220" fill="' + WATER + '"/>');
        out.push('<rect class="foam" x="18" y="196" width="124" height="4" fill="' + FOAM + '"/>');
        out.push('</g>');
      }
      out.push('<ellipse ' + ell + ' fill="none" ' + W.K + '/>');
    }
    out.push(
      // 表面張力的凸起（不裁，要凸出杯口）
      '<path class="bulge" d="" fill="' + WATER + '"/>',
      // 杯口那條線：水凸出來的時候才看得出杯口在哪（有壺口橢圓的就不用再畫一條）
      m ? '' : '<path d="M' + sh.rimL + ' ' + sh.rimY + 'h' + (sh.rimR - sh.rimL) + '" fill="none" ' + W.K + '/>',
      '<path class="bulge-line" d="" fill="none" ' + W.K + '/>',
      /*
       * 溢出來的水（平常藏起來，app.css 的 .spill）。兩道水沿著杯口往外翻、再貼著容器外面流下來，
       * ⚠️ 路徑要走在容器輪廓**外側**，畫在裡面的話會被水蓋掉看不見（每個杯型的 spill／drops）。
       */
      '<g class="spill">',
    );
    sh.spill.forEach(function (d) {
      out.push('<path d="' + d + '" fill="none" stroke="' + WATER + '" stroke-width="8" stroke-linecap="round"/>');
    });
    sh.drops.forEach(function (d, i) {
      out.push('<circle class="drop drop-' + (i ? 'b' : 'a') + '" cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2] + '" fill="' + WATER + '"/>');
    });
    out.push('</g>');
    return out.join('');
  }

  // 把這一局的杯型畫進某個 <svg>（遊戲畫面、結束畫面各一個）
  function renderCup(svg) {
    svg.innerHTML = cupSvg(shape);
  }

  function paintCup(svg, sh, lv) {
    var inside = Math.min(lv, RIM_LEVEL) / RIM_LEVEL; // 杯子裡裝了幾成，0～1
    var top = sh.levelToY(inside); // 幾成水在這個杯型裡升到哪個 y（窄的地方升得快）
    // 壺身與壺口裡各有一層水，兩層都要對齊同一個水面
    Array.prototype.forEach.call(svg.querySelectorAll('.water'), function (r) { r.setAttribute('y', String(top)); });
    Array.prototype.forEach.call(svg.querySelectorAll('.foam'), function (r) {
      r.setAttribute('y', String(top));
      r.setAttribute('opacity', inside > 0.02 ? '1' : '0');
    });

    // 凸起：從杯口兩端拉一條二次曲線，頂點比杯口高 h（控制點要給 2h）
    var t = Math.max(0, Math.min(1, (lv - RIM_LEVEL) / (1 - RIM_LEVEL)));
    var h = t * sh.bulgeMax;
    var arc = 'M' + sh.rimL + ' ' + sh.rimY + 'Q' + ((sh.rimL + sh.rimR) / 2) + ' ' + (sh.rimY - 2 * h) +
      ' ' + sh.rimR + ' ' + sh.rimY;
    svg.querySelector('.bulge').setAttribute('d', h > 0.2 ? arc + 'Z' : '');
    svg.querySelector('.bulge-line').setAttribute('d', h > 0.2 ? arc : '');
  }

  /*
   * ---------- 鏡頭：水快滿的時候拉近到杯口 ----------
   *
   * 實體玩最好玩的就是杯口那層表面張力，但凸起只有 10～13px，在手機上小到看不出來，
   * 所以一進表面張力那一段（enterTense）就把鏡頭推近（老闆 2026-11-09）。
   *
   * 做法：**外層 div 的 CSS transform**，不是改 viewBox——
   *   - 水位的計算完全沒有跟著動，鏡頭只是呈現
   *   - 晃動（.cup.is-tense 的 rotate）在 <svg> 上、鏡頭在外層，兩個 transform 才不會互相蓋掉
   *   - 畫框 .cup-stage 是 overflow: hidden，所以放大後就是「只看得到杯口附近」
   * 中心與倍率來自杯型的 zoom（四種杯型的杯口位置、寬窄都不一樣，不能寫死）。
   */
  function setCamera(on) {
    if (!el.cupCam) return;
    el.cupStage.classList.toggle('is-zoom', on);
    if (!on) {
      el.cupCam.style.transform = '';
      el.cupCam.style.transformOrigin = '';
      return;
    }
    var z = shape.zoom;
    var px = (z.x / 160) * 100;
    var py = (z.y / 196) * 100;
    // 以焦點為原點放大，再把焦點推到畫框中央（translate 不受 scale 影響，所以直接給差距）
    el.cupCam.style.transformOrigin = px + '% ' + py + '%';
    el.cupCam.style.transform = 'translate(' + (50 - px) + '%, ' + (50 - py) + '%) scale(' + z.scale + ')';
  }

  // ---------- 音效（Web Audio 當場合成，不載音檔，CONCEPT.md 2.9） ----------

  /*
   * 聲音分兩路，**而且只有配樂那一路會被壓低（ducking，見下面「背景配樂」）**：
   *   - 流水聲、凸起的提示、潑水聲：直接接 ctx.destination，永遠是原本的音量
   *   - 配樂：全部掛在 music.bus 上，加水時把那一顆 gain 壓下去
   * 流水聲的音高就是這個遊戲的水位計，所以它**不可以**跟配樂走同一條匯流排。
   */
  var audio = { ctx: null, noise: null, pour: null };

  // AudioContext 一定要在使用者手勢裡建立／resume，所以第一次呼叫是在「按住加水」那一下
  function ensureAudio() {
    try {
      if (!audio.ctx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audio.ctx = new Ctx();
      }
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      return audio.ctx;
    } catch (e) {
      return null;
    }
  }

  /*
   * 把整個聲音引擎丟掉，下一個聲音會重新建一個 AudioContext。
   *
   * **為什麼需要這個**（老闆 2026-11-09 回報）：iPhone 的靜音鍵是在 AudioContext 建立的當下
   * 決定這個 context 的音訊類別的。在靜音狀態下開始玩，之後把實體靜音鍵扳回來，
   * 那個 context 還是不會出聲——它一輩子都是靜音的。resume() 沒有用，因為它本來就在 running。
   * 唯一的解法是**重新建一個 context**，所以在「打開聲音」和「切回這一頁」時重來一次。
   */
  function resetAudio() {
    var old = audio.ctx;
    // 配樂的節點全部屬於舊的 context，一起丟掉；要不要接著播由呼叫的人用 syncMusic() 決定
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    music.bus = null;
    music.ducked = pouring; // 正在加水時重建，重新開始的配樂要直接是壓低的
    audio.ctx = null;
    audio.noise = null;
    audio.pour = null;
    if (old && old.state !== 'closed') {
      try {
        old.close();
      } catch (e) {
        /* 有些瀏覽器不給關，丟掉就好 */
      }
    }
  }

  function noiseBuffer(ctx) {
    if (audio.noise) return audio.noise;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    audio.noise = buffer;
    return buffer;
  }

  // 倒水進容器時音高會變高：bandpass 的頻率跟著水位從 420Hz 爬到 1800Hz
  // 噪音那一層的濾波頻率：上限壓到 1150Hz，1800Hz 那一帶最刺耳
  function pourFreq() {
    return 300 + 850 * Math.min(1, level);
  }

  // 有音高的那一層：220→660Hz（約一個五度半），水位越高越亮。這才是判斷水位的主角
  function pourTone() {
    return 220 + 440 * Math.min(1, level);
  }

  function startPourSound() {
    // **先壓低配樂**（在所有 return 之前，水龍頭開著與 duck 的狀態才永遠一致）
    duckMusic(true);
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx || audio.pour) return;

    var source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx);
    source.loop = true;

    var now = ctx.currentTime;

    // --- 水花的質感：噪音，但只是墊底，而且把高頻削掉 ---
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(pourFreq(), now);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600; // 再高就開始沙沙的
    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.026, now + 0.06);

    // --- 主角：有音高的水聲，水位越高越亮（不透明容器就是靠這個判斷） ---
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pourTone(), now);
    var osc2 = ctx.createOscillator(); // 高八度墊一點亮度，像水滴進水面的泛音
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(pourTone() * 2, now);
    var toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.exponentialRampToValueAtTime(0.055, now + 0.07);
    var tone2Gain = ctx.createGain();
    tone2Gain.gain.setValueAtTime(0.0001, now);
    tone2Gain.gain.exponentialRampToValueAtTime(0.016, now + 0.07);

    var gain = ctx.createGain(); // 總音量，停的時候淡出用
    gain.gain.value = 1;

    source.connect(bp);
    bp.connect(lp);
    lp.connect(noiseGain);
    noiseGain.connect(gain);
    osc.connect(toneGain);
    toneGain.connect(gain);
    osc2.connect(tone2Gain);
    tone2Gain.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    osc.start();
    osc2.start();
    audio.pour = { source: source, osc: osc, osc2: osc2, bp: bp, gain: gain };
  }

  function updatePourSound() {
    if (!audio.pour || !audio.ctx) return;
    var t = audio.ctx.currentTime;
    var p = audio.pour;
    p.bp.frequency.setTargetAtTime(pourFreq(), t, 0.06);
    p.osc.frequency.setTargetAtTime(pourTone(), t, 0.05);
    p.osc2.frequency.setTargetAtTime(pourTone() * 2, t, 0.05);
  }

  function stopPourSound() {
    duckMusic(false); // 關水：配樂平滑浮回來（同上，在 return 之前）
    if (!audio.pour || !audio.ctx) return;
    var now = audio.ctx.currentTime;
    var p = audio.pour;
    audio.pour = null;
    try {
      p.gain.gain.cancelScheduledValues(now);
      p.gain.gain.setValueAtTime(Math.max(0.0001, p.gain.gain.value), now);
      p.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      p.source.stop(now + 0.14);
      p.osc.stop(now + 0.14);
      p.osc2.stop(now + 0.14);
    } catch (e) {
      /* 已經停掉了 */
    }
  }

  // 水面開始凸起的那一聲提示，一杯只響一次
  function playDing() {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 溢出：潑水聲（白噪音爆發＋低通往下掃）＋兩滴水聲
  function playSplash() {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var now = ctx.currentTime;

    var source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, now);
    lp.frequency.exponentialRampToValueAtTime(200, now + 0.7);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    source.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.8);

    // 水滴：音高往下滑的一聲「嘟」
    [0.26, 0.46].forEach(function (delay, i) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var at = now + delay;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 - i * 150, at);
      osc.frequency.exponentialRampToValueAtTime(320 - i * 60, at + 0.11);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.14, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.13);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.15);
    });
  }

  // ---------- 背景配樂（Web Audio 當場合成，不載音檔） ----------

  /*
   * ⚠️ **這段的第一守則：配樂不可以蓋掉流水聲的音高。**
   * 流水聲的音高就是這個遊戲的水位計——陶壺、馬克杯、保溫瓶三種不透明容器看不到水位，
   * 玩家完全靠音高判斷快滿了沒。配樂直接疊上去這個遊戲就壞了，所以：
   *   - **一開水就把配樂壓到背景**（`duckMusic(true)` 在 startPourSound），關水才浮回來
   *   - 配樂的每一個音都掛在 `music.bus` 上，流水聲／提示聲／潑水聲直接接 destination，
   *     所以 ducking 動的只有一顆 gain，不會把水聲一起壓掉
   * ducking 的寫法照 apps/homepage/assets/game.js 裡 `Leader.metronome` 的 `musicBus`／`duck`
   * （一顆匯流排 gain ＋ 一個「現在該多大聲」的函式 ＋ 有斜率的 ramp）。
   * **為什麼不是直接 import**：`Leader.metronome` 是一整個節拍器 UI（要給它一個根元素、
   * 會畫出按鈕與燈），竹筍的 `music` 是竹筍 IIFE 裡的私有變數。`window.Leader` 裡沒有
   * 「只有配樂引擎」這種東西可以拿來用，所以這裡照它們的寫法搬一份過來。
   *
   * 樂曲本身（音色、音階、樂句）**照搬竹筍**（老闆 2026-11-09：「配樂可以和竹筍一樣」），
   * 細節寫在下面 NOTE／BASS／MELODY 那一段。
   * 排程照竹筍 `app/app.js` 的 `music` 那套「音訊時鐘＋往前看」：setInterval 每 25ms 把接下來
   * 0.12 秒的音用 ctx.currentTime 排好。主執行緒在忙（抽容器動畫、每個 frame 重畫水）也不會歪拍。
   *
   * **什麼時候播**：`syncMusic()` 一個地方決定——在 play 畫面（含**抽容器**那一段）、
   * 還沒溢出、聲音開著才播。開場（選杯子大小）不播，這是全站規則。
   */
  var music = { bus: null, timer: 0, playing: false, next: 0, step: 0, bar: 0, ducked: false };

  /*
   * 音量。配樂的音量全部由 music.bus 這一顆 gain 決定（相當於竹筍的 music.master 0.5）。
   * 這裡比竹筍小聲，因為這個遊戲的主角是水聲：水聲有音高那一層的峰值是 0.055
   * （startPourSound 的 toneGain），配樂只是背景。
   * MUSIC_VOL → MUSIC_DUCK 約 −15 dB：加水時配樂明顯退到背景，音高的變化聽得一清二楚。
   */
  var MUSIC_VOL = 0.3;
  var MUSIC_TENSE_VOL = 0.36; // 表面張力那一段大聲一點（高潮）
  var MUSIC_DUCK = 0.055;
  var DUCK_DOWN = 0.08; // 壓低要快（比水聲自己的 0.07 秒淡入還快，才不會先被蓋到）
  var DUCK_UP = 0.5; // 浮回來要慢，聽起來像「水關了，音樂自己回來」
  var MUSIC_FADE_IN = 0.25; // 抽容器一進來就要有聲音，淡入不能拖

  /*
   * ---------- 音符與樂句：**直接照搬竹筍**（games/bamboo/app/app.js 的 music） ----------
   *
   * 老闆 2026-11-09 試聽：「配樂可以和竹筍一樣」。所以音色（大鼓／拍手／hi-hat／
   * triangle 貝斯／square 小旋律）、C 大調五聲音階、貝斯一小節一圈、旋律兩小節一句，
   * 全部跟竹筍同一份，聽起來要是同一個家族的東西。**改這段之前先去聽竹筍。**
   *
   * 跟竹筍只有三點不一樣：
   *   1. 竹筍越玩越快是看「第幾小節」，這裡看**水位**（musicBpm／ten），因為緊張感來自水
   *   2. 多一段「表面張力」（BASS_TENSE／MELODY_TENSE）：同一組五聲音階，但重心從 C 移到 A
   *      （關係小調），速度跳到 152、大鼓變四分音符、hi-hat 補滿、旋律升一個八度
   *   3. 沒有開場的七拍口令（那是竹筍的玩法），而且全部掛在 music.bus 上給 ducking 用
   */
  var NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C4: 261.63,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5,
  };
  var BASS = ['C3', null, 'C3', null, 'G3', null, 'A3', null, 'C3', null, 'C3', null, 'E3', null, 'G3', 'D3'];
  // 兩小節一個樂句：第一小節問、第二小節答
  var MELODY = [
    ['E5', null, 'G5', null, 'A5', null, 'G5', null, 'E5', null, null, 'D5', 'C5', null, null, null],
    ['D5', null, 'E5', null, 'G5', null, 'E5', null, 'A5', null, 'G5', null, 'E5', 'D5', 'C5', null],
  ];
  // 表面張力那一段：一樣的五聲音階，但一直踩 A（關係小調），旋律升八度繞不出去
  var BASS_TENSE = ['A3', null, 'A3', null, 'A3', null, 'G3', null, 'A3', null, 'A3', null, 'C4', null, 'E3', null];
  var MELODY_TENSE = ['A5', null, 'C6', null, 'A5', null, 'G5', null, 'A5', null, 'C6', null, 'E5', null, 'G5', null];

  // 這一杯的緊張度 0～1（杯口＝1）。杯口以上另外看 tense
  function musicTension() {
    return Math.max(0, Math.min(1, level / RIM_LEVEL));
  }
  /*
   * **速度整局固定 112 BPM，水位與表面張力都不加速**（老闆 2026-11-09：「不用節奏越來越快！」）。
   * 第一版做過 112→136、張力段 152，被劃掉了。
   * 緊張感改成只靠**音色、和聲、密度**：hi-hat 變密、轉到關係小調 A、旋律升八度、音量往上。
   * 這也跟系列的規則一致（竹筍沒打拍子的時候配樂就是用原速）。
   */
  var MUSIC_BPM = 112;
  function musicBpm() {
    return MUSIC_BPM;
  }

  // ---------- 樂器：跟竹筍同一份，只是 out 接到 music.bus（ducking 才壓得到） ----------

  function env(gain, t, peak, decay) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }

  function mtone(type, freq, t, peak, decay, filterFreq) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env(gain, t, peak, decay);
    if (filterFreq) {
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(music.bus);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }

  function kick(t, peak) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    env(gain, t, peak || 0.9, 0.22);
    osc.connect(gain);
    gain.connect(music.bus);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  function mnoise(t, peak, decay, hp) {
    var ctx = audio.ctx;
    if (!ctx || !music.bus) return;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    var gain = ctx.createGain();
    env(gain, t, peak, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(music.bus);
    src.start(t);
    src.stop(t + decay + 0.05);
  }

  /*
   * 一步（十六分音符）的配樂，整段照竹筍的 scheduleStep。
   * **水位怎麼影響配樂**：速度（musicBpm）、hi-hat 補不補滿十六分音符、快滿時每小節尾巴催一聲。
   * 竹筍是用「第幾小節」決定這些，這裡一律改成用水位 ten。
   */
  function scheduleMusicStep(t) {
    var s = music.step;
    var bar = music.bar;
    var ten = musicTension();

    if (tense) {
      // --- 表面張力：整個遊戲的高潮。四分音符的大鼓、補滿的 hi-hat、踩著 A 的貝斯與高八度旋律 ---
      if (s % 4 === 0) kick(t, 0.95);
      if (s === 4 || s === 12) mnoise(t, 0.3, 0.1, 1500); // 拍手
      if (s === 6 || s === 14) mnoise(t, 0.16, 0.08, 1500);
      mnoise(t, s % 4 === 2 ? 0.13 : 0.07, 0.03, 7000);
      if (BASS_TENSE[s]) mtone('triangle', NOTE[BASS_TENSE[s]], t, 0.38, 0.18);
      if (MELODY_TENSE[s]) mtone('square', NOTE[MELODY_TENSE[s]], t, 0.075, 0.12, 3200);
      if (s === 15) mtone('square', NOTE.C6, t, 0.06, 0.08, 4000);
      return;
    }

    if (s === 0 || s === 8 || (bar % 2 === 1 && s === 10)) kick(t, 0.8);
    if (s === 4 || s === 12) mnoise(t, 0.28, 0.1, 1500); // 拍手
    // 水位低只有八分音符的 hi-hat，過半補滿十六分音符：一樣的旋律，聽起來越來越急
    if (s % 2 === 0 || ten > 0.5) mnoise(t, s % 4 === 2 ? 0.12 : 0.06, 0.03, 7000);
    if (BASS[s]) mtone('triangle', NOTE[BASS[s]], t, 0.35, 0.22);
    var note = MELODY[bar % 2][s];
    if (note) mtone('square', NOTE[note], t, 0.07, 0.16, 2600);
    // 快滿了：每小節最後一拍加一聲高音，像在催（竹筍是第八小節之後）
    if (ten > 0.8 && s === 15) mtone('square', NOTE.C6, t, 0.05, 0.08, 4000);
  }

  function musicTick() {
    var ctx = audio.ctx;
    if (!ctx || !music.playing) return;
    var guard = 0;
    while (music.next < ctx.currentTime + 0.12 && guard < 24) {
      scheduleMusicStep(music.next);
      music.next += 15 / musicBpm(); // 一步＝十六分音符（跟竹筍一樣，一小節 16 步）
      music.step = (music.step + 1) % 16;
      if (music.step === 0) music.bar += 1;
      guard += 1;
    }
    // 計時器被節流過（切到背景、省電模式）就不要補排一大串過期的音，直接跳到現在
    if (music.next < ctx.currentTime) music.next = ctx.currentTime + 0.05;
  }

  function musicLevel() {
    if (music.ducked) return MUSIC_DUCK;
    return tense ? MUSIC_TENSE_VOL : MUSIC_VOL;
  }
  function rampBus(target, seconds) {
    if (!music.bus || !audio.ctx) return;
    var now = audio.ctx.currentTime;
    var g = music.bus.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(Math.max(0.0001, target), now + seconds);
  }

  // 加水時壓低、關水後浮回來。**只動 music.bus，水聲不受影響**
  function duckMusic(on) {
    if (music.ducked === on) return;
    music.ducked = on;
    if (music.playing) rampBus(musicLevel(), on ? DUCK_DOWN : DUCK_UP);
  }

  function startMusic() {
    if (music.playing) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    if (!music.bus) {
      music.bus = ctx.createGain();
      music.bus.gain.value = 0.0001;
      music.bus.connect(ctx.destination);
    }
    music.playing = true;
    music.step = 0;
    music.bar = 0;
    music.next = ctx.currentTime + 0.08;
    // 淡進來不要「啪」一聲，但要短：配樂是在**抽容器**那一段開始的，抽完就差不多進加水了
    rampBus(musicLevel(), MUSIC_FADE_IN);
    music.timer = setInterval(musicTick, 25);
    musicTick();
  }

  // 已經排進音訊時鐘的音停不掉，所以是把匯流排淡掉（fade 秒）
  function stopMusic(fade) {
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    rampBus(0.0001, fade == null ? 0.3 : fade);
  }

  /*
   * 該播的時候播、不該播的時候不要自己冒出來。
   * 重建音訊引擎（resetAudio）、切回頁面、開關聲音、換一杯都走這裡，所以只有一個地方要想。
   */
  function syncMusic() {
    var want = settings.sound && screen === 'play' && !overflowed;
    if (want && !music.playing) startMusic();
    else if (!want && music.playing) stopMusic();
  }

  // 一進表面張力就換成另一段：從小節頭重新算，音量也往上一點
  function markTenseMusic() {
    if (!music.playing) return;
    music.step = 0;
    music.bar = 0;
    rampBus(musicLevel(), 0.25);
  }

  /*
   * 溢出：**配樂要收掉，結束畫面不能一直循環**。
   * 收尾給一聲往下落的低音（這時候 duck 還開著，所以先把音量拉回來讓它聽得到），再整段淡出。
   */
  function endMusic() {
    var wasPlaying = music.playing;
    clearInterval(music.timer);
    music.timer = 0;
    music.playing = false;
    music.ducked = false;
    if (!wasPlaying || !audio.ctx || !music.bus) {
      rampBus(0.0001, 0.2);
      return;
    }
    var now = audio.ctx.currentTime;
    // 收尾：大鼓一聲 ＋ 落到最低的 C（整段的根音），跟潑水聲疊在一起
    kick(now + 0.02, 1);
    mtone('triangle', NOTE.C3, now + 0.02, 0.5, 1.2, 600);
    mtone('sine', NOTE.C3 / 2, now + 0.02, 0.45, 1.4);
    var g = music.bus.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(MUSIC_TENSE_VOL, now + 0.08);
    g.linearRampToValueAtTime(0.0001, now + 1.5);
  }

  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫 window.toggleMusic）
  var soundButton = $('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  /*
   * 音符鍵一顆管全部（音效＋配樂）：這個遊戲沒有複雜到需要兩個開關，而且水聲本身就是水位計，
   * 「只關配樂、留著水聲」沒什麼人會想要，「只關水聲」更不該讓人做。
   */
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    if (!settings.sound) {
      stopPourSound();
      stopMusic(0.12);
    } else {
      // 重建聲音引擎：手機在靜音狀態下開始玩的話，舊的 context 一輩子都不會出聲（見 resetAudio）
      resetAudio();
      syncMusic(); // 配樂要從重建中接回來（在 play 又還沒溢出才播）
      if (pouring) startPourSound();
    }
    writeJson(SETTINGS_KEY, { sound: settings.sound });
    syncSoundButton();
    // 打開聲音就把「要不要打開聲音」那句提示收起來（反之亦然）
    if (screen === 'play') syncCupNote();
  };

  // ---------- 加水 ----------

  function setPhase(next) {
    phase = next;
    views.play.setAttribute('data-phase', next);
  }

  function syncTense() {
    el.cup.classList.toggle('is-tense', tense && !reduceMotion);
    el.pourHint.textContent = tense ? T.tenseHint : T.pourHint;
    el.pourHint.classList.toggle('is-tense', tense);
  }

  function enterTense() {
    tense = true;
    playDing();
    markTenseMusic(); // 配樂換成張力那一段（跟鏡頭同時，整個遊戲的高潮）
    setCamera(true); // 鏡頭推到杯口：這一段是整個遊戲的高潮
    syncTense();
    if (!tenseSeen) {
      tenseSeen = true;
      track('cup_danger_reached', { pours: pours, cup_shape: shapeKey });
    }
  }

  // 水開著多久了（毫秒），只夾下限；上限刻意沒有，要加到滿出來是玩家自己的事
  function heldMs() {
    return Math.max(MIN_POUR_MS, performance.now() - pourStart);
  }

  function startPour() {
    if (pouring || phase !== 'pour' || overflowed) return;
    pouring = true;
    pourStart = performance.now();
    pourFrom = level;
    el.pour.classList.add('is-pouring');
    el.pour.textContent = T.pourStopButton;
    // 開水的那一刻就把杯型說明收起來，把高度讓給杯子（不要動 pours，那個在 nextPerson 算）
    noteDone = true;
    syncCupNote();
    startPourSound();
    // 保險：萬一配樂沒接回來（切回頁面時新建的 context 還 suspended，要手勢才能 resume），
    // 在這一下點擊裡補起來。此時 duck 已經開著，所以它會直接從背景音量淡進來
    syncMusic();
    raf = requestAnimationFrame(pourFrame);
  }

  function pourFrame() {
    if (!pouring) return;
    var held = performance.now() - pourStart;
    level = levelAfter(pourFrom, held / 1000);
    paintCup(el.cup, shape, level);
    updatePourSound();

    if (level >= RIM_LEVEL && !tense) enterTense();
    if (level > 1) {
      overflow();
      return;
    }
    raf = requestAnimationFrame(pourFrame);
  }

  function stopPour() {
    if (!pouring) return;
    pouring = false;
    cancelAnimationFrame(raf);
    el.pour.classList.remove('is-pouring');
    el.pour.textContent = T.pourButton;
    stopPourSound();

    // 關水的那一刻才算最後的水位：至少 0.2 秒（不然每個人都可以加 0 秒傳下去），沒有上限
    level = levelAfter(pourFrom, heldMs() / 1000);
    paintCup(el.cup, shape, level);
    if (level >= RIM_LEVEL && !tense) enterTense();

    if (level > 1) {
      overflow();
      return;
    }
    setPhase('pass');
  }

  // ---------- 溢出 ----------

  function overflow() {
    if (overflowed) return;
    overflowed = true;
    pouring = false;
    cancelAnimationFrame(raf);
    el.pour.classList.remove('is-pouring');
    stopPourSound();
    playSplash();
    endMusic(); // 配樂收掉（一聲低音收尾）：結束畫面不留循環

    level = 1;
    paintCup(el.cup, shape, 1);
    el.cup.classList.remove('is-tense');
    el.cup.classList.add('is-overflow');
    el.flash.hidden = false;
    // 鏡頭維持拉近：水從杯口漫出來那一下要看得清楚（到結束畫面才復原）
    setCamera(true);

    track('cup_overflowed', {
      pours: pours,
      cup_size: prep.size,
      cup_shape: shapeKey,
      duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });

    // 讓溢出的畫面與聲音演完再切到結束畫面
    setTimeout(showEnd, reduceMotion ? 300 : 1100);
  }

  function showEnd() {
    if (screen !== 'play') return; // 溢出的動畫還在演的時候按了返回鍵
    if (pours > best) best = pours;
    el.endStats.textContent = fill(T.endStats, { n: pours });
    // 同一場的最佳紀錄當下一杯的目標；第一杯沒有東西可比
    el.endBest.hidden = gameNumber < 2;
    el.endBest.textContent = fill(T.endBest, { n: best });
    // 結束畫面畫**這一局那個杯型**（溢出的樣子），鏡頭回到原本的大小
    setCamera(false);
    renderCup(el.endCup);
    paintCup(el.endCup, shape, 1);
    el.endCup.classList.add('is-overflow');
    showScreen('end');
  }

  function nextPerson() {
    pours += 1;
    el.turn.textContent = fill(T.pourTurn, { n: pours + 1 });
    setPhase('pour');
    window.scrollTo(0, 0);
  }

  // ---------- 真心話大冒險拉霸（全站共用的 Leader.slot） ----------

  var slotTool = null;
  function resetSlot() {
    if (!Leader) return;
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.CUP.slot.prompts,
        actions: window.CUP.slot.actions,
        sound: function () { return settings.sound; },
        onPull: function (info) {
          track('cup_slot_pulled', { kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  // play 不放步驟頭：手機在大家手上傳（apps/warmup/CLAUDE.md）
  function renderLead() {
    if (screen === 'play') return;
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[screen][0],
      say: T.lead[screen][1],
    });
  }

  // ---------- 「說明規則」三張插圖卡的插圖 ----------

  // 說話泡泡（跟木頭人動作版同一個畫法）
  function bubble(x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  }

  // 1. 點一下加水：水壺倒水進杯子，杯子笑著看水進來
  function artPour() {
    return W.ground + W.burst(138, 22, '#FFC628') + W.ring(18, 92, '#7489E6') + W.plus(146, 62, '#4FB59A') +
      // 水壺：壺身＋右上的壺嘴，左邊一個把手
      W.body('<path d="M14 30h28l14 10-14 8v20H14z"/>', '#FFC628') +
      '<path d="M14 40q-9 3-9 11t9 10" fill="none" ' + W.K + '/>' +
      // 水柱：藍色塊（用線畫會跟描邊混在一起看不出來）
      W.body('<path d="M50 50c8 10 13 21 15 32h-11c-2-11-6-21-12-29z"/>', '#9ad3ec') +
      // 杯子：杯身有水、笑臉
      W.body('<path d="M56 68h50l-5 34c-1 8-8 14-20 14s-19-6-20-14z"/>', '#9ad3ec') +
      W.makeFace('smile', 81, 94, 1.5) +
      W.dot(120, 46, '#9ad3ec', 4) + W.dot(132, 68, '#9ad3ec', 3);
  }

  // 2. 換下一個人：手機從左邊的人傳到右邊的人
  function artPass() {
    return W.ground + W.ring(22, 26, '#F3A4FB') + W.plus(144, 30, '#4FB59A') +
      W.body('<circle cx="34" cy="86" r="24"/>', '#FFC628') + W.makeFace('smile', 34, 86, 1.2) +
      W.body('<circle cx="126" cy="86" r="24"/>', '#aebcf3') + W.makeFace('happy', 126, 86, 1.2) +
      W.body('<rect x="68" y="62" width="24" height="38" rx="7"/>', '#9ad3ec') +
      '<path d="M58 44h44m-10-8 10 8-10 8" fill="none" ' + W.K + '/>' +
      W.dot(150, 104, '#FFC628', 4);
  }

  // 3. 溢出來就輸：水撐出杯口、從兩側流下來，杯子慌了
  function artOverflow() {
    return W.ground + W.burst(24, 30, '#EE7B6A') + W.dot(150, 104, '#F3A4FB', 4) +
      // 撐出杯口的水（只在杯口上方鼓一包，包住杯身會變成一頂帽子）
      W.body('<path d="M53 66q27-20 54 0z"/>', '#9ad3ec') +
      // 杯子
      W.body('<path d="M56 64h48l-5 38c-1 9-8 14-19 14s-18-5-19-14z"/>', '#9ad3ec') +
      W.makeFace('worry', 80, 92, 1.5) +
      // 兩邊滴下來的水＋地上的一灘
      W.dot(46, 82, '#9ad3ec', 5) + W.dot(42, 100, '#9ad3ec', 3) +
      W.dot(116, 86, '#9ad3ec', 5) + W.dot(121, 103, '#9ad3ec', 3) +
      W.body('<ellipse cx="52" cy="114" rx="15" ry="5"/>', '#9ad3ec') +
      bubble(132, 36, '!');
  }
  var RULE_ART = [artPour, artPass, artOverflow];

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    renderLead();
    if (next === 'end') resetSlot();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  /*
   * 這一局抽哪一種容器。杯型跟杯子大小（＝幾秒才滿）是兩件獨立的事。
   *
   * **八種一律都在池子裡，不看聲音開關**（老闆 2026-11-09 改的）：
   * 不透明的那三款就算沒有聲音也玩得下去——水撐到杯口的時候壺口還是看得到水面冒出來，
   * 那一刻就是判斷點。反過來，不透明正好是「打開聲音比較有利」的誘因（音高可以提早判斷），
   * 所以聲音關著又抽到不透明時只給一句可以無視的提示（syncCupNote），不擋路、不強制。
   * 權重壓低不透明的機率（weight 0.6～0.8，合起來約三成），不然一直抽到看不見水位的。
   */
  function pickShape() {
    var total = SHAPE_KEYS.reduce(function (sum, key) { return sum + SHAPES[key].weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < SHAPE_KEYS.length; i += 1) {
      r -= SHAPES[SHAPE_KEYS[i]].weight;
      if (r < 0) return SHAPE_KEYS[i];
    }
    return SHAPE_KEYS[SHAPE_KEYS.length - 1];
  }

  /*
   * 杯型說明**只在「抽完容器、還沒加水」的那一刻出現**，第一次加水之後就收起來
   * （老闆 2026-11-09）。那句話是開局的提示，不是玩的時候要一直看的東西；
   * 收起來之後騰出來的高度直接餵給杯子（手機上杯子是撐滿剩餘空間的）。
   */
  function syncCupNote() {
    var intro = !noteDone;
    el.cupNote.hidden = !intro;
    el.cupNote.textContent = T.shapeNotes[shapeKey];
    // 不透明那幾款要特別提醒「用耳朵聽」，所以這一行加重
    el.cupNote.classList.toggle('is-blind', shape.opaque);
    // 看不到水位又沒開聲音：給一句話引導他打開音符鍵（可以無視，不擋開始加水）
    el.soundNudge.hidden = !(intro && shape.opaque && !settings.sound);
  }

  /*
   * 抽容器的動畫（老闆 2026-11-09：「可以做一個抽瓶子的動畫，抽到後就可以顯示這段，然後才開始遊戲」）。
   * 一次比一次慢地換杯型，最後落在真正抽到的那一種，然後才顯示那一行說明、才進 pour。
   * drawToken：換局或中途離開時，讓還在跑的舊動畫自己停下來。
   * reduceMotion 時直接跳到結果（全站慣例）。
   */
  var drawToken = 0;

  function settleShape() {
    shape = SHAPES[shapeKey];
    renderCup(el.cup);
    paintCup(el.cup, shape, 0);
  }

  function runShapeDraw(done) {
    var token = (drawToken += 1);
    var delays = [70, 70, 80, 95, 115, 140, 175, 215, 265, 330];
    var pool = SHAPE_KEYS.filter(function (key) { return key !== shapeKey; });
    var i = 0;
    el.cupStage.classList.remove('is-drawn');
    el.cupStage.classList.add('is-drawing');

    function step() {
      if (token !== drawToken || screen !== 'play') return;
      if (i >= delays.length) {
        settleShape();
        el.cupStage.classList.remove('is-drawing');
        el.cupStage.classList.add('is-drawn');
        done();
        return;
      }
      shape = SHAPES[pool[Math.floor(Math.random() * pool.length)]];
      renderCup(el.cup);
      paintCup(el.cup, shape, 0);
      setTimeout(step, delays[i]);
      i += 1;
    }
    step();
  }

  // 新的一杯：換一種杯型、空杯、從第一個人開始
  function startPlay() {
    gameNumber += 1;
    level = 0;
    pours = 0;
    tense = false;
    tenseSeen = false;
    overflowed = false;
    startedAt = Date.now();

    noteDone = false;
    shapeKey = pickShape();
    shape = SHAPES[shapeKey];
    renderCup(el.cup);
    syncCupNote();
    setCamera(false);

    el.cup.classList.remove('is-overflow', 'is-tense');
    el.flash.hidden = true;
    paintCup(el.cup, shape, 0);
    syncTense();
    el.turn.textContent = fill(T.pourTurn, { n: 1 });
    // 先抽容器，抽到了才顯示說明、才開始加水
    setPhase('draw');
    showScreen('play');
    // 配樂從抽容器就開始（開場不播，開始玩才有——全站規則）。
    // 這裡一定在使用者的 click 裡（「開始加水」或「再來一杯」），AudioContext 才建得起來
    syncMusic();
    drawToken += 1; // 停掉上一局還沒跑完的抽獎
    if (reduceMotion) {
      settleShape();
      setPhase('pour');
    } else {
      runShapeDraw(function () { setPhase('pour'); });
    }
    track('cup_game_started', { game_number: gameNumber, cup_size: prep.size, cup_shape: shapeKey });
  }

  // ---------- 返回鍵：一律回第一頁；已經加過水就先確認（照 02／03 的 history 處理） ----------

  function pushGameState() {
    history.pushState({ cup: 'game' }, '');
  }

  // 直接收掉，不走 stopPour（那條路會補最低水量、甚至當場溢出）
  function backToSetup() {
    pouring = false;
    cancelAnimationFrame(raf);
    el.pour.classList.remove('is-pouring');
    stopPourSound();
    stopMusic(0.25); // 回到開場就不該有配樂（開場不播）
    setCamera(false); // 鏡頭一定要復原，不然下一杯一開始就是放大的
    showScreen('setup');
  }

  function goBack(fromPop) {
    if (el.leaveModal.open) {
      el.leaveModal.close();
      if (fromPop) pushGameState();
      return;
    }
    if (screen === 'setup') {
      if (!fromPop) location.href = '/' + LANG + '/games/';
      return;
    }
    if (screen === 'play' && (pours > 0 || level > 0)) {
      if (fromPop) pushGameState();
      if (typeof el.leaveModal.showModal === 'function') el.leaveModal.showModal();
      else confirmLeave();
      return;
    }
    backToSetup();
    if (!fromPop) history.back();
  }

  function confirmLeave() {
    if (el.leaveModal.open) el.leaveModal.close();
    backToSetup();
    history.back();
  }

  // ---------- 綁定 ----------

  (function initSettings() {
    var saved = readJson(SETTINGS_KEY, null);
    if (saved && typeof saved === 'object' && typeof saved.sound === 'boolean') settings.sound = saved.sound;
    syncSoundButton();
  })();

  Array.prototype.forEach.call(document.querySelectorAll('input[name="size"]'), function (input) {
    input.checked = input.value === prep.size;
    input.addEventListener('change', function () {
      if (input.checked) prep.size = input.value;
    });
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);
  el.pass.addEventListener('click', nextPerson);

  /*
   * 加水：**點一下開水、再點一次關水**（老闆 11/09 定：不是按住）。
   * 一顆按鈕兩個狀態，所以用 click 就夠了——鍵盤的空白鍵／Enter 本來就會觸發 click，
   * 不用自己接 keydown／keyup（那是按住版才需要的）。
   */
  el.pour.addEventListener('click', function () {
    if (pouring) stopPour();
    else startPour();
  });
  // 切到別的 App、鎖屏：當場停下來，回來不會莫名其妙多一大杯
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopPour();
      // 配樂也停：背景分頁的 setInterval 會被節流，排程會亂（跟 Leader.metronome 同一個理由）
      stopMusic(0.1);
      return;
    }
    // 切回這一頁時重建聲音引擎：使用者可能剛去把手機的靜音鍵扳回來（見 resetAudio）
    if (pouring) return;
    resetAudio();
    syncMusic(); // 還在加水的畫面就把配樂接回來，在開場／結束畫面就不要自己冒出來
  });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  // 杯子每一局都重畫（startPlay 抽杯型、showEnd 畫結束畫面那一個），這裡先放一個不會被看到的空杯
  renderCup(el.cup);
  paintCup(el.cup, shape, 0);
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
