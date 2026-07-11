import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.slice(7);
  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed } = await rateLimit(user.id, 10, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const reqIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  const body = await req.json();
  const { groupId, userIds, action } = body;

  if (!groupId) {
    return NextResponse.json({ error: 'groupId required' }, { status: 400 });
  }

  if (action === 'join') {
    const { data: group } = await supabase.from('groups')
      .select('tags, chat_id').eq('id', groupId).single();

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    const isPrivate = group.tags?.includes('private');
    if (isPrivate) return NextResponse.json({ error: 'Group is private' }, { status: 403 });

    const { data: existing } = await supabase.from('group_members')
      .select('user_id').eq('group_id', groupId).eq('user_id', user.id).maybeSingle();
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

    const { error: joinErr } = await supabase.from('group_members').insert({
      group_id: groupId, user_id: user.id, role: 'member',
    });
    if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 });

    const { count } = await supabase.from('group_members')
      .select('*', { count: 'exact', head: true }).eq('group_id', groupId);
    await supabase.from('groups').update({ members_count: count || 0 }).eq('id', groupId);

    if (group.chat_id) {
      const { data: alreadyInChat } = await supabase.from('chat_participants')
        .select('chat_id').eq('chat_id', group.chat_id).eq('user_id', user.id).maybeSingle();
      if (!alreadyInChat) {
        await supabase.from('chat_participants').insert({
          chat_id: group.chat_id, user_id: user.id, last_read_at: new Date().toISOString(),
        });
      }
    }

    await logAudit(supabase, user.id, 'group.join', { group_id: groupId }, reqIp);

    return NextResponse.json({ success: true });
  }

  // Owner adding other members
  if (!userIds?.length) {
    return NextResponse.json({ error: 'userIds required for member addition' }, { status: 400 });
  }

  const { data: membership } = await supabase.from('group_members')
    .select('role').eq('group_id', groupId).eq('user_id', user.id).single();

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Only group owner or admin can add members' }, { status: 403 });
  }

  const newMembers = userIds.map((uid: string) => ({ group_id: groupId, user_id: uid, role: 'member' }));
  const { error: insertErr } = await supabase.from('group_members').insert(newMembers);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const { count } = await supabase.from('group_members')
    .select('*', { count: 'exact', head: true }).eq('group_id', groupId);
  await supabase.from('groups').update({ members_count: count || 0 }).eq('id', groupId);

  const { data: group } = await supabase.from('groups')
    .select('chat_id').eq('id', groupId).single();

  if (group?.chat_id) {
    const chatParts = userIds.map((uid: string) => ({
      chat_id: group.chat_id, user_id: uid, last_read_at: new Date().toISOString(),
    }));
    await supabase.from('chat_participants').insert(chatParts);
  }

  await logAudit(supabase, user.id, 'group.join', { group_id: groupId, added_user_ids: userIds }, reqIp);

  return NextResponse.json({ success: true });
}
