import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const { t, isRTL } = useI18n();

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 h-14 flex items-center",
      isRTL ? 'flex-row-reverse' : ''
    )}>
      <div className="flex-1 flex items-center min-w-0">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            <span className="text-lg">{isRTL ? '→' : '←'}</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{t('appName')}</span>
          </Link>
        )}
      </div>
      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm truncate max-w-[50%] text-center">
          {title}
        </h1>
      )}
      <div className={cn("flex-1 flex items-center min-w-0", isRTL ? 'justify-start' : 'justify-end')}>
        {rightAction}
      </div>
    </header>
  );
}
