"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { formatMoney } from "@/lib/currencies";
import { ItemModal } from "@/components/items/item-modal";
import { deleteItem } from "@/actions/items";
import { useTranslations, useLocale } from "next-intl";

type ItemData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
};

export function ItemsClient({
  items,
  totalPages,
  currentPage,
  searchQuery,
}: {
  items: ItemData[];
  totalPages: number;
  currentPage: number;
  searchQuery: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [search, setSearch] = useState(searchQuery);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemData | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/items?q=${encodeURIComponent(search)}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus item "${name}" dari katalog?`)) return;
    setIsDeleting(id);
    try {
      await deleteItem(id);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus item");
    } finally {
      setIsDeleting(null);
    }
  };

  const openAddModal = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const openEditModal = (item: ItemData) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-2xs">
              <ArchiveBoxIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Katalog Produk & Jasa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Kelola daftar harga untuk pengisian otomatis saat membuat invoice.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all shadow-xs w-full sm:w-auto min-h-[44px] cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Item</span>
        </button>
      </div>

      {/* Toolbar: Search */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <form onSubmit={handleSearch} className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] transition-all min-h-[44px]"
          />
        </form>
      </div>

      {/* Item List / Grid */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <ArchiveBoxIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Katalog Masih Kosong
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Mulai tambahkan produk atau jasa yang sering Anda tagihkan agar pembuatan invoice selanjutnya lebih cepat.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all min-h-[44px]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tambah Item Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col hover:border-[#0f6b4f]/30 dark:hover:border-emerald-500/30 transition-colors group"
            >
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    title="Edit Item"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={isDeleting === item.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer disabled:opacity-50"
                    title="Hapus Item"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.description ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">
                  {item.description}
                </p>
              ) : (
                <div className="flex-1" />
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <p className="text-base font-extrabold text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
                  {formatMoney(item.price, "IDR", locale as "id" | "en")}
                </p>
                {item.unit && (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    / {item.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => router.push(`/items?page=${currentPage - 1}&q=${search}`)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => router.push(`/items?page=${currentPage + 1}&q=${search}`)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editItem}
      />
    </div>
  );
}
