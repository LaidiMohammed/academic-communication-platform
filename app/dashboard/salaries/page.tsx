"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Plus, Edit, Trash2, Eye, Search, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/dashboard/modals/Modal';
import { useToast } from '@/lib/use-toast';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';
import {
  getSalaries, createSalary, updateSalary, deleteSalary,
  Salary,
} from '@/lib/dashboard';
import { SkeletonCard } from '@/components/dashboard/skeleton/SkeletonCard';
import { EmptyState } from '@/components/dashboard/sections/EmptyState';

export default function SalariesPage() {
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    teacher_id: '',
    subject: '',
    monthlySalary: '',
    paid: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalaries();
      setSalaries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      toast({ title: 'Erreur', description: 'Impossible de charger les salaires', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = salaries.filter((s) =>
    s.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await updateSalary(editingId, {
          subject: formData.subject,
          monthlySalary: Number(formData.monthlySalary),
          paid: formData.paid,
        });
        toast({ title: 'Modifié', description: 'Salaire mis à jour', variant: 'default' });
      } else {
        await createSalary({
          teacher_id: formData.teacher_id,
          subject: formData.subject,
          monthlySalary: Number(formData.monthlySalary),
        });
        toast({ title: 'Ajouté', description: 'Nouveau salaire enregistré', variant: 'success' });
      }
      setOpenModal(false);
      setEditingId(null);
      setFormData({ teacher_id: '', subject: '', monthlySalary: '', paid: false });
      await fetchData();
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (salary: Salary) => {
    setEditingId(salary.id);
    setFormData({ teacher_id: salary.id, subject: salary.subject, monthlySalary: salary.monthlySalary.toString(), paid: salary.paid });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce salaire ?')) return;
    const res = await deleteSalary(id);
    if (res.success) {
      toast({ title: 'Supprimé', description: 'Salaire retiré', variant: 'default' });
      await fetchData();
    } else {
      toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
    }
  };

  const handleTogglePaid = async (salary: Salary) => {
    const res = await updateSalary(salary.id, {
      subject: salary.subject,
      monthlySalary: salary.monthlySalary,
      paid: !salary.paid,
    });
    if (res.success) {
      toast({ title: salary.paid ? 'Marqué impayé' : 'Marqué payé', variant: 'default' });
      await fetchData();
    } else {
      toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
    }
  };

  const totalSalaries = salaries.reduce((s, t) => s + t.monthlySalary, 0);
  const paidSalaries = salaries.filter(t => t.paid).reduce((s, t) => s + t.monthlySalary, 0);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <div className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des salaires</h1>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {salaries.length} enseignants · {paidSalaries.toLocaleString()} DA payés sur {totalSalaries.toLocaleString()} DA
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setFormData({ teacher_id: '', subject: '', monthlySalary: '', paid: false }); setOpenModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
          >
            <Plus size={16} /> Nouveau salaire
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Enseignants</p>
            <p className="text-2xl font-black text-foreground">{salaries.length}</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Total bruts</p>
            <p className="text-2xl font-black text-emerald-400">{totalSalaries.toLocaleString()} DA</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Déjà payés</p>
            <p className="text-2xl font-black text-emerald-400">{paidSalaries.toLocaleString()} DA</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Impayés</p>
            <p className="text-2xl font-black text-rose-400">{salaries.filter(t => !t.paid).length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl p-4 glass-panel glass-border-gold">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Rechercher un enseignant…"
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
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucun salaire"
              description={search ? "Aucun enseignant ne correspond à votre recherche." : "Aucun enseignant enregistré."}
              actionLabel="+ Ajouter un salaire"
              onAction={() => { setEditingId(null); setFormData({ teacher_id: '', subject: '', monthlySalary: '', paid: false }); setOpenModal(true); }}
            />
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                      {s.teacher_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">{s.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePaid(s)}
                      className={`p-1.5 rounded-lg transition ${
                        s.paid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 border border-white/10 text-muted-foreground/60 hover:text-gold'
                      }`}
                    >
                      {s.paid ? <Eye size={16} /> : <Wallet size={16} />}
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.paid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>{s.paid ? 'Payé' : 'Impayé'}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{s.monthlySalary.toLocaleString()} DA</p>
                      <p className="text-[10px] text-muted-foreground">{s.paidDate ? new Date(s.paidDate).toLocaleDateString('fr-FR') : '—'}</p>
                    </div>
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={openModal}
          onClose={() => { setOpenModal(false); setEditingId(null); setFormData({ teacher_id: '', subject: '', monthlySalary: '', paid: false }); }}
          title={editingId ? 'Modifier le salaire' : 'Nouveau salaire'}
          description={editingId ? 'Modifiez les détails du salaire.' : 'Enregistrez un nouveau salaire enseignant.'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Enseignant</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                <option value="">Sélectionner un enseignant</option>
                {/* Will be populated from profiles in a real scenario; using ID as placeholder for demo */}
                <option value={formData.teacher_id || 'current'}>{formData.teacher_id || 'Sélectionner...'}</option>
              </select>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Sélectionnez l'enseignant concerné.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Matière</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Mathématiques"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Montant mensuel (DA)</label>
              <input
                type="number"
                name="monthlySalary"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                  className="rounded bg-white/5 border-white/10 text-gold focus:ring-gold"
                />
                Déjà payé
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setOpenModal(false); setEditingId(null); setFormData({ teacher_id: '', subject: '', monthlySalary: '', paid: false }); }}
                disabled={formLoading}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 disabled:opacity-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.teacher_id || !formData.subject || !formData.monthlySalary}
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
