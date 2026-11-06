"use client";

import React from 'react';
import { ChevronRight, Edit, Trash2, Eye } from 'lucide-react';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: DataTableColumn[];
  data: T[];
  loading?: boolean;
  empty?: boolean;
  actions?: {
    label: string;
    icon: React.ElementType;
    onClick: (row: T) => void;
    color?: string;
  }[];
  rowActions?: {
    label: string;
    icon: React.ElementType;
    onClick: (row: T) => void;
    color?: string;
  }[];
}

export function DataTable<T = Record<string, any>>({
  columns,
  data,
  loading = false,
  empty = false,
  actions,
  rowActions,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 glass-panel glass-border-gold animate-shimmer">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 bg-white/10 rounded animate-shimmer" />
          <div className="h-8 w-1/2 bg-white/10 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  if (empty || data.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center glass-panel glass-border-gold">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Eye size={24} className="text-muted-foreground/50" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">Aucune donnée</h3>
        <p className="text-sm text-muted-foreground/60">Commencez par ajouter des éléments depuis l'interface.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden glass-panel glass-border-gold">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {rowActions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-white/5 transition-colors group"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(col.key, row) : <span className="text-foreground truncate">{String((row as Record<string, any>)[col.key] ?? '')}</span>}
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-3 text-right flex gap-1.5 justify-end">
                  {rowActions.map((ra) => (
                    <button
                      key={ra.label}
                      onClick={() => ra.onClick(row)}
                      className={`p-1.5 rounded-lg text-[11px] font-medium transition ${
                        ra.color === 'destructive'
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-muted-foreground/70 hover:bg-white/10 hover:text-gold'
                      }`}
                    >
                      {React.createElement(ra.icon, { size: 14 })}
                      <span className="hidden sm:block">{ra.label}</span>
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {actions && (
        <div className="border-t border-white/10 bg-white/5 p-4 flex items-center justify-between">
          <div className="flex gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => a.onClick(null as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  a.color === 'destructive'
                    ? 'text-rose-400 hover:bg-rose-500/10 border border-rose-500/20'
                    : 'bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:text-gold'
                }`}
              >
                {React.createElement(a.icon, { size: 16 })}
                {a.label}
              </button>
            ))}
          </div>
          <button className="text-[11px] font-bold text-gold flex items-center gap-1.5">
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
