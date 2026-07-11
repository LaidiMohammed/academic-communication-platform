import { NextRequest, NextResponse } from 'next/server';
import { validateContentType, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { chatId, messageIds } = await req.json();

  if (messageIds?.length) {
    await auth.supabase.from('message_reads').insert(
      messageIds.map((mid: number) => ({ message_id: mid, user_id: auth.user.id }))
    );
  }
  if (chatId) {
    await auth.supabase.from('chat_participants').update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId).eq('user_id', auth.user.id);
  }

  return NextResponse.json({ ok: true });
}
