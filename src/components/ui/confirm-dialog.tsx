"use client";

import { useEffect } from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ConfirmVariant =
  | "danger"
  | "warning"
  | "success"
  | "primary"
  | "upgrade"
  | "admin";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  itemDetails?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "primary",
  isLoading = false,
  itemDetails,
  children,
}: ConfirmDialogProps) {
  // Lock body scroll when open & handle ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: TrashIcon,
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
      btnBg:
        "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-600/20",
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      btnBg:
        "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20",
    },
    success: {
      icon: ShieldCheckIcon,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      btnBg:
        "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-600/20",
    },
    primary: {
      icon: InformationCircleIcon,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      btnBg:
        "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-600/20",
    },
    upgrade: {
      icon: SparklesIcon,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200",
      btnBg:
        "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20",
    },
    admin: {
      icon: ShieldExclamationIcon,
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      btnBg:
        "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-indigo-600/20",
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-5 sm:p-6 text-left shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}
            >
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="dialog-title"
                className="text-base font-bold text-slate-900 leading-tight"
              >
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup dialog"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        {itemDetails && itemDetails.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 text-xs">
            {itemDetails.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-semibold text-slate-900 truncate max-w-[220px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${config.btnBg}`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
