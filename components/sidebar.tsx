'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Users, Video, BookOpen, Award, Zap, Info,
  Settings, Shield, LogOut, Menu, X, ChevronLeft, ChevronRight,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   NavLink — stable top-level component
───────────────────────────────────────────────────────── */
function NavLink({
  item,
  isMinimized,
  isActive,
  layoutId,
  onClick,
}: {
  item: { icon: any; label: string; href: string; id: string };
  isMinimized: boolean;
  isActive: boolean;
  layoutId: string;         // scoped per sidebar instance
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isMinimized ? item.label : ''}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl group overflow-hidden
        transition-colors duration-200
        ${isMinimized ? 'justify-center px-0' : ''}
        ${isActive ? 'text-white' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground/90'}`}
    >
      {/* ── Sliding active pill (shared layout animation) ── */}
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25"
          style={{ zIndex: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        />
      )}

      {/* Hover bg — only when inactive */}
      {!isActive && (
        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
          bg-blue-500/8 transition-opacity duration-200 pointer-events-none" />
      )}

      {/* Icon */}
      <span className="relative z-10 flex-shrink-0 flex items-center justify-center">
        <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
      </span>

      {/* Label */}
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="relative z-10 font-medium text-sm truncate overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────
   SidebarInner — top-level stable component
   instanceId makes each sidebar (desktop/mobile) independent
───────────────────────────────────────────────────────── */
function SidebarInner({
  onClose,
  instanceId,
}: {
  onClose?: () => void;
  instanceId: string;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isMinimized, setIsMinimized } = useSidebar();

  const isAdmin = user?.role === 'admin';

  const mainItems = [
    ...(isAdmin ? [{ icon: Shield,        label: 'Admin',        href: '/dashboard/admin',      id: 'admin'      }] : []),
    { icon: MessageSquare, label: 'Chat',         href: '/dashboard/chat',       id: 'chat'       },
    { icon: Users,         label: 'Groups',       href: '/dashboard/groups',     id: 'groups'     },
    { icon: Video,         label: 'Meet',         href: '/dashboard/meet',       id: 'meet'       },
    { icon: BookOpen,      label: 'Lessons',      href: '/dashboard/lessons',    id: 'lessons'    },
    { icon: Award,         label: 'Teachers',     href: '/dashboard/teachers',   id: 'teachers'   },
    { icon: Zap,           label: 'AI Assistant', href: '/dashboard/ai',         id: 'ai'         },
  ];

  const secondaryItems = [
    { icon: CreditCard, label: 'Membership', href: '/dashboard/membership', id: 'membership' },
    { icon: Settings,   label: 'Settings',   href: '/dashboard/settings',   id: 'settings'   },
    { icon: Info,       label: 'About',      href: '/dashboard/about',      id: 'about'      },
  ];

  const checkActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const profileActive = checkActive('/dashboard/profile');
  // unique layoutId per instance so desktop & mobile don't conflict
  const pillId = `${instanceId}-pill`;

  return (
    /* ONE LayoutGroup per sidebar instance scopes all layoutIds */
    <LayoutGroup id={instanceId}>
      <div className="flex flex-col h-full">

        {/* ── Logo row ── */}
        <div className="relative border-b border-sidebar-border flex-shrink-0 flex items-center h-[4.5rem] px-3">
          {/* School logo image */}
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-2.5 min-w-0 ${isMinimized ? 'justify-center w-full' : 'flex-1'}`}
          >
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <img
                src="/logo.png"
                alt="Bendella School"
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
            </motion.div>

            <AnimatePresence initial={false}>
              {!isMinimized && (
                <motion.div
                  key="logo-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <span className="text-sm font-bold text-sidebar-foreground leading-tight block truncate">
                    Bendella School
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium">Excellence · Oran</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse / Expand button — absolute on the right edge */}
          {!onClose && (
            <motion.button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 bg-card border border-sidebar-border rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition shadow-sm z-50 text-sidebar-foreground/50"
              title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMinimized ? 'expand' : 'collapse'}
                  initial={{ opacity: 0, rotate: -50 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 50 }}
                  transition={{ duration: 0.14 }}
                  className="flex"
                >
                  {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <AnimatePresence initial={false}>
            {!isMinimized && (
              <motion.p
                key="main-lbl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-bold text-muted-foreground/40 uppercase
                  tracking-widest px-3 mb-2 mt-1"
              >
                Main
              </motion.p>
            )}
          </AnimatePresence>

          {mainItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isMinimized={isMinimized}
              isActive={checkActive(item.href)}
              layoutId={pillId}
              onClick={onClose}
            />
          ))}

          <div className={`my-3 h-px bg-sidebar-border/50 ${isMinimized ? 'mx-2' : 'mx-1'}`} />

          <AnimatePresence initial={false}>
            {!isMinimized && (
              <motion.p
                key="acc-lbl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-bold text-muted-foreground/40 uppercase
                  tracking-widest px-3 mb-2"
              >
                Account
              </motion.p>
            )}
          </AnimatePresence>

          {secondaryItems.map((item) => (
            <div key={item.id} className="relative">
              {/* "Active" pulse on Settings */}
              {item.id === 'settings' && !isMinimized && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                  flex items-center gap-1 pointer-events-none">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-[9px] font-semibold text-green-400 uppercase tracking-wide">
                    Active
                  </span>
                </span>
              )}
              <NavLink
                item={item}
                isMinimized={isMinimized}
                isActive={checkActive(item.href)}
                layoutId={pillId}
                onClick={onClose}
              />
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className={`p-3 border-t border-sidebar-border flex-shrink-0 space-y-2
          ${isMinimized ? 'flex flex-col items-center gap-2 space-y-0' : ''}`}>



          {/* Profile — same layoutId group so the pill slides here too */}
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={`relative flex items-center gap-2.5 p-2.5 rounded-xl overflow-hidden
              cursor-pointer group transition-colors duration-200
              ${isMinimized ? 'justify-center' : ''}
              ${profileActive ? 'text-white' : 'text-sidebar-foreground'}`}
          >
            {profileActive && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25"
                style={{ zIndex: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            {!profileActive && (
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                bg-blue-500/8 transition-opacity duration-200 pointer-events-none" />
            )}

            {/* Avatar with online dot */}
            <div className="relative z-10 flex-shrink-0">
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center text-white text-xs font-bold shadow-md"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </motion.div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400
                rounded-full border-2 border-sidebar" />
            </div>

            <AnimatePresence initial={false}>
              {!isMinimized && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.16 }}
                  className="relative z-10 flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold truncate">{user?.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <p className={`text-[10px] truncate ${profileActive ? 'text-white/70' : 'text-green-400'}`}>
                      En ligne
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Logout */}
          <motion.button
            onClick={logout}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl
              text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10
              transition-colors w-full text-sm
              ${isMinimized ? 'justify-center px-0' : ''}`}
            title={isMinimized ? 'Logout' : ''}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={17} strokeWidth={2} />
            <AnimatePresence initial={false}>
              {!isMinimized && (
                <motion.span
                  key="logout"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.16 }}
                  className="font-medium"
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

      </div>
    </LayoutGroup>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Sidebar export
───────────────────────────────────────────────────────── */
export function Sidebar() {
  const { isMinimized } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl
          bg-blue-500 text-white shadow-lg"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? 'x' : 'menu'}
            initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
            transition={{ duration: 0.13 }}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Desktop sidebar */}
      <motion.div
        className="hidden md:flex fixed left-0 top-0 h-screen bg-sidebar
          border-r border-sidebar-border flex-col z-40 overflow-visible"
        animate={{ width: isMinimized ? '4.5rem' : '16rem' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      >
        {/* instanceId="desktop" keeps this LayoutGroup isolated */}
        <SidebarInner instanceId="desktop" />
      </motion.div>

      {/* Mobile drawer */}
      <motion.div
        className="fixed left-0 top-0 h-screen w-64 bg-sidebar
          border-r border-sidebar-border flex flex-col z-40 md:hidden overflow-hidden"
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      >
        {/* instanceId="mobile" keeps this LayoutGroup isolated */}
        <SidebarInner instanceId="mobile" onClose={() => setIsOpen(false)} />
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
