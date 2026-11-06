"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote, Plus, Edit, Trash2, Eye, Search, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/dashboard/modals/Modal';
import { useToast } from '@/lib/use-toast';
import { ToastContainer } from '@/components/dashboard/toast/ToastContainer';
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  Expense,
} from '@/lib/dashboard';
import { SkeletonCard } from '@/components/dashboard/skeleton/SkeletonCard';
import { EmptyState } from '@/components/dashboard/sections/EmptyState';

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    type: 'expense' as Expense['type'],
    category: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const types = ['income', 'expense'] as const;
  const categories = ['Autre', 'Équipement', 'Énergie', 'Maintenance', 'Salaires', 'Fournitures'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      toast({ title: 'Erreur', description: 'Impossible de charger les dépenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = expenses.filter((e) =>
    e.source.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        const res = await updateExpense(editingId, {
          source: formData.source,
          amount: Number(formData.amount),
          type: formData.type,
          category: formData.category,
          date: formData.date,
        });
        if (res.success) {
          toast({ title: 'Modifié', description: 'Dépense mise à jour', variant: 'default' });
        } else {
          throw new Error(res.error || 'Échec de la mise à jour');
        }
      } else {
        const res = await createExpense({
          source: formData.source,
          amount: Number(formData.amount),
          type: formData.type,
          category: formData.category,
          date: formData.date,
        });
        if (res.success) {
          toast({ title: 'Ajouté', description: 'Nouvelle dépense enregistrée', variant: 'success' });
        } else {
          throw new Error(res.error || 'Échec de la création');
        }
      }
      setOpenModal(false);
      setEditingId(null);
      setFormData({ source: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) });
      await fetchData();
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Échec de l\'opération', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({ source: expense.source, amount: expense.amount.toString(), type: expense.type, category: expense.category, date: expense.date });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    const res = await deleteExpense(id);
    if (res.success) {
      toast({ title: 'Supprimé', description: 'Dépense retirée', variant: 'default' });
      await fetchData();
    } else {
      toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
    }
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <div className="lg:ml-64 pt-4 sm:pt-6 lg:pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des dépenses</h1>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {expenses.length} opérations · Solde : {(totalIncome - totalExpense).toLocaleString()} DA
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setFormData({ source: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) }); setOpenModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold/90 to-amber-500 text-ink font-bold text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
          >
            <Plus size={16} /> Nouvelle opération
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
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Revenus</p>
            <p className="text-2xl font-black text-emerald-400">{totalIncome.toLocaleString()} DA</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Dépenses</p>
            <p className="text-2xl font-black text-rose-400">{totalExpense.toLocaleString()} DA</p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Solde net</p>
            <p className={`text-2xl font-black ${totalIncome >= totalExpense ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totalIncome - totalExpense).toLocaleString()} DA
            </p>
          </div>
          <div className="rounded-2xl p-4 glass-panel glass-border-gold">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Opérations</p>
            <p className="text-2xl font-black text-foreground">{expenses.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl p-4 glass-panel glass-border-gold">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Rechercher une dépense…"
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
              title="Aucune opération"
              description={search ? "Aucune opération ne correspond à votre recherche." : "Aucune dépense ou revenu enregistré."}
              actionLabel="+ Ajouter une opération"
              onAction={() => { setEditingId(null); setFormData({ source: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) }); setOpenModal(true); }}
            />
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                      {e.source.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.source}</p>
                      <p className="text-xs text-muted-foreground">{e.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      e.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>{e.type === 'income' ? 'Revenu' : 'Dépense'}</span>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${e.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString()} DA
                      </p>
                      <p className="text-[10px] text-muted-foreground">{e.date}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(e)}
                      className="p-2 text-muted-foreground/60 hover:text-blue-400 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
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
          onClose={() => { setOpenModal(false); setEditingId(null); setFormData({ source: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) }); }}
          title={editingId ? 'Modifier l\'opération' : 'Nouvelle opération'}
          description={editingId ? 'Modifiez les détails de l\'opération financière.' : 'Enregistrez une nouvelle dépense ou revenu.'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Libellé</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Ex: Électricité, Manuels scolaires"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
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
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Expense['type'] })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t === 'income' ? 'Revenu' : 'Dépense'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                disabled={formLoading}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setOpenModal(false); setEditingId(null); setFormData({ source: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) }); }}
                disabled={formLoading}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 disabled:opacity-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.source || !formData.amount || !formData.category}
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
