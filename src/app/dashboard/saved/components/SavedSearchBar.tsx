'use client';

import { Search, X, Loader2 } from 'lucide-react';

type Props = { value: string; onChange: (v: string) => void; loading?: boolean };

export default function SavedSearchBar({ value, onChange, loading }: Props) {
  return (
    <div className="relative flex-shrink-0 mb-2">
      {loading ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 animate-spin pointer-events-none" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Пошук по тексту, URL, тегах…"
        className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/60 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
