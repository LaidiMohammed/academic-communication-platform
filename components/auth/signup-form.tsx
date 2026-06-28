'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, School, BookOpen, UserCheck, Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight, Calendar, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '', sex: '', email: '', password: '',
    level: '', specialty: '', school: '', role: 'student',
  });
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verified, setVerified] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { signup } = useAuth();
  const router = useRouter();

  const mascots = [
    { img: '/bendellamas-removebg-preview.png', bgText: 'LEARNING', phrase: 'Create your account and unlock a world of collaborative learning.' },
    { img: '/bendellamas2-removebg-preview.png', bgText: 'CONNECTION', phrase: 'Real-time chat, study groups, and shared resources at your fingertips.' },
    { img: '/bendellamas3-removebg-preview.png', bgText: 'SUCCESS', phrase: 'Smart scheduling, group projects, and tools built for student success.' },
    { img: '/bendellamas4-removebg-preview.png', bgText: 'COMMUNITY', phrase: 'Free to join. Connect, learn, and grow with EduConnect.' },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % mascots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.name || !formData.age || !formData.sex || !formData.email || !formData.password) { setError('Please fill in all fields'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email'); return false; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    } else if (currentStep === 2) {
      if (!formData.level || !formData.specialty || !formData.school || !formData.role) { setError('Please fill in all fields'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };
  const handleBack = () => { setStep(step - 1); setError(''); };

  const handleCodeChange = (i: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    setError('');
  };

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      const fullCode = code.join('');
      if (fullCode.length !== 6) { setError('Please enter the 6-digit code'); return; }
      setVerified(true);
      setLoading(true);
      try {
        await signup(formData.email, formData.password, formData.name, formData.school, formData.level, formData.role);
        router.push('/dashboard');
      } catch (e: any) { setError(e?.message || 'Verification failed. Please try again.'); setLoading(false); }
    }
  };

  return (
    <div className="h-screen bg-[#0F172A] overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-[#111827] border border-blue-500/20 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-blue-400 w-5' : 'bg-gray-600 w-5'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-xs">Step {step} of 3</span>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/20" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-0.5">
                    {step === 1 && 'Personal Info'}
                    {step === 2 && 'School Details'}
                    {step === 3 && 'Email Verification'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {step === 1 && 'Tell us about yourself'}
                    {step === 2 && 'Select your education information'}
                    {step === 3 && 'Enter the 6-digit code sent to your email'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="group">
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                          <input type="text" name="name" value={formData.name} onChange={handleChange}
                            placeholder="John Doe" disabled={loading}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group">
                          <label className="block text-xs font-semibold text-gray-300 mb-2">Age</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input type="number" name="age" value={formData.age} onChange={handleChange}
                              placeholder="18" min="10" max="99" disabled={loading}
                              className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-gray-300 mb-2">Sex</label>
                          <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <select name="sex" value={formData.sex} onChange={handleChange} disabled={loading}
                              className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white focus:outline-none focus:border-blue-400 transition-all rounded-xl appearance-none">
                              <option value="" className="bg-[#111827]">Select</option>
                              <option value="male" className="bg-[#111827]">Male</option>
                              <option value="female" className="bg-[#111827]">Female</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                          <input type="email" name="email" value={formData.email} onChange={handleChange}
                            placeholder="you@school.edu" disabled={loading}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                            onChange={handleChange} placeholder="At least 6 characters" disabled={loading}
                            className="w-full pl-9 pr-9 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="group">
                        <label className="block text-xs font-semibold text-gray-300 mb-2">School</label>
                        <div className="relative">
                          <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                          <input type="text" name="school" value={formData.school} onChange={handleChange}
                            placeholder="Central High School" disabled={loading}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 transition-all rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group">
                          <label className="block text-xs font-semibold text-gray-300 mb-2">Level</label>
                          <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <select name="level" value={formData.level} onChange={handleChange} disabled={loading}
                              className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white focus:outline-none focus:border-blue-400 transition-all rounded-xl appearance-none">
                              <option value="" className="bg-[#111827]">Select level</option>
                              {['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].map(l => (
                                <option key={l} value={l} className="bg-[#111827]">{l}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-gray-300 mb-2">Specialty</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <select name="specialty" value={formData.specialty} onChange={handleChange} disabled={loading}
                              className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white focus:outline-none focus:border-blue-400 transition-all rounded-xl appearance-none">
                              <option value="" className="bg-[#111827]">Select specialty</option>
                              {['Science','Mathematics','Literature','Languages','Arts','Technology'].map(s => (
                                <option key={s} value={s} className="bg-[#111827]">{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Role</label>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          <select name="role" value={formData.role} onChange={handleChange} disabled={loading}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-blue-500/20 text-sm text-white focus:outline-none focus:border-blue-400 transition-all rounded-xl appearance-none">
                            <option value="student" className="bg-[#111827]">Student</option>
                            <option value="teacher" className="bg-[#111827]">Teacher</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <div className="text-center">
                        <Mail className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs mb-1">Verification code sent to</p>
                        <p className="text-blue-400 font-semibold text-sm">{formData.email}</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        {code.map((digit, i) => (
                          <input key={i} ref={el => { codeRefs.current[i] = el; }} type="text" maxLength={1}
                            value={digit} onChange={e => handleCodeChange(i, e.target.value)}
                            onKeyDown={e => handleCodeKeyDown(i, e)}
                            className="w-10 h-12 text-center text-lg font-bold text-white bg-[#1E293B] border border-blue-500/20 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all"
                          />
                        ))}
                      </div>
                      <p className="text-center text-gray-500 text-[10px]">Didn't receive the code? <button type="button" className="text-blue-400 hover:text-blue-300">Resend</button></p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mt-5 pt-4 border-t border-blue-500/20">
                  {step > 1 && (
                    <button type="button" onClick={handleBack} disabled={loading}
                      className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#243447] text-white font-semibold text-sm rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1.5">
                      <ChevronLeft size={16} /> Back
                    </button>
                  )}
                  {step < 3 && (
                    <button type="button" onClick={handleNext} disabled={loading}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-60 flex items-center justify-center gap-1.5">
                      Next <ChevronRight size={16} />
                    </button>
                  )}
                  {step === 3 && (
                    <button type="submit" disabled={loading || code.join('').length !== 6}
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-60">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : 'Verify & Create Account'}
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-5 text-center">
                <p className="text-gray-400 text-xs">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign in</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Illustration */}
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
