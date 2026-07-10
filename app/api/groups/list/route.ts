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

  const { data: dbGroups } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
  const { data: myMemberships } = await supabase.from('group_members').select('group_id, role').eq('user_id', user.id);
  const memberMap = new Map((myMemberships || []).map((m: any) => [m.group_id, m.role]));

  const groups = await Promise.all((dbGroups || []).map(async (g: any) => {
    let unread = 0;
    const chatId = g.chat_id || '';
    if (chatId && memberMap.has(g.id)) {
      const { data: part } = await supabase.from('chat_participants')
        .select('last_read_at').eq('chat_id', chatId).eq('user_id', user.id).maybeSingle();
      if (part) {
        const { count } = await supabase.from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chatId)
          .gt('created_at', part.last_read_at || '1970-01-01')
          .neq('sender_id', user.id);
        unread = count || 0;
      }
    }
    const diff = Date.now() - new Date(g.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    let activity = '';
    if (mins < 1) activity = 'just now';
    else if (mins < 60) activity = `${mins}m ago`;
    else { const hours = Math.floor(mins / 60); activity = hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`; }

    return {
      id: g.id,
      name: g.name,
      bio: g.description || '',
      image: g.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&background=random`,
      members: g.members_count || 0,
      type: (g.tags?.includes('private') ? 'private' : 'public') as 'public' | 'private',
      isMember: memberMap.has(g.id),
      isAdmin: memberMap.get(g.id) === 'admin' || memberMap.get(g.id) === 'owner',
      createdAt: g.created_at?.slice(0, 10) || '',
      activity,
      unread,
      chatId,
    };
  }));

  return NextResponse.json({ groups });
}
