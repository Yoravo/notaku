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
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminSystemHealthPage() {
  await requireAdmin();
  const t = await getTranslations("admin.system");

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
        <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xs border border-slate-800 dark:border-slate-700">
          <CpuChipIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PostgreSQL Database */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                <ServerStackIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">PostgreSQL DB</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("primaryDb")}</p>
              </div>
            </div>
            {dbStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                {t("operational")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900 shadow-2xs">
                <XCircleIcon className="w-3 h-3" />
                {t("degraded")}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t("queryLatency")}</span>
            <span className="font-mono font-bold text-[#0f6b4f] dark:text-emerald-400 tabular-nums bg-emerald-50/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-800">
              {dbStatus.latencyMs} ms
            </span>
          </div>
        </div>

        {/* Upstash Redis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upstash Redis</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("rateLimiter")}</p>
              </div>
            </div>
            {redisStatus.ok ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                {t("operational")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 shadow-2xs">
                {redisStatus.isConfigured ? t("warning") : t("notSet")}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t("pingLatency")}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {redisStatus.ok ? `${redisStatus.latencyMs} ms` : t("fallbackMemory")}
            </span>
          </div>
        </div>

        {/* Resend Email API */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Resend Email</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("transactionalMail")}</p>
              </div>
            </div>
            {resendConfigured ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
                <CheckCircleIcon className="w-3 h-3" />
                {t("connected")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {t("mockMode")}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t("senderAddress")}</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
              {process.env.EMAIL_FROM || t("notConfigured")}
            </span>
          </div>
        </div>
      </div>

      {/* Database Breakdown & Server Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Records Capacity */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CircleStackIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{t("tableCapacity")}</span>
            </h2>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              {t("totalRows", { count: totalRecords.toLocaleString("id-ID") })}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tableUser")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{userCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tableCustomer")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{customerCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tableInvoice")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {(invoiceCount + itemCount).toLocaleString("id-ID")}{" "}
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                  {t("invItemsDetail", { invoices: invoiceCount, items: itemCount })}
                </span>
              </span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tablePageView")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{viewCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tableAuditLog")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{logCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("tableSession")}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{sessionCount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
