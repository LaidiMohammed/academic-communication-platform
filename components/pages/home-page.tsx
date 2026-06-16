'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Video,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export function HomePage() {
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      icon: MessageSquare,
      title: 'Messages',
      value: '324',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Users,
      title: 'Groups',
      value: '12',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Video,
      title: 'Meetings',
      value: '8',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: BookOpen,
      title: 'Lessons',
      value: '42',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const quickLinks = [
    {
      label: 'Go to Chat',
      href: '/dashboard/chat',
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Join Groups',
      href: '/dashboard/groups',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Schedule Meeting',
      href: '/dashboard/meet',
      icon: Video,
      color: 'from-red-500 to-red-600',
    },
    {
      label: 'Browse Lessons',
      href: '/dashboard/lessons',
      icon: BookOpen,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              {greeting},{' '}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              >
                {user?.name || 'Student'}!
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-muted-foreground max-w-2xl"
            >
              Your personalized learning dashboard awaits. Connect with peers, engage in lessons, and collaborate seamlessly.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                  className="group relative"
                >
                  <div
                    className={`${stat.bgColor} rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer overflow-hidden`}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Animated background */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${stat.bgColor}`}
                    />

                    <div className="relative">
                      <div
                        className={`${stat.color} mb-4 inline-block p-3 rounded-lg bg-white dark:bg-slate-800`}
                      >
                        <Icon size={24} strokeWidth={2} />
                      </div>
                      <h3 className="text-muted-foreground text-sm font-medium mb-2">
                        {stat.title}
                      </h3>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-2xl font-bold text-foreground mb-6"
            >
              Quick Access
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                  >
                    <Link href={link.href}>
                      <div
                        className={`group relative h-full bg-gradient-to-br ${link.color} rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden`}
                      >
                        {/* Animated overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />

                        <div className="relative">
                          <div className="mb-4 inline-block p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <Icon size={24} strokeWidth={2} />
                          </div>
                          <h3 className="text-lg font-bold mb-2">{link.label}</h3>
                          <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                            <span className="text-sm">Explore</span>
                            <ArrowRight
                              size={16}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* AI Assistant CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-lg hover:border-accent/50">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Need Help?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Our AI assistant is available 24/7 to help you with your studies, assignments, and learning journey.
              </p>
              <Link href="/dashboard/ai">
                <button className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95">
                  Start Chat with AI
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-6"
          >
            Recent Activity
          </motion.h2>
          <div className="space-y-3">
            {[
              'You joined the "Advanced Math" group',
              'New lesson: "Calculus Fundamentals" is available',
              'Meeting scheduled for tomorrow at 2 PM',
              'You received 5 new messages',
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-lg p-4 flex items-start gap-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground">{activity}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
