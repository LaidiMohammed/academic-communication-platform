"use client";

import { SidebarModern } from '@/components/dashboard/layout/SidebarModern';
import { DashboardHeader } from '@/components/dashboard/layout/Header';

export function DashboardShell({
  breadcrumb,
  children,
}: {
  breadcrumb: { label: string; href?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <SidebarModern />
      <DashboardHeader breadcrumb={breadcrumb} />
      <main className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
