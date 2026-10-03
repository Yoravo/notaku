"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Auto-save form state ke localStorage (debounced) + deteksi draf saat mount.
 * Draf hanya ditulis setelah user benar-benar mengubah form (snapshot awal diabaikan),
 * sehingga isian contoh bawaan tidak pernah memicu banner "draf ditemukan".
 */
export function useFormDraft<T extends object>(key: string, snapshot: T, enabled = true) {
  const [pending, setPending] = useState<(T & { savedAt: number }) | null>(null);
  const initial = useRef(JSON.stringify(snapshot));
  const serialized = JSON.stringify(snapshot);

  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && typeof parsed.savedAt === "number") {
          setPending(parsed);
        }
      }
    } catch {
      // storage diblokir / korup -> abaikan
    }
  }, [key, enabled]);

  useEffect(() => {
    // Jangan timpa draf lama sebelum user memilih pulihkan/buang, dan jangan simpan state awal.
    if (!enabled || pending || serialized === initial.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ ...JSON.parse(serialized), savedAt: Date.now() }));
      } catch {
        // ponytail: storage penuh/diblokir -> draf tidak persist, form tetap jalan.
      }
    }, 500);
    return () => clearTimeout(t);
  }, [key, serialized, enabled, pending]);

  const discard = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setPending(null);
  };

  return { pending, dismiss: () => setPending(null), discard };
}
