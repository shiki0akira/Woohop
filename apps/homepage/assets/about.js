/*
 * 關於我們（/{lang}/about/）、聯絡我們（/{lang}/contact/，意見表單）、隱私權政策（/{lang}/privacy/）。2026-10-22
 *
 * 表單送到 /api/feedback（vercel.json 代理到 apps/feedback 的 Worker，寄到 woohop.app@gmail.com）。
 * 網址可以帶 ?type=bug&game=bomb 預先選好（之後遊戲頁的「回報問題」可以直接連過來）。
 * GA 事件：feedback_sent（type、game）。
 */
(() => {
  'use strict';

  const { lang, page, t } = window.WOOHOP;
  const Site = window.Site;
  // 表單原本放在關於頁的 #contact（上線當天就拆成獨立頁），舊連結轉過去
  if (page === 'about' && location.hash === '#contact') { location.replace(`/${lang}/contact/`); return; }
  Site.nav();

  const form = document.getElementById('feedback');
  if (!form) return; // 關於、隱私權政策頁只要導覽
  const F = t.about.form;
  const $ = id => document.getElementById(id);
  const message = $('fb-message'), email = $('fb-email'), game = $('fb-game');
  const errBox = $('fb-error'), send = $('fb-send'), done = $('fb-done');
  const openedAt = Date.now();

  const currentType = () => form.querySelector('input[name="type"]:checked').value;
  // 「跟哪個遊戲有關」只對回報問題、修改建議有意義（推薦的是還沒有的遊戲），其他類型藏起來
  const GAME_TYPES = ['bug', 'idea'];
  const gameField = $('fb-game-field');
  const onType = () => {
    message.placeholder = F.placeholders[currentType()];
    gameField.hidden = !GAME_TYPES.includes(currentType());
  };
  form.addEventListener('change', e => { if (e.target.name === 'type') onType(); });

  // 網址帶的預設值；只帶遊戲沒帶類型（例如遊戲頁的回報連結），當成回報問題
  const q = new URLSearchParams(location.search);
  const presetGame = q.get('game') && [...game.options].some(o => o.value === q.get('game'));
  const presetType = form.querySelector(`input[name="type"][value="${CSS.escape(q.get('type') || (presetGame ? 'bug' : ''))}"]`);
  if (presetType) presetType.checked = true;
  if (presetGame) game.value = q.get('game');
  onType();
  // 從站內哪一頁點過來（回報問題時知道是哪一頁）
  let from = q.get('from') || '';
  if (!from && document.referrer) {
    try { const r = new URL(document.referrer); if (r.origin === location.origin && !r.pathname.includes('/contact/')) from = r.pathname; } catch { /* 略過 */ }
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
