import { STORAGE_KEYS } from '@/lib/constants';
import type { JournalEntry, JournalPayload } from '@/types/journal';

export function getEntriesForPlant(plantId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.journalEntries);
    const entries = raw ? (JSON.parse(raw) as JournalEntry[]).filter((e) => e.plantId === plantId) : [];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch { return []; }
}

export function getAllEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.journalEntries);
    const entries = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch { return []; }
}

export function addEntry(plantId: string, payload: JournalPayload): JournalEntry {
  const entry: JournalEntry = {
    id: `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    date: new Date().toISOString(),
    payload,
    isWeatherFlag: payload.kind === 'weather',
    createdAt: new Date().toISOString(),
  };
  const entries = getAllEntries();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(entries));
  return entry;
}

export function deleteEntry(id: string): void {
  const entries = getAllEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(entries));
}

export function getWeatherEvents(plantId: string): JournalEntry[] {
  return getEntriesForPlant(plantId).filter((e) => e.payload.kind === 'weather');
}
