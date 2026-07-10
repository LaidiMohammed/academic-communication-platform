import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 10, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.slice(7);
  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId, userIds } = await req.json();
  if (!groupId || !userIds?.length) {
    return NextResponse.json({ error: 'groupId and userIds required' }, { status: 400 });
  }

  const { data: membership } = await supabase.from('group_members')
    .select('role').eq('group_id', groupId).eq('user_id', user.id).single();

  if (!membership || membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only group owner can add members' }, { status: 403 });
  }

  const newMembers = userIds.map((uid: string) => ({ group_id: groupId, user_id: uid, role: 'member' }));
  const { error: insertErr } = await supabase.from('group_members').insert(newMembers);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  await supabase.from('groups').update({ members_count: (await supabase.from('group_members')
    .select('*', { count: 'exact', head: true }).eq('group_id', groupId)).count || 0 }).eq('id', groupId);

  const { data: chat } = await supabase.from('chats')
    .select('id').eq('created_by', user.id).eq('type', 'group').maybeSingle();
  if (chat) {
    const chatParts = userIds.map((uid: string) => ({ chat_id: chat.id, user_id: uid, last_read_at: new Date().toISOString() }));
    await supabase.from('chat_participants').insert(chatParts);
  }

  return NextResponse.json({ success: true });
}
