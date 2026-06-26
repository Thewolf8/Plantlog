import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/lib/constants';
import type { AppSettings } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, [setSettings]);

  const updateExportPreferences = useCallback((partial: Partial<AppSettings['exportPreferences']>) => {
    setSettings((prev) => ({
      ...prev,
      exportPreferences: { ...prev.exportPreferences, ...partial },
    }));
  }, [setSettings]);

  const updateNotifications = useCallback((partial: Partial<AppSettings['notifications']>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...partial },
    }));
  }, [setSettings]);

  return { settings, updateSettings, updateExportPreferences, updateNotifications };
}
