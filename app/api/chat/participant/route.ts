import { NextRequest, NextResponse } from 'next/server';
import { validateContentType, validateBodySize, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function PATCH(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const sizeCheck = validateBodySize(req);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { chatId, ...updates } = await req.json();
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });

  const { error } = await auth.supabase.from('chat_participants')
    .update(updates).eq('chat_id', chatId).eq('user_id', auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const sizeCheck = validateBodySize(req);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 10, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { chatId } = await req.json();
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });

  const { error } = await auth.supabase.from('chat_participants')
    .delete().eq('chat_id', chatId).eq('user_id', auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
