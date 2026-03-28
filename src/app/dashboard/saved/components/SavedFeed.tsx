'use client';

import { useEffect, useRef } from 'react';
import SavedBubble from './SavedBubble';
import type { SavedItem } from '@/types/domain';

type Props = {
  items: SavedItem[];
  allItems: SavedItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (item: SavedItem) => void;
  onUpdateMeta: (id: string, meta: Record<string, string>) => void;
};

function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Сьогодні';
  if (isYesterday) return 'Вчора';

  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SavedFeed({
  items,
  allItems,
  selectedIds,
  onToggleSelect,
  onPin,
  onUnpin,
  onFavorite,
  onUnfavorite,
  onDelete,
  onReply,
  onUpdateMeta,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(items.length);

  useEffect(() => {
    if (items.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 select-none">
        <span className="text-4xl mb-3">📌</span>
        <p className="text-sm">Ще нічого не збережено</p>
        <p className="text-xs mt-1">Введи текст або посилання нижче</p>
      </div>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const rendered: React.ReactNode[] = [];
  let lastDateStr = '';

  for (const item of sorted) {
    const dateStr = new Date(item.created_at).toDateString();
    if (dateStr !== lastDateStr) {
      lastDateStr = dateStr;
      rendered.push(
        <div key={`sep-${dateStr}`} className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-600 font-medium px-2 py-0.5 bg-gray-900 rounded-full border border-gray-800">
            {formatDateSeparator(item.created_at)}
          </span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
      );
    }

    const replyParent = item.reply_to
      ? allItems.find(i => i.id === item.reply_to) ?? null
      : null;

    rendered.push(
      <SavedBubble
        key={item.id}
        item={item}
        replyParent={replyParent}
        isSelected={selectedIds.has(item.id)}
        onToggleSelect={() => onToggleSelect(item.id)}
        onPin={() => onPin(item.id)}
        onUnpin={() => onUnpin(item.id)}
        onFavorite={() => onFavorite(item.id)}
        onUnfavorite={() => onUnfavorite(item.id)}
        onDelete={() => onDelete(item.id)}
        onReply={() => onReply(item)}
        onUpdateMeta={(meta) => onUpdateMeta(item.id, meta)}
      />
    );
  }

  return (
    <div className="flex flex-col px-2 pb-4">
      {rendered}
      <div ref={bottomRef} />
    </div>
  );
}
