import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

type SupabaseError = { code?: string; message?: string } | null;

function isMissingTable(error: SupabaseError): boolean {
  if (!error) return false;
  if (error.code === 'PGRST205' || error.code === '42P01') return true;
  return /could not find the table|does not exist/i.test(error.message ?? '');
}

async function tableExists(supabase: SupabaseClient, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return !error;
}

async function countRows(
  supabase: SupabaseClient,
  table: string,
  apply?: (query: any) => any,
): Promise<number | null> {
  let query: any = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const { count, error } = await query;
  if (error) return null;
  return count ?? 0;
}

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function sixMonthsStart(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 5, 1));
  return {
    startIso: d.toISOString(),
    startDate: d.toISOString().slice(0, 10),
  };
}

function inRange(value: string | null | undefined, startIso: string, endIso: string): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return t >= new Date(startIso).getTime() && t < new Date(endIso).getTime();
}

/** Normalise les noms de profils récupérés via une seconde requête. */
function buildNameMap(rows: Array<{ id: string; name?: string | null; email?: string | null }> | null): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows ?? []) {
    map.set(row.id, row.name || row.email || 'Utilisateur');
  }
  return map;
}

/* ═══════════════════════════════════════════════════════════
   GET /api/admin/overview?year=2026&month=11
═══════════════════════════════════════════════════════════ */

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 40, 60000, auth.supabase);
  if (!allowed) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans un instant.' }, { status: 429 });
  }

  const supabase = auth.supabase;

  // Vérification du rôle admin (le client service_role contourne la RLS).
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: `Impossible de vérifier le rôle administrateur : ${profileError.message}` },
      { status: 500 },
    );
  }
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  const now = new Date();
  const parsedYear = Number.parseInt(req.nextUrl.searchParams.get('year') ?? '', 10);
  const parsedMonth = Number.parseInt(req.nextUrl.searchParams.get('month') ?? '', 10);
  const year = Number.isFinite(parsedYear) && parsedYear > 2000 && parsedYear < 2100 ? parsedYear : now.getUTCFullYear();
  const month = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : now.getUTCMonth() + 1;

  const bounds = monthBounds(year, month);
  const sixStart = sixMonthsStart(year, month);
  const warnings: string[] = [];

  /* ── Disponibilité des tables financières ── */
  const [hasPayments, hasExpenses, hasSalaries] = await Promise.all([
    tableExists(supabase, 'payments'),
    tableExists(supabase, 'expenses'),
    tableExists(supabase, 'salaries'),
  ]);

  if (!hasPayments) warnings.push('Table « payments » absente : les revenus sont affichés à zéro.');
  if (!hasExpenses) warnings.push('Table « expenses » absente : les dépenses sont affichées à zéro.');
  if (!hasSalaries) warnings.push('Table « salaries » absente : les salaires sont affichés à zéro.');

  /* ── Compteurs généraux ── */
  const nowIso = now.toISOString();
  const [totalStudents, totalTeachers, totalAdmins, totalChats, totalLessons, messages24h, activeMemberships] =
    await Promise.all([
      countRows(supabase, 'profiles', (q) => q.eq('role', 'student')),
      countRows(supabase, 'profiles', (q) => q.eq('role', 'teacher')),
      countRows(supabase, 'profiles', (q) => q.eq('role', 'admin')),
      countRows(supabase, 'chats'),
      countRows(supabase, 'lessons'),
      countRows(supabase, 'messages', (q) => q.gte('created_at', new Date(now.getTime() - 24 * 3600 * 1000).toISOString())),
      countRows(supabase, 'memberships', (q) => q.gt('expires_at', nowIso)),
    ]);

  if (totalStudents === null || totalTeachers === null || totalAdmins === null) {
    warnings.push('Certains compteurs de profils n’ont pas pu être chargés.');
  }

  /* ── Étudiants récents ── */
  const { data: studentRows, error: studentError } = await supabase
    .from('profiles')
    .select('id, name, email, level, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .limit(8);

  if (studentError) warnings.push(`Étudiants récents indisponibles : ${studentError.message}`);

  const students = (studentRows ?? []).map((s: any) => ({
    id: s.id,
    name: s.name || s.email || 'Étudiant',
    email: s.email || '',
    level: s.level || '—',
    createdAt: s.created_at ?? null,
  }));

  /* ── Paiements ── */
  let paymentRows: any[] = [];
  let allPaymentRows: any[] = [];

  if (hasPayments) {
    const [recent, all] = await Promise.all([
      supabase
        .from('payments')
        .select('id, user_id, amount, status, plan_title, created_at, paid_at')
        .gte('created_at', sixStart.startIso)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('payments').select('amount, status, created_at, paid_at').eq('status', 'completed').limit(5000),
    ]);

    if (recent.error) warnings.push(`Paiements récents indisponibles : ${recent.error.message}`);
    else paymentRows = recent.data ?? [];

    if (all.error) warnings.push(`Total des revenus indisponible : ${all.error.message}`);
    else allPaymentRows = all.data ?? [];
  }

  /* ── Dépenses ── */
  let expenseRows: any[] = [];

  if (hasExpenses) {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, source, amount, type, category, date')
      .gte('date', sixStart.startDate)
      .order('date', { ascending: false })
      .limit(500);

    if (error) warnings.push(`Dépenses indisponibles : ${error.message}`);
    else expenseRows = data ?? [];
  }

  /* ── Salaires ── */
  let salaryRows: any[] = [];

  if (hasSalaries) {
    const { data, error } = await supabase
      .from('salaries')
      .select('id, teacher_id, subject, monthly_salary, salary_paid, salary_paid_at, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) warnings.push(`Salaires indisponibles : ${error.message}`);
    else salaryRows = data ?? [];
  }

  /* ── Noms des enseignants / payeurs ── */
  const userIds = Array.from(
    new Set([
      ...salaryRows.map((s) => s.teacher_id).filter(Boolean),
      ...paymentRows.map((p) => p.user_id).filter(Boolean),
    ]),
  );

  let nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: names } = await supabase.from('profiles').select('id, name, email').in('id', userIds);
    nameMap = buildNameMap(names);
  }

  /* ── Calculs financiers ── */
  const completedPayments = allPaymentRows.filter((p) => p.status === 'completed');
  const totalPaymentRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const paymentRevenueInMonth = completedPayments
    .filter((p) => inRange(p.paid_at || p.created_at, bounds.startIso, bounds.endIso))
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const expensesInMonth = expenseRows
    .filter((e) => e.type === 'expense' && inRange(e.date, bounds.startDate, bounds.endDate))
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const incomeInMonth = expenseRows
    .filter((e) => e.type === 'income' && inRange(e.date, bounds.startDate, bounds.endDate))
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const totalExpenseIncome = expenseRows
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const monthRevenue = paymentRevenueInMonth + incomeInMonth;
  const totalRevenue = totalPaymentRevenue + totalExpenseIncome;

  const monthSalaries = salaryRows.reduce((sum, s) => sum + Number(s.monthly_salary ?? 0), 0);
  const unpaidTotal = salaryRows
    .filter((s) => !s.salary_paid)
    .reduce((sum, s) => sum + Number(s.monthly_salary ?? 0), 0);

  /* ── Série sur 6 mois ── */
  const series = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 6 + i + 1, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const b = monthBounds(y, m);

    const revenue =
      completedPayments
        .filter((p) => inRange(p.paid_at || p.created_at, b.startIso, b.endIso))
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0) +
      expenseRows
        .filter((e) => e.type === 'income' && inRange(e.date, b.startDate, b.endDate))
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

    const paidSalaries = salaryRows
      .filter((s) => s.salary_paid && inRange(s.salary_paid_at, b.startIso, b.endIso))
      .reduce((sum, s) => sum + Number(s.monthly_salary ?? 0), 0);

    const spent =
      expenseRows
        .filter((e) => e.type === 'expense' && inRange(e.date, b.startDate, b.endDate))
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0) + paidSalaries;

    return {
      key: `${y}-${String(m).padStart(2, '0')}`,
      label: MONTHS_SHORT[m - 1],
      revenue,
      expenses: spent,
    };
  });

  /* ── Listes récentes ── */
  const payments = paymentRows.slice(0, 8).map((p: any) => ({
    id: p.id,
    userName: nameMap.get(p.user_id) ?? 'Utilisateur',
    amount: Number(p.amount ?? 0),
    status: p.status ?? 'pending',
    planTitle: p.plan_title ?? '—',
    createdAt: p.created_at ?? null,
    paidAt: p.paid_at ?? null,
  }));

  const expenses = expenseRows.slice(0, 8).map((e: any) => ({
    id: e.id,
    source: e.source ?? '—',
    amount: Number(e.amount ?? 0),
    type: e.type ?? 'expense',
    category: e.category ?? 'Autre',
    date: e.date ?? '',
  }));

  const salaries = salaryRows.slice(0, 8).map((s: any) => ({
    id: s.id,
    teacherName: nameMap.get(s.teacher_id) ?? 'Enseignant',
    subject: s.subject ?? '—',
    monthlySalary: Number(s.monthly_salary ?? 0),
    paid: Boolean(s.salary_paid),
    paidDate: s.salary_paid_at ?? null,
  }));

  return NextResponse.json({
    overview: {
      totalStudents: totalStudents ?? 0,
      totalTeachers: totalTeachers ?? 0,
      totalAdmins: totalAdmins ?? 0,
      totalChats: totalChats ?? 0,
      totalLessons: totalLessons ?? 0,
      messages24h: messages24h ?? 0,
      activeMemberships: activeMemberships ?? 0,
    },
    financial: {
      monthRevenue,
      monthSalaries,
      monthExpenses: expensesInMonth,
      netProfit: monthRevenue - monthSalaries - expensesInMonth,
      unpaidTotal,
      totalRevenue,
    },
    series,
    students,
    payments,
    expenses,
    salaries,
    warnings,
    generatedAt: new Date().toISOString(),
  });
}
