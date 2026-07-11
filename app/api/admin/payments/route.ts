import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: payments, error } = await auth.supabase
    .from('payments')
    .select('id, user_id, amount, status, checkout_id, currency, level, subjects, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((payments || []).map((p: any) => p.user_id))];
  const { data: payers } = await auth.supabase
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

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 10, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: admin } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { studentId, moduleId, amount = 0 } = await req.json();

  if (!studentId || !moduleId) {
    return NextResponse.json({ error: 'Missing studentId or moduleId' }, { status: 400 });
  }

  try {
    const { data: student, error: studentErr } = await auth.supabase
      .from('students')
      .select('id, name, remaining_sessions, status')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const remainingPerModule = student.remaining_sessions || {};
    const previousBalance = remainingPerModule[moduleId] || 0;
    const sessionsToAdd = 4;
    const newBalance = previousBalance + sessionsToAdd;

    const updatedRemaining = { ...remainingPerModule, [moduleId]: newBalance };

    const { error: updateErr } = await auth.supabase
      .from('students')
      .update({
        remaining_sessions: updatedRemaining,
        status: 'active',
      })
      .eq('id', studentId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    const { error: auditErr } = await auth.supabase
      .from('payment_audit')
      .insert({
        student_id: studentId,
        module_id: moduleId,
        amount: amount || 0,
        sessions_added: sessionsToAdd,
        payment_date: new Date().toISOString(),
        admin_operator_id: auth.user.id,
        previous_balance: previousBalance,
        new_balance: newBalance,
        status: 'active',
      });

    if (auditErr) {
      // Non-fatal: audit log failure shouldn't block payment
    }

    return NextResponse.json({
      success: true,
      message: `Added 4 sessions for ${student.name}. New balance: ${newBalance}`,
      paymentId: `PAY_${Date.now()}`,
      previousBalance,
      newBalance,
      sessionsAdded: sessionsToAdd,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
