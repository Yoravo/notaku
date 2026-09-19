"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { createExpense, updateExpense } from "@/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/validations";

type ExpenseData = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  OPERASIONAL: "Operasional Umum",
  GAJI: "Gaji & Honor",
  PEMASARAN: "Iklan & Pemasaran",
  SEWA: "Sewa Tempat / Kantor",
  ALAT: "Peralatan & Hardware",
  LAINNYA: "Lain-lain",
};

export function ExpenseModal({
  isOpen,
  onClose,
  expense,
}: {
  isOpen: boolean;
  onClose: () => void;
  expense?: ExpenseData;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<string>("OPERASIONAL");
  const [date, setDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date.split("T")[0]);
      setNotes(expense.notes || "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setTitle("");
      setAmount("");
      setCategory("OPERASIONAL");
      setDate(today);
      setNotes("");
    }
    setError(null);
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", String(amount || 0));
    formData.append("category", category);
    formData.append("date", date);
    formData.append("notes", notes);

    try {
      if (expense) {
        await updateExpense(expense.id, formData);
      } else {
        await createExpense(formData);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {expense ? "Edit Pengeluaran" : "Catat Pengeluaran Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Keterangan Pengeluaran *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Beli Kertas & Tinta, Langganan Server, Gaji Freelance..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Pengeluaran *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kategori Beban *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[44px]"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="No. kwitansi / invoice vendor, nama vendor, dll..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all shadow-xs min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              <span>{expense ? "Simpan Perubahan" : "Simpan Pengeluaran"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
