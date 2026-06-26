import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import type { JournalEntry, JournalPayload } from '@/types/journal';

export function useJournal(plantId?: string) {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>(STORAGE_KEYS.journalEntries, []);

  const filteredEntries = useMemo(() => {
    const filtered = plantId ? entries.filter((e) => e.plantId === plantId) : [...entries];
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, plantId]);

  const addEntry = useCallback((pid: string, payload: JournalPayload): JournalEntry => {
    const entry: JournalEntry = {
      id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
      plantId: pid,
      date: new Date().toISOString(),
      payload,
      isWeatherFlag: payload.kind === 'weather',
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    return entry;
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [setEntries]);

  const weatherEvents = useMemo(() => {
    const filtered = plantId ? entries.filter((e) => e.plantId === plantId) : [...entries];
    return filtered
      .filter((e) => e.payload.kind === 'weather')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, plantId]);

  return { entries: filteredEntries, addEntry, deleteEntry, weatherEvents };
}
