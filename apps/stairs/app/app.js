/*
 * 上樓下樓。手機不當裁判（CONCEPT.md 2.1），只做三件事：一步一步帶、打節拍、輸的人拉真心話大冒險拉霸。
 *
 * 一步一步帶（跟竹筍竹筍蹦蹦出、定時炸彈同一套，步驟頭、規則卡、拉霸、節拍器都是全站共用的 window.Leader）：
 *   setup 設定人數 → rules 說明規則 → play 開始（節拍器＋大樓圖）→ end 誰輸了（拉霸）→ 再玩一次回 play
 * 返回鍵一律回第一頁；進行中（節拍器在打）先確認。
 */
(function () {
  'use strict';

  var T = window.STAIRS.T;
  var BASE = window.STAIRS.base;
  var LANG = window.STAIRS.lang;
  var W = window.Woohop;
  var Leader = window.Leader;

  var SETTINGS_KEY = 'web100-stairs-settings';
  var COUNT_MIN = 4;
  var COUNT_MAX = 30;

  var settings = { count: 6, expansion: false, sound: true };
  var screen = 'setup';
  var roundNumber = 0;
  var startedAt = 0;
  var wakeLock = null;

  var $ = function (id) { return document.getElementById(id); };
  var views = { setup: $('view-setup'), rules: $('view-rules'), play: $('view-play'), end: $('view-end') };
  var el = {
    countLess: $('count-less'),
    countMore: $('count-more'),
    countValue: $('count-value'),
    expansion: $('expansion'),
    start: $('start'),
    ruleCards: $('rule-cards'),
    rulesNext: $('rules-next'),
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
      if (typeof saved.count === 'number' && saved.count >= COUNT_MIN && saved.count <= COUNT_MAX) settings.count = saved.count;
      if (typeof saved.expansion === 'boolean') settings.expansion = saved.expansion;
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

  function syncSetup() {
    el.countValue.textContent = settings.count;
    el.countLess.disabled = settings.count <= COUNT_MIN;
    el.countMore.disabled = settings.count >= COUNT_MAX;
    el.expansion.setAttribute('aria-pressed', String(settings.expansion));
  }

  // ---------- 大樓圖：由上往下列出這次的樓層 ----------
  /*
   * 擴充版（CONCEPT.md 2.3）是 1～N 樓之外多頂樓、地下室兩個位置。
   * 人數是「樓層數」：擴充版多出來的兩個人不算在 N 裡。
   */
  function floors() {
    var list = [];
    if (settings.expansion) list.push({ label: T.floorTop, kind: 'top' });
    for (var n = settings.count; n >= 1; n -= 1) list.push({ label: fill(T.floorLabel, { n: n }), kind: n === 1 ? 'first' : '' });
    if (settings.expansion) list.push({ label: T.floorBasement, kind: 'basement' });
    return list;
  }

  function renderBuildings() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-building]'), function (ol) {
      ol.textContent = '';
      floors().forEach(function (f) {
        var li = document.createElement('li');
        li.textContent = f.label;
        if (f.kind) li.className = 'floor-' + f.kind;
        ol.appendChild(li);
      });
    });
  }

  // ---------- 帶領的步驟頭（Leader.lead） ----------

  var STEPS = ['setup', 'rules', 'play', 'end'];

  function renderLead() {
    Leader.lead(views[screen].querySelector('.lead-slot'), {
      index: STEPS.indexOf(screen),
      total: STEPS.length,
      title: T.lead[screen][0],
      say: T.lead[screen][1],
    });
  }

  /*
   * 「說明規則」三張插圖卡的插圖（woohop-art.js 的畫法）：
   * 照順序當樓層（大樓）、跟著拍子喊（往上的箭頭＋數字泡泡）、輸了去 1 樓（往下的箭頭＋1）
   */
  var bubble = function (x, y, text) {
    return '<g><rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" rx="8" fill="#fff" ' + W.K + '/>' +
      '<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="17" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">' + text + '</text></g>';
  };
  var RULE_ART = [
    function () { return W.art.stairs(); },
    function () {
      return W.ground + W.burst(136, 26, '#FFC628') + W.ring(24, 34, '#7489E6') +
        W.body('<path d="M50 104l30-46 30 46z"/>', '#4FB59A') + W.makeFace('grin', 80, 90, 1.4) + bubble(118, 44, '4');
    },
    function () {
      return W.ground + W.plus(140, 34, '#4FB59A') + W.dot(22, 40, '#FFC628', 4) +
        W.body('<path d="M50 50l30 46 30-46z"/>', '#EE7B6A') + W.makeFace('worry', 80, 64, 1.4) + bubble(118, 96, '1');
    },
  ];

  // ---------- 節拍器（Leader.metronome）與聲音開關 ----------

  var metro = null;
  function ensureMetro() {
    if (metro) return;
    metro = Leader.metronome(el.metroRoot, {
      // 四拍一組「拍、拍、1 樓上、4 樓」：前兩拍拍手，後兩拍先講自己幾樓、再講要去幾樓（2026-10-21 使用者確認）
      bpm: 100, min: 60, max: 180, step: 5, beats: 4, accents: [2, 3],
      groove: true, // 開始打拍子就有趣味配樂（跟竹筍一樣，使用者要求），跟節拍同速度
      sound: function () { return settings.sound; },
      onStart: function () {
        requestWakeLock();
        if (!startedAt) startedAt = Date.now();
      },
      onStop: releaseWakeLock,
    });
  }

  function syncSound() {
    if (el.sound) el.sound.setAttribute('aria-pressed', String(settings.sound));
  }
  // 頂欄的音符鍵（chrome.mjs gameBar 的 musicLabel，game.js 按下去呼叫這個）：管配樂、節拍器和拉霸的聲音
  window.toggleMusic = function () {
    settings.sound = !settings.sound;
    saveSettings();
    syncSound();
  };

  // ---------- 拉霸（Leader.slot） ----------

  var slotTool = null;
  function resetSlot() {
    if (!slotTool) {
      slotTool = Leader.slot(el.slotRoot, {
        prompts: window.STAIRS.slot.prompts,
        actions: window.STAIRS.slot.actions,
        sound: function () { return settings.sound; },
        onPull: function (info) {
          track('stairs_slot_pulled', { round_number: roundNumber, kind: info.kind, mode: info.mode });
        },
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
    if (screen === 'play' && next !== 'play' && metro) metro.stop();
    screen = next;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== next; });
    document.body.setAttribute('data-screen', next);
    document.body.setAttribute('data-game-mode', next === 'setup' ? 'browse' : 'play');
    var title = document.querySelector('.game-bar .title');
    if (title) title.tabIndex = next === 'setup' ? 0 : -1;

    renderLead();
    if (next === 'play') renderBuildings();
    if (next === 'play') ensureMetro();
    if (next === 'end') resetSlot();

    window.scrollTo(0, 0);
    if (typeof window.trackPageView === 'function') window.trackPageView(BASE + '/' + LANG + '/' + next);
  }

  function startPlay() {
    roundNumber += 1;
    startedAt = 0;
    showScreen('play');
    track('stairs_game_started', { round_number: roundNumber, floors: settings.count, expansion: settings.expansion });
  }

  // ---------- 返回鍵：一律回第一頁；節拍器在打的時候先確認 ----------

  function pushGameState() {
    history.pushState({ stairs: 'game' }, '');
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
    track('stairs_game_ended', {
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

  el.countLess.addEventListener('click', function () {
    settings.count = Math.max(COUNT_MIN, settings.count - 1);
    saveSettings();
    syncSetup();
  });
  el.countMore.addEventListener('click', function () {
    settings.count = Math.min(COUNT_MAX, settings.count + 1);
    saveSettings();
    syncSetup();
  });
  el.expansion.addEventListener('click', function () {
    settings.expansion = !settings.expansion;
    saveSettings();
    syncSetup();
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
  syncSetup();
  syncSound();
  Leader.ruleCards(el.ruleCards, T.ruleCards, RULE_ART);
  showScreen('setup');
})();
