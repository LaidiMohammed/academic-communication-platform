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

  const { data: participations } = await supabase
    .from('chat_participants')
    .select('chat_id, last_read_at, chats(*)')
    .eq('user_id', user.id);

  if (!participations) return NextResponse.json({ chats: [] });

  const chats = await Promise.all(participations.map(async (p: any) => {
    const chat = p.chats;
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

  return NextResponse.json({ chats });
}
