"use client";

import { useState } from "react";
import { PayoutRequestModal } from "@/components/payout-request-modal";
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  grossAmount: number;
  feeAmount: number;
  description: string;
  createdAt: string;
  invoiceNumber?: string | null;
}

interface PayoutItem {
  id: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  createdAt: string;
  processedAt?: string | null;
}

interface WalletClientProps {
  balance: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  transactions: TransactionItem[];
  payouts: PayoutItem[];
}

export function WalletClient({
  balance,
  bankName,
  bankAccountNumber,
  bankAccountName,
  transactions,
  payouts,
}: WalletClientProps) {
  const locale = useLocale() as "id" | "en";
  const tWallet = useTranslations("wallet");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "payouts">("transactions");

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tWallet("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tWallet("subtitle")}
        </p>
      </div>

      {/* Saldo Banner Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tWallet("availableBalance")}
            </span>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatMoney(balance, "IDR", locale)}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
                {tWallet("readyToWithdraw")}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tWallet("balanceDesc")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={balance < 10000}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98] min-h-[44px]"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{tWallet("requestPayoutBtn")}</span>
            </button>
            <Link
              href="/settings"
              prefetch={true}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs min-h-[44px]"
            >
              <BuildingLibraryIcon className="h-4 w-4 text-slate-400" />
              <span>{tWallet("bankAccountBtn")}</span>
            </Link>
          </div>
        </div>

        {/* Registered Bank Status */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              {tWallet("destinationAccount")}
            </span>
            {bankName && bankAccountNumber ? (
              <span className="font-bold text-slate-900 dark:text-white">
                {bankName} - {bankAccountNumber} ({tWallet("accountHolderAbbr")} {bankAccountName})
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-bold">
                {tWallet("notConfigured")}
              </span>
            )}
          </div>
          <Link
            href="/settings"
            prefetch={true}
            className="text-[#0f6b4f] dark:text-emerald-400 font-bold hover:underline"
          >
            {tWallet("changeSettings")}
          </Link>
        </div>
      </div>

      {/* Tabs History */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-2xs">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[38px] ${
              activeTab === "transactions"
                ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/20 text-[#0f6b4f] dark:text-emerald-400 border border-[#0f6b4f]/20 dark:border-emerald-500/30 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tWallet("tabTransactions", { count: transactions.length })}
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[38px] ${
              activeTab === "payouts"
                ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/20 text-[#0f6b4f] dark:text-emerald-400 border border-[#0f6b4f]/20 dark:border-emerald-500/30 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tWallet("tabPayouts", { count: payouts.length })}
          </button>
        </div>

        {/* Content: Transactions Table */}
        {activeTab === "transactions" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tWallet("emptyTransactions")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[540px]">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{tWallet("tableDate")}</th>
                      <th className="px-5 py-3.5">{tWallet("tableDescription")}</th>
                      <th className="px-5 py-3.5 text-right">{tWallet("tableGross")}</th>
                      <th className="px-5 py-3.5 text-right">{tWallet("tableMdr")}</th>
                      <th className="px-5 py-3.5 text-right">{tWallet("tableNet")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                            {formatDateWIB(tx.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-slate-900 dark:text-white font-medium">
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
                                  <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span>{tx.description}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 tabular-nums font-mono text-xs">
                            {tx.grossAmount > 0
                              ? formatMoney(tx.grossAmount, "IDR", locale)
                              : "-"}
                          </td>
                          <td className="px-5 py-3.5 text-right text-rose-600 dark:text-rose-400 tabular-nums font-mono text-xs">
                            {tx.feeAmount > 0
                              ? `-${formatMoney(tx.feeAmount, "IDR", locale)}`
                              : "-"}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-bold tabular-nums whitespace-nowrap text-sm ${
                              isCredit ? "text-[#0f6b4f] dark:text-emerald-400" : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {isCredit ? "+" : ""}
                            {formatMoney(Math.abs(tx.amount), "IDR", locale)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Content: Payouts Table */}
        {activeTab === "payouts" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            {payouts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tWallet("emptyPayouts")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{tWallet("tableRequestedDate")}</th>
                      <th className="px-5 py-3.5">{tWallet("tablePayoutDestination")}</th>
                      <th className="px-5 py-3.5 text-right">{tWallet("tableAmount")}</th>
                      <th className="px-5 py-3.5 text-center">{tWallet("tableStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payouts.map((p) => {
                      const statusMap: Record<"PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED", { label: string; badge: string; dot: string }> = {
                        PENDING: {
                          label: tWallet("statusPending"),
                          badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800",
                          dot: "bg-amber-500",
                        },
                        PROCESSING: {
                          label: tWallet("statusProcessing"),
                          badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800",
                          dot: "bg-blue-500",
                        },
                        COMPLETED: {
                          label: tWallet("statusCompleted"),
                          badge: "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800",
                          dot: "bg-emerald-500",
                        },
                        REJECTED: {
                          label: tWallet("statusRejected"),
                          badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800",
                          dot: "bg-rose-500",
                        },
                      };
                      const s = statusMap[p.status];

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                            {formatDateWIB(p.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-slate-900 dark:text-white">
                            <span className="font-bold">{p.bankName}</span> - <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{p.accountNumber}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                            {formatMoney(p.amount, "IDR", locale)}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border shadow-2xs ${s.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {isModalOpen && (
        <PayoutRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          balance={balance}
          bankName={bankName}
          bankAccountNumber={bankAccountNumber}
          bankAccountName={bankAccountName}
        />
      )}
    </div>
  );
}
