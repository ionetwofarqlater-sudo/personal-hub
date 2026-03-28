'use client';

import { useEffect, useRef, useState } from 'react';

type OGData = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
};

type Props = {
  url: string;
  /** Already-fetched OG data stored in item.metadata — skips the fetch */
  cached: Record<string, string>;
  /** Called once after a fresh fetch so we can persist to metadata */
  onFetched?: (data: OGData) => void;
};

export default function LinkPreview({ url, cached, onFetched }: Props) {
  const hasCached = Boolean(cached?.og_title ?? cached?.og_image ?? cached?.og_description);
  const [data, setData] = useState<OGData | null>(
    hasCached
      ? {
          title: cached.og_title ?? null,
          description: cached.og_description ?? null,
          image: cached.og_image ?? null,
          siteName: cached.og_site_name ?? null,
        }
      : null
  );
  const [loading, setLoading] = useState(!hasCached);
  const fetchedRef = useRef(hasCached);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then((json: OGData & { error?: string }) => {
        if (cancelled || json.error) return;
        setData(json);
        onFetched?.({
          title: json.title,
          description: json.description,
          image: json.image,
          siteName: json.siteName,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 h-14 rounded-xl bg-gray-800/50 border border-gray-800 animate-pulse" />
    );
  }

  if (!data || (!data.title && !data.image && !data.description)) return null;

  return (
    <div className="mt-2 flex gap-3 rounded-xl bg-gray-800/50 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt=""
          className="w-16 h-16 object-cover flex-shrink-0"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="flex flex-col justify-center py-2 pr-3 min-w-0">
        {data.siteName && (
          <p className="text-gray-600 text-xs mb-0.5 truncate">{data.siteName}</p>
        )}
        {data.title && (
          <p className="text-gray-200 text-xs font-medium leading-snug line-clamp-2">{data.title}</p>
        )}
        {data.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{data.description}</p>
        )}
      </div>
    </div>
  );
}
