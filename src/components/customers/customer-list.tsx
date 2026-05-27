"use client";

import { useState } from "react";
import { CustomerModal } from "./customer-modal";
import { deleteCustomer } from "@/actions/customers";

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
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-blue-700 transition-colors"
        >
          + Tambah Pelanggan
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Belum ada pelanggan.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Nama</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 font-medium text-gray-700">Telepon</th>
                <th className="px-4 py-3 font-medium text-gray-700">Alamat</th>
                <th className="px-4 py-3 font-medium text-gray-700 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initial.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.address || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-blue-50 cursor-pointer hover:underline mr-3 bg-blue-400 px-2 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-50 cursor-pointer hover:underline bg-red-400 px-2 py-1 rounded-md transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
