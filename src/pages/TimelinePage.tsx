import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJournal } from '@/hooks/useJournal';
import { usePlants } from '@/hooks/usePlants';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/I18nContext';
import TimelineEntry from '@/components/TimelineEntry';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const { entries } = useJournal();
  const { plants } = usePlants();
  const { settings } = useSettings();
  const { t, isRTL } = useI18n();

  const [plantFilter, setPlantFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (plantFilter !== 'all' && e.plantId !== plantFilter) return false;
      if (kindFilter !== 'all' && e.payload.kind !== kindFilter) return false;
      return true;
    });
  }, [entries, plantFilter, kindFilter]);

  return (
    <div className={cn('pb-24', isRTL && 'direction-rtl')}>
      <Header title={t('navTimeline')} />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Select value={plantFilter} onValueChange={setPlantFilter}>
            <SelectTrigger className="flex-1 text-xs"><SelectValue placeholder={t('allPlants')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPlants')}</SelectItem>
              {plants.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="flex-1 text-xs"><SelectValue placeholder={t('all')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {(['watering', 'fertilizer', 'pesticide', 'weather', 'observation']).map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-sm">{t('empty')}</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <TimelineEntry key={entry.id} entry={entry} index={i} dateFormat={settings.dateFormat} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
