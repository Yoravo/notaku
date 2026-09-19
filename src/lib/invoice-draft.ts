/**
 * Auto-save draf invoice ke localStorage (pemulihan saat tab tertutup / koneksi hilang).
 * Modul murni tanpa React agar mudah diuji dan dipakai ulang oleh form.
 */

import type { DiscountType } from "./invoice-calculations";

export interface InvoiceDraftItem {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceDraft {
  customerId: string;
  dueDate: string;
  currency: string;
  notes: string;
  enableDirectTransfer: boolean;
  enableDigitalPayment: boolean;
  enableReminder: boolean;
  items: InvoiceDraftItem[];
  discountType: DiscountType;
  discountValue: number;
  selectedTaxMode: number | "custom";
  customTaxRate: number;
  savedAt: number;
}

const DRAFT_PREFIX = "notaku_invoice_draft_";

export function draftStorageKey(userId: string): string {
  return `${DRAFT_PREFIX}${userId}`;
}

/**
 * Draf layak disimpan/dipulihkan hanya jika pengguna sudah mengisi sesuatu yang berarti
 * (pelanggan dipilih, ada item berisi, atau ada catatan). Mencegah banner muncul untuk
 * form kosong bawaan.
 */
export function isDraftMeaningful(draft: Partial<InvoiceDraft> | null | undefined): boolean {
  if (!draft) return false;
  if (draft.customerId) return true;
  if (draft.notes && draft.notes.trim().length > 0) return true;
  if (Array.isArray(draft.items)) {
    return draft.items.some(
      (it) => (it?.description && it.description.trim().length > 0) || Number(it?.price) > 0,
    );
  }
  return false;
}

/** Baca draf tersimpan; return null jika kosong, tidak berarti, atau storage gagal/korup. */
export function readDraft(userId: string): InvoiceDraft | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InvoiceDraft;
    return isDraftMeaningful(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Simpan draf jika berarti, atau hapus otomatis jika form kembali kosong. */
export function writeDraft(userId: string, draft: InvoiceDraft): void {
  try {
    if (!isDraftMeaningful(draft)) {
      localStorage.removeItem(draftStorageKey(userId));
      return;
    }
    localStorage.setItem(draftStorageKey(userId), JSON.stringify(draft));
  } catch {
    // ponytail: storage diblokir/penuh -> draf hanya bertahan selama komponen hidup.
  }
}

export function clearDraft(userId: string): void {
  try {
    localStorage.removeItem(draftStorageKey(userId));
  } catch {
    // storage tidak tersedia; abaikan.
  }
}
