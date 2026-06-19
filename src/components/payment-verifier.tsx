"use client";

import { useEffect, useState, useRef } from "react";

const MAX_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 2000;

function hasOrderIdParam() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("order_id");
}

export function PaymentVerifier() {
  const [status, setStatus] = useState<"checking" | "success" | "none">(() =>
    hasOrderIdParam() ? "checking" : "none",
  );
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!hasOrderIdParam()) return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      attemptsRef.current += 1;

      try {
        const res = await fetch("/api/payment/verify");
        const data = await res.json();

        if (data.status === "activated" || data.status === "active") {
          if (cancelled) return;
          setStatus("success");
          window.history.replaceState({}, "", "/settings");
          setTimeout(() => window.location.reload(), 1500);
          return;
        }

        if (["deny", "cancel", "expire"].includes(data.status)) {
          if (!cancelled) setStatus("none");
          return;
        }

        if (attemptsRef.current < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          if (!cancelled) setStatus("none");
        }
      } catch {
        if (attemptsRef.current < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          if (!cancelled) setStatus("none");
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">
          Memverifikasi pembayaran...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">
          ✅ Pembayaran berhasil! Akun kamu sekarang Pro 🎉
        </p>
      </div>
    );
  }

  return null;
}
