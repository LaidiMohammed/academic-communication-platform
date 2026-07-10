import { NextRequest, NextResponse } from 'next/server';
import { canAccessChat } from '@/lib/chat-access';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

const MESSAGE_TYPES = new Set(['text', 'image', 'file', 'voice', 'poll']);

function parseVoiceDuration(text: string) {
  const match = text.match(/(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

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

  const chatId = req.nextUrl.searchParams.get('chatId');
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });
  if (!(await canAccessChat(supabase, user.id, chatId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: msgs } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(name, avatar)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (!msgs) return NextResponse.json({ messages: [], participants: [] });

  const { data: reactions } = await supabase
    .from('message_reactions')
    .select('message_id, emoji')
    .in('message_id', msgs.map(m => m.id));

  const reactionMap: Record<string, string[]> = {};
  if (reactions) reactions.forEach((r: any) => {
    if (!reactionMap[r.message_id]) reactionMap[r.message_id] = [];
    if (!reactionMap[r.message_id].includes(r.emoji)) reactionMap[r.message_id].push(r.emoji);
  });

  const { data: reads } = await supabase
    .from('message_reads')
    .select('message_id')
    .in('message_id', msgs.map(m => m.id));

  const readCounts: Record<string, number> = {};
  if (reads) reads.forEach((r: any) => { readCounts[r.message_id] = (readCounts[r.message_id] || 0) + 1; });

  const messages = msgs.map((m: any) => ({
    id: m.id,
    sender: m.sender?.name || 'Unknown',
    text: m.text,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isOwn: m.sender_id === user.id,
    avatar: m.sender?.avatar || '',
    reactions: reactionMap[m.id] || [],
    readBy: readCounts[m.id] || 0,
    type: m.type,
    image: m.type === 'image' ? m.file_url || undefined : undefined,
    file: m.type === 'file'
      ? { name: m.file_name || 'File', size: m.file_size || '', url: m.file_url || undefined }
      : undefined,
    voice: m.type === 'voice' ? m.file_url || undefined : undefined,
    duration: m.type === 'voice' ? parseVoiceDuration(m.text || '') : undefined,
  }));

  const { data: participants } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('chat_id', chatId);

  let members: { name: string; avatar: string; role: string; online: boolean }[] = [];
  if (participants?.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar')
      .in('id', participants.map(p => p.user_id));

    const otherIds = participants.filter(p => p.user_id !== user.id).map(p => p.user_id);
    const { data: groupRanks } = await supabase
      .from('group_members')
      .select('user_id, role')
      .in('user_id', otherIds);

    const roleMap = new Map((groupRanks || []).map((r: any) => [r.user_id, r.role]));
    members = (profiles || []).map((p: any) => ({
      name: p.name || 'Unknown',
      avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
      role: roleMap.get(p.id) || 'member',
      online: false,
    }));
  }

  return NextResponse.json({ messages, participants: members, userId: user.id });
}

export async function POST(req: NextRequest) {
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

  const body: unknown = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const chatId = typeof values.chatId === 'string' ? values.chatId : '';
  const text = typeof values.text === 'string' ? values.text : '';
  const messageType = typeof values.type === 'string' ? values.type : 'text';
  const fileUrl = typeof values.fileUrl === 'string' ? values.fileUrl : '';
  const fileName = typeof values.fileName === 'string' ? values.fileName : '';
  const fileSize = typeof values.fileSize === 'string' ? values.fileSize : '';
  if (!MESSAGE_TYPES.has(messageType)) {
    return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
  }

  const mediaType = messageType === 'image' || messageType === 'file' || messageType === 'voice';
  if (!chatId || (!text.trim() && !mediaType)) {
    return NextResponse.json({ error: 'chatId and message content required' }, { status: 400 });
  }
  if (mediaType && !fileUrl) {
    return NextResponse.json({ error: 'Uploaded file URL required' }, { status: 400 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
  const storagePrefix = `${supabaseUrl}/storage/v1/object/public/chat-files/`;
  if (mediaType && !fileUrl.startsWith(storagePrefix)) {
    return NextResponse.json({ error: 'Invalid uploaded file URL' }, { status: 400 });
  }
  if (!(await canAccessChat(supabase, user.id, chatId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: msg, error } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: user.id,
    text,
    type: messageType,
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
  }).select('id').single();

  if (error || !msg) return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 });

  return NextResponse.json({ message: { id: msg.id } });
}
