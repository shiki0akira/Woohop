import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { siteStrings } from '../woohop';

// 設計系統的模式切換（.theme-switch）：跟隨系統／淺色／深色，放在頁尾語言選單左邊。
// 圖示是 woohop-art.js 插進頁面的 i-auto / i-sun / i-moon
export default function ThemeSwitch() {
  const { lang } = useParams();
  const s = siteStrings(lang);
  const { choice, setChoice } = useTheme();
  const options = [
    ['system', 'i-auto', s.themeSystem],
    ['light', 'i-sun', s.themeLight],
    ['dark', 'i-moon', s.themeDark],
  ];

  return (
    <div className="theme-switch" role="group" aria-label={s.themeLabel}>
      {options.map(([value, icon, label]) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={choice === value}
          onClick={() => setChoice(value)}
        >
          <svg aria-hidden="true">
            <use href={`#${icon}`} />
          </svg>
        </button>
      ))}
    </div>
  );
}
