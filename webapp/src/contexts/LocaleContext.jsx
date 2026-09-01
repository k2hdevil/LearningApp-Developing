import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES } from '../i18n/strings';

const STORAGE_KEY = 'doa-locale';

const LocaleContext = createContext({
  locale: 'ko',
  setLocale: () => {},
});

function readInitialLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALES.includes(stored)) return stored;
  } catch {
    // localStorage 접근이 차단된 환경은 무시하고 브라우저 설정을 따릅니다.
  }
  // 저장값이 없으면 브라우저 언어를 봅니다. 한국어가 아니면 영어로 시작합니다.
  const browser = window.navigator?.language || '';
  return browser.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  useEffect(() => {
    // 스크린 리더와 브라우저 번역 기능이 올바른 언어로 동작하도록 lang 을 갱신합니다.
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // 저장 실패는 기능에 영향이 없으므로 무시합니다.
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next) => {
        if (LOCALES.includes(next)) setLocaleState(next);
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
