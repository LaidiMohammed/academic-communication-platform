"use client";

import { motion } from 'framer-motion';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  label?: string;
  centerValue?: string | number;
}

/** Graphique en anneau (donut) léger en SVG. */
export function DonutChart({ data, size = 160, label, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.14;

  let offset = 0;
  const segments = data.map((d) => {
    const sweep = (d.value / total) * 360;
    const largeArc = sweep > 180 ? 1 : 0;
    const startRad = (offset * Math.PI) / 180;
    const endRad = ((offset + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    offset += sweep;

    return (
      <path
        key={d.label}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke={d.color}
        strokeWidth={sw}
        strokeLinecap="round"
        className="animate-shimmer"
      />
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      {label && (
        <span className="text-[11px] font-bold text-gold uppercase tracking-wider mb-3">{label}</span>
      )}
      <div className="relative">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={sw} />
          {segments}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && (
            <span className="text-xl font-black text-foreground">{centerValue}</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {data.map((d) => (
          <span key={d.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.label} <span className="font-semibold text-foreground">{((d.value / total) * 100).toFixed(0)}%</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}
