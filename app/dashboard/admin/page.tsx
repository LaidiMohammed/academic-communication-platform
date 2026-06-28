'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import {
  Shield, Users, BookOpen, DollarSign, QrCode, School, TrendingUp,
  Calendar, CheckCircle, XCircle, AlertTriangle, Search, Camera,
  Download, Plus, ChevronRight, Clock, CreditCard, UserCheck, Award,
  Trash2, Edit, Filter, GraduationCap, MessageSquare, Video, PieChart,
  BarChart3, CircleDollarSign, UserPlus, UserX, Percent, Loader,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/* ===== Types ===== */
interface Student {
  id: string; name: string; email: string; level: string; phone: string;
  monthSessions: number; totalSessions: number; status: 'active' | 'inactive' | 'suspended';
  lastScan: string; enrolledDate: string;
}
interface Teacher {
  id: string; name: string; email: string; subject: string; phone: string;
  monthlySalary: number; paid: boolean; paidDate: string; hireDate: string; level: string;
}
interface Revenue {
  id: string; source: string; amount: number; date: string; type: 'income' | 'expense'; category: string;
}
interface Lesson {
  id: string; title: string; subject: string; level: string; type: 'course' | 'td' | 'tp' | 'exam';
  teacher: string; date: string; status: 'published' | 'draft';
}
interface Group {
  id: string; name: string; members: number; type: 'public' | 'private'; createdBy: string;
  createdAt: string; status: 'active' | 'archived';
}

/* ===== Initial Data ===== */
const initialStudents: Student[] = [
  { id: 'STU-001', name: 'Ahmed Benali', email: 'ahmed@school.edu', level: 'Lycée-3', phone: '0555-123456', monthSessions: 4, totalSessions: 32, status: 'active', lastScan: '2026-06-18', enrolledDate: '2024-09-01' },
  { id: 'STU-002', name: 'Fatima Zohra', email: 'fatima@school.edu', level: 'Lycée-2', phone: '0555-234567', monthSessions: 4, totalSessions: 28, status: 'active', lastScan: '2026-06-19', enrolledDate: '2024-09-01' },
  { id: 'STU-003', name: 'Mohamed Khelifi', email: 'mohamed@school.edu', level: 'CEM-3', phone: '0555-345678', monthSessions: 2, totalSessions: 15, status: 'active', lastScan: '2026-06-15', enrolledDate: '2025-09-01' },
  { id: 'STU-004', name: 'Sofia Merabet', email: 'sofia@school.edu', level: 'Lycée-1', phone: '0555-456789', monthSessions: 0, totalSessions: 10, status: 'suspended', lastScan: '2026-05-30', enrolledDate: '2025-09-01' },
  { id: 'STU-005', name: 'Yacine Boudiaf', email: 'yacine@school.edu', level: 'CEM-2', phone: '0555-567890', monthSessions: 3, totalSessions: 20, status: 'active', lastScan: '2026-06-17', enrolledDate: '2025-09-01' },
  { id: 'STU-006', name: 'Ines Amirouche', email: 'ines@school.edu', level: 'CEM-1', phone: '0555-678901', monthSessions: 4, totalSessions: 18, status: 'active', lastScan: '2026-06-20', enrolledDate: '2025-09-01' },
  { id: 'STU-007', name: 'Rayan Mansouri', email: 'rayan@school.edu', level: 'Lycée-3', phone: '0555-789012', monthSessions: 1, totalSessions: 25, status: 'active', lastScan: '2026-06-14', enrolledDate: '2024-09-01' },
  { id: 'STU-008', name: 'Lina Haddad', email: 'lina@school.edu', level: 'CEM-3', phone: '0555-890123', monthSessions: 0, totalSessions: 12, status: 'suspended', lastScan: '2026-05-28', enrolledDate: '2025-09-01' },
];

const initialTeachers: Teacher[] = [
  { id: 'TCH-001', name: 'Dr. Sarah Smith', email: 'sarah@school.edu', subject: 'Mathematics', phone: '0555-111111', monthlySalary: 2400, paid: true, paidDate: '2026-06-01', hireDate: '2022-09-01', level: 'Lycée 1-3' },
  { id: 'TCH-002', name: 'Mr. James Johnson', email: 'james@school.edu', subject: 'Physics', phone: '0555-222222', monthlySalary: 2200, paid: false, paidDate: '', hireDate: '2023-01-15', level: 'CEM 2-3, Lycée 1-2' },
  { id: 'TCH-003', name: 'Mrs. Emily Davis', email: 'emily@school.edu', subject: 'English', phone: '0555-333333', monthlySalary: 2100, paid: true, paidDate: '2026-06-01', hireDate: '2021-09-01', level: 'Lycée 1-3' },
  { id: 'TCH-004', name: 'Dr. Michael Chen', email: 'michael@school.edu', subject: 'Chemistry', phone: '0555-444444', monthlySalary: 2500, paid: false, paidDate: '', hireDate: '2022-09-01', level: 'CEM 3, Lycée 1-3' },
  { id: 'TCH-005', name: 'Ms. Samira Belkacem', email: 'samira@school.edu', subject: 'Arabic', phone: '0555-555555', monthlySalary: 1900, paid: true, paidDate: '2026-06-01', hireDate: '2024-09-01', level: 'CEM 1-3' },
];

