/*
 * 遊戲內頂欄的行為（各遊戲共用，HTML 是 src/chrome.mjs 的 gameBar()、樣式在 game.css）。
 *
 * 遊戲可以提供兩個掛勾：
 *   window.gameBack()      按返回鍵時做什麼（例如進行中先跳確認）；沒給就連到返回鍵的 data-href
 *   window.openSettings()  按「設定」時打開設定框；沒給（例如在玩法頁）就帶 #settings 回遊戲頁
 * 玩的時候遊戲把 <body data-game-mode> 設成 "play"，分頁和選單就會藏起來、遊戲名不能點（game.css）。
 */
(function () {
  'use strict';

  var bar = document.querySelector('.game-bar');
  if (!bar) return;

  // 返回鍵
  var back = document.getElementById('game-back');
  if (back) {
    back.addEventListener('click', function () {
      if (typeof window.gameBack === 'function') window.gameBack();
      else location.href = back.getAttribute('data-href');
    });
  }

  // 「設定」
  var settings = document.getElementById('game-settings');
  if (settings) {
    settings.addEventListener('click', function () {
      if (typeof window.openSettings === 'function') window.openSettings();
      else location.href = settings.getAttribute('data-game-href') + '#settings';
    });
  }

  // 音樂開關（有配樂的遊戲才有）：開或關由遊戲處理，也由遊戲把結果寫回 aria-pressed
  var music = document.getElementById('game-music');
  if (music) {
    music.addEventListener('click', function () {
      if (typeof window.toggleMusic === 'function') window.toggleMusic();
    });
  }

  // 頂欄放不下時分兩段讓位，讓遊戲名不被截掉：先把「設定」換成齒輪（is-compact），還是放不下再把「玩法」換成書本（is-tight）。
  // 看的是遊戲名有沒有被截，不是固定寬度：中文等短的語言放得下，就維持文字
  var title = bar.querySelector('.title');
  if (title && window.ResizeObserver) {
    var cut = function () { return title.scrollWidth > title.clientWidth + 1; };
    var fit = function () {
      bar.classList.remove('is-compact', 'is-tight');
      if (cut() && settings) bar.classList.add('is-compact');
      if (cut()) bar.classList.add('is-tight');
    };
    new ResizeObserver(fit).observe(bar);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // 選單鍵：電腦上不攔，讓 site.js 當成一般下拉開關；手機上攔下來改開底部面板
  var sheet = document.getElementById('game-sheet');
  var menu = document.getElementById('game-menu');
  if (sheet && menu) {
    menu.addEventListener('click', function (e) {
      if (!window.matchMedia('(max-width: 640px)').matches) return;
      if (typeof sheet.showModal !== 'function') return;
      e.stopPropagation();
      sheet.showModal();
      sheet.focus();
    });
    // 每條關閉路徑自己關（不靠 dialog 的 close 事件，那個在部分 WebView 不會發）：點旁邊、點連結、往下拉
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close();
    });
    swipeToClose(sheet);
  }

  /*
   * 底部面板往下拉就關（2026-10-23 拿掉「關閉」鍵，改成點旁邊或往下拉）。
   * 手指跟著拉下去，放開時超過 80px 才關，不然彈回原位。site.js（導覽列的面板）、阿瓦隆的 GameBar.jsx 各有一份一樣的
   */
  function swipeToClose(panel) {
    var y0 = null;
    var dy = 0;
    panel.addEventListener('touchstart', function (e) {
      if (panel.scrollTop > 0) return; // 面板自己在捲的時候不攔
      y0 = e.touches[0].clientY;
      dy = 0;
      panel.style.transition = 'none';
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      panel.style.transform = dy ? 'translateY(' + dy + 'px)' : '';
    }, { passive: true });
    var end = function () {
      if (y0 === null) return;
      y0 = null;
      panel.style.transition = '';
      panel.style.transform = '';
      if (dy > 80) panel.close();
    };
    panel.addEventListener('touchend', end);
    panel.addEventListener('touchcancel', end);
  }
})();

/*
 * 帶領元件 window.Leader（2026-10-21 從竹筍竹筍蹦蹦出抽出來，定時炸彈也用）。樣式在 game.css 的「帶領元件」那一節。
 * 共用文字（STEP n / total、真心話／大冒險、拉一下）在首頁 src/locales.mjs，各遊戲 build 時已嵌成 window.WOOHOP.t。
 * 之後也打算拆成獨立的小工具（桌遊助手／小工具分頁），所以這裡不碰任何遊戲自己的狀態。
 *
 *   Leader.lead(slotEl, { index, total, title, say })
 *       步驟頭只有一份：第一次呼叫時建立，之後每次搬進目前畫面的 slotEl（.lead-slot），填上這一步的內容。
 *       say 可以是字串，或 function (node) {…} 自己往 node 裡加節點（例如名稱用 <mark> 標起來）
 *   Leader.hideSay(bool)    把照著念收起來（例如取名開始後就不需要）
 *   Leader.ruleCards(listEl, cards, arts)   說明規則的插圖卡：cards 是 [[標題, 說明]]，arts 是回傳 SVG 內容的函式
 *   Leader.slot(rootEl, { prompts, actions, onPull, onLand, sound })  真心話大冒險拉霸，回傳 { reset() }。onPull 開始轉、onLand 停下來
 *       sound：可選，回傳 true／false 的函式，遊戲的聲音開關關著時拉霸也不出聲
 */
