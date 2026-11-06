"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Clock, TrendingUp, MessageCircle, Activity, BarChart3,
  GraduationCap, Eye, Edit, Trash2, Wallet, Banknote, Plus, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { KpiCard } from '@/components/dashboard/widgets/KpiCard';
import { StatCard } from '@/components/dashboard/widgets/StatCard';
import { LineChart } from '@/components/dashboard/charts/LineChart';
import { DonutChart } from '@/components/dashboard/charts/DonutChart';
import { DataTable } from '@/components/dashboard/tables/DataTable';
import { MonthSelector } from '@/components/dashboard/widgets/MonthSelector';
import { EmptyState } from '@/components/dashboard/sections/EmptyState';
import { SkeletonCard } from '@/components/dashboard/skeleton/SkeletonCard';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';
import { BottomNav } from '@/components/dashboard/layout/BottomNav';
import {
  getDashboardData,
  getDashboardOverview,
  getDashboardActivity,
  getSubjectPerformance,
  getDailyActivity,
  getStudents,
  getPayments,
  getSalaries,
  getExpenses,
  getFinancialSummary,
  ActivityItem,
  Student,
  Payment,
  Salary,
  Expense,
  FinancialSummary,
} from '@/lib/dashboard';
import { useAuth } from '@/lib/auth-context';

const MOCK = {
  total_students: 3240,
  total_teachers: 180,
  total_admins: 6,
  total_chats: 842,
  messages_24h: 4120,
  total_revenue: 4860000,
  active_memberships: 2140,
};

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 1, type: 'message', created_at: new Date().toISOString(), actor_name: 'Ahmed Benali', actor_avatar: null, chat_name: 'Maths L3' },
  { id: 2, type: 'lesson', created_at: new Date(Date.now() - 3600000).toISOString(), actor_name: 'Mme. Sarah', actor_avatar: null, chat_name: 'Calculus' },
  { id: 3, type: 'meeting', created_at: new Date(Date.now() - 7200000).toISOString(), actor_name: 'Groupe Physique', actor_avatar: null, chat_name: 'TD Physique' },
];

const MOCK_SUBJECTS = [
  { subject: 'Mathématiques', average_grade: 15.8, evaluations: 420 },
  { subject: 'Physique', average_grade: 14.2, evaluations: 380 },
  { subject: 'Anglais', average_grade: 16.5, evaluations: 290 },
  { subject: 'Informatique', average_grade: 17.1, evaluations: 250 },
];

const MOCK_DAILY = [
  { day: 'Lun', messages: 1200, active_users: 340 },
  { day: 'Mar', messages: 1560, active_users: 410 },
  { day: 'Mer', messages: 1320, active_users: 370 },
  { day: 'Jeu', messages: 1780, active_users: 450 },
  { day: 'Ven', messages: 2010, active_users: 520 },
  { day: 'Sam', messages: 980, active_users: 210 },
  { day: 'Dim', messages: 640, active_users: 120 },
];

