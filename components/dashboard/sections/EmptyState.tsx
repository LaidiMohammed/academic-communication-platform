"use client";

import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconProp = Activity,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon = IconProp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 flex-shrink-0">
        <Icon size={32} className="text-muted-foreground/40" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground/60 text-sm leading-relaxed max-w-xs mx-auto mb-8">
        {description}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
