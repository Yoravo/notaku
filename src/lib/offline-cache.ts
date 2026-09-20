/**
 * PWA Offline Cache Management (Read-Only Data Caching)
 * Stores local read-only snapshots of recent invoices and customer contacts
 * in localStorage so users can access their records even when offline.
 */

export interface OfflineInvoice {
  id: string;
  number: string | null;
  customerName: string;
  customerPhone?: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface OfflineCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address?: string | null;
}

const INVOICE_KEY_PREFIX = "notaku_offline_invoices_";
const CUSTOMER_KEY_PREFIX = "notaku_offline_customers_";
const LAST_USER_KEY = "notaku_last_offline_user";

export function saveOfflineInvoices(userId: string, invoices: OfflineInvoice[]): void {
  if (typeof window === "undefined" || !userId || !Array.isArray(invoices)) return;
  try {
    const trimmed = invoices.slice(0, 30);
    localStorage.setItem(`${INVOICE_KEY_PREFIX}${userId}`, JSON.stringify(trimmed));
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // storage unavailable or quota exceeded; non-fatal.
  }
}

export function getOfflineInvoices(userId?: string): OfflineInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const targetUserId = userId || localStorage.getItem(LAST_USER_KEY);
    if (!targetUserId) return [];
    const raw = localStorage.getItem(`${INVOICE_KEY_PREFIX}${targetUserId}`);
    return raw ? (JSON.parse(raw) as OfflineInvoice[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflineCustomers(userId: string, customers: OfflineCustomer[]): void {
  if (typeof window === "undefined" || !userId || !Array.isArray(customers)) return;
  try {
    const trimmed = customers.slice(0, 50);
    localStorage.setItem(`${CUSTOMER_KEY_PREFIX}${userId}`, JSON.stringify(trimmed));
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // storage unavailable or quota exceeded; non-fatal.
  }
}

export function getOfflineCustomers(userId?: string): OfflineCustomer[] {
  if (typeof window === "undefined") return [];
  try {
    const targetUserId = userId || localStorage.getItem(LAST_USER_KEY);
    if (!targetUserId) return [];
    const raw = localStorage.getItem(`${CUSTOMER_KEY_PREFIX}${targetUserId}`);
    return raw ? (JSON.parse(raw) as OfflineCustomer[]) : [];
  } catch {
    return [];
  }
}

export function clearOfflineData(userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const targetUserId = userId || localStorage.getItem(LAST_USER_KEY);
    if (targetUserId) {
      localStorage.removeItem(`${INVOICE_KEY_PREFIX}${targetUserId}`);
      localStorage.removeItem(`${CUSTOMER_KEY_PREFIX}${targetUserId}`);
    }
  } catch {
    // ignore
  }
}
