import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateWIB, formatTimeWIB } from "@/lib/invoice-utils";
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  event?: string;
  page?: string;
}>;

function getEventBadge(event: string, tLogs: (key: any) => string) {
  if (event.startsWith("admin.user_plan")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
        <CheckCircleIcon className="w-3 h-3 text-[#0f6b4f] dark:text-emerald-400" />
        {tLogs("badgePlanUpgrade")}
      </span>
    );
  }
  if (event.startsWith("admin.user_role")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 shadow-2xs">
        <ShieldCheckIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        {tLogs("badgeRolePrivilege")}
      </span>
    );
  }
  if (event.startsWith("system.announcement")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 shadow-2xs">
        <ExclamationTriangleIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        {tLogs("badgeAnnouncement")}
      </span>
    );
  }
  if (event.startsWith("admin.promo")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 shadow-2xs">
        <SparklesIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        {tLogs("badgePromo")}
      </span>
    );
  }
  if (event.startsWith("payment.")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 shadow-2xs">
        <BanknotesIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        {tLogs("badgePayment")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
      {event}
    </span>
  );
}

export default async function AdminLogsPage(props: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const tLogs = await getTranslations("admin.logs");

  const searchQuery = searchParams.q?.trim() || "";
  const eventFilter = searchParams.event?.trim() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const PAGE_SIZE = 25;

  const where: any = {};

  if (eventFilter) {
    where.event = { startsWith: eventFilter };
  }

  if (searchQuery) {
    where.OR = [
      { event: { contains: searchQuery, mode: "insensitive" } },
      { ipAddress: { contains: searchQuery, mode: "insensitive" } },
      { userId: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [totalLogs, logs, distinctEvents] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.groupBy({
      by: ["event"],
      _count: { id: true },
    }),
  ]);

  const totalPages = Math.ceil(totalLogs / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xs border border-slate-800 dark:border-slate-700">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {tLogs("title")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {tLogs("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/logs"
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs w-full sm:w-auto cursor-pointer min-h-[44px]"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{tLogs("exportCsv")}</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={tLogs("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 transition-colors min-h-[44px]"
            />
          </div>

          {/* Event Filter */}
          <div className="sm:col-span-4">
            <select
              name="event"
              defaultValue={eventFilter}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 font-medium min-h-[44px]"
            >
              <option value="">{tLogs("allEvents", { count: totalLogs })}</option>
              {distinctEvents.map((e) => (
                <option key={e.event} value={e.event}>
                  {e.event} ({e._count.id})
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0f6b4f] hover:bg-[#0c553e] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98] min-h-[44px]"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>{tLogs("filterBtn")}</span>
            </button>
            {(searchQuery || eventFilter) && (
              <Link
                href="/admin/logs"
                prefetch={true}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center shadow-2xs min-h-[44px]"
                title={tLogs("resetFilterTitle")}
              >
                {tLogs("resetFilter")}
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Logs Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {tLogs("showingLogs", { shown: logs.length, total: totalLogs })}
          </p>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold">
            {tLogs("pageIndicator", { current: currentPage, total: totalPages || 1 })}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{tLogs("emptyLogs")}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{tLogs("emptyLogsDesc")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">{tLogs("colTime")}</th>
                  <th className="py-3.5 px-4">{tLogs("colEvent")}</th>
                  <th className="py-3.5 px-4">{tLogs("colDetail")}</th>
                  <th className="py-3.5 px-4">{tLogs("colIp")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => {
                  const detail = log.detail as Record<string, any> | null;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatDateWIB(log.createdAt, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            {formatTimeWIB(log.createdAt, {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getEventBadge(log.event, tLogs)}
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{log.event}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {detail ? (
                          <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 max-w-md overflow-x-auto text-slate-700 dark:text-slate-300 shadow-2xs">
                            {Object.entries(detail).map(([key, val]) => (
                              <div key={key} className="flex gap-1.5 leading-relaxed text-[11px]">
                                <span className="text-slate-400 dark:text-slate-500 font-semibold">{key}:</span>
                                <span className="text-slate-800 dark:text-slate-200 break-all font-medium">
                                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic font-medium">{tLogs("noPayload")}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/30 dark:bg-slate-800/30">
            <Link
              href={`/admin/logs?page=${currentPage - 1}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }${eventFilter ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
              prefetch={true}
              className={`px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs min-h-[44px] sm:min-h-[38px] flex items-center ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40 bg-slate-50 dark:bg-slate-800 text-slate-400"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              &larr; {tLogs("prevPage")}
            </Link>

            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {tLogs("pageIndicator", { current: currentPage, total: totalPages })}
            </span>

            <Link
              href={`/admin/logs?page=${currentPage + 1}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }${eventFilter ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
              prefetch={true}
              className={`px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs min-h-[44px] sm:min-h-[38px] flex items-center ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-40 bg-slate-50 dark:bg-slate-800 text-slate-400"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tLogs("nextPage")} &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
