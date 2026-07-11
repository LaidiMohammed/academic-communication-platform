import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 60, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data: admin } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { studentId, moduleId } = await req.json();

  if (!studentId || !moduleId) {
    return NextResponse.json({ error: 'Missing studentId or moduleId' }, { status: 400 });
  }

  try {
    const { data: student, error: studentErr } = await auth.supabase
      .from('students')
      .select('id, name, status, remaining_sessions')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot record session. Student status: ${student.status}` },
        { status: 400 }
      );
    }

    const remainingPerModule = student.remaining_sessions || {};
    const currentRemaining = remainingPerModule[moduleId] || 0;

    if (currentRemaining <= 0) {
      return NextResponse.json({ error: 'No remaining sessions for this module' }, { status: 400 });
    }

    const newRemaining = currentRemaining - 1;
    const updatedRemaining = { ...remainingPerModule, [moduleId]: newRemaining };
    const newStatus = newRemaining === 0 ? 'inactive' : 'active';

    const { error: updateErr } = await auth.supabase
      .from('students')
      .update({ remaining_sessions: updatedRemaining, status: newStatus })
      .eq('id', studentId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    const { error: logErr } = await auth.supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        module_id: moduleId,
        admin_id: auth.user.id,
        scanned_at: new Date().toISOString(),
        previous_balance: currentRemaining,
        new_balance: newRemaining,
      });

    if (logErr) {
      // Non-fatal: attendance log failure shouldn't block the scan
    }

    return NextResponse.json({
      success: true,
      message: `Session recorded. Remaining: ${newRemaining}`,
      remainingSessionsAfter: newRemaining,
      statusAfter: newStatus,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('student_id');
  if (!studentId) return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  try {
    const { data: student, error } = await auth.supabase
      .from('students')
      .select('id, name, status, remaining_sessions, date_of_birth')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const dob = student.date_of_birth ? new Date(student.date_of_birth) : null;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    return NextResponse.json({
      id: student.id,
      name: student.name,
      age,
      status: student.status,
      remainingSessions: student.remaining_sessions || {},
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
