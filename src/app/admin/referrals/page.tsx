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
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await requireAdmin();
  const t = await getTranslations("admin.referralAdmin");

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <GiftIcon className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("title")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Komisi Terbayar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("totalCommissionsPaid")}
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BanknotesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            Rp {totalCommissionsPaid.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t("successfulRewardsCount", { count: totalRewards._count })}
          </p>
        </div>

        {/* Total Pendaftar Referral */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("registeredViaReferral")}
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {allReferralsCount}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t("registeredFromLink")}
          </p>
        </div>

        {/* Konversi PRO Referral */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("proConversion")}
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <SparklesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight font-mono">
            {proReferralsCount}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t("conversionRate", { rate: conversionRate })}
          </p>
        </div>

        {/* Top Affiliates Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("activeAffiliates")}
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrophyIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {sortedTopReferrers.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t("usersWithReferrals")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Affiliates Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>{t("top10Title")}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("byCommission")}</span>
          </div>

          {sortedTopReferrers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
              {t("emptyAffiliates")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-2.5 font-bold">{t("colUser")}</th>
                    <th className="pb-2.5 font-bold">{t("colCode")}</th>
                    <th className="pb-2.5 text-center font-bold">{t("colFriends")}</th>
                    <th className="pb-2.5 text-right font-bold">{t("colTotalCommission")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedTopReferrers.map((ref, idx) => (
                    <tr key={ref.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-slate-900 dark:text-white">{ref.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{ref.email}</div>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {ref.referralCode || "-"}
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {ref._count.referrals}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>{t("recentRewardsTitle")}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("realtime")}</span>
          </div>

          {recentRewards.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
              {t("emptyRewards")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-2.5 font-bold">{t("colRecipient")}</th>
                    <th className="pb-2.5 font-bold">{t("colDesc")}</th>
                    <th className="pb-2.5 font-bold">{t("colDate")}</th>
                    <th className="pb-2.5 text-right font-bold">{t("colAmount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentRewards.map((rw) => (
                    <tr key={rw.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {rw.referrer.name}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {rw.notes || t("bonusReferralFallback")}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDateWIB(rw.createdAt)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
