'use client';

import { useSidebar } from '@/lib/sidebar-context';
import { usePathname } from 'next/navigation';

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMinimized } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      <main
        className={`transition-all duration-300 ease-out flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden ${
          isMinimized ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div
          className={`w-full flex-1 flex flex-col ${
            pathname.includes('/chat') || pathname.includes('/ai') ? 'p-0 pb-20 md:pb-0' : 'p-4 sm:p-6 pb-20 md:pb-12'
          }`}
        >
          {children}
        </div>
      </main>
    </>
  );
}
