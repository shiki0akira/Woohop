/*
 * 定時炸彈（05_TimeBomb）。單機一台手機傳著玩，沒有房間、沒有連線、沒有後端——
 * 這一份檔案就是整個遊戲（設計決策見 CONCEPT.md）。
 *
 * 三個畫面靠 showScreen() 切換，共用同一個網址；GA4 的 page_view 由這裡手動送，
 * 不然三個畫面只會被記成一筆。
 *
 * 這份程式裡有兩件事特別容易做壞，改動時請先讀對應的註解：
 *   1. 計時一律用**絕對截止時刻**比對，不要累加（見 startRound / checkFuse）
 *   2. 滴答的加速用**最長時間**當分母，不是實際引爆時間（見 scheduleTick）
 */
(function () {
  'use strict';

  var T = window.BOMB.T;
  var DATA = window.BOMB.questions;
  var TIMER = window.BOMB.timer;
  var BASE = window.BOMB.base;
  var LANG = window.BOMB.lang;

  var SETTINGS_KEY = 'web100-bomb-settings';
  var CUSTOM_KEY = 'web100-bomb-custom';

  // ---------- 狀態 ----------

  /*
   * 勾選的單位是**分組**（ask / dare），不是題庫裡那五個分類——設定畫面上就只有
   * 兩顆按鈕。五個分類留在 questions.js 當題庫的整理方式，前端根本收不到
   * （scripts/build.js 的 questionsFor 只送 group）。
   */
  var settings = {
    groups: DATA.groups.slice(),
    min: TIMER.defaultMin,
    max: TIMER.defaultMax,
    // 「自訂」那兩排有沒有展開。跟著設定一起記住，調過一次的人下次打開還在
    timerCustom: false,
    // 聲音（滴答、爆炸、背景配樂、拉霸）總開關，在頂欄的音符鍵（2026-10-21 使用者要求加上）
    sound: true,
  };

  var custom = [];

  // 牌堆：勾選到的題目整副洗牌，發完才重洗（CONCEPT.md 2.5）
  var deck = [];
  var deckIndex = 0;

  var round = {
    startedAt: 0,
    deadline: 0,
    maxMs: 0,
    drawn: 0,
    done: 0,
    skipped: 0,
    checkId: 0,
  };

  // 這次打開頁面之後玩到第幾輪（重新整理才歸零），送進 GA4 當黏著度指標
  var roundNumber = 0;

  var screen = 'setup';
  var wakeLock = null;
  var audio = { ctx: null, tickId: 0, bgm: 0, next: 0, step: 0 };

  // ---------- DOM ----------

  var views = {
    setup: document.getElementById('view-setup'),
    rules: document.getElementById('view-rules'),
    play: document.getElementById('view-play'),
    boom: document.getElementById('view-boom'),
  };

  var el = {
    presetSeg: document.getElementById('preset-seg'),
    timerToggle: document.getElementById('timer-toggle'),
    timerCustom: document.getElementById('timer-custom'),
    minSeg: document.getElementById('min-seg'),
    maxSeg: document.getElementById('max-seg'),
    pickButtons: document.getElementById('pick-buttons'),
    deckCount: document.getElementById('deck-count'),
    deckWarning: document.getElementById('deck-warning'),
    customOpenCount: document.getElementById('game-settings-count'),
    customModal: document.getElementById('custom-modal'),
    customInput: document.getElementById('custom-input'),
    customGroup: document.getElementById('custom-group'),
    customAdd: document.getElementById('custom-add'),
    customList: document.getElementById('custom-list'),
    customEmpty: document.getElementById('custom-empty'),
    customDone: document.getElementById('custom-done'),
    startGame: document.getElementById('start-game'),
    taskTag: document.getElementById('task-tag'),
    taskText: document.getElementById('task-text'),
    passRow: document.querySelector('.pass-row'),
    passButton: document.getElementById('pass-button'),
    skipButton: document.getElementById('skip-button'),
    playHint: document.getElementById('play-hint'),
    boomStats: document.getElementById('boom-stats'),
    playAgain: document.getElementById('play-again'),
    ruleCards: document.getElementById('rule-cards'),
    rulesNext: document.getElementById('rules-next'),
    slotRoot: document.getElementById('slot-root'),
    leaveModal: document.getElementById('leave-modal'),
    leaveCancel: document.getElementById('leave-cancel'),
    leaveConfirm: document.getElementById('leave-confirm'),
  };

  // ---------- 小工具 ----------

  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (whole, key) {
      return key in values ? values[key] : whole;
    });
  }

  /*
   * 同樣是填佔位符，但把填進去的值包成 <strong class="stat">，數字才會從說明文字裡跳出來。
   *
   * 用 DOM 節點拼、不用 innerHTML：文案裡有引號與破折號，之後也可能有人加尖括號，
   * 走字串拼裝遲早會踩到跳脫問題。
   */
  function fillInto(node, template, values) {
    node.textContent = '';

    String(template)
      .split(/(\{\w+\})/)
      .forEach(function (piece) {
        var key = piece.slice(1, -1);
        if (piece.charAt(0) === '{' && key in values) {
          var strong = document.createElement('strong');
          strong.className = 'stat';
          strong.textContent = values[key];
          node.appendChild(strong);
          return;
        }
        if (piece) node.appendChild(document.createTextNode(piece));
      });
  }

  // 30 秒以下講「秒」、以上講「分」。60 的倍數才有整數分鐘，這裡的選項都是
  function timeLabel(seconds) {
    if (seconds < 60) return fill(T.secondsUnit, { n: seconds });
    return fill(T.minutesUnit, { n: seconds / 60 });
  }

  function durationLabel(ms) {
    var total = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    if (m === 0) return fill(T.durationSec, { s: s });
    return fill(T.durationMinSec, { m: m, s: s });
  }

  // 文案的 key 是「group + 首字大寫」（groupAsk / groupDare），
  // 跟 scripts/build.js 的 checkStrings 用的是同一條規則
  function groupLabel(id) {
    return T['group' + id.charAt(0).toUpperCase() + id.slice(1)] || id;
  }

  function track(name, params) {
    if (typeof gtag !== 'function') return;
    gtag('event', name, params || {});
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      // 無痕模式、封鎖 storage、或存進去的東西被改壞了：這一場照樣能玩，只是記不住
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 同上 */
    }
  }

  // ---------- 設定的存取 ----------

  function loadSettings() {
    var saved = readJson(SETTINGS_KEY, null);
    if (saved && typeof saved === 'object') {
      // 逐項檢查而不是整包套用：存檔可能是舊版留下的，帶著已經不存在的分組或選項
      if (Array.isArray(saved.groups)) {
        var kept = saved.groups.filter(function (id) {
          return DATA.groups.indexOf(id) !== -1;
        });
        if (kept.length) settings.groups = kept;
      }
      if (TIMER.minOptions.indexOf(saved.min) !== -1) settings.min = saved.min;
      if (TIMER.maxOptions.indexOf(saved.max) !== -1) settings.max = saved.max;
      if (typeof saved.timerCustom === 'boolean') settings.timerCustom = saved.timerCustom;
      if (typeof saved.sound === 'boolean') settings.sound = saved.sound;
    }
    clampRange();

    // 存檔裡的區間對不到任何一顆預設時一定要展開，否則三顆都不亮，
    // 而使用者完全看不到自己上次選的是什麼
    if (!presetFor(settings.min, settings.max)) settings.timerCustom = true;

    var savedCustom = readJson(CUSTOM_KEY, []);
    if (Array.isArray(savedCustom)) {
      custom = savedCustom.filter(function (item) {
        return item && typeof item.text === 'string' && DATA.groups.indexOf(item.group) !== -1;
      });
    }
  }

  function saveSettings() {
    writeJson(SETTINGS_KEY, settings);
  }

  function saveCustom() {
    writeJson(CUSTOM_KEY, custom);
  }

  // 「最長」不能小於「最短」。使用者把最短往上調時，最長跟著被推上去，
  // 不讓畫面上出現一個組不出來的區間。
  function clampRange() {
    if (settings.max >= settings.min) return;
    for (var i = 0; i < TIMER.maxOptions.length; i += 1) {
      if (TIMER.maxOptions[i] >= settings.min) {
        settings.max = TIMER.maxOptions[i];
        return;
      }
    }
    settings.max = TIMER.maxOptions[TIMER.maxOptions.length - 1];
  }

  // ---------- 設定畫面 ----------

  function renderSegs() {
    buildPresetSeg();
    buildSeg(el.minSeg, 'min', TIMER.minOptions, settings.min);
    buildSeg(el.maxSeg, 'max', TIMER.maxOptions, settings.max);
    syncTimerCustom();
  }

  function presetFor(min, max) {
    for (var i = 0; i < TIMER.presets.length; i += 1) {
      if (TIMER.presets[i].min === min && TIMER.presets[i].max === max) return TIMER.presets[i];
    }
    return null;
  }

  /*
   * 三顆區間按鈕（選項本體在 scripts/build.js 的 TIMER.presets）。
   *
   * 按鈕上只寫區間本身（「30 秒–2 分」），不另外取「快 / 標準 / 慢」那種名字：
   * 區間就是最清楚的說明，而且不用為了三顆按鈕多翻八種語言。
   */
  function buildPresetSeg() {
    el.presetSeg.textContent = '';
    var current = presetFor(settings.min, settings.max);

    TIMER.presets.forEach(function (preset) {
      var label = document.createElement('label');
      label.className = 'seg-item';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'fuse-preset';
      input.value = preset.id;
      input.checked = Boolean(current) && current.id === preset.id;

      input.addEventListener('change', function () {
        settings.min = preset.min;
        settings.max = preset.max;
        // 按了現成的區間就把自訂收起來——那兩排已經沒有東西要看了
        settings.timerCustom = false;
        saveSettings();
        renderSegs();
      });

      var span = document.createElement('span');
      // 「30 Sek.」「2 Min.」各自不能斷（數字跟單位黏在一起），格子太窄時只在兩段中間換行。
      // 不這樣做的話德文在 375px 會折成「30 Sek.–2 / Min.」
      var nb = function (s) { return s.replace(/ /g, ' '); };
      span.textContent = fill(T.timeRange, {
        min: nb(timeLabel(preset.min)),
        max: '​' + nb(timeLabel(preset.max)),
      });

      label.appendChild(input);
      label.appendChild(span);
      el.presetSeg.appendChild(label);
    });
  }

  function syncTimerCustom() {
    el.timerCustom.hidden = !settings.timerCustom;
    el.timerToggle.setAttribute('aria-expanded', String(settings.timerCustom));
  }

  function buildSeg(container, name, options, current) {
    container.textContent = '';
    options.forEach(function (seconds) {
      var label = document.createElement('label');
      label.className = 'seg-item';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'fuse-' + name;
      input.value = String(seconds);
      input.checked = seconds === current;
      // 選不到的組合直接停用，而不是讓人選了再跳錯誤
      if (name === 'max' && seconds < settings.min) input.disabled = true;

      input.addEventListener('change', function () {
        settings[name] = seconds;
        clampRange();
        saveSettings();
        renderSegs();
      });

      var span = document.createElement('span');
      span.textContent = timeLabel(seconds);

      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  /*
   * 兩顆大按鈕**只建一次**，之後任何變動都走 syncPickUi() 就地更新。
   *
   * 原本是每次勾選都把整塊 DOM 重建一次，那樣有兩個問題：鍵盤使用者按下空白鍵的
   * 當下焦點就跟著被刪掉的節點一起消失；而且連續改動時，後面的事件是打在已經
   * 脫離文件、狀態還停在舊值的節點上，settings 會跟畫面對不起來。
   */
  var pickButtons = {};
  var pickCounts = {};

  function renderPicks() {
    el.pickButtons.textContent = '';
    pickButtons = {};
    pickCounts = {};

    DATA.groups.forEach(function (id) {
      var button = document.createElement('button');
      button.type = 'button';
      // 兩顆各有自己的色組（問答型走 Primary、動作型走 Secondary），見 app.css
      // Woohop 的大選項卡（woohop.css 的 .choice）：問答型選了變藍、動作型選了變珊瑚
      button.className = 'choice pick-' + id + (id === 'ask' ? ' c-blue' : ' c-coral');

      var icon = document.createElement('span');
      icon.className = 'choice-icon';
      // <use> 指到 template.html 開頭那組 symbol，圖示不用重複貼在每顆按鈕裡
      icon.innerHTML = '<svg aria-hidden="true"><use href="#icon-' + id + '"></use></svg>';

      var name = document.createElement('span');
      name.className = 'choice-name';
      name.textContent = groupLabel(id);

      var count = document.createElement('span');
      count.className = 'choice-sub';

      button.appendChild(icon);
      button.appendChild(name);
      button.appendChild(count);

      button.addEventListener('click', function () {
        setSelected(id, !isSelected(id));
        saveSettings();
        syncPickUi();
        refreshDeckInfo();
      });

      el.pickButtons.appendChild(button);
      pickButtons[id] = button;
      pickCounts[id] = count;
    });

    syncPickUi();
  }

  // 選取狀態與題數都從 settings 重新算，不從畫面上讀——畫面永遠是資料的投影
  function syncPickUi() {
    DATA.groups.forEach(function (id) {
      // aria-pressed 同時是 CSS 的鉤子與螢幕閱讀器讀到的狀態，不另外掛一個 class
      if (pickButtons[id]) pickButtons[id].setAttribute('aria-pressed', String(isSelected(id)));
      if (pickCounts[id]) pickCounts[id].textContent = fill(T.catCount, { n: poolFor(id).length });
    });
  }

  function isSelected(id) {
    return settings.groups.indexOf(id) !== -1;
  }

  function setSelected(id, on) {
    var at = settings.groups.indexOf(id);
    if (on && at === -1) settings.groups.push(id);
    if (!on && at !== -1) settings.groups.splice(at, 1);
  }

  // 這一組目前可用的題目（含自訂題）
  function poolFor(id) {
    return DATA.list
      .filter(function (q) {
        return q.group === id;
      })
      .concat(
        custom.filter(function (q) {
          return q.group === id;
        }),
      );
  }

  function currentPool() {
    var out = [];
    settings.groups.forEach(function (id) {
      out = out.concat(poolFor(id));
    });
    return out;
  }

  function refreshDeckInfo() {
    var size = currentPool().length;
    el.deckCount.textContent = fill(T.deckCount, { n: size });

    var warning = '';
    if (!settings.groups.length || size === 0) warning = T.deckEmptyWarning;
    else if (size < 10) warning = fill(T.deckThinWarning, { n: size });

    el.deckWarning.textContent = warning;
    el.deckWarning.hidden = !warning;
    el.startGame.disabled = size === 0;
  }

  function renderCustom() {
    el.customList.textContent = '';

    custom.forEach(function (item) {
      var li = document.createElement('li');

      var text = document.createElement('span');
      text.className = 'text';
      text.textContent = item.text;

      var tag = document.createElement('span');
      tag.className = 'cat-tag';
      tag.textContent = groupLabel(item.group);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'chosen-remove';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', T.customRemoveLabel);
      remove.addEventListener('click', function () {
        custom = custom.filter(function (other) {
          return other.id !== item.id;
        });
        saveCustom();
        renderCustom();
        syncPickUi();
        refreshDeckInfo();
      });

      li.appendChild(text);
      li.appendChild(tag);
      li.appendChild(remove);
      el.customList.appendChild(li);
    });

    el.customEmpty.hidden = custom.length > 0;
    // 首頁那顆按鈕帶著題數：不打開彈窗也看得出來自己加過幾題
    el.customOpenCount.textContent = custom.length ? fill(T.catCount, { n: custom.length }) : '';
  }

  /*
   * 開彈窗前先 pushState 一格，返回鍵才會是「關掉彈窗」而不是直接離開網站
   * ——設定畫面的返回鍵本來就是直接退出（CONCEPT.md 2.11），少了這一步，
   * 在彈窗裡按返回的人會連整個遊戲一起關掉。
   */
  var hasDialog = typeof el.customModal.showModal === 'function';

  /*
   * 開著沒有靠 <dialog> 的 open 屬性判斷，自己記一個旗標。
   *
   * 這支負責的是「推的那一格 history 有沒有收掉」，而收掉的時機**不能**掛在
   * close 事件上：那個事件的支援度在各家 WebView 裡並不一致（開發時用的
   * 內嵌瀏覽器就完全不發），漏發一次就會多留一格，返回鍵得多按一次才離得開。
   * 所以每條關閉路徑都自己收，旗標負責擋掉重複收的情況。
   */
  var customOpen = false;

  function isCustomOpen() {
    return customOpen;
  }

  function openCustomModal() {
    customOpen = true;
    history.pushState({ bomb: 'custom' }, '');
    if (hasDialog) el.customModal.showModal();
    else el.customModal.setAttribute('open', ''); // 沒有 <dialog> 的舊瀏覽器：至少露得出來
  }

  // fromPop：這次關閉是返回鍵造成的，剛剛推的那一格已經被吃掉了，不用再 back 一次
  function closeCustomModal(fromPop) {
    if (!customOpen) return; // 同一次關閉被兩條路徑各叫一次（例如按了「完成」又收到 close 事件）
    customOpen = false;

    if (hasDialog) el.customModal.close();
    else el.customModal.removeAttribute('open');

    if (!fromPop) history.back();
  }

  function buildCustomGroupSelect() {
    el.customGroup.textContent = '';
    DATA.groups.forEach(function (id) {
      var option = document.createElement('option');
      option.value = id;
      option.textContent = groupLabel(id);
      el.customGroup.appendChild(option);
    });
  }

  function addCustom() {
    var text = el.customInput.value.trim();
    if (!text) return;

    custom.push({
      // Date.now() 會撞（連按兩下就同一個毫秒），補一段亂數當後綴
      id: 'custom.' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text,
      group: el.customGroup.value,
    });
    saveCustom();

    el.customInput.value = '';
    el.customInput.focus();
    renderCustom();
    syncPickUi();
    refreshDeckInfo();
    track('bomb_custom_added', { group: el.customGroup.value });
  }

  // ---------- 牌堆 ----------

  function shuffle(items) {
    var out = items.slice();
    for (var i = out.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function buildDeck() {
    deck = shuffle(currentPool());
    deckIndex = 0;
  }

  /*
   * 發完就重洗。重洗時避開「新牌堆的第一題正好是舊牌堆的最後一題」——
   * 接連兩題一樣看起來就像壞掉了。只有一題可選時沒得避，就讓它重複。
   */
  function drawTask() {
    if (deckIndex >= deck.length) {
      var last = deck.length ? deck[deck.length - 1] : null;
      var reshuffled = shuffle(currentPool());
      if (last && reshuffled.length > 1 && reshuffled[0].id === last.id) {
        var moved = reshuffled.shift();
        reshuffled.push(moved);
      }
      deck = reshuffled;
      deckIndex = 0;
    }
    if (!deck.length) return null;

    var task = deck[deckIndex];
    deckIndex += 1;
    return task;
  }

  // ---------- 音效 ----------

  /*
   * 滴答與爆炸都用 Web Audio 當場合成，不載音檔（CONCEPT.md 2.8）。
   * AudioContext 一定要在使用者手勢裡建立／resume，所以它綁在「開始遊戲」那一下。
   *
   * 2026-10-21 起**有聲音開關**（頂欄的音符鍵，跟竹筍竹筍蹦蹦出同一顆）：原本認為關手機音量就好，
   * 但加了背景配樂之後，主持人要講話時需要能一鍵關掉。開關管全部聲音：滴答、爆炸、配樂、拉霸。
   */
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

  function playTick() {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playBoom() {
    if (!settings.sound) return;
    var ctx = ensureAudio();
    if (!ctx) return;

    var now = ctx.currentTime;
    var seconds = 0.9;
    var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i += 1) {
      // 白噪音乘上指數衰減 = 爆炸。指數比線性像，線性聽起來像有人在關水龍頭
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    }

    var source = ctx.createBufferSource();
    source.buffer = buffer;

    // 低通把高頻刮掉，剩下的才是「悶悶的一聲」而不是「嘶——」
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + seconds);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, now);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  /*
   * 滴答的間隔從 1000ms 縮到 250ms。
   *
   * **分母是「最長時間」，不是這一輪的實際引爆時間。** 用實際時間的話，滴答一定會在
   * 爆炸前加速到最快，等於把藏起來的倒數用聲音演出來（CONCEPT.md 2.2 就白藏了）。
   * 用最長值當分母之後，實際引爆早於最長值的那幾輪就是「滴答還不急、突然就炸了」。
   */
  function scheduleTick() {
    clearTimeout(audio.tickId);
    if (screen !== 'play') return;

    var progress = Math.min(1, (Date.now() - round.startedAt) / round.maxMs);
    var interval = 1000 - 750 * progress;

    audio.tickId = setTimeout(function () {
      if (screen !== 'play') return;
      playTick();
      scheduleTick();
    }, interval);
  }

  /*
   * 背景配樂：低音、大鼓、hi-hat 組成的緊張循環，越接近「最長時間」越快（96 → 148 BPM）。
   * 跟滴答一樣用**最長時間**當分母，不洩漏實際引爆時刻（CONCEPT.md 2.2）。
   * 排程用「音訊時鐘＋往前看」：setInterval 每 25ms 把接下來 0.12 秒的音符排好，主執行緒忙也不會歪拍。
   */
  var BGM_BASS = [110, 0, 110, 0, 130.81, 0, 110, 0, 82.41, 0, 98, 0, 110, 0, 123.47, 0];

  function bgmVoice(t, freq, peak, decay, type, filterFreq) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }

  function bgmKick(t) {
    var ctx = audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  function bgmTick() {
    var ctx = audio.ctx;
    var progress = Math.min(1, (Date.now() - round.startedAt) / round.maxMs);
    var bpm = 96 + 52 * progress;
    while (audio.next < ctx.currentTime + 0.12) {
      var t = audio.next;
      var s = audio.step % 16;
      if (s === 0 || s === 8 || (progress > 0.5 && (s === 6 || s === 14))) bgmKick(t);
      if (BGM_BASS[s]) bgmVoice(t, BGM_BASS[s], 0.22, 0.18, 'sawtooth', 500 + 900 * progress);
      if (s % 2 === 1) bgmVoice(t, 6000, 0.025, 0.03, 'square', 9000);
      audio.next += 60 / bpm / 4;
      audio.step += 1;
    }
  }

  function startBgm() {
    stopBgm();
    if (!settings.sound || screen !== 'play') return;
    var ctx = ensureAudio();
    if (!ctx) return;
    audio.next = ctx.currentTime + 0.05;
    audio.step = 0;
    audio.bgm = setInterval(bgmTick, 25);
    bgmTick();
  }

  function stopBgm() {
    clearInterval(audio.bgm);
    audio.bgm = 0;
  }

  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫 window.toggleMusic）
  var soundButton = document.getElementById('game-music');
  function syncSoundButton() {
    if (soundButton) soundButton.setAttribute('aria-pressed', String(settings.sound));
  }
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    saveSettings();
    syncSoundButton();
    if (settings.sound) startBgm();
    else stopBgm();
  };

  // ---------- 螢幕保持亮著 ----------

  function requestWakeLock() {
    if (!navigator.wakeLock) return;
    navigator.wakeLock
      .request('screen')
      .then(function (lock) {
        wakeLock = lock;
      })
      .catch(function () {
        // 電量過低、不是使用者手勢觸發、瀏覽器不給——都不影響遊戲本身
      });
  }

  function releaseWakeLock() {
    if (!wakeLock) return;
    var lock = wakeLock;
    wakeLock = null;
    lock.release().catch(function () {});
  }

  // ---------- 帶領的步驟（全站共用的 Leader，game.js；跟竹筍竹筍蹦蹦出同一套） ----------

  /*
   * 一步一步帶：setup 選題目 → rules 說明規則 → play 開始（手機在大家手上傳）→ boom 誰輸了（拉霸）→ 再玩一輪回 play。
   * play 那一步手機在傳，不放步驟頭，畫面只留題目和「完成」。
   */
  var STEPS = ['setup', 'rules', 'play', 'boom'];

  function renderLead() {
    if (!window.Leader || !T.lead[screen]) return;
    window.Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[screen][0],
      say: T.lead[screen][1],
    });
  }

  /*
   * 「說明規則」三張插圖卡的插圖：拿到就做（炸彈本人）、做完傳下去（炸彈＋箭頭）、爆了就輸（爆炸）。
   * 都用 woohop-art.js 的畫法（粗描邊留缺口、色塊錯開露出白邊），跟網站其他插圖一致
   */
  var W = window.Woohop;
  var RULE_ART = [
    function () { return W.art.bomb(); },
    function () {
      return W.ground + W.plus(146, 92, '#4FB59A') +
        W.body('<circle cx="62" cy="80" r="26"/>', '#EE7B6A') + W.makeFace('smile', 62, 80, 1.6) +
        '<path d="M96 52q22-10 38 8" fill="none" ' + W.K + '/><path d="M126 50l9 10-13 2" fill="none" ' + W.K + '/>' +
        W.ring(134, 96, '#7489E6', 9);
    },
    function () {
      return W.ground + W.burst(30, 30, '#FFC628') + W.dot(140, 30, '#7489E6', 4) +
        W.body('<path d="m80 18 8 17 18-8-4 19 19 2-14 13 14 13-19 2 4 19-18-8-8 17-8-17-18 8 4-19-19-2 14-13-14-13 19-2-4-19 18 8z"/>', '#EE7B6A') +
        W.makeFace('worry', 80, 66, 1.8);
    },
  ];

  // 真心話大冒險拉霸（Leader.slot），題目在 apps/homepage/src/slot-prompts.mjs
  var slotTool = null;
  function resetSlot() {
    if (!window.Leader) return;
    if (!slotTool) {
      slotTool = window.Leader.slot(el.slotRoot, {
        prompts: window.BOMB.slot.prompts,
        actions: window.BOMB.slot.actions,
        sound: function () { return settings.sound; },
        onPull: function (info) {
          track('bomb_slot_pulled', { round_number: roundNumber, kind: info.kind, mode: info.mode });
        },
      });
    }
    slotTool.reset();
  }

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) {
      views[key].hidden = key !== next;
    });
    // 頂欄跟著畫面換：設定畫面是網站導覽列，進行中／爆炸是遊戲內頂欄（app.css 看這個屬性）
    document.body.setAttribute('data-screen', next);
    renderLead();
    if (next === 'boom') resetSlot();
    // 遊戲內頂欄（game.css）：設定畫面是 browse（有玩法、設定分頁與選單），進行中、爆炸是 play（只剩返回＋遊戲名，不能點出去）
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    // 頂欄的遊戲名是回主頁的連結，玩的時候不能點（CSS），鍵盤也不要停在它上面
    var gameTitle = document.querySelector('.game-bar .title');
    if (gameTitle) gameTitle.tabIndex = next === 'setup' ? 0 : -1;
    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') {
      window.trackPageView(BASE + '/' + LANG + '/' + next);
    }
  }

  // ---------- 一輪的開始與結束 ----------

  function startRound(freshDeck) {
    if (freshDeck) buildDeck();
    if (!deck.length) return;

    var minMs = settings.min * 1000;
    var maxMs = settings.max * 1000;

    round.startedAt = Date.now();
    round.maxMs = maxMs;
    // 區間內均勻隨機，而且不顯示——看得到倒數的話沒有人肯接最後一棒
    round.deadline = round.startedAt + minMs + Math.random() * (maxMs - minMs);
    round.drawn = 0;
    round.done = 0;
    round.skipped = 0;

    showScreen('play');
    nextTask();

    /*
     * 只比對絕對時刻，不累加。setInterval 在背景會被節流甚至停掉，用累加的話
     * 「把手機收進口袋再拿出來，炸彈永遠不爆」（CONCEPT.md 2.9）。
     * 200ms 是為了讓爆炸看起來即時，不是計時精度——精度全靠 round.deadline。
     */
    clearInterval(round.checkId);
    round.checkId = setInterval(checkFuse, 200);

    requestWakeLock();
    ensureAudio();
    scheduleTick();
    startBgm();

    /*
     * 事件送在這裡，不是綁在「開始遊戲」那顆按鈕上——「再玩一輪」走的是同一個
     * startRound()，綁在按鈕上的話第二輪之後就完全看不到了。
     *
     * `round_number` 是這次打開頁面之後的第幾輪（重新整理才歸零）。這個遊戲沒有房間、
     * 沒有玩家名單，能不能黏住人就只看**一群人願不願意連玩好幾輪**——
     * round_number > 1 的比例是這個專案唯一真正重要的指標。
     */
    roundNumber += 1;
    track('bomb_game_started', {
      round_number: roundNumber,
      groups: settings.groups.join(','),
      deck_size: deck.length,
      min_seconds: settings.min,
      max_seconds: settings.max,
    });
  }

  function stopRound() {
    clearInterval(round.checkId);
    round.checkId = 0;
    clearTimeout(audio.tickId);
    stopBgm();
    clearTimeout(stuckId);
    releaseWakeLock();
  }

  function checkFuse() {
    if (screen !== 'play') return;
    if (Date.now() < round.deadline) return;
    explode();
  }

  /*
   * 「完成」與「換一題」走同一條路：都是換下一題。
   *
   * 兩顆按鈕的差別只在現場的意思（做完了 vs 不會做），系統不記分也不罰，
   * 所以行為一致——但要分成兩顆，卡住的人才有一個不尷尬的出口可以按，
   * 不然他會抱著手機硬想，而炸彈還在跑。
   */
  function advance(skipped) {
    if (screen !== 'play') return;

    // 按下的當下就先確認一次引爆時刻：不然在 200ms 的間隔裡按下去，
    // 會先換到下一題、下一個瞬間才爆，看起來像爆在錯的人手上
    if (Date.now() >= round.deadline) {
      explode();
      return;
    }

    // 爆炸當下那一題兩邊都不算：它既沒做完也沒被跳過，這一輪就停在它身上
    if (skipped) round.skipped += 1;
    else round.done += 1;
    nextTask();
  }

  function nextTask() {
    var task = drawTask();
    if (!task) return;
    round.drawn += 1;
    el.taskText.textContent = task.text;
    /*
     * 題型標籤。自訂題目也帶著 group（addCustom 存的就是 group），所以這裡
     * 一律拿得到值——不用為自訂題另外做一個「未分類」的樣子。
     * class 用 tag-{group}，色組直接沿用設定畫面那兩顆按鈕的 --pick-a / --pick-b。
     */
    el.taskTag.textContent = groupLabel(task.group);
    el.taskTag.className = 'task-tag tag-' + task.group;
    armStuckHint();
  }

  /*
   * 同一題停滿 5 秒，「換一題」才從右邊滑進來，下面那行提示同時換成說明它的話。
   *
   * **一開始不擺出來**是刻意的：一上來就給兩顆按鈕，等於先告訴每個人「你可以不做」，
   * 那顆鍵會從救生圈變成捷徑。晚幾秒再出現，它才是幫忙的。
   *
   * 5 秒大約就是讀完一題、心裡判斷「這題我做不做得出來」的時間。原本設 15 秒，
   * 但炸彈一輪最短只有 30 秒，卡住的人要在全場面前乾等半條命才等到出口——
   * 那個尷尬正是這顆按鈕要消掉的東西。
   *
   * 只是讓一顆按鈕滑進來、換一行字，不跳彈窗也不自動換題——手機在別人手上，
   * 畫面突然自己跳掉會讓人以為按錯了什麼。
   */
  var STUCK_AFTER_MS = 5000;
  var stuckId = 0;

  function armStuckHint() {
    clearTimeout(stuckId);
    setStuck(false);

    stuckId = setTimeout(function () {
      if (screen !== 'play') return;
      setStuck(true);
    }, STUCK_AFTER_MS);
  }

  function setStuck(on) {
    el.playHint.textContent = on ? T.stuckHint : T.playHint;
    el.playHint.classList.toggle('is-stuck', on);
    el.passRow.classList.toggle('show-skip', on);
    // 收合時一併停用：Tab 不會停在一顆寬度 0、看不見的按鈕上
    el.skipButton.disabled = !on;
  }

  function explode() {
    stopRound();

    var elapsed = Date.now() - round.startedAt;
    showScreen('boom');

    // 一題都沒跳過的時候不提跳過——多一句「跳過 0 題」只是在提醒一件沒發生的事
    fillInto(el.boomStats, round.skipped ? T.boomStatsWithSkips : T.boomStats, {
      time: durationLabel(elapsed),
      done: round.done,
      skipped: round.skipped,
    });
    playBoom();
    if (navigator.vibrate) navigator.vibrate([120, 60, 240]);

    track('bomb_round_ended', {
      round_number: roundNumber,
      duration_seconds: Math.round(elapsed / 1000),
      tasks_done: round.done,
      // 跳過率高通常代表題目對這群人太難或太尷尬，是換題庫的訊號
      tasks_skipped: round.skipped,
    });
  }

  // 遊戲中回到設定畫面（返回鍵確認過、或爆炸後按「改設定」）
  function backToSetup() {
    stopRound();
    showScreen('setup');
    refreshDeckInfo();
  }

  // ---------- 返回鍵 ----------

  /*
   * 系列規則：設定畫面按返回直接離開；遊戲進行中按返回先跳確認。
   * 爆炸畫面已經沒有東西會失去，直接回設定，不多攔一次。
   *
   * 開始遊戲時推一個 history entry，返回鍵就會先吃掉它而不是離開網站。
   */
  function pushPlayState() {
    history.pushState({ bomb: 'play' }, '');
  }

  function onPopState() {
    // 彈窗開著的話，返回鍵的工作就是關掉它（開的時候推的那一格剛好被這次吃掉）
    if (isCustomOpen()) {
      closeCustomModal(true);
      return;
    }

    if (screen === 'setup') return;

    // 說明規則、誰輸了：沒有東西會不見，直接回第一頁（推的那一格剛好被這次吃掉）
    if (screen === 'boom' || screen === 'rules') {
      backToSetup();
      return;
    }

    // 進行中：畫面留在原地（把剛被吃掉的那一格推回去），改用彈窗問
    pushPlayState();
    openLeaveModal();
  }

  function openLeaveModal() {
    if (typeof el.leaveModal.showModal === 'function') el.leaveModal.showModal();
    else backToSetup(); // 沒有 <dialog> 的舊瀏覽器：不要卡住使用者，直接放行
  }

  function closeLeaveModal() {
    if (el.leaveModal.open) el.leaveModal.close();
  }

  // ---------- 綁定 ----------

  el.timerToggle.addEventListener('click', function () {
    settings.timerCustom = !settings.timerCustom;
    saveSettings();
    syncTimerCustom();
  });


  el.customDone.addEventListener('click', function () {
    closeCustomModal(false);
  });

  // Esc 關掉時只會發 close 事件、不會經過「完成」那條路，那一格一樣要收掉
  el.customModal.addEventListener('close', function () {
    closeCustomModal(false);
  });

  el.customAdd.addEventListener('click', addCustom);

  el.customInput.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addCustom();
  });

  // 「開始遊戲」先到第 2 步說明規則；history 在這裡推一格，之後返回鍵一律回第一頁
  el.startGame.addEventListener('click', function () {
    pushPlayState();
    showScreen('rules');
  });

  el.rulesNext.addEventListener('click', function () {
    startRound(true);
  });

  el.passButton.addEventListener('click', function () {
    advance(false);
  });

  el.skipButton.addEventListener('click', function () {
    advance(true);
  });

  // 再玩一輪：牌堆接著發，不重洗——重洗的話剛出過的題目可能馬上又回來
  el.playAgain.addEventListener('click', function () {
    startRound(false);
  });


  // 遊戲內頂欄的返回鍵（game.js 會呼叫這個）：設定畫面回「找遊戲」；進行中先跳確認（確認後回設定畫面）；爆炸畫面等於「改設定」。
  // 進行中直接開確認框，不經過 history.back()：開始遊戲時推的那一格要留給「結束這輪」去收
  window.gameBack = function () {
    if (screen === 'boom' || screen === 'rules') {
      backToSetup();
      history.back(); // 收掉「開始遊戲」推的那一格
    } else if (screen === 'play') openLeaveModal();
    else location.href = '/' + LANG + '/games/';
  };

  // 頂欄的「設定」與選單面板在 header.js（玩法頁也用）；它要開設定框時呼叫這個
  window.openSettings = openCustomModal;
  // 從玩法頁點「設定」會帶著 #settings 回來：直接打開設定框，網址上的 # 拿掉
  if (location.hash === '#settings') {
    history.replaceState(history.state, '', location.pathname + location.search);
    openCustomModal();
  }

  el.leaveCancel.addEventListener('click', closeLeaveModal);

  el.leaveConfirm.addEventListener('click', function () {
    closeLeaveModal();
    // 先切回設定畫面再 history.back()，onPopState 才會走 'setup' 那條直接 return
    backToSetup();
    history.back();
  });

  // Esc 關掉彈窗等於「繼續玩」，<dialog> 預設就會這樣，不用額外處理

  window.addEventListener('popstate', onPopState);

  /*
   * 回到前景時立刻重算一次。背景期間 setInterval 幾乎一定被節流，
   * 如果引爆時刻在那段時間裡就已經過了，這裡要當場爆給他看（CONCEPT.md 2.9）。
   */
  document.addEventListener('visibilitychange', function () {
    // 切到背景時先停配樂（背景的計時器會被節流，拍子會亂掉）；回來再接著放
    if (document.visibilityState !== 'visible') {
      stopBgm();
      return;
    }
    if (screen !== 'play') return;
    checkFuse();
    if (screen !== 'play') return;
    // wake lock 在切到背景時會被系統收回，回來要自己再要一次
    requestWakeLock();
    scheduleTick();
    startBgm();
  });

  // ---------- 起手 ----------

  loadSettings();
  buildCustomGroupSelect();
  renderSegs();
  renderPicks();
  renderCustom();
  refreshDeckInfo();
  // 「說明規則」那一步的插圖卡（全站共用的 Leader.ruleCards）
  if (window.Leader) window.Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  syncSoundButton();
  showScreen('setup');
})();
