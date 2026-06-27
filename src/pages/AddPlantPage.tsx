import { useState, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Camera, Droplets, Sprout, TreePine, Tag, Dna } from 'lucide-react';

// ─── Step IDs — order is explicit, no dynamic case logic ───────────────────
type StepId = 'identity' | 'environment' | 'schedule' | 'lineage' | 'notes';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AddPlantPage() {
  const navigate = useNavigate();
  const { addPlant } = usePlants();
  const { t } = useI18n();

  // ── identity ──
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [origin, setOrigin] = useState('');
  const [germinationDate, setGerminationDate] = useState('');
  const [adoptionDate, setAdoptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isClimateDefiance, setIsClimateDefiance] = useState(false);

  // ── environment ──
  const [harshFactors, setHarshFactors] = useState<HarshEnvironmentFactor[]>([]);

  // ── schedule ──
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState<WateringSchedule['frequency']>('weekly');
  const [intervalDays, setIntervalDays] = useState('3');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [preferredTime, setPreferredTime] = useState('07:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // ── lineage ──
  const [isGen2, setIsGen2] = useState(false);
  const [parentPlantId, setParentPlantId] = useState<string | null>(null);
  const [seedHarvestDate, setSeedHarvestDate] = useState('');

  // ── notes & photo ──
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [heroPhotoBase64, setHeroPhotoBase64] = useState('');

  // ── step management ────────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);

  const getSteps = (): StepId[] => {
    const s: StepId[] = ['identity'];
    if (isClimateDefiance) s.push('environment');
    s.push('schedule', 'lineage', 'notes');
    return s;
  };

  const steps = getSteps();
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const stepMeta: Record<StepId, { label: string; hint: string; icon: ReactNode }> = {
    identity:    { label: t('stepIdentity'),    hint: 'Name your plant and set the key dates.',           icon: <Sprout className="w-4 h-4" /> },
    environment: { label: t('stepEnvironment'), hint: 'Select the harsh conditions this plant faces.',    icon: <TreePine className="w-4 h-4" /> },
    schedule:    { label: t('stepSchedule'),    hint: 'Set a watering reminder. You can skip this step.', icon: <Droplets className="w-4 h-4" /> },
    lineage:     { label: t('stepLineage'),     hint: 'Is this plant grown from seeds of another plant?', icon: <Dna className="w-4 h-4" /> },
    notes:       { label: t('stepTags'),        hint: 'Add notes, tags, and an optional cover photo.',   icon: <Tag className="w-4 h-4" /> },
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await compressImage(file, 800, 0.8);
      setHeroPhotoBase64(b64);
    }
  };

  const toggleDay = (day: number) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFinish = () => {
    if (!name.trim() || !adoptionDate) return;

    const schedule: WateringSchedule | undefined = scheduleEnabled ? {
      enabled: true,
      frequency,
      intervalDays: frequency === 'every_x_days' ? parseInt(intervalDays) || 3 : undefined,
      specificDays: frequency === 'specific_days' ? specificDays : undefined,
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
      heroPhotoId: undefined,
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

  // ─── Step renderers ────────────────────────────────────────────────────────

  const renderIdentity = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('plantName')} <span className="text-destructive">*</span></Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Papaya" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1">
          {t('scientificName')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
        </Label>
        <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} placeholder="Carica papaya" />
      </div>
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1">
          {t('origin')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
        </Label>
        <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Central America" />
      </div>
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1">
          {t('germinationDate')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
        </Label>
        <p className="text-xs text-muted-foreground">Date the seed germinated or the plant was grown from seed.</p>
        <Input type="date" value={germinationDate} onChange={(e) => setGerminationDate(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t('adoptionDate')} <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">The date you started caring for this plant. Used to calculate your care streak.</p>
        <Input type="date" value={adoptionDate} onChange={(e) => setAdoptionDate(e.target.value)} required />
      </div>
      <div className="rounded-lg border bg-card p-3 space-y-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={isClimateDefiance}
            onCheckedChange={(v) => setIsClimateDefiance(v === true)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">{t('isClimateDefiance')}</p>
            <p className="text-xs text-muted-foreground">Enable this if you are growing this plant outside its native climate (e.g. tropical plant in a desert). Unlocks the Environment step.</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderEnvironment = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Check all the harsh conditions this plant is dealing with in its current location.</p>
      <ClimateProfiler selected={harshFactors} onChange={setHarshFactors} />
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={scheduleEnabled}
            onCheckedChange={(v) => setScheduleEnabled(v === true)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">{t('scheduleEnabled')}</p>
            <p className="text-xs text-muted-foreground">Track how often you water this plant. You can log individual waterings without a schedule too.</p>
          </div>
        </label>
      </div>

      <div className={cn('space-y-4 transition-opacity', !scheduleEnabled && 'opacity-40 pointer-events-none')}>
        <div className="space-y-1.5">
          <Label>{t('frequency')}</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as WateringSchedule['frequency'])} disabled={!scheduleEnabled}>
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
          <div className="space-y-1.5">
            <Label>{t('intervalDays')} (days)</Label>
            <Input type="number" min="1" max="365" value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)} disabled={!scheduleEnabled} />
          </div>
        )}

        {frequency === 'specific_days' && (
          <div className="space-y-1.5">
            <Label>Days of the week</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_NAMES.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!scheduleEnabled}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    'w-9 h-9 rounded-full text-xs font-medium border transition-colors',
                    specificDays.includes(i)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border'
                  )}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t('preferredTime')}</Label>
          <Input type="time" value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)} disabled={!scheduleEnabled} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={reminderEnabled}
            onCheckedChange={(v) => setReminderEnabled(v === true)}
            disabled={!scheduleEnabled}
          />
          <span className="text-sm">{t('reminderEnabled')}</span>
        </label>
      </div>
    </div>
  );

  const renderLineage = () => (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={isGen2}
            onCheckedChange={(v) => setIsGen2(v === true)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">Generation 2+ plant</p>
            <p className="text-xs text-muted-foreground">This plant was grown from seeds harvested from another plant in your journal. Enables lineage tracking (G1 → G2 → G3...).</p>
          </div>
        </label>
      </div>

      {isGen2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('parentPlant')}</Label>
            <p className="text-xs text-muted-foreground">Select the parent plant this was grown from.</p>
            <Select value={parentPlantId || 'none'} onValueChange={(v) => setParentPlantId(v === 'none' ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Select parent plant" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('seedHarvestDate')}</Label>
            <p className="text-xs text-muted-foreground">When were the seeds harvested from the parent plant?</p>
            <Input type="date" value={seedHarvestDate} onChange={(e) => setSeedHarvestDate(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('notes')}</Label>
        <textarea
          className="w-full h-24 rounded-md border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any initial observations, source, or context..."
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('tags')}</Label>
        <p className="text-xs text-muted-foreground">Comma-separated. Example: flowering, new_shoot, tip_burn</p>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="flowering, new_shoot" />
      </div>
      <div className="space-y-1.5">
        <Label>Cover Photo <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <div className="border-2 border-dashed border-muted rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
            {heroPhotoBase64 ? (
              <div className="relative">
                <img src={heroPhotoBase64} alt="Preview" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                  <span className="text-white text-sm ms-2">Change photo</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-28 gap-2 text-muted-foreground">
                <Camera className="w-8 h-8 opacity-40" />
                <span className="text-sm">Tap to add a cover photo</span>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'identity':    return renderIdentity();
      case 'environment': return renderEnvironment();
      case 'schedule':    return renderSchedule();
      case 'lineage':     return renderLineage();
      case 'notes':       return renderNotes();
    }
  };

  const meta = stepMeta[currentStep];

  return (
    <div className="pb-8">
      <Header
        title={t('addPlant')}
        showBack
        onBack={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : navigate('/')}
      />
      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* Step progress dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === stepIndex ? 'bg-primary flex-1' : i < stepIndex ? 'bg-primary/40 w-6' : 'bg-muted w-6'
              )}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {meta.icon}
          </div>
          <div>
            <h2 className="font-semibold text-base leading-tight">{meta.label}</h2>
            <p className="text-xs text-muted-foreground">{meta.hint}</p>
          </div>
        </div>

        {/* Step content — no AnimatePresence, just render */}
        <div>{renderCurrentStep()}</div>

        {/* Navigation buttons */}
        <div className="flex gap-2 pt-2">
          {stepIndex > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStepIndex(stepIndex - 1)}>
              {t('previous')}
            </Button>
          )}
          {isLastStep ? (
            <Button className="flex-1" onClick={handleFinish} disabled={!name.trim()}>
              {t('finish')}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => setStepIndex(stepIndex + 1)}
              disabled={stepIndex === 0 && !name.trim()}
            >
              {t('next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
