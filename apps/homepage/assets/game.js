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
    // 每條關閉路徑自己關（不靠 dialog 的 close 事件，那個在部分 WebView 不會發）
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet || e.target.closest('[data-close]') || e.target.closest('a')) sheet.close();
    });
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
 *   Leader.slot(rootEl, { prompts, actions, onPull })  真心話大冒險拉霸，回傳 { reset() }
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
    function ticks(rows) {
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
        var c = ctx();
        if (c) land(c);
      }, SLOT_MS + 50);
      if (opts.onPull) opts.onPull({ kind: st.items[chosen].kind, mode: st.mode });
    });

    function reset() {
      clearTimeout(st.id);
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
