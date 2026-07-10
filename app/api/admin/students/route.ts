import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, 20, 60000);
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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: students, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const studentIds = (students || []).map((s: any) => s.id);
  const { data: memberships } = await supabase
    .from('memberships')
    .select('user_id, plan, expires_at, started_at')
    .in('user_id', studentIds);

  const memMap = new Map((memberships || []).map((m: any) => [m.user_id, m]));

  const mapped = (students || []).map((s: any) => {
    const membership = memMap.get(s.id);
    const isActive = membership?.plan && membership.plan !== 'free' && (!membership.expires_at || new Date(membership.expires_at) > new Date());
    return {
      id: s.id, email: s.email, name: s.name, level: s.level,
      role: s.role, avatar: s.avatar, created_at: s.created_at,
      school: s.school,
      active: !!isActive,
      membership_plan: membership?.plan || 'free',
      membership_expires: membership?.expires_at || null,
    };
  });
  return NextResponse.json({ students: mapped });
}