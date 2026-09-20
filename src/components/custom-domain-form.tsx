"use client";

import { useState, useTransition } from "react";
import {
  GlobeAltIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import {
  saveDomainSettings,
  verifyCustomDomain,
  removeCustomDomain,
  type CustomDomainData,
} from "@/actions/domains";
import { UpgradeButton } from "@/components/upgrade-button";

export function CustomDomainForm({ initialData }: { initialData: CustomDomainData }) {
  const tDom = useTranslations("domains");
  const [data, setData] = useState<CustomDomainData>(initialData);
  const [subdomain, setSubdomain] = useState(initialData.subdomainSlug || "");
  const [customDomain, setCustomDomain] = useState(initialData.customDomain || "");
  const [isPending, startTransition] = useTransition();
  const [isVerifying, startVerifyTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);

  const isBusiness = data.plan === "BUSINESS";

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(data.cnameTarget);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const handleCopyTxt = () => {
    if (data.customDomainTxt) {
      navigator.clipboard.writeText(data.customDomainTxt);
      setCopiedTxt(true);
      setTimeout(() => setCopiedTxt(false), 2000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await saveDomainSettings({
          subdomainSlug: subdomain,
          customDomain: customDomain,
        });
        setMessage({
          type: "success",
          text: tDom("saveSuccess"),
        });
        // Update local state
        setData((prev) => ({
          ...prev,
          subdomainSlug: subdomain || null,
          customDomain: customDomain || null,
          customDomainVerified: customDomain === prev.customDomain ? prev.customDomainVerified : false,
        }));
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.message || tDom("saveError"),
        });
      }
    });
  };

  const handleVerify = () => {
    setMessage(null);
    startVerifyTransition(async () => {
      try {
        const res = await verifyCustomDomain();
        if (res.verified) {
          setData((prev) => ({ ...prev, customDomainVerified: true }));
          setMessage({
            type: "success",
            text: res.message,
          });
        } else {
          setMessage({
            type: "error",
            text: res.message,
          });
        }
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.message || tDom("verifyError"),
        });
      }
    });
  };

  const handleRemove = () => {
    if (!confirm(tDom("confirmRemove"))) {
      return;
    }

    startTransition(async () => {
      try {
        await removeCustomDomain();
        setCustomDomain("");
        setData((prev) => ({
          ...prev,
          customDomain: null,
          customDomainVerified: false,
          customDomainTxt: null,
        }));
        setMessage({
          type: "success",
          text: tDom("removeSuccess"),
        });
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.message || tDom("removeError"),
        });
      }
    });
  };

  // Banner jika bukan pengguna Business
  if (!isBusiness) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{tDom("proNoticeTitle")}</span>
            </div>
            <h3 className="text-lg font-bold">
              {tDom("proNoticeSubtitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {tDom("proNoticeDesc")}
            </p>
          </div>
          <UpgradeButton initialPlan="BUSINESS" className="shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
            <GlobeAltIcon className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {tDom("title")}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {tDom("subtitle")}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
          }`}
        >
          <InformationCircleIcon className="w-5 h-5 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Subdomain Instan bawaan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {tDom("subdomainLabel")}
          </label>
          <div className="flex rounded-xl shadow-2xs border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-[#0f6b4f] focus-within:border-transparent min-h-[44px]">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="tokosaya"
              className="flex-1 px-3.5 py-2.5 text-sm outline-none font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <span className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold border-l border-slate-200 dark:border-slate-700 flex items-center">
              .notaku.store
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tDom("subdomainDesc")}
          </p>
        </div>

        {/* Custom Domain Lengkap */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {tDom("customDomainLabel")}
            </label>
            {data.customDomain && (
              <div>
                {data.customDomainVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>{tDom("statusVerified")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>{tDom("statusPending")}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="invoice.tokosaya.com"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none font-mono focus:ring-2 focus:ring-[#0f6b4f] focus:border-transparent min-h-[44px]"
            />
            {data.customDomain && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={tDom("deleteDomain")}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tDom("customDomainDesc")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0c5740] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isPending
              ? tDom("saving")
              : tDom("saveBtn")}
          </button>
        </div>
      </form>

      {/* DNS Configuration Guide (Shown when custom domain is set) */}
      {data.customDomain && (
        <div className="mt-6 rounded-2xl bg-slate-900 text-slate-100 p-5 sm:p-6 space-y-4 font-sans border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{tDom("dnsGuideTitle")}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {tDom("dnsGuideDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50 min-h-[44px]"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
              <span>{isVerifying ? tDom("verifying") : tDom("verifyBtn")}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[480px]">
              <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2">{tDom("dnsType")}</th>
                  <th className="pb-2">{tDom("dnsHost")}</th>
                  <th className="pb-2">{tDom("dnsTarget")}</th>
                  <th className="pb-2 text-right">{tDom("dnsAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                <tr>
                  <td className="py-2.5 font-mono font-bold text-emerald-400">CNAME</td>
                  <td className="py-2.5 font-mono text-slate-300">
                    {data.customDomain.split(".")[0] || "@"}
                  </td>
                  <td className="py-2.5 font-mono text-slate-300">{data.cnameTarget}</td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={handleCopyTarget}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer min-h-[44px] sm:min-h-[36px]"
                    >
                      {copiedTarget ? (
                        <>
                          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{tDom("copied")}</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                          <span>{tDom("copy")}</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>

                {data.customDomainTxt && (
                  <tr>
                    <td className="py-2.5 font-mono font-bold text-blue-400">TXT (Opsi)</td>
                    <td className="py-2.5 font-mono text-slate-300">
                      {data.customDomain.split(".")[0] || "@"}
                    </td>
                    <td className="py-2.5 font-mono text-slate-300 truncate max-w-[200px]">
                      {data.customDomainTxt}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={handleCopyTxt}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedTxt ? (
                          <>
                            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{tDom("copied")}</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                            <span>{tDom("copy")}</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
