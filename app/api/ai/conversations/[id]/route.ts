import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const db = createServiceClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: conv, error: convErr } = await db
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .eq('id', id)
      .single();

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 404 });
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const { data: messages, error: msgErr } = await db
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
    const { id } = await params;
    const { title } = await req.json();

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data, error } = await db
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
    const { id } = await params;

    const { error } = await db.from('ai_conversations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: { deleted: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
