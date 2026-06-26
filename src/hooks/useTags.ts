import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import type { Tag, TagFilter } from '@/types/tags';

export function useTags() {
  const [tags, setTags] = useLocalStorage<Tag[]>(STORAGE_KEYS.tags, []);

  const createTag = useCallback((label: string, color: string): Tag => {
    const slug = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const tag: Tag = {
      slug,
      label,
      color,
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => {
      if (prev.find((t) => t.slug === slug)) return prev;
      return [...prev, tag];
    });
    return tag;
  }, [setTags]);

  const deleteTag = useCallback((slug: string) => {
    setTags((prev) => prev.filter((t) => t.slug !== slug));
  }, [setTags]);

  const getTagStats = useCallback((allPhotoTags: string[], allEntryTags: string[]): TagFilter[] => {
    return tags.map((tag) => ({
      slug: tag.slug,
      photoCount: allPhotoTags.filter((t) => t === tag.slug).length,
      entryCount: allEntryTags.filter((t) => t === tag.slug).length,
    }));
  }, [tags]);

  return { tags, createTag, deleteTag, getTagStats };
}
