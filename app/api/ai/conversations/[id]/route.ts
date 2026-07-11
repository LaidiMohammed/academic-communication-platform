import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

async function checkOwnership(supabase: any, id: string, userId: string) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('user_id')
    .eq('id', id)
    .single();
  if (error || !data || data.user_id !== userId) return false;
  return true;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { id } = await params;
    if (!(await checkOwnership(auth.supabase, id, auth.user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: conv, error: convErr } = await auth.supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .eq('id', id)
      .single();

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 404 });
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const { data: messages, error: msgErr } = await auth.supabase
      .from('ai_messages')
      .select('id, role, text, images, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
    return NextResponse.json({ data: { ...conv, messages } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctCheck = validateContentType(req);
    if (ctCheck) return ctCheck;

    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { id } = await params;
    if (!(await checkOwnership(auth.supabase, id, auth.user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data, error } = await auth.supabase
      .from('ai_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title, created_at, updated_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { id } = await params;
    if (!(await checkOwnership(auth.supabase, id, auth.user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await auth.supabase.from('ai_conversations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { deleted: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
