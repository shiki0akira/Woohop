import React from 'react';
import { useTranslation } from 'react-i18next';

/*
 * 語音控制：主要動作（播放）是設計系統的大實心按鈕，語速是 game.css 的單選分段（.seg），
 * 暫停／繼續／重新開始是白底的次要按鈕。停用的樣子（壓扁變灰）都內建在元件裡。
 */
export default function VoicePlayer({ text, onSpeak, supported, rate, setRate, pause, resume, restart }) {
  const { t } = useTranslation();
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div className="voice-player">
      <button type="button" className="btn btn-lg btn-solid btn-block" disabled={!supported} onClick={() => onSpeak(text)}>
        <svg aria-hidden="true">
          <use href="#i-play" />
        </svg>
        {t('voice.speak', 'Speak')}
      </button>

      <div className="voice-controls">
        <button type="button" className="btn btn-secondary" disabled={!supported} onClick={pause}>
          {t('voice.pause')}
        </button>
        <button type="button" className="btn btn-secondary" disabled={!supported} onClick={resume}>
          {t('voice.resume')}
        </button>
        <button type="button" className="btn btn-secondary" disabled={!supported} onClick={restart}>
          {t('voice.restart')}
        </button>
      </div>

      <span className="field-label" id="voice-speed-label">
        {t('voice.speed')}
      </span>
      <div className="seg seg-5" role="radiogroup" aria-labelledby="voice-speed-label">
        {speeds.map((speed) => (
          <label key={speed} className="seg-item">
            <input
              type="radio"
              name="voice-speed"
              value={speed}
              checked={rate === speed}
              disabled={!supported}
              onChange={() => setRate(speed)}
            />
            <span>{speed}×</span>
          </label>
        ))}
      </div>
    </div>
  );
}
