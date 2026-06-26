import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import { compressImage } from '@/lib/utils';
import type { PlantPhoto } from '@/types/photo';

export function usePhotos(plantId?: string) {
  const [photos, setPhotos] = useLocalStorage<PlantPhoto[]>(STORAGE_KEYS.photos, []);

  const filteredPhotos = useMemo(() => {
    const filtered = plantId ? photos.filter((p) => p.plantId === plantId) : [...photos];
    return filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [photos, plantId]);

  const addPhoto = useCallback(async (pid: string, file: File): Promise<PlantPhoto> => {
    const base64 = await compressImage(file, 1200, 0.8);
    const photo: PlantPhoto = {
      id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
      plantId: pid,
      base64,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      takenAt: new Date().toISOString(),
      tags: [],
      fileSizeBytes: file.size,
    };
    setPhotos((prev) => [photo, ...prev]);
    return photo;
  }, [setPhotos]);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [setPhotos]);

  const getPhotoById = useCallback(
    (id: string): PlantPhoto | undefined => photos.find((p) => p.id === id),
    [photos]
  );

  const getPhotosByTag = useCallback(
    (tagSlug: string): PlantPhoto[] => {
      return photos.filter((p) => p.tags.includes(tagSlug));
    },
    [photos]
  );

  return { photos: filteredPhotos, addPhoto, deletePhoto, getPhotoById, getPhotosByTag };
}
