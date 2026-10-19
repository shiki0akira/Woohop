import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROLE_CONFIGS, ROLE_ORDER } from '../constants/roles';
import { gameSlug } from '../i18n';
import { trackEvent } from '../analytics';
import { siteStrings, sitePath } from '../woohop';

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;

export default function Home() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const s = siteStrings(lang);
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

  const changeCount = (step) => {
    const next = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, playerCount + step));
    if (next === playerCount) return;
    setPlayerCount(next);
    setSelectedRoles(ROLE_CONFIGS[String(next)].roles);
  };

  const toggleRole = (role) => {
    if (requiredRoles.includes(role)) return;
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    );
  };

  return (
    <main id="main" className="game-main">
      <div className="view">
        <div className="page-head">
          <nav className="crumbs" aria-label="breadcrumb">
            <a href={sitePath(lang, 'home')}>{s.home}</a>
            <span>›</span>
            <a href={sitePath(lang, 'games')}>{s.navGames}</a>
            <span>›</span>
            <span>{t('nav.title')}</span>
          </nav>
          <h1>{t('home.title')}</h1>
          <p>{t('home.description')}</p>
        </div>

        <section className="panel">
          <h2 id="player-count-label">{t('home.playerCount')}</h2>
          {/* 設計系統的數量增減（stepper），5～10 人 */}
          <div className="stepper avalon-stepper" role="group" aria-labelledby="player-count-label">
            <button type="button" aria-label="−" disabled={playerCount <= MIN_PLAYERS} onClick={() => changeCount(-1)}>
              −
            </button>
            <output aria-live="polite">{playerCount}</output>
            <button type="button" aria-label="+" disabled={playerCount >= MAX_PLAYERS} onClick={() => changeCount(1)}>
              +
            </button>
          </div>

          <h3 className="field-label field-label-gap">{t('home.recommendation')}</h3>
          <div className="team-split">
            <span className="badge b-info">
              {t('home.good')} {recommended.good}
            </span>
            <span className="badge b-new">
              {t('home.evil')} {recommended.evil}
            </span>
          </div>
          <p className="hint">{recommended.roles.map((role) => t(`roles.${role}`)).join('、')}</p>
        </section>

        <section className="panel">
          <h2>{t('home.roleConfig')}</h2>
          {/* 設計系統的篩選膠囊（.chip）：選了是 aria-pressed；梅林、刺客、莫甘娜一定要有，鎖住不能取消 */}
          <div className="role-chips">
            {ROLE_ORDER.map((role) => {
              const on = selectedRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  disabled={requiredRoles.includes(role)}
                  onClick={() => toggleRole(role)}
                >
                  {on && (
                    <svg aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                  )}
                  {t(`roles.${role}`)}
                </button>
              );
            })}
          </div>
          {mismatch && <p className="form-error">{t('home.mismatch')}</p>}
        </section>

        <button
          type="button"
          className="btn btn-lg btn-solid btn-block"
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
      </div>
    </main>
  );
}
