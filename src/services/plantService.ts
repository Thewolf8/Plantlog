import { STORAGE_KEYS } from '@/lib/constants';
import type { Plant } from '@/types/plant';

export function getAllPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.plants);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getPlantById(id: string): Plant | undefined {
  return getAllPlants().find((p) => p.id === id);
}

export function createPlant(data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Plant {
  const now = new Date().toISOString();
  const plant: Plant = {
    ...data,
    id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  const plants = getAllPlants();
  plants.unshift(plant);
  localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(plants));
  return plant;
}

export function updatePlant(id: string, data: Partial<Plant>): Plant {
  const plants = getAllPlants();
  const idx = plants.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Plant not found');
  plants[idx] = { ...plants[idx], ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(plants));
  return plants[idx];
}

export function deletePlant(id: string): void {
  const plants = getAllPlants().filter((p) => p.id !== id);
  const entriesRaw = localStorage.getItem(STORAGE_KEYS.journalEntries);
  const photosRaw = localStorage.getItem(STORAGE_KEYS.photos);
  const entries = entriesRaw ? JSON.parse(entriesRaw) : [];
  const photos = photosRaw ? JSON.parse(photosRaw) : [];
  localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(plants));
  localStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(entries.filter((e: { plantId: string }) => e.plantId !== id)));
  localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(photos.filter((p: { plantId: string }) => p.plantId !== id)));
}
