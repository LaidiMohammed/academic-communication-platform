'use client';

import { useSidebar } from '@/lib/sidebar-context';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMinimized } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Main area */}
      <main
        className={`transition-all duration-300 ease-out flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden ${
          isMinimized ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, scale: 0.985, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full origin-top flex-1 flex flex-col ${
              pathname.includes('/chat') || pathname.includes('/ai') ? 'p-0 pb-20 md:pb-0' : 'p-4 sm:p-6 pb-20 md:pb-12'
            }`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
