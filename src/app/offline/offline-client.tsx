"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  WifiIcon,
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import {
  getOfflineInvoices,
  getOfflineCustomers,
  type OfflineInvoice,
  type OfflineCustomer,
} from "@/lib/offline-cache";
import { formatMoney } from "@/lib/currencies";
import { formatDateWIB } from "@/lib/invoice-utils";

export function OfflineClient() {
  const t = useTranslations("offline");
  const tStatus = useTranslations("common.status");
  const locale = (useLocale() || "id") as "id" | "en";

  const [activeTab, setActiveTab] = useState<"invoices" | "customers">("invoices");
  const [invoices, setInvoices] = useState<OfflineInvoice[]>([]);
  const [customers, setCustomers] = useState<OfflineCustomer[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInvoices(getOfflineInvoices());
    setCustomers(getOfflineCustomers());
    setLoaded(true);
  }, []);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID") {
      return {
        label: tStatus("paid"),
        className:
          "bg-emerald-50 text-[#0f6b4f] border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800",
      };
    }
    if (s === "OVERDUE") {
      return {
        label: tStatus("overdue"),
        className:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800",
      };
    }
    if (s === "SENT") {
      return {
        label: tStatus("sent"),
        className:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800",
      };
    }
    if (s === "DRAFT") {
      return {
        label: tStatus("draft"),
        className:
          "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
    }
    return {
      label: status,
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800",
    };
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Top Bar / Offline Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <WifiIcon className="h-6 w-6" />
            </div>
            <div>
              <Link
                href="/"
                prefetch={true}
                className="inline-flex items-center gap-1 text-lg font-bold tracking-tight hover:opacity-90 transition-opacity"
              >
                <span className="text-slate-900 dark:text-white">Nota</span>
                <span className="text-[#0f6b4f] dark:text-emerald-400">Ku</span>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t("badgeOffline")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-3.5 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] shadow-xs min-h-[44px] cursor-pointer"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>{t("tryAgain")}</span>
            </button>
            <Link
              href="/dashboard"
              prefetch={true}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs min-h-[44px]"
            >
              <HomeIcon className="h-4 w-4 text-slate-400" />
              <span>{t("toDashboard")}</span>
            </Link>
          </div>
        </header>

        {/* Offline Workstation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === "invoices"
                ? "bg-[#0f6b4f] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>{t("tabInvoices")}</span>
            {loaded && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "invoices"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {invoices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === "customers"
                ? "bg-[#0f6b4f] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <UserGroupIcon className="h-4 w-4" />
            <span>{t("tabCustomers")}</span>
            {loaded && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "customers"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {customers.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Invoices List */}
        {activeTab === "invoices" && (
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {t("noInvoices")}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {t("noDataHelp")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {invoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  const formattedTotal = formatMoney(inv.total, inv.currency || "IDR", locale);
                  const formattedDate = inv.createdAt
                    ? formatDateWIB(new Date(inv.createdAt))
                    : "-";

                  return (
                    <div
                      key={inv.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {inv.number || "DRAFT"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium truncate">
                          {inv.customerName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                          {formattedDate}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-sm sm:text-base font-bold text-[#0f6b4f] dark:text-emerald-400">
                          {formattedTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customers List */}
        {activeTab === "customers" && (
          <div className="space-y-3">
            {customers.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <UserGroupIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {t("noCustomers")}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {t("noDataHelp")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customers.map((c) => {
                  const rawPhone = c.phone ? c.phone.replace(/[^0-9]/g, "") : "";
                  const waNumber = rawPhone.startsWith("0")
                    ? `62${rawPhone.slice(1)}`
                    : rawPhone;

                  return (
                    <div
                      key={c.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {c.name}
                        </h2>
                        {c.email && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            {c.email}
                          </p>
                        )}
                        {c.address && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {c.address}
                          </p>
                        )}
                      </div>

                      {c.phone && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-colors min-h-[38px]"
                          >
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                            <span>{t("whatsapp")}</span>
                          </a>
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[38px]"
                          >
                            <PhoneIcon className="h-3.5 w-3.5 text-slate-500" />
                            <span>{t("call")}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Local Storage Notice */}
        <aside
          aria-label="Info mode offline"
          className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
        >
          <InformationCircleIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("cachedNotice")}
          </p>
        </aside>
      </div>
    </main>
  );
}
