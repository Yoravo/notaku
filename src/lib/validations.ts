import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi").max(200),
  quantity: z.number().int().positive("Qty harus lebih dari 0"),
  price: z.number().nonnegative("Harga tidak boleh negatif"),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  dueDate: z.string().nullable().refine((val) => val === null || !isNaN(new Date(val).getTime()), {
    message: "Tanggal jatuh tempo tidak valid",
  }),
  notes: z.string().max(1000).nullable(),
  items: z.array(invoiceItemSchema).min(1, "Minimal 1 item"),
});
