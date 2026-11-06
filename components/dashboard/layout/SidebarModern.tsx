"use client";

import { useEffect, useState } from 'react';
import { Bell, MessageCircle, Users, BookOpen, Play, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  id: string;
  badge?: number;
}

const MAIN_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Accueil', href: '/dashboard', id: 'home' },
  { icon: MessageCircle, label: 'Messages', href: '/dashboard/chat', id: 'chat' },
  { icon: Users, label: 'Groupes', href: '/dashboard/groups', id: 'groups' },
  { icon: Play, label: 'Meet', href: '/dashboard/meet', id: 'meet' },
  { icon: BookOpen, label: 'Leçons', href: '/dashboard/lessons', id: 'lessons' },
];

const SECONDARY_ITEMS: NavItem[] = [
  { icon: Users, label: 'Professeurs', href: '/dashboard/teachers', id: 'teachers' },
  { icon: Bell, label: 'Membreship', href: '/dashboard/membership', id: 'membership' },
  { icon: LayoutDashboard, label: 'Paramètres', href: '/dashboard/settings', id: 'settings' },
];

function NavLink({
  item,
  isMinimized,
  isActive,
  layoutId,
  onClick,
}: {
  item: NavItem;
  isMinimized: boolean;
  isActive: boolean;
  layoutId: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const pathname = usePathname();

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isMinimized ? item.label : undefined}
      className={`relative flex w-full items-center gap-3 px-3 py-3 rounded-2xl group overflow-hidden transition-all duration-300
        ${isMinimized ? 'justify-center px-2' : ''}
        ${isActive
          ? 'bg-gradient-to-r from-gold/20 to-transparent border border-gold/30 text-gold shadow-lg shadow-gold/25'
          : 'text-muted-foreground hover:bg-white/5 hover:text-gold transition-colors'
        }`}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-2xl bg-gold/10 blur-sm"
          style={{ zIndex: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        />
      )}
      {!isActive && (
        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
          bg-white/5 transition-opacity duration-300 pointer-events-none" />
      )}

      <span className="relative z-10 flex-shrink-0 flex items-center justify-center w-8">
        <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-gold' : 'text-muted-foreground'} />
      </span>

      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 font-medium text-sm truncate whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {item.badge && !isMinimized && (
        <span className="relative z-10 ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-primary-foreground font-bold ring-1 ring-background">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarModern() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isMinimized, setIsMinimized } = useSidebar();

  const isAdmin = user?.role === 'admin';
  const pillId = 'modern-pill';

  const items = [
    ...MAIN_ITEMS,
    ...(isAdmin
      ? [
          { icon: LayoutDashboard, label: 'Admin', href: '/dashboard/admin', id: 'admin', badge: 3 },
        ]
      : []),
    ...SECONDARY_ITEMS,
  ];

  const checkActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col w-64 overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="relative border-b border-white/10 flex items-center h-16 px-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/logo-school.png" alt="Bendella School" className="w-9 h-9 object-contain drop-shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground leading-tight block truncate">Bendella</span>
                <span className="text-[10px] text-gold font-medium tracking-wider uppercase">School</span>
              </div>
            </Link>
            {!isMinimized && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="ml-auto p-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-gold transition"
                title="Réduire la barre latérale"
              >
                <motion.div whileHover={{ scale: 1.1 }} className="flex">
                  <ArrowRight size={14} />
                </motion.div>
              </button>
            )}
          </div>

          <div className="p-2 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1">Navigation</p>
            {items.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isMinimized={isMinimized}
                isActive={checkActive(item.href)}
                layoutId={pillId}
              />
            ))}
          </div>

          <div className="my-2 h-px bg-white/5 mx-3" />

          <div className="p-2 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1">Compte</p>
            {[
              { icon: LayoutDashboard, label: 'Mon profil', href: '/dashboard/profile', id: 'profile' },
              { icon: LayoutDashboard, label: 'Paramètres', href: '/dashboard/settings', id: 'settings' },
            ].map((item) => (
              <NavLink key={item.id} item={item} isMinimized={isMinimized} isActive={checkActive(item.href)} layoutId={pillId} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-4 flex-shrink-0">
          <div className="relative flex items-center gap-2.5 p-2 rounded-2xl cursor-pointer group transition hover:bg-white/5" onClick={() => logout()}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-gold flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-[10px] text-gold font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> En ligne
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} className="z-10 flex">
              <LogOutIcon size={14} strokeWidth={2} />
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

function LogOutIcon({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
