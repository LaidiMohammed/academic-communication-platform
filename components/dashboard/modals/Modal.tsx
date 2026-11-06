"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  showClose?: boolean;
}

export function Modal({ isOpen, onClose, title, description, children, showClose = true }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2
              rounded-2xl bg-black/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl
              flex flex-col gap-5"
          >
            <div className="flex items-start gap-3">
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground/60 transition"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              )}
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                {description && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{description}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
