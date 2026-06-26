import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HARSH_ENVIRONMENT_FACTORS } from '@/lib/constants';
import { useI18n } from '@/i18n/I18nContext';
import type { HarshEnvironmentFactor } from '@/types/plant';
import { cn } from '@/lib/utils';

interface ClimateProfilerProps {
  selected: HarshEnvironmentFactor[];
  onChange: (factors: HarshEnvironmentFactor[]) => void;
  readOnly?: boolean;
  className?: string;
}

export default function ClimateProfiler({ selected, onChange, readOnly = false, className }: ClimateProfilerProps) {
  const { t } = useI18n();

  const toggle = (factor: HarshEnvironmentFactor) => {
    if (readOnly) return;
    if (selected.includes(factor)) {
      onChange(selected.filter((f) => f !== factor));
    } else {
      onChange([...selected, factor]);
    }
  };

  return (
    <div className={cn('grid grid-cols-2 gap-x-4 gap-y-2', className)}>
      {HARSH_ENVIRONMENT_FACTORS.map((hef) => (
        <div key={hef.value} className="flex items-center gap-2">
          <Checkbox
            id={hef.value}
            checked={selected.includes(hef.value)}
            onCheckedChange={() => toggle(hef.value)}
            disabled={readOnly}
          />
          <Label htmlFor={hef.value} className="text-xs cursor-pointer leading-tight">
            {t(hef.labelKey)}
          </Label>
        </div>
      ))}
    </div>
  );
}
