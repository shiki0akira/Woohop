import { useCallback, useEffect, useRef, useState } from 'react';

const speechLangMap = {
  'zh-TW': 'zh-TW',
  'zh-CN': 'zh-CN',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  vi: 'vi-VN',
  pl: 'pl-PL',
  ru: 'ru-RU',
  pt: 'pt-PT',
  it: 'it-IT',
  nl: 'nl-NL',
  cs: 'cs-CZ',
  sv: 'sv-SE',
  th: 'th-TH',
  id: 'id-ID',
  es: 'es-ES',
};

export function useSpeech(lang, { onComplete } = {}) {
  const supported = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

  const [rate, setRate] = useState(1);
  const rateRef = useRef(rate);

  const lastTextRef = useRef('');
  const utteranceIdRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const speak = useCallback(
    (text) => {
      if (!supported) return false;
      lastTextRef.current = text;
      utteranceIdRef.current += 1;
      const utteranceId = utteranceIdRef.current;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLangMap[lang] || lang || 'en-US';
      utterance.rate = rateRef.current;
      // cancel() 中斷播放時瀏覽器多半觸發的是 error 事件而不是 end，
      // 但這裡仍用 utteranceId 比對，避免舊的 utterance 事件在被取代後才觸發時誤判成「唸完了」。
      utterance.onend = () => {
        if (utteranceId === utteranceIdRef.current) onCompleteRef.current?.();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [lang, supported],
  );

  const restart = useCallback(() => {
    if (!lastTextRef.current) return false;
    return speak(lastTextRef.current);
  }, [speak]);

  const pause = useCallback(() => {
    if (!supported) return false;
    window.speechSynthesis.pause();
    return true;
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return false;
    window.speechSynthesis.resume();
    return true;
  }, [supported]);

  return { speak, restart, pause, resume, rate, setRate, supported };
}
