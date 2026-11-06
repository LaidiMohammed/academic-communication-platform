"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  value: { year: number; month: number }; // month: 1-12
  onChange: (value: { year: number; month: number }) => void;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [open, setOpen] = useState(false);

  const monthsInYear = Array.from({ length: 12 }, (_, i) => i + 1);

  const prevYear = () => onChange({ year: value.year - 1, month: value.month });
  const nextYear = () => onChange({ year: value.year + 1, month: value.month });
  const selectMonth = (m: number) => {
    onChange({ year: value.year, month: m });
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all"
      >
        <Calendar size={16} className="text-gold" />
        <span className="text-sm font-semibold">{MONTHS_FR[value.month - 1]} {value.year}</span>
        <ChevronDown size={16} className="text-muted-foreground/50 ml-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 mt-2 w-56 rounded-2xl bg-black/90 border border-white/10 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={prevYear} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-foreground">{value.year}</span>
            <button onClick={nextYear} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {monthsInYear.map((m) => (
              <button
                key={m}
                onClick={() => selectMonth(m)}
                className={`p-2 rounded-lg text-xs font-medium transition ${
                  m === value.month
                    ? 'bg-gold text-ink'
                    : 'text-muted-foreground/70 hover:bg-white/10 hover:text-foreground'
                }`}
              >
                {MONTHS_FR[m - 1].slice(0, 3)}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
