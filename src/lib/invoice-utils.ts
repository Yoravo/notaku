export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export const statusConfig: Record<
  string,
  { className: string; dotClassName: string }
> = {
  DRAFT: {
    className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    dotClassName: "bg-slate-400 dark:bg-slate-500",
  },
  SENT: {
    className: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800",
    dotClassName: "bg-blue-500 dark:bg-blue-400",
  },
  PAID: {
    className: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800",
    dotClassName: "bg-emerald-500 dark:bg-emerald-400",
  },
  OVERDUE: {
    className: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800",
    dotClassName: "bg-rose-500 dark:bg-rose-400",
  },
  CANCELLED: {
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    dotClassName: "bg-slate-400 dark:bg-slate-600",
  },
};

export const statusLabel: Record<
  string,
  { text: string; className: string; dotClassName: string }
> = {
  DRAFT: {
    text: "Draft",
    className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    dotClassName: "bg-slate-400 dark:bg-slate-500",
  },
  SENT: {
    text: "Terkirim",
    className: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800",
    dotClassName: "bg-blue-500 dark:bg-blue-400",
  },
  PAID: {
    text: "Lunas",
    className: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800",
    dotClassName: "bg-emerald-500 dark:bg-emerald-400",
  },
  OVERDUE: {
    text: "Jatuh Tempo",
    className: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800",
    dotClassName: "bg-rose-500 dark:bg-rose-400",
  },
  CANCELLED: {
    text: "Dibatalkan",
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    dotClassName: "bg-slate-400 dark:bg-slate-600",
  },
};

export const JAKARTA_TZ = "Asia/Jakarta";

export function formatDateWIB(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatTimeWIB(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    timeZone: JAKARTA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

export function formatDateTimeWIB(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleString("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}