(function () {
  'use strict';

  var t = (window.WOOHOP && window.WOOHOP.t) || {};
  var fill = function (s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  };
  var make = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  // ---------- 步驟頭 ----------
  var head = null;
  var parts = {};

  function lead(slotEl, opts) {
    if (!head) {
      head = make('section', 'lead-head');
      parts.dots = make('div', 'step-dots');
      parts.dots.setAttribute('aria-hidden', 'true');
      parts.no = make('span', 'step-no');
      parts.title = make('h2', 'lead-title');
      var card = make('div', 'prompt-card lead-say');
      card.appendChild(make('span', 'say', t.sayLabel || ''));
      parts.say = make('span');
      card.appendChild(parts.say);
      head.appendChild(parts.dots);
      head.appendChild(parts.no);
      head.appendChild(parts.title);
      head.appendChild(card);
    }
    if (slotEl && head.parentNode !== slotEl) slotEl.appendChild(head);

    parts.dots.textContent = '';
    for (var i = 0; i < opts.total; i += 1) {
      parts.dots.appendChild(make('i', i === opts.index ? 'on' : i < opts.index ? 'done' : ''));
    }
    parts.no.textContent = fill(t.leadStep || 'STEP {n} / {total}', { n: opts.index + 1, total: opts.total });
    parts.title.textContent = opts.title;
    parts.say.textContent = '';
    if (typeof opts.say === 'function') opts.say(parts.say);
    else parts.say.textContent = opts.say || '';
    head.classList.remove('no-say');
    return head;
  }

  function hideSay(on) {
    if (head) head.classList.toggle('no-say', Boolean(on));
  }

  // ---------- 說明規則的插圖卡 ----------
  function ruleCards(listEl, cards, arts) {
    listEl.textContent = '';
    cards.forEach(function (c, i) {
      var li = make('li', 'rule-card');
      var art = arts && arts[i];
      li.innerHTML = '<svg class="illo" viewBox="0 0 160 126" aria-hidden="true">' + (art ? art() : '') + '</svg>';
      var body = make('div');
      body.appendChild(make('h3', '', c[0]));
      body.appendChild(make('p', '', c[1]));
      li.appendChild(body);
      listEl.appendChild(li);
    });
  }

  // ---------- 音效（拉霸的喀喀聲與停下來那一聲） ----------
  // 自己一個 AudioContext：遊戲有沒有配樂都能用。只在「拉一下」那個點擊裡建立，避開自動播放限制
  var audio = null;
  function ctx() {
    try {
      if (!audio) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        audio = new C();
      }
      if (audio.state === 'suspended') audio.resume();
      return audio;
    } catch (e) {
      return null;
    }
  }
  function blip(c, t0, freq, peak, decay, type) {
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + decay + 0.05);
  }
  function woodblock(c, t0, high) {
    blip(c, t0, high ? 1050 : 820, 0.3, 0.09);
    blip(c, t0, high ? 2100 : 1640, 0.06, 0.04, 'triangle');
  }
  function land(c) {
    var t0 = c.currentTime + 0.01;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.frequency.setValueAtTime(150, t0);
    osc.frequency.exponentialRampToValueAtTime(45, t0 + 0.14);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.3);
    blip(c, t0, 1568, 0.12, 0.25, 'square');
  }

  // ---------- 真心話大冒險拉霸 ----------
  /*
   * 題目在窗格裡往上滾，越滾越慢，停在中間那一格。
   * 捲軸是「題目清單重複 loops 遍」排成一長條：每次拉都先瞬間跳回第二遍裡現在那一題（看起來沒動），
   * 再用一次 transition 滾到最後一遍裡選中的題目。只動 transform，手機上也順。
   * 收尾用計時器、不用 transitionend：內嵌瀏覽器可能把 transition 凍住，事件永遠不來。
   *
   * 拉之前選真心話（只滾問題）／隨機／大冒險（只滾動作）；reset() 會回到「隨機」，
   * 因為選的是輸的那個人，每一輪都該由他自己決定。
   */
  var SLOT_MS = 2600;
  var slotSeq = 0;

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function slot(rootEl, opts) {
    var all = shuffle(
      opts.prompts.map(function (text) { return { kind: 'ask', text: text }; })
        .concat(opts.actions.map(function (text) { return { kind: 'do', text: text }; }))
    );
    var labels = { ask: t.slotAsk, mix: t.slotMix, do: t.slotDo };
    var name = 'leader-slot-' + (slotSeq += 1);
    var st = { mode: 'mix', items: all, loops: 3, index: 0, spinning: false, id: 0, row: 0 };

    rootEl.textContent = '';
    rootEl.classList.add('leader-slot');
    var modes = make('div', 'seg seg-3 slot-mode');
    modes.setAttribute('role', 'radiogroup');
    modes.setAttribute('aria-label', t.slotModeLabel || '');
    var inputs = {};
    ['ask', 'mix', 'do'].forEach(function (mode) {
      var label = make('label', 'seg-item');
      var input = make('input');
      input.type = 'radio';
      input.name = name;
      input.value = mode;
      input.addEventListener('change', function () {
        if (!st.spinning) setMode(mode);
      });
      label.appendChild(input);
      label.appendChild(make('span', '', labels[mode]));
      modes.appendChild(label);
      inputs[mode] = input;
    });
    var box = make('div', 'slot');
    var win = make('div', 'slot-window');
    win.setAttribute('aria-hidden', 'true');
    var reel = make('ul', 'slot-reel');
    win.appendChild(reel);
    box.appendChild(win);
    // 停下來的題目另外寫進這裡給螢幕閱讀器念，滾動中的那一長串藏起來
    var result = make('p', 'slot-sr');
    result.setAttribute('aria-live', 'polite');
    var pull = make('button', 'btn btn-lg btn-solid btn-block', t.slotPull);
    pull.type = 'button';
    rootEl.appendChild(modes);
    rootEl.appendChild(box);
    rootEl.appendChild(result);
    rootEl.appendChild(pull);

    function setMode(mode) {
      st.mode = mode;
      inputs[mode].checked = true;
      st.items = mode === 'mix' ? all : all.filter(function (item) { return item.kind === mode; });
      // 至少滾過 40 格才有拉霸的感覺，格子少就多重複幾遍
      st.loops = Math.max(3, Math.ceil(40 / st.items.length) + 2);
      build();
    }

    function build() {
      reel.textContent = '';
      for (var loop = 0; loop < st.loops; loop += 1) {
        st.items.forEach(function (item) {
          var li = make('li', 'slot-' + item.kind);
          li.appendChild(make('span', 'slot-kind', labels[item.kind]));
          li.appendChild(make('span', 'slot-text', item.text));
          reel.appendChild(li);
        });
      }
      st.index = Math.floor(Math.random() * st.items.length);
      place(rest(st.index), false);
    }

    // 停著的時候用第二遍裡的那一列：上下都有鄰居，窗格不會露出空白
    function rest(index) {
      return st.items.length + index;
    }

    // 第 row 列放到窗格正中間。列高從畫面量，字級或語言改了也不用跟著改數字
    function place(row, animate) {
      var first = reel.children[0];
      st.row = (first && first.offsetHeight) || st.row;
      reel.style.transition = animate ? 'transform ' + SLOT_MS + 'ms cubic-bezier(.12,.75,.2,1)' : 'none';
      reel.style.transform = 'translateY(' + -(row - 1) * st.row + 'px)';
      Array.prototype.forEach.call(reel.children, function (li, i) {
        li.classList.toggle('on', !animate && i === row);
      });
    }

    // 每經過一題「喀」一聲，跟著減速變稀（1-(1-p)^3 近似 CSS 的 ease-out），最多 30 聲
    // opts.sound()：遊戲自己的聲音開關（例如定時炸彈頂欄的音符鍵），關著就不出聲
    var soundOn = function () { return !opts.sound || opts.sound(); };

    function ticks(rows) {
      if (!soundOn()) return;
      var c = ctx();
      if (!c) return;
      var start = c.currentTime + 0.02;
      var every = Math.max(1, Math.ceil(rows / 30));
      for (var k = every; k <= rows; k += every) {
        var p = 1 - Math.cbrt(1 - k / rows);
        woodblock(c, start + p * (SLOT_MS / 1000) * 0.95, (k / every) % 2 === 0);
      }
    }

    pull.addEventListener('click', function () {
      if (st.spinning) return;
      st.spinning = true;
      pull.disabled = true;
      box.classList.add('is-spinning');
      modes.classList.add('is-locked');

      var len = st.items.length;
      var chosen = Math.floor(Math.random() * len);
      // 不要停在跟上一次同一題：拉了卻好像沒動，會以為壞掉
      if (len > 1 && chosen === st.index) chosen = (chosen + 1 + Math.floor(Math.random() * (len - 1))) % len;

      place(rest(st.index), false);
      void reel.offsetHeight; // 先讓瀏覽器畫好起點，下面那次才會有動畫
      var target = (st.loops - 1) * len + chosen;
      place(target, true);
      ticks(target - rest(st.index));
      result.textContent = '';

      st.id = setTimeout(function () {
        st.index = chosen;
        place(rest(chosen), false);
        box.classList.remove('is-spinning');
        modes.classList.remove('is-locked');
        var item = st.items[chosen];
        result.textContent = labels[item.kind] + '：' + item.text;
        pull.textContent = t.slotPullAgain;
        pull.disabled = false;
        st.spinning = false;
        var c = soundOn() && ctx();
        if (c) land(c);
        if (opts.onLand) opts.onLand();
      }, SLOT_MS + 50);
      if (opts.onPull) opts.onPull({ kind: st.items[chosen].kind, mode: st.mode });
    });

    function reset() {
      clearTimeout(st.id);
      if (st.spinning && opts.onLand) opts.onLand();
      st.spinning = false;
      pull.disabled = false;
      pull.textContent = t.slotPull;
      box.classList.remove('is-spinning');
      modes.classList.remove('is-locked');
      result.textContent = '';
      setMode('mix');
    }

    setMode('mix');
    return { reset: reset };
  }

  window.Leader = { lead: lead, hideSay: hideSay, ruleCards: ruleCards, slot: slot };
})();

