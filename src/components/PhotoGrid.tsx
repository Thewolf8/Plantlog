import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';
import type { PlantPhoto } from '@/types/photo';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: PlantPhoto[];
  onDelete?: (id: string) => void;
  dateFormat: 'DMY' | 'MDY' | 'YMD';
  className?: string;
}

export default function PhotoGrid({ photos, onDelete, dateFormat, className }: PhotoGridProps) {
  const { t } = useI18n();
  const [viewerPhoto, setViewerPhoto] = useState<PlantPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-muted-foreground', className)}>
        <Tag className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">{t('empty')}</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('grid grid-cols-3 gap-1.5', className)}>
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden bg-muted"
            onClick={() => setViewerPhoto(photo)}
          >
            <img src={photo.base64} alt={photo.caption || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {viewerPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewerPhoto(null)}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white" onClick={() => setViewerPhoto(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              <img src={viewerPhoto.base64} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              <div className="mt-3 flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(viewerPhoto.uploadedAt, dateFormat)}
                </span>
                {viewerPhoto.caption && <span>{viewerPhoto.caption}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
