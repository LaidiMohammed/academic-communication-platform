import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: 'File and path required' }, { status: 400 });
    }

    const contentType = file.type.split(';')[0] || 'application/octet-stream';
    const opts = { upsert: true, contentType };

    const { data, error } = await supabase.storage.from('chat-files').upload(path, file, opts);

    if (error?.message?.includes('bucket') || error?.message?.includes('not found')) {
      await supabase.storage.createBucket('chat-files', { public: true });
      const { data: d2, error: e2 } = await supabase.storage.from('chat-files').upload(path, file, opts);
      if (e2 || !d2) {
        return NextResponse.json({ error: e2?.message || 'Upload failed' }, { status: 500 });
      }
      const { data: url } = supabase.storage.from('chat-files').getPublicUrl(d2.path);
      return NextResponse.json({ url: url.publicUrl });
    }

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
    }

    const { data: url } = supabase.storage.from('chat-files').getPublicUrl(data.path);
    return NextResponse.json({ url: url.publicUrl });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}