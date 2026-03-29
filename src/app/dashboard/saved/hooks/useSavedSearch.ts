"use client";

import { useState, useEffect, useMemo } from "react";
import type { SavedItem, SavedContentType } from "@/types/domain";

type Filters = {
  type: SavedContentType | "all";
  pinned: boolean;
  favorite: boolean;
  tags: string[];
};

export function useSavedSearch(items: SavedItem[]) {
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    pinned: false,
    favorite: false,
    tags: []
  });

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filters.pinned && !item.is_pinned) return false;
      if (filters.favorite && !item.is_favorite) return false;
      if (filters.type !== "all" && item.content_type !== filters.type) return false;
      if (filters.tags.length > 0 && !filters.tags.every((t) => item.tags.includes(t)))
        return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          item.content?.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q) ||
          item.source_url?.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [items, search, filters]);

  return { filtered, rawSearch, setRawSearch, filters, setFilters, ftsLoading: false };
}
