import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTags } from '@/hooks/useTags';
import { usePhotos } from '@/hooks/usePhotos';
import { useJournal } from '@/hooks/useJournal';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/I18nContext';
import { TAG_COLOR_OPTIONS } from '@/lib/constants';
import TagBadge from '@/components/TagBadge';
import PhotoGrid from '@/components/PhotoGrid';
import FloatingActionButton from '@/components/FloatingActionButton';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { Tag, Hash } from 'lucide-react';

export default function TagsPage() {
  const { tags, createTag, deleteTag } = useTags();
  const { photos, getPhotosByTag } = usePhotos();
  const { entries } = useJournal();
  const { settings } = useSettings();
  const { t } = useI18n();

  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_OPTIONS[5]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string>('');
  // Key forces Sheet to fully remount after close, so the form resets cleanly
  const [sheetKey, setSheetKey] = useState(0);

  const tagStats = useMemo(() => {
    const allPhotoTags = photos.flatMap((p) => p.tags);
    const allEntryTags = entries.flatMap((e) =>
      e.payload.kind === 'observation' ? e.payload.tags : []
    );
    return tags.map((tag) => ({
      ...tag,
      photoCount: allPhotoTags.filter((t) => t === tag.slug).length,
      entryCount: allEntryTags.filter((t) => t === tag.slug).length,
    }));
  }, [tags, photos, entries]);

  const filteredPhotos = selectedTag ? getPhotosByTag(selectedTag) : [];

  const handleOpenCreate = () => {
    setNewTagLabel('');
    setNewTagColor(TAG_COLOR_OPTIONS[5]);
    setSheetKey((k) => k + 1); // remount Sheet
    setShowCreate(true);
  };

  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    createTag(newTagLabel.trim(), `${newTagColor.bg} ${newTagColor.text} ${newTagColor.border}`);
    setShowCreate(false);
  };

  const handleDeleteTag = (slug: string) => {
    deleteTag(slug);
    setShowDeleteConfirm('');
    if (selectedTag === slug) setSelectedTag('');
  };

  return (
    <div className="pb-24">
      <Header title={t('navTags')} />
      <div className="p-4 space-y-4">

        {/* Page description */}
        <div className="rounded-lg border bg-card/50 p-3 flex gap-2.5">
          <Hash className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">{t('tagsPageDescription')}</p>
        </div>

        {/* Tag list */}
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Tag className="w-10 h-10 opacity-20" />
            <p className="text-sm">{t('empty')}</p>
            <p className="text-xs">{t('tagsEmptyHint')}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tagStats.map((tag) => (
              <div key={tag.slug} className="relative group">
                <TagBadge
                  label={`${tag.label} (${tag.photoCount + tag.entryCount})`}
                  color={tag.color}
                  onClick={() => setSelectedTag(tag.slug === selectedTag ? '' : tag.slug)}
                  className={cn(selectedTag === tag.slug && 'ring-2 ring-primary')}
                />
                <button
                  onClick={() => setShowDeleteConfirm(tag.slug)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] hidden group-hover:flex items-center justify-center leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Photo gallery for selected tag */}
        {selectedTag && (
          <div>
            <h3 className="text-sm font-semibold mb-3">
              {t('photosWithTag')}: <span className="text-primary">{tags.find((t) => t.slug === selectedTag)?.label}</span>
            </h3>
            {filteredPhotos.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">{t('noPhotosWithTag')}</p>
              : <PhotoGrid photos={filteredPhotos} dateFormat={settings.dateFormat} />
            }
          </div>
        )}
      </div>

      <FloatingActionButton onClick={handleOpenCreate} />

      {/* Create tag sheet — keyed so it fully remounts each time */}
      <Sheet key={sheetKey} open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader><SheetTitle>{t('createTag')}</SheetTitle></SheetHeader>
          <div className="pt-4 space-y-4 pb-2">
            <div className="space-y-1.5">
              <Label>{t('tagName')}</Label>
              <Input
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder="e.g. yellow_leaves"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('tagColor')}</Label>
              <div className="flex flex-wrap gap-2.5">
                {TAG_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    // Use inline style so color is always visible (Tailwind JIT can't purge inline styles)
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      newTagColor.name === c.name
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110'
                        : 'opacity-70 hover:opacity-100'
                    )}
                    aria-label={c.name}
                  />
                ))}
              </div>
              {/* Preview */}
              {newTagLabel.trim() && (
                <div className="pt-1">
                  <TagBadge
                    label={newTagLabel.trim()}
                    color={`${newTagColor.bg} ${newTagColor.text} ${newTagColor.border}`}
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleCreateTag}
              disabled={!newTagLabel.trim()}
            >
              {t('createTag')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTag')}</DialogTitle>
            <DialogDescription>{t('tagInUseWarning')}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm('')}>{t('cancel')}</Button>
            <Button variant="destructive" className="flex-1" onClick={() => handleDeleteTag(showDeleteConfirm)}>{t('delete')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
