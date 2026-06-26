import { STORAGE_KEYS } from '@/lib/constants';
import { downloadBlob } from '@/lib/utils';

export interface ImportResult {
  success: boolean;
  plantsImported: number;
  entriesImported: number;
  photosImported: number;
  tagsImported: number;
  errors: string[];
}

export function importFromJSON(json: string): ImportResult {
  const result: ImportResult = { success: false, plantsImported: 0, entriesImported: 0, photosImported: 0, tagsImported: 0, errors: [] };
  try {
    const data = JSON.parse(json);
    if (data[STORAGE_KEYS.plants] && Array.isArray(data[STORAGE_KEYS.plants])) {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.plants);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...data[STORAGE_KEYS.plants]];
      const unique = merged.filter((p, i, a) => a.findIndex((pp: { id: string }) => pp.id === p.id) === i);
      localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(unique));
      result.plantsImported = data[STORAGE_KEYS.plants].length;
    }
    if (data[STORAGE_KEYS.journalEntries] && Array.isArray(data[STORAGE_KEYS.journalEntries])) {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.journalEntries);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...data[STORAGE_KEYS.journalEntries]];
      const unique = merged.filter((e, i, a) => a.findIndex((ee: { id: string }) => ee.id === e.id) === i);
      localStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(unique));
      result.entriesImported = data[STORAGE_KEYS.journalEntries].length;
    }
    if (data[STORAGE_KEYS.photos] && Array.isArray(data[STORAGE_KEYS.photos])) {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.photos);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...data[STORAGE_KEYS.photos]];
      const unique = merged.filter((p, i, a) => a.findIndex((pp: { id: string }) => pp.id === p.id) === i);
      localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(unique));
      result.photosImported = data[STORAGE_KEYS.photos].length;
    }
    if (data[STORAGE_KEYS.tags] && Array.isArray(data[STORAGE_KEYS.tags])) {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.tags);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...data[STORAGE_KEYS.tags]];
      const unique = merged.filter((t, i, a) => a.findIndex((tt: { slug: string }) => tt.slug === t.slug) === i);
      localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(unique));
      result.tagsImported = data[STORAGE_KEYS.tags].length;
    }
    result.success = true;
  } catch (e) {
    result.errors.push((e as Error).message);
  }
  return result;
}

export async function exportAndShare(format: 'json' | 'csv', content: string, filename: string) {
  try {
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
    } else {
      downloadBlob(content, filename);
    }
  } catch {
    downloadBlob(content, filename);
  }
}
