export function formatCurrency(amount: number): string {
  const parts = Math.round(amount).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${parts.join(",")}`;
}
