import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { chatId, type, extra, data } = await req.json();
  if (!chatId || !type) {
    return NextResponse.json({ error: 'chatId and type required' }, { status: 400 });
  }

  const { error } = await auth.supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: auth.user.id,
    text: `__call__${type}${extra || ''}`,
    type: 'text',
    file_url: data || '',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
