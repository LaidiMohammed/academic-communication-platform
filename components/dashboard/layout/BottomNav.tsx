"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Banknote,
  MoreHorizontal,
} from 'lucide-react';

interface BottomNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const BOTTOM_NAV: BottomNavItem[] = [
  { icon: LayoutDashboard, label: 'Accueil', href: '/dashboard' },
  { icon: Users, label: 'Élèves', href: '/dashboard/students' },
  { icon: CreditCard, label: 'Paiements', href: '/dashboard/payments' },
  { icon: Wallet, label: 'Salaires', href: '/dashboard/salaries' },
  { icon: Banknote, label: 'Dépenses', href: '/dashboard/expenses' },
  { icon: MoreHorizontal, label: 'Plus', href: '/dashboard/more' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 md:hidden">
      <div className="flex items-center justify-between w-full max-w-[600px] bg-black/80 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: active ? '#d4af37' : 'rgba(255,255,255,0.6)',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
