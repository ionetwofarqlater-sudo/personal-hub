'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SavedItem, SavedContentType } from '@/types/domain';

type Filters = {
  type: SavedContentType | 'all';
  pinned: boolean;
  favorite: boolean;
  tags: string[];
};

export function useSavedSearch(items: SavedItem[]) {
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    pinned: false,
    favorite: false,
    tags: [],
  });

  // Results from Supabase FTS — null means "use client-side filter"
  const [ftsResults, setFtsResults] = useState<SavedItem[] | null>(null);
  const [ftsLoading, setFtsLoading] = useState(false);

  const supabase = createClient();
  const abortRef = useRef<AbortController | null>(null);

  // Debounce raw search → committed search
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  // Supabase FTS when query is long enough
  useEffect(() => {
    if (!search || search.length < 2) {
      setFtsResults(null);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setFtsLoading(true);

    // Build tsquery: each whitespace-delimited word becomes a prefix:word term
    const tsQuery = search
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => `${w}:*`)
      .join(' & ');

    (async () => {
      try {
        const { data } = await supabase!
          .from('saved_items')
          .select('*')
          .textSearch('search_vector', tsQuery, { type: 'plain', config: 'simple' })
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(200);
        setFtsResults((data as SavedItem[]) ?? []);
      } catch {
        // FTS not available (migration not yet applied) — fall back to client-side
        setFtsResults(null);
      } finally {
        setFtsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Apply client-side filters on top of whichever result set we have
  const pool = ftsResults ?? items;

  const filtered = useMemo(() => {
    return pool.filter(item => {
      if (filters.pinned && !item.is_pinned) return false;
      if (filters.favorite && !item.is_favorite) return false;
      if (filters.type !== 'all' && item.content_type !== filters.type) return false;
      if (filters.tags.length > 0 && !filters.tags.every(t => item.tags.includes(t))) return false;

      // Client-side text fallback (when FTS not available or query < 2 chars)
      if (!ftsResults && search) {
        const q = search.toLowerCase();
        return (
          item.content?.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q) ||
          item.source_url?.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [pool, search, filters, ftsResults]);

  return { filtered, rawSearch, setRawSearch, filters, setFilters, ftsLoading };
}
