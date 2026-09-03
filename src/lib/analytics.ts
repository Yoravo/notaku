import { prisma } from "@/lib/prisma";

export interface MonthlyCashflowPoint {
  monthKey: string; // "2026-03"
  label: string; // "Mar 26"
  billed: number;
  collected: number;
}

export interface ClientPerformanceMetric {
  id: string;
  name: string;
  email: string | null;
  totalInvoices: number;
  paidInvoices: number;
  totalPaidAmount: number;
  averagePaymentDays: number | null; // Rata-rata hari pelunasan sejak tanggal terbit
}

export interface AdvancedAnalyticsData {
  // Arus Kas Bulanan (6 bulan terakhir)
  monthlyCashflow: MonthlyCashflowPoint[];
  // Days Sales Outstanding (DSO) - Rata-rata hari klien melunasi tagihan (standar industri: < 45 hari sangat baik)
  dsoDays: number | null;
  dsoTrend: "improving" | "stable" | "worsening" | null;
  // On-time Settlement Rate (persentase tagihan lunas tepat waktu sebelum / pada dueDate)
  onTimePaymentRate: number;
  totalPaidCount: number;
  totalLateCount: number;
  // Klien Teratas berdasarkan volume pembayaran
  topClients: ClientPerformanceMetric[];
  // Rata-rata nilai transaksi per invoice lunas
  avgInvoiceValue: number;
}

/**
 * Mengagregasi metrik performa tagihan & analitik kas untuk user
 */
export async function getAdvancedAnalytics(userId: string): Promise<AdvancedAnalyticsData> {
  const now = new Date();

  // 1. Ambil seluruh data invoice user dalam 12 bulan terakhir (untuk tren cashflow) dan historical paid invoices (untuk DSO)
  const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [recentInvoices, allPaidInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        userId,
        createdAt: { gte: oneYearAgo },
        status: { not: "CANCELLED" },
      },
      select: {
        id: true,
        createdAt: true,
        paidAt: true,
        dueDate: true,
        status: true,
        total: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invoice.findMany({
      where: {
        userId,
        status: "PAID",
        paidAt: { not: null },
      },
      select: {
        id: true,
        createdAt: true,
        paidAt: true,
        dueDate: true,
        total: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 100, // sample 100 invoice terakhir untuk kestabilan DSO
    }),
  ]);

  // 2. Susun Monthly Cashflow (6 bulan terakhir)
  const monthBuckets: Record<string, { label: string; billed: number; collected: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${yyyy}-${mm}`;
    const label = `${monthNames[d.getMonth()]} '${String(yyyy).slice(2)}`;
    monthBuckets[key] = { label, billed: 0, collected: 0 };
  }

  for (const inv of recentInvoices) {
    const invDate = new Date(inv.createdAt);
    const key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, "0")}`;
    if (monthBuckets[key]) {
      monthBuckets[key].billed += Number(inv.total);
    }

    if (inv.status === "PAID" && inv.paidAt) {
      const paidDate = new Date(inv.paidAt);
      const paidKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthBuckets[paidKey]) {
        monthBuckets[paidKey].collected += Number(inv.total);
      }
    }
  }

  const monthlyCashflow: MonthlyCashflowPoint[] = Object.entries(monthBuckets).map(
    ([monthKey, val]) => ({
      monthKey,
      label: val.label,
      billed: val.billed,
      collected: val.collected,
    })
  );

  // 3. Kalkulasi DSO (Days Sales Outstanding) & Rata-rata Durasi Pembayaran
  let totalPaymentDays = 0;
  let paidCountWithDates = 0;
  let onTimeCount = 0;
  let lateCount = 0;

  for (const inv of allPaidInvoices) {
    if (inv.paidAt && inv.createdAt) {
      const createdTime = new Date(inv.createdAt).getTime();
      const paidTime = new Date(inv.paidAt).getTime();
      const diffDays = Math.max(0, Math.round((paidTime - createdTime) / (1000 * 60 * 60 * 24)));

      totalPaymentDays += diffDays;
      paidCountWithDates++;

      // Evaluasi ketepatan waktu pembayaran berdasarkan dueDate
      if (inv.dueDate) {
        const dueTime = new Date(inv.dueDate).getTime();
        // Beri toleransi 1 hari untuk end of day
        if (paidTime <= dueTime + 24 * 60 * 60 * 1000) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      } else {
        onTimeCount++;
      }
    }
  }

  const dsoDays = paidCountWithDates > 0 ? Math.round(totalPaymentDays / paidCountWithDates) : null;
  const onTimePaymentRate =
    paidCountWithDates > 0 ? Math.round((onTimeCount / paidCountWithDates) * 100) : 100;

  // 4. Agregasi Top Clients Performance
  const clientMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string | null;
      totalInvoices: number;
      paidInvoices: number;
      totalPaidAmount: number;
      paymentDaysSum: number;
      paymentDaysCount: number;
    }
  >();

  for (const inv of recentInvoices) {
    if (!inv.customer) continue;
    const cid = inv.customer.id;
    if (!clientMap.has(cid)) {
      clientMap.set(cid, {
        id: cid,
        name: inv.customer.name,
        email: inv.customer.email,
        totalInvoices: 0,
        paidInvoices: 0,
        totalPaidAmount: 0,
        paymentDaysSum: 0,
        paymentDaysCount: 0,
      });
    }

    const c = clientMap.get(cid)!;
    c.totalInvoices++;

    if (inv.status === "PAID") {
      c.paidInvoices++;
      c.totalPaidAmount += Number(inv.total);

      if (inv.paidAt && inv.createdAt) {
        const diffDays = Math.max(
          0,
          Math.round((new Date(inv.paidAt).getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        );
        c.paymentDaysSum += diffDays;
        c.paymentDaysCount++;
      }
    }
  }

  const topClients: ClientPerformanceMetric[] = Array.from(clientMap.values())
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalInvoices: c.totalInvoices,
      paidInvoices: c.paidInvoices,
      totalPaidAmount: c.totalPaidAmount,
      averagePaymentDays: c.paymentDaysCount > 0 ? Math.round(c.paymentDaysSum / c.paymentDaysCount) : null,
    }))
    .sort((a, b) => b.totalPaidAmount - a.totalPaidAmount)
    .slice(0, 5);

  const totalPaidSum = allPaidInvoices.reduce((acc, inv) => acc + Number(inv.total), 0);
  const avgInvoiceValue = allPaidInvoices.length > 0 ? Math.round(totalPaidSum / allPaidInvoices.length) : 0;

  return {
    monthlyCashflow,
    dsoDays,
    dsoTrend: dsoDays !== null ? (dsoDays <= 14 ? "improving" : dsoDays <= 30 ? "stable" : "worsening") : null,
    onTimePaymentRate,
    totalPaidCount: onTimeCount,
    totalLateCount: lateCount,
    topClients,
    avgInvoiceValue,
  };
}
