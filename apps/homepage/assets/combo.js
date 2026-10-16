/*
 * 破冰組合頁：排一組（暖場＋認識彼此），下面的「怎麼帶」流程跟著排出來的遊戲變：
 * 開場 → 暖場 → 轉場 → 認識彼此 → 收尾。框起來的是可以直接念的話。
 */
(() => {
  const { t } = window.WOOHOP;
  const { combo, nav, fmt, esc } = window.Site;
  nav();

  const flow = document.getElementById('flow');
  const say = text => `<div class="prompt-card"><span class="say">${esc(t.sayLabel)}</span>${esc(text)}</div>`;
  const step = (when, cls, title, desc, extra = '') =>
    `<li><span class="when ${cls}">${esc(when)}</span><div><h3>${esc(title)}</h3><p>${esc(desc)}</p>${extra}</div></li>`;

  combo(document.getElementById('combo-root'), {
    onPick(pick) {
      if (!pick) return;
      const [a, b] = pick;
      const open = g => `<a class="link" href="${g.url}" data-key="${g.key}">${esc(fmt(t.openGame, { name: g.name }))}</a>`;
      flow.innerHTML = [
        step(t.flowOpen, '', t.flowOpenTitle, t.flowOpenDesc, say(t.flowOpenSay)),
        step(fmt(t.minShort, { n: a.minutes }), 'w1', fmt(t.flowWarmTitle, { name: a.name }), `${a.desc} ${t.flowWarmDesc}`, open(a)),
        step(t.flowTrans, '', t.flowTransTitle, t.flowTransDesc, say(t.flowTransSay)),
        step(fmt(t.minShort, { n: b.minutes }), 'w2', fmt(t.flowKnowTitle, { name: b.name }), `${b.desc} ${t.flowKnowDesc}`, open(b)),
        step(t.flowClose, '', t.flowCloseTitle, t.flowCloseDesc, say(t.flowCloseSay)),
      ].join('');
    },
  });
})();
