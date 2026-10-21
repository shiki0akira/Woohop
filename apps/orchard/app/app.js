/*
 * 果園菜園動物園。手機不當裁判（CONCEPT.md 2.1），只做四件事：一步一步帶、出主題、打節拍、輸的人拉真心話大冒險拉霸。
 *
 * 一步一步帶（跟竹筍竹筍蹦蹦出、上樓下樓同一套，步驟頭、規則卡、拉霸、節拍器都是全站共用的 window.Leader）：
 *   setup 開場 → rules 說明規則 → play 開始（主題＋節拍器）→ end 誰輸了（拉霸）→ 再玩一次回 play
 * 返回鍵一律回第一頁；進行中（節拍器在打）先確認。
 */
(function () {
  'use strict';

  var T = window.ORCHARD.T;
  var BASE = window.ORCHARD.base;
  var LANG = window.ORCHARD.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SETTINGS_KEY = 'web100-orchard-settings';

  // 不用設定人數（使用者決定拿掉）：這個遊戲用不到，大家圍成一圈直接開始
  var settings = { sound: true };
  var screen = 'setup';
  var topicIndex = -1; // 這次的主題（T.topics 的第幾個），每次進「開始！」隨機抽
  var roundNumber = 0;
  var startedAt = 0;
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
    topicName: $('topic-name'),
    topicSay: $('topic-say'),
    topicShuffle: $('topic-shuffle'),
    topicChips: $('topic-chips'),
    topicToggle: $('topic-toggle'),
    metroRoot: $('metro-root'),
    endBtn: $('end-btn'),
    slotRoot: $('slot-root'),
    again: $('again'),
    leaveModal: $('leave-modal'),
    leaveCancel: $('leave-cancel'),
    leaveConfirm: $('leave-confirm'),
    sound: $('game-music'),
  };

  function fill(s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  }
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // ---------- 設定（存在手機上） ----------

  function loadSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return;
      if (typeof saved.sound === 'boolean') settings.sound = saved.sound;
    } catch (e) {
      /* 無痕模式或存檔壞了：照樣能玩，只是記不住 */
    }
  }
  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      /* 同上 */
    }
  }

  // ---------- 主題：隨機抽或自己選（CONCEPT.md 2.2） ----------
  /*
   * T.topics 是 [主題, 要說什麼]。有人輸了，主持人按「隨機換一個」或點下面的主題，從輸的人重新開始。
   * 「照著念」的 {topic}、{say} 也跟著換，主持人直接念新主題。
   */
  function setTopic(index, random) {
    topicIndex = index;
    var topic = T.topics[index];
    el.topicName.textContent = topic[0];
    el.topicSay.textContent = fill(T.topicSay, { say: topic[1] });
    Array.prototype.forEach.call(el.topicChips.children, function (chip, i) {
      chip.setAttribute('aria-pressed', String(i === index));
    });
    if (screen === 'play') renderLead();
    if (random !== undefined) track('orchard_topic_changed', { round_number: roundNumber, topic: topic[0], random: random });
  }

  function randomTopic() {
    if (T.topics.length < 2) return 0;
    var next = Math.floor(Math.random() * (T.topics.length - 1));
    return next >= topicIndex && topicIndex >= 0 ? next + 1 : next; // 不會抽到跟現在同一個
  }

  function renderTopicChips() {
    T.topics.forEach(function (topic, i) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = topic[0];
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', function () { setTopic(i, false); });
      el.topicChips.appendChild(chip);
    });
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  function renderLead() {
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[screen][0],
      say: topicIndex >= 0 ? fill(T.lead[screen][1], { topic: T.topics[topicIndex][0], say: T.topics[topicIndex][1] }) : T.lead[screen][1],
    });
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 主持人出主題（蘋果）、跟著拍子接（兩個音符泡泡＋說話泡泡）、重複或說錯就輸（皺眉）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 16) + '" y="' + (y - 14) + '" width="32" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    function () { return W.art.orchard(); },
    function () {
      return W.ground + W.burst(140, 24, '#FFC628') + W.ring(22, 34, '#7489E6') +
        W.body('<circle cx="80" cy="80" r="32"/>', '#FFC628') + W.makeFace('grin', 80, 80, 1.4) +
        bubble(34, 62, '♪') + bubble(126, 62, '♪') + bubble(80, 28, '!');
    },
    function () {
      return W.ground + W.plus(140, 34, '#4FB59A') + W.dot(22, 40, '#FFC628', 4) +
        W.body('<circle cx="80" cy="80" r="32"/>', '#EE7B6A') + W.makeFace('worry', 80, 80, 1.4) + bubble(122, 40, '×');
    },
  ];

  // ---------- 節拍器（Leader.metronome）與聲音開關 ----------

  var metro = null;
  function ensureMetro() {
    if (metro) return;
    metro = Leader.metronome(el.metroRoot, {
      // 三拍一組「拍、拍、說」：前兩拍拍手，第三拍輪到的人說（2026-10-21 使用者確認），第三拍是重拍
      bpm: 90, min: 60, max: 180, step: 5, beats: 3, accents: [2],
      auto: true, // 自動加速預設開著（使用者要求）
      // 配樂跟拍子分開（使用者要求）：一進「開始！」就放配樂，頂欄音符鍵只管配樂；拍子聲由「開始打拍子」管。兩個踩同一個時鐘，不會對不上
      groove: true,
      onStart: function () {
        requestWakeLock();
        if (!startedAt) startedAt = Date.now();
      },
      onStop: releaseWakeLock,
    });
  }

  // 有配樂的畫面：開始玩、誰輸了（這一步音量調小當背景，使用者要求）
  var withMusic = function () { return screen === 'play' || screen === 'end'; };

  // 頂欄的音符鍵：在有配樂的畫面顯示「現在有沒有在放」（切到背景會自動停），其他畫面顯示記住的偏好
  function syncSound() {
    var on = metro && withMusic() ? metro.playing() : settings.sound;
    if (el.sound) el.sound.setAttribute('aria-pressed', String(on));
  }
  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫這個）：管配樂和拉霸的聲音，拍子聲不歸它管
  window.toggleMusic = function () {
    if (metro && withMusic()) {
      settings.sound = !metro.playing();
      metro.music(settings.sound);
    } else {
      settings.sound = !settings.sound;
    }
    saveSettings();
    syncSound();
  };
  document.addEventListener('visibilitychange', syncSound);

  // ---------- 拉霸（Leader.slot） ----------

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.ORCHARD.slot.prompts,
        actions: window.ORCHARD.slot.actions,
        sound: function () { return settings.sound; },
        // 拉霸轉的時候配樂再壓低，停下來回到背景音量（使用者要求）
        onPull: function (info) {
          if (metro) metro.duck(true);
          track('orchard_slot_pulled', { round_number: roundNumber, kind: info.kind, mode: info.mode });
        },
        onLand: function () { if (metro) metro.duck(false); },
      });
    }
    slotTool.reset();
  }

  // ---------- 螢幕保持亮著 ----------

  function requestWakeLock() {
    if (!navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }).catch(function () {});
  }
  function releaseWakeLock() {
    if (!wakeLock) return;
    var lock = wakeLock;
    wakeLock = null;
    lock.release().catch(function () {});
  }

  // ---------- 畫面切換 ----------

  function showScreen(next) {
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    renderLead();
    if (next === 'play') ensureMetro();
    // 拍子只在「開始！」那步打；配樂在「開始！」正常音量、到「誰輸了？」調小當背景，其他畫面停
    if (metro) {
      if (next !== 'play') metro.stop();
      metro.background(next === 'end');
      metro.music(withMusic() && settings.sound);
    }
    syncSound();
    if (next === 'end') resetSlot();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    roundNumber += 1;
    startedAt = 0;
    setTopic(randomTopic());
    showScreen('play');
    track('orchard_game_started', { round_number: roundNumber, topic: T.topics[topicIndex][0] });
  }

  // ---------- 返回鍵：一律回第一頁；節拍器在打的時候先確認 ----------

  function pushGameState() {
    history.pushState({ orchard: 'game' }, '');
  }

  function backToSetup() {
    if (metro) metro.stop();
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
    if (screen === 'play' && metro && metro.running()) {
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

  // ---------- 結束遊戲：按住 HOLD_MS 才結束（跟竹筍同一個做法，防手滑） ----------

  var HOLD_MS = 800;
  var holdId = 0;

  function endGame() {
    cancelHold();
    track('orchard_game_ended', {
      round_number: roundNumber,
      duration_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });
    showScreen('end');
  }
  function cancelHold() {
    clearTimeout(holdId);
    holdId = 0;
    el.endBtn.classList.remove('is-holding');
  }

  // ---------- 綁定 ----------

  el.topicShuffle.addEventListener('click', function () { setTopic(randomTopic(), true); });
  el.topicToggle.addEventListener('click', function () {
    var open = el.topicChips.hidden;
    el.topicChips.hidden = !open;
    el.topicToggle.setAttribute('aria-expanded', String(open));
  });

  el.start.addEventListener('click', function () {
    pushGameState();
    showScreen('rules');
  });
  el.rulesNext.addEventListener('click', startPlay);
  el.again.addEventListener('click', startPlay);

  el.endBtn.addEventListener('click', function (event) {
    if (event.detail === 0) endGame(); // 鍵盤沒有「按住」可言
  });
  el.endBtn.addEventListener('pointerdown', function (event) {
    if (event.button > 0) return;
    cancelHold();
    el.endBtn.classList.add('is-holding');
    holdId = setTimeout(endGame, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
    el.endBtn.addEventListener(type, cancelHold);
  });
  el.endBtn.addEventListener('contextmenu', function (event) { event.preventDefault(); });

  el.leaveCancel.addEventListener('click', function () { el.leaveModal.close(); });
  el.leaveConfirm.addEventListener('click', confirmLeave);

  window.gameBack = function () { goBack(false); };
  window.addEventListener('popstate', function () { goBack(true); });

  // ---------- 起手 ----------

  loadSettings();
  syncSound();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  renderTopicChips();
  showScreen('setup');
})();
