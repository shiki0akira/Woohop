import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '../hooks/useSpeech';
import VoicePlayer from '../components/VoicePlayer';
import { trackEvent } from '../analytics';
import { ROLE_CONFIGS, DEFAULT_PLAYER_COUNT } from '../constants/roles';
import { gameSlug } from '../i18n';
import { siteStrings, sitePath } from '../woohop';

const PAUSE_AFTER_MS = 1000;
const RECORDED_VOLUME_GAIN = 2;

export default function Game() {
  const { lang } = useParams();
  const { t, i18n } = useTranslation();
  const { state } = useLocation();
  // 直接開 /avalon/{lang}/game（從搜尋結果點進來、或重新整理）時沒有 location.state。
  // 退回預設人數的建議配置，而不是空陣列——空陣列會讓台詞整段是空的，而預渲染的靜態 HTML
  // 寫的是預設配置的台詞，兩邊對不上就變成 cloaking。ROLE_CONFIGS 的 roles 是模組層級的
  // 固定參考，每次 render 拿到的是同一個陣列，不會讓下面的 useCallback/useMemo 失效。
  const playerCount = state?.playerCount ?? DEFAULT_PLAYER_COUNT;
  const selectedRoles = state?.selectedRoles || ROLE_CONFIGS[String(playerCount)].roles;

  const hasRole = useCallback((role) => selectedRoles.includes(role), [selectedRoles]);

  const [recordedAvailable, setRecordedAvailable] = useState(false);
  const [probeDone, setProbeDone] = useState(false);

  const handleComplete = useCallback(
    (mode) => {
      trackEvent('avalon_game_completed', { lang, player_count: playerCount, mode });
    },
    [lang, playerCount],
  );

  const {
    speak: speechSpeak,
    pause: speechPause,
    resume: speechResume,
    rate,
    setRate,
    supported: speechSupported,
  } = useSpeech(lang, { onComplete: () => handleComplete('tts') });

  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!lang) return;

    let cancelled = false;
    const probeSrc = `${import.meta.env.BASE_URL}audio/${lang}/1.mp3`;

    const probe = new Audio(probeSrc);
    let finished = false;

    const done = (v) => {
      if (cancelled || finished) return;
      finished = true;
      setRecordedAvailable(v);
      setProbeDone(true);
    };

    probe.addEventListener('canplaythrough', () => done(true), { once: true });
    probe.addEventListener('error', () => done(false), { once: true });

    const timeout = setTimeout(() => done(false), 2500);
    probe.load();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      try {
        probe.src = '';
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const recorded = useMemo(() => {
    const oberonVariant = hasRole('oberon') ? 3 : 2;
    const mordredVariant = hasRole('mordred') ? 6 : 5;
    const includePercival = hasRole('percival');

    const steps = [
      { src: `${import.meta.env.BASE_URL}audio/${lang}/1.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/${oberonVariant}.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/4.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/${mordredVariant}.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/7.mp3`, waitAfterMs: PAUSE_AFTER_MS },
    ];

    if (includePercival) {
      steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/8.mp3`, waitAfterMs: PAUSE_AFTER_MS });
      steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/9.mp3`, waitAfterMs: 0 });
    }

    steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/10.mp3`, waitAfterMs: 0 });

    return { steps };
  }, [hasRole, lang]);

  useEffect(() => {
    if (!recordedAvailable) return;
    if (typeof speechSpeak?.cancel === 'function') speechSpeak.cancel();
    try {
      window.speechSynthesis?.cancel?.();
    } catch {
      // ignore
    }
  }, [recordedAvailable, speechSpeak]);

  // 依所選角色組出旁白台詞，分支邏輯跟上面 recorded.steps 的音檔順序完全一致，
  // 讓畫面顯示的台詞和實際播放的語音一段一段對得起來。
  // 有 voice.narration（分段稿）就用角色感知版本；沒有的語言退回舊的 voice.script 平稿。
  const script = useMemo(() => {
    const hasNarration = Boolean(i18n.getResource(lang, 'translation', 'voice.narration'));
    if (hasNarration) {
      const seg = (key) => t(`voice.narration.${key}`);
      const lines = [seg('closeEyes')];
      lines.push(hasRole('oberon') ? seg('evilRecognizeOberon') : seg('evilRecognize'));
      lines.push(seg('evilClose'));
      lines.push(hasRole('mordred') ? seg('merlinSeeMordred') : seg('merlinSee'));
      lines.push(seg('merlinClose'));
      if (hasRole('percival')) {
        lines.push(seg('percivalSee'));
        lines.push(seg('percivalClose'));
      }
      lines.push(seg('openEyes'));
      return lines.join('\n');
    }
    const rawScript = t('voice.script');
    return Array.isArray(rawScript) ? rawScript.join('\n') : (typeof rawScript === 'string' ? rawScript : JSON.stringify(rawScript));
  }, [t, i18n, lang, hasRole]);

  const audioRef = useRef(null);
  // typeof Audio 的判斷是給 scripts/prerender.js 用的（Node 裡沒有 Audio）。這行在 render
  // 當下就執行，是整個元件唯一會在預渲染時碰到瀏覽器 API 的地方；其餘都在 effect/callback 裡，
  // 那些在瀏覽器才跑，那時 audioRef.current 已經是真的 Audio 了。
  if (audioRef.current === null && typeof Audio !== 'undefined') audioRef.current = new Audio();

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const mediaSourceRef = useRef(null);

  const runIdRef = useRef(0);
  const hasAutoStartedRef = useRef(false);
  const isWaitingRef = useRef(false);
  const delayTimerRef = useRef(null);
  const delayResolveRef = useRef(null);
  const delayRemainingRef = useRef(0);
  const delayStartedAtRef = useRef(0);

  const wait = useCallback(
    (ms) =>
      new Promise((resolve) => {
        if (ms <= 0) {
          resolve();
          return;
        }

        isWaitingRef.current = true;
        delayResolveRef.current = resolve;
        delayRemainingRef.current = ms;
        delayStartedAtRef.current = Date.now();

        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          isWaitingRef.current = false;
          delayRemainingRef.current = 0;
          const r = delayResolveRef.current;
          delayResolveRef.current = null;
          r?.();
        }, ms);
      }),
    [],
  );

  const stopDelay = useCallback(() => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    delayTimerRef.current = null;
    isWaitingRef.current = false;
  }, []);

  const ensureRecordedAudioGraph = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;

    if (!audioCtxRef.current || !gainNodeRef.current || !mediaSourceRef.current) {
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextImpl) return;

      const ctx = audioCtxRef.current || new AudioContextImpl();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.value = RECORDED_VOLUME_GAIN;
      }

      if (!mediaSourceRef.current) {
        mediaSourceRef.current = ctx.createMediaElementSource(a);
        mediaSourceRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
      }
    }

    try {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    } catch {
      // ignore
    }
  }, []);

  const pauseRecorded = useCallback(() => {
    const a = audioRef.current;

    if (isWaitingRef.current && delayTimerRef.current) {
      const elapsed = Date.now() - delayStartedAtRef.current;
      const remaining = Math.max(0, delayRemainingRef.current - elapsed);
      delayRemainingRef.current = remaining;
      stopDelay();
      return;
    }

    try {
      a?.pause();
    } catch {
      // ignore
    }
  }, [stopDelay]);

  const resumeRecorded = useCallback(() => {
    const a = audioRef.current;

    if (isWaitingRef.current) {
      if (!delayResolveRef.current) return;
      const remaining = delayRemainingRef.current;
      if (remaining <= 0) return;

      isWaitingRef.current = true;
      delayStartedAtRef.current = Date.now();
      delayTimerRef.current = setTimeout(() => {
        delayTimerRef.current = null;
        isWaitingRef.current = false;
        delayRemainingRef.current = 0;
        const r = delayResolveRef.current;
        delayResolveRef.current = null;
        r?.();
      }, remaining);
      return;
    }

    try {
      ensureRecordedAudioGraph();
      a?.play();
    } catch {
      // ignore
    }
  }, [ensureRecordedAudioGraph]);

  const startRecorded = useCallback(() => {
    runIdRef.current += 1;
    const runId = runIdRef.current;

    const a = audioRef.current;
    // 錄音版開始前先把瀏覽器語音停掉：網路慢時錄音檔沒在 2.5 秒內偵測到，會先退回瀏覽器語音開唸，
    // 之後再按播放就變成兩個聲音疊在一起
    try {
      window.speechSynthesis?.cancel?.();
    } catch {
      // ignore
    }
    try {
      ensureRecordedAudioGraph();
      a.pause();
      a.currentTime = 0;
      a.src = '';
      a.playbackRate = rateRef.current;
    } catch {
      // ignore
    }

    stopDelay();

    const run = async () => {
      for (let i = 0; i < recorded.steps.length; i += 1) {
        if (runId !== runIdRef.current) return;

        const step = recorded.steps[i];

        a.src = step.src;
        a.currentTime = 0;
        a.playbackRate = rateRef.current;

        await new Promise((resolve, reject) => {
          const cleanup = () => {
            a.removeEventListener('ended', onEnded);
            a.removeEventListener('error', onError);
          };

          const onEnded = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(new Error('audio error'));
          };

          a.addEventListener('ended', onEnded);
          a.addEventListener('error', onError);

          const p = a.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              // ignore
            });
          }
        });

        if (runId !== runIdRef.current) return;
        await wait(step.waitAfterMs);
      }

      if (runId === runIdRef.current) handleComplete('recorded');
    };

    run();
  }, [ensureRecordedAudioGraph, recorded.steps, stopDelay, wait, handleComplete]);

  const isRecordedMode = recordedAvailable;

  const pause = isRecordedMode ? pauseRecorded : speechPause;
  const resume = isRecordedMode ? resumeRecorded : speechResume;
  const supported = isRecordedMode ? true : speechSupported;

  useEffect(() => {
    if (!probeDone) return;
    if (hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;

    if (isRecordedMode) {
      startRecorded();
    } else {
      speechSpeak(script);
    }
  }, [probeDone, isRecordedMode, startRecorded, speechSpeak, script]);

  useEffect(() => {
    if (!isRecordedMode) return;
    const a = audioRef.current;
    try {
      a.playbackRate = rateRef.current;
    } catch {
      // ignore
    }
  }, [isRecordedMode, rate]);

  useEffect(() => {
    if (!isRecordedMode) return;
    return () => {
      const a = audioRef.current;
      try {
        a.pause();
        a.src = '';
      } catch {
        // ignore
      }

      try {
        audioCtxRef.current?.suspend?.();
      } catch {
        // ignore
      }
    };
  }, [isRecordedMode]);

  /*
   * 「播放旁白」＝從頭再唸一次。進到這頁就會自動開唸，所以這顆一律先把正在唸的（錄音、瀏覽器語音都算）
   * 停掉再從第一句開始，不會疊出好幾個聲音。原本另外一顆「重新開始」做的是同一件事，拿掉了
   */
  const onSpeak = useCallback(
    () => {
      trackEvent('avalon_game_restarted', { lang, player_count: playerCount });
      if (isRecordedMode) startRecorded();
      else speechSpeak(script);
    },
    [isRecordedMode, speechSpeak, startRecorded, script, lang, playerCount],
  );

  const s = siteStrings(lang);

  return (
    <main id="main" className="game-main">
      <div className="view">
        <div className="page-head">
          <nav className="crumbs" aria-label="breadcrumb">
            <a href={sitePath(lang, 'home')}>{s.home}</a>
            <span>›</span>
            <a href={sitePath(lang, 'games')}>{s.navGames}</a>
            <span>›</span>
            <a href={`/${gameSlug}/${lang}`}>{t('nav.title')}</a>
            <span>›</span>
            <span>{t('game.title')}</span>
          </nav>
          <h1>{t('game.title')}</h1>
          <p>{t('game.description')}</p>
        </div>

        <section className="panel">
          <p className={supported ? 'voice-status' : 'form-error'}>
            {supported ? t('game.speaking') : t('game.unsupported')}
          </p>
          <VoicePlayer
            text={script}
            onSpeak={onSpeak}
            supported={supported}
            rate={rate}
            setRate={setRate}
            pause={pause}
            resume={resume}
          />
        </section>

        <section className="panel">
          <h2>{t('game.summary')}</h2>
          {/* 設計系統的「照著念」卡片：語音沒聲音或想自己唸時，主持人照著唸 */}
          <div className="prompt-card voice-script">
            <span className="say">{s.sayLabel}</span>
            {script}
          </div>
        </section>
      </div>
    </main>
  );
}
