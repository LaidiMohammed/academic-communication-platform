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

  // Fetch existing chat participations
  const { data: participations } = await supabase
    .from('chat_participants')
    .select('chat_id, last_read_at, chats(*)')
    .eq('user_id', user.id);

  const seenChatIds = new Set((participations || []).map((p: any) => p.chat_id));

  // Fetch group memberships for groups where user has no chat_participants entry
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);

  for (const m of (memberships || []) as any[]) {
    const { data: grp } = await supabase.from('groups').select('id, chat_id, name, members_count').eq('id', m.group_id).single();
    if (!grp) continue;
    if (grp.chat_id && !seenChatIds.has(grp.chat_id)) {
      const { error: insErr } = await supabase.from('chat_participants').insert({
        chat_id: grp.chat_id, user_id: user.id, last_read_at: new Date().toISOString(),
      });
      if (!insErr) seenChatIds.add(grp.chat_id);
    } else if (!grp.chat_id) {
      const { data: newChat } = await supabase.from('chats').insert({
        type: 'group', name: grp.name || 'Group', created_by: user.id,
      }).select('id').single();
      if (newChat) {
        await supabase.from('groups').update({ chat_id: newChat.id }).eq('id', m.group_id);
        const { data: allMembers } = await supabase.from('group_members').select('user_id').eq('group_id', m.group_id);
        if (allMembers?.length) {
          await supabase.from('chat_participants').insert(
            allMembers.map((x: any) => ({ chat_id: newChat.id, user_id: x.user_id, last_read_at: new Date().toISOString() }))
          );
        }
        seenChatIds.add(newChat.id);
      }
    }
  }

  // Re-fetch after potential inserts
  const { data: finalParticipations } = await supabase
    .from('chat_participants')
    .select('chat_id, last_read_at, chats(*)')
    .eq('user_id', user.id);

  if (!finalParticipations) return NextResponse.json({ chats: [] });

  const chats = await Promise.all(finalParticipations.map(async (p: any) => {
    const chat = p.chats;
    if (!chat) return null;
    let name = chat.name;
    let avatar = chat.avatar;
    if (chat.type === 'individual') {
      const { data: others } = await supabase
        .from('chat_participants')
        .select('profiles!inner(name, avatar)')
        .eq('chat_id', chat.id)
        .neq('user_id', user.id)
        .limit(1);
      if (others?.[0]) {
        const pr = (others[0] as any).profiles;
        name = pr.name;
        avatar = pr.avatar;
      }
    }
    const { count } = await supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chat.id)
      .gt('created_at', p.last_read_at || '1970-01-01')
      .neq('sender_id', user.id);

    return {
      id: chat.id,
      name,
      avatar,
      lastMessage: chat.last_message || '',
      time: chat.last_message_at || '',
      unread: count || 0,
      online: false,
      typing: false,
      muted: false,
      pinned: false,
      lastSeen: '',
      type: chat.type,
      members: chat.type === 'group' ? chat.members_count : undefined,
    };
  }));

  return NextResponse.json({ chats: chats.filter(Boolean) });
}
