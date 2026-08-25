"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { sendInvoiceEmail } from "@/actions/invoices";

type Props = {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string | null;
  total: number;
  dueDate?: string | null;
  status: string;
};

export function EmailShareModal({
  invoiceId,
  invoiceNumber,
  customerName,
  customerEmail,
  total,
  dueDate,
  status,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(customerEmail || "");
  const defaultTemplate =
    status === "PAID" ? "paid" : status === "OVERDUE" ? "reminder" : "new";
  const [templateType, setTemplateType] = useState<"new" | "reminder" | "paid">(
    defaultTemplate,
  );
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOpen = () => {
    setEmail(customerEmail || "");
    setTemplateType(
      status === "PAID" ? "paid" : status === "OVERDUE" ? "reminder" : "new",
    );
    setCustomMessage("");
    setError(null);
    setSuccess(null);
    setIsOpen(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email pelanggan wajib diisi");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await sendInvoiceEmail({
        invoiceId,
        recipientEmail: email.trim(),
        templateType,
        customMessage: customMessage.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Gagal mengirim email tagihan");
        return;
      }

      setSuccess(`Faktur berhasil dikirim ke ${res.recipient}!`);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim email tagihan",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
      >
        <EnvelopeIcon className="h-4 w-4 text-emerald-700" />
        Kirim Email
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-emerald-700" />
                  Kirim Tagihan via Email
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Faktur <span className="font-semibold text-gray-700">{invoiceNumber}</span> ke {customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="mt-4 space-y-4">
              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Tujuan
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Format Email
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "new", label: "Tagihan Baru" },
                    { id: "reminder", label: "Pengingat" },
                    { id: "paid", label: "Bukti Lunas" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setTemplateType(t.id as "new" | "reminder" | "paid")
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all text-center ${
                        templateType === t.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                          : "border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pesan Tambahan <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tambahkan catatan khusus untuk pelanggan..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Preview Detail Summary */}
              <div className="rounded-lg bg-gray-50 p-3 text-xs border border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Nominal Tagihan:</span>
                  <span className="font-semibold text-gray-900">
                    Rp{Number(total).toLocaleString("id-ID")}
                  </span>
                </div>
                {dueDate && (
                  <div className="flex justify-between text-gray-600">
                    <span>Jatuh Tempo:</span>
                    <span className="text-red-600 font-medium">{dueDate}</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {isLoading ? "Mengirim..." : "Kirim Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
