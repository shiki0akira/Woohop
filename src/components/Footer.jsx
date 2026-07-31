import React from 'react';
import { useParams } from 'react-router-dom';

// 系列共用的頁尾規範（見 web100_00_Homepage/ARCHITECTURE.md 第 7 節）：
// 一條 Primary/600 分隔線，左邊是回首頁連結 + 專案編號，右邊是版權標語；手機才斷行堆疊。
// 文字刻意維持語言中性（品牌名、專案編號、年份），不必為了頁尾多維護 18 份翻譯。
const PROJECT_ID = '01_Avalon-Voice';

export default function Footer() {
  const { lang } = useParams();

  return (
    <footer className="mt-8 border-t border-secondary-700 px-4 py-8 text-[0.85rem] text-neutral-900/70 dark:border-primary-600 dark:text-neutral-200/70">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-6">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          <a
            href={`/${lang}/`}
            className="font-medium underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-neutral-200"
          >
            ← Web100
          </a>
          <span className="font-mono">{PROJECT_ID}</span>
        </div>
        <span>&copy; 2026 Web100 Series</span>
      </div>
    </footer>
  );
}
