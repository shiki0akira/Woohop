import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gameSlug } from '../i18n';
import LangSwitcher from './LangSwitcher';
import ThemeToggle from './ThemeToggle';
import BackToHome from './BackToHome';

export default function Navbar() {
  const { lang } = useParams();
  const { t } = useTranslation();

  return (
    // 浮在內容上的玻璃膠囊，不是整條橫幅。寬 600、內距 8，跟首頁的 header 完全一致。
    <header className="nav-pill sticky top-4 z-10 mx-auto mt-4 flex w-[min(600px,calc(100%-2rem))] items-center justify-between gap-3 py-2 pl-2 pr-3">
      <div className="flex min-w-0 items-center gap-3">
        <BackToHome />
        <Link to={`/${gameSlug}/${lang}`} className="truncate font-bold">
          {t('nav.title')}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link to={`/${gameSlug}/${lang}/rules`} className="btn-outline">
          {t('nav.rules')}
        </Link>
        <LangSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
