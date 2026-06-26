import { STORAGE_KEYS } from '@/lib/constants';
import { compressImage } from '@/lib/utils';
import type { PlantPhoto } from '@/types/photo';

export function getPhotosForPlant(plantId: string): PlantPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.photos);
    const photos = raw ? (JSON.parse(raw) as PlantPhoto[]).filter((p) => p.plantId === plantId) : [];
    return photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch { return []; }
}

export async function addPhoto(plantId: string, file: File): Promise<PlantPhoto> {
  const base64 = await compressImage(file, 1200, 0.8);
  const photo: PlantPhoto = {
    id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    base64,
    mimeType: 'image/jpeg',
    uploadedAt: new Date().toISOString(),
    takenAt: new Date().toISOString(),
    tags: [],
    fileSizeBytes: file.size,
  };
  const allRaw = localStorage.getItem(STORAGE_KEYS.photos);
  const all = allRaw ? JSON.parse(allRaw) : [];
  all.unshift(photo);
  localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(all));
  return photo;
}

export function deletePhoto(id: string): void {
  const allRaw = localStorage.getItem(STORAGE_KEYS.photos);
  const all = allRaw ? JSON.parse(allRaw) : [];
  localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(all.filter((p: PlantPhoto) => p.id !== id)));
}

export function getPhotoById(id: string): PlantPhoto | undefined {
  const allRaw = localStorage.getItem(STORAGE_KEYS.photos);
  const all = allRaw ? JSON.parse(allRaw) : [];
  return all.find((p: PlantPhoto) => p.id === id);
}
