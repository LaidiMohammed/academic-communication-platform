/**
 * lib/dashboard.ts
 * Couche d'accès aux données du dashboard via Supabase.
 * Requêtes optimisées via vues / fonctions RPC + gestion des états loading/error.
 */

import { createClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/* ══════════════════════════════════════════════════
   Types métiers (strict TypeScript)
═══════════════════════════════════════════════════ */

export interface DashboardOverview {
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_chats: number;
  messages_24h: number;
  total_revenue: number;
  active_memberships: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  created_at: string;
  actor_name: string | null;
  actor_avatar: string | null;
  chat_name: string | null;
}

export interface SubjectPerformance {
  subject: string;
  average_grade: number;
  evaluations: number;
}

export interface DailyActivity {
  day: string;
  messages: number;
  active_users: number;
}

/* ── Finances ── */

export interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  status: 'active' | 'inactive' | 'suspended';
  monthSessions: number;
  totalSessions: number;
  lastScan: string | null;
  enrolledDate: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paid_at: string | null;
  plan_title: string | null;
  level: string | null;
  subjects: string | null;
}

export interface Salary {
  id: string;
  teacher_name: string;
  subject: string;
  monthlySalary: number;
  paid: boolean;
  paidDate: string | null;
}

export interface Expense {
  id: string;
  source: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalSalaries: number;
  totalExpenses: number;
  netProfit: number;
}

/* ══════════════════════════════════════════════════
   Client helper (lazy — ne plante pas au build si env manquante)
═══════════════════════════════════════════════════ */

function client(): SupabaseClient {
  return createClient();
}

/* ══════════════════════════════════════════════════
   API — Statistiques globales
═══════════════════════════════════════════════════ */

export async function getDashboardOverview(): Promise<DashboardOverview | null> {
  const supabase = client();
  const { data, error } = await supabase.rpc('dashboard_get_overview');
  if (error) {
    console.error('[dashboard] getDashboardOverview error:', error);
    return null;
  }
  return (data?.[0] ?? null) as DashboardOverview;
}

export async function getDashboardActivity(limit = 10): Promise<ActivityItem[]> {
  const supabase = client();
  const { data, error } = await supabase.rpc('dashboard_get_activity', { limit_n: limit });
  if (error) {
    console.error('[dashboard] getDashboardActivity error:', error);
    return [];
  }
  return (data ?? []) as ActivityItem[];
}

export async function getSubjectPerformance(): Promise<SubjectPerformance[]> {
  const supabase = client();
  const { data, error } = await supabase.rpc('dashboard_get_subject_performance');
  if (error) {
    console.error('[dashboard] getSubjectPerformance error:', error);
    return [];
  }
  return (data ?? []) as SubjectPerformance[];
}

export async function getDailyActivity(): Promise<DailyActivity[]> {
  const supabase = client();
  const { data, error } = await supabase.rpc('dashboard_get_daily_activity');
  if (error) {
    console.error('[dashboard] getDailyActivity error:', error);
    return [];
  }
  return (data ?? []) as DailyActivity[];
}

/* ══════════════════════════════════════════════════
   API — Finances (étudiants, paiements, salaires, dépenses)
═══════════════════════════════════════════════════ */

export async function getStudents(): Promise<Student[]> {
  const supabase = client();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, level, role, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[dashboard] getStudents error:', error);
    return [];
  }

  return (data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name || s.email?.split('@')[0] || 'Inconnu',
    email: s.email || '',
    level: s.level || '—',
    status: 'active' as const,
    monthSessions: 4,
    totalSessions: 0,
    lastScan: null,
    enrolledDate: s.created_at ? s.created_at.slice(0, 10) : null,
  }));
}

export async function getPayments(): Promise<Payment[]> {
  const supabase = client();
  const { data, error } = await supabase
    .from('payments')
    .select('*, profiles(name)')
    .order('paid_at', { ascending: false });

  if (error) {
    console.error('[dashboard] getPayments error:', error);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    user_name: p.profiles?.name || 'Inconnu',
    amount: p.amount ?? 0,
    status: p.status || 'pending',
    paid_at: p.paid_at ?? null,
    plan_title: p.plan_title ?? null,
    level: p.level ?? null,
    subjects: p.subjects ?? null,
  }));
}

export async function getSalaries(): Promise<Salary[]> {
  const supabase = client();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, subject, monthly_salary, salary_paid, salary_paid_at')
    .eq('role', 'teacher');

  if (error) {
    console.error('[dashboard] getSalaries error:', error);
    return [];
  }

  return (data ?? []).map((t: any) => ({
    id: t.id,
    teacher_name: t.name || 'Inconnu',
    subject: t.subject || '—',
    monthlySalary: t.monthly_salary ?? 0,
    paid: t.salary_paid ?? false,
    paidDate: t.salary_paid_at ?? null,
  }));
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = client();
  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('[dashboard] getExpenses error:', error);
    return [];
  }

  return (data ?? []).map((e: any) => ({
    id: e.id,
    source: e.source || 'Sans libellé',
    amount: e.amount ?? 0,
    type: e.type || 'expense',
    category: e.category || 'Autre',
    date: e.date ?? new Date().toISOString().slice(0, 10),
  }));
}

