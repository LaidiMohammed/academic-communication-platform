import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const param = req.nextUrl.searchParams.get('id');
  if (!param) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data: chat } = await auth.supabase.from('chats').select('id').eq('id', param).maybeSingle();
  if (chat) return NextResponse.json({ chatId: chat.id });

  const { data: grp } = await auth.supabase.from('groups').select('chat_id, name, created_by').eq('id', param).single();
  if (!grp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (grp.chat_id) return NextResponse.json({ chatId: grp.chat_id });

  const { data: newChat, error: chatErr } = await auth.supabase.from('chats').insert({
    type: 'group', name: grp.name || 'Group', created_by: grp.created_by || auth.user.id,
  }).select('id').single();

  if (chatErr || !newChat)
    return NextResponse.json({ error: chatErr?.message || 'Failed to create chat' }, { status: 500 });

  await auth.supabase.from('groups').update({ chat_id: newChat.id }).eq('id', param);

  const { data: members } = await auth.supabase.from('group_members').select('user_id').eq('group_id', param);
  if (members?.length) {
    await auth.supabase.from('chat_participants').insert(
      members.map((m: any) => ({ chat_id: newChat.id, user_id: m.user_id, last_read_at: new Date().toISOString() }))
    );
  }

  return NextResponse.json({ chatId: newChat.id });
}
