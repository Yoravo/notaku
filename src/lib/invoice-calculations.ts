export type DiscountType = "FIXED" | "PERCENTAGE";

export interface InvoiceCalculationsInput {
  items: { quantity: number; price: number }[];
  discountType?: DiscountType | string;
  discountValue?: number;
  taxRate?: number;
}

export interface InvoiceCalculationsResult {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxableBase: number; // DPP (Dasar Pengenaan Pajak)
  taxRate: number;
  taxAmount: number;
  total: number;
}

/**
 * Single source of truth untuk kalkulasi invoice di NotaKu
 * Mengikuti standar perpajakan Indonesia:
 * - Subtotal = Total akumulasi perkalian item (quantity * price)
 * - Diskon = Potongan nominal atau persentase dari subtotal
 * - DPP (Dasar Pengenaan Pajak) = max(0, Subtotal - Diskon)
 * - PPN / Pajak = DPP * (Tarif Pajak / 100)
 * - Total Tagihan = DPP + PPN
 */
export function calculateInvoiceTotals(
  input: InvoiceCalculationsInput,
): InvoiceCalculationsResult {
  const items = input.items || [];
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0)),
    0,
  );

  const discountType: DiscountType =
    input.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED";
  const rawDiscountValue = Math.max(0, Number(input.discountValue) || 0);

  let discountAmount = 0;
  if (discountType === "PERCENTAGE") {
    const validRate = Math.min(rawDiscountValue, 100);
    discountAmount = Math.round((subtotal * validRate) / 100);
  } else {
    discountAmount = Math.min(Math.round(rawDiscountValue), subtotal);
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxRate = Math.min(100, Math.max(0, Number(input.taxRate) || 0));
  const taxAmount = Math.round((taxableBase * taxRate) / 100);
  const total = taxableBase + taxAmount;

  return {
    subtotal,
    discountType,
    discountValue: rawDiscountValue,
    discountAmount,
    taxableBase,
    taxRate,
    taxAmount,
    total,
  };
}
