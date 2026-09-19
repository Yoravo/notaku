"use client";

import { useState, useMemo } from "react";
import { CustomerModal } from "./customer-modal";
import { deleteCustomer } from "@/actions/customers";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations, useLocale } from "next-intl";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export function CustomerList({
  customers: initial,
  autoOpen = false,
}: {
  customers: Customer[];
  autoOpen?: boolean;
}) {
  const tCust = useTranslations("customers");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(autoOpen);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Delete Confirm Dialog State
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick copy feedback state
  const [copiedPortalId, setCopiedPortalId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return initial;
    const q = searchQuery.toLowerCase();
    return initial.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [initial, searchQuery]);

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    } catch {
      alert(tCust("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPortalLink = (customerId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const portalUrl = `${origin}/portal/${customerId}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedPortalId(customerId);
    setTimeout(() => setCopiedPortalId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tCust("searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium min-h-[44px]"
          />
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0 min-h-[44px]"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{tCust("addCustomer")}</span>
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-white dark:bg-slate-900 shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 dark:bg-emerald-500/20 text-[#0f6b4f] dark:text-emerald-400 flex items-center justify-center mb-3 border border-[#0f6b4f]/20 dark:border-emerald-500/30">
            <UsersIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {tCust("emptyTitle")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {tCust("emptyDesc")}
          </p>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowModal(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs cursor-pointer min-h-[40px]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{tCust("addCustomer")}</span>
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {tCust("noMatchingSearch", { query: searchQuery })}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{tCust("name")}</th>
                  <th className="px-5 py-3.5">{tCust("email")}</th>
                  <th className="px-5 py-3.5">{tCust("phone")}</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">
                    {tCust("address")}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {tCust("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {cust.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {cust.email || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {cust.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate text-xs">
                      {cust.address || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5">
                        {/* 1-Click Copy Client Portal Link */}
                        <button
                          onClick={() => handleCopyPortalLink(cust.id)}
                          title={tCust("sharePortal")}
                          className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[36px] min-w-[36px] inline-flex items-center justify-center ${
                            copiedPortalId === cust.id
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {copiedPortalId === cust.id ? (
                            <CheckIcon className="h-4 w-4 text-[#0f6b4f] dark:text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          )}
                        </button>

                        {/* Buat Invoice untuk Customer ini */}
                        <Link
                          href={`/invoices/new?customerId=${cust.id}`}
                          prefetch={true}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#0f6b4f] dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                          title={tCust("createInvoiceFor")}
                        >
                          <DocumentPlusIcon className="h-4 w-4" />
                        </Link>

                        {/* Edit Customer */}
                        <button
                          onClick={() => {
                            setEditingCustomer(cust);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                          title={tCust("editCustomer")}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        {/* Delete Customer */}
                        <button
                          onClick={() => setDeletingCustomer(cust)}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 border border-rose-100 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                          title={tCust("deleteCustomer")}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Customer */}
      <CustomerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      {/* Dialog Konfirmasi Hapus Pelanggan */}
      <ConfirmDialog
        isOpen={!!deletingCustomer}
        title={tCust("confirmDeleteTitle")}
        description={tCust("confirmDeleteDesc", { name: deletingCustomer?.name || "" })}
        confirmLabel={tCust("confirmDeleteBtn")}
        cancelLabel={tCust("confirmCancelBtn")}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingCustomer(null)}
      />
    </div>
  );
}
