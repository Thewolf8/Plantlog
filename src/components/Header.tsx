import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export default function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const { isRTL } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 h-14 flex items-center">
      {/* Left slot */}
      <div className="w-10 flex items-center">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Back"
          >
            <span className="text-lg leading-none">{isRTL ? '→' : '←'}</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-1.5">
            <Leaf className="w-5 h-5 text-primary" />
          </Link>
        )}
      </div>

      {/* Center title */}
      <div className="flex-1 flex items-center justify-center">
        {title
          ? <h1 className="font-semibold text-sm truncate">{title}</h1>
          : <span className="font-semibold text-sm">PlantLog</span>
        }
      </div>

      {/* Right slot */}
      <div className="w-10 flex items-center justify-end">
        {rightAction ?? null}
      </div>
    </header>
  );
}
