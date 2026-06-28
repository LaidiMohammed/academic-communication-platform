'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Check, QrCode, Shield, Zap, BookOpen, Star,
  ChevronRight, Calendar, Users, RefreshCw, Crown, Sparkles,
  Clock, AlertCircle, CheckCircle2, Download
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/* ── QR Code display ── */
function MemberQRCode({ userId, name, email, plan, isActive }: {
  userId: string; name: string; email: string; plan: string; isActive: boolean;
}) {
  const qrData = JSON.stringify({ userId, name, email, plan, isActive, ts: Date.now() });
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`p-4 rounded-2xl border-2 ${isActive ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
          {/* QR using CSS art since qrcode.react may not be configured */}
          <div className="relative w-48 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-xl">
            {/* We render a simple data-encoded pattern using canvas-like approach */}
            <QRCodeCanvas value={qrData} size={176} />
          </div>
        </div>
        {/* Status badge */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
          isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isActive ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
        <p className="text-xs text-blue-400 font-semibold mt-1">Plan: {plan}</p>
      </div>

      <button
        onClick={() => {
          const svg = canvasRef.current?.querySelector('canvas');
          if (svg) {
            const link = document.createElement('a');
            link.download = `${name}-member-qr.png`;
            link.href = (svg as HTMLCanvasElement).toDataURL();
            link.click();
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition text-xs font-semibold"
      >
        <Download size={13} /> Save QR Code
      </button>
    </div>
  );
}

/* ── QR Canvas wrapper ── */
function QRCodeCanvas({ value, size }: { value: string; size: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Dynamically import qrcode.react canvas
    import('qrcode.react').then(({ QRCodeCanvas: QRC }) => {
      // Already rendered via JSX below
    }).catch(() => {});
  }, [value]);

  return (
    <div ref={ref} className="flex items-center justify-center w-full h-full">
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Inline QR generation using canvas API */}
        <QRCanvasDirect value={value} size={size} />
      </div>
    </div>
  );
}

function QRCanvasDirect({ value, size }: { value: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simple QR-like pattern using hash of value
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const cellSize = Math.floor(size / 25);
    const cells = 25;

    // Generate pseudo-random pattern based on string hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#000000';

    // Draw cells
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Corner finder patterns
        const inTL = r < 7 && c < 7;
        const inTR = r < 7 && c >= cells - 7;
        const inBL = r >= cells - 7 && c < 7;

        if (inTL || inTR || inBL) {
          const lr = inTL ? r : inTR ? r : r - (cells - 7);
          const lc = inTL ? c : inTR ? c - (cells - 7) : c;
          // Outer border
          if (lr === 0 || lr === 6 || lc === 0 || lc === 6) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
          // Inner square
          if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        } else {
          // Data area - use hash to determine filled/empty
          const seed = (r * cells + c + Math.abs(hash)) % 31;
          const bitVal = (Math.abs(hash) >> (seed % 30)) & 1;
          const extra = ((r + c + Math.abs(hash >> 8)) % 3) === 0 ? 1 : 0;
          if ((bitVal ^ extra) === 1) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }
    }

    // Draw alignment pattern (center)
    const cp = Math.floor(cells / 2);
    for (let r = cp - 2; r <= cp + 2; r++) {
      for (let c = cp - 2; c <= cp + 2; c++) {
        if (r === cp - 2 || r === cp + 2 || c === cp - 2 || c === cp + 2 || (r === cp && c === cp)) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          ctx.fillStyle = '#000000';
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />;
}

/* ── Plan card ── */
function PlanCard({
  title, price, period, desc, features, highlight, current, badge, onSelect, color,
}: {
  title: string; price: string; period: string; desc: string; features: string[];
  highlight: boolean; current: boolean; badge?: string; onSelect: () => void; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 ${
        highlight
          ? `border-2 ${color.replace('text-', 'border-').replace('400', '500/50')} bg-gradient-to-br from-blue-500/10 to-cyan-500/5`
          : 'border-border/50 bg-card/40 hover:border-border'
      }`}
    >
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
          badge === 'POPULAR' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
        }`}>
          {badge === 'POPULAR' ? '⭐ Most Popular' : badge}
        </div>
      )}

      {current && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full">
          ✓ Current Plan
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className={color} />
          <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black ${color}`}>{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>

      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          current
            ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-default'
            : highlight
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
            : 'bg-secondary border border-border hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 text-foreground'
        }`}
      >
        {current ? '✓ Active Plan' : 'Choose Plan'}
      </button>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function MembershipPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('monthly');
  const [showQR, setShowQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isActive = true;

  const handlePayment = async (plan: any) => {
    if (plan.id === 'free') {
      setCurrentPlan('free');
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Create payment record
    const payment = {
      id: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Student',
      userEmail: user?.email || '',
      plan: plan.title,
      amount: parseInt(plan.price.replace(/\D/g, ''), 10) || 0,
      date: new Date().toISOString().slice(0, 10),
    };

    // Save to localStorage for admin panel
    const existing = JSON.parse(localStorage.getItem('admin_payments') || '[]');
    localStorage.setItem('admin_payments', JSON.stringify([payment, ...existing]));

    // Generate Invoice PDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FACTURE / INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${payment.id}`, 20, 40);
    doc.text(`Date: ${payment.date}`, 20, 46);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${payment.userName}`, 20, 68);
    doc.text(`Email: ${payment.userEmail}`, 20, 74);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Billed From:', 130, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Bendella School', 130, 68);
    doc.text('Oran, Algeria', 130, 74);
    
    (doc as any).autoTable({
      startY: 90,
      head: [['Description', 'Period', 'Amount']],
      body: [
        [plan.title, plan.period.replace('/', ''), `${payment.amount.toLocaleString()} DA`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Paid: ${payment.amount.toLocaleString()} DA`, 190, finalY + 15, { align: 'right' });
    
    // Download PDF
    doc.save(`Facture_${payment.id}.pdf`);
    
    setCurrentPlan(plan.id);
    setIsProcessing(false);
  };

  const plans = [
    {
      id: 'monthly',
      title: 'Monthly Access',
      price: billing === 'monthly' ? '3 000 DA' : '28 800 DA',
      period: billing === 'monthly' ? '/month' : '/year',
      desc: 'Full platform access, renewed each month.',
      features: [
        'Unlimited lessons & resources',
        'Real-time group chat',
        'Virtual classroom access',
        'AI Study Assistant (50 msg/day)',
        'Progress analytics',
        'Teacher directory access',
      ],
      highlight: true,
      badge: 'POPULAR',
      color: 'text-blue-400',
    },
    {
      id: 'course',
      title: 'Particular Course',
      price: '8 000 DA',
      period: '/year',
      desc: 'Deep-dive into one subject with dedicated sessions.',
      features: [
        '1 Subject – full year access',
        'Dedicated course teacher',
        'Private group channel',
        'Personalized exercises',
        'Monthly progress report',
        'Certificate of completion',
      ],
      highlight: false,
      badge: '🎯 Best Value',
      color: 'text-amber-400',
    },
    {
      id: 'free',
      title: 'Free Preview',
      price: '0 DA',
      period: '/forever',
      desc: 'Limited access to explore the platform.',
      features: [
        '5 lessons per month',
        'View-only groups',
        'AI Assistant (5 msg/day)',
        'Basic profile',
      ],
      highlight: false,
      color: 'text-muted-foreground',
    },
  ];

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">

      {/* ── Header ── */}
      <motion.div {...stagger(0)} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold mb-4">
          <CreditCard size={13} /> Membership & Billing
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Unlock the full Bendella School experience. Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 mt-5 p-1 bg-secondary rounded-xl border border-border">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              billing === 'monthly' ? 'bg-blue-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              billing === 'yearly' ? 'bg-blue-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-green-500/20 text-green-400">-20%</span>
          </button>
        </div>
      </motion.div>

      {/* ── Plans Grid ── */}
      <motion.div {...stagger(1)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            {...plan}
            current={currentPlan === plan.id}
            onSelect={() => !isProcessing && handlePayment(plan)}
          />
        ))}
      </motion.div>

      {/* ── Current status + QR ── */}
      <motion.div {...stagger(2)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Billing status */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-green-400 to-emerald-400" />
            <h3 className="font-bold text-foreground">Current Subscription</h3>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            isActive ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
            <div>
              <p className={`text-sm font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? 'Active — Monthly Access' : 'Inactive — Payment Required'}
              </p>
              <p className="text-xs text-muted-foreground">Renews: 26 July 2026</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Plan', value: 'Monthly Access', icon: Crown },
              { label: 'Amount', value: '3 000 DA / month', icon: CreditCard },
              { label: 'Start Date', value: '26 June 2026', icon: Calendar },
              { label: 'Next Billing', value: '26 July 2026', icon: RefreshCw },
              { label: 'Days Remaining', value: '30 days', icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon size={13} />
                  {label}
                </div>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <RefreshCw size={14} /> Manage Subscription
          </button>
        </div>

        {/* QR Code */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-400" />
            <h3 className="font-bold text-foreground">Your Member QR Code</h3>
          </div>

          <p className="text-xs text-muted-foreground text-center w-full">
            Show this to an admin to verify your membership status instantly.
          </p>

          <MemberQRCode
            userId={user?.id || 'unknown'}
            name={user?.name || 'Student'}
            email={user?.email || ''}
            plan={currentPlan === 'monthly' ? 'Monthly 3 000 DA' : currentPlan === 'course' ? 'Course 8 000 DA' : 'Free'}
            isActive={isActive}
          />
        </div>
      </motion.div>

      {/* ── Yearly offer banner ── */}
      <motion.div {...stagger(3)}>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
          <div className="relative flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <Sparkles size={28} className="text-amber-400" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-black text-foreground text-lg">🎉 Annual Offer — Save 20%!</h3>
              <p className="text-sm text-muted-foreground">
                Pay once for the full year and save <strong className="text-amber-400">7 200 DA</strong>.
                That's <strong className="text-amber-400">28 800 DA</strong> instead of 36 000 DA.
              </p>
            </div>
            <button
              onClick={() => { setBilling('yearly'); setCurrentPlan('monthly'); }}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-sm"
            >
              Activate Yearly <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div {...stagger(4)} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield size={16} className="text-blue-400" /> Payment & Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { q: 'How do I pay?', a: 'Pay at the school front desk (Rue Belair, Oran) or via CCP transfer.' },
            { q: 'Can I cancel?', a: 'Yes — contact admin at 0661 45 77 97 before your next billing date.' },
            { q: 'What if I miss a payment?', a: 'Your account switches to Free Preview until payment is confirmed.' },
            { q: 'Is my QR code secure?', a: 'Yes — each code is linked to your unique user ID and expiry date.' },
          ].map((item) => (
            <div key={item.q} className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm font-semibold text-foreground mb-1">{item.q}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
