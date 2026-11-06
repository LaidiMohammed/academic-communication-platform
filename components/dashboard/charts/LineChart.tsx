"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
  label?: string;
}

/** Graphique en courbe léger en SVG (aucune dépendance externe). */
export function LineChart({ data, height = 200, color = '#d4af37', label }: LineChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * (width - 40) + 20;
      const y = height - 30 - ((d.value - min) / range) * (height - 70);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = [
    `20,${height - 30}`,
    points,
    `${20 + (data.length - 1) * ((width - 40) / (data.length - 1 || 1))},${height - 30}`,
  ].join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {label && (
        <div className="flex justify-between items-end mb-2 w-full">
          <span className="text-[11px] font-bold text-gold uppercase tracking-wider">{label}</span>
          <span className="text-[11px] text-muted-foreground font-mono">{max.toLocaleString()} max</span>
        </div>
      )}
      <div className="relative w-full h-[200px]">
        <svg width={width} height={height} className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = height - 30 - ratio * (height - 70);
            return (
              <line key={i} x1={20} x2={width - 20} y1={y} y2={y} stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} />
            );
          })}

          {/* Area fill */}
          <path
            d={areaPoints}
            fill={`url(#grad-${label || 'chart'})`}
            className="animate-shimmer"
          />
          <defs>
            <linearGradient id={`grad-${label || 'chart'}`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={color} stopOpacity={0.35} offset="0%" />
              <stop stopColor={color} stopOpacity={0} offset="100%" />
            </linearGradient>
          </defs>

          {/* Line */}
          <path
            d={points}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: '1000',
              strokeDashoffset: animated ? 0 : 1000,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Dots */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (width - 40) + 20;
            const y = height - 30 - ((d.value - min) / range) * (height - 70);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3.5}
                fill={color}
                stroke="#000000"
                strokeWidth={0.5}
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: `${i * 0.05}s`,
                }}
              />
            );
          })}

          {/* Axis labels */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (width - 40) + 20;
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                fontSize={10}
                fill="#94a3b8"
                textAnchor="middle"
              >
                {d.name}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="text-[11px] font-black text-foreground mt-2">
        {data[data.length - 1]?.value.toLocaleString()}
      </div>
    </motion.div>
  );
}
