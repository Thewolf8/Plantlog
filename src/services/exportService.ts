import { STORAGE_KEYS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/utils';
import { getPlantById, getAllPlants } from './plantService';
import { getEntriesForPlant, getAllEntries } from './journalService';
import { getPhotosForPlant } from './photoService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportFullBackupJSON(): string {
  const data: Record<string, unknown> = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    const raw = localStorage.getItem(key);
    data[key] = raw ? JSON.parse(raw) : [];
  });
  return JSON.stringify(data, null, 2);
}

export function exportPlantJSON(plantId: string): string {
  const plant = getPlantById(plantId);
  if (!plant) throw new Error('Plant not found');
  const entries = getEntriesForPlant(plantId);
  const photos = getPhotosForPlant(plantId);
  return JSON.stringify({ plant, entries, photos }, null, 2);
}

export function exportPlantsCSV(dateFormat: 'DMY' | 'MDY' | 'YMD' = 'DMY'): string {
  const plants = getAllPlants();
  const entries = getAllEntries();
  const headers = ['Name', 'Scientific Name', 'Origin', 'Adoption Date', 'Age (Care)', 'Tags', 'Journal Entries', 'Climate Defiance'];
  const rows = plants.map((p) => [
    `"${p.name}"`,
    `"${p.scientificName || ''}"`,
    `"${p.origin || ''}"`,
    formatDate(p.adoptionDate, dateFormat),
    p.adoptionDate,
    `"${p.tags.join(', ')}"`,
    entries.filter((e) => e.plantId === p.id).length.toString(),
    p.isClimateDefiance ? 'Yes' : 'No',
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export async function exportPlantPDFReport(plantId: string, dateFormat: 'DMY' | 'MDY' | 'YMD' = 'DMY'): Promise<void> {
  const plant = getPlantById(plantId);
  if (!plant) throw new Error('Plant not found');
  const entries = getEntriesForPlant(plantId);
  const photos = getPhotosForPlant(plantId);

  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(`PlantLog Report: ${plant.name}`, 14, 20);
  if (plant.scientificName) {
    doc.setFontSize(12);
    doc.text(`Scientific Name: ${plant.scientificName}`, 14, 28);
  }

  doc.setFontSize(10);
  doc.text(`Adopted: ${formatDate(plant.adoptionDate, dateFormat)}`, 14, 38);
  doc.text(`Climate Defiance: ${plant.isClimateDefiance ? 'Yes' : 'No'}`, 14, 44);
  doc.text(`Tags: ${plant.tags.join(', ') || 'None'}`, 14, 50);

  const tableData = entries.map((e) => [
    formatDateTime(e.date, dateFormat),
    e.payload.kind,
    e.payload.kind === 'observation' ? (e.payload as { text: string }).text.substring(0, 60)
      : e.payload.kind === 'watering' ? `Watered (${(e.payload as { source: string }).source})`
      : e.payload.kind === 'weather' ? `Weather: ${(e.payload as { eventType: string }).eventType}`
      : e.payload.kind === 'fertilizer' ? `Fertilizer: ${(e.payload as { productName: string }).productName}`
      : e.payload.kind === 'pesticide' ? `Treatment: ${(e.payload as { productName: string }).productName}`
      : 'Entry',
  ]);

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    head: [['Date', 'Type', 'Details']],
    body: tableData,
    startY: 56,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 197, 94] },
  });

  if (photos.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 80;
    doc.setFontSize(14);
    doc.text(`Photos (${photos.length})`, 14, finalY + 10);
  }

  doc.save(`plantlog_${plant.name.replace(/\s+/g, '_').toLowerCase()}_report.pdf`);
}
