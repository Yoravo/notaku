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
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: "PLAN",
    title: "",
    description: "",
    confirmLabel: "Konfirmasi",
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
      title: isUpgrading ? "Upgrade ke Paket PRO" : "Downgrade ke Paket FREE",
      description: isUpgrading
        ? `Pengguna akan langsung mendapatkan akses fitur PRO (unlimited invoice, branding kustom, tanpa watermark, dan template premium).`
        : `Pengguna akan dikembalikan ke batasan paket FREE standar (maksimal 5 invoice/bulan dan 20 pelanggan).`,
      confirmLabel: isUpgrading ? "Ya, Upgrade PRO" : "Ya, Set FREE",
      variant: isUpgrading ? "upgrade" : "warning",
      newPlan: nextPlan,
      itemDetails: [
        { label: "Nama Pengguna", value: userName || "—" },
        { label: "Email", value: userEmail },
        { label: "Paket Saat Ini", value: currentPlan },
        { label: "Paket Baru", value: nextPlan },
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
      title: isPromoting ? "Jadikan Pengguna Sebagai Admin" : "Cabut Hak Akses Admin",
      description: isPromoting
        ? `Pengguna ini akan memiliki akses penuh ke Admin Panel, mutasi keuangan, manajemen promo, dan manipulasi data pengguna lain.`
        : `Hak akses Admin akan dicabut. Pengguna tidak akan dapat mengakses rute /admin lagi.`,
      confirmLabel: isPromoting ? "Ya, Berikan Akses Admin" : "Ya, Cabut Akses Admin",
      variant: isPromoting ? "admin" : "danger",
      newRole: nextRole,
      itemDetails: [
        { label: "Nama Pengguna", value: userName || "—" },
        { label: "Email", value: userEmail },
        { label: "Role Saat Ini", value: currentRole },
        { label: "Role Baru", value: nextRole },
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
          setMessage({ type: "success", text: `Paket diubah ke ${targetPlan}` });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({ type: "error", text: res.error || "Gagal mengubah paket" });
        }
      } else if (dialogState.type === "ROLE" && dialogState.newRole) {
        const targetRole = dialogState.newRole;
        const res = await updateUserRole(userId, targetRole);
        setDialogState((prev) => ({ ...prev, isOpen: false }));

        if (res.success) {
          setMessage({ type: "success", text: `Role diubah ke ${targetRole}` });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({ type: "error", text: res.error || "Gagal mengubah role" });
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
            onClick={handleOpenPlanDialog}
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
            onClick={handleOpenRoleDialog}
            disabled={isPending}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
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
            className={`text-[10px] font-medium animate-in fade-in ${
              message.type === "success" ? "text-emerald-600" : "text-rose-600"
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
        cancelLabel="Batalkan"
        variant={dialogState.variant}
        isLoading={isPending}
        itemDetails={dialogState.itemDetails}
      />

      {/* Alert when trying to revoke self admin */}
      <ConfirmDialog
        isOpen={selfAdminAlertOpen}
        onClose={() => setSelfAdminAlertOpen(false)}
        onConfirm={() => setSelfAdminAlertOpen(false)}
        title="Tindakan Tidak Diizinkan"
        description="Anda tidak dapat mencabut hak akses ADMIN diri Anda sendiri demi mencegah terkuncinya akses sistem."
        confirmLabel="Mengerti"
        cancelLabel="Tutup"
        variant="warning"
        itemDetails={[
          { label: "Akun Anda", value: userEmail },
          { label: "Status", value: "Aktif Sesi Saat Ini" },
        ]}
      />
    </>
  );
}
