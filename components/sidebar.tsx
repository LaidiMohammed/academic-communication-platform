'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare,
  Users,
  Video, 
  BookOpen, 
  Award, 
  Zap, 
  Info,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isMinimized, setIsMinimized } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard', id: 'home' },
    { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat', id: 'chat' },
    { icon: Users, label: 'Groups', href: '/dashboard/groups', id: 'groups' },
    { icon: Video, label: 'Meet', href: '/dashboard/meet', id: 'meet' },
    { icon: BookOpen, label: 'Lessons', href: '/dashboard/lessons', id: 'lessons' },
    { icon: Award, label: 'Teachers', href: '/dashboard/teachers', id: 'teachers' },
    { icon: Zap, label: 'AI Assistant', href: '/dashboard/ai', id: 'ai' },
    { icon: Info, label: 'About', href: '/dashboard/about', id: 'about' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-card border-r border-border flex-col transition-all duration-300 z-40 ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isMinimized && (
            <h1 className="text-xl font-bold text-foreground">EduConnect</h1>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-secondary transition text-foreground ml-auto flex-shrink-0"
          >
            {isMinimized ? (
              <ChevronRight size={20} strokeWidth={2} />
            ) : (
              <ChevronLeft size={20} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-foreground hover:bg-secondary'
                } ${isMinimized ? 'justify-center' : ''}`}
                title={isMinimized ? item.label : ''}
              >
                <Icon size={20} strokeWidth={2} />
                {!isMinimized && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={`p-4 border-t border-border space-y-3 ${isMinimized ? 'flex flex-col items-center' : ''}`}>
          <Link href="/dashboard/profile">
            <div className={`flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition cursor-pointer ${isMinimized ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">U</span>
              </div>
              {!isMinimized && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </Link>

          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition w-full ${isMinimized ? 'justify-center' : ''}`}
            title={isMinimized ? 'Logout' : ''}
          >
            <LogOut size={20} strokeWidth={2} />
            {!isMinimized && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 z-40 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">EduConnect</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border space-y-3">
          <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition w-full"
          >
            <LogOut size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
