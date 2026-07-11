import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

async function getAdminSupabase(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return null;
  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') return null;
  return auth.supabase;
}

export async function GET(req: NextRequest) {
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: meetings, error } = await supabase.from('meetings').select('*, meeting_participants(count)').order('date', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meetings });
}

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthUser(req);
  if (!auth.error) {
    const { allowed } = await rateLimit(auth.user.id, 10, 60000, supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { title, date, time, duration, description, link } = await req.json();
  if (!title?.trim() || !date) return NextResponse.json({ error: 'Title and date required' }, { status: 400 });

  const { data, error } = await supabase.from('meetings').insert({
    title: title.trim(), description: description || '', date, time: time || '00:00',
    duration: duration || '60', link: link || '',
  }).select('*').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meeting: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthUser(req);
  if (!auth.error) {
    const { allowed } = await rateLimit(auth.user.id, 10, 60000, supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
