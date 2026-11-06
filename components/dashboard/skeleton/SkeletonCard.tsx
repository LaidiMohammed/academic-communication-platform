"use client";

import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`animate-shimmer rounded-2xl border border-white/10 bg-white/5 ${className}`}
    />
  );
}

export function SkeletonKpi({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-5 glass-panel glass-border-gold flex flex-col gap-3 ${className}`}>
      <div className="h-10 w-20 bg-white/5 rounded-xl animate-shimmer" />
      <div className="h-8 w-3/4 bg-white/5 rounded animate-shimmer" />
      <div className="h-6 w-full bg-white/5 rounded animate-shimmer" />
    </div>
  );
}

export function SkeletonTableRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 py-3 border-b border-white/5 ${className}`}>
      <div className="flex-1">
        <div className="h-3 w-1/3 bg-white/5 rounded animate-shimmer mb-1" />
        <div className="h-3 w-1/2 bg-white/5 rounded animate-shimmer" />
      </div>
      <div className="w-24">
        <div className="h-3 w-full bg-white/5 rounded animate-shimmer" />
      </div>
      <div className="w-24">
        <div className="h-3 w-full bg-white/5 rounded animate-shimmer" />
      </div>
    </div>
  );
}
