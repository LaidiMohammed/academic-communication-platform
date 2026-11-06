"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  icon: React.ElementType;
  /** Couleur d'accent : hexadécimal (#60a5fa) ou classe Tailwind historique (text-blue-400). */
  color?: string;
  href?: string;
}

const COLOR_MAP: Record<string, string> = {
  'text-blue-400': '#60a5fa',
  'text-cyan-400': '#22d3ee',
  'text-sky-400': '#38bdf8',
  'text-emerald-400': '#34d399',
  'text-teal-400': '#2dd4bf',
  'text-amber-400': '#fbbf24',
  'text-gold': '#d4af37',
  'text-rose-400': '#fb7185',
  'text-violet-400': '#a78bfa',
  'text-purple-400': '#c084fc',
  'text-indigo-400': '#818cf8',
};

function resolveColor(color: string): string {
  if (color.startsWith('#')) return color;
  return COLOR_MAP[color] ?? '#60a5fa';
}

function rgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return `rgba(96, 165, 250, ${alpha})`;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = '#60a5fa',
  href,
}: KpiCardProps) {
  const accent = resolveColor(color);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-2xl p-5 glass-panel glass-border-gold overflow-hidden"
    >
      {/* Accent gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${rgba(accent, 0.12)}, transparent 65%)` }}
      />
      {/* Border highlight */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-40 blur pointer-events-none transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accent}, #22d3ee)` }}
      />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-1"
          style={{ background: rgba(accent, 0.12), border: `1px solid ${rgba(accent, 0.28)}` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
        {href && (
          <Link href={href} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Ouvrir ${title}`}>
            <ChevronRight size={16} className="text-muted-foreground/50" />
          </Link>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{value}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </div>

      {trend && (
        <div className="relative z-10 mt-3 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold flex items-center gap-1 ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[10px] text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
