/*
 * 10 個預設頭像，全部是食物。**不開放使用者上傳**——上傳要處理儲存、審核、
 * 版權與兒少風險，對一個十分鐘的破冰活動完全不划算，而且破冰只需要「認得出是誰」，
 * 一個好記的圖示配暱稱就夠了。
 *
 * 風格：粉彩、扁平、無描邊、圓角，每個頭像自己帶一塊底色。
 * 畫在 64×64 的 viewBox 裡，外面用 CSS 切成圓形，所以底色要鋪滿整個 viewBox。
 *
 * SVG 直接寫成字串內嵌，不走圖檔：10 個頭像會在名單、統計、結果頁重複出現幾十次，
 * 每個都發一次請求不划算，而且 inline 之後才能用 CSS 控制大小不失真。
 *
 * 30 個人共用 10 個頭像一定會撞。刻意不處理——旁邊一定有暱稱，
 * 而「你也是披薩！」本身就是個破冰話題。
 */

/*
 * 食物縮到中間、留一圈邊。
 *
 * 圖形本來畫滿整個 viewBox，切成圓形之後四角會被吃掉（披薩的餅皮、冰淇淋的甜筒尖端
 * 都會缺一塊）。
 *
 * 不用單一的縮放倍率：每個圖形本來的大小就差很多（酪梨只有 28 寬、披薩有 48 寬），
 * 乘同一個倍率之後酪梨會顯得特別小。改成**把每個圖形的最長邊都對齊到 FOOD_EXTENT**，
 * 十個頭像看起來才一樣大。同時用各自的邊界框正中心對齊到 (32,32)，
 * 不會有的偏上、有的偏左。
 *
 * box 是圖形未縮放時的邊界框 [x, y, w, h]，量自瀏覽器的 getBBox()。
 * 改動圖形的路徑時要一起重量，不然就會偏掉。
 *
 * 40 / 64 = 62.5%，四周各留 12 單位。圓形裁切的半徑是 32，而邊界框的角落距離中心
 * 只有 sqrt(20²+20²) ≈ 28.3，所以怎麼切都不會吃到圖。
 *
 * 包在資料裡而不是包在 avatarSvg()：app.js 另有一份自己的 avatarSvg（前端沒有 bundler，
 * 不能 import 這個模組），transform 寫兩次遲早會有一邊改到、另一邊沒改。
 */
const FOOD_EXTENT = 40;

