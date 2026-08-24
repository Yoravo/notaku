"use client";

import { useState, useTransition } from "react";
import { updateUserPlan, updateUserRole } from "@/actions/admin";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type UserActionsProps = {
  userId: string;
  userName: string;
  userEmail: string;
  currentPlan: "FREE" | "PRO";
  currentRole: "USER" | "ADMIN";
  isCurrentAdmin: boolean;
};

export function UserRowActions({
  userId,
  userName,
  userEmail,
  currentPlan,
  currentRole,
  isCurrentAdmin,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTogglePlan = () => {
    const newPlan = currentPlan === "PRO" ? "FREE" : "PRO";
    const confirmMsg =
      newPlan === "PRO"
        ? `Upgrade "${userName || userEmail}" ke paket PRO secara manual?`
        : `Downgrade "${userName || userEmail}" kembali ke paket FREE?`;

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      setMessage(null);
      const res = await updateUserPlan(userId, newPlan);
      if (res.success) {
        setMessage({ type: "success", text: `Plan diubah ke ${newPlan}` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Gagal mengubah paket" });
      }
    });
  };

  const handleToggleRole = () => {
    if (isCurrentAdmin && currentRole === "ADMIN") {
      alert("Anda tidak dapat mencabut hak akses ADMIN diri Anda sendiri.");
      return;
    }

    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const confirmMsg =
      newRole === "ADMIN"
        ? `Jadikan "${userName || userEmail}" sebagai ADMIN? User ini akan dapat mengakses seluruh admin panel.`
        : `Cabut akses ADMIN dari "${userName || userEmail}"?`;

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      setMessage(null);
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setMessage({ type: "success", text: `Role diubah ke ${newRole}` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Gagal mengubah role" });
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {/* Toggle Plan Button */}
        <button
          onClick={handleTogglePlan}
          disabled={isPending}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
            currentPlan === "PRO"
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
          title={currentPlan === "PRO" ? "Downgrade ke Free" : "Upgrade ke Pro"}
        >
          {isPending ? (
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <SparklesIcon className="w-3.5 h-3.5" />
          )}
          <span>{currentPlan === "PRO" ? "Set Free" : "Set Pro"}</span>
        </button>

        {/* Toggle Role Button */}
        <button
          onClick={handleToggleRole}
          disabled={isPending || (isCurrentAdmin && currentRole === "ADMIN")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            currentRole === "ADMIN"
              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
          title={
            currentRole === "ADMIN"
              ? isCurrentAdmin
                ? "Akun Anda saat ini"
                : "Cabut status Admin"
              : "Jadikan Admin"
          }
        >
          {currentRole === "ADMIN" ? (
            <ShieldExclamationIcon className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{currentRole === "ADMIN" ? "Revoke Admin" : "Make Admin"}</span>
        </button>
      </div>

      {message && (
        <span
          className={`text-[10px] font-medium ${
            message.type === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
