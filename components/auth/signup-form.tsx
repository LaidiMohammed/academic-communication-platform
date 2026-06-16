'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, School, BookOpen, UserCheck, Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function SignupForm() {
  const [step, setStep] = useState(1);
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
    setError('');
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        setError('Please fill in all fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.school || !formData.level || !formData.role) {
        setError('Please fill in all fields');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name, formData.school, formData.level, formData.role);
      router.push('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-blue-900 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-2 rounded-full transition-all ${
                          s <= step ? 'bg-white w-6' : 'bg-white/30 w-6'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 text-sm">Step {step} of 3</span>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {step === 1 && 'Basic Information'}
                  {step === 2 && 'School Details'}
                  {step === 3 && 'Create Password'}
                </h1>
                <p className="text-white/70">
                  {step === 1 && 'Tell us who you are'}
                  {step === 2 && 'Select your school information'}
                  {step === 3 && 'Set up your account security'}
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm backdrop-blur-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1 - Basic Information */}
                {step === 1 && (
                  <>
                    {/* Full Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-3">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-3">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@school.edu"
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2 - School Details */}
                {step === 2 && (
                  <>
                    {/* School */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-3">School</label>
                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          placeholder="Central High School"
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                        />
                      </div>
                    </div>

                    {/* Level and Role - Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-white/90 mb-3">Level</label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                          <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 appearance-none"
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
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-white/90 mb-3">Role</label>
                        <div className="relative">
                          <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border-b-2 border-white/30 text-white focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15 appearance-none"
                          >
                            <option value="student" className="bg-gray-900 text-white">Student</option>
                            <option value="teacher" className="bg-gray-900 text-white">Teacher</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3 - Password */}
                {step === 3 && (
                  <>
                    {/* Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-3">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
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
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-white/90 mb-3">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-3 bg-white/10 border-b-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-all rounded-lg backdrop-blur-sm focus:bg-white/15"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <ChevronLeft size={20} />
                      Back
                    </button>
                  )}
                  {step < 3 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Links */}
              <div className="mt-8 text-center">
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-white font-semibold hover:text-white/90 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-2xl">
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
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile logo in corner */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <span className="text-lg font-bold text-white">E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
