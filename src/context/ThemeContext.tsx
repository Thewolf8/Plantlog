import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types/settings';
import type { AppSettings } from '@/types/settings';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  highContrast: false,
  setHighContrast: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('plantlog_settings');
      if (raw) {
        const s = JSON.parse(raw) as AppSettings;
        setThemeState(s.theme ?? 'system');
        setHighContrastState(s.highContrastMode ?? false);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'amoled');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else if (theme === 'amoled') {
      // AMOLED needs both 'dark' (for Tailwind dark: variants) and 'amoled' (for our CSS)
      root.classList.add('dark', 'amoled');
    } else {
      root.classList.add(theme);
    }

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [theme, highContrast]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      const raw = localStorage.getItem('plantlog_settings');
      const s = raw ? JSON.parse(raw) : {};
      s.theme = t;
      localStorage.setItem('plantlog_settings', JSON.stringify(s));
    } catch { /* ignore */ }
  }, []);

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v);
    try {
      const raw = localStorage.getItem('plantlog_settings');
      const s = raw ? JSON.parse(raw) : {};
      s.highContrastMode = v;
      localStorage.setItem('plantlog_settings', JSON.stringify(s));
    } catch { /* ignore */ }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, highContrast, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
