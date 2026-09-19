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
import { useTranslations } from "next-intl";

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
  const tAdmin = useTranslations("admin");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: "PLAN",
    title: "",
    description: "",
    confirmLabel: tAdmin("confirm"),
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
      title: tAdmin("confirmPlanChangeTitle"),
      description: tAdmin("confirmPlanChangeDesc", {
        name: userName || "User",
        email: userEmail,
        plan: nextPlan,
      }),
      confirmLabel: isUpgrading ? tAdmin("actionUpgradePro") : tAdmin("actionDowngradeFree"),
      variant: isUpgrading ? "upgrade" : "warning",
      newPlan: nextPlan,
      itemDetails: [
        { label: "User", value: userName || "-" },
        { label: "Email", value: userEmail },
        { label: "Plan", value: `${currentPlan} → ${nextPlan}` },
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
      title: tAdmin("confirmRoleChangeTitle"),
      description: tAdmin("confirmRoleChangeDesc", {
        name: userName || "User",
        email: userEmail,
        role: nextRole,
      }),
      confirmLabel: isPromoting ? tAdmin("actionMakeAdmin") : tAdmin("actionRemoveAdmin"),
      variant: isPromoting ? "admin" : "danger",
      newRole: nextRole,
      itemDetails: [
        { label: "User", value: userName || "-" },
        { label: "Email", value: userEmail },
        { label: "Role", value: `${currentRole} → ${nextRole}` },
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
            text: tAdmin("planChangeSuccess", { plan: targetPlan }),
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({
            type: "error",
            text: res.error || tAdmin("planChangeFailed"),
          });
        }
      } else if (dialogState.type === "ROLE" && dialogState.newRole) {
        const targetRole = dialogState.newRole;
        const res = await updateUserRole(userId, targetRole);
        setDialogState((prev) => ({ ...prev, isOpen: false }));

        if (res.success) {
          setMessage({
            type: "success",
            text: tAdmin("roleChangeSuccess", { role: targetRole }),
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({
            type: "error",
            text: res.error || tAdmin("roleChangeFailed"),
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-[0.98] min-h-[44px] sm:min-h-[38px] ${
              currentPlan === "PRO"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800"
            }`}
            title={currentPlan === "PRO" ? tAdmin("actionDowngradeFree") : tAdmin("actionUpgradePro")}
          >
            {isPending ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SparklesIcon className="w-3.5 h-3.5" />
            )}
            <span>{currentPlan === "PRO" ? tAdmin("setFree") : tAdmin("setPro")}</span>
          </button>

          {/* Toggle Role Button */}
          <button
            type="button"
            onClick={handleOpenRoleDialog}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-[0.98] min-h-[44px] sm:min-h-[38px] ${
              currentRole === "ADMIN"
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
            title={
              currentRole === "ADMIN"
                ? isCurrentAdmin
                  ? tAdmin("activeAccount")
                  : tAdmin("actionRemoveAdmin")
                : tAdmin("actionMakeAdmin")
            }
          >
            {currentRole === "ADMIN" ? (
              <ShieldExclamationIcon className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{currentRole === "ADMIN" ? tAdmin("actionRemoveAdmin") : tAdmin("actionMakeAdmin")}</span>
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
        cancelLabel={tAdmin("cancel")}
        variant={dialogState.variant}
        isLoading={isPending}
        itemDetails={dialogState.itemDetails}
      />

      {/* Alert when trying to revoke self admin */}
      <ConfirmDialog
        isOpen={selfAdminAlertOpen}
        onClose={() => setSelfAdminAlertOpen(false)}
        onConfirm={() => setSelfAdminAlertOpen(false)}
        title={tAdmin("actionNotAllowed")}
        description={tAdmin("selfDemoteWarning")}
        confirmLabel={tAdmin("understand")}
        cancelLabel={tAdmin("cancel")}
        variant="warning"
        itemDetails={[
          { label: "User", value: userEmail },
        ]}
      />
    </>
  );
}