const initialRevenues: Revenue[] = [
  { id: 'REV-001', source: 'Tuition Fees', amount: 15000, date: '2026-06-01', type: 'income', category: 'Fees' },
  { id: 'REV-002', source: 'Teacher Salaries', amount: -11100, date: '2026-06-01', type: 'expense', category: 'Salaries' },
  { id: 'REV-003', source: 'Lab Equipment', amount: -2500, date: '2026-06-05', type: 'expense', category: 'Equipment' },
  { id: 'REV-004', source: 'Registration Fees', amount: 3200, date: '2026-06-10', type: 'income', category: 'Fees' },
  { id: 'REV-005', source: 'Books & Materials', amount: 1800, date: '2026-06-12', type: 'income', category: 'Sales' },
  { id: 'REV-006', source: 'Utility Bills', amount: -800, date: '2026-06-15', type: 'expense', category: 'Operations' },
];

const initialLessons: Lesson[] = [
  { id: 'LES-001', title: 'Calculus Fundamentals', subject: 'Math', level: 'Lycée-3', type: 'course', teacher: 'Dr. Sarah Smith', date: '2026-06-01', status: 'published' },
  { id: 'LES-002', title: 'Newton\'s Laws', subject: 'Physics', level: 'Lycée-2', type: 'course', teacher: 'Mr. James Johnson', date: '2026-06-03', status: 'published' },
  { id: 'LES-003', title: 'Grammar Exercises', subject: 'English', level: 'Lycée-1', type: 'td', teacher: 'Mrs. Emily Davis', date: '2026-06-05', status: 'draft' },
  { id: 'LES-004', title: 'Chemical Reactions Lab', subject: 'Chemistry', level: 'CEM-3', type: 'tp', teacher: 'Dr. Michael Chen', date: '2026-06-08', status: 'published' },
  { id: 'LES-005', title: 'BAC 2025 Math Exam', subject: 'Math', level: 'Lycée-3', type: 'exam', teacher: 'Dr. Sarah Smith', date: '2026-06-10', status: 'published' },
];

const initialGroups: Group[] = [
  { id: 'GRP-001', name: 'Math Study Circle', members: 24, type: 'public', createdBy: 'Dr. Sarah Smith', createdAt: '2024-01-15', status: 'active' },
  { id: 'GRP-002', name: 'Physics Lab', members: 18, type: 'private', createdBy: 'Mr. James Johnson', createdAt: '2024-03-20', status: 'active' },
  { id: 'GRP-003', name: 'English Lit', members: 32, type: 'public', createdBy: 'Mrs. Emily Davis', createdAt: '2024-06-01', status: 'active' },
  { id: 'GRP-004', name: 'Chemistry Lab', members: 15, type: 'private', createdBy: 'Dr. Michael Chen', createdAt: '2024-08-10', status: 'archived' },
];

