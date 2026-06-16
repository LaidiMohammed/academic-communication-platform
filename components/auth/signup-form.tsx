'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, School, BookOpen, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    school: '',
    level: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password || !formData.name || !formData.school || !formData.level) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      await signup(formData.email, formData.password, formData.name, formData.school, formData.level, formData.role);
      router.push('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
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

      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Create Account</h1>
                <p className="text-white/70 text-sm md:text-base">Join EduConnect and start collaborating</p>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-xs md:text-sm backdrop-blur-sm flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-xs font-semibold text-white/90 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/10 border-b border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm"
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-xs font-semibold text-white/90 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@school.edu"
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/10 border-b border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm"
                    />
                  </div>
                </motion.div>

                {/* School */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-xs font-semibold text-white/90 mb-2">School</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="Central High School"
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/10 border-b border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm"
                    />
                  </div>
                </motion.div>

                {/* Level and Role - Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="group"
                  >
                    <label className="block text-xs font-semibold text-white/90 mb-2">Level</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/10 border-b border-white/30 text-white focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm appearance-none"
                      >
                        <option value="" className="bg-gray-900 text-white">Select level</option>
                        <option value="CEM-1" className="bg-gray-900 text-white">CEM 1</option>
                        <option value="CEM-2" className="bg-gray-900 text-white">CEM 2</option>
                        <option value="CEM-3" className="bg-gray-900 text-white">CEM 3</option>
                        <option value="Lycée-1" className="bg-gray-900 text-white">Lycée 1</option>
                        <option value="Lycée-2" className="bg-gray-900 text-white">Lycée 2</option>
                        <option value="Lycée-3" className="bg-gray-900 text-white">Lycée 3</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="group"
                  >
                    <label className="block text-xs font-semibold text-white/90 mb-2">Role</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/10 border-b border-white/30 text-white focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm appearance-none"
                      >
                        <option value="student" className="bg-gray-900 text-white">Student</option>
                        <option value="teacher" className="bg-gray-900 text-white">Teacher</option>
                      </select>
                    </div>
                  </motion.div>
                </div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-xs font-semibold text-white/90 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/10 border-b border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="group"
                >
                  <label className="block text-xs font-semibold text-white/90 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/10 border-b border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                {/* Sign up button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.6 }}
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-60 backdrop-blur-sm text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </form>

              {/* Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-6 text-center"
              >
                <p className="text-white/70 text-xs md:text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-white font-semibold hover:text-white/90 transition-colors">
                    Sign in
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
              {/* Bookshelf/Education illustration using gradient shapes */}
              <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-2xl"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="shelfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(168, 85, 247, 0.5)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="bookGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'rgba(236, 72, 153, 0.8)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(168, 85, 247, 0.9)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(99, 102, 241, 0.8)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Bookshelf shelves */}
                <rect x="40" y="80" width="220" height="12" fill="url(#shelfGradient)" rx="4" />
                <rect x="40" y="160" width="220" height="12" fill="url(#shelfGradient)" rx="4" />
                <rect x="40" y="240" width="220" height="12" fill="url(#shelfGradient)" rx="4" />
                <rect x="40" y="320" width="220" height="12" fill="url(#shelfGradient)" rx="4" />

                {/* Books on shelves - Top shelf */}
                <rect x="50" y="50" width="22" height="35" fill="url(#bookGradient)" opacity="0.9" rx="2" />
                <rect x="78" y="55" width="20" height="30" fill="url(#bookGradient)" opacity="0.85" rx="2" />
                <rect x="104" y="52" width="24" height="33" fill="url(#bookGradient)" opacity="0.9" rx="2" />
                <rect x="134" y="48" width="20" height="37" fill="url(#bookGradient)" opacity="0.88" rx="2" />
                <rect x="160" y="53" width="22" height="32" fill="url(#bookGradient)" opacity="0.87" rx="2" />
                <rect x="188" y="50" width="20" height="35" fill="url(#bookGradient)" opacity="0.89" rx="2" />
                <rect x="214" y="54" width="22" height="31" fill="url(#bookGradient)" opacity="0.86" rx="2" />

                {/* Books on shelves - Second shelf */}
                <rect x="50" y="130" width="22" height="35" fill="url(#bookGradient)" opacity="0.88" rx="2" />
                <rect x="78" y="135" width="20" height="30" fill="url(#bookGradient)" opacity="0.84" rx="2" />
                <rect x="104" y="132" width="24" height="33" fill="url(#bookGradient)" opacity="0.89" rx="2" />
                <rect x="134" y="128" width="20" height="37" fill="url(#bookGradient)" opacity="0.87" rx="2" />
                <rect x="160" y="133" width="22" height="32" fill="url(#bookGradient)" opacity="0.86" rx="2" />
                <rect x="188" y="130" width="20" height="35" fill="url(#bookGradient)" opacity="0.88" rx="2" />
                <rect x="214" y="134" width="22" height="31" fill="url(#bookGradient)" opacity="0.85" rx="2" />

                {/* Books on shelves - Third shelf */}
                <rect x="50" y="210" width="22" height="35" fill="url(#bookGradient)" opacity="0.87" rx="2" />
                <rect x="78" y="215" width="20" height="30" fill="url(#bookGradient)" opacity="0.83" rx="2" />
                <rect x="104" y="212" width="24" height="33" fill="url(#bookGradient)" opacity="0.88" rx="2" />
                <rect x="134" y="208" width="20" height="37" fill="url(#bookGradient)" opacity="0.86" rx="2" />
                <rect x="160" y="213" width="22" height="32" fill="url(#bookGradient)" opacity="0.85" rx="2" />
                <rect x="188" y="210" width="20" height="35" fill="url(#bookGradient)" opacity="0.87" rx="2" />
                <rect x="214" y="214" width="22" height="31" fill="url(#bookGradient)" opacity="0.84" rx="2" />

                {/* Books on shelves - Bottom shelf */}
                <rect x="50" y="290" width="22" height="35" fill="url(#bookGradient)" opacity="0.86" rx="2" />
                <rect x="78" y="295" width="20" height="30" fill="url(#bookGradient)" opacity="0.82" rx="2" />
                <rect x="104" y="292" width="24" height="33" fill="url(#bookGradient)" opacity="0.87" rx="2" />
                <rect x="134" y="288" width="20" height="37" fill="url(#bookGradient)" opacity="0.85" rx="2" />
                <rect x="160" y="293" width="22" height="32" fill="url(#bookGradient)" opacity="0.84" rx="2" />
                <rect x="188" y="290" width="20" height="35" fill="url(#bookGradient)" opacity="0.86" rx="2" />
                <rect x="214" y="294" width="22" height="31" fill="url(#bookGradient)" opacity="0.83" rx="2" />

                {/* Decorative elements - Stars/sparkles */}
                <circle cx="120" cy="30" r="3" fill="rgba(255, 255, 255, 0.8)" opacity="0.6" />
                <circle cx="180" cy="25" r="2.5" fill="rgba(255, 255, 255, 0.9)" opacity="0.5" />
                <circle cx="70" cy="35" r="2" fill="rgba(255, 255, 255, 0.7)" opacity="0.4" />
                <circle cx="240" cy="40" r="2.5" fill="rgba(255, 255, 255, 0.8)" opacity="0.5" />
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
