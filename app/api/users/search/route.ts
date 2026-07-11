import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let query = (req.nextUrl.searchParams.get('q') || '').trim();
  if (query.length > 50) return NextResponse.json({ error: 'Query too long' }, { status: 400 });

  // Sanitize SQL LIKE wildcards to prevent unexpected matching
  query = query.replace(/[%_]/g, '\\$&');

  const { data: profiles, error } = await auth.supabase
    .from('profiles')
    .select('id, name, avatar, email')
    .neq('id', auth.user.id)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: profiles });
}
