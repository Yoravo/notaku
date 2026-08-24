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
} from "@heroicons/react/24/outline";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pelanggan ini?")) return;
    await deleteCustomer(id);
  };

  return (
    <>
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau no. telepon..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
          />
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="mt-8 text-center rounded-xl border border-dashed border-gray-300 p-8 bg-gray-50/50">
          <p className="text-sm font-medium text-gray-600">Belum ada pelanggan terdaftar.</p>
          <p className="text-xs text-gray-400 mt-1">
            Tambah pelanggan untuk mempercepat pembuatan invoice berulang.
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="mt-8 text-center py-8">
          <p className="text-sm text-gray-500">
            Tidak ditemukan pelanggan dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Telepon</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">
                    Alamat
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">
                      {customer.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/invoices/new?customerId=${customer.id}`}
                          title="Buat invoice untuk pelanggan ini"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 text-xs font-semibold transition-colors border border-emerald-200/60"
                        >
                          <DocumentPlusIcon className="w-3.5 h-3.5" />
                          <span>Buat Invoice</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(customer)}
                          title="Edit Pelanggan"
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          title="Hapus Pelanggan"
                          className="p-1 rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
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
    </>
  );
}

