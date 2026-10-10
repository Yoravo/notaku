"use client";

import { useState, useTransition } from "react";
import { updateUserPlan, updateUserRole } from "@/actions/admin";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { ConfirmDialog, ConfirmVariant } from "@/components/ui/confirm-dialog";
import { PlanConfigModal } from "@/components/admin/plan-config-modal";
import type { AdminPlan, AdminPlanDuration } from "@/lib/admin-plan";
import { useTranslations } from "next-intl";

type UserActionsProps = {
  userId: string;
  userName: string;
  userEmail: string;
  currentPlan: AdminPlan;
  currentRole: "USER" | "ADMIN";
  isCurrentAdmin: boolean;
  currentExpiresAt?: string | null;
};

type RoleDialogState = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: ConfirmVariant;
  newRole?: "USER" | "ADMIN";
  itemDetails: { label: string; value: React.ReactNode }[];
};

const PLAN_BUTTON_CLASS: Record<AdminPlan, string> = {
  BUSINESS:
    "bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200/60 dark:border-violet-800",
  PRO: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800",
  LITE: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200/60 dark:border-cyan-800",
  FREE: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700",
};

export function UserRowActions({
  userId,
  userName,
  userEmail,
  currentPlan,
  currentRole,
  isCurrentAdmin,
  currentExpiresAt,
}: UserActionsProps) {
  const tAdmin = useTranslations("admin");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [roleDialog, setRoleDialog] = useState<RoleDialogState>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: tAdmin("confirm"),
    variant: "primary",
    itemDetails: [],
  });
  const [selfAdminAlertOpen, setSelfAdminAlertOpen] = useState(false);

  const handleConfirmPlan = (plan: AdminPlan, duration: AdminPlanDuration) => {
    startTransition(async () => {
      setMessage(null);
      const res = await updateUserPlan(userId, plan, duration);
      setPlanModalOpen(false);

      if (res.success) {
        setMessage({ type: "success", text: tAdmin("planChangeSuccess", { plan }) });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || tAdmin("planChangeFailed") });
      }
    });
  };

  const handleOpenRoleDialog = () => {
    if (isCurrentAdmin && currentRole === "ADMIN") {
      setSelfAdminAlertOpen(true);
      return;
    }

    const isPromoting = currentRole !== "ADMIN";
    const nextRole: "USER" | "ADMIN" = isPromoting ? "ADMIN" : "USER";

    setRoleDialog({
      isOpen: true,
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
        {
          label: "Role",
          value: (
            <span className="inline-flex items-center gap-1">
              {currentRole}
              <ArrowRightIcon aria-label="ke" className="h-3 w-3 text-slate-400" />
              {nextRole}
            </span>
          ),
        },
      ],
    });
  };

  const handleConfirmRole = () => {
    const targetRole = roleDialog.newRole;
    if (!targetRole) return;

    startTransition(async () => {
      setMessage(null);
      const res = await updateUserRole(userId, targetRole);
      setRoleDialog((prev) => ({ ...prev, isOpen: false }));

      if (res.success) {
        setMessage({ type: "success", text: tAdmin("roleChangeSuccess", { role: targetRole }) });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || tAdmin("roleChangeFailed") });
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlanModalOpen(true)}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs min-h-[44px] sm:min-h-[38px] ${PLAN_BUTTON_CLASS[currentPlan]}`}
            title={tAdmin("managePlan")}
          >
            {isPending ? (
              <ArrowPathIcon aria-hidden="true" className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AdjustmentsHorizontalIcon aria-hidden="true" className="w-3.5 h-3.5" />
            )}
            <span>{tAdmin("managePlan")}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenRoleDialog}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs min-h-[44px] sm:min-h-[38px] ${
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
              <ShieldExclamationIcon aria-hidden="true" className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <ShieldCheckIcon aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{currentRole === "ADMIN" ? tAdmin("actionRemoveAdmin") : tAdmin("actionMakeAdmin")}</span>
          </button>
        </div>

        {message && (
          <span
            role="status"
            className={`text-[11px] font-bold ${
              message.type === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      <PlanConfigModal
        isOpen={planModalOpen}
        onClose={() => !isPending && setPlanModalOpen(false)}
        onConfirm={handleConfirmPlan}
        userName={userName}
        userEmail={userEmail}
        currentPlan={currentPlan}
        currentExpiresAt={currentExpiresAt}
        isLoading={isPending}
      />

      <ConfirmDialog
        isOpen={roleDialog.isOpen}
        onClose={() => !isPending && setRoleDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmRole}
        title={roleDialog.title}
        description={roleDialog.description}
        confirmLabel={roleDialog.confirmLabel}
        cancelLabel={tAdmin("cancel")}
        variant={roleDialog.variant}
        isLoading={isPending}
        itemDetails={roleDialog.itemDetails}
      />

      <ConfirmDialog
        isOpen={selfAdminAlertOpen}
        onClose={() => setSelfAdminAlertOpen(false)}
        onConfirm={() => setSelfAdminAlertOpen(false)}
        title={tAdmin("actionNotAllowed")}
        description={tAdmin("selfDemoteWarning")}
        confirmLabel={tAdmin("understand")}
        cancelLabel={tAdmin("cancel")}
        variant="warning"
        itemDetails={[{ label: "User", value: userEmail }]}
      />
    </>
  );
}
