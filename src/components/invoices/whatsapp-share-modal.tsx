"use client";

import { useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string | null;
  total: number;
  currency?: string;
  dueDate?: string | null;
  publicId: string;
  customPublicUrl?: string | null;
  businessName?: string | null;
  status: string;
};

export function WhatsAppShareModal({
  invoiceNumber,
  customerName,
  customerPhone,
  total,
  currency,
  dueDate,
  publicId,
  customPublicUrl,
  businessName,
  status,
}: Props) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format nomor WhatsApp: ubah 08xxx menjadi 628xxx, buang strip/spasi
  const cleanPhone = customerPhone
    ? customerPhone.replace(/\D/g, "").replace(/^0/, "62")
    : "";

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

  const invoiceUrl = customPublicUrl || `${appUrl}/i/${publicId}`;
  const totalFormatted = formatMoney(Number(total), currency || "IDR", locale);
  const sender = businessName ? `*${businessName}*` : "*NotaKu*";

  // Template opsi
  const templates = [
    {
      id: "new",
      title: tInv("waNewTitle"),
      desc: tInv("waNewDesc"),
      text:
        locale === "id"
          ? `Halo Kak ${customerName},\n\nTerima kasih atas kerja samanya. Berikut rincian invoice ${invoiceNumber} dari ${sender}:\n\n💰 *Total Tagihan:* ${totalFormatted}${dueDate ? `\n📅 *Jatuh Tempo:* ${dueDate}` : ""}\n\nSilakan cek rincian dan pembayaran melalui link resmi berikut:\n👉 ${invoiceUrl}\n\nTerima kasih!`
          : `Hello ${customerName},\n\nThank you for working with us. Here are the invoice details for ${invoiceNumber} from ${sender}:\n\n💰 *Total Due:* ${totalFormatted}${dueDate ? `\n📅 *Due Date:* ${dueDate}` : ""}\n\nPlease review and settle payment via this secure link:\n👉 ${invoiceUrl}\n\nThank you!`,
    },
    {
      id: "reminder_h3",
      title: tInv("waReminderH3Title"),
      desc: tInv("waReminderH3Desc"),
      text:
        locale === "id"
          ? `Halo Kak ${customerName},\n\nSemoga hari Anda menyenangkan. Sekadar pengingat ramah bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} akan jatuh tempo dalam *3 hari lagi* (${dueDate || tInv("dateSoon")}).\n\nUntuk rincian dan pembayaran dapat diakses melalui link berikut:\n👉 ${invoiceUrl}\n\nTerima kasih banyak!`
          : `Hello ${customerName},\n\nHope you have a great day. This is a friendly reminder that invoice ${invoiceNumber} from ${sender} for ${totalFormatted} is due in *3 days* (${dueDate || tInv("dateSoon")}).\n\nView details & pay online:\n👉 ${invoiceUrl}\n\nThank you!`,
    },
    {
      id: "reminder_today",
      title: tInv("waReminderTodayTitle"),
      desc: tInv("waReminderTodayDesc"),
      text:
        locale === "id"
          ? `Halo Kak ${customerName},\n\nKami ingin menginformasikan bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} jatuh tempo *HARI INI* (${dueDate || tInv("dateToday")}).\n\nMohon bantuannya untuk dapat menyelesaikan pembayaran melalui tautan berikut:\n👉 ${invoiceUrl}\n\nJika sudah melakukan pembayaran, silakan abaikan pesan ini. Terima kasih!`
          : `Hello ${customerName},\n\nFriendly reminder that invoice ${invoiceNumber} from ${sender} for ${totalFormatted} is due *TODAY* (${dueDate || tInv("dateToday")}).\n\nPlease complete payment via:\n👉 ${invoiceUrl}\n\nIf already paid, please disregard. Thank you!`,
    },
    {
      id: "reminder_overdue",
      title: tInv("waOverdueTitle"),
      desc: tInv("waOverdueDesc"),
      text:
        locale === "id"
          ? `Halo Kak ${customerName},\n\nKami menginformasikan bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} saat ini telah *MELEWATI JATUH TEMPO* (${dueDate || tInv("datePastDue")}).\n\nMohon kesediaannya untuk segera melakukan konfirmasi dan pembayaran melalui link resmi berikut:\n👉 ${invoiceUrl}\n\nTerima kasih atas perhatian dan kerja samanya.`
          : `Hello ${customerName},\n\nWe would like to notify you that invoice ${invoiceNumber} from ${sender} for ${totalFormatted} is now *OVERDUE* (${dueDate || tInv("datePastDue")}).\n\nPlease settle payment via:\n👉 ${invoiceUrl}\n\nThank you for your cooperation.`,
    },
    {
      id: "paid",
      title: tInv("waPaidTitle"),
      desc: tInv("waPaidDesc"),
      text:
        locale === "id"
          ? `Halo Kak ${customerName},\n\nPembayaran untuk invoice ${invoiceNumber} sebesar ${totalFormatted} telah kami terima dan berstatus *LUNAS* ✅.\n\nTerima kasih banyak atas kepercayaannya bersama ${sender}.\n\nBukti transaksi digital dapat dilihat di:\n👉 ${invoiceUrl}`
          : `Hello ${customerName},\n\nPayment for invoice ${invoiceNumber} of ${totalFormatted} has been received and confirmed *PAID* ✅.\n\nThank you for your trust in ${sender}.\n\nReceipt:\n👉 ${invoiceUrl}`,
    },
  ];

  // Default template berdasarkan status invoice
  const defaultTemplateId =
    status === "PAID"
      ? "paid"
      : status === "OVERDUE"
        ? "reminder_overdue"
        : "new";
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);

  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [customMessage, setCustomMessage] = useState(currentTemplate.text);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) setCustomMessage(tmpl.text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const waLink = `https://wa.me/${cleanPhone ? cleanPhone : ""}?text=${encodeURIComponent(customMessage)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelectedTemplateId(defaultTemplateId);
          const initial = templates.find((t) => t.id === defaultTemplateId) || templates[0];
          setCustomMessage(initial.text);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#20ba5a] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
      >
        <ChatBubbleLeftRightIcon className="w-4 h-4" />
        <span>{tInv("shareWhatsApp")}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0f6b4f] border border-emerald-200/60">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {tInv("whatsappModalTitle")}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {customerPhone
                      ? `${tInv("destination")}: ${customerName} (${customerPhone})`
                      : `${tInv("destination")}: ${customerName}`}
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

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {tInv("selectMessageScenario")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#0f6b4f] bg-emerald-50/70 text-[#0f6b4f] ring-1 ring-[#0f6b4f] shadow-2xs"
                          : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <p className="text-xs font-bold">{tmpl.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {tmpl.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Message Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {tInv("messagePreview")}
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer min-h-[32px] px-1"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-[#0f6b4f]" />
                      <span className="text-[#0f6b4f]">{tInv("copied")}</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tInv("copyText")}</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] font-sans leading-relaxed shadow-2xs"
              />
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                {tInv("close")}
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#20ba5a] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                <span>{tInv("openWhatsApp")}</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
