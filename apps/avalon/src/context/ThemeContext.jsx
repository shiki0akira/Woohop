import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

/*
 * 顯示模式：跟隨系統／淺色／深色（設計系統的 .theme-switch，放在頁尾）。
 *
 * - 預設跟隨裝置；選過就記住（localStorage web100-theme，系列共用的 key）。選回「跟隨系統」就把記錄拿掉
 * - 實際生效的是 <html data-theme="light|dark">，Woohop 的深色色票掛在 [data-theme="dark"]。
 *   index.html 的 <head> 已經先決定好一次（畫面出來前，不會閃一下淺色），這裡負責之後的切換與跟著系統變
 */
const STORAGE_KEY = 'web100-theme';

export const ThemeContext = createContext(null);

function readChoice() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(choice) {
  const dark =
    choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  // 手機瀏覽器上方工具列的顏色跟著底色
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.setAttribute('content', dark ? '#1c1c24' : '#f4f4f6');
}

export function ThemeProvider({ children }) {
  // 預渲染（Node）時沒有 window，先當成跟隨系統；掛載後再讀記住的選擇
  const [choice, setChoiceState] = useState('system');

  useEffect(() => {
    setChoiceState(readChoice());
  }, []);

  useEffect(() => {
    applyTheme(choice);
    if (choice !== 'system') return undefined;
    // 跟隨系統時，系統切換深淺也要跟著變
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [choice]);

  const setChoice = useCallback((next) => {
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* 無痕模式記不住，這次還是會切 */
    }
    setChoiceState(next);
  }, []);

  const value = useMemo(() => ({ choice, setChoice }), [choice, setChoice]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
