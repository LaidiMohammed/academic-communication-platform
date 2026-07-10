import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, 20, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authHeader.slice(7);
  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, user_id, amount, status, checkout_id, currency, level, subjects, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((payments || []).map((p: any) => p.user_id))];
  const { data: payers } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);
  const nameMap = new Map((payers || []).map((u: any) => [u.id, u]));

  const mapped = (payments || []).map((p: any) => {
    const payer = nameMap.get(p.user_id) || {};
    return {
      id: p.id,
      userId: p.user_id || '',
      userName: payer.name || p.user_id?.slice(0, 8) || '',
      userEmail: payer.email || '',
      plan: `Level: ${p.level || 'N/A'} — ${(p.subjects || []).join(', ')}`,
      amount: p.amount || 0,
      date: p.created_at?.slice(0, 10) || '',
    };
  });
  return NextResponse.json({ payments: mapped });
}