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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();
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
      setError(locale === "id" ? "Email pelanggan wajib diisi" : "Client email is required");
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
        setError(res.error || (locale === "id" ? "Gagal mengirim email tagihan" : "Failed to send invoice email"));
        return;
      }

      setSuccess(
        locale === "id"
          ? `Faktur berhasil dikirim ke ${res.recipient}!`
          : `Invoice successfully sent to ${res.recipient}!`
      );
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Gagal mengirim email tagihan"
          : "Failed to send invoice email",
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
      >
        <EnvelopeIcon className="w-4 h-4 text-slate-400" />
        <span>{t.invoices?.shareEmail || (locale === "id" ? "Kirim Email" : "Send Email")}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200/60">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {locale === "id" ? "Kirim Tagihan via Email Resmi" : "Send Official Invoice via Email"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {invoiceNumber} • {customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success alert */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 animate-in fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-[#0f6b4f] animate-in fade-in">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {locale === "id" ? "Email Penerima" : "Recipient Email"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] font-mono shadow-2xs"
                />
              </div>

              {/* Template Scenario */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {locale === "id" ? "Format & Subjek Email" : "Email Scenario & Subject"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "new", label: locale === "id" ? "Tagihan Baru" : "New Invoice" },
                    { id: "reminder", label: locale === "id" ? "Pengingat Tempo" : "Due Reminder" },
                    { id: "paid", label: locale === "id" ? "Bukti Lunas" : "Receipt Paid" },
                  ].map((tItem) => (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setTemplateType(tItem.id as any)}
                      className={`rounded-xl border py-2 px-2 text-xs font-bold text-center transition-all cursor-pointer ${
                        templateType === tItem.id
                          ? "border-[#0f6b4f] bg-emerald-50 text-[#0f6b4f] ring-1 ring-[#0f6b4f] shadow-2xs"
                          : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {locale === "id" ? "Pesan Tambahan (Opsional)" : "Custom Note (Optional)"}
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder={
                    locale === "id"
                      ? "Tambahkan catatan pengantar personal ke email pelanggan..."
                      : "Add a personal note to the client's email..."
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {locale === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? locale === "id" ? "Mengirim..." : "Sending..."
                      : locale === "id" ? "Kirim Email Sekarang" : "Send Email Now"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
