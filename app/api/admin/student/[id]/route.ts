import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
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
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 60, 60000);
  
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is admin
  const { data: admin } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id: studentId } = await params;

    // Fetch student data
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, name, age, status, remaining_sessions, specialty, level')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return NextResponse.json(
        { error: 'Student not found' } as StudentResponse,
        { status: 404 }
      );
    }

    // Calculate age from birth date if available
    let age = student.age || 0;
    if (student.age && typeof student.age === 'string') {
      const birthDate = new Date(student.age);
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Determine paid modules (those with remaining sessions > 0 or balance tracked)
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
  } catch (error) {
    console.error('[v0] Student lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as StudentResponse,
      { status: 500 }
    );
  }
}
