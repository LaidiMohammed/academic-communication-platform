'use client';

import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, GraduationCap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMinimized } = useSidebar();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const Icon = currentHour < 18 ? Sun : Moon;

  return (
    <>
      {/* Sticky scrolled mini-header */}
      <motion.header
        initial={{ y: -48 }}
        animate={scrolled ? { y: 0 } : { y: -48 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border h-11 flex items-center px-4 md:px-6 pointer-events-none"
        style={{ left: isMinimized ? '5rem' : '16rem' }}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30 flex-shrink-0">
            <GraduationCap size={12} className="text-blue-400" />
          </div>
          <Icon size={13} className="text-blue-400 flex-shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-blue-500/10 px-2 py-0.5 rounded-full capitalize">
            {user?.role || 'Student'}
          </span>
        </div>
      </motion.header>

      {/* Main scrollable area */}
      <main
        className={`transition-all duration-300 ease-out flex-1 flex flex-col overflow-y-auto h-screen ${
          isMinimized ? 'md:ml-20' : 'md:ml-64'
        }`}
        onScroll={(e) => setScrolled((e.target as HTMLElement).scrollTop > 80)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, scale: 0.985, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full origin-top flex-1 flex flex-col ${
              pathname.includes('/chat') || pathname.includes('/ai') ? 'p-0' : 'p-4 sm:p-6 pb-12'
            }`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