function inset(shapes, box) {
  const [x, y, width, height] = box;
  const scale = FOOD_EXTENT / Math.max(width, height);
  const dx = round(32 - scale * (x + width / 2));
  const dy = round(32 - scale * (y + height / 2));

  return (
    '<g transform="translate(' + dx + ' ' + dy + ') scale(' + round(scale) + ')">' + shapes + '</g>'
  );
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

// id 存進房間狀態（見 src/room.js 的 players），改名字會讓舊房間的頭像對不到，
// 所以這些 id 一旦上線就不要改
export const AVATARS = [
  {
    id: 'pizza',
    // 底色各自不同，名單上一排頭像才不會糊成一片
    bg: '#B8D9F7',
    svg: inset(
      '<path d="M32 8 L56 46 Q32 58 8 46 Z" fill="#F7CE84"/>' +
        '<path d="M32 14 L51 44 Q32 54 13 44 Z" fill="#FCEA8A"/>' +
        '<circle cx="26" cy="30" r="5" fill="#F58A82"/>' +
        '<circle cx="40" cy="34" r="5" fill="#F58A82"/>' +
        '<circle cx="30" cy="44" r="4.5" fill="#F58A82"/>' +
        '<path d="M36 24 q5 1 4 6 q-5 1-4-6Z" fill="#93C47D"/>' +
        '<path d="M20 40 q5-2 6 3 q-5 2-6-3Z" fill="#93C47D"/>' +
        '<path d="M42 45 q4-3 6 1 q-4 3-6-1Z" fill="#93C47D"/>',
      [8, 8, 48, 44]
    ),
  },
  {
    id: 'boba',
    bg: '#F7D0E2',
    svg: inset(
      '<path d="M18 20 h28 l-3 32 a4 4 0 0 1-4 4 h-14 a4 4 0 0 1-4-4 Z" fill="#F5E0C4"/>' +
        '<path d="M19 28 h26 l-2 24 a4 4 0 0 1-4 4 h-14 a4 4 0 0 1-4-4 Z" fill="#DEB07F"/>' +
        '<rect x="15" y="16" width="34" height="6" rx="3" fill="#FDF7EE"/>' +
        '<rect x="35" y="6" width="4" height="14" rx="2" fill="#F58A82" transform="rotate(12 37 13)"/>' +
        '<circle cx="26" cy="48" r="3" fill="#7A5A44"/>' +
        '<circle cx="34" cy="50" r="3" fill="#7A5A44"/>' +
        '<circle cx="40" cy="46" r="3" fill="#7A5A44"/>',
      [15, 5.7, 34, 50.3]
    ),
  },
  {
    id: 'donut',
    bg: '#CBEBC4',
    svg: inset(
      '<circle cx="32" cy="34" r="22" fill="#F2D294"/>' +
        '<path d="M54 34 a22 22 0 0 1-44 0 q0-14 10-19 q6 12 22 8 q10 4 12 11Z" fill="#F9AEC5"/>' +
        '<circle cx="32" cy="34" r="8" fill="#CBEBC4"/>' +
        '<rect x="20" y="26" width="6" height="2.6" rx="1.3" fill="#FFFBF3" transform="rotate(-25 23 27)"/>' +
        '<rect x="38" y="24" width="6" height="2.6" rx="1.3" fill="#FFFBF3" transform="rotate(20 41 25)"/>' +
        '<rect x="42" y="40" width="6" height="2.6" rx="1.3" fill="#FFFBF3" transform="rotate(-15 45 41)"/>' +
        '<rect x="18" y="42" width="6" height="2.6" rx="1.3" fill="#FFFBF3" transform="rotate(35 21 43)"/>',
      [10, 12, 44, 44]
    ),
  },
  {
    id: 'strawberry',
    bg: '#FEE4BF',
    svg: inset(
      '<path d="M32 20 q18 0 18 14 q0 16-18 24 q-18-8-18-24 q0-14 18-14Z" fill="#F5828E"/>' +
        '<path d="M32 20 q10 0 14 7 q-8 4-14 3 q-6 1-14-3 q4-7 14-7Z" fill="#F9A3AB"/>' +
        '<path d="M22 16 q6 4 10 3 q4 1 10-3 q-3 6-10 6 q-7 0-10-6Z" fill="#93C47D"/>' +
        '<rect x="30" y="8" width="4" height="8" rx="2" fill="#93C47D"/>' +
        '<circle cx="26" cy="36" r="1.7" fill="#FFFCF6"/>' +
        '<circle cx="36" cy="34" r="1.7" fill="#FFFCF6"/>' +
        '<circle cx="32" cy="44" r="1.7" fill="#FFFCF6"/>' +
        '<circle cx="40" cy="43" r="1.7" fill="#FFFCF6"/>' +
        '<circle cx="24" cy="45" r="1.7" fill="#FFFCF6"/>',
      [14, 8, 36, 50]
    ),
  },
  {
    id: 'avocado',
    bg: '#DCD6F5',
    svg: inset(
      '<path d="M32 8 q14 0 14 18 q0 22-14 30 q-14-8-14-30 q0-18 14-18Z" fill="#7FA96F"/>' +
        '<path d="M32 14 q9 0 9 13 q0 16-9 22 q-9-6-9-22 q0-13 9-13Z" fill="#E6F2B4"/>' +
        '<ellipse cx="32" cy="36" rx="7" ry="8.5" fill="#D89F66"/>',
      [18, 8, 28, 48]
    ),
  },
  {
    id: 'egg',
    bg: '#FBD8D3',
    svg: inset(
      '<path d="M22 12 q14-6 22 4 q10 6 6 16 q4 12-8 16 q-8 10-20 4 q-12 0-12-12 q-6-10 4-16 q0-10 8-12Z" fill="#FFFCF6"/>' +
        '<circle cx="30" cy="32" r="10" fill="#FAC85F"/>' +
        '<circle cx="27" cy="29" r="3.2" fill="#FDE39B"/>',
      [7.8, 9.8, 43.4, 44.5]
    ),
  },
  {
    id: 'icecream',
    bg: '#C4EDE4',
    svg: inset(
      '<path d="M20 30 h24 l-12 26 Z" fill="#F1C88B"/>' +
        '<path d="M24 36 l4 8 M32 34 l-3 8 M38 35 l-4 7" stroke="#DCAA6B" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<circle cx="24" cy="24" r="9" fill="#F9AEC5"/>' +
        '<circle cx="40" cy="24" r="9" fill="#FCEA8A"/>' +
        '<circle cx="32" cy="17" r="9" fill="#A5DCC0"/>',
      [15, 8, 34, 48]
    ),
  },
  {
    id: 'onigiri',
    bg: '#FDD6BB',
    svg: inset(
      '<path d="M32 12 q5 0 8 6 l12 24 q3 8-6 8 h-28 q-9 0-6-8 l12-24 q3-6 8-6Z" fill="#FFFCF6"/>' +
        '<path d="M22 34 h20 v12 q0 4-4 4 h-12 q-4 0-4-4Z" fill="#7C9B79"/>' +
        '<circle cx="26" cy="26" r="1.8" fill="#F7B8B1"/>' +
        '<circle cx="38" cy="27" r="1.8" fill="#F7B8B1"/>',
      [11.3, 12, 41.5, 38]
    ),
  },
  {
    id: 'mushroom',
    bg: '#D6E2F7',
    svg: inset(
      '<path d="M32 10 q20 0 20 18 q0 6-8 6 h-24 q-8 0-8-6 q0-18 20-18Z" fill="#F28585"/>' +
        '<circle cx="24" cy="22" r="4" fill="#FFFCF6"/>' +
        '<circle cx="39" cy="19" r="3.2" fill="#FFFCF6"/>' +
        '<circle cx="34" cy="28" r="2.6" fill="#FFFCF6"/>' +
        '<path d="M25 34 h14 v14 q0 8-7 8 q-7 0-7-8Z" fill="#F7DFC0"/>',
      [12, 10, 40, 46]
    ),
  },
  {
    id: 'lemon',
    bg: '#D3EFB2',
    svg: inset(
      '<ellipse cx="32" cy="34" rx="22" ry="20" fill="#F9DC6A"/>' +
        '<ellipse cx="32" cy="34" rx="16.5" ry="15" fill="#FDEFAE"/>' +
        '<path d="M32 34 L32 19 A15 15 0 0 1 45 26 Z" fill="#F9DC6A"/>' +
        '<path d="M32 34 L45 42 A15 15 0 0 1 32 49 Z" fill="#F9DC6A"/>' +
        '<path d="M32 34 L19 26 A15 15 0 0 1 32 19 Z" fill="#FEF8D2"/>' +
        '<path d="M32 34 L19 42 A15 15 0 0 0 32 49 Z" fill="#FEF8D2"/>' +
        '<path d="M32 34 L45 26 A15 15 0 0 1 45 42 Z" fill="#FEF8D2"/>' +
        '<path d="M32 34 L19 42 A15 15 0 0 1 19 26 Z" fill="#F9DC6A"/>',
      [10, 14, 44, 40]
    ),
  },
];

export const AVATAR_IDS = AVATARS.map((avatar) => avatar.id);
export const DEFAULT_AVATAR = AVATAR_IDS[0];

// 沒選過頭像的人（例如舊連結進來的）也要有一個，用 clientId 決定，
// 同一個人每次進來都拿到同一個，不會每次重整就換一張臉
export function avatarFor(id, clientId) {
  if (AVATAR_IDS.includes(id)) return id;
  if (!clientId) return DEFAULT_AVATAR;

  let hash = 0;
  for (let i = 0; i < clientId.length; i += 1) hash = (hash * 31 + clientId.charCodeAt(i)) >>> 0;
  return AVATAR_IDS[hash % AVATAR_IDS.length];
}

/*
 * 回傳完整的 <svg>。
 *
 * width/height 只是預設值，CSS 隨時可以蓋掉（.avatar-option .avatar 就是這樣做的）；
 * 圖形本身是向量，放大縮小都不會失真。
 */
export function avatarSvg(id, size = 40) {
  const avatar = AVATARS.find((item) => item.id === id) ?? AVATARS[0];
  return (
    `<svg class="avatar" viewBox="0 0 64 64" width="${size}" height="${size}" ` +
    `role="img" aria-hidden="true" focusable="false">` +
    `<rect width="64" height="64" fill="${avatar.bg}"/>${avatar.svg}</svg>`
  );
}
