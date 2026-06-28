"use client";

import { useState } from "react";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerModal } from "@/components/customers/customer-modal";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Customer = { id: string; name: string };
type InvoiceItem = { description: string; quantity: number; price: number };
type Invoice = {
  id: string;
  customerId: string;
  dueDate: string | null;
  notes: string | null;
  items: { description: string; quantity: number; price: number }[];
};

export function InvoiceForm({
  customers,
  invoice,
}: {
  customers: Customer[];
  invoice?: Invoice;
}) {
  const isEdit = !!invoice;

  const [customerId, setCustomerId] = useState(invoice?.customerId || "");
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? invoice.dueDate.split("T")[0] : "",
  );
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items.length
      ? invoice.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          price: Number(i.price),
        }))
      : [{ description: "", quantity: 1, price: 0 }],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const router = useRouter();

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const handleSubmit = async () => {
    setError(null);

    if (!customerId) return setError("Pilih pelanggan");
    if (items.some((i) => !i.description || i.price <= 0)) {
      return setError("Lengkapi semua item");
    }

    setLoading(true);
    const payload = {
      customerId,
      dueDate: dueDate || null,
      notes: notes || null,
      items,
    };

    try {
      if (isEdit) {
        await updateInvoice(invoice.id, payload);
      } else {
        await createInvoice(payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Customer & Due Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pelanggan &nbsp;
          </label>
          <div className="flex gap-2">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih pelanggan</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusIcon className="inline h-4 w-4" />
              Baru
            </button>
          </div>
          {customers.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Belum ada pelanggan. Klik{" "}
              <strong>
                <PlusIcon className="inline h-4 w-4" />
                Baru
              </strong>{" "}
              untuk menambahkan.
            </p>
          )}
          {showCustomerModal && (
            <CustomerModal
              customer={null}
              onClose={() => {
                setShowCustomerModal(false);
                router.refresh();
              }}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jatuh Tempo
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item
        </label>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input
                placeholder="Deskripsi"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none
  focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value) || 0)
                }
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2
  focus:ring-blue-500"
              />
              <input
                type="number"
                min="0"
                placeholder="Harga"
                value={item.price || ""}
                onChange={(e) =>
                  updateItem(index, "price", parseFloat(e.target.value) || 0)
                }
                className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2
  focus:ring-blue-500"
              />
              <span className="w-28 py-2 text-sm text-right text-gray-700">
                {(item.quantity * item.price).toLocaleString("id-ID")}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="py-2 text-red-500 cursor-pointer hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Hapus item"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm text-blue-600 cursor-pointer hover:underline"
        >
          <PlusIcon className="inline h-4 w-4" />
          Tambah item
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Catatan
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Catatan tambahan (opsional)"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none
  focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="space-y-3">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div>
            <span className="text-sm text-gray-500">Total</span>
            <p className="text-xl font-semibold text-gray-900">
              Rp{total.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/invoices"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Batal
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50
  transition-colors"
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                  ? "Update Invoice"
                  : "Buat Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
