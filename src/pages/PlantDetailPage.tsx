import { useState, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePlants } from '@/hooks/usePlants';
import { useJournal } from '@/hooks/useJournal';
import { usePhotos } from '@/hooks/usePhotos';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/I18nContext';
import { exportPlantPDFReport } from '@/services/exportService';
import Header from '@/components/Header';
import TimelineEntry from '@/components/TimelineEntry';
import PhotoGrid from '@/components/PhotoGrid';
import AgeCounter from '@/components/AgeCounter';
import GenerationBadge from '@/components/GenerationBadge';
import TagBadge from '@/components/TagBadge';
import WateringLogForm from '@/components/WateringLogForm';
import InterventionForm from '@/components/InterventionForm';
import WeatherEventButton from '@/components/WeatherEventButton';
import ClimateProfiler from '@/components/ClimateProfiler';
import { formatDate, daysSince } from '@/lib/utils';
import { Pencil, FileText, Droplets, Plus, CloudSun, Eye } from 'lucide-react';
import type { WaterSource } from '@/types/journal';

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlant, updatePlant, deletePlant } = usePlants();
  const { entries, addEntry } = useJournal(id);
  const { photos, addPhoto, deletePhoto } = usePhotos(id);
  const { settings } = useSettings();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState('timeline');
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [showWeatherButtons, setShowWeatherButtons] = useState(false);
  const [showObservationInput, setShowObservationInput] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const plant = id ? getPlant(id) : undefined;

  if (!plant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-muted-foreground">
        <p>Plant not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Back</Button>
      </div>
    );
  }

  const heroPhoto = photos.find((p) => p.id === plant.heroPhotoId);
  const dateFormat = settings.dateFormat;

  const handleWaterSubmit = (source: WaterSource, _sourceNote: string, amountLiters?: number, method?: string) => {
    addEntry(plant.id, { kind: 'watering', source, sourceNote: source || undefined, amountLiters, method });
    if (plant.wateringSchedule) {
      updatePlant(plant.id, {
        wateringSchedule: { ...plant.wateringSchedule, lastWateredAt: new Date().toISOString() },
      });
    }
    setShowWaterForm(false);
  };

  const handleInterventionSubmit = (data: Record<string, unknown>) => {
    if (data.kind === 'fertilizer') {
      addEntry(plant.id, {
        kind: 'fertilizer',
        fertilizerType: data.fertilizerType as 'organic' | 'chemical' | 'foliar' | 'slow_release',
        productName: data.productName as string,
        npk: data.npk as string | undefined,
        quantityGrams: data.quantityGrams as number | undefined,
        applicationMethod: data.applicationMethod as string | undefined,
      });
    } else {
      addEntry(plant.id, {
        kind: 'pesticide',
        interventionType: data.interventionType as 'pesticide' | 'fungicide' | 'other',
        productName: data.productName as string,
        isOrganic: data.isOrganic as boolean,
        dilutionRatio: data.dilutionRatio as string | undefined,
        targetPest: data.targetPest as string | undefined,
      });
    }
    setShowInterventionForm(false);
  };

  const handleWeatherLog = (eventType: string, severity?: 'mild' | 'moderate' | 'severe') => {
    addEntry(plant.id, { kind: 'weather', eventType: eventType as 'sandstorm' | 'heatwave' | 'sudden_frost' | 'heavy_rain' | 'hailstorm' | 'drought' | 'high_humidity' | 'cold_snap', severity });
    setShowWeatherButtons(false);
  };

  const handleObservationSubmit = () => {
    if (!observationText.trim()) return;
    addEntry(plant.id, { kind: 'observation', text: observationText.trim(), tags: [], linkedPhotoIds: [] });
    setObservationText('');
    setShowObservationInput(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportPlantPDFReport(plant.id, dateFormat);
    } catch (e) {
      console.error(e);
    }
    setIsExporting(false);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addPhoto(plant.id, file);
    }
  };

  return (
    <div className="pb-24">
      <Header
        title={plant.name}
        showBack
        onBack={() => navigate('/')}
        rightAction={
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleExportPDF} disabled={isExporting}>
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/plant/${plant.id}/edit`)}>
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Hero section */}
      <div className="relative h-48 bg-muted">
        {heroPhoto ? (
          <img src={heroPhoto.base64} alt={plant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-plant-100/20 to-plant-900/20">
            <span className="text-6xl opacity-20">🌿</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-white font-bold text-lg">{plant.name}</h1>
          {plant.scientificName && <p className="text-white/70 text-xs italic">{plant.scientificName}</p>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AgeCounter germinationDate={plant.germinationDate} adoptionDate={plant.adoptionDate} />
        <GenerationBadge generation={plant.generation} />

        {plant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {plant.tags.map((tag) => (
              <TagBadge key={tag} label={tag} color="bg-primary/20 text-primary border-primary/30" />
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-6 h-9">
            <TabsTrigger value="timeline" className="text-[10px] px-1">{t('timeline')}</TabsTrigger>
            <TabsTrigger value="photos" className="text-[10px] px-1">{t('photos')}</TabsTrigger>
            <TabsTrigger value="watering" className="text-[10px] px-1">{t('watering')}</TabsTrigger>
            <TabsTrigger value="interventions" className="text-[10px] px-1">{t('interventions')}</TabsTrigger>
            {plant.isClimateDefiance && (
              <TabsTrigger value="climate" className="text-[10px] px-1">{t('climate')}</TabsTrigger>
            )}
            <TabsTrigger value="info" className="text-[10px] px-1">{t('info')}</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-3 mt-4">
            <div className="flex gap-2 flex-wrap">
              <Sheet open={showWaterForm} onOpenChange={setShowWaterForm}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Droplets className="w-3 h-3" /> {t('logWatering')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                  <SheetHeader><SheetTitle>{t('logWatering')}</SheetTitle></SheetHeader>
                  <WateringLogForm onSubmit={handleWaterSubmit} onCancel={() => setShowWaterForm(false)} defaultSource={settings.defaultWaterSource} />
                </SheetContent>
              </Sheet>

              <Sheet open={showInterventionForm} onOpenChange={setShowInterventionForm}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Plus className="w-3 h-3" /> {t('addIntervention')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                  <SheetHeader><SheetTitle>{t('addIntervention')}</SheetTitle></SheetHeader>
                  <InterventionForm onSubmit={handleInterventionSubmit} onCancel={() => setShowInterventionForm(false)} />
                </SheetContent>
              </Sheet>

              <Sheet open={showWeatherButtons} onOpenChange={setShowWeatherButtons}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <CloudSun className="w-3 h-3" /> {t('logWeather')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[60vh]">
                  <SheetHeader><SheetTitle>{t('logWeather')}</SheetTitle></SheetHeader>
                  <div className="pt-4">
                    <WeatherEventButton onSelect={handleWeatherLog} />
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet open={showObservationInput} onOpenChange={setShowObservationInput}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Eye className="w-3 h-3" /> {t('addObservation')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader><SheetTitle>{t('addObservation')}</SheetTitle></SheetHeader>
                  <div className="pt-4 space-y-3">
                    <textarea
                      className="w-full h-24 rounded-md border bg-background p-3 text-sm resize-none"
                      placeholder="Write your observation..."
                      value={observationText}
                      onChange={(e) => setObservationText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowObservationInput(false)}>{t('cancel')}</Button>
                      <Button className="flex-1" onClick={handleObservationSubmit}>{t('save')}</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="space-y-2">
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('empty')}</p>
              ) : (
                entries.map((entry, i) => (
                  <TimelineEntry key={entry.id} entry={entry} index={i} dateFormat={dateFormat} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="mt-4">
            <div className="mb-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <span>{t('chooseFile')}</span>
                </Button>
              </label>
            </div>
            <PhotoGrid photos={photos} onDelete={deletePhoto} dateFormat={dateFormat} />
          </TabsContent>

          <TabsContent value="watering" className="space-y-4 mt-4">
            {plant.wateringSchedule?.enabled ? (
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="text-sm font-medium">{t('frequency')}: {plant.wateringSchedule.frequency}</p>
                {plant.wateringSchedule.intervalDays && <p className="text-xs text-muted-foreground">{t('intervalDays')}: {plant.wateringSchedule.intervalDays}</p>}
                {plant.wateringSchedule.preferredTimeHHMM && <p className="text-xs text-muted-foreground">{t('preferredTime')}: {plant.wateringSchedule.preferredTimeHHMM}</p>}
                {plant.wateringSchedule.lastWateredAt && (
                  <p className="text-xs text-muted-foreground">{t('lastWatered')}: {formatDate(plant.wateringSchedule.lastWateredAt, dateFormat)} ({daysSince(plant.wateringSchedule.lastWateredAt)} {t('daysAgo')})</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('empty')}</p>
            )}
          </TabsContent>

          <TabsContent value="interventions" className="space-y-3 mt-4">
            {entries.filter((e) => e.payload.kind === 'fertilizer' || e.payload.kind === 'pesticide').length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('empty')}</p>
            ) : (
              entries
                .filter((e) => e.payload.kind === 'fertilizer' || e.payload.kind === 'pesticide')
                .map((entry, i) => (
                  <TimelineEntry key={entry.id} entry={entry} index={i} dateFormat={dateFormat} />
                ))
            )}
          </TabsContent>

          {plant.isClimateDefiance && (
            <TabsContent value="climate" className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">{t('harshEnvironment')}</h3>
                <ClimateProfiler
                  selected={plant.harshEnvironmentFactors}
                  onChange={(factors) => updatePlant(plant.id, { harshEnvironmentFactors: factors })}
                />
              </div>
              {plant.microclimateMods.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">{t('microclimateMods')}</h3>
                  <div className="space-y-2">
                    {plant.microclimateMods.map((mod) => (
                      <div key={mod.id} className="rounded-lg border bg-card p-3">
                        <p className="text-xs font-medium">{mod.type}</p>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDate(mod.dateApplied, dateFormat)} {mod.stillActive && '• Active'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('plantName')}</span> <span className="font-medium">{plant.name}</span></div>
              {plant.scientificName && <div className="flex justify-between"><span className="text-muted-foreground">{t('scientificName')}</span> <span className="italic">{plant.scientificName}</span></div>}
              {plant.origin && <div className="flex justify-between"><span className="text-muted-foreground">{t('origin')}</span> <span>{plant.origin}</span></div>}
              {plant.germinationDate && <div className="flex justify-between"><span className="text-muted-foreground">{t('germinationDate')}</span> <span>{formatDate(plant.germinationDate, dateFormat)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">{t('adoptionDate')}</span> <span>{formatDate(plant.adoptionDate, dateFormat)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('climateDefiance')}</span> <span>{plant.isClimateDefiance ? t('yes') : t('no')}</span></div>
              {plant.generation.number > 1 && (
                <div className="flex justify-between"><span className="text-muted-foreground">{t('generation')}</span> <span>G{plant.generation.number}</span></div>
              )}
              {plant.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-1">{t('notes')}</p>
                  <p className="text-xs">{plant.notes}</p>
                </div>
              )}
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this plant and all its data?')) {
                  deletePlant(plant.id);
                  navigate('/');
                }
              }}
            >
              {t('delete')} {plant.name}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
