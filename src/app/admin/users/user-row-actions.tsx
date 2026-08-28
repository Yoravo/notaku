"use client";

import { useState, useTransition } from "react";
import { updateUserPlan, updateUserRole } from "@/actions/admin";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ConfirmDialog, ConfirmVariant } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/lib/i18n/context";

type UserActionsProps = {
  userId: string;
  userName: string;
  userEmail: string;
  currentPlan: "FREE" | "PRO";
  currentRole: "USER" | "ADMIN";
  isCurrentAdmin: boolean;
};

type DialogState = {
  isOpen: boolean;
  type: "PLAN" | "ROLE";
  title: string;
  description: string;
  confirmLabel: string;
  variant: ConfirmVariant;
  newPlan?: "FREE" | "PRO";
  newRole?: "USER" | "ADMIN";
  itemDetails: { label: string; value: string }[];
};

export function UserRowActions({
  userId,
  userName,
  userEmail,
  currentPlan,
  currentRole,
  isCurrentAdmin,
}: UserActionsProps) {
  const { t, locale } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: "PLAN",
    title: "",
    description: "",
    confirmLabel: locale === "id" ? "Konfirmasi" : "Confirm",
    variant: "primary",
    itemDetails: [],
  });

  const [selfAdminAlertOpen, setSelfAdminAlertOpen] = useState(false);

  const handleOpenPlanDialog = () => {
    const isUpgrading = currentPlan !== "PRO";
    const nextPlan: "FREE" | "PRO" = isUpgrading ? "PRO" : "FREE";

    setDialogState({
      isOpen: true,
      type: "PLAN",
      title: isUpgrading
        ? locale === "id" ? "Upgrade ke Paket PRO" : "Upgrade to PRO Plan"
        : locale === "id" ? "Downgrade ke Paket FREE" : "Downgrade to FREE Plan",
      description: isUpgrading
        ? locale === "id"
          ? "Pengguna akan langsung mendapatkan akses fitur PRO (unlimited invoice, branding kustom, tanpa watermark, dan template premium)."
          : "User will immediately receive full PRO features (unlimited invoices, custom branding, zero watermark, and premium templates)."
        : locale === "id"
          ? "Pengguna akan dikembalikan ke batasan paket FREE standar (maksimal 5 invoice/bulan dan 20 pelanggan)."
          : "User will be reverted to standard FREE limits (max 5 invoices/month and 20 clients).",
      confirmLabel: isUpgrading
        ? locale === "id" ? "Ya, Upgrade PRO" : "Yes, Upgrade to PRO"
        : locale === "id" ? "Ya, Set FREE" : "Yes, Set to FREE",
      variant: isUpgrading ? "upgrade" : "warning",
      newPlan: nextPlan,
      itemDetails: [
        { label: locale === "id" ? "Nama Pengguna" : "User Name", value: userName || "—" },
        { label: "Email", value: userEmail },
        { label: locale === "id" ? "Paket Saat Ini" : "Current Plan", value: currentPlan },
        { label: locale === "id" ? "Paket Baru" : "Target Plan", value: nextPlan },
      ],
    });
  };

  const handleOpenRoleDialog = () => {
    if (isCurrentAdmin && currentRole === "ADMIN") {
      setSelfAdminAlertOpen(true);
      return;
    }

    const isPromoting = currentRole !== "ADMIN";
    const nextRole: "USER" | "ADMIN" = isPromoting ? "ADMIN" : "USER";

    setDialogState({
      isOpen: true,
      type: "ROLE",
      title: isPromoting
        ? locale === "id" ? "Jadikan Pengguna Sebagai Admin" : "Promote User to Admin"
        : locale === "id" ? "Cabut Hak Akses Admin" : "Revoke Admin Privileges",
      description: isPromoting
        ? locale === "id"
          ? "Pengguna ini akan memiliki akses penuh ke Admin Panel, mutasi keuangan, manajemen promo, dan manipulasi data pengguna lain."
          : "This user will have full access to Admin Panel, finances, promo vouchers, and system management."
        : locale === "id"
          ? "Hak akses Admin akan dicabut. Pengguna tidak akan dapat mengakses rute /admin lagi."
          : "Admin privileges will be revoked. The user will no longer be able to access /admin.",
      confirmLabel: isPromoting
        ? locale === "id" ? "Ya, Berikan Akses Admin" : "Yes, Grant Admin Role"
        : locale === "id" ? "Ya, Cabut Akses Admin" : "Yes, Revoke Admin",
      variant: isPromoting ? "admin" : "danger",
      newRole: nextRole,
      itemDetails: [
        { label: locale === "id" ? "Nama Pengguna" : "User Name", value: userName || "—" },
        { label: "Email", value: userEmail },
        { label: locale === "id" ? "Role Saat Ini" : "Current Role", value: currentRole },
        { label: locale === "id" ? "Role Baru" : "New Role", value: nextRole },
      ],
    });
  };

  const handleConfirmAction = () => {
    startTransition(async () => {
      setMessage(null);

      if (dialogState.type === "PLAN" && dialogState.newPlan) {
        const targetPlan = dialogState.newPlan;
        const res = await updateUserPlan(userId, targetPlan);
        setDialogState((prev) => ({ ...prev, isOpen: false }));

        if (res.success) {
          setMessage({
            type: "success",
            text: locale === "id" ? `Paket diubah ke ${targetPlan}` : `Plan updated to ${targetPlan}`,
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({
            type: "error",
            text: res.error || (locale === "id" ? "Gagal mengubah paket" : "Failed to update plan"),
          });
        }
      } else if (dialogState.type === "ROLE" && dialogState.newRole) {
        const targetRole = dialogState.newRole;
        const res = await updateUserRole(userId, targetRole);
        setDialogState((prev) => ({ ...prev, isOpen: false }));

        if (res.success) {
          setMessage({
            type: "success",
            text: locale === "id" ? `Role diubah ke ${targetRole}` : `Role updated to ${targetRole}`,
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({
            type: "error",
            text: res.error || (locale === "id" ? "Gagal mengubah role" : "Failed to update role"),
          });
        }
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          {/* Toggle Plan Button */}
          <button
            type="button"
            onClick={handleOpenPlanDialog}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-[0.98] min-h-[38px] ${
              currentPlan === "PRO"
                ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
                : "bg-emerald-50 text-[#0f6b4f] hover:bg-emerald-100 border border-emerald-200/60"
            }`}
            title={currentPlan === "PRO" ? (locale === "id" ? "Downgrade ke Free" : "Downgrade to Free") : (locale === "id" ? "Upgrade ke Pro" : "Upgrade to Pro")}
          >
            {isPending ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SparklesIcon className="w-3.5 h-3.5" />
            )}
            <span>{currentPlan === "PRO" ? (locale === "id" ? "Set Free" : "Set Free") : (locale === "id" ? "Set Pro" : "Set Pro")}</span>
          </button>

          {/* Toggle Role Button */}
          <button
            type="button"
            onClick={handleOpenRoleDialog}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-[0.98] min-h-[38px] ${
              currentRole === "ADMIN"
                ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
            title={
              currentRole === "ADMIN"
                ? isCurrentAdmin
                  ? locale === "id" ? "Akun Anda saat ini" : "Your active account"
                  : locale === "id" ? "Cabut status Admin" : "Revoke Admin status"
                : locale === "id" ? "Jadikan Admin" : "Make Admin"
            }
          >
            {currentRole === "ADMIN" ? (
              <ShieldExclamationIcon className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{currentRole === "ADMIN" ? (locale === "id" ? "Cabut Admin" : "Revoke Admin") : (locale === "id" ? "Beri Admin" : "Make Admin")}</span>
          </button>
        </div>

        {message && (
          <span
            className={`text-[10px] font-bold animate-in fade-in ${
              message.type === "success" ? "text-[#0f6b4f]" : "text-rose-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => !isPending && setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={dialogState.title}
        description={dialogState.description}
        confirmLabel={dialogState.confirmLabel}
        cancelLabel={locale === "id" ? "Batalkan" : "Cancel"}
        variant={dialogState.variant}
        isLoading={isPending}
        itemDetails={dialogState.itemDetails}
      />

      {/* Alert when trying to revoke self admin */}
      <ConfirmDialog
        isOpen={selfAdminAlertOpen}
        onClose={() => setSelfAdminAlertOpen(false)}
        onConfirm={() => setSelfAdminAlertOpen(false)}
        title={locale === "id" ? "Tindakan Tidak Diizinkan" : "Action Restricted"}
        description={
          locale === "id"
            ? "Anda tidak dapat mencabut hak akses ADMIN diri Anda sendiri demi mencegah terkuncinya akses sistem."
            : "You cannot revoke your own ADMIN role to prevent locking yourself out of the system."
        }
        confirmLabel={locale === "id" ? "Mengerti" : "Understood"}
        cancelLabel={locale === "id" ? "Tutup" : "Close"}
        variant="warning"
        itemDetails={[
          { label: locale === "id" ? "Akun Anda" : "Your Account", value: userEmail },
          { label: "Status", value: locale === "id" ? "Aktif Sesi Saat Ini" : "Current Active Session" },
        ]}
      />
    </>
  );
}
