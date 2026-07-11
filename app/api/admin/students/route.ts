import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: students, error } = await auth.supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const studentIds = (students || []).map((s: any) => s.id);
  const { data: memberships } = await auth.supabase
    .from('memberships')
    .select('user_id, plan, expires_at, started_at')
    .in('user_id', studentIds);

  const memMap = new Map((memberships || []).map((m: any) => [m.user_id, m]));

  const mapped = (students || []).map((s: any) => {
    const membership = memMap.get(s.id);
    const isActive = membership?.plan && membership.plan !== 'free' && (!membership.expires_at || new Date(membership.expires_at) > new Date());
    return {
      id: s.id, email: s.email, name: s.name, level: s.level,
      role: s.role, avatar: s.avatar, created_at: s.created_at, school: s.school,
      active: !!isActive,
      membership_plan: membership?.plan || 'free',
      membership_expires: membership?.expires_at || null,
    };
  });
  return NextResponse.json({ students: mapped });
}
