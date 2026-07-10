import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 30, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, messageIds } = await req.json();

  if (messageIds?.length) {
    await supabase.from('message_reads').insert(
      messageIds.map((mid: number) => ({ message_id: mid, user_id: user.id }))
    );
  }
  if (chatId) {
    await supabase.from('chat_participants').update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId).eq('user_id', user.id);
  }

  return NextResponse.json({ ok: true });
}
