import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, type Language, isRTL } from './translations';
import type { AppSettings } from '@/types/settings';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const raw = localStorage.getItem('plantlog_settings');
      if (raw) {
        const s = JSON.parse(raw) as AppSettings;
        if (s.language === 'system') {
          const nav = navigator.language.split('-')[0];
          if (nav === 'ar') return 'ar';
          if (nav === 'fr') return 'fr';
          return 'en';
        }
        return s.language as Language;
      }
    } catch { /* ignore */ }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      const raw = localStorage.getItem('plantlog_settings');
      const settings = raw ? JSON.parse(raw) : {};
      settings.language = lang;
      localStorage.setItem('plantlog_settings', JSON.stringify(settings));
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: string): string => {
    const dict = translations[language] as Record<string, string>;
    return dict[key] ?? key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL: isRTL(language) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
