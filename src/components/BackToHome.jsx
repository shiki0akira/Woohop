import React from 'react';
import { useParams } from 'react-router-dom';

// 回 Web100 首頁。首頁的 header 左邊放品牌膠囊，小專案這裡改放同尺寸的返回鈕，
// 高度 40 跟首頁的品牌膠囊、右側控制項一致，兩邊的 header 才會等高。
// 圖示：Material Symbols Rounded / arrow_back
export default function BackToHome() {
  const { lang } = useParams();

  return (
    <a
      href={`/${lang}/`}
      aria-label="Web100"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill
                 bg-secondary-200 text-secondary-900 hover:bg-secondary-300
                 dark:bg-primary-900 dark:text-neutral-200 dark:hover:bg-primary-800"
    >
      <svg className="h-6 w-6 fill-current" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="m313-440 196 196q12 12 11.5 28T508-188q-12 11-28 11.5T452-188L188-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l264-264q11-11 27.5-11t28.5 11q12 12 12 28.5T508-715L313-520h447q17 0 28.5 11.5T800-480q0 17-11.5 28.5T760-440H313Z" />
      </svg>
    </a>
  );
}
