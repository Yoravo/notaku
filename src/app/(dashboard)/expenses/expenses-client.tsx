"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { formatMoney } from "@/lib/currencies";
import { ExpenseModal } from "@/components/expenses/expense-modal";
import { deleteExpense } from "@/actions/expenses";
import { formatDateWIB } from "@/lib/invoice-utils";
import { EXPENSE_CATEGORIES } from "@/lib/validations";

type ExpenseData = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
};

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string }> = {
  OPERASIONAL: { label: "Operasional", bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-400" },
  GAJI: { label: "Gaji & Upah", bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-400" },
  PEMASARAN: { label: "Pemasaran & Iklan", bg: "bg-purple-50 dark:bg-purple-950/60", text: "text-purple-700 dark:text-purple-400" },
  SEWA: { label: "Sewa Tempat", bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-400" },
  ALAT: { label: "Peralatan & Aset", bg: "bg-indigo-50 dark:bg-indigo-950/60", text: "text-indigo-700 dark:text-indigo-400" },
  LAINNYA: { label: "Lainnya", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
};

export function ExpensesClient({
  expenses,
  totalPages,
  currentPage,
  searchQuery,
  categoryFilter,
  currentMonth,
  monthOptions,
  totalAmount,
  autoOpen = false,
}: {
  expenses: ExpenseData[];
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  categoryFilter: string;
  currentMonth: string;
  monthOptions: { value: string; label: string }[];
  totalAmount: number;
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);
  const [modalOpen, setModalOpen] = useState(autoOpen);
  const [editExpense, setEditExpense] = useState<ExpenseData | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const applyFilters = (newCat?: string, newMonth?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const cat = newCat !== undefined ? newCat : categoryFilter;
    if (cat) params.set("category", cat);
    const m = newMonth !== undefined ? newMonth : currentMonth;
    if (m) params.set("month", m);
    router.push(`/expenses?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus pengeluaran "${title}"?`)) return;
    setIsDeleting(id);
    try {
      await deleteExpense(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pengeluaran");
    } finally {
      setIsDeleting(null);
    }
  };

  const openAddModal = () => {
    setEditExpense(undefined);
    setModalOpen(true);
  };

  const openEditModal = (item: ExpenseData) => {
    setEditExpense(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Total Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 shadow-2xs">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Beban & Pengeluaran Usaha
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Catat biaya operasional untuk memantau laba bersih secara akurat.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <a
            href={`/api/reports/profit-loss/export?month=${encodeURIComponent(currentMonth)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs w-full sm:w-auto min-h-[44px]"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Ekspor Laba Rugi</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-xs w-full sm:w-auto min-h-[44px] cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Beban Periode Terpilih
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatMoney(totalAmount, "IDR", "id")}
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={currentMonth}
            onChange={(e) => applyFilters(undefined, e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none min-h-[44px] cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar: Search & Category Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengeluaran atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all min-h-[44px]"
          />
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => applyFilters("")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors min-h-[44px] sm:min-h-[36px] cursor-pointer ${
              !categoryFilter
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Semua Kategori
          </button>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat;
            const meta = CATEGORY_MAP[cat] || { label: cat };
            return (
              <button
                key={cat}
                type="button"
                onClick={() => applyFilters(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors min-h-[44px] sm:min-h-[36px] cursor-pointer ${
                  isSelected
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense List / Table */}
      {expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <TagIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Belum Ada Pengeluaran
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Catat semua biaya pengeluaran operasional bulan ini untuk mendapatkan perhitungan keuangan bisnis yang sehat.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-all min-h-[44px] cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Catat Pengeluaran Baru</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Judul & Catatan</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((ex) => {
                  const catMeta = CATEGORY_MAP[ex.category] || { label: ex.category, bg: "bg-slate-100", text: "text-slate-700" };
                  return (
                    <tr
                      key={ex.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        {formatDateWIB(ex.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ex.title}
                        </p>
                        {ex.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {ex.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${catMeta.bg} ${catMeta.text}`}>
                          {catMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(ex.amount, "IDR", "id")}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(ex)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors min-h-[44px] sm:min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ex.id, ex.title)}
                            disabled={isDeleting === ex.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors min-h-[44px] sm:min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer disabled:opacity-50"
                            title="Hapus"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => router.push(`/expenses?page=${currentPage - 1}&month=${currentMonth}&category=${encodeURIComponent(categoryFilter)}&q=${encodeURIComponent(search)}`)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => router.push(`/expenses?page=${currentPage + 1}&month=${currentMonth}&category=${encodeURIComponent(categoryFilter)}&q=${encodeURIComponent(search)}`)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Modal Add / Edit */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        expense={editExpense}
      />
    </div>
  );
}
