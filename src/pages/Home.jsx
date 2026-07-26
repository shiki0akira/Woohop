import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROLE_CONFIGS, ROLE_ORDER } from '../constants/roles';
import { gameSlug } from '../i18n';
import { trackEvent } from '../analytics';

export default function Home() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [playerCount, setPlayerCount] = useState(5);
  const recommended = ROLE_CONFIGS[String(playerCount)];
  const [selectedRoles, setSelectedRoles] = useState(recommended.roles);

  const requiredRoles = ['merlin', 'assassin', 'morgana'];
  const lockedRoles = ['merlin'];
  const mismatch = useMemo(() => selectedRoles.length !== recommended.roles.length, [selectedRoles, recommended]);
  const canStart = !mismatch && requiredRoles.every((role) => selectedRoles.includes(role));

  useEffect(() => {
    trackEvent('avalon_game_setup_start', { lang });
  }, [lang]);

  const toggleRole = (role) => {
    if (requiredRoles.includes(role)) return;
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    );
  };

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('home.description')}</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <label className="space-y-2">
          <span className="font-medium">{t('home.playerCount')}</span>
          <select
            className="w-full rounded-xl border border-slate-300 bg-transparent p-3"
            value={playerCount}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPlayerCount(next);
              setSelectedRoles((prev) => {
                const nextRoles = ROLE_CONFIGS[String(next)].roles;
                return nextRoles;
              });
            }}
          >
            {[5, 6, 7, 8, 9, 10].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <div className="font-medium">{t('home.recommendation')}</div>
          <p>
            {t('home.good')} {recommended.good} / {t('home.evil')} {recommended.evil}
          </p>
          <p className="text-sm text-slate-500">{recommended.roles.map((role) => t(`roles.${role}`)).join('、')}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">{t('home.roleConfig')}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ROLE_ORDER.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`rounded-full px-4 py-2 border ${selectedRoles.includes(role) ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-300'} ${lockedRoles.includes(role) ? 'cursor-not-allowed opacity-80' : ''}`}
              disabled={lockedRoles.includes(role)}
            >
              {t(`roles.${role}`)}
            </button>
          ))}
        </div>
        {mismatch && <p className="mt-3 text-amber-500">{t('home.mismatch')}</p>}
      </section>

      <button
        type="button"
        className={`w-full rounded-2xl px-6 py-4 font-semibold text-white ${canStart ? 'bg-indigo-600' : 'bg-indigo-400 cursor-not-allowed'}`}
        disabled={!canStart}
        onClick={() => {
          trackEvent('avalon_game_start', {
            lang,
            player_count: playerCount,
            role_config: selectedRoles.join(','),
          });
          navigate(`/${gameSlug}/${lang}/game`, { state: { playerCount, selectedRoles } });
        }}
      >
        {t('home.start')}
      </button>
    </main>
  );
}
