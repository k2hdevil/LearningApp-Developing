import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Cloudscape 전역 스타일은 애플리케이션 CSS보다 먼저 불러와야 합니다.
import '@cloudscape-design/global-styles/index.css';
import './global.css';

import { applyDesignTokenVars } from './designTokens';
import App from './App';

// CSS 가 참조하는 --doa-* 변수를 문서 루트에 심습니다. 렌더 전에 실행해야
// 첫 페인트부터 올바른 색이 나옵니다.
applyDesignTokenVars();
import { DarkModeProvider } from './contexts/DarkModeContext';
import { LocaleProvider } from './contexts/LocaleContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocaleProvider>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </LocaleProvider>
  </StrictMode>
);
