/*
 * 幸福賓果的前端。沒有 bundler，所有畫面在同一份 HTML 裡靠 showView() 切換，
 * 房號放查詢字串 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 跟系列前三個專案最大的不同：**這裡是完全非同步的**。
 * 沒有「全場同一題」的概念，每個人手上一張排列不同的卡，隨時可以送出配對請求、
 * 隨時可能收到別人的請求。所以廣播進來的 state 分兩截：
 *   msg.state = 大家一樣的（名單、排行榜、設定）
 *   msg.you   = 只有自己的（卡片排列、打勾、送出中的請求、待你確認的清單）
 *
 * 設定一律「伺服器說了算」：主持人改動就送 settings，等 DO 廣播回來才重畫。
 * 不在前端另存一份選題狀態——主持人開兩個分頁時，兩份本機狀態會互相蓋掉。
 */
(function () {
  'use strict';

  var T = window.T;
  var CFG = window.MATCH;
  var BANK = window.QUESTIONS;
  var AVATARS = window.AVATARS;
  // 尺寸、連線數、門檻表由 scripts/build.js 用 src/bingo.js 算好內嵌，
  // 前端不重算一份（那段邏輯有測試，複製一份遲早會跟伺服器算出不同答案）
  var B = window.BINGO;

  // 這幾個 key 跟系列其他專案共用，不要各專案自己發明一套
  var CLIENT_KEY = 'web100-client-id';
  var PROFILE_KEY = 'web100-profile';
  // 主持人在頂欄「設定」先準備好的設定與題目（開房前就能設，隔天打開還在）
  var PREP_KEY = 'web100-bingo-prep';

  // 跟 src/worker.js 的同名常數一致，兩邊要一起改
  var MIN_PLAYERS = 2;
  var MAX_PLAYERS = 30;

  var CHEVRON =
    '<svg class="chevron" xmlns="http://www.w3.org/2000/svg" height="20" width="20" ' +
    'viewBox="0 -960 960 960" aria-hidden="true" focusable="false">' +
    '<path d="M465-363.5q-7-2.5-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11' +
    't28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5q-8 0-15-2.5Z"/></svg>';


  /*
   * 正式網域上的頁面是 Vercel 代理過來的，而 Vercel 代理外部網址時對 WebSocket 升級
   * 的支援不可靠，所以 API 與 WebSocket 直連 Worker。本機開發、區網測試、
   * 直接開 workers.dev 都維持同源。
   */
  var API_ORIGIN = location.origin === CFG.siteOrigin ? CFG.workerOrigin : location.origin;
  var API = API_ORIGIN + CFG.base + '/api';

  var el = {};
  var state = {
    clientId: '',
    role: '',
    code: '',
    room: null, // msg.state
    me: null, // msg.you
    ws: null,
    reconnectTimer: 0,
    reconnectDelay: 500,
    closing: false,
    view: '',
    tab: 'card',
    avatar: '',
    joinReported: false,

    /*
     * 設定頁的狀態。**在連上房間之前就要能編輯**（流程是先設定、再創建、再填暱稱），
     * 所以這幾項先留在前端，等連進房間由 syncSettingsOnce 一次送上去。
     * 之後在大廳按右上角的齒輪回來改，因為已經連線了，每動一次就直接送出。
     */
    size: 0,
    targetLines: 0,
    allowSelfClaim: false,
    hostPlays: true,
    winnerCount: 1,
    // 主持人有沒有自己動過獲勝線條數。沒動過的話換尺寸要跟著換成該尺寸的預設值
    linesTouched: false,
    anchor: null, // { id, text? }
    // 自訂保底題：文字與 id 分開留著，選回內建再選回自訂時不用重打
    anchorCustomText: '',
    anchorCustomId: '',
    anchorTimer: 0,
    selected: [], // 內建題的 id
    custom: [], // 自訂題 [{ id, text }]
    settingsSynced: false,
    // 用來做「對方確認了 / 婉拒了」的提示：拿上一份 you 跟這一份比
    prevMarks: null,
    prevOutgoing: null,
    prevLines: 0,
    prevWon: false,
    // 自己按取消的那幾格，不要誤報成「對方婉拒」
    cancelled: {},
    toastTimer: 0,
    // 瀏覽器歷史：目前在第幾格、那一格是哪個畫面（見 initHistory）
    depth: 0,
    entry: 'home',
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    state.clientId = loadClientId();
    loadProfile();
    resetSettings();
    loadPrep();

    renderAvatarPicker();
    renderSetup();
    bindEvents();

    // 先把網址上的房號讀下來：initHistory 會把 ?room= 從網址上拿掉
    var code = new URLSearchParams(location.search).get('room');
    initHistory();

    if (code) {
      state.code = code.toUpperCase();
      checkRoomThenJoin();
    } else {
      showView('home');
    }
  }

  function cacheElements() {
    var ids = [
      'view-home', 'view-setup', 'view-profile', 'view-room', 'view-error',
      'max-players', 'create-room', 'create-error',
      'join-code', 'join-room', 'join-error',
      'join-title', 'nickname', 'avatar-picker', 'profile-done', 'profile-error',
      'share-card', 'room-code', 'copy-link', 'share-link', 'qr-box',
      'size-seg', 'lines-seg', 'lines-hint', 'winner-seg', 'self-claim', 'host-plays',
      'anchor-card', 'anchor-options', 'anchor-choices', 'anchor-custom-radio', 'anchor-custom',
      'question-count', 'category-list',
      'custom-input', 'custom-add', 'selected-list', 'random-pick', 'clear-pick',
      'setup-done', 'setup-error',
      'lobby-card', 'player-count', 'player-list', 'waiting-hint',
      'host-lobby', 'settings-summary', 'start-game', 'start-need', 'start-error',
      'play-tabs', 'play-grid',
      'tab-card', 'tab-requests', 'tab-requests-badge',
      'pane-card', 'pane-list', 'pane-requests',
      'card-box', 'progress-lines', 'progress-cells', 'progress-note', 'progress-badge',
      'bingo-card', 'cell-list',
      'spectator-box', 'spectator-title', 'spectator-desc', 'board-box', 'board-list',
      'incoming-list', 'incoming-empty',
      'results-card', 'final-podium', 'final-list', 'reset-block', 'reset-room',
      'pick-dialog', 'pick-question', 'pick-list', 'pick-empty', 'pick-self-claim', 'pick-cancel',
      'confirm-dialog', 'confirm-title', 'confirm-desc', 'confirm-cancel', 'confirm-ok',
      'closed-dialog', 'closed-ok', 'kicked-dialog', 'kicked-ok',
      'error-title', 'error-desc', 'conn-banner', 'toast',
    ];
    for (var i = 0; i < ids.length; i += 1) {
      el[camel(ids[i])] = document.getElementById(ids[i]);
    }
  }

  function camel(id) {
    return id.replace(/-([a-z])/g, function (whole, letter) {
      return letter.toUpperCase();
    });
  }

  /* ---------- 文案 ---------- */

  // t('progressHeading', { done: 1, target: 3 })：{n} 這種佔位符在 locales 裡是原樣保留的
  function t(key, vars) {
    var text = T[key] || '';
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return name in vars ? vars[name] : whole;
    });
  }

  /* ---------- 身分與 profile ---------- */

  function loadClientId() {
    var id = '';
    try {
      id = localStorage.getItem(CLIENT_KEY) || '';
    } catch (e) {
      /* 無痕模式：這一場還是能玩，只是重整後會被當成新的人 */
    }
    if (!id) {
      id = 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try {
        localStorage.setItem(CLIENT_KEY, id);
      } catch (e) {
        /* 同上 */
      }
    }
    return id;
  }

  function loadProfile() {
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    } catch (e) {
      /* 存壞了就當作沒有 */
    }
    // 沒選過的人預設用名字第一個字（設計系統的頭像選擇器也是這樣，第一格就是它）
    state.avatar = (saved && saved.avatar) || 'initial';
    if (saved && saved.nickname && el.nickname) el.nickname.value = saved.nickname;
  }

  function saveProfile() {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ nickname: el.nickname.value.trim(), avatar: state.avatar }),
      );
    } catch (e) {
      /* 記不住就算了，不影響這一場 */
    }
  }

  /*
   * 頭像一律用設計系統那套（design/brand-exploration.html 的食物頭像，粗描邊可愛風），
   * 圖在 Woohop 全站共用的 woohop-art.js（window.Woohop.AVATARS）。id 跟舊的 app/avatars.js 一樣是那 10 種食物，
   * 房間裡已經存的頭像不用轉換。跟喜好二選一同一套寫法。
   *
   * 'initial' 是「不選，用名字第一個字」：底色從頭像的底色裡依名字挑一個（同一個名字每次都一樣），字用深色。
   */
  function avatarList() {
    return (window.Woohop && window.Woohop.AVATARS) || AVATARS;
  }

  function initialBg(name) {
    var list = avatarList();
    var hash = 0;
    var chars = Array.from(name || '');
    for (var i = 0; i < chars.length; i += 1) hash = (hash * 31 + chars[i].codePointAt(0)) >>> 0;
    return list[hash % list.length].bg;
  }

  function avatarSvg(id, size, name) {
    var head = '<svg class="avatar" viewBox="0 0 64 64" width="' + size + '" height="' + size + '" ' +
      'aria-hidden="true" focusable="false">';
    if (id === 'initial') {
      var letter = Array.from((name || '').trim())[0] || '?';
      return head + '<rect width="64" height="64" fill="' + initialBg(name) + '"/>' +
        '<text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-size="30" font-weight="900" ' +
        'fill="#22222c">' + escapeHtml(letter) + '</text></svg>';
    }
    var list = avatarList();
    var found = null;
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) found = list[i];
    }
    // 伺服器不驗證頭像 id（見 src/room.js 的 cleanAvatar），對不到就退回第一張
    if (!found) found = list[0];
    return head + '<rect width="64" height="64" fill="' + found.bg + '"/>' + found.svg + '</svg>';
  }

  function renderAvatarPicker() {
    // 第一格是「用名字第一個字」，打字時跟著換字（見 bindEvents 的 nickname input）
    var html =
      '<button class="avatar-option" type="button" role="radio" data-avatar="initial" aria-checked="' +
      (state.avatar === 'initial') + '" aria-label="' + escapeHtml(t('avatarInitialLabel')) + '">' +
      avatarSvg('initial', 56, el.nickname ? el.nickname.value : '') + '</button>';
    var list = avatarList();
    for (var i = 0; i < list.length; i += 1) {
      var avatar = list[i];
      html +=
        '<button class="avatar-option" type="button" role="radio" data-avatar="' + avatar.id +
        '" aria-checked="' + (avatar.id === state.avatar) + '" aria-label="' +
        escapeHtml(t('avatarLabel')) + ' ' + (i + 1) + '">' + avatarSvg(avatar.id, 56) + '</button>';
    }
    el.avatarPicker.innerHTML = html;
  }

  function selectAvatar(id) {
    state.avatar = id;
    var options = el.avatarPicker.querySelectorAll('[data-avatar]');
    for (var i = 0; i < options.length; i += 1) {
      options[i].setAttribute('aria-checked', String(options[i].dataset.avatar === id));
    }
  }

  /* ---------- 題目查詢 ---------- */

  // 卡片上存的是 id，文字要從三個地方找：內建題庫、保底題候選、房間裡的自訂題
  function questionText(id) {
    var i;
    for (i = 0; i < BANK.list.length; i += 1) {
      if (BANK.list[i].id === id) return BANK.list[i].text;
    }
    for (i = 0; i < BANK.anchors.length; i += 1) {
      if (BANK.anchors[i].id === id) return BANK.anchors[i].text;
    }
    var room = state.room;
    if (room) {
      if (room.anchor && room.anchor.id === id && room.anchor.text) return room.anchor.text;
      for (i = 0; i < room.questions.length; i += 1) {
        if (room.questions[i].id === id && room.questions[i].text) return room.questions[i].text;
      }
    }
    return id;
  }

  function questionsIn(category) {
    var out = [];
    for (var i = 0; i < BANK.list.length; i += 1) {
      if (BANK.list[i].category === category) out.push(BANK.list[i]);
    }
    return out;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // 這個尺寸要幾道洗牌題（保底題不算）：3×3 → 8、4×4 → 16、5×5 → 24
  function slotsFor(size) {
    var geometry = B.geometry[size];
    return geometry.cells - (geometry.center >= 0 ? 1 : 0);
  }

  /* ---------- 主持人：設定區 ---------- */

  /*
   * 設定頁的預設值。獲勝條件用 src/bingo.js 的預設。
   *
   * **題目每次都重抽**（shuffledOrder），不再固定取 DEFAULT_ORDER 的前 N 題。
   * 同一個小組每週玩，不去改題目的人原本每次拿到的都是同一張卡；抽法一樣是
   * 跨分類輪流取，所以 3×3 只取 8 題時也不會整張都在問同一類事情。
   *
   * 尺寸這裡先放預設值墊著，真正的值等連進房間、看到實到人數才決定
   * （syncAutoSize）——開房這一刻還沒有任何人加入。
   */
  function resetSettings() {
    /*
     * ⚠️ 起始尺寸是**最小的那個**，不是 B.defaultSize。
     *
     * syncAutoSize 是「只升不降」的（理由見那支的註解），所以起點一定要是地板值，
     * 從 4×4 起跳的話就永遠降不到 3×3——三個人的聚會還是得找滿 16 個人。
     * 用 suggestedSize(0) 而不是寫死 3，是為了讓兩邊的對照表只有一份。
     */
    state.size = suggestedSize(0);
    // 主持人還沒碰過設定頁，尺寸可以跟著人數自己動
    state.settingsTouched = false;
    state.targetLines = B.defaultTargetLines[state.size];
    state.linesTouched = false;
    state.allowSelfClaim = false;
    state.hostPlays = true;
    state.winnerCount = 1;
    state.custom = [];
    state.anchor = needsAnchor(state.size) ? { id: BANK.defaultAnchorId } : null;
    state.anchorCustomText = '';
    state.anchorCustomId = '';
    state.selected = shuffledOrder().slice(0, slotsFor(state.size));
  }

  /*
   * 人數 → 卡片尺寸。3×3 要找 8 個人、4×4 要 16 個、5×5 要 24 個（中央格不算）。
   * 一個人可以被重複認領，但人太少時卡片會填不滿，所以這組數字是照
   * 「大致填得滿」抓的：≤5 人 3×3、6–12 人 4×4、13 人以上 5×5。
   */
  function suggestedSize(playerCount) {
    if (playerCount >= 13) return 5;
    if (playerCount >= 6) return 4;
    return 3;
  }

  function needsAnchor(size) {
    return B.geometry[size].center >= 0;
  }

  function pickedCount() {
    return state.selected.length + state.custom.length;
  }

  function renderSetup() {
    renderSizeSeg();
    renderLinesSeg();
    renderWinnerSeg();
    renderAnchorChoices();
    renderCategories();
    renderSelectedList();
    el.selfClaim.checked = state.allowSelfClaim;
    el.hostPlays.checked = state.hostPlays;
  }

  function renderSizeSeg() {
    var html = '';
    for (var i = 0; i < B.sizes.length; i += 1) {
      var size = B.sizes[i];
      html +=
        '<label class="seg-item"><input type="radio" name="card-size" value="' + size + '"' +
        (size === state.size ? ' checked' : '') + ' /><span>' +
        escapeHtml(t('sizeOption', { size: size })) + '</span></label>';
    }
    el.sizeSeg.innerHTML = html;
  }

  // 可選的連線數依尺寸而定（3×3 最多 3 條，見 src/bingo.js 的 MAX_TARGET_LINES）
  function renderLinesSeg() {
    var max = B.maxTargetLines[state.size];
    var html = '';
    for (var n = 1; n <= max; n += 1) {
      html +=
        '<label class="seg-item"><input type="radio" name="target-lines" value="' + n + '"' +
        (n === state.targetLines ? ' checked' : '') + ' /><span>' +
        escapeHtml(t('targetLinesUnit', { n: n })) + '</span></label>';
    }
    el.linesSeg.innerHTML = html;

    el.linesHint.textContent = t('targetLinesHint', {
      size: state.size,
      total: B.geometry[state.size].lines,
      cells: B.minCells[state.size][state.targetLines],
      n: state.targetLines,
    });
  }

  // 幾個人達標就收場。上限 3——再多就跟「開到主持人喊停」沒兩樣了
  function renderWinnerSeg() {
    var html = '';
    for (var n = 1; n <= 3; n += 1) {
      html +=
        '<label class="seg-item"><input type="radio" name="winner-count" value="' + n + '"' +
        (n === state.winnerCount ? ' checked' : '') + ' /><span>' +
        escapeHtml(t('winnerCountUnit', { n: n })) + '</span></label>';
    }
    // 沒有「不限」：沒有手動結束的按鈕，一輪一定要靠達標人數收場（2026-10-19 拿掉）
    el.winnerSeg.innerHTML = html;
  }

  function renderAnchorChoices() {
    /*
     * 4×4 整張卡片收掉，不是留一句「不需要保底題」。
     *
     * 4×4 是預設尺寸，多數主持人一進設定頁就會看到這一區——留著一張只說
     * 「你不需要這個」的卡片，等於在最常走的路徑上多塞一個要讀完才能略過的東西。
     * 為什麼 4×4 沒有中央格，規則頁跟 CONCEPT.md 有寫。
     */
    var wanted = needsAnchor(state.size);
    el.anchorCard.hidden = !wanted;
    if (!wanted) return;

    var current = state.anchor ? state.anchor.id : '';
    var html = '';
    for (var i = 0; i < BANK.anchors.length; i += 1) {
      var anchor = BANK.anchors[i];
      html +=
        '<label class="check-row"><input type="radio" name="anchor" value="' + anchor.id + '"' +
        (anchor.id === current ? ' checked' : '') + ' /><span>' +
        escapeHtml(anchor.text) + '</span></label>';
    }
    el.anchorChoices.innerHTML = html;

    /*
     * 自訂那一列不重畫（它是樣板裡的靜態元素），只同步狀態——
     * 每次打字都重畫的話輸入游標會被丟掉。
     */
    var isCustom = usingCustomAnchor();
    el.anchorCustomRadio.checked = isCustom;
    if (el.anchorCustom.value !== state.anchorCustomText) {
      el.anchorCustom.value = state.anchorCustomText;
    }
  }

  // 目前選的是不是自訂那一項：內建保底題的 id 都在題庫裡，對不到就是自訂的
  function usingCustomAnchor() {
    if (!state.anchor) return Boolean(state.anchorCustomText);
    for (var i = 0; i < BANK.anchors.length; i += 1) {
      if (BANK.anchors[i].id === state.anchor.id) return false;
    }
    return true;
  }

  /*
   * 自訂保底題目前的值。空字串就是 null——沒填等於還沒設定保底題，
   * 按「創建房間」會被 settingsReady 擋下來（中央那一格不能是空的）。
   */
  function customAnchor() {
    var text = state.anchorCustomText.trim();
    if (!text) return null;
    if (!state.anchorCustomId) state.anchorCustomId = customId();
    return { id: state.anchorCustomId, text: text };
  }

  /*
   * 分類清單。結構跟 03_PreferenceMatch 一致：箭頭在最左、分類名、「全選」靠右、
   * 已選數字在最後，題目包在 .q-list 裡。
   *
   * 「全選」放在標題列而不是展開後的第一行——收合狀態下也要能整類勾掉，
   * 不然主持人得先展開六題才能全選。分類一律不預設展開，而且一次只會展開一類。
   */
  function renderCategories() {
    var html = '';
    for (var i = 0; i < BANK.categories.length; i += 1) {
      var category = BANK.categories[i];
      var questions = questionsIn(category);

      html +=
        '<details class="cat" data-category="' + category + '">' +
        '<summary>' + CHEVRON +
        '<span class="cat-name">' + escapeHtml(t('category' + capitalize(category))) + '</span>' +
        // <label> 而不是 <span>：點「全選」兩個字也要能勾，而且是原生行為，
        // 不用自己翻 checked（自己翻在 <summary> 裡會跟預設的展開行為打架）
        '<label class="cat-all"><input type="checkbox" data-all="' + category + '" />' +
        '<span>' + escapeHtml(t('categorySelectAll')) + '</span></label>' +
        '<span class="cat-count" data-count="' + category + '"></span></summary>' +
        '<ul class="q-list">';

      for (var j = 0; j < questions.length; j += 1) {
        var question = questions[j];
        html +=
          '<li><label class="check-row"><input type="checkbox" data-question="' +
          escapeHtml(question.id) + '"' +
          (state.selected.indexOf(question.id) >= 0 ? ' checked' : '') + ' />' +
          '<span>' + escapeHtml(question.text) + '</span></label></li>';
      }
      html += '</ul></details>';
    }
    el.categoryList.innerHTML = html;
    updateCategoryCounts();
  }

  /*
   * 只更新標題列的數字與「全選」狀態，**不重畫整個清單**。
   *
   * 重畫會把 <details open> 弄丟——展開一類、勾一題，整類就自己收起來了。
   */
  function updateCategoryCounts() {
    for (var i = 0; i < BANK.categories.length; i += 1) {
      var category = BANK.categories[i];
      var questions = questionsIn(category);
      var picked = 0;
      for (var j = 0; j < questions.length; j += 1) {
        if (state.selected.indexOf(questions[j].id) >= 0) picked += 1;
      }

      var counter = el.categoryList.querySelector('[data-count="' + category + '"]');
      if (counter) counter.textContent = picked + ' / ' + questions.length;

      var all = el.categoryList.querySelector('[data-all="' + category + '"]');
      if (all) {
        all.checked = picked === questions.length;
        // 部分選取用 indeterminate，不然「全選」看起來像沒選
        all.indeterminate = picked > 0 && picked < questions.length;
      }
    }
  }

  function setSelected(id, on) {
    var at = state.selected.indexOf(id);
    if (on && at < 0) state.selected.push(id);
    else if (!on && at >= 0) state.selected.splice(at, 1);
  }

  function applyCategoryAll(box) {
    var questions = questionsIn(box.dataset.all);
    for (var i = 0; i < questions.length; i += 1) {
      setSelected(questions[i].id, box.checked);
      var one = el.categoryList.querySelector('[data-question="' + questions[i].id + '"]');
      if (one) one.checked = box.checked;
    }
    afterSelectionChanged();
  }

  function afterSelectionChanged() {
    updateCategoryCounts();
    renderSelectedList();
    settingsChanged();
  }

  function renderSelectedList() {
    var need = slotsFor(state.size);
    var html = '';
    var i;

    for (i = 0; i < state.selected.length; i += 1) {
      html += chosenRow(state.selected[i], questionText(state.selected[i]));
    }
    for (i = 0; i < state.custom.length; i += 1) {
      html += chosenRow(state.custom[i].id, state.custom[i].text);
    }
    el.selectedList.innerHTML = html;

    var count = pickedCount();
    el.questionCount.textContent = t('questionsCount', { n: count, total: need });

    var note;
    if (count < need) note = t('questionsNeedMore', { n: need - count });
    else if (count > need) note = t('questionsTooMany', { n: count - need });
    else note = t('questionsReady');
    el.questionCount.title = note;
  }

  function chosenRow(id, text) {
    return (
      '<li><span>' + escapeHtml(text) + '</span>' +
      '<button class="chosen-remove" type="button" data-remove="' + escapeHtml(id) +
      '" aria-label="' + escapeHtml(t('customRemoveLabel')) + '">&times;</button></li>'
    );
  }

  /* ---------- 事件 ---------- */

  function bindEvents() {
    el.createRoom.addEventListener('click', createRoom);
    el.joinRoom.addEventListener('click', joinByCode);

    el.avatarPicker.addEventListener('click', function (event) {
      var button = event.target.closest('[data-avatar]');
      if (button) selectAvatar(button.dataset.avatar);
    });
    el.profileDone.addEventListener('click', enterRoom);
    // 「用名字第一個字」那一格跟著暱稱換字
    el.nickname.addEventListener('input', function () {
      var option = el.avatarPicker.querySelector('[data-avatar="initial"]');
      if (option) option.innerHTML = avatarSvg('initial', 56, el.nickname.value);
    });
    el.nickname.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') enterRoom();
    });

    el.copyLink.addEventListener('click', copyShareLink);
    bindDesignControls();

    el.sizeSeg.addEventListener('change', function (event) {
      state.size = Number(event.target.value);
      /*
       * 獲勝線條數的預設值每個尺寸不一樣（3×3 是 2 條，4×4 / 5×5 是 3 條），
       * 所以換尺寸時要跟著換——但只在主持人還沒自己選過的時候。
       * 他選過就沿用他的值，只夾進新尺寸的上限（5×5 選了 5 條再切回 3×3）。
       */
      state.targetLines = state.linesTouched
        ? Math.min(state.targetLines, B.maxTargetLines[state.size])
        : B.defaultTargetLines[state.size];
      /*
       * 切到有中央格的尺寸時補一道預設保底題，切到 4×4 時丟掉。
       * 不補的話主持人會停在一個「按開始被擋、但畫面上沒說要選哪一格」的狀態——
       * 預設是 4×4，所以這是最常走到的路徑。
       */
      if (!needsAnchor(state.size)) state.anchor = null;
      else if (!state.anchor) state.anchor = { id: BANK.defaultAnchorId };

      // 需要的題數跟著尺寸走（8 / 16 / 24），已選的題目也要跟著補齊或砍掉
      fitToSize();

      renderSizeSeg();
      renderLinesSeg();
      renderAnchorChoices();
      renderCategories();
      renderSelectedList();
      settingsChanged();
    });

    el.linesSeg.addEventListener('change', function (event) {
      state.targetLines = Number(event.target.value);
      state.linesTouched = true;
      renderLinesSeg();
      settingsChanged();
    });

    el.winnerSeg.addEventListener('change', function (event) {
      state.winnerCount = Number(event.target.value);
      settingsChanged();
    });

    el.selfClaim.addEventListener('change', function () {
      state.allowSelfClaim = el.selfClaim.checked;
      settingsChanged();
    });

    el.hostPlays.addEventListener('change', function () {
      state.hostPlays = el.hostPlays.checked;
      settingsChanged();
    });

    el.anchorOptions.addEventListener('change', function (event) {
      if (!event.target.name || event.target.name !== 'anchor') return;
      state.anchor = event.target.value === '__custom__' ? customAnchor() : { id: event.target.value };
      if (event.target.value === '__custom__') el.anchorCustom.focus();
      settingsChanged();
    });

    /*
     * 打字就生效，不用按「加入」——保底題只要一道，做成「加到清單裡」很奇怪。
     * 直接在框裡打字也會順手把選項切過來，不必先點那顆圓鈕。
     */
    el.anchorCustom.addEventListener('input', function () {
      state.anchorCustomText = el.anchorCustom.value;
      el.anchorCustomRadio.checked = true;
      state.anchor = customAnchor();
      // 每一個按鍵都送一次太吵（大廳按右上角的齒輪回來改時是連線狀態），停手才送
      clearTimeout(state.anchorTimer);
      state.anchorTimer = setTimeout(settingsChanged, 400);
    });

    el.categoryList.addEventListener('change', onQuestionToggle);

    /*
     * 一次只展開一個分類。七類全開的話清單長到主持人得一直捲，
     * 收合狀態下標題列已經有數字和「全選」，不需要同時看到全部題目。
     *
     * toggle 事件不會冒泡，所以掛在容器上要用捕捉階段。
     */
    var catAllClicked = null;

    el.categoryList.addEventListener('toggle', function (event) {
      var opened = event.target;
      if (!opened.open || !opened.classList.contains('cat')) return;
      // 點「全選」順帶展開的那一下不算——下面會把它收回去，別牽連已經展開的那一類
      if (opened === catAllClicked) return;
      var all = el.categoryList.querySelectorAll('details.cat');
      for (var i = 0; i < all.length; i += 1) {
        if (all[i] !== opened) all[i].open = false;
      }
    }, true);

    /*
     * 「全選」在 <summary> 裡，點它會順便把分類展開／收合，這不是我們要的。
     *
     * **不能用 preventDefault()**：checkbox 的勾選在 click 派發**之前**就先做掉了，
     * preventDefault 會把它一起還原，手動翻回來就變成翻兩次——點「全選」那顆框
     * 反而會把整類清空，而且還原發生在 updateCategoryCounts() 之後，
     * indeterminate 會停在跟數字對不上的狀態（0/6 卻掛著一槓）。
     * 改成讓 checkbox 照常運作（勾選交給上面的 change → applyCategoryAll），
     * 事後把 details.open 設回原值；展開同樣發生在事件派發之後，要排到下一個 tick。
     * 做法與 03_PreferenceMatch 一致，兩邊要一起看。
     */
    el.categoryList.addEventListener('click', function (event) {
      if (!event.target.closest('.cat-all')) return;
      var details = event.target.closest('details');
      var wasOpen = details.open;
      catAllClicked = details;
      setTimeout(function () {
        details.open = wasOpen;
        catAllClicked = null;
      }, 0);
    });
    el.selectedList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-remove]');
      if (button) removeQuestion(button.dataset.remove);
    });
    el.customAdd.addEventListener('click', addCustomQuestion);
    el.customInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') addCustomQuestion();
    });
    el.randomPick.addEventListener('click', randomFill);
    el.clearPick.addEventListener('click', function () {
      state.selected = [];
      state.custom = [];
      var boxes = el.categoryList.querySelectorAll('[data-question]');
      for (var b = 0; b < boxes.length; b += 1) boxes[b].checked = false;
      afterSelectionChanged();
    });

    el.setupDone.addEventListener('click', finishSetup);
    el.startGame.addEventListener('click', startGame);
    el.playerList.addEventListener('click', onKick);
    el.confirmCancel.addEventListener('click', function () { el.confirmDialog.close(); });

    el.tabCard.addEventListener('click', function () { showTab('card'); });
    el.tabRequests.addEventListener('click', function () { showTab('requests'); });

    el.bingoCard.addEventListener('click', onCellClick);
    el.cellList.addEventListener('click', onCellClick);
    el.cellList.addEventListener('click', onCancelRequest);
    el.incomingList.addEventListener('click', onRespond);

    el.pickList.addEventListener('click', onPickPerson);
    el.pickSelfClaim.addEventListener('click', onSelfClaim);
    el.pickCancel.addEventListener('click', function () { el.pickDialog.close(); });

    // 再玩一輪。不跳確認：這一輪已經結束、最終榜也拍好快照了，回大廳沒有東西會被打斷
    el.resetRoom.addEventListener('click', function () {
      track('bingo_play_again');
      send({ t: 'reset' });
    });

    el.closedOk.addEventListener('click', backHome);
    el.kickedOk.addEventListener('click', backHome);
  }

  function onQuestionToggle(event) {
    // 「全選」那顆也走 change，交給 applyCategoryAll 依它自己的 checked 決定全開或全關
    if (event.target.dataset && event.target.dataset.all) return applyCategoryAll(event.target);

    var box = event.target.closest('[data-question]');
    if (!box) return;
    setSelected(box.dataset.question, box.checked);
    afterSelectionChanged();
  }

  function removeQuestion(id) {
    setSelected(id, false);
    for (var i = 0; i < state.custom.length; i += 1) {
      if (state.custom[i].id === id) {
        state.custom.splice(i, 1);
        break;
      }
    }
    // 左邊那個 checkbox 要跟著取消勾選（這裡不重畫分類清單）
    var box = el.categoryList.querySelector('[data-question="' + id + '"]');
    if (box) box.checked = false;
    afterSelectionChanged();
  }

  function addCustomQuestion() {
    var text = el.customInput.value.trim();
    if (!text) return;

    // id 由前端發，不讓伺服器用序號補：刪掉中間幾題之後再新增會撞到既有的 id，
    // 撞到的那一題會被 cleanQuestions 當成重複直接丟掉
    state.custom.push({ id: customId(), text: text });
    el.customInput.value = '';
    renderSelectedList();
    settingsChanged();
  }

  // 伺服器的 cleanQuestions 靠 custom 前綴分辨「這題帶文字」，前綴不能改
  function customId() {
    return 'custom_' + Math.random().toString(36).slice(2, 8);
  }

  /*
    * 把已選題目調整成剛好等於新尺寸需要的題數。
    *
    * 少了就照 DEFAULT_ORDER 補（那個順序跨分類交錯，補出來不會全是同一類），
    * 多了就從尾巴砍——自訂題優先留著，那是主持人特地打的。
    * 不做這件事的話，4×4 切到 3×3 會留著 16 題卻只需要 8 題，
    * 要等按下「創建房間」才被擋。
    */
  function fitToSize() {
    var need = slotsFor(state.size);

    while (pickedCount() > need && state.selected.length) state.selected.pop();
    while (pickedCount() > need) state.custom.pop();

    // 補的時候也走隨機的那份順序，不然 3×3 換到 5×5 補進來的永遠是同樣那 16 題
    var have = {};
    for (var i = 0; i < state.selected.length; i += 1) have[state.selected[i]] = true;
    var pool = shuffledOrder();
    for (var j = 0; j < pool.length && pickedCount() < need; j += 1) {
      if (!have[pool[j]]) state.selected.push(pool[j]);
    }
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }

  /*
   * 隨機出題用的順序：每個分類內部先洗牌，再跨分類輪流取一題。
   *
   * 結構跟 questions.js 的 DEFAULT_ORDER 一樣，差別是每一類內部是隨機的，
   * 所以每按一次「隨機」抽到的都不同，但七個分類仍然平均出現——
   * 純粹整包洗牌的話，3×3 只取 8 題時很容易整張卡都在問同一類事情。
   * 分類本身的先後也洗過，不然每次都是「生活習慣」先被取到。
   */
  function shuffledOrder() {
    var buckets = [];
    for (var i = 0; i < BANK.categories.length; i += 1) {
      buckets.push(
        shuffle(
          questionsIn(BANK.categories[i]).map(function (question) {
            return question.id;
          }),
        ),
      );
    }
    shuffle(buckets);

    var order = [];
    for (var round = 0; ; round += 1) {
      var added = false;
      for (var k = 0; k < buckets.length; k += 1) {
        if (round < buckets[k].length) {
          order.push(buckets[k][round]);
          added = true;
        }
      }
      if (!added) break;
    }
    return order;
  }

  /*
   * 「隨機」：**每次都把內建題整批重抽**，不是把缺的補滿。
   *
   * 舊版只補到剛好填滿，所以題數已經滿的時候按下去完全沒有反應——但使用者按
   * 「隨機」要的就是換一批，行為對齊 03_PreferenceMatch 的 randomPick()。
   * 自訂題不動（那是主持人特地打的），只有連自訂題都塞不下才從尾巴砍。
   */
  function randomFill() {
    var need = slotsFor(state.size);

    state.selected = [];
    while (state.custom.length > need) state.custom.pop();

    var pool = shuffledOrder();
    while (pickedCount() < need && pool.length) state.selected.push(pool.shift());

    // 一次改動很多題，逐一同步 checkbox 不划算，直接重畫（展開狀態本來就會重置）
    renderCategories();
    renderSelectedList();
    settingsChanged();
  }

  /*
   * 設定被改動了——**刻意不立刻送出**。
   *
   * 每動一下就送的話，伺服器會廣播回來、renderRoom 跟著跑，主持人在設定頁
   * 每點一個按鈕就會被彈回房間。而且「改到一半的設定」也不該讓其他人看到。
   * 一律等按下「完成」才整份送出（見 finishSetup）。
   *
   * 這裡唯一做的事是**舉旗**：主持人動過設定頁的任何一項之後，尺寸就不再跟著
   * 人數自己動（見 syncAutoSize）。每個改動點本來就都會呼叫這支，所以掛在這裡
   * 不會漏掉任何一條路徑——分項去記「他碰過尺寸沒有／碰過題目沒有」的話，
   * 會出現「我只改了連線數，題目卻還在自己動」這種解釋不了的行為。
   */
  function settingsChanged() {
    state.settingsTouched = true;
  }

  function isOpen() {
    return Boolean(state.ws) && state.ws.readyState === WebSocket.OPEN;
  }

  // 把整份設定送給伺服器。永遠送完整清單而不是增減指令（理由見 src/room.js 的 handleSettings）
  function sendSettings() {
    var questions = [];
    var i;
    // 依題庫順序送出，不是依勾選順序：卡片洗牌前的順序跟主持人看到的一致
    for (i = 0; i < BANK.list.length; i += 1) {
      if (state.selected.indexOf(BANK.list[i].id) >= 0) questions.push({ id: BANK.list[i].id });
    }
    for (i = 0; i < state.custom.length; i += 1) {
      questions.push({ id: state.custom[i].id, text: state.custom[i].text });
    }

    send({
      t: 'settings',
      size: state.size,
      targetLines: state.targetLines,
      allowSelfClaim: state.allowSelfClaim,
      hostPlays: state.hostPlays,
      winnerCount: state.winnerCount,
      anchor: state.anchor || null,
      questions: questions,
    });
  }

  /*
   * 連進房間後的第一份狀態：把前端與伺服器對齊，只做一次。
   *
   * 剛開的房間伺服器上是空的 —— 這時要把設定頁選好的東西送上去。
   * 已經有設定的房間（重整、換裝置回來）則反過來拉下來蓋掉前端。
   */
  function syncSettingsOnce(room) {
    if (state.settingsSynced || state.role !== 'host' || !room) return;
    state.settingsSynced = true;

    if (!room.questions.length) return sendSettings();

    state.size = room.size;
    state.targetLines = room.targetLines;
    state.linesTouched = true;
    state.allowSelfClaim = room.allowSelfClaim;
    state.hostPlays = room.hostPlays;
    state.winnerCount = Math.max(1, room.winnerCount);
    state.anchor = room.anchor;
    // 自訂的保底題要把文字放回輸入框，不然重整之後框是空的、看起來像沒設定
    if (room.anchor && room.anchor.text) {
      state.anchorCustomId = room.anchor.id;
      state.anchorCustomText = room.anchor.text;
    }
    state.selected = [];
    state.custom = [];
    for (var i = 0; i < room.questions.length; i += 1) {
      var question = room.questions[i];
      if (question.text) state.custom.push({ id: question.id, text: question.text });
      else state.selected.push(question.id);
    }
    renderSetup();
  }

  /*
   * 尺寸跟著**實際到場人數**走，直到主持人自己動過設定為止。
   *
   * 這件事只能在這裡做，不能在開房時做：開房那一刻房間裡一個人都沒有，
   * 舊版於是永遠用 4×4 開場——三個人的家庭聚會也要找 16 個人簽名。
   *
   * 兩條護欄，都是實測踩出來的：
   *
   * **1. 主持人動過設定頁就完全退場**（`settingsTouched`，由 settingsChanged 舉旗）。
   * 只看「有沒有動過尺寸」太窄：他改了題目、改了連線數之後，尺寸還是會自己動，
   * 然後回頭 fitToSize 去補他剛挑好的題目。
   *
   * **2. 只升不降。** 人變多就升尺寸，人變少不動。現場的人是陸續到的，中途有人
   * 斷線或離開不代表真的少了；更要緊的是縮小會觸發 fitToSize 砍題，而它砍完內建題
   * 之後會**砍到自訂題**——實測自訂 11 題、玩家離開之後直接被砍成 8 題，
   * 主持人全程什麼都沒做就少了三題自己打的東西。不縮小就完全不會走到那條路。
   *
   * 尺寸升了題數就跟著升（8 / 16 / 24），所以要 fitToSize 補差額，並把新設定送回
   * 伺服器；主持人已經挑好的題目會留著，只補不足的部分。送出去之後伺服器會廣播
   * 回來、再跑一次這支，但那時尺寸已經一致，直接 return。
   */
  function syncAutoSize(room) {
    if (state.role !== 'host' || state.settingsTouched || !room || room.started) return;

    // 算的是真的要填卡片的人。主持人只控場時不算他自己
    var count = room.players.filter(function (player) {
      return state.hostPlays || !player.host;
    }).length;

    // 只升不降：next 比現在小就不動（見上面第 2 條）
    var next = suggestedSize(count);
    if (next <= state.size) return;

    state.size = next;
    state.targetLines = state.linesTouched
      ? Math.min(state.targetLines, B.maxTargetLines[state.size])
      : B.defaultTargetLines[state.size];
    // 跟尺寸選單同一套規則：有中央格就要有保底題，4×4 沒有中央格就丟掉
    if (!needsAnchor(state.size)) state.anchor = null;
    else if (!state.anchor) state.anchor = { id: BANK.defaultAnchorId };

    fitToSize();
    renderSetup();
    sendSettings();
  }

  /*
   * 設定頁有兩個進入點（跟喜好二選一一致），按鈕都是「完成」：存起來、回剛剛的畫面。
   *
   *  1. 首頁頂欄的「設定」分頁 —— 還沒開房，只是先準備好（存在這支手機上），開房時沿用。
   *  2. 大廳裡主持人按頂欄右上角的齒輪 —— 已經連線，存起來之後送給伺服器。
   *
   * 用有沒有連線來分辨，不另外記旗標：連線狀態本來就是唯一的事實來源。
   */
  function showSetup() {
    hideError(el.setupError);
    pushView('setup');
  }

  function finishSetup() {
    hideError(el.setupError);
    if (!settingsReady(el.setupError)) return;

    savePrep();
    if (isOpen()) sendSettings();
    // 「完成」＝退回剛剛那一格（首頁或房間），不要再往前推一格，
    // 否則返回鍵會在設定頁與房間之間來回打轉
    history.back();
  }

  /* ---------- 先準備好的設定（頂欄「設定」）：存在這支手機上 ---------- */

  function savePrep() {
    state.prepared = true;
    try {
      localStorage.setItem(PREP_KEY, JSON.stringify({
        size: state.size,
        targetLines: state.targetLines,
        linesTouched: state.linesTouched,
        winnerCount: state.winnerCount,
        hostPlays: state.hostPlays,
        allowSelfClaim: state.allowSelfClaim,
        anchor: state.anchor,
        anchorCustomText: state.anchorCustomText,
        anchorCustomId: state.anchorCustomId,
        selected: state.selected,
        custom: state.custom,
      }));
    } catch (e) {
      /* 記不住就算了，這一場照樣用 */
    }
  }

  /*
   * 讀回先準備好的設定。讀到了就算主持人「動過設定」（settingsTouched）：
   * 尺寸不再跟著人數自己升（見 syncAutoSize），他挑好的題目也不會被補題蓋掉。
   * 存的東西對不上現在的規則（題庫改版、題數不合）就整份不用，回到每場重抽的預設。
   */
  function loadPrep() {
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(PREP_KEY) || 'null');
    } catch (e) {
      /* 存壞了就當作沒有 */
    }
    if (!saved || B.sizes.indexOf(saved.size) < 0 || !Array.isArray(saved.selected)) return;

    var known = {};
    for (var i = 0; i < BANK.list.length; i += 1) known[BANK.list[i].id] = true;
    var selected = saved.selected.filter(function (id) { return known[id]; });
    var custom = Array.isArray(saved.custom) ? saved.custom : [];
    if (selected.length + custom.length !== slotsFor(saved.size)) return;

    state.size = saved.size;
    state.targetLines = Math.min(Number(saved.targetLines) || B.defaultTargetLines[saved.size], B.maxTargetLines[saved.size]);
    state.linesTouched = Boolean(saved.linesTouched);
    state.winnerCount = Math.min(3, Math.max(1, Number(saved.winnerCount) || 1));
    state.hostPlays = saved.hostPlays !== false;
    state.allowSelfClaim = Boolean(saved.allowSelfClaim);
    state.anchor = needsAnchor(state.size) ? saved.anchor || { id: BANK.defaultAnchorId } : null;
    state.anchorCustomText = saved.anchorCustomText || '';
    state.anchorCustomId = saved.anchorCustomId || '';
    state.selected = selected;
    state.custom = custom;
    state.settingsTouched = true;
    state.prepared = true;
  }

  // 題數與保底題的檢查。設定頁與大廳的「開始遊戲」都要用，錯誤訊息指到真正的原因
  function settingsReady(errorNode) {
    if (needsAnchor(state.size) && !state.anchor) {
      showError(errorNode, t('startBlockedAnchor'));
      return false;
    }
    if (pickedCount() !== slotsFor(state.size)) {
      showError(errorNode, t('startBlockedQuestions'));
      return false;
    }
    return true;
  }

  function startGame() {
    hideError(el.startError);
    if (!settingsReady(el.startError)) return;
    // 一個人的房間沒有人可以配對，每一格都需要「找到一個別人」並請對方確認
    if (state.room.players.length < 2) return showError(el.startError, t('startBlockedPlayers'));

    send({ t: 'startGame' });
    track('bingo_game_started', { size: state.size, target_lines: state.targetLines });
  }

  /* ---------- 進出房間 ---------- */

  function createRoom() {
    hideError(el.createError);

    // 先在前端擋掉超出範圍的數字，錯誤訊息就是那行提示本身——
    // 送出去等伺服器回 bad_max_players 只會拿到一句沒有數字的通用錯誤（跟 02 一致）
    var maxPlayers = parseInt(el.maxPlayers.value, 10);
    if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
      return showError(el.createError, t('maxPlayersHint'));
    }

    // 連點兩下會開出兩間房，第二間沒有人知道它存在
    var button = el.createRoom;
    button.disabled = true;
    button.textContent = t('creating');

    fetch(API + '/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostId: state.clientId, maxPlayers: maxPlayers }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) throw new Error(body.error || 'create_failed');
          return body;
        });
      })
      .then(function (body) {
        state.code = body.code;
        track('bingo_room_created', { max_players: maxPlayers });

        /*
         * 直接去挑頭像填暱稱，**不再先經過設定頁**。
         *
         * 設定頁原本是建房到入場之間的必經站，而它上面疊了尺寸、幾條線、幾個贏家、
         * 主持人參不參加、自己認領、保底題，再加上一整區出題——第一次用的人會
         * 停在那裡，即使那一頁的預設值本來就是合法的、直接按過去就好。
         * 現在它降級成大廳右上角的齒輪（開房前也能在頂欄的「設定」先準備），想調的人才進去。
         *
         * 重抽一次題目，並讓尺寸回到「跟著人數自動決定」（syncAutoSize）：
         * 同一個分頁連開兩間房，第二間不會沿用第一間的結果。
         * 主持人在頂欄「設定」先準備過的話就沿用那一份（loadPrep）。
         */
        resetSettings();
        loadPrep();
        renderSetup();
        pushView('profile', roomUrl());
      })
      .catch(function () {
        showError(el.createError, t('createFailed'));
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = t('createButton');
      });
  }

  function joinByCode() {
    var code = el.joinCode.value.trim().toUpperCase();
    if (code.length !== 4) return showError(el.joinError, t('errRoomNotFound'));
    state.code = code;
    checkRoomThenJoin();
  }

  // 先問伺服器房間在不在，打錯代碼的人才不會卡在一條連不上的 WebSocket
  function checkRoomThenJoin() {
    fetch(API + '/rooms/' + state.code)
      .then(function (response) {
        if (!response.ok) throw new Error('room_not_found');
        return response.json();
      })
      .then(function () {
        /*
         * **這支手機進過這間房間**（重整、斷線回來）就直接連回去，不再擋一次頭像暱稱頁：
         * 遊戲中按 F5 每次都要重填一遍很煩，而且開始之後本來就不該改暱稱——
         * 別人卡上的「等 ◯◯ 確認」會跟著變。
         *
         * 第一次進這間房間（掃 QR code、輸入房號，包括遊戲已經開始才到的人）一律先挑頭像、填暱稱，
         * 欄位會先帶上次用的（web100-profile），不想改直接按就好。
         * 真的沒名字（換裝置、清過快取）伺服器會回 nickname_required，那時 handleServerError 再把這一頁叫出來。
         */
        if (hasJoined(state.code) && el.nickname.value.trim()) return connect();
        pushView('profile', roomUrl());
      })
      .catch(function () {
        showFatal(t('errorTitle'), t('errRoomNotFound'));
      });
  }

  // 這支手機進過哪些房間（只記房號，房間清掉之後留著也無害）
  var JOINED_KEY_PREFIX = 'web100-bingo-joined-';

  function hasJoined(code) {
    try {
      return localStorage.getItem(JOINED_KEY_PREFIX + code) === '1';
    } catch (e) {
      return false;
    }
  }

  function markJoined(code) {
    try {
      localStorage.setItem(JOINED_KEY_PREFIX + code, '1');
    } catch (e) {
      /* 記不住就算了：重整時再填一次暱稱頁而已 */
    }
  }

  function enterRoom() {
    if (!el.nickname.value.trim()) return showError(el.profileError, t('errNicknameRequired'));
    hideError(el.profileError);
    saveProfile();
    connect();
  }

  function connect() {
    if (state.ws) state.ws.close();

    var scheme = API_ORIGIN.indexOf('https') === 0 ? 'wss' : 'ws';
    var url = scheme + '://' + API_ORIGIN.replace(/^https?:\/\//, '') +
      CFG.base + '/api/rooms/' + state.code + '/ws';

    var ws = new WebSocket(url);
    state.ws = ws;

    ws.addEventListener('open', function () {
      state.reconnectDelay = 500;
      hideBanner();
      ws.send(JSON.stringify({
        t: 'hello',
        clientId: state.clientId,
        nickname: el.nickname.value.trim(),
        avatar: state.avatar,
      }));
    });

    ws.addEventListener('message', function (event) {
      var msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      handleMessage(msg);
    });

    ws.addEventListener('close', function () {
      // 舊連線關掉的回音不算斷線：resetRoom 已經把 code 清掉了，重連只會連上 /rooms//ws
      if (ws !== state.ws || state.closing) return;
      showBanner(t('errNetwork'));
      scheduleReconnect();
    });
  }

  // 退避重連：手機切回前景時大家會同時醒來，固定間隔會一起打伺服器
  function scheduleReconnect() {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = setTimeout(connect, state.reconnectDelay);
    state.reconnectDelay = Math.min(state.reconnectDelay * 2, 8000);
  }

  function send(msg) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(msg));
  }

  function handleMessage(msg) {
    if (msg.t === 'welcome') {
      // 「我是主持人還是玩家」不由前端決定，一律等伺服器在 welcome 裡回答
      state.role = msg.you.role;
      markJoined(state.code);
      if (!state.joinReported) {
        track('bingo_player_joined');
        state.joinReported = true;
      }
      return;
    }

    if (msg.t === 'state') {
      state.room = msg.state;
      notifyChanges(msg.you);
      state.me = msg.you;
      syncSettingsOnce(msg.state);
      syncAutoSize(msg.state);
      renderRoom();
      return;
    }

    if (msg.t === 'kicked') {
      state.closing = true;
      el.kickedDialog.showModal();
      return;
    }

    if (msg.t === 'closed') {
      state.closing = true;
      el.closedDialog.showModal();
      return;
    }

    if (msg.t === 'error') handleServerError(msg.code);
  }

  function handleServerError(code) {
    var fatal = {
      room_not_found: t('errRoomNotFound'),
      room_full: t('errRoomFull'),
      room_started: t('errRoomStarted'),
    };
    if (fatal[code]) {
      state.closing = true;
      return showFatal(t('errorTitle'), fatal[code]);
    }

    if (code === 'nickname_required' || code === 'nickname_taken') {
      showView('profile');
      return showError(
        el.profileError,
        code === 'nickname_taken' ? t('errNicknameTaken') : t('errNicknameRequired'),
      );
    }

    var toasts = {
      cannot_pick_self: t('errCannotPickSelf'),
      already_marked: t('errAlreadyMarked'),
      already_pending: t('errAlreadyPending'),
      self_claim_disabled: t('errSelfClaimDisabled'),
      spectator_only: t('errSpectatorOnly'),
      question_count_mismatch: t('errQuestionCount'),
      anchor_required: t('errAnchorRequired'),
      no_players: t('errNoPlayers'),
    };
    if (toasts[code]) showToast(toasts[code]);
  }

  /* ---------- 對方確認 / 婉拒的提示 ---------- */

  function notifyChanges(you) {
    if (!you || !state.me) {
      if (you) {
        state.prevMarks = you.marks || {};
        state.prevOutgoing = indexOutgoing(you.outgoing);
        state.prevLines = you.lines;
        state.prevWon = you.won;
      }
      return;
    }

    var marks = you.marks || {};
    var index;

    // 新打勾的格子：誰確認的寫在 mark.by 裡
    for (index in marks) {
      if (!Object.prototype.hasOwnProperty.call(marks, index)) continue;
      if (state.prevMarks && state.prevMarks[index]) continue;
      var mark = marks[index];
      if (mark.mode === 'confirmed' && mark.by) {
        showToast(t('toastConfirmed', { name: playerName(mark.by) }));
      }
    }

    // 消失的送出中請求：沒有變成打勾、又不是自己取消的，就是對方婉拒了
    var nowOutgoing = indexOutgoing(you.outgoing);
    for (index in state.prevOutgoing || {}) {
      if (!Object.prototype.hasOwnProperty.call(state.prevOutgoing, index)) continue;
      if (nowOutgoing[index]) continue;
      if (marks[index]) continue;
      if (state.cancelled[index]) {
        delete state.cancelled[index];
        continue;
      }
      showToast(t('toastDeclined', { name: playerName(state.prevOutgoing[index]) }));
    }

    if (you.lines > state.prevLines) {
      showToast(you.won && !state.prevWon
        ? t('toastWon', { n: you.lines })
        : t('toastLine', { n: you.lines }));
    }

    state.prevMarks = marks;
    state.prevOutgoing = nowOutgoing;
    state.prevLines = you.lines;
    state.prevWon = you.won;
  }

  function indexOutgoing(outgoing) {
    var map = {};
    for (var i = 0; i < (outgoing || []).length; i += 1) {
      map[outgoing[i].index] = outgoing[i].to;
    }
    return map;
  }

  function playerById(id) {
    var players = (state.room && state.room.players) || [];
    for (var i = 0; i < players.length; i += 1) {
      if (players[i].id === id) return players[i];
    }
    return null;
  }

  function playerName(id) {
    var player = playerById(id);
    return player ? player.nickname : '';
  }

  /* ---------- 畫面 ---------- */

  /*
   * 每張卡片的顯示與否**全部**在這裡決定，不要散到各自的 render 函式裡
   * （跟 03_PreferenceMatch 的 renderRoom 同一個做法）。房間只有一個 view，
   * 大廳／進行中／結算是同一頁裡不同的卡片組合，房間列永遠在同一個位置。
   */
  function renderRoom() {
    var room = state.room;
    if (!room) return;

    var isHost = state.role === 'host';
    var inLobby = room.status === 'lobby';
    var playing = room.status === 'playing';
    var ended = room.status === 'ended';

    /*
     * 只有「不在設定頁」時才把畫面切回房間。
     *
     * 廣播是隨時會來的（有人加入、離開、送出配對），每來一次就 pushView('room')
     * 的話，主持人按齒輪進去之後會被下一次廣播直接彈回房間。
     * 底下那些卡片的顯示狀態照樣更新，回去時就是對的。
     */
    if (state.view !== 'setup') pushView('room', roomUrl());

    // 身分標籤放在遊戲內頂欄右邊。離開／關閉房間就是頂欄的返回鍵（window.gameBack → confirmExit），不另外放按鈕
    var roleBadge = document.getElementById('game-bar-badge');
    if (roleBadge) {
      roleBadge.textContent = isHost ? t('hostBadge') : t('playerBadge');
      // 主持人用設計系統的主持人徽章（黃），玩家維持藍色，跟名單上的標籤同一套顏色
      roleBadge.classList.toggle('b-host', isHost);
      roleBadge.classList.toggle('b-info', !isHost);
    }
    syncSettingsGear();

    el.shareCard.hidden = !inLobby;
    el.lobbyCard.hidden = !inLobby;
    el.playTabs.hidden = !playing;
    el.playGrid.hidden = !playing;
    el.resultsCard.hidden = !ended;

    if (inLobby) renderLobby(room, isHost);
    else if (playing) renderPlay(room);
    else renderEnded(room);
  }

  function renderLobby(room, isHost) {
    // 房號一格一個字（Woohop 的 .room-code），念給大家聽、對著抄都比較不會錯
    el.roomCode.innerHTML = String(room.code).split('').map(function (ch) {
      return '<span>' + escapeHtml(ch) + '</span>';
    }).join('');
    el.roomCode.setAttribute('aria-label', room.code);
    renderQr();

    el.hostLobby.hidden = !isHost;
    // 至少兩個人才有人可以配對：不夠就把按鈕停用，下面寫原因（不是按了才跳錯誤）
    var short = room.players.length < 2;
    el.startGame.disabled = short;
    el.startNeed.hidden = !short;
    el.waitingHint.hidden = isHost;

    // 設定收在頂欄右上角的齒輪後面，大廳只留一行摘要——主持人在這一頁要做的是等人到齊
    if (isHost) {
      el.settingsSummary.textContent = t('settingsSummary', {
        size: room.size,
        n: room.targetLines,
        total: room.questions.length,
      });
    }

    el.playerCount.textContent = t('playersCount', {
      n: room.players.length,
      total: room.maxPlayers,
    });
    el.playerList.innerHTML = playerRows(room, isHost);
  }

  /*
   * 大廳名單的排序：**主持人最上面、自己第二、其餘照加入順序**。
   *
   * 不能直接用 room.players 的順序——那是排行榜的排序（先看達標時間再看連線數），
   * 在還沒開始的大廳裡等於照暱稱排，找自己要一個一個看。
   */
  function lobbyOrder(room) {
    return room.players.slice().sort(function (a, b) {
      if (a.host !== b.host) return a.host ? -1 : 1;
      var mineA = a.id === state.clientId;
      var mineB = b.id === state.clientId;
      if (mineA !== mineB) return mineA ? -1 : 1;
      return (a.joinedAt || 0) - (b.joinedAt || 0);
    });
  }

  function playerRows(room, isHost) {
    var players = lobbyOrder(room);
    var html = '';
    for (var i = 0; i < players.length; i += 1) {
      var player = players[i];
      /*
       * 標籤可以同時掛好幾個。主持人打開「也一起玩」時會同時有「主持人」和「玩家」——
       * 這比在名單下面寫一句「你同時也是玩家」清楚，而且別人也看得到誰真的在玩。
       */
      var badges = '';
      if (player.host) badges += '<span class="badge b-host">' + escapeHtml(t('hostBadge')) + '</span>';
      if (!player.host || room.hostPlays) {
        badges += '<span class="badge b-info">' + escapeHtml(t('playerBadge')) + '</span>';
      }
      if (player.spectator) badges += '<span class="badge b-info">' + escapeHtml(t('spectatorBadge')) + '</span>';
      if (!player.online) badges += '<span class="t-caption">' + escapeHtml(t('offlineBadge')) + '</span>';

      var kick = isHost && !player.host
        ? '<button class="btn btn-sm btn-ghost kick" type="button" data-kick="' + player.id + '" aria-label="' +
          escapeHtml(t('kickLabel')) + '">✕</button>'
        : '';

      // 設計系統的 .player：一列一人，自己那一列換成淡藍
      html +=
        '<li class="player' + (player.online ? '' : ' is-offline') + (player.id === state.clientId ? ' is-me' : '') + '">' +
        avatarSvg(player.avatar, 32, player.nickname) + '<span class="name">' +
        escapeHtml(player.nickname) + '</span>' + badges + kick + '</li>';
    }
    return html;
  }

  function renderPlay(room) {
    var me = state.me;
    var hasCard = Boolean(me && me.card);
    el.cardBox.hidden = !hasCard;
    el.spectatorBox.hidden = hasCard;
    /*
     * 沒有卡的人本來整頁只剩一段說明。純控場的主持人整場都在這裡，
     * 給他即時排行榜才有東西可以帶——他要靠這個決定什麼時候喊停。
     */
    el.boardBox.hidden = hasCard;
    if (!hasCard) renderBoard(room, el.boardList, null);

    // 沒有卡的原因有兩種，訊息不一樣：關掉「一起玩」的主持人 vs 中途加入的人
    if (!hasCard) {
      var mc = state.role === 'host' && !room.hostPlays;
      el.spectatorTitle.textContent = t(mc ? 'mcHeading' : 'spectatorHeading');
      el.spectatorDesc.textContent = t(mc ? 'mcDesc' : 'spectatorDesc');
    }

    if (hasCard) {
      renderProgress(room, me);
      renderCard(room, me);
      renderCellList(room, me);
    }

    renderIncoming(me);

    var waiting = me && me.incoming ? me.incoming.length : 0;
    el.tabRequestsBadge.hidden = waiting === 0;
    el.tabRequestsBadge.textContent = String(waiting);

    /*
     * 分頁的顯示狀態一律由 showTab 決定，renderPlay 不要自己動。
     *
     * 直接設 el.paneList.hidden 的話，使用者切到「待你確認」之後，
     * 下一次廣播（按個確認就會有）就把題目清單塞回畫面上，看起來像自己跳頁。
     */
    showTab(state.tab);
  }

  function renderProgress(room, me) {
    el.progressLines.textContent = t('progressHeading', {
      done: me.lines,
      target: room.targetLines,
    });

    var marked = Object.keys(me.marks || {}).length;
    // 「打勾 N 格」一直留在同一個位置，達標訊息另外一行，不要互相取代
    el.progressCells.textContent = t('progressCells', { n: marked });
    el.progressNote.textContent = t('progressWon');
    el.progressNote.hidden = !me.won;

    var blackout = marked === B.geometry[room.size].cells;
    el.progressBadge.hidden = !me.won && !blackout;
    el.progressBadge.textContent = blackout ? t('blackoutBadge') : t('wonBadge');
  }

  function renderCard(room, me) {
    var completed = {};
    for (var i = 0; i < (me.completed || []).length; i += 1) completed[me.completed[i]] = true;

    // 哪些格子屬於已連成的線，用來上高亮
    var inLine = {};
    var lines = linesFor(room.size);
    for (i = 0; i < lines.length; i += 1) {
      if (!completed[i]) continue;
      for (var j = 0; j < lines[i].length; j += 1) inLine[lines[i][j]] = true;
    }

    var pending = indexOutgoing(me.outgoing);
    var html = '';

    for (i = 0; i < me.card.length; i += 1) {
      var mark = me.marks[i];
      var classes = ['bingo-cell'];
      var note = '';

      if (mark) {
        classes.push(mark.mode === 'self' ? 'is-self' : 'is-marked');
        note = mark.mode === 'self' ? t('cellSelf') : playerName(mark.by);
      } else if (pending[i] !== undefined) {
        classes.push('is-pending');
        // 寫出在等誰：同時送出好幾格時，才知道要去催哪一個人
        note = t('cellWaiting', { name: playerName(pending[i]) });
      }
      if (inLine[i]) classes.push('in-line');
      if (i === room.anchorIndex) classes.push('is-anchor');

      /*
       * 格子只放編號。手機上 5×5 每格只有 56px，描述句擠進去就是讀不到的小字；
       * 完整題目改放下方的清單（renderCellList），格子專心當進度圖。
       */
      html +=
        '<button class="' + classes.join(' ') + '" type="button" data-cell="' + i + '"' +
        (mark ? ' disabled' : '') +
        ' aria-label="' + escapeHtml((i + 1) + '. ' + questionText(me.card[i])) + '">' +
        '<span class="cell-no">' + (i + 1) + '</span>' +
        (note ? '<span class="cell-note">' + escapeHtml(note) + '</span>' : '') +
        // 打勾的圓圈是 CSS 畫的（跟設計系統的大選項卡 .choice 同一個樣子），見 app.css 的 .bingo-cell::after
        '</button>';
    }
    el.bingoCard.style.setProperty('--size', room.size);
    // CSS 沒辦法直接對 custom property 的值做選擇器，但 5×5 在窄螢幕上要另一套
    // 尺寸規則（見 app.css 的 [data-size="5"]），所以同一個值也寫成 data 屬性
    el.bingoCard.dataset.size = String(room.size);
    el.bingoCard.innerHTML = html;
  }

  // 格子的幾何很單純（列、行、兩條對角線），但門檻表那種有陷阱的計算一律用內嵌的 B.minCells
  function linesFor(size) {
    var lines = [];
    var row;
    var col;
    for (row = 0; row < size; row += 1) {
      var cells = [];
      for (col = 0; col < size; col += 1) cells.push(row * size + col);
      lines.push(cells);
    }
    for (col = 0; col < size; col += 1) {
      var column = [];
      for (row = 0; row < size; row += 1) column.push(row * size + col);
      lines.push(column);
    }
    var main = [];
    var anti = [];
    for (var i = 0; i < size; i += 1) {
      main.push(i * size + i);
      anti.push(i * size + (size - 1 - i));
    }
    lines.push(main, anti);
    return lines;
  }

  /*
   * 題目清單：格子的完整版。每一列是「編號 + 題目 + 狀態」，整列可點。
   *
   * 送出中的請求也收在這裡當成一種狀態（等 X 確認 + 取消），不另開一張卡——
   * 那張卡多數時候是空的，只是把畫面推長。
   */
  function renderCellList(room, me) {
    var pending = indexOutgoing(me.outgoing);
    var html = '';

    for (var i = 0; i < me.card.length; i += 1) {
      var mark = me.marks[i];
      var cls = 'cell-row';
      var state = '';
      var action = '';

      if (mark) {
        cls += ' is-marked';
        state = mark.mode === 'self' ? t('cellSelf') : t('cellDone', { name: playerName(mark.by) });
      } else if (pending[i] !== undefined) {
        cls += ' is-pending';
        state = t('cellWaiting', { name: playerName(pending[i]) });
        action =
          '<button class="cell-row-cancel" type="button" data-cancel="' + i + '" aria-label="' +
          escapeHtml(t('cancelRequestButton')) + '">&times;</button>';
      }
      if (i === room.anchorIndex) cls += ' is-anchor';

      html +=
        '<li class="' + cls + '">' +
        '<button class="cell-row-main" type="button" data-cell="' + i + '"' +
        (mark ? ' disabled' : '') + '>' +
        '<span class="cell-row-no">' + (i + 1) + '</span>' +
        '<span class="cell-row-text">' + escapeHtml(questionText(me.card[i])) + '</span>' +
        (state ? '<span class="cell-row-state">' + escapeHtml(state) + '</span>' : '') +
        '</button>' + action + '</li>';
    }
    el.cellList.innerHTML = html;
  }

  function renderIncoming(me) {
    var list = (me && me.incoming) || [];
    var html = '';
    for (var i = 0; i < list.length; i += 1) {
      var request = list[i];
      html +=
        '<li><div class="req-main"><span class="hint">' +
        escapeHtml(t('incomingLine', { name: playerName(request.from) })) + '</span>' +
        '<span class="req-question">' + escapeHtml(questionText(request.questionId)) + '</span></div>' +
        '<div class="req-actions">' +
        '<button class="btn btn-sm btn-solid" type="button" data-accept="' + request.requestId + '">' +
        escapeHtml(t('confirmButton')) + '</button>' +
        '<button class="btn btn-sm btn-secondary" type="button" data-decline="' + request.requestId + '">' +
        escapeHtml(t('declineButton')) + '</button></div></li>';
    }
    el.incomingList.innerHTML = html;
    el.incomingEmpty.hidden = list.length > 0;
  }

  /*
   * 排行榜只列「這一輪拿到卡的人」。
   *
   * 純控場的主持人與中途加入的旁觀者都沒有卡，把他們列進來只會是一排 0 條線 0 格，
   * 看起來像落後的人而不是沒在比的人。他們仍然在大廳名單上。
   */
  // skip：前面幾名已經放在頒獎台上了，排行榜從後面接著列
  function renderBoard(room, listNode, emptyNode, skip) {
    var html = '';
    var shown = 0;
    var ranked = 0;
    for (var i = 0; i < room.players.length; i += 1) {
      var player = room.players[i];
      if (player.spectator) continue;
      ranked += 1;
      if (ranked <= (skip || 0)) continue;
      shown += 1;
      var badges = '';
      if (player.wonAt) badges += '<span class="badge b-live">' + escapeHtml(t('wonBadge')) + '</span>';
      if (player.blackout) badges += '<span class="badge b-live">' + escapeHtml(t('blackoutBadge')) + '</span>';
      if (player.spectator) badges += '<span class="badge b-info">' + escapeHtml(t('spectatorBadge')) + '</span>';
      if (!player.online) badges += '<span class="t-caption">' + escapeHtml(t('offlineBadge')) + '</span>';

      var waiting = player.waiting
        ? '<span class="hint">' + escapeHtml(t('leaderboardWaiting', { n: player.waiting })) + '</span>'
        : '';

      html +=
        '<li>' + avatarSvg(player.avatar, 32, player.nickname) +
        '<div class="board-main"><span class="player-name">' + escapeHtml(player.nickname) + '</span>' +
        badges + waiting + '</div>' +
        '<div class="board-score"><strong>' +
        escapeHtml(t('leaderboardLines', { n: player.lines })) + '</strong>' +
        '<span class="hint">' + escapeHtml(t('leaderboardCells', { n: player.marked })) + '</span>' +
        '</div></li>';
    }
    listNode.innerHTML = html;
    if (emptyNode) emptyNode.hidden = shown > 0;
  }

  /*
   * 結算：設計系統的排行榜（design/brand-exploration.html「結果」）——前三名站上頒獎台
   * （第一名在中間、最高、黃色加皇冠，第二名藍、第三名橘），其餘接在下面的 .rank-list，名次從 4 開始。
   */
  function renderEnded(room) {
    var top = room.players.filter(function (player) { return !player.spectator; }).slice(0, 3);
    var steps = [
      { height: 100, face: 'var(--yellow-face)', edge: 'var(--yellow-edge)' },
      { height: 70, face: 'var(--blue-face)', edge: 'var(--blue-edge)' },
      { height: 52, face: 'var(--orange-face)', edge: 'var(--orange-edge)' },
    ];
    // 畫面上的順序是 2、1、3
    var order = [1, 0, 2].filter(function (rank) { return rank < top.length; });
    el.finalPodium.innerHTML = order.map(function (rank) {
      var player = top[rank];
      var step = steps[rank];
      return (
        '<div class="col">' +
        (rank === 0 ? '<svg class="crown" width="26" height="26" aria-hidden="true"><use href="#i-crown"/></svg>' : '') +
        avatarSvg(player.avatar, rank === 0 ? 72 : 48, player.nickname) +
        '<span class="name">' + escapeHtml(player.nickname) + '</span>' +
        '<span class="podium-score">' + escapeHtml(t('leaderboardLines', { n: player.lines })) + '</span>' +
        '<div class="block" style="height:' + step.height + 'px;background:' + step.face + ';border-color:' + step.edge + '">' +
        (rank + 1) + '</div></div>'
      );
    }).join('');
    el.finalPodium.hidden = top.length === 0;
    renderBoard(room, el.finalList, null, 3);
    // 關房是頂欄返回鍵的事，結算卡只留「再玩一輪」
    el.resetBlock.hidden = state.role !== 'host';
  }

  /* ---------- 配對 ---------- */

  function onCellClick(event) {
    var button = event.target.closest('[data-cell]');
    if (!button || button.disabled) return;

    // 等待中的格子再點一次不是取消，一樣開視窗——取消太容易誤觸，
    // 而且多數時候使用者要的是「改送給別人」，那在視窗裡做
    openPickDialog(Number(button.dataset.cell));
  }

  function openPickDialog(index) {
    var room = state.room;
    var me = state.me;

    el.pickDialog.dataset.cell = String(index);
    el.pickQuestion.textContent = questionText(me.card[index]);

    // 名單排除自己：能選自己的話，保底題就變成偷偷的 Free 格（CONCEPT.md 第四節）
    /*
      * 已經送出請求的那個人排最上面並標「待確認」。點別人＝改送給他，
      * 舊的那筆會先取消（見 onPickPerson），不用先回去按取消再重選。
      */
    var pendingTo = indexOutgoing(me.outgoing)[index];
    var list = room.players.slice().sort(function (a, b) {
      if ((a.id === pendingTo) !== (b.id === pendingTo)) return a.id === pendingTo ? -1 : 1;
      return 0;
    });

    var html = '';
    var others = 0;
    for (var i = 0; i < list.length; i += 1) {
      var player = list[i];
      if (player.id === state.clientId) continue;
      others += 1;
      html +=
        '<li><button class="pick-option' + (player.id === pendingTo ? ' is-pending' : '') +
        '" type="button" data-pick="' + player.id + '">' +
        avatarSvg(player.avatar, 32, player.nickname) + '<span class="name">' + escapeHtml(player.nickname) + '</span>' +
        (player.id === pendingTo
          ? '<span class="badge b-info">' + escapeHtml(t('pickPendingBadge')) + '</span>'
          : '') +
        (player.online ? '' : '<span class="t-caption">' +
          escapeHtml(t('offlineBadge')) + '</span>') +
        '</button></li>';
    }
    el.pickList.innerHTML = html;
    el.pickEmpty.hidden = others > 0;
    el.pickSelfClaim.hidden = !room.allowSelfClaim;

    el.pickDialog.showModal();
  }

  function onPickPerson(event) {
    var button = event.target.closest('[data-pick]');
    if (!button) return;

    var index = Number(el.pickDialog.dataset.cell);
    var pendingTo = indexOutgoing(state.me.outgoing)[index];

    el.pickDialog.close();
    // 點的就是正在等的那個人：維持原狀，還是等他確認。
    // 要收回請求是按清單上的 ✕，不是在這裡點他一下
    if (pendingTo === button.dataset.pick) return;

    // 改送給別人：先把舊的收回來，伺服器一格只允許一筆等待中的請求
    if (pendingTo !== undefined) {
      state.cancelled[index] = true;
      send({ t: 'cancelMatch', index: index });
    }
    send({ t: 'requestMatch', index: index, playerId: button.dataset.pick });
    track('bingo_match_requested');
  }

  function onSelfClaim() {
    var index = Number(el.pickDialog.dataset.cell);
    send({ t: 'selfClaim', index: index });
    track('bingo_self_claimed');
    el.pickDialog.close();
  }

  function onCancelRequest(event) {
    var button = event.target.closest('[data-cancel]');
    if (!button) return;
    var index = Number(button.dataset.cancel);
    state.cancelled[index] = true;
    send({ t: 'cancelMatch', index: index });
  }

  function onRespond(event) {
    var accept = event.target.closest('[data-accept]');
    var decline = event.target.closest('[data-decline]');
    if (accept) {
      send({ t: 'respond', requestId: accept.dataset.accept, accept: true });
      track('bingo_match_confirmed');
    } else if (decline) {
      send({ t: 'respond', requestId: decline.dataset.decline, accept: false });
    }
  }

  function onKick(event) {
    var button = event.target.closest('[data-kick]');
    if (button) send({ t: 'kick', playerId: button.dataset.kick });
  }

  /* ---------- 分頁切換 ---------- */

  function showTab(name) {
    state.tab = name;
    // 「我的卡片」同時是格子與題目清單，桌機上它們並排，手機上一起顯示。
    // 沒有卡的人（純控場的主持人、旁觀者）沒有題目清單可看
    var hasCard = Boolean(state.me && state.me.card);
    el.paneCard.hidden = name !== 'card';
    el.paneList.hidden = name !== 'card' || !hasCard;
    el.paneRequests.hidden = name !== 'requests';
    el.tabCard.setAttribute('aria-selected', String(name === 'card'));
    el.tabRequests.setAttribute('aria-selected', String(name === 'requests'));
  }

  /* ---------- 分享 ---------- */

  function shareLink() {
    return location.origin + CFG.base + '/' + CFG.lang + '/?room=' + state.code;
  }

  function renderQr() {
    var url = shareLink();
    // 只在網址變的時候重畫，否則每次廣播主持人畫面都會閃
    if (el.qrBox.dataset.url === url) return;
    el.qrBox.dataset.url = url;

    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    // 設計系統房號卡的 QR 樣式（woohop-art.js 的 qrSvg），三個房間遊戲同一個長相
    el.qrBox.innerHTML = (window.Woohop && window.Woohop.qrSvg ? window.Woohop.qrSvg(qr) : qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareLink()).then(function () {
      showToast(t('copiedToast'));
    });
  }

  /*
   * 設計系統元件的行為（design/brand-exploration.html），跟喜好二選一同一套：
   *  - 房號四格：打一個字跳下一格、刪除退回上一格、貼上整組自動分格；組起來寫進隱藏的 #join-code
   *  - 數量增減：2～30，寫進隱藏的 #max-players
   *  - 分享：手機支援 navigator.share 才出現
   */
  function bindDesignControls() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#code-boxes input'));
    var sync = function () {
      el.joinCode.value = boxes.map(function (b) { return b.value; }).join('');
      hideError(el.joinError);
    };
    var fill = function (from, text) {
      var chars = text.replace(/[^a-z0-9]/gi, '').toUpperCase().split('');
      for (var i = from; i < boxes.length && chars.length; i += 1) boxes[i].value = chars.shift();
      sync();
      var next = boxes.filter(function (b) { return !b.value; })[0];
      (next || boxes[boxes.length - 1]).focus();
    };
    boxes.forEach(function (box, i) {
      box.addEventListener('input', function () {
        var v = box.value;
        box.value = '';
        fill(i, v);
      });
      box.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace' && !box.value && boxes[i - 1]) {
          boxes[i - 1].value = '';
          boxes[i - 1].focus();
          sync();
          event.preventDefault();
        }
        // Enter 跟原本的房號輸入框一樣：直接加入
        if (event.key === 'Enter') joinByCode();
      });
      box.addEventListener('paste', function (event) {
        var text = (event.clipboardData || window.clipboardData).getData('text');
        if (!text) return;
        event.preventDefault();
        fill(i, text);
      });
    });

    var out = document.getElementById('max-players-out');
    document.getElementById('max-stepper').addEventListener('click', function (event) {
      var button = event.target.closest('[data-step]');
      if (!button) return;
      var value = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, (Number(el.maxPlayers.value) || 10) + Number(button.dataset.step)));
      el.maxPlayers.value = String(value);
      out.textContent = String(value);
    });

    if (navigator.share) {
      el.shareLink.hidden = false;
      el.shareLink.addEventListener('click', function () {
        navigator.share({ title: document.title, url: shareLink() }).catch(function () {
          /* 使用者取消分享，不用做什麼 */
        });
      });
    }
  }

  /*
   * 大廳裡主持人可以從頂欄右上角的齒輪改設定（game.css 看 data-game-settings）；開始之後就藏起來。
   * 從設定頁按返回回到房間時不一定會重畫房間，所以 showView 也會呼叫這支
   */
  function syncSettingsGear() {
    var can = state.view === 'room' && state.role === 'host' && state.room && state.room.status === 'lobby';
    if (can) document.body.setAttribute('data-game-settings', '');
    else document.body.removeAttribute('data-game-settings');
  }

  /* ---------- 畫面切換與小工具 ---------- */

  /*
   * 破壞性動作一律走這個對話框，不用原生 confirm()——原生的長相由瀏覽器決定，
   * 跟系列其他專案的 .modal 對不起來，手機上也常常被當成廣告攔掉。
   * prefix 是文案的前綴，例如 confirmClose → confirmCloseTitle / Desc / Ok。
   */
  function askConfirm(prefix, onOk) {
    el.confirmTitle.textContent = t(prefix + 'Title');
    el.confirmDesc.textContent = t(prefix + 'Desc');
    el.confirmOk.textContent = t(prefix + 'Ok');
    el.confirmOk.onclick = function () {
      el.confirmDialog.close();
      onOk();
    };
    el.confirmDialog.showModal();
  }

  function confirmExit() {
    var isHost = state.role === 'host';
    askConfirm(isHost ? 'confirmClose' : 'confirmLeave', function () {
      state.closing = true;
      send({ t: isHost ? 'close' : 'leave' });
      if (isHost) track('bingo_room_closed');
      backHome();
    });
  }

  // 用 replace 不用 href：退出之後按返回鍵不該又被拉回剛剛離開的房間
  function backHome() {
    location.replace(CFG.base + '/' + CFG.lang + '/');
  }

  // 頂欄的「設定」（game.js 呼叫）：首頁畫面是先準備設定與題目，大廳裡是主持人改設定
  window.openSettings = function () {
    if (state.view === 'setup') return;
    showSetup();
  };

  /*
   * 遊戲內頂欄的返回鍵（game.js 會呼叫這個），跟喜好二選一一樣：
   *  - 首頁畫面：回網站的「找遊戲」
   *  - 設定、填名字：跟瀏覽器返回鍵一樣退一格（onPopState 會處理）
   *  - 房間裡：跟「離開／關閉房間」同一個確認框
   *  - 錯誤畫面：回這個遊戲的首頁
   */
  window.gameBack = function () {
    if (state.view === 'home') location.href = '/' + CFG.lang + '/games/';
    else if (state.view === 'room') confirmExit();
    else if (state.view === 'error') backHome();
    else history.back();
  };

  /* ---------- 瀏覽器返回鍵 ---------- */

  /*
   * 所有畫面共用同一個網址，不接管返回鍵的話按一下就會跳出整個網站。
   * 做法跟 02_BuzzerGame / 03_PreferenceMatch 一致，三個專案要一起看：
   *
   *  - 基準那一格固定是首頁，網址上的 ?room= 先拿掉（退回來重整才不會又被拉進房間）
   *  - 每前進一個畫面推一格，帶著自己的深度 i，離開時才能一次退到底
   *  - 還在大廳：直接安靜離開房間、退回首頁那一格（跟按鈕的行為一致）
   *  - 已經開始：先跳跟「離開房間 / 關閉房間」同一個確認框，確定了才走，
   *    免得手機上手滑一劃就把一場正在進行的遊戲滑掉
   */
  var rewinding = false; // 自己呼叫 history.go() 造成的那一次 popstate

  function initHistory() {
    var home = new URL(location.href);
    home.searchParams.delete('room');
    history.replaceState({ view: 'home', i: 0 }, '', home.toString());
    state.depth = 0;
    state.entry = 'home';
    window.addEventListener('popstate', onPopState);
  }

  // url 不給就沿用目前的網址（設定頁、以及從房間按齒輪進來的情況）
  function pushView(name, url) {
    if (state.entry !== name) {
      state.depth += 1;
      state.entry = name;
      history.pushState({ view: name, i: state.depth }, '', url || location.href);
    }
    showView(name);
  }

  function roomUrl() {
    var url = new URL(location.href);
    url.searchParams.set('room', state.code);
    return url.toString();
  }

  function onPopState(event) {
    var target = (event.state && event.state.view) || 'home';
    var index = (event.state && event.state.i) || 0;
    state.depth = index;
    state.entry = target;

    // 自己退回首頁那一格造成的，畫面已經決定好了
    if (rewinding) {
      rewinding = false;
      showView('home');
      return;
    }

    // 房間已經沒了（被關、被移出、致命錯誤）：不用再問，把通知關掉回首頁畫面
    if (state.closing) {
      closeDialogs();
      resetRoom();
      return rewindHome(index);
    }

    if (state.view !== 'room' || !isOpen()) return showView(target);

    if (state.room && state.room.status !== 'lobby') {
      // 先把房間那一格補回去，按「取消」的人才留在原地
      pushView('room', roomUrl());
      confirmExit();
      return;
    }

    // 還在大廳：沒有東西會被打斷，安靜離開就好，不用問
    quietLeave();
    rewindHome(index);
  }

  // 房間可能疊在設定頁、頭像頁上面，一次退到首頁那一格，不要一格一格問
  function rewindHome(index) {
    if (index > 0) {
      rewinding = true;
      history.go(-index);
      return;
    }
    showView('home');
  }

  function quietLeave() {
    var isHost = state.role === 'host';
    if (isHost) track('bingo_room_closed');
    send({ t: isHost ? 'close' : 'leave' });
    resetRoom();
  }

  function closeDialogs() {
    [el.confirmDialog, el.closedDialog, el.kickedDialog, el.pickDialog].forEach(function (dialog) {
      if (dialog.open) dialog.close();
    });
  }

  // 回到首頁畫面＝下一場從頭來過，這一場的狀態全部歸零
  function resetRoom() {
    clearTimeout(state.reconnectTimer);
    var ws = state.ws;
    state.ws = null; // 先斷開參照，舊連線的 close 事件就不會再觸發重連
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        /* 已經關了 */
      }
    }
    state.closing = false;
    state.role = '';
    state.code = '';
    state.room = null;
    state.me = null;
    state.joinReported = false;
    state.settingsSynced = false;
    state.prevMarks = null;
    state.prevOutgoing = null;
    state.prevLines = 0;
    state.prevWon = false;
    state.cancelled = {};
    resetSettings();
    loadPrep();
    renderSetup();
    hideBanner();
  }

  // 只切畫面，不動歷史。popstate 與「往回走」都走這裡；要留一筆歷史用 pushView
  function showView(name) {
    state.view = name;

    el.viewHome.hidden = name !== 'home';
    el.viewSetup.hidden = name !== 'setup';
    el.viewProfile.hidden = name !== 'profile';
    el.viewRoom.hidden = name !== 'room';
    el.viewError.hidden = name !== 'error';

    // 到這一步一定已經有房號了（建房完或掃碼進來），標題直接帶上，
    // 掃錯 QR code 的人在填名字之前就看得出來
    if (name === 'profile') el.joinTitle.textContent = t('joinTitle', { code: state.code });

    // 遊戲內頂欄（Woohop 的 game.css）：進了房間就是 play（藏起玩法分頁、選單、頁尾，遊戲名不能點），其他畫面是 browse。
    // 房間裡的主持人點齒輪改設定，那也還是在房間裡：頂欄維持房間的樣子（返回＝回房間、沒有玩法分頁可以點出去）
    var inRoom = name === 'room' || (name === 'setup' && isOpen());
    document.body.setAttribute('data-game-mode', inRoom ? 'play' : 'browse');
    syncSettingsGear();
    var gameTitle = document.querySelector('.game-bar .title');
    if (gameTitle) gameTitle.tabIndex = inRoom ? -1 : 0;

    // 所有畫面共用同一個網址，page_view 靠自動送只會記到一筆，
    // 分不出多少人真的開了房間，所以在這裡手動送
    if (window.trackPageView) window.trackPageView(CFG.base + '/' + CFG.lang + '/' + name);
  }

  function showFatal(title, desc) {
    el.errorTitle.textContent = title;
    el.errorDesc.textContent = desc;
    showView('error');
  }

  function showError(node, message) {
    node.textContent = message;
    node.hidden = false;
  }

  function hideError(node) {
    node.hidden = true;
  }

  function showBanner(message) {
    el.connBanner.textContent = message;
    el.connBanner.hidden = false;
  }

  function hideBanner() {
    el.connBanner.hidden = true;
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      el.toast.hidden = true;
    }, 2600);
  }

  /*
   * 事件只在「做那個動作的那台裝置」上送。狀態是廣播給全場的，照著狀態送的話，
   * 一場 10 個人的遊戲會把同一個事件記 10 次。前綴一律 bingo_（阿瓦隆是 avalon_、
   * 搶答是 buzzer_、喜好二選一是 match_）——整個系列共用一個 GA4 資源，
   * 沒有前綴就分不出是哪個遊戲的。
   */
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
