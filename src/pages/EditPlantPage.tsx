import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlants } from '@/hooks/usePlants';
import { useI18n } from '@/i18n/I18nContext';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlant, updatePlant } = usePlants();
  const { t, isRTL } = useI18n();

  const plant = id ? getPlant(id) : undefined;
  const [name, setName] = useState(plant?.name || '');
  const [scientificName, setScientificName] = useState(plant?.scientificName || '');
  const [origin, setOrigin] = useState(plant?.origin || '');
  const [germinationDate, setGerminationDate] = useState(plant?.germinationDate || '');
  const [adoptionDate, setAdoptionDate] = useState(plant?.adoptionDate || '');
  const [notes, setNotes] = useState(plant?.notes || '');
  const [isClimateDefiance, setIsClimateDefiance] = useState(plant?.isClimateDefiance || false);

  if (!plant) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Plant not found</div>;
  }

  const handleSave = () => {
    updatePlant(plant.id, {
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      origin: origin.trim() || undefined,
      germinationDate: germinationDate || undefined,
      adoptionDate,
      notes,
      isClimateDefiance,
    });
    navigate(`/plant/${plant.id}`);
  };

  return (
    <div className={cn('pb-8', isRTL && 'direction-rtl')}>
      <Header title={t('edit')} showBack onBack={() => navigate(`/plant/${plant.id}`)} />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label>{t('plantName')} *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{t('scientificName')}</Label>
          <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('origin')}</Label>
          <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('germinationDate')}</Label>
          <Input type="date" value={germinationDate} onChange={(e) => setGerminationDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('adoptionDate')} *</Label>
          <Input type="date" value={adoptionDate} onChange={(e) => setAdoptionDate(e.target.value)} required />
        </div>
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <Checkbox
            id="edit-climate"
            checked={isClimateDefiance}
            onCheckedChange={(v) => setIsClimateDefiance(v === true)}
          />
          <span className="text-sm">{t('isClimateDefiance')}</span>
        </label>
        <div className="space-y-2">
          <Label>{t('notes')}</Label>
          <textarea className="w-full h-24 rounded-md border bg-background p-3 text-sm resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>{t('save')}</Button>
      </div>
    </div>
  );
}
