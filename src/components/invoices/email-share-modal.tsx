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
import { useTranslations } from "next-intl";

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
  const tInv = useTranslations("invoices");
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
      setError(tInv("emailRequired"));
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
        setError(res.error || tInv("emailSendFailed"));
        return;
      }

      setSuccess(tInv("emailSendSuccess", { recipient: res.recipient || email.trim() }));
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tInv("emailSendFailed"),
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs min-h-[44px]"
      >
        <EnvelopeIcon className="w-4 h-4 text-slate-400" />
        <span>{tInv("shareEmail")}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {tInv("emailModalTitle")}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {invoiceNumber} • {customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success alert */}
            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-in fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs font-semibold text-[#0f6b4f] dark:text-emerald-300 animate-in fade-in">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {tInv("recipientEmail")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] font-mono shadow-2xs min-h-[44px]"
                />
              </div>

              {/* Template Scenario */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {tInv("emailScenario")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "new", label: tInv("scenarioNew") },
                    { id: "reminder", label: tInv("scenarioReminder") },
                    { id: "paid", label: tInv("scenarioPaid") },
                  ].map((tItem) => (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setTemplateType(tItem.id as any)}
                      className={`rounded-xl border py-2 px-2 text-xs font-bold text-center transition-all cursor-pointer min-h-[44px] ${
                        templateType === tItem.id
                          ? "border-[#0f6b4f] dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 ring-1 ring-[#0f6b4f] shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {tInv("customNote")}
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder={tInv("customNotePlaceholder")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 min-h-[44px]"
                >
                  {tInv("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? tInv("sending")
                      : tInv("sendEmailNow")}
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
