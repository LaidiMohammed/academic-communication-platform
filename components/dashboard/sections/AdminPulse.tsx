"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PiggyBank,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { MonthSelector } from "@/components/dashboard/widgets/MonthSelector";
import { KpiCard } from "@/components/dashboard/widgets/KpiCard";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { fetchAdminOverview, type AdminOverviewData } from "@/lib/admin-overview";

/* ═══════════════════════════════════════════════════════════
   Formatage
═══════════════════════════════════════════════════════════ */

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

function formatCurrency(value: number): string {
  return `${formatNumber(value)} DA`;
}

function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M DA`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}k DA`;
  return `${formatNumber(value)} DA`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Payé", className: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20" },
  pending: { label: "En attente", className: "bg-amber-500/10 text-amber-300 border-amber-400/20" },
  failed: { label: "Échoué", className: "bg-rose-500/10 text-rose-300 border-rose-400/20" },
  cancelled: { label: "Annulé", className: "bg-slate-500/10 text-slate-300 border-slate-400/20" },
};

/* ═══════════════════════════════════════════════════════════
   Petites cartes du mode compact
═══════════════════════════════════════════════════════════ */

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.06]">
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: accent }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black tracking-tight text-foreground">{value}</p>
      <div
        className="absolute bottom-0 left-0 h-px w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Composant principal
═══════════════════════════════════════════════════════════ */

interface AdminPulseProps {
  compact?: boolean;
  className?: string;
  /** Callback optionnel pour partager les données chargées avec la page parente. */
  onData?: (data: AdminOverviewData) => void;
}

