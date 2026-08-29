import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { sanitizeDomain } from "@/lib/domain-verification";

// Domain internal yang tidak di-rewrite sebagai custom domain
const ROOT_DOMAINS = [
  "notaku.store",
  "www.notaku.store",
  "localhost",
  "127.0.0.1",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/invoices",
  "/recurring-invoices",
  "/customers",
  "/settings",
  "/wallet",
  "/tax-reports",
  "/referrals",
  "/billing",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const cleanHost = sanitizeDomain(host);

  // 1. Abaikan static files, api routes, next.js internals, dan favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Multi-Tenant Domain Header Injection
  const isRootDomain =
    ROOT_DOMAINS.includes(cleanHost) ||
    cleanHost.endsWith(".vercel.app") ||
    cleanHost.includes("localhost:");

  const requestHeaders = new Headers(request.headers);
  if (!isRootDomain) {
    requestHeaders.set("x-custom-domain", cleanHost);
  }

  // 3. Auth Route Protection
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (isProtected) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
