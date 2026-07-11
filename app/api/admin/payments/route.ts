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

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 60, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify user is admin
  const { data: admin } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { studentId, moduleId, amount = 0 } = await req.json();

  if (!studentId || !moduleId) {
    return NextResponse.json({ error: 'Missing studentId or moduleId' }, { status: 400 });
  }

  try {
    // Fetch student
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, name, remaining_sessions, status')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get current remaining sessions
    const remainingPerModule = student.remaining_sessions || {};
    const previousBalance = remainingPerModule[moduleId] || 0;
    const sessionsToAdd = 4;
    const newBalance = previousBalance + sessionsToAdd;

    // Update student with new session count and mark as active
    const updatedRemaining = { ...remainingPerModule, [moduleId]: newBalance };

    const { error: updateErr } = await supabase
      .from('students')
      .update({
        remaining_sessions: updatedRemaining,
        status: 'active',
      })
      .eq('id', studentId);

    if (updateErr) {
      console.error('Update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    // Create immutable payment audit entry
    const { error: auditErr } = await supabase
      .from('payment_audit')
      .insert({
        student_id: studentId,
        module_id: moduleId,
        amount: amount || 0,
        sessions_added: sessionsToAdd,
        payment_date: new Date().toISOString(),
        admin_operator_id: user.id,
        previous_balance: previousBalance,
        new_balance: newBalance,
        status: 'active',
      });

    if (auditErr) {
      console.error('Audit log error:', auditErr);
      // Don't fail the payment if audit log fails
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
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
