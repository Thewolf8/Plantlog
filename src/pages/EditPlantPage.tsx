import { useState, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlants } from '@/hooks/usePlants';
import { useI18n } from '@/i18n/I18nContext';
import Header from '@/components/Header';
import { compressImage } from '@/lib/utils';
import { Camera } from 'lucide-react';

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlant, updatePlant } = usePlants();
  const { t } = useI18n();

  const plant = id ? getPlant(id) : undefined;

  const [name, setName] = useState(plant?.name || '');
  const [scientificName, setScientificName] = useState(plant?.scientificName || '');
  const [origin, setOrigin] = useState(plant?.origin || '');
  const [germinationDate, setGerminationDate] = useState(plant?.germinationDate || '');
  const [adoptionDate, setAdoptionDate] = useState(plant?.adoptionDate || '');
  const [notes, setNotes] = useState(plant?.notes || '');
  const [isClimateDefiance, setIsClimateDefiance] = useState(plant?.isClimateDefiance || false);
  const [newPhotoBase64, setNewPhotoBase64] = useState('');

  // Load existing hero photo from localStorage
  const existingHeroPhoto = (() => {
    if (!plant?.heroPhotoId) return '';
    try {
      const photos = JSON.parse(localStorage.getItem('plantlog_photos') || '[]');
      const found = photos.find((p: { id: string; base64: string }) => p.id === plant.heroPhotoId);
      return found?.base64 || '';
    } catch { return ''; }
  })();

  const displayPhoto = newPhotoBase64 || existingHeroPhoto;

  if (!plant) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Plant not found
      </div>
    );
  }

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await compressImage(file, 800, 0.8);
      setNewPhotoBase64(b64);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let heroPhotoId = plant.heroPhotoId;

    if (newPhotoBase64) {
      const photoId = `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
      const photo = {
        id: photoId,
        plantId: plant.id,
        base64: newPhotoBase64,
        mimeType: 'image/jpeg' as const,
        uploadedAt: new Date().toISOString(),
        tags: [],
      };
      try {
        const existing = JSON.parse(localStorage.getItem('plantlog_photos') || '[]');
        existing.push(photo);
        localStorage.setItem('plantlog_photos', JSON.stringify(existing));
      } catch { /* ignore */ }
      heroPhotoId = photoId;
    }

    updatePlant(plant.id, {
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      origin: origin.trim() || undefined,
      germinationDate: germinationDate || undefined,
      adoptionDate,
      notes,
      isClimateDefiance,
      heroPhotoId,
    });

    navigate(`/plant/${plant.id}`);
  };

  return (
    <div className="pb-8">
      <Header title={t('edit')} showBack onBack={() => navigate(`/plant/${plant.id}`)} />
      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* Cover photo */}
        <div className="space-y-1.5">
          <Label>Cover Photo</Label>
          <label className="cursor-pointer block">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="border-2 border-dashed border-muted rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
              {displayPhoto ? (
                <div className="relative">
                  <img src={displayPhoto} alt="Cover" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-7 h-7 text-white" />
                    <span className="text-white text-sm ms-2">Change photo</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                  <Camera className="w-8 h-8 opacity-40" />
                  <span className="text-sm">Tap to add a cover photo</span>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="space-y-1.5">
          <Label>{t('plantName')} <span className="text-destructive">*</span></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>{t('scientificName')}</Label>
          <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>{t('origin')}</Label>
          <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>{t('germinationDate')}</Label>
          <Input type="date" value={germinationDate} onChange={(e) => setGerminationDate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>{t('adoptionDate')} <span className="text-destructive">*</span></Label>
          <Input type="date" value={adoptionDate} onChange={(e) => setAdoptionDate(e.target.value)} required />
        </div>

        <div className="rounded-lg border bg-card p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={isClimateDefiance}
              onCheckedChange={(v) => setIsClimateDefiance(v === true)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">{t('isClimateDefiance')}</p>
              <p className="text-xs text-muted-foreground">Plant grown outside its native climate.</p>
            </div>
          </label>
        </div>

        <div className="space-y-1.5">
          <Label>{t('notes')}</Label>
          <textarea
            className="w-full h-24 rounded-md border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
