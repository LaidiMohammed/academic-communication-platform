import { NextRequest, NextResponse } from 'next/server';
import { canAccessChat } from '@/lib/chat-access';
import { validateContentType, validateBodySize, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';
import type { SupabaseClient } from '@supabase/supabase-js';

const MESSAGE_TYPES = new Set(['text', 'image', 'file', 'voice', 'poll']);

function parseVoiceDuration(text: string) {
  const match = text.match(/(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const chatId = req.nextUrl.searchParams.get('chatId');
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });
  if (!(await canAccessChat(auth.supabase, auth.user.id, chatId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Pagination: ?before=<cursor_id>&limit=50
  const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('limit') || '50', 10), 1), 100);
  const beforeId = req.nextUrl.searchParams.get('before');

  let query = auth.supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(name, avatar)', { count: 'estimated' })
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (beforeId) {
    query = query.lt('id', parseInt(beforeId, 10));
  }

  const { data: rawMsgs, count: totalCount } = await query;

  if (!rawMsgs) return NextResponse.json({ messages: [], participants: [], total: 0 });

  // Reverse back to chronological order for the client
  rawMsgs.reverse();


  const msgs = rawMsgs.filter((m: any) => !m.text?.startsWith('__call__'));

  const { data: reactions } = await auth.supabase
    .from('message_reactions')
    .select('message_id, emoji')
    .in('message_id', msgs.map(m => m.id));

  const reactionMap: Record<string, string[]> = {};
  if (reactions) reactions.forEach((r: any) => {
    if (!reactionMap[r.message_id]) reactionMap[r.message_id] = [];
    if (!reactionMap[r.message_id].includes(r.emoji)) reactionMap[r.message_id].push(r.emoji);
  });

  const { data: reads } = await auth.supabase
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
    isOwn: m.sender_id === auth.user.id,
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
    replyTo: m.reply_to ? { id: m.reply_to, text: '', sender: '' } : undefined,
  }));

  const { data: participants } = await auth.supabase
    .from('chat_participants')
    .select('user_id')
    .eq('chat_id', chatId);

  let members: { name: string; avatar: string; role: string; online: boolean }[] = [];
  if (participants?.length) {
    const { data: profiles } = await auth.supabase
      .from('profiles')
      .select('id, name, avatar')
      .in('id', participants.map(p => p.user_id));

    const otherIds = participants.filter(p => p.user_id !== auth.user.id).map(p => p.user_id);
    const { data: groupRanks } = await auth.supabase
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

  const hasMore = totalCount ? totalCount > messages.length : false;
  const oldestId = messages.length > 0 ? messages[0].id : null;

  return NextResponse.json({
    messages,
    participants: members,
    userId: auth.user.id,
    total: totalCount || messages.length,
    hasMore,
    cursor: oldestId,
  });
}

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const sizeCheck = validateBodySize(req);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

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
  const replyTo = values.replyTo ? Number(values.replyTo) : null;
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
  if (!(await canAccessChat(auth.supabase, auth.user.id, chatId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const insertData: Record<string, unknown> = {
    chat_id: chatId,
    sender_id: auth.user.id,
    text,
    type: messageType,
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
  };
  if (replyTo) insertData.reply_to = replyTo;

  const { data: msg, error } = await auth.supabase.from('messages').insert(insertData).select('id').single();

  if (error || !msg) return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 });

  return NextResponse.json({ message: { id: msg.id } });
}
