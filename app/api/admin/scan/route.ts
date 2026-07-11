import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

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

  const { studentId, moduleId } = await req.json();

  if (!studentId || !moduleId) {
    return NextResponse.json({ error: 'Missing studentId or moduleId' }, { status: 400 });
  }

  try {
    // Fetch student
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, name, status, remaining_sessions')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if student is active
    if (student.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot record session. Student status: ${student.status}` },
        { status: 400 }
      );
    }

    // Get current remaining sessions for the module
    const remainingPerModule = student.remaining_sessions || {};
    const currentRemaining = remainingPerModule[moduleId] || 0;

    if (currentRemaining <= 0) {
      return NextResponse.json(
        { error: 'No remaining sessions for this module' },
        { status: 400 }
      );
    }

    // Decrement session count
    const newRemaining = currentRemaining - 1;
    const updatedRemaining = { ...remainingPerModule, [moduleId]: newRemaining };

    // Update student status if no sessions left
    const newStatus = newRemaining === 0 ? 'inactive' : 'active';

    const { error: updateErr } = await supabase
      .from('students')
      .update({
        remaining_sessions: updatedRemaining,
        status: newStatus,
      })
      .eq('id', studentId);

    if (updateErr) {
      console.error('Update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    // Create attendance log
    const { error: logErr } = await supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        module_id: moduleId,
        admin_id: user.id,
        scanned_at: new Date().toISOString(),
        previous_balance: currentRemaining,
        new_balance: newRemaining,
      });

    if (logErr) {
      console.error('Attendance log error:', logErr);
      // Don't fail the scan if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Session recorded. Remaining: ${newRemaining}`,
      remainingSessionsAfter: newRemaining,
      statusAfter: newStatus,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('student_id');
  if (!studentId) {
    return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, status, remaining_sessions, date_of_birth')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate age from date of birth
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
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
