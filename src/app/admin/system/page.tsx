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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-900 text-white">
          <CpuChipIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            System Health & Status Layanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitoring konektivitas real-time, latensi microservices, dan kesehatan database platform.
          </p>
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PostgreSQL Database */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ServerStackIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">PostgreSQL DB</h2>
                <p className="text-[11px] text-slate-500">Database Utama</p>
              </div>
            </div>
            {dbStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Operational
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <XCircleIcon className="w-3.5 h-3.5" />
                Degraded
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Query Latency:</span>
            <span className="font-mono font-bold text-slate-900">{dbStatus.latencyMs} ms</span>
          </div>
        </div>

        {/* Upstash Redis */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upstash Redis</h2>
                <p className="text-[11px] text-slate-500">Rate Limiter & Cache</p>
              </div>
            </div>
            {redisStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Operational
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {redisStatus.isConfigured ? "Warning" : "Not Set"}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ping Latency:</span>
            <span className="font-mono font-bold text-slate-900">
              {redisStatus.ok ? `${redisStatus.latencyMs} ms` : "-"}
            </span>
          </div>
        </div>

        {/* Resend Email API */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Resend Email</h2>
                <p className="text-[11px] text-slate-500">Transactional Mail</p>
              </div>
            </div>
            {resendConfigured ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                Mock Mode
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Sender Address:</span>
            <span className="font-mono text-slate-700 truncate max-w-[150px]">
              {process.env.EMAIL_FROM || "Belum diset"}
            </span>
          </div>
        </div>
      </div>

      {/* Database Breakdown & Server Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Records Capacity */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CircleStackIcon className="w-4 h-4 text-slate-600" />
              Kapasitas & Distribusi Baris Tabel
            </h2>
            <span className="text-xs font-bold text-slate-700 font-mono">
              Total {totalRecords.toLocaleString("id-ID")} Baris
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">user (Tabel Pengguna)</span>
              <span className="font-mono font-bold text-slate-900">{userCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">Customer (Pelanggan)</span>
              <span className="font-mono font-bold text-slate-900">{customerCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">Invoice & Items</span>
              <span className="font-mono font-bold text-slate-900">
                {(invoiceCount + itemCount).toLocaleString("id-ID")} ({invoiceCount} inv / {itemCount} item)
              </span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">page_view (Trafik Pengunjung)</span>
              <span className="font-mono font-bold text-slate-900">{viewCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">audit_log (Catatan Aktivitas)</span>
              <span className="font-mono font-bold text-slate-900">{logCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-semibold text-slate-700">session (Sesi Login Aktif)</span>
              <span className="font-mono font-bold text-slate-900">{sessionCount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Server Runtime Environment */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClockIcon className="w-4 h-4 text-slate-600" />
            Environment & Runtime
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Node.js Environment:</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {process.env.NODE_ENV || "development"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Application Framework:</span>
              <span className="font-semibold text-slate-800">Next.js 16 App Router</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Auth Engine:</span>
              <span className="font-semibold text-slate-800">Better-Auth with Prisma Adapter</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">PDF Rendering Engine:</span>
              <span className="font-semibold text-slate-800">@react-pdf/renderer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Timezone Acuan:</span>
              <span className="font-mono text-slate-800">Asia/Jakarta (WIB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
