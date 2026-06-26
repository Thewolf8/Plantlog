import type { WaterSource } from './journal';

export type Theme = 'dark' | 'light' | 'system' | 'amoled';
export type Language = 'en' | 'ar' | 'fr' | 'system';
export type DateFormat = 'DMY' | 'MDY' | 'YMD';

export interface AppSettings {
  theme: Theme;
  language: Language;
  dateFormat: DateFormat;
  animationsEnabled: boolean;
  highContrastMode: boolean;
  defaultWaterSource: WaterSource | null;
  exportPreferences: {
    includePhotos: boolean;
    includeNotes: boolean;
    dateFormat: 'iso' | 'local';
  };
  notifications: {
    wateringRemindersEnabled: boolean;
  };
}
