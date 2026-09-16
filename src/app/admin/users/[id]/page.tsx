import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/pdf/format";
import { formatDateWIB, formatTimeWIB } from "@/lib/invoice-utils";
import {
  ArrowLeftIcon,
  UserIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { UserRowActions } from "../user-row-actions";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [currentAdmin, tAdmin] = await Promise.all([
    requireAdmin(),
    getTranslations("admin.userDetail"),
  ]);
  const { id } = await props.params;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
      },
      customers: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      subscription: true,
      _count: {
        select: {
          invoices: true,
          customers: true,
        },
      },
    },
  });

  if (!targetUser) {
    notFound();
  }

  // Fetch recent audit logs relating to this user
  const userLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { userId: targetUser.id },
        { detail: { path: ["targetUserId"], equals: targetUser.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Calculate invoice statistics
  const totalPaidInvoices = await prisma.invoice.aggregate({
    where: { userId: targetUser.id, status: "PAID" },
    _sum: { total: true },
    _count: { id: true },
  });

  const isCurrentAdmin = targetUser.id === currentAdmin.id;

  return (
    <div className="space-y-6">
      {/* Back link & Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            prefetch={true}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={tAdmin("backToList")}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {targetUser.name || tAdmin("unnamed")}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  targetUser.plan === "PRO"
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {targetUser.plan === "PRO" && (
                  <SparklesIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                )}
                {targetUser.plan}
              </span>
              {targetUser.role === "ADMIN" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900 shadow-2xs">
                  <ShieldCheckIcon className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              User ID: {targetUser.id}
            </p>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <UserRowActions
            userId={targetUser.id}
            userName={targetUser.name}
            userEmail={targetUser.email}
            currentPlan={targetUser.plan as "FREE" | "PRO"}
            currentRole={targetUser.role as "USER" | "ADMIN"}
            isCurrentAdmin={isCurrentAdmin}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("totalInvoices")}
            </p>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {targetUser._count.invoices}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{tAdmin("createdAllTime")}</p>
        </div>

        {/* Total Paid Volume */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("paidVolume")}
            </p>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f6b4f] dark:text-emerald-400 mt-2 tabular-nums">
            {formatCurrency(Number(totalPaidInvoices._sum.total || 0))}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tAdmin("paidInvoicesCount", { count: totalPaidInvoices._count.id || 0 })}
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("totalCustomers")}
            </p>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {targetUser._count.customers}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{tAdmin("savedCustomers")}</p>
        </div>

        {/* Join Date */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("joinDate")}
            </p>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatDateWIB(targetUser.createdAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            {formatTimeWIB(targetUser.createdAt)} WIB
          </p>
        </div>
      </div>

      {/* Main 2-Column Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{tAdmin("profileInfo")}</span>
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">Email</p>
                <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                  {targetUser.email}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                    targetUser.emailVerified
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800"
                  }`}
                >
                  {targetUser.emailVerified ? tAdmin("emailVerified") : tAdmin("notVerified")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BuildingOfficeIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{tAdmin("businessName")}</p>
                <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                  {targetUser.businessName || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PhoneIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{tAdmin("whatsappNumber")}</p>
                <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                  {targetUser.phone || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{tAdmin("address")}</p>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  {targetUser.address || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices of This User */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{tAdmin("recentInvoices", { count: targetUser.invoices.length })}</span>
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{tAdmin("max10Recent")}</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {targetUser.invoices.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                {tAdmin("emptyInvoices")}
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-4">{tAdmin("colInvoiceNumber")}</th>
                    <th className="py-3 px-4">{tAdmin("colCustomer")}</th>
                    <th className="py-3 px-4">{tAdmin("colStatus")}</th>
                    <th className="py-3 px-4 text-right">{tAdmin("colTotal")}</th>
                    <th className="py-3 px-4 text-right">{tAdmin("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {targetUser.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.number}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {inv.customer?.name || tAdmin("generalCustomer")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800"
                              : inv.status === "SENT"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800"
                              : inv.status === "OVERDUE"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(Number(inv.total))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/i/${inv.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0f6b4f] dark:text-emerald-400 hover:underline font-bold"
                        >
                          {tAdmin("viewPublic")}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs of this User */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{tAdmin("activityLogs")}</span>
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{tAdmin("last10Activities")}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {userLogs.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
              {tAdmin("emptyLogs")}
            </p>
          ) : (
            userLogs.map((log) => (
              <div key={log.id} className="p-3.5 px-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                    {log.event}
                  </span>
                  {log.detail && (
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate max-w-md">
                      {JSON.stringify(log.detail)}
                    </span>
                  )}
                </div>
                <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px] shrink-0">
                  {formatDateWIB(log.createdAt, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {formatTimeWIB(log.createdAt, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
