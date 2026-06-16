'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email');
        return;
      }
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-blue-900 overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl"
      />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Sign In</h1>
                <p className="text-white/70">Welcome back to EduConnect</p>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-sm font-semibold text-white/90 mb-3">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.edu"
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-sm font-semibold text-white/90 mb-3">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Sign in button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-60 backdrop-blur-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-8 space-y-3 text-center"
              >
                <p className="text-white/70 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-white font-semibold hover:text-white/90 transition-colors">
                    Sign up
                  </Link>
                </p>
                <p className="text-white/50 text-xs">
                  <Link href="#" className="hover:text-white/70 transition-colors">
                    Forgot password?
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="relative w-full max-w-sm aspect-square">
              {/* Glowing plant illustration using gradient shapes */}
              <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-2xl"
              >
                {/* Pot */}
                <defs>
                  <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(147, 51, 234, 0.6)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.4)', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="plantGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'rgba(168, 85, 247, 0.8)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(99, 102, 241, 0.9)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(147, 197, 253, 0.8)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Pot body */}
                <ellipse cx="150" cy="320" rx="90" ry="30" fill="url(#potGradient)" />
                <path d="M 60 320 Q 50 280 70 260 L 230 260 Q 250 280 240 320" fill="url(#potGradient)" opacity="0.8" />
                <ellipse cx="150" cy="260" rx="85" ry="25" fill="url(#potGradient)" opacity="0.6" />

                {/* Plants - Left cactus */}
                <ellipse cx="100" cy="200" rx="35" ry="70" fill="url(#plantGradient)" opacity="0.85" />
                <circle cx="75" cy="160" r="22" fill="url(#plantGradient)" opacity="0.9" />
                <circle cx="85" cy="120" r="18" fill="url(#plantGradient)" opacity="0.85" />

                {/* Plants - Center tall cactus */}
                <ellipse cx="150" cy="140" rx="28" ry="90" fill="url(#plantGradient)" opacity="0.9" />
                <circle cx="150" cy="50" r="25" fill="url(#plantGradient)" opacity="0.95" />
                <circle cx="130" cy="80" r="15" fill="url(#plantGradient)" opacity="0.8" />
                <circle cx="170" cy="75" r="15" fill="url(#plantGradient)" opacity="0.8" />

                {/* Plants - Right cactus */}
                <ellipse cx="200" cy="210" rx="32" ry="65" fill="url(#plantGradient)" opacity="0.85" />
                <circle cx="220" cy="165" r="20" fill="url(#plantGradient)" opacity="0.9" />
                <circle cx="215" cy="125" r="17" fill="url(#plantGradient)" opacity="0.85" />

                {/* Leaves/accents - Pink decorative leaves */}
                <path d="M 120 180 Q 100 170 110 150" stroke="rgba(236, 72, 153, 0.6)" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 180 190 Q 200 175 195 155" stroke="rgba(236, 72, 153, 0.6)" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 140 110 Q 125 95 135 75" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M 160 105 Q 175 95 170 75" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="5" fill="none" strokeLinecap="round" />

                {/* Glowing particles */}
                <circle cx="140" cy="60" r="3" fill="rgba(255, 255, 255, 0.8)" opacity="0.7" />
                <circle cx="160" cy="50" r="2" fill="rgba(255, 255, 255, 0.9)" opacity="0.6" />
                <circle cx="95" cy="140" r="2.5" fill="rgba(255, 255, 255, 0.8)" opacity="0.5" />
                <circle cx="210" cy="150" r="2" fill="rgba(255, 255, 255, 0.7)" opacity="0.6" />
              </svg>

              {/* Glow effect */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl -z-10"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile logo in corner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <span className="text-lg font-bold text-white">E</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
