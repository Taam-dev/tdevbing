import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

export default function AddAccountModal({ isOpen, onClose, onAdd, t }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onAdd(name.trim());
    setName('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 font-semibold">
            <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>{t.modalAddTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {t.modalAddLabel}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.modalAddPlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {t.modalAddTip}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded border border-slate-300 dark:border-slate-700 transition"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 bg-cyan-600 dark:bg-cyan-400 hover:bg-cyan-500 dark:hover:bg-cyan-300 rounded shadow-md transition disabled:opacity-50"
            >
              {loading ? (t.loadingAccounts) : t.btnAddConfirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
