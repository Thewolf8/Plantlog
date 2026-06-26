export interface Tag {
  slug: string;
  label: string;
  color: string;
  createdAt: string;
}

export interface TagFilter {
  slug: string;
  photoCount: number;
  entryCount: number;
}
