import { formatMoney, SupportedCurrency } from "@/lib/currencies";

export function formatCurrency(amount: number, currency: SupportedCurrency | string = "IDR"): string {
  return formatMoney(amount, currency);
}
