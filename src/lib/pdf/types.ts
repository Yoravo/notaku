export type InvoiceData = {
  number: string;
  currency?: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
  notes: string | null;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  user: {
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    signatureUrl?: string;
    stampUrl?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  };
  items: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  subtotal: number;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  isFree: boolean;
  template?: "classic" | "modern" | "minimal";
};

export type ReceiptData = {
  receiptNumber: string;
  invoiceNumber: string;
  currency?: string;
  paidAt: string;
  paymentMethod: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  user: {
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    signatureUrl?: string;
    stampUrl?: string;
  };
  itemsSummary: string;
  total: number;
  totalWords: string;
  notes?: string;
  isFree: boolean;
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#f3f4f6", text: "#374151" },
  SENT: { bg: "#eff6ff", text: "#1d4ed8" },
  PAID: { bg: "#f0fdf4", text: "#15803d" },
  OVERDUE: { bg: "#fef2f2", text: "#b91c1c" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280" },
};

export const statusText: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  PAID: "Lunas",
  OVERDUE: "Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};
