import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(decodeURIComponent(url));
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 502 });
    }

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
