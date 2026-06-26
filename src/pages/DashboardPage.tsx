import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Droplets, Sun, Thermometer, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlants } from '@/hooks/usePlants';
import { useJournal } from '@/hooks/useJournal';
import { usePhotos } from '@/hooks/usePhotos';
import { useI18n } from '@/i18n/I18nContext';
import { getLast7Days } from '@/lib/utils';
import PlantCard from '@/components/PlantCard';
import StatCard from '@/components/StatCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

type FilterMode = 'all' | 'climate' | 'watered';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { plants, climateDefiancePlants } = usePlants();
  const { entries: allEntries } = useJournal();
  const { photos } = usePhotos();
  const { t, isRTL } = useI18n();
  const [filter, setFilter] = useState<FilterMode>('all');

  const last7Days = getLast7Days();

  const stats = useMemo(() => {
    const activeThisWeek = plants.filter((p) => {
      const plantEntries = allEntries.filter((e) => e.plantId === p.id);
      return plantEntries.some((e) => {
        const date = e.date.split('T')[0];
        return last7Days.includes(date);
      });
    }).length;
    const weatherEvents = allEntries.filter((e) => {
      const date = e.date.split('T')[0];
      return e.payload.kind === 'weather' && last7Days.includes(date);
    }).length;
    return {
      total: plants.length,
      activeThisWeek,
      weatherEvents,
      climateDefiance: climateDefiancePlants.length,
    };
  }, [plants, allEntries, climateDefiancePlants, last7Days]);

  const filteredPlants = useMemo(() => {
    switch (filter) {
      case 'climate':
        return plants.filter((p) => p.isClimateDefiance);
      case 'watered':
        return plants.filter((p) => {
          if (!p.wateringSchedule?.lastWateredAt) return false;
          const days = Math.floor((Date.now() - new Date(p.wateringSchedule.lastWateredAt).getTime()) / 86400000);
          return days <= 3;
        });
      default:
        return plants;
    }
  }, [plants, filter]);

  const heroMap = useMemo(() => {
    const map: Record<string, string> = {};
    photos.forEach((p) => {
      const plant = plants.find((pl) => pl.heroPhotoId === p.id);
      if (plant) map[plant.id] = p.base64;
    });
    return map;
  }, [photos, plants]);

  return (
    <div className={cn('pb-24', isRTL && 'direction-rtl')}>
      <Header rightAction={
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      } />

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label={t('totalPlants')} value={stats.total} icon={<Sprout className="w-4 h-4" />} index={0} />
          <StatCard label={t('activeThisWeek')} value={stats.activeThisWeek} icon={<Droplets className="w-4 h-4 text-blue-400" />} color="text-blue-400" index={1} />
          <StatCard label={t('weatherEvents')} value={stats.weatherEvents} icon={<Sun className="w-4 h-4 text-drought" />} color="text-drought" index={2} />
          <StatCard label={t('climateDefiance')} value={stats.climateDefiance} icon={<Thermometer className="w-4 h-4 text-orange-400" />} color="text-orange-400" index={3} />
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: 'all' as FilterMode, label: t('allPlants') },
            { key: 'climate' as FilterMode, label: t('climateDefianceLab') },
            { key: 'watered' as FilterMode, label: t('recentlyWatered') },
          ]).map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
              className="text-xs shrink-0"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Plant grid */}
        {filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Sprout className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">{t('empty')}</p>
            <p className="text-xs mt-1">{t('addPlant')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlants.map((plant, i) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                index={i}
                heroPhotoBase64={heroMap[plant.id]}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => navigate('/plant/add')} />
    </div>
  );
}
