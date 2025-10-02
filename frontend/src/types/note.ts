export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface NoteFormData {
  title: string;
  content: string;
}

export type SortOption = 'newest' | 'oldest' | 'title';