import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
// Woohop 全站共用的樣式與插圖（唯一來源在 apps/homepage/assets，跟其他遊戲同一份）：
// woohop.css 是設計系統元件與色票（含深色）、site.css 是頁尾與選單、game.css 是遊戲內頂欄與版型。
// woohop-art.js 會在 <body> 開頭插入圖示 sprite（#i-back、#i-menu⋯），頂欄、頁尾的圖示靠它
import '../../homepage/assets/woohop.css';
import '../../homepage/assets/site.css';
import '../../homepage/assets/game.css';
import '../../homepage/assets/woohop-art.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
