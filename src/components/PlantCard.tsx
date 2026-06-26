import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { calculateCareAge, daysSince } from '@/lib/utils';
import type { Plant } from '@/types/plant';


interface PlantCardProps {
  plant: Plant;
  index: number;
  heroPhotoBase64?: string;
}

export default function PlantCard({ plant, index, heroPhotoBase64 }: PlantCardProps) {
  const { t } = useI18n();
  const careAge = calculateCareAge(plant.adoptionDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/plant/${plant.id}`} className="block group">
        <div className="rounded-xl overflow-hidden border bg-card shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-primary/30">
          <div className="relative h-36 bg-muted">
            {heroPhotoBase64 ? (
              <img src={heroPhotoBase64} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-plant-100/20 to-plant-900/20">
                <span className="text-4xl opacity-30">🌿</span>
              </div>
            )}
            {plant.isClimateDefiance && (
              <span className="absolute top-2 right-2 bg-orange-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                ☀️
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{plant.name}</h3>
                {plant.scientificName && (
                  <p className="text-[10px] text-muted-foreground italic truncate">{plant.scientificName}</p>
                )}
              </div>
              {plant.generation.number > 1 && (
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded shrink-0">
                  G{plant.generation.number}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">
                {t('caringFor')} {careAge.text}
              </span>
              {plant.wateringSchedule?.lastWateredAt && (
                <span className="flex items-center gap-1 text-[10px] text-blue-400">
                  <Droplets className="w-3 h-3" />
                  {daysSince(plant.wateringSchedule.lastWateredAt)}d
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
