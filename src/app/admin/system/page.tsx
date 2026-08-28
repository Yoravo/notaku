import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import {
  CpuChipIcon,
  ServerStackIcon,
  BoltIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CircleStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminSystemHealthPage() {
  await requireAdmin();

  // Test Database (PostgreSQL) Latency
  let dbStatus = { ok: false, latencyMs: 0, error: "" };
  const dbStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = {
      ok: true,
      latencyMs: Math.round(performance.now() - dbStart),
      error: "",
    };
  } catch (err: any) {
    dbStatus = {
      ok: false,
      latencyMs: Math.round(performance.now() - dbStart),
      error: err?.message || "Koneksi Database Gagal",
    };
  }

  // Test Redis (Upstash) Latency
  let redisStatus = { ok: false, latencyMs: 0, error: "", isConfigured: false };
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisStatus.isConfigured = true;
    const redisStart = performance.now();
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      await redis.ping();
      redisStatus = {
        ok: true,
        latencyMs: Math.round(performance.now() - redisStart),
        error: "",
        isConfigured: true,
      };
    } catch (err: any) {
      redisStatus = {
        ok: false,
        latencyMs: Math.round(performance.now() - redisStart),
        error: err?.message || "Koneksi Redis Gagal",
        isConfigured: true,
      };
    }
  }

  // Check Email (Resend) Configuration
  const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

  // Database Row Statistics
  const [
    userCount,
    customerCount,
    invoiceCount,
    itemCount,
    sessionCount,
    viewCount,
    logCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.invoice.count(),
    prisma.invoiceItem.count(),
    prisma.session.count(),
    prisma.pageView.count(),
    prisma.auditLog.count(),
  ]);

  const totalRecords =
    userCount +
    customerCount +
    invoiceCount +
    itemCount +
    sessionCount +
    viewCount +
    logCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-2xs">
          <CpuChipIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Health & Status Layanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring konektivitas real-time, latensi microservices, dan kesehatan database platform.
          </p>
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PostgreSQL Database */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <ServerStackIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">PostgreSQL DB</h2>
                <p className="text-[11px] text-slate-500 font-medium">Database Utama (Neon / PG)</p>
              </div>
            </div>
            {dbStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                Operational
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
                <XCircleIcon className="w-3 h-3" />
                Degraded
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Query Latency:</span>
            <span className="font-mono font-bold text-[#0f6b4f] tabular-nums bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-200/40">
              {dbStatus.latencyMs} ms
            </span>
          </div>
        </div>

        {/* Upstash Redis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upstash Redis</h2>
                <p className="text-[11px] text-slate-500 font-medium">Rate Limiter & Cache</p>
              </div>
            </div>
            {redisStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                Operational
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">
                {redisStatus.isConfigured ? "Warning" : "Not Set"}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Ping Latency:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {redisStatus.ok ? `${redisStatus.latencyMs} ms` : "Fallback In-Memory"}
            </span>
          </div>
        </div>

        {/* Resend Email API */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Resend Email</h2>
                <p className="text-[11px] text-slate-500 font-medium">Transactional Mail</p>
              </div>
            </div>
            {resendConfigured ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                Mock Mode
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Sender Address:</span>
            <span className="font-mono text-slate-700 font-semibold truncate max-w-[150px]">
              {process.env.EMAIL_FROM || "Belum diset"}
            </span>
          </div>
        </div>
      </div>

      {/* Database Breakdown & Server Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Records Capacity */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CircleStackIcon className="w-4 h-4 text-slate-600" />
              <span>Kapasitas & Distribusi Baris Tabel</span>
            </h2>
            <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              Total {totalRecords.toLocaleString("id-ID")} Baris
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">user (Tabel Pengguna)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{userCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">Customer (Pelanggan)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{customerCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">Invoice & Items</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {(invoiceCount + itemCount).toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-slate-400">
                  ({invoiceCount} inv / {itemCount} item)
                </span>
              </span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">page_view (Trafik Pengunjung)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{viewCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">audit_log (Catatan Aktivitas)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{logCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <span className="font-semibold text-slate-700">session (Sesi Login Aktif)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{sessionCount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Server Runtime Environment */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClockIcon className="w-4 h-4 text-slate-600" />
            <span>Environment & Runtime</span>
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Node.js Environment:</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                {process.env.NODE_ENV || "development"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Application Framework:</span>
              <span className="font-bold text-slate-800">Next.js 16 (App Router)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Auth Engine:</span>
              <span className="font-bold text-slate-800">Better-Auth (Prisma PG)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Payment Gateway:</span>
              <span className="font-bold text-[#0f6b4f] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 text-xs">
                Mayar.id Official
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">PDF Engine:</span>
              <span className="font-bold text-slate-800">@react-pdf/renderer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Timezone Acuan:</span>
              <span className="font-mono font-bold text-slate-800">Asia/Jakarta (WIB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
