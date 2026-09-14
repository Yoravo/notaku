"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Utm = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign", string>>;
const utmKeys = ["utm_source", "utm_medium", "utm_campaign"] as const;
let firstTouchUtm: Utm | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: {
      (command: "event", name: string, params: Record<string, string | number | boolean>): void;
      (command: "get", id: string, field: "client_id" | "session_id", callback: (value: unknown) => void): void;
    };
  }
}

const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari first-touch attribution window

export function getFirstTouchUtm(): Utm {
  if (typeof window === "undefined") return {};
  if (firstTouchUtm !== undefined) return firstTouchUtm;

  let savedUtm: Utm | null = null;
  try {
    const raw = localStorage.getItem("notaku_utm");
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.timestamp === "number" &&
        Date.now() - parsed.timestamp < UTM_TTL_MS
      ) {
        savedUtm = (parsed.utm && typeof parsed.utm === "object") ? parsed.utm : {};
      } else {
        localStorage.removeItem("notaku_utm");
      }
    }
  } catch {
    // Storage can be unavailable; retain attribution in memory for this page lifetime.
  }

  if (savedUtm !== null) {
    firstTouchUtm = savedUtm;
    return savedUtm;
  }

  const searchSource = Object.fromEntries(new URLSearchParams(window.location.search));
  const utm: Utm = {};
  for (const key of utmKeys) {
    const value = searchSource[key];
    if (typeof value === "string" && value.trim()) utm[key] = value.trim().slice(0, 100);
  }

  firstTouchUtm = utm;
  try {
    localStorage.setItem(
      "notaku_utm",
      JSON.stringify({
        utm,
        timestamp: Date.now(),
      })
    );
  } catch {
    // ponytail: blocked storage cannot preserve attribution across a full reload.
  }
  return utm;
}

export function TrafficTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname;

      const body = JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        ...getFirstTouchUtm(),
      });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", body);
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }
  }, [pathname]);

  return null;
}
