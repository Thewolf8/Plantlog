import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CalendarDays, Image, Download, Settings } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { t, isRTL } = useI18n();
  const location = useLocation();

  const tabs = [
    { path: '/', label: t('navDashboard'), icon: Home },
    { path: '/timeline', label: t('navTimeline'), icon: CalendarDays },
    { path: '/tags', label: t('navTags'), icon: Image },
    { path: '/export', label: t('navExport'), icon: Download },
    { path: '/settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md",
      isRTL ? 'direction-rtl' : ''
    )}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
