import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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

  const tagStats = useMemo(() => {
    const allPhotoTags = photos.flatMap((p) => p.tags);
    const allEntryTags = entries.flatMap((e) => {
      if (e.payload.kind === 'observation') return e.payload.tags;
      return [];
    });
    return tags.map((tag) => ({
      ...tag,
      photoCount: allPhotoTags.filter((t) => t === tag.slug).length,
      entryCount: allEntryTags.filter((t) => t === tag.slug).length,
    }));
  }, [tags, photos, entries]);

  const filteredPhotos = selectedTag ? getPhotosByTag(selectedTag) : [];

  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    createTag(newTagLabel.trim(), `${newTagColor.bg} ${newTagColor.text} ${newTagColor.border}`);
    setNewTagLabel('');
    setShowCreate(false);
  };

  const handleDeleteTag = (slug: string) => {
    deleteTag(slug);
    setShowDeleteConfirm('');
    if (selectedTag === slug) setSelectedTag('');
  };

  return (
    <div className={'pb-24'}>
      <Header title={t('navTags')} />
      <div className="p-4 space-y-4">
        {/* Tag list */}
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
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] hidden group-hover:flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {tags.length === 0 && <p className="text-sm text-muted-foreground">{t('empty')}</p>}
        </div>

        {/* Photo gallery for selected tag */}
        {selectedTag && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-sm font-semibold mb-3">{t('photosWithTag')}: {tags.find((t) => t.slug === selectedTag)?.label}</h3>
            <PhotoGrid photos={filteredPhotos} dateFormat={settings.dateFormat} />
          </motion.div>
        )}
      </div>

      <FloatingActionButton onClick={() => setShowCreate(true)} />

      <Sheet open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader><SheetTitle>{t('createTag')}</SheetTitle></SheetHeader>
          <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>{t('tagName')}</Label>
              <Input value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)} placeholder="Yellow Leaves" />
            </div>
            <div className="space-y-2">
              <Label>{t('tagColor')}</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setNewTagColor(c)}
                    className={cn('w-8 h-8 rounded-full border-2 transition-all', c.bg.replace('/20', ''), newTagColor.name === c.name && 'border-white ring-2 ring-primary')}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleCreateTag} disabled={!newTagLabel.trim()}>{t('createTag')}</Button>
          </div>
        </SheetContent>
      </Sheet>

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
