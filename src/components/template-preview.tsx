"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/lib/pdf/templates/classic";
import { MinimalTemplate } from "@/lib/pdf/templates/minimal";
import { ModernTemplate } from "@/lib/pdf/templates/modern";

const dummyData = {
  number: "INV-2026-001",
  status: "PAID",
  subtotal: 1500000,
  discountType: "PERCENTAGE",
  discountValue: 0,
  discountAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  total: 1500000,
  createdAt: "20 Juni 2026",
  dueDate: "20 Juli 2026",
  notes:
    "Terima kasih atas kepercayaan Anda menggunakan layanan kami. Jika ada pertanyaan, jangan ragu untuk menghubungi kami.",
  isFree: false,
  user: {
    name: "Bisnis Anda",
    businessName: "NotaKu",
    email: "admin@notaku.com",
    phone: "0812-3456-7890",
    address: "Karawang, Indonesia",
  },
  customer: {
    name: "Pelanggan Contoh",
    email: "pelanggan@email.com",
    phone: "0812-3456-7890",
    address: "Jakarta",
  },
  items: [
    {
      description: "Jasa Desain Logo",
      quantity: 1,
      price: 500000,
      amount: 500000,
    },
    {
      description: "Hosting 1 Tahun",
      quantity: 1,
      price: 1000000,
      amount: 1000000,
    },
  ],
};

const templates = {
  CLASSIC: ClassicTemplate,
  MODERN: ModernTemplate,
  MINIMAL: MinimalTemplate,
} as const;

export default function TemplatePreview({
  template,
}: {
  template: "CLASSIC" | "MODERN" | "MINIMAL";
}) {
  const Component = templates[template];
  return (
    <div className="h-125 w-full overflow-hidden rounded-lg border">
      <PDFViewer style={{ width: "100%", height: "100%" }} showToolbar={false}>
        <Component data={dummyData} />
      </PDFViewer>
    </div>
  );
}