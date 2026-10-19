/*
 * 喜好二選一的前端。沒有 bundler，四個畫面在同一份 HTML 裡靠 showView() 切換，
 * 房號放查詢字串 ?room=XXXX（QR code 掃進來就是這個網址）。
 *
 * 兩個重點跟搶答那個專案不一樣：
 *
 * 1. **主持人與玩家共用同一個房間畫面。** 主持人預設也一起作答，可以在大廳關掉
 *    「主持人也一起作答」改成純控場；做成兩套版面會讓那個開關處處要判斷兩次。
 *    差別只在多出來的控制項（開始、改題目、下一題、關房）。
 * 2. **倒數只是視覺效果。** 能不能作答一律由伺服器判斷（見 src/room.js 的 deadline），
 *    這裡的動畫跑完了不代表伺服器那邊已經關門，反之亦然。
 */
(function () {
  'use strict';

  var T = window.T;
  var CFG = window.MATCH;
  var BANK = window.QUESTIONS;
  var AVATARS = window.AVATARS;

  // 這幾個 key 跟系列其他專案共用，不要各專案自己發明一套
  var CLIENT_KEY = 'web100-client-id';
  // 暱稱與頭像存成一份 profile，之後的 Web100 遊戲都能直接沿用，
  // 不用為了「記住我是誰」去做帳號系統
  var PROFILE_KEY = 'web100-profile';
  // 主持人在頂欄「設定」先挑好的題目與設定（開房前就能設，隔天打開還在）
  var PREP_KEY = 'web100-match-prep';

  var MIN_QUESTIONS = 1;
  var MAX_QUESTIONS = 20;
  // 「隨機」一次抽幾題，跟預設題數一致
  var RANDOM_COUNT = 10;
  var URGENT_MS = 3000;

  // 分類標題的展開箭頭。<details> 沒有預設的視覺提示，光看標題不知道還有沒有東西可以展開；
  // 展開時由 CSS 轉 180 度（.cat[open] summary .chevron）
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
    room: null,
    ws: null,
    reconnectTimer: 0,
    reconnectDelay: 500,
    closing: false,
    view: '',
    // 目前在自己這疊 history 的第幾格（首頁是 0），返回鍵要靠它一次退到底
    depth: 0,
    entry: 'home',
    joinReported: false,
    resultsReported: false,
    // 主持人的選題只從伺服器同步一次，之後以本機為準（見 syncSettingsOnce）
    settingsSynced: false,
    // 主持人親手改過組數了嗎。false 的話組數由伺服器依實到人數決定（見 sendSettings）
    groupCountTouched: false,
    // 建房畫面的選題狀態
    selected: [],
    custom: [],
    avatar: '',
    // 倒數：收到 state 當下換算成本機的截止時刻，之後自己跑動畫，不用跟伺服器對時
    deadlineAt: 0,
    frame: 0,
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    state.clientId = loadClientId();
    loadProfile();

    renderCategories();
    loadPrep();
    renderAvatarPicker();
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
      'view-home', 'view-setup', 'view-join', 'view-room', 'view-error',
      'category-list', 'selected-count', 'custom-input', 'custom-add',
      'selected-list', 'selected-empty', 'random-pick', 'clear-pick',
      'max-players', 'group-count', 'question-seconds', 'host-plays', 'create-room', 'create-error',
      'join-code', 'join-room', 'join-error',
      'join-title', 'avatar-picker', 'nickname', 'enter-room', 'nickname-error',
      'share-card', 'room-code', 'copy-link', 'qr-box',
      'setup-done', 'setup-error',
      'lobby-card', 'player-count', 'player-list', 'player-empty',
      'start-game-block', 'start-game', 'start-game-error', 'waiting-hint',
      'question-card', 'question-progress', 'countdown', 'timer-fill', 'question-text',
      'ox-buttons', 'answer-o', 'answer-x', 'answer-hint',
      'tally', 'tally-o-count', 'tally-o-list', 'tally-x-count', 'tally-x-list',
      'next-question',
      'results-card', 'my-group-card', 'my-group-members', 'my-group-topics', 'my-group-empty',
      'top-pairs-card', 'top-pairs', 'top-pairs-hint', 'top-pairs-empty',
      'all-groups-card', 'all-groups', 'all-groups-heading', 'back-to-room', 'play-again',
      'error-title', 'error-desc', 'conn-banner',
      'confirm-dialog', 'confirm-title', 'confirm-desc', 'confirm-cancel', 'confirm-ok',
      'closed-dialog', 'closed-ok', 'kicked-dialog', 'kicked-ok',
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

  // t('playerCount', { n: 3, max: 10 })：{n} 這種佔位符在 locales 裡是原樣保留的
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
   * 房間裡已經存的頭像不用轉換。
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

  /* ---------- 建房：選題 ---------- */

  function renderCategories() {
    var html = '';
    for (var i = 0; i < BANK.categories.length; i += 1) {
      var category = BANK.categories[i];
      var questions = questionsIn(category);

      /*
       * 「全選」放在標題列（summary）裡，不放展開後的第一行——收合狀態下也要能整類勾掉，
       * 不然主持人得先展開五題才能全選。點它時要擋掉 <summary> 的展開行為，
       * 見 bindEvents 裡的 data-all 處理。
       *
       * 分類一律不預設展開：七類全開會讓人一進來就面對三十幾個 checkbox。
       */
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
        // 一律不勾。勾哪幾題由底下的 pickRandomDefaults() 決定，
        // 這裡先寫死的話，隨機抽完還要再把它們一個個取消，等於做兩次
        html +=
          '<li><label class="check-row"><input type="checkbox" data-question="' +
          escapeHtml(question.id) + '" />' +
          '<span>' + escapeHtml(question.text) + '</span></label></li>';
      }
      html += '</ul></details>';
    }
    el.categoryList.innerHTML = html;
    pickRandomDefaults();
    updateSelectedCount();
    renderSelectedListOnly();
  }

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

  /*
   * 每一場都重抽一組題目，不再固定用 BANK.defaultQuestions 那份精選清單。
   *
   * 原本的預設是十個分類各挑一題、而且挑的是「最會讓全場分兩半」的那一題，分組品質最好。
   * 但同一個小組每週玩，不去改題目的人**每次玩到的都是同一份**——那正是要解掉的問題。
   *
   * 抽法是分層的，不是整份題庫亂抽：先把分類洗牌，前八類各抽一題，剩下兩題從
   * 沒被抽到的題目裡隨機補。純隨機的話很容易四題擠在同一類、而一半的分類完全沒出現；
   * 分層之後每次都涵蓋 8～10 類，補的那兩題再決定最後有沒有 1～2 類落空。
   *
   * 代價是抽到的不一定是該類裡鑑別度最高的那題，分組品質偶爾會比舊的精選差一點。
   * 這是拿品質換「每次都不一樣」，決定在 CONCEPT.md。
   */
  var STRATIFIED_CATEGORIES = 8;

  function pickRandomQuestions() {
    var categories = shuffle(BANK.categories);
    var picked = [];
    var used = {};

    for (var i = 0; i < categories.length && picked.length < STRATIFIED_CATEGORIES; i += 1) {
      var pool = questionsIn(categories[i]);
      if (!pool.length) continue;
      var one = pool[Math.floor(Math.random() * pool.length)];
      picked.push(one.id);
      used[one.id] = true;
    }

    var rest = shuffle(BANK.list).filter(function (question) {
      return !used[question.id];
    });
    while (picked.length < RANDOM_COUNT && rest.length) picked.push(rest.shift().id);

    return picked;
  }

  // 抽一組新的，並把畫面上的勾選同步過去。自訂題不動——那是主持人自己打的
  function pickRandomDefaults() {
    state.selected = pickRandomQuestions();
    syncQuestionBoxes();
  }

  function syncQuestionBoxes() {
    var boxes = el.categoryList.querySelectorAll('[data-question]');
    for (var i = 0; i < boxes.length; i += 1) {
      boxes[i].checked = state.selected.indexOf(boxes[i].dataset.question) >= 0;
    }
  }

  function questionsIn(category) {
    return BANK.list.filter(function (question) {
      return question.category === category;
    });
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function updateSelectedCount() {
    var total = state.selected.length + state.custom.length;
    el.selectedCount.textContent = t('selectedCount', { n: total });

    for (var i = 0; i < BANK.categories.length; i += 1) {
      var category = BANK.categories[i];
      var questions = questionsIn(category);
      var picked = questions.filter(function (question) {
        return state.selected.indexOf(question.id) >= 0;
      }).length;

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

  /*
   * 右欄「已選題目」。內建題與自訂題列在同一張清單裡，順序就是實際出題順序——
   * 主持人左邊勾了七零八落的一堆之後，只有這裡看得出來這場到底會問哪幾題、順序如何。
   *
   * 只重畫，不回送伺服器：從伺服器同步回來時也用這支，才不會又繞一圈送回去。
   */
  function renderSelectedListOnly() {
    var html = '';

    // 依題庫順序，跟 sendSettings() 送出去的順序一致
    for (var i = 0; i < BANK.list.length; i += 1) {
      var question = BANK.list[i];
      if (state.selected.indexOf(question.id) < 0) continue;
      html +=
        '<li><span class="text">' + escapeHtml(question.text) + '</span>' +
        '<button class="chosen-remove" type="button" data-unselect="' + escapeHtml(question.id) +
        '" aria-label="' + escapeHtml(t('customRemoveLabel')) + '">✕</button></li>';
    }

    for (var j = 0; j < state.custom.length; j += 1) {
      html +=
        '<li class="is-custom"><span class="text">' + escapeHtml(state.custom[j]) + '</span>' +
        '<button class="chosen-remove" type="button" data-remove="' + j +
        '" aria-label="' + escapeHtml(t('customRemoveLabel')) + '">✕</button></li>';
    }

    el.selectedList.innerHTML = html;
    el.selectedEmpty.hidden = state.selected.length + state.custom.length > 0;
  }

  function renderCustomList() {
    renderSelectedListOnly();
    updateSelectedCount();
    sendSettings();
  }

  function addCustomQuestion() {
    var text = el.customInput.value.replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (state.selected.length + state.custom.length >= MAX_QUESTIONS) {
      return showError(el.startGameError, t('errTooManyQuestions'));
    }
    state.custom.push(text);
    el.customInput.value = '';
    renderCustomList();
  }

  /* ---------- 頭像選擇 ---------- */

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

  /* ---------- 事件 ---------- */

  function bindEvents() {
    el.categoryList.addEventListener('change', onQuestionToggle);

    /*
     * 一次只展開一個分類。全部展開的話清單長到要一直捲，
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
     * 不能用 preventDefault()：checkbox 的勾選在 click 派發**之前**就先做掉了，
     * preventDefault 會把它一起還原，手動翻回來又會變成翻兩次（勾 2/5 反而全部清空）。
     * 改成讓 checkbox 照常運作，事後把 details.open 設回原值——展開行為同樣發生在
     * 事件派發之後，所以要排到下一個 tick 才蓋得掉。
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

    el.randomPick.addEventListener('click', randomPick);
    el.clearPick.addEventListener('click', clearPick);
    el.playAgain.addEventListener('click', function () {
      track('match_play_again');
      send({ t: 'reset' });
    });
    el.customAdd.addEventListener('click', addCustomQuestion);
    el.customInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addCustomQuestion();
      }
    });
    el.selectedList.addEventListener('click', function (event) {
      var remove = event.target.closest('[data-remove]');
      if (remove) {
        state.custom.splice(Number(remove.dataset.remove), 1);
        return renderCustomList();
      }

      // 內建題：右欄刪掉等於左邊取消勾選，兩邊要一起變
      var unselect = event.target.closest('[data-unselect]');
      if (!unselect) return;
      var id = unselect.dataset.unselect;
      setSelected(id, false);
      var box = el.categoryList.querySelector('[data-question="' + id + '"]');
      if (box) box.checked = false;
      updateSelectedCount();
      renderSelectedListOnly();
      sendSettings();
    });

    el.createRoom.addEventListener('click', createRoom);
    el.joinRoom.addEventListener('click', joinByCode);
    el.joinCode.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') joinByCode();
    });

    el.avatarPicker.addEventListener('click', function (event) {
      var button = event.target.closest('[data-avatar]');
      if (button) selectAvatar(button.dataset.avatar);
    });
    el.enterRoom.addEventListener('click', enterRoom);
    // 「用名字第一個字」那一格跟著暱稱換字
    el.nickname.addEventListener('input', function () {
      var option = el.avatarPicker.querySelector('[data-avatar="initial"]');
      if (option) option.innerHTML = avatarSvg('initial', 56, el.nickname.value);
    });
    el.nickname.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') enterRoom();
    });

    // 主持人**親手**動過組數之後才鎖定，在那之前伺服器會依實到人數自己調
    el.groupCount.addEventListener('change', function () {
      state.groupCountTouched = true;
      sendSettings();
    });
    el.questionSeconds.addEventListener('change', sendSettings);
    el.hostPlays.addEventListener('change', sendSettings);

    el.setupDone.addEventListener('click', finishSetup);
    el.copyLink.addEventListener('click', copyShareLink);
    bindDesignControls();
    el.startGame.addEventListener('click', startGame);
    el.nextQuestion.addEventListener('click', function () {
      send({ t: 'next' });
    });
    el.answerO.addEventListener('click', function () {
      answer('O');
    });
    el.answerX.addEventListener('click', function () {
      answer('X');
    });
    el.playerList.addEventListener('click', onKick);

    el.confirmCancel.addEventListener('click', function () {
      el.confirmDialog.close();
    });
    el.closedOk.addEventListener('click', backHome);
    el.kickedOk.addEventListener('click', backHome);
  }

  function onQuestionToggle(event) {
    var box = event.target;

    if (box.dataset.all) return applyCategoryAll(box);
    if (!box.dataset.question) return;

    setSelected(box.dataset.question, box.checked);
    afterSelectionChanged();
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
    updateSelectedCount();
    renderSelectedListOnly();
    sendSettings();
  }

  /*
   * 「隨機」按鈕：重抽一組，走的是跟開房時同一支分層抽題（pickRandomQuestions）。
   *
   * 只換內建題，不動自訂題：自訂題是主持人自己打的，被隨機洗掉會很惱人。
   */
  // 全部清掉，含主持人自己打的自訂題——按鈕寫「清空」就該是真的清空
  function clearPick() {
    state.selected = [];
    state.custom = [];

    var boxes = el.categoryList.querySelectorAll('[data-question]');
    for (var i = 0; i < boxes.length; i += 1) boxes[i].checked = false;
    renderCustomList();
    afterSelectionChanged();
  }

  function randomPick() {
    pickRandomDefaults();
    afterSelectionChanged();
  }

  function setSelected(id, on) {
    var at = state.selected.indexOf(id);
    if (on && at < 0) state.selected.push(id);
    if (!on && at >= 0) state.selected.splice(at, 1);
  }

  /* ---------- 建房 / 加入 ---------- */

  /*
   * 首頁只送人數上限，跟搶答遊戲一樣。題目與其他設定等進了大廳再由 sendSettings() 送。
   * 主持人也要填暱稱——他預設會一起作答，而且大廳名單上要看得到他。
   */
  function createRoom() {
    hideError(el.createError);
    el.createRoom.disabled = true;

    fetch(API + '/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hostId: state.clientId,
        maxPlayers: Number(el.maxPlayers.value) || 10,
      }),
    })
      .then(function (response) {
        return response.ok ? response.json() : Promise.reject(new Error('create_failed'));
      })
      .then(function (data) {
        track('match_room_created');
        state.code = data.code;

        /*
         * 直接去挑頭像填暱稱，**不再先經過出題頁**。
         *
         * 出題頁原本是建房到入場之間的必經站，但它一打開是十個分類的手風琴、
         * 每行掛著「全選 1/5」的計數器，看起來像有五十題要一題一題勾——第一次用的人
         * 會停在那裡，即使那一頁的預設值本來就是合法的、直接按過去就好。
         * 現在它降級成大廳裡的「改題目」，想調的人才進去（CONCEPT.md）。
         *
         * 每一場重抽一次題目：不去改題目的人，兩場也不會玩到同一份。
         */
        // 主持人在「設定」先挑過題目就沿用；沒碰過才每場重抽一份
        if (!state.prepared) pickRandomDefaults();
        updateSelectedCount();
        renderSelectedListOnly();
        showJoinForm();
      })
      .catch(function () {
        showError(el.createError, t('errCreateFailed'));
      })
      .finally(function () {
        el.createRoom.disabled = false;
      });
  }

  /*
   * 把目前的選題與設定整份送給伺服器。
   *
   * 每次改動都送完整清單而不是增減指令：主持人可能開了兩個分頁，增減指令會愈疊愈亂，
   * 整份覆蓋則不管誰後送都收斂到同一個狀態。也順便讓主持人重整之後選擇還在
   * （狀態存在房間裡，不是存在這個分頁的記憶體裡）。
   */
  function sendSettings() {
    var questions = [];
    // 依題庫順序送出，不是依勾選順序：出題順序才跟主持人看到的一致
    for (var i = 0; i < BANK.list.length; i += 1) {
      if (state.selected.indexOf(BANK.list[i].id) >= 0) questions.push({ id: BANK.list[i].id });
    }
    for (var j = 0; j < state.custom.length; j += 1) questions.push({ text: state.custom[j] });

    var payload = {
      t: 'settings',
      questions: questions,
      questionSeconds: secondsValue(),
      hostPlays: el.hostPlays.checked,
    };

    /*
     * ⚠️ 組數只在主持人親手改過之後才送。
     *
     * 每次改動都送整份設定，如果無條件把 groupCount 也放進去，那麼「改個題目」
     * 也會被伺服器當成「主持人指定了組數」，自動調整就永久失效了——而主持人
     * 十之八九根本沒碰過那一排。
     */
    if (state.groupCountTouched) payload.groupCount = groupCountValue();

    send(payload);
  }

  /*
   * 出題頁有兩個進入點，按鈕的意思也不同：
   *
   *  1. 剛建好房、還沒連線 —— 按鈕是「創建房間」，按完去挑頭像填暱稱。
   *     這時題目只存在前端，等連進房間後由 syncSettingsOnce 一次送上去。
   *  2. 已經在大廳，按「改題目」回來 —— 按鈕是「完成」，按完把設定送出去、回房間。
   *
   * 用有沒有連線來分辨，不另外記一個旗標：連線狀態本來就是唯一的事實來源。
   */
  function showSetup() {
    // 兩個進入點（首頁頂欄的「設定」、大廳主持人的齒輪）按鈕都是「完成」：存起來、回剛剛的畫面
    el.setupDone.textContent = t('saveQuestionsButton');
    hideError(el.setupError);
    pushView('setup');
  }

  function finishSetup() {
    hideError(el.setupError);
    var total = state.selected.length + state.custom.length;
    if (total < MIN_QUESTIONS) return showError(el.setupError, t('errNoQuestions'));
    if (total > MAX_QUESTIONS) return showError(el.setupError, t('errTooManyQuestions'));

    savePrep();
    // 還沒開房：只是先準備好，回首頁畫面
    if (!isOpen()) return history.back();

    sendSettings();
    // 「完成」＝退回剛剛那一格房間，不要再往前推一格，
    // 否則返回鍵會在出題頁與房間之間來回打轉
    history.back();
  }

  // 秒數是一排單選，取選中的那顆；沒有選中（理論上不會）就退回預設
  function secondsValue() {
    var picked = el.questionSeconds.querySelector('input:checked');
    return picked ? Number(picked.value) : 20;
  }

  // 組數同樣是一排單選。伺服器還會依實到人數夾一次，這裡送什麼都不會算出壞的分組
  function groupCountValue() {
    var picked = el.groupCount.querySelector('input:checked');
    return picked ? Number(picked.value) : 2;
  }

  function isOpen() {
    return Boolean(state.ws) && state.ws.readyState === WebSocket.OPEN;
  }

  function startGame() {
    hideError(el.startGameError);
    var total = state.selected.length + state.custom.length;
    if (total < MIN_QUESTIONS) return showError(el.startGameError, t('errNoQuestions'));
    if (total > MAX_QUESTIONS) return showError(el.startGameError, t('errTooManyQuestions'));

    /*
     * 漏斗最關鍵的一段：少了這個事件就分不出「開了房沒玩」與「真的玩完」。
     * 只有主持人這台會送——狀態是廣播給全場的，照著狀態送會一場記十次。
     */
    track('match_game_started', {
      question_count: total,
      player_count: state.room ? state.room.players.length : 0,
      question_seconds: secondsValue(),
    });
    send({ t: 'startGame' });
  }

  function joinByCode() {
    hideError(el.joinError);
    var code = el.joinCode.value.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(code)) return showError(el.joinError, t('errBadCode'));

    state.code = code;
    checkRoomThenJoin();
  }

  // 先問伺服器房間在不在，打錯代碼的人才不會卡在填暱稱之後才被踢回來
  function checkRoomThenJoin() {
    fetch(API + '/rooms/' + state.code)
      .then(function (response) {
        return response.ok ? response.json() : Promise.reject(new Error('room_not_found'));
      })
      .then(function () {
        /*
         * 已經填過名字就直接連回去，不再擋一次頭像暱稱頁。
         *
         * 作答到一半按 F5 每次都要重填一遍很煩，而且開始之後本來就不該改暱稱——
         * 統計與分組畫面上的名字會跟著變。真的沒名字（換裝置、清過快取）
         * 伺服器會回 nickname_required，那時 handleServerError 再把這一頁叫出來。
         */
        if (el.nickname.value.trim()) return connect();
        showJoinForm();
      })
      .catch(function () {
        if (state.view === 'home') showError(el.joinError, t('errRoomNotFound'));
        else showFatal(t('errorTitle'), t('errRoomNotFound'));
      });
  }

  function showJoinForm() {
    el.joinTitle.textContent = t('joinTitle', { code: state.code });
    pushView('join', roomUrl());
    el.nickname.focus();
  }

  function enterRoom() {
    hideError(el.nicknameError);
    if (!el.nickname.value.trim()) return showError(el.nicknameError, t('errNicknameRequired'));
    saveProfile();
    connect();
  }

  /* ---------- 連線 ---------- */

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
      if (ws !== state.ws || state.closing) return;
      showBanner(t('connLost'));
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
      state.role = msg.you.role;
      // 「我是主持人還是玩家」不由前端決定，一律等伺服器在 welcome 裡回答
      if (!state.joinReported) {
        track('match_player_joined');
        state.joinReported = true;
      }
      // 重連也會再收到一次 welcome，pushView 認得目前這一格，不會愈疊愈多
      pushView('room', roomUrl());
      return;
    }

    if (msg.t === 'state') {
      // 回到大廳＝新的一輪，把只該送一次的旗標放掉
      if (msg.state.status === 'lobby' && state.room && state.room.status === 'results') {
        state.resultsReported = false;
      }
      state.room = msg.state;
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
    if (code === 'nickname_required') {
      showView('join');
      showError(el.nicknameError, t('errNicknameRequired'));
    }
    // too_late / stale_question 不提示：畫面上倒數已經歸零，再跳訊息只是吵
  }

  /* ---------- 房間畫面 ---------- */

  function renderRoom() {
    var room = state.room;
    var isHost = state.role === 'host';

    // 大廳裡主持人可以從頂欄右上角的齒輪改題目（game.css 看 data-game-settings）；開始作答後就藏起來
    if (isHost && room.status === 'lobby') document.body.setAttribute('data-game-settings', '');
    else document.body.removeAttribute('data-game-settings');

    // 身分標籤放在遊戲內頂欄右邊。離開／關閉房間就是頂欄的返回鍵（window.gameBack → confirmExit），不另外放按鈕
    var roleBadge = document.getElementById('game-bar-badge');
    if (roleBadge) {
      roleBadge.textContent = isHost ? t('hostBadge') : t('playerBadge');
      // 主持人用設計系統的主持人徽章（黃），玩家維持藍色，跟名單上的標籤同一套顏色
      roleBadge.classList.toggle('b-host', isHost);
      roleBadge.classList.toggle('b-info', !isHost);
    }

    var inLobby = room.status === 'lobby';
    var inResults = room.status === 'results';

    /*
     * 每張卡片的顯示與否**全部**在這裡決定，不要散到各自的 render 函式裡。
     * 出題已經是獨立的一頁（view-setup），排在挑頭像之前，所以房間畫面只剩
     * 房號、成員、作答、結果四張卡。
     */
    el.shareCard.hidden = !inLobby;
    el.lobbyCard.hidden = !inLobby;
    el.questionCard.hidden = inLobby || inResults;
    el.resultsCard.hidden = !inResults;

    if (inLobby) renderLobby(room, isHost);
    else if (inResults) renderResults(room);
    else renderQuestion(room, isHost);
  }

  function renderLobby(room, isHost) {
    if (isHost) syncSettingsOnce(room);

    /*
     * 組數還是自動的話，每次房間狀態更新都把那一排跟著伺服器改。
     *
     * syncSettingsOnce 只同步一次，但自動組數是**隨著人進來才變的**——
     * 五個人時 2 組、第十二個人進來變 3 組。少了這一段，主持人後來點開
     * 「改題目」看到的會是開房當下那個過期的數字。
     */
    if (isHost && !state.groupCountTouched) {
      var autoRadio = el.groupCount.querySelector('[value="' + room.groupCount + '"]');
      if (autoRadio) autoRadio.checked = true;
    }

    // 房號一格一個字（Woohop 的 .room-code），念給大家聽、對著抄都比較不會錯
    el.roomCode.innerHTML = String(room.code).split('').map(function (ch) {
      return '<span>' + escapeHtml(ch) + '</span>';
    }).join('');
    el.roomCode.setAttribute('aria-label', room.code);
    renderQr();

    el.playerCount.textContent = t('playerCount', { n: room.players.length, max: room.maxPlayers });
    el.playerEmpty.hidden = room.players.length > 0;

    /*
     * 名單排序：**主持人最上面、自己第二、其餘照加入順序**。
     *
     * 伺服器已經照 joinedAt 排好了，所以這裡只要把主持人和自己往前挪——
     * Array.prototype.sort 是穩定的，回傳 0 的那些會維持原本的加入順序。
     */
    var ordered = room.players.slice().sort(function (a, b) {
      if (a.host !== b.host) return a.host ? -1 : 1;
      var mineA = a.id === state.clientId;
      var mineB = b.id === state.clientId;
      if (mineA !== mineB) return mineA ? -1 : 1;
      return 0;
    });

    var html = '';
    for (var i = 0; i < ordered.length; i += 1) {
      var player = ordered[i];
      html +=
        '<li class="player' + (player.online ? '' : ' is-offline') + (player.id === state.clientId ? ' is-me' : '') + '">' +
        avatarSvg(player.avatar, 32, player.nickname) +
        '<span class="name">' + escapeHtml(player.nickname) + '</span>' +
        /* 標籤樣式跟 04_HappyBingo 一致（.role-badge 膠囊），三個專案要長一樣。
           主持人打開「也一起作答」時會同時有「主持人」和「玩家」兩個標籤——
           這比在別的地方寫一句說明清楚，別人也看得到誰真的參與分組 */
        (player.host ? '<span class="role-badge is-host">' + escapeHtml(t('hostTag')) + '</span>' : '') +
        (!player.host || room.hostPlays
          ? '<span class="role-badge">' + escapeHtml(t('playerTag')) + '</span>'
          : '') +
        (player.online
          ? ''
          : '<span class="role-badge is-muted">' + escapeHtml(t('offlineTag')) + '</span>') +
        (isHost && !player.host
          ? '<button class="btn btn-sm btn-ghost kick" type="button" data-kick="' + player.id +
            '" aria-label="' + escapeHtml(t('kickLabel')) + '">✕</button>'
          : '') +
        '</li>';
    }
    el.playerList.innerHTML = html;

    el.startGameBlock.hidden = !isHost;
    el.waitingHint.hidden = isHost;
  }

  /*
   * 主持人重整之後，把伺服器上的選題還原到畫面。
   *
   * **只做一次**。每次廣播都套的話，主持人正在勾選時會被自己送出去、繞一圈回來的狀態
   * 覆蓋掉，游標與展開狀態都會跳（搶答那邊的題目輸入框踩過同樣的坑，用 questionSynced 擋）。
   * 同步完之後以本機為準，本機每次改動都會整份送出去。
   */
  /* ---------- 先準備好的題目（頂欄「設定」）：存在這支手機上 ---------- */

  function savePrep() {
    state.prepared = true;
    try {
      localStorage.setItem(PREP_KEY, JSON.stringify({
        selected: state.selected,
        custom: state.custom,
        seconds: secondsValue(),
        hostPlays: el.hostPlays.checked,
        groupCount: state.groupCountTouched ? groupCountValue() : null,
      }));
    } catch (e) {
      /* 記不住就算了，這一場照樣用 */
    }
  }

  function loadPrep() {
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(PREP_KEY) || 'null');
    } catch (e) {
      /* 存壞了就當作沒有 */
    }
    if (!saved || !Array.isArray(saved.selected)) return;

    // 題庫改版後已經不存在的題目丟掉
    var known = {};
    for (var i = 0; i < BANK.list.length; i += 1) known[BANK.list[i].id] = true;
    state.selected = saved.selected.filter(function (id) { return known[id]; });
    state.custom = Array.isArray(saved.custom) ? saved.custom.slice(0, MAX_QUESTIONS) : [];
    if (!state.selected.length && !state.custom.length) return;

    state.prepared = true;
    syncQuestionBoxes();
    var seconds = el.questionSeconds.querySelector('[value="' + saved.seconds + '"]');
    if (seconds) seconds.checked = true;
    if (typeof saved.hostPlays === 'boolean') el.hostPlays.checked = saved.hostPlays;
    if (saved.groupCount) {
      var group = el.groupCount.querySelector('[value="' + saved.groupCount + '"]');
      if (group) {
        group.checked = true;
        state.groupCountTouched = true;
      }
    }
    renderSelectedListOnly();
    updateSelectedCount();
  }

  function syncSettingsOnce(room) {
    if (state.settingsSynced || !room.questions) return;
    state.settingsSynced = true;

    // 剛開的房間伺服器上是空的，這時要保留前端的預設勾選，並把它送上去
    if (!room.questions.length) return sendSettings();

    state.selected = [];
    state.custom = [];
    for (var i = 0; i < room.questions.length; i += 1) {
      var question = room.questions[i];
      if (question.text) state.custom.push(question.text);
      else state.selected.push(question.id);
    }

    syncQuestionBoxes();
    var groupRadio = el.groupCount.querySelector('[value="' + room.groupCount + '"]');
    if (groupRadio) groupRadio.checked = true;
    var secondsRadio = el.questionSeconds.querySelector('[value="' + room.questionSeconds + '"]');
    if (secondsRadio) secondsRadio.checked = true;
    el.hostPlays.checked = room.hostPlays;

    renderSelectedListOnly();
    updateSelectedCount();
  }

  function renderQuestion(room, isHost) {
    var locked = room.status === 'reveal';
    var mine = myAnswer(room);

    el.questionProgress.textContent = t('questionProgress', {
      current: room.index + 1,
      total: room.questionCount,
    });
    // 內建題只送 id，文字在各自的語言裡查；自訂題沒辦法翻譯，原樣顯示
    el.questionText.textContent = questionText(room.question);

    var canAnswer = !locked && (state.role === 'player' || room.hostPlays);
    el.oxButtons.hidden = state.role === 'host' && !room.hostPlays;
    el.answerO.disabled = !canAnswer;
    el.answerX.disabled = !canAnswer;
    el.answerO.setAttribute('aria-pressed', String(mine === 'O'));
    el.answerX.setAttribute('aria-pressed', String(mine === 'X'));

    if (locked) el.answerHint.textContent = mine ? t('answerHintLocked') : t('answerHintMissed');
    else el.answerHint.textContent = t('answerHintOpen');

    el.tally.hidden = !locked;
    if (locked) renderTally(room);

    startCountdown(room, locked);

    var last = room.index + 1 >= room.questionCount;
    el.nextQuestion.hidden = !(isHost && locked);
    el.nextQuestion.textContent = last ? t('seeResultsButton') : t('nextQuestionButton');
  }

  function questionText(question) {
    if (!question) return '';
    if (question.text) return question.text;
    for (var i = 0; i < BANK.list.length; i += 1) {
      if (BANK.list[i].id === question.id) return BANK.list[i].text;
    }
    return question.id;
  }

  function myAnswer(room) {
    if (!room.tally || !room.tally.voters) return '';
    if (room.tally.voters.O.indexOf(state.clientId) >= 0) return 'O';
    if (room.tally.voters.X.indexOf(state.clientId) >= 0) return 'X';
    return '';
  }

  function renderTally(room) {
    var tally = room.tally || { O: 0, X: 0, voters: { O: [], X: [] } };
    el.tallyOCount.textContent = tally.O;
    el.tallyXCount.textContent = tally.X;
    el.tallyOList.innerHTML = chips(tally.voters ? tally.voters.O : []);
    el.tallyXList.innerHTML = chips(tally.voters ? tally.voters.X : []);
  }

  function chips(ids) {
    var html = '';
    for (var i = 0; i < ids.length; i += 1) {
      var player = playerById(ids[i]);
      if (!player) continue;
      html +=
        '<li class="chip' + (player.id === state.clientId ? ' me' : '') + '">' +
        avatarSvg(player.avatar, 24, player.nickname) +
        '<span class="name">' + escapeHtml(player.nickname) + '</span></li>';
    }
    return html;
  }

  /*
   * 用 id 查人。先查現役名單，查不到就退回結算當下的快照——
   * 結算後離開房間的人不該從結果畫面上消失（結果是靜態紀錄，見 computeResult）。
   */
  function playerById(id) {
    var players = state.room ? state.room.players : [];
    for (var i = 0; i < players.length; i += 1) {
      if (players[i].id === id) return players[i];
    }

    var snapshot = state.room && state.room.result && state.room.result.players;
    if (snapshot && snapshot[id]) {
      return { id: id, nickname: snapshot[id].nickname, avatar: snapshot[id].avatar, online: false };
    }
    return null;
  }

  function answer(value) {
    send({ t: 'answer', index: state.room.index, value: value });
  }

  /* ---------- 倒數 ---------- */

  function startCountdown(room, locked) {
    cancelAnimationFrame(state.frame);

    if (locked || !room.remainingMs) {
      el.countdown.textContent = '0';
      el.timerFill.style.width = '0%';
      el.countdown.classList.remove('urgent');
      el.timerFill.classList.remove('urgent');
      return;
    }

    // 換算成本機時刻之後就自己跑，不用每一幀都問伺服器，也不用跟伺服器對時
    state.deadlineAt = Date.now() + room.remainingMs;

    /*
     * 分母用伺服器給的「每題總長」，**不要**用收到當下的 remainingMs。
     *
     * 每有一個人作答就會廣播一次 state，這裡也就跟著重跑一次。拿當下的剩餘時間當分母的話，
     * 每次廣播進度條都會跳回滿格再重新縮——看起來就像倒數被人按了重置。
     */
    var total = room.questionMs || 10000;

    (function tick() {
      var left = Math.max(0, state.deadlineAt - Date.now());
      el.countdown.textContent = String(Math.ceil(left / 1000));
      el.timerFill.style.width = (left / total) * 100 + '%';

      var urgent = left <= URGENT_MS;
      el.countdown.classList.toggle('urgent', urgent);
      el.timerFill.classList.toggle('urgent', urgent);

      // 歸零之後不自己切畫面：真正的截止由伺服器判斷，等它廣播 reveal 才換
      if (left > 0) state.frame = requestAnimationFrame(tick);
    })();
  }

  /* ---------- 結果 ---------- */

  function renderResults(room) {
    var result = room.result;
    if (!result) return;

    el.backToRoom.hidden = state.role !== 'host';

    if (!state.resultsReported) {
      track('match_results_shown', { player_count: room.players.length });
      state.resultsReported = true;
    }

    var mine = null;
    for (var i = 0; i < result.groups.length; i += 1) {
      if (result.groups[i].members.indexOf(state.clientId) >= 0) mine = result.groups[i];
    }

    /*
     * 沒分組的場次「你這一組」＝全場所有人，跟下面的兩兩契合度講的是同一件事，
     * 只是換個排版再說一次。人少的時候真正有用的是「誰跟我最合」，所以這張卡收起來。
     * 主持人選了不作答時他也不在任何一組，一樣收起來。
     */
    el.myGroupCard.hidden = !mine || !result.grouped;
    if (mine && result.grouped) {
      el.myGroupMembers.innerHTML = chips(mine.members);
      el.myGroupTopics.innerHTML = topicList(mine.topics);
      el.myGroupEmpty.hidden = mine.topics.length > 0;
    }

    // 沒分組時補一句說明這場為什麼沒分組，有分組就不用解釋
    el.topPairsHint.hidden = result.grouped;

    // 主持人不作答時他不在 topPairs 裡，改看全場最合的幾對
    var pairs = (result.topPairs && result.topPairs[state.clientId]) || result.topPairsOverall || [];
    el.topPairs.innerHTML = pairList(pairs);
    el.topPairsEmpty.hidden = pairs.length > 0;

    // 全部分組只有真的分了組才有東西可看
    el.allGroupsCard.hidden = !result.grouped;
    if (result.grouped) {
      el.allGroupsHeading.textContent = t('allGroupsHeading');
      el.allGroups.innerHTML = groupBlocks(result);
    }
  }

  function groupBlocks(result) {
    var html = '';
    for (var i = 0; i < result.groups.length; i += 1) {
      html +=
        '<div class="group-block"><h3>' + escapeHtml(t('groupName', { n: i + 1 })) + '</h3>' +
        '<ul class="chip-list">' + chips(result.groups[i].members) + '</ul>' +
        '<ul class="topic-list">' + topicList(result.groups[i].topics) + '</ul></div>';
    }
    if (result.skipped.length) {
      html += '<p class="hint">' + escapeHtml(t('skippedNote', { n: result.skipped.length })) + '</p>';
    }
    return html;
  }

  function topicList(topics) {
    var html = '';
    for (var i = 0; i < topics.length; i += 1) {
      var topic = topics[i];
      var player = topic.dissenter ? playerById(topic.dissenter) : null;
      html +=
        '<li class="topic"><span class="ox-mark"><svg><use href="#mark-' +
        (topic.value === 'O' ? 'o' : 'x') + '" /></svg></span>' +
        '<span class="text">' + escapeHtml(questionTextById(topic.questionId)) +
        '<span class="note">' +
        escapeHtml(player
          ? t('dissenterNote', { name: player.nickname })
          : t(topic.value === 'O' ? 'topicAgree' : 'topicDisagree')) +
        '</span></span></li>';
    }
    return html;
  }

  function questionTextById(id) {
    for (var i = 0; i < BANK.list.length; i += 1) {
      if (BANK.list[i].id === id) return BANK.list[i].text;
    }
    // 自訂題的文字在房間的題目清單裡
    var questions = state.room && state.room.question ? [state.room.question] : [];
    for (var j = 0; j < questions.length; j += 1) {
      if (questions[j].id === id) return questions[j].text;
    }
    return id;
  }

  /*
   * 每一列是一個可以展開的 <details>：收合時只有「誰 + 百分比」，
   * 展開才列出題數與那幾題是什麼。不展開直接全列的話，三個人就是三十幾行，
   * 要捲很久才看得到自己最合的是誰——而那才是這張卡要回答的問題。
   *
   * 收合時給百分比而不是「8 / 10 題一樣」：漏答的題目不列入比對，所以每一列的
   * 分母可能不一樣，直接排原始題數的話 6 / 8 會看起來輸給 8 / 10 之外的任何東西，
   * 要心算才知道誰高。百分比跟排序用的是同一個比例，由上往下一定是遞減的。
   * 原始題數沒有不見，它在展開的第一行。
   */
  function pairList(pairs) {
    var html = '';
    for (var i = 0; i < pairs.length; i += 1) {
      var row = pairs[i];
      var shared = row.shared || [];
      html +=
        '<li><details class="pair"><summary>' + CHEVRON +
        chips(row.players).replace(/<li /g, '<span ').replace(/<\/li>/g, '</span>') +
        '<span class="score">' + escapeHtml(t('pairPercent', { percent: row.percent })) +
        '</span></summary>' +
        '<p class="pair-count">' +
        escapeHtml(t('pairSame', { same: row.same, common: row.common })) + '</p>' +
        (shared.length
          ? '<ul class="topic-list">' + topicList(shared) + '</ul>'
          : '<p class="empty">' + escapeHtml(t('noSharedAnswers')) + '</p>') +
        '</details></li>';
    }
    return html;
  }

  /* ---------- 分享 ---------- */

  /*
   * 用 location.origin，不要用 CFG.siteOrigin。
   *
   * 寫死正式網域的話，本機與區網測試時手機掃了 QR code 會被送去線上（還沒部署就是 404），
   * 根本測不了多人。用當下的來源則三種情境都對：本機留在 localhost、
   * 區網留在 192.168.x.x、正式站上 location.origin 本來就等於 siteOrigin。
   */
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

  /*
   * 設計系統元件的行為（design/brand-exploration.html）：
   *  - 房號四格：打一個字跳下一格、刪除退回上一格、貼上整組自動分格；組起來寫進隱藏的 #join-code
   *  - 數量增減：2～30，寫進隱藏的 #max-players
   *  - 分享：手機支援 navigator.share 才出現
   */
  function bindDesignControls() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#code-boxes input'));
    var sync = function () {
      el.joinCode.value = boxes.map(function (b) { return b.value; }).join('');
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
        if (event.key === 'Enter') el.joinRoom.click();
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
      var value = Math.min(30, Math.max(2, (Number(el.maxPlayers.value) || 10) + Number(button.dataset.step)));
      el.maxPlayers.value = String(value);
      out.textContent = String(value);
    });

    var share = document.getElementById('share-link');
    if (navigator.share) {
      share.hidden = false;
      share.addEventListener('click', function () {
        navigator.share({ title: document.title, url: shareLink() }).catch(function () {
          /* 使用者取消分享，不用做什麼 */
        });
      });
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareLink()).then(function () {
      // 只換字，不換掉前面的圖示
      var label = el.copyLink.querySelector('.label') || el.copyLink;
      label.textContent = t('copiedLabel');
      setTimeout(function () {
        label.textContent = t('copyLink');
      }, 1500);
    });
  }

  /* ---------- 離開 ---------- */

  function onKick(event) {
    var button = event.target.closest('[data-kick]');
    if (button) send({ t: 'kick', playerId: button.dataset.kick });
  }

  function confirmExit() {
    if (el.confirmDialog.open) el.confirmDialog.close();
    var isHost = state.role === 'host';
    el.confirmTitle.textContent = isHost ? t('confirmCloseTitle') : t('confirmLeaveTitle');
    el.confirmDesc.textContent = isHost ? t('confirmCloseDesc') : t('confirmLeaveDesc');
    el.confirmOk.textContent = isHost ? t('confirmCloseOk') : t('confirmLeaveOk');

    el.confirmOk.onclick = function () {
      el.confirmDialog.close();
      state.closing = true;
      send({ t: isHost ? 'close' : 'leave' });
      if (isHost) track('match_room_closed');
      backHome();
    };
    el.confirmDialog.showModal();
  }

  // 用 replace 不用 href：退出之後按返回鍵不該又被拉回剛剛離開的房間
  function backHome() {
    location.replace(CFG.base + '/' + CFG.lang + '/');
  }

  /*
   * 遊戲內頂欄的返回鍵（game.js 會呼叫這個）：
   *  - 首頁畫面：回網站的「找遊戲」
   *  - 出題、填暱稱：跟瀏覽器返回鍵一樣退一格（onPopState 會處理）
   *  - 房間裡：跟「離開／關閉房間」同一個確認框
   *  - 錯誤畫面：回這個遊戲的首頁
   */
  // 頂欄的「設定」（game.js 呼叫）：首頁畫面是先準備題目，大廳裡是主持人改題目
  window.openSettings = function () {
    if (state.view === 'setup') return;
    showSetup();
  };

  window.gameBack = function () {
    if (state.view === 'home') location.href = '/' + CFG.lang + '/games/';
    else if (state.view === 'room') confirmExit();
    else if (state.view === 'error') backHome();
    else history.back();
  };

  /* ---------- 瀏覽器返回鍵 ---------- */

  /*
   * 每往前一頁（出題、填暱稱、房間）就推一格 history，返回鍵才不會一步跳出整個網站。
   * 從房間退回來的行為分兩種：
   *
   *  - 還在大廳：直接離開房間（主持人是關房），一次退回首頁畫面。
   *  - 遊戲已經開始：先跳跟「離開房間 / 關閉房間」同一個確認框，確定了才回首頁，
   *    免得手機上手滑一劃就把一場正在進行的遊戲滑掉。
   */
  var rewinding = false; // 自己呼叫 history.go() 造成的那一次 popstate

  function initHistory() {
    // 基準那一格固定是首頁：網址先把 ?room= 拿掉，退回來重整才不會又被拉進房間
    var home = new URL(location.href);
    home.searchParams.delete('room');
    history.replaceState({ view: 'home', i: 0 }, '', home.toString());
    state.depth = 0;
    state.entry = 'home';
    window.addEventListener('popstate', onPopState);
  }

  // url 不給就沿用目前的網址（出題頁、以及從房間按「改題目」進來的情況）
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

    quietLeave();
    rewindHome(index);
  }

  // 房間可能疊在出題、填暱稱上面，一次退到首頁那一格，不要一格一格問
  function rewindHome(index) {
    if (index > 0) {
      rewinding = true;
      history.go(-index);
      return;
    }
    showView('home');
  }

  // 離開房間但留在同一頁（返回鍵專用，backHome 是整頁換掉）
  function quietLeave() {
    var isHost = state.role === 'host';
    if (isHost) track('match_room_closed');
    send({ t: isHost ? 'close' : 'leave' });
    resetRoom();
  }

  // 回到首頁畫面＝下一場從頭來過，這一場的旗標全部歸零（選好的題目留著，通常還想再玩一次）
  function resetRoom() {
    clearTimeout(state.reconnectTimer);
    cancelAnimationFrame(state.frame);
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
    state.joinReported = false;
    state.resultsReported = false;
    state.settingsSynced = false;
    state.deadlineAt = 0;
    hideBanner();
  }

  function closeDialogs() {
    [el.confirmDialog, el.closedDialog, el.kickedDialog].forEach(function (dialog) {
      if (dialog.open) dialog.close();
    });
  }

  /* ---------- 畫面切換與小工具 ---------- */

  function showView(name) {
    state.view = name;
    el.viewHome.hidden = name !== 'home';
    el.viewSetup.hidden = name !== 'setup';
    el.viewJoin.hidden = name !== 'join';
    el.viewRoom.hidden = name !== 'room';
    el.viewError.hidden = name !== 'error';

    // 四個畫面共用同一個網址，page_view 靠自動送只會記到一筆，
    // 分不出多少人真的開了房間，所以在這裡手動送
    // 遊戲內頂欄（Woohop 的 game.css）：進了房間就是 play（藏起玩法分頁、選單、頁尾，遊戲名不能點），其他畫面是 browse
    // 房間裡的主持人點齒輪改題目，那也還是在房間裡：頂欄維持房間的樣子（返回＝回房間、沒有玩法分頁可以點出去）
    var inRoom = name === 'room' || (name === 'setup' && isOpen());
    document.body.setAttribute('data-game-mode', inRoom ? 'play' : 'browse');
    // 齒輪只給大廳裡的主持人。從設定按返回回到房間時不會重畫房間，所以在這裡也要判斷一次
    var canSet = name === 'room' && state.role === 'host' && state.room && state.room.status === 'lobby';
    if (canSet) document.body.setAttribute('data-game-settings', '');
    else document.body.removeAttribute('data-game-settings');
    var gameTitle = document.querySelector('.game-bar .title');
    if (gameTitle) gameTitle.tabIndex = inRoom ? -1 : 0;
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

  /*
   * 事件只在「做那個動作的那台裝置」上送。狀態是廣播給全場的，照著狀態送的話，
   * 一場 10 個人的遊戲會把同一個事件記 10 次。前綴一律 match_（阿瓦隆是 avalon_、
   * 搶答是 buzzer_）——整個系列共用一個 GA4 資源，沒有前綴就分不出是哪個遊戲的。
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
