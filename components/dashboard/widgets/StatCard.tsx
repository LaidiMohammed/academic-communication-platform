"use client";

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: {
    percent: number;
    positive: boolean;
  };
  /** Couleur d'accent : hexadécimal (#60a5fa) ou classe Tailwind historique (text-blue-400). */
  color?: string;
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

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = '#60a5fa',
}: StatCardProps) {
  const accent = resolveColor(color);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative rounded-2xl p-5 glass-panel glass-border-gold overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${rgba(accent, 0.1)}, transparent 70%)` }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: rgba(accent, 0.12), border: `1px solid ${rgba(accent, 0.28)}` }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
        {trend && (
          <div className={`p-1.5 rounded-lg ${
            trend.positive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
          }`}>
            <span className={`text-[10px] font-bold ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {trend.positive ? '▲' : '▼'} {Math.abs(trend.percent)}%
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </motion.div>
  );
}
