"use client";

import { useState, useCallback } from "react";
import type { SavedItem, CreateSavedItemInput, UpdateSavedItemInput } from "@/types/domain";

const LS_KEY = "saved_items_draft";

export function useSavedItems(initial: SavedItem[], userId: string) {
  const [items, setItems] = useState<SavedItem[]>(initial);

  const addItem = useCallback(
    async (rawInput: CreateSavedItemInput) => {
      const { _meta, ...input } = rawInput as CreateSavedItemInput & {
        _meta?: Record<string, string>;
      };

      const optimistic: SavedItem = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        ...input,
        is_pinned: false,
        is_favorite: false,
        metadata: _meta ?? {},
        deleted_at: null,
        reminder_at: null,
        reply_parent: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setItems((prev) => [optimistic, ...prev]);

      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, metadata: _meta ?? {} })
        });
        if (!res.ok) throw new Error(await res.text());
        const data: SavedItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === optimistic.id ? data : i)));
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== optimistic.id));
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(input));
        } catch {}
      }
    },
    [userId]
  );

  const updateItem = useCallback(
    async (id: string, patch: UpdateSavedItemInput) => {
      const previous = items.find((i) => i.id === id);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

      try {
        const res = await fetch(`/api/saved/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });
        if (!res.ok) throw new Error(await res.text());
      } catch {
        if (previous) setItems((prev) => prev.map((i) => (i.id === id ? previous : i)));
      }
    },
    [items]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const previous = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((i) => i.id !== id));

      try {
        const res = await fetch(`/api/saved/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
      } catch {
        if (previous) setItems((prev) => [previous, ...prev]);
      }
    },
    [items]
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      const snapshots = items.filter((i) => ids.includes(i.id));
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));

      try {
        await Promise.all(ids.map((id) => fetch(`/api/saved/${id}`, { method: "DELETE" })));
      } catch {
        setItems((prev) => [...snapshots, ...prev]);
      }
    },
    [items]
  );

  const bulkTag = useCallback(
    async (ids: string[], tags: string[]) => {
      if (ids.length === 0) return;
      const snapshots = items.filter((i) => ids.includes(i.id));
      setItems((prev) =>
        prev.map((i) =>
          ids.includes(i.id) ? { ...i, tags: Array.from(new Set([...i.tags, ...tags])) } : i
        )
      );

      try {
        await Promise.all(
          ids.map((id) => {
            const item = snapshots.find((s) => s.id === id);
            const merged = Array.from(new Set([...(item?.tags ?? []), ...tags]));
            return fetch(`/api/saved/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tags: merged })
            });
          })
        );
      } catch {
        setItems((prev) =>
          prev.map((i) => {
            const snap = snapshots.find((s) => s.id === i.id);
            return snap ?? i;
          })
        );
      }
    },
    [items]
  );

  return { items, addItem, updateItem, deleteItem, bulkDelete, bulkTag };
}
