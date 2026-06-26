import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';
import Header from '@/components/Header';
import { Sun, Moon, Monitor, Zap, Languages, Calendar, Palette, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/settings';

export default function SettingsPage() {
  const { settings, updateSettings, updateNotifications } = useSettings();
  const { theme, setTheme, highContrast, setHighContrast } = useTheme();
  const { t, isRTL, language, setLanguage } = useI18n();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('plantlog_')) localStorage.removeItem(key);
    });
    setShowClearConfirm(false);
    window.location.reload();
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'ar' | 'fr');
    updateSettings({ language: lang as 'en' | 'ar' | 'fr' | 'system' });
  };

  // "Dark" is active when theme is 'dark' OR 'amoled'
  const isDarkFamily = theme === 'dark' || theme === 'amoled';

  const themeButtons: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light',  label: t('themeLight'),  icon: <Sun  className="w-4 h-4" /> },
    { value: 'dark',   label: t('themeDark'),   icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: t('themeSystem'), icon: <Monitor className="w-4 h-4" /> },
  ];

  const handleThemeButton = (val: Theme) => {
    if (val === 'dark') {
      // Keep existing AMOLED selection if already in dark family, else default to dark
      setTheme(theme === 'amoled' ? 'amoled' : 'dark');
    } else {
      setTheme(val);
    }
    updateSettings({ theme: val === 'dark' ? (theme === 'amoled' ? 'amoled' : 'dark') : val });
  };

  // Active tab for theme buttons: light, dark (covers amoled too), system
  const activeTab = isDarkFamily ? 'dark' : theme;

  return (
    <div className={cn('pb-24', isRTL && 'direction-rtl')}>
      <Header title={t('navSettings')} />
      <div className="p-4 space-y-6 max-w-lg mx-auto">

        {/* ── Theme ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Palette className="w-4 h-4" /> {t('theme')}
          </div>

          {/* 3-button selector */}
          <div className="grid grid-cols-3 gap-2">
            {themeButtons.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => handleThemeButton(value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all',
                  activeTab === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* AMOLED sub-option — only visible when Dark is selected */}
          {isDarkFamily && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border bg-card divide-y overflow-hidden"
            >
              <button
                onClick={() => { setTheme('dark'); updateSettings({ theme: 'dark' }); }}
                className={cn(
                  'flex items-center justify-between w-full p-3 text-sm transition-colors',
                  theme === 'dark' ? 'text-primary font-medium' : 'text-foreground hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <span>{t('themeDarkBotanical')}</span>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all',
                  theme === 'dark' ? 'border-primary bg-primary' : 'border-muted-foreground'
                )} />
              </button>
              <button
                onClick={() => { setTheme('amoled'); updateSettings({ theme: 'amoled' }); }}
                className={cn(
                  'flex items-center justify-between w-full p-3 text-sm transition-colors',
                  theme === 'amoled' ? 'text-primary font-medium' : 'text-foreground hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col items-start">
                    <span>{t('themeAmoled')}</span>
                    <span className="text-[10px] text-muted-foreground">Pure black — saves battery on OLED screens</span>
                  </div>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all',
                  theme === 'amoled' ? 'border-primary bg-primary' : 'border-muted-foreground'
                )} />
              </button>
            </motion.div>
          )}

          {/* High Contrast checkbox */}
          <div className="rounded-lg border bg-card p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={highContrast}
                onCheckedChange={(v) => {
                  const val = v === true;
                  setHighContrast(val);
                  updateSettings({ highContrastMode: val });
                }}
              />
              <div>
                <span className="text-sm font-medium">{t('highContrast')}</span>
                <p className="text-[11px] text-muted-foreground">Increases contrast for outdoor readability</p>
              </div>
            </label>
          </div>
        </section>

        {/* ── Language ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Languages className="w-4 h-4" /> {t('language')}
          </div>
          <div className="rounded-lg border bg-card p-3">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('langEnglish')}</SelectItem>
                <SelectItem value="ar">{t('langArabic')}</SelectItem>
                <SelectItem value="fr">{t('langFrench')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ── Date Format ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4" /> {t('dateFormat')}
          </div>
          <div className="rounded-lg border bg-card p-3">
            <Select value={settings.dateFormat} onValueChange={(v) => updateSettings({ dateFormat: v as 'DMY' | 'MDY' | 'YMD' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DMY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MDY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YMD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Bell className="w-4 h-4" /> {t('notifications')}
          </div>
          <div className="rounded-lg border bg-card p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={settings.notifications.wateringRemindersEnabled}
                onCheckedChange={(v) => updateNotifications({ wateringRemindersEnabled: v === true })}
              />
              <span className="text-sm">{t('wateringReminders')}</span>
            </label>
          </div>
        </section>

        {/* ── Data Management ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Trash2 className="w-4 h-4" /> {t('dataManagement')}
          </div>
          <Button variant="destructive" className="w-full" onClick={() => setShowClearConfirm(true)}>
            {t('clearAllData')}
          </Button>
        </section>

        {/* Version */}
        <p className="text-center text-[10px] text-muted-foreground">PlantLog v1.0.0 — Offline-First Plant Journal</p>
      </div>

      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div className="bg-card rounded-xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">{t('clearAllData')}</h3>
            <p className="text-sm text-muted-foreground">{t('clearDataConfirm')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearConfirm(false)}>{t('cancel')}</Button>
              <Button variant="destructive" className="flex-1" onClick={handleClearAll}>{t('confirm')}</Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
