export type DashboardRange = "month" | "year" | "all";
export type CurrencyMetric = {
  currency: string;
  totalVolume: number;
  paidRevenue: number;
  pendingRevenue: number;
  invoiceCount: number;
};

type MetricInvoice = { currency: string; total: number; status: string };

export function normalizeDashboardRange(value?: string): DashboardRange {
  return value === "year" || value === "all" ? value : "month";
}

/** UTC instants for midnight WIB, suitable for Prisma half-open date filters. */
export function getWibRange(range: DashboardRange, now = new Date()): { gte?: Date; lt?: Date } {
  if (range === "all") return {};
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const start = range === "year" ? `${year}-01-01` : `${year}-${String(month).padStart(2, "0")}-01`;
  const end = range === "year"
    ? `${year + 1}-01-01`
    : month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  return {
    gte: new Date(`${start}T00:00:00+07:00`),
    lt: new Date(`${end}T00:00:00+07:00`),
  };
}

export function getWibDateBounds(
  range: DashboardRange,
  now = new Date(),
): { from?: string; to?: string } {
  if (range === "all") return {};
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  if (!year || !month) return {};

  if (range === "year") {
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }

  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function groupInvoiceMetrics(invoices: MetricInvoice[]): CurrencyMetric[] {
  const grouped = new Map<string, CurrencyMetric>();
  for (const invoice of invoices) {
    const currency = invoice.currency || "IDR";
    const metric = grouped.get(currency) ?? {
      currency,
      totalVolume: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      invoiceCount: 0,
    };
    metric.invoiceCount += 1;
    if (invoice.status !== "CANCELLED") metric.totalVolume += invoice.total;
    if (invoice.status === "PAID") metric.paidRevenue += invoice.total;
    if (invoice.status === "SENT" || invoice.status === "OVERDUE") metric.pendingRevenue += invoice.total;
    grouped.set(currency, metric);
  }
  return [...grouped.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}
