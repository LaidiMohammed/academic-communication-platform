import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 10, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: 'File and path required' }, { status: 400 });
    }

    const contentType = file.type.split(';')[0] || 'application/octet-stream';
    const opts = { upsert: true, contentType };

    const { data, error } = await auth.supabase.storage.from('chat-files').upload(path, file, opts);

    if (error?.message?.includes('bucket') || error?.message?.includes('not found')) {
      await auth.supabase.storage.createBucket('chat-files', { public: false });
      const { data: d2, error: e2 } = await auth.supabase.storage.from('chat-files').upload(path, file, opts);
      if (e2 || !d2) {
        return NextResponse.json({ error: e2?.message || 'Upload failed' }, { status: 500 });
      }
      const { data: url } = auth.supabase.storage.from('chat-files').getPublicUrl(d2.path);
      return NextResponse.json({ url: url.publicUrl });
    }

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
    }

    const { data: url } = auth.supabase.storage.from('chat-files').getPublicUrl(data.path);
    return NextResponse.json({ url: url.publicUrl });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
