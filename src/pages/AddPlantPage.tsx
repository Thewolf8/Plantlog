import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlants } from '@/hooks/usePlants';
import { useI18n } from '@/i18n/I18nContext';
import ClimateProfiler from '@/components/ClimateProfiler';
import Header from '@/components/Header';
import { compressImage } from '@/lib/utils';
import type { HarshEnvironmentFactor, WateringSchedule } from '@/types/plant';
import { cn } from '@/lib/utils';

export default function AddPlantPage() {
  const navigate = useNavigate();
  const { addPlant } = usePlants();
  const { t, isRTL } = useI18n();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [origin, setOrigin] = useState('');
  const [germinationDate, setGerminationDate] = useState('');
  const [adoptionDate, setAdoptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isClimateDefiance, setIsClimateDefiance] = useState(false);
  const [harshFactors, setHarshFactors] = useState<HarshEnvironmentFactor[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState<WateringSchedule['frequency']>('weekly');
  const [intervalDays, setIntervalDays] = useState('7');
  const [preferredTime, setPreferredTime] = useState('07:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [isGen2, setIsGen2] = useState(false);
  const [parentPlantId, setParentPlantId] = useState<string | null>(null);
  const [seedHarvestDate, setSeedHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [heroPhotoBase64, setHeroPhotoBase64] = useState('');
  const [tags, setTags] = useState('');

  const steps = [
    t('stepIdentity'),
    ...(isClimateDefiance ? [t('stepEnvironment')] : []),
    t('stepSchedule'),
    t('stepLineage'),
    t('stepTags'),
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await compressImage(file, 800, 0.8);
      setHeroPhotoBase64(b64);
    }
  };

  const handleFinish = () => {
    if (!name.trim() || !adoptionDate) return;

    const schedule: WateringSchedule | undefined = scheduleEnabled ? {
      enabled: true,
      frequency,
      intervalDays: frequency === 'every_x_days' ? parseInt(intervalDays) || 7 : undefined,
      preferredTimeHHMM: preferredTime,
      reminderEnabled,
    } : undefined;

    const plant = addPlant({
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      origin: origin.trim() || undefined,
      isClimateDefiance,
      harshEnvironmentFactors: harshFactors,
      microclimateMods: [],
      germinationDate: germinationDate || undefined,
      adoptionDate,
      heroPhotoId: heroPhotoBase64 ? undefined : undefined,
      notes,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      generation: {
        number: isGen2 ? 2 : 1,
        parentPlantId: isGen2 ? parentPlantId : null,
        childPlantIds: [],
        ...(seedHarvestDate ? { seedHarvestDate } : {}),
      },
      wateringSchedule: schedule,
    });

    if (heroPhotoBase64) {
      const photoId = `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
      const photo = {
        id: photoId,
        plantId: plant.id,
        base64: heroPhotoBase64,
        mimeType: 'image/jpeg' as const,
        uploadedAt: new Date().toISOString(),
        tags: [],
      };
      const existing = JSON.parse(localStorage.getItem('plantlog_photos') || '[]');
      existing.push(photo);
      localStorage.setItem('plantlog_photos', JSON.stringify(existing));
      const plants = JSON.parse(localStorage.getItem('plantlog_plants') || '[]');
      const idx = plants.findIndex((p: { id: string }) => p.id === plant.id);
      if (idx !== -1) {
        plants[idx].heroPhotoId = photoId;
        localStorage.setItem('plantlog_plants', JSON.stringify(plants));
      }
    }

    navigate(`/plant/${plant.id}`);
  };

  const currentStepIdx = step;
  const currentStepLabel = steps[currentStepIdx] || steps[steps.length - 1];

  const renderStep = () => {
    switch (currentStepIdx) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('plantName')} *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Papaya" required />
            </div>
            <div className="space-y-2">
              <Label>{t('scientificName')} <span className="text-muted-foreground">({t('optional')})</span></Label>
              <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} placeholder="Carica papaya" />
            </div>
            <div className="space-y-2">
              <Label>{t('origin')} <span className="text-muted-foreground">({t('optional')})</span></Label>
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Central America" />
            </div>
            <div className="space-y-2">
              <Label>{t('germinationDate')} <span className="text-muted-foreground">({t('optional')})</span></Label>
              <Input type="date" value={germinationDate} onChange={(e) => setGerminationDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('adoptionDate')} *</Label>
              <Input type="date" value={adoptionDate} onChange={(e) => setAdoptionDate(e.target.value)} required />
            </div>
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <Checkbox
                id="climate-defiance"
                checked={isClimateDefiance}
                onCheckedChange={(v) => setIsClimateDefiance(v === true)}
              />
              <span className="text-sm">{t('isClimateDefiance')}</span>
            </label>
          </motion.div>
        );
      case 1:
        if (isClimateDefiance) {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="text-sm font-semibold">{t('harshEnvironment')}</h3>
              <ClimateProfiler selected={harshFactors} onChange={setHarshFactors} />
            </motion.div>
          );
        }
        // fall through to schedule
        break;
      case isClimateDefiance ? 2 : 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <Checkbox
                id="schedule"
                checked={scheduleEnabled}
                onCheckedChange={(v) => setScheduleEnabled(v === true)}
              />
              <span className="text-sm">{t('scheduleEnabled')}</span>
            </label>
            {scheduleEnabled && (
              <>
                <div className="space-y-2">
                  <Label>{t('frequency')}</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as WateringSchedule['frequency'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_daily">{t('onceDaily')}</SelectItem>
                      <SelectItem value="every_x_days">{t('everyXDays')}</SelectItem>
                      <SelectItem value="weekly">{t('weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="specific_days">{t('specificDays')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {frequency === 'every_x_days' && (
                  <div className="space-y-2">
                    <Label>{t('intervalDays')}</Label>
                    <Input type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t('preferredTime')}</Label>
                  <Input type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
                </div>
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <Checkbox
                    id="reminder"
                    checked={reminderEnabled}
                    onCheckedChange={(v) => setReminderEnabled(v === true)}
                  />
                  <span className="text-sm">{t('reminderEnabled')}</span>
                </label>
              </>
            )}
          </motion.div>
        );
      case isClimateDefiance ? 3 : 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <Checkbox
                id="gen2"
                checked={isGen2}
                onCheckedChange={(v) => setIsGen2(v === true)}
              />
              <span className="text-sm">{t('stepLineage')} G2+?</span>
            </label>
            {isGen2 && (
              <>
                <div className="space-y-2">
                  <Label>{t('parentPlant')}</Label>
                  <Select value={parentPlantId || 'none'} onValueChange={(v) => setParentPlantId(v === 'none' ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('seedHarvestDate')}</Label>
                  <Input type="date" value={seedHarvestDate} onChange={(e) => setSeedHarvestDate(e.target.value)} />
                </div>
              </>
            )}
          </motion.div>
        );
      default:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('notes')}</Label>
              <textarea className="w-full h-24 rounded-md border bg-background p-3 text-sm resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
            </div>
            <div className="space-y-2">
              <Label>{t('tags')}</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="flowering, yellow_leaves (comma separated)" />
            </div>
            <div className="space-y-2">
              <Label>{t('heroPhoto')}</Label>
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {heroPhotoBase64 ? (
                    <img src={heroPhotoBase64} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{t('chooseFile')}</span>
                  )}
                </div>
              </label>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={cn('pb-8', isRTL && 'direction-rtl')}>
      <Header title={t('addPlant')} showBack onBack={() => step > 0 ? setStep(step - 1) : navigate('/')} />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          {steps.map((s, i) => (
            <span key={s} className={cn('px-2 py-1 rounded', i === currentStepIdx ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              {i + 1}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-semibold">{currentStepLabel}</h2>
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        <div className="flex gap-2 pt-4">
          {step > 0 && <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>{t('previous')}</Button>}
          {step < steps.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)} disabled={step === 0 && !name.trim()}>{t('next')}</Button>
          ) : (
            <Button className="flex-1" onClick={handleFinish} disabled={!name.trim()}>{t('finish')}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
