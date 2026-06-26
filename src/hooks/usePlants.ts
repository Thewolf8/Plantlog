import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import type { Plant } from '@/types/plant';

export function usePlants() {
  const [plants, setPlants] = useLocalStorage<Plant[]>(STORAGE_KEYS.plants, []);

  const addPlant = useCallback((data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Plant => {
    const now = new Date().toISOString();
    const plant: Plant = {
      ...data,
      id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    setPlants((prev) => [plant, ...prev]);
    return plant;
  }, [setPlants]);

  const updatePlant = useCallback((id: string, data: Partial<Plant>) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
  }, [setPlants]);

  const deletePlant = useCallback((id: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, [setPlants]);

  const getPlant = useCallback(
    (id: string): Plant | undefined => plants.find((p) => p.id === id),
    [plants]
  );

  const climateDefiancePlants = plants.filter((p) => p.isClimateDefiance);

  return { plants, climateDefiancePlants, addPlant, updatePlant, deletePlant, getPlant };
}
