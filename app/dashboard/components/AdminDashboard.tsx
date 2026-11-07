'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Shield, Users, BookOpen, DollarSign, QrCode, School, TrendingUp,
  Calendar, CheckCircle, XCircle, AlertTriangle, AlertCircle, Search, Camera,
  Download, Plus, Minus, ChevronRight, Clock, CreditCard, UserCheck, Award,
  Trash2, Edit, Filter, GraduationCap, MessageSquare, Video,
  UserPlus, UserX, Percent, Loader, X,
} from 'lucide-react';
import Link from 'next/link';
import { AdminPulse } from '@/components/dashboard/sections/AdminPulse';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '@/lib/use-toast';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';

/* ════════════════════════════════════════════════════════════════════════════════
   TYPES
═════════════════════════════════════════════════════════════════════════════════ */

interface Student {
  id: string; name: string; email: string; level: string; phone: string;
  monthSessions: number; totalSessions: number; status: 'active' | 'inactive' | 'suspended';
  lastScan: string; enrolledDate: string;
}
interface Teacher {
  id: string; name: string; email: string; subject: string; phone: string;
  monthlySalary: number; paid: boolean; paidDate: string; hireDate: string; level: string;
  sexe: string; age: number; specialite: string;
}
interface Revenue {
  id: string; source: string; amount: number; date: string; type: 'income' | 'expense'; category: string;
}
interface Lesson {
  id: string; title: string; subject: string; level: string; type: string;
  teacher: string; date: string; status: string;
}
interface Group {
  id: string; name: string; members: number; type: 'public' | 'private'; createdBy: string;
  createdAt: string; status: 'active' | 'archived';
  image?: string; description?: string; memberIds?: string[];
}
interface Payment {
  id: string; userId: string; userName: string; userEmail: string;
  plan: string; amount: number; date: string; status: string;
}

/* ═════════════════════════════════════════════════════════════════════════════════
   FORM COMPONENTS
═════════════════════════════════════════════════════════════════════════════════ */

function StudentForm({ initial, onSave, onCancel }: {
  initial: Student | null; onSave: (data: Omit<Student, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [level, setLevel] = useState(initial?.level || 'CEM-1');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [status, setStatus] = useState<string>(initial?.status || 'active');

  const levels = ['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'];

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave({ name, email, level, phone, monthSessions: 4, totalSessions: 0,
        status: status as any, lastScan: new Date().toISOString().slice(0,10),
        enrolledDate: new Date().toISOString().slice(0,10) });
    }} className="space-y-4">
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Nom complet</label>
      <input type="text" name="name" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="Ahmed Benali"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</label>
      <input type="email" name="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@ecole.dz"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Niveau</label>
      <select value={level} onChange={(e) => setLevel(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="CEM-1">CEM-1</option>
        <option value="CEM-2">CEM-2</option>
        <option value="CEM-3">CEM-3</option>
        <option value="Lycée-1">Lycée-1</option>
        <option value="Lycée-2">Lycée-2</option>
        <option value="Lycée-3">Lycée-3</option>
      </select>
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Téléphone</label>
      <input type="text" name="phone" value={phone}
        onChange={(e) => setPhone(e.target.value)} placeholder="0555-123456"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Statut</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
        <option value="suspended">Suspendu</option>
      </select>
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
        Annuler
      </button>
      <button type="submit"
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all">
        {initial ? 'Enregistrer' : 'Créer'}
      </button>
    </div>
    </form>
  );
}

function TeacherForm({ initial, onSave, onCancel }: {
  initial: Teacher | null; onSave: (data: Omit<Teacher, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [sexe, setSexe] = useState(initial?.sexe || 'Homme');
  const [age, setAge] = useState(String(initial?.age || ''));
  const [specialite, setSpecialite] = useState(initial?.specialite || 'Mathematics');
  const [subject, setSubject] = useState(initial?.subject || 'Mathematics');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [monthlySalary, setMonthlySalary] = useState(String(initial?.monthlySalary || ''));
  const [level, setLevel] = useState(initial?.level || 'CEM 1-3');

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave({ name, email, subject, phone, monthlySalary: Number(monthlySalary) || 0,
        paid: false, paidDate: '', hireDate: new Date().toISOString().slice(0,10),
        level, sexe, age: Number(age) || 0, specialite });
    }} className="space-y-4">
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Nom complet</label>
      <input type="text" name="name" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="Dr. Sarah Smith"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</label>
      <input type="email" name="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="sarah@ecole.dz"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Matière</label>
      <input type="text" name="subject" value={subject}
        onChange={(e) => setSubject(e.target.value)} placeholder="Mathématiques"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Salaire mensuel (DA)</label>
      <input type="number" name="monthlySalary" value={monthlySalary}
        onChange={(e) => setMonthlySalary(e.target.value)} placeholder="2400"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
        Annuler
      </button>
      <button type="submit"
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all">
        {initial ? 'Enregistrer' : 'Créer'}
      </button>
    </div>
    </form>
  );
}

