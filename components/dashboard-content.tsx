'use client';

import { useSidebar } from '@/lib/sidebar-context';

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { isMinimized } = useSidebar();

  return (
    <main
      className={`transition-all duration-300 ease-out flex-1 min-h-0 ${
        isMinimized ? 'md:ml-20' : 'md:ml-64'
      }`}
    >
      {children}
    </main>
  );
}
