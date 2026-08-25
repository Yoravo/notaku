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

export const statusLabel: Record<string, { text: string; className: string }> =
  {
    DRAFT: { text: "Draft", className: "bg-gray-100 text-gray-700" },
    SENT: { text: "Terkirim", className: "bg-blue-50 text-blue-700" },
    PAID: { text: "Lunas", className: "bg-green-50 text-green-700" },
    OVERDUE: { text: "Jatuh Tempo", className: "bg-red-50 text-red-700" },
    CANCELLED: { text: "Dibatalkan", className: "bg-gray-100 text-gray-500" },
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
