import { useEffect } from 'react';
import { Sprout, Heart } from 'lucide-react';
import { calculateAge, calculateCareAge } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';
import { cn } from '@/lib/utils';

interface AgeCounterProps {
  germinationDate?: string;
  adoptionDate: string;
  className?: string;
}

export default function AgeCounter({ germinationDate, adoptionDate, className }: AgeCounterProps) {
  const { t } = useI18n();
  useEffect(() => {
    const interval = setInterval(() => {}, 60000);
    return () => clearInterval(interval);
  }, []);

  const trueAge = germinationDate ? calculateAge(germinationDate) : null;
  const careAge = calculateCareAge(adoptionDate);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {trueAge && (
        <div className="flex items-center gap-2 rounded-lg bg-plant-900/30 border border-plant-700/30 px-3 py-2">
          <Sprout className="w-4 h-4 text-plant-400 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('trueAge')}</p>
            <p className="text-sm font-mono font-semibold">{trueAge.text}</p>
            <p className="text-[10px] text-muted-foreground">{t('sinceGermination')}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
        <Heart className="w-4 h-4 text-primary shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('careAge')}</p>
          <p className="text-sm font-mono font-semibold">{careAge.text}</p>
          <p className="text-[10px] text-muted-foreground">{t('sinceAdoption')}</p>
        </div>
      </div>
    </div>
  );
}
