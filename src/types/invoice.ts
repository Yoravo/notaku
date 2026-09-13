import type { InvoiceStatus } from "@/generated/prisma/client";

export type SerializedInvoice = {
  id: string;
  publicId: string;
  userId: string;
  customerId: string;
  number: string | null;
  status: InvoiceStatus;
  dueDate: string | null;
  notes: string | null;
  total: number;
  currency: string;
  createdAt: string;
  customer: {
    id: string;
    userId: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
  };
};
