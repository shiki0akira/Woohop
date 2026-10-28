/*
 * 木頭人動作版：動作卡的插圖（2026-10-28 使用者要求，一個動作一張，角色用首頁主視覺那幾隻小人）。
 * 小人的畫法照 apps/homepage/assets/hero-art.js 的 bean／shade／arm（那邊沒匯出，這裡是複本）。
 * 每張都是 viewBox 0 0 120 128、地板在 y=118；小人顏色由呼叫的人給（每抽一張隨機換）。
 *
 * window.STATUE_ART[key](c)：c 是 [主色, 陰影色]，回傳 SVG 內容字串。
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

  window.STATUE_ART = ART;
})();