/*
 * 帶領元件的第二部分：選主題（Leader.themes）與抽卡取名（Leader.namer）。
 * 2026-10-21 從竹筍竹筍蹦蹦出抽出來，之後的暖場遊戲都可以用。名稱庫在首頁 src/name-pools.mjs，
 * 各遊戲 build 時把當頁語言的那一份嵌進頁面（{ themes, groups }）傳進來。文字在 window.WOOHOP.t。
 *
 *   Leader.themes(gridEl, { pool, value, realname, onChange })
 *       「隨機」＋名稱庫的每個主題（＋「用本名」，realname 為 true 時）。回傳 { set(value) }
 *   Leader.randomTheme(pool, except)   從名稱庫隨機挑一個主題
 *   Leader.themeLabel(id)              主題的顯示名稱
 *   Leader.namer(rootEl, { pool, session, minPlayers, onChange, onDone })
 *       手機傳一圈，每個人抽一個名稱或自己大聲說。session 是遊戲自己存的這一局
 *       { theme, random, names: [], own: [] }，namer 直接改它，改完呼叫 onChange（遊戲存檔）。
 *       人數夠了按「大家都取好了」呼叫 onDone。回傳 { render(), reset(), stage() }
 */
(function () {
  'use strict';

  var t = (window.WOOHOP && window.WOOHOP.t) || {};
  var W = window.Woohop;
  var fill = function (s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  };
  var make = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  var button = function (cls, text) {
    var b = make('button', 'btn ' + cls, text);
    b.type = 'button';
    return b;
  };
  var pick = function (list) {
    return list[Math.floor(Math.random() * list.length)];
  };

  function themeLabel(id) {
    return t['theme' + id.charAt(0).toUpperCase() + id.slice(1)] || id;
  }

  function randomTheme(pool, except) {
    return pick(pool.themes.filter(function (id) { return id !== except; }));
  }

  // ---------- 選主題 ----------
  // 按鈕只建一次，之後 set() 就地更新：焦點不會跟著被刪掉的節點消失
  function themes(gridEl, opts) {
    var items = [{ id: 'random', name: t.themeRandom, sub: t.themeRandomSub, color: 'c-yellow' }];
    opts.pool.themes.forEach(function (id) {
      var groups = opts.pool.groups[id];
      items.push({ id: id, name: themeLabel(id), sub: fill(t.themeExample, { a: groups[0][0], b: groups[1][0] }), color: 'c-mint' });
    });
    if (opts.realname) items.push({ id: 'realname', name: t.themeRealname, sub: t.themeRealnameSub, color: 'c-blue' });

    var buttons = {};
    gridEl.textContent = '';
    gridEl.classList.add('theme-grid');
    items.forEach(function (item) {
      var b = make('button', 'choice theme-choice ' + item.color);
      b.type = 'button';
      b.appendChild(make('span', 'choice-name', item.name));
      b.appendChild(make('span', 'choice-sub', item.sub));
      b.addEventListener('click', function () {
        set(item.id);
        if (opts.onChange) opts.onChange(item.id);
      });
      gridEl.appendChild(b);
      buttons[item.id] = b;
    });

    function set(value) {
      Object.keys(buttons).forEach(function (id) {
        buttons[id].setAttribute('aria-pressed', String(id === value));
      });
    }
    set(opts.value);
    return { set: set };
  }

  // ---------- 一疊名稱卡的插圖 ----------
  /*
   * 三張卡疊著、左右兩張歪一點，最上面那張寫「?」。畫法照網站插圖（woohop-art.js 的 body）。
   * 最上面那張包在 .deck-top 裡，抽的時候只有它飛走（game.css 的 .deck.is-drawing）。
   */
  function deckArt() {
    var card = function (x, y, color, angle) {
      return '<g transform="rotate(' + angle + ' ' + (x + 27) + ' ' + (y + 36) + ')">' +
        W.body('<rect x="' + x + '" y="' + y + '" width="54" height="72" rx="9"/>', color) + '</g>';
    };
    return W.ground + W.burst(138, 24, '#FFC628') + W.ring(22, 34, '#7489E6') + W.plus(142, 92, '#EE7B6A') + W.dot(20, 92, '#4FB59A') +
      card(36, 34, '#FFC628', -14) + card(70, 34, '#aebcf3', 12) +
      '<g class="deck-top">' + card(53, 28, '#4FB59A', 0) +
      '<path d="M72 54q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ' + W.K + '/>' +
      '<circle cx="80" cy="80" r="3.4" fill="#22222c"/></g>';
  }

  // ---------- 抽卡取名 ----------
  /*
   * 同一張卡片有三個狀態（data-stage）：choose 選抽或自己取 → own 自己大聲說 → reveal 翻出名稱。
   * - 名稱庫一項可以是一組聽起來很像的名稱，同一局只會抽到其中一個（freeGroups）
   * - 自己取不打字（打字會讓整圈卡住），記成「自己取 N」
   * - 「大家都取好了」不黏底：手機傳來傳去時拇指很容易碰到畫面底部
   */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function namer(rootEl, opts) {
    var s = opts.session;
    var stage = 'choose';
    var draft = null;
    var drawing = false;

    // ---- DOM ----
    rootEl.textContent = '';
    rootEl.classList.add('namer');
    var card = make('div', 'panel name-card');
    var top = make('div', 'name-top');
    var turn = make('span', 'name-turn');
    var badge = make('span', 'badge b-live name-theme');
    top.appendChild(turn);
    top.appendChild(badge);
    var reroll = button('btn-sm btn-secondary reroll', t.rerollTheme);

    var choose = make('div', 'name-stage stage-choose');
    var deck = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    deck.setAttribute('class', 'illo deck');
    deck.setAttribute('viewBox', '0 0 160 126');
    deck.setAttribute('aria-hidden', 'true');
    deck.innerHTML = deckArt();
    var draw = button('btn-lg btn-solid btn-block draw-btn', t.drawButton);
    var empty = make('p', 'hint pool-empty', t.poolEmpty);
    var ownOpen = button('btn-secondary btn-block', t.ownButton);
    choose.appendChild(deck);
    choose.appendChild(draw);
    choose.appendChild(empty);
    choose.appendChild(ownOpen);

    var ownStage = make('div', 'name-stage stage-own');
    var ownSay = make('div', 'prompt-card own-say');
    ownSay.appendChild(make('span', 'say', t.sayLabel));
    ownSay.appendChild(document.createTextNode(t.ownSay));
    var ownRow = make('div', 'pass-row');
    var ownConfirm = button('btn-lg btn-solid pass-bar', t.passNext);
    var ownCancel = button('btn-lg btn-secondary pass-bar pass-redraw', t.ownCancel);
    ownRow.appendChild(ownConfirm);
    ownRow.appendChild(ownCancel);
    ownStage.appendChild(ownSay);
    ownStage.appendChild(ownRow);

    var reveal = make('div', 'name-stage stage-reveal');
    var drawn = make('div', 'drawn-card');
    drawn.appendChild(make('p', 'you-are', t.youAre));
    var drawnName = make('p', 'drawn-name');
    drawnName.setAttribute('aria-live', 'polite');
    drawn.appendChild(drawnName);
    var revealRow = make('div', 'pass-row');
    var passNext = button('btn-lg btn-solid pass-bar', t.passNext);
    var redraw = button('btn-lg btn-secondary pass-bar pass-redraw', t.redraw);
    revealRow.appendChild(passNext);
    revealRow.appendChild(redraw);
    reveal.appendChild(drawn);
    // 手機要交出去：明講下一步，不然拿著手機的人會愣在那裡
    reveal.appendChild(make('p', 'reveal-hint', t.revealHint));
    reveal.appendChild(revealRow);

    card.appendChild(top);
    card.appendChild(reroll);
    card.appendChild(choose);
    card.appendChild(ownStage);
    card.appendChild(reveal);

    var named = make('section', 'named');
    named.appendChild(make('h2', 't-small', t.namedHeading));
    var namedList = make('ul', 'named-list');
    named.appendChild(namedList);
    var needMore = make('p', 'form-error need-more');
    needMore.setAttribute('role', 'status');
    var allDone = button('btn-lg btn-secondary btn-block all-done', t.allDone);

    rootEl.appendChild(card);
    rootEl.appendChild(named);
    rootEl.appendChild(needMore);
    rootEl.appendChild(allDone);

    // ---- 狀態 ----
    var norm = function (name) { return String(name).trim().toLowerCase(); };
    var isTaken = function (name) {
      var n = norm(name);
      return s.names.some(function (other) { return norm(other) === n; });
    };

    // 還能抽的組：已經被取走的名稱所在的那一組整組不能再抽；現在翻開的那一組也排除，「換一個」才一定會換
    function freeGroups() {
      return (opts.pool.groups[s.theme] || []).filter(function (group) {
        if (draft && group.indexOf(draft) !== -1) return false;
        return !group.some(isTaken);
      });
    }

    function drawName() {
      var free = freeGroups();
      return free.length ? pick(pick(free)) : null;
    }

    // 「自己取 N」：從 1 往上找第一個還沒用過的號碼，中間刪掉一個也不會撞號
    function ownSlot() {
      for (var n = 1; ; n += 1) {
        var name = fill(t.ownSlot, { n: n });
        if (s.own.indexOf(name) === -1) return name;
      }
    }

    function setStage(next) {
      stage = next;
      card.setAttribute('data-stage', next);
    }

    function changed() {
      if (opts.onChange) opts.onChange(stage);
    }

    function render() {
      turn.textContent = fill(t.nameTurn, { n: s.names.length + 1 });
      badge.textContent = fill(t.nameTheme, { theme: themeLabel(s.theme) });
      // 「換一個主題」只在隨機、而且還沒有人取名的時候：有人取了再換，前面那些人的名稱就跟主題對不上了
      reroll.hidden = !(s.random && s.names.length === 0 && stage === 'choose');

      var none = stage === 'choose' && freeGroups().length === 0;
      draw.hidden = none;
      empty.hidden = !none;

      namedList.textContent = '';
      s.names.forEach(function (name) {
        var li = make('li', 'named-chip');
        li.appendChild(make('span', '', name));
        var remove = make('button', 'chosen-remove', '✕');
        remove.type = 'button';
        remove.setAttribute('aria-label', fill(t.removeName, { name: name }));
        remove.addEventListener('click', function () {
          s.names = s.names.filter(function (other) { return other !== name; });
          s.own = s.own.filter(function (other) { return other !== name; });
          render();
          changed();
        });
        li.appendChild(remove);
        namedList.appendChild(li);
      });
      named.hidden = s.names.length === 0;

      // 翻開還沒送出的那一個也算：最後一個人抽完直接按「大家都取好了」是很自然的動作
      var count = s.names.length + (stage === 'reveal' || stage === 'own' ? 1 : 0);
      var enough = count >= opts.minPlayers;
      allDone.disabled = !enough;
      allDone.classList.toggle('btn-solid', enough);
      allDone.classList.toggle('btn-secondary', !enough);
      needMore.hidden = enough;
      needMore.textContent = fill(t.allDoneNeed, { n: opts.minPlayers });
    }

    function commit(name, own) {
      s.names.push(name);
      if (own) s.own.push(name);
      draft = null;
      setStage('choose');
      render();
      changed();
      // 下一個人拿到手機時，看到的是「第 N 位」的開頭，不是上一個人捲到一半的地方
      window.scrollTo(0, 0);
    }

    function show(name) {
      draft = name;
      drawnName.textContent = name;
      setStage('reveal');
      render();
      changed();
    }

    // ---- 綁定 ----
    reroll.addEventListener('click', function () {
      s.theme = randomTheme(opts.pool, s.theme);
      render();
      changed();
    });

    // 抽：最上面那張卡先往上飛（約 0.38 秒），飛完才翻牌。動畫期間鎖住，連按不會抽兩張
    draw.addEventListener('click', function () {
      if (drawing) return;
      var name = drawName();
      if (!name) return render();
      if (reduceMotion) return show(name);
      drawing = true;
      draw.disabled = true;
      deck.classList.add('is-drawing');
      // 用計時器而不是 animationend：內嵌瀏覽器可能把動畫凍住，事件永遠不來
      setTimeout(function () {
        drawing = false;
        deck.classList.remove('is-drawing');
        draw.disabled = false;
        show(name);
      }, 380);
    });

    redraw.addEventListener('click', function () {
      var name = drawName();
      if (!name) return; // 抽完了：留著現在這一個
      draft = name;
      drawnName.textContent = name;
      // 換一張：卡片重新翻一次
      drawn.classList.remove('pop');
      drawn.style.animation = 'none';
      void drawn.offsetWidth;
      drawn.style.animation = '';
      drawn.classList.add('pop');
    });

    passNext.addEventListener('click', function () {
      if (draft) commit(draft, false);
    });
    ownOpen.addEventListener('click', function () {
      setStage('own');
      render();
      changed();
    });
    ownConfirm.addEventListener('click', function () {
      commit(ownSlot(), true);
    });
    ownCancel.addEventListener('click', function () {
      setStage('choose');
      render();
      changed();
    });

    // 「大家都取好了」：翻開的、正在自己說的，都先算進去
    allDone.addEventListener('click', function () {
      if (stage === 'reveal' && draft) commit(draft, false);
      else if (stage === 'own') commit(ownSlot(), true);
      if (s.names.length < opts.minPlayers) return;
      if (opts.onDone) opts.onDone();
    });

    function reset(session) {
      if (session) s = session;
      draft = null;
      setStage('choose');
      render();
    }

    reset();
    return {
      render: render,
      reset: reset,
      stage: function () { return stage; },
    };
  }

  window.Leader.themes = themes;
  window.Leader.randomTheme = randomTheme;
  window.Leader.themeLabel = themeLabel;
  window.Leader.namer = namer;
})();

