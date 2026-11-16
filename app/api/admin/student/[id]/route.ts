import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
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

/* PATCH — admin change le statut et/ou les séances d'un étudiant.
   Écrit dans Supabase (table students) : la modification survit au rechargement. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ct = validateContentType(req);
  if (ct) return ct;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { data: admin } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id: studentId } = await params;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  const allowedStatuses = ['active', 'inactive', 'suspended', 'pending_payment'];
  const status = body.status;
  if (status !== undefined && (typeof status !== 'string' || !allowedStatuses.includes(status))) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const hasSessions = body.sessions !== undefined && body.sessions !== null;
  const sessions = Number(body.sessions);
  if (hasSessions && !Number.isFinite(sessions)) {
    return NextResponse.json({ error: 'Invalid sessions' }, { status: 400 });
  }
  const moduleId = typeof body.moduleId === 'string' && body.moduleId ? body.moduleId : '';
  const defaultModules = ['Math', 'Physics', 'English', 'Chemistry', 'Arabic'];

  // La ligne students est créée par le trigger, mais on reste tolérant.
  const { data: existing } = await auth.supabase
    .from('students')
    .select('id, status, remaining_sessions, name, email')
    .eq('id', studentId)
    .maybeSingle();

  let base = existing;
  if (!base) {
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', studentId)
      .maybeSingle();
    if (!profile) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const { data: created, error: createErr } = await auth.supabase
      .from('students')
      .insert({ id: studentId, name: profile.name || '', email: profile.email || '' })
      .select('id, status, remaining_sessions, name, email')
      .single();
    if (createErr || !created) {
      return NextResponse.json({ error: createErr?.message || 'Student not found' }, { status: 500 });
    }
    base = created;
  }

  const remaining: Record<string, number> = { ...(base.remaining_sessions || {}) };
  if (hasSessions) {
    const target = Math.max(0, Math.floor(sessions));
    const modules = moduleId
      ? [moduleId]
      : (Object.keys(remaining).length ? Object.keys(remaining) : defaultModules);
    for (const key of modules) remaining[key] = target;
  }

  const nextStatus = typeof status === 'string' && status
    ? status
    : hasSessions
      ? (sessions > 0 ? 'active' : 'inactive')
      : (base.status || 'active');

  const { data: updated, error } = await auth.supabase
    .from('students')
    .update({ status: nextStatus, remaining_sessions: remaining })
    .eq('id', studentId)
    .select('id, status, remaining_sessions, name, email')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const monthSessions = Object.values(remaining).length
    ? Math.max(...Object.values(remaining).map((value) => Number(value || 0)))
    : 0;
  return NextResponse.json({
    success: true,
    status: nextStatus,
    remaining_sessions: remaining,
    monthSessions,
    student: updated,
  });
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
