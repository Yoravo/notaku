"use client";

import { useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

type Props = {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string | null;
  total: number;
  dueDate?: string | null;
  publicId: string;
  businessName?: string | null;
  status: string;
};

export function WhatsAppShareModal({
  invoiceNumber,
  customerName,
  customerPhone,
  total,
  dueDate,
  publicId,
  businessName,
  status,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format nomor WhatsApp: ubah 08xxx menjadi 628xxx, buang strip/spasi
  const cleanPhone = customerPhone
    ? customerPhone.replace(/\D/g, "").replace(/^0/, "62")
    : "";

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://www.notaku.store";

  const invoiceUrl = `${appUrl}/i/${publicId}`;
  const totalFormatted = `Rp${Number(total).toLocaleString("id-ID")}`;
  const sender = businessName ? `*${businessName}*` : "*NotaKu*";

  // Template opsi
  const templates = [
    {
      id: "new",
      title: "Tagihan Baru",
      desc: "Untuk mengirim tagihan pertama kali ke pelanggan",
      text: `Halo Kak ${customerName},\n\nTerima kasih atas kerja samanya. Berikut rincian invoice ${invoiceNumber} dari ${sender}:\n\n💰 *Total Tagihan:* ${totalFormatted}${dueDate ? `\n📅 *Jatuh Tempo:* ${dueDate}` : ""}\n\nSilakan cek rincian dan pembayaran melalui link resmi berikut:\n👉 ${invoiceUrl}\n\nTerima kasih!`,
    },
    {
      id: "reminder_h3",
      title: "Pengingat (H-3)",
      desc: "Pengingat ramah 3 hari sebelum jatuh tempo",
      text: `Halo Kak ${customerName},\n\nSemoga hari Anda menyenangkan. Sekadar pengingat ramah bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} akan jatuh tempo dalam *3 hari lagi* (${dueDate || "segera"}).\n\nUntuk rincian dan pembayaran dapat diakses melalui link berikut:\n👉 ${invoiceUrl}\n\nTerima kasih banyak!`,
    },
    {
      id: "reminder_today",
      title: "Hari H Jatuh Tempo",
      desc: "Pengingat tepat pada tanggal jatuh tempo",
      text: `Halo Kak ${customerName},\n\nKami ingin menginformasikan bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} jatuh tempo *HARI INI* (${dueDate || "hari ini"}).\n\nMohon bantuannya untuk dapat menyelesaikan pembayaran melalui tautan berikut:\n👉 ${invoiceUrl}\n\nJika sudah melakukan pembayaran, silakan abaikan pesan ini. Terima kasih!`,
    },
    {
      id: "reminder_overdue",
      title: "Lewat Jatuh Tempo (Overdue)",
      desc: "Pemberitahuan tagihan yang telah melewati jatuh tempo",
      text: `Halo Kak ${customerName},\n\nKami menginformasikan bahwa tagihan invoice ${invoiceNumber} dari ${sender} sebesar ${totalFormatted} saat ini telah *MELEWATI JATUH TEMPO* (${dueDate || "sudah lewat"}).\n\nMohon kesediaannya untuk segera melakukan konfirmasi dan pembayaran melalui link resmi berikut:\n👉 ${invoiceUrl}\n\nTerima kasih atas perhatian dan kerja samanya.`,
    },
    {
      id: "paid",
      title: "Konfirmasi Lunas",
      desc: "Untuk mengonfirmasi pembayaran yang telah diterima",
      text: `Halo Kak ${customerName},\n\nPembayaran untuk invoice ${invoiceNumber} sebesar ${totalFormatted} telah kami terima dan berstatus *LUNAS* ✅.\n\nTerima kasih banyak atas kepercayaannya bersama ${sender}.\n\nBukti transaksi digital dapat dilihat di:\n👉 ${invoiceUrl}`,
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
        className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#20ba5a] transition-colors cursor-pointer shadow-xs"
      >
        <ChatBubbleLeftRightIcon className="w-4 h-4" />
        <span>Share WhatsApp</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Kirim via WhatsApp
                  </h3>
                  <p className="text-xs text-gray-500">
                    {customerPhone
                      ? `Tujuan: ${customerName} (${customerPhone})`
                      : `Tujuan: ${customerName}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Pilih Skenario Pesan
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
                          ? "border-green-600 bg-green-50/70 text-green-900 ring-1 ring-green-600 shadow-xs"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <p className="text-xs font-bold">{tmpl.title}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
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
                <label className="block text-xs font-semibold text-gray-700">
                  Pratinjau / Edit Pesan
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs sm:text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 font-sans leading-relaxed"
              />
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>Buka di WhatsApp</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
