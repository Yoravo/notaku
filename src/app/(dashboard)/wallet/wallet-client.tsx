"use client";

import { useState } from "react";
import { PayoutRequestModal } from "@/components/payout-request-modal";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatDateWIB } from "@/lib/invoice-utils";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "payouts">("transactions");

  return (
    <div className="space-y-6">
      {/* Saldo Banner Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Saldo Pendapatan Tersedia
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                Rp{balance.toLocaleString("id-ID")}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Siap Ditarik
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Akumulasi pembayaran digital (QRIS/VA) dari invoice pelanggan Anda.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={balance < 10000}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Tarik Saldo</span>
            </button>
            <Link
              href="/settings?tab=bank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />
              <span>Rekening Bank</span>
            </Link>
          </div>
        </div>

        {/* Registered Bank Status */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Rekening Tujuan:</span>
            {bankName && bankAccountNumber ? (
              <span className="font-semibold text-gray-900">
                {bankName} - {bankAccountNumber} (a/n {bankAccountName})
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Belum diatur</span>
            )}
          </div>
          <Link
            href="/settings?tab=bank"
            className="text-emerald-600 font-medium hover:underline"
          >
            Ubah
          </Link>
        </div>
      </div>

      {/* Tabs History */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "transactions"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Mutasi Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "payouts"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Riwayat Penarikan ({payouts.length})
          </button>
        </div>

        {/* Content: Transactions Table */}
        {activeTab === "transactions" && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                Belum ada riwayat transaksi mutasi saldo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-4 py-3 font-semibold">Deskripsi</th>
                      <th className="px-4 py-3 font-semibold text-right">Nominal Kotor</th>
                      <th className="px-4 py-3 font-semibold text-right">MDR (0.7%)</th>
                      <th className="px-4 py-3 font-semibold text-right">Nominal Bersih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatDateWIB(tx.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                  <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span>{tx.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                            {tx.grossAmount > 0
                              ? `Rp${tx.grossAmount.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-rose-600 tabular-nums">
                            {tx.feeAmount > 0
                              ? `-Rp${tx.feeAmount.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap ${
                              isCredit ? "text-emerald-600" : "text-gray-900"
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
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            {payouts.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                Belum ada permintaan penarikan dana.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tanggal Diajukan</th>
                      <th className="px-4 py-3 font-semibold">Rekening Tujuan</th>
                      <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payouts.map((p) => {
                      const statusMap: Record<string, { label: string; badge: string; dot: string }> = {
                        PENDING: {
                          label: "Menunggu Approval",
                          badge: "bg-amber-50 text-amber-700 border-amber-200/60",
                          dot: "bg-amber-500",
                        },
                        PROCESSING: {
                          label: "Sedang Ditransfer",
                          badge: "bg-blue-50 text-blue-700 border-blue-200/60",
                          dot: "bg-blue-500",
                        },
                        COMPLETED: {
                          label: "Berhasil Ditransfer",
                          badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                          dot: "bg-emerald-500",
                        },
                        REJECTED: {
                          label: "Ditolak",
                          badge: "bg-rose-50 text-rose-700 border-rose-200/60",
                          dot: "bg-rose-500",
                        },
                      };
                      const s = statusMap[p.status] || statusMap.PENDING;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatDateWIB(p.createdAt, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <span className="font-semibold">{p.bankName}</span> - {p.accountNumber}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                            Rp{p.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${s.badge}`}
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

      {/* Modal Penarikan Dana */}
      <PayoutRequestModal
        balance={balance}
        bankName={bankName}
        bankAccountNumber={bankAccountNumber}
        bankAccountName={bankAccountName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
