'use client';

import { createClient } from '@/lib/supabase';

export interface AdminOverviewData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalChats: number;
    totalLessons: number;
    messages24h: number;
    activeMemberships: number;
  };
  financial: {
    monthRevenue: number;
    monthSalaries: number;
    monthExpenses: number;
    netProfit: number;
    unpaidTotal: number;
    totalRevenue: number;
  };
  series: Array<{
    key: string;
    label: string;
    revenue: number;
    expenses: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    level: string;
    createdAt: string | null;
  }>;
  payments: Array<{
    id: string;
    userName: string;
    amount: number;
    status: string;
    planTitle: string;
    createdAt: string | null;
    paidAt: string | null;
  }>;
  expenses: Array<{
    id: string;
    source: string;
    amount: number;
    type: string;
    category: string;
    date: string;
  }>;
  salaries: Array<{
    id: string;
    teacherName: string;
    subject: string;
    monthlySalary: number;
    paid: boolean;
    paidDate: string | null;
  }>;
  warnings: string[];
  generatedAt: string;
}

export async function fetchAdminOverview(year: number, month: number): Promise<AdminOverviewData> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Session expirée. Reconnectez-vous pour voir les données.');
  }

  const res = await fetch(`/api/admin/overview?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = 'Impossible de charger les données du tableau de bord.';
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.json();
}
