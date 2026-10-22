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
    const id = `clip${++clipSeq}`;
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
    // 桌遊助手的小工具（2026-10-22）：拉霸機、節拍器、一疊名稱卡
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
      <path d="M80 98L98 40" stroke="#22222c" stroke-width="4" stroke-linecap="round"/>
      ${body('<circle cx="94" cy="54" r="7"/>', '#FFC628', '', false)}
      ${makeFace('happy', 74, 92, 1.2)}`,
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
