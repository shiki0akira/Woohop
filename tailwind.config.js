/** @type {import('tailwindcss').Config} */

// Web100 系列共用色階，跟 Figma 變數庫與首頁 design-tokens.css 同名同值。
// 要改配色先動 Figma，再同步 web100_00_Homepage/design-tokens.css，最後才是這裡。
//
// ⚠️ neutral 會蓋掉 Tailwind 內建的同名色階（只蓋 200~900 這幾階）。
// 這是刻意的：在這個設計系統裡 neutral 就是指這組值，不要再用內建的 neutral/slate。
const palette = {
  primary: {
    200: '#e9edfb',
    300: '#d3dbf9',
    400: '#b8c6f8',
    500: '#9cb0f3',
    600: '#8799e9',
    700: '#6776b5',
    800: '#474f80',
    900: '#252c4b',
  },
  secondary: {
    200: '#fbe5ff',
    300: '#faddfe',
    400: '#f8cafd',
    500: '#f7b9fd',
    600: '#f3a4fb',
    700: '#ba82c4',
    800: '#855a8d',
    900: '#4d2b53',
  },
  accent: {
    100: '#959bee',
    200: '#a798f0',
    300: '#be9df5',
    400: '#cf9ef8',
    500: '#e29ffb',
  },
  neutral: {
    200: '#ffffff',
    300: '#f2f2f4',
    400: '#dfdee2',
    500: '#c6c5c9',
    600: '#adabb2',
    700: '#848189',
    800: '#58545a',
    900: '#252326',
  },
};

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: palette,
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
};
