import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gameSlug } from '../i18n';
import { siteStrings, sitePath } from '../woohop';

export default function Rules() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const s = siteStrings(lang);

  return (
    <main id="main" className="game-main game-rules">
      <div className="page-head">
        <nav className="crumbs" aria-label="breadcrumb">
          <a href={sitePath(lang, 'home')}>{s.home}</a>
          <span>›</span>
          <a href={sitePath(lang, 'games')}>{s.navGames}</a>
          <span>›</span>
          <a href={`/${gameSlug}/${lang}`}>{t('nav.title')}</a>
          <span>›</span>
          <span>{t('nav.rules')}</span>
        </nav>
        <h1>{t('rules.title')}</h1>
      </div>

      <section className="panel prose">
        <p>{t('rules.description')}</p>
      </section>

      <p className="rules-back">
        <Link className="btn btn-lg btn-solid" to={`/${gameSlug}/${lang}`}>
          {t('home.start')}
        </Link>
      </p>
    </main>
  );
}
