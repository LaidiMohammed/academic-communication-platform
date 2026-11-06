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
  color?: string;
  href?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'text-blue-400',
  href,
}: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-2xl p-5 glass-panel glass-border-gold overflow-hidden"
    >
      {/* Accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Border highlight */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold via-blue-500 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-50 blur pointer-events-none transition-opacity duration-300" />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-1"
          style={{ background: `${color.replace('text-', 'bg-')}15`, border: `1px solid ${color.replace('text-', '')}25` }}>
          <Icon size={18} style={{ color: color }} />
        </div>
        {href && (
          <Link href={href} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} className="text-muted-foreground/50" />
          </Link>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-foreground tracking-tight">{value}</span>
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
            {trend.positive ? '▲' : '▼'} {trend.value}%
          </span>
          <span className="text-[10px] text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
