'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Check, QrCode, Shield, BookOpen, Star,
  ChevronRight, Calendar, Users, RefreshCw, Crown, Sparkles,
  Clock, AlertCircle, CheckCircle2, Download, Plus, X,
  GraduationCap, Filter,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';

/* ── QR Code display ── */
function MemberQRCode({ userId, name, email, level, subjects, sessionsLeft }: {
  userId: string; name: string; email: string; level: string; subjects: string[]; sessionsLeft: number;
}) {
  const qrData = JSON.stringify({ userId, name, email, level, subjects, sessionsLeft, ts: Date.now() });
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${name}-member-qr.png`;
      link.href = (canvas as HTMLCanvasElement).toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="p-4 rounded-2xl border-2 border-green-500/40 bg-green-500/5">
          <div ref={qrRef} className="w-48 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-xl">
            <QRCodeCanvas value={qrData} size={176} level="M" />
          </div>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg bg-green-500 text-white">
          <CheckCircle2 size={11} /> ACTIVE
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
        <p className="text-xs text-blue-400 font-semibold mt-1">Niveau: {level}</p>
        <p className="text-xs text-emerald-400 font-semibold">Séances restantes: {sessionsLeft}/4</p>
      </div>

      <button onClick={downloadQR}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition text-xs font-semibold"
      >
        <Download size={13} /> Save QR Code
      </button>
    </div>
  );
}

/* ── Subject tag ── */
function SubjectTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-red-400 transition">
          <X size={12} />
        </button>
      )}
    </span>
  );
}

/* ── Pricing ── */
function getSubjectPrice(levelId: string, subjectId: string): number {
  if (levelId === 'particulier') return 9000;
  if (['1am', '2am', '3am'].includes(levelId)) return 2500;
  if (levelId === '3as' && ['mathematics', 'physics', 'biology'].includes(subjectId)) return 4000;
  if (levelId === 'test') return 100;
  return 3000;
}
function getLevelBasePrice(levelId: string): number {
  if (levelId === 'particulier') return 9000;
  if (['1am', '2am', '3am'].includes(levelId)) return 2500;
  if (levelId === 'test') return 100;
  return 3000;
}

const LEVELS = [
  { id: '1am', label: '1AM', ar: 'السنة الأولى متوسط', color: 'from-green-500 to-teal-500', icon: '📚' },
  { id: '2am', label: '2AM', ar: 'السنة الثانية متوسط', color: 'from-emerald-500 to-cyan-500', icon: '📖' },
  { id: '3am', label: '3AM', ar: 'السنة الثالثة متوسط', color: 'from-teal-500 to-blue-500', icon: '📝' },
  { id: 'bem', label: 'BEM', ar: 'الرابعة متوسط', color: 'from-emerald-500 to-teal-500', icon: '🎓' },
  { id: '1as', label: '1AS', ar: 'السنة الأولى ثانوي', color: 'from-blue-500 to-cyan-500', icon: '📚' },
  { id: '2as', label: '2AS', ar: 'السنة الثانية ثانوي', color: 'from-violet-500 to-purple-500', icon: '📖' },
  { id: '3as', label: '3AS', ar: 'السنة الثالثة ثانوي', color: 'from-amber-500 to-orange-500', icon: '📝' },
  { id: 'bac', label: 'BAC', ar: 'شهادة البكالوريا', color: 'from-rose-500 to-red-500', icon: '🏆' },
  { id: 'particulier', label: 'خاص', ar: 'دروس خصوصية فردية', color: 'from-purple-500 to-pink-500', icon: '👤' },
  { id: 'test', label: 'Test', ar: 'دفع تجريبي', color: 'from-gray-500 to-slate-500', icon: '🧪' },
];

const ALL_SUBJECTS = [
  { id: 'mathematics', label: 'Mathematics', ar: 'الرياضيات', icon: '📐' },
  { id: 'physics', label: 'Physics', ar: 'العلوم الفيزيائية', icon: '⚡' },
  { id: 'chemistry', label: 'Chemistry', ar: 'الكيمياء', icon: '🧪' },
  { id: 'biology', label: 'Biology', ar: 'علوم الطبيعة والحياة', icon: '🧬' },
  { id: 'english', label: 'English', ar: 'الإنجليزية', icon: '📝' },
  { id: 'french', label: 'French', ar: 'اللغة الفرنسية', icon: '📖' },
  { id: 'arabic', label: 'Arabic', ar: 'اللغة العربية', icon: '📗' },
  { id: 'history', label: 'History', ar: 'التاريخ والجغرافيا', icon: '🏛️' },
  { id: 'islamic', label: 'Islamic Education', ar: 'التربية الإسلامية', icon: '☪️' },
  { id: 'civic', label: 'Civic Education', ar: 'التربية المدنية', icon: '🤝' },
];

/* ── Main Page ── */
export default function MembershipPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'plans' | 'subjects' | 'exists'>('plans');
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingMembership(true);
    const supabase = createClient();

    const fetchMembership = () =>
      supabase.from('memberships').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setMembership(data);
          setStep('exists');
        }
        setLoadingMembership(false);
      });

    fetchMembership();

    const channel = supabase
      .channel(`membership:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'memberships', filter: `user_id=eq.${user.id}` },
        () => { fetchMembership(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSelectLevel = (level: any) => {
    setSelectedLevel(level);
    setSelectedSubjects([]);
    setStep('subjects');
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handlePayment = async () => {
    if (selectedSubjects.length === 0) {
      alert('الرجاء اختيار مادة واحدة على الأقل');
      return;
    }
    if (!user) { alert('الرجاء تسجيل الدخول أولاً'); return; }

    setIsProcessing(true);
    try {
      const totalAmount = selectedSubjects.reduce((sum, s) => sum + getSubjectPrice(selectedLevel.id, s), 0);
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planId: selectedLevel.id,
          planTitle: `${selectedLevel.label} - ${selectedSubjects.length} matière(s)`,
          amount: totalAmount,
          isYearly: false,
          level: selectedLevel.label,
          subjects: selectedSubjects,
          subjectCount: selectedSubjects.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err: any) {
      alert('خطأ في الدفع: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
  });

  if (loadingMembership) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  /* ── Already has membership — dead code replaced by unified single return below ── */

  /* ── Level Selection — dead code replaced by unified single return below ── */

  const hasMembership = !!membership;
  const membershipSubjects: string[] = membership?.subjects || [];
  const sessionsLeft = hasMembership ? (membership.sessions_total || 4) - (membership.sessions_used || 0) : 0;
  const expiresAt = hasMembership && membership.expires_at ? new Date(membership.expires_at) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  /* ── Subject Selection + Payment ── */
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">

      {/* ── TOP: User state + QR code (always visible) ── */}
      <motion.div {...stagger(0)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-400" />
              <h3 className="font-bold text-foreground">{hasMembership ? 'Membership' : 'Profile'}</h3>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            {hasMembership ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-400">Active Subscription</p>
                  <p className="text-xs text-muted-foreground">Expires: {expiresAt?.toLocaleDateString('ar-DZ') || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400">No Active Membership</p>
                  <p className="text-xs text-muted-foreground">Subscribe below to get started</p>
                </div>
              </div>
            )}
            {hasMembership && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap size={13} /> Level</div>
                  <span className="font-semibold text-foreground">{membership.level || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Calendar size={13} /> Sessions</div>
                  <span className="font-semibold text-foreground">{sessionsLeft}/4 remaining</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock size={13} /> Days left</div>
                  <span className="font-semibold text-foreground">{daysLeft} days</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Session usage</span>
                    <span>{membership.sessions_used || 0} / {membership.sessions_total || 4}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((membership.sessions_used || 0) / (membership.sessions_total || 4)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 w-full">
              <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-400" />
              <h3 className="font-bold text-foreground">Membership QR Code</h3>
            </div>
            <p className="text-xs text-muted-foreground text-center w-full">
              Show this code to the admin to verify your membership.
            </p>
            <MemberQRCode
              userId={user?.id || 'unknown'}
              name={user?.name || 'Student'}
              email={user?.email || ''}
              level={hasMembership ? (membership.level || '') : ((user as any)?.level || '')}
              subjects={membershipSubjects}
              sessionsLeft={sessionsLeft}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Membership details (if member) ── */}
      {hasMembership && (
        <>
          {membershipSubjects.length > 0 && (
            <motion.div {...stagger(1)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" /> Your Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {membershipSubjects.map((s: string) => {
                  const subj = ALL_SUBJECTS.find(x => x.id === s);
                  return <SubjectTag key={s} label={subj?.ar || s} />;
                })}
              </div>
            </motion.div>
          )}
          <motion.div {...stagger(2)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield size={16} className="text-blue-400" /> Session Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { q: 'كم حصة شهرياً؟', a: 'تحصل على 4 حصص شهرياً. كل حصة مدتها ساعة مع أستاذ.' },
                { q: 'كيف يتم خصم الحصص؟', a: 'المشرف يمسح رمز QR الخاص بك في بداية كل حصة.' },
                { q: 'ماذا لو نفدت الحصص؟', a: 'يمكنك شراء حصص إضافية أو انتظار تجديد الشهر القادم.' },
                { q: 'متى تتجدد الحصص؟', a: 'الحصص تتجدد كل شهر في تاريخ اشتراكك.' },
              ].map((item) => (
                <div key={item.q} className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-sm font-semibold text-foreground mb-1">{item.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* ── Level selection (if not member) ── */}
      {!hasMembership && step === 'plans' && (
        <>
          <motion.div {...stagger(0)} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold mb-4">
              <CreditCard size={13} /> Subscription & Payment
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">Choose your level</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Select your level then choose subjects. Each month includes <strong>4 sessions</strong>.
            </p>
          </motion.div>
          <motion.div {...stagger(1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEVELS.map((level, i) => (
              <motion.div key={level.id} whileHover={{ y: -4, scale: 1.01 }}
                className="relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 flex flex-col gap-4 cursor-pointer hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                onClick={() => handleSelectLevel(level)}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl shadow-lg`}>{level.icon}</div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{level.label}</h3>
                    <p className="text-xs text-muted-foreground">{level.ar}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-foreground">{getLevelBasePrice(level.id).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">د.ج</span></span>
                  <span className="text-sm text-muted-foreground">/subject</span>
                </div>
                <ul className="space-y-1.5 flex-1">
                  <li className="flex items-start gap-2 text-sm"><Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" /><span className="text-foreground/80">4 sessions per month</span></li>
                  <li className="flex items-start gap-2 text-sm"><Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" /><span className="text-foreground/80">Choose any subject</span></li>
                  <li className="flex items-start gap-2 text-sm"><Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" /><span className="text-foreground/80">Free support &amp; resources</span></li>
                </ul>
                <button className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">Choose {level.label}</button>
              </motion.div>
            ))}
          </motion.div>
          <motion.div {...stagger(2)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Shield size={16} className="text-blue-400" /> Payment &amp; Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { q: 'كيف أدفع؟', a: 'ادفع عبر الإنترنت بـ Chargily Pay (EDAHABIA · CIB) أو في مكتب المدرسة (روي بيلير، وهران).' },
                { q: 'هل يمكنني الإلغاء؟', a: 'نعم — اتصل بالإدارة على 0661 45 77 97 قبل تاريخ الفاتورة القادم.' },
                { q: 'ماذا لو فاتني الدفع؟', a: 'سيتم تحويل حسابك إلى وضع المعاينة المجانية حتى تأكيد الدفع.' },
                { q: 'هل رمز QR آمن؟', a: 'نعم — كل رمز مرتبط بمعرف المستخدم الفريد وتاريخ انتهاء الصلاحية.' },
              ].map((item) => (
                <div key={item.q} className="p-4 bg-secondary/50 rounded-xl"><p className="text-sm font-semibold text-foreground mb-1">{item.q}</p><p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p></div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* ── Subject selection + payment (if not member + not plans step) ── */}
      {!hasMembership && step !== 'plans' && (
      <>
      <motion.div {...stagger(0)} className="text-center">
        <button
          onClick={() => setStep('plans')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronRight size={14} className="rotate-180" /> العودة إلى المستويات
        </button>
        <h1 className="text-3xl font-black text-foreground mb-2">اختر موادك الدراسية</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          المستوى: <strong>{selectedLevel?.label}</strong> — {getLevelBasePrice(selectedLevel.id).toLocaleString()} د.ج لكل مادة · 4 حصص شهرياً
        </p>
      </motion.div>

      <motion.div {...stagger(1)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
          <h3 className="font-bold text-foreground">المواد الدراسية</h3>
          <span className="text-xs text-muted-foreground">({selectedSubjects.length} مختارة)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ALL_SUBJECTS.map((subject, i) => {
            const isSelected = selectedSubjects.includes(subject.id);
            return (
              <motion.button
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSubject(subject.id)}
                className={`relative flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/15'
                    : 'bg-card/60 border-border/40 text-muted-foreground hover:border-blue-500/30 hover:text-foreground hover:bg-blue-500/5 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
                <span className="text-2xl">{subject.icon}</span>
                <span className="text-center leading-tight text-xs sm:text-sm">{subject.ar}</span>
                {isSelected && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedSubjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-2xl"
            >
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <CheckCircle2 size={13} className="text-blue-400" />
                المواد المختارة:
              </span>
              {selectedSubjects.map((id, i) => {
                const subj = ALL_SUBJECTS.find(s => s.id === id);
                return (
                  <motion.span
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <SubjectTag
                      label={`${subj?.icon || ''} ${subj?.ar || id}`}
                      onRemove={() => toggleSubject(id)}
                    />
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">المستوى</span>
            <span className="font-bold text-foreground">{selectedLevel?.label}</span>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">تفاصيل المواد</span>
            {selectedSubjects.map((sid) => {
              const subj = ALL_SUBJECTS.find(s => s.id === sid);
              const sp = getSubjectPrice(selectedLevel.id, sid);
              return (
                <div key={sid} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">{subj?.icon} {subj?.ar || sid}</span>
                  <span className="font-semibold text-foreground">{sp.toLocaleString()} د.ج</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">عدد المواد</span>
            <span className="font-bold text-foreground">{selectedSubjects.length}</span>
          </div>
          <div className="relative h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">الإجمالي</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {selectedSubjects.reduce((s, id) => s + getSubjectPrice(selectedLevel.id, id), 0).toLocaleString()} <span className="text-base font-normal">د.ج</span>
            </span>
          </div>
        </motion.div>

        <motion.div layout className="flex flex-wrap items-center justify-center gap-3 p-4 bg-card/30 rounded-2xl border border-border/30">
          <span className="text-xs text-muted-foreground font-semibold">طرق الدفع:</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-border/30 rounded-lg text-xs font-bold text-foreground">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            EDAHABIA
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-border/30 rounded-lg text-xs font-bold text-foreground">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            CIB
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-bold text-purple-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Chargily Secure
          </span>
        </motion.div>

        <motion.div layout className="relative">
          <button
            onClick={handlePayment}
            disabled={isProcessing || selectedSubjects.length === 0}
            className="relative w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>ادفع {selectedSubjects.reduce((s, id) => s + getSubjectPrice(selectedLevel.id, id), 0).toLocaleString()} د.ج</span>
                <span className="px-2 py-0.5 bg-white/15 rounded-lg text-xs">{selectedSubjects.length} مادة</span>
              </>
            )}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1"
        >
          <Shield size={12} className="text-green-400" />
          الدفع آمن ومشفر عبر Chargily Pay — EDAHABIA · CIB
        </motion.p>
      </motion.div>

      <motion.div {...stagger(2)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Star size={16} className="text-amber-400" /> ماذا يشمل الاشتراك؟
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '📅', q: '4 حصص شهرياً', a: 'كل حصة مدتها ساعة مع أستاذ مختص في المواد التي اخترتها.' },
            { icon: '📚', q: 'اختر موادك', a: 'اختر أي مادة أو جميع المواد المتاحة لمستوياتك. يمكنك الإضافة لاحقاً.' },
            { icon: '📱', q: 'تسجيل الدخول بـ QR', a: 'يقوم المشرف بمسح رمز QR الخاص بك عند كل حصة لتتبع الحضور.' },
            { icon: '📄', q: 'المواد مجاناً', a: 'احصل على دروس، تمارين، ومواضيع امتحانات سابقة لموادك.' },
          ].map((item, i) => (
            <motion.div
              key={item.q}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-4 bg-secondary/50 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-default border border-transparent hover:border-blue-500/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm font-bold text-foreground">{item.q}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mr-7">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
}
