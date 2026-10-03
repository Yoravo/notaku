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

export function saveOfflineInvoices(userId: string, newInvoices: OfflineInvoice[]): void {
  if (typeof window === "undefined" || !userId || !Array.isArray(newInvoices)) return;
  try {
    const existing = getOfflineInvoices(userId);
    const map = new Map(existing.map((i) => [i.id, i]));
    newInvoices.forEach((i) => map.set(i.id, i));
    const merged = Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // Keep last 50 invoices for offline access
    localStorage.setItem(`${INVOICE_KEY_PREFIX}${userId}`, JSON.stringify(merged));
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

export function saveOfflineCustomers(userId: string, newCustomers: OfflineCustomer[]): void {
  if (typeof window === "undefined" || !userId || !Array.isArray(newCustomers)) return;
  try {
    const existing = getOfflineCustomers(userId);
    const map = new Map(existing.map((c) => [c.id, c]));
    newCustomers.forEach((c) => map.set(c.id, c));
    const merged = Array.from(map.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 100); // Keep top 100 customers for offline access
    localStorage.setItem(`${CUSTOMER_KEY_PREFIX}${userId}`, JSON.stringify(merged));
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // storage unavailable or quota exceeded; non-fatal.
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
    // Only remove LAST_USER_KEY if we are clearing the current last user
    if (!userId || userId === localStorage.getItem(LAST_USER_KEY)) {
      localStorage.removeItem(LAST_USER_KEY);
    }
  } catch {
    // ignore
  }
}
