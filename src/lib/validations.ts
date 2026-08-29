import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").nullable().or(z.literal("")),
  phone: z.string().max(20).nullable().or(z.literal("")),
  address: z.string().max(500).nullable().or(z.literal("")),
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
  discountType: z.enum(["FIXED", "PERCENTAGE"]).default("FIXED"),
  discountValue: z.number().min(0, "Nilai diskon tidak boleh negatif").default(0),
  taxRate: z.number().min(0, "Tarif pajak minimal 0%").max(100, "Tarif pajak maksimal 100%").default(0),
  currency: z.enum(["IDR", "USD", "SGD", "EUR"]).default("IDR"),
  enableDirectTransfer: z.boolean().default(true),
  enableDigitalPayment: z.boolean().default(false),
  items: z.array(invoiceItemSchema).min(1, "Minimal 1 item").max(50, "Maksimal 50 item"),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Nama Bank / E-Wallet wajib dipilih"),
  bankAccountNumber: z.string().min(4, "Nomor rekening minimal 4 digit").max(30, "Nomor rekening maksimal 30 karakter"),
  bankAccountName: z.string().min(2, "Nama pemilik rekening minimal 2 karakter").max(100, "Nama pemilik rekening maksimal 100 karakter"),
});

export const payoutRequestSchema = z.object({
  amount: z.number().min(10000, "Minimal penarikan saldo adalah Rp 10.000"),
  notes: z.string().max(300).optional(),
});

export const customDomainSchema = z.object({
  subdomainSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)")
    .min(3, "Subdomain minimal 3 karakter")
    .max(30, "Subdomain maksimal 30 karakter")
    .optional()
    .or(z.literal("")),
  customDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/,
      "Format domain tidak valid (contoh: invoice.tokosaya.com)"
    )
    .optional()
    .or(z.literal("")),
});

