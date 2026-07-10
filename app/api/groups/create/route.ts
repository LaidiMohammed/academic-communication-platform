import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 5, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, image, type, memberIds } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Group name required' }, { status: 400 });
  }

  const allIds = [user.id, ...(memberIds || []).filter((id: string) => id !== user.id)];

  const { data: group, error: groupErr } = await supabase.from('groups').insert({
    name: name.trim(),
    description: description || '',
    image: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    members_count: allIds.length,
    tags: type === 'private' ? ['private'] : [],
    created_by: user.id,
  }).select('*').single();

  if (groupErr || !group) {
    return NextResponse.json({ error: groupErr?.message || 'Failed to create group' }, { status: 500 });
  }

  const members = [{ group_id: group.id, user_id: user.id, role: 'owner' }];
  (memberIds || []).forEach((mid: string) => {
    if (mid !== user.id) members.push({ group_id: group.id, user_id: mid, role: 'member' });
  });
  const { error: memberErr } = await supabase.from('group_members').insert(members);
  if (memberErr) {
    await supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  const { data: chat, error: chatErr } = await supabase.from('chats').insert({
    type: 'group',
    name: name.trim(),
    created_by: user.id,
  }).select('*').single();

  if (chatErr || !chat) {
    await supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: chatErr?.message || 'Failed to create chat' }, { status: 500 });
  }

  await supabase.from('groups').update({ chat_id: chat.id }).eq('id', group.id);

  const participants = allIds.map((uid: string) => ({
    chat_id: chat.id, user_id: uid, last_read_at: new Date().toISOString(),
  }));
  const { error: partErr } = await supabase.from('chat_participants').insert(participants);
  if (partErr) {
    await supabase.from('chats').delete().eq('id', chat.id);
    await supabase.from('groups').delete().eq('id', group.id);
    return NextResponse.json({ error: partErr.message }, { status: 500 });
  }

  return NextResponse.json({ group, chat });
}
