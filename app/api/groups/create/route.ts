import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 5, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { name, description, image, type, memberIds } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Group name required' }, { status: 400 });
  }

  const allIds = [auth.user.id, ...(memberIds || []).filter((id: string) => id !== auth.user.id)];

  const { data: group, error: groupErr } = await auth.supabase.from('groups').insert({
    name: name.trim(),
    description: description || '',
    image: image || '',
    members_count: allIds.length,
    tags: type === 'private' ? ['private'] : [],
    created_by: auth.user.id,
  }).select('*').single();

  if (groupErr || !group) {
    return NextResponse.json({ error: groupErr?.message || 'Failed to create group' }, { status: 500 });
  }

  const members = [{ group_id: group.id, user_id: auth.user.id, role: 'owner' }];
  (memberIds || []).forEach((mid: string) => {
    if (mid !== auth.user.id) members.push({ group_id: group.id, user_id: mid, role: 'member' });
  });
  const { error: memberErr } = await auth.supabase.from('group_members').insert(members);
  if (memberErr) {
    await auth.supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  const { data: chat, error: chatErr } = await auth.supabase.from('chats').insert({
    type: 'group',
    name: name.trim(),
    created_by: auth.user.id,
  }).select('*').single();

  if (chatErr || !chat) {
    await auth.supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: chatErr?.message || 'Failed to create chat' }, { status: 500 });
  }

  await auth.supabase.from('groups').update({ chat_id: chat.id }).eq('id', group.id);

  const participants = allIds.map((uid: string) => ({
    chat_id: chat.id, user_id: uid, last_read_at: new Date().toISOString(),
  }));
  const { error: partErr } = await auth.supabase.from('chat_participants').insert(participants);
  if (partErr) {
    await auth.supabase.from('chats').delete().eq('id', chat.id);
    await auth.supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: partErr.message }, { status: 500 });
  }

  return NextResponse.json({ group, chat });
}
