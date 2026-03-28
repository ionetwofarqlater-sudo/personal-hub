'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SavedItem, CreateSavedItemInput, UpdateSavedItemInput } from '@/types/domain';

const LS_KEY = 'saved_items_draft';

export function useSavedItems(initial: SavedItem[], userId: string) {
  const [items, setItems] = useState<SavedItem[]>(initial);
  const supabase = createClient();

  const addItem = useCallback(async (rawInput: CreateSavedItemInput) => {
    if (!supabase) return;

    // Strip out the _meta sidecar that SavedComposer attaches for file uploads
    const { _meta, ...input } = rawInput as CreateSavedItemInput & { _meta?: Record<string, string> };
    const extraMeta: Record<string, string> = _meta ?? {};

    // Optimistic
    const optimistic: SavedItem = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      ...input,
      is_pinned: false,
      is_favorite: false,
      metadata: extraMeta,
      deleted_at: null,
      reminder_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItems(prev => [optimistic, ...prev]);

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .insert({ ...input, user_id: userId, metadata: extraMeta })
        .select('*')
        .single();
      if (error) throw error;

      setItems(prev => prev.map(i => (i.id === optimistic.id ? (data as SavedItem) : i)));
    } catch {
      // Rollback
      setItems(prev => prev.filter(i => i.id !== optimistic.id));
      // Зберігаємо чернетку у localStorage
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(input));
      } catch {}
    }
  }, [supabase, userId]);

  const updateItem = useCallback(async (id: string, patch: UpdateSavedItemInput) => {
    if (!supabase) return;

    const previous = items.find(i => i.id === id);
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));

    try {
      const { error } = await supabase
        .from('saved_items')
        .update(patch)
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      if (previous) setItems(prev => prev.map(i => (i.id === id ? previous : i)));
    }
  }, [supabase, items, userId]);

  const deleteItem = useCallback(async (id: string) => {
    if (!supabase) return;

    const previous = items.find(i => i.id === id);
    // Soft delete — optimistic
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      const { error } = await supabase
        .from('saved_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      if (previous) setItems(prev => [previous, ...prev]);
    }
  }, [supabase, items, userId]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    if (!supabase || ids.length === 0) return;

    const snapshots = items.filter(i => ids.includes(i.id));
    setItems(prev => prev.filter(i => !ids.includes(i.id)));

    try {
      const { error } = await supabase
        .from('saved_items')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', ids)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      setItems(prev => [...snapshots, ...prev]);
    }
  }, [supabase, items, userId]);

  const bulkTag = useCallback(async (ids: string[], tags: string[]) => {
    if (!supabase || ids.length === 0) return;

    const snapshots = items.filter(i => ids.includes(i.id));
    // Merge tags onto each item optimistically
    setItems(prev =>
      prev.map(i =>
        ids.includes(i.id)
          ? { ...i, tags: Array.from(new Set([...i.tags, ...tags])) }
          : i
      )
    );

    try {
      // Supabase doesn't support bulk conditional updates in one shot,
      // so we patch each item individually but in parallel
      const updates = ids.map(id => {
        const item = snapshots.find(s => s.id === id);
        const merged = Array.from(new Set([...(item?.tags ?? []), ...tags]));
        return supabase
          .from('saved_items')
          .update({ tags: merged })
          .eq('id', id)
          .eq('user_id', userId);
      });
      const results = await Promise.all(updates);
      const firstError = results.find(r => r.error)?.error;
      if (firstError) throw firstError;
    } catch {
      // Rollback to snapshots
      setItems(prev =>
        prev.map(i => {
          const snap = snapshots.find(s => s.id === i.id);
          return snap ?? i;
        })
      );
    }
  }, [supabase, items, userId]);

  return { items, addItem, updateItem, deleteItem, bulkDelete, bulkTag };
}