/* ===== SVG Donut Chart ===== */
function DonutChart({ data, size = 180 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.35, sw = size * 0.12;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E293B" strokeWidth={sw} />
      {data.map((d) => {
        const len = (d.value / total) * circ;
        const seg = (
          <circle key={d.label} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
            strokeWidth={sw} strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} className="transition-all duration-700" />
        );
        offset += len;
        return seg;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white text-lg font-bold" fontSize="18">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-500 text-xs" fontSize="10">Total</text>
    </svg>
  );
}

/* ===== Form Components ===== */

function StudentForm({ initial, onSave, onCancel }: {
  initial: Student | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [level, setLevel] = useState(initial?.level || 'CEM-1');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [status, setStatus] = useState<string>(initial?.status || 'active');

  return (
    <div className="space-y-3">
      <InputField label="Full Name" value={name} onChange={setName} />
      <InputField label="Email" value={email} onChange={setEmail} type="email" />
      <SelectField label="Level" value={level} onChange={setLevel}
        options={['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3']} />
      <InputField label="Phone" value={phone} onChange={setPhone} />
      <SelectField label="Status" value={status} onChange={setStatus}
        options={['active','inactive','suspended']} />
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs border border-border/60 text-foreground/80 rounded-lg hover:bg-blue-500/10 transition">Cancel</button>
        <button onClick={() => onSave({ name, email, level, phone, status, monthSessions: initial?.monthSessions ?? 4, totalSessions: initial?.totalSessions ?? 0, lastScan: initial?.lastScan || '', enrolledDate: initial?.enrolledDate || new Date().toISOString().slice(0,10) })}
          className="px-4 py-2 text-xs bg-blue-500 text-primary-foreground rounded-lg hover:bg-blue-400 transition shadow-lg disabled:opacity-50"
          disabled={!name || !email}>Save</button>
      </div>
    </div>
  );
}

function TeacherForm({ initial, onSave, onCancel }: {
  initial: Teacher | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [subject, setSubject] = useState(initial?.subject || 'Mathematics');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [monthlySalary, setMonthlySalary] = useState(String(initial?.monthlySalary || ''));
  const [level, setLevel] = useState(initial?.level || 'CEM 1-3');

  return (
    <div className="space-y-3">
      <InputField label="Full Name" value={name} onChange={setName} />
      <InputField label="Email" value={email} onChange={setEmail} type="email" />
      <SelectField label="Subject" value={subject} onChange={setSubject}
        options={['Mathematics','Physics','English','Chemistry','Arabic','History','Biology','Computer Science']} />
      <InputField label="Phone" value={phone} onChange={setPhone} />
      <InputField label="Monthly Salary (DA)" value={monthlySalary} onChange={setMonthlySalary} type="number" />
      <InputField label="Level(s)" value={level} onChange={setLevel} placeholder="e.g. CEM 1-3, Lycée 1-2" />
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs border border-border/60 text-foreground/80 rounded-lg hover:bg-blue-500/10 transition">Cancel</button>
        <button onClick={() => onSave({ name, email, subject, phone, monthlySalary: Number(monthlySalary), level })}
          className="px-4 py-2 text-xs bg-blue-500 text-primary-foreground rounded-lg hover:bg-blue-400 transition shadow-lg disabled:opacity-50"
          disabled={!name || !email || !monthlySalary}>Save</button>
      </div>
    </div>
  );
}

function LessonForm({ initial, onSave, onCancel }: {
  initial: Lesson | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [subject, setSubject] = useState(initial?.subject || 'Math');
  const [level, setLevel] = useState(initial?.level || 'CEM-1');
  const [type, setType] = useState<string>(initial?.type || 'course');
  const [teacher, setTeacher] = useState(initial?.teacher || '');
  const [status, setStatus] = useState<string>(initial?.status || 'draft');

  return (
    <div className="space-y-3">
      <InputField label="Title" value={title} onChange={setTitle} />
      <SelectField label="Subject" value={subject} onChange={setSubject}
        options={['Math','Physics','English','Chemistry','Arabic','History','Biology']} />
      <SelectField label="Level" value={level} onChange={setLevel}
        options={['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3']} />
      <SelectField label="Type" value={type} onChange={setType}
        options={['course','td','tp','exam']} />
      <InputField label="Teacher Name" value={teacher} onChange={setTeacher} />
      <SelectField label="Status" value={status} onChange={setStatus}
        options={['published','draft']} />
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs border border-border/60 text-foreground/80 rounded-lg hover:bg-blue-500/10 transition">Cancel</button>
        <button onClick={() => onSave({ title, subject, level, type, teacher, status, date: initial?.date || new Date().toISOString().slice(0,10) })}
          className="px-4 py-2 text-xs bg-blue-500 text-primary-foreground rounded-lg hover:bg-blue-400 transition shadow-lg disabled:opacity-50"
          disabled={!title || !teacher}>Save</button>
      </div>
    </div>
  );
}

function GroupForm({ onSave, onCancel }: {
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('public');

  return (
    <div className="space-y-3">
      <InputField label="Group Name" value={name} onChange={setName} />
      <SelectField label="Type" value={type} onChange={setType} options={['public','private']} />
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs border border-border/60 text-foreground/80 rounded-lg hover:bg-blue-500/10 transition">Cancel</button>
        <button onClick={() => onSave({ name, type })}
          className="px-4 py-2 text-xs bg-blue-500 text-primary-foreground rounded-lg hover:bg-blue-400 transition shadow-lg disabled:opacity-50"
          disabled={!name}>Save</button>
      </div>
    </div>
  );
}

/* ===== Shared Input Components ===== */
function InputField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-blue-400/40 transition placeholder:text-muted-foreground/50" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-blue-400/40 transition">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ===== Simulated current user list for admin management ===== */
const initialAdminsList = [
  { id: 'ADM-001', name: 'Hamda Laidi', email: 'hamda.laidi.14@gmail.com', role: 'superadmin' as const, lastActive: '2026-06-19' },
  { id: 'ADM-002', name: 'School Manager', email: 'manager@school.edu', role: 'admin' as const, lastActive: '2026-06-18' },
];

/* ===== Main Admin Page ===== */
export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');

  // Data state (persisted in localStorage)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('admin_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('admin_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });
  const [revenues, setRevenues] = useState<Revenue[]>(() => {
    const saved = localStorage.getItem('admin_revenues');
    return saved ? JSON.parse(saved) : initialRevenues;
  });
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('admin_lessons');
    return saved ? JSON.parse(saved) : initialLessons;
  });
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('admin_groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });
  const [adminsList, setAdminsList] = useState<{id:string;name:string;email:string;role:string;lastActive:string}[]>(() => {
    const saved = localStorage.getItem('admin_admins');
    return saved ? JSON.parse(saved) : initialAdminsList;
  });
  const [payments, setPayments] = useState<{id:string;userId:string;userName:string;userEmail:string;plan:string;amount:number;date:string}[]>(() => {
    const saved = localStorage.getItem('admin_payments');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist every state change
  useEffect(() => { localStorage.setItem('admin_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('admin_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('admin_revenues', JSON.stringify(revenues)); }, [revenues]);
  useEffect(() => { localStorage.setItem('admin_lessons', JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem('admin_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('admin_admins', JSON.stringify(adminsList)); }, [adminsList]);

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState<{ type: string; data?: any } | null>(null);
  const [showQRForStudent, setShowQRForStudent] = useState<Student | null>(null);

  // QR Camera Scanner
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Auto-start camera when entering scanner tab, stop when leaving
  useEffect(() => {
    if (tab === 'scanner') {
      setCameraActive(true);
    } else {
      scanningRef.current = false;
      setCameraActive(false);
      setScanResult(null);
      setScanError(null);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [tab]);

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard');
  }, [user, router]);

  // QR Camera scanner effect
  useEffect(() => {
    if (!cameraActive) return;
    scanningRef.current = true;
    setScanError(null);
    setScanResult(null);
    let animId: number;

    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
        const scan = () => {
          if (!scanningRef.current || !videoRef.current || !canvasRef.current) return;
          const canvas = canvasRef.current;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(videoRef.current, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            try {
              const parsed = JSON.parse(code.data);
              if (parsed.id) {
                const sid = parsed.id;
                scanningRef.current = false;
                setScanResult(sid);
                setCameraActive(false);
                streamRef.current?.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                setStudents(p => p.map(x => x.id === sid ? {
                  ...x, monthSessions: Math.max(0, x.monthSessions - 1),
                  status: x.monthSessions - 1 <= 0 ? 'suspended' : x.status,
                  lastScan: new Date().toISOString().slice(0, 10)
                } : x));
                return;
              }
            } catch { /* ignore parse errors */ }
          }
          if (scanningRef.current) animId = requestAnimationFrame(scan);
        };
        animId = requestAnimationFrame(scan);
      } catch {
        setScanError('Camera access denied. Allow camera permissions.');
        setCameraActive(false);
        scanningRef.current = false;
      }
    };
    start();

    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(animId);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [cameraActive]);

  if (!user || user.role !== 'admin') return null;

  /* ===== Stats ===== */
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    suspendedStudents: students.filter(s => s.status === 'suspended').length,
    totalTeachers: teachers.length,
    paidTeachers: teachers.filter(t => t.paid).length,
    totalRevenue: revenues.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0),
    totalExpenses: revenues.filter(r => r.type === 'expense').reduce((s, r) => s + Math.abs(r.amount), 0),
    totalSalary: teachers.reduce((s, t) => s + t.monthlySalary, 0),
    totalLessons: lessons.length,
    totalGroups: groups.length,
  };
  const netRevenue = stats.totalRevenue - stats.totalExpenses;

  /* ===== Handlers ===== */
  const deleteItem = (type: string, id: string) => {
    if (type === 'students') setStudents(p => p.filter(x => x.id !== id));
    if (type === 'teachers') setTeachers(p => p.filter(x => x.id !== id));
    if (type === 'lessons') setLessons(p => p.filter(x => x.id !== id));
    if (type === 'groups') setGroups(p => p.filter(x => x.id !== id));
  };

  /* ===== Search & Filter ===== */
  const filter = (items: any[], fields: string[]) => {
    let filtered = items;
    if (search) filtered = filtered.filter(i => fields.some(f => String(i[f]).toLowerCase().includes(search.toLowerCase())));
    if (filterLevel !== 'all') filtered = filtered.filter(i => i.level === filterLevel || i.level?.includes(filterLevel));
    if (filterSubject !== 'all') filtered = filtered.filter(i => i.subject === filterSubject);
    if (filterStatus !== 'all') filtered = filtered.filter(i => i.status === filterStatus);
    return filtered;
  };

  /* ===== Level distribution for chart ===== */
  const levelDist = ['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].map(l => ({
    label: l, value: students.filter(s => s.level === l).length,
    color: `hsl(${210 + ['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].indexOf(l) * 12}, 70%, 55%)`,
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: School },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: Award },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'groups', label: 'Groups', icon: MessageSquare },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'admins', label: 'Admins', icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
          <Shield size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Full school management • {stats.totalStudents} students • {stats.totalTeachers} teachers • {netRevenue.toLocaleString()} DA net</p>
        </div>
      </motion.div>

      {/* Tabs (scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.id ? 'bg-blue-500 text-primary-foreground shadow-lg shadow-blue-500/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-400', sub: `${stats.activeStudents} active` },
              { label: 'Teachers', value: stats.totalTeachers, icon: Award, color: 'text-purple-400', sub: `${stats.paidTeachers} paid` },
              { label: 'Revenue', value: `${netRevenue.toLocaleString()} DA`, icon: DollarSign, color: 'text-green-400', sub: `+${stats.totalRevenue.toLocaleString()} DA in` },
              { label: 'Lessons', value: stats.totalLessons, icon: BookOpen, color: 'text-amber-400', sub: `${stats.totalGroups} groups` },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={18} className={s.color} />
                    <span className="text-[10px] text-muted-foreground/50">{s.sub}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground/70">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Level Distribution */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2 w-full">
                <PieChart size={14} className="text-blue-400" /> Students by Level
              </h3>
              <DonutChart data={levelDist} />
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {levelDist.filter(d => d.value > 0).map(d => (
                  <span key={d.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.label}: {d.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Teacher Status */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2 w-full">
                <BarChart3 size={14} className="text-blue-400" /> Teacher Status
              </h3>
              <DonutChart data={[
                { label: 'Paid', value: stats.paidTeachers, color: '#22C55E' },
                { label: 'Unpaid', value: stats.totalTeachers - stats.paidTeachers, color: '#F59E0B' },
              ]} />
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-green-400" /> Paid: {stats.paidTeachers}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-amber-400" /> Unpaid: {stats.totalTeachers - stats.paidTeachers}</span>
              </div>
            </div>

            {/* Revenue Pie */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2 w-full">
                <CircleDollarSign size={14} className="text-blue-400" /> Revenue Split
              </h3>
              <DonutChart data={[
                { label: 'Income', value: stats.totalRevenue, color: '#22C55E' },
                { label: 'Expenses', value: stats.totalExpenses, color: '#EF4444' },
              ]} />
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-green-400" /> +{stats.totalRevenue.toLocaleString()} DA</span>
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-red-400" /> -{stats.totalExpenses.toLocaleString()} DA</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-4">Quick Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Active Students', value: stats.activeStudents, color: 'text-green-400' },
                { label: 'Suspended', value: stats.suspendedStudents, color: 'text-red-400' },
                { label: 'Total Lessons', value: stats.totalLessons, color: 'text-blue-400' },
                { label: 'Active Groups', value: groups.filter(g => g.status === 'active').length, color: 'text-cyan-400' },
              ].map(d => (
                <div key={d.label} className="bg-secondary rounded-lg p-3">
                  <p className={`text-xl font-bold ${d.color}`}>{d.value}</p>
                  <p className="text-[10px] text-muted-foreground/70">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== STUDENTS ===== */}
      {tab === 'students' && (
        <motion.div key="stu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Levels</option>
              {['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-student' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-muted-foreground/70 text-xs">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Level</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Sessions</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-center p-3 font-medium">QR</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-blue-500/5">
                  {filter(students, ['name','email','id','level']).map(s => (
                    <tr key={s.id} className="hover:bg-secondary/50 transition">
                      <td className="p-3"><p className="text-foreground font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground/50">{s.id}</p></td>
                      <td className="p-3 text-muted-foreground">{s.level}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{s.status}</span></td>
                      <td className="p-3"><span className={s.monthSessions > 0 ? 'text-blue-400' : 'text-red-400'}>{s.monthSessions}/4</span></td>
                      <td className="p-3 text-muted-foreground text-xs">{s.phone}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => setShowQRForStudent(s)}
                          className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition" title="Show QR Code">
                          <QrCode size={14} />
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => setShowModal({ type: 'edit-student', data: s })} className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={14} /></button>
                        <button onClick={() => deleteItem('students', s.id)} className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== TEACHERS ===== */}
      {tab === 'teachers' && (
        <motion.div key="tch" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Subjects</option>
              {['Mathematics','Physics','English','Chemistry','Arabic'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => setShowModal({ type: 'add-teacher' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-muted-foreground/70 text-xs">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Subject</th>
                  <th className="text-left p-3 font-medium">Level</th>
                  <th className="text-left p-3 font-medium">Salary</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-blue-500/5">
                  {filter(teachers, ['name','email','subject','id']).map(t => (
                    <tr key={t.id} className="hover:bg-secondary/50 transition">
                      <td className="p-3"><p className="text-foreground font-medium">{t.name}</p><p className="text-[10px] text-muted-foreground/50">{t.id}</p></td>
                      <td className="p-3 text-muted-foreground text-xs">{t.subject}</td>
                      <td className="p-3 text-muted-foreground text-xs">{t.level}</td>
                      <td className="p-3"><span className="text-foreground font-medium">{t.monthlySalary.toLocaleString()} DA</span></td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.paid ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{t.paid ? 'Paid' : 'Unpaid'}</span></td>
                      <td className="p-3 text-right">
                        <button onClick={() => setShowModal({ type: 'edit-teacher', data: t })} className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={14} /></button>
                        <button onClick={() => deleteItem('teachers', t.id)} className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== REVENUE ===== */}
      {tab === 'revenue' && (
        <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Income', value: `+${stats.totalRevenue.toLocaleString()} DA`, color: 'text-green-400' },
              { label: 'Total Expenses', value: `-${stats.totalExpenses.toLocaleString()} DA`, color: 'text-red-400' },
              { label: 'Net Revenue', value: `${netRevenue.toLocaleString()} DA`, color: netRevenue >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Salary Pool', value: `${stats.totalSalary.toLocaleString()} DA`, color: 'text-amber-400' },
            ].map(d => (
              <div key={d.label} className="bg-card border border-border rounded-xl p-4">
                <p className={`text-xl font-bold ${d.color}`}>{d.value}</p>
                <p className="text-xs text-muted-foreground/70">{d.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground/70 text-xs">
                <th className="text-left p-3 font-medium">Source</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-blue-500/5">
                {revenues.map(r => (
                  <tr key={r.id} className="hover:bg-secondary/50 transition">
                    <td className="p-3"><span className="text-foreground">{r.source}</span></td>
                    <td className="p-3"><span className="text-xs text-muted-foreground">{r.category}</span></td>
                    <td className="p-3 text-xs text-muted-foreground/70">{r.date}</td>
                    <td className={`p-3 text-right font-semibold ${r.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {r.type === 'income' ? '+' : '-'}{Math.abs(r.amount).toLocaleString()} DA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===== PAYMENTS ===== */}
      {tab === 'payments' && (
        <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard size={18} className="text-blue-400" /> Member Payments
            </h2>
            <div className="flex gap-2">
              <button onClick={() => {
                const doc = new jsPDF();
                doc.text('Monthly Payments Report', 14, 15);
                (doc as any).autoTable({
                  startY: 20,
                  head: [['ID', 'Name', 'Email', 'Plan', 'Amount', 'Date']],
                  body: payments.map(p => [p.id, p.userName, p.userEmail, p.plan, `${p.amount} DA`, p.date]),
                  theme: 'grid',
                  headStyles: { fillColor: [59, 130, 246] },
                });
                doc.save('payments_report.pdf');
              }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl text-xs font-semibold transition shadow-sm">
                <Download size={14} /> Export PDF
              </button>
              <button onClick={() => {
                const ws = XLSX.utils.json_to_sheet(payments);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Payments");
                XLSX.writeFile(wb, "payments_report.xlsx");
              }} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl text-xs font-semibold transition shadow-sm">
                <Download size={14} /> Export Excel
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground/70 text-xs">
                <th className="text-left p-3 font-medium">Payment ID</th>
                <th className="text-left p-3 font-medium">Member</th>
                <th className="text-left p-3 font-medium">Plan</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-blue-500/5">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/50 transition">
                    <td className="p-3"><span className="text-xs font-mono text-muted-foreground">{p.id}</span></td>
                    <td className="p-3">
                      <p className="text-foreground font-medium">{p.userName}</p>
                      <p className="text-[10px] text-muted-foreground">{p.userEmail}</p>
                    </td>
                    <td className="p-3"><span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{p.plan}</span></td>
                    <td className="p-3 text-xs text-muted-foreground">{p.date}</td>
                    <td className="p-3 text-right font-bold text-green-400">{p.amount.toLocaleString()} DA</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payments recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===== LESSONS ===== */}
      {tab === 'lessons' && (
        <motion.div key="les" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons..." className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Subjects</option>
              {['Math','Physics','English','Chemistry','Arabic'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Levels</option>
              {['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => setShowModal({ type: 'add-lesson' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filter(lessons, ['title','subject','teacher','id']).map(l => (
              <div key={l.id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{l.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-muted-foreground'}`}>{l.status}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{l.subject}</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{l.level}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{l.type}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">{l.teacher} · {l.date}</p>
                <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-blue-500/5">
                  <button className="p-1 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={12} /></button>
                  <button onClick={() => deleteItem('lessons', l.id)} className="p-1 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== GROUPS ===== */}
      {tab === 'groups' && (
        <motion.div key="grp" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-group' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filter(groups, ['name','createdBy','id']).map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{g.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.type === 'public' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{g.type}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span>{g.members} members</span>
                  <span className={`${g.status === 'active' ? 'text-green-400' : 'text-muted-foreground/70'}`}>{g.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">by {g.createdBy} · {g.createdAt}</p>
                <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-blue-500/5">
                  <button onClick={() => deleteItem('groups', g.id)} className="p-1 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== QR SCANNER ===== */}
      {tab === 'scanner' && (
        <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stats bar */}
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xs text-muted-foreground/70">Total</p><p className="text-lg font-bold text-foreground">{students.length}</p></div>
            <div><p className="text-xs text-muted-foreground/70">Active</p><p className="text-lg font-bold text-green-400">{stats.activeStudents}</p></div>
            <div><p className="text-xs text-muted-foreground/70">Suspended</p><p className="text-lg font-bold text-red-400">{stats.suspendedStudents}</p></div>
          </div>

          {/* Camera QR Scanner */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
              <Camera size={16} className="text-blue-400" /> Live Camera Scan
            </h3>
            <p className="text-xs text-muted-foreground/70 mb-4">Camera auto-starts. Point it at a student's QR code. Each scan deducts 1 session (max 4/month).</p>

            {/* Scan result */}
            {scanResult && !cameraActive && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-400">Attendance Marked!</p>
                  <p className="text-xs text-muted-foreground">Student ID: {scanResult}</p>
                </div>
                <button onClick={() => { setScanResult(null); setCameraActive(true); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                  Scan Again
                </button>
              </div>
            )}

            {/* Error */}
            {scanError && !cameraActive && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400" />
                <p className="text-sm text-red-400 flex-1">{scanError}</p>
                <button onClick={() => { setScanError(null); setCameraActive(true); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                  Retry
                </button>
              </div>
            )}

            {/* Camera view (always on when scanner tab is active) */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-blue-400/60 rounded-xl animate-pulse" />
                </div>
                <div className="absolute top-3 left-3 bg-black/60 text-foreground text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <Loader size={12} className="animate-spin" /> Scanning...
                </div>
              </div>
              <div className="flex gap-2">
                <p className="text-xs text-muted-foreground/70 flex-1 text-center">Position the QR code within the blue frame</p>
                <button onClick={() => {
                  const active = students.filter(s => s.status === 'active');
                  if (active.length) {
                    const r = active[Math.floor(Math.random() * active.length)];
                    setStudents(p => p.map(s => s.id === r.id ? { ...s, monthSessions: Math.max(0, s.monthSessions - 1), status: s.monthSessions - 1 <= 0 ? 'suspended' : s.status, lastScan: new Date().toISOString().slice(0,10) } : s));
                    setScanResult(r.id);
                  }
                }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-[#243447] text-foreground/80 transition flex items-center gap-1 flex-shrink-0">
                  <QrCode size={12} /> Simulate
                </button>
              </div>
            </div>
          </div>

          {/* Search & mark attendance */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
              <Search size={16} className="text-blue-400" /> Find Student by Name or Email
            </h3>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Type name or email to find a student..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-400/40 transition placeholder:text-muted-foreground/50 mb-4" />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filter(students, ['name', 'email', 'id']).length === 0 ? (
                <p className="text-sm text-muted-foreground/70 text-center py-4">No students match your search</p>
              ) : filter(students, ['name', 'email', 'id']).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-[#243447] transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="bg-white rounded-lg p-1 w-10 h-10 flex items-center justify-center">
                        <QRCodeCanvas value={JSON.stringify({ id: s.id, name: s.name, email: s.email })} size={32} level="H" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                      </div>
                      <p className="text-xs text-muted-foreground/70 truncate">{s.email} · {s.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${s.monthSessions > 0 ? 'text-blue-400' : 'text-red-400'}`}>{s.monthSessions}/4</span>
                    <button onClick={() => setShowQRForStudent(s)}
                      className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition opacity-0 group-hover:opacity-100" title="View full QR">
                      <QrCode size={14} />
                    </button>
                    <button onClick={() => {
                      setStudents(p => p.map(x => x.id === s.id ? {
                        ...x,
                        monthSessions: Math.max(0, x.monthSessions - 1),
                        status: x.monthSessions - 1 <= 0 ? 'suspended' : x.status,
                        lastScan: new Date().toISOString().slice(0, 10)
                      } : x));
                    }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        s.monthSessions > 0
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-gray-500/20 text-muted-foreground/70 cursor-not-allowed'
                      }`}
                      disabled={s.monthSessions <= 0}>
                      <Camera size={12} /> Mark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== QR CODE MODAL ===== */}
      <AnimatePresence>
        {showQRForStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRForStudent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border/60 rounded-2xl p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{showQRForStudent.name}</h3>
                <button onClick={() => setShowQRForStudent(null)} className="text-muted-foreground/70 hover:text-foreground transition"><XCircle size={20} /></button>
              </div>
              <div className="bg-white rounded-xl p-4 inline-block mx-auto mb-3">
                <QRCodeCanvas value={JSON.stringify({ id: showQRForStudent.id, name: showQRForStudent.name, email: showQRForStudent.email })} size={200} level="H" includeMargin />
              </div>
              <p className="text-xs text-muted-foreground/70">{showQRForStudent.id} · {showQRForStudent.email}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Sessions: {showQRForStudent.monthSessions}/4 · {showQRForStudent.status}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ADMINS ===== */}
      {tab === 'admins' && (
        <motion.div key="adm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground/70 text-xs">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Last Active</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-blue-500/5">
                {adminsList.map(a => (
                  <tr key={a.id} className="hover:bg-secondary/50 transition">
                    <td className="p-3"><span className="text-foreground font-medium">{a.name}</span></td>
                    <td className="p-3 text-muted-foreground text-xs">{a.email}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${a.role === 'superadmin' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{a.role}</span></td>
                    <td className="p-3 text-xs text-muted-foreground/70">{a.lastActive}</td>
                    <td className="p-3 text-right">
                      {a.email !== 'hamda.laidi.14@gmail.com' && <button className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===== MODAL FORM ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border/60 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground capitalize">{showModal.type.replace('-', ' ')}</h3>
                <button onClick={() => setShowModal(null)} className="text-muted-foreground/70 hover:text-foreground transition"><XCircle size={20} /></button>
              </div>

              {/* ===== STUDENT FORM ===== */}
              {(showModal.type === 'add-student' || showModal.type === 'edit-student') && (
                <StudentForm
                  initial={showModal.type === 'edit-student' ? showModal.data : null}
                  onSave={(data) => {
                    if (showModal.type === 'edit-student') {
                      setStudents(p => p.map(s => s.id === data.id ? data : s));
                    } else {
                      setStudents(p => [...p, { ...data, id: `STU-${String(p.length + 1).padStart(3, '0')}` }]);
                    }
                    setShowModal(null);
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== TEACHER FORM ===== */}
              {(showModal.type === 'add-teacher' || showModal.type === 'edit-teacher') && (
                <TeacherForm
                  initial={showModal.type === 'edit-teacher' ? showModal.data : null}
                  onSave={(data) => {
                    if (showModal.type === 'edit-teacher') {
                      setTeachers(p => p.map(t => t.id === data.id ? data : t));
                    } else {
                      setTeachers(p => [...p, { ...data, id: `TCH-${String(p.length + 1).padStart(3, '0')}`, paid: false, paidDate: '', hireDate: new Date().toISOString().slice(0, 10) }]);
                    }
                    setShowModal(null);
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== LESSON FORM ===== */}
              {(showModal.type === 'add-lesson' || showModal.type === 'edit-lesson') && (
                <LessonForm
                  initial={showModal.type === 'edit-lesson' ? showModal.data : null}
                  onSave={(data) => {
                    if (showModal.type === 'edit-lesson') {
                      setLessons(p => p.map(l => l.id === data.id ? data : l));
                    } else {
                      setLessons(p => [...p, { ...data, id: `LES-${String(p.length + 1).padStart(3, '0')}` }]);
                    }
                    setShowModal(null);
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== GROUP FORM ===== */}
              {showModal.type === 'add-group' && (
                <GroupForm
                  onSave={(data) => {
                    setGroups(p => [...p, { ...data, id: `GRP-${String(p.length + 1).padStart(3, '0')}`, members: 0, createdBy: user?.name || 'Admin', createdAt: new Date().toISOString().slice(0, 10), status: 'active' }]);
                    setShowModal(null);
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
