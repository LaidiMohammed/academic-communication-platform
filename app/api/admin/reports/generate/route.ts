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

  const { data: admin } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { tier, modules = [], month } = await req.json();

  if (!tier || !modules || modules.length === 0) {
    return NextResponse.json({ error: 'Missing tier or modules' }, { status: 400 });
  }

  const reportMonth = month || new Date().toISOString().slice(0, 7);

  try {
    const { data: students, error: studentErr } = await auth.supabase
      .from('students')
      .select('id, name, date_of_birth, status, remaining_sessions, email, phone, academic_level')
      .eq('academic_level', tier);

    if (studentErr) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No students found for the selected tier',
        reportId: `REPORT_${Date.now()}`,
        studentCount: 0,
        downloadUrl: '',
      });
    }

    const studentIds = students.map(s => s.id);
    const { data: payments } = await auth.supabase
      .from('payments')
      .select('user_id, amount, status, created_at')
      .in('user_id', studentIds)
      .order('created_at', { ascending: false });

    const { data: teachers } = await auth.supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'teacher');

    const monthStart = `${reportMonth}-01`;
    const monthEnd = new Date(new Date(monthStart).getTime() + 32 * 86400000).toISOString().slice(0, 10);
    const { data: meetings } = await auth.supabase
      .from('meetings')
      .select('student_id, module, teacher_id, date')
      .gte('date', monthStart)
      .lt('date', monthEnd);

    const attendanceMap: Record<string, Record<string, number>> = {};
    meetings?.forEach(m => {
      if (!attendanceMap[m.student_id]) attendanceMap[m.student_id] = {};
      attendanceMap[m.student_id][m.module] = (attendanceMap[m.student_id][m.module] || 0) + 1;
    });

    const teacherPerModule: Record<string, string> = {};
    meetings?.forEach(m => {
      if (m.teacher_id && m.module && !teacherPerModule[m.module]) {
        const t = teachers?.find(t => t.id === m.teacher_id);
        if (t) teacherPerModule[m.module] = t.name;
      }
    });

    const reportData = students.map(student => {
      const dob = student.date_of_birth ? new Date(student.date_of_birth) : null;
      const age = dob
        ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;
      const studentPayments = payments?.filter(p => p.user_id === student.id) || [];
      const lastPayment = studentPayments[0];
      const totalPaid = studentPayments.reduce((s, p) => s + (p.amount || 0), 0);

      return {
        name: student.name || 'N/A',
        email: student.email || '',
        phone: student.phone || '',
        age: age || 'N/A',
        status: student.status || 'unknown',
        paymentStatus: lastPayment?.status || 'none',
        totalPaid,
        attendanceByModule: modules.map((m: string) => ({
          module: m,
          teacher: teacherPerModule[m] || '—',
          attended: attendanceMap[student.id]?.[m] || 0,
          remaining: (student.remaining_sessions?.[m] || 0) as number,
        })),
      };
    });

    const reportId = `REPORT_${reportMonth}_${Date.now()}`;
    const generatedAt = new Date().toISOString();

    try {
      await auth.supabase.from('reports').insert({
        id: reportId,
        admin_id: auth.user.id,
        tier,
        modules: modules,
        student_count: reportData.length,
        generated_at: generatedAt,
        status: 'completed',
        month: reportMonth,
      });
    } catch {
      // Silently fail if table doesn't exist
    }

    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      reportId,
      studentCount: reportData.length,
      reportData,
      downloadUrl: '',
      generatedAt,
      month: reportMonth,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
