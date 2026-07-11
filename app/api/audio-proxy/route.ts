import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url parameter required' }, { status: 400 });

  // Restrict proxy to Supabase storage URLs only (SSRF prevention)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const decodedUrl = decodeURIComponent(url);
  if (!decodedUrl.startsWith(supabaseUrl)) {
    return NextResponse.json({ error: 'Invalid audio source' }, { status: 403 });
  }

  try {
    const res = await fetch(decodedUrl);
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 502 });

    const blob = await res.blob();
    const headers = new Headers({
      'Content-Type': res.headers.get('Content-Type') || blob.type || 'audio/webm',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    });

    return new NextResponse(blob, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: 'Audio proxy failed' }, { status: 502 });
  }
}
