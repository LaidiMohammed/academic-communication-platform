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

  const { title, date, time, duration, description, link } = await req.json();
  if (!title?.trim() || !date || !time) {
    return NextResponse.json({ error: 'Title, date, and time required' }, { status: 400 });
  }

  const { data: meeting, error: meetErr } = await auth.supabase.from('meetings').insert({
    title: title.trim(),
    description: description || '',
    date,
    time,
    duration: duration || '60',
    link: link || '',
    meet_by: auth.user.id,
  }).select('*').single();

  if (meetErr || !meeting) {
    return NextResponse.json({ error: meetErr?.message || 'Failed to create meeting' }, { status: 500 });
  }

  await auth.supabase.from('meeting_participants').insert({
    meeting_id: meeting.id,
    user_id: auth.user.id,
  });

  return NextResponse.json({ meeting });
}
