import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/avalon/',
  plugins: [react()],
  // 樣式、插圖、全站文案直接從 apps/homepage 匯入（設計系統的唯一來源），開發伺服器要允許讀到上一層
  server: { fs: { allow: ['..'] } },
});
