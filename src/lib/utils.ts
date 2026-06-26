import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInYears, differenceInMonths, differenceInDays, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateStr: string, dateFormat: 'DMY' | 'MDY' | 'YMD' = 'DMY'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    switch (dateFormat) {
      case 'MDY': return format(date, 'MM/dd/yyyy');
      case 'YMD': return format(date, 'yyyy-MM-dd');
      default: return format(date, 'dd/MM/yyyy');
    }
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string, dateFormat: 'DMY' | 'MDY' | 'YMD' = 'DMY'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = formatDate(dateStr, dateFormat);
    const timePart = format(date, 'HH:mm');
    return `${datePart} ${timePart}`;
  } catch {
    return dateStr;
  }
}

export function calculateAge(germinationDate: string): { years: number; months: number; days: number; text: string } {
  const start = new Date(germinationDate);
  const now = new Date();
  const years = differenceInYears(now, start);
  const months = differenceInMonths(now, start) % 12;
  const days = differenceInDays(now, start) % 30;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);
  return { years, months, days, text: parts.join(' ') };
}

export function calculateCareAge(adoptionDate: string): { years: number; months: number; days: number; text: string } {
  return calculateAge(adoptionDate);
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.max(0, differenceInDays(now, date));
}

export function isToday(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  } catch {
    return false;
  }
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(content: string | Blob, filename: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
