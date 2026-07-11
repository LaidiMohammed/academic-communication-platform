import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: participations } = await auth.supabase
    .from('chat_participants')
    .select('chat_id, last_read_at, chats(*)')
    .eq('user_id', auth.user.id);

  const seenChatIds = new Set((participations || []).map((p: any) => p.chat_id));

  const { data: memberships } = await auth.supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', auth.user.id);

  for (const m of (memberships || []) as any[]) {
    const { data: grp } = await auth.supabase.from('groups').select('id, chat_id, name, members_count').eq('id', m.group_id).single();
    if (!grp) continue;
    if (grp.chat_id && !seenChatIds.has(grp.chat_id)) {
      const { error: insErr } = await auth.supabase.from('chat_participants').insert({
        chat_id: grp.chat_id, user_id: auth.user.id, last_read_at: new Date().toISOString(),
      });
      if (!insErr) seenChatIds.add(grp.chat_id);
    } else if (!grp.chat_id) {
      const { data: newChat } = await auth.supabase.from('chats').insert({
        type: 'group', name: grp.name || 'Group', created_by: auth.user.id,
      }).select('id').single();
      if (newChat) {
        await auth.supabase.from('groups').update({ chat_id: newChat.id }).eq('id', m.group_id);
        const { data: allMembers } = await auth.supabase.from('group_members').select('user_id').eq('group_id', m.group_id);
        if (allMembers?.length) {
          await auth.supabase.from('chat_participants').insert(
            allMembers.map((x: any) => ({ chat_id: newChat.id, user_id: x.user_id, last_read_at: new Date().toISOString() }))
          );
        }
        seenChatIds.add(newChat.id);
      }
    }
  }

  const { data: finalParticipations } = await auth.supabase
    .from('chat_participants')
    .select('chat_id, last_read_at, chats(*)')
    .eq('user_id', auth.user.id);

  if (!finalParticipations) return NextResponse.json({ chats: [] });

  const chats = await Promise.all(finalParticipations.map(async (p: any) => {
    const chat = p.chats;
    if (!chat) return null;
    let name = chat.name;
    let avatar = chat.avatar;
    if (chat.type === 'individual') {
      const { data: others } = await auth.supabase
        .from('chat_participants')
        .select('profiles!inner(name, avatar)')
        .eq('chat_id', chat.id)
        .neq('user_id', auth.user.id)
        .limit(1);
      if (others?.[0]) {
        const pr = (others[0] as any).profiles;
        name = pr.name;
        avatar = pr.avatar;
      }
    }
    const { count } = await auth.supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chat.id)
      .gt('created_at', p.last_read_at || '1970-01-01')
      .neq('sender_id', auth.user.id);

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

  const res = NextResponse.json({ chats: chats.filter(Boolean) });
  res.headers.set('Cache-Control', 'public, max-age=5, s-maxage=5, stale-while-revalidate=15');
  return res;
}