/*
 * 帶領元件之三：節拍器（Leader.metronome）。2026-10-21 為上樓下樓做的，之後果園菜園動物園也會用。
 * beats 拍一組，accents 是重拍（喊的那幾拍）。可調快慢，可開自動加速。
 *
 *   Leader.metronome(rootEl, { bpm, min, max, step, beats, accents, auto, sound, groove, onStart, onStop })
 *       accents：哪幾拍是重拍（從 0 算），預設只有最後一拍。上樓下樓是四拍「1、樓、上、4 樓」，最後一拍是重拍
 *       auto：自動加速一開始就開著（使用者還是可以關）。停下來時自動加上去的速度會歸零，回到按開始時的速度＋中途自己調的
 *       intro：開場口令的詞（例如果園菜園動物園的 ['果園', '菜園', '動物園']）。燈那一排平常先顯示這些字，
 *         按下開始後一拍亮一個詞，喊完才變回圓燈打拍子（跟竹筍的口令同一個樣子）
 *       sound：可選，回傳 true／false，關著就不出聲（燈照樣亮）
 *       groove：true 時多一層配樂（貝斯、鼓、小旋律）。配樂跟拍子分開開關，但踩同一個時鐘、同一個速度，永遠對得上拍
 *       回傳 { start(), stop(), running() } 管拍子；{ music(on), playing() } 管配樂；
 *       配樂音量自動調：打拍子時壓低、停了拉回；background(on) 小聲當背景（上樓下樓的拉霸那步）；duck(on) 再壓低（拉霸在轉）
 *
 * 排程用「音訊時鐘＋往前看」：setInterval 每 25ms 把接下來 0.12 秒的拍子排進音訊時鐘，
 * 主執行緒忙也不會歪拍；燈號用 setTimeout 對齊（差幾十毫秒眼睛看不出來）。
 * 切到背景拍子和配樂都會停（背景的計時器會被節流，拍子會亂掉），回來不自動接著放。
 */
