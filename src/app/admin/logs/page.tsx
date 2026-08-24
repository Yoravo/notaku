import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  event?: string;
  page?: string;
}>;

function getEventBadge(event: string) {
  if (event.startsWith("admin.user_plan")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Plan Update
      </span>
    );
  }
  if (event.startsWith("admin.user_role")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <ShieldCheckIcon className="w-3.5 h-3.5" />
        Role Update
      </span>
    );
  }
  if (event.startsWith("system.announcement")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        Pengumuman
      </span>
    );
  }
  if (event.startsWith("payment.")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        Payment
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      {event}
    </span>
  );
}

export default async function AdminLogsPage(props: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

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
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <ClipboardDocumentListIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                Audit Logs & Aktivitas Sistem
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Log jejak audit keamanan, perubahan paket, peran admin, dan riwayat sistem.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/logs"
            download
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs w-full sm:w-auto"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari event, IP address, atau User ID..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Event Filter */}
          <div className="sm:col-span-4">
            <select
              name="event"
              defaultValue={eventFilter}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-700 bg-white"
            >
              <option value="">Semua Event ({totalLogs})</option>
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filter</span>
            </button>
            {(searchQuery || eventFilter) && (
              <Link
                href="/admin/logs"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                title="Reset Filter"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Logs Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">
            Menampilkan {logs.length} dari {totalLogs} log
          </p>
          <span className="text-xs font-mono text-slate-400">
            Halaman {currentPage} dari {totalPages || 1}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada log aktivitas ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan filter atau kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Detail Aktivitas</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const detail = log.detail as Record<string, any> | null;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getEventBadge(log.event)}
                          <p className="text-[11px] font-mono text-slate-400">{log.event}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {detail ? (
                          <div className="text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-200/60 max-w-md overflow-x-auto text-slate-700">
                            {Object.entries(detail).map(([key, val]) => (
                              <div key={key} className="flex gap-1.5 leading-relaxed">
                                <span className="text-slate-400 font-semibold">{key}:</span>
                                <span className="text-slate-800 break-all">
                                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Tanpa payload detail</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-xs">
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <Link
              href={`/admin/logs?page=${currentPage - 1}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }${eventFilter ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40 bg-slate-50 text-slate-400"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              &larr; Sebelumnya
            </Link>

            <span className="text-xs text-slate-500">
              Halaman {currentPage} / {totalPages}
            </span>

            <Link
              href={`/admin/logs?page=${currentPage + 1}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }${eventFilter ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold transition-colors ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-40 bg-slate-50 text-slate-400"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Berikutnya &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
