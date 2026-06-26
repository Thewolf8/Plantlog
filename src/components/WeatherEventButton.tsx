import { Button } from '@/components/ui/button';
import { WEATHER_EVENTS } from '@/lib/constants';
import { useI18n } from '@/i18n/I18nContext';
import { Wind, Sun, Snowflake, CloudRain, CloudLightning, SunDim, Droplets, Thermometer } from 'lucide-react';
import type { WeatherEventType } from '@/types/journal';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind, Sun, Snowflake, CloudRain, CloudLightning, SunDim, Droplets, Thermometer,
};

interface WeatherEventButtonProps {
  onSelect: (eventType: WeatherEventType, severity?: 'mild' | 'moderate' | 'severe') => void;
  className?: string;
}

export default function WeatherEventButton({ onSelect, className }: WeatherEventButtonProps) {
  const { t } = useI18n();

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {WEATHER_EVENTS.map((we) => {
        const Icon = iconMap[we.icon] || Sun;
        return (
          <Button
            key={we.value}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3 justify-start border-drought/20 hover:border-drought/50 hover:bg-drought/5"
            onClick={() => onSelect(we.value)}
          >
            <Icon className="w-4 h-4 text-drought shrink-0" />
            <span className="text-xs">{t(we.labelKey)}</span>
          </Button>
        );
      })}
    </div>
  );
}