(function () {
  'use strict';

  var t = (window.WOOHOP && window.WOOHOP.t) || {};
  var fill = function (s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  };
  var make = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  var audio = null;
  function ctx() {
    try {
      if (!audio) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        audio = new C();
      }
      if (audio.state === 'suspended') audio.resume();
      return audio;
    } catch (e) {
      return null;
    }
  }

  // 一般拍是木魚聲；重拍低一點、厚一點，加一點拍手的噪音
  function click(c, at, accent, out) {
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 620 : 980, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.55 : 0.35, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + (accent ? 0.16 : 0.08));
    osc.connect(gain);
    gain.connect(out);
    osc.start(at);
    osc.stop(at + 0.2);
    if (!accent) return;
    var len = Math.floor(c.sampleRate * 0.12);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    var src = c.createBufferSource();
    src.buffer = buf;
    var hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    var g2 = c.createGain();
    g2.gain.value = 0.35;
    src.connect(hp);
    hp.connect(g2);
    g2.connect(out);
    src.start(at);
  }

  /*
   * 配樂（opts.groove）：跟著節拍器同一個時鐘、同一個速度排，調快調慢、自動加速都會一起變，不會兩個聲音打架。
   * 貝斯一小節往上走、下一小節往下走（上樓下樓），八分音符的 hi-hat、第一拍大鼓、重拍拍手，
   * 上面再一段兩小節的小旋律（C 大調五聲音階，輕快不刺耳）。
   */
  var G = { C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C4: 261.63, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 };
  var GROOVE_UP = ['C3', 'E3', 'G3', 'A3', 'C4', 'A3'];
  var GROOVE_MELODY = [
    ['E5', null, 'G5', 'A5', null, 'G5', 'E5', null, 'D5', 'E5', null, 'G5'],
    ['A5', null, 'G5', 'E5', null, 'D5', 'C5', null, 'D5', 'E5', null, null],
  ];
  var grooveNoise = null;

  function grooveTone(c, out, type, freq, at, peak, decay) {
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain);
    gain.connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
  function grooveHat(c, out, at, peak, decay, hp) {
    if (!grooveNoise) {
      grooveNoise = c.createBuffer(1, Math.floor(c.sampleRate * 0.3), c.sampleRate);
      var data = grooveNoise.getChannelData(0);
      for (var i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    var src = c.createBufferSource();
    src.buffer = grooveNoise;
    var filter = c.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    var gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(at);
    src.stop(at + decay + 0.05);
  }
  function grooveKick(c, out, at) {
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.frequency.setValueAtTime(150, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.14);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.8, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    osc.connect(gain);
    gain.connect(out);
    osc.start(at);
    osc.stop(at + 0.3);
  }

  // 一拍（含後半拍）的配樂。beat 是這一小節第幾拍，bar 是第幾小節，half 是半拍的秒數
  function groove(c, out, at, beat, beats, bar, accent, half) {
    if (beat === 0) grooveKick(c, out, at);
    if (accent) grooveHat(c, out, at, 0.22, 0.1, 1500);
    grooveHat(c, out, at, 0.08, 0.03, 7000);
    grooveHat(c, out, at + half, 0.12, 0.03, 7000);
    var step = beat % GROOVE_UP.length;
    var bass = GROOVE_UP[bar % 2 === 0 ? step : GROOVE_UP.length - 1 - step];
    grooveTone(c, out, 'triangle', G[bass], at, 0.32, Math.min(0.3, half * 1.6));
    var line = GROOVE_MELODY[bar % 2];
    for (var k = 0; k < 2; k += 1) {
      var note = line[(beat * 2 + k) % line.length];
      if (note) grooveTone(c, out, 'square', G[note], at + k * half, 0.045, Math.min(0.18, half * 0.9));
    }
  }

  function metronome(rootEl, opts) {
    var o = {
      bpm: opts.bpm || 90, min: opts.min || 50, max: opts.max || 180, step: opts.step || 5, beats: opts.beats || 3,
    };
    o.accents = opts.accents || [o.beats - 1];
    var isAccent = function (i) { return o.accents.indexOf(i) !== -1; };
    /*
     * 時鐘（clock）只有一個，上面兩層：拍子（running：拍子聲＋燈，按「開始打拍子」才有）和配樂（music：遊戲自己開關）。
     * 兩層分開開關，但踩同一個時鐘、同一個速度，所以永遠對得上拍。兩層都關了時鐘才停。
     */
    var st = { startBpm: o.bpm, manual: 0, count: 0, clock: false, running: false, music: false, bg: false, duck: false, ducked: false, bpm: o.bpm, timer: 0, next: 0, beat: 0, bars: 0, auto: !!opts.auto, visual: [] };
    var soundOn = function () { return !opts.sound || opts.sound(); };
    var clickBus = null; // 拍子聲、配樂各自的總音量：關掉時一口氣壓到 0，已經排進去的音就不會拖尾
    var musicBus = null;
    /*
     * 音量（使用者要求）：配樂平常正常大聲；一打拍子就壓低，讓拍子聲聽得清楚，停了再拉回來。
     * 「誰輸了？」那步一進來正常大聲，拉霸轉的時候壓低（duck），停下來之後維持中等音量當背景。
     */
    var CLICK_VOL = 1.4;
    var MUSIC_VOL = 0.8;
    var MUSIC_UNDER_CLICK = 0.3;
    var MUSIC_BG = 0.8;
    var MUSIC_DUCK = 0.3;
    var MUSIC_AFTER_DUCK = 0.5;
    function musicLevel() {
      if (st.duck) return MUSIC_DUCK;
      if (st.bg) return st.ducked ? MUSIC_AFTER_DUCK : MUSIC_BG;
      return st.running ? MUSIC_UNDER_CLICK : MUSIC_VOL;
    }
    function applyMusicLevel() {
      if (st.music) setGain(musicBus, musicLevel(), 0.3);
    }

    rootEl.textContent = '';
    rootEl.classList.add('metro');
    var lights = make('div', 'beats metro-beats');
    lights.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < o.beats; i += 1) lights.appendChild(make('i', isAccent(i) ? 'accent' : ''));
    // 開場口令：跟燈放在同一個位置，平常顯示口令、打拍子時喊完口令才換成燈
    var intro = opts.intro || [];
    var introRow = make('div', 'metro-intro');
    introRow.setAttribute('aria-hidden', 'true');
    intro.forEach(function (word) { introRow.appendChild(make('span', '', word)); });
    var row = make('div', 'metro-row');
    var stepper = make('div', 'stepper metro-tempo');
    var slower = make('button', '', '−');
    slower.type = 'button';
    slower.setAttribute('aria-label', t.metroSlower || '');
    var bpmOut = make('output', 'metro-bpm');
    bpmOut.setAttribute('aria-live', 'polite');
    var faster = make('button', '', '+');
    faster.type = 'button';
    faster.setAttribute('aria-label', t.metroFaster || '');
    stepper.appendChild(slower);
    stepper.appendChild(bpmOut);
    stepper.appendChild(faster);
    var auto = make('button', 'chip metro-auto', t.metroAuto);
    auto.type = 'button';
    auto.setAttribute('aria-pressed', 'false');
    row.appendChild(stepper);
    row.appendChild(auto);
    var toggle = make('button', 'btn btn-lg btn-solid btn-block metro-toggle', t.metroStart);
    toggle.type = 'button';
    if (intro.length) rootEl.appendChild(introRow);
    rootEl.appendChild(lights);
    rootEl.appendChild(row);
    rootEl.appendChild(toggle);

    function sync() {
      bpmOut.textContent = fill(t.metroBpm || '{n} BPM', { n: Math.round(st.bpm) });
      slower.disabled = st.bpm <= o.min;
      faster.disabled = st.bpm >= o.max;
      toggle.textContent = st.running ? t.metroStop : t.metroStart;
      toggle.classList.toggle('btn-solid', !st.running);
      toggle.classList.toggle('btn-secondary', st.running);
      auto.setAttribute('aria-pressed', String(st.auto));
    }

    // count 是按下開始後第幾拍：前 intro.length 拍亮口令的詞，之後亮燈；index -1 是全熄（停下來，回到顯示口令）
    function light(index, count) {
      var inIntro = intro.length > 0 && (index < 0 || count < intro.length);
      introRow.hidden = !inIntro;
      lights.hidden = inIntro;
      Array.prototype.forEach.call(introRow.children, function (word, i) {
        word.classList.toggle('on', index >= 0 && i === count);
      });
      Array.prototype.forEach.call(lights.children, function (dot, i) {
        dot.classList.toggle('on', !inIntro && i === index);
      });
    }

    function setGain(bus, value, ramp) {
      if (!bus) return;
      var now = audio.currentTime;
      bus.gain.cancelScheduledValues(now);
      if (ramp) {
        bus.gain.setValueAtTime(bus.gain.value, now);
        bus.gain.linearRampToValueAtTime(value, now + ramp);
      } else {
        bus.gain.setValueAtTime(value, now);
      }
    }

    // 時鐘現在的速度：打拍子時照節拍器（調快、自動加速配樂都跟著）；沒打拍子時配樂回到原本的速度 o.bpm（2026-10-22 使用者要求）
    function tempo() { return st.running ? st.bpm : o.bpm; }

    function tick() {
      var c = audio;
      while (st.next < c.currentTime + 0.12) {
        var at = st.next;
        var b = st.beat;
        var accent = isAccent(b);
        if (soundOn()) {
          if (st.running) click(c, at, accent, clickBus);
          if (st.music) groove(c, musicBus, at, b, o.beats, st.bars, accent, 30 / tempo());
        }
        if (st.running) {
          (function (index, count, when) {
            st.visual.push(setTimeout(function () { light(index, count); }, Math.max(0, (when - c.currentTime) * 1000)));
          })(b, st.count, at);
          st.count += 1;
        }
        st.next += 60 / tempo();
        st.beat = (b + 1) % o.beats;
        if (st.beat === 0) {
          st.bars += 1;
          // 自動加速：打拍子的時候每 4 組快一點，到上限就停（只有配樂在放時不加速）
          if (st.running && st.auto && st.bars % 4 === 0 && st.bpm < o.max) {
            st.bpm = Math.min(o.max, st.bpm + o.step);
            sync();
          }
        }
      }
      if (st.visual.length > 32) st.visual.splice(0, 16);
    }

    function startClock() {
      var c = ctx();
      if (!c) return null;
      if (!clickBus) {
        clickBus = c.createGain();
        clickBus.connect(c.destination);
        musicBus = c.createGain();
        musicBus.connect(c.destination);
      }
      if (!st.clock) {
        st.clock = true;
        st.next = c.currentTime + 0.08;
        st.beat = 0;
        st.bars = 0;
        st.timer = setInterval(tick, 25);
      }
      return c;
    }
    function stopClockIfIdle() {
      if (st.running || st.music || !st.clock) return;
      st.clock = false;
      clearInterval(st.timer);
    }

    // 拍子：從下一拍重新算第 1 拍（「1 樓」先開口），配樂照著同一個時鐘接下去
    function start() {
      if (st.running) return;
      var c = startClock();
      if (!c) return;
      st.running = true;
      st.startBpm = st.bpm; // 停下來時回到這個速度（見 stop）
      setGain(clickBus, CLICK_VOL);
      applyMusicLevel();
      st.count = 0;
      st.beat = 0;
      st.bars = 0;
      tick();
      sync();
      if (opts.onStart) opts.onStart();
    }

    function stop() {
      if (!st.running) return;
      st.running = false;
      // 節拍器的設定：自動加速加上去的歸零，打拍子中自己按 −／＋ 調的保留（下次開始從這裡打）。
      // 配樂不看這個：沒打拍子時一律回到原本的速度（見 tempo）
      if (st.bpm > st.startBpm + st.manual) st.bpm = st.startBpm + st.manual;
      st.manual = 0;
      st.visual.forEach(clearTimeout);
      st.visual = [];
      setGain(clickBus, 0);
      applyMusicLevel();
      light(-1);
      stopClockIfIdle();
      sync();
      if (opts.onStop) opts.onStop();
    }

    // 配樂（opts.groove）開關，跟拍子分開
    function music(on) {
      if (!opts.groove || st.music === on) return;
      if (on) {
        if (!startClock()) return;
        st.music = true;
        setGain(musicBus, musicLevel());
        tick();
      } else {
        st.music = false;
        setGain(musicBus, 0);
        stopClockIfIdle();
      }
    }

    // 背景模式：配樂小聲當背景（例如上樓下樓的拉霸那步），false 回到正常
    function background(on) {
      st.bg = on;
      st.duck = false;
      st.ducked = false;
      applyMusicLevel();
    }
    // 再壓低一點（例如拉霸在轉），false 回到原本的音量
    function duck(on) {
      if (st.duck && !on) st.ducked = true;
      st.duck = on;
      applyMusicLevel();
    }

    toggle.addEventListener('click', function () {
      if (st.running) stop();
      else start();
    });
    slower.addEventListener('click', function () {
      if (st.running) st.manual -= Math.min(o.step, st.bpm - o.min);
      st.bpm = Math.max(o.min, st.bpm - o.step);
      sync();
    });
    faster.addEventListener('click', function () {
      if (st.running) st.manual += Math.min(o.step, o.max - st.bpm);
      st.bpm = Math.min(o.max, st.bpm + o.step);
      sync();
    });
    auto.addEventListener('click', function () {
      st.auto = !st.auto;
      sync();
    });
    // 切到背景兩層都停（背景的計時器會被節流，拍子會亂掉），回來不自動接著放
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'hidden') return;
      stop();
      music(false);
    });

    sync();
    light(-1);
    return {
      start: start, stop: stop, music: music, background: background, duck: duck,
      running: function () { return st.running; },
      playing: function () { return st.music; },
    };
  }

  window.Leader.metronome = metronome;
})();

