import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WATER_SOURCES } from '@/lib/constants';
import { useI18n } from '@/i18n/I18nContext';
import type { WaterSource } from '@/types/journal';

interface WateringLogFormProps {
  onSubmit: (source: WaterSource, sourceNote: string, amountLiters?: number, method?: string) => void;
  onCancel: () => void;
  defaultSource?: WaterSource | null;
}

export default function WateringLogForm({ onSubmit, onCancel, defaultSource }: WateringLogFormProps) {
  const { t } = useI18n();
  const [source, setSource] = useState<WaterSource>(defaultSource || 'tap_overnight');
  const [sourceNote, setSourceNote] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Label>{t('waterSource')}</Label>
        <Select value={source} onValueChange={(v) => setSource(v as WaterSource)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {WATER_SOURCES.map((ws) => (
              <SelectItem key={ws.value} value={ws.value}>{t(ws.labelKey)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {source === 'other' && (
        <div className="space-y-2">
          <Label>{t('sourceNote')}</Label>
          <Input value={sourceNote} onChange={(e) => setSourceNote(e.target.value)} placeholder={t('sourceNote')} />
        </div>
      )}
      <div className="space-y-2">
        <Label>{t('amountLiters')}</Label>
        <Input type="number" step="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.5" />
      </div>
      <div className="space-y-2">
        <Label>{t('method')}</Label>
        <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="drip, overhead, olla..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
        <Button onClick={() => onSubmit(source, sourceNote, amount ? parseFloat(amount) : undefined, method || undefined)} className="flex-1">
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
