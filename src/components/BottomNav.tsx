import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Image, Download, Settings } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { t } = useI18n();
  const location = useLocation();

  const tabs = [
    { path: '/',         label: t('navDashboard'), icon: Home },
    { path: '/timeline', label: t('navTimeline'),  icon: CalendarDays },
    { path: '/tags',     label: t('navTags'),      icon: Image },
    { path: '/export',   label: t('navExport'),    icon: Download },
    { path: '/settings', label: t('navSettings'),  icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md max-w-lg mx-auto">
      <div className="flex items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Top border indicator — directly part of this element, no absolute positioning */}
              <div className={cn(
                'w-8 h-0.5 rounded-full mb-1 transition-all duration-200',
                isActive ? 'bg-primary' : 'bg-transparent'
              )} />
              <tab.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