const now = new Date();
const DEFAULT_MONTH = { year: now.getFullYear(), month: now.getMonth() + 1 };

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [data, setData] = useState<{
    overview: typeof MOCK | null;
    activity: ActivityItem[];
    subjects: typeof MOCK_SUBJECTS;
    daily: typeof MOCK_DAILY;
    financial: FinancialSummary | null;
    students: Student[];
    payments: Payment[];
    salaries: Salary[];
    expenses: Expense[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [overview, activity, subjects, daily, financial, students, payments, salaries, expenses] =
          await Promise.allSettled([
            getDashboardOverview(),
            getDashboardActivity(10),
            getSubjectPerformance(),
            getDailyActivity(),
            getFinancialSummary(),
            getStudents(),
            getPayments(),
            getSalaries(),
            getExpenses(),
          ]);

        if (!mounted) return;

        setData({
          overview: overview.status === 'fulfilled' ? (overview.value as typeof MOCK ?? MOCK) : MOCK,
          activity: activity.status === 'fulfilled' && activity.value.length ? activity.value : MOCK_ACTIVITY,
          subjects: subjects.status === 'fulfilled' && subjects.value.length ? subjects.value : MOCK_SUBJECTS,
          daily: daily.status === 'fulfilled' && daily.value.length ? daily.value : MOCK_DAILY,
          financial: financial.status === 'fulfilled' ? financial.value : null,
          students: students.status === 'fulfilled' ? students.value : [],
          payments: payments.status === 'fulfilled' ? payments.value : [],
          salaries: salaries.status === 'fulfilled' ? salaries.value : [],
          expenses: expenses.status === 'fulfilled' ? expenses.value : [],
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du tableau de bord');
        setData({
          overview: MOCK,
          activity: MOCK_ACTIVITY,
          subjects: MOCK_SUBJECTS,
          daily: MOCK_DAILY,
          financial: null,
          students: [],
          payments: [],
          salaries: [],
          expenses: [],
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [month.year, month.month]);

  const overview = data?.overview ?? MOCK;
  const activity = data?.activity ?? MOCK_ACTIVITY;
  const subjects = data?.subjects ?? MOCK_SUBJECTS;
  const daily = data?.daily ?? MOCK_DAILY;
  const financial = data?.financial;
  const students = data?.students ?? [];
  const payments = data?.payments ?? [];
  const salaries = data?.salaries ?? [];
  const expenses = data?.expenses ?? [];

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <div className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

        {/* Hero + sélecteur de mois */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Bienvenue{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Période sélectionnée :
              <span className="text-gold font-semibold">{month.month} / {month.year}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MonthSelector value={month} onChange={setMonth} />
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
            >
              <Plus size={16} /> Nouvelle action
            </Link>
          </div>
        </motion.section>

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        {/* KPI Strip - Financières */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          <KpiCard
            title="Étudiants actifs"
            value={overview.total_students.toLocaleString()}
            icon={Users}
            color="text-blue-400"
            trend={{ value: 12, label: 'vs mois dernier', positive: true }}
          />
          <KpiCard
            title="Enseignants"
            value={overview.total_teachers}
            icon={GraduationCap}
            color="text-cyan-400"
            trend={{ value: 4, label: 'nouveaux', positive: true }}
          />
          <KpiCard
            title="Revenus du mois"
            value={financial?.totalRevenue ? financial.totalRevenue.toLocaleString() : '0'}
            subtitle="DA"
            icon={Wallet}
            color="text-emerald-400"
            trend={{ value: 8, label: 'croissance', positive: true }}
          />
          <KpiCard
            title="Salaires"
            value={financial?.totalSalaries ? financial.totalSalaries.toLocaleString() : '0'}
            subtitle="DA"
            icon={Banknote}
            color="text-amber-400"
            trend={{ value: 5, label: 'prévisions', positive: false }}
          />
          <KpiCard
            title="Dépenses"
            value={financial?.totalExpenses ? financial.totalExpenses.toLocaleString() : '0'}
            subtitle="DA"
            icon={Activity}
            color="text-rose-400"
            trend={{ value: 3, label: 'réduction', positive: true }}
          />
          {(() => {
            const np = financial?.netProfit ?? 0;
            return (
              <KpiCard
                title="Bénéfice net"
                value={np >= 0 ? np.toLocaleString() : '0'}
                subtitle="DA (Revenus − Salaires − Dépenses)"
                icon={TrendingUp}
                color="text-gold"
                trend={{ value: np >= 0 ? 12 : 5, label: np >= 0 ? 'positif' : 'déficit', positive: np >= 0 }}
              />
            );
          })()}
        </motion.section>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-4">
              <SkeletonCard className="h-[200px]" />
              <div className="grid grid-cols-2 gap-4">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-40" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <SkeletonCard className="h-80" />
              <SkeletonCard className="h-64" />
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Cards row */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl p-5 glass-panel glass-border-gold">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-5 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                    <h3 className="font-bold text-foreground text-sm">Activité 30 jours</h3>
                  </div>
                  <LineChart
                    data={daily.map((d) => ({ name: d.day, value: d.messages }))}
                    color="#d4af37"
                    label="Messages"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="Taux de présence" value="94%" icon={Users} trend={{ percent: 2, positive: true }} color="text-emerald-400" />
                  <StatCard title="Heures d'étude" value="48 290" icon={Clock} trend={{ percent: 12, positive: true }} color="text-blue-400" />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl p-5 glass-panel glass-border-gold">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-5 rounded-full bg-gradient-to-b from-violet-400 to-pink-400" />
                    <h3 className="font-bold text-foreground text-sm">Performance par matière</h3>
                  </div>
                  <DonutChart
                    data={subjects.map((s) => ({
                      label: s.subject,
                      value: s.average_grade,
                      color: s.subject === 'Mathématiques' ? '#3b82f6' : s.subject === 'Physique' ? '#8b5cf6' : s.subject === 'Anglais' ? '#10b981' : '#f59e0b',
                    }))}
                    size={200}
                    centerValue={subjects[0]?.average_grade}
                  />
                </div>
                <div className="rounded-2xl overflow-hidden glass-panel glass-border-gold">
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={16} className="text-gold" />
                      <h3 className="font-bold text-foreground text-sm">Activité récente</h3>
                    </div>
                    <div className="space-y-3">
                      {activity.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                            <Activity size={12} className="text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-snug truncate">
                              {a.actor_name} a interagi dans <span className="text-gold font-medium">{a.chat_name}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(a.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Data tables section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Students */}
              <div className="lg:col-span-1 rounded-2xl overflow-hidden glass-panel glass-border-gold">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">Élèves récents</h3>
                    <Link href="/dashboard/students" className="text-[10px] font-bold text-gold hover:text-gold/80 transition">Voir tout</Link>
                  </div>
                  {students.length === 0 ? (
                    <EmptyState
                      title="Aucun élève enregistré"
                      description="Cliquez sur '+ Nouvelle action' pour ajouter un premier élève."
                      actionLabel="+ Ajouter un élève"
                      onAction={() => {}}
                    />
                  ) : (
                    <div className="space-y-2">
                      {students.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium truncate">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.level}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>{s.status === 'active' ? 'Actif' : 'Inactif'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div className="lg:col-span-1 rounded-2xl overflow-hidden glass-panel glass-border-gold">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">Paiements récents</h3>
                    <Link href="/dashboard/payments" className="text-[10px] font-bold text-gold hover:text-gold/80 transition">Voir tout</Link>
                  </div>
                  {payments.length === 0 ? (
                    <EmptyState
                      title="Aucun paiement"
                      description="Aucun paiement enregistré pour ce mois."
                    />
                  ) : (
                    <div className="space-y-2">
                      {payments.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium truncate">{p.user_name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.plan_title || 'Paiement'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-foreground">{p.amount.toLocaleString()} DA</p>
                            <span className={`text-[10px] font-bold ${
                              p.status === 'completed' ? 'text-emerald-400' : p.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {p.status === 'completed' ? 'Terminé' : p.status === 'pending' ? 'En attente' : 'Échec'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Salaries */}
              <div className="lg:col-span-1 rounded-2xl overflow-hidden glass-panel glass-border-gold">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">Salaires</h3>
                    <Link href="/dashboard/salaries" className="text-[10px] font-bold text-gold hover:text-gold/80 transition">Voir tout</Link>
                  </div>
                  {salaries.length === 0 ? (
                    <EmptyState title="Aucun salaire" description="Aucun enseignant enregistré." />
                  ) : (
                    <div className="space-y-2">
                      {salaries.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium truncate">{s.teacher_name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-foreground">{s.monthlySalary.toLocaleString()} DA</p>
                            <span className={`text-[10px] font-bold ${s.paid ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {s.paid ? 'Payé' : 'Impayé'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation bas mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
