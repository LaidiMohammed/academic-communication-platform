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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pb-12 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-32 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="mb-12"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full mb-4 origin-left"
              />
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-4">
                {greeting},{' '}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent inline-block"
                >
                  {user?.name || 'Student'}
                </motion.span>
                <motion.span
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
                  className="inline-block ml-2"
                >
                  👋
                </motion.span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
              >
                Welcome back! Your personalized learning dashboard is ready. Connect with peers, engage in lessons, and unlock your full potential through seamless collaboration.
              </motion.p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.8 + index * 0.12,
                      duration: 0.6,
                      ease: 'easeOut',
                      type: 'spring',
                      stiffness: 100,
                    }}
                    whileHover={{ scale: 1.08, y: -5 }}
                    className="group relative"
                  >
                    <motion.div
                      className={`${stat.bgColor} rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-2xl cursor-pointer overflow-hidden`}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Animated background overlay */}
                      <motion.div
                        animate={{
                          opacity: hoveredCard === index ? 0.2 : 0,
                        }}
                        className={`absolute inset-0 ${stat.bgColor}`}
                      />

                      <div className="relative">
                        <motion.div
                          animate={{
                            rotate: hoveredCard === index ? 12 : 0,
                            scale: hoveredCard === index ? 1.15 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          className={`${stat.color} mb-4 inline-block p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg`}
                        >
                          <Icon size={28} strokeWidth={2} />
                        </motion.div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">
                          {stat.title}
                        </h3>
                        <motion.p
                          animate={{ scale: hoveredCard === index ? 1.1 : 1 }}
                          className="text-3xl font-bold text-foreground"
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="mb-12">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-3xl font-bold text-foreground mb-8"
              >
                Quick Access
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 1.3 + index * 0.15,
                        duration: 0.6,
                        ease: 'easeOut',
                      }}
                      whileHover={{ scale: 1.05, y: -10 }}
                    >
                      <Link href={link.href}>
                        <motion.div
                          className={`group relative h-full bg-gradient-to-br ${link.color} rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-2xl active:scale-95 overflow-hidden cursor-pointer`}
                          whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                        >
                          {/* Animated shine effect */}
                          <motion.div
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />

                          <div className="relative">
                            <motion.div
                              animate={{
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="mb-4 inline-block p-3 rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"
                            >
                              <Icon size={28} strokeWidth={2} />
                            </motion.div>
                            <h3 className="text-lg font-bold mb-2">{link.label}</h3>
                            <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                              <span className="text-sm">Explore</span>
                              <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ArrowRight size={16} />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:border-accent/50 overflow-hidden relative">
                {/* Background animation */}
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',
                      'radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',
                      'radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute inset-0 pointer-events-none"
                />

                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="inline-block p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4"
                  >
                    <Sparkles className="text-primary" size={32} />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.6 }}
                    className="text-2xl font-bold text-foreground mb-2"
                  >
                    Need Help?
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.1, duration: 0.6 }}
                    className="text-muted-foreground mb-6 max-w-md mx-auto"
                  >
                    Our AI assistant is available 24/7 to help you with your studies, assignments, and learning journey.
                  </motion.p>
                  <Link href="/dashboard/ai">
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.2, duration: 0.6 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all"
                    >
                      Start Chat with AI
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-3xl font-bold text-foreground mb-8"
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
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.12,
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  viewport={{ once: true, margin: '-50px' }}
                  whileHover={{ x: 10, paddingLeft: 16 }}
                  className="bg-card border border-border rounded-lg p-4 flex items-start gap-4 hover:bg-secondary/50 transition-all cursor-pointer"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: index * 0.15, duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                    className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"
                  />
                  <p className="text-foreground">{activity}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
