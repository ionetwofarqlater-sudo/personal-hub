export type NoteItem = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type DropItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
};
