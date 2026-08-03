import React from 'react';
import { useParams } from 'react-router-dom';

// 回 Web100 首頁。首頁的 header 左邊放品牌膠囊，小專案這裡放同尺寸的圓鈕，
// 高度 40 跟首頁的品牌膠囊、右側控制項一致，兩邊的 header 才會等高。
//
// 裡面放的是 Web100 標誌而不是返回箭頭：ARCHITECTURE.md 第 7 節寫的是
// 「導覽列：左側 logo/系列名稱（連回首頁）」，而且這顆鈕是回系列首頁、
// 不是回上一頁，用標誌比箭頭更貼近實際行為。
//
// viewBox 裁到標誌實際邊界（原稿 180 見方裡只用到 4,20 起算的 172x140），
// 高度給多少就是看得到的高度。底色跟標誌色的搭配與首頁品牌膠囊一致：
// 淺色 Secondary/600 疊 Neutral/300、深色 Primary/500 疊 Primary/900。
// 淺色用中性灰是因為導覽列玻璃底本身帶粉，粉底疊粉玻璃只有 1.05:1 分不出邊界。
// hover 才轉成 Secondary/200 —— 比灰底再暗一點又帶粉，滑過去是「染上品牌色」而不只是變深。
export default function BackToHome() {
  const { lang } = useParams();

  return (
    <a
      href={`/${lang}/`}
      aria-label="Web100"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill
                 bg-neutral-300 hover:bg-secondary-200
                 dark:bg-primary-900 dark:hover:bg-primary-800"
    >
      <svg
        className="h-5 w-[25px] fill-secondary-600 dark:fill-primary-500"
        viewBox="4 20 172 140"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M176 160H127.315C107.994 160 92.3316 144.33 92.3316 125V106.332H103.873V101.667H92.3316V90H87.6684V101.667H76.8814V106.332H87.6684V125C87.6684 144.33 72.0056 160 52.6853 160H4V20H8.95652C28.2768 20.0003 43.9396 35.6702 43.9396 55V90H48.6028V55C48.6028 35.6702 64.2656 20.0003 83.5859 20H96.4141C115.734 20.0003 131.397 35.6702 131.397 55V90H136.06V55C136.06 35.6702 151.723 20.0003 171.043 20H176V160Z" />
      </svg>
    </a>
  );
}
