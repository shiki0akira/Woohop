import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gameSlug, getPathSuffix, localeLabels, persistLangPreference, supportedLangs } from '../i18n';

// Material Symbols Rounded / keyboard_arrow_down。
// 用 mask + currentColor 畫，箭頭才會自動跟著深淺色模式與 hover 換色（select 本身塞不進子元素）。
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960'%3E%3Cpath d='M465-363.5q-7-2.5-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5q-8 0-15-2.5Z'/%3E%3C/svg%3E\") center / 20px no-repeat";

export default function LangSwitcher() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <span className="relative inline-flex">
      <select
        className="btn-outline w-[140px] appearance-none pl-4 pr-9 text-left"
        aria-label="Select language"
        value={lang}
        onChange={(e) => {
          const nextLang = e.target.value;
          const suffix = getPathSuffix(location.pathname);
          persistLangPreference(nextLang); // 記住使用者手動選的語言，優先權高於 IP 地區猜測
          navigate(`/${gameSlug}/${nextLang}${suffix}`, { replace: true });
        }}
      >
        {supportedLangs.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 bg-current"
        style={{ WebkitMask: CHEVRON, mask: CHEVRON }}
      />
    </span>
  );
}
