'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Users, Video, BookOpen, Zap, Home, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
  { icon: Users, label: 'Groups', href: '/dashboard/groups' },
  { icon: Video, label: 'Meet', href: '/dashboard/meet' },
  { icon: BookOpen, label: 'Lessons', href: '/dashboard/lessons' },
  { icon: Zap, label: 'AI', href: '/dashboard/ai' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-[4.25rem] px-2 pb-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full rounded-xl transition-colors ${
                active ? 'text-blue-400' : 'text-muted-foreground/60 hover:text-muted-foreground/90'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-1 rounded-xl bg-blue-500/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative flex flex-col items-center gap-0.5">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
