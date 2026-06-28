'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const mascots = [
    { img: '/bendellamas-removebg-preview.png', bgText: 'LEADERSHIP', phrase: 'Leads with vision, inspires with action. Every team needs a captain.' },
    { img: '/bendellamas2-removebg-preview.png', bgText: 'STRATEGY', phrase: 'Always three moves ahead. Calculated, calm, and always in control.' },
    { img: '/bendellamas3-removebg-preview.png', bgText: 'RESILIENCE', phrase: 'Clutch when it counts. Pressure? That\'s just another challenge.' },
    { img: '/bendellamas4-removebg-preview.png', bgText: 'INNOVATION', phrase: 'Builds the future, one idea at a time. Innovation never sleeps.' },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % mascots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email || !password) { setError('Please fill in all fields'); setLoading(false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); setLoading(false); return; }
      await login(email, password);
      router.push('/dashboard');
    } catch { setError('Login failed. Please try again.'); setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0F172A] overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-[#111827] border border-blue-500/20 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="mb-8 flex items-center gap-4">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/20" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Welcome Back</h1>
                  <p className="text-gray-400">Sign in to continue your journey</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.edu" disabled={loading}
                      className="w-full pl-12 pr-4 py-3 bg-[#1E293B] border border-blue-500/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading}
                      className="w-full pl-12 pr-12 py-3 bg-[#1E293B] border border-blue-500/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60 hover:bg-blue-400 active:scale-95">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </motion.button>
              </form>

              <div className="mt-8 space-y-3 text-center">
                <p className="text-gray-400 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign up</Link>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Admin demo: <span className="text-blue-400">hamda.laidi.14@gmail.com</span> — any password
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-sm min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-[clamp(3rem,10vw,5rem)] font-black text-blue-500/5 leading-none whitespace-nowrap tracking-wide">
                      {mascots[current].bgText}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-3xl scale-150" />
                      <div className="w-[27rem] h-[27rem] relative flex items-center justify-center">
                        <img src={mascots[current].img} alt="Mascot" className="w-full h-full object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-xs mx-auto text-center font-light">
                      {mascots[current].phrase}
                    </p>
                    <div className="flex gap-2 mt-5">
                      {mascots.map((_, i) => (
                        <button key={i} onClick={() => setCurrent(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            i === current ? 'bg-blue-400 w-6' : 'bg-gray-600 hover:bg-gray-500'
                          }`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
