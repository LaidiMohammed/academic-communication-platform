/**
 * lib/use-toast.ts
 * Système de notifications (toasts) élégant, sans dépendance externe.
 */

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (props: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: Toast = { id, duration: TOAST_REMOVE_DELAY, ...props };

      setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
