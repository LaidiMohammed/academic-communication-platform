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
  color?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-blue-400',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative rounded-2xl p-5 glass-panel glass-border-gold overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: `${color.replace('text-', 'bg-')}10`, border: `1px solid ${color.replace('text-', '')}20` }}>
          <Icon size={20} style={{ color: color }} />
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

      <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </motion.div>
  );
}
