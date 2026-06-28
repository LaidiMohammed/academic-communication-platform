'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, Video, BookOpen, Sparkles, ArrowRight,
  GraduationCap, BarChart3, TrendingUp, Clock, Award, ChevronRight,
  School, Target, Flame, Bell, Star, MapPin, Phone, Mail, Globe,
  CheckCircle2, Zap, Shield, Heart, Trophy, BookMarked, Microscope,
  Calculator, Languages, Music, Palette, Dumbbell, Calendar, FileText,
  Activity, Cpu, Layers, BrainCircuit, Atom, Wifi, Lock, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

/* ═══════════════════════════════════════════════
   ANIMATED MESH GRADIENT BACKGROUND
═══════════════════════════════════════════════ */
function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.15, r: 0.38, color: '59,130,246', speed: 0.0003, ox: 0.06, oy: 0.05 },
      { x: 0.75, y: 0.25, r: 0.32, color: '6,182,212', speed: 0.00025, ox: -0.07, oy: 0.06 },
      { x: 0.5, y: 0.7, r: 0.28, color: '139,92,246', speed: 0.0004, ox: 0.05, oy: -0.08 },
      { x: 0.85, y: 0.75, r: 0.22, color: '99,102,241', speed: 0.00035, ox: -0.06, oy: 0.04 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        const cx = (orb.x + Math.sin(t * orb.speed * 1000) * orb.ox) * canvas.width;
        const cy = (orb.y + Math.cos(t * orb.speed * 1000) * orb.oy) * canvas.height;
        const radius = orb.r * Math.max(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${orb.color},0.12)`);
        grad.addColorStop(0.5, `rgba(${orb.color},0.05)`);
        grad.addColorStop(1, `rgba(${orb.color},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}

/* ═══════════════════════════════════════════════
   TILT CARD (3D hover without Three.js)
═══════════════════════════════════════════════ */
function TiltCard({ children, className = '', intensity = 10 }: { children: React.ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 30 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 30 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rotX.set(-y * intensity);
    rotY.set(x * intensity);
  }, [rotX, rotY, intensity]);

  const onLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════ */
function Counter({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let start = 0;
        const frames = 60;
        const inc = to / frames;
        const t = setInterval(() => {
          start += inc;
          if (start >= to) { setVal(to); clearInterval(t); }
          else setVal(parseFloat(start.toFixed(decimals)));
        }, 1000 / frames);
      }
    }, { threshold: 0.5 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [to, decimals]);

  return <span ref={ref}>{decimals ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════
   GLOWING TAG
═══════════════════════════════════════════════ */
function GlowTag({ icon: Icon, label, hue }: { icon: any; label: string; hue: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${hue}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════ */
function SectionHead({ icon: Icon, title, color = 'text-blue-400', bg = 'bg-blue-500/15' }: { icon: any; title: string; color?: string; bg?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className={color} />
      </div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export function HomePage() {
  const { user } = useAuth();
  const h = new Date().getHours();
  const greeting = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const [activeTab, setActiveTab] = useState<'activity' | 'announcements'>('activity');

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as any },
  });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <MeshBackground />

      {/* Fine grid texture */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative px-4 sm:px-6 lg:px-8 pb-20 pt-5 max-w-6xl mx-auto space-y-8">

        {/* ════════════════════════════
            HERO SECTION
        ════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <TiltCard
            intensity={6}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.08]"
          >
            {/* layered glass */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[#0f172a]/70 to-cyan-500/15 backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

            {/* noise grain */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            {/* animated accent blobs */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"
            />

            <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">

              {/* LEFT: text content */}
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-[2px] w-14 bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent rounded-full origin-left"
                  />
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-bold text-blue-400 uppercase tracking-widest"
                  >
                    {greeting}
                  </motion.span>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.7 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.05] tracking-tight"
                >
                  Welcome back,{' '}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 40%, #818cf8 80%)' }}
                  >
                    {firstName}
                  </span>
                  <span className="ml-2">👋</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[15px] text-muted-foreground leading-relaxed max-w-lg"
                >
                  Your academic universe at <strong className="text-foreground font-semibold">Bendella School</strong> is
                  fully charged. Dive into lessons, collaborate with peers, and let AI supercharge your studies.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2"
                >
                  <GlowTag icon={CheckCircle2} label="Term 2 · Active" hue="bg-emerald-500/10 border-emerald-500/25 text-emerald-400" />
                  <GlowTag icon={Calendar} label="June 2026" hue="bg-blue-500/10 border-blue-500/25 text-blue-400" />
                  <GlowTag icon={Trophy} label="Top 15% Class" hue="bg-amber-500/10 border-amber-500/25 text-amber-400" />
                  <GlowTag icon={Wifi} label="Online" hue="bg-green-500/10 border-green-500/25 text-green-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-3 pt-1"
                >
                  <Link
                    href="/dashboard/lessons"
                    className="group inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
                  >
                    Browse Lessons
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/dashboard/ai"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-foreground transition-all duration-300 backdrop-blur-sm"
                  >
                    <Sparkles size={15} className="text-violet-400" /> AI Tutor
                  </Link>
                </motion.div>
              </div>

              {/* RIGHT: floating school badge */}
              <div className="hidden lg:flex flex-col items-center gap-3">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="w-48 h-48 rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl flex flex-col items-center justify-center gap-3 shadow-2xl">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
                    >
                      <GraduationCap size={38} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black text-foreground tracking-tight">BENDELLA</p>
                      <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">School of Excellence</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  {/* orbiting dot */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                  </motion.div>
                </motion.div>
                <p className="text-[11px] text-muted-foreground/60 text-center font-medium">Est. 1985 · Algeria</p>
              </div>
            </div>
          </TiltCard>
        </motion.section>

        {/* ════════════════════════════
            STATS STRIP
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Students', value: 2847, suffix: '', decimals: 0, icon: Users, from: '#3b82f6', to: '#06b6d4', glow: 'shadow-blue-500/20' },
              { label: 'Lessons Online', value: 1203, suffix: '', decimals: 0, icon: BookOpen, from: '#06b6d4', to: '#818cf8', glow: 'shadow-cyan-500/20' },
              { label: 'Study Hours', value: 48290, suffix: '', decimals: 0, icon: Clock, from: '#8b5cf6', to: '#ec4899', glow: 'shadow-violet-500/20' },
              { label: 'Class Average', value: 15.8, suffix: '/20', decimals: 1, icon: TrendingUp, from: '#10b981', to: '#06b6d4', glow: 'shadow-emerald-500/20' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} {...stagger(i)}>
                  <TiltCard intensity={8} className="h-full">
                    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-xl p-5 h-full group hover:border-white/[0.12] transition-all duration-300 shadow-xl ${s.glow}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

                      {/* gradient icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ background: `linear-gradient(135deg, ${s.from}33, ${s.to}22)`, border: `1px solid ${s.from}30` }}
                      >
                        <Icon size={18} style={{ color: s.from }} />
                      </div>

                      <p className="text-2xl md:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                        <Counter to={s.value} decimals={s.decimals} suffix={s.suffix} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>

                      {/* bottom accent line */}
                      <div
                        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
                        style={{ background: `linear-gradient(90deg, ${s.from}, ${s.to})` }}
                      />
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════
            SCHOOL INFO + MISSION (2 col)
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <SectionHead icon={School} title="About Bendella School" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Info card */}
            <TiltCard intensity={5} className="h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-card/40 backdrop-blur-xl p-6">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                    <h3 className="font-bold text-foreground">School Information</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: MapPin, label: 'Address', value: 'Rue Belair 31000, Oran, Algeria' },
                      { icon: Phone, label: 'Phone', value: '0661 45 77 97' },
                      { icon: Mail, label: 'Email', value: 'contact@bendella-school.dz' },
                      { icon: Globe, label: 'Website', value: 'www.bendella-school.dz' },
                      { icon: Clock, label: 'Hours', value: 'Sun – Thu: 8:00 AM – 5:00 PM' },
                      { icon: Users, label: 'Enrollment', value: '3,200+ students · 180+ staff' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                            <Icon size={13} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wide">{item.label}</p>
                            <p className="text-sm text-foreground font-medium mt-0.5">{item.value}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* ── MAP CARD ── */}
            <TiltCard intensity={5} className="h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-card/40 backdrop-blur-xl">
                {/* Map embed */}
                <div className="relative w-full h-44 overflow-hidden">
                  <iframe
                    src="https://maps.google.com/maps?q=Rue+Belair+31000+Oran+Algeria&output=embed&z=15&hl=en"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bendella School Location"
                  />
                  {/* overlay gradient bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
                </div>

                {/* Info below map */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-5 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                    <h3 className="font-bold text-foreground text-sm">Find Us</h3>
                  </div>

                  <a
                    href="https://maps.app.goo.gl/HkXD5AHY8AKgd2jZ7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 group p-2.5 rounded-xl hover:bg-blue-500/8 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <MapPin size={12} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wide">Address</p>
                      <p className="text-xs text-foreground font-semibold leading-snug group-hover:text-blue-400 transition-colors">
                        Rue Belair 31000, Oran 🇩🇿
                      </p>
                      <p className="text-[10px] text-blue-400/70 mt-0.5 underline underline-offset-2">Open in Google Maps ↗</p>
                    </div>
                  </a>

                  <a
                    href="tel:0661457797"
                    className="flex items-center gap-2.5 group p-2.5 rounded-xl hover:bg-green-500/8 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                      <Phone size={12} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wide">Phone</p>
                      <p className="text-xs text-foreground font-semibold group-hover:text-green-400 transition-colors">0661 45 77 97</p>
                    </div>
                  </a>

                  <a
                    href="mailto:contact@bendella-school.dz"
                    className="flex items-center gap-2.5 group p-2.5 rounded-xl hover:bg-violet-500/8 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                      <Mail size={12} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wide">Email</p>
                      <p className="text-xs text-foreground font-semibold group-hover:text-violet-400 transition-colors">contact@bendella-school.dz</p>
                    </div>
                  </a>
                </div>
              </div>
            </TiltCard>

            {/* Mission & Values */}
            <TiltCard intensity={5} className="h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-card/40 backdrop-blur-xl p-6">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 rounded-full bg-gradient-to-b from-violet-400 to-pink-400" />
                    <h3 className="font-bold text-foreground">Our Mission & Values</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Bendella School nurtures tomorrow's leaders through academic excellence, moral
                    education, and innovative learning — rooted in Algerian heritage and open to the world.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: Shield, label: 'Academic Excellence', desc: 'Rigorous national curriculum with a global outlook', color: '#3b82f6' },
                      { icon: Heart, label: 'Student Wellbeing', desc: 'Holistic mental and physical wellness programs', color: '#ec4899' },
                      { icon: Zap, label: 'Innovation First', desc: 'Digital-first classrooms and AI-powered learning', color: '#f59e0b' },
                      { icon: Trophy, label: 'Award-Winning', desc: 'Ranked #1 in the Wilaya 5 consecutive years', color: '#10b981' },
                    ].map((v, i) => {
                      const Icon = v.icon;
                      return (
                        <motion.div
                          key={v.label}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${v.color}18`, border: `1px solid ${v.color}25` }}
                          >
                            <Icon size={14} style={{ color: v.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{v.label}</p>
                            <p className="text-xs text-muted-foreground">{v.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </motion.section>

        {/* ════════════════════════════
            DEPARTMENTS
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <SectionHead icon={BookMarked} title="Academic Departments" color="text-violet-400" bg="bg-violet-500/15" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calculator, label: 'Mathematics', count: 48, from: '#3b82f6', to: '#06b6d4' },
              { icon: Microscope, label: 'Sciences', count: 62, from: '#06b6d4', to: '#10b981' },
              { icon: Languages, label: 'Languages', count: 35, from: '#10b981', to: '#22d3ee' },
              { icon: Globe, label: 'Geography', count: 28, from: '#f59e0b', to: '#f97316' },
              { icon: FileText, label: 'History', count: 31, from: '#f97316', to: '#ef4444' },
              { icon: Music, label: 'Arts & Music', count: 22, from: '#ec4899', to: '#a855f7' },
              { icon: Palette, label: 'Design', count: 18, from: '#8b5cf6', to: '#6366f1' },
              { icon: Dumbbell, label: 'Physical Ed.', count: 16, from: '#ef4444', to: '#f97316' },
            ].map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div key={d.label} {...stagger(i)}>
                  <Link href="/dashboard/lessons">
                    <TiltCard intensity={12} className="h-full">
                      <div className="relative overflow-hidden rounded-2xl h-full group cursor-pointer"
                        style={{ border: `1px solid ${d.from}20`, background: `linear-gradient(135deg, ${d.from}12, ${d.to}06)` }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                          style={{ background: `linear-gradient(135deg, ${d.from}1e, ${d.to}12)` }}
                        />
                        <div className="relative p-4 flex flex-col gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${d.from}22, ${d.to}16)`, border: `1px solid ${d.from}30` }}
                          >
                            <Icon size={20} style={{ color: d.from }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{d.label}</p>
                            <p className="text-xs text-muted-foreground">{d.count} lessons</p>
                          </div>
                          <div className="w-full h-0.5 rounded-full overflow-hidden bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(d.count / 70) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${d.from}, ${d.to})` }}
                            />
                          </div>
                        </div>
                        {/* hover arrow */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={14} style={{ color: d.from }} />
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════
            PLATFORM FEATURES (3 cards)
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <SectionHead icon={Cpu} title="Platform Features" color="text-cyan-400" bg="bg-cyan-500/15" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: MessageSquare,
                title: 'Real-Time Collaboration',
                desc: 'Instant messaging, group discussions, and rich file sharing — designed for the modern classroom.',
                tags: ['Live Chat', 'File Share', 'Groups'],
                from: '#3b82f6', to: '#06b6d4',
              },
              {
                icon: Video,
                title: 'Virtual Classrooms',
                desc: 'HD live sessions, recorded lectures, interactive whiteboards, and seamless attendance tracking.',
                tags: ['Live', 'Recordings', 'Interactive'],
                from: '#8b5cf6', to: '#ec4899',
              },
              {
                icon: BrainCircuit,
                title: 'AI Study Assistant',
                desc: 'Personalized explanations, practice exercises, essay feedback, and instant answers — 24/7.',
                tags: ['24/7', 'Personalized', 'Multi-subject'],
                from: '#f59e0b', to: '#f97316',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.title} {...stagger(i)}>
                  <TiltCard intensity={8} className="h-full">
                    <div
                      className="relative overflow-hidden rounded-2xl h-full group"
                      style={{ border: `1px solid ${feat.from}20`, background: `linear-gradient(150deg, ${feat.from}10, transparent 60%)` }}
                    >
                      <div className="absolute inset-0 bg-card/40 backdrop-blur-xl" />
                      {/* animated top glow */}
                      <motion.div
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i }}
                        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                        style={{ background: `${feat.from}25` }}
                      />
                      <div className="relative p-6 h-full flex flex-col">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `linear-gradient(135deg, ${feat.from}, ${feat.to})` }}
                        >
                          <Icon size={22} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2">{feat.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feat.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-5">
                          {feat.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: `${feat.from}15`, color: feat.from, border: `1px solid ${feat.from}25` }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* bottom gradient line */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(90deg, ${feat.from}, ${feat.to})` }}
                        />
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════
            QUICK ACCESS GRID
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <SectionHead icon={LayoutDashboard} title="Quick Access" color="text-amber-400" bg="bg-amber-500/15" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Messages', href: '/dashboard/chat', icon: MessageSquare, from: '#3b82f6', to: '#06b6d4', desc: 'Real-time chat' },
              { label: 'Study Groups', href: '/dashboard/groups', icon: Users, from: '#10b981', to: '#06b6d4', desc: 'Collaborate together' },
              { label: 'Virtual Class', href: '/dashboard/meet', icon: Video, from: '#8b5cf6', to: '#ec4899', desc: 'Join a meeting' },
              { label: 'Lessons', href: '/dashboard/lessons', icon: BookOpen, from: '#06b6d4', to: '#3b82f6', desc: 'Full curriculum' },
              { label: 'Teachers', href: '/dashboard/teachers', icon: Award, from: '#f59e0b', to: '#f97316', desc: 'Meet experts' },
              { label: 'AI Tutor', href: '/dashboard/ai', icon: Sparkles, from: '#ec4899', to: '#8b5cf6', desc: '24/7 study help' },
              { label: 'Analytics', href: '/dashboard/settings', icon: BarChart3, from: '#f97316', to: '#ef4444', desc: 'Track progress' },
              { label: 'About School', href: '/dashboard/about', icon: School, from: '#6366f1', to: '#8b5cf6', desc: 'Learn our story' },
            ].map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.label} {...stagger(i)}>
                  <Link href={link.href}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-xl p-4 group cursor-pointer hover:border-white/[0.1] transition-all duration-300"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(135deg, ${link.from}08, ${link.to}04)` }}
                      />
                      <div className="relative flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `linear-gradient(135deg, ${link.from}22, ${link.to}16)`, border: `1px solid ${link.from}25` }}
                        >
                          <Icon size={17} style={{ color: link.from }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{link.label}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                        </div>
                        <ChevronRight size={13} className="text-muted-foreground/30 group-hover:text-muted-foreground/70 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════
            ACTIVITY + GRADE + AI CTA
        ════════════════════════════ */}
        <motion.section {...stagger(0)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Activity / Announcements tabs — 7 cols */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-card/40 backdrop-blur-xl h-full">
              {/* Tab bar */}
              <div className="flex items-center gap-1 p-4 border-b border-white/[0.06]">
                {(['activity', 'announcements'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground/70'
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-xl bg-white/8 border border-white/10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative">{tab === 'activity' ? '🕐 Recent Activity' : '📢 Announcements'}</span>
                  </button>
                ))}
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === 'activity' ? (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2"
                    >
                      {[
                        { text: 'You joined "Advanced Mathematics" group', time: '2 min ago', color: '#3b82f6', icon: Users },
                        { text: 'New lesson: "Calculus Ch.5" published', time: '1 hour ago', color: '#06b6d4', icon: BookOpen },
                        { text: 'Virtual class scheduled tomorrow 9AM', time: '3 hours ago', color: '#8b5cf6', icon: Video },
                        { text: '8 new messages in Physics Study group', time: '5 hours ago', color: '#10b981', icon: MessageSquare },
                        { text: 'Average updated: 15.8/20 — Excellent!', time: '1 day ago', color: '#f59e0b', icon: TrendingUp },
                      ].map((act, i) => {
                        const Icon = act.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default"
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${act.color}15`, border: `1px solid ${act.color}25` }}
                            >
                              <Icon size={13} style={{ color: act.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground leading-snug truncate">{act.text}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{act.time}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="announcements"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {[
                        { title: 'End of Term Exams Schedule', body: 'Final exams begin July 5th. Full schedule posted on the lessons board.', urgent: true, time: 'Today' },
                        { title: 'New AI Features Released', body: 'The AI tutor now supports image uploads and formula recognition.', urgent: false, time: 'Yesterday' },
                        { title: 'Summer Enrichment Programs', body: 'Registration open for Math & Science summer camps. Limited seats.', urgent: false, time: '3 days ago' },
                      ].map((ann, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.1] bg-white/[0.02] transition-all group cursor-default"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-bold text-foreground">{ann.title}</p>
                            {ann.urgent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 flex-shrink-0">Urgent</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{ann.body}</p>
                          <p className="text-[11px] text-muted-foreground/50 mt-2">{ann.time}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT: Grade + AI — 5 cols */}
          <div className="lg:col-span-5 space-y-4">

            {/* Grade Card */}
            <TiltCard intensity={8}>
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-card/40 backdrop-blur-xl p-5">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity size={15} className="text-emerald-400" />
                      <span className="text-sm font-bold text-foreground">Your Performance</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Term 2</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-black text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #06b6d4)' }}>
                      15.8
                    </span>
                    <span className="text-muted-foreground text-sm">/20</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mb-4">Excellent Standing · Top 15%</p>

                  <div className="space-y-2.5">
                    {[
                      { subj: 'Mathematics', grade: 17, coeff: 5, color: '#3b82f6' },
                      { subj: 'Physics', grade: 15, coeff: 4, color: '#8b5cf6' },
                      { subj: 'English', grade: 16, coeff: 3, color: '#10b981' },
                    ].map((s, i) => (
                      <div key={s.subj} className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground w-20 font-medium truncate">{s.subj}</div>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(s.grade / 20) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: s.color }}
                          />
                        </div>
                        <div className="text-xs font-bold text-foreground w-8 text-right">{s.grade}/20</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <TrendingUp size={12} />
                    +1.2 pts improvement since last term
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* AI Tutor CTA */}
            <TiltCard intensity={8}>
              <div className="relative overflow-hidden rounded-2xl h-full" style={{ border: '1px solid #a855f720', background: 'linear-gradient(135deg, #a855f710, #ec489908)' }}>
                <div className="absolute inset-0 bg-card/40 backdrop-blur-xl" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7)' }}
                />
                <div className="relative p-5">
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 8px 24px #a855f740' }}
                  >
                    <BrainCircuit size={22} className="text-white" />
                  </motion.div>
                  <h4 className="text-sm font-black text-foreground mb-1">AI Study Assistant</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Instant answers, essay review, formula explanations — your personal tutor, always on.
                  </p>
                  <Link href="/dashboard/ai">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white cursor-pointer shadow-xl transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        boxShadow: '0 8px 24px #a855f730',
                      }}
                    >
                      Start Now <ArrowRight size={14} />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </TiltCard>
          </div>
        </motion.section>

        {/* ════════════════════════════
            SCHOOL MOTTO BANNER
        ════════════════════════════ */}
        <motion.section {...stagger(0)}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07]">
            <div className="absolute inset-0 bg-card/30 backdrop-blur-xl" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
            {/* animated stars */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                className="absolute w-1 h-1 rounded-full bg-blue-400"
                style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 30}%` }}
              />
            ))}
            <div className="relative px-8 py-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-blue-400/60" />
                <Atom size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">School Motto</span>
                <Atom size={14} className="text-blue-400" />
                <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-blue-400/60" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground mb-2 tracking-tight">
                "Knowledge is the{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #22d3ee, #818cf8)' }}>
                  Foundation
                </span>
                {' '}of Success"
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Established 1985 · Serving 3,200+ students · Proudly Algerian 🇩🇿
              </p>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}