export function AdminPulse({ compact = false, className = "", onData }: AdminPulseProps) {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);

      try {
        const result = await fetchAdminOverview(period.year, period.month);
        if (!alive.current) return;
        setData(result);
        onData?.(result);
        setError(null);
        setLastSync(new Date());
      } catch (err) {
        if (!alive.current) return;
        setError(err instanceof Error ? err.message : "Impossible de charger les données.");
      } finally {
        if (alive.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [period.year, period.month, onData],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void load("refresh");
    }, compact ? 120_000 : 60_000);
    return () => window.clearInterval(interval);
  }, [load, compact]);

  const hasData = Boolean(data);
  const warnings = data?.warnings ?? [];

  const netPositive = (data?.financial.netProfit ?? 0) >= 0;
  const totalPeople =
    (data?.overview.totalStudents ?? 0) +
    (data?.overview.totalTeachers ?? 0) +
    (data?.overview.totalAdmins ?? 0);

  const revenueSeries = useMemo(
    () => (data?.series ?? []).map((point) => ({ name: point.label, value: point.revenue })),
    [data],
  );

  const expenseSeries = useMemo(
    () => (data?.series ?? []).map((point) => ({ name: point.label, value: point.expenses })),
    [data],
  );

  const donutData = useMemo(
    () => [
      { label: "Étudiants", value: data?.overview.totalStudents ?? 0, color: "#38bdf8" },
      { label: "Enseignants", value: data?.overview.totalTeachers ?? 0, color: "#22d3ee" },
      { label: "Admins", value: data?.overview.totalAdmins ?? 0, color: "#d4af37" },
    ],
    [data],
  );

  const quickLinks = [
    { href: "/dashboard/admin", label: "Administration", icon: ShieldCheck, accent: "#38bdf8" },
    { href: "/dashboard/students", label: "Étudiants", icon: Users, accent: "#60a5fa" },
    { href: "/dashboard/payments", label: "Paiements", icon: Wallet, accent: "#d4af37" },
    { href: "/dashboard/salaries", label: "Salaires", icon: Banknote, accent: "#fbbf24" },
    { href: "/dashboard/expenses", label: "Dépenses", icon: Receipt, accent: "#fb7185" },
  ];

  /* ── En-tête commun ── */
  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/25 to-cyan-400/10">
          <Activity size={18} className="text-cyan-300" />
          <span
            className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${
              error ? "bg-rose-400" : "bg-emerald-400"
            } ${refreshing ? "animate-pulse" : ""}`}
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black tracking-tight text-foreground sm:text-xl">
              {compact ? "Pilotage de l’école" : "Vue d’ensemble"}
            </h2>
            <span className="hidden items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200 sm:inline-flex">
              <Sparkles size={10} /> Admin · temps réel
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground/70">
            {lastSync
              ? `Données Supabase synchronisées à ${lastSync.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Connexion aux données de l’école…"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <MonthSelector value={period} onChange={setPeriod} />
        <button
          type="button"
          onClick={() => void load("refresh")}
          disabled={refreshing}
          aria-label="Actualiser les données"
          title="Actualiser"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );

  /* ── Bandeau d'avertissement ── */
  const warningBanner =
    warnings.length > 0 ? (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-3.5">
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-300" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-200">
            Configuration Supabase incomplète{compact ? "" : " : certaines données restent à zéro"}
          </p>
          {compact ? (
            <p className="mt-0.5 text-[11px] text-amber-100/60">
              {warnings.length} table(s) financière(s) à provisionner.
            </p>
          ) : (
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-amber-100/60">
              {warnings.slice(0, 4).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ) : null;

  /* ── Erreur ── */
  const errorBanner = error ? (
    <div className="flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />
        <div>
          <p className="text-sm font-bold text-rose-200">Impossible de charger les données</p>
          <p className="mt-0.5 text-[11px] text-rose-100/60">{error}</p>
          {hasData && (
            <p className="mt-1 text-[10px] text-muted-foreground/60">
              Les dernières données connues restent affichées.
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void load("initial")}
        className="shrink-0 rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-100 transition-colors hover:bg-rose-400/20"
      >
        Réessayer
      </button>
    </div>
  ) : null;

  /* ═══════════════════════════════════════════════════════
     Mode compact (page d'accueil)
  ═══════════════════════════════════════════════════════ */
  if (compact) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
        className={`relative overflow-hidden rounded-3xl glass-panel glass-border-gold p-5 sm:p-6 ${className}`}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.30), transparent 70%)" }}
        />

        <div className="relative z-10 space-y-4">
          {header}
          {errorBanner}
          {warningBanner}

          {loading && !data ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[88px] animate-shimmer rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MiniStat
                icon={Users}
                label="Étudiants"
                value={formatNumber(data?.overview.totalStudents ?? 0)}
                accent="#60a5fa"
              />
              <MiniStat
                icon={GraduationCap}
                label="Enseignants"
                value={formatNumber(data?.overview.totalTeachers ?? 0)}
                accent="#22d3ee"
              />
              <MiniStat
                icon={Wallet}
                label="Revenus du mois"
                value={formatCompactCurrency(data?.financial.monthRevenue ?? 0)}
                accent="#d4af37"
              />
              <MiniStat
                icon={PiggyBank}
                label="Solde net"
                value={formatCompactCurrency(data?.financial.netProfit ?? 0)}
                accent={netPositive ? "#34d399" : "#fb7185"}
              />
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-300" />
                <span className="text-[11px] font-bold text-foreground">Revenus · 6 derniers mois</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <CalendarDays size={11} /> {period.year}
              </span>
            </div>
            {revenueSeries.some((point) => point.value > 0) ? (
              <LineChart data={revenueSeries} height={125} color="#38bdf8" label={`revenue-compact-${period.year}-${period.month}`} />
            ) : (
              <div className="flex h-[110px] items-center justify-center text-[11px] text-muted-foreground/50">
                Aucun revenu enregistré sur la période.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-muted-foreground/60">
              {formatNumber(totalPeople)} membres · {formatNumber(data?.overview.messages24h ?? 0)} messages aujourd’hui
            </p>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Ouvrir le tableau de bord admin <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.section>
    );
  }

  /* ═══════════════════════════════════════════════════════
     Mode complet (tableau de bord admin)
  ═══════════════════════════════════════════════════════ */
  return (
    <div className={`space-y-5 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl glass-panel glass-border-gold p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.32), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.28), transparent 70%)" }}
        />
        <div className="relative z-10 space-y-4">
          {header}
          {errorBanner}
          {warningBanner}
        </div>
      </div>

      {/* KPI principaux */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading && !data
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[148px] animate-shimmer rounded-2xl border border-white/10 bg-white/5" />
            ))
          : [
              {
                title: "Étudiants",
                value: formatNumber(data?.overview.totalStudents ?? 0),
                subtitle: "inscrits",
                icon: Users,
                color: "#60a5fa",
                href: "/dashboard/students",
              },
              {
                title: "Enseignants",
                value: formatNumber(data?.overview.totalTeachers ?? 0),
                subtitle: "actifs",
                icon: GraduationCap,
                color: "#22d3ee",
                href: "/dashboard/teachers",
              },
              {
                title: "Revenus du mois",
                value: formatCurrency(data?.financial.monthRevenue ?? 0),
                icon: Wallet,
                color: "#d4af37",
                href: "/dashboard/payments",
              },
              {
                title: "Solde net",
                value: formatCurrency(data?.financial.netProfit ?? 0),
                icon: PiggyBank,
                color: netPositive ? "#34d399" : "#fb7185",
              },
              {
                title: "Salaires du mois",
                value: formatCurrency(data?.financial.monthSalaries ?? 0),
                icon: Banknote,
                color: "#fbbf24",
                href: "/dashboard/salaries",
              },
              {
                title: "Dépenses du mois",
                value: formatCurrency(data?.financial.monthExpenses ?? 0),
                icon: Receipt,
                color: "#fb7185",
                href: "/dashboard/expenses",
              },
              {
                title: "Membres actifs",
                value: formatNumber(data?.overview.activeMemberships ?? 0),
                icon: UserCheck,
                color: "#a78bfa",
              },
              {
                title: "Messages 24h",
                value: formatNumber(data?.overview.messages24h ?? 0),
                icon: MessageSquare,
                color: "#38bdf8",
              },
            ].map((kpi) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                subtitle={(kpi as any).subtitle}
                icon={kpi.icon}
                color={kpi.color}
                href={(kpi as any).href}
              />
            ))}
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl glass-panel glass-border-gold p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                <TrendingUp size={15} className="text-cyan-300" /> Revenus sur 6 mois
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                Paiements complétés et revenus divers
              </p>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
              {formatCompactCurrency(
                (data?.series ?? []).reduce((sum, point) => sum + point.revenue, 0),
              )}
            </span>
          </div>
          {revenueSeries.some((point) => point.value > 0) ? (
            <LineChart data={revenueSeries} height={220} color="#38bdf8" label={`revenue-full-${period.year}-${period.month}`} />
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground/50">
              Aucun revenu enregistré sur les 6 derniers mois.
            </div>
          )}
        </div>

        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <Users size={15} className="text-cyan-300" /> Répartition
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">Membres de la plateforme</p>
          <div className="mt-4 flex justify-center">
            <DonutChart
              data={donutData}
              size={170}
              centerValue={formatNumber(totalPeople)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
              <TrendingDown size={15} className="text-rose-300" /> Dépenses sur 6 mois
            </h3>
          </div>
          {expenseSeries.some((point) => point.value > 0) ? (
            <LineChart data={expenseSeries} height={160} color="#fb7185" label={`expenses-full-${period.year}-${period.month}`} />
          ) : (
            <div className="flex h-[160px] items-center justify-center text-xs text-muted-foreground/50">
              Aucune dépense enregistrée.
            </div>
          )}
        </div>

        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <BookOpen size={15} className="text-cyan-300" /> Activité pédagogique
          </h3>
          <div className="mt-4 space-y-3">
            {[
              { label: "Leçons disponibles", value: data?.overview.totalLessons ?? 0, icon: BookOpen, accent: "#38bdf8" },
              { label: "Conversations", value: data?.overview.totalChats ?? 0, icon: MessageSquare, accent: "#22d3ee" },
              { label: "Messages (24h)", value: data?.overview.messages24h ?? 0, icon: Activity, accent: "#a78bfa" },
              { label: "Membres actifs", value: data?.overview.activeMemberships ?? 0, icon: UserCheck, accent: "#34d399" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <row.icon size={13} style={{ color: row.accent }} /> {row.label}
                </span>
                <span className="text-sm font-black text-foreground">{formatNumber(row.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <LayoutDashboard size={15} className="text-cyan-300" /> Accès rapides
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <link.icon size={14} style={{ color: link.accent }} /> {link.label}
                </span>
                <ArrowRight size={13} className="opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-80" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Listes récentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
              <GraduationCap size={15} className="text-cyan-300" /> Derniers étudiants
            </h3>
            <Link href="/dashboard/students" className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200">
              Voir tout
            </Link>
          </div>
          {loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 animate-shimmer rounded-xl bg-white/5" />
              ))}
            </div>
          ) : (data?.students.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground/50">
              Aucun étudiant inscrit pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-[11px] font-black text-blue-200">
                    {initials(student.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{student.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground/60">{student.email || "Sans e-mail"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-cyan-200">{student.level}</p>
                    <p className="text-[10px] text-muted-foreground/50">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl glass-panel glass-border-gold p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
              <Wallet size={15} className="text-gold" /> Derniers paiements
            </h3>
            <Link href="/dashboard/payments" className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200">
              Voir tout
            </Link>
          </div>
          {loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 animate-shimmer rounded-xl bg-white/5" />
              ))}
            </div>
          ) : (data?.payments.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground/50">
              Aucun paiement enregistré pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.payments.map((payment) => {
                const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending;
                return (
                  <div key={payment.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-200">
                      <Wallet size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{payment.userName}</p>
                      <p className="truncate text-[10px] text-muted-foreground/60">{payment.planTitle}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black text-gold">{formatCurrency(payment.amount)}</p>
                      <span className={`mt-0.5 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
