"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GiftIcon,
  UsersIcon,
  SparklesIcon,
  BanknotesIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ShareIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import type { ReferralStats } from "@/actions/referrals";

export function ReferralsClient({
  initialStats,
}: {
  initialStats: ReferralStats;
}) {
  const locale = useLocale() as "id" | "en";
  const tRef = useTranslations("referrals");
  const [stats] = useState<ReferralStats>(initialStats);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(stats.referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = tRef("whatsappShareMessage", { url: stats.referralUrl });

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800 shadow-2xs">
              <GiftIcon className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {tRef("title")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
            {tRef("subtitle")}
          </p>
        </div>

        {/* Quick Withdraw CTA */}
        <Link
          href="/wallet"
          prefetch={true}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-[0.98] min-h-[44px]"
        >
          <BanknotesIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
          <span>{tRef("withdrawNow")}</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Referral Link & Code Box (High-converting hero card) */}
      <div className="bg-gradient-to-br from-emerald-900 via-[#0f6b4f] to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-4 opacity-10 hidden sm:block">
          <GiftIcon className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-[11px] font-bold uppercase tracking-wider mb-3">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{tRef("commissionBadge")}</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
            {tRef("heroTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 font-medium leading-relaxed">
            {tRef("heroSubtitle")}
          </p>

          {/* Controls: Code & Link */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Referral Code Box */}
            <div className="bg-black/20 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                  {tRef("yourCode")}
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-white tracking-wider">
                  {stats.referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                {copiedCode ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-300" />
                    <span>{tRef("copiedCode")}</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>{tRef("copyCode")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Share to WhatsApp Button */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl p-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShareIcon className="w-4 h-4" />
              <span>{tRef("shareWhatsapp")}</span>
            </a>
          </div>

          {/* Full Link Copy */}
          <div className="mt-3 bg-black/20 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 pl-4 flex items-center justify-between gap-2">
            <span className="text-xs text-emerald-100/90 font-mono truncate select-all">
              {stats.referralUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#0f6b4f] hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              {copiedLink ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#0f6b4f]" />
                  <span>{tRef("copiedLink")}</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span>{tRef("copyLink")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Friends */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tRef("statsTotalFriends")}
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalFriends}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {tRef("totalRegisteredUsers")}
          </p>
        </div>

        {/* PRO Friends */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tRef("statsProFriends")}
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <SparklesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">
            {stats.proFriends}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {tRef("successfulUpgrades")}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tRef("statsTotalEarnings")}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-[#0f6b4f]">
              <GiftIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#0f6b4f] tracking-tight">
            {formatMoney(stats.totalEarnings, "IDR", locale)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {tRef("earnedCommissions")}
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tRef("statsAvailableBalance")}
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BanknotesIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatMoney(stats.availableBalance, "IDR", locale)}
          </p>
          <Link
            href="/wallet"
            prefetch={true}
            className="text-[11px] text-[#0f6b4f] hover:underline mt-1 font-bold inline-flex items-center gap-1"
          >
            <span>{tRef("openWallet")}</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mb-4">
          {tRef("howItWorksTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0f6b4f] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {tRef("step1Title")}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {tRef("step1Desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {tRef("step2Title")}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {tRef("step2Desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {tRef("step3Title")}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {tRef("step3Desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Friends & Rewards Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {tRef("tableTitle")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {tRef("tableSubtitle")}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
            {tRef("friendsCount", { count: stats.friends.length })}
          </span>
        </div>

        {stats.friends.length === 0 ? (
          <div className="py-8 px-4 sm:py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {tRef("tableEmptyTitle")}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
              {tRef("tableEmptyDesc")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">
                    {tRef("colName")}
                  </th>
                  <th className="px-5 py-3">
                    {tRef("colEmail")}
                  </th>
                  <th className="px-5 py-3">
                    {tRef("colJoinDate")}
                  </th>
                  <th className="px-5 py-3">
                    {tRef("colStatus")}
                  </th>
                  <th className="px-5 py-3 text-right">
                    {tRef("colReward")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {stats.friends.map((friend) => (
                  <tr
                    key={friend.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {friend.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">
                      {friend.email}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                      {formatDateWIB(friend.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {friend.plan === "PRO" || friend.plan === "BUSINESS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                          <SparklesIcon className="w-3 h-3" />
                          <span>{tRef("statusPro")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          {tRef("statusFree")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {friend.rewardEarned > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#0f6b4f]">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                          <span>+{formatMoney(friend.rewardEarned, "IDR", locale)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{tRef("rewardWaiting")}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
