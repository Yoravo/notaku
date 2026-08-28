"use client";

import { useState } from "react";
import { updatePayoutStatus } from "@/actions/admin";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

interface PayoutRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export function AdminPayoutsClient({
  payouts,
}: {
  payouts: PayoutRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "COMPLETED" | "REJECTED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredPayouts = payouts.filter((p) => {
    if (activeTab === "ALL") return true;
    return p.status === activeTab;
  });

  const handleStatusChange = async (
    payoutId: string,
    newStatus: "PROCESSING" | "COMPLETED" | "REJECTED"
  ) => {
    const confirmMsg =
      newStatus === "COMPLETED"
        ? "Konfirmasi bahwa dana telah berhasil ditransfer ke rekening pengguna?"
        : newStatus === "REJECTED"
          ? "Tolak penarikan dana ini? Saldo akan dikembalikan secara otomatis ke akun pengguna."
          : "Ubah status menjadi sedang diproses?";

    if (!confirm(confirmMsg)) return;

    let adminNotes: string | undefined;
    if (newStatus === "REJECTED") {
      const reason = prompt("Masukkan alasan penolakan (opsional):");
      if (reason !== null) adminNotes = reason;
    }

    setProcessingId(payoutId);
    try {
      const res = await updatePayoutStatus({
        payoutId,
        status: newStatus,
        adminNotes,
      });

      if (!res.success) {
        alert(res.error || "Gagal memperbarui status");
      } else {
        window.location.reload();
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(["ALL", "PENDING", "COMPLETED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab === "ALL"
              ? `Semua (${payouts.length})`
              : tab === "PENDING"
                ? `Menunggu (${payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length})`
                : tab === "COMPLETED"
                  ? `Selesai (${payouts.filter((p) => p.status === "COMPLETED").length})`
                  : `Ditolak (${payouts.filter((p) => p.status === "REJECTED").length})`}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filteredPayouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Tidak ada permintaan penarikan dana pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3.5">ID / Tanggal</th>
                  <th className="px-4 py-3.5">Pengguna</th>
                  <th className="px-4 py-3.5">Rekening Bank Tujuan</th>
                  <th className="px-4 py-3.5 text-right">Nominal Tarik</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p) => {
                  const statusMap = {
                    PENDING: {
                      label: "Pending",
                      badge: "bg-amber-50 text-amber-700 border-amber-200",
                      dot: "bg-amber-500",
                    },
                    PROCESSING: {
                      label: "Diproses",
                      badge: "bg-blue-50 text-blue-700 border-blue-200",
                      dot: "bg-blue-500",
                    },
                    COMPLETED: {
                      label: "Selesai",
                      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      dot: "bg-emerald-500",
                    },
                    REJECTED: {
                      label: "Ditolak",
                      badge: "bg-rose-50 text-rose-700 border-rose-200",
                      dot: "bg-rose-500",
                    },
                  };
                  const s = statusMap[p.status];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-mono text-[11px] text-slate-500 font-medium">
                          #{p.id.slice(-6)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateWIB(p.createdAt, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">{p.userName}</p>
                        <p className="text-[11px] text-slate-500">{p.userEmail}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">
                          {p.bankName} — {p.accountNumber}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          a/n {p.accountName}
                        </p>
                        {p.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            Note: &quot;{p.notes}&quot;
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        Rp{p.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${s.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        {p.adminNotes && (
                          <p className="text-[10px] text-rose-500 mt-1">
                            {p.adminNotes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {p.status === "PENDING" || p.status === "PROCESSING" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(p.id, "COMPLETED")}
                              disabled={processingId === p.id}
                              title="Tandai Selesai Ditransfer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>Selesai</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(p.id, "REJECTED")}
                              disabled={processingId === p.id}
                              title="Tolak Penarikan (Refund Saldo)"
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <XCircleIcon className="h-3.5 w-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Tuntas
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
