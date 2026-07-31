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

  // 每一種人數的建議配置都一定包含這三個角色（見 constants/roles.js），
  // 所以「不能取消勾選」跟「按鈕要顯示成鎖定」用的是同一組角色，不要拆成兩個陣列——
  // 拆開就會發生實際擋得住點擊、但按鈕看起來還是可以按的狀況。
  const requiredRoles = ['merlin', 'assassin', 'morgana'];
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
      <section className="surface">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>
        <p className="mt-2 text-neutral-900/70 dark:text-neutral-200/70">{t('home.description')}</p>
      </section>

      <section className="surface grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="font-medium">{t('home.playerCount')}</span>
          <select
            className="btn-outline w-full justify-start px-4"
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
          <p className="text-sm text-neutral-900/70 dark:text-neutral-200/70">
            {recommended.roles.map((role) => t(`roles.${role}`)).join('、')}
          </p>
        </div>
      </section>

      <section className="surface">
        <h2 className="text-xl font-semibold">{t('home.roleConfig')}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ROLE_ORDER.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={selectedRoles.includes(role) ? 'btn-solid' : 'btn-outline'}
              disabled={requiredRoles.includes(role)}
            >
              {t(`roles.${role}`)}
            </button>
          ))}
        </div>
        {mismatch && <p className="mt-3 font-medium text-secondary-900 dark:text-secondary-500">{t('home.mismatch')}</p>}
      </section>

      <button
        type="button"
        className={`w-full rounded-2xl border-0 px-6 py-4 text-lg font-semibold transition-[background-color,box-shadow,transform] duration-150 ${
          canStart
            ? 'bg-secondary-500 text-secondary-900 shadow-[0_3px_0_theme(colors.secondary.600)] hover:translate-y-px hover:bg-secondary-600 hover:shadow-[0_2px_0_theme(colors.secondary.700)] active:translate-y-[3px] active:shadow-[0_0_0_theme(colors.secondary.700)] dark:bg-primary-700 dark:text-white dark:shadow-[0_3px_0_theme(colors.primary.800)] dark:hover:bg-primary-800 dark:hover:shadow-[0_2px_0_theme(colors.primary.900)]'
            : 'cursor-not-allowed bg-secondary-200 text-secondary-800 shadow-none dark:bg-primary-800 dark:text-primary-400'
        }`}
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
