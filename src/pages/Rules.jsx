import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Rules() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <section className="surface">
        <h1 className="text-3xl font-bold">{t('rules.title')}</h1>
        <p className="mt-2 text-neutral-900/70 dark:text-neutral-200/70">{t('rules.description')}</p>
      </section>
    </main>
  );
}
