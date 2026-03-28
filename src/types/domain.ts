export type SavedContentType = 'text' | 'link' | 'file' | 'image' | 'voice';

export type SavedItem = {
  id: string;
  user_id: string;
  content_type: SavedContentType;
  title: string | null;
  content: string | null;
  source_url: string | null;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  reply_to: string | null;
  reminder_at: string | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // joined для UI — не колонка в БД
  reply_parent?: Pick<SavedItem, 'id' | 'content_type' | 'content' | 'title'> | null;
};

export type CreateSavedItemInput = {
  content_type: SavedContentType;
  content: string | null;
  title: string | null;
  source_url: string | null;
  tags: string[];
  reply_to: string | null;
};

export type UpdateSavedItemInput = Partial<
  Pick<SavedItem, 'title' | 'content' | 'tags' | 'is_pinned' | 'is_favorite' | 'reminder_at' | 'metadata'>
>;

/** @deprecated — використовуй SavedItem */
export type NoteItem = { id: string; title: string; content: string; updatedAt: string };
/** @deprecated — використовуй SavedItem */
export type DropItem = { id: string; title: string; content: string; tags: string[]; pinned: boolean; updatedAt: string };
