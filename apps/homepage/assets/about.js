/*
 * 關於我們（/{lang}/about/，下半部是聯絡表單 #contact）、服務條款、隱私權政策。2026-10-22
 * 聯絡我們原本是獨立的 /{lang}/contact/，上線當天併回關於頁（vercel.json 轉過來，網址參數照帶）。
 *
 * 表單送到 /api/feedback（vercel.json 代理到 apps/feedback 的 Worker，寄到 woohop.app@gmail.com）。
 * 網址可以帶 ?type=idea&game=bomb 預先選好；只帶 ?game= 就當成修改建議（之後遊戲頁的「回報問題」可以直接連過來）。
 * GA 事件：feedback_sent（type、game）。
 */
(() => {
  'use strict';

  const { lang, t } = window.WOOHOP;
  const Site = window.Site;
  Site.nav();

  const form = document.getElementById('feedback');
  if (!form) return; // 服務條款、隱私權政策頁只要導覽
  const F = t.about.form;
  const $ = id => document.getElementById(id);
  const message = $('fb-message'), email = $('fb-email'), game = $('fb-game');
  const errBox = $('fb-error'), send = $('fb-send'), done = $('fb-done');
  const openedAt = Date.now();

  const currentType = () => form.querySelector('input[name="type"]:checked').value;
  // 「跟哪個遊戲有關」只對修改建議（含回報問題）有意義（推薦的是還沒有的遊戲），其他類型藏起來
  const GAME_TYPES = ['idea'];
  const gameField = $('fb-game-field');
  const onType = () => {
    message.placeholder = F.placeholders[currentType()];
    gameField.hidden = !GAME_TYPES.includes(currentType());
  };
  form.addEventListener('change', e => { if (e.target.name === 'type') onType(); });

  /*
   * 「跟哪個遊戲有關」：遊戲越來越多，下拉選單太長，改成打字篩選（2026-10-23 使用者要求）。
   * 原本的 <select> 留著當值的來源（送出、網址預設值都照舊），只是藏起來；畫面上是輸入框＋符合的清單。
   * 沒有 JS 的時候還是那個 <select>。
   */
  const combo = (() => {
    const items = [...game.options].map(o => ({ value: o.value, label: o.textContent }));
    const box = document.createElement('div');
    box.className = 'combo';
    const input = document.createElement('input');
    input.className = 'input';
    input.id = 'fb-game-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = F.gameSearch;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'fb-game-list');
    const list = document.createElement('ul');
    list.className = 'combo-list';
    list.id = 'fb-game-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    box.appendChild(input);
    box.appendChild(list);
    game.hidden = true;
    game.insertAdjacentElement('afterend', box);
    gameField.querySelector('label').htmlFor = input.id;

    let shown = [];
    let active = -1;
    // 大小寫、全形半形、空白都不計較
    const norm = s => s.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
    const labelOf = v => (items.find(i => i.value === v) || items[0]).label;
    const showLabel = () => { input.value = game.value ? labelOf(game.value) : ''; };

    const render = () => {
      const q = norm(input.value);
      shown = !q ? items : items.filter(i => norm(i.label).includes(q));
      list.textContent = '';
      if (!shown.length) {
        const li = document.createElement('li');
        li.className = 'combo-empty';
        li.textContent = F.gameNoMatch;
        list.appendChild(li);
      }
      shown.forEach((it, i) => {
        const li = document.createElement('li');
        li.id = 'fb-game-opt-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(it.value === game.value));
        li.classList.toggle('is-active', i === active);
        li.textContent = it.label;
        // mousedown 而不是 click：click 之前輸入框會先 blur 把清單關掉
        li.addEventListener('mousedown', e => { e.preventDefault(); pick(it); });
        list.appendChild(li);
      });
      input.setAttribute('aria-activedescendant', active >= 0 ? 'fb-game-opt-' + active : '');
    };
    const open = () => {
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      render();
    };
    const close = () => {
      list.hidden = true;
      active = -1;
      input.setAttribute('aria-expanded', 'false');
      input.placeholder = F.gameSearch;
      showLabel(); // 打到一半沒選：回到原本選的
    };
    const pick = it => {
      game.value = it.value;
      close();
    };

    // 點進來就清空讓人直接打字（全選在手機上不可靠，打字會接在舊名稱後面）；目前選的名稱改放在提示字，離開時再填回去
    input.addEventListener('focus', () => {
      active = -1;
      input.placeholder = game.value ? labelOf(game.value) : F.gameSearch;
      input.value = '';
      open();
    });
    input.addEventListener('input', () => { active = 0; open(); });
    input.addEventListener('blur', close);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.hidden) open();
        if (!shown.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length;
        render();
        const el = document.getElementById('fb-game-opt-' + active);
        if (el) el.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && !list.hidden) {
        e.preventDefault(); // 不要直接送出表單
        if (shown[active]) pick(shown[active]);
      } else if (e.key === 'Escape' && !list.hidden) {
        e.preventDefault();
        close();
      }
    });
    return { showLabel };
  })();

  // 網址帶的預設值；只帶遊戲沒帶類型（例如遊戲頁的回報連結）當成修改建議。
  // 回報問題（bug）上線當天就併進修改建議，舊連結的 type=bug 也轉成 idea
  const q = new URLSearchParams(location.search);
  const presetGame = q.get('game') && [...game.options].some(o => o.value === q.get('game'));
  const typeParam = q.get('type') === 'bug' ? 'idea' : q.get('type');
  const presetType = form.querySelector(`input[name="type"][value="${CSS.escape(typeParam || (presetGame ? 'idea' : ''))}"]`);
  if (presetType) presetType.checked = true;
  if (presetGame) game.value = q.get('game');
  combo.showLabel();
  onType();
  // 帶著預設值進來（遊戲頁的回報連結、舊的聯絡頁網址）就直接捲到表單
  if ((presetType || presetGame) && !location.hash) document.getElementById('contact').scrollIntoView();
  // 從站內哪一頁點過來（回報問題時知道是哪一頁）
  let from = q.get('from') || '';
  if (!from && document.referrer) {
    try { const r = new URL(document.referrer); if (r.origin === location.origin && !r.pathname.includes('/about/')) from = r.pathname; } catch { /* 略過 */ }
  }

  const showFieldError = (input, show) => {
    input.classList.toggle('is-error', show);
    input.setAttribute('aria-invalid', String(show));
    $(input.id + '-err').hidden = !show;
  };
  const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
  const check = () => {
    const badMessage = message.value.trim().length < 5;
    const badEmail = email.value.trim() !== '' && !EMAIL_RE.test(email.value.trim());
    showFieldError(message, badMessage);
    showFieldError(email, badEmail);
    if (badMessage) message.focus(); else if (badEmail) email.focus();
    return !badMessage && !badEmail;
  };
  // 改過之後錯誤訊息就收起來，不用等再按一次送出
  message.addEventListener('input', () => { if (message.classList.contains('is-error') && message.value.trim().length >= 5) showFieldError(message, false); });
  email.addEventListener('input', () => { if (email.classList.contains('is-error')) showFieldError(email, false); });

  const showError = text => { errBox.querySelector('span').textContent = text; errBox.hidden = false; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.hidden = true;
    if (!check()) return;
    send.disabled = true;
    send.textContent = F.sending;
    const body = {
      type: currentType(), game: gameField.hidden ? '' : game.value, message: message.value.trim(), email: email.value.trim(),
      website: form.elements.website.value, elapsed: Date.now() - openedAt, lang, from,
    };
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        Site.track('feedback_sent', { type: body.type, game: body.game || 'none' });
        form.hidden = true;
        done.hidden = false;
        done.querySelector('.alert').focus?.();
        return;
      }
      if (data.error === 'message') showFieldError(message, true);
      else if (data.error === 'email') showFieldError(email, true);
      else showError(res.status === 429 ? F.errRate : F.errServer);
    } catch {
      showError(F.errServer);
    } finally {
      send.disabled = false;
      send.textContent = F.send;
    }
  });

  $('fb-again').addEventListener('click', () => {
    message.value = '';
    done.hidden = true;
    form.hidden = false;
    message.focus();
  });
})();
