"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function TrafficTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname;

      const body = JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
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
