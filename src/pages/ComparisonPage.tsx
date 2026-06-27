import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePhotos } from '@/hooks/usePhotos';
import { usePlants } from '@/hooks/usePlants';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/I18nContext';
import { formatDateTime } from '@/lib/utils';
import Header from '@/components/Header';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComparisonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plants } = usePlants();
  const allPhotos = usePhotos();
  const { settings } = useSettings();
  const { t } = useI18n();

  const [plantA, setPlantA] = useState(id || 'all');
  const [plantB, setPlantB] = useState('all');
  const [photoA, setPhotoA] = useState<string>('');
  const [photoB, setPhotoB] = useState<string>('');

  const photosA = useMemo(() => {
    return plantA === 'all' ? allPhotos.photos : allPhotos.photos.filter((p) => p.plantId === plantA);
  }, [plantA, allPhotos.photos]);

  const photosB = useMemo(() => {
    return plantB === 'all' ? allPhotos.photos : allPhotos.photos.filter((p) => p.plantId === plantB);
  }, [plantB, allPhotos.photos]);

  const selectedPhotoA = allPhotos.getPhotoById(photoA);
  const selectedPhotoB = allPhotos.getPhotoById(photoB);

  const handleSwap = () => {
    const tempPlant = plantA;
    setPlantA(plantB);
    setPlantB(tempPlant);
    const tempPhoto = photoA;
    setPhotoA(photoB);
    setPhotoB(tempPhoto);
  };

  const handleSave = async () => {
    if (!selectedPhotoA || !selectedPhotoB) return;
    // Create canvas composite
    const canvas = document.createElement('canvas');
    const imgA = new Image();
    const imgB = new Image();
    await new Promise<void>((resolve) => { imgA.onload = () => resolve(); imgA.src = selectedPhotoA.base64; });
    await new Promise<void>((resolve) => { imgB.onload = () => resolve(); imgB.src = selectedPhotoB.base64; });
    canvas.width = Math.max(imgA.width, imgB.width) * 2;
    canvas.height = Math.max(imgA.height, imgB.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgA, 0, 0);
    ctx.drawImage(imgB, canvas.width / 2, 0);
    const link = document.createElement('a');
    link.download = `plantlog_comparison_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={'pb-8'}>
      <Header title={t('comparePhotos')} showBack onBack={() => navigate(`/plant/${id}`)} />
      <div className="p-4 space-y-4">
        <div className="flex gap-2 items-center">
          <Select value={plantA} onValueChange={setPlantA}>
            <SelectTrigger className="flex-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              {plants.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleSwap}><ArrowLeftRight className="w-4 h-4" /></Button>
          <Select value={plantB} onValueChange={setPlantB}>
            <SelectTrigger className="flex-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              {plants.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium mb-2">{t('selectPhotoA')}</p>
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
              {photosA.map((p) => (
                <div key={p.id} className={cn('aspect-square rounded cursor-pointer border-2 overflow-hidden', photoA === p.id ? 'border-primary' : 'border-transparent')} onClick={() => setPhotoA(p.id)}>
                  <img src={p.base64} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2">{t('selectPhotoB')}</p>
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
              {photosB.map((p) => (
                <div key={p.id} className={cn('aspect-square rounded cursor-pointer border-2 overflow-hidden', photoB === p.id ? 'border-primary' : 'border-transparent')} onClick={() => setPhotoB(p.id)}>
                  <img src={p.base64} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {(selectedPhotoA || selectedPhotoB) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-2 divide-x">
              {selectedPhotoA && (
                <div className="relative">
                  <img src={selectedPhotoA.base64} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-2">
                    {formatDateTime(selectedPhotoA.uploadedAt, settings.dateFormat)}
                    {selectedPhotoA.caption && <p>{selectedPhotoA.caption}</p>}
                  </div>
                </div>
              )}
              {selectedPhotoB && (
                <div className="relative">
                  <img src={selectedPhotoB.base64} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-2">
                    {formatDateTime(selectedPhotoB.uploadedAt, settings.dateFormat)}
                    {selectedPhotoB.caption && <p>{selectedPhotoB.caption}</p>}
                  </div>
                </div>
              )}
            </div>
            {selectedPhotoA && selectedPhotoB && (
              <div className="p-3">
                <Button className="w-full" onClick={handleSave}>{t('saveComparison')}</Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