/*
 * 帶領元件之四：倒放錄音機 Leader.recorder（2026-10-23 從倒放猜猜看抽出來，桌遊助手的「錄音機」也用同一份）。
 * 錄音只留在記憶體，不上傳、不存檔。共用文字（開始錄音、停止、麥克風錯誤⋯⋯）在 src/locales.mjs 的 rec*。
 *
 *   var rec = Leader.recorder(rootEl, { maxSec, onRecorded(sec) })
 *       錄音鍵＋進度條（右邊是秒數）＋狀態列（處理中、錯誤才有字）。錄好的聲音在 rec.forward（原聲）、rec.backward（倒放）
 *   rec.button(which, cls, icon, label, onPlay)   做一顆播放鍵（which：forward／backward），放哪裡由呼叫的人決定；
 *       播放中變「停止」，點了、播完、或改播別段都變回原本的字。rec.plays 是錄音機底下現成的一排
 *   rec.setRate(r)   播放速度（0.5～2，連音高一起變），正在播的也馬上跟著變
 *   rec.start() 開始／停止錄音（要在使用者點擊裡呼叫，iOS 才給麥克風）、rec.isRecording()、rec.reset()
 *   Leader.stopPlaying()   停掉正在播的那一段（換畫面時用）
 */
(function () {
  'use strict';

  var t = (window.WOOHOP && window.WOOHOP.t) || {};
  var fill = function (s, v) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; });
  };

  // 全頁只有一個 AudioContext、同時只播一段、只錄一段。AudioContext 要在使用者點擊裡才建立，iOS 才肯出聲
  var ctx = null;
  var playing = null; // { src, btn, label }
  var recording = null; // { owner, stop }

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function pickMime() {
    // iOS Safari 只錄得出 mp4，Chrome／Android 是 webm
    var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    for (var i = 0; i < types.length; i += 1) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(types[i])) return types[i];
    }
    return '';
  }

  function copyBuffer(buf, start, end, reverse) {
    var out = audio().createBuffer(buf.numberOfChannels, end - start, buf.sampleRate);
    for (var c = 0; c < buf.numberOfChannels; c += 1) {
      var part = buf.getChannelData(c).slice(start, end);
      if (reverse) part.reverse();
      out.copyToChannel(part, c);
    }
    return out;
  }

  // 頭尾音量低於門檻的部分剪掉，倒放時才不會先聽到一大段空白
  function trimSilence(buf) {
    var data = buf.getChannelData(0);
    var win = Math.floor(buf.sampleRate * 0.02);
    var peak = 0;
    for (var i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    // 門檻跟著這段最大音量走；下限壓低，手機關掉自動增益後收音比較小聲，不然整段都會被當成空白剪掉
    var th = Math.max(0.005, peak * 0.08);
    var loud = function (at) {
      for (var j = at; j < Math.min(at + win, data.length); j += 1) if (Math.abs(data[j]) > th) return true;
      return false;
    };
    var start = 0;
    var end = data.length;
    while (start < end && !loud(start)) start += win;
    while (end > start && !loud(Math.max(0, end - win))) end -= win;
    var pad = Math.floor(buf.sampleRate * 0.08);
    start = Math.max(0, start - pad);
    end = Math.min(data.length, end + pad);
    if (end - start < buf.sampleRate * 0.2) return buf;
    return copyBuffer(buf, start, end, false);
  }

  function stopPlaying() {
    if (!playing) return;
    var p = playing;
    playing = null;
    try { p.src.stop(); } catch (e) { /* 已經停了 */ }
    p.btn.querySelector('span').textContent = p.label;
    p.btn.classList.remove('btn-danger', 'is-playing');
  }

  function play(buf, btn, rate) {
    stopPlaying();
    var src = audio().createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate || 1;
    src.connect(ctx.destination);
    var label = btn.querySelector('span');
    playing = { src: src, btn: btn, label: label.textContent };
    src.onended = function () { if (playing && playing.src === src) stopPlaying(); };
    label.textContent = t.playStop || '';
    // 播放中跟錄音中的「停止」一樣變紅色、圖示換成方塊
    btn.classList.add('btn-danger', 'is-playing');
    src.start();
  }

  function iconBtn(cls, icon, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + cls;
    b.innerHTML = (icon ? '<svg aria-hidden="true"><use href="#' + icon + '"/></svg>' : '<i class="rec-dot" aria-hidden="true"></i>') + '<span></span>';
    b.querySelector('span').textContent = label;
    return b;
  }

  function recorder(root, opts) {
    opts = opts || {};
    var maxSec = opts.maxSec || 15;
    var wrap = document.createElement('div');
    wrap.className = 'recorder';
    var recBtn = iconBtn('btn-lg btn-solid btn-block rec-btn', '', t.recStart);
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.innerHTML = '<div style="--p:0%"></div>';
    var fillBar = bar.firstChild;
    // 秒數放在進度條右邊：錄音中即時跳，錄好留著這段的長度
    var meter = document.createElement('div');
    meter.className = 'rec-meter';
    var time = document.createElement('span');
    time.className = 'rec-time';
    meter.appendChild(bar);
    meter.appendChild(time);
    var status = document.createElement('p');
    status.className = 'rec-status';
    status.setAttribute('aria-live', 'polite');
    var plays = document.createElement('div');
    plays.className = 'rec-plays';
    wrap.appendChild(recBtn);
    wrap.appendChild(meter);
    wrap.appendChild(status);
    wrap.appendChild(plays);
    root.appendChild(wrap);

    var self = { forward: null, backward: null, buttons: [], plays: plays, wrap: wrap, rate: 1 };
    var owner = {};

    // look：solid（開始錄音，實心主要鍵）、danger（錄音中，紅色「停止」）、pastel（錄好了的「重錄」，主要・粉彩，不跟播放鍵搶）
    function setRecLabel(text, look) {
      recBtn.querySelector('span').textContent = text;
      recBtn.classList.toggle('btn-danger', look === 'danger');
      recBtn.classList.toggle('btn-solid', look === 'solid');
    }
    function sync() {
      self.buttons.forEach(function (b) { b.disabled = !self.forward; });
    }
    function showTime(sec) {
      fillBar.style.setProperty('--p', Math.min(100, (sec / maxSec) * 100) + '%');
      time.textContent = fill(t.recTime, { sec: sec.toFixed(1) });
    }
    function stopRec() {
      if (recording && recording.owner === owner) recording.stop();
    }

    function start() {
      audio();
      if (recording && recording.owner === owner) return stopRec();
      if (recording) recording.stop();
      stopPlaying();

      if (!navigator.mediaDevices || !window.MediaRecorder) {
        status.textContent = t.micInsecure;
        return;
      }
      // 關掉降噪／回音消除：手機會把別支手機喇叭放出來的倒放聲當雜訊濾掉
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      }).then(function (stream) {
        var mime = pickMime();
        var rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        var chunks = [];
        var t0 = performance.now();
        var timer = 0;
        rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          clearInterval(timer);
          stream.getTracks().forEach(function (tr) { tr.stop(); });
          if (recording && recording.owner === owner) recording = null;
          setRecLabel(t.recRedo, 'pastel');
          status.textContent = t.recProcessing;
          new Blob(chunks, { type: rec.mimeType || mime }).arrayBuffer()
            .then(function (data) { return audio().decodeAudioData(data); })
            .then(function (decoded) {
              self.forward = trimSilence(decoded);
              self.backward = copyBuffer(self.forward, 0, self.forward.length, true);
              status.textContent = '';
              showTime(self.forward.duration); // 剪掉頭尾空白後的長度
              sync();
              if (opts.onRecorded) opts.onRecorded(self.forward.duration);
            })
            .catch(function () { status.textContent = t.decodeFailed; });
        };
        recording = { owner: owner, stop: function () { if (rec.state !== 'inactive') rec.stop(); } };
        rec.start();
        setRecLabel(t.recStop, 'danger');
        status.textContent = '';
        showTime(0);
        timer = setInterval(function () {
          var s = (performance.now() - t0) / 1000;
          showTime(Math.min(s, maxSec));
          if (s >= maxSec) stopRec();
        }, 50);
      }).catch(function () {
        status.textContent = t.micDenied;
      });
    }

    recBtn.addEventListener('click', start);

    self.button = function (which, cls, icon, label, onPlay) {
      var b = iconBtn(cls, icon, label);
      b.disabled = true;
      b.addEventListener('click', function () {
        if (playing && playing.btn === b) return stopPlaying();
        if (!self[which]) return;
        play(self[which], b, self.rate);
        if (onPlay) onPlay();
      });
      self.buttons.push(b);
      return b;
    };
    self.setRate = function (r) {
      self.rate = r;
      // 正在播的是這台錄音機的，也馬上換速度
      if (playing && self.buttons.indexOf(playing.btn) >= 0) playing.src.playbackRate.value = r;
    };
    self.reset = function () {
      stopRec();
      if (playing && self.buttons.indexOf(playing.btn) >= 0) stopPlaying();
      self.forward = self.backward = null;
      setRecLabel(t.recStart, 'solid');
      status.textContent = '';
      fillBar.style.setProperty('--p', '0%');
      time.textContent = '';
      sync();
    };
    self.stop = stopRec;
    self.start = start;
    self.isRecording = function () { return Boolean(recording && recording.owner === owner); };
    return self;
  }

  window.Leader.recorder = recorder;
  window.Leader.stopPlaying = stopPlaying;
})();

