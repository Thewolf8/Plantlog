import { motion } from 'framer-motion';
import { Droplets, Sun, FlaskConical, Bug, Eye, CloudSun, TriangleAlert } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { formatDateTime } from '@/lib/utils';
import type { JournalEntry } from '@/types/journal';
import { cn } from '@/lib/utils';

interface TimelineEntryProps {
  entry: JournalEntry;
  index: number;
  dateFormat: 'DMY' | 'MDY' | 'YMD';
}

const kindIcons: Record<string, React.ReactNode> = {
  watering: <Droplets className="w-4 h-4 text-blue-400" />,
  fertilizer: <FlaskConical className="w-4 h-4 text-emerald-400" />,
  pesticide: <Bug className="w-4 h-4 text-red-400" />,
  weather: <CloudSun className="w-4 h-4 text-amber-400" />,
  observation: <Eye className="w-4 h-4 text-violet-400" />,
  microclimate: <Sun className="w-4 h-4 text-orange-400" />,
};

function getSummary(entry: JournalEntry, t: (k: string) => string): string {
  const p = entry.payload;
  switch (p.kind) {
    case 'watering':
      return `${t('waterSource')}: ${p.source}`;
    case 'fertilizer':
      return `${p.productName}${p.npk ? ` (${p.npk})` : ''}`;
    case 'pesticide':
      return `${p.productName}${p.targetPest ? ` — ${p.targetPest}` : ''}`;
    case 'weather':
      return `${t(`weather.${p.eventType}` as string) || p.eventType}${p.severity ? ` — ${t(p.severity) || p.severity}` : ''}`;
    case 'observation':
      return p.text.substring(0, 60) + (p.text.length > 60 ? '...' : '');
    case 'microclimate':
      return p.description.substring(0, 60);
    default:
      return '';
  }
}

export default function TimelineEntry({ entry, index, dateFormat }: TimelineEntryProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        entry.isWeatherFlag ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card/50 hover:bg-card'
      )}
    >
      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        {kindIcons[entry.payload.kind] || <Eye className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDateTime(entry.date, dateFormat)}
          </span>
          {entry.isWeatherFlag && (
            <TriangleAlert className="w-3 h-3 text-amber-400 shrink-0" />
          )}
        </div>
        <p className="text-xs font-medium capitalize mt-0.5">
          {entry.payload.kind}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {getSummary(entry, t)}
        </p>
      </div>
    </motion.div>
  );
}
