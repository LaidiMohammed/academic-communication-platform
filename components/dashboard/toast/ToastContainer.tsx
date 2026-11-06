"use client";

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { motion } from 'framer-motion';

const VARIANT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  default: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20' },
  destructive: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border border-rose-500/20' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const { icon: Icon, color, bg } = VARIANT_CONFIG[toast.variant ?? 'default'];
        return (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl p-4 shadow-2xl backdrop-blur-xl border ${bg} ${color}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-2 p-1 rounded hover:bg-white/10 text-muted-foreground/60 transition"
            >
              <X size={14} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
