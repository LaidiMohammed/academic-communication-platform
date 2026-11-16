'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, PauseCircle, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type Status = 'active' | 'inactive' | 'suspended' | 'pending_payment';

const STATUS: Record<Status, { label: string; note: string; icon: typeof CheckCircle2; className: string }> = {
  active: {
    label: 'Compte actif',
    note: 'Votre accès aux cours est opérationnel.',
    icon: CheckCircle2,
    className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  },
  inactive: {
    label: 'Compte inactif',
    note: 'Contactez l’administration pour réactiver votre accès.',
    icon: PauseCircle,
    className: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  },
  suspended: {
    label: 'Compte suspendu',
    note: 'Contactez l’administration pour plus d’informations.',
    icon: PauseCircle,
    className: 'border-rose-400/20 bg-rose-500/10 text-rose-300',
  },
  pending_payment: {
    label: 'En attente de paiement',
    note: 'Votre accès sera activé après validation du paiement.',
    icon: Clock3,
    className: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  },
};

export function StudentStatusStrip() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('active');
  const [sessions, setSessions] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/student/status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setStatus((data.status || 'active') as Status);
      setSessions(Number(data.sessions || 0));
    } catch {
      // Silencieux : aucune erreur affichée à l'élève.
    }
  }, [user]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  const info = STATUS[status] || STATUS.active;
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-card/40 px-4 py-3 backdrop-blur-xl"
    >
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${info.className}`}>
        <Icon size={14} />
        {info.label}
      </div>
      <p className="text-[11px] text-muted-foreground/70">{info.note}</p>
      <div className="ml-auto flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-500/5 px-3 py-1.5">
        <ShieldCheck size={14} className="text-cyan-300" />
        <span className="text-[11px] font-semibold text-cyan-200">{sessions} séances disponibles</span>
      </div>
    </motion.div>
  );
}
