import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  GiftIcon,
  UsersIcon,
  SparklesIcon,
  BanknotesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await requireAdmin();

  const [totalRewards, allReferralsCount, proReferralsCount, topReferrers, recentRewards] =
    await Promise.all([
      // 1. Total komisi terbayar
      prisma.referralReward.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      // 2. Total user yang terdaftar via referral
      prisma.user.count({
        where: { referredById: { not: null } },
      }),
      // 3. Total referral yang berhasil convert ke PRO
      prisma.user.count({
        where: {
          referredById: { not: null },
          plan: "PRO",
        },
      }),
      // 4. Top 10 Referrers
      prisma.user.findMany({
        where: {
          referrals: { some: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          _count: {
            select: { referrals: true },
          },
          referralRewards: {
            where: { status: "COMPLETED" },
            select: { amount: true },
          },
        },
        take: 10,
      }),
      // 5. Histori reward terbaru
      prisma.referralReward.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          referrer: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

  const totalCommissionsPaid = Number(totalRewards._sum.amount || 0);
  const conversionRate =
    allReferralsCount > 0
      ? ((proReferralsCount / allReferralsCount) * 100).toFixed(1)
      : "0";

  // Urutkan top referrers berdasarkan total reward
  const sortedTopReferrers = topReferrers
    .map((u) => {
      const earned = u.referralRewards.reduce(
        (acc, r) => acc + Number(r.amount),
        0
      );
      return {
        ...u,
        totalEarned: earned,
      };
    })
    .sort((a, b) => b.totalEarned - a.totalEarned);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GiftIcon className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Manajemen Program Afiliasi & Referral
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Pantau performa pendaftaran referral, konversi upgrade PRO, dan total pencairan komisi pengguna.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Komisi Terbayar */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Komisi Diberikan
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BanknotesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            Rp {totalCommissionsPaid.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalRewards._count} transaksi reward sukses
          </p>
        </div>

        {/* Total Pendaftar Referral */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pendaftar via Referral
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {allReferralsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            User mendaftar dari link teman
          </p>
        </div>

        {/* Konversi PRO Referral */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Konversi Upgrade PRO
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <SparklesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-400 tracking-tight">
            {proReferralsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Rate konversi: {conversionRate}%
          </p>
        </div>

        {/* Top Affiliates Count */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Afiliator Aktif
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrophyIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {sortedTopReferrers.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            User dengan pendaftar aktif
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Affiliates Leaderboard */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-amber-400" />
              <span>Top 10 Pengguna Afiliasi</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Berdasarkan komisi</span>
          </div>

          {sortedTopReferrers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              Belum ada data afiliator aktif.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="pb-2.5">User</th>
                    <th className="pb-2.5">Kode</th>
                    <th className="pb-2.5 text-center">Teman</th>
                    <th className="pb-2.5 text-right">Total Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sortedTopReferrers.map((ref, idx) => (
                    <tr key={ref.id} className="hover:bg-slate-700/20">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div>{ref.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{ref.email}</div>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">
                        {ref.referralCode || "-"}
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-300">
                        {ref._count.referrals}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        Rp {ref.totalEarned.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Reward Settlements */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-400" />
              <span>Pemberian Bonus Terbaru</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Real-time</span>
          </div>

          {recentRewards.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              Belum ada reward komisi yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="pb-2.5">Penerima (Referrer)</th>
                    <th className="pb-2.5">Keterangan</th>
                    <th className="pb-2.5">Tanggal</th>
                    <th className="pb-2.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentRewards.map((rw) => (
                    <tr key={rw.id} className="hover:bg-slate-700/20">
                      <td className="py-2.5 font-bold text-white">
                        {rw.referrer.name}
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {rw.notes || "Bonus Referral"}
                      </td>
                      <td className="py-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDateWIB(rw.createdAt)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                        +Rp {Number(rw.amount).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