export async function getFinancialSummary(): Promise<FinancialSummary | null> {
  const [payments, salaries, expenses] = await Promise.allSettled([
    getPayments(),
    getSalaries(),
    getExpenses(),
  ]);

  const totalRevenue = payments.status === 'fulfilled'
    ? payments.value.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
    : 0;

  const totalSalaries = salaries.status === 'fulfilled'
    ? salaries.value.reduce((s, t) => s + t.monthlySalary, 0)
    : 0;

  const totalExpenses = expenses.status === 'fulfilled'
    ? expenses.value.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    : 0;

  return {
    totalRevenue,
    totalSalaries,
    totalExpenses,
    netProfit: totalRevenue - totalSalaries - totalExpenses,
  };
}

/* ══════════════════════════════════════════════════
   API — Tout le dashboard en parallèle
═══════════════════════════════════════════════════ */

export async function getDashboardData() {
  const [overview, activity, subjects, daily, financial] = await Promise.allSettled([
    getDashboardOverview(),
    getDashboardActivity(10),
    getSubjectPerformance(),
    getDailyActivity(),
    getFinancialSummary(),
  ]);

  return {
    overview: overview.status === 'fulfilled' ? overview.value : null,
    activity: activity.status === 'fulfilled' ? activity.value : [],
    subjects: subjects.status === 'fulfilled' ? subjects.value : [],
    daily: daily.status === 'fulfilled' ? daily.value : [],
    financial: financial.status === 'fulfilled' ? financial.value : null,
    loaded:
      overview.status === 'fulfilled' &&
      activity.status === 'fulfilled' &&
      subjects.status === 'fulfilled' &&
      daily.status === 'fulfilled' &&
      financial.status === 'fulfilled',
  };
}

/* ══════════════════════════════════════════════════
   API — CRUD Étudiants
═══════════════════════════════════════════════════ */

export async function createStudent(data: {
  name: string;
  email: string;
  level: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('profiles').insert({
    name: data.name,
    email: data.email,
    level: data.level,
    role: 'student',
  });
  if (error) {
    console.error('[dashboard] createStudent error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      email: data.email,
      level: data.level,
    })
    .eq('id', id)
    .eq('role', 'student');
  if (error) {
    console.error('[dashboard] updateStudent error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('profiles').delete().eq('id', id).eq('role', 'student');
  if (error) {
    console.error('[dashboard] deleteStudent error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/* ══════════════════════════════════════════════════
   API — CRUD Paiements
═══════════════════════════════════════════════════ */

export async function createPayment(data: {
  user_id: string;
  amount: number;
  status?: Payment['status'];
  plan_title?: string;
  level?: string;
  subjects?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('payments').insert({
    user_id: data.user_id,
    amount: data.amount,
    status: data.status ?? 'pending',
    plan_title: data.plan_title ?? null,
    level: data.level ?? null,
    subjects: data.subjects ?? null,
  });
  if (error) {
    console.error('[dashboard] createPayment error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase
    .from('payments')
    .update({
      amount: data.amount,
      status: data.status,
      plan_title: data.plan_title,
      level: data.level,
      subjects: data.subjects,
    })
    .eq('id', id);
  if (error) {
    console.error('[dashboard] updatePayment error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deletePayment(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) {
    console.error('[dashboard] deletePayment error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/* ══════════════════════════════════════════════════
   API — CRUD Salaires
═══════════════════════════════════════════════════ */

export async function createSalary(data: {
  teacher_id: string;
  subject: string;
  monthlySalary: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('salaries').insert({
    teacher_id: data.teacher_id,
    subject: data.subject,
    monthly_salary: data.monthlySalary,
    salary_paid: false,
  });
  if (error) {
    console.error('[dashboard] createSalary error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateSalary(id: string, data: Partial<Salary>): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase
    .from('salaries')
    .update({
      subject: data.subject,
      monthly_salary: data.monthlySalary,
      salary_paid: data.paid,
      salary_paid_at: data.paid ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) {
    console.error('[dashboard] updateSalary error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteSalary(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('salaries').delete().eq('id', id);
  if (error) {
    console.error('[dashboard] deleteSalary error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/* ══════════════════════════════════════════════════
   API — CRUD Dépenses
═══════════════════════════════════════════════════ */

export async function createExpense(data: {
  source: string;
  amount: number;
  category: string;
  date: string;
  type?: 'income' | 'expense';
}): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('expenses').insert({
    source: data.source,
    amount: data.amount,
    type: data.type ?? 'expense',
    category: data.category,
    date: data.date,
  });
  if (error) {
    console.error('[dashboard] createExpense error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase
    .from('expenses')
    .update({
      source: data.source,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
    })
    .eq('id', id);
  if (error) {
    console.error('[dashboard] updateExpense error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteExpense(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = client();
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) {
    console.error('[dashboard] deleteExpense error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
