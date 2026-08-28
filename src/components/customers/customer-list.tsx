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
} from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/lib/i18n/context";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export function CustomerList({
  customers: initial,
}: {
  customers: Customer[];
}) {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Delete Confirm Dialog State
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter instan berbasis nama, email, telepon, dan alamat
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return initial;
    return initial.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)),
    );
  }, [initial, searchQuery]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const handleExecuteDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    } catch {
      alert(locale === "id" ? "Gagal menghapus pelanggan" : "Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.customers?.searchPlaceholder || (locale === "id" ? "Cari nama, email, atau no. telepon..." : "Search name, email, or phone...")}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
          />
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t.customers?.addCustomer || (locale === "id" ? "Tambah Pelanggan" : "Add Client")}</span>
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center mb-3 border border-[#0f6b4f]/20">
            <UsersIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {t.customers?.emptyTitle || (locale === "id" ? "Belum ada pelanggan terdaftar" : "No clients registered yet")}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t.customers?.emptyDesc || (locale === "id" ? "Tambah profil pelanggan pertama Anda untuk mempercepat pembuatan invoice berulang." : "Add your first client profile to speed up recurring invoice creation.")}
          </p>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowModal(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t.customers?.addCustomer || (locale === "id" ? "Tambah Pelanggan" : "Add Client")}</span>
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-sm text-slate-500 font-medium">
            {locale === "id"
              ? `Tidak ditemukan pelanggan dengan kata kunci "${searchQuery}".`
              : `No clients found matching "${searchQuery}".`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.customers?.name || (locale === "id" ? "Nama" : "Name")}</th>
                  <th className="px-5 py-3.5">{t.customers?.email || (locale === "id" ? "Email" : "Email")}</th>
                  <th className="px-5 py-3.5">{t.customers?.phone || (locale === "id" ? "Telepon" : "Phone")}</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">
                    {t.customers?.address || (locale === "id" ? "Alamat" : "Address")}
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    {t.invoices?.actions || (locale === "id" ? "Aksi" : "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                      {customer.email || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell max-w-xs truncate">
                      {customer.address || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/invoices/new?customerId=${customer.id}`}
                          title={locale === "id" ? "Buat invoice untuk pelanggan ini" : "Create invoice for this client"}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 text-[#0f6b4f] hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold transition-all border border-emerald-200/60 shadow-2xs"
                        >
                          <DocumentPlusIcon className="w-3.5 h-3.5" />
                          <span>{t.customers?.createInvoiceFor || (locale === "id" ? "Buat Invoice" : "Create Invoice")}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(customer)}
                          title={t.customers?.editCustomer || (locale === "id" ? "Edit Pelanggan" : "Edit Client")}
                          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(customer)}
                          title={t.customers?.deleteCustomer || (locale === "id" ? "Hapus Pelanggan" : "Delete Client")}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        >
                          <TrashIcon className="w-4 h-4" />
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

      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Modern Delete Customer Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => !isDeleting && setDeletingCustomer(null)}
        onConfirm={handleExecuteDelete}
        title={locale === "id" ? "Hapus Kontak Pelanggan?" : "Delete Client Contact?"}
        description={
          locale === "id"
            ? "Profil pelanggan ini akan dihapus dari daftar kontak. Invoice yang sudah terbit sebelumnya tidak akan terpengaruh."
            : "This client profile will be removed from your contact list. Previously issued invoices will not be affected."
        }
        confirmLabel={locale === "id" ? "Ya, Hapus Pelanggan" : "Yes, Delete Client"}
        cancelLabel={locale === "id" ? "Batal" : "Cancel"}
        variant="danger"
        isLoading={isDeleting}
        itemDetails={
          deletingCustomer
            ? [
                { label: locale === "id" ? "Nama Pelanggan" : "Client Name", value: deletingCustomer.name },
                { label: "Email", value: deletingCustomer.email || "—" },
                { label: locale === "id" ? "Nomor Telepon" : "Phone Number", value: deletingCustomer.phone || "—" },
              ]
            : undefined
        }
      />
    </>
  );
}
