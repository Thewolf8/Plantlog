import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n/I18nContext';
import type { FertilizerType, InterventionType } from '@/types/journal';

interface InterventionFormProps {
  onSubmit: (data: {
    kind: 'fertilizer' | 'pesticide';
    interventionType: InterventionType;
    productName: string;
    isOrganic: boolean;
    npk?: string;
    quantityGrams?: number;
    applicationMethod?: string;
    dilutionRatio?: string;
    targetPest?: string;
  }) => void;
  onCancel: () => void;
}

export default function InterventionForm({ onSubmit, onCancel }: InterventionFormProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<'fertilizer' | 'pesticide'>('fertilizer');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('organic');
  const [productName, setProductName] = useState('');
  const [npk, setNpk] = useState('');
  const [quantity, setQuantity] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('');
  const [isOrganic, setIsOrganic] = useState(true);
  const [dilutionRatio, setDilutionRatio] = useState('');
  const [targetPest, setTargetPest] = useState('');
  const [interventionType, setInterventionType] = useState<InterventionType>('fertilizer');

  const handleSubmit = () => {
    if (!productName.trim()) return;
    onSubmit({
      kind: tab,
      interventionType: tab === 'fertilizer' ? 'fertilizer' : interventionType,
      productName: productName.trim(),
      isOrganic,
      ...(tab === 'fertilizer' ? {
        npk: npk || undefined,
        quantityGrams: quantity ? parseFloat(quantity) : undefined,
        applicationMethod: applicationMethod || undefined,
      } : {
        dilutionRatio: dilutionRatio || undefined,
        targetPest: targetPest || undefined,
      }),
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'fertilizer' | 'pesticide')}>
        <TabsList className="w-full">
          <TabsTrigger value="fertilizer" className="flex-1">{t('fertilizer')}</TabsTrigger>
          <TabsTrigger value="pesticide" className="flex-1">{t('pesticide')}/{t('fungicide')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label>{t('productName')} *</Label>
        <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" />
      </div>

      {tab === 'fertilizer' ? (
        <>
          <div className="space-y-2">
            <Label>{t('interventionType')}</Label>
            <Select value={fertilizerType} onValueChange={(v) => setFertilizerType(v as FertilizerType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['organic', 'chemical', 'foliar', 'slow_release'] as FertilizerType[]).map((ft) => (
                  <SelectItem key={ft} value={ft}>{ft.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('npk')}</Label>
            <Input value={npk} onChange={(e) => setNpk(e.target.value)} placeholder="10-5-5" />
          </div>
          <div className="space-y-2">
            <Label>{t('quantityGrams')}</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50" />
          </div>
          <div className="space-y-2">
            <Label>{t('applicationMethod')}</Label>
            <Input value={applicationMethod} onChange={(e) => setApplicationMethod(e.target.value)} placeholder="broadcast, foliar spray..." />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>{t('interventionType')}</Label>
            <Select value={interventionType} onValueChange={(v) => setInterventionType(v as InterventionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['pesticide', 'fungicide', 'other'] as InterventionType[]).map((it) => (
                  <SelectItem key={it} value={it}>{it}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('dilutionRatio')}</Label>
            <Input value={dilutionRatio} onChange={(e) => setDilutionRatio(e.target.value)} placeholder="1:10" />
          </div>
          <div className="space-y-2">
            <Label>{t('targetPest')}</Label>
            <Input value={targetPest} onChange={(e) => setTargetPest(e.target.value)} placeholder="aphids, fungus..." />
          </div>
        </>
      )}

      <label className="flex items-center gap-3 py-2 cursor-pointer">
        <Checkbox
          id="organic"
          checked={isOrganic}
          onCheckedChange={(v) => setIsOrganic(v === true)}
        />
        <span className="text-sm">{t('isOrganic')}</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
        <Button onClick={handleSubmit} className="flex-1">{t('save')}</Button>
      </div>
    </div>
  );
}
