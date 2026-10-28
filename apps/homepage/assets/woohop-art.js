/*
 * Woohop 共用的圖形：logo W、圖示、表情庫、遊戲插圖、食物頭像。
 * 從 design/brand-exploration.html 抽出；規則見那一頁與 docs/redesign-plan.md §6。
 *
 * 引入後會把 SVG 圖示庫（#w、#i-*）插進 <body> 最前面，並提供 window.Woohop。
 */
(() => {
  const SPRITE = "<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\">\n  <defs>\n    <symbol id=\"w\" viewBox=\"0 0 59 48\">\n      <path d=\"M59 48H42C35.3726 48 30 42.6274 30 36V29H34V28H30V24H29V28H25V29H29V36C29 42.6274 23.6274 48 17 48H0V0H2C8.62742 0 14 5.37258 14 12V24H15V12C15 5.37258 20.3726 0 27 0H32C38.6274 0 44 5.37258 44 12V24H45V12C45 5.37258 50.3726 0 57 0H59V48Z\"/>\n    </symbol>\n    <symbol id=\"i-play\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z\"/></symbol>\n    <symbol id=\"i-arrow\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M5 12h14m-6-6 6 6-6 6\"/></symbol>\n    <symbol id=\"i-plus\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M12 5v14M5 12h14\"/></symbol>\n    <symbol id=\"i-share\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 15V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6\"/></symbol>\n    <symbol id=\"i-close\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M6 6l12 12M18 6 6 18\"/></symbol>\n    <symbol id=\"i-dice\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><circle cx=\"9\" cy=\"9\" r=\"1.6\" fill=\"currentColor\"/><circle cx=\"15\" cy=\"15\" r=\"1.6\" fill=\"currentColor\"/><circle cx=\"15\" cy=\"9\" r=\"1.6\" fill=\"currentColor\"/><circle cx=\"9\" cy=\"15\" r=\"1.6\" fill=\"currentColor\"/></symbol>\n    <symbol id=\"i-check\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m5 12.5 4.5 4.5L19 7.5\"/></symbol>\n    <symbol id=\"i-info\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M12 11v6\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"7.5\" r=\"1.6\" fill=\"currentColor\"/></symbol>\n    <symbol id=\"i-users\" viewBox=\"0 0 24 24\"><circle cx=\"9\" cy=\"8\" r=\"3.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><path d=\"M16 5.2a3.2 3.2 0 0 1 0 6M18 14.4c1.8.7 3 2.5 3 5.1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-clock\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M12 7v5.5l3.5 2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol>\n    <symbol id=\"i-phone\" viewBox=\"0 0 24 24\"><rect x=\"6\" y=\"2.5\" width=\"12\" height=\"19\" rx=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M10.5 18h3\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-ok\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"m7.5 12.5 3 3 6-6.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol>\n    <symbol id=\"i-warn\" viewBox=\"0 0 24 24\"><path d=\"M12 3.5 2.8 19.5h18.4z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/><path d=\"M12 10v4.5\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"17\" r=\"1.4\" fill=\"currentColor\"/></symbol>\n    <symbol id=\"i-error\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M9 9l6 6M15 9l-6 6\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-sun\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"4.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-moon\" viewBox=\"0 0 24 24\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/></symbol>\n    <symbol id=\"i-auto\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 3.5a8.5 8.5 0 0 1 0 17z\" fill=\"currentColor\"/></symbol>\n    <symbol id=\"i-globe\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></symbol>\n    <symbol id=\"i-crown\" viewBox=\"0 0 24 24\"><path d=\"M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z\" fill=\"currentColor\"/></symbol>\n    <symbol id=\"i-copy\" viewBox=\"0 0 24 24\"><rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M16 5.5A2.5 2.5 0 0 0 13.5 3H6a3 3 0 0 0-3 3v7.5A2.5 2.5 0 0 0 5.5 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-back\" viewBox=\"0 0 24 24\"><path d=\"M15 5l-7 7 7 7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol>\n    <symbol id=\"i-menu\" viewBox=\"0 0 24 24\"><path d=\"M4 7h16M4 12h16M4 17h16\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></symbol>\n    <symbol id=\"i-mail\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"m4 7 8 6 8-6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol>\n    <symbol id=\"i-bell\" viewBox=\"0 0 24 24\"><path d=\"M6 10a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/><path d=\"M10 20.5a2.2 2.2 0 0 0 4 0\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></symbol>\n  </defs>\n</svg>";
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  const W = (fill, attrs = '') => `<svg viewBox="0 0 59 48" ${attrs}><use href="#w" fill="${fill}"/></svg>`;

  /*
   * 表情庫：頭像（64 viewBox）和插圖（160 viewBox）共用。
   * 規則：表情一律純黑——沒有眼白反光、沒有粉紅舌頭或腮紅，愛心眼也是黑色。
   * makeFace(kind, x, y, s, ns)
   *   s  = 縮放（1 = 頭像大小；插圖用 2 左右）
   *   ns = true 時線條用 non-scaling-stroke（頭像：任何尺寸都 2px）
   */
  function makeFace(kind, x, y, s = 1, ns = false) {
    const ink = '#22222c';
    const sw = ns ? 2 : 1.6 * s;
    const nsAttr = ns ? ' vector-effect="non-scaling-stroke"' : '';
    const L = `stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"${nsAttr}`;
    const P = (dx, dy) => `${x + dx * s} ${y + dy * s}`;
    const eye = dx => `<circle cx="${x + dx * s}" cy="${y}" r="${1.9 * s}" fill="${ink}"/>`;
    const dots = eye(-4.5) + eye(4.5);
    const arcUp = dx => `<path d="M${P(dx - 2, .8)}Q${P(dx, -1.8)} ${P(dx + 2, .8)}" ${L}/>`;
    const line = dx => `<path d="M${P(dx - 2, 0)}L${P(dx + 2, 0)}" ${L}/>`;
    const smile = `<path d="M${P(-2.4, 3)}Q${P(0, 5.6)} ${P(2.4, 3)}" ${L}/>`;
    const open = `<path d="M${P(-3, 2.6)}Q${P(0, 8)} ${P(3, 2.6)}Z" fill="${ink}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"${nsAttr}/>`;
    const heart = dx => `<path d="M${P(dx, 1.6)}C${P(dx - 3.2, -.6)} ${P(dx - 2.4, -3.2)} ${P(dx, -1.4)}C${P(dx + 2.4, -3.2)} ${P(dx + 3.2, -.6)} ${P(dx, 1.6)}Z" fill="${ink}"/>`;
    switch (kind) {
      case 'smile':  return dots + smile;
      case 'grin':   return dots + open;
      case 'happy':  return arcUp(-4.5) + arcUp(4.5) + open;
      case 'wink':   return eye(-4.5) + arcUp(4.5) + smile;
      case 'tongue': return dots + `<path d="M${P(-3, 3)}Q${P(0, 5)} ${P(3, 3)}" ${L}/><path d="M${P(-1.3, 4)}v${1.5 * s}a${1.3 * s} ${1.3 * s} 0 0 0 ${2.6 * s} 0v${-1.5 * s}z" fill="${ink}"/>`;
      case 'wow':    return dots + `<ellipse cx="${x}" cy="${y + 4.4 * s}" rx="${1.7 * s}" ry="${2.1 * s}" fill="${ink}"/>`;
      case 'cat':    return dots + `<path d="M${P(-3, 3)}Q${P(-1.5, 5)} ${P(0, 3)}Q${P(1.5, 5)} ${P(3, 3)}" ${L}/>`;
      case 'sleepy': return line(-4.5) + line(4.5) + `<circle cx="${x}" cy="${y + 4 * s}" r="${1.2 * s}" fill="${ink}"/>` + `<path d="M${P(8, -6)}h${2.5 * s}l${-2.5 * s} ${2.5 * s}h${2.5 * s}" ${L}/>`;
      case 'love':   return heart(-4.6) + heart(4.6) + smile;
      case 'worry':  return dots + `<path d="M${P(-2.2, 4.8)}Q${P(0, 2.8)} ${P(2.2, 4.8)}" ${L}/><path d="M${P(-6.6, -2.6)}l${2.6 * s} ${-1.1 * s}M${P(6.6, -2.6)}l${-2.6 * s} ${-1.1 * s}" ${L}/>`;
      case 'cool':   return `<path d="M${P(-7.5, -1.8)}h${6 * s}v${2 * s}a${2 * s} ${2 * s} 0 0 1 ${-6 * s} 0zM${P(1.5, -1.8)}h${6 * s}v${2 * s}a${2 * s} ${2 * s} 0 0 1 ${-6 * s} 0z" fill="${ink}"/><path d="M${P(-1.5, -1.6)}h${3 * s}" ${L}/><path d="M${P(-1, 3.4)}Q${P(1.5, 5.2)} ${P(3, 2.8)}" ${L}/>`;
      default:       return dots + smile;
    }
  }
  // 插圖描邊固定 4px（UI 線條 2px 的兩倍），不隨插圖縮放而變粗變細
  // 描邊粗細由 CSS 變數 --ill-sw 決定（預設 4px）；縮圖這種小尺寸設成 2px，不然線會比圖還搶眼
  const K = 'stroke="#22222c" style="stroke-width:var(--ill-sw, 4px)" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';
  const gap = (len = 80, g = 7) => `stroke-dasharray="${len} ${g}"`;
  const ground = `<path d="M22 118h46M78 118h10M98 118h34M142 118h4" ${K}/>`;
  const hl = () => ''; // 亮面改由「色塊錯開露出的白邊」表現，不另外畫高光
  const burst = (x, y, c) => `<g stroke="${c}" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y - 9}v5M${x} ${y + 4}v5M${x - 9} ${y}h5M${x + 4} ${y}h5M${x - 6} ${y - 6}l3 3M${x + 3} ${y + 3}l3 3M${x + 6} ${y - 6}l-3 3M${x - 3} ${y + 3}l-3 3"/></g>`;
  const plus = (x, y, c, s = 5) => `<path d="M${x} ${y - s}v${s * 2}M${x - s} ${y}h${s * 2}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
  const ring = (x, y, c, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="3"/>`;
  const dot = (x, y, c, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;

  /*
   * 插圖的核心畫法（照參考圖）：**色塊不把描邊填滿**。
   * 顏色往右下錯開幾 px，再用原本的形狀裁切——描邊內側左上會露出一條白邊，
   * 那條白邊就是「亮面」，不另外畫高光。描邊本身留幾個小缺口。
   *   body(形狀, 顏色, 陰影)：形狀是一個自閉合元素字串（<path …/>、<circle …/>），不要帶 fill
   */
  let clipSeq = 0;
  const OFF = 'translate(5 6)';
  const withAttr = (shape, attrs) => shape.replace(/\/>\s*$/, ` ${attrs}/>`);
  const body = (shape, fill, shade = '', dash = true) => {
    const id = `wclip${++clipSeq}`; // 前綴 w：跟設計系統頁自己的插圖（clip1、clip2⋯）放在同一頁時 id 才不會撞
    // 先墊一層白：錯開後沒被顏色蓋到的地方是白的，後面的線條、底圖才不會透出來
    return withAttr(shape, 'fill="#fff"') + `<clipPath id="${id}">${shape}</clipPath>` +
      `<g clip-path="url(#${id})"><g transform="${OFF}">${withAttr(shape, `fill="${fill}"`)}${shade}</g></g>` +
      withAttr(shape, `fill="none" ${K}${dash ? ' ' + gap() : ''}`);
  };

  /*
   * 竹筍角色（竹筍竹筍蹦蹦出的首頁插圖與遊戲內教學圖共用）。
   *   x   底部中心；h 高度（蹲著約 40、站著約 84）；face 表情；c 顏色
   *   底部固定在 y=118（ground 那條線），越高越瘦長
   */
  const shoot = (x, h, face = 'happy', c = '#4FB59A') => {
    const w = Math.min(30, 16 + h * 0.17), top = 118 - h, mid = 118 - h * 0.45;
    const leaf = `<path d="M${x} ${top + 4}q-2-10 8-14q-1 9-8 14z" fill="#8fd1b9" ${K}/>`;
    const sheath = `<path d="M${x - w + 4} ${118 - h * 0.28}q${w - 4} -10 ${w * 2 - 8} 0M${x - w * 0.7} ${118 - h * 0.6}q${w * 0.7} -8 ${w * 1.4} 0" fill="none" stroke="#2f8a6f" stroke-width="3" stroke-linecap="round"/>`;
    return leaf + body(`<path d="M${x - w} 117Q${x - w - 2} ${mid} ${x} ${top}Q${x + w + 2} ${mid} ${x + w} 117Z"/>`, c, sheath) +
      makeFace(face, x, 118 - h * 0.42, Math.min(2.2, 1 + h / 70));
  };

  const art = {
    // 阿瓦隆：藍紫塔樓＋黃旗＋聲波
    avalon: () => `
      ${ground}${burst(28, 30, '#FFC628')}${ring(140, 26, '#8799E9')}${plus(146, 70, '#FFC628')}${dot(22, 74, '#8799E9')}
      <path d="M80 34V12" ${K}/>
      ${body('<path d="M82 12h20l-5 6 5 6H82z"/>', '#FFC628', '', false)}
      ${body('<path d="M54 44h12v-10h9v10h10v-10h9v10h12v70H54z"/>', '#aebcf3', '<path d="M92 30h20v90H92z" fill="#8799E9"/>')}
      ${makeFace('wink', 80, 66, 2)}
      ${body('<path d="M71 114V100a9 9 0 0 1 18 0v14z"/>', '#3D54B6', '', false)}
      <path d="M122 62a14 14 0 0 1 0 22M130 54a26 26 0 0 1 0 38" fill="none" stroke="#8799E9" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 62a14 14 0 0 0 0 22M30 54a26 26 0 0 0 0 38" fill="none" stroke="#8799E9" stroke-width="5" stroke-linecap="round"/>`,
    // 搶答：橘色圓頂按鈕＋奶油黃底座
    buzzer: () => `
      ${ground}${burst(132, 28, '#FFC628')}${ring(26, 34, '#FF9419')}${plus(150, 76, '#FFC628')}${dot(20, 80, '#FF9419')}
      ${body('<path d="M30 96v8c0 7 22 12 50 12s50-5 50-12v-8z"/>', '#FFC628', '', false)}
      ${body('<ellipse cx="80" cy="96" rx="50" ry="13"/>', '#ffeec8', '', false)}
      ${body('<path d="M48 94c0-30 14-50 32-50s32 20 32 50c0 5-14 8-32 8s-32-3-32-8z"/>', '#ffb24f', '<path d="M90 40c16 8 26 30 26 60H90z" fill="#FF9419"/>')}
      ${makeFace('grin', 80, 76, 2.1)}
      <path d="M80 30v-10M58 36l-6-6M102 36l6-6" stroke="#FF9419" stroke-width="4.5" stroke-linecap="round"/>`,
    // 喜好二選一：O、X 兩張卡＋開心的愛心
    match: () => `
      ${ground}${burst(140, 24, '#FFC628')}${ring(20, 30, '#7489E6')}${plus(24, 84, '#FF9419')}${dot(150, 92, '#4FB59A')}
      <g transform="rotate(-9 52 76)">
        ${body('<rect x="26" y="46" width="52" height="64" rx="12"/>', '#a8dccb', '<path d="M62 40h24v80H62z" fill="#7cc9b1"/>')}
        <circle cx="52" cy="78" r="14" fill="none" stroke="#2d8c71" stroke-width="7"/>
      </g>
      <g transform="rotate(9 108 76)">
        ${body('<rect x="82" y="46" width="52" height="64" rx="12"/>', '#fbbcb1', '<path d="M118 40h24v80h-24z" fill="#f29b8c"/>')}
        <path d="M97 64l22 26M119 64L97 90" stroke="#c4483a" stroke-width="7" stroke-linecap="round"/>
      </g>
      ${body('<path d="M80 44c-7-14-27-10-25 4 1 11 25 22 25 22s24-11 25-22c2-14-18-18-25-4z"/>', '#F3A4FB', '', false)}
      ${makeFace('happy', 80, 52, 1.35)}`,
    // 幸福賓果：九宮格賓果卡，斜線三格連成一線，卡片頂端是一張笑臉
    bingo: () => `
      ${ground}${burst(26, 28, '#7489E6')}${ring(144, 26, '#FF9419')}${plus(146, 74, '#4FB59A')}${dot(18, 76, '#F3A4FB')}
      ${body('<rect x="40" y="14" width="80" height="100" rx="12"/>', '#FFC628', '<path d="M104 8h24v112h-24z" fill="#eda90c"/>')}
      ${makeFace('love', 80, 27, 1.5)}
      ${[0, 1, 2].map(r => [0, 1, 2].map(c => {
        const x = 50 + c * 21, y = 44 + r * 21, hit = r === c;
        return body(`<rect x="${x}" y="${y}" width="18" height="18" rx="4"/>`, hit ? '#F3A4FB' : '#ffffff', '', false) +
          (hit ? `<circle cx="${x + 9}" cy="${y + 9}" r="4.5" fill="#22222c"/>` : '');
      }).join('')).join('')}`,
    // 定時炸彈：擔心的炸彈＋汗滴＋引信火花
    bomb: () => `
      ${ground}${ring(26, 32, '#7489E6')}${plus(146, 92, '#4FB59A')}${dot(22, 84, '#FFC628')}
      <path d="M94 34c8-12 18-14 26-8" fill="none" ${K}/>
      ${burst(126, 20, '#FFC628')}${dot(126, 20, '#FF9419', 4)}
      <g transform="rotate(32 91 40)">${body('<rect x="80" y="32" width="22" height="16" rx="4"/>', '#7489E6', '', false)}</g>
      ${body('<circle cx="76" cy="80" r="34"/>', '#EE7B6A', '<path d="M98 50a38 38 0 0 1-32 70h40z" fill="#d4685a"/>')}
      ${makeFace('worry', 76, 80, 2.2)}
      ${body('<path d="M104 62q5 7 0 11q-5-4 0-11z"/>', '#ffffff', '', false)}`,
    // 竹筍竹筍蹦蹦出：一根站起來的竹筍、旁邊兩根還蹲著
    bamboo: () => `
      ${ground}${burst(132, 24, '#FFC628')}${ring(24, 30, '#7489E6')}${plus(148, 84, '#FF9419')}
      ${shoot(36, 38, 'smile', '#a8dccb')}${shoot(124, 40, 'wow', '#a8dccb')}${shoot(80, 88, 'grin')}`,
    // 上樓下樓：一棟笑臉大樓，旁邊一個往上、一個往下的箭頭
    stairs: () => `
      ${ground}${burst(136, 22, '#FFC628')}${ring(24, 30, '#EE7B6A')}${dot(146, 96, '#4FB59A', 4)}
      ${body('<rect x="52" y="20" width="56" height="97" rx="8"/>', '#7489E6', '<rect x="52" y="20" width="56" height="12" fill="#5d72d0"/>')}
      <path d="M62 44h10M88 44h10M62 60h10M88 60h10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      ${makeFace('happy', 80, 86, 1.6)}
      ${body('<path d="M26 66l12-16 12 16z"/>', '#4FB59A', '', false)}
      ${body('<path d="M110 74l12 16 12-16z"/>', '#EE7B6A', '', false)}`,
    // 果園菜園動物園：笑咪咪的蘋果，葉子旁邊一根小紅蘿蔔
    orchard: () => `
      ${ground}${burst(140, 22, '#FFC628')}${ring(22, 30, '#7489E6')}${dot(150, 96, '#4FB59A', 4)}
      ${body('<path d="M118 112l14-34 10 6z"/>', '#FF9419', '', false)}
      <path d="M137 80l6-10M141 83l9-5" stroke="#4FB59A" stroke-width="5" stroke-linecap="round"/>
      ${body('<path d="M78 46c-14-11-44-6-44 24 0 28 22 50 44 44 22 6 44-16 44-44 0-30-30-35-44-24z"/>', '#EE7B6A', '<path d="M104 46c18 12 16 50-10 64h28V46z" fill="#d4604f"/>')}
      <path d="M78 46c0-10 3-17 8-21" fill="none" ${K}/>
      ${body('<path d="M86 30c6-12 22-14 28-8-6 10-18 14-28 8z"/>', '#4FB59A', '', false)}
      ${makeFace('grin', 78, 80, 1.6)}`,
    // 倒放猜猜看：粉紅錄音機，卡帶窗兩個捲盤，右上角倒轉的箭頭
    reverse: () => `
      ${ground}${burst(26, 24, '#FFC628')}${ring(146, 96, '#7489E6')}${dot(16, 92, '#4FB59A', 4)}
      <path d="M58 42V32a6 6 0 0 1 6-6h32a6 6 0 0 1 6 6v10" fill="none" ${K}/>
      ${body('<rect x="28" y="42" width="104" height="74" rx="12"/>', '#F3A4FB', '<path d="M116 34h24v90h-24z" fill="#e083ea"/>')}
      ${makeFace('grin', 80, 58, 1.4)}
      ${body('<rect x="42" y="74" width="76" height="30" rx="7"/>', '#ffffff', '', false)}
      <circle cx="62" cy="89" r="7" fill="none" ${K}/><circle cx="98" cy="89" r="7" fill="none" ${K}/>
      <path d="M69 89h22" stroke="#22222c" stroke-width="3" stroke-linecap="round"/>
      <path d="M150 34l-8 7 8 7M140 34l-8 7 8 7" fill="none" stroke="#7489E6" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    // 木頭人動作版（2026-10-28 改成有木頭人的意象，使用者要求）：右邊的鬼趴在樹上蒙眼（背對、看不到臉），
    // 左邊的小人身體歪一邊、兩手亂擺，被喊「木頭人」定格在半空中（嘴巴 O 型、旁邊兩道定格線）
    statue: () => {
      // 手臂跟身體的描邊一樣粗（不跟著縮放，同動作插圖的畫法），不然放大縮小時手臂的黑邊會比身體粗或細
      const arm = (d, c) => `<path d="${d}" fill="none" stroke="#22222c" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:calc(var(--arm-w, 6px) + var(--ill-sw, 4px) * 2)"/><path d="${d}" fill="none" stroke="${c}" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:var(--arm-w, 6px)"/>`;
      return `
      ${ground}${burst(18, 24, '#FFC628')}${ring(96, 22, '#4FB59A')}${dot(80, 104, '#F3A4FB', 4)}
      <rect x="128" y="46" width="14" height="72" rx="4" fill="#ffc27a" ${K}/>
      ${body('<circle cx="135" cy="36" r="18"/>', '#a8dccb', '<path d="M141 12h20v50h-20z" fill="#7cc9b1"/>', false)}
      ${body('<path d="M92 117V72A16 16 0 0 1 124 72V117Z"/>', '#fbbff5', '<path d="M112 50h20v76h-20z" fill="#ef9fe8"/>')}
      ${arm('M118 80q10 -4 12 -14', '#fbbff5')}
      ${arm('M36 82q-14 -8 -14 -26', '#aebcf3')}${arm('M64 80q14 -4 16 -20', '#aebcf3')}
      <g transform="rotate(-8 50 90)">
            ${body('<path d="M30 110V64A21 21 0 0 1 72 64V110Z"/>', '#aebcf3', '<path d="M58 36h24v80h-24z" fill="#8799E9"/>')}
      ${makeFace('wow', 51, 70, 2)}</g>
      <path d="M12 74l-7 -3M14 86h-8M82 44l6 -5M86 54l7 -1" fill="none" stroke="#EE7B6A" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:var(--ill-sw, 4px)"/>`;
    },
    // 比手畫腳：一隻小人在比動作（使用者要求不放題卡），左邊問號泡泡、右邊對話框裡三個方塊（像蓋起來的題目）（一手放耳邊、一手往外指），旁邊冒出問號泡泡
    charades: () => {
      const arm = (d) => `<path d="${d}" fill="none" stroke="#22222c" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fbbff5" stroke-width="6" stroke-linecap="round"/>`;
      const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="#fbbff5" ${K}/>`;
      const bubble = (x, y) => `${body(`<path d="M${x - 13} ${y - 12}h26a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-14l-7 7v-7h-5a6 6 0 0 1-6-6v-14a6 6 0 0 1 6-6z"/>`, '#ffffff', '', false)}<text x="${x}" y="${y + 3}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="900" fill="#22222c" font-family="Fredoka, Nunito, sans-serif">?</text>`;
      const boxes = (x, y) => `${body(`<path d="M${x - 28} ${y - 15}h56a7 7 0 0 1 7 7v20a7 7 0 0 1-7 7h-36l-9 8v-8h-11a7 7 0 0 1-7-7v-20a7 7 0 0 1 7-7z"/>`, '#ffffff', '', false)}${[-17, 0, 17].map((dx) => `<rect x="${x + dx - 6.5}" y="${y - 5.5}" width="13" height="13" rx="3" fill="none" stroke="#22222c" stroke-width="2.8"/>`).join('')}`;
      return `
      ${ground}${burst(30, 96, '#FFC628')}${ring(150, 70, '#4FB59A')}${dot(18, 40, '#EE7B6A', 4)}
      ${arm('M60 72q-14 -6 -12 -26')}${hand(48, 46)}${arm('M96 78q16 2 22 -8')}${hand(118, 70)}
      ${body('<path d="M56 117V60A22 22 0 0 1 100 60V117Z"/>', '#fbbff5', '<path d="M86 28h44v100H86z" fill="#ef9fe8"/>')}
      ${makeFace('wow', 78, 66, 2)}
      ${bubble(30, 30)}${boxes(122, 26)}`;
    },
    // 動作抽卡（桌遊助手）：一疊卡，最上面那張只畫一個問號（使用者要求卡片簡單、不畫動作）；左下角一台在閃光的相機（三連拍）
    toolActions: () => {
      const card = (x, y, c, a) => `<g transform="rotate(${a} ${x + 27} ${y + 36})">${body(`<rect x="${x}" y="${y}" width="54" height="72" rx="9"/>`, c, '', false)}</g>`;
      return `
      ${ground}${burst(146, 20, '#FFC628')}${ring(150, 84, '#4FB59A')}${dot(16, 30, '#F3A4FB', 4)}
      ${card(62, 30, '#fbb3a8', -14)}${card(96, 34, '#a8dccb', 12)}${card(78, 26, '#FFC628', 0)}
      <path d="M97 52q0-11 8-11t8 9.5q0 6-8 9v6" fill="none" ${K}/><circle cx="105" cy="78" r="3.4" fill="#22222c"/>
      ${body('<rect x="14" y="78" width="50" height="34" rx="7"/>', '#7489E6', '<path d="M50 70h20v50H50z" fill="#5d72d0"/>')}
      <path d="M26 78l4-7h14l4 7" fill="none" ${K}/>
      ${body('<circle cx="39" cy="95" r="10"/>', '#ffffff', '', false)}<circle cx="39" cy="95" r="4" fill="#22222c"/>
      ${burst(22, 62, '#FFC628')}`;
    },
    // 抽題目（桌遊助手，2026-10-28）：一疊題卡，最上面那張畫三個方塊（跟比手畫腳蓋起來的題目一樣）
    toolWords: () => `
      ${ground}${burst(140, 22, '#FFC628')}${ring(22, 34, '#4FB59A')}${plus(144, 94, '#7489E6')}${dot(20, 94, '#EE7B6A')}
      <g transform="rotate(-12 60 70)">${body('<rect x="33" y="34" width="54" height="72" rx="9"/>', '#fbbff5')}</g>
      <g transform="rotate(10 100 70)">${body('<rect x="73" y="34" width="54" height="72" rx="9"/>', '#aebcf3')}</g>
      ${body('<rect x="44" y="26" width="72" height="80" rx="10"/>', '#ffc27a', '<path d="M100 18h24v96h-24z" fill="#FF9419"/>')}
      ${[-19, 0, 19].map((dx) => `<rect x="${80 + dx - 7.5}" y="58" width="15" height="15" rx="3.5" fill="#ffffff" stroke="#22222c" stroke-width="3"/>`).join('')}`,
    // 桌遊助手的小工具（2026-10-22）：拉霸機、節拍器（擺錘正中間、不放表情）、一疊名稱卡
    toolSlot: () => `
      ${ground}${burst(140, 22, '#FFC628')}${ring(22, 32, '#EE7B6A')}${dot(150, 96, '#7489E6', 4)}
      ${body('<rect x="36" y="30" width="80" height="84" rx="12"/>', '#FFC628', '<path d="M100 22h24v100h-24z" fill="#e3a90f"/>')}
      ${body('<rect x="46" y="44" width="60" height="30" rx="6"/>', '#ffffff', '', false)}
      <path d="M66 46v26M86 46v26" stroke="#22222c" stroke-width="3"/>
      <text x="56" y="65" text-anchor="middle" font-size="16" font-weight="900" fill="#EE7B6A" font-family="Fredoka, Nunito, sans-serif">?</text>
      <text x="76" y="65" text-anchor="middle" font-size="16" font-weight="900" fill="#7489E6" font-family="Fredoka, Nunito, sans-serif">!</text>
      <text x="96" y="65" text-anchor="middle" font-size="16" font-weight="900" fill="#4FB59A" font-family="Fredoka, Nunito, sans-serif">?</text>
      <path d="M116 60h10v-22" fill="none" ${K}/>${body('<circle cx="126" cy="34" r="7"/>', '#EE7B6A', '', false)}
      ${makeFace('grin', 76, 94, 1.3)}`,
    toolMetronome: () => `
      ${ground}${burst(140, 26, '#FFC628')}${ring(24, 34, '#4FB59A')}${plus(146, 92, '#7489E6')}
      ${body('<path d="M60 20h40l22 96H38z"/>', '#7489E6', '<path d="M92 14l34 106h-20z" fill="#5d72d0"/>')}
      <path d="M80 104V32" stroke="#22222c" stroke-width="4" stroke-linecap="round"/>
      ${body('<rect x="72" y="52" width="16" height="14" rx="3"/>', '#FFC628', '', false)}`,
    toolNames: () => `
      ${ground}${burst(138, 24, '#FFC628')}${ring(22, 34, '#7489E6')}${plus(142, 92, '#EE7B6A')}${dot(20, 92, '#4FB59A')}
      <g transform="rotate(-14 63 70)">${body('<rect x="36" y="34" width="54" height="72" rx="9"/>', '#FFC628')}</g>
      <g transform="rotate(12 97 70)">${body('<rect x="70" y="34" width="54" height="72" rx="9"/>', '#aebcf3')}</g>
      ${body('<rect x="53" y="28" width="54" height="72" rx="9"/>', '#4FB59A')}
      ${makeFace('grin', 80, 64, 1.3)}`,
    // 幸福模擬器：戴墨鏡的大螢幕＋愛心
    happiness: () => `
      ${ground}${burst(140, 20, '#F3A4FB')}${ring(22, 26, '#FFC628')}${plus(150, 70, '#FF9419')}${dot(16, 76, '#7489E6')}
      ${body('<path d="M70 96h20l4 18H66z"/>', '#4FB59A', '', false)}
      ${body('<rect x="28" y="28" width="104" height="72" rx="14"/>', '#4FB59A', '<path d="M114 20h24v90h-24z" fill="#388671"/>')}
      ${body('<rect x="40" y="40" width="80" height="48" rx="8"/>', '#eaf7f2', '', false)}
      ${makeFace('cool', 80, 60, 2.2)}
      ${body('<path d="M80 16c-4-8-15-6-14 2 1 6 14 12 14 12s13-6 14-12c1-8-10-10-14-2z"/>', '#EE7B6A', '', false)}`,
  };


  const AVATARS = [{"id":"pizza","bg":"#B8D9F7","svg":"<path d=\"M32 11L51 46Q32 54 13 46Z\" fill=\"#fff\"/><clipPath id=\"av-pizza-1\"><path d=\"M32 11L51 46Q32 54 13 46Z\"/></clipPath><g clip-path=\"url(#av-pizza-1)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M32 11L51 46Q32 54 13 46Z\" fill=\"#FCE38A\"/><path d=\"M8 41Q32 52 56 41V58H8z\" fill=\"#F2B860\"/></g></g><path d=\"M32 11L51 46Q32 54 13 46Z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"35\" r=\"2.1849999999999996\" fill=\"#22222c\"/><circle cx=\"37.175\" cy=\"35\" r=\"2.1849999999999996\" fill=\"#22222c\"/><path d=\"M28.55 37.99Q32 44.2 35.45 37.99Z\" fill=\"#22222c\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"boba","bg":"#F7D0E2","svg":"<path d=\"M18 18h28l-3 32a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z\" fill=\"#fff\"/><clipPath id=\"av-boba-2\"><path d=\"M18 18h28l-3 32a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z\"/></clipPath><g clip-path=\"url(#av-boba-2)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M18 18h28l-3 32a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z\" fill=\"#E7C29A\"/><path d=\"M40 14h12v44H40z\" fill=\"#cf9f6e\"/></g></g><path d=\"M18 18h28l-3 32a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M34 18l4-12\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"34\" r=\"2.1849999999999996\" fill=\"#22222c\"/><path d=\"M34.875 34.92Q37.175 31.93 39.475 34.92\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M29.240000000000002 37.45Q32 40.44 34.76 37.45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"donut","bg":"#CBEBC4","svg":"<circle cx=\"32\" cy=\"33\" r=\"20\" fill=\"#fff\"/><clipPath id=\"av-donut-3\"><circle cx=\"32\" cy=\"33\" r=\"20\"/></clipPath><g clip-path=\"url(#av-donut-3)\"><g transform=\"translate(2.6 3.2)\"><circle cx=\"32\" cy=\"33\" r=\"20\" fill=\"#F7A8C8\"/><path d=\"M40 10a24 24 0 0 1-8 46h22V10z\" fill=\"#ec8fb5\"/></g></g><circle cx=\"32\" cy=\"33\" r=\"20\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M24.525 31.92Q26.825 28.93 29.125 31.92\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M34.875 31.92Q37.175 28.93 39.475 31.92\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M28.55 33.99Q32 40.2 35.45 33.99Z\" fill=\"#22222c\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"strawberry","bg":"#FEE4BF","svg":"<path d=\"M32 55C19 49 13 38 14 29c1-6 6-8 18-8s17 2 18 8c1 9-5 20-18 26z\" fill=\"#fff\"/><clipPath id=\"av-straw-4\"><path d=\"M32 55C19 49 13 38 14 29c1-6 6-8 18-8s17 2 18 8c1 9-5 20-18 26z\"/></clipPath><g clip-path=\"url(#av-straw-4)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M32 55C19 49 13 38 14 29c1-6 6-8 18-8s17 2 18 8c1 9-5 20-18 26z\" fill=\"#F58A82\"/><path d=\"M42 18c12 10 10 30-6 42h22V18z\" fill=\"#de6b63\"/></g></g><path d=\"M32 55C19 49 13 38 14 29c1-6 6-8 18-8s17 2 18 8c1 9-5 20-18 26z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M22 22l-3-7 8 3 5-7 5 7 8-3-3 7z\" fill=\"#fff\"/><clipPath id=\"av-straw-l-5\"><path d=\"M22 22l-3-7 8 3 5-7 5 7 8-3-3 7z\"/></clipPath><g clip-path=\"url(#av-straw-l-5)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M22 22l-3-7 8 3 5-7 5 7 8-3-3 7z\" fill=\"#93C47D\"/></g></g><path d=\"M22 22l-3-7 8 3 5-7 5 7 8-3-3 7z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M23.375 32.93h6.8999999999999995v2.3a2.3 2.3 0 0 1 -6.8999999999999995 0zM33.725 32.93h6.8999999999999995v2.3a2.3 2.3 0 0 1 -6.8999999999999995 0z\" fill=\"#22222c\"/><path d=\"M30.275 33.16h3.4499999999999997\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M30.85 38.91Q33.725 40.98 35.45 38.22\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"avocado","bg":"#DCD6F5","svg":"<path d=\"M32 8c9 0 12 10 14 18 3 11 3 28-14 29C15 54 15 37 18 26c2-8 5-18 14-18z\" fill=\"#fff\"/><clipPath id=\"av-avo-6\"><path d=\"M32 8c9 0 12 10 14 18 3 11 3 28-14 29C15 54 15 37 18 26c2-8 5-18 14-18z\"/></clipPath><g clip-path=\"url(#av-avo-6)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M32 8c9 0 12 10 14 18 3 11 3 28-14 29C15 54 15 37 18 26c2-8 5-18 14-18z\" fill=\"#d9ea9a\"/><path d=\"M40 6c12 14 13 36-6 52h22V6z\" fill=\"#b5d36e\"/></g></g><path d=\"M32 8c9 0 12 10 14 18 3 11 3 28-14 29C15 54 15 37 18 26c2-8 5-18 14-18z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"33\" r=\"2.1849999999999996\" fill=\"#22222c\"/><circle cx=\"37.175\" cy=\"33\" r=\"2.1849999999999996\" fill=\"#22222c\"/><path d=\"M28.55 36.45Q30.275 38.75 32 36.45Q33.725 38.75 35.45 36.45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"egg","bg":"#FBD8D3","svg":"<path d=\"M12 36c-2-10 6-18 15-19 6-7 19-4 22 5 7 4 6 16-2 19-4 8-17 10-23 4-7 1-12-3-12-9z\" fill=\"#fff\"/><clipPath id=\"av-egg-7\"><path d=\"M12 36c-2-10 6-18 15-19 6-7 19-4 22 5 7 4 6 16-2 19-4 8-17 10-23 4-7 1-12-3-12-9z\"/></clipPath><g clip-path=\"url(#av-egg-7)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M12 36c-2-10 6-18 15-19 6-7 19-4 22 5 7 4 6 16-2 19-4 8-17 10-23 4-7 1-12-3-12-9z\" fill=\"#ffffff\"/></g></g><path d=\"M12 36c-2-10 6-18 15-19 6-7 19-4 22 5 7 4 6 16-2 19-4 8-17 10-23 4-7 1-12-3-12-9z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"32\" cy=\"34\" r=\"11\" fill=\"#fff\"/><clipPath id=\"av-egg-y-8\"><circle cx=\"32\" cy=\"34\" r=\"11\"/></clipPath><g clip-path=\"url(#av-egg-y-8)\"><g transform=\"translate(2.6 3.2)\"><circle cx=\"32\" cy=\"34\" r=\"11\" fill=\"#FCC95A\"/></g></g><circle cx=\"32\" cy=\"34\" r=\"11\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"33\" r=\"2.1849999999999996\" fill=\"#22222c\"/><circle cx=\"37.175\" cy=\"33\" r=\"2.1849999999999996\" fill=\"#22222c\"/><ellipse cx=\"32\" cy=\"38.06\" rx=\"1.9549999999999998\" ry=\"2.415\" fill=\"#22222c\"/>"},{"id":"icecream","bg":"#C4EDE4","svg":"<path d=\"M22 35h20L32 58z\" fill=\"#fff\"/><clipPath id=\"av-ice-c-9\"><path d=\"M22 35h20L32 58z\"/></clipPath><g clip-path=\"url(#av-ice-c-9)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M22 35h20L32 58z\" fill=\"#F2C98A\"/></g></g><path d=\"M22 35h20L32 58z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"32\" cy=\"24\" r=\"14\" fill=\"#fff\"/><clipPath id=\"av-ice-10\"><circle cx=\"32\" cy=\"24\" r=\"14\"/></clipPath><g clip-path=\"url(#av-ice-10)\"><g transform=\"translate(2.6 3.2)\"><circle cx=\"32\" cy=\"24\" r=\"14\" fill=\"#F7A8C8\"/><path d=\"M37 8a16 16 0 0 1-6 32h16V8z\" fill=\"#ec8fb5\"/></g></g><circle cx=\"32\" cy=\"24\" r=\"14\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"23\" r=\"2.1849999999999996\" fill=\"#22222c\"/><circle cx=\"37.175\" cy=\"23\" r=\"2.1849999999999996\" fill=\"#22222c\"/><path d=\"M28.55 26.45Q32 28.75 35.45 26.45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M30.505 27.6v1.7249999999999999a1.4949999999999999 1.4949999999999999 0 0 0 2.9899999999999998 0v-1.7249999999999999z\" fill=\"#22222c\"/>"},{"id":"onigiri","bg":"#FDD6BB","svg":"<path d=\"M32 10c4 0 19 27 19 34 0 7-7 10-19 10s-19-3-19-10c0-7 15-34 19-34z\" fill=\"#fff\"/><clipPath id=\"av-oni-11\"><path d=\"M32 10c4 0 19 27 19 34 0 7-7 10-19 10s-19-3-19-10c0-7 15-34 19-34z\"/></clipPath><g clip-path=\"url(#av-oni-11)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M32 10c4 0 19 27 19 34 0 7-7 10-19 10s-19-3-19-10c0-7 15-34 19-34z\" fill=\"#ffffff\"/></g></g><path d=\"M32 10c4 0 19 27 19 34 0 7-7 10-19 10s-19-3-19-10c0-7 15-34 19-34z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M24 43h16v11H24z\" fill=\"#fff\"/><clipPath id=\"av-oni-n-12\"><path d=\"M24 43h16v11H24z\"/></clipPath><g clip-path=\"url(#av-oni-n-12)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M24 43h16v11H24z\" fill=\"#2f5a3a\"/></g></g><path d=\"M24 43h16v11H24z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <circle cx=\"26.825\" cy=\"32\" r=\"2.1849999999999996\" fill=\"#22222c\"/><circle cx=\"37.175\" cy=\"32\" r=\"2.1849999999999996\" fill=\"#22222c\"/><path d=\"M29.240000000000002 35.45Q32 38.44 34.76 35.45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"mushroom","bg":"#D6E2F7","svg":"<path d=\"M23 36h18v13a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z\" fill=\"#fff\"/><clipPath id=\"av-mush-s-13\"><path d=\"M23 36h18v13a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z\"/></clipPath><g clip-path=\"url(#av-mush-s-13)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M23 36h18v13a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z\" fill=\"#FDF0DC\"/></g></g><path d=\"M23 36h18v13a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M10 34c0-12 10-23 22-23s22 11 22 23c0 2-2 3-4 3H14c-2 0-4-1-4-3z\" fill=\"#fff\"/><clipPath id=\"av-mush-14\"><path d=\"M10 34c0-12 10-23 22-23s22 11 22 23c0 2-2 3-4 3H14c-2 0-4-1-4-3z\"/></clipPath><g clip-path=\"url(#av-mush-14)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M10 34c0-12 10-23 22-23s22 11 22 23c0 2-2 3-4 3H14c-2 0-4-1-4-3z\" fill=\"#F58A82\"/><path d=\"M42 8c12 6 16 18 14 32H42z\" fill=\"#de6b63\"/></g></g><path d=\"M10 34c0-12 10-23 22-23s22 11 22 23c0 2-2 3-4 3H14c-2 0-4-1-4-3z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M24.525 45L29.125 45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><path d=\"M34.875 45L39.475 45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/><circle cx=\"32\" cy=\"49.6\" r=\"1.38\" fill=\"#22222c\"/><path d=\"M41.2 38.1h2.875l-2.875 2.875h2.875\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"},{"id":"lemon","bg":"#D3EFB2","svg":"<path d=\"M11 35c0-11 9-19 21-19s21 8 21 19-9 19-21 19-21-8-21-19z\" fill=\"#fff\"/><clipPath id=\"av-lemon-15\"><path d=\"M11 35c0-11 9-19 21-19s21 8 21 19-9 19-21 19-21-8-21-19z\"/></clipPath><g clip-path=\"url(#av-lemon-15)\"><g transform=\"translate(2.6 3.2)\"><path d=\"M11 35c0-11 9-19 21-19s21 8 21 19-9 19-21 19-21-8-21-19z\" fill=\"#FCE38A\"/><path d=\"M42 12c13 9 13 32-4 44h18V12z\" fill=\"#f0c94a\"/></g></g><path d=\"M11 35c0-11 9-19 21-19s21 8 21 19-9 19-21 19-21-8-21-19z\" fill=\"none\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" vector-effect=\"non-scaling-stroke\"/> <path d=\"M26.71 36.84C23.03 34.31 23.950000000000003 31.32 26.71 33.39C29.47 31.32 30.39 34.31 26.71 36.84Z\" fill=\"#22222c\"/><path d=\"M37.29 36.84C33.61 34.31 34.53 31.32 37.29 33.39C40.05 31.32 40.97 34.31 37.29 36.84Z\" fill=\"#22222c\"/><path d=\"M29.240000000000002 38.45Q32 41.44 34.76 38.45\" stroke=\"#22222c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" vector-effect=\"non-scaling-stroke\"/>"}];
  const foodSvg = id => { const a = AVATARS.find(x => x.id === id) || AVATARS[0]; return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${a.bg}"/>${a.svg}</svg>`; };

  /* 真的 QR code，畫成設計系統房號卡的樣子：圓角點＋三個定位方塊（外黑、內白、中心靛藍）。
     qr 是 qrcode-generator 做好的物件（getModuleCount / isDark）；靜區由 .qr 外框的白底內距給 */
  const qrSvg = qr => {
    const n = qr.getModuleCount();
    const inFinder = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" fill="#111113"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6" fill="#3D54B6"/>`;
    let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && qr.isDark(y, x)) cells += `<rect x="${x}" y="${y}" width="1" height="1" rx=".3" fill="#111113"/>`;
    }
    return `<svg viewBox="0 0 ${n} ${n}" aria-hidden="true">${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
  };

  window.Woohop = { W, makeFace, body, shoot, art, AVATARS, foodSvg, ground, burst, plus, ring, dot, K, qrSvg };
})();

/*
 * 動作卡的插圖（window.Woohop.actionArt）：一個動作一張，2026-10-28 從木頭人動作版搬來，跟 src/action-cards.mjs 的代號對應。
 * 角色是首頁主視覺那幾隻小人（畫法照 hero-art.js 的 bean／shade／arm，那邊沒匯出，這裡是複本）。
 * 每張都是 viewBox 0 0 120 128、地板在 y=118；小人顏色由呼叫的人給：actionArt[代號]([主色, 陰影色])。
 * 插圖裡的小東西（雞冠、鳥嘴）用 tiny() 直接填色：body 的色塊往右下錯開，形狀太小時顏色會整個偏出去。
 */
(function () {
  'use strict';

  var W = window.Woohop;
  var K = W.K;
  var INK = '#22222c';

  // 圓頭長身：x 中心、top 頭頂、w 寬、h 高
  function bean(x, top, w, h) {
    return '<path d="M' + (x - w / 2) + ' ' + (top + h) + 'V' + (top + w / 2) + 'A' + w / 2 + ' ' + w / 2 + ' 0 0 1 ' + (x + w / 2) + ' ' + (top + w / 2) + 'V' + (top + h) + 'Z"/>';
  }
  // 小人本體＋表情（表情在頭的位置，跟寬度一起縮放）。face 是 'eyes' 時只畫眼睛：嘴巴會被鳥嘴、象鼻、鬍子蓋住
  function guy(c, x, top, w, h, face) {
    var shade = '<path d="M' + (x + w * 0.18) + ' ' + (top - 10) + 'h' + w + 'v' + (h + 20) + 'h' + -w + 'z" fill="' + c[1] + '"/>';
    var s = w / 20, y = top + w * 0.5;
    var eyes = '<circle cx="' + (x - 4.5 * s) + '" cy="' + y + '" r="' + 1.9 * s + '" fill="' + INK + '"/><circle cx="' + (x + 4.5 * s) + '" cy="' + y + '" r="' + 1.9 * s + '" fill="' + INK + '"/>';
    return W.body(bean(x, top, w, h), c[0], shade) + (face === 'eyes' ? eyes : W.makeFace(face, x, y, s));
  }
  // 手：一條粗線，尾端一顆圓手掌
  function arm(c, d, hx, hy) {
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:calc(var(--arm-w, 6px) + var(--ill-sw, 4px) * 2)"/>' +
      '<path d="' + d + '" fill="none" stroke="' + c[0] + '" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:var(--arm-w, 6px)"/>' +
      (hx === undefined ? '' : '<circle cx="' + hx + '" cy="' + hy + '" r="6" fill="' + c[0] + '" ' + K + '/>');
  }
  var solid = function (shape, fill) { return W.body(shape, fill, '', false); };
  // 小東西（雞冠、鳥嘴）直接填滿：body 的色塊會往右下錯開，形狀太小時顏色整個偏出去、只剩白底
  var tiny = function (shape, fill) { return shape.replace(/\/>\s*$/,' fill="' + fill + '" ' + K + '/>'); };
  var line = function (d) { return '<path d="' + d + '" fill="none" ' + K + '/>'; };
  // 彩色的動態線（不用黑描邊）
  var swish = function (d, color) { return '<path d="' + d + '" fill="none" stroke="' + (color || '#7489E6') + '" stroke-width="3.5" stroke-linecap="round"/>'; };
  var rot = function (a, cx, cy, inner) { return '<g transform="rotate(' + a + ' ' + cx + ' ' + cy + ')">' + inner + '</g>'; };
  var GROUND = '<path d="M14 118h52M76 118h10M96 118h12" ' + K + '/>';
  // 在空中：腳下的跳躍線
  var AIR = swish('M44 112h10M66 112h10', '#7489E6') + '<path d="M30 122h60" ' + K + ' stroke-dasharray="10 8"/>';

  var ART = {
    // 騎摩托車：坐在紅色機車上，手握把手
    moto: function (c) {
      return guy(c, 54, 30, 34, 56, 'grin') + arm(c, 'M70 62q12 -4 22 -10', 92, 52) +
        solid('<path d="M18 100q0-16 18-16h36l14-30h8l-6 46z"/>', '#EE7B6A') + line('M90 54l10-6') +
        solid('<circle cx="30" cy="104" r="11"/>', '#3D54B6') + solid('<circle cx="92" cy="104" r="11"/>', '#3D54B6') +
        swish('M6 80h8M2 92h10', '#FFC628');
    },
    // 螃蟹走路：兩隻手舉高比 YA 當鉗子（使用者要求），左右箭頭
    crab: function (c) {
      var ya = function (x, y) { return arm(c, 'M' + x + ' ' + y + 'l-6 -14') + arm(c, 'M' + x + ' ' + y + 'l5 -15', x, y); };
      return arm(c, 'M42 78q-18 -10 -22 -34') + arm(c, 'M78 78q18 -10 22 -34') + ya(20, 44) + ya(100, 44) +
        guy(c, 60, 34, 40, 84, 'happy') +
        swish('M6 104h16m-6 -6 -6 6 6 6', '#EE7B6A') + swish('M114 104h-16m6 -6 6 6 -6 6', '#EE7B6A') + GROUND;
    },
    // 企鵝搖擺：白肚子、短短的手往外、橘色腳，身體歪一邊
    penguin: function (c) {
      return rot(-8, 60, 118,
        arm(c, 'M40 82q-12 6 -16 18', 24, 100) + arm(c, 'M80 82q12 6 16 18', 96, 100) +
        guy(c, 60, 26, 44, 88, 'happy') + solid('<ellipse cx="60" cy="90" rx="13" ry="20"/>', '#ffffff') +
        solid('<path d="M42 118q6-10 14 0z"/>', '#FF9419') + solid('<path d="M64 118q6-10 14 0z"/>', '#FF9419')) +
        swish('M10 70q-4 8 0 16M110 70q4 8 0 16', '#7489E6') + GROUND;
    },
    // 袋鼠跳：跳在半空，手縮在胸前，肚子上一個口袋
    kangaroo: function (c) {
      return guy(c, 60, 12, 40, 80, 'grin') + solid('<path d="M48 70h24v12a12 12 0 0 1-24 0z"/>', c[1]) +
        arm(c, 'M42 58q-8 6 -4 14', 38, 72) + arm(c, 'M78 58q8 6 4 14', 82, 72) +
        swish('M40 100q20 -10 40 0', '#FFC628') + AIR;
    },
    // 單腳跳：一隻腳伸直、一隻腳彎起來，跳在空中
    hop: function (c) {
      return line('M54 96v14') + '<circle cx="54" cy="112" r="3" fill="' + INK + '"/>' + line('M68 96q8 6 14 0') +
        arm(c, 'M40 62q-16 -6 -22 -20', 18, 42) + arm(c, 'M80 62q16 -6 22 -20', 102, 42) +
        guy(c, 60, 16, 40, 80, 'wink') + swish('M36 116h12M72 116h12', '#7489E6');
    },
    // 倒退走：驚訝地往後看，背後一個往左的大箭頭
    back: function (c) {
      return solid('<path d="M6 76l18-16v9h14v14H24v9z"/>', '#7489E6') +
        arm(c, 'M48 80q-10 6 -10 16', 38, 96) + arm(c, 'M88 80q12 -4 18 -14', 106, 66) +
        guy(c, 68, 30, 40, 88, 'wow') + GROUND;
    },
    // 模特兒走台步：戴墨鏡、一手插腰、一手撥頭髮，旁邊閃閃發亮
    model: function (c) {
      return arm(c, 'M40 76q-14 4 -6 18', 34, 94) + arm(c, 'M80 64q14 -14 4 -30', 84, 34) +
        guy(c, 60, 22, 40, 96, 'cool') + W.burst(102, 22, '#FFC628') + W.plus(18, 34, '#F3A4FB') + W.dot(104, 66, '#4FB59A') +
        '<path d="M14 118h92" ' + K + ' stroke-dasharray="16 6"/>';
    },
    // 殭屍跳：兩手直直往前伸，閉著眼睛，跳在半空
    zombie: function (c) {
      return guy(c, 52, 22, 40, 84, 'sleepy') + arm(c, 'M72 56h32', 104, 56) + arm(c, 'M72 70h30', 102, 70) +
        swish('M34 114h10M58 114h10', '#4FB59A') + '<path d="M24 122h56" ' + K + ' stroke-dasharray="10 8"/>';
    },
    // 機器人：方方的身體、天線、手臂彎成直角
    robot: function (c) {
      var shade = '<path d="M68 20h40v110H68z" fill="' + c[1] + '"/>';
      return arm(c, 'M38 70H24V54', 24, 54) + arm(c, 'M82 70h14v16', 96, 86) +
        line('M60 34V20') + solid('<circle cx="60" cy="16" r="5"/>', '#FFC628') +
        W.body('<rect x="38" y="34" width="44" height="84" rx="6"/>', c[0], shade) + W.makeFace('grin', 60, 56, 2.2) +
        line('M50 90h20M50 100h20') + GROUND;
    },
    // 太空漫步：戴著透明頭盔，旁邊有星星
    moon: function (c) {
      return arm(c, 'M40 80q-14 -2 -20 8', 20, 88) + arm(c, 'M80 80q14 4 18 16', 98, 96) +
        guy(c, 60, 30, 40, 88, 'cool') +
        '<circle cx="60" cy="50" r="27" fill="#ffffff" fill-opacity=".35" ' + K + '/>' + swish('M44 36q6-8 14-8', '#ffffff') +
        W.plus(16, 30, '#FFC628') + W.plus(104, 22, '#FFC628', 4) + W.dot(108, 56, '#F3A4FB') +
        '<path d="M14 118q46-10 92 0" ' + K + '/>';
    },
    // 划船：坐在橘色小船上，拿著槳，下面是水波
    row: function (c) {
      return guy(c, 58, 34, 36, 62, 'happy') + line('M24 60l66 52') + solid('<ellipse cx="96" cy="114" rx="11" ry="5" transform="rotate(38 96 114)"/>', '#FFC628') +
        arm(c, 'M42 76q-6 -10 -8 -8', 36, 66) + arm(c, 'M74 76q-8 6 -12 10', 60, 86) +
        solid('<path d="M8 92h104l-14 22H22z"/>', '#FF9419') +
        swish('M4 122q8-6 16 0t16 0 16 0 16 0 16 0 16 0 16 0', '#7489E6');
    },
    // 騎馬：坐在馬背上，手抓著馬脖子
    horse: function (c) {
      return line('M32 94v22M46 94v22M72 94v22M86 94v22') + line('M24 74q-14 4 -12 22') +
        guy(c, 52, 24, 32, 50, 'grin') + arm(c, 'M66 54q12 4 22 2', 88, 56) +
        solid('<rect x="22" y="68" width="72" height="30" rx="15"/>', '#FF9419') +
        solid('<path d="M80 76l10-30q3-9 12-6l9 4q5 2 2 9l-4 6-12-3-6 24z"/>', '#FF9419') +
        '<circle cx="104" cy="48" r="2.4" fill="' + INK + '"/>' + line('M92 46l-4-8') + GROUND;
    },
    // 溜冰：兩手張開保持平衡，腳下溜冰鞋，後面有滑過去的線
    skate: function (c) {
      return arm(c, 'M40 70q-16 -2 -26 6', 14, 76) + arm(c, 'M80 70q16 -8 24 -18', 104, 52) +
        guy(c, 60, 22, 40, 86, 'happy') +
        solid('<rect x="40" y="106" width="16" height="7" rx="3"/>', '#7489E6') + solid('<rect x="64" y="106" width="16" height="7" rx="3"/>', '#7489E6') +
        line('M38 118h20M62 118h20') + swish('M4 100h14M8 110h12', '#aebcf3');
    },
    // 滑雪：身體往前傾，兩支雪杖，腳下兩根雪板
    ski: function (c) {
      return rot(14, 60, 110,
        line('M34 64l-12 46') + line('M84 66l-6 44') +
        arm(c, 'M40 76q-6 -10 -6 -12', 34, 64) + arm(c, 'M80 76q4 -8 4 -10', 84, 66) +
        guy(c, 60, 20, 40, 84, 'grin') + '<path d="M18 110h84q8 0 10-6M22 116h84q8 0 10-6" fill="none" stroke="#EE7B6A" stroke-width="5" stroke-linecap="round"/>') +
        swish('M4 84h12M2 96h10', '#aebcf3');
    },
    // 公雞走路（原本是鴨子，使用者要求改）：紅雞冠、尖尖的嘴、嘴下紅肉垂，手放後面當翅膀，原本的嘴拿掉
    rooster: function (c) {
      return tiny('<path d="M48 44q-2-14 6-12q2-10 8-2q6-8 8 4q6 2 2 12z"/>', '#d63c2f') +
        arm(c, 'M40 90q-12 0 -16 -12', 24, 78) + arm(c, 'M80 90q12 0 16 -12', 96, 78) +
        guy(c, 60, 38, 44, 80, 'eyes') +
        tiny('<path d="M66 62l22 6-22 6z"/>', '#FFC628') + tiny('<path d="M64 74q6 0 6 6t-5 8q-5-4-1-14z"/>', '#d63c2f') +
        solid('<path d="M40 118l6-10 8 10z"/>', '#FF9419') + solid('<path d="M66 118l6-10 8 10z"/>', '#FF9419');
    },
    // 超人飛：身體斜斜往前飛，一手往前伸，紅色披風
    fly: function (c) {
      return rot(62, 60, 70,
        solid('<path d="M42 46l-24 62 32-16z"/>', '#EE7B6A') +
        arm(c, 'M78 46q4 -18 2 -32', 80, 14) + guy(c, 60, 22, 40, 90, 'cool')) +
        swish('M4 52h18M2 66h14M8 80h12', '#aebcf3') + W.burst(104, 18, '#FFC628');
    },
    // 芭蕾舞：兩手在頭上圍成圈，粉紅色蓬蓬裙，踮著腳
    ballet: function (c) {
      return arm(c, 'M42 70q-18 -30 14 -50', 56, 20) + arm(c, 'M78 70q18 -30 -14 -50', 64, 20) +
        guy(c, 60, 32, 38, 78, 'happy') +
        solid('<path d="M28 98l8-10 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 8 10-8 6H36z"/>', '#F3A4FB') +
        line('M60 110v8') + W.plus(18, 30, '#FFC628', 4) + W.dot(104, 40, '#7489E6');
    },
    // 踮腳尖：整個人拉長、手往上，腳尖點地，旁邊往上的箭頭
    tiptoe: function (c) {
      return arm(c, 'M40 60q-12 -14 -10 -36', 30, 24) + arm(c, 'M80 60q12 -14 10 -36', 90, 24) +
        guy(c, 60, 16, 40, 90, 'wow') + line('M52 106l2 10M68 106l-2 10') +
        swish('M16 104V86m-6 6 6-6 6 6M104 104V86m-6 6 6-6 6 6', '#4FB59A') + GROUND;
    },
    // 走鋼索：站在一條繩子上，兩手平舉保持平衡
    rope: function (c) {
      return arm(c, 'M40 66H12', 12, 66) + arm(c, 'M80 66h28', 108, 66) +
        guy(c, 60, 24, 40, 88, 'worry') +
        swish('M8 56q-4 6 0 12M112 56q4 6 0 12', '#EE7B6A') +
        '<path d="M2 112h116" fill="none" stroke="#FF9419" stroke-width="4" stroke-linecap="round"/>' + line('M2 112h116');
    },
    // 大象甩鼻子：兩邊大耳朵，從臉中間垂下一條捲起來的鼻子
    elephant: function (c) {
      return solid('<ellipse cx="34" cy="50" rx="13" ry="18"/>', c[1]) + solid('<ellipse cx="86" cy="50" rx="13" ry="18"/>', c[1]) +
        guy(c, 60, 24, 46, 94, 'eyes') + arm(c, 'M60 54q2 28 18 26q6 -2 4 -10') +
        swish('M92 80q10 -4 14 -14', '#7489E6') + GROUND;
    },
    // 大猩猩搥胸：雙手握拳搥胸口，旁邊砰砰的爆炸線
    gorilla: function (c) {
      return guy(c, 60, 24, 48, 94, 'grin') +
        arm(c, 'M36 74q8 14 18 6', 54, 78) + arm(c, 'M84 74q-8 14 -18 6', 66, 78) +
        W.burst(20, 70, '#FFC628') + W.burst(100, 70, '#FFC628') + W.burst(60, 12, '#EE7B6A') + GROUND;
    },
    // 忍者：額頭綁頭巾、一手準備丟飛鏢
    ninja: function (c) {
      return arm(c, 'M40 80q-12 8 -12 18', 28, 98) + arm(c, 'M80 70q16 -2 22 -14', 102, 56) +
        guy(c, 58, 26, 40, 92, 'cool') +
        '<path d="M38 36h40" fill="none" stroke="#3D54B6" stroke-width="7"/>' + swish('M78 36l14-8M78 38l12 6', '#3D54B6') +
        solid('<path d="M104 72l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>', '#aebcf3') + GROUND;
    },
    // 拄拐杖的老爺爺：駝著背、一手拄著拐杖、白鬍子
    cane: function (c) {
      return rot(-10, 60, 118,
        guy(c, 56, 30, 40, 88, 'eyes') + tiny('<path d="M42 56q14 8 28 0q2 18 -3 26q-3 5 -6 0q-2 7 -5 0q-3 5 -6 0q-6 -8 -8 -26z"/>', '#ffffff') + '<path d="M43 43l7-2M62 41l7 2" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>' +
        arm(c, 'M36 82q-6 6 -2 12', 34, 94) + '<path d="M88 118V74q0-12 -12-12" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>' + '<path d="M88 118V74q0-12 -12-12" fill="none" stroke="#b8743a" stroke-width="7" stroke-linecap="round"/>' +
        arm(c, 'M76 82q8 -2 10 -12', 86, 72)) + GROUND;
    },
    // 提著很重的菜籃：手被菜籃往下拉，滿頭大汗
    basket: function (c) {
      return guy(c, 52, 24, 40, 94, 'worry') + solid('<path d="M28 34q5 7 0 11q-5-4 0-11z"/>', '#ffffff') +
        arm(c, 'M32 80q-8 6 -8 14', 24, 94) + line('M78 100q13-18 26 0') +
        solid('<circle cx="84" cy="96" r="7"/>', '#EE7B6A') + solid('<circle cx="98" cy="96" r="6"/>', '#4FB59A') +
        solid('<path d="M72 100h38l-5 18H77z"/>', '#FFC628') + arm(c, 'M72 76q14 10 18 22', 90, 98) + GROUND;
    },
    // 跳繩：繩子從頭上甩過，人跳在半空
    jump: function (c) {
      return '<path d="M22 88Q60 -68 98 88" fill="none" stroke="#EE7B6A" stroke-width="4" stroke-linecap="round"/>' +
        arm(c, 'M42 76q-10 4 -20 10', 22, 86) + arm(c, 'M78 76q10 4 20 10', 98, 86) +
        guy(c, 60, 28, 40, 76, 'happy') + '<path d="M22 88Q60 128 98 88" fill="none" stroke="#EE7B6A" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 6"/>' +
        '<path d="M30 124h60" ' + K + ' stroke-dasharray="10 8"/>';
    },
    // 開車：坐在藍色小車裡，雙手握方向盤
    drive: function (c) {
      return guy(c, 54, 30, 34, 56, 'grin') +
        '<circle cx="78" cy="72" r="10" fill="none" stroke="' + INK + '" stroke-width="4"/>' + arm(c, 'M68 72q4 -4 8 -2', 76, 70) +
        solid('<path d="M6 108V90q0-10 10-10h88q10 0 10 10v18z"/>', '#7489E6') +
        solid('<circle cx="30" cy="110" r="9"/>', '#3D54B6') + solid('<circle cx="90" cy="110" r="9"/>', '#3D54B6') +
        solid('<rect x="98" y="88" width="10" height="7" rx="3"/>', '#FFC628');
    },
    // 扭屁股走：雙手插腰、身體一扭，兩邊的扭動線
    wiggle: function (c) {
      return rot(10, 60, 118,
        arm(c, 'M39 80q-12 6 -2 16', 37, 96) + arm(c, 'M81 80q12 6 2 16', 83, 96) +
        guy(c, 60, 26, 42, 92, 'tongue')) +
        swish('M12 98q6-4 0-8t0-8 0-8', '#F3A4FB') + swish('M110 98q-6-4 0-8t0-8 0-8', '#F3A4FB') + GROUND;
    },
    // 穿高跟鞋：腳下一雙紅色高跟鞋，一手插腰
    heels: function (c) {
      var shoe = function (x) {
        return solid('<path d="M' + x + ' 104h16q4 0 4 6v4H' + (x + 8) + 'l-4-4h-4z"/>', '#EE7B6A') + line('M' + (x + 2) + ' 110v8');
      };
      return arm(c, 'M40 74q-14 4 -6 18', 34, 92) + arm(c, 'M80 66q14 -6 18 -22', 98, 44) +
        guy(c, 60, 20, 40, 84, 'wink') + shoe(38) + shoe(62) + W.burst(104, 24, '#F3A4FB') + GROUND;
    },
  };

  W.actionArt = ART;
})();
