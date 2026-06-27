import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/I18nContext';
import { exportFullBackupJSON, exportPlantsCSV } from '@/services/exportService';
import { importFromJSON, exportAndShare } from '@/services/backupService';
import Header from '@/components/Header';
import { FileJson, FileSpreadsheet, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExportPage() {
  const { settings, updateExportPreferences } = useSettings();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleExportJSON = () => {
    const json = exportFullBackupJSON();
    exportAndShare('json', json, `plantlog_backup_${Date.now()}.json`);
  };

  const handleExportCSV = () => {
    const csv = exportPlantsCSV(settings.dateFormat);
    exportAndShare('csv', csv, `plantlog_export_${Date.now()}.csv`);
  };

  const handleImport = (content: string) => {
    const result = importFromJSON(content);
    setImportResult({
      success: result.success,
      message: result.success
        ? `Imported: ${result.plantsImported} plants, ${result.entriesImported} entries, ${result.photosImported} photos, ${result.tagsImported} tags`
        : result.errors.join(', '),
    });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') handleImport(ev.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') handleImport(ev.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className={'pb-24'}>
      <Header title={t('navExport')} />
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Export options */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t('exportJSON')}</h2>
          <Button onClick={handleExportJSON} className="w-full gap-2" variant="outline">
            <FileJson className="w-4 h-4" /> {t('exportJSON')}
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t('exportCSV')}</h2>
          <Button onClick={handleExportCSV} className="w-full gap-2" variant="outline">
            <FileSpreadsheet className="w-4 h-4" /> {t('exportCSV')}
          </Button>
        </section>

        {/* Import */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t('importJSON')}</h2>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
              dragOver ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('dropFileHere')}</p>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
          </div>
          <p className="text-xs text-muted-foreground">{t('importWarning')}</p>
        </section>

        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-lg p-3 text-sm', importResult.success ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive')}
          >
            {importResult.message}
          </motion.div>
        )}

        {/* Export preferences */}
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">{t('exportJSON')}</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={settings.exportPreferences.includePhotos}
              onCheckedChange={(v) => updateExportPreferences({ includePhotos: v === true })}
            />
            <span className="text-sm">{t('includePhotos')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={settings.exportPreferences.includeNotes}
              onCheckedChange={(v) => updateExportPreferences({ includeNotes: v === true })}
            />
            <span className="text-sm">{t('includeNotes')}</span>
          </label>
        </section>
      </div>
    </div>
  );
}
