export interface PlantPhoto {
  id: string;
  plantId: string;
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  uploadedAt: string;
  takenAt?: string;
  caption?: string;
  tags: string[];
  linkedJournalEntryId?: string;
  fileSizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
}
