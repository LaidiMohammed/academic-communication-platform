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

  const { title, date, time, duration, description, link } = await req.json();
  if (!title?.trim() || !date || !time) {
    return NextResponse.json({ error: 'Title, date, and time required' }, { status: 400 });
  }

  const { data: meeting, error: meetErr } = await supabase.from('meetings').insert({
    title: title.trim(),
    description: description || '',
    date,
    time,
    duration: duration || '60',
    link: link || '',
    meet_by: user.id,
  }).select('*').single();

  if (meetErr || !meeting) {
    return NextResponse.json({ error: meetErr?.message || 'Failed to create meeting' }, { status: 500 });
  }

  await supabase.from('meeting_participants').insert({
    meeting_id: meeting.id,
    user_id: user.id,
  });

  return NextResponse.json({ meeting });
}