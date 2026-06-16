'use client';

import { LandingNavbar } from '@/components/landing-navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Zap, BarChart3, Lock, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  Transform Education Today
                </h1>
                <p className="text-xl text-blue-100">
                  Bendella: The unified platform for modern schools, connecting teachers, students, and parents in one seamless experience.
                </p>
              </div>

              <p className="text-lg text-blue-50">
                Start your journey towards collaborative learning
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition"
                >
                  Explore
                </Link>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                  Smart Classroom
                </div>
                <div className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                  Real-time Collaboration
                </div>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md h-96">
                {/* Illustration using SVG */}
                <svg
                  viewBox="0 0 300 400"
                  className="w-full h-full drop-shadow-2xl"
                >
                  <defs>
                    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.9)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(200, 200, 220, 0.8)', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  {/* Building */}
                  <rect x="40" y="80" width="220" height="240" fill="url(#buildingGradient)" rx="20" />

                  {/* Windows */}
                  <rect x="60" y="110" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="105" y="110" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="150" y="110" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="195" y="110" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />

                  <rect x="60" y="160" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="105" y="160" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="150" y="160" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="195" y="160" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />

                  <rect x="60" y="210" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="105" y="210" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="150" y="210" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />
                  <rect x="195" y="210" width="30" height="30" fill="rgba(59, 130, 246, 0.8)" rx="4" />

                  {/* Door */}
                  <rect x="130" y="280" width="40" height="50" fill="rgba(30, 60, 114, 0.8)" rx="2" />

                  {/* Flag */}
                  <rect x="240" y="70" width="4" height="40" fill="rgba(100, 100, 120, 0.8)" />
                  <path d="M 244 70 L 244 85 L 260 77 Z" fill="rgba(255, 200, 100, 0.9)" />

                  {/* Decorative dots */}
                  <circle cx="80" cy="50" r="3" fill="rgba(255, 255, 255, 0.6)" />
                  <circle cx="150" cy="40" r="2" fill="rgba(255, 255, 255, 0.5)" />
                  <circle cx="220" cy="55" r="3" fill="rgba(255, 255, 255, 0.4)" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Powerful Features for Modern Education
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Digital Learning',
                description: 'Access all lessons and materials in one organized platform',
              },
              {
                icon: Users,
                title: 'Collaboration',
                description: 'Students and teachers collaborate in real-time discussions',
              },
              {
                icon: Zap,
                title: 'Real-time Updates',
                description: 'Instant notifications for assignments and announcements',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track student progress with detailed performance metrics',
              },
              {
                icon: Lock,
                title: 'Secure',
                description: 'Enterprise-grade security for all school data',
              },
              {
                icon: Smartphone,
                title: 'Mobile Ready',
                description: 'Full access from any device, anywhere, anytime',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition group cursor-pointer"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/30 transition">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-100">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-white">Ready to Transform Your School?</h2>
            <p className="text-xl text-blue-100">
              Join hundreds of schools using Bendella to enhance their educational experience.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition transform hover:scale-105"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="#" className="hover:text-white transition">Docs</Link></li>
                <li><Link href="#" className="hover:text-white transition">Support</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-blue-100">
            <p>&copy; 2024 Bendella School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
