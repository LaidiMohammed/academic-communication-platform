import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: dbGroups } = await auth.supabase.from('groups').select('*').order('created_at', { ascending: false });
  const { data: myMemberships } = await auth.supabase.from('group_members').select('group_id, role').eq('user_id', auth.user.id);
  const memberMap = new Map((myMemberships || []).map((m: any) => [m.group_id, m.role]));

  const groups = await Promise.all((dbGroups || []).map(async (g: any) => {
    let unread = 0;
    const chatId = g.chat_id || '';
    if (chatId && memberMap.has(g.id)) {
      const { data: part } = await auth.supabase.from('chat_participants')
        .select('last_read_at').eq('chat_id', chatId).eq('user_id', auth.user.id).maybeSingle();
      if (part) {
        const { count } = await auth.supabase.from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chatId)
          .gt('created_at', part.last_read_at || '1970-01-01')
          .neq('sender_id', auth.user.id);
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

  const res = NextResponse.json({ groups });
  res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
  return res;
}
