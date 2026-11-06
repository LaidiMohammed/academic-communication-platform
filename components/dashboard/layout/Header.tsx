"use client";

import React, { useState } from 'react';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from '@/lib/use-toast';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function DashboardHeader({ breadcrumb }: { breadcrumb: BreadcrumbItem[] }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  return (
    <div className="sticky top-0 z-30 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs + titre */}
        <div className="flex items-center gap-1 flex-1 max-w-2xl">
          <button
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground"
            aria-label="Menu"
          >
            <ChevronDown size={20} />
          </button>
          <div className="flex items-center gap-1 px-2">
            {breadcrumb.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span className="text-[10px] text-muted-foreground/50">›</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-xs font-medium text-muted-foreground/70 hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-gold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Centre : recherche rapide */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Rechercher messages, leçons, groupes…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          <button
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-gold transition group"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-muted-foreground group-hover:text-gold transition" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-background" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-white/10 object-cover"
              />
              <span className="hidden sm:block text-xs font-semibold text-foreground">{user?.name}</span>
              <ChevronDown size={14} className={`text-muted-foreground transition ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-black/80 border border-white/10 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/10 mb-2">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground/50">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground/80 hover:bg-white/10 hover:text-gold transition"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings size={16} /> Profil
                </Link>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground/80 hover:bg-white/10 hover:text-gold transition"
                  onClick={() => {
                    setShowMenu(false);
                    toast({ title: 'Déconnexion', description: 'À bientôt !', variant: 'default' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