function LessonForm({ initial, onSave, onCancel }: {
  initial: Lesson | null; onSave: (data: Omit<Lesson, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [subject, setSubject] = useState(initial?.subject || 'Math');
  const [level, setLevel] = useState(initial?.level || 'CEM-1');
  const [type, setType] = useState<string>(initial?.type || 'course');
  const [teacher, setTeacher] = useState(initial?.teacher || '');
  const [status, setStatus] = useState<string>(initial?.status || 'draft');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0,10));

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave({ title, subject, level, type, teacher, status, date });
    }} className="space-y-4">
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Titre</label>
      <input type="text" name="title" value={title}
        onChange={(e) => setTitle(e.target.value)} placeholder="Calculus Fundamentals"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Matière</label>
      <select value={subject} onChange={(e) => setSubject(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="Math">Math</option>
        <option value="Physics">Physics</option>
        <option value="English">English</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Arabic">Arabic</option>
      </select>
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Niveau</label>
      <select value={level} onChange={(e) => setLevel(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="CEM-1">CEM-1</option>
        <option value="CEM-2">CEM-2</option>
        <option value="CEM-3">CEM-3</option>
        <option value="Lycée-1">Lycée-1</option>
        <option value="Lycée-2">Lycée-2</option>
        <option value="Lycée-3">Lycée-3</option>
      </select>
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="course">Cours</option>
        <option value="td">TD</option>
        <option value="tp">TP</option>
        <option value="exam">Examen</option>
      </select>
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Enseignant</label>
      <input type="text" name="teacher" value={teacher}
        onChange={(e) => setTeacher(e.target.value)} placeholder="Dr. Sarah Smith"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Date</label>
      <input type="date" name="date" value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Statut</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="published">Publié</option>
        <option value="draft">Brouillon</option>
      </select>
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
        Annuler
      </button>
      <button type="submit"
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all">
        {initial ? 'Enregistrer' : 'Créer'}
      </button>
    </div>
    </form>
  );
}

function GroupForm({ onSave, onCancel }: {
  onSave: (data: Omit<Group, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave({ name, description, type, members: 0,
        createdBy: 'Admin', createdAt: new Date().toISOString().slice(0,10), status: 'active' });
    }} className="space-y-4">
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Nom du groupe</label>
      <input type="text" name="name" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="Math Study Circle"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Description</label>
      <input type="text" name="description" value={description}
        onChange={(e) => setDescription(e.target.value)} placeholder="Groupe d'étude"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Type</label>
      <select value={type} onChange={(e) => setType(e.target.value as any)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="public">Public</option>
        <option value="private">Privé</option>
      </select>
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
        Annuler
      </button>
      <button type="submit"
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all">
        Créer
      </button>
    </div>
    </form>
  );
}

function AdminForm({ initial, onSave, onCancel }: {
  initial: { id: string; name: string; email: string; role: string } | null;
  onSave: (data: { name: string; email: string; role: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [role, setRole] = useState(initial?.role || 'admin');

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave({ name, email, role });
    }} className="space-y-4">
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Nom complet</label>
      <input type="text" name="name" value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</label>
      <input type="email" name="email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Rôle</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
        <option value="admin">Administrateur</option>
      </select>
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
        Annuler
      </button>
      <button type="submit"
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all">
        {initial ? 'Enregistrer' : 'Ajouter'}
      </button>
    </div>
    </form>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═════════════════════════════════════════════════════════════════════════════════ */

export function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');

  /* ----- Data state (all from Supabase, no mock) ----- */
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [adminsList, setAdminsList] = useState<{id:string;name:string;email:string;role:string;lastActive:string}[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----- Auth token helper ----- */
  const getToken = useCallback(async (): Promise<string | null> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const apiHeaders = useCallback(async (): Promise<Headers> => {
    const token = await getToken();
    return new Headers({ Authorization: `Bearer ${token ?? ''}` });
  }, [getToken]);

  /* ----- Fetch all data from Supabase APIs ----- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await apiHeaders();
      const now = new Date().toISOString().slice(0, 10);

      // Students
      const stuRes = await fetch('/api/admin/students', { headers });
      if (stuRes.ok) {
        const { students: stuData } = await stuRes.json();
        if (stuData) {
          setStudents(stuData.map((p: any) => ({
            id: p.id,
            name: p.name || p.email?.split('@')[0] || 'Inconnu',
            email: p.email || '',
            level: p.level || '—',
            phone: p.phone || '',
            monthSessions: p.active ? 4 : 0,
            totalSessions: p.active ? 4 : 0,
            status: (p.active ? 'active' : 'inactive') as any,
            lastScan: now,
            enrolledDate: p.created_at?.slice(0, 10) || now,
          })));
        }
      }

      // Teachers (from profiles where role = teacher)
      const tchRes = await fetch('/api/admin/students', { headers }); // reuse students endpoint won't work for teachers
      // Instead fetch teachers directly from supabase
      const supabase = createClient();
      const { data: teacherProfiles } = await supabase
        .from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
      if (teacherProfiles) {
        setTeachers(teacherProfiles.map((t: any) => ({
          id: t.id, name: t.name || t.email?.split('@')[0] || 'Inconnu', email: t.email || '',
          subject: t.subject || '—', phone: t.phone || '', monthlySalary: t.monthly_salary ?? 0,
          paid: !!t.salary_paid, paidDate: t.salary_paid_at ?? '', hireDate: t.created_at?.slice(0,10) || now,
          level: t.level || '—', sexe: t.sexe || '—', age: t.age ?? 0, specialite: t.specialite || '—',
        })));
      }

      // Groups
      const grpRes = await fetch('/api/admin/groups', { headers });
      if (grpRes.ok) {
        const { groups: grpData } = await grpRes.json();
        if (grpData) {
          setGroups(grpData.map((g: any) => ({
            id: g.id, name: g.name, members: g.members_count || 0,
            type: (g.tags?.includes('private') ? 'private' : 'public') as any,
            createdBy: g.created_by || '', createdAt: g.created_at?.slice(0, 10) || '',
            status: 'active' as any,
          })));
        }
      }

      // Meetings → lessons
      const meetRes = await fetch('/api/admin/meetings', { headers });
      if (meetRes.ok) {
        const { meetings: meetData } = await meetRes.json();
        if (meetData) {
          setLessons(meetData.map((m: any) => ({
            id: m.id, title: m.title, subject: m.description || 'Réunion',
            level: '—', type: 'course', teacher: '', date: m.date || '',
            status: 'published',
          })));
        }
      }

      // Payments
      const payRes = await fetch('/api/admin/payments', { headers });
      if (payRes.ok) {
        const { payments: payData } = await payRes.json();
        if (payData) {
          setPayments(payData.map((p: any) => ({
            id: p.id, userId: p.userId || '', userName: p.userName || '',
            userEmail: p.userEmail || '', plan: p.plan || '—', amount: p.amount || 0,
            date: p.date || '', status: p.status || 'pending',
          })));
        }
      }

      // Revenues from payments + expenses via financial summary
      const supabase2 = createClient();
      const { data: finData } = await supabase2
        .rpc('dashboard_get_financial_summary');
      if (finData?.[0]) {
        const f = finData[0];
        const revs: Revenue[] = [];
        if (Number(f.total_revenue) > 0) revs.push({ id: 'rev-1', source: 'Paiements', amount: Number(f.total_revenue), date: now, type: 'income', category: 'Frais de scolarité' });
        if (Number(f.total_expenses) > 0) revs.push({ id: 'rev-2', source: 'Dépenses', amount: Number(f.total_expenses), date: now, type: 'expense', category: 'Opérations' });
        if (Number(f.total_salaries) > 0) revs.push({ id: 'rev-3', source: 'Salaires', amount: Number(f.total_salaries), date: now, type: 'expense', category: 'Salaires' });
        setRevenues(revs);
      }

      // Admins
      const { data: adminProfiles } = await supabase2
        .from('profiles').select('*').eq('role', 'admin').order('created_at', { ascending: false });
      if (adminProfiles) {
        setAdminsList(adminProfiles.map((a: any) => ({
          id: a.id, name: a.name || a.email?.split('@')[0] || 'Inconnu', email: a.email || '',
          role: a.role || 'admin', lastActive: a.updated_at?.slice(0,10) || now,
        })));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des données');
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec du chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [apiHeaders, toast]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  /* ----- Search & filter ----- */
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filter = (items: any[], fields: string[]) => {
    let filtered = items;
    if (search) filtered = filtered.filter((i) => fields.some((f) => String(i[f]).toLowerCase().includes(search.toLowerCase())));
    if (filterLevel !== 'all') filtered = filtered.filter((i) => i.level === filterLevel || i.level?.includes(filterLevel));
    if (filterSubject !== 'all') filtered = filtered.filter((i) => i.subject === filterSubject);
    if (filterStatus !== 'all') filtered = filtered.filter((i) => i.status === filterStatus);
    return filtered;
  };

  /* ----- Stats ----- */
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'active').length,
    suspendedStudents: students.filter((s) => s.status === 'suspended').length,
    totalTeachers: teachers.length,
    paidTeachers: teachers.filter((t) => t.paid).length,
    totalRevenue: revenues.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0),
    totalExpenses: revenues.filter((r) => r.type === 'expense').reduce((s, r) => s + Math.abs(r.amount), 0),
    totalSalary: teachers.reduce((s, t) => s + t.monthlySalary, 0),
    totalLessons: lessons.length,
    totalGroups: groups.length,
  };
  const netRevenue = stats.totalRevenue - stats.totalExpenses;

  /* ----- CRUD handlers ----- */

  const handleSaveStudent = async (data: Omit<Student, 'id'>, editId?: string) => {
    const { createStudent, updateStudent } = await import('@/lib/dashboard');
    const res = editId ? await updateStudent(editId, { name: data.name, email: data.email, level: data.level })
      : await createStudent({ name: data.name, email: data.email, level: data.level });
    if (!res.success) throw new Error(res.error || 'Échec de l\'opération');
    await fetchAll();
  };

  const handleDeleteStudent = async (id: string) => {
    const { deleteStudent } = await import('@/lib/dashboard');
    const res = await deleteStudent(id);
    if (res.success) { await fetchAll(); }
    else throw new Error(res.error || 'Échec de la suppression');
  };

  const handleSaveTeacher = async (data: Omit<Teacher, 'id'>, editId?: string) => {
    const supabase = createClient();
    if (editId) {
      const { error } = await supabase.from('profiles').update({
        name: data.name, email: data.email, subject: data.subject, phone: data.phone,
        monthly_salary: data.monthlySalary, level: data.level, sexe: data.sexe,
        age: data.age, specialite: data.specialite,
      }).eq('id', editId).eq('role', 'teacher');
      if (error) throw new Error(error.message);
    } else {
      // Teacher creation requires an auth user; create profile only if user exists
      const { error } = await supabase.from('profiles').insert({
        name: data.name, email: data.email, role: 'teacher', subject: data.subject,
        phone: data.phone, monthly_salary: data.monthlySalary, level: data.level,
        sexe: data.sexe, age: data.age, specialite: data.specialite,
      });
      if (error) throw new Error(error.message);
    }
    await fetchAll();
  };

  const handleDeleteTeacher = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').delete().eq('id', id).eq('role', 'teacher');
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const handleSaveLesson = async (data: Omit<Lesson, 'id'>, editId?: string) => {
    const supabase = createClient();
    if (editId) {
      const { error } = await supabase.from('lessons').update({
        title: data.title, subject: data.subject, level: data.level, type: data.type,
        teacher: data.teacher, status: data.status, date: data.date,
      }).eq('id', editId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('lessons').insert({
        title: data.title, subject: data.subject, level: data.level, type: data.type,
        teacher: data.teacher, status: data.status, date: data.date,
      });
      if (error) throw new Error(error.message);
    }
    await fetchAll();
  };

  const handleDeleteLesson = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const handleSaveGroup = async (data: Omit<Group, 'id'>) => {
    const headers = await apiHeaders();
    const res = await fetch('/api/admin/groups', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, description: data.description, image: data.image, type: data.type }),
    });
    if (!res.ok) throw new Error('Échec de création du groupe');
    await fetchAll();
  };

  const handleDeleteGroup = async (id: string) => {
    const headers = await apiHeaders();
    const res = await fetch(`/api/admin/groups?id=${id}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Échec de suppression du groupe');
    await fetchAll();
  };

  const handleSavePayment = async (data: Omit<Payment, 'id'>, editId?: string) => {
    const { createPayment, updatePayment } = await import('@/lib/dashboard');
    const res = editId
      ? await updatePayment(editId, { amount: data.amount, status: data.status as any, plan_title: data.plan })
      : await createPayment({ user_id: data.userId, amount: data.amount, status: data.status as any, plan_title: data.plan });
    if (!res.success) throw new Error(res.error || 'Échec de l\'opération');
    await fetchAll();
  };

  const handleDeletePayment = async (id: string) => {
    const { deletePayment } = await import('@/lib/dashboard');
    const res = await deletePayment(id);
    if (res.success) { await fetchAll(); }
    else throw new Error(res.error || 'Échec de la suppression');
  };

  const markSession = async (studentId: string, moduleId: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Session expirée. Veuillez vous reconnecter.'); return; }
    const res = await fetch('/api/admin/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ studentId, moduleId }),
    });
    if (!res.ok) { const json = await res.json(); alert(json.error || 'Échec du marquage'); return; }
    await fetchAll();
  };

  const addSessions = (studentId: string) => {
    setStudents((p) => p.map((s) => s.id === studentId ? { ...s, monthSessions: 4, totalSessions: s.totalSessions + 4, status: 'active', lastScan: new Date().toISOString().slice(0,10) } : s));
  };
  const removeSession = (studentId: string) => {
    setStudents((p) => p.map((s) => s.id === studentId ? { ...s, monthSessions: Math.max(0, s.monthSessions - 1), status: s.monthSessions - 1 <= 0 ? 'suspended' : s.status, lastScan: new Date().toISOString().slice(0,10) } : s));
  };
  const toggleStatus = (studentId: string) => {
    setStudents((p) => p.map((s) => s.id === studentId ? { ...s, status: s.status === 'active' ? 'inactive' : s.status === 'inactive' ? 'suspended' : 'active', lastScan: new Date().toISOString().slice(0,10) } : s));
  };

  /* ----- Modal state ----- */
  const [showModal, setShowModal] = useState<{ type: string; data?: any } | null>(null);
  const [showQRForStudent, setShowQRForStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  /* ----- QR Camera ----- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState('Math');
  const [scannedStudentId, setScannedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (tab === 'scanner') {
      setCameraActive(true);
    } else {
      scanningRef.current = false;
      setCameraActive(false);
      setScanResult(null);
      setScanError(null);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [tab]);

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
                scanningRef.current = false;
                setCameraActive(false);
                streamRef.current?.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
                setScannedStudentId(parsed.id);
                setScanError(null);
                return;
              }
            } catch { /* ignore parse errors */ }
          }
          if (scanningRef.current) animId = requestAnimationFrame(scan);
        };
        animId = requestAnimationFrame(scan);
      } catch {
        setScanError('Accès caméra refusé. Autorisez les permissions.');
        setCameraActive(false);
        scanningRef.current = false;
      }
    };
    start();
    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(animId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [cameraActive]);

  if (!user || user.role !== 'admin') return null;

  /* ----- Tabs ----- */
  const tabs = [
    { id: 'overview', label: 'Overview', icon: School },
    { id: 'students', label: 'Étudiants', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: Award },
    { id: 'revenue', label: 'Revenus', icon: DollarSign },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'lessons', label: 'Leçons', icon: BookOpen },
    { id: 'groups', label: 'Groupes', icon: MessageSquare },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'admins', label: 'Admins', icon: Shield },
  ];

  return (
    <div className="admin-modern relative p-4 md:p-6 space-y-5 pb-24">
      <ToastContainer />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-panel glass-border-gold p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.32), transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.28), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/25 to-cyan-400/10">
              <Shield size={20} className="text-cyan-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">Administration</h1>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
                  Bendella School
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Élèves, enseignants, paiements et sessions · données en temps réel
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Supabase connecté
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex w-max gap-1.5 rounded-2xl border border-white/10 bg-black/30 p-1.5 backdrop-blur-xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && !error && (
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-yellow-400 font-semibold text-sm">Chargement du tableau de bord…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminPulse />
        </motion.div>
      )}

      {/* ===== STUDENTS ===== */}
      {tab === 'students' && (
        <motion.div key="stu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground/70" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un étudiant…"
                className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Tous les niveaux</option>
              <option value="CEM-1">CEM-1</option>
              <option value="CEM-2">CEM-2</option>
              <option value="CEM-3">CEM-3</option>
              <option value="Lycée-1">Lycée-1</option>
              <option value="Lycée-2">Lycée-2</option>
              <option value="Lycée-3">Lycée-3</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-student' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground/70 text-xs">
                    <th className="text-left p-3 font-medium">Nom</th>
                    <th className="text-left p-3 font-medium">Niveau</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-left p-3 font-medium">Sessions</th>
                    <th className="text-left p-3 font-medium">Téléphone</th>
                    <th className="text-center p-3 font-medium">QR</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/5">
                  {filter(students, ['name','email','id','level']).length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun étudiant trouvé.</td></tr>
                  ) : filter(students, ['name','email','id','level']).map((s) => (
                    <tr key={s.id} className="hover:bg-secondary/50 transition">
                      <td className="p-3"><p className="text-foreground font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground/50">{s.id}</p></td>
                      <td className="p-3 text-muted-foreground">{s.level}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{s.status}</span></td>
                      <td className="p-3"><span className={s.monthSessions > 0 ? 'text-blue-400' : 'text-red-400'}>{s.monthSessions}/4</span></td>
                      <td className="p-3 text-muted-foreground text-xs">{s.phone}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => setShowQRForStudent(s)}
                          className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition" title="Code QR">
                          <QrCode size={14} />
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => addSessions(s.id)} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition" title="Renouveler (+4 sessions)">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeSession(s.id)} disabled={s.monthSessions === 0} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-40" title="Retirer 1 session">
                          <Minus size={12} />
                        </button>
                        <button onClick={() => toggleStatus(s.id)} className="p-1.5 text-muted-foreground/70 hover:text-blue-400 rounded-lg transition" title="Basculer présence">
                          {s.status === 'active' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        </button>
                        <button onClick={() => setShowModal({ type: 'edit-student', data: s })} className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteStudent(s.id)} className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un enseignant…"
                className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Toutes les matières</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="English">English</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Arabic">Arabic</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-teacher' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground/70 text-xs">
                    <th className="text-left p-3 font-medium">Nom</th>
                    <th className="text-left p-3 font-medium">Sexe</th>
                    <th className="text-left p-3 font-medium">Âge</th>
                    <th className="text-left p-3 font-medium">Matière</th>
                    <th className="text-left p-3 font-medium">Niveau</th>
                    <th className="text-left p-3 font-medium">Salaire</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/5">
                  {filter(teachers, ['name','email','subject','id']).length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Aucun enseignant trouvé.</td></tr>
                  ) : filter(teachers, ['name','email','subject','id']).map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/50 transition">
                      <td className="p-3"><p className="text-foreground font-medium">{t.name}</p><p className="text-[10px] text-muted-foreground/50">{t.id}</p></td>
                      <td className="p-3 text-muted-foreground text-xs">{t.sexe}</td>
                      <td className="p-3 text-muted-foreground text-xs">{t.age}</td>
                      <td className="p-3 text-muted-foreground text-xs">{t.specialite}</td>
                      <td className="p-3 text-muted-foreground text-xs">{t.level}</td>
                      <td className="p-3"><span className="text-foreground font-medium">{t.monthlySalary.toLocaleString()} DA</span></td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.paid ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{t.paid ? 'Payé' : 'Impayé'}</span></td>
                      <td className="p-3 text-right">
                        <button onClick={() => setShowModal({ type: 'edit-teacher', data: t })} className="p-1.5 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteTeacher(t.id)} className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>
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
              { label: 'Revenus totaux', value: `+${stats.totalRevenue.toLocaleString()} DA`, color: 'text-green-400' },
              { label: 'Dépenses totales', value: `-${stats.totalExpenses.toLocaleString()} DA`, color: 'text-red-400' },
              { label: 'Revenu net', value: `${netRevenue.toLocaleString()} DA`, color: netRevenue >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Pool salaires', value: `${stats.totalSalary.toLocaleString()} DA`, color: 'text-amber-400' },
            ].map((d) => (
              <div key={d.label} className="bg-card border border-border rounded-xl p-4">
                <p className={`text-xl font-bold ${d.color}`}>{d.value}</p>
                <p className="text-xs text-muted-foreground/70">{d.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground/70 text-xs">
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Catégorie</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-right p-3 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/5">
                {revenues.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucune opération financière enregistrée.</td></tr>
                ) : revenues.map((r) => (
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
              <CreditCard size={18} className="text-blue-400" /> Paiements des membres
            </h2>
            <div className="flex gap-2">
              <button onClick={() => {
                const doc = new jsPDF();
                doc.text('Rapport des Paiements Mensuels', 14, 15);
                (doc as any).autoTable({
                  startY: 20,
                  head: [['ID', 'Nom', 'Email', 'Plan', 'Montant', 'Date']],
                  body: payments.map((p) => [p.id, p.userName, p.userEmail, p.plan, `${p.amount} DA`, p.date]),
                  theme: 'grid',
                  headStyles: { fillColor: [59, 130, 246] },
                });
                doc.save('rapport_paiements.pdf');
              }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl text-xs font-semibold transition shadow-sm">
                <Download size={14} /> Exporter PDF
              </button>
              <button onClick={() => {
                const ws = XLSX.utils.json_to_sheet(payments);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Paiements");
                XLSX.writeFile(wb, "rapport_paiements.xlsx");
              }} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl text-xs font-semibold transition shadow-sm">
                <Download size={14} /> Exporter Excel
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground/70 text-xs">
                  <th className="text-left p-3 font-medium">ID Paiement</th>
                  <th className="text-left p-3 font-medium">Membre</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-right p-3 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/5">
                {payments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun paiement enregistré pour le moment.</td></tr>
                ) : payments.map((p) => (
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une leçon…"
                className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Toutes les matières</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="English">English</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Arabic">Arabic</option>
            </select>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Tous les niveaux</option>
              <option value="CEM-1">CEM-1</option>
              <option value="CEM-2">CEM-2</option>
              <option value="CEM-3">CEM-3</option>
              <option value="Lycée-1">Lycée-1</option>
              <option value="Lycée-2">Lycée-2</option>
              <option value="Lycée-3">Lycée-3</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-lesson' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filter(lessons, ['title','subject','teacher','id']).length === 0 ? (
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Aucune leçon trouvée.</p>
              </div>
            ) : filter(lessons, ['title','subject','teacher','id']).map((l) => (
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
                  <button onClick={() => setShowModal({ type: 'edit-lesson', data: l })} className="p-1 text-muted-foreground/70 hover:text-blue-400 transition"><Edit size={12} /></button>
                  <button onClick={() => handleDeleteLesson(l.id)} className="p-1 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={12} /></button>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un groupe…"
                className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2 border border-border">
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="archived">Archivé</option>
            </select>
            <button onClick={() => setShowModal({ type: 'add-group' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filter(groups, ['name','createdBy','id']).length === 0 ? (
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Aucun groupe trouvé.</p>
              </div>
            ) : filter(groups, ['name','createdBy','id']).map((g) => (
              <div key={g.id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{g.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.type === 'public' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{g.type}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span>{g.members} membres</span>
                  <span className={`${g.status === 'active' ? 'text-green-400' : 'text-muted-foreground/70'}`}>{g.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">par {g.createdBy} · {g.createdAt}</p>
                <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-blue-500/5">
                  <button onClick={() => handleDeleteGroup(g.id)} className="p-1 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== QR SCANNER ===== */}
      {tab === 'scanner' && (
        <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xs text-muted-foreground/70">Total</p><p className="text-lg font-bold text-foreground">{students.length}</p></div>
            <div><p className="text-xs text-muted-foreground/70">Actifs</p><p className="text-lg font-bold text-green-400">{stats.activeStudents}</p></div>
            <div><p className="text-xs text-muted-foreground/70">Suspendus</p><p className="text-lg font-bold text-red-400">{stats.suspendedStudents}</p></div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" /> Module
            </h3>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-400/40 transition">
              {['Math','Physics','English','Chemistry','Arabic','History','Biology','Computer Science'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
              <Search size={16} className="text-blue-400" /> Trouver un étudiant par nom ou email
            </h3>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tapez le nom ou l'email de l'étudiant…"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-400/40 transition placeholder:text-muted-foreground/50 mb-4" />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filter(students, ['name', 'email', 'id']).length === 0 ? (
                <p className="text-sm text-muted-foreground/70 text-center py-4">Aucun étudiant ne correspond à votre recherche</p>
              ) : filter(students, ['name', 'email', 'id']).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-[#243447] transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                  <button onClick={() => markSession(s.id, selectedModule)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="Marquer la séance">
                    <Calendar size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {scannedStudentId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setScannedStudentId(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border/60 rounded-2xl p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-foreground">Séance marquée</h3>
                <p className="text-muted-foreground mt-2">L'étudiant a été scanné avec succès.</p>
                <button onClick={() => setScannedStudentId(null)} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-bold transition">
                  Fermer
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ===== ADMINS ===== */}
      {tab === 'admins' && (
        <motion.div key="adm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1" />
            <button onClick={() => setShowModal({ type: 'add-admin' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
              <Plus size={14} /> Ajouter un admin
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground/70 text-xs">
                  <th className="text-left p-3 font-medium">Nom</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Rôle</th>
                  <th className="text-left p-3 font-medium">Dernière activité</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/5">
                {adminsList.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/50 transition">
                    <td className="p-3"><span className="text-foreground font-medium">{a.name}</span></td>
                    <td className="p-3 text-muted-foreground text-xs">{a.email}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400`}>{a.role}</span></td>
                    <td className="p-3 text-xs text-muted-foreground/70">{a.lastActive}</td>
                    <td className="p-3 text-right">
                      {a.email !== 'hamada.laidi.14@gmail.com' && <button className="p-1.5 text-muted-foreground/70 hover:text-red-400 transition"><Trash2 size={14} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              className="bg-card border border-border/60 rounded-2xl p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

      {/* ===== MODAL FORM ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border/60 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground capitalize">{showModal.type.replace('-', ' ')}</h3>
                <button onClick={() => setShowModal(null)} className="text-muted-foreground/70 hover:text-foreground transition"><XCircle size={20} /></button>
              </div>

              {/* ===== STUDENT FORM ===== */}
              {(showModal.type === 'add-student' || showModal.type === 'edit-student') && (
                <StudentForm
                  initial={showModal.type === 'edit-student' ? showModal.data : null}
                  onSave={async (data) => {
                    setFormLoading(true);
                    try {
                      if (showModal.type === 'edit-student') {
                        await handleSaveStudent(data, showModal.data.id);
                        toast({ title: 'Modifié', description: 'Étudiant mis à jour', variant: 'default' });
                      } else {
                        await handleSaveStudent(data);
                        toast({ title: 'Ajouté', description: 'Nouvel étudiant enregistré', variant: 'success' });
                      }
                      setShowModal(null);
                    } catch (err) {
                      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== TEACHER FORM ===== */}
              {(showModal.type === 'add-teacher' || showModal.type === 'edit-teacher') && (
                <TeacherForm
                  initial={showModal.type === 'edit-teacher' ? showModal.data : null}
                  onSave={async (data) => {
                    setFormLoading(true);
                    try {
                      if (showModal.type === 'edit-teacher') {
                        await handleSaveTeacher(data, showModal.data.id);
                        toast({ title: 'Modifié', description: 'Enseignant mis à jour', variant: 'default' });
                      } else {
                        await handleSaveTeacher(data);
                        toast({ title: 'Ajouté', description: 'Nouvel enseignant enregistré', variant: 'success' });
                      }
                      setShowModal(null);
                    } catch (err) {
                      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== LESSON FORM ===== */}
              {(showModal.type === 'add-lesson' || showModal.type === 'edit-lesson') && (
                <LessonForm
                  initial={showModal.type === 'edit-lesson' ? showModal.data : null}
                  onSave={async (data) => {
                    setFormLoading(true);
                    try {
                      if (showModal.type === 'edit-lesson') {
                        await handleSaveLesson(data, showModal.data.id);
                        toast({ title: 'Modifié', description: 'Leçon mise à jour', variant: 'default' });
                      } else {
                        await handleSaveLesson(data);
                        toast({ title: 'Ajouté', description: 'Nouvelle leçon enregistrée', variant: 'success' });
                      }
                      setShowModal(null);
                    } catch (err) {
                      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== GROUP FORM ===== */}
              {showModal.type === 'add-group' && (
                <GroupForm
                  onSave={async (data) => {
                    setFormLoading(true);
                    try {
                      await handleSaveGroup(data);
                      toast({ title: 'Ajouté', description: 'Nouveau groupe créé', variant: 'success' });
                      setShowModal(null);
                    } catch (err) {
                      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de la création', variant: 'destructive' });
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  onCancel={() => setShowModal(null)}
                />
              )}

              {/* ===== ADMIN FORM ===== */}
              {(showModal.type === 'add-admin' || showModal.type === 'edit-admin') && (
                <AdminForm
                  initial={showModal.type === 'edit-admin' ? showModal.data : null}
                  onSave={async (data) => {
                    setFormLoading(true);
                    try {
                      const supabase = createClient();
                      if (showModal.type === 'edit-admin') {
                        const { error } = await supabase.from('profiles').update({ name: data.name, email: data.email }).eq('id', showModal.data.id).eq('role', 'admin');
                        if (error) throw new Error(error.message);
                        toast({ title: 'Modifié', description: 'Admin mis à jour', variant: 'default' });
                      } else {
                        const { error } = await supabase.from('profiles').insert({ name: data.name, email: data.email, role: 'admin' });
                        if (error) throw new Error(error.message);
                        toast({ title: 'Ajouté', description: 'Nouvel administrateur ajouté', variant: 'success' });
                      }
                      setShowModal(null);
                      await fetchAll();
                    } catch (err) {
                      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
                    } finally {
                      setFormLoading(false);
                    }
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
