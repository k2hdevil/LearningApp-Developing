import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyMode, Mode } from '@cloudscape-design/global-styles';

const STORAGE_KEY = 'doa-dark-mode';

const DarkModeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

function readInitialMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage 접근이 차단된 환경(프라이빗 모드 등)은 무시하고 기본값을 씁니다.
  }
  // 저장값이 없으면 OS 설정을 따릅니다.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(readInitialMode);

  useEffect(() => {
    // Cloudscape 전역 스타일에 모드를 적용하면 모든 디자인 토큰 색상이 함께 바뀝니다.
    applyMode(isDarkMode ? Mode.Dark : Mode.Light);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isDarkMode));
    } catch {
      // 저장 실패는 기능에 영향이 없으므로 무시합니다.
    }
  }, [isDarkMode]);

  const value = useMemo(
    () => ({ isDarkMode, toggleDarkMode: () => setIsDarkMode((previous) => !previous) }),
    [isDarkMode]
  );

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
