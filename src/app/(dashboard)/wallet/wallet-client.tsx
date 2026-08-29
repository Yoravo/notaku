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
import { useLanguage } from "@/lib/i18n/context";

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
  status: string;
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
  const { t, locale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "payouts">("transactions");

  return (
    <div className="space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {t.wallet?.title || (locale === "id" ? "Saldo & Mutasi Pembayaran" : "Balance & Transaction Ledger")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.wallet?.subtitle ||
            (locale === "id"
              ? "Kelola penerimaan pembayaran digital invoice pelanggan dan pengajuan penarikan dana ke rekening Anda."
              : "Manage digital payment collections and request fund payouts to your bank account.")}
        </p>
      </div>

      {/* Saldo Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.wallet?.availableBalance || (locale === "id" ? "Saldo Pendapatan Tersedia" : "Available Revenue Balance")}
            </span>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                Rp{balance.toLocaleString("id-ID")}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
                {t.wallet?.readyToWithdraw || (locale === "id" ? "Siap Ditarik" : "Ready to Withdraw")}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.wallet?.balanceDesc ||
                (locale === "id"
                  ? "Akumulasi pembayaran digital (QRIS/VA) dari invoice pelanggan Anda."
                  : "Accumulated digital payments (QRIS/VA) from your clients' invoices.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={balance < 10000}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{t.wallet?.requestPayoutBtn || (locale === "id" ? "Tarik Saldo" : "Withdraw Funds")}</span>
            </button>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <BuildingLibraryIcon className="h-4 w-4 text-slate-400" />
              <span>{t.settings?.tabBank || (locale === "id" ? "Rekening Bank" : "Bank Account")}</span>
            </Link>
          </div>
        </div>

        {/* Registered Bank Status */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              {locale === "id" ? "Rekening Tujuan:" : "Destination Account:"}
            </span>
            {bankName && bankAccountNumber ? (
              <span className="font-bold text-slate-900">
                {bankName} - {bankAccountNumber} ({locale === "id" ? "a/n" : "a.n."} {bankAccountName})
              </span>
            ) : (
              <span className="text-amber-700 font-bold">
                {locale === "id" ? "Belum diatur" : "Not configured"}
              </span>
            )}
          </div>
          <Link
            href="/settings"
            className="text-[#0f6b4f] font-bold hover:underline"
          >
            {locale === "id" ? "Ubah Pengaturan" : "Change Settings"}
          </Link>
        </div>
      </div>

      {/* Tabs History */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "transactions"
                ? "bg-[#0f6b4f]/10 text-[#0f6b4f] border border-[#0f6b4f]/20 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {locale === "id" ? "Mutasi Transaksi" : "Transaction Ledger"} ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "payouts"
                ? "bg-[#0f6b4f]/10 text-[#0f6b4f] border border-[#0f6b4f]/20 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.wallet?.payoutHistory || (locale === "id" ? "Riwayat Penarikan" : "Payout History")} ({payouts.length})
          </button>
        </div>

        {/* Content: Transactions Table */}
        {activeTab === "transactions" && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                {locale === "id"
                  ? "Belum ada riwayat transaksi mutasi saldo."
                  : "No balance mutation history recorded yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{locale === "id" ? "Tanggal" : "Date"}</th>
                      <th className="px-5 py-3.5">{locale === "id" ? "Deskripsi" : "Description"}</th>
                      <th className="px-5 py-3.5 text-right">{locale === "id" ? "Nominal Kotor" : "Gross Amount"}</th>
                      <th className="px-5 py-3.5 text-right">MDR (0.7%)</th>
                      <th className="px-5 py-3.5 text-right">{locale === "id" ? "Nominal Bersih" : "Net Amount"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {formatDateWIB(tx.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-slate-900 font-medium">
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60">
                                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                                  <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span>{tx.description}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 tabular-nums font-mono text-xs">
                            {tx.grossAmount > 0
                              ? `Rp${tx.grossAmount.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                          <td className="px-5 py-3.5 text-right text-rose-600 tabular-nums font-mono text-xs">
                            {tx.feeAmount > 0
                              ? `-Rp${tx.feeAmount.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-bold tabular-nums whitespace-nowrap text-sm ${
                              isCredit ? "text-[#0f6b4f]" : "text-slate-900"
                            }`}
                          >
                            {isCredit ? "+" : ""}
                            Rp{Math.abs(tx.amount).toLocaleString("id-ID")}
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
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            {payouts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                {t.wallet?.emptyPayoutHistory || (locale === "id" ? "Belum ada riwayat penarikan dana." : "No payout requests recorded yet.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{locale === "id" ? "Tanggal Diajukan" : "Requested Date"}</th>
                      <th className="px-5 py-3.5">{locale === "id" ? "Rekening Tujuan" : "Destination Account"}</th>
                      <th className="px-5 py-3.5 text-right">{locale === "id" ? "Nominal" : "Amount"}</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map((p) => {
                      const statusMap: Record<string, { label: string; badge: string; dot: string }> = {
                        PENDING: {
                          label: locale === "id" ? "Menunggu Approval" : "Pending Approval",
                          badge: "bg-amber-50 text-amber-700 border-amber-200/60",
                          dot: "bg-amber-500",
                        },
                        PROCESSING: {
                          label: locale === "id" ? "Sedang Ditransfer" : "Processing Transfer",
                          badge: "bg-blue-50 text-blue-700 border-blue-200/60",
                          dot: "bg-blue-500",
                        },
                        COMPLETED: {
                          label: locale === "id" ? "Berhasil Ditransfer" : "Completed",
                          badge: "bg-emerald-50 text-[#0f6b4f] border-emerald-200/60",
                          dot: "bg-emerald-500",
                        },
                        REJECTED: {
                          label: locale === "id" ? "Ditolak" : "Rejected",
                          badge: "bg-rose-50 text-rose-700 border-rose-200/60",
                          dot: "bg-rose-500",
                        },
                      };
                      const s = statusMap[p.status] || statusMap.PENDING;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {formatDateWIB(p.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-slate-900">
                            <span className="font-bold">{p.bankName}</span> - <span className="font-mono text-xs text-slate-600">{p.accountNumber}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums text-sm">
                            Rp{p.amount.toLocaleString("id-ID")}
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
