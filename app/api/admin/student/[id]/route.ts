import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

interface StudentResponse {
  id: string;
  name: string;
  age: number;
  status: 'active' | 'inactive' | 'pending_payment';
  remainingSessions: Record<string, number>;
  specialty?: string;
  level?: string;
  paidModules?: string[];
  error?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  try {
    const { id: studentId } = await params;

    const { data: student, error: studentErr } = await auth.supabase
      .from('students')
      .select('id, name, age, status, remaining_sessions, specialty, level')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' } as StudentResponse, { status: 404 });
    }

    let age = student.age || 0;
    if (student.age && typeof student.age === 'string') {
      const birthDate = new Date(student.age);
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    const remainingSessions = student.remaining_sessions || {};
    const paidModules = Object.entries(remainingSessions)
      .filter(([_, sessions]) => (sessions as number) > 0 || sessions !== undefined)
      .map(([module]) => module);

    const response: StudentResponse = {
      id: student.id,
      name: student.name || 'Unknown',
      age: age,
      status: (student.status as 'active' | 'inactive' | 'pending_payment') || 'inactive',
      remainingSessions: remainingSessions,
      specialty: student.specialty || undefined,
      level: student.level || undefined,
      paidModules: paidModules,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Internal server error' } as StudentResponse, { status: 500 });
  }
}
