import React from 'react';
import { useTranslation } from 'react-i18next';

export default function VoicePlayer({
  text,
  onSpeak,
  supported,
  rate,
  setRate,
  pause,
  resume,
  restart,
}) {
  const { t } = useTranslation();
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 主要動作用實心，其餘播放控制用外框，視覺上分出主次。
            disabled 樣式（壓扁/淡化）已經內建在 .btn-solid / .btn-outline，不用另外疊 utility */}
        <button type="button" className="btn-solid px-6" disabled={!supported} onClick={() => onSpeak(text)}>
          {t('voice.speak', 'Speak')}
        </button>

        <label className="inline-flex items-center gap-2">
          <span className="text-sm">{t('voice.speed')}</span>
          {/* 這顆保留系統原生的下拉箭頭；導覽列那顆語言選單才另外畫 Material 的箭頭 */}
          <select
            className="btn-outline px-3"
            value={rate}
            disabled={!supported}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-outline" disabled={!supported} onClick={pause}>
          {t('voice.pause')}
        </button>

        <button type="button" className="btn-outline" disabled={!supported} onClick={resume}>
          {t('voice.resume')}
        </button>

        <button type="button" className="btn-outline" disabled={!supported} onClick={restart}>
          {t('voice.restart')}
        </button>
      </div>
    </div>
  );
}
