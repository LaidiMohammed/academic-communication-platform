"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Plus, Edit, Trash2, Eye, Search, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/dashboard/modals/Modal';
import { useToast } from '@/lib/use-toast';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';
import {
  getPayments, createPayment, updatePayment, deletePayment,
  Payment, Student,
} from '@/lib/dashboard';
import { getStudents } from '@/lib/dashboard';
import { SkeletonCard } from '@/components/dashboard/skeleton/SkeletonCard';
import { EmptyState } from '@/components/dashboard/sections/EmptyState';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    status: 'pending' as Payment['status'],
    plan_title: '',
  });

  const statuses = ['pending', 'completed', 'failed'] as const;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsData, studentsData] = await Promise.all([
        getPayments(),
        getStudents(),
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      toast({ title: 'Erreur', description: 'Impossible de charger les paiements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = payments.filter((p) =>
    p.user_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.plan_title && p.plan_title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        const res = await updatePayment(editingId, {
          amount: Number(formData.amount),
          status: formData.status,
          plan_title: formData.plan_title || null,
        });
        if (res.success) {
          toast({ title: 'Modifié', description: 'Paiement mis à jour', variant: 'default' });
        } else {
          throw new Error(res.error || 'Échec de la mise à jour');
        }
      } else {
        const res = await createPayment({
          user_id: formData.user_id,
          amount: Number(formData.amount),
          status: formData.status,
          plan_title: formData.plan_title || undefined,
        });
        if (res.success) {
          toast({ title: 'Ajouté', description: 'Nouveau paiement enregistré', variant: 'success' });
        } else {
          throw new Error(res.error || 'Échec de la création');
        }
      }
      setOpenModal(false);
      setEditingId(null);
      setFormData({ user_id: '', amount: '', status: 'pending', plan_title: '' });
      await fetchData();
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingId(payment.id);
    setFormData({ user_id: payment.user_id, amount: payment.amount.toString(), status: payment.status, plan_title: payment.plan_title || '' });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    const res = await deletePayment(id);
    if (res.success) {
      toast({ title: 'Supprimé', description: 'Paiement retiré', variant: 'default' });
      await fetchData();
    } else {
      toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <div className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des paiements</h1>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {payments.length} paiements · {totalPaid.toLocaleString()} DA encaissés
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setFormData({ user_id: '', amount: '', status: 'pending', plan_title: '' }); setOpenModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
          >
            <Plus size={16} /> Nouveau paiement
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

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Total</p>
            <p className="text-2xl font-black text-foreground">{payments.length}</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Encaissé</p>
            <p className="text-2xl font-black text-emerald-400">{totalPaid.toLocaleString()} DA</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">En attente</p>
            <p className="text-2xl font-black text-amber-400">{payments.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Échec</p>
            <p className="text-2xl font-black text-rose-400">{payments.filter(p => p.status === 'failed').length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl p-4 glass-panel glass-border-gold">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Rechercher un paiement…"
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
              title="Aucun paiement"
              description={search ? "Aucun paiement ne correspond à votre recherche." : "Aucun paiement enregistré."}
              actionLabel="+ Ajouter un paiement"
              onAction={() => { setEditingId(null); setFormData({ user_id: '', amount: '', status: 'pending', plan_title: '' }); setOpenModal(true); }}
            />
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                      {p.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.user_name}</p>
                      <p className="text-xs text-muted-foreground">{p.plan_title || 'Paiement'} · {p.level || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>{p.status === 'completed' ? 'Terminé' : p.status === 'pending' ? 'En attente' : 'Échec'}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{p.amount.toLocaleString()} DA</p>
                      <p className="text-[10px] text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('fr-FR') : '—'}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-muted-foreground/60 hover:text-blue-400 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
          onClose={() => { setOpenModal(false); setEditingId(null); setFormData({ user_id: '', amount: '', status: 'pending', plan_title: '' }); }}
          title={editingId ? 'Modifier le paiement' : 'Nouveau paiement'}
          description={editingId ? 'Modifiez les détails du paiement.' : 'Enregistrez un nouveau paiement.'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Élève</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                <option value="">Sélectionner un élève</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Montant (DA)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s === 'completed' ? 'Terminé' : s === 'pending' ? 'En attente' : 'Échec'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Intitulé</label>
              <input
                type="text"
                name="plan_title"
                value={formData.plan_title}
                onChange={(e) => setFormData({ ...formData, plan_title: e.target.value })}
                placeholder="Frais de scolarité"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setOpenModal(false); setEditingId(null); setFormData({ user_id: '', amount: '', status: 'pending', plan_title: '' }); }}
                disabled={formLoading}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 disabled:opacity-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.user_id || !formData.amount}
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
