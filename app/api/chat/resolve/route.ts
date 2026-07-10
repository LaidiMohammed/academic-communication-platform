import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
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

  const param = req.nextUrl.searchParams.get('id');
  if (!param) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Check if param is a chat ID
  const { data: chat } = await supabase.from('chats').select('id').eq('id', param).maybeSingle();
  if (chat) return NextResponse.json({ chatId: chat.id });

  // Check if param is a group ID with existing chat
  const { data: grp } = await supabase.from('groups').select('chat_id, name, created_by').eq('id', param).single();
  if (!grp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (grp.chat_id) return NextResponse.json({ chatId: grp.chat_id });

  // Create new chat for this group
  const { data: newChat, error: chatErr } = await supabase.from('chats').insert({
    type: 'group', name: grp.name || 'Group', created_by: grp.created_by || user.id,
  }).select('id').single();

  if (chatErr || !newChat)
    return NextResponse.json({ error: chatErr?.message || 'Failed to create chat' }, { status: 500 });

  await supabase.from('groups').update({ chat_id: newChat.id }).eq('id', param);

  const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', param);
  if (members?.length) {
    await supabase.from('chat_participants').insert(
      members.map((m: any) => ({ chat_id: newChat.id, user_id: m.user_id, last_read_at: new Date().toISOString() }))
    );
  }

  return NextResponse.json({ chatId: newChat.id });
}
