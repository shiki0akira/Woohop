/*
 * 首頁主視覺插圖：一群人圍著桌子聚會，主持人舉著手機帶大家玩。
 * 畫法跟設計系統的插圖一樣（粗描邊＋小缺口、色塊錯開不填滿、表情各不相同、虛線地板），
 * 用 woohop-art.js 的 body / makeFace / K 等工具組出來。
 */
(() => {
  const { body, makeFace, K, burst, plus, ring, dot } = window.Woohop;

  // 圓頭長身的小人：上半圓＋直身，底部會被桌子擋住
  const bean = (x, top, w, h) =>
    `<path d="M${x - w / 2} ${top + h}V${top + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${top + w / 2}V${top + h}Z"/>`;
  // 身體右側的深色陰影（會被 body 的裁切限制在身體裡）
  const shade = (x, top, w, h, c) => `<path d="M${x + w * 0.18} ${top - 10}h${w}v${h + 20}h${-w}z" fill="${c}"/>`;
  // 手：一條粗線，尾端一顆圓手掌
  const arm = (d, hx, hy, c) =>
    `<path d="${d}" fill="none" stroke="#22222c" stroke-width="11" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="${hx}" cy="${hy}" r="8" fill="${c}" ${K}/>`;
  // 對話泡泡
  const bubble = (x, y, w, h, tail, inner) =>
    body(`<path d="M${x} ${y + 12}a12 12 0 0 1 12-12h${w - 24}a12 12 0 0 1 12 12v${h - 24}a12 12 0 0 1-12 12H${tail + 14}l-12 14v-14H${x + 12}a12 12 0 0 1-12-12z"/>`, '#ffffff', '', false) + inner;
  // 彩帶：小小的 W 撒在空中
  const confetti = (x, y, c, rot, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><use class="h-float" style="animation-delay:${(-x % 7) / 2}s" href="#w" x="${-13 * s}" y="${-10.5 * s}" width="${26 * s}" height="${21 * s}" fill="${c}"/></g>`;

  const art = () => `
    <!-- 空中的彩帶與點綴 -->
    ${confetti(60, 70, '#FFC628', -18)}${confetti(430, 60, '#F3A4FB', 16)}${confetti(180, 40, '#4FB59A', 10, .8)}
    ${confetti(452, 190, '#7489E6', -12, .9)}${confetti(30, 210, '#EE7B6A', 14, .85)}${confetti(360, 24, '#FF9419', -8, .75)}
    ${burst(120, 92, '#FFC628')}${burst(470, 120, '#4FB59A')}${plus(268, 30, '#EE7B6A', 7)}${ring(222, 64, '#F3A4FB', 6)}${dot(400, 140, '#7489E6', 4)}${dot(80, 160, '#FF9419', 4)}

    <!-- 後排：粉、主持人、薄荷 -->
    <g class="h-hop" style="animation-delay:0s">${body(bean(150, 150, 92, 180), '#fbbff5', shade(150, 150, 92, 180, '#ef9fe8'))}
    ${makeFace('happy', 150, 200, 3)}
    ${arm('M106 236q-26 -6 -34 -40', 72, 196, '#fbbff5')}

    </g>
    <g class="h-hop" style="animation-delay:0.9s">${body(bean(330, 158, 92, 172), '#a8dccb', shade(330, 158, 92, 172, '#7cc9b1'))}
    ${makeFace('wink', 330, 208, 3)}
    ${arm('M376 244q26 -8 30 -44', 406, 200, '#a8dccb')}

    </g>
    <g class="h-hop" style="animation-delay:1.8s">${body(bean(240, 112, 104, 220), '#aebcf3', shade(240, 112, 104, 220, '#8799E9'))}
    ${makeFace('grin', 240, 168, 3.3)}
    <!-- 主持人舉起手機，螢幕上是 W -->
    ${arm('M288 200q30 -18 38 -64', 326, 136, '#aebcf3')}
    <g transform="rotate(14 326 104)"><g class="h-wiggle">
      ${body('<rect x="304" y="62" width="46" height="78" rx="9"/>', '#3D54B6', '', false)}
      ${body('<rect x="311" y="72" width="32" height="52" rx="5"/>', '#ffffff', '', false)}
      <use href="#w" x="315" y="88" width="24" height="19.5" fill="#7489E6"/>
    </g></g>
    </g>
    <path d="M362 70l12-8M366 92h14M356 50l6-12" stroke="#FFC628" stroke-width="5" stroke-linecap="round"/>

    <!-- 對話泡泡：愛心、Woo! -->
    <g class="h-pop" style="animation-delay:.8s">${bubble(44, 92, 70, 52, 70, `<path d="M79 128c-8-14-27-10-25 4 1 10 25 20 25 20s23-10 24-20c2-14-17-18-24-4z" transform="translate(0 -14) scale(1)" fill="#EE7B6A" stroke="#22222c" stroke-width="3" stroke-linejoin="round"/>`)}</g>
    <g class="h-pop">${bubble(372, 110, 92, 52, 386, `<text x="418" y="145" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="24" fill="#3D54B6">Woo!</text>`)}</g>

    <!-- 桌子：擋住後排的下半身 -->
    ${body('<path d="M86 300v22c0 18 69 34 154 34s154-16 154-34v-22z"/>', '#FFC628', '<path d="M300 280h120v100H300z" fill="#e8a90c"/>', false)}
    ${body('<ellipse cx="240" cy="300" rx="154" ry="34"/>', '#ffeec8', '', false)}
    <!-- 桌上的飲料與點心 -->
    ${body('<path d="M176 268h22l-3 30h-16z"/>', '#F3A4FB', '', false)}<path d="M190 268l6-16" ${K}/>
    ${body('<path d="M284 270h22l-3 28h-16z"/>', '#a8dccb', '', false)}<path d="M297 270l-4-16" ${K}/>
    ${body('<ellipse cx="240" cy="292" rx="28" ry="9"/>', '#ffffff', '', false)}
    <circle cx="232" cy="287" r="5" fill="#FF9419" stroke="#22222c" stroke-width="2.5"/><circle cx="246" cy="286" r="5" fill="#EE7B6A" stroke="#22222c" stroke-width="2.5"/>

    <!-- 前排：橘（揮手）、珊瑚 -->
    <g class="h-hop" style="animation-delay:2.7s">${body(bean(96, 246, 84, 116), '#ffc27a', shade(96, 246, 84, 116, '#FF9419'))}
    ${makeFace('tongue', 96, 290, 2.6)}
    ${arm('M58 304q-22 -20 -16 -54', 42, 250, '#ffc27a')}
    </g>
    <g class="h-hop" style="animation-delay:3.6s">${body(bean(388, 250, 84, 112), '#fbb3a8', shade(388, 250, 84, 112, '#EE7B6A'))}
    ${makeFace('love', 388, 294, 2.6)}

    </g>
    <!-- Hop! 泡泡：跟 Woo! 輪流彈出來，尾巴指向珊瑚色的小人 -->
    <g class="h-pop" style="animation-delay:1.6s">${bubble(436, 214, 86, 50, 440, `<text x="479" y="248" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="24" fill="#E0830A">Hop!</text>`)}</g>

    <!-- 地板 -->
    <path d="M20 364h150M184 364h24M222 364h160M396 364h64M474 364h8" ${K}/>`;

  window.heroArt = art;
})();
