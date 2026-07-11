import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: meetings, error } = await auth.supabase
    .from('meetings')
    .select('*, meeting_participants!inner(user_id)')
    .eq('meeting_participants.user_id', auth.user.id)
    .order('date', { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const res = NextResponse.json({ meetings });
  res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
  return res;
}