/*
 * 帶領元件之五：動作抽卡 Leader.actionCard（2026-10-28 從木頭人動作版抽出來，桌遊助手的「動作抽卡」也用同一份）。
 * 一張動作卡（插圖在上、名稱在下）＋「隨機抽一個」。插圖是 woohop-art.js 的 Woohop.actionArt，
 * 動作清單是 src/action-cards.mjs（build 時嵌進當頁語言的那份）。按鈕文字是 locales.mjs 的 actionDraw。
 *
 *   var card = Leader.actionCard(rootEl, { actions: [[代號, 名稱], ...], onDraw(action) })
 *       第一次抽之前卡片藏著，只有按鈕；不會連續抽到同一個動作，小人顏色每抽一張換一個
 *   card.draw()    抽一張（翻牌動畫）
 *   card.reset()   收起卡片，回到還沒抽的樣子
 *   Leader.actionArt(代號)   只要插圖（隨機換顏色）：木頭人抽卡那一步自己排版面時用
 */
(function () {
  'use strict';

  var t = (window.WOOHOP && window.WOOHOP.t) || {};

  // 首頁主視覺那幾隻小人的顏色：[主色, 陰影色]
  var CHARS = [
    ['#fbbff5', '#ef9fe8'], // 粉
    ['#aebcf3', '#8799E9'], // 藍（主持人）
    ['#a8dccb', '#7cc9b1'], // 薄荷
    ['#ffc27a', '#FF9419'], // 橘
    ['#fbb3a8', '#EE7B6A'], // 珊瑚
  ];
  var lastChar = -1;

  // 隨機換一個顏色（不會連續兩張同色）畫那個動作的插圖；沒有插圖就回空字串
  function actionArt(key) {
    var art = window.Woohop && window.Woohop.actionArt;
    var draw = art && art[key];
    if (!draw) return '';
    var i = Math.floor(Math.random() * (CHARS.length - 1));
    if (lastChar >= 0 && i >= lastChar) i += 1;
    lastChar = i;
    return draw(CHARS[i]);
  }

  function actionCard(rootEl, opts) {
    var actions = opts.actions || [];
    var wrap = document.createElement('div');
    wrap.className = 'action-card';
    wrap.innerHTML = '<div class="action-face" hidden><svg class="action-art" viewBox="0 0 120 128" aria-hidden="true"></svg>' +
      '<p class="action-name" aria-live="polite"></p></div>';
    var face = wrap.firstChild;
    var artEl = face.querySelector('.action-art');
    var nameEl = face.querySelector('.action-name');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-lg btn-secondary btn-block action-draw';
    btn.innerHTML = '<svg aria-hidden="true"><use href="#i-dice"/></svg><span></span>';
    btn.querySelector('span').textContent = t.actionDraw || '';
    wrap.appendChild(btn);
    rootEl.appendChild(wrap);

    var lastKey = '';
    var self = {};
    self.draw = function () {
      var n = actions.length;
      if (!n) return;
      var action;
      do action = actions[Math.floor(Math.random() * n)]; while (n > 1 && action[0] === lastKey);
      lastKey = action[0];
      nameEl.textContent = action[1];
      artEl.innerHTML = actionArt(action[0]);
      face.hidden = false;
      // 卡片從側面轉正（跟抽卡取名同一個動畫）
      face.classList.remove('pop');
      void face.offsetWidth;
      face.classList.add('pop');
      if (opts.onDraw) opts.onDraw(action);
    };
    self.reset = function () {
      lastKey = '';
      face.hidden = true;
    };
    btn.addEventListener('click', self.draw);
    return self;
  }

  window.Leader.actionCard = actionCard;
  window.Leader.actionArt = actionArt;
})();
