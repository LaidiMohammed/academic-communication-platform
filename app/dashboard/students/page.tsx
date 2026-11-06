"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Edit, Trash2, Eye, Search, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/dashboard/modals/Modal';
import { useToast } from '@/lib/use-toast';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';
import {
  getStudents, createStudent, updateStudent, deleteStudent,
  Student,
} from '@/lib/dashboard';
import { SkeletonCard } from '@/components/dashboard/skeleton/SkeletonCard';
import { EmptyState } from '@/components/dashboard/sections/EmptyState';

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: 'CEM-1',
  });

  const levels = ['CEM-1', 'CEM-2', 'CEM-3', 'Lycée-1', 'Lycée-2', 'Lycée-3'];

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des élèves');
      toast({ title: 'Erreur', description: 'Impossible de charger les élèves', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        const res = await updateStudent(editingId, {
          name: formData.name,
          email: formData.email,
          level: formData.level,
        });
        if (res.success) {
          toast({ title: 'Modifié', description: 'Élève mis à jour', variant: 'default' });
        } else {
          throw new Error(res.error || 'Échec de la mise à jour');
        }
      } else {
        const res = await createStudent({
          name: formData.name,
          email: formData.email,
          level: formData.level,
        });
        if (res.success) {
          toast({ title: 'Ajouté', description: 'Nouvel élève enregistré', variant: 'success' });
        } else {
          throw new Error(res.error || 'Échec de la création');
        }
      }
      setOpenModal(false);
      setEditingId(null);
      setFormData({ name: '', email: '', level: 'CEM-1' });
      await fetchStudents();
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({ name: student.name, email: student.email, level: student.level });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet élève ?')) return;
    const res = await deleteStudent(id);
    if (res.success) {
      toast({ title: 'Supprimé', description: 'Élève retiré', variant: 'default' });
      await fetchStudents();
    } else {
      toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <div className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des élèves</h1>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {students.length} élèves inscrits · {students.filter(s => s.status === 'active').length} actifs
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setFormData({ name: '', email: '', level: 'CEM-1' }); setOpenModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
          >
            <Plus size={16} /> Nouvel élève
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        {/* Search bar */}
        <div className="rounded-2xl p-4 glass-panel glass-border-gold">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Rechercher un élève…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl overflow-hidden glass-panel glass-border-gold">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucun élève trouvé"
              description={search ? "Aucun élève ne correspond à votre recherche." : "Aucun élève enregistré. Cliquez sur '+ Nouvel élève' pour commencer."}
              actionLabel="+ Ajouter un élève"
              onAction={() => { setEditingId(null); setFormData({ name: '', email: '', level: 'CEM-1' }); setOpenModal(true); }}
            />
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>{s.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    <Link
                      href={`/dashboard/students/${s.id}`}
                      className="p-2 text-muted-foreground/60 hover:text-gold transition"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 text-muted-foreground/60 hover:text-blue-400 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-muted-foreground/60 hover:text-rose-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={openModal}
          onClose={() => { setOpenModal(false); setEditingId(null); setFormData({ name: '', email: '', level: 'CEM-1' }); }}
          title={editingId ? 'Modifier l\'élève' : 'Nouvel élève'}
          description={editingId ? 'Modifiez les informations de l\'élève sélectionné.' : 'Créez un nouveau compte élève.'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Nom complet</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ahmed Benali"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ahmed@ecole.dz"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Niveau</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setOpenModal(false); setEditingId(null); setFormData({ name: '', email: '', level: 'CEM-1' }); }}
                disabled={formLoading}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 disabled:opacity-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.name || !formData.email}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold disabled:opacity-50 shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
              >
                {formLoading ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
