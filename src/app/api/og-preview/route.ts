import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Cache parsed OG data at the edge for 1 hour
export const revalidate = 3600;

// Regex-based OG parser — avoids importing a DOM parser in the edge bundle
function extractMeta(html: string, property: string): string | null {
  // <meta property="og:title" content="..." />
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  return (re.exec(html)?.[1] ?? alt.exec(html)?.[1] ?? null);
}

function extractTitle(html: string): string | null {
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return m?.[1]?.trim() ?? null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Only allow http/https
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PersonalHubBot/1.0)',
        Accept: 'text/html',
      },
      // Only read the first 100 KB — enough for <head>
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
    }

    // Stream only the first 100 KB to avoid downloading full pages
    const reader = res.body?.getReader();
    let html = '';
    let bytes = 0;
    const limit = 100_000;
    if (reader) {
      const decoder = new TextDecoder();
      while (bytes < limit) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        bytes += value.byteLength;
      }
      reader.cancel();
    }

    const title =
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      extractTitle(html) ??
      null;

    const description =
      extractMeta(html, 'og:description') ??
      extractMeta(html, 'twitter:description') ??
      extractMeta(html, 'description') ??
      null;

    const image =
      extractMeta(html, 'og:image') ??
      extractMeta(html, 'twitter:image') ??
      null;

    const siteName = extractMeta(html, 'og:site_name') ?? parsed.hostname;

    return NextResponse.json(
      { title, description, image, siteName },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 502 });
  }
}